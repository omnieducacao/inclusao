import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { PageHero } from "@/components/PageHero";
import { PEIRegenteClient } from "./PEIRegenteClient";

export default async function PEIRegentePage() {
    const session = await getSession();

    if (!session?.workspace_id) {
        return (
            <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                <p style={{ color: 'var(--text-muted)' }}>Faça login para acessar o módulo.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHero
                iconName="BookOpen"
                title="PEI - Professor"
                desc="Plano de Ensino, Avaliação Diagnóstica e PEI por Componente Curricular."
                color="teal"
                useLottie={false}
            />

            <Suspense fallback={
                <div className="rounded-2xl animate-pulse min-h-[200px]"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }} />
            }>
                <PEIRegenteClient />
            </Suspense>
        </div>
    );
}
