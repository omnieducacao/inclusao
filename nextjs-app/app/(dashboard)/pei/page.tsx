import { getSession } from "@/lib/session";
import { listClasses, listGrades } from "@/lib/school";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { Skeleton } from "@/components/Skeleton";
import { getAdminConfig } from "@/lib/getAdminConfig";
import { getStudentsWithFallback } from "@/lib/getStudentWithFallback";
import { modoDaEscola } from "@/lib/escola";
import dynamic from "next/dynamic";

const PEIClient = dynamic(
  () => import("./PEIClient").then(mod => ({ default: mod.PEIClient })),
  { loading: () => <Skeleton className="min-h-[200px] w-full rounded-2xl" /> }
);

type Props = { searchParams: Promise<{ student?: string }> };

export default async function PEIPage({ searchParams }: Props) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const params = await searchParams;
  const studentId = params.student || null;

  const { students, student } = await getStudentsWithFallback(workspaceId, studentId, "PEI");

  const initialClasses = workspaceId ? await listClasses(workspaceId) : [];
  const initialGrades = await listGrades();
  const modo = await modoDaEscola(workspaceId);

  const peiData = student?.pei_data
    ? (student.pei_data as Record<string, unknown>)
    : {};

  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="pei" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="pei" serverConfig={adminConfig}
          title="PEI"
          desc="Plano Educacional Individualizado: do estudo de caso à revisão, em quatro etapas."
        />

        <PEIClient
          students={students.map((s) => ({ id: s.id, name: s.name, grade: s.grade, class_group: s.class_group }))}
          studentId={studentId}
          studentName={student?.name || null}
          initialPeiData={peiData}
          initialStudent={student}
          initialClasses={initialClasses as never}
          initialGrades={initialGrades as never}
          modo={modo}
          usuarioNome={session?.usuario_nome}
        />
      </div>
    </PageAccentProvider>
  );
}
