/**
 * Minha Jornada – Serviço de leitura da Planilha Google Sheets (Versão IA-Native)
 *
 * A planilha é tratada como Documento de Contexto:
 * 1. Fetch do HTML público (pubhtml) da URL informada
 * 2. Conversão do HTML em texto limpo
 * 3. (Opcional) Envio do texto ao Gemini para extrair JSON estruturado
 * 4. Fallback: parsing legado por posições fixas (A1–A5, A7+)
 */

import type { SheetStudentData, Journey, DailyMission } from '../types';

export type { SheetStudentData, Journey, DailyMission };

// ==================================================================================
// CONFIGURAÇÃO
// ==================================================================================
const DEFAULT_SHEET_PUB_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTatajVth7dMIdJBiBXengYK_xQcfxP-62j3tdpqxyBLvhI3BamZ6J49k9NqvUAWb0KD6xBWqx5OWSs/pubhtml';

const CORS_PROXY = ''; // ex: 'https://api.allorigins.win/raw?url='

const GEMINI_API_KEY = typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY;

// ==================================================================================
// MOCK DATA (Fallback para testes sem internet)
// ==================================================================================
const MOCK_DB: Record<string, SheetStudentData> = {
  'OMNI-TEST-1234': {
    id: 'OMNI-TEST-1234',
    name: 'Viajante Teste',
    hyperfocus: 'Astronomia',
    dailyMissions: [
      { id: 'dm1', title: 'Check-in Emocional', xp: 50, isCompleted: false },
      { id: 'dm2', title: 'Ler a Missão do Dia', xp: 50, isCompleted: false },
    ],
    journeys: [
      {
        id: 'j_mock',
        title: 'Jornada Galáctica',
        description: 'Uma aventura simulada para testes.',
        subject: 'Teste',
        difficulty: 'Fácil',
        totalSteps: 3,
        currentStep: 0,
        isCompleted: false,
        steps: ['Passo 1', 'Passo 2', 'Passo 3'],
      },
    ],
  },
};

// ==================================================================================
// FETCH E TEXTO LIMPO
// ==================================================================================

async function fetchSheetHtml(pubUrl: string): Promise<string> {
  const url = CORS_PROXY ? `${CORS_PROXY}${encodeURIComponent(pubUrl)}` : pubUrl;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Falha ao carregar planilha');
  return response.text();
}

/**
 * Converte o HTML da planilha em texto limpo (para enviar à IA).
 */
function htmlToCleanText(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const tds = doc.querySelectorAll('td');
  const lines: string[] = [];
  tds.forEach((td) => {
    const t = td.textContent?.trim();
    if (t) lines.push(t);
  });
  if (lines.length > 0) return lines.join('\n');
  return doc.body?.innerText?.trim() ?? '';
}

// ==================================================================================
// EXTRAÇÃO VIA GEMINI (Planilha como Documento de Contexto)
// ==================================================================================

const GEMINI_PROMPT = (rawText: string, code: string) => `No texto abaixo está o conteúdo de uma planilha com jornadas de estudantes.
Encontre o estudante cujo CÓDIGO ou ID seja exatamente: ${code}

Estruture os dados no seguinte JSON (responda APENAS com o JSON válido, sem markdown nem explicação):
{
  "id": "${code}",
  "name": "nome do aluno (ou Viajante se não achar)",
  "hyperfocus": "tema/interesse (ex: Dinossauros, Lego)",
  "journeys": [
    {
      "id": "j_1",
      "title": "título da missão",
      "description": "descrição ou história",
      "subject": "matéria (ex: Matemática)",
      "totalSteps": número de passos/tarefas,
      "currentStep": 0,
      "isCompleted": false,
      "difficulty": "Fácil" ou "Médio" ou "Desafio",
      "steps": ["passo 1", "passo 2"]
    }
  ],
  "dailyMissions": [
    { "id": "dm1", "title": "Como estou me sentindo?", "xp": 50, "isCompleted": false },
    { "id": "dm2", "title": "Ler o próximo passo da Jornada", "xp": 30, "isCompleted": false }
  ]
}

Se encontrar missões explícitas (MISSÃO 1:, * Objetivo:, * Tarefa:), use-as. Se encontrar apenas objetivos ou tópicos soltos, crie as missões gamificadas a partir deles (title, steps, totalSteps).

Texto da planilha:
---
${rawText}
---`;

