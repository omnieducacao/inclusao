import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import LandingClient from "./LandingClient";

export const metadata = {
    title: "Omnisfera — Educação Inclusiva com Inteligência Artificial",
    description:
        "Plataforma completa de inclusão educacional com IA. PEI, PAEE, avaliações diagnósticas, Hub de atividades e gestão escolar inclusiva.",
};

export default async function LandingPage() {
    // Se já logado, redireciona para dashboard
    const session = await getSession();
    if (session?.workspace_id) {
        redirect("/");
    }

    // Verificar se landing page está habilitada
    let enabled = false;
    try {
        const sb = getSupabase();
        const { data } = await sb
            .from("platform_config")
            .select("value")
            .eq("key", "landing_page_enabled")
            .maybeSingle();
        enabled = data?.value === "true" || data?.value === true;
    } catch {
        // Se erro, default para desabilitada
    }

    // Se desabilitada, redireciona para login
    if (!enabled) {
        redirect("/login");
    }

    // Buscar stats públicas para contadores
    let stats = { schools: 0, students: 0, peis: 0 };
    try {
        const sb = getSupabase();
        const [schoolsRes, studentsRes, peisRes] = await Promise.all([
            sb.from("workspaces").select("id", { count: "exact", head: true }),
            sb.from("students").select("id", { count: "exact", head: true }),
            sb
                .from("students")
                .select("id", { count: "exact", head: true })
                .not("pei_data", "is", null),
        ]);
        stats = {
            schools: schoolsRes.count || 0,
            students: studentsRes.count || 0,
            peis: peisRes.count || 0,
        };
    } catch {
        /* fallback to zeros */
    }

    return <LandingClient stats={stats} />;
}
