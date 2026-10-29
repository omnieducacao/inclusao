/**
 * Frente 6 · onda 102 · o resumo do período ("Na consulta", no caderno da Omniband).
 * Só organiza o que foi registrado: conta, soma e agrupa. Não interpreta, não diagnostica, não
 * sugere dose. Quem avalia é o profissional. Roda em memória sobre os registros que a pessoa pode ver.
 */
export type RegistroResumo = {
  tipo: string;
  categoria: string;
  subtipo: string | null;
  quando: string;
  duracao: string | null;
  gatilho: string | null;
  local: string | null;
  dados: Record<string, unknown> | null;
};

export type Resumo = {
  dias: number;
  inicio: string;
  fim: string;
  crises: { total: number; duracao_media_min: number | null; por_semana: { semana: string; crises: number; duracao_media_min: number | null }[] };
  faixas: { faixa: string; total: number }[];
  dias_da_semana: { dia: string; total: number }[];
  gatilhos: { texto: string; total: number }[];
  ajudou: { texto: string; total: number }[];
  locais: { local: string; total: number }[];
  sono: { registros: number; noites_agitadas: number };
  medicacao: { doses_dadas: number; doses_nao_dadas: number; dias_com_dose: number };
  avancos: number;
  calma: number;
  eventos_por_tipo: { subtipo: string; total: number }[];
};

const FAIXAS = ["6–9h", "9–12h", "12–14h", "14–17h", "17–20h", "20–23h", "noite"] as const;
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const EPISODIOS = new Set(["crise", "agitacao", "agressividade", "autolesao", "choro"]);

export function minutosDe(duracao: string | null): number | null {
  if (!duracao) return null;
  const m = duracao.match(/(\d+(?:[.,]\d+)?)\s*(h|hora|min|m)?/i);
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return /^h/i.test(m[2] || "") ? Math.round(n * 60) : Math.round(n);
}

function faixaDe(d: Date): (typeof FAIXAS)[number] {
  const h = d.getHours();
  if (h >= 6 && h < 9) return "6–9h";
  if (h >= 9 && h < 12) return "9–12h";
  if (h >= 12 && h < 14) return "12–14h";
  if (h >= 14 && h < 17) return "14–17h";
  if (h >= 17 && h < 20) return "17–20h";
  if (h >= 20 && h < 23) return "20–23h";
  return "noite";
}

function inicioDaSemana(d: Date): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // segunda-feira
  return x.toISOString().slice(0, 10);
}

function contar(textos: (string | null | undefined)[], max = 6): { texto: string; total: number }[] {
  const m = new Map<string, { texto: string; total: number }>();
  for (const t of textos) {
    const limpo = (t || "").trim();
    if (!limpo) continue;
    const chave = limpo.toLowerCase();
    const atual = m.get(chave) ?? { texto: limpo, total: 0 };
    atual.total += 1;
    m.set(chave, atual);
  }
  return [...m.values()].sort((a, b) => b.total - a.total).slice(0, max);
}

function media(ns: number[]): number | null {
  return ns.length ? Math.round(ns.reduce((a, b) => a + b, 0) / ns.length) : null;
}

export function resumir(registros: RegistroResumo[], dias: number, agora = new Date()): Resumo {
  const fim = agora;
  const inicio = new Date(agora.getTime() - dias * 864e5);
  const dentro = registros.filter((r) => {
    const t = Date.parse(r.quando);
    return !Number.isNaN(t) && t >= inicio.getTime() && t <= fim.getTime();
  });

  const episodios = dentro.filter((r) => r.tipo === "evento" && r.subtipo && EPISODIOS.has(r.subtipo));
  const crises = dentro.filter((r) => r.tipo === "evento" && r.subtipo === "crise");

  const semanas = new Map<string, { crises: number; minutos: number[] }>();
  for (let t = inicioDaSemana(inicio); t <= inicioDaSemana(fim); ) {
    semanas.set(t, { crises: 0, minutos: [] });
    const d = new Date(t);
    d.setDate(d.getDate() + 7);
    t = d.toISOString().slice(0, 10);
  }
  for (const c of crises) {
    const s = semanas.get(inicioDaSemana(new Date(c.quando)));
    if (!s) continue;
    s.crises += 1;
    const min = minutosDe(c.duracao);
    if (min !== null) s.minutos.push(min);
  }

  const faixas = new Map<string, number>(FAIXAS.map((f) => [f, 0]));
  const diasSemana = new Map<string, number>(DIAS.map((d) => [d, 0]));
  for (const e of episodios) {
    const d = new Date(e.quando);
    faixas.set(faixaDe(d), (faixas.get(faixaDe(d)) || 0) + 1);
    diasSemana.set(DIAS[d.getDay()], (diasSemana.get(DIAS[d.getDay()]) || 0) + 1);
  }

  const sono = dentro.filter((r) => r.tipo === "evento" && r.subtipo === "sono");
  const doses = dentro.filter((r) => r.tipo === "dose");
  const diasComDose = new Set(doses.filter((d) => d.subtipo === "dada").map((d) => d.quando.slice(0, 10)));

  const porTipo = new Map<string, number>();
  for (const e of dentro.filter((r) => r.tipo === "evento" && r.subtipo)) porTipo.set(e.subtipo!, (porTipo.get(e.subtipo!) || 0) + 1);

  return {
    dias,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    crises: {
      total: crises.length,
      duracao_media_min: media(crises.map((c) => minutosDe(c.duracao)).filter((m): m is number => m !== null)),
      por_semana: [...semanas].map(([semana, s]) => ({ semana, crises: s.crises, duracao_media_min: media(s.minutos) })),
    },
    faixas: [...faixas].map(([faixa, total]) => ({ faixa, total })),
    dias_da_semana: [...diasSemana].map(([dia, total]) => ({ dia, total })),
    gatilhos: contar(episodios.map((e) => e.gatilho)),
    ajudou: contar(episodios.map((e) => (e.dados?.ajudou as string | undefined) ?? null)),
    locais: contar(episodios.map((e) => e.local)).map((x) => ({ local: x.texto, total: x.total })),
    sono: { registros: sono.length, noites_agitadas: sono.filter((s) => (s.dados?.agitada as boolean) === true || (s.gatilho || "").length > 0).length },
    medicacao: { doses_dadas: doses.filter((d) => d.subtipo === "dada").length, doses_nao_dadas: doses.filter((d) => d.subtipo === "nao_dada").length, dias_com_dose: diasComDose.size },
    avancos: dentro.filter((r) => r.tipo === "evento" && r.subtipo === "avanco").length,
    calma: dentro.filter((r) => r.tipo === "evento" && r.subtipo === "calma").length,
    eventos_por_tipo: [...porTipo].map(([subtipo, total]) => ({ subtipo, total })).sort((a, b) => b.total - a.total),
  };
}
