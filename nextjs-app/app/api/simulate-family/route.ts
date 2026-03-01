import { NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/simulate-family
 * Master inicia simulação de um responsável família do workspace.
 * Body: { family_responsible_id: string }
 *
 * DELETE /api/simulate-family
 * Encerra simulação e restaura sessão master.
 */

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Only master or platform_admin can simulate
    if (session.user_role !== "master" && !session.is_platform_admin) {
        return NextResponse.json({ error: "Apenas coordenadores podem simular responsáveis." }, { status: 403 });
    }

    // Don't allow nested simulation
    if (session.simulating_member_id || session.family_responsible_id) {
        return NextResponse.json({ error: "Já está em uma simulação. Encerre a simulação atual primeiro." }, { status: 400 });
    }

    const body = await req.json();
    const { family_responsible_id } = body as { family_responsible_id: string };
    if (!family_responsible_id) {
        return NextResponse.json({ error: "family_responsible_id é obrigatório." }, { status: 400 });
    }

    const sb = getSupabase();

    // Verify responsible belongs to same workspace and is active
    const { data: responsible } = await sb
        .from("family_responsibles")
        .select("id, workspace_id, nome, email")
        .eq("id", family_responsible_id)
        .eq("workspace_id", session.workspace_id)
        .eq("active", true)
        .single();

    if (!responsible) {
        return NextResponse.json({ error: "Responsável não encontrado." }, { status: 404 });
    }

    // Backup current session (without exp)
    const backup = { ...session };
    delete (backup as Record<string, unknown>).exp;

    // Create simulation session impersonating the family responsible
    await createSession({
        workspace_id: session.workspace_id,
        workspace_name: session.workspace_name,
        usuario_nome: responsible.nome,
        user_role: "family",
        is_platform_admin: session.is_platform_admin || false,
        member: undefined,
        family_responsible_id: responsible.id,
        simulating_member_id: responsible.id,
        simulating_member_name: responsible.nome,
        original_master_session: JSON.stringify(backup),
        // Preserve admin simulation if active
        simulating_workspace_id: session.simulating_workspace_id,
        simulating_workspace_name: session.simulating_workspace_name,
    });

    return NextResponse.json({ ok: true, responsible_name: responsible.nome });
}

export async function DELETE() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (!session.simulating_member_id || !session.original_master_session) {
        return NextResponse.json({ error: "Nenhuma simulação ativa." }, { status: 400 });
    }

    try {
        const restored = JSON.parse(session.original_master_session);
        await createSession({
            workspace_id: restored.workspace_id,
            workspace_name: restored.workspace_name,
            usuario_nome: restored.usuario_nome,
            user_role: restored.user_role,
            is_platform_admin: restored.is_platform_admin || false,
            member: restored.member || {},
            terms_accepted: restored.terms_accepted,
            simulating_workspace_id: restored.simulating_workspace_id,
            simulating_workspace_name: restored.simulating_workspace_name,
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("End family simulation error:", err);
        return NextResponse.json({ error: "Erro ao encerrar simulação." }, { status: 500 });
    }
}
