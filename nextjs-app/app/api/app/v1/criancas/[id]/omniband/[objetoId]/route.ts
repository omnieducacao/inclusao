import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca, ehUuid } from "@/lib/app/acesso";
import { logAction } from "@/lib/audit";
import { ehLinha, ehRotina } from "@/lib/app/omniband";

/**
 * Frente 6 · um objeto da Omniband (só a família).
 * PATCH { apelido?, rotina?, linha?, acao?: "desativar" | "reativar" }
 * Desativar é o botão "perdi": na hora, o link do chip deixa de mostrar qualquer coisa da criança.
 */
type Ctx = { params: Promise<{ id: string; objetoId: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id, objetoId } = await ctx.params;
  if (!ehUuid(objetoId)) return NextResponse.json({ error: "Objeto não encontrado." }, { status: 404 });
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso || acesso.papel !== "responsavel") return NextResponse.json({ error: "Só a família cuida da Omniband." }, { status: 403 });

  const sb = getSupabase();
  const { data: atual } = await sb.from("omniband_objetos").select("id, crianca_id, status, uid_hash, tipo").eq("id", objetoId).eq("crianca_id", id).maybeSingle();
  const o = atual as { id: string; status: string; uid_hash: string | null; tipo: string } | null;
  if (!o) return NextResponse.json({ error: "Objeto não encontrado." }, { status: 404 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const valores: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (b.apelido !== undefined) valores.apelido = typeof b.apelido === "string" && b.apelido.trim() ? b.apelido.trim().slice(0, 40) : null;
  if (b.rotina !== undefined) {
    if (b.rotina !== null && !ehRotina(b.rotina)) return NextResponse.json({ error: "Rotina inválida." }, { status: 400 });
    if (o.tipo === "adesivo" && !b.rotina) return NextResponse.json({ error: "O adesivo precisa de uma rotina." }, { status: 400 });
    valores.rotina = b.rotina;
  }
  if (b.linha !== undefined) valores.linha = ehLinha(b.linha) ? b.linha : null;
  if (b.acao === "desativar") {
    valores.status = "desativado";
    valores.desativado_em = new Date().toISOString();
  } else if (b.acao === "reativar") {
    if (o.uid_hash) {
      const { data: outro } = await sb.from("omniband_objetos").select("id").eq("uid_hash", o.uid_hash).eq("status", "ativo");
      if (((outro as { id: string }[] | null) || []).some((x) => x.id !== o.id)) {
        return NextResponse.json({ error: "Este chip já está ligado de novo em outro lugar." }, { status: 409 });
      }
    }
    valores.status = "ativo";
    valores.desativado_em = null;
  } else if (b.acao !== undefined) {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  const { error } = await sb.from("omniband_objetos").update(valores).eq("id", o.id).eq("crianca_id", id);
  if (error) return NextResponse.json({ error: "Não deu para salvar agora." }, { status: 500 });
  await logAction({ actorId: pessoaId, actorRole: "responsavel", action: "update", resourceType: "omniband", resourceId: o.id, metadata: { acao: b.acao || "editar" }, req });
  return NextResponse.json({ ok: true, status: valores.status || o.status });
}
