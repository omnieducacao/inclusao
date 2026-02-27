import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { ESCALA_OMNISFERA, NivelOmnisfera } from "@/lib/omnisfera-types";

/**
 * GET /api/avaliacao-processual/relatorio-integrado?student_id=X&disciplina=Y
 *
 * Returns an integrated report combining:
 * - Diagnóstica baseline (nivel_omnisfera from PEI)
 * - Processual evolution (all periods for this student + disciplina)
 * - Delta analysis per habilidade
 */
export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id") || "";
    const disciplina = searchParams.get("disciplina") || "";

    if (!studentId) {
        return NextResponse.json({ error: "student_id obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();

    // ── 1. Diagnóstica baseline from avaliacoes_diagnosticas ─────────────
    // (Não existe tabela "peis"; o baseline vem das avaliações diagnósticas do estudante.)

    let diagnosticoBaseline: {
        nivel_omnisfera: number | null;
        disciplina: string;
        data: string | null;
        status: string;
    } | null = null;

    try {
        const { data: avs } = await sb
            .from("avaliacoes_diagnosticas")
            .select("id, disciplina, nivel_omnisfera_identificado, status, updated_at")
            .eq("workspace_id", session.workspace_id)
            .eq("student_id", studentId)
            .order("updated_at", { ascending: false });

        if (avs?.length && disciplina) {
            const match = avs.find(a =>
                a.disciplina?.toLowerCase().includes(disciplina.toLowerCase()) ||
                disciplina.toLowerCase().includes(a.disciplina?.toLowerCase() || "")
            );
            if (match) {
                diagnosticoBaseline = {
                    nivel_omnisfera: match.nivel_omnisfera_identificado ?? null,
                    disciplina: match.disciplina,
                    data: match.updated_at || null,
                    status: match.status || "pendente",
                };
            }
        } else if (avs?.length && !disciplina) {
            const m = avs[0];
            diagnosticoBaseline = {
                nivel_omnisfera: m.nivel_omnisfera_identificado ?? null,
                disciplina: m.disciplina || "",
                data: m.updated_at || null,
                status: m.status || "pendente",
            };
        }
    } catch { /* table may not exist */ }

    // ── 2. Processual evolution ──────────────────────────────────────────

    let registros: Array<{
        periodo: string;
        tipo_periodo: string;
        habilidades: Array<{
            codigo_bncc: string;
            descricao: string;
            nivel_atual: number;
            nivel_anterior: number | null;
            observacao: string;
        }>;
        observacao_geral: string;
        data: string;
    }> = [];

    try {
        let query = sb
            .from("avaliacao_processual")
            .select("*")
            .eq("workspace_id", session.workspace_id)
            .eq("student_id", studentId);

        if (disciplina) {
            query = query.eq("disciplina", disciplina);
        }

        const { data } = await query.order("created_at", { ascending: true });

        if (data?.length) {
            registros = data.map(r => ({
                periodo: `Bimestre ${r.bimestre}`,
                tipo_periodo: r.tipo_periodo || "bimestral",
                habilidades: (r.habilidades || []) as Array<{
                    codigo_bncc: string;
                    descricao: string;
                    nivel_atual: number;
                    nivel_anterior: number | null;
                    observacao: string;
                }>,
                observacao_geral: r.observacao_geral || "",
                data: r.created_at || r.updated_at || "",
            }));
        }
    } catch { /* table may not exist */ }

    // ── 3. Build evolution analysis ─────────────────────────────────────

    const habEvolution: Record<string, {
        codigo: string;
        descricao: string;
        niveis: Array<{ periodo: string; nivel: number }>;
        nivel_inicial: number;
        nivel_atual: number;
        delta: number;
        tendencia: "melhora" | "regressao" | "estavel";
    }> = {};

    for (const reg of registros) {
        for (const hab of reg.habilidades) {
            if (!habEvolution[hab.codigo_bncc]) {
                habEvolution[hab.codigo_bncc] = {
                    codigo: hab.codigo_bncc,
                    descricao: hab.descricao,
                    niveis: [],
                    nivel_inicial: hab.nivel_atual,
                    nivel_atual: hab.nivel_atual,
                    delta: 0,
                    tendencia: "estavel",
                };
            }
            habEvolution[hab.codigo_bncc].niveis.push({
                periodo: reg.periodo,
                nivel: hab.nivel_atual,
            });
            habEvolution[hab.codigo_bncc].nivel_atual = hab.nivel_atual;
        }
    }

    // Calculate deltas
    for (const key of Object.keys(habEvolution)) {
        const h = habEvolution[key];
        h.delta = h.nivel_atual - h.nivel_inicial;
        h.tendencia = h.delta > 0 ? "melhora" : h.delta < 0 ? "regressao" : "estavel";
    }

    // Overall tendencia
    const evolutions = Object.values(habEvolution);
    const avgDelta = evolutions.length > 0
        ? evolutions.reduce((s, e) => s + e.delta, 0) / evolutions.length
        : 0;
    const tendenciaGeral = avgDelta > 0.2 ? "melhora" : avgDelta < -0.2 ? "regressao" : "estavel";

    // Media geral by period
    const mediaPorPeriodo: Array<{ periodo: string; media: number }> = [];
    for (const reg of registros) {
        if (reg.habilidades.length > 0) {
            const media = reg.habilidades.reduce((s, h) => s + h.nivel_atual, 0) / reg.habilidades.length;
            mediaPorPeriodo.push({ periodo: reg.periodo, media: Math.round(media * 10) / 10 });
        }
    }

    // Alertas: habilidades em regressão
    const alertas = evolutions
        .filter(e => e.tendencia === "regressao")
        .map(e => ({
            codigo: e.codigo,
            descricao: e.descricao,
            de: e.nivel_inicial,
            para: e.nivel_atual,
            descricao_nivel: ESCALA_OMNISFERA[e.nivel_atual as NivelOmnisfera]?.label || "",
        }));

    return NextResponse.json({
        student_id: studentId,
        disciplina,
        diagnostico_baseline: diagnosticoBaseline,
        registros_processual: registros.length,
        evolucao_por_habilidade: evolutions,
        media_por_periodo: mediaPorPeriodo,
        tendencia_geral: tendenciaGeral,
        alertas_regressao: alertas,
        timestamp: new Date().toISOString(),
    });
}
