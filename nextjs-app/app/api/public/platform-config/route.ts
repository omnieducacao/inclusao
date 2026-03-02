import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * Public read-only endpoint for platform config.
 * Only whitelisted keys are served (no auth required).
 * Admin writes still go through /api/admin/platform-config.
 */
const PUBLIC_KEYS = new Set([
    "card_customizations",
    "topbar_customizations",
]);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || "";

    if (!key || !PUBLIC_KEYS.has(key)) {
        return NextResponse.json({ error: "Key not allowed" }, { status: 400 });
    }

    try {
        const sb = getSupabase();
        const { data, error } = await sb
            .from("platform_config")
            .select("value")
            .eq("key", key)
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ value: data?.value || "" });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro" },
            { status: 500 }
        );
    }
}
