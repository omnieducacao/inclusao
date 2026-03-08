import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { listClasses, listGrades } from "@/lib/school";
import { PEIClient } from "./PEIClient";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { Skeleton } from "@/components/Skeleton";
import { getAdminConfig } from "@/lib/getAdminConfig";
import { getStudentsWithFallback } from "@/lib/getStudentWithFallback";

type Props = { searchParams: Promise<{ student?: string }> };

export default async function PEIPage({ searchParams }: Props) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const params = await searchParams;
  const studentId = params.student || null;

  const { students, student } = await getStudentsWithFallback(workspaceId, studentId, "PEI");

  const initialClasses = workspaceId ? await listClasses(workspaceId) : [];
  const initialGrades = await listGrades();

  const peiData = student?.pei_data
    ? (student.pei_data as Record<string, unknown>)
    : {};

  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="pei" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="pei" serverConfig={adminConfig}
          title="Estratégias & PEI"
          desc="Plano Educacional Individual com objetivos, avaliações e acompanhamento."
        />

        <Suspense fallback={<Skeleton className="min-h-[200px] w-full rounded-2xl" />}>
          <PEIClient
            students={students.map((s) => ({ id: s.id, name: s.name }))}
            studentId={studentId}
            studentName={student?.name || null}
            initialPeiData={peiData}
            initialStudent={student}
            initialClasses={initialClasses as unknown as Parameters<typeof PEIClient>[0]["initialClasses"]}
            initialGrades={initialGrades as unknown as Parameters<typeof PEIClient>[0]["initialGrades"]}
          />
        </Suspense>
      </div>
    </PageAccentProvider>
  );
}
