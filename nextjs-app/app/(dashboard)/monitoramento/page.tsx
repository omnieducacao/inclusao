import { getSession } from "@/lib/session";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { Skeleton } from "@/components/Skeleton";
import { getAdminConfig } from "@/lib/getAdminConfig";
import { getStudentsWithFallback } from "@/lib/getStudentWithFallback";
import dynamic from "next/dynamic";
import { VisaoEscola, type LinhaVisao } from "@/components/evolucao/VisaoEscola";
import { situacaoDoPei, hojeBrasilia } from "@/lib/inicio";

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
  const hoje = hojeBrasilia();
  // Onda 10: sem estudante escolhido, a tela abre com a visão da coordenação
  const linhas: LinhaVisao[] = studentId ? [] : students.map((s) => ({
    id: s.id, name: s.name, grade: s.grade, class_group: s.class_group,
    pei: situacaoDoPei(s.pei_data, hoje),
    paeeAtivo: ((s.paee_ciclos || []) as Array<{ status?: string }>).some((c) => c.status === "ativo"),
  }));

  return (
    <PageAccentProvider adminKey="monitoramento" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="monitoramento" serverConfig={adminConfig}
          title="Evolução e dados"
          desc={studentId ? "O que o PEI, o PAEE e o diário já registraram sobre o estudante, e a avaliação do progresso." : "Onde a escola está com os PEIs e o AEE, e quem precisa de atenção agora."}
        />

        {!studentId && students.length > 0 && <VisaoEscola linhas={linhas} />}

        <MonitoramentoClient
          students={students.map((s) => ({ id: s.id, name: s.name, grade: s.grade, class_group: s.class_group }))}
          studentId={studentId}
          student={student}
        />
      </div>
    </PageAccentProvider>
  );
}
