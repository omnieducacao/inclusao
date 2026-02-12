import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7", 10);
  const limit = parseInt(searchParams.get("limit") || "500", 10);

  try {
    const sb = getSupabase();
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Buscar eventos de uso
    const { data: events, error: eventsError } = await sb
      .from("usage_events")
      .select("id, workspace_id, event_type, source, ai_engine, actor_type, metadata, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);

    if (eventsError) {
      console.error("Erro ao buscar usage_events:", eventsError);
      return NextResponse.json({ 
        total: 0,
        by_type: [],
        by_engine: [],
        timeline: [],
        recent: [],
      });
    }

    const eventsList = events || [];

    // Agregar métricas
    const byType: Record<string, number> = {};
    const byEngine: Record<string, number> = {};
    const timeline: Record<string, number> = {};

    eventsList.forEach((ev: any) => {
      const etype = ev.event_type || "desconhecido";
      byType[etype] = (byType[etype] || 0) + 1;

      const eng = ev.ai_engine || "—";
      byEngine[eng] = (byEngine[eng] || 0) + 1;

      const date = new Date(ev.created_at);
      const dayKey = date.toISOString().split("T")[0];
      timeline[dayKey] = (timeline[dayKey] || 0) + 1;
    });

    const byTypeList = Object.entries(byType)
      .map(([event_type, count]) => ({ event_type, count }))
      .sort((a, b) => a.event_type.localeCompare(b.event_type));

    const byEngineList = Object.entries(byEngine)
      .map(([ai_engine, count]) => ({ ai_engine, count }))
      .sort((a, b) => a.ai_engine.localeCompare(b.ai_engine));

    const timelineList = Object.entries(timeline)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day));

    const recent = eventsList.slice(0, 25).map((ev: any) => ({
      id: ev.id,
      workspace_id: ev.workspace_id,
      event_type: ev.event_type,
      source: ev.source,
      ai_engine: ev.ai_engine,
      actor_type: ev.actor_type,
      created_at: ev.created_at,
    }));

    return NextResponse.json({
      total: eventsList.length,
      by_type: byTypeList,
      by_engine: byEngineList,
      timeline: timelineList,
      recent,
    });
  } catch (err) {
    console.error("Erro ao buscar métricas:", err);
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}
