import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { HubClient } from "./HubClient";
import { Skeleton } from "@/components/Skeleton";
import { getAdminConfig } from "@/lib/getAdminConfig";
import { getStudentsWithFallback } from "@/lib/getStudentWithFallback";

type Props = { searchParams: Promise<{ student?: string }> };

export default async function HubPage({ searchParams }: Props) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const params = await searchParams;
  const studentId = params.student || null;

  const { students, student } = await getStudentsWithFallback(workspaceId, studentId, "Hub");

  // ── Fetch Ponte Pedagógica (professor's discipline-specific PEI) ──
  let pontePedagogica: Record<string, unknown> | null = null;
  if (workspaceId && student && studentId) {
    try {
      const sb = (await import("@/lib/supabase")).getSupabase();
      const memberId = (session as Record<string, unknown>)?.member_id as string | undefined;
      if (memberId) {
        const { data: peiDiscs } = await sb
          .from("pei_disciplinas")
          .select("pei_disciplina_data, disciplina")
          .eq("student_id", studentId)
          .eq("professor_regente_id", memberId)
          .eq("workspace_id", workspaceId);

        if (peiDiscs?.length) {
          const discData = peiDiscs[0].pei_disciplina_data as Record<string, unknown> | null;
          const rascunho = discData?.adaptacao_rascunho as Record<string, unknown> | undefined;
          if (rascunho && Object.keys(rascunho).length > 0) {
            pontePedagogica = rascunho;
          }
        }
      }
    } catch { /* expected fallback */
      // Silent — ponte pedagógica is optional
    }
  }

  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="hub" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="hub" serverConfig={adminConfig}
          title="Hub de Recursos"
          desc="Adaptar provas, atividades, criar do zero e muito mais."
        />

        <Suspense fallback={<Skeleton className="min-h-[200px] w-full rounded-2xl" />}>
          <HubClient
            students={students.map((s) => ({ id: s.id, name: s.name }))}
            studentId={studentId}
            student={
              student
                ? {
                  id: student.id,
                  name: student.name,
                  grade: student.grade,
                  pei_data: {
                    ...((student.pei_data || {}) as Record<string, unknown>),
                    ...(pontePedagogica ? { ponte_pedagogica: pontePedagogica } : {}),
                  },
                }
                : null
            }
          />
        </Suspense>
      </div>
    </PageAccentProvider>
  );
}
