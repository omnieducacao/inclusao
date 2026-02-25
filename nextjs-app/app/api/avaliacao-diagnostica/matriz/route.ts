import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { readFileSync } from "fs";
import { join } from "path";

// ── Cache: original matrix data + complete BNCC ──────────────

interface BnccHab {
    codigo: string;
    segmento: string;
    ano: string;
    disciplina: string;
    unidade_tematica: string;
    objeto_conhecimento: string;
    habilidade: string;
    nivel_cognitivo_saeb: string;
    prioridade_saeb: string;
    instrumento_avaliativo: string;
}

let cachedData: Record<string, unknown> | null = null;
let cachedBncc: BnccHab[] | null = null;

function loadData() {
    if (!cachedData) {
        const raw = readFileSync(join(process.cwd(), "data", "matriz_diagnostica.json"), "utf-8");
        cachedData = JSON.parse(raw);
    }
    return cachedData!;
}

function loadBncc(): BnccHab[] {
    if (!cachedBncc) {
        try {
            const raw = readFileSync(join(process.cwd(), "data", "bncc_completa.json"), "utf-8");
            cachedBncc = JSON.parse(raw);
        } catch {
            cachedBncc = [];
        }
    }
    return cachedBncc!;
}

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const area = searchParams.get("area"); // e.g. "Matemática"
    const serie = searchParams.get("serie"); // e.g. "EF6"
    const section = searchParams.get("section"); // "matrizes" | "protocolo" | "escala" | "manual" | "bncc"
    const disciplina = searchParams.get("disciplina"); // e.g. "Língua Portuguesa"
    const ano = searchParams.get("ano"); // e.g. "6º"

    const data = loadData();

    // ── Section: BNCC Completa (1,998 habilidades) ───────────

    if (section === "bncc" || disciplina) {
        const bncc = loadBncc();
        let filtered = bncc;

        if (disciplina) {
            const dLow = disciplina.toLowerCase();
            filtered = filtered.filter(h =>
                h.disciplina.toLowerCase().includes(dLow) ||
                dLow.includes(h.disciplina.toLowerCase())
            );
        }
        if (ano) {
            filtered = filtered.filter(h => h.ano.includes(ano));
        }
        if (serie) {
            const gradeNum = serie.match(/\d+/)?.[0];
            if (gradeNum) {
                filtered = filtered.filter(h => h.ano.includes(gradeNum));
            }
        }

        // When used for habilidade picker → return as flat array
        return NextResponse.json({
            habilidades: filtered.map(h => ({
                habilidade: h.habilidade,
                tema: h.unidade_tematica,
                descritor: h.objeto_conhecimento,
                competencia: h.nivel_cognitivo_saeb,
                codigo: h.codigo,
                disciplina: h.disciplina,
                ano: h.ano,
                prioridade_saeb: h.prioridade_saeb,
                instrumento_avaliativo: h.instrumento_avaliativo,
            })),
            total: filtered.length,
            source: "bncc_completa",
        });
    }

    // ── Section: Escala Omnisfera ──────────────────────────────

    if (section === "escala") {
        return NextResponse.json({
            escala: (data.protocolo as Record<string, unknown>)?.escala || [],
            niveis_suporte: (data.protocolo as Record<string, unknown>)?.niveis_suporte || [],
            adaptacoes_nee: (data.protocolo as Record<string, unknown>)?.adaptacoes_nee || {},
        });
    }

    // ── Section: Manual ───────────────────────────────────────

    if (section === "manual") {
        return NextResponse.json({
            manual: (data.protocolo as Record<string, unknown>)?.manual_aplicacao || [],
        });
    }

    // ── Section: Protocolo ────────────────────────────────────

    if (section === "protocolo") {
        const dominios = (data.protocolo as Record<string, unknown>)?.dominios as Record<string, unknown[]> || {};
        if (area) {
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

    // ── Default: Matrizes Avaliativas (393 habilidades + now also BNCC) ─

    // Try BNCC completa first for area+serie queries
    if (area && serie) {
        const bncc = loadBncc();
        const gradeNum = serie.match(/\d+/)?.[0];

        // Map area names to discipline patterns
        const areaToDisc: Record<string, string[]> = {
            "Matemática": ["Matemática"],
            "Linguagens": ["Língua Portuguesa", "Arte", "Educação Física", "Língua Inglesa"],
            "Ciências da Natureza": ["Ciências"],
            "Ciências Humanas": ["Geografia", "História"],
        };

        const disciplines = areaToDisc[area] || [area];
        const filtered = bncc.filter(h => {
            const discMatch = disciplines.some(d =>
                h.disciplina.toLowerCase().includes(d.toLowerCase())
            );
            const yearMatch = gradeNum ? h.ano.includes(gradeNum) : true;
            return discMatch && yearMatch;
        });

        if (filtered.length > 0) {
            return NextResponse.json({
                habilidades: filtered.map(h => ({
                    habilidade: h.habilidade,
                    tema: h.unidade_tematica,
                    descritor: h.objeto_conhecimento,
                    competencia: h.nivel_cognitivo_saeb,
                    codigo: h.codigo,
                    disciplina: h.disciplina,
                    ano: h.ano,
                    prioridade_saeb: h.prioridade_saeb,
                })),
                area,
                serie,
                source: "bncc_completa",
            });
        }

        // Fallback to old matrizes
        const matrizes = data.matrizes as Record<string, unknown[]> || {};
        const areaData = matrizes[area] || [];
        const filteredOld = (areaData as { serie: string }[]).filter(h => h.serie === serie);
        return NextResponse.json({ habilidades: filteredOld, area, serie, source: "matrizes_originais" });
    }

    if (area) {
        const bncc = loadBncc();
        const areaToDisc: Record<string, string[]> = {
            "Matemática": ["Matemática"],
            "Linguagens": ["Língua Portuguesa", "Arte", "Educação Física", "Língua Inglesa"],
            "Ciências da Natureza": ["Ciências"],
            "Ciências Humanas": ["Geografia", "História"],
        };
        const disciplines = areaToDisc[area] || [area];
        const filtered = bncc.filter(h =>
            disciplines.some(d => h.disciplina.toLowerCase().includes(d.toLowerCase()))
        );

        const grouped: Record<string, number> = {};
        for (const h of filtered) {
            const key = `EF${h.ano.replace(/[^\d]/g, '')}`;
            grouped[key] = (grouped[key] || 0) + 1;
        }
        return NextResponse.json({ area, series: grouped, total: filtered.length, source: "bncc_completa" });
    }

    // Summary of all areas
    const bncc = loadBncc();
    const areaMap: Record<string, string[]> = {
        "Matemática": ["Matemática"],
        "Linguagens": ["Língua Portuguesa", "Arte", "Educação Física", "Língua Inglesa"],
        "Ciências da Natureza": ["Ciências"],
        "Ciências Humanas": ["Geografia", "História"],
    };

    const summary = Object.entries(areaMap).map(([areaName, discs]) => {
        const items = bncc.filter(h =>
            discs.some(d => h.disciplina.toLowerCase().includes(d.toLowerCase()))
        );
        return {
            area: areaName,
            total: items.length,
            series: [...new Set(items.map(h => `EF${h.ano.replace(/[^\d]/g, '')}`))].sort(),
        };
    });

    return NextResponse.json({ areas: summary, total_bncc: bncc.length, source: "bncc_completa" });
}
