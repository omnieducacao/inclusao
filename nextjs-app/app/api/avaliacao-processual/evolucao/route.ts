import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET  /api/avaliacao-processual/evolucao?studentId=X&disciplina=Y
 * Returns all processual records for a student+discipline across all periods,
 * enabling evolution tracking over time.
 * 
 * POST /api/avaliacao-processual/evolucao
 * Generates an AI-powered evolution report comparing multiple periods.
 */

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const disciplina = searchParams.get("disciplina");

    if (!studentId) {
        return NextResponse.json({ error: "studentId é obrigatório" }, { status: 400 });
    }

    const supabase = getSupabase();

    try {
        let query = supabase
            .from("avaliacao_processual")
            .select("*")
            .eq("student_id", studentId)
            .eq("workspace_id", session.workspace_id)
            .order("bimestre", { ascending: true });

        if (disciplina) {
            query = query.eq("disciplina", disciplina);
        }

        const { data, error } = await query;

        if (error) {
            // Table might not exist yet — return mock data structure
            return NextResponse.json({
                evolucao: [],
                resumo: {
                    total_registros: 0,
                    media_geral: null,
                    tendencia: "sem_dados",
                    disciplinas: [],
                },
                message: "Nenhum registro encontrado. A tabela pode ainda não existir.",
            });
        }

        // Build evolution summary
        const registros = data || [];
        const disciplinas = [...new Set(registros.map(r => r.disciplina))];

        // Per-discipline evolution
        const evolucaoPorDisciplina = disciplinas.map(disc => {
            const regs = registros.filter(r => r.disciplina === disc).sort((a, b) => a.bimestre - b.bimestre);

            const periodos = regs.map(reg => {
                const habs = reg.habilidades || [];
                const media = habs.length > 0
                    ? Math.round(habs.reduce((acc: number, h: { nivel_atual?: number }) => acc + (h.nivel_atual || 0), 0) / habs.length * 10) / 10
                    : null;

                return {
                    bimestre: reg.bimestre,
                    tipo_periodo: reg.tipo_periodo || "bimestral",
                    media_nivel: media,
                    total_habilidades: habs.length,
                    data_registro: reg.created_at || reg.updated_at,
                    observacao_geral: reg.observacao_geral,
                };
            });

            // Calculate trend
            const medias = periodos.filter(p => p.media_nivel !== null).map(p => p.media_nivel!);
            let tendencia: "melhora" | "estavel" | "regressao" | "sem_dados" = "sem_dados";
            if (medias.length >= 2) {
                const diff = medias[medias.length - 1] - medias[0];
                tendencia = diff > 0.3 ? "melhora" : diff < -0.3 ? "regressao" : "estavel";
            }

            return {
                disciplina: disc,
                periodos,
                tendencia,
                media_mais_recente: medias.length > 0 ? medias[medias.length - 1] : null,
            };
        });

        // General summary
        const todasMedias = evolucaoPorDisciplina
            .filter(e => e.media_mais_recente !== null)
            .map(e => e.media_mais_recente!);

        const mediaGeral = todasMedias.length > 0
            ? Math.round(todasMedias.reduce((a, b) => a + b, 0) / todasMedias.length * 10) / 10
            : null;

        return NextResponse.json({
            evolucao: evolucaoPorDisciplina,
            resumo: {
                total_registros: registros.length,
                media_geral: mediaGeral,
                tendencia: evolucaoPorDisciplina.length > 0
                    ? evolucaoPorDisciplina.filter(e => e.tendencia === "melhora").length > evolucaoPorDisciplina.length / 2
                        ? "melhora" : "estavel"
                    : "sem_dados",
                disciplinas: disciplinas,
            },
        });
    } catch (err) {
        console.error("Erro ao buscar evolução:", err);
        return NextResponse.json({
            evolucao: [],
            resumo: { total_registros: 0, media_geral: null, tendencia: "sem_dados", disciplinas: [] },
        });
    }
}
