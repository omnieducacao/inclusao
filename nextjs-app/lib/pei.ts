/**
 * Tipos e funções para pei_data (PEI - Plano de Ensino Individualizado)
 * Estrutura compatível com o Streamlit.
 */
export type PEIData = {
  nome?: string;
  nasc?: string;
  serie?: string | null;
  turma?: string;
  diagnostico?: string;
  lista_medicamentos?: { nome: string; posologia?: string; escola?: boolean }[];
  composicao_familiar_tags?: string[];
  historico?: string;
  familia?: string;
  hiperfoco?: string;
  potencias?: string[];
  rede_apoio?: string[];
  orientacoes_especialistas?: string;
  orientacoes_por_profissional?: Record<string, string>;
  checklist_evidencias?: Record<string, boolean>;
  nivel_alfabetizacao?: string;
  barreiras_selecionadas?: Record<string, string[]>;
  niveis_suporte?: Record<string, string>;
  observacoes_barreiras?: Record<string, string>;
  estrategias_acesso?: string[];
  estrategias_ensino?: string[];
  estrategias_avaliacao?: string[];
  ia_sugestao?: string;
  consultoria_engine?: string;
  ia_mapa_texto?: string;
  outros_acesso?: string;
  outros_ensino?: string;
  monitoramento_data?: string;
  status_meta?: string;
  parecer_geral?: string;
  proximos_passos_select?: string[];
  status_validacao_pei?: string;
  feedback_ajuste?: string;
  status_validacao_game?: string;
  feedback_ajuste_game?: string;
  matricula?: string;
  habilidades_bncc_selecionadas?: unknown[];
  habilidades_bncc_validadas?: unknown[] | null;
  bncc_ei_idade?: string;
  bncc_ei_campo?: string;
  bncc_ei_objetivos?: string[];
  [key: string]: unknown;
};

// --- SÉRIES ---
export const SERIES_EF_EM = [
  "1º Ano (EFAI)", "2º Ano (EFAI)", "3º Ano (EFAI)", "4º Ano (EFAI)", "5º Ano (EFAI)",
  "6º Ano (EFAF)", "7º Ano (EFAF)", "8º Ano (EFAF)", "9º Ano (EFAF)",
  "1ª Série (EM)", "2ª Série (EM)", "3ª Série (EM)", "EJA (Educação de Jovens e Adultos)",
];

export const SERIES_EI = [
  "Educação Infantil (0-2 anos)",
  "Educação Infantil (3-5 anos)",
  "Educação Infantil (2 anos)",
  "Educação Infantil (3 anos)",
  "Educação Infantil (4 anos)",
  "Educação Infantil (5 anos)",
];

export const SERIES = [...SERIES_EI, ...SERIES_EF_EM];

// --- ALFABETIZAÇÃO (Emília Ferreiro) ---
export const LISTA_ALFABETIZACAO = [
  "Não se aplica (Educação Infantil)",
  "Pré-Silábico (Garatuja/Desenho sem letras)",
  "Pré-Silábico (Letras aleatórias sem valor sonoro)",
  "Silábico (Sem valor sonoro convencional)",
  "Silábico (Com valor sonoro vogais/consoantes)",
  "Silábico-Alfabético (Transição)",
  "Alfabético (Escrita fonética, com erros ortográficos)",
  "Ortográfico (Escrita convencional consolidada)",
];

// --- BARREIRAS (por domínio) ---
export const LISTAS_BARREIRAS: Record<string, string[]> = {
  "Funções Cognitivas": ["Atenção Sustentada/Focada", "Memória de Trabalho (Operacional)", "Flexibilidade Mental", "Planejamento e Organização", "Velocidade de Processamento", "Abstração e Generalização"],
  "Comunicação e Linguagem": ["Linguagem Expressiva (Fala)", "Linguagem Receptiva (Compreensão)", "Pragmática (Uso social da língua)", "Processamento Auditivo", "Intenção Comunicativa"],
  "Socioemocional": ["Regulação Emocional (Autocontrole)", "Tolerância à Frustração", "Interação Social com Pares", "Autoestima e Autoimagem", "Reconhecimento de Emoções"],
  "Sensorial e Motor": ["Praxias Globais (Coordenação Grossa)", "Praxias Finas (Coordenação Fina)", "Hipersensibilidade Sensorial", "Hipossensibilidade (Busca Sensorial)", "Planejamento Motor"],
  "Acadêmico": ["Decodificação Leitora", "Compreensão Textual", "Raciocínio Lógico-Matemático", "Grafomotricidade (Escrita manual)", "Produção Textual"],
};

