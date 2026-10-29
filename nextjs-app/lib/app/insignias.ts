/**
 * Frente 6 · onda 104: Insígnias do Encontro e os três anéis da semana.
 * Decisões do Rodrigo em 29/10/2026 (doc "App da família: decisões que valem", canvas "Insígnias do Encontro"):
 *   - seis famílias, uma por cor do símbolo; em cada uma, Semente (1 missão), Broto (5), Flor (15)
 *     e um Momento, entregue por quem cuida; seis especiais. 30 ao todo;
 *   - três anéis por semana (segunda a domingo, horário de Brasília): Fazer (etapas marcadas),
 *     Sentir (momento de calma ou "como foi o dia") e Junto (missão confirmada por um adulto ou pela escola);
 *     cores vizinhas na logo: verde, azul e roxo;
 *   - o mesmo catálogo nas três faixas de idade; muda só o desenho, no app;
 *   - só se ganha, nada se perde; sem ranking; o anel só enche; nada ligado a remédio ou a tempo de tela.
 * Este arquivo é só lógica (sem banco), para testar sem rede.
 */
export const DOMINIOS = ["comunicacao", "autonomia", "aprender", "convivencia", "calma", "cuidar"] as const;
export type Dominio = (typeof DOMINIOS)[number];
export type Nivel = "semente" | "broto" | "flor" | "momento" | "especial";

export function lerDominio(x: unknown): Dominio | null {
  return typeof x === "string" && (DOMINIOS as readonly string[]).includes(x) ? (x as Dominio) : null;
}

/** Quantas missões da cor cada nível pede. */
export const MISSOES_POR_NIVEL = { semente: 1, broto: 5, flor: 15 } as const;

export type Metas = { fazer: number; sentir: number; junto: number };
export const METAS_PADRAO: Metas = { fazer: 5, sentir: 3, junto: 2 };
const LIMITES: Metas = { fazer: 50, sentir: 21, junto: 14 };

/** Metas vindas do app: inteiros entre 1 e o limite de cada anel; o que faltar fica como estava. */
export function lerMetas(x: unknown, atuais: Metas = METAS_PADRAO): Metas | null {
  if (!x || typeof x !== "object") return null;
  const b = x as Record<string, unknown>;
  const out = { ...atuais };
  for (const k of ["fazer", "sentir", "junto"] as const) {
    if (b[k] === undefined) continue;
    const v = b[k];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > LIMITES[k]) return null;
    out[k] = v;
  }
  return out;
}

/** Brasil sem horário de verão desde 2019: UTC−3 o ano todo. */
const BRASILIA_MS = -3 * 3600e3;

/** A segunda-feira (AAAA-MM-DD, em Brasília) da semana de `agora`, e o instante UTC em que ela começa. */
export function inicioDaSemana(agora = new Date()): { dia: string; desde: number } {
  const local = new Date(agora.getTime() + BRASILIA_MS);
  const dow = (local.getUTCDay() + 6) % 7; // segunda = 0
  const seg = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - dow);
  return { dia: new Date(seg).toISOString().slice(0, 10), desde: seg - BRASILIA_MS };
}

type EtapaM = { feita_em?: string | null };
export type MissaoI = {
  status: string;
  origem: string | null;
  dominio: string | null;
  trilha?: string | null;
  etapas: EtapaM[] | null;
  confirmada_em?: string | null;
};
export type RegistroI = { tipo: string; subtipo: string | null; quando: string };

export type Anel = { feitas: number; meta: number; fechado: boolean };
export type Aneis = { semana: string; fazer: Anel; sentir: Anel; junto: Anel; fechados: boolean };

const anel = (feitas: number, meta: number): Anel => ({ feitas, meta, fechado: feitas >= meta });
const naSemana = (iso: string | null | undefined, desde: number) => {
  if (!iso) return false;
  const t = Date.parse(iso);
  return !Number.isNaN(t) && t >= desde && t < desde + 7 * 864e5;
};

/** Momento de "sentir": calma registrada (a ficha do toque, o adesivo do cantinho) ou "como foi o dia". Remédio nunca conta. */
export function ehMomentoDeSentir(r: RegistroI): boolean {
  return r.tipo === "humor" || (r.tipo === "evento" && r.subtipo === "calma");
}

