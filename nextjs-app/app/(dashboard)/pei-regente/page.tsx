import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { SafeModuleWrapper } from "@/components/SafeModuleWrapper";
import { PEIRegenteClient } from "./PEIRegenteClient";
import { getSupabase } from "@/lib/supabase";

export default async function PEIRegentePage() {
    const session = await getSession();

    if (!session?.workspace_id) {
        return (
            <div className="rounded-2xl p-8 text-center bg-(--omni-bg-secondary) border border-(--omni-border-default)">
                <p className="text-(--omni-text-muted)">Faça login para acessar o módulo.</p>
            </div>
        );
    }

    // Fetch admin config server-side to prevent FOUC (Flash of Unstyled Content)
    const sb = getSupabase();
    const { data: configData } = await sb
        .from("platform_config")
        .select("value")
        .eq("key", "card_customizations")
        .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let adminConfig: Record<string, any> | undefined = undefined;
    if (configData?.value) {
        try {
            adminConfig = typeof configData.value === "string" ? JSON.parse(configData.value) : configData.value;
        } catch { /* silent */ }
    }

    return (
        <PageAccentProvider adminKey="pei-regente" serverConfig={adminConfig}>
            <div className="space-y-6">
                <PageHero moduleKey="pei" adminKey="pei-regente" serverConfig={adminConfig}
                    title="PEI - Professor"
                    desc="Plano de Ensino, Avaliação Diagnóstica e PEI por Componente Curricular."
                />

                <Suspense fallback={
                    <div className="rounded-2xl animate-pulse min-h-[200px] bg-(--omni-bg-secondary) border border-(--omni-border-default)" />
                }>
                    <SafeModuleWrapper fallbackTitle="PEI Professor">
                        <PEIRegenteClient />
                    </SafeModuleWrapper>
                </Suspense>
            </div>
        </PageAccentProvider>
    );
}
