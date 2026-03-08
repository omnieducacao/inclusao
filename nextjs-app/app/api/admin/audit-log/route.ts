import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const isMaster = session.user_role === "master" || session.is_platform_admin;
    if (!isMaster) {
        return NextResponse.json({ error: "Apenas administradores podem acessar a auditoria." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const wsFilter = searchParams.get("workspace_id") || "";
    const actionFilter = searchParams.get("action") || "";
    const startRange = searchParams.get("start") || "";
    const endRange = searchParams.get("end") || "";
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    try {
        const sb = getSupabase();

        // Get workspace names for reference
        const { data: workspaces } = await sb.from("workspaces").select("id, name");
        const wsMap: Record<string, string> = {};
        (workspaces || []).forEach((ws: any) => { wsMap[ws.id] = ws.name; });

        let query = sb
            .from("audit_log")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        // Security reinforcement (if not platform_admin, restrict to own workspace)
        if (!session.is_platform_admin && session.workspace_id) {
            query = query.eq("workspace_id", session.workspace_id);
        } else if (wsFilter) {
            query = query.eq("workspace_id", wsFilter);
        }

        if (actionFilter) {
            query = query.eq("action", actionFilter);
        }

        if (startRange) {
            query = query.gte("created_at", startRange);
        }

        if (endRange) {
            query = query.lte("created_at", endRange);
        }

        const { data: events, count, error } = await query;

        if (error) {
            console.error("Audit query error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const logs = (events || []).map((ev: any) => ({
            id: ev.id,
            workspace_id: ev.workspace_id,
            workspace_name: wsMap[ev.workspace_id] || "—",
            actor_id: ev.actor_id,
            actor_role: ev.actor_role,
            action: ev.action,
            resource_type: ev.resource_type,
            resource_id: ev.resource_id,
            metadata: ev.metadata,
            ip_address: ev.ip_address,
            created_at: ev.created_at,
        }));

        const { data: uniqueActions } = await sb
            .from("audit_log")
            .select("action")
            .limit(500);

        const actionsList = [...new Set((uniqueActions || []).map((t: any) => t.action))].sort();

        return NextResponse.json({ logs, total: count || 0, available_actions: actionsList });
    } catch (err) {
        console.error("Audit log critical error:", err);
        return NextResponse.json({ error: "Erro interno ao buscar trilha de auditoria." }, { status: 500 });
    }
}
