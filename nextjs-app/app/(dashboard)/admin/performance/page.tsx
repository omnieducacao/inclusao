import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SafeModuleWrapper } from "@/components/SafeModuleWrapper";
import PerformanceClient from "./PerformanceClient";
import { getSupabase } from "@/lib/supabase";

export default async function PerformancePage() {
    const session = await getSession();

    // Apenas Master ou Admin deve ver isso
    if (!session?.workspace_id || (session.user_role !== "master" && session.user_role !== "platform_admin")) {
        redirect("/login");
    }

    const sb = getSupabase();

    // Tenta pegar últimos vitals caso tabela exista
    let initialVitals = [];
    try {
        const { data } = await sb
            .from("web_vitals")
            .select("*")
            .order("timestamp", { ascending: false })
            .limit(100);

        if (data) initialVitals = data;
    } catch { /* expected fallback */
        // Silencioso se tabela não existir
    }

    return (
        <SafeModuleWrapper fallbackTitle="Dashboard de Performance">
            <PerformanceClient initialVitals={initialVitals} />
        </SafeModuleWrapper>
    );
}
