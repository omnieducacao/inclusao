/**
 * Estudo de caso, vigência e revisões do PEI (onda 2 · fluxo do estudante).
 *
 * Base legal (textos em omnisfera.net/lei):
 * - Decreto 12.686/2025: o estudo de caso é a etapa inicial, em quatro passos —
 *   demandas e barreiras; contexto; potencialidades e apoios; estratégias e recursos.
 *   Nenhum laudo pode ser exigido.
 * - Decreto 12.773/2025: PEI e PAEE derivam do estudo de caso; a necessidade de profissional
 *   de apoio é definida no estudo de caso.
 * - Portaria MEC 421/2026: um documento único pode cumprir as duas funções, com revisão anual.
 *
 * Tudo mora dentro de students.pei_data (estudo_caso, vigencia, revisoes), para seguir o mesmo
 * salvamento, histórico de versões e criptografia do PEI. Só a ciência dos professores fica numa
 * tabela própria (pei_ciencias), porque é gravada por outra pessoa ao mesmo tempo.
 */

export type SimNaoAvaliar = "sim" | "nao" | "avaliar";

export type EstudoCaso = {
  /** quando a conversa aconteceu e quem participou */
  data?: string;
  participantes?: string[];
  participantes_outros?: string;
  /** Passo 1 */
  demandas?: string;
  /** Passo 2 */
  contexto_escolar?: string;
  /** Passo 3 — apoios definidos no estudo de caso */
  necessita_aee?: SimNaoAvaliar;
  necessita_profissional_apoio?: SimNaoAvaliar;
  justificativa_apoio?: string;
  /** Passo 4 */
  recursos?: string;
  conclusao?: string;
  concluido_em?: string | null;
};

export type Periodicidade = "bimestral" | "semestral" | "anual";

export type Vigencia = {
  status: "rascunho" | "vigente" | "em_revisao";
  versao: number;
  vigente_desde?: string;
  proxima_revisao?: string;
  periodicidade?: Periodicidade;
  fechado_por?: string;
};

export type Revisao = {
  data: string;
  autor?: string;
  avancos?: string;
  ajustes?: string;
  decisao: "manter" | "ajustar" | "novo_estudo";
};

export const PARTICIPANTES = [
  "Coordenação",
  "Direção",
  "Professor(a) regente",
  "Professores dos componentes",
  "Professor(a) do AEE",
  "Profissional de apoio",
  "Família",
  "O próprio estudante",
  "Profissionais externos",
];

export const PASSOS_ESTUDO_CASO = [
  {
    id: 1,
    titulo: "Demandas e barreiras",
    pergunta: "O que a escola observa e o que dificulta a participação e a aprendizagem?",
  },
  {
    id: 2,
    titulo: "Contexto",
    pergunta: "Como é a vida escolar, familiar e o histórico do estudante? Quem já acompanha?",
  },
  {
    id: 3,
    titulo: "Potencialidades e apoios",
    pergunta: "No que o estudante se sai bem e de que apoios precisa (AEE, profissional de apoio)?",
  },
  {
    id: 4,
    titulo: "Estratégias e recursos",
    pergunta: "O que a escola vai fazer: acesso, ensino, avaliação e recursos.",
  },
] as const;

export const PERIODICIDADES: Array<{ id: Periodicidade; nome: string; meses: number }> = [
  { id: "bimestral", nome: "A cada bimestre", meses: 2 },
  { id: "semestral", nome: "A cada semestre", meses: 6 },
  { id: "anual", nome: "Uma vez por ano", meses: 12 },
];

export const DECISOES_REVISAO: Array<{ id: Revisao["decisao"]; nome: string }> = [
  { id: "manter", nome: "Manter o PEI como está" },
  { id: "ajustar", nome: "Ajustar o PEI" },
  { id: "novo_estudo", nome: "Refazer o estudo de caso" },
];

function preenchido(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.values(v as Record<string, unknown>).some(preenchido);
  return true;
}

/** Quais passos do estudo de caso já têm o mínimo preenchido (usa também os campos do PEI). */
export function passosConcluidos(pei: Record<string, unknown>): Record<1 | 2 | 3 | 4, boolean> {
  const ec = (pei.estudo_caso || {}) as EstudoCaso;
  const barreiras = (pei.barreiras_selecionadas || {}) as Record<string, string[]>;
  const temBarreira = Object.values(barreiras).some((a) => Array.isArray(a) && a.length > 0);
  const temEvidencia = Object.values((pei.checklist_evidencias || {}) as Record<string, boolean>).some(Boolean);
  return {
    1: preenchido(ec.demandas) && (temBarreira || temEvidencia),
    2: preenchido(ec.contexto_escolar) || preenchido(pei.historico) || preenchido(pei.familia),
    3: (preenchido(pei.potencias) || preenchido(pei.hiperfoco)) && preenchido(ec.necessita_profissional_apoio),
    4:
      preenchido(pei.estrategias_acesso) || preenchido(pei.estrategias_ensino) || preenchido(pei.estrategias_avaliacao),
  };
}

export function estudoCasoCompleto(pei: Record<string, unknown>): boolean {
  const p = passosConcluidos(pei);
  return p[1] && p[2] && p[3] && p[4];
}

/** Data ISO (aaaa-mm-dd) somando meses. */
export function somarMeses(dataIso: string, meses: number): string {
  const d = new Date(`${dataIso}T12:00:00`);
  d.setMonth(d.getMonth() + meses);
  return d.toISOString().slice(0, 10);
}

export function hojeIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function revisaoVencida(vig: Vigencia | undefined | null, hoje = hojeIso()): boolean {
  return Boolean(vig && vig.status === "vigente" && vig.proxima_revisao && vig.proxima_revisao < hoje);
}

/** Texto do estudo de caso para a IA montar o PEI a partir dele (sem nomes de pessoas). */
export function estudoCasoParaPrompt(ec: EstudoCaso | undefined | null): string {
  if (!ec || !preenchido(ec)) return "";
  const rot = (v?: SimNaoAvaliar) => (v === "sim" ? "sim" : v === "nao" ? "não" : v === "avaliar" ? "a avaliar" : "não definido");
  const linhas = [
    "[ESTUDO DE CASO (Decreto 12.686/2025) — o PEI deve derivar destas conclusões]",
    ec.demandas ? `DEMANDAS OBSERVADAS: ${ec.demandas.slice(0, 800)}` : "",
    ec.contexto_escolar ? `CONTEXTO ESCOLAR: ${ec.contexto_escolar.slice(0, 600)}` : "",
    `NECESSITA AEE: ${rot(ec.necessita_aee)} | NECESSITA PROFISSIONAL DE APOIO: ${rot(ec.necessita_profissional_apoio)}`,
    ec.justificativa_apoio ? `JUSTIFICATIVA DOS APOIOS: ${ec.justificativa_apoio.slice(0, 500)}` : "",
    ec.recursos ? `RECURSOS DEFINIDOS: ${ec.recursos.slice(0, 500)}` : "",
    ec.conclusao ? `CONCLUSÃO DA EQUIPE: ${ec.conclusao.slice(0, 800)}` : "",
    "[/ESTUDO DE CASO]",
  ];
  return linhas.filter(Boolean).join("\n");
}