export function progressoDosAneis(missoes: MissaoI[], registros: RegistroI[], metas: Metas, agora = new Date()): Aneis {
  const { dia, desde } = inicioDaSemana(agora);
  let fazer = 0;
  for (const m of missoes) {
    if (m.status === "arquivada") continue;
    for (const e of m.etapas || []) if (naSemana(e.feita_em, desde)) fazer += 1;
  }
  const sentir = registros.filter((r) => ehMomentoDeSentir(r) && naSemana(r.quando, desde)).length;
  const junto = missoes.filter((m) => m.status === "confirmada" && naSemana(m.confirmada_em, desde)).length;
  const a = { fazer: anel(fazer, metas.fazer), sentir: anel(sentir, metas.sentir), junto: anel(junto, metas.junto) };
  return { semana: dia, ...a, fechados: a.fazer.fechado && a.sentir.fechado && a.junto.fechado };
}

export type ItemCatalogo = {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string | null;
  figura?: string | null;
  tipo: string;
  regra: Record<string, unknown> | null;
  dominio: string | null;
  nivel: string | null;
  ordem: number | null;
};

const FEITA = new Set(["feita", "confirmada"]);

export type Situacao = {
  feitasPorDominio: Record<Dominio, number>;
  totalFeitas: number;
  peiConfirmadas: number;
  trilhaCompleta: boolean;
  diasDeHumor: number;
  aneisFechados: boolean;
  /** Cores que já acenderam (ao menos a Semente), contando as que vão ser entregues agora. */
  coresAcesas: Set<Dominio>;
};

export function situacaoDaCrianca(missoes: MissaoI[], diasDeHumor: number, aneis: Aneis | null): Situacao {
  const feitas = missoes.filter((m) => FEITA.has(m.status));
  const porDom = Object.fromEntries(DOMINIOS.map((d) => [d, 0])) as Record<Dominio, number>;
  for (const m of feitas) {
    const d = lerDominio(m.dominio);
    if (d) porDom[d] += 1;
  }
  const trilhas = new Map<string, { total: number; feitas: number }>();
  for (const m of missoes) {
    if (!m.trilha || m.status === "arquivada") continue;
    const t = trilhas.get(m.trilha) || { total: 0, feitas: 0 };
    t.total += 1;
    if (FEITA.has(m.status)) t.feitas += 1;
    trilhas.set(m.trilha, t);
  }
  return {
    feitasPorDominio: porDom,
    totalFeitas: feitas.length,
    peiConfirmadas: missoes.filter((m) => m.origem === "pei" && m.status === "confirmada").length,
    trilhaCompleta: [...trilhas.values()].some((t) => t.total >= 2 && t.feitas === t.total),
    diasDeHumor,
    aneisFechados: !!aneis?.fechados,
    coresAcesas: new Set(DOMINIOS.filter((d) => porDom[d] >= 1)),
  };
}

/** As insígnias automáticas que a situação já cumpre (o Momento é sempre entregue por uma pessoa). */
export function insigniasCumpridas(s: Situacao, catalogo: ItemCatalogo[]): ItemCatalogo[] {
  return catalogo.filter((c) => {
    if (c.tipo !== "automatica" || !c.regra) return false;
    const r = c.regra;
    const dom = lerDominio(r.dominio);
    if (dom && typeof r.missoes === "number") return s.feitasPorDominio[dom] >= r.missoes;
    if (typeof r.missoes_total === "number") return s.totalFeitas >= r.missoes_total;
    if (r.trilha_completa === true) return s.trilhaCompleta;
    if (typeof r.humor_dias === "number") return s.diasDeHumor >= r.humor_dias;
    if (r.aneis_fechados === true) return s.aneisFechados;
    if (r.seis_cores === true) return s.coresAcesas.size === DOMINIOS.length;
    if (typeof r.pei_confirmada === "number") return s.peiConfirmadas >= r.pei_confirmada;
    if (typeof r.missoes_semana === "number") return false; // regra antiga, desativada na onda 104
    return false;
  });
}

/** Quantas missões faltam para o próximo nível de uma cor (para "falta 1 para Conversa boa"). */
export function proximoNivel(feitas: number): { nivel: "semente" | "broto" | "flor"; faltam: number } | null {
  for (const nivel of ["semente", "broto", "flor"] as const) {
    if (feitas < MISSOES_POR_NIVEL[nivel]) return { nivel, faltam: MISSOES_POR_NIVEL[nivel] - feitas };
  }
  return null;
}
