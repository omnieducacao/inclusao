import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SafeModuleWrapper } from "@/components/SafeModuleWrapper";
import AvaliacaoDiagnosticaClient from "./AvaliacaoDiagnosticaClient";

export default async function AvaliacaoDiagnosticaPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    return (
        <SafeModuleWrapper fallbackTitle="Avaliação Diagnóstica">
            <AvaliacaoDiagnosticaClient />
        </SafeModuleWrapper>
    );
}
