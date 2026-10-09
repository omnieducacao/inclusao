import { getSession } from "@/lib/session";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/Skeleton";
import { getAdminConfig } from "@/lib/getAdminConfig";
import { getStudentsWithFallback } from "@/lib/getStudentWithFallback";

const DiarioClient = dynamic(
  () => import("./DiarioClient").then(mod => ({ default: mod.DiarioClient })),
  { loading: () => <Skeleton className="min-h-[200px] w-full rounded-2xl" /> }
);

type Props = { searchParams: Promise<{ student?: string }> };

export default async function DiarioPage({ searchParams }: Props) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const params = await searchParams;
  const studentId = params.student || null;

  const { students, student } = await getStudentsWithFallback(workspaceId, studentId, "Diário");
  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="diario" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="diario" serverConfig={adminConfig}
          title="Diário de bordo"
          desc="Registro de atendimentos e sessões AEE."
        />

        <DiarioClient
          students={students.map((s) => ({ id: s.id, name: s.name, grade: s.grade, class_group: s.class_group }))}
          studentId={studentId}
          student={
            student
              ? {
                id: student.id,
                name: student.name,
                grade: student.grade,
                class_group: student.class_group,
                daily_logs: (student.daily_logs || []) as Record<string, unknown>[],
              }
              : null
          }
        />
      </div>
    </PageAccentProvider>
  );
}
