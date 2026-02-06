import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

async function checkAdmin() {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  return null;
}

export async function GET(req: Request) {
  const adminCheck = await checkAdmin();
  if (adminCheck) return adminCheck;

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7", 10);

  try {
    const sb = getSupabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Buscar eventos de uso
    const { data: events, error } = await sb
      .from("usage_events")
      .select("*")
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Erro ao buscar eventos:", error);
      // Se a tabela não existir, retornar vazio
      return NextResponse.json({ usage: null, error: "Tabela usage_events não existe ainda." });
    }

    // Agrupar por tipo de evento
    const byType: Record<string, number> = {};
    const byEngine: Record<string, number> = {};
    const timeline: Record<string, number> = {};
    let total = 0;

    for (const event of events || []) {
      total++;
      const eventType = event.event_type || "unknown";
      byType[eventType] = (byType[eventType] || 0) + 1;

      const engine = event.ai_engine || "—";
      byEngine[engine] = (byEngine[engine] || 0) + 1;

      const day = event.created_at ? new Date(event.created_at).toISOString().slice(0, 10) : "";
      if (day) {
        timeline[day] = (timeline[day] || 0) + 1;
      }
    }

    return NextResponse.json({
      usage: {
        total,
        by_type: Object.entries(byType).map(([event_type, count]) => ({ event_type, count })),
        by_engine: Object.entries(byEngine).map(([ai_engine, count]) => ({ ai_engine, count })),
        timeline: Object.entries(timeline).map(([day, count]) => ({ day, count })),
        recent: events?.slice(0, 20) || [],
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar uso." },
      { status: 500 }
    );
  }
}
