import { getSupabase } from "@/lib/supabase";
import { FeedClient } from "./FeedClient";

/**
 * OmniProfFeed (Server Component)
 * Busca as publicações (avisos, changelog, dicas) diretamente no Supabase em tempo de servidor.
 */
export async function OmniProfFeed() {
    let feedItems = [];

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("omniprof_feed")
            .select("*")
            .eq("is_active", true)
            .order("date", { ascending: false });

        if (!error && data) {
            feedItems = data;
        } else {
            console.error("[OmniProfFeed] Supabase Error:", error);
            feedItems = getFallbackFeed();
        }
    } catch (e) {
        console.error("[OmniProfFeed] Exception:", e);
        feedItems = getFallbackFeed();
    }

    return <FeedClient initialItems={feedItems} />;
}

// Fallback gracefully se DB ainda não estiver populado localmente
function getFallbackFeed() {
    return [
        {
            id: "fallback-1",
            type: "changelog",
            title: "Nova Home do Dashboard",
            body: "Agora ao fazer login você encontra uma visão geral com módulos, ferramentas em destaque e acesso rápido personalizável.",
            date: new Date().toISOString().split("T")[0],
            icon: "🏠",
            color: "#2B6B8A",
        },
        {
            id: "fallback-2",
            type: "changelog",
            title: "Tour Guiado Inicial",
            body: "Na primeira visita, um wizard apresenta todas as funcionalidades do OmniProf.",
            date: new Date(Date.now() - 86400000).toISOString().split("T")[0], // ontem
            icon: "🗺️",
            color: "#8b5cf6",
        }
    ];
}
