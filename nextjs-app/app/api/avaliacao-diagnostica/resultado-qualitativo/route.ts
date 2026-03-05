import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * POST /api/avaliacao-diagnostica/resultado-qualitativo
 *
 * Analisa as respostas do estudante de forma qualitativa,
 * gerando mapa de competências, níveis de desempenho e
 * sugestões de mediação pedagógica (Guia MEC/CONSED 2025).
 *
 * Body:
 *   questoes: Array<{
 *     id: string
 *     habilidade_bncc_ref: string
 *     gabarito: string
 *     analise_distratores: Record<string, string>
 *     nivel_omnisfera_alvo: number
 *   }>
 *   respostas: Record<string, string>  — { "Q1": "B", "Q2": "A", ... }
 *   perfil_nee?: string
 *   nome_aluno?: string
 *   disciplina?: string
 *   serie?: string
 */

interface QuestaoAnalise {
    id: string;
    habilidade_bncc_ref: string;
    gabarito: string;
    analise_distratores?: Record<string, string>;
    nivel_omnisfera_alvo?: number;
    justificativa_pedagogica?: string;
}

interface ResultadoHabilidade {
    codigo_bncc: string;
    acertou: boolean;
    resposta_aluno: string;
    gabarito: string;
    distrator_ativado: string | null;
    erro_cognitivo: string | null;
    nivel_desempenho: "nao_demonstrada" | "em_processo" | "razoavel" | "adequado";
}

interface MapaCompetencias {
    dominadas: string[];
    em_desenvolvimento: string[];
    nao_demonstradas: string[];
}

type NivelDesempenho = "em_processo" | "razoavel" | "adequado" | "avancado";

interface ResultadoDiagnostico {
    // Quantitativo
    score_geral: number;
    acertos: number;
    total: number;
    nivel_omnisfera: number;

    // Qualitativo (Guia MEC)
    nivel_desempenho: NivelDesempenho;
    descricao_nivel: string;

    // Por habilidade
    habilidades: ResultadoHabilidade[];

    // Mapa de competências
    mapa_competencias: MapaCompetencias;

    // Agrupamento sugerido (Guia MEC)
    grupo_sugerido: "defasagem" | "intermediario" | "avancado";
    descricao_grupo: string;

    // Mediação sugerida
    mediacao_sugerida: string;

    // Aviso pedagógico
    aviso_hipotese: string;
}

function calcularNivelOmnisfera(percentual: number): number {
    if (percentual >= 0.9) return 4;
    if (percentual >= 0.7) return 3;
    if (percentual >= 0.5) return 2;
    if (percentual >= 0.25) return 1;
    return 0;
}

/**
 * Qualitative level aligned with Omnisfera rubric (same thresholds):
 *   ≥90% → avançado   (Omnisfera 4 – Consolidado)
 *   ≥70% → adequado   (Omnisfera 3 – Consolidando)
 *   ≥50% → razoável   (Omnisfera 2 – Em Desenvolvimento)
 *   <50% → em_processo (Omnisfera 0-1 – Emergente/Não Iniciado)
 */
function calcularNivelDesempenho(percentual: number): NivelDesempenho {
    if (percentual >= 0.9) return "avancado";
    if (percentual >= 0.7) return "adequado";
    if (percentual >= 0.5) return "razoavel";
    return "em_processo";
}

const DESCRICAO_NIVEL: Record<NivelDesempenho, string> = {
    em_processo: "O estudante está em processo de aquisição das habilidades avaliadas. Necessita de mediação intensiva e atividades com suporte direto.",
    razoavel: "O estudante demonstra aquisição parcial das habilidades. Realiza algumas tarefas com apoio e mostra avanço em algumas competências.",
    adequado: "O estudante demonstra domínio satisfatório da maioria das habilidades avaliadas. Realiza tarefas com autonomia em contextos estruturados.",
    avancado: "O estudante demonstra domínio consolidado das habilidades, realizando com autonomia e podendo explorar níveis cognitivos mais complexos.",
};

/**
 * Group suggestions aligned with Omnisfera rubric and Guia MEC.
 * em_processo (Omnisfera 0-1) → Defasagem (S3-S4)
 * razoável   (Omnisfera 2)   → Intermediário (S2-S3)
 * adequado   (Omnisfera 3)   → Avançado (S1-S2)
 * avançado   (Omnisfera 4)   → Avançado+ (S1, tutoria)
 */
const GRUPO_SUGERIDO: Record<string, { grupo: "defasagem" | "intermediario" | "avancado"; descricao: string }> = {
    em_processo: {
        grupo: "defasagem",
        descricao: "Grupo Defasagem (Omnisfera 0-1) — Prioridade de intervenção. Necessita de mediação individualizada com retomada de habilidades pregressas. Atividades com suporte S3-S4, material concreto, e acompanhamento frequente.",
    },
    razoavel: {
        grupo: "intermediario",
        descricao: "Grupo Intermediário (Omnisfera 2) — Mediação em pequenos grupos. Atividades de consolidação com suporte S2-S3, variação de contextos, e verificação periódica de avanço.",
    },
    adequado: {
        grupo: "avancado",
        descricao: "Grupo Avançado (Omnisfera 3) — Enriquecimento e desafio. Atividades de nível cognitivo II-III, conexões interdisciplinares, e projetos de aplicação autônoma com suporte S1-S2.",
    },
    avancado: {
        grupo: "avancado",
        descricao: "Grupo Avançado+ (Omnisfera 4) — Enriquecimento e desafio máximo. Atividades de nível cognitivo III, conexões interdisciplinares, projetos de criação, e possível papel de tutor para os colegas. Suporte S1.",
    },
};

