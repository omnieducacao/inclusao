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
  /** onda 108 (perfil de apoio): diário de leitura, palavras novas e marcos do desenvolvimento */
  leitura: { dias: number; minutos: number };
  palavras: number;
  marcos: { quando: string; texto: string | null }[];
  eventos_por_tipo: { subtipo: string; total: number }[];
  /**
   * onda 112: até três frases comparando com o período anterior de mesmo tamanho, só com números
   * ("Crises: 3 neste período e 5 no anterior."). Sem "melhorou" ou "piorou": quem avalia é o profissional.
   * Vazio quando o período anterior não tem registro.
   */
  o_que_mudou: string[];
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

type Contagem = { crises: number; duracao: number | null; agitadas: number; avancos: number; leitura: number; naoDadas: number; calma: number; palavras: number };

function contar_(lista: RegistroResumo[]): Contagem {
  const ev = (s: string) => lista.filter((r) => r.tipo === "evento" && r.subtipo === s);
  const crises = ev("crise");
  return {
    crises: crises.length,
    duracao: media(crises.map((c) => minutosDe(c.duracao)).filter((m): m is number => m !== null)),
    agitadas: ev("sono").filter((s) => (s.dados?.agitada as boolean) === true || (s.gatilho || "").length > 0).length,
    avancos: ev("avanco").length,
    leitura: ev("leitura").reduce((t, r) => t + (Number(r.dados?.minutos) || 0), 0),
    naoDadas: lista.filter((r) => r.tipo === "dose" && r.subtipo === "nao_dada").length,
    calma: ev("calma").length,
    palavras: ev("palavra").length,
  };
}

/** As três maiores diferenças entre o período e o anterior, em frases só com números. */
export function oQueMudou(atual: RegistroResumo[], anterior: RegistroResumo[]): string[] {
  if (!anterior.length || !atual.length) return [];
  const a = contar_(atual);
  const p = contar_(anterior);
  const linhas: { peso: number; frase: string }[] = [];
  // o peso é a diferença relativa, com menos peso para números pequenos (1 contra 0 não é notícia);
  // as crises vêm sempre primeiro quando mudaram, porque é o que a família e o médico olham primeiro
  const comparar = (agora: number, antes: number, frase: (x: number, y: number) => string, extra = 0) => {
    if (agora === antes) return;
    const maior = Math.max(agora, antes, 1);
    linhas.push({ peso: (Math.abs(agora - antes) / maior) * Math.min(1, maior / 4) + extra, frase: frase(agora, antes) });
  };
  comparar(a.crises, p.crises, (x, y) => `Crises: ${x} neste período e ${y} no anterior.`, 1);
  if (a.duracao !== null && p.duracao !== null) comparar(a.duracao, p.duracao, (x, y) => `Duração média das crises: ${x} min neste período e ${y} min no anterior.`);
  comparar(a.agitadas, p.agitadas, (x, y) => `Noites agitadas: ${x} neste período e ${y} no anterior.`);
  comparar(a.avancos, p.avancos, (x, y) => `Avanços registrados: ${x} neste período e ${y} no anterior.`);
  comparar(a.leitura, p.leitura, (x, y) => `Leitura: ${x} minutos neste período e ${y} no anterior.`);
  comparar(a.naoDadas, p.naoDadas, (x, y) => `Doses não dadas: ${x} neste período e ${y} no anterior.`);
  comparar(a.calma, p.calma, (x, y) => `Momentos de calma registrados: ${x} neste período e ${y} no anterior.`);
  comparar(a.palavras, p.palavras, (x, y) => `Palavras novas: ${x} neste período e ${y} no anterior.`);
  return linhas.sort((x, y) => y.peso - x.peso).slice(0, 3).map((l) => l.frase);
}

export function resumir(todos: RegistroResumo[], dias: number, agora = new Date()): Resumo {
  const fim = agora;
  const inicio = new Date(agora.getTime() - dias * 864e5);
  const antesDe = inicio.getTime() - dias * 864e5;
  // as perguntas para a consulta (onda 112) são da família e não entram nas contas
  const registros = todos.filter((r) => r.subtipo !== "pergunta");
  const dentro = registros.filter((r) => {
    const t = Date.parse(r.quando);
    return !Number.isNaN(t) && t >= inicio.getTime() && t <= fim.getTime();
  });
  const anterior = registros.filter((r) => {
    const t = Date.parse(r.quando);
    return !Number.isNaN(t) && t >= antesDe && t < inicio.getTime();
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
    leitura: {
      dias: new Set(dentro.filter((r) => r.tipo === "evento" && r.subtipo === "leitura").map((r) => r.quando.slice(0, 10))).size,
      minutos: dentro.filter((r) => r.tipo === "evento" && r.subtipo === "leitura").reduce((t, r) => t + (Number(r.dados?.minutos) || 0), 0),
    },
    palavras: dentro.filter((r) => r.tipo === "evento" && r.subtipo === "palavra").length,
    marcos: dentro.filter((r) => r.tipo === "evento" && r.subtipo === "marco").map((r) => ({ quando: r.quando, texto: (r.dados?.marco as string | undefined) ?? null })).slice(0, 20),
    eventos_por_tipo: [...porTipo].map(([subtipo, total]) => ({ subtipo, total })).sort((a, b) => b.total - a.total),
    o_que_mudou: oQueMudou(dentro, anterior),
  };
}
