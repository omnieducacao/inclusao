/**
 * PAEE - Plano de Atendimento Educacional Especializado
 * Tipos e funções para ciclos, metas e acompanhamento.
 */

export type MetaPei = {
  id: string;
  tipo: string;
  descricao: string;
  prioridade?: string;
  selecionada?: boolean;
};

export type ConfigCiclo = {
  duracao_semanas?: number;
  frequencia?: string;
  foco_principal?: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  metas_selecionadas?: MetaPei[];
  desdobramento_smart_texto?: string;
};

export type CronogramaSemana = {
  numero: number;
  tema: string;
  objetivo: string;
  atividades: string[];
  recursos?: string[];
  avaliacao?: string;
};

export type CronogramaFase = {
  nome: string;
  descricao: string;
  semanas: number[];
  objetivo_geral: string;
};

export type Cronograma = {
  fases: CronogramaFase[];
  semanas: CronogramaSemana[];
};

export type CicloPAEE = {
  ciclo_id?: string;
  status: "rascunho" | "ativo" | "concluido" | "arquivado";
  tipo: "planejamento_aee" | "execucao_smart";
  config_ciclo?: ConfigCiclo;
  recursos_incorporados?: Record<string, { resumo: string; completo?: string; data_incorporacao?: string }>;
  cronograma?: Cronograma;
  criado_em?: string;
  criado_por?: string;
  atualizado_em?: string;
  versao?: number;
};

const MARKERS = [
  "Meta:",
  "meta:",
  "Objetivo:",
  "objetivo:",
  "Habilidade:",
  "habilidade:",
  "- ",
  "* ",
];

/** Extrai metas estruturadas do pei_data (compatível com Streamlit). */
export function extrairMetasDoPei(peiData: Record<string, unknown> | null): MetaPei[] {
  if (!peiData) return [];

  if (Array.isArray(peiData.metas)) {
    return peiData.metas as MetaPei[];
  }

  let texto = "";
  if (typeof peiData.ia_sugestao === "string") {
    texto = peiData.ia_sugestao;
  } else if (typeof peiData === "object") {
    texto = JSON.stringify(peiData);
  }

  const metas: MetaPei[] = [];
  const linhas = texto.split("\n");

  for (const linha of linhas) {
    let linhaLimpa = linha.trim();
    if (!linhaLimpa) continue;

    const hasMarker = MARKERS.some((m) => linhaLimpa.toLowerCase().includes(m.toLowerCase()));
    if (!hasMarker) continue;

    for (const m of MARKERS) {
      if (linhaLimpa.toLowerCase().startsWith(m.toLowerCase())) {
        linhaLimpa = linhaLimpa.slice(m.length).trim();
        break;
      }
    }

    if (linhaLimpa.length < 6) continue;

    let tipo = "GERAL";
    const lower = linhaLimpa.toLowerCase();
    if (lower.includes("social")) tipo = "HABILIDADES SOCIAIS";
    else if (lower.includes("comunicação") || lower.includes("comunicacao")) tipo = "COMUNICAÇÃO";
    else if (lower.includes("leitura") || lower.includes("escrita") || lower.includes("matemática")) tipo = "ACADÊMICO";
    else if (lower.includes("motor")) tipo = "MOTOR";
    else if (lower.includes("autonomia")) tipo = "AUTONOMIA";

    metas.push({
      id: `meta_${String(metas.length + 1).padStart(3, "0")}`,
      tipo,
      descricao: linhaLimpa.slice(0, 200),
      prioridade: "media",
      selecionada: true,
    });
  }

  if (metas.length === 0) {
    metas.push({
      id: "meta_001",
      tipo: "DESENVOLVIMENTO",
      descricao: "Desenvolver habilidades específicas conforme necessidades identificadas no PEI",
      prioridade: "alta",
      selecionada: true,
    });
  }

  return metas.slice(0, 10);
}

/** Cria cronograma básico sem IA (compatível com Streamlit). */
export function criarCronogramaBasico(
  semanas: number,
  metas: MetaPei[]
): Cronograma {
  const cronograma: Cronograma = {
    fases: [
      {
        nome: "Fase 1: Avaliação e Adaptação",
        descricao: "Período inicial de avaliação e adaptação das estratégias",
        semanas: Array.from({ length: Math.min(4, semanas) }, (_, i) => i + 1),
        objetivo_geral: "Estabelecer rotina e avaliar necessidades imediatas",
      },
    ],
    semanas: [],
  };

  if (semanas > 4) {
    cronograma.fases.push({
      nome: "Fase 2: Desenvolvimento",
      descricao: "Desenvolvimento intensivo das habilidades alvo",
      semanas: Array.from({ length: Math.min(4, semanas - 4) }, (_, i) => i + 5),
      objetivo_geral: "Desenvolver habilidades específicas",
    });
  }
  if (semanas > 8) {
    cronograma.fases.push({
      nome: "Fase 3: Consolidação",
      descricao: "Consolidação e generalização das habilidades",
      semanas: Array.from({ length: semanas - 8 }, (_, i) => i + 9),
      objetivo_geral: "Generalizar habilidades para outros contextos",
    });
  }

  for (let s = 1; s <= semanas; s++) {
    cronograma.semanas.push({
      numero: s,
      tema: `Semana ${s}: Desenvolvimento de habilidades`,
      objetivo: "Avançar nas metas estabelecidas",
      atividades: ["Atividades personalizadas conforme plano"],
      recursos: ["Materiais adaptados", "Recursos visuais"],
      avaliacao: "Observação direta e registros",
    });
  }

  return cronograma;
}

export const FREQUENCIAS = ["1x_semana", "2x_semana", "3x_semana", "diario"] as const;

export function fmtDataIso(d: string | undefined): string {
  if (!d) return "-";
  try {
    const date = new Date(String(d).replace("Z", "+00:00"));
    return date.toLocaleDateString("pt-BR");
  } catch { /* expected fallback */
    return String(d);
  }
}

export function badgeStatus(
  status: string
): [string, string] {
  const s = (status || "rascunho").toLowerCase();
  const map: Record<string, [string, string]> = {
    rascunho: ["🟡", "#F59E0B"],
    ativo: ["🟢", "#10B981"],
    concluido: ["🔵", "#3B82F6"],
    arquivado: ["⚫", "#64748B"],
  };
  return map[s] ?? ["⚪", "#94A3B8"];
}
