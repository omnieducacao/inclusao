import { getSupabase } from "@/lib/supabase";
import { hashToken } from "@/lib/app/sessao";
import { acessoACrianca } from "@/lib/app/acesso";
import { CAMPOS_COMPROMISSO, gerarIcs, podeVer, type Compromisso } from "@/lib/app/agenda";

/**
 * Frente 6 · onda 105 · GET /api/app/v1/calendario/<segredo>.ics — o calendário assinável.
 * Sem login (o Google e o iPhone buscam sozinhos): o segredo no endereço é a chave. A cada busca,
 * confere de novo se a pessoa ainda tem acesso à criança (saiu da rede, o link para de mostrar).
 * Só título · primeiro nome, hora e local. Nenhum dado de saúde.
 */
type Ctx = { params: Promise<{ token: string }> };

function vazio(status: number) {
  return new Response("Calendário não encontrado.", { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}

export async function GET(_req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  const segredo = token.replace(/\.ics$/, "");
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(segredo)) return vazio(404);
  const sb = getSupabase();
  const { data: link } = await sb.from("app_agenda_links").select("id, pessoa_id, crianca_id").eq("token_hash", hashToken(`agenda:${segredo}`)).is("revogado_em", null).maybeSingle();
  const l = link as { id: string; pessoa_id: string; crianca_id: string } | null;
  if (!l) return vazio(404);
  const acesso = await acessoACrianca(l.pessoa_id, l.crianca_id);
  if (!acesso) return vazio(404);
  const [{ data: lista }, { data: crianca }] = await Promise.all([
    sb.from("app_compromissos").select(CAMPOS_COMPROMISSO).eq("crianca_id", l.crianca_id).is("cancelado_em", null),
    sb.from("criancas").select("nome").eq("id", l.crianca_id).maybeSingle(),
  ]);
  const primeiro = String((crianca as { nome?: string } | null)?.nome || "Criança").trim().split(/\s+/)[0];
  const visiveis = ((lista as Compromisso[] | null) || []).filter((c) => podeVer(acesso, c));
  await sb.from("app_agenda_links").update({ ultimo_acesso_em: new Date().toISOString() }).eq("id", l.id);
  return new Response(gerarIcs(visiveis, primeiro), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'inline; filename="agenda.ics"',
      "cache-control": "private, max-age=900",
      "x-robots-tag": "noindex",
    },
  });
}
