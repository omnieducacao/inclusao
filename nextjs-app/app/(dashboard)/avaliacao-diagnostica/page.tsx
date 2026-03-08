import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SafeModuleWrapper } from "@/components/SafeModuleWrapper";
import AvaliacaoDiagnosticaClient from "./AvaliacaoDiagnosticaClient";
import { getAlunosRegente } from "@/lib/dashboard-alunos";

export default async function AvaliacaoDiagnosticaPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    let initialData = { alunos: [], professor: { name: "" } };
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await getAlunosRegente(session as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData = { alunos: data.alunos as any, professor: { name: data.professor.name || "" } };
    } catch { /* silent */ }

    return (
        <SafeModuleWrapper fallbackTitle="Avaliação Diagnóstica">
            <AvaliacaoDiagnosticaClient
                initialAlunos={initialData.alunos}
                initialProfessorName={initialData.professor.name}
            />
        </SafeModuleWrapper>
    );
}
