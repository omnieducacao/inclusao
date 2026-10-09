/**
 * Sugestões de missões com IA a partir das metas do PEI (10/10/2026). Nada é salvo aqui:
 * a escola revisa, ajusta e aprova cada missão na tela.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStudent } from "@/lib/students";
import { negadoForaDoVinculo } from "@/lib/turmas";
import { chatCompletionText, getEngineErrorWithWorkspace, type EngineId } from "@/lib/ai-engines";
import { anonymizeMessages } from "@/lib/ai-anonymize";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { extrairMetasEstruturadas } from "@/app/(dashboard)/pei/lib/dashboard-helpers";
import { promptMissoes, lerSugestoes } from "@/lib/missoes";
import { negadoMissoes } from "@/lib/missoes-servidor";

const texto = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "string").join(", ") : typeof v === "string" ? v : "");
const definida = (s: string) => (s && !/^definir/i.test(s) ? s : "");

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const limite = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION);
  if (limite) return limite;
  const session = await getSession();
  const negado = negadoMissoes(session);
  if (negado) return negado;
  const { id } = await params;
  const fora = await negadoForaDoVinculo(session, id);
  if (fora) return fora;
  const est = await getStudent(session!.workspace_id as string, id);
  if (!est) return NextResponse.json({ error: "Estudante não encontrado." }, { status: 404 });

  const pei = (est.pei_data || {}) as Record<string, unknown>;
  const m = extrairMetasEstruturadas(pei.ia_sugestao as string | undefined);
  const metas = { curto: definida(m.Curto), medio: definida(m.Medio), longo: definida(m.Longo) };
  if (!metas.curto && !metas.medio && !metas.longo) {
    return NextResponse.json({ error: "O PEI ainda não tem metas. As missões saem delas: gere o texto do PEI primeiro." }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const quantas = Math.min(5, Math.max(1, Number(body?.quantas) || 3));
  const engine: EngineId = ["red", "blue", "green"].includes(body?.engine) ? body.engine : "red";
  const engineErr = await getEngineErrorWithWorkspace(engine, session!.simulating_workspace_id || session!.workspace_id);
  if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

  const prompt = promptMissoes({
    serie: est.grade || "", metas, quantas,
    interesse: texto(pei.hiperfoco) || texto(pei.interesses),
    potencialidades: texto(pei.potencialidades),
    estrategias: [texto(pei.estrategias_ensino), texto(pei.estrategias_acesso)].filter(Boolean).join("; "),
  });
  try {
    const { anonymized, restore } = anonymizeMessages([{ role: "user", content: prompt }], est.name);
    const saida = restore(await chatCompletionText(engine, anonymized, { temperature: 0.7 }));
    const sugestoes = lerSugestoes(saida.replace(/ESTUDANTE/g, est.name.split(" ")[0]));
    if (!sugestoes.length) return NextResponse.json({ error: "A IA não devolveu missões dessa vez. Tente de novo." }, { status: 502 });
    return NextResponse.json({ sugestoes, metas });
  } catch (err) {
    logger.error({ err }, "[missoes/sugerir]");
    return NextResponse.json({ error: "Não deu para sugerir agora. Tente de novo." }, { status: 500 });
  }
}
