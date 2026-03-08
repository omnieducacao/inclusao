import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAlunosRegente } from "@/lib/dashboard-alunos";

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.workspace_id) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }
        const data = await getAlunosRegente(session);
        return NextResponse.json(data);
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Erro desconhecido" }, { status: 500 });
    }
}
