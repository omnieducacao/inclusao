import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { getSession } from "@/lib/session";

interface Dimensao {
    id: string;
    dimensao: string;
    o_que_o_professor_observa: string;
    acao_pratica: string;
    indicadores_observaveis: string[];
    perguntas_professor: string[];
    niveis_omnisfera: Record<string, string>;
}

interface PerfilData {
    perfil: string;
    total_dimensoes: number;
    dimensoes: Dimensao[];
}

let cached: PerfilData[] | null = null;

function loadDimensoes(): PerfilData[] {
    if (!cached) {
        const raw = readFileSync(join(process.cwd(), "data", "dimensoes_nee.json"), "utf-8");
        cached = JSON.parse(raw);
    }
    return cached!;
}

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const perfil = searchParams.get("perfil"); // TEA, DI, TA, AH

    const data = loadDimensoes();

    if (perfil) {
        const found = data.find(p => p.perfil === perfil);
        if (!found) {
            return NextResponse.json({
                error: `Perfil '${perfil}' não encontrado`,
                perfis_disponiveis: data.map(p => p.perfil),
            }, { status: 404 });
        }
        return NextResponse.json({
            perfil: found.perfil,
            total: found.total_dimensoes,
            dimensoes: found.dimensoes,
        });
    }

    // Return all profiles summary
    return NextResponse.json({
        perfis: data.map(p => ({
            perfil: p.perfil,
            total_dimensoes: p.total_dimensoes,
        })),
    });
}
