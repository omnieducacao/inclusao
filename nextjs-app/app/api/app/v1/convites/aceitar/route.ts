import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { CONVITE_INVALIDO, conviteDoToken } from "@/lib/app/convite";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · POST /api/app/v1/convites/aceitar {token} → a pessoa logada entra na rede da criança.
 * O token vale uma vez: depois de aceito, o hash é apagado.
 */
export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AUTH_IP); if (rl) return rl;
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { token?: unknown };
  const convite = await conviteDoToken(b.token);
  if (!convite) return NextResponse.json({ error: CONVITE_INVALIDO }, { status: 404 });

  const atual = await acessoACrianca(pessoaId, convite.crianca_id);
  if (atual?.papel === "responsavel" || atual?.papel === "adolescente") {
    return NextResponse.json({ error: "Você já faz parte da família desta criança." }, { status: 409 });
  }
  const sb = getSupabase();
  const { data: ja } = await sb
    .from("rede_membros")
    .select("id")
    .eq("crianca_id", convite.crianca_id)
    .eq("pessoa_id", pessoaId)
    .in("status", ["ativo", "pausado"]);
  if (((ja as unknown[] | null) || []).length) {
    return NextResponse.json({ error: "Você já está na rede desta criança. A família pode mudar o seu acesso." }, { status: 409 });
  }

  const agora = new Date().toISOString();
  await sb.from("rede_membros").update({
    pessoa_id: pessoaId, status: "ativo", aceito_em: agora, convite_token_hash: null, updated_at: agora,
  }).eq("id", convite.id).eq("status", "convidado");
  await logAction({ actorId: pessoaId, actorRole: "membro", action: "permission_change", resourceType: "rede_membro", resourceId: convite.id, metadata: { acao: "aceitou", tipo: convite.tipo }, req });
  return NextResponse.json({ ok: true, crianca_id: convite.crianca_id, membro_id: convite.id });
}
