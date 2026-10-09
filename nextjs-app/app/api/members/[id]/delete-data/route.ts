/**
 * POST /api/members/[id]/delete-data
 * LGPD Art. 18, VI — Direito à eliminação de dados
 * Anonimiza os dados pessoais do membro (soft-delete) e desativa o acesso.
 * Preserva integridade referencial e logs de auditoria.
 *
 * Onda 1: usava a tabela "members", que não existe, e não conferia a escola.
 */
import { NextResponse } from "next/server";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import { logger } from "@/lib/logger";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.workspace_id) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const { id } = await params;

        if (memberIdDaSessao(session) !== id && session.user_role !== "master" && !session.is_platform_admin) {
            return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
        }

        const sb = getSupabase();
        const { data: member } = await sb
            .from("workspace_members")
            .select("id, nome")
            .eq("id", id)
            .eq("workspace_id", session.workspace_id)
            .maybeSingle();

        if (!member) {
            return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
        }

        const anonSuffix = `_ANON_${Date.now()}`;
        const { error: updateError } = await sb
            .from("workspace_members")
            .update({
                nome: "Usuário removido",
                email: `removed${anonSuffix}@anon.local`,
                telefone: null,
                password_hash: null,
                active: false,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("workspace_id", session.workspace_id);

        if (updateError) {
            logger.error({ err: updateError }, "Erro ao anonimizar membro:");
            return NextResponse.json({ error: "Erro ao processar exclusão." }, { status: 500 });
        }

        await logAction({
            workspaceId: session.workspace_id,
            actorName: session.usuario_nome,
            actorRole: session.user_role,
            action: "delete",
            resourceType: "member",
            resourceId: id,
            metadata: { motivo: "LGPD Art. 18, VI", anonimizado: true },
        });

        return NextResponse.json({
            sucesso: true,
            mensagem: "Dados pessoais anonimizados com sucesso conforme LGPD Art. 18, VI.",
            nota: "Registros de auditoria foram preservados conforme exigido por lei.",
        });
    } catch (err) {
        logger.error({ err }, "Delete data error:");
        return NextResponse.json({ error: "Erro ao processar exclusão." }, { status: 500 });
    }
}
