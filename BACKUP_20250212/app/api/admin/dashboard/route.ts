import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
    const session = await getSession();
    if (!session?.is_platform_admin) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    try {
        const sb = getSupabase();

        // 1. Workspaces
        const { data: workspaces } = await sb.from("workspaces").select("id, name, active, created_at");
        const wsList = workspaces || [];
        const activeSchools = wsList.filter((w: any) => w.active !== false).length;
        const inactiveSchools = wsList.length - activeSchools;

        // 2. Members (users)
        const { data: members } = await sb.from("workspace_members").select("id, workspace_id, nome, role, active");
        const membersList = members || [];
        const totalUsers = membersList.length;
        const activeUsers = membersList.filter((m: any) => m.active !== false).length;

        // Users per school
        const usersPerSchool = wsList.map((ws: any) => {
            const count = membersList.filter((m: any) => m.workspace_id === ws.id).length;
            return { id: ws.id, name: ws.name, active: ws.active !== false, users: count };
        });

        // 3. Students
        const { count: totalStudents } = await sb.from("students").select("id", { count: "exact", head: true });
        const { count: studentsWithPei } = await sb
            .from("students")
            .select("id", { count: "exact", head: true })
            .not("pei_data", "is", null);

        // Students per school
        const { data: studentsByWs } = await sb
            .from("students")
            .select("workspace_id");
        const studentsMap: Record<string, number> = {};
        (studentsByWs || []).forEach((s: any) => {
            studentsMap[s.workspace_id] = (studentsMap[s.workspace_id] || 0) + 1;
        });

        const schoolBreakdown = usersPerSchool.map((ws) => ({
            ...ws,
            students: studentsMap[ws.id] || 0,
        }));

        // 4. Recent activity (last 7 days)
        const since = new Date();
        since.setDate(since.getDate() - 7);
        const { count: recentEvents } = await sb
            .from("usage_events")
            .select("id", { count: "exact", head: true })
            .gte("created_at", since.toISOString());

        return NextResponse.json({
            kpis: {
                total_schools: wsList.length,
                active_schools: activeSchools,
                inactive_schools: inactiveSchools,
                total_users: totalUsers,
                active_users: activeUsers,
                total_students: totalStudents || 0,
                students_with_pei: studentsWithPei || 0,
                recent_events_7d: recentEvents || 0,
            },
            school_breakdown: schoolBreakdown.sort((a, b) => b.students - a.students),
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        return NextResponse.json({ error: "Erro ao carregar dashboard." }, { status: 500 });
    }
}
