import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/home/stats
 * Returns workspace-level KPIs for the home dashboard:
 * - Total students, with PEI, with PAEE
 * - Recent diário entries (7 days)
 * - PEI status (up to date vs stale)
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        if (session.is_platform_admin || !session.workspace_id) {
            return NextResponse.json({
                kpis: {
                    total_students: 0,
                    students_with_pei: 0,
                    recent_diario_entries: 0,
                    pei_up_to_date: 0,
                    pei_stale: 0,
                },
            });
        }

        const sb = getSupabase();
        const workspaceId = session.workspace_id;

        // Total students
        const { count: totalStudents } = await sb
            .from("students")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId);

        // Students with PEI
        const { count: studentsWithPei } = await sb
            .from("students")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .not("pei_data", "is", null);

        // Recent diário entries (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: recentDiario } = await sb
            .from("diario_registros")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .gte("criado_em", sevenDaysAgo.toISOString());

        // PEI freshness: updated in last 60 days vs older
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const { data: peiStudents } = await sb
            .from("students")
            .select("id, updated_at")
            .eq("workspace_id", workspaceId)
            .not("pei_data", "is", null);

        let peiUpToDate = 0;
        let peiStale = 0;
        if (peiStudents) {
            for (const s of peiStudents) {
                if (s.updated_at && new Date(s.updated_at) >= sixtyDaysAgo) {
                    peiUpToDate++;
                } else {
                    peiStale++;
                }
            }
        }

        return NextResponse.json({
            kpis: {
                total_students: totalStudents || 0,
                students_with_pei: studentsWithPei || 0,
                recent_diario_entries: recentDiario || 0,
                pei_up_to_date: peiUpToDate,
                pei_stale: peiStale,
            },
        });
    } catch (err) {
        console.error("Home stats error:", err);
        return NextResponse.json(
            { error: "Erro ao carregar estatísticas" },
            { status: 500 }
        );
    }
}
