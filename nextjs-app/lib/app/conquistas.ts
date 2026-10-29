/**
 * Frente 6 · missões e conquistas. Regras que não mudam (doc da estrutura):
 * sem ranking, sem perder pontos, nada ligado a remédio ou a tempo de tela. Conquista só se ganha.
 * Onda 104: as Insígnias do Encontro (30, em seis cores) e os três anéis da semana (lib/app/insignias.ts).
 * Se o banco ainda não tem a migração 104, tudo continua como na onda 100 (regras antigas).
 */
import { getSupabase } from "@/lib/supabase";
import {
  DOMINIOS, METAS_PADRAO, insigniasCumpridas, progressoDosAneis, situacaoDaCrianca, proximoNivel,
  type Aneis, type Dominio, type ItemCatalogo, type Metas, type MissaoI, type RegistroI,
} from "@/lib/app/insignias";

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

/** Regras da onda 100 (antes da migração 104). */
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

export type InsigniaNova = { codigo: string | null; nome: string; figura: string | null; dominio: string | null; nivel: string | null };

type Estado = {
  catalogo: ItemCatalogo[];
  missoes: MissaoI[];
  registros: RegistroI[];
  metas: Metas;
  ganhas: { catalogo_id: string | null; nome: string; frase: string | null; created_at: string; id: string }[];
  diasDeHumor: number;
  aneis: Aneis;
};

/** Lê tudo de uma vez. Sem a migração 104 (colunas novas), devolve null. */
async function lerEstado(criancaId: string, agora = new Date()): Promise<Estado | null> {
  const sb = getSupabase();
  const [cat, ms, regs, met, ja] = await Promise.all([
    sb.from("conquistas_catalogo").select("id, codigo, nome, descricao, figura, tipo, regra, dominio, nivel, ordem").eq("ativa", true),
    sb.from("app_missoes").select("id, status, origem, dominio, trilha, etapas, confirmada_em").eq("crianca_id", criancaId),
    sb.from("registros").select("tipo, subtipo, quando").eq("crianca_id", criancaId).in("tipo", ["humor", "evento"]).is("apagado_em", null),
    sb.from("app_aneis_metas").select("fazer, sentir, junto").eq("crianca_id", criancaId).maybeSingle(),
    sb.from("conquistas").select("id, catalogo_id, nome, frase, created_at").eq("crianca_id", criancaId),
  ]);
  if (cat.error || ms.error || met.error) return null;
  const registros = (regs.data as RegistroI[] | null) || [];
  const missoes = (ms.data as MissaoI[] | null) || [];
  const metas = (met.data as Metas | null) || METAS_PADRAO;
  return {
    catalogo: (cat.data as ItemCatalogo[] | null) || [],
    missoes,
    registros,
    metas,
    ganhas: (ja.data as Estado["ganhas"] | null) || [],
    diasDeHumor: new Set(registros.filter((r) => r.tipo === "humor").map((r) => String(r.quando).slice(0, 10))).size,
    aneis: progressoDosAneis(missoes, registros, metas, agora),
  };
}

/**
 * Confere as conquistas automáticas da criança e entrega as que faltam (cada uma uma vez).
 * Devolve as novas, para o app comemorar (efeito, som e vibração; no modo calmo, só o brilho).
 */
export async function avaliarConquistas(criancaId: string, agora = new Date()): Promise<InsigniaNova[]> {
  const sb = getSupabase();
  const e = await lerEstado(criancaId, agora);
  if (!e) return avaliarConquistasAntigas(criancaId);
  const tem = new Set(e.ganhas.map((g) => g.catalogo_id));
  const s = situacaoDaCrianca(e.missoes, e.diasDeHumor, e.aneis);
  const novas = insigniasCumpridas(s, e.catalogo).filter((c) => !tem.has(c.id));
  if (e.aneis.fechados) {
    const { data: ja } = await sb.from("app_semanas_fechadas").select("semana").eq("crianca_id", criancaId).eq("semana", e.aneis.semana).maybeSingle();
    if (!ja) await sb.from("app_semanas_fechadas").insert({ crianca_id: criancaId, semana: e.aneis.semana });
  }
  if (!novas.length) return [];
  await sb.from("conquistas").insert(novas.map((c) => ({ crianca_id: criancaId, catalogo_id: c.id, nome: c.nome, figura: c.figura ?? c.codigo })));
  return novas.map((c) => ({ codigo: c.codigo, nome: c.nome, figura: c.figura ?? c.codigo, dominio: c.dominio, nivel: c.nivel }));
}

