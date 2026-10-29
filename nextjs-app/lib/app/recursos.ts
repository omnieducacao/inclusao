/**
 * Frente 6 · onda 103 · os modos do app (SCRUM-309).
 *
 * Um aplicativo só, e cada criança tem a sua configuração. Os modos não se excluem:
 * - escola: a escola da criança assina a Omnisfera; o app é a devolutiva da escola para a família
 *   (plano de apoio e ciência, evolução, missões da escola, conversa);
 * - cuidado (plano da família): a família assinou direto (ou está no teste): Omniband, registros e
 *   linha do tempo, Crise agora, medicação, rede de apoio e resumo do período;
 * - combo: os dois na mesma criança;
 * - adolescente: camada por cima de qualquer um (a jornada: missões, inclusive as que a escola
 *   tirou do PEI, e conquistas).
 *
 * A regra mora aqui, num lugar só: o app recebe estes recursos em /eu e mostra só o que a
 * configuração da criança tem. Mudar o que um modo libera é mudar esta função.
 */
import { getSupabase } from "@/lib/supabase";

export type Recursos = {
  /** A escola cliente da criança (Omnisfera tradicional), ou null. */
  escola: { nome: string } | null;
  /** Plano da família: Omniband, registros, crise, medicação, rede e resumo. */
  cuidado: boolean;
  /** O modo adolescente está ligado (a criança tem a conta dela, pelo código da família). */
  adolescente: boolean;
  /** Missões e conquistas: com a escola (o PEI vira missões) ou com o plano da família. */
  jornada: boolean;
  plano: string;
};

/** Planos da família que liberam o cuidado. "escola" é a família que só recebe a devolutiva da escola. */
export const PLANOS_COM_CUIDADO = new Set(["teste", "assinatura"]);

export function montarRecursos(p: { plano: string | null; escola: string | null; adolescente: boolean }): Recursos {
  const plano = p.plano || "escola";
  const cuidado = PLANOS_COM_CUIDADO.has(plano);
  const escola = p.escola ? { nome: p.escola } : null;
  return { escola, cuidado, adolescente: p.adolescente, jornada: cuidado || !!escola, plano };
}

/** O nome do modo, para o app e para os registros ("Escola", "Plano da família", "Escola e plano da família"). */
export function nomeDoModo(r: Recursos): string {
  if (r.escola && r.cuidado) return "Escola e plano da família";
  if (r.escola) return "Escola";
  if (r.cuidado) return "Plano da família";
  return "Sem plano ativo";
}

/** Os recursos de várias crianças de uma vez (para o /eu). */
export async function recursosDasCriancas(ids: string[]): Promise<Record<string, Recursos>> {
  const unicos = [...new Set(ids)];
  if (!unicos.length) return {};
  const sb = getSupabase();
  const [{ data: cs }, { data: ces }] = await Promise.all([
    sb.from("criancas").select("id, familia_id, modo, adolescente_pessoa_id, adolescente_pausado").in("id", unicos),
    sb.from("crianca_escolas").select("crianca_id, workspace_id, status").in("crianca_id", unicos).eq("status", "ativo"),
  ]);
  const criancas = (cs as { id: string; familia_id: string; modo: string; adolescente_pessoa_id: string | null; adolescente_pausado: boolean | null }[] | null) || [];
  const vinculos = (ces as { crianca_id: string; workspace_id: string }[] | null) || [];
  const familiaIds = [...new Set(criancas.map((c) => c.familia_id))];
  const wsIds = [...new Set(vinculos.map((v) => v.workspace_id))];
  const [{ data: fs }, { data: ws }] = await Promise.all([
    familiaIds.length ? sb.from("familias").select("id, plano").in("id", familiaIds) : Promise.resolve({ data: [] }),
    wsIds.length ? sb.from("workspaces").select("id, name").in("id", wsIds) : Promise.resolve({ data: [] }),
  ]);
  const plano = new Map(((fs as { id: string; plano: string }[] | null) || []).map((f) => [f.id, f.plano]));
  const nomeEscola = new Map(((ws as { id: string; name: string }[] | null) || []).map((w) => [w.id, w.name]));
  const escolaDa = new Map(vinculos.map((v) => [v.crianca_id, nomeEscola.get(v.workspace_id) || "Escola"]));
  const saida: Record<string, Recursos> = {};
  for (const c of criancas) {
    saida[c.id] = montarRecursos({
      plano: plano.get(c.familia_id) ?? null,
      escola: escolaDa.get(c.id) ?? null,
      adolescente: !!c.adolescente_pessoa_id && !c.adolescente_pausado,
    });
  }
  return saida;
}
