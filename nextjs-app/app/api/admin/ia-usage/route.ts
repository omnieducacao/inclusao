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
  const days = parseInt(searchParams.get("days") || "30", 10);

  try {
    const sb = getSupabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Buscar uso de IA por workspace
    const { data: iaUsage, error } = await sb
      .from("ia_usage")
      .select("*, workspaces(name)")
      .gte("created_at", cutoffDate.toISOString());

    if (error) {
      console.error("Erro ao buscar uso de IA:", error);
      return NextResponse.json({ usage: [], error: "Tabela ia_usage não existe ainda." });
    }

    // Agrupar por workspace
    const usageByWorkspace: Record<
      string,
      {
        workspace_id: string;
        workspace_name: string;
        red: number;
        blue: number;
        green: number;
        yellow: number;
        orange: number;
        total_calls: number;
        credits_used: number;
      }
    > = {};

    for (const usage of iaUsage || []) {
      const wid = usage.workspace_id || "";
      if (!usageByWorkspace[wid]) {
        usageByWorkspace[wid] = {
          workspace_id: wid,
          workspace_name: (usage.workspaces as { name?: string })?.name || "—",
          red: 0,
          blue: 0,
          green: 0,
          yellow: 0,
          orange: 0,
          total_calls: 0,
          credits_used: 0,
        };
      }

      const engine = usage.engine || "";
      const count = usage.call_count || 1;
      const credits = usage.credits_used || 1;

      if (engine === "red") usageByWorkspace[wid].red += count;
      else if (engine === "blue") usageByWorkspace[wid].blue += count;
      else if (engine === "green") usageByWorkspace[wid].green += count;
      else if (engine === "yellow") usageByWorkspace[wid].yellow += count;
      else if (engine === "orange") usageByWorkspace[wid].orange += count;

      usageByWorkspace[wid].total_calls += count;
      usageByWorkspace[wid].credits_used += credits;
    }

    // Buscar planos e limites das escolas
    const { data: workspaces } = await sb.from("workspaces").select("id, plan, credits_limit");

    const wsMap = new Map((workspaces || []).map((w: { id: string; plan?: string; credits_limit?: number }) => [w.id, w]));

    const usageList = Object.values(usageByWorkspace).map((u) => {
      const ws = wsMap.get(u.workspace_id);
      return {
        ...u,
        plan: ws?.plan || "basic",
        credits_limit: ws?.credits_limit || null,
      };
    });

    return NextResponse.json({ usage: usageList });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar uso de IA." },
      { status: 500 }
    );
  }
}
