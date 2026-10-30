import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { acessoACrianca, ehUuid, type Acesso } from "@/lib/app/acesso";
import { lerCompromisso } from "@/lib/app/agenda";
import { logAction } from "@/lib/audit";

/**
 * Frente 6 · onda 105 · um compromisso da agenda.
 * A família:
 *   PATCH {campos…} muda a série toda; {acao: "pular" | "voltar", data} tira ou devolve um dia da série;
 *   {acao: "confirmar"} aceita a proposta (o compromisso novo ou a remarcação); {acao: "recusar"} recusa.
 *   DELETE cancela (a série toda); fica guardado, não aparece mais.
 * O profissional da rede (onda 106), só nos compromissos dele:
 *   PATCH {acao: "remarcar", inicio} propõe outro horário (a família confirma); {acao: "desistir"} tira a proposta dele.
 */
type Ctx = { params: Promise<{ id: string; compromissoId: string }> };
const DATA = /^\d{4}-\d{2}-\d{2}$/;
type Atual = { id: string; pulos: string[] | null; inicio: string; membro_id: string | null; status?: string; proposta_inicio?: string | null };

async function carregar(req: Request, ctx: Ctx) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return { erro: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const { id, compromissoId } = await ctx.params;
  const acesso = await acessoACrianca(pessoaId, id);
  if (!acesso) return { erro: NextResponse.json({ error: "Sem acesso a esta criança." }, { status: 403 }) };
  if (!ehUuid(compromissoId)) return { erro: NextResponse.json({ error: "Compromisso não encontrado." }, { status: 404 }) };
  const { data } = await getSupabase().from("app_compromissos").select("id, pulos, inicio, membro_id, status, proposta_inicio").eq("id", compromissoId).eq("crianca_id", id).is("cancelado_em", null).maybeSingle();
  const atual = data as Atual | null;
  if (!atual || atual.status === "recusado") return { erro: NextResponse.json({ error: "Compromisso não encontrado." }, { status: 404 }) };
  return { pessoaId, id, compromissoId, acesso, atual };
}

function soFamilia() {
  return NextResponse.json({ error: "Só a família muda a agenda." }, { status: 403 });
}
function doMembro(acesso: Acesso, atual: Atual) {
  return acesso.papel === "membro" && !!acesso.membroId && atual.membro_id === acesso.membroId;
}

export async function PATCH(req: Request, ctx: Ctx) {
  const r = await carregar(req, ctx);
  if ("erro" in r) return r.erro;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const sb = getSupabase();
  const agora = new Date().toISOString();
  const familia = r.acesso.papel === "responsavel";
  const registrar = (acao: string) =>
    logAction({ actorId: r.pessoaId, actorRole: r.acesso.papel, action: "update", resourceType: "compromisso", resourceId: r.compromissoId, metadata: { acao }, req });

  // ---------- o profissional propõe ----------
  if (b.acao === "remarcar" || b.acao === "desistir") {
    if (!doMembro(r.acesso, r.atual)) return NextResponse.json({ error: "Só o profissional deste compromisso propõe outro horário." }, { status: 403 });
    if (b.acao === "desistir") {
      // a proposta de um compromisso novo some; a de remarcar volta ao horário de antes
      await sb.from("app_compromissos").update(r.atual.status === "proposto" ? { cancelado_em: agora, updated_at: agora } : { proposta_inicio: null, proposto_por: null, updated_at: agora }).eq("id", r.compromissoId);
      await registrar("desistiu");
      return NextResponse.json({ ok: true });
    }
    const ms = typeof b.inicio === "string" ? Date.parse(b.inicio) : NaN;
    if (Number.isNaN(ms)) return NextResponse.json({ error: "Informe o dia e a hora." }, { status: 400 });
    const novo = new Date(ms).toISOString();
    // ainda não confirmado: muda a própria proposta; já confirmado: vira proposta de remarcação
    const mudanca = r.atual.status === "proposto" ? { inicio: novo } : { proposta_inicio: novo, proposto_por: r.pessoaId };
    await sb.from("app_compromissos").update({ ...mudanca, updated_at: agora }).eq("id", r.compromissoId);
    await registrar("remarcar");
    return NextResponse.json({ ok: true });
  }

  if (!familia) return soFamilia();

  // ---------- a família responde a uma proposta ----------
  if (b.acao === "confirmar" || b.acao === "recusar") {
    const novo = r.atual.status === "proposto";
    if (!novo && !r.atual.proposta_inicio) return NextResponse.json({ error: "Não há proposta para responder." }, { status: 400 });
    const mudanca = b.acao === "confirmar"
      ? (novo ? { status: "confirmado" } : { inicio: r.atual.proposta_inicio, proposta_inicio: null, proposto_por: null })
      : (novo ? { status: "recusado" } : { proposta_inicio: null, proposto_por: null });
    await sb.from("app_compromissos").update({ ...mudanca, updated_at: agora }).eq("id", r.compromissoId);
    await registrar(b.acao === "confirmar" ? (novo ? "confirmou" : "confirmou-remarcacao") : (novo ? "recusou" : "recusou-remarcacao"));
    return NextResponse.json({ ok: true });
  }

  if (b.acao === "pular" || b.acao === "voltar") {
    if (typeof b.data !== "string" || !DATA.test(b.data)) return NextResponse.json({ error: "Informe o dia." }, { status: 400 });
    const pulos = new Set(r.atual.pulos || []);
    if (b.acao === "pular") pulos.add(b.data); else pulos.delete(b.data);
    if (pulos.size > 200) return NextResponse.json({ error: "Dias demais pulados nesta série." }, { status: 400 });
    await sb.from("app_compromissos").update({ pulos: [...pulos].sort(), updated_at: agora }).eq("id", r.compromissoId);
    await registrar(String(b.acao));
    return NextResponse.json({ ok: true });
  }
  const dados = lerCompromisso(b, true);
  if ("erro" in dados) return NextResponse.json({ error: dados.erro }, { status: 400 });
  if (!Object.keys(dados).length) return NextResponse.json({ error: "Nada para mudar." }, { status: 400 });
  if (dados.repete_ate && dados.repete_ate < (dados.inicio || r.atual.inicio).slice(0, 10)) {
    return NextResponse.json({ error: "A repetição não pode terminar antes de começar." }, { status: 400 });
  }
  if (dados.membro_id) {
    const { data: m } = await sb.from("rede_membros").select("id").eq("id", dados.membro_id).eq("crianca_id", r.id).maybeSingle();
    if (!m) return NextResponse.json({ error: "Essa pessoa não está na rede desta criança." }, { status: 400 });
  }
  await sb.from("app_compromissos").update({ ...dados, updated_at: agora }).eq("id", r.compromissoId);
  await logAction({ actorId: r.pessoaId, actorRole: "responsavel", action: "update", resourceType: "compromisso", resourceId: r.compromissoId, metadata: { campos: Object.keys(dados) }, req });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const r = await carregar(req, ctx);
  if ("erro" in r) return r.erro;
  if (r.acesso.papel !== "responsavel") return soFamilia();
  const agora = new Date().toISOString();
  await getSupabase().from("app_compromissos").update({ cancelado_em: agora, updated_at: agora }).eq("id", r.compromissoId);
  await logAction({ actorId: r.pessoaId, actorRole: "responsavel", action: "delete", resourceType: "compromisso", resourceId: r.compromissoId, req });
  return NextResponse.json({ ok: true });
}
