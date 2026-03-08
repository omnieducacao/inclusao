import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SafeModuleWrapper } from "@/components/SafeModuleWrapper";
import dynamic from "next/dynamic";
import { getAlunosRegente } from "@/lib/dashboard-alunos";
import { Skeleton } from "@/components/Skeleton";

const AvaliacaoDiagnosticaClient = dynamic(
    () => import("./AvaliacaoDiagnosticaClient"),
    { loading: () => <Skeleton className="min-h-[200px] w-full rounded-2xl" /> }
);

export default async function AvaliacaoDiagnosticaPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let initialData: { alunos: any[]; professor: { name: string } } = { alunos: [], professor: { name: "" } };
    try {
        const data = await getAlunosRegente(session);
        initialData = { alunos: data.alunos, professor: { name: data.professor.name || "" } };
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
