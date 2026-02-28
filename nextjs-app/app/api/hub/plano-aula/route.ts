import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { parseBody, planoAulaSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineErrorWithWorkspace, type EngineId } from "@/lib/ai-engines";
import { gerarPromptPlanoAula } from "@/lib/hub-prompts";
import { requireAuth } from "@/lib/permissions";
import { anonymizeMessages } from "@/lib/ai-anonymize";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { session, error: authError } = await requireAuth(); if (authError) return authError;
  const parsed = await parseBody(req, planoAulaSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  const materia = (body.materia || "Geral").trim();
  const assunto = (body.assunto || "").trim();
  const duracao = body.duracao_minutos ?? 50;
  const metodologia = (body.metodologia || "Aula Expositiva Dialogada").trim();
  const tecnica = (body.tecnica || "").trim();
  const qtdAlunos = body.qtd_alunos ?? 30;
  const recursos = body.recursos?.length ? body.recursos : [];
  const habilidadesBncc = body.habilidades_bncc || [];
  const unidadeTematica = body.unidade_tematica || "";
  const objetoConhecimento = body.objeto_conhecimento || "";
  const estudante = body.estudante || {};
  const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine || "")
    ? (body.engine as EngineId)
    : "red";

  const temBnccPreenchida = habilidadesBncc.length > 0;
  if (!assunto && !temBnccPreenchida) {
    return NextResponse.json({ error: "Informe o assunto/tema da aula ou selecione habilidades BNCC." }, { status: 400 });
  }

  // Usar prompt do arquivo separado (idêntico ao Streamlit)
  const prompt = gerarPromptPlanoAula({
    materia,
    assunto: assunto || "(definido pelas habilidades BNCC)",
    metodologia,
    tecnica: tecnica || (metodologia === "Metodologia Ativa" ? "Não especificada" : ""),
    qtd_alunos: qtdAlunos,
    recursos: recursos.length > 0 ? recursos : ["Quadro", "Material impresso", "Projetor"],
    habilidades_bncc: habilidadesBncc,
    verbos_bloom: undefined, // Não usado no plano de aula
    ano: undefined, // Não passado no body atual
    unidade_tematica: unidadeTematica || undefined,
    objeto_conhecimento: objetoConhecimento || undefined,
    aluno_info: estudante.nome || estudante.hiperfoco
      ? {
        nome: estudante.nome || "",
        hiperfoco: estudante.hiperfoco || "",
        ia_sugestao: estudante.perfil || "",
      }
      : undefined,
    duracao_minutos: duracao,
  });

  const wsId = session?.simulating_workspace_id || session?.workspace_id;
  const engineErr = await getEngineErrorWithWorkspace(engine, wsId);
  if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

  try {
    const studentName = estudante?.nome || null;
    const { anonymized, restore } = anonymizeMessages([{ role: "user", content: prompt }], studentName);
    const textoRaw = await chatCompletionText(engine, anonymized, { temperature: 0.7 });
    return NextResponse.json({ texto: restore(textoRaw) });
  } catch (err) {
    console.error("Hub plano-aula:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar plano." },
      { status: 500 }
    );
  }
}
