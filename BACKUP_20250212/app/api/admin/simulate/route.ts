import { parseBody } from "@/lib/validation";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

// POST: Start simulation — admin enters a school's workspace
export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.is_platform_admin) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    // Don't allow nested simulation
    if (session.simulating_workspace_id) {
        return NextResponse.json({ error: "Já está simulando. Encerre a simulação atual primeiro." }, { status: 400 });
    }

    try {
        const parsed = await parseBody(req, z.object({ workspace_id: z.string().min(1, "workspace_id obrigatório") }));
        if (parsed.error) return parsed.error;
        const { workspace_id } = parsed.data;
        if (!workspace_id) {
            return NextResponse.json({ error: "workspace_id é obrigatório." }, { status: 400 });
        }

        const sb = getSupabase();
        const { data: workspace, error } = await sb
            .from("workspaces")
            .select("id, name, segments, ai_engines, enabled_modules")
            .eq("id", workspace_id)
            .single();

        if (error || !workspace) {
            return NextResponse.json({ error: "Escola não encontrada." }, { status: 404 });
        }

        // Create a simulation session: admin impersonates the school's master
        await createSession({
            workspace_id: workspace.id,
            workspace_name: workspace.name,
            usuario_nome: session.usuario_nome,
            user_role: "master",
            is_platform_admin: true,
            simulating_workspace_id: workspace.id,
            simulating_workspace_name: workspace.name,
            member: {
                id: null,
                can_estudantes: true,
                can_pei: true,
                can_paee: true,
                can_hub: true,
                can_diario: true,
                can_avaliacao: true,
                can_gestao: true,
                link_type: "todos",
            },
        });

        return NextResponse.json({ ok: true, workspace_name: workspace.name });
    } catch (err) {
        console.error("Simulate error:", err);
        return NextResponse.json({ error: "Erro ao iniciar simulação." }, { status: 500 });
    }
}

// DELETE: End simulation — restore admin session
export async function DELETE() {
    const session = await getSession();
    if (!session?.is_platform_admin) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    if (!session.simulating_workspace_id) {
        return NextResponse.json({ error: "Nenhuma simulação ativa." }, { status: 400 });
    }

    try {
        // Restore admin session
        await createSession({
            workspace_id: null,
            workspace_name: "Administração",
            usuario_nome: session.usuario_nome,
            user_role: "platform_admin",
            is_platform_admin: true,
            member: {},
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("End simulate error:", err);
        return NextResponse.json({ error: "Erro ao encerrar simulação." }, { status: 500 });
    }
}
