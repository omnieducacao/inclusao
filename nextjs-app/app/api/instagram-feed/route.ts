import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * GET /api/instagram-feed
 * Feed público — posts publicados, ordenados por posição e data
 */
export async function GET() {
    try {
        const sb = getSupabase();
        const { data, error } = await sb
            .from("omnisfera_feed")
            .select("id, title, caption, category, instagram_url, images, created_at")
            .eq("published", true)
            .order("position", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(10);

        if (error) throw error;
        return NextResponse.json({ posts: data || [] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: unknown) {
        logger.error({ err: err }, "[instagram-feed] GET error:");
        return NextResponse.json({ posts: [] });
    }
}
