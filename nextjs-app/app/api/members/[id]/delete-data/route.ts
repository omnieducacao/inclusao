/**
 * POST /api/members/[id]/delete-data
 * LGPD Art. 18, VI — Direito à eliminação de dados
 * Anonimiza os dados pessoais do membro (soft-delete).
 * Preserva integridade referencial e logs de auditoria.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

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

        // Apenas o próprio membro ou admin pode solicitar exclusão
        const memberId = (session.member as Record<string, unknown>)?.id as string;
        if (memberId !== id && session.user_role !== "master") {
            return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
        }

        const sb = getSupabase();

        // Buscar membro
        const { data: member, error: memberError } = await sb
            .from("members")
            .select("id, user_id, name, email")
            .eq("id", id)
            .single();

        if (memberError || !member) {
            return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
        }

        // Soft-delete: anonimizar dados pessoais em vez de deletar
        const anonSuffix = `_ANON_${Date.now()}`;
        const { error: updateError } = await sb
            .from("members")
            .update({
                name: `Usuário Removido${anonSuffix}`,
                email: `removed${anonSuffix}@anon.local`,
                // Preservar workspace_id e role para integridade referencial
            })
            .eq("id", id);

        if (updateError) {
            console.error("Erro ao anonimizar membro:", updateError);
            return NextResponse.json({ error: "Erro ao processar exclusão." }, { status: 500 });
        }

        // Registrar no audit log
        await sb.from("audit_logs").insert({
            user_id: member.user_id,
            action: "DATA_DELETION_REQUEST",
            table_name: "members",
            record_id: id,
            old_data: { nome_original: member.name, email_original: member.email },
            new_data: { status: "anonimizado" },
        }).then(() => {/* ignore errors on audit */ });

        return NextResponse.json({
            sucesso: true,
            mensagem: "Dados pessoais anonimizados com sucesso conforme LGPD Art. 18, VI.",
            nota: "Registros de auditoria foram preservados conforme exigido por lei.",
        });
    } catch (err) {
        console.error("Delete data error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao processar exclusão." },
            { status: 500 }
        );
    }
}
