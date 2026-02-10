import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session?.is_platform_admin) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const wsFilter = searchParams.get("workspace_id") || "";
    const eventType = searchParams.get("event_type") || "";
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    try {
        const sb = getSupabase();

        // Get workspace names for lookup
        const { data: workspaces } = await sb.from("workspaces").select("id, name");
        const wsMap: Record<string, string> = {};
        (workspaces || []).forEach((ws: any) => { wsMap[ws.id] = ws.name; });

        let query = sb
            .from("usage_events")
            .select("id, workspace_id, event_type, source, ai_engine, actor_type, metadata, created_at", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (wsFilter) {
            query = query.eq("workspace_id", wsFilter);
        }
        if (eventType) {
            query = query.eq("event_type", eventType);
        }

        const { data: events, count, error } = await query;

        if (error) {
            console.error("Activity log error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const logs = (events || []).map((ev: any) => ({
            id: ev.id,
            workspace_id: ev.workspace_id,
            workspace_name: wsMap[ev.workspace_id] || "—",
            event_type: ev.event_type,
            source: ev.source,
            ai_engine: ev.ai_engine,
            actor_type: ev.actor_type,
            created_at: ev.created_at,
        }));

        // Get unique event types for filter dropdown
        const { data: types } = await sb
            .from("usage_events")
            .select("event_type")
            .limit(500);
        const uniqueTypes = [...new Set((types || []).map((t: any) => t.event_type))].sort();

        return NextResponse.json({ logs, total: count || 0, event_types: uniqueTypes });
    } catch (err) {
        console.error("Activity log error:", err);
        return NextResponse.json({ error: "Erro ao buscar logs." }, { status: 500 });
    }
}
