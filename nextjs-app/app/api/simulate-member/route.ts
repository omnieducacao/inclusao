import { NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/simulate-member
 * Master inicia simulação de um membro do workspace.
 * Body: { member_id: string }
 *
 * DELETE /api/simulate-member
 * Encerra simulação e restaura sessão master.
 */

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Only master or platform_admin can simulate
    if (session.user_role !== "master" && !session.is_platform_admin) {
        return NextResponse.json({ error: "Apenas coordenadores podem simular membros." }, { status: 403 });
    }

    // Don't allow nested simulation
    if (session.simulating_member_id) {
        return NextResponse.json({ error: "Já está simulando um membro. Encerre a simulação atual primeiro." }, { status: 400 });
    }

    const body = await req.json();
    const { member_id } = body as { member_id: string };
    if (!member_id) {
        return NextResponse.json({ error: "member_id é obrigatório." }, { status: 400 });
    }

    const sb = getSupabase();

    // Verify member belongs to same workspace
    const { data: member } = await sb
        .from("workspace_members")
        .select("id, workspace_id, nome, email, can_estudantes, can_pei, can_pei_professor, can_paee, can_hub, can_diario, can_avaliacao, can_gestao, link_type")
        .eq("id", member_id)
        .eq("workspace_id", session.workspace_id)
        .eq("active", true)
        .single();

    if (!member) {
        return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
    }

    // Backup current session (without exp)
    const backup = { ...session };
    delete (backup as Record<string, unknown>).exp;

    // Create simulation session impersonating the member
    await createSession({
        workspace_id: session.workspace_id,
        workspace_name: session.workspace_name,
        usuario_nome: member.nome,
        user_role: "member",
        is_platform_admin: session.is_platform_admin || false,
        member: {
            id: member.id,
            can_estudantes: member.can_estudantes,
            can_pei: member.can_pei,
            can_pei_professor: member.can_pei_professor,
            can_paee: member.can_paee,
            can_hub: member.can_hub,
            can_diario: member.can_diario,
            can_avaliacao: member.can_avaliacao,
            can_gestao: member.can_gestao,
            link_type: member.link_type,
        },
        simulating_member_id: member.id,
        simulating_member_name: member.nome,
        original_master_session: JSON.stringify(backup),
        // Preserve admin simulation if active
        simulating_workspace_id: session.simulating_workspace_id,
        simulating_workspace_name: session.simulating_workspace_name,
    });

    return NextResponse.json({ ok: true, member_name: member.nome });
}

export async function DELETE() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (!session.simulating_member_id || !session.original_master_session) {
        return NextResponse.json({ error: "Nenhuma simulação de membro ativa." }, { status: 400 });
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
        console.error("End member simulation error:", err);
        return NextResponse.json({ error: "Erro ao encerrar simulação." }, { status: 500 });
    }
}
