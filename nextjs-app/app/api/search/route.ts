import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/search?q=query
 * Searches students + members within the user's workspace scope.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.workspace_id) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const q = req.nextUrl.searchParams.get("q")?.trim();
        if (!q || q.length < 2) {
            return NextResponse.json({ students: [], members: [] });
        }

        const sb = getSupabase();
        const workspaceId = session.workspace_id;
        const searchPattern = `%${q}%`;

        // Search students by name
        const { data: students } = await sb
            .from("students")
            .select("id, name, grade, class_group, pei_data")
            .eq("workspace_id", workspaceId)
            .ilike("name", searchPattern)
            .limit(10);

        // Format student results
        type StudentRow = { id: string; name: string; grade: string | null; class_group: string | null; pei_data: Record<string, unknown> | null };
        const studentResults = (students as StudentRow[] || []).map((s) => ({
            id: s.id,
            name: s.name,
            subtitle: [s.grade, s.class_group].filter(Boolean).join(" — "),
            diagnosis: (s.pei_data?.diagnostico as string) || "",
            type: "student" as const,
        }));

        // Also search by diagnosis text within pei_data
        const { data: allStudents } = await sb
            .from("students")
            .select("id, name, grade, class_group, pei_data")
            .eq("workspace_id", workspaceId)
            .limit(50);

        const existingIds = new Set(studentResults.map((sr) => sr.id));
        const diagResults = (allStudents as StudentRow[] || [])
            .filter((s) => {
                const diag = (s.pei_data?.diagnostico as string) || "";
                return diag.toLowerCase().includes(q.toLowerCase()) && !existingIds.has(s.id);
            })
            .slice(0, 5)
            .map((s) => ({
                id: s.id,
                name: s.name,
                subtitle: [s.grade, s.class_group].filter(Boolean).join(" — "),
                diagnosis: (s.pei_data?.diagnostico as string) || "",
                type: "student" as const,
            }));

        // Search members — only for coordinators/admin/gestor
        type MemberRow = { id: string; name: string; email: string; role: string };
        let memberResults: { id: string; name: string; subtitle: string; role: string; type: "member" }[] = [];
        const memberRole = (session.member as Record<string, unknown>)?.role as string || "";
        if (session.user_role === "master" || session.user_role === "platform_admin" || ["admin", "coordenador", "gestor"].includes(memberRole)) {
            const { data: members } = await sb
                .from("members")
                .select("id, name, email, role")
                .eq("workspace_id", workspaceId)
                .or(`name.ilike.${searchPattern},email.ilike.${searchPattern}`)
                .limit(10);

            memberResults = (members as MemberRow[] || []).map((m) => ({
                id: m.id,
                name: m.name,
                subtitle: m.email,
                role: m.role,
                type: "member" as const,
            }));
        }

        return NextResponse.json({
            students: [...studentResults, ...diagResults].slice(0, 10),
            members: memberResults,
        });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Erro na busca" }, { status: 500 });
    }
}
