export const SEGMENT_OPTIONS: Record<string, string> = {
  EI: "Educação Infantil",
  EF_AI: "Ensino Fundamental — Anos Iniciais",
  EF_AF: "Ensino Fundamental — Anos Finais",
  EM: "Ensino Médio",
};
export const ENGINE_OPTIONS: Record<string, string> = {
  red: "OmniRed (DeepSeek)",
  blue: "OmniBlue (Kimi)",
  green: "OmniGreen (Claude)",
  yellow: "OmniYellow (Gemini)",
  orange: "OmniOrange (OpenAI)",
};
export const MODULE_OPTIONS: Array<[string, string]> = [
  ["pei", "Estratégias & PEI"],
  ["paee", "Plano de Ação (AEE)"],
  ["hub", "Hub de Recursos"],
  ["diario", "Diário de Bordo"],
  ["avaliacao", "Evolução & Dados"],
];
export const FEED_CATEGORIES = [
  { value: "Novidade", label: "Novidade" },
  { value: "Dica", label: "Dica" },
  { value: "Atualização", label: "Atualização" },
  { value: "Tutorial", label: "Tutorial" },
  { value: "Evento", label: "Evento" },
  { value: "Comunidade", label: "Comunidade" }
];


export const COLOR_OPTIONS = [
  { key: "omnisfera", label: "Omnisfera (Sky Blue)", hex: "#0ea5e9" },
  { key: "pei", label: "PEI (Roxo)", hex: "#7c3aed" },
  { key: "paee", label: "PAEE (Rosa)", hex: "#e11d48" },
  { key: "hub", label: "Hub (Ciano)", hex: "#0891b2" },
  { key: "diario", label: "Diário (Verde)", hex: "#059669" },
  { key: "monitoramento", label: "Monitoramento (Teal)", hex: "#0d9488" },
  { key: "ferramentas", label: "Ferramentas (Azul)", hex: "#2563eb" },
  { key: "gestao", label: "Gestão (Índigo)", hex: "#6366f1" },
  { key: "cursos", label: "Config (Âmbar)", hex: "#d97706" },
  { key: "pgi", label: "PGI (Violeta)", hex: "#8b5cf6" },
  { key: "admin", label: "Admin (Slate)", hex: "#475569" },
];

export const DEFAULT_TOPBAR_ICONS = [
  "pei_simples", "paee_simples", "hub_simples", "diario_simples",
  "dados_simples", "central_inteligencia_simples", "pgi_simples",
  "gestao_usuario_simples", "estudantes_simples",
];


export const HOME_MODULES = [
  { key: "estudantes", title: "Estudantes", defaultColor: "omnisfera", defaultIcon: "estudantes_flat" },
  { key: "pei", title: "Estratégias & PEI", defaultColor: "pei", defaultIcon: "pei_flat" },
  { key: "pei-regente", title: "PEI - Professor", defaultColor: "monitoramento", defaultIcon: "pei_flat" },
  { key: "plano-curso", title: "Plano de Curso", defaultColor: "omnisfera", defaultIcon: "central_inteligencia_flat" },
  { key: "avaliacao-diagnostica", title: "Avaliação Diagnóstica", defaultColor: "ferramentas", defaultIcon: "avaliacao_diagnostica_flat" },
  { key: "avaliacao-processual", title: "Avaliação Processual", defaultColor: "diario", defaultIcon: "dados_flat" },
  { key: "paee", title: "Plano de Ação / PAEE", defaultColor: "paee", defaultIcon: "paee_flat" },
  { key: "hub", title: "Hub de Inclusão", defaultColor: "hub", defaultIcon: "hub_flat" },
  { key: "familia", title: "Família", defaultColor: "cursos", defaultIcon: "estudantes_flat" },
  { key: "diario", title: "Diário de Bordo", defaultColor: "diario", defaultIcon: "Diario_flat" },
  { key: "monitoramento", title: "Evolução & Dados", defaultColor: "monitoramento", defaultIcon: "dados_flat" },
  { key: "infos", title: "Central de Inteligência", defaultColor: "gestao", defaultIcon: "central_inteligencia_flat" },
  { key: "pgi", title: "PGI", defaultColor: "pgi", defaultIcon: "pgi_flat" },
  { key: "gestao", title: "Gestão de Usuários", defaultColor: "gestao", defaultIcon: "gestão_usuario_flat" },
  { key: "config-escola", title: "Configuração Escola", defaultColor: "cursos", defaultIcon: "configuracao_escola_flat" },
];

export const TOPBAR_NAV_ITEMS = [
  { key: "pei", defaultLabel: "PEI", defaultIcon: "pei_simples", defaultGroup: null },
  { key: "estudantes", defaultLabel: "Estudantes", defaultIcon: "estudantes_simples", defaultGroup: null },
  { key: "paee", defaultLabel: "PAEE ▼", defaultIcon: "paee_simples", defaultGroup: "paee" },
  { key: "hub", defaultLabel: "Hub", defaultIcon: "hub_simples", defaultGroup: "paee" },
  { key: "diario", defaultLabel: "Diário", defaultIcon: "diario_simples", defaultGroup: "paee" },
  { key: "avaliacoes", defaultLabel: "Avaliações ▼", defaultIcon: "dados_simples", defaultGroup: "avaliacoes" },
  { key: "avaliacao-diagnostica", defaultLabel: "Diagnóstica", defaultIcon: "dados_simples", defaultGroup: "avaliacoes" },
  { key: "avaliacao-processual", defaultLabel: "Processual", defaultIcon: "dados_simples", defaultGroup: "avaliacoes" },
  { key: "professor", defaultLabel: "Professor ▼", defaultIcon: "central_inteligencia_simples", defaultGroup: "professor" },
  { key: "pei-regente", defaultLabel: "PEI Professor", defaultIcon: "pei_simples", defaultGroup: "professor" },
  { key: "plano-curso", defaultLabel: "Plano de Curso", defaultIcon: "central_inteligencia_simples", defaultGroup: "professor" },
  { key: "monitoramento", defaultLabel: "Ev&Dados", defaultIcon: "dados_simples", defaultGroup: null },
  { key: "infos", defaultLabel: "Central", defaultIcon: "central_inteligencia_simples", defaultGroup: null },
  { key: "pgi", defaultLabel: "PGI", defaultIcon: "pgi_simples", defaultGroup: null },
  { key: "config", defaultLabel: "Config ▼", defaultIcon: "gestao_usuario_simples", defaultGroup: "config" },
  { key: "gestao", defaultLabel: "Gestão de Usuários", defaultIcon: "gestao_usuario_simples", defaultGroup: "config" },
  { key: "config-escola", defaultLabel: "Configuração Escola", defaultIcon: "gestao_usuario_simples", defaultGroup: "config" },
];
