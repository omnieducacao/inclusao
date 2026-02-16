import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/notifications/dismiss
 * Marks an announcement notification as dismissed
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
        const { notificationId } = body;

        if (!notificationId || !notificationId.startsWith("announcement-")) {
            return NextResponse.json({ error: "ID de notificação inválido" }, { status: 400 });
        }

        // Extract announcement ID from notification ID (format: "announcement-{uuid}")
        const announcementId = notificationId.replace("announcement-", "");

        const sb = getSupabase();

        // Update or insert the dismissal
        const { error } = await sb
            .from("announcement_views")
            .upsert({
                workspace_id: workspaceId,
                user_email: userEmail,
                announcement_id: announcementId,
                dismissed: true,
                viewed_at: new Date().toISOString(),
            }, {
                onConflict: "workspace_id,user_email,announcement_id"
            });

        if (error) {
            console.error("Error dismissing notification:", error);
            return NextResponse.json({ error: "Erro ao dispensar notificação." }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Dismiss notification error:", err);
        return NextResponse.json({ error: "Erro ao dispensar notificação." }, { status: 500 });
    }
}
