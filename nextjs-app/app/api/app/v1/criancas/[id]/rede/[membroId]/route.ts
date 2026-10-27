import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashToken, pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca, ehUuid } from "@/lib/app/acesso";
import {
  CONVITE_DIAS, VERSAO_TERMO_REDE, acessoAte, ehTipoConvidado, linhasDePermissao, linkDoConvite,
  normalizarPermissoes, novoTokenDeConvite, paraConsentimento,
} from "@/lib/app/rede";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · PATCH /api/app/v1/criancas/:id/rede/:membroId — a família muda um membro da rede:
 *   {acao: "permissoes", permissoes, acesso_ate?, consentimento: true}
 *   {acao: "pausar"} · {acao: "retomar"} · {acao: "revogar"} · {acao: "reenviar"} (convite novo, link novo)
 * Revogar é definitivo: o membro perde o acesso na hora e as permissões são apagadas.
 */
type Ctx = { params: Promise<{ id: string; membroId: string }> };
type Membro = { id: string; crianca_id: string; tipo: string; status: string; acesso_ate: string | null };

export async function PATCH(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id, membroId } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (acesso?.papel !== "responsavel") return NextResponse.json({ error: "Só a família muda a rede." }, { status: 403 });
  if (!ehUuid(membroId)) return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });

  const sb = getSupabase();
  const { data } = await sb.from("rede_membros").select("id, crianca_id, tipo, status, acesso_ate").eq("id", membroId).eq("crianca_id", id).maybeSingle();
  const m = data as Membro | null;
  if (!m || m.status === "revogado") return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const agora = new Date().toISOString();
  const consentir = (acao: "alterou" | "revogou", categorias: unknown[] = [], ate: string | null = null) =>
    sb.from("consentimentos").insert({ crianca_id: id, membro_id: membroId, autorizado_por: pessoaId, acao, categorias, ate, versao_termo: VERSAO_TERMO_REDE });
  const registrar = (acao: string, extra: Record<string, unknown> = {}) =>
    logAction({ actorId: pessoaId, actorRole: "responsavel", action: "permission_change", resourceType: "rede_membro", resourceId: membroId, metadata: { acao, ...extra }, req });

  switch (b.acao) {
    case "permissoes": {
      if (!ehTipoConvidado(m.tipo)) return NextResponse.json({ error: "As permissões da escola são combinadas no vínculo com ela." }, { status: 400 });
      if (b.consentimento !== true) return NextResponse.json({ error: "Confirme que autoriza o compartilhamento do que marcou." }, { status: 400 });
      const permissoes = normalizarPermissoes(m.tipo, b.permissoes);
      if (!permissoes.length) return NextResponse.json({ error: "Marque pelo menos uma coisa, ou revogue o acesso." }, { status: 400 });
      const ate = b.acesso_ate === undefined ? m.acesso_ate : acessoAte(b.acesso_ate);
      if (!ate) return NextResponse.json({ error: "O acesso pode durar de hoje até 2 anos." }, { status: 400 });
      await sb.from("rede_permissoes").delete().eq("membro_id", membroId);
      await sb.from("rede_permissoes").insert(linhasDePermissao(membroId, permissoes));
      await sb.from("rede_membros").update({ acesso_ate: ate, updated_at: agora }).eq("id", membroId);
      await consentir("alterou", paraConsentimento(permissoes), ate);
      await registrar("alterou", { categorias: permissoes.map((p) => p.categoria) });
      return NextResponse.json({ ok: true });
    }
    case "pausar":
    case "retomar": {
      const de = b.acao === "pausar" ? "ativo" : "pausado";
      if (m.status !== de) return NextResponse.json({ error: b.acao === "pausar" ? "Só dá para pausar quem está ativo." : "Esse acesso não está pausado." }, { status: 400 });
      await sb.from("rede_membros").update({ status: b.acao === "pausar" ? "pausado" : "ativo", updated_at: agora }).eq("id", membroId);
      await registrar(b.acao);
      return NextResponse.json({ ok: true });
    }
    case "revogar": {
      await sb.from("rede_membros").update({ status: "revogado", revogado_em: agora, convite_token_hash: null, updated_at: agora }).eq("id", membroId);
      await sb.from("rede_permissoes").delete().eq("membro_id", membroId);
      await consentir("revogou");
      await registrar("revogou");
      return NextResponse.json({ ok: true });
    }
    case "reenviar": {
      if (m.status !== "convidado") return NextResponse.json({ error: "Essa pessoa já aceitou o convite." }, { status: 400 });
      const token = novoTokenDeConvite();
      await sb.from("rede_membros").update({
        convite_token_hash: hashToken(token),
        convite_expira_em: new Date(Date.now() + CONVITE_DIAS * 864e5).toISOString(),
        updated_at: agora,
      }).eq("id", membroId);
      await registrar("reenviou");
      return NextResponse.json({ ok: true, link: linkDoConvite(token), expira_em_dias: CONVITE_DIAS });
    }
    default:
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }
}
