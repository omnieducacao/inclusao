import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session?.is_platform_admin) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const wsFilter = searchParams.get("workspace_id") || "";
    const search = searchParams.get("search") || "";

    try {
        const sb = getSupabase();

        // Get workspaces for name lookup
        const { data: workspaces } = await sb.from("workspaces").select("id, name");
        const wsMap: Record<string, string> = {};
        (workspaces || []).forEach((ws: Record<string, unknown>) => { wsMap[String(ws.id)] = String(ws.name); });

        // Get all workspace members
        let query = sb
            .from("workspace_members")
            .select("id, workspace_id, nome, email, role, active, can_pei, can_paee, can_hub, can_diario, can_avaliacao, can_gestao, link_type, created_at");

        if (wsFilter) {
            query = query.eq("workspace_id", wsFilter);
        }

        const { data: members, error } = await query.order("nome");

        if (error) {
            logger.error({ err: error }, "Users error:");
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        let users = (members || []).map((m: Record<string, unknown>) => ({
            id: m.id,
            nome: m.nome || "",
            email: m.email || "",
            role: m.role || "member",
            workspace_id: m.workspace_id,
            workspace_name: wsMap[String(m.workspace_id)] || "—",
            active: m.active !== false,
            permissions: {
                can_pei: m.can_pei !== false,
                can_paee: m.can_paee !== false,
                can_hub: m.can_hub !== false,
                can_diario: m.can_diario !== false,
                can_avaliacao: m.can_avaliacao !== false,
                can_gestao: m.can_gestao !== false,
            },
            link_type: m.link_type || "todos",
            created_at: m.created_at,
        }));

        // Search filter
        if (search) {
            const s = search.toLowerCase();
            users = users.filter(
                (u: Record<string, unknown>) => String(u.nome).toLowerCase().includes(s) || String(u.email).toLowerCase().includes(s)
            );
        }

        return NextResponse.json({ users });
    } catch (err) {
        logger.error({ err: err }, "Users error:");
        return NextResponse.json({ error: "Erro ao listar usuários." }, { status: 500 });
    }
}

// PATCH: Toggle user active status
export async function PATCH(request: NextRequest) {
    const session = await getSession();
    if (!session?.is_platform_admin) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    try {
        const { user_id, active } = await request.json();
        if (!user_id) {
            return NextResponse.json({ error: "user_id obrigatório." }, { status: 400 });
        }

        const sb = getSupabase();
        const { error } = await sb
            .from("workspace_members")
            .update({ active })
            .eq("id", user_id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        logger.error({ err: err }, "Toggle user error:");
        return NextResponse.json({ error: "Erro ao atualizar usuário." }, { status: 500 });
    }
}
