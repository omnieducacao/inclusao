import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { readFileSync } from "fs";
import { join } from "path";

interface PlanoGenerico {
    id: string;
    segmento: string;
    ano?: string;
    faixa_etaria?: string;
    faixa_label?: string;
    disciplina?: string;
    campo_experiencia?: string;
    prioridade_pei: string;
    total_objetivos: number;
    referencia_cruzada: Record<string, unknown>;
    competencias_funcionais_pei: string[];
    alertas_por_perfil_nee: Record<string, string>;
    instrucao_uso_diagnostica: string;
    objetivos_nivel_I_reconhecer: Array<{ codigo_bncc: string; descricao: string; indicador_avaliativo: string }>;
    objetivos_nivel_II_aplicar: Array<{ codigo_bncc: string; descricao: string; indicador_avaliativo: string }>;
    objetivos_nivel_III_avaliar: Array<{ codigo_bncc: string; descricao: string; indicador_avaliativo: string }>;
}

let cached: PlanoGenerico[] | null = null;

function loadPlanos(): PlanoGenerico[] {
    if (!cached) {
        const raw = readFileSync(join(process.cwd(), "data", "planos_genericos.json"), "utf-8");
        cached = JSON.parse(raw);
    }
    return cached!;
}

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const disciplina = searchParams.get("disciplina");
    const ano = searchParams.get("ano");
    const segmento = searchParams.get("segmento");
    const id = searchParams.get("id");

    const planos = loadPlanos();

    // Get specific plan by ID
    if (id) {
        const plano = planos.find(p => p.id === id);
        if (!plano) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
        return NextResponse.json({ plano });
    }

    // Filter
    let filtered = planos;

    if (segmento) {
        filtered = filtered.filter(p => p.segmento === segmento);
    }

    if (disciplina) {
        const dLow = disciplina.toLowerCase();
        filtered = filtered.filter(p => {
            const pDisc = (p.disciplina || p.campo_experiencia || "").toLowerCase();
            return pDisc.includes(dLow) || dLow.includes(pDisc);
        });
    }

    if (ano) {
        filtered = filtered.filter(p => {
            if (p.ano) return p.ano.includes(ano);
            if (p.faixa_label) return p.faixa_label.toLowerCase().includes(ano.toLowerCase());
            return false;
        });
    }

    // If no filters, return summary
    if (!disciplina && !ano && !segmento) {
        const summary = {
            total: planos.length,
            por_segmento: {} as Record<string, number>,
            por_disciplina: {} as Record<string, number>,
        };
        for (const p of planos) {
            summary.por_segmento[p.segmento] = (summary.por_segmento[p.segmento] || 0) + 1;
            const disc = p.disciplina || p.campo_experiencia || "Geral";
            summary.por_disciplina[disc] = (summary.por_disciplina[disc] || 0) + 1;
        }
        return NextResponse.json({ summary, planos: planos.map(p => ({ id: p.id, segmento: p.segmento, ano: p.ano, disciplina: p.disciplina || p.campo_experiencia, total_objetivos: p.total_objetivos, prioridade_pei: p.prioridade_pei })) });
    }

    return NextResponse.json({
        planos: filtered.map(p => ({
            id: p.id,
            segmento: p.segmento,
            ano: p.ano,
            faixa_etaria: p.faixa_etaria,
            disciplina: p.disciplina || p.campo_experiencia,
            prioridade_pei: p.prioridade_pei,
            total_objetivos: p.total_objetivos,
            alertas_por_perfil_nee: p.alertas_por_perfil_nee,
            instrucao_uso_diagnostica: p.instrucao_uso_diagnostica,
            objetivos_nivel_I: p.objetivos_nivel_I_reconhecer,
            objetivos_nivel_II: p.objetivos_nivel_II_aplicar,
            objetivos_nivel_III: p.objetivos_nivel_III_avaliar,
            referencia_cruzada: p.referencia_cruzada,
            competencias_funcionais_pei: p.competencias_funcionais_pei,
        })),
        total: filtered.length,
    });
}
