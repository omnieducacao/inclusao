import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { escolaDaCrianca } from "@/lib/app/escola";
import { LIMITES, proximoStatus, type StatusMissao } from "@/lib/missoes";
import { CAMPOS_MISSAO, listarMissoes } from "@/lib/missoes-servidor";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 102 · missões que a escola aprovou para o estudante, pelo app.
 * GET → as missões (aprovadas, feitas, confirmadas) · POST { id, nota? } → "consegui" (a escola confirma depois).
 */
type Ctx = { params: Promise<{ id: string }> };

async function abrir(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return { erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const { id } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || acesso.papel !== "responsavel") return { erro: NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 }) };
  const escola = await escolaDaCrianca(pessoaId, id);
  if (!escola) return { erro: NextResponse.json({ error: "Esta criança não está ligada a uma escola." }, { status: 404 }) };
  return { pessoaId, escola };
}

export async function GET(req: Request, ctx: Ctx) {
  const a = await abrir(req, ctx);
  if ("erro" in a) return a.erro;
  return NextResponse.json(await listarMissoes(a.escola.workspace_id, a.escola.student_id, ["aprovada", "feita", "confirmada"]));
}

export async function POST(req: Request, ctx: Ctx) {
  const a = await abrir(req, ctx);
  if ("erro" in a) return a.erro;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof b.id !== "string") return NextResponse.json({ error: "Missão não informada." }, { status: 400 });
  const sb = getSupabase();
  const { data: atual } = await sb.from("estudante_missoes").select("status").eq("id", b.id).eq("student_id", a.escola.student_id).eq("workspace_id", a.escola.workspace_id).maybeSingle();
  if (!atual) return NextResponse.json({ error: "Missão não encontrada." }, { status: 404 });
  const novo = proximoStatus((atual as { status: StatusMissao }).status, "feita", "familia");
  if (!novo) return NextResponse.json({ error: "Essa missão já foi marcada." }, { status: 400 });
  const nota = typeof b.nota === "string" ? b.nota.trim().slice(0, LIMITES.nota) : "";
  const agora = new Date().toISOString();
  const { data, error } = await sb.from("estudante_missoes").update({ status: novo, feita_em: agora, nota_familia: nota || null, updated_at: agora }).eq("id", b.id).select(CAMPOS_MISSAO).single();
  if (error) return NextResponse.json({ error: "Não deu para marcar agora." }, { status: 500 });
  await logAction({ actorId: a.pessoaId, actorRole: "responsavel", action: "update", resourceType: "missao_escola", resourceId: b.id, metadata: { canal: "app", status: novo }, req });
  return NextResponse.json({ missao: data });
}
