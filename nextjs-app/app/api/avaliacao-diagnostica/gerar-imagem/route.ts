import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { gerarImagemInteligente } from "@/lib/hub-images";
import { logger } from "@/lib/logger";

/**
 * POST /api/avaliacao-diagnostica/gerar-imagem
 *
 * Gera imagem para suporte visual de uma questão diagnóstica.
 * Usa Gemini (OmniYellow) com prompt pedagógico otimizado.
 *
 * Body:
 *   suporte_visual: {
 *     tipo: string          — "grafico" | "mapa" | "diagrama" | "tabela" | "ilustracao" | "fotografia"
 *     descricao_para_geracao: string  — descrição detalhada
 *     texto_alternativo: string       — acessibilidade
 *   }
 *   serie?: string            — ano escolar (ex: "5º ano")
 *   disciplina?: string       — disciplina
 *   habilidade_ref?: string   — código BNCC
 */
export async function POST(req: Request) {
    const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
    const { error: authError } = await requireAuth(); if (authError) return authError;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch { /* expected fallback */
        return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    // Accept both flat format (from front-end) and nested suporte_visual format
    let suporteVisual: {
        tipo?: string;
        descricao_para_geracao?: string;
        texto_alternativo?: string;
    } | undefined;

    if (body.suporte_visual && typeof body.suporte_visual === 'object') {
        // Nested format: { suporte_visual: { tipo, descricao_para_geracao, ... } }
        suporteVisual = body.suporte_visual as typeof suporteVisual;
    } else {
        // Flat format from front-end: { tipo, descricao, texto_alternativo, ... }
        suporteVisual = {
            tipo: (body.tipo as string) || undefined,
            descricao_para_geracao: (body.descricao as string) || (body.descricao_para_geracao as string) || undefined,
            texto_alternativo: (body.texto_alternativo as string) || undefined,
        };
    }

    if (!suporteVisual?.descricao_para_geracao) {
        return NextResponse.json({ error: "Campo descricao_para_geracao (ou suporte_visual.descricao_para_geracao) é obrigatório." }, { status: 400 });
    }

    const serie = (body.serie as string) || "";
    const disciplina = (body.disciplina as string) || "";
    const habilidadeRef = (body.habilidade_ref as string) || "";
    const tipo = suporteVisual.tipo || "ilustracao";

    // ── Build pedagogical image prompt ──────────────────────
    const tipoInstrucao: Record<string, string> = {
        grafico: "Create a clean, educational chart/graph with labeled axes, clear data points, and a legend. Use high contrast colors suitable for students with visual needs.",
        mapa: "Create a clean, educational map with clear labels, a legend, and a compass rose. Use distinct colors for different regions.",
        diagrama: "Create a clean, educational diagram with clear labels, arrows showing relationships, and organized layout. Use distinct colors.",
        tabela: "Create a clean, organized educational table with clear headers, grid lines, and readable text. Use alternating row colors.",
        ilustracao: "Create a clean, educational flat-style illustration. Use simple shapes, bright colors, white background. NO text or labels inside the image.",
        fotografia: "Create a realistic educational photograph-style image. Clear, well-lit, focused on the subject.",
    };

    const prompt = [
        `Educational material for ${serie || "elementary school"} ${disciplina || "students"}.`,
        tipoInstrucao[tipo] || tipoInstrucao.ilustracao,
        `Subject: ${suporteVisual.descricao_para_geracao}`,
        habilidadeRef ? `BNCC skill reference: ${habilidadeRef}` : "",
        "CRITICAL RULES:",
        "- STRICTLY NO TEXT, NO WORDS, NO NUMBERS, NO LABELS inside the image (unless it's a chart/table/diagram that requires data labels)",
        "- Clean white or light background",
        "- High contrast colors (accessibility)",
        "- Age-appropriate content",
        "- Simple, clear visual communication",
        tipo === "grafico" || tipo === "tabela" ? "- Include readable data labels and axis labels" : "",
    ].filter(Boolean).join("\n");

    // ── Generate image via Gemini ──────────────────────────
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        return NextResponse.json({
            error: "GEMINI_API_KEY não configurada. Configure no ambiente para gerar imagens.",
            fallback: true,
        }, { status: 500 });
    }

    try {
        const imageResult = await gerarImagemInteligente(
            prompt,
            "IA",
            undefined,  // no unsplash for educational content
            geminiKey
        );

        if (!imageResult) {
            return NextResponse.json({
                error: "Não foi possível gerar a imagem. Tente novamente ou faça upload manual.",
                fallback: true,
            }, { status: 422 });
        }

        return NextResponse.json({
            image: imageResult,
            imageUrl: imageResult,  // alias for front-end compatibility
            tipo,
            texto_alternativo: suporteVisual.texto_alternativo || suporteVisual.descricao_para_geracao,
            prompt_usado: prompt.slice(0, 200),
        });
    } catch (err) {
        logger.error({ err: err }, "Erro ao gerar imagem diagnóstica:");
        return NextResponse.json({
            error: err instanceof Error ? err.message : "Erro ao gerar imagem",
            fallback: true,
        }, { status: 500 });
    }
}
