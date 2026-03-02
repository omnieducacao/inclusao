import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { PageHero } from "@/components/PageHero";
import { PEIRegenteClient } from "./PEIRegenteClient";

export default async function PEIRegentePage() {
    const session = await getSession();

    if (!session?.workspace_id) {
        return (
            <div className="rounded-2xl p-8 text-center bg-(--omni-bg-secondary) border border-(--omni-border-default)">
                <p className="text-(--omni-text-muted)">Faça login para acessar o módulo.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHero moduleKey="pei"
                title="PEI - Professor"
                desc="Plano de Ensino, Avaliação Diagnóstica e PEI por Componente Curricular."
            />

            <Suspense fallback={
                <div className="rounded-2xl animate-pulse min-h-[200px] bg-(--omni-bg-secondary) border border-(--omni-border-default)" />
            }>
                <PEIRegenteClient />
            </Suspense>
        </div>
    );
}
