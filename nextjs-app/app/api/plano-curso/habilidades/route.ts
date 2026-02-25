import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * GET /api/plano-curso/habilidades?disciplina=X&serie=Y
 *
 * Returns the BNCC habilidades selected by the professor in their Plano de Curso
 * for a specific disciplina + serie combination.
 *
 * Priority:
 *  1. Professor's Plano de Curso (planos_ensino table)
 *  2. Matriz de Referência Diagnóstica (matriz_diagnostica.json)
 *  3. BNCC Completa (bncc_habilidades.json) - last resort
 */
export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const disciplina = searchParams.get("disciplina") || "";
    const serie = searchParams.get("serie") || "";

    if (!disciplina) {
        return NextResponse.json({ error: "disciplina obrigatória" }, { status: 400 });
    }

    const sb = getSupabase();

    // ── 1. Try professor's Plano de Curso ─────────────────────────────────

    try {
        const serieBase = serie.replace(/\s*\(.*\)\s*$/, "").trim();
        let query = sb
            .from("planos_ensino")
            .select("habilidades_bncc, disciplina, ano_serie, conteudo")
            .eq("workspace_id", session.workspace_id)
            .eq("disciplina", disciplina);

        if (serieBase) {
            query = query.ilike("ano_serie", `${serieBase}%`);
        }

        const { data: planos } = await query.order("updated_at", { ascending: false });

        if (planos?.length) {
            // Collect all unique habilidades from all matching plans
            const allHabs = new Set<string>();
            for (const p of planos) {
                const habs = p.habilidades_bncc as string[] | null;
                if (habs?.length) {
                    habs.forEach(h => allHabs.add(h));
                }
            }

            if (allHabs.size > 0) {
                // Enrich with full descriptions from BNCC
                const bnccPath = join(process.cwd(), "data", "bncc_habilidades.json");
                let bnccData: { codigo: string; habilidade: string; unidade_tematica: string; objeto_conhecimento: string }[] = [];
                try {
                    bnccData = JSON.parse(readFileSync(bnccPath, "utf-8"));
                } catch { /* file may not exist */ }

                const enriched = Array.from(allHabs).map(codigo => {
                    const bnccMatch = bnccData.find(b => b.codigo === codigo);
                    return {
                        codigo_bncc: codigo,
                        descricao: bnccMatch?.habilidade || codigo,
                        tema: bnccMatch?.unidade_tematica || "",
                        objeto_conhecimento: bnccMatch?.objeto_conhecimento || "",
                    };
                });

                return NextResponse.json({
                    habilidades: enriched,
                    total: enriched.length,
                    source: "plano_curso_professor",
                    planos_count: planos.length,
                });
            }
        }
    } catch { /* table may not exist yet */ }

    // ── 2. Fallback: Matriz de Referência Diagnóstica ─────────────────────

    try {
        const matrizPath = join(process.cwd(), "data", "matriz_diagnostica.json");
        const matrizRaw = JSON.parse(readFileSync(matrizPath, "utf-8"));
        const matrizes = matrizRaw.matrizes as Record<string, { serie: string; tema: string; habilidade: string; descritor: string; competencia: string }[]>;

        // Map disciplina to matriz area
        const discLow = disciplina.toLowerCase();
        let areaKey = "";
        for (const key of Object.keys(matrizes)) {
            if (key.toLowerCase().includes(discLow) || discLow.includes(key.toLowerCase())) {
                areaKey = key;
                break;
            }
        }
        // Check for Língua Portuguesa → Linguagens mapping
        if (!areaKey && (discLow.includes("portugu") || discLow.includes("leitura") || discLow.includes("redação"))) {
            areaKey = Object.keys(matrizes).find(k => k.toLowerCase().includes("portugu")) || "";
        }

        if (areaKey && matrizes[areaKey]) {
            const gradeNum = serie.match(/\d+/)?.[0];
            const serieCode = gradeNum ? `EF${gradeNum}` : "";

            let filtered = matrizes[areaKey];
            if (serieCode) {
                filtered = filtered.filter(h => h.serie === serieCode);
            }

            if (filtered.length > 0) {
                const mapped = filtered.slice(0, 15).map(h => ({
                    codigo_bncc: h.descritor.match(/\(([^)]+)\)/)?.[1] || h.habilidade.substring(0, 20),
                    descricao: h.habilidade,
                    tema: h.tema,
                    objeto_conhecimento: h.descritor,
                }));

                return NextResponse.json({
                    habilidades: mapped,
                    total: mapped.length,
                    source: "matriz_referencia",
                });
            }
        }
    } catch { /* file may not exist */ }

    // ── 3. Last resort: BNCC Completa ─────────────────────────────────────

    try {
        const bnccPath = join(process.cwd(), "data", "bncc_habilidades.json");
        const bnccData: { codigo: string; disciplina: string; ano: string; habilidade: string; unidade_tematica: string; objeto_conhecimento: string }[] =
            JSON.parse(readFileSync(bnccPath, "utf-8"));

        const gradeNum = serie.match(/\d+/)?.[0];
        const discLow = disciplina.toLowerCase();

        const filtered = bnccData
            .filter(h => {
                const discMatch = h.disciplina.toLowerCase().includes(discLow) || discLow.includes(h.disciplina.toLowerCase());
                const yearMatch = gradeNum ? h.ano.includes(gradeNum) : true;
                return discMatch && yearMatch;
            })
            .slice(0, 10);

        if (filtered.length > 0) {
            return NextResponse.json({
                habilidades: filtered.map(h => ({
                    codigo_bncc: h.codigo,
                    descricao: h.habilidade,
                    tema: h.unidade_tematica,
                    objeto_conhecimento: h.objeto_conhecimento,
                })),
                total: filtered.length,
                source: "bncc_completa",
            });
        }
    } catch { /* file may not exist */ }

    return NextResponse.json({ habilidades: [], total: 0, source: "none" });
}
