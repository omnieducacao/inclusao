import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { readFileSync } from "fs";
import { join } from "path";

let cachedData: Record<string, unknown> | null = null;

function loadData() {
    if (!cachedData) {
        const raw = readFileSync(join(process.cwd(), "data", "matriz_diagnostica.json"), "utf-8");
        cachedData = JSON.parse(raw);
    }
    return cachedData!;
}

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const area = searchParams.get("area"); // e.g. "Matemática"
    const serie = searchParams.get("serie"); // e.g. "EF6"
    const section = searchParams.get("section"); // "matrizes" | "protocolo" | "escala" | "manual"

    const data = loadData();

    // Return specific sections
    if (section === "escala") {
        return NextResponse.json({
            escala: (data.protocolo as Record<string, unknown>)?.escala || [],
            niveis_suporte: (data.protocolo as Record<string, unknown>)?.niveis_suporte || [],
            adaptacoes_nee: (data.protocolo as Record<string, unknown>)?.adaptacoes_nee || {},
        });
    }

    if (section === "manual") {
        return NextResponse.json({
            manual: (data.protocolo as Record<string, unknown>)?.manual_aplicacao || [],
        });
    }

    if (section === "protocolo") {
        const dominios = (data.protocolo as Record<string, unknown>)?.dominios as Record<string, unknown[]> || {};
        if (area) {
            // Find matching domain
            const match = Object.entries(dominios).find(([key]) =>
                key.toLowerCase().includes(area.toLowerCase())
            );
            return NextResponse.json({ dominio: match ? { nome: match[0], items: match[1] } : null });
        }
        return NextResponse.json({
            dominios: Object.entries(dominios).map(([nome, items]) => ({
                nome,
                count: (items as unknown[]).length,
            })),
        });
    }

    // Default: matrizes
    const matrizes = data.matrizes as Record<string, unknown[]> || {};

    if (area && serie) {
        const areaData = matrizes[area] || [];
        const filtered = (areaData as { serie: string }[]).filter(h => h.serie === serie);
        return NextResponse.json({ habilidades: filtered, area, serie });
    }

    if (area) {
        const areaData = matrizes[area] || [];
        // Group by serie
        const grouped: Record<string, number> = {};
        for (const h of areaData as { serie: string }[]) {
            grouped[h.serie] = (grouped[h.serie] || 0) + 1;
        }
        return NextResponse.json({ area, series: grouped, total: (areaData as unknown[]).length });
    }

    // Return summary
    const summary = Object.entries(matrizes).map(([name, items]) => ({
        area: name,
        total: (items as unknown[]).length,
        series: [...new Set((items as { serie: string }[]).map(h => h.serie))],
    }));

    return NextResponse.json({ areas: summary });
}
