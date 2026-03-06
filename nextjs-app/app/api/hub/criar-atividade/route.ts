import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { parseBody, criarAtividadeSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineErrorWithWorkspace, type EngineId } from "@/lib/ai-engines";
import { criarPromptProfissional } from "@/lib/hub-prompts";
import { requireAuth } from "@/lib/permissions";
import { anonymizeMessages } from "@/lib/ai-anonymize";
import { saveHubGeneratedContent } from "@/lib/hub-tracking";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { session, error: authError } = await requireAuth(); if (authError) return authError;
  const parsed = await parseBody(req, criarAtividadeSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

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
  const perfilPei = estudante.perfil || estudante.ia_sugestao || "";

  // Build structured PEI context for enriched AI understanding
  const peiContextParts: string[] = [];
  if (estudante.nivel_suporte) peiContextParts.push(`Nível de suporte: ${estudante.nivel_suporte}`);
  if (estudante.barreiras) peiContextParts.push(`Barreiras identificadas: ${estudante.barreiras}`);
  if (estudante.potencialidades) peiContextParts.push(`Potencialidades: ${String(estudante.potencialidades).slice(0, 300)}`);
  if (estudante.estrategias_acesso) peiContextParts.push(`Estratégias de acesso: ${String(estudante.estrategias_acesso).slice(0, 300)}`);
  if (estudante.estrategias_ensino) peiContextParts.push(`Estratégias de ensino: ${String(estudante.estrategias_ensino).slice(0, 300)}`);
  if (estudante.estrategias_avaliacao) peiContextParts.push(`Estratégias de avaliação: ${String(estudante.estrategias_avaliacao).slice(0, 300)}`);

  // Ponte Pedagógica (discipline-specific adaptations from PEI Regente)
  if (estudante.ponte_pedagogica) {
    const pp = estudante.ponte_pedagogica;
    if (pp.resumo_adaptacao) peiContextParts.push(`Adaptação por disciplina: ${String(pp.resumo_adaptacao).slice(0, 400)}`);
    if (pp.objetivos_individualizados) peiContextParts.push(`Objetivos individualizados: ${String(pp.objetivos_individualizados).slice(0, 400)}`);
    if (pp.metodologia_adaptada) peiContextParts.push(`Metodologia adaptada: ${String(pp.metodologia_adaptada).slice(0, 300)}`);
    if (pp.habilidades_prioritarias?.length) peiContextParts.push(`Habilidades prioritárias: ${(pp.habilidades_prioritarias as string[]).slice(0, 5).join("; ")}`);
  }

  const peiStructured = peiContextParts.length > 0
    ? `\n\nCONTEXTO PEI COMPLETO DO ESTUDANTE:\n${peiContextParts.join("\n")}`
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
    ia_sugestao: perfilPei,
  });

  // Adicionar contexto do estudante se disponível
  const promptCompleto = ctxEstudante
    ? `${prompt}\n\n${ctxEstudante}${peiStructured}`
    : prompt;

  const wsId = session?.simulating_workspace_id || session?.workspace_id;
  const engineErr = await getEngineErrorWithWorkspace(engine, wsId);
  if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

  try {
    const studentName = estudante?.nome || null;
    const { anonymized, restore } = anonymizeMessages([{ role: "user", content: promptCompleto }], studentName);
    const textoRaw = await chatCompletionText(engine, anonymized, { temperature: 0.6 });
    const texto = restore(textoRaw);
    if (wsId) {
      saveHubGeneratedContent({
        workspaceId: wsId,
        memberId: (session?.member as { id?: string } | undefined)?.id,
        studentId: null,
        contentType: "criar_atividade",
        description: estudante.nome ? `Atividade para ${estudante.nome}${estudante.serie ? `, ${estudante.serie}` : ""}` : `Atividade: ${assunto || "BNCC"}`,
        engine,
        metadata: { assunto, qtd_questoes: qtdQuestoes, tipo_questao: tipoQuestao },
      }).catch(() => { });
    }
    return NextResponse.json({ texto });
  } catch (err) {
    console.error("Hub criar-atividade:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar atividade." },
      { status: 500 }
    );
  }
}
