import { getSupabase } from "@/lib/supabase";
import LandingOmniProfClient from "./LandingOmniProfClient";

export const revalidate = 3600;

export const metadata = {
    title: "OmniProf — Inteligência Artificial para Professores",
    description: "Crie PEIs em segundos, avaliações diagnósticas e atividades inclusivas usando nossos 5 motores de IA.",
    openGraph: {
        title: "OmniProf — Educação Inclusiva IA",
        description: "Crie PEIs em segundos, avaliações diagnósticas e atividades inclusivas.",
        url: "https://omnisfera.com.br/omniprof",
        siteName: "OmniProf",
        images: [
            {
                url: "https://omnisfera.com.br/og-omniprof.jpg",
                width: 1200,
                height: 630,
                alt: "OmniProf",
            },
        ],
        locale: "pt_BR",
        type: "website",
    },
};

export default async function OmniProfPage() {
    const sb = getSupabase();

    // Pegamos algumas métricas globais se quisermos usar no OmniProf também.
    const [schools, students, peis] = await Promise.all([
        sb.from("workspaces")
            .select("id", { count: "exact", head: true })
            .eq("active", true),
        sb.from("students")
            .select("id", { count: "exact", head: true })
            .eq("active", true),
        sb.from("pei")
            .select("id", { count: "exact", head: true })
            .eq("active", true)
    ]);

    const stats = {
        schools: schools.count || 450,
        students: students.count || 12000,
        peis: peis.count || 25000,
    };

    return <LandingOmniProfClient stats={stats} />;
}
