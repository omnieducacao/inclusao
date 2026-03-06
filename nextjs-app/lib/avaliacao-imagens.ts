/**
 * Mapeamento de barreiras cognitivas para tipos de imagem
 * Baseado em protocolos de avaliação inclusiva e no PEI do Omnisfera
 *
 * Campos de referência do PEI:
 * - barreiras_selecionadas (Record por domínio)
 * - niveis_suporte (Record por domínio)
 * - diagnostico
 */

// ── Tipos de suporte visual por barreira ────────────────────────

export type TipoImagemBarreira =
    | "sequencia"      // Sequência de imagens mostrando causa-efeito ou ordem
    | "comparacao"     // Duas imagens lado a lado com diferença destacada
    | "organizacao"    // Organizador visual com caixas numeradas e setas
    | "concreto"       // Objeto concreto, realista, isolado
    | "simbolico"      // Símbolos visuais representando conceitos
    | "grafico"        // Gráfico de barras, pizza, linha
    | "mapa"           // Mapa geográfico ou conceitual
    | "diagrama"       // Diagrama de fluxo ou estrutural
    | "tabela"         // Tabela com dados
    | "ilustracao"     // Ilustração de cenário/contexto
    | "fotografia";    // Foto realista de cenário

export interface ImagemBarreiraConfig {
    tipo: TipoImagemBarreira;
    descricaoPrompt: string;
    exemplo: string;
    prioridadeVisual: "obrigatoria" | "recomendada" | "opcional";
}

// ── Mapeamento por perfil NEE + tipo de barreira ────────────────

export const MAPEAMENTO_IMAGEM_BARREIRA: Record<string, ImagemBarreiraConfig> = {
    // ─── TEA ──────────────────────────────────────────────────────

    "tea_inferencia": {
        tipo: "sequencia",
        descricaoPrompt: "Sequência de 3-4 imagens mostrando causa-efeito ou ordem lógica. Sem texto nas imagens. Estilo claro, ilustração infantil com fundo limpo. Cada cena deve ser autoexplicativa.",
        exemplo: "semente → broto → flor → fruto",
        prioridadeVisual: "obrigatoria",
    },

    "tea_abstracao": {
        tipo: "concreto",
        descricaoPrompt: "Objeto concreto, realista, isolado em fundo branco. Sem texto. Foto ou ilustração realista com detalhes claros. Evitar estilizações artísticas.",
        exemplo: "maçã realista, não desenho estilizado",
        prioridadeVisual: "obrigatoria",
    },

    "tea_comunicacao": {
        tipo: "simbolico",
        descricaoPrompt: "Símbolos visuais de comunicação alternativa (CAA). Ícones claros e universais representando ações ou conceitos. Estilo pictograma. Sem ambiguidade visual.",
        exemplo: "pictograma de pessoa + seta + escola = 'ir para a escola'",
        prioridadeVisual: "obrigatoria",
    },

    "tea_organizacao": {
        tipo: "organizacao",
        descricaoPrompt: "Organizador visual com 2-3 caixas numeradas, setas claras de direção. Cores distintas por etapa (azul→verde→amarelo). Fundo branco, sem distrações.",
        exemplo: "Passo 1 (azul) → Passo 2 (verde) → Passo 3 (amarelo)",
        prioridadeVisual: "recomendada",
    },

    // ─── DI (Deficiência Intelectual) ─────────────────────────────

    "di_memoria_trabalho": {
        tipo: "organizacao",
        descricaoPrompt: "Organizador visual SIMPLES com 2-3 caixas numeradas, setas claras. Cores muito distintas por etapa. Números grandes e visíveis. Máximo 3 elementos.",
        exemplo: "caixa 1 (azul) → seta grande → caixa 2 (verde)",
        prioridadeVisual: "obrigatoria",
    },

    "di_abstracao": {
        tipo: "concreto",
        descricaoPrompt: "Objeto concreto do cotidiano do estudante. Foto ou ilustração realista, isolada em fundo branco. Tamanho grande, detalhes visíveis. Sem estilização.",
        exemplo: "lápis real, caderno real, moeda real",
        prioridadeVisual: "obrigatoria",
    },

    "di_planejamento": {
        tipo: "sequencia",
        descricaoPrompt: "Sequência de 2-3 imagens com números grandes mostrando ordem de ações simples. Fundo limpo, elementos grandes e claros. Estilo ilustração infantil.",
        exemplo: "1: pegar o lápis → 2: escrever → 3: guardar",
        prioridadeVisual: "recomendada",
    },

    // ─── TA - Dislexia ────────────────────────────────────────────

    "ta_dislexia_leitura": {
        tipo: "simbolico",
        descricaoPrompt: "Símbolos visuais que representam conceitos sem depender de texto. Ícones claros e universais. Alto contraste. NENHUMA palavra dentro da imagem.",
        exemplo: "ícone de livro + seta + ícone de lâmpada = 'ler e entender'",
        prioridadeVisual: "recomendada",
    },

    "ta_dislexia_fonologica": {
        tipo: "comparacao",
        descricaoPrompt: "Duas imagens lado a lado com elemento em DESTAQUE vermelho ou amarelo mostrando diferença entre dois conceitos sonoros. Alto contraste, fundo limpo.",
        exemplo: "PATO (com img) vs BATO (com img) — destacar a diferença",
        prioridadeVisual: "recomendada",
    },

    // ─── TA - TDAH ────────────────────────────────────────────────

    "ta_tdah_atencao": {
        tipo: "comparacao",
        descricaoPrompt: "Imagem ÚNICA com um elemento principal DESTACADO em borda vermelha ou amarela brilhante. Fundo limpo com contraste alto. Poucos elementos — máximo 3 objetos. O elemento importante deve ser ÓBVIO.",
        exemplo: "3 objetos, 1 circulado em vermelho brilhante",
        prioridadeVisual: "recomendada",
    },

    "ta_tdah_organizacao": {
        tipo: "organizacao",
        descricaoPrompt: "Checklist visual com ícones coloridos. Máximo 3 itens. Cada item com ícone + cor distinta. Sem texto. Numeração grande (1, 2, 3).",
        exemplo: "1:📘 → 2:✏️ → 3:📝 (ícones grandes e coloridos)",
        prioridadeVisual: "recomendada",
    },

    // ─── TA - Discalculia ────────────────────────────────────────

    "ta_discalculia": {
        tipo: "concreto",
        descricaoPrompt: "Objetos concretos contáveis dispostos em agrupamentos claros. Fundo branco. Objetos do cotidiano (frutas, blocos, moedas). Agrupamentos visuais óbvios.",
        exemplo: "3 maçãs + 2 maçãs = agrupamentos separados por espaço",
        prioridadeVisual: "recomendada",
    },

    // ─── Genérico (sem barreira específica) ───────────────────────

    "generico_grafico": {
        tipo: "grafico",
        descricaoPrompt: "Gráfico de barras ou pizza simples e claro. Sem excesso de informação. Cores contrastantes. Legenda integrada. Fonte grande.",
        exemplo: "gráfico de barras com 3-4 barras coloridas e legenda",
        prioridadeVisual: "opcional",
    },

    "generico_mapa": {
        tipo: "mapa",
        descricaoPrompt: "Mapa simplificado com poucos elementos. Cores de alto contraste. Legenda clara. Sem excesso de detalhes geográficos.",
        exemplo: "mapa do Brasil com regiões coloridas",
        prioridadeVisual: "opcional",
    },
};