async function extractStudentDataWithGemini(
  cleanText: string,
  accessCode: string
): Promise<SheetStudentData | null> {
  if (!GEMINI_API_KEY || !cleanText.trim()) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: GEMINI_PROMPT(cleanText, accessCode) }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const textPart = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textPart) return null;
    let jsonStr = textPart.trim();
    const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();
    const parsed = JSON.parse(jsonStr) as SheetStudentData;
    if (!parsed.id || !parsed.journeys) return null;
    parsed.id = accessCode;
    parsed.journeys = (parsed.journeys || []).map((j, i) => ({
      ...j,
      id: j.id || `j_${i + 1}`,
      currentStep: typeof j.currentStep === 'number' ? j.currentStep : 0,
      isCompleted: Boolean(j.isCompleted),
      totalSteps: typeof j.totalSteps === 'number' ? j.totalSteps : (j.steps?.length ?? 1),
      difficulty: ['Fácil', 'Médio', 'Desafio'].includes(j.difficulty) ? j.difficulty : 'Médio',
    }));
    parsed.dailyMissions = parsed.dailyMissions?.length
      ? parsed.dailyMissions
      : [
          { id: 'dm1', title: 'Como estou me sentindo?', xp: 50, isCompleted: false },
          { id: 'dm2', title: 'Ler o próximo passo da Jornada', xp: 30, isCompleted: false },
        ];
    return parsed;
  } catch {
    return null;
  }
}

// ==================================================================================
// PARSING LEGADO (posições fixas A1–A5, A7+)
// ==================================================================================

function parseStudentName(sheetTitle: string): string {
  try {
    let name = sheetTitle.replace(/Jornada Gamificada\s?-\s?/i, '');
    name = name.replace(/\s*\d{2}-\d{2}\s*\d{2}h\d{2}.*$/, '');
    return name.trim() || 'Viajante';
  } catch {
    return 'Viajante';
  }
}

function parseStudentDataFromHtml(html: string, targetCode: string): SheetStudentData | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tdElements = doc.querySelectorAll('td');
    let targetCell: Element | null = null;
    for (const td of Array.from(tdElements)) {
      if (td.textContent?.trim() === targetCode) {
        targetCell = td;
        break;
      }
    }
    if (!targetCell) return null;

    const tbody = targetCell.closest('tbody');
    if (!tbody) return null;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const columnData: string[] = rows.map((tr) => {
      const cells = Array.from(tr.querySelectorAll('td'));
      return cells.length > 0 ? (cells[0].textContent?.trim() || '') : '';
    });

    const codeIndex = columnData.findIndex((val) => val === targetCode);
    if (codeIndex < 0) return null;

    let hyperfocus = 'Explorador';
    if (codeIndex >= 3) {
      const val = columnData[codeIndex - 3];
      if (val && val !== 'HIPERFOCO DO ESTUDANTE:' && val !== '—') hyperfocus = val;
    }

    const missionTextLines = columnData
      .slice(codeIndex + 2)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    let studentName = 'Viajante';
    const menuItems = doc.querySelectorAll('[id*="sheet-button"], .sheet-tab, [class*="sheet"]');
    for (const el of Array.from(menuItems)) {
      const text = el.textContent || '';
      if (text.includes('Jornada') || text.includes(targetCode)) {
        studentName = parseStudentName(text);
        break;
      }
    }
    if (studentName === 'Viajante') {
      const title = doc.querySelector('title')?.textContent;
      if (title) studentName = parseStudentName(title);
    }

    const content = missionTextLines.join('\n\n');
    const journey: Journey = {
      id: `j_${targetCode}`,
      title: `Aventura de ${studentName}`,
      description: content || 'Sua jornada personalizada de aprendizado.',
      subject: 'Jornada Integrada',
      difficulty: 'Médio',
      totalSteps: Math.max(missionTextLines.length, 1),
      currentStep: 0,
      isCompleted: false,
      content,
      steps: missionTextLines,
    };

    const dailyMissions: DailyMission[] = [
      { id: 'dm_checkin', title: 'Como estou me sentindo?', xp: 50, isCompleted: false },
      { id: 'dm_read', title: 'Ler o próximo passo da Jornada', xp: 30, isCompleted: false },
    ];

    return {
      id: targetCode,
      name: studentName,
      hyperfocus,
      dailyMissions,
      journeys: [journey],
    };
  } catch {
    return null;
  }
}

// ==================================================================================
// API PÚBLICA
// ==================================================================================

/**
 * Busca os dados do estudante pelo código OMNI.
 * Opcionalmente usa a URL da planilha publicada (pubhtml); se não informada, usa a URL padrão.
 * Fluxo: fetch HTML → texto limpo → (se VITE_GEMINI_API_KEY) extrai via Gemini → senão parsing legado.
 */
export async function fetchStudentFromSheet(
  accessCode: string,
  sheetPubUrl?: string
): Promise<SheetStudentData | null> {
  const code = accessCode.trim().toUpperCase();
  const url = (sheetPubUrl || '').trim() || DEFAULT_SHEET_PUB_URL;

  try {
    const html = await fetchSheetHtml(url);
    const cleanText = htmlToCleanText(html);

    if (GEMINI_API_KEY && cleanText) {
      const data = await extractStudentDataWithGemini(cleanText, code);
      if (data) return data;
    }

    const legacy = parseStudentDataFromHtml(html, code);
    if (legacy) return legacy;

    if (MOCK_DB[code]) return MOCK_DB[code];
  } catch (e) {
    console.error('Erro ao processar planilha:', e);
    if (MOCK_DB[code]) return MOCK_DB[code];
  }
  return null;
}
