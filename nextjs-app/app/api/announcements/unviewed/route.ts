import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * GET /api/announcements/unviewed
 * Returns announcements that the current user hasn't viewed yet
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const sb = getSupabase();
        const workspaceId = session.workspace_id;
        // Family: use family_responsible_id; members/masters: use usuario_nome (identifier)
        const userIdentifier =
            session.user_role === "family" && session.family_responsible_id
                ? `family_${session.family_responsible_id}`
                : session.usuario_nome;

        // Platform admins don't have workspace context
        if (session.is_platform_admin || !workspaceId || !userIdentifier) {
            return NextResponse.json({ announcements: [] });
        }

        // Get all active announcements from platform_config
        const { data: configData } = await sb
            .from("platform_config")
            .select("value")
            .eq("key", "announcements")
            .maybeSingle();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let allAnnouncements: any[] = [];
        if (configData?.value) {
            try {
                allAnnouncements = JSON.parse(configData.value);
            } catch {
                allAnnouncements = [];
            }
        }

        // --- INJEÇÃO NATIVA DE SYSTEM DEPLOY (Release Notes Automáticas) ---
        // Aqui garantimos a visibilidade das novas features estruturais
        allAnnouncements.push({
            id: "release-a11y-wcag-aaa-v1",
            title: "Tornando a Educação Mais Inclusiva 💙",
            message: "Acabamos de lançar as novas ferramentas avançadas de Acessibilidade da Omnisfera!\n\nVocê pode personalizar a interface diretamente no cabeçalho superior (ícone de Opções visuais). Lá você encontra acesso instantâneo ao:\n\n• Modo de Alto Contraste\n• Tipografia adaptada para Dislexia (Fonte Lexend)\n• Filtros de Correção de Daltonismo (Protanopia, Deuteranopia e Tritanopia)\n\nExperimente e ajuste a plataforma para o seu conforto visual absoluto!",
            type: "info",
            target: "all",
            active: true
        });
        // ------------------------------------------------------------------

        const now = new Date().toISOString();

        // Filter to active, non-expired, relevant announcements
        const relevantAnnouncements = allAnnouncements.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (a: any) =>
                a.active &&
                (a.target === "all" || a.target === workspaceId) &&
                (!a.expires_at || a.expires_at > now)
        );

        // Get already viewed announcements for this user
        const { data: viewedData } = await sb
            .from("announcement_views")
            .select("announcement_id")
            .eq("workspace_id", workspaceId)
            .eq("user_email", userIdentifier);

        const viewedIds = new Set(viewedData?.map((v) => v.announcement_id) || []);

        // Return unviewed announcements
        const unviewedAnnouncements = relevantAnnouncements.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (a: any) => !viewedIds.has(a.id)
        );

        return NextResponse.json({ announcements: unviewedAnnouncements });
    } catch (err) {
        logger.error({ err: err }, "Unviewed announcements error:");
        return NextResponse.json({ error: "Erro ao buscar avisos." }, { status: 500 });
    }
}