// ── Função de decisão: perfil + barreiras → tipo de imagem ──────

export interface DecisaoImagem {
    necessario: boolean;
    tipo?: TipoImagemBarreira;
    descricaoPrompt?: string;
    justificativa: string;
    prioridadeVisual: "obrigatoria" | "recomendada" | "opcional" | "desnecessaria";
    configKey?: string;
}

/**
 * Determina o tipo de imagem necessária baseado no perfil NEE,
 * barreiras ativas do PEI e habilidade BNCC.
 */
export function determinarTipoImagem(params: {
    perfilNEE: string;
    barreirasAtivas?: Record<string, boolean>;
    habilidadeCodigo?: string;
    habilidadeDescricao?: string;
}): DecisaoImagem {
    const { perfilNEE, barreirasAtivas, habilidadeDescricao } = params;
    const perfil = perfilNEE.toUpperCase();
    const hab = (habilidadeDescricao || "").toLowerCase();

    // Habilidades que SEMPRE precisam de imagem (independente do perfil)
    const habExigeImagem =
        hab.includes("gráfico") ||
        hab.includes("grafico") ||
        hab.includes("mapa") ||
        hab.includes("tabela") ||
        hab.includes("diagrama") ||
        hab.includes("figura") ||
        hab.includes("imagem") ||
        hab.includes("observ") ||
        hab.includes("interpret") && (hab.includes("visual") || hab.includes("dado"));

    // ── TEA: imagem OBRIGATÓRIA em todas ──────────────────────
    if (perfil === "TEA") {
        // Verificar barreiras específicas
        if (barreirasAtivas?.["Abstração e Generalização"]) {
            const cfg = MAPEAMENTO_IMAGEM_BARREIRA["tea_abstracao"];
            return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "TEA com barreira de abstração — objeto concreto obrigatório", prioridadeVisual: "obrigatoria", configKey: "tea_abstracao" };
        }
        if (barreirasAtivas?.["Linguagem Receptiva"] || barreirasAtivas?.["Processamento Auditivo"]) {
            const cfg = MAPEAMENTO_IMAGEM_BARREIRA["tea_comunicacao"];
            return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "TEA com barreira de comunicação — suporte visual CAA", prioridadeVisual: "obrigatoria", configKey: "tea_comunicacao" };
        }
        if (barreirasAtivas?.["Planejamento e Organização"]) {
            const cfg = MAPEAMENTO_IMAGEM_BARREIRA["tea_organizacao"];
            return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "TEA com barreira de organização — organizador visual", prioridadeVisual: "obrigatoria", configKey: "tea_organizacao" };
        }
        // Default TEA: sequência visual
        const cfg = MAPEAMENTO_IMAGEM_BARREIRA["tea_inferencia"];
        return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "TEA — suporte visual obrigatório por protocolo", prioridadeVisual: "obrigatoria", configKey: "tea_inferencia" };
    }

    // ── DI: imagem fortemente recomendada ─────────────────────
    if (perfil === "DI") {
        if (barreirasAtivas?.["Memória de Trabalho"]) {
            const cfg = MAPEAMENTO_IMAGEM_BARREIRA["di_memoria_trabalho"];
            return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "DI com barreira de memória de trabalho — organizador visual obrigatório", prioridadeVisual: "obrigatoria", configKey: "di_memoria_trabalho" };
        }
        if (barreirasAtivas?.["Abstração e Generalização"]) {
            const cfg = MAPEAMENTO_IMAGEM_BARREIRA["di_abstracao"];
            return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "DI com barreira de abstração — objeto concreto", prioridadeVisual: "obrigatoria", configKey: "di_abstracao" };
        }
        const cfg = MAPEAMENTO_IMAGEM_BARREIRA["di_planejamento"];
        return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "DI — suporte visual recomendado para concretização", prioridadeVisual: "recomendada", configKey: "di_planejamento" };
    }

    // ── Transtornos de Aprendizagem ───────────────────────────
    if (perfil === "TRANSTORNO_APRENDIZAGEM" || perfil === "TA") {
        if (barreirasAtivas?.["Decodificação Leitora"] || barreirasAtivas?.["Compreensão Textual"]) {
            const cfg = MAPEAMENTO_IMAGEM_BARREIRA["ta_dislexia_leitura"];
            return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "Dislexia — substituir texto por símbolos quando possível", prioridadeVisual: "recomendada", configKey: "ta_dislexia_leitura" };
        }
        if (barreirasAtivas?.["Atenção Sustentada/Focada"]) {
            const cfg = MAPEAMENTO_IMAGEM_BARREIRA["ta_tdah_atencao"];
            return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "TDAH — destaque visual para manter foco", prioridadeVisual: "recomendada", configKey: "ta_tdah_atencao" };
        }
        if (barreirasAtivas?.["Raciocínio Lógico-Matemático"]) {
            const cfg = MAPEAMENTO_IMAGEM_BARREIRA["ta_discalculia"];
            return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "Discalculia — objetos concretos contáveis", prioridadeVisual: "recomendada", configKey: "ta_discalculia" };
        }
    }

    // ── Habilidades que intrinsecamente exigem imagem ─────────
    if (habExigeImagem) {
        if (hab.includes("gráfico") || hab.includes("grafico")) {
            const cfg = MAPEAMENTO_IMAGEM_BARREIRA["generico_grafico"];
            return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "Habilidade exige interpretação de gráfico", prioridadeVisual: "obrigatoria", configKey: "generico_grafico" };
        }
        if (hab.includes("mapa")) {
            const cfg = MAPEAMENTO_IMAGEM_BARREIRA["generico_mapa"];
            return { necessario: true, tipo: cfg.tipo, descricaoPrompt: cfg.descricaoPrompt, justificativa: "Habilidade exige interpretação de mapa", prioridadeVisual: "obrigatoria", configKey: "generico_mapa" };
        }
        return { necessario: true, tipo: "ilustracao", descricaoPrompt: "Ilustração clara e contextualizada para a questão. Fundo limpo, poucos elementos, alto contraste.", justificativa: "Habilidade exige interpretação visual", prioridadeVisual: "obrigatoria" };
    }

    // ── Altas Habilidades: imagem opcional ────────────────────
    if (perfil === "ALTAS_HABILIDADES") {
        return { necessario: false, justificativa: "Altas Habilidades — questões focam em abstração e criação, imagem opcional", prioridadeVisual: "opcional" };
    }

    // ── Default: sem imagem necessária ────────────────────────
    return { necessario: false, justificativa: "Nenhuma barreira identificada que exija suporte visual", prioridadeVisual: "desnecessaria" };
}

/**
 * Gera instrução de imagem para o prompt da IA,
 * baseada na decisão do mapeamento barreira→imagem.
 */
export function gerarInstrucaoImagemParaPrompt(decisao: DecisaoImagem): string {
    if (!decisao.necessario) {
        return `suporte_visual.necessario = false (justificativa: ${decisao.justificativa})`;
    }

    return `
━━━ SUPORTE VISUAL OBRIGATÓRIO PARA ESTA QUESTÃO ━━━
Tipo de imagem: ${decisao.tipo}
Prioridade: ${decisao.prioridadeVisual}
Justificativa pedagógica: ${decisao.justificativa}

INSTRUÇÕES PARA suporte_visual:
- necessario: true
- tipo: "${decisao.tipo}"
- descricao_para_geracao: ${decisao.descricaoPrompt}
- A imagem deve SUBSTITUIR informação textual quando possível
- A imagem é CONTEÚDO da questão, não decoração
- Preencher texto_alternativo para acessibilidade
`.trim();
}
