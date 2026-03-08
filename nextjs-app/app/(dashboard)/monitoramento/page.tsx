import { getSession } from "@/lib/session";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { Skeleton } from "@/components/Skeleton";
import { getAdminConfig } from "@/lib/getAdminConfig";
import { getStudentsWithFallback } from "@/lib/getStudentWithFallback";
import dynamic from "next/dynamic";

const MonitoramentoClient = dynamic(
  () => import("./MonitoramentoClient").then(mod => ({ default: mod.MonitoramentoClient })),
  { loading: () => <Skeleton className="min-h-[200px] w-full rounded-2xl" /> }
);

type Props = { searchParams: Promise<{ student?: string }> };

export default async function MonitoramentoPage({ searchParams }: Props) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const params = await searchParams;
  const studentId = params.student || null;

  const { students, student } = await getStudentsWithFallback(workspaceId, studentId, "Monitoramento");
  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="monitoramento" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="monitoramento" serverConfig={adminConfig}
          title="Evolução & Dados"
          desc="Indicadores, gráficos e relatórios de progresso dos estudantes."
        />

        <MonitoramentoClient
          students={students.map((s) => ({ id: s.id, name: s.name }))}
          studentId={studentId}
          student={student}
        />
      </div>
    </PageAccentProvider>
  );
}
