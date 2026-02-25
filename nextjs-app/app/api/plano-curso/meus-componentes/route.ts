import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/plano-curso/meus-componentes
 * Retorna os componentes + séries do professor logado
 * baseado em teacher_assignments.
 *
 * Resposta: { componentes: [{ serie, serieCode, componente, componenteId, classGroup }] }
 */
export async function GET() {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const sb = getSupabase();

    // 1. Resolver member_id do professor logado
    let memberId = (session.member as Record<string, unknown> | undefined)?.id as string | undefined;
    if (!memberId) {
        const { data: m } = await sb
            .from("workspace_members")
            .select("id")
            .eq("workspace_id", session.workspace_id)
            .eq("name", session.usuario_nome)
            .maybeSingle();
        memberId = m?.id || undefined;
    }

    const isMaster = !!(session.member as Record<string, boolean> | undefined)?.is_master ||
        session.is_platform_admin;

    // 2. Buscar teacher_assignments
    let assignmentsQuery = sb
        .from("teacher_assignments")
        .select("workspace_member_id, class_id, component_id")
        .eq("workspace_id", session.workspace_id);

    if (!isMaster && memberId) {
        assignmentsQuery = assignmentsQuery.eq("workspace_member_id", memberId);
    }

    const { data: assignments } = await assignmentsQuery;
    if (!assignments?.length) {
        return NextResponse.json({ componentes: [], is_master: isMaster });
    }

    // 3. Buscar classes, grades e components
    const classIds = [...new Set(assignments.map(a => a.class_id))];
    const componentIds = [...new Set(assignments.map(a => a.component_id).filter(Boolean))];

    const { data: classes } = await sb
        .from("classes")
        .select("id, grade_id, class_group")
        .in("id", classIds);

    const gradeIds = [...new Set((classes || []).map(c => c.grade_id).filter(Boolean))];
    const { data: grades } = gradeIds.length > 0
        ? await sb.from("grades").select("id, code, label").in("id", gradeIds)
        : { data: [] };

    const { data: components } = componentIds.length > 0
        ? await sb.from("components").select("id, label").in("id", componentIds)
        : { data: [] };

    const gradeMap = new Map((grades || []).map(g => [g.id, g]));
    const componentMap = new Map((components || []).map(c => [c.id, c.label]));
    const classMap = new Map((classes || []).map(c => [c.id, c]));

    // 4. Montar lista de combos (série + componente)
    const combos = new Map<string, {
        serie: string;
        serieCode: string;
        componente: string;
        componenteId: string | null;
        classGroup: string;
        gradeId: string;
    }>();

    for (const a of assignments) {
        const cls = classMap.get(a.class_id);
        if (!cls) continue;
        const grade = gradeMap.get(cls.grade_id);
        if (!grade) continue;

        const componentName = componentMap.get(a.component_id) || "Geral";
        const key = `${grade.id}:${componentName}`;

        if (!combos.has(key)) {
            // Build friendly serie label
            const labelParts = (grade.label || "").split(":");
            const serieLabel = labelParts.length > 1 ? labelParts[1].trim() : grade.label || grade.code;

            combos.set(key, {
                serie: serieLabel,
                serieCode: grade.code || "",
                componente: componentName,
                componenteId: a.component_id || null,
                classGroup: cls.class_group || "",
                gradeId: grade.id,
            });
        }
    }

    return NextResponse.json({
        componentes: Array.from(combos.values()),
        is_master: isMaster,
        professor: { id: memberId, name: session.usuario_nome },
    });
}
