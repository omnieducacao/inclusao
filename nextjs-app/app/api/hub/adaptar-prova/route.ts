import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  let texto = "";
  let materia = "Geral";
  let tema = "Geral";
  let tipo = "Prova";
  let checklist: Record<string, boolean> = {};
  let estudante: { hiperfoco?: string; perfil?: string } = {};
  let engine: EngineId = "red";
  let modoProfundo = false;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const meta = formData.get("meta") as string | null;

    if (!file || !file.size) {
      return NextResponse.json(
        { error: "Envie um arquivo DOCX." },
        { status: 400 }
      );
    }

    if (meta) {
      try {
        const parsed = JSON.parse(meta);
        materia = parsed.materia || materia;
        tema = parsed.tema || tema;
        tipo = parsed.tipo || tipo;
        checklist = parsed.checklist || {};
        estudante = parsed.estudante || {};
        modoProfundo = !!parsed.modo_profundo;
        if (parsed.engine && ["red", "blue", "green", "yellow", "orange"].includes(parsed.engine)) {
          engine = parsed.engine;
        }
      } catch {
        // ignore
      }
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer: buf });
    texto = (result.value || "").trim();
    if (!texto || texto.length < 20) {
      return NextResponse.json(
        { error: "Não foi possível extrair texto do DOCX ou arquivo vazio." },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Adaptar Prova parse:", err);
    return NextResponse.json(
      { error: "Erro ao processar arquivo." },
      { status: 400 }
    );
  }

  const necessidades: string[] = [];
  if (checklist.questoes_desafiadoras) necessidades.push("Aumentar o nível de desafio das questões");
  else necessidades.push("Manter ou reduzir o nível de dificuldade");
  if (!checklist.compreende_instrucoes_complexas) necessidades.push("Simplificar instruções complexas");
  if (checklist.instrucoes_passo_a_passo) necessidades.push("Fornecer instruções passo a passo");
  if (checklist.dividir_em_etapas) necessidades.push("Dividir questões em etapas menores");
  if (checklist.paragrafos_curtos) necessidades.push("Usar parágrafos curtos");
  if (checklist.dicas_apoio) necessidades.push("Incluir dicas de apoio");
  if (!checklist.compreende_figuras_linguagem) necessidades.push("Reduzir figuras de linguagem e inferências");
  if (checklist.descricao_imagens) necessidades.push("Incluir descrição detalhada de imagens");

  const instrucoesChecklist =
    necessidades.length > 0
      ? `\nCHECKLIST DE ADAPTAÇÃO:\n${necessidades.map((n) => `- ${n}`).join("\n")}\n\nREGRA: Para cada questão, escolha APENAS 1-2 adaptações mais relevantes.`
      : "";

  const hiperfoco = estudante.hiperfoco || "Geral";
  const perfil = (estudante.perfil || "").slice(0, 800);

  const modoInstrucao = modoProfundo
    ? "Seja didático e use Cadeia de Pensamento para fundamentar cada adaptação."
    : "Seja objetivo.";
  const prompt = `ESPECIALISTA EM DUA E INCLUSÃO. ${modoInstrucao}
1. ANALISE O PERFIL: ${perfil}
2. ADAPTE A ${tipo}: Use o hiperfoco (${hiperfoco}) em até 30% das questões.
${instrucoesChecklist}

REGRA ABSOLUTA: REMOVA GABARITO E RESPOSTAS.

SAÍDA OBRIGATÓRIA (Use EXATAMENTE este divisor):
[ANÁLISE PEDAGÓGICA]
...análise breve...
---DIVISOR---
[ATIVIDADE]
...prova/atividade adaptada...

CONTEXTO: ${materia} | ${tema}
TEXTO ORIGINAL:
${texto.slice(0, 12000)}`;

  const engineErr = getEngineError(engine);
  if (engineErr) {
    return NextResponse.json({ error: engineErr }, { status: 500 });
  }

  try {
    const fullText = await chatCompletionText(
      engine,
      [{ role: "user", content: prompt }],
      { temperature: modoProfundo ? 0.7 : 0.4 }
    );
    let analise = "Análise indisponível.";
    let atividade = fullText;

    if (fullText.includes("---DIVISOR---")) {
      const parts = fullText.split("---DIVISOR---");
      analise = parts[0].replace("[ANÁLISE PEDAGÓGICA]", "").trim();
      atividade = parts[1].replace("[ATIVIDADE]", "").trim();
    }

    return NextResponse.json({ analise, texto: atividade });
  } catch (err) {
    console.error("Adaptar Prova IA:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao adaptar." },
      { status: 500 }
    );
  }
}
