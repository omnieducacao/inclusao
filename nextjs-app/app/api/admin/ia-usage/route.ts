import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  try {
    const sb = getSupabase();
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Buscar uso de IA
    const { data: iaUsage, error: iaError } = await sb
      .from("ia_usage")
      .select("workspace_id, engine, credits_consumed, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    if (iaError) {
      logger.error({ err: iaError }, "Erro ao buscar ia_usage:");
      return NextResponse.json({ usage: [] });
    }

    // Buscar workspaces para enriquecer dados
    const { data: workspaces } = await sb
      .from("workspaces")
      .select("id, name, plan, credits_limit");

    const wsMap = new Map((workspaces || []).map((w: Record<string, unknown>) => [w.id, w]));

    // Agregar por workspace
    const byWorkspace = new Map<string, {
      workspace_id: string;
      workspace_name: string;
      red: number;
      blue: number;
      green: number;
      yellow: number;
      orange: number;
      total_calls: number;
      credits_used: number;
      plan: string;
      credits_limit: number | null;
    }>();

    (iaUsage || []).forEach((usage: Record<string, unknown>) => {
      const wsId = String(usage.workspace_id || "");
      if (!wsId) return;

      const ws = wsMap.get(wsId) as Record<string, unknown> | undefined;
      if (!byWorkspace.has(wsId)) {
        byWorkspace.set(wsId, {
          workspace_id: wsId,
          workspace_name: String(ws?.name || "—"),
          red: 0,
          blue: 0,
          green: 0,
          yellow: 0,
          orange: 0,
          total_calls: 0,
          credits_used: 0,
          plan: String(ws?.plan || "basic"),
          credits_limit: (ws?.credits_limit as number) || null,
        });
      }

      const entry = byWorkspace.get(wsId)!;
      const engine = String(usage.engine || "").toLowerCase();
      if (engine === "red") entry.red++;
      else if (engine === "blue") entry.blue++;
      else if (engine === "green") entry.green++;
      else if (engine === "yellow") entry.yellow++;
      else if (engine === "orange") entry.orange++;

      entry.total_calls++;
      entry.credits_used += parseFloat(String(usage.credits_consumed || "1.0"));
    });

    // 10/10/2026: custo estimado por escola, das chamadas registradas com tokens (usage_events.metadata.cost_usd)
    const custo = new Map<string, number>();
    const { data: eventos } = await sb.from("usage_events").select("workspace_id, metadata")
      .eq("event_type", "ai_call").gte("created_at", since.toISOString()).limit(20000);
    for (const ev of (eventos || []) as Array<{ workspace_id: string | null; metadata: { cost_usd?: unknown } | null }>) {
      const v = Number(ev.metadata?.cost_usd);
      if (ev.workspace_id && Number.isFinite(v) && v > 0) custo.set(ev.workspace_id, (custo.get(ev.workspace_id) || 0) + v);
    }

    const usageList = Array.from(byWorkspace.values()).map((u) => ({ ...u, custo_usd: Math.round((custo.get(u.workspace_id) || 0) * 10000) / 10000 }));

    return NextResponse.json({ usage: usageList });
  } catch (err) {
    logger.error({ err: err }, "Erro ao buscar uso de IA:");
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}
