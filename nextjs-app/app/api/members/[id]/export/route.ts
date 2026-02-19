/**
 * GET /api/members/[id]/export
 * LGPD Art. 18, V — Portabilidade de dados
 * Exporta todos os dados pessoais do membro em formato JSON.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

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

        // Apenas o próprio membro ou admin pode exportar
        const memberId = (session.member as Record<string, unknown>)?.id as string;
        if (memberId !== id && session.user_role !== "master") {
            return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
        }

        const sb = getSupabase();

        // Buscar dados do membro
        const { data: member, error: memberError } = await sb
            .from("members")
            .select("*")
            .eq("id", id)
            .single();

        if (memberError || !member) {
            return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
        }

        // Buscar dados relacionados
        const [
            { data: students },
            { data: diarioRegistros },
            { data: auditLogs },
        ] = await Promise.all([
            sb.from("students").select("*").eq("workspace_id", session.workspace_id),
            sb.from("diario_registros").select("*").eq("workspace_id", session.workspace_id).limit(500),
            sb.from("audit_logs").select("*").eq("user_id", member.user_id).limit(200),
        ]);

        const exportData = {
            exportado_em: new Date().toISOString(),
            formato: "LGPD Art. 18, V — Portabilidade",
            membro: {
                id: member.id,
                nome: member.name,
                email: member.email,
                role: member.role,
                criado_em: member.created_at,
                terms_accepted_at: member.terms_accepted_at,
            },
            estudantes: (students || []).map((s: Record<string, unknown>) => ({
                id: s.id,
                nome: s.name,
                serie: s.grade,
                criado_em: s.created_at,
            })),
            registros_diario: (diarioRegistros || []).length,
            logs_auditoria: (auditLogs || []).length,
        };

        // Retornar como JSON para download
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="dados_${member.name?.replace(/\s+/g, "_") || id}.json"`,
            },
        });
    } catch (err) {
        console.error("Export data error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao exportar dados." },
            { status: 500 }
        );
    }
}
