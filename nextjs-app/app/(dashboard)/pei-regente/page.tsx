import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { SafeModuleWrapper } from "@/components/SafeModuleWrapper";
import { PEIRegenteClient } from "./PEIRegenteClient";
import { PEICienciaClient } from "./PEICienciaClient";
import { modoDaEscola } from "@/lib/escola";
import { getAdminConfig } from "@/lib/getAdminConfig";

export default async function PEIRegentePage() {
    const session = await getSession();

    if (!session?.workspace_id) {
        return (
            <div className="rounded-2xl p-8 text-center bg-(--omni-bg-secondary) border border-(--omni-border-default)">
                <p className="text-(--omni-text-muted)">Faça login para acessar o módulo.</p>
            </div>
        );
    }

    const adminConfig = await getAdminConfig();
    // Onda 2: no modo simplificado o professor lê o PEI único e dá ciência
    const simplificado = (await modoDaEscola(session.workspace_id)) === "simplificado";

    return (
        <PageAccentProvider adminKey="pei-regente" serverConfig={adminConfig}>
            <div className="space-y-6">
                <PageHero moduleKey="pei" adminKey="pei-regente" serverConfig={adminConfig}
                    title="PEI do professor"
                    desc={simplificado
                        ? "Os PEIs dos seus estudantes: leia, leve para a sala e registre que está ciente."
                        : "Plano de Ensino, Avaliação Diagnóstica e PEI por Componente Curricular."}
                />

                <Suspense fallback={
                    <div className="rounded-2xl animate-pulse min-h-[200px] bg-(--omni-bg-secondary) border border-(--omni-border-default)" />
                }>
                    <SafeModuleWrapper fallbackTitle="PEI Professor">
                        {simplificado ? <PEICienciaClient /> : <PEIRegenteClient />}
                    </SafeModuleWrapper>
                </Suspense>
            </div>
        </PageAccentProvider>
    );
}
