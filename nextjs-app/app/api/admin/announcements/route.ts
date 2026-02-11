import { parseBody, adminAnnouncementSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

const CONFIG_KEY = "announcements";

type Announcement = {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "alert";
    target: "all" | string; // "all" or workspace_id
    active: boolean;
    created_at: string;
    expires_at?: string;
};

// GET: List announcements (admin or user-facing)
export async function GET(req: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    try {
        const sb = getSupabase();
        const { data } = await sb
            .from("platform_config")
            .select("value")
            .eq("key", CONFIG_KEY)
            .maybeSingle();

        let announcements: Announcement[] = [];
        try {
            announcements = data?.value ? JSON.parse(data.value) : [];
        } catch {
            announcements = [];
        }

        // If not admin, filter to active and relevant announcements
        if (!session.is_platform_admin) {
            const now = new Date().toISOString();
            announcements = announcements.filter(
                (a) =>
                    a.active &&
                    (a.target === "all" || a.target === session.workspace_id) &&
                    (!a.expires_at || a.expires_at > now)
            );
        }

        return NextResponse.json({ announcements });
    } catch (err) {
        console.error("Announcements GET error:", err);
        return NextResponse.json({ error: "Erro ao buscar avisos." }, { status: 500 });
    }
}

// POST: Create/update announcements (admin only)
export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.is_platform_admin) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    try {
        const parsed = await parseBody(req, adminAnnouncementSchema);
        if (parsed.error) return parsed.error;
        const body = parsed.data;
        const { action, announcement, announcement_id } = body;

        const sb = getSupabase();
        const { data } = await sb
            .from("platform_config")
            .select("value")
            .eq("key", CONFIG_KEY)
            .maybeSingle();

        let announcements: Announcement[] = [];
        try {
            announcements = data?.value ? JSON.parse(data.value) : [];
        } catch {
            announcements = [];
        }

        if (action === "create") {
            if (!announcement) {
                return NextResponse.json({ error: "Dados do aviso obrigatórios." }, { status: 400 });
            }
            const newAnnouncement: Announcement = {
                id: crypto.randomUUID(),
                title: announcement.title || "",
                message: announcement.message || "",
                type: announcement.type || "info",
                target: announcement.target || "all",
                active: true,
                created_at: new Date().toISOString(),
                expires_at: announcement.expires_at || undefined,
            };
            announcements.unshift(newAnnouncement);
        } else if (action === "toggle" && announcement_id) {
            const idx = announcements.findIndex((a) => a.id === announcement_id);
            if (idx >= 0) {
                announcements[idx].active = !announcements[idx].active;
            }
        } else if (action === "delete" && announcement_id) {
            announcements = announcements.filter((a) => a.id !== announcement_id);
        } else {
            return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
        }

        // Save back
        await sb
            .from("platform_config")
            .upsert({ key: CONFIG_KEY, value: JSON.stringify(announcements) }, { onConflict: "key" });

        return NextResponse.json({ ok: true, announcements });
    } catch (err) {
        console.error("Announcements POST error:", err);
        return NextResponse.json({ error: "Erro ao salvar aviso." }, { status: 500 });
    }
}
