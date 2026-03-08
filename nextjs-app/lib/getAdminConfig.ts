/**
 * Omnisfera — Server-Side Admin Config Helper
 *
 * Fetches the admin card_customizations config from the database
 * on the server side. Pass the result as `serverConfig` prop to
 * PageHero and PageAccentProvider to prevent FOUC.
 *
 * Usage in any Server Component page.tsx:
 *   const adminConfig = await getAdminConfig();
 *   <PageHero serverConfig={adminConfig} ... />
 *   <PageAccentProvider serverConfig={adminConfig} ... />
 */

import { getSupabase } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAdminConfig(): Promise<Record<string, any> | undefined> {
    try {
        const sb = getSupabase();
        const { data } = await sb
            .from("platform_config")
            .select("value")
            .eq("key", "card_customizations")
            .maybeSingle();

        if (data?.value) {
            return typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        }
    } catch {
        // Silent — fallback to client-side fetch
    }
    return undefined;
}
