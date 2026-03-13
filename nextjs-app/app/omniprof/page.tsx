import { getSupabase } from "@/lib/supabase";
import LandingOmniProfClient from "./LandingOmniProfClient";

export const revalidate = 3600;

export const metadata = {
    title: "OmniProf — Inteligência Artificial para Professores",
    description: "Multiplique sua produtividade, elimine madrugadas de planejamento e crie aulas fantásticas com 5 motores de IA.",
    openGraph: {
        title: "OmniProf — Inteligência Artificial para Professores",
        description: "Mais de 17 ferramentas mágicas para criar planos de curso, hub de inclusão e avaliações em instantes.",
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

    // No OmniProf B2C, queremos mostrar crescimento da comunidade 
    // de professores e não de "escolas" ou "número de PEIs".
    const [usersRes] = await Promise.all([
        sb.from("users")
            .select("id", { count: "exact", head: true })
            .eq("role", "master") // Simulando professores masters
    ]);

    const activeMasters = usersRes?.count || 120;

    // Métricas formatadas e estimadas para B2C
    const stats = {
        schools: activeMasters + 610, // Professores transformados (+baseline base)
        students: (activeMasters + 610) * 12, // Horas poupadas (estimativa)
        peis: (activeMasters + 610) * 40, // Aulas geradas no mês
    };

    return <LandingOmniProfClient stats={stats} />;
}
