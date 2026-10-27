/**
 * Frente 6 · missões e conquistas. Regras que não mudam (doc da estrutura):
 * sem ranking, sem perder pontos, nada ligado a remédio ou a tempo de tela. Conquista só se ganha.
 */
import { getSupabase } from "@/lib/supabase";

export type Etapa = { texto: string; figura?: string | null; feita_em?: string | null };
type Missao = { id: string; status: string; trilha: string | null; etapas: Etapa[] | null };
type Catalogo = { id: string; codigo: string; nome: string; figura: string | null; tipo: string; regra: Record<string, unknown> | null };

export const FIGURAS = ["estrela", "foguete", "montanha", "coracao", "medalha", "sol", "arvore", "livro", "bola", "musica"] as const;

/** Etapas vindas do app: 1 a 8, texto curto, figura do conjunto (ou nenhuma). */
export function lerEtapas(x: unknown): Etapa[] | null {
  if (!Array.isArray(x) || x.length < 1 || x.length > 8) return null;
  const etapas: Etapa[] = [];
  for (const e of x) {
    const texto = typeof e === "string" ? e : e && typeof e === "object" ? (e as Record<string, unknown>).texto : null;
    if (typeof texto !== "string" || !texto.trim()) return null;
    const fig = e && typeof e === "object" ? (e as Record<string, unknown>).figura : null;
    etapas.push({ texto: texto.trim().slice(0, 120), figura: typeof fig === "string" && (FIGURAS as readonly string[]).includes(fig) ? fig : null, feita_em: null });
  }
  return etapas;
}

/** Quando a missão terminou: a última etapa marcada. */
export function terminouEm(etapas: Etapa[] | null): string | null {
  const datas = (etapas || []).map((e) => e.feita_em).filter((d): d is string => !!d);
  return datas.length === (etapas || []).length && datas.length ? datas.sort().at(-1)! : null;
}

const FEITA = new Set(["feita", "confirmada"]);

/** O que a criança já cumpriu, para conferir as regras automáticas do catálogo. */
export function quaisRegrasCumpridas(missoes: Missao[], diasDeHumor: number, catalogo: Catalogo[], agora = new Date()): Catalogo[] {
  const feitas = missoes.filter((m) => FEITA.has(m.status));
  const semanaAtras = agora.getTime() - 7 * 864e5;
  const naSemana = feitas.filter((m) => {
    const t = terminouEm(m.etapas);
    return t && Date.parse(t) >= semanaAtras;
  }).length;
  const trilhas = new Map<string, { total: number; feitas: number }>();
  for (const m of missoes) {
    if (!m.trilha || m.status === "arquivada") continue;
    const t = trilhas.get(m.trilha) || { total: 0, feitas: 0 };
    t.total += 1;
    if (FEITA.has(m.status)) t.feitas += 1;
    trilhas.set(m.trilha, t);
  }
  const algumaTrilhaCompleta = [...trilhas.values()].some((t) => t.total >= 2 && t.feitas === t.total);
  return catalogo.filter((c) => {
    if (c.tipo !== "automatica" || !c.regra) return false;
    const r = c.regra;
    if (typeof r.missoes_total === "number") return feitas.length >= r.missoes_total;
    if (typeof r.missoes_semana === "number") return naSemana >= r.missoes_semana;
    if (r.trilha_completa === true) return algumaTrilhaCompleta;
    if (typeof r.humor_dias === "number") return diasDeHumor >= r.humor_dias;
    return false;
  });
}

/**
 * Confere as conquistas automáticas da criança e entrega as que faltam (cada uma uma vez).
 * Devolve as novas, para o app comemorar.
 */
export async function avaliarConquistas(criancaId: string): Promise<{ nome: string; figura: string | null }[]> {
  const sb = getSupabase();
  const [{ data: cat }, { data: ms }, { data: hum }, { data: ja }] = await Promise.all([
    sb.from("conquistas_catalogo").select("id, codigo, nome, figura, tipo, regra").eq("ativa", true),
    sb.from("app_missoes").select("id, status, trilha, etapas").eq("crianca_id", criancaId),
    sb.from("registros").select("quando").eq("crianca_id", criancaId).eq("tipo", "humor").is("apagado_em", null),
    sb.from("conquistas").select("catalogo_id").eq("crianca_id", criancaId),
  ]);
  const dias = new Set(((hum as { quando: string }[] | null) || []).map((h) => String(h.quando).slice(0, 10))).size;
  const tem = new Set(((ja as { catalogo_id: string | null }[] | null) || []).map((c) => c.catalogo_id));
  const novas = quaisRegrasCumpridas((ms as Missao[] | null) || [], dias, (cat as Catalogo[] | null) || []).filter((c) => !tem.has(c.id));
  if (!novas.length) return [];
  await sb.from("conquistas").insert(novas.map((c) => ({ crianca_id: criancaId, catalogo_id: c.id, nome: c.nome, figura: c.figura })));
  return novas.map((c) => ({ nome: c.nome, figura: c.figura }));
}
