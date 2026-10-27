import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { CONVITE_INVALIDO, conviteDoToken } from "@/lib/app/convite";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * Frente 6 · POST /api/app/v1/convites/ver {token} → o que a pessoa vai receber, antes de aceitar:
 * quem convidou, o primeiro nome da criança, o que poderá ver e escrever e até quando.
 */
export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AUTH_IP); if (rl) return rl;
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { token?: unknown };
  const convite = await conviteDoToken(b.token);
  if (!convite) return NextResponse.json({ error: CONVITE_INVALIDO }, { status: 404 });

  const sb = getSupabase();
  const { data: c } = await sb.from("criancas").select("nome").eq("id", convite.crianca_id).maybeSingle();
  const { data: quem } = convite.convidado_por
    ? await sb.from("pessoas").select("nome").eq("id", convite.convidado_por).maybeSingle()
    : { data: null };
  const { data: perms } = await sb.from("rede_permissoes").select("categoria, pode_ver, pode_escrever").eq("membro_id", convite.id);
  const primeiroNome = String((c as { nome?: string } | null)?.nome || "").split(" ")[0] || null;
  return NextResponse.json({
    convite: {
      tipo: convite.tipo,
      como_voce_aparece: convite.nome,
      crianca: primeiroNome,
      convidado_por: (quem as { nome?: string } | null)?.nome || null,
      acesso_ate: convite.acesso_ate,
      permissoes: ((perms as { categoria: string; pode_ver: boolean; pode_escrever: boolean }[] | null) || [])
        .map((p) => ({ categoria: p.categoria, ver: p.pode_ver, escrever: p.pode_escrever })),
    },
  });
}