export async function POST(req: Request) {
    const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
    const { error: authError } = await requireAuth(); if (authError) return authError;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    const questoes = (body.questoes as QuestaoAnalise[]) || [];
    const respostas = (body.respostas as Record<string, string>) || {};
    const perfilNee = (body.perfil_nee as string) || "";
    const nomeAluno = (body.nome_aluno as string) || "o estudante";
    const disciplina = (body.disciplina as string) || "";

    if (questoes.length === 0) {
        return NextResponse.json({ error: "Nenhuma questão para analisar." }, { status: 400 });
    }

    // ── Análise por habilidade ──────────────────────────────
    const habilidades: ResultadoHabilidade[] = [];
    let acertos = 0;

    for (const q of questoes) {
        const respostaAluno = respostas[q.id] || "";
        const acertou = respostaAluno === q.gabarito;
        if (acertou) acertos++;

        let distratorAtivado: string | null = null;
        let erroCognitivo: string | null = null;

        if (!acertou && respostaAluno && q.analise_distratores) {
            distratorAtivado = respostaAluno;
            const analise = q.analise_distratores[respostaAluno];
            if (analise && !analise.toLowerCase().includes("gabarito")) {
                erroCognitivo = analise;
            }
        }

        // Determinar nível de desempenho desta habilidade
        // Alinhado com rubrica Omnisfera: acerto = adequado, erro parcial = razoável, erro total = em_processo
        let nivelHab: ResultadoHabilidade["nivel_desempenho"];
        if (acertou) {
            nivelHab = "adequado";
        } else if (!respostaAluno) {
            nivelHab = "nao_demonstrada";
        } else if (erroCognitivo && (
            erroCognitivo.toLowerCase().includes("parcial") ||
            erroCognitivo.toLowerCase().includes("compreendeu") ||
            erroCognitivo.toLowerCase().includes("parte") ||
            erroCognitivo.toLowerCase().includes("próximo")
        )) {
            // Erro cognitivo parcial — estudante demonstra compreensão parcial
            nivelHab = "razoavel";
        } else {
            // Erro sem evidência de compreensão parcial
            nivelHab = "em_processo";
        }

        habilidades.push({
            codigo_bncc: q.habilidade_bncc_ref || q.id,
            acertou,
            resposta_aluno: respostaAluno,
            gabarito: q.gabarito,
            distrator_ativado: distratorAtivado,
            erro_cognitivo: erroCognitivo,
            nivel_desempenho: nivelHab,
        });
    }

    // ── Cálculos gerais ─────────────────────────────────────
    const total = questoes.length;
    const percentual = total > 0 ? acertos / total : 0;
    const nivelOmnisfera = calcularNivelOmnisfera(percentual);
    const nivelDesempenho = calcularNivelDesempenho(percentual);
    const grupoInfo = GRUPO_SUGERIDO[nivelDesempenho] || GRUPO_SUGERIDO.em_processo;

    // ── Mapa de competências ────────────────────────────────
    const mapa: MapaCompetencias = {
        dominadas: habilidades.filter(h => h.acertou).map(h => h.codigo_bncc),
        em_desenvolvimento: habilidades.filter(h => !h.acertou && h.resposta_aluno).map(h => h.codigo_bncc),
        nao_demonstradas: habilidades.filter(h => !h.resposta_aluno).map(h => h.codigo_bncc),
    };

    // ── Mediação sugerida ───────────────────────────────────
    const errosFrequentes = habilidades
        .filter(h => h.erro_cognitivo)
        .map(h => `• ${h.codigo_bncc}: ${h.erro_cognitivo}`)
        .join("\n");

    let mediacao = "";
    if (nivelDesempenho === "em_processo") {
        mediacao = `${nomeAluno} necessita de mediação intensiva em ${disciplina}. ` +
            `Sugestão: retomar habilidades pregressas antes de avançar. ` +
            `Usar material concreto e visual, atividades passo a passo com suporte S3-S4.`;
    } else if (nivelDesempenho === "razoavel") {
        mediacao = `${nomeAluno} demonstra progresso parcial em ${disciplina}. ` +
            `Sugestão: consolidar habilidades com variação de contextos. ` +
            `Atividades em dupla/trio com suporte S2-S3.`;
    } else if (nivelDesempenho === "adequado") {
        mediacao = `${nomeAluno} demonstra bom desempenho em ${disciplina}. ` +
            `Sugestão: avançar para nível cognitivo II-III com atividades de aplicação e análise.`;
    } else {
        mediacao = `${nomeAluno} demonstra excelente desempenho em ${disciplina}. ` +
            `Sugestão: atividades de enriquecimento, conexões interdisciplinares e desafios de criação.`;
    }

    if (errosFrequentes) {
        mediacao += `\n\nPadrões de erro identificados:\n${errosFrequentes}`;
    }

    if (perfilNee) {
        mediacao += `\n\nConsiderar perfil NEE (${perfilNee}) nas estratégias de mediação.`;
    }

    // ── Resultado completo ──────────────────────────────────
    const resultado: ResultadoDiagnostico = {
        score_geral: Math.round(percentual * 100),
        acertos,
        total,
        nivel_omnisfera: nivelOmnisfera,
        nivel_desempenho: nivelDesempenho,
        descricao_nivel: DESCRICAO_NIVEL[nivelDesempenho],
        habilidades,
        mapa_competencias: mapa,
        grupo_sugerido: grupoInfo.grupo,
        descricao_grupo: grupoInfo.descricao,
        mediacao_sugerida: mediacao,
        aviso_hipotese: "⚠️ Este resultado é uma HIPÓTESE INICIAL baseada em avaliação diagnóstica. " +
            "Deve ser validado com observações processuais e avaliações formativas ao longo do período. " +
            "Não representa uma classificação definitiva do estudante.",
    };

    return NextResponse.json({ resultado });
}
