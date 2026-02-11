import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";
import { criarPromptProfissional } from "@/lib/hub-prompts";
import { requireAuth } from "@/lib/permissions";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { error: authError } = await requireAuth(); if (authError) return authError;
  let body: {
    assunto?: string;
    engine?: string;
    habilidades?: string[];
    ei_mode?: boolean;
    ei_idade?: string;
    ei_campo?: string;
    ei_objetivos?: string[];
    estudante?: { nome?: string; serie?: string; hiperfoco?: string };
    verbos_bloom?: string[];
    qtd_questoes?: number;
    tipo_questao?: "Objetiva" | "Discursiva";
    qtd_imagens?: number;
    checklist_adaptacao?: Record<string, boolean>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const assunto = (body.assunto || "").trim();
  const habilidades = body.habilidades || [];
  const temBnccPreenchida = habilidades.length > 0 || (body.ei_mode && body.ei_objetivos && body.ei_objetivos.length > 0);
  
  // Assunto só é obrigatório se não tiver BNCC preenchida
  if (!assunto && !temBnccPreenchida) {
    return NextResponse.json({ error: "Informe o assunto ou selecione habilidades BNCC." }, { status: 400 });
  }

  const eiMode = !!body.ei_mode;
  const eiObjetivos = body.ei_objetivos || [];
  const estudante = body.estudante || {};
  const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine || "")
    ? (body.engine as EngineId)
    : "red";
  const verbosBloom = body.verbos_bloom || [];
  const qtdQuestoes = body.qtd_questoes ?? 5;
  const tipoQuestao = body.tipo_questao || "Objetiva";
  const qtdImagens = body.qtd_imagens ?? 0;
  const checklist = body.checklist_adaptacao || {};
  
  const ctxEstudante = estudante.nome
    ? `Estudante: ${estudante.nome}. Série: ${estudante.serie || "-"}. Interesses: ${estudante.hiperfoco || "gerais"}.`
    : "";

  const habParaPrompt = eiMode ? eiObjetivos : habilidades;
  
  // Usar prompt do arquivo separado (idêntico ao Streamlit)
  const prompt = criarPromptProfissional({
    materia: assunto || "conteúdo baseado nas habilidades BNCC selecionadas",
    objeto: assunto || "",
    qtd: qtdQuestoes,
    tipo_q: tipoQuestao,
    qtd_imgs: qtdImagens,
    verbos_bloom: verbosBloom,
    habilidades_bncc: habParaPrompt,
    modo_profundo: false,
    checklist_adaptacao: checklist,
    hiperfoco: estudante.hiperfoco || "Geral",
  });
  
  // Adicionar contexto do estudante se disponível
  const promptCompleto = ctxEstudante
    ? `${prompt}\n\n${ctxEstudante}`
    : prompt;

  const engineErr = getEngineError(engine);
  if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

  try {
    const texto = await chatCompletionText(engine, [{ role: "user", content: promptCompleto }], { temperature: 0.6 });
    return NextResponse.json({ texto });
  } catch (err) {
    console.error("Hub criar-atividade:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar atividade." },
      { status: 500 }
    );
  }
}
