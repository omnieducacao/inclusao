import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import LandingClient from "./LandingClient";

export const metadata = {
    title: "Omnisfera — PEI, AEE e sala de aula no mesmo lugar",
    description:
        "Plataforma de inclusão escolar: estudo de caso, PEI, PAEE, diário de bordo, avaliações e acompanhamento da coordenação, com inteligência artificial. Para escolas particulares e redes públicas.",
    alternates: { canonical: "https://omnisfera.net/" },
    openGraph: {
        title: "Omnisfera — PEI, AEE e sala de aula no mesmo lugar",
        description: "A plataforma que organiza a inclusão da escola, do estudo de caso à sala de aula.",
        url: "https://omnisfera.net/",
        siteName: "Omnisfera",
        locale: "pt_BR",
        type: "website",
        images: ["https://omnisfera.net/site/og.png"],
    },
};

/**
 * Home de vendas (onda 38). O proxy.ts mostra esta página em "/" para quem não está logado.
 * Chave "landing_page_enabled" (Administração → Página inicial): desligada, quem chega vai para o
 * conteúdo sobre inclusão (/inclusao), como era antes.
 */
export default async function LandingPage() {
    const session = await getSession();
    if (session?.workspace_id) {
        redirect("/");
    }

    let enabled = true;
    try {
        const sb = getSupabase();
        const { data } = await sb
            .from("platform_config")
            .select("value")
            .eq("key", "landing_page_enabled")
            .maybeSingle();
        if (data) enabled = data.value === "true" || data.value === true;
    } catch {
        // erro de leitura: mostra a home
    }
    if (!enabled) {
        redirect("/inclusao");
    }

    return <LandingClient />;
}
