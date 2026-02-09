import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

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
      console.error("Erro ao buscar ia_usage:", iaError);
      return NextResponse.json({ usage: [] });
    }

    // Buscar workspaces para enriquecer dados
    const { data: workspaces } = await sb
      .from("workspaces")
      .select("id, name, plan, credits_limit");

    const wsMap = new Map((workspaces || []).map((w: any) => [w.id, w]));

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

    (iaUsage || []).forEach((usage: any) => {
      const wsId = usage.workspace_id;
      if (!wsId) return;

      const ws = wsMap.get(wsId);
      if (!byWorkspace.has(wsId)) {
        byWorkspace.set(wsId, {
          workspace_id: wsId,
          workspace_name: ws?.name || "—",
          red: 0,
          blue: 0,
          green: 0,
          yellow: 0,
          orange: 0,
          total_calls: 0,
          credits_used: 0,
          plan: ws?.plan || "basic",
          credits_limit: ws?.credits_limit || null,
        });
      }

      const entry = byWorkspace.get(wsId)!;
      const engine = (usage.engine || "").toLowerCase();
      if (engine === "red") entry.red++;
      else if (engine === "blue") entry.blue++;
      else if (engine === "green") entry.green++;
      else if (engine === "yellow") entry.yellow++;
      else if (engine === "orange") entry.orange++;

      entry.total_calls++;
      entry.credits_used += parseFloat(usage.credits_consumed || "1.0");
    });

    const usageList = Array.from(byWorkspace.values());

    return NextResponse.json({ usage: usageList });
  } catch (err) {
    console.error("Erro ao buscar uso de IA:", err);
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}
