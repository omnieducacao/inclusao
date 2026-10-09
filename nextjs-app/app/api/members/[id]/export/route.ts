/**
 * GET /api/members/[id]/export
 * LGPD Art. 18, V — Portabilidade de dados
 * Exporta os dados pessoais do membro em JSON.
 *
 * Onda 1: usava tabelas que não existem ("members", "diario_registros", "audit_logs") e, para a
 * coordenação, deixava exportar membro de qualquer escola. Agora fica dentro da escola da sessão.
 */
import { NextResponse } from "next/server";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.workspace_id) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const { id } = await params;

        // Apenas o próprio membro ou a coordenação da mesma escola
        if (memberIdDaSessao(session) !== id && session.user_role !== "master" && !session.is_platform_admin) {
            return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
        }

        const sb = getSupabase();
        const { data: member } = await sb
            .from("workspace_members")
            .select("id, nome, email, telefone, cargo, papel, link_type, created_at, terms_accepted_at")
            .eq("id", id)
            .eq("workspace_id", session.workspace_id)
            .maybeSingle();

        if (!member) {
            return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
        }

        const [{ data: vinculos }, { data: turmas }, { count: registrosAuditoria }] = await Promise.all([
            sb.from("teacher_student_links").select("student_id").eq("workspace_member_id", id),
            sb.from("teacher_assignments").select("class_id, component_id").eq("workspace_member_id", id),
            sb.from("audit_log").select("id", { count: "exact", head: true })
                .eq("workspace_id", session.workspace_id).in("actor_id", [id, member.nome]),
        ]);

        const exportData = {
            exportado_em: new Date().toISOString(),
            formato: "LGPD Art. 18, V — Portabilidade",
            membro: member,
            turmas_em_que_leciona: turmas || [],
            estudantes_vinculados: (vinculos || []).map((v: { student_id: string }) => v.student_id),
            registros_de_auditoria: registrosAuditoria || 0,
        };

        const nomeArquivo = String(member.nome || id).normalize("NFD").replace(/[^\w]+/g, "_");
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="dados_${nomeArquivo}.json"`,
            },
        });
    } catch (err) {
        logger.error({ err }, "Export data error:");
        return NextResponse.json({ error: "Erro ao exportar dados." }, { status: 500 });
    }
}
