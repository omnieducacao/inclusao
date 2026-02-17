import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/announcements/mark-viewed
 * Marks an announcement as viewed by the current user
 */
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const workspaceId = session.workspace_id;
        const userEmail = session.usuario_nome;
        if (!workspaceId || !userEmail) {
            return NextResponse.json({ error: "Sessão inválida" }, { status: 400 });
        }

        const body = await request.json();
        const { announcementId, shownAsModal } = body;

        if (!announcementId) {
            return NextResponse.json({ error: "ID do aviso é obrigatório" }, { status: 400 });
        }

        const sb = getSupabase();

        // Insert or update the view record
        const { error } = await sb
            .from("announcement_views")
            .upsert({
                workspace_id: workspaceId,
                user_email: userEmail,
                announcement_id: announcementId,
                shown_as_modal: shownAsModal || false,
                viewed_at: new Date().toISOString(),
            }, {
                onConflict: "workspace_id,user_email,announcement_id"
            });

        if (error) {
            console.error("Error marking announcement as viewed:", error);
            return NextResponse.json({ error: "Erro ao registrar visualização." }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Mark viewed error:", err);
        return NextResponse.json({ error: "Erro ao registrar visualização." }, { status: 500 });
    }
}
