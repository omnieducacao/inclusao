import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { PAEEClient } from "./PAEEClient";
import type { CicloPAEE } from "@/lib/paee";
import { Skeleton } from "@/components/Skeleton";
import { getAdminConfig } from "@/lib/getAdminConfig";
import { getStudentsWithFallback } from "@/lib/getStudentWithFallback";

type Props = { searchParams: Promise<{ student?: string }> };

export default async function PAEEPage({ searchParams }: Props) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const params = await searchParams;
  const studentId = params.student || null;

  const { students, student } = await getStudentsWithFallback(workspaceId, studentId, "PAEE");
  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="paee" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="paee" serverConfig={adminConfig}
          title="Plano de Ação / PAEE"
          desc="Atendimento Educacional Especializado — Planeje e implemente estratégias de AEE para eliminação de barreiras"
        />

        <Suspense fallback={<Skeleton className="min-h-[200px] w-full rounded-2xl" />}>
          <PAEEClient
            students={students.map((s) => ({ id: s.id, name: s.name }))}
            studentId={studentId}
            student={
              student
                ? {
                  id: student.id,
                  name: student.name,
                  grade: student.grade,
                  diagnosis: student.diagnosis,
                  pei_data: (student.pei_data || {}) as Record<string, unknown>,
                  paee_ciclos: (student.paee_ciclos || []) as CicloPAEE[],
                  planejamento_ativo: student.planejamento_ativo,
                  paee_data: (student.paee_data || {}) as Record<string, unknown>,
                }
                : null
            }
          />
        </Suspense>
      </div>
    </PageAccentProvider>
  );
}
