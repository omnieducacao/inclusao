import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logExport } from "@/lib/audit";
import { decryptField } from "@/lib/encryption";

/**
 * GET /api/students/[id]/export
 * 
 * LGPD Art. 18 — Portabilidade de dados.
 * Exports all data for a specific student as JSON.
 * Only accessible by master users.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Only masters can export student data
    const isMaster = session.user_role === "master" || session.is_platform_admin;
    if (!isMaster) {
        return NextResponse.json({ error: "Apenas masters podem exportar dados de estudantes" }, { status: 403 });
    }

    const { id: studentId } = await params;
    const supabase = getSupabase();

    try {
        // 1. Student core data
        const { data: student, error: studentError } = await supabase
            .from("students")
            .select("*")
            .eq("id", studentId)
            .single();

        if (studentError || !student) {
            return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
        }

        // Decrypt sensitive fields (safe — decryptField handles non-encrypted data)
        let decryptedName = student.name;
        let decryptedGrade = student.grade;
        try {
            if (student.name) decryptedName = decryptField(student.name);
        } catch { /* not encrypted */ }
        try {
            if (student.grade) decryptedGrade = decryptField(student.grade);
        } catch { /* not encrypted */ }

        const decryptedStudent = {
            ...student,
            name: decryptedName,
            grade: decryptedGrade,
        };

        // 2. PEI data
        const { data: peiData } = await supabase
            .from("pei_data")
            .select("*")
            .eq("student_id", studentId);

        // 3. PEI Disciplinas
        const { data: peiDisciplinas } = await supabase
            .from("pei_disciplina")
            .select("*")
            .eq("student_id", studentId);

        // 4. PAEE Ciclos
        const { data: paeeCiclos } = await supabase
            .from("paee_ciclos")
            .select("*")
            .eq("student_id", studentId);

        // 5. Diário entries
        const { data: diarioEntries } = await supabase
            .from("diario_registros")
            .select("*")
            .eq("student_id", studentId);

        // 6. Diagnóstica results
        const { data: diagnosticaResults } = await supabase
            .from("avaliacao_diagnostica")
            .select("*")
            .eq("student_id", studentId);

        // 7. Processual results
        const { data: processualResults } = await supabase
            .from("avaliacao_processual")
            .select("*")
            .eq("student_id", studentId);

        // 8. Monitoramento
        const { data: monitoramento } = await supabase
            .from("monitoramento_rubricas")
            .select("*")
            .eq("student_id", studentId);

        // Compose export
        const exportData = {
            _meta: {
                exportedAt: new Date().toISOString(),
                exportedBy: session.usuario_nome,
                format: "json",
                lgpdBasis: "portabilidade (Art. 18, VIII)",
                platformVersion: "Omnisfera v2",
            },
            student: decryptedStudent,
            pei: peiData || [],
            peiDisciplinas: peiDisciplinas || [],
            paee: paeeCiclos || [],
            diario: diarioEntries || [],
            diagnostica: diagnosticaResults || [],
            processual: processualResults || [],
            monitoramento: monitoramento || [],
        };

        // Log the export action (LGPD compliance)
        await logExport({
            workspaceId: session.workspace_id,
            actorName: session.usuario_nome,
            actorRole: session.user_role,
            resourceType: "student",
            resourceId: studentId,
            format: "json",
        });

        return NextResponse.json(exportData);
    } catch (err) {
        console.error("[export] Error exporting student data:", err);
        return NextResponse.json({ error: "Erro ao exportar dados" }, { status: 500 });
    }
}
