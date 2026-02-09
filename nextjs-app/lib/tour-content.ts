/**
 * Tour content definitions for the Omnisfera guided tour wizard.
 * Each step has target text, position, and a description.
 */

export type TourStep = {
    id: string;
    title: string;
    description: string;
    /** CSS selector for the element to highlight */
    target?: string;
    icon: string;
};

export const TOUR_STEPS: TourStep[] = [
    {
        id: "welcome",
        title: "Bem-vindo ao Omnisfera!",
        description:
            "A plataforma inteligente para educação inclusiva. Vamos fazer um tour rápido pelas principais funcionalidades.",
        icon: "🌐",
    },
    {
        id: "pei",
        title: "PEI — Plano Educacional Individualizado",
        description:
            "Aqui você constrói o documento mais importante do estudante: o PEI. Preencha dados do estudante, barreiras, objetivos BNCC e peça à IA para gerar a consultoria pedagógica completa.",
        target: '[href="/pei"]',
        icon: "📋",
    },
    {
        id: "paee",
        title: "PAEE — Atendimento Educacional Especializado",
        description:
            "Planeje ciclos de atendimento, mapeie barreiras, defina plano de habilidades SMART, descubra tecnologias assistivas e gere jornadas gamificadas para o estudante.",
        target: '[href="/paee"]',
        icon: "🎯",
    },
    {
        id: "hub",
        title: "Hub — Central de Ferramentas Pedagógicas",
        description:
            "Crie atividades adaptadas, planos de aula DUA, roteiros individuais, dinâmicas inclusivas e imagens educacionais. Tudo com IA e personalizado para cada perfil.",
        target: '[href="/hub"]',
        icon: "🛠️",
    },
    {
        id: "diario",
        title: "Diário de Bordo",
        description:
            "Registre cada sessão de atendimento AEE: duração, atividades, engajamento e próximos passos. A IA analisa tendências a partir dos registros.",
        target: '[href="/diario"]',
        icon: "📓",
    },
    {
        id: "monitoramento",
        title: "Monitoramento & Rubricas",
        description:
            "Acompanhe a evolução do estudante ao longo do tempo com rubricas de desenvolvimento e gráficos de progresso.",
        target: '[href="/monitoramento"]',
        icon: "📊",
    },
    {
        id: "finish",
        title: "Pronto para começar!",
        description:
            "O fluxo recomendado é: primeiro crie o PEI do estudante, depois explore PAEE e Hub. Comece pelo menu Estudantes para cadastrar ou selecionar um aluno. Bom trabalho!",
        icon: "🚀",
    },
];

/**
 * Contextual help tooltips for specific fields across modules.
 * Maps fieldId → tooltip text.
 */
export const HELP_TOOLTIPS: Record<string, { title: string; text: string; example?: string }> = {
    // PEI fields
    "pei-diagnostico": {
        title: "Diagnóstico / CID",
        text: "Informe o diagnóstico principal do estudante conforme laudo médico. Você pode usar o leitor de PDF para extrair automaticamente.",
        example: "TEA (F84.0) — Transtorno do Espectro Autista, nível 1 de suporte",
    },
    "pei-hiperfoco": {
        title: "Hiperfoco / Interesses",
        text: "Os interesses especiais do estudante são fundamentais para engajamento. A IA usa esse dado para personalizar atividades e jornadas gamificadas.",
        example: "Dinossauros, Minecraft, astronomia",
    },
    "pei-barreiras": {
        title: "Barreiras para Aprendizagem",
        text: "Selecione as barreiras que dificultam a participação do estudante. Essas categorias seguem a NBR 9050 e a Política Nacional de Educação Especial (2008).",
    },
    "pei-objetivos": {
        title: "Objetivos BNCC",
        text: "Selecione as habilidades da BNCC que serão trabalhadas. O PEI alinha os objetivos individualizados com o currículo regular.",
    },
    "pei-consultoria": {
        title: "Consultoria IA",
        text: "A IA analisa todos os dados do PEI e gera uma consultoria pedagógica completa com estratégias, recursos e sugestões de intervenção.",
    },
    // PAEE fields
    "paee-ciclo": {
        title: "Ciclo de Atendimento",
        text: "Um ciclo é um período de planejamento com metas, cronograma e estratégias. Pode ser um ciclo de Planejamento (visão macro) ou Execução (metas SMART semanais).",
    },
    "paee-jornada": {
        title: "Jornada Gamificada",
        text: "Transforme o plano de atendimento em uma narrativa lúdica para engajar o estudante e a família. A IA cria missões, desafios e recompensas baseados no hiperfoco.",
    },
    // Hub fields
    "hub-bncc": {
        title: "Habilidades BNCC",
        text: "Selecione as habilidades BNCC para alinhar a atividade gerada ao currículo. A IA garantirá que o conteúdo esteja pedagogicamente fundamentado.",
    },
    "hub-dua": {
        title: "DUA — Desenho Universal para Aprendizagem",
        text: "O DUA oferece múltiplos meios de engajamento, representação e expressão. Todas as ferramentas do Hub aplicam esses princípios automaticamente.",
    },
    // Diário fields
    "diario-engajamento": {
        title: "Nível de Engajamento",
        text: "Avalie como o estudante participou da sessão. Esse dado é usado pela IA para identificar padrões ao longo do tempo.",
        example: "Alto / Médio / Baixo / Muito Baixo",
    },
};
