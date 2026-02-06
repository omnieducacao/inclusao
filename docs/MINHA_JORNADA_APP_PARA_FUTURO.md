# Minha Jornada — App Gamificado (para reimplementação futura)

> **Status:** Removido temporariamente para organização do código. Será reimplementado futuramente.  
> **Data da remoção:** 02/2025

---

## 1. Visão Geral

App **React/TypeScript** que exibe a jornada gamificada para o estudante. Lê dados de uma **planilha Google Sheets** (sincronizada pelo Omnisfera PAEE) e permite ao aluno acessar via **código OMNI**.

### Fluxo principal

1. **Login:** Código OMNI + (opcional) link da planilha publicada.
2. **Fetch:** HTML da URL pubhtml.
3. **Texto limpo:** Células em sequência.
4. **Gemini (opcional):** "Procure o aluno com código X e retorne JSON."
5. **Fallback:** Parsing legado (A1–A6, A7+).

---

## 2. Estrutura do app (quando reimplementar)

```
minha_jornada_app/
├── components/
│   └── Login.tsx          # Código OMNI + link opcional da planilha
├── services/
│   └── sheetService.ts    # Fetch pubhtml → texto limpo → Gemini ou parsing legado
├── types.ts               # SheetStudentData, Journey, DailyMission
└── README_MINHA_JORNADA.md
```

---

## 3. Tipos principais (types.ts)

```typescript
export interface DailyMission {
  id: string;
  title: string;
  xp: number;
  isCompleted: boolean;
}

export type JourneyDifficulty = 'Fácil' | 'Médio' | 'Desafio';

export interface Journey {
  id: string;
  title: string;
  description: string;
  subject: string;
  totalSteps: number;
  currentStep: number;
  isCompleted: boolean;
  difficulty: JourneyDifficulty;
  content?: string;
  steps?: string[];
}

export interface SheetStudentData {
  id: string;           // Código (ex: OMNI-123)
  name: string;
  hyperfocus: string;
  journeys: Journey[];
  dailyMissions: DailyMission[];
}
```

---

## 4. Integração com a planilha

O Omnisfera grava na planilha:

| Linha | Célula | Conteúdo |
|-------|--------|----------|
| 1-2 | A1-A2 | HIPERFOCO DO ESTUDANTE: + valor |
| 4-5 | A4-A5 | CÓDIGO ÚNICO: + OMNI-XXXX-XXXX-XXXX |
| 7+ | A7+ | Uma linha = um parágrafo da jornada (texto gerado pelo Gemini) |

- **Exportação:** função `exportar_jornada_para_sheets` em `omni_utils.py`.
- **Formato do código:** `OMNI-XXXX-XXXX-XXXX` (12 caracteres hex em 3 grupos).
- Documento detalhado: **JORNADA_GAMIFICADA_PLANILHA_E_JSON.md** (raiz do projeto).

---

## 5. Configuração necessária

- **URL planilha:** Arquivo → Compartilhar → Publicar na web → link pubhtml.
- **Gemini (opcional):** `VITE_GEMINI_API_KEY` no ambiente.
- **CORS:** Se necessário, usar proxy em `CORS_PROXY` (ex: `https://api.allorigins.win/raw?url=`).

---

## 6. Documentos de referência no projeto

- `JORNADA_GAMIFICADA_PLANILHA_E_JSON.md` — Formato da planilha e JSON.
- `CONTEXTO_PLANILHA_E_JORNADA_PARA_GOOGLE_AI.md` — Contexto para Google AI Studio.
- `CONFIG_GOOGLE_SHEETS.md` — Configuração do Google Sheets.

---

## 7. Relação com o PAEE

A jornada é gerada no **PAEE** (Plano de Ação AEE). O professor usa Metas SMART, Barreiras, Plano de Habilidades; a IA (Gemini) transforma em narrativa com missões e etapas. O texto é exportado para a planilha; o app lê e exibe para o estudante.