// --- POTENCIALIDADES ---
export const LISTA_POTENCIAS = [
  "Memória Visual", "Musicalidade/Ritmo", "Interesse em Tecnologia", "Hiperfoco Construtivo",
  "Liderança Natural", "Habilidades Cinestésicas (Esportes)", "Expressão Artística (Desenho)",
  "Cálculo Mental Rápido", "Oralidade/Vocabulário", "Criatividade/Imaginação",
  "Empatia/Cuidado com o outro", "Resolução de Problemas", "Curiosidade Investigativa",
];

// --- REDE DE APOIO (profissionais) ---
export const LISTA_PROFISSIONAIS = [
  "Psicólogo Clínico", "Neuropsicólogo", "Fonoaudiólogo", "Terapeuta Ocupacional",
  "Neuropediatra", "Psiquiatra Infantil", "Psicopedagogo Clínico", "Professor de Apoio (Mediador)",
  "Acompanhante Terapêutico (AT)", "Musicoterapeuta", "Equoterapeuta", "Oftalmologista",
];

// --- COMPOSIÇÃO FAMILIAR ---
export const LISTA_FAMILIA = [
  "Mãe", "Mãe 2", "Pai", "Pai 2", "Madrasta", "Padrasto",
  "Avó Materna", "Avó Paterna", "Avô Materno", "Avô Paterno",
  "Irmãos", "Tios", "Primos", "Tutor Legal", "Abrigo Institucional",
];

// --- EVIDÊNCIAS (checklist labels) ---
export const EVIDENCIAS_PEDAGOGICO = [
  "Estagnação na aprendizagem", "Lacuna em pré-requisitos",
  "Dificuldade de generalização", "Dificuldade de abstração",
];
export const EVIDENCIAS_COGNITIVO = [
  "Oscilação de foco", "Fadiga mental rápida",
  "Dificuldade de iniciar tarefas", "Esquecimento recorrente",
];
export const EVIDENCIAS_COMPORTAMENTAL = [
  "Dependência de mediação (1:1)", "Baixa tolerância à frustração",
  "Desorganização de materiais", "Recusa de tarefas",
];

// --- ESTRATÉGIAS ---
export const ESTRATEGIAS_ACESSO = [
  "Tempo Estendido", "Apoio Leitura/Escrita", "Material Ampliado", "Tecnologia Assistiva",
  "Sala Silenciosa", "Mobiliário Adaptado", "Pistas Visuais", "Rotina Estruturada",
];
export const ESTRATEGIAS_ENSINO = [
  "Fragmentação de Tarefas", "Instrução Explícita", "Modelagem", "Mapas Mentais",
  "Andaimagem (Scaffolding)", "Ensino Híbrido", "Organizadores Gráficos", "Prática Guiada",
];
export const ESTRATEGIAS_AVALIACAO = [
  "Prova Adaptada", "Prova Oral", "Consulta Permitida", "Portfólio",
  "Autoavaliação", "Parecer Descritivo", "Questões Menores por Bloco", "Avaliação Prática (Demonstração)",
];

// --- NÍVEIS DE SUPORTE ---
export const NIVEIS_SUPORTE = ["Autônomo", "Monitorado", "Substancial", "Muito Substancial"];

// --- MONITORAMENTO ---
export const STATUS_META = ["Não Iniciado", "Em Andamento", "Parcialmente Atingido", "Atingido", "Superado"];
export const PARECER_GERAL = [
  "Manter Estratégias", "Aumentar Suporte", "Reduzir Suporte (Autonomia)",
  "Alterar Metodologia", "Encaminhar para Especialista",
];
export const PROXIMOS_PASSOS = [
  "Reunião com Família", "Encaminhamento Clínico", "Adaptação de Material",
  "Mudança de Lugar em Sala", "Novo PEI", "Observação em Sala",
];

/** Detecta EI, EF ou EM a partir da série (client-safe, sem fs). */
export function detectarNivelEnsino(
  serie: string
): "EI" | "EF" | "EM" | "" {
  if (!serie) return "";
  const s = serie.toLowerCase();
  if (s.includes("infantil")) return "EI";
  if (
    s.includes("série") ||
    s.includes("em") ||
    s.includes("médio") ||
    s.includes("eja")
  )
    return "EM";
  return "EF";
}
