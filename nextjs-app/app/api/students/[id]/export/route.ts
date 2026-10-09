import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logExport } from "@/lib/audit";
import { getStudent } from "@/lib/students";
import { logger } from "@/lib/logger";

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
    const workspaceId = session.workspace_id;
    if (!workspaceId) {
        return NextResponse.json({ error: "Sem escola na sessão" }, { status: 401 });
    }
    const supabase = getSupabase();

    try {
        // Onda 1: sempre dentro da escola da sessão (antes exportava qualquer id) e com as
        // tabelas que existem de fato (pei_data, PAEE e diário moram na própria linha do estudante).
        const student = await getStudent(workspaceId, studentId);
        if (!student) {
            return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
        }
        const decryptedStudent = student;
        const peiData = student.pei_data ? [student.pei_data] : [];
        const paeeCiclos = student.paee_ciclos || [];
        const diarioEntries = student.daily_logs || [];

        const doEstudante = (tabela: string) =>
            supabase.from(tabela).select("*").eq("student_id", studentId).eq("workspace_id", workspaceId);
        const [peiDisc, diag, proc, mon] = await Promise.all([
            doEstudante("pei_disciplinas"),
            doEstudante("avaliacoes_diagnosticas"),
            doEstudante("avaliacao_processual"),
            doEstudante("monitoring_assessments"),
        ]);
        const peiDisciplinas = peiDisc.data;
        const diagnosticaResults = diag.data;
        const processualResults = proc.data;
        const monitoramento = mon.data;

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
        logger.error({ err: err }, "[export] Error exporting student data:");
        return NextResponse.json({ error: "Erro ao exportar dados" }, { status: 500 });
    }
}