async function avaliarConquistasAntigas(criancaId: string): Promise<InsigniaNova[]> {
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
  return novas.map((c) => ({ codigo: c.codigo, nome: c.nome, figura: c.figura, dominio: null, nivel: null }));
}

export type ItemColecao = {
  codigo: string;
  nome: string;
  descricao: string | null;
  dominio: string | null;
  nivel: string | null;
  ordem: number;
  ganha: boolean;
  ganha_em: string | null;
  /** Momentos: cada vez é uma história, com a frase de quem entregou. */
  momentos?: { frase: string | null; quando: string }[];
};

export type PainelInsignias = {
  aneis: Aneis;
  metas: Metas;
  colecao: ItemColecao[];
  ganhas: number;
  cores_acesas: Dominio[];
  /** "Falta 1 missão de comunicação para Conversa boa." */
  proximas: { dominio: Dominio; nome: string; faltam: number }[];
};

/** O painel da aba Insígnias: anéis da semana, a coleção (30) e o que está perto. Sem a migração 104, null. */
export async function painelDeInsignias(criancaId: string, agora = new Date()): Promise<PainelInsignias | null> {
  const e = await lerEstado(criancaId, agora);
  if (!e) return null;
  const doCatalogo = e.catalogo.filter((c) => c.nivel && typeof c.ordem === "number").sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  const porCat = new Map<string, Estado["ganhas"]>();
  for (const g of e.ganhas) {
    if (!g.catalogo_id) continue;
    porCat.set(g.catalogo_id, [...(porCat.get(g.catalogo_id) || []), g]);
  }
  const colecao: ItemColecao[] = doCatalogo.map((c) => {
    const gs = (porCat.get(c.id) || []).sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
    const item: ItemColecao = {
      codigo: c.codigo, nome: c.nome, descricao: c.descricao ?? null, dominio: c.dominio, nivel: c.nivel,
      ordem: c.ordem ?? 0, ganha: gs.length > 0, ganha_em: gs[0]?.created_at ?? null,
    };
    if (c.nivel === "momento") item.momentos = gs.map((g) => ({ frase: g.frase, quando: g.created_at }));
    return item;
  });
  const s = situacaoDaCrianca(e.missoes, e.diasDeHumor, e.aneis);
  const proximas = DOMINIOS.flatMap((d) => {
    const p = proximoNivel(s.feitasPorDominio[d]);
    if (!p) return [];
    const alvo = doCatalogo.find((c) => c.dominio === d && c.nivel === p.nivel);
    return alvo ? [{ dominio: d, nome: alvo.nome, faltam: p.faltam }] : [];
  }).sort((a, b) => a.faltam - b.faltam).slice(0, 3);
  return {
    aneis: e.aneis,
    metas: e.metas,
    colecao,
    ganhas: colecao.filter((c) => c.ganha).length,
    cores_acesas: DOMINIOS.filter((d) => colecao.some((c) => c.dominio === d && c.ganha)),
    proximas,
  };
}

/** Um adulto entrega o Momento de uma cor, com a frase do que viu. Devolve a insígnia (e as especiais que ela destravar). */
export async function entregarMomento(criancaId: string, dominio: Dominio, frase: string, pessoaId: string): Promise<InsigniaNova[] | null> {
  const sb = getSupabase();
  const { data } = await sb.from("conquistas_catalogo").select("id, codigo, nome").eq("codigo", `${dominio}-momento`).maybeSingle();
  const c = data as { id: string; codigo: string; nome: string } | null;
  if (!c) return null;
  const { error } = await sb.from("conquistas").insert({ crianca_id: criancaId, catalogo_id: c.id, nome: c.nome, frase, figura: c.codigo, concedida_por: pessoaId });
  if (error) return null;
  return [{ codigo: c.codigo, nome: c.nome, figura: c.codigo, dominio, nivel: "momento" }];
}
