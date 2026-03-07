import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { listStudents, getStudent, type Student } from "@/lib/students";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { HubClient } from "./HubClient";
import { Rocket } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

type Props = { searchParams: Promise<{ student?: string }> };

export default async function HubPage({ searchParams }: Props) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const params = await searchParams;
  const studentId = params.student || null;

  const students = workspaceId ? await listStudents(workspaceId) : [];
  let student =
    workspaceId && studentId
      ? await getStudent(workspaceId, studentId)
      : null;

  // Fallback: se estudante não foi encontrado mas está na lista, usar da lista
  if (workspaceId && studentId && !student) {
    const studentFromList = students.find((s) => s.id === studentId);
    if (studentFromList) {
      console.warn("⚠️ Hub: Estudante não encontrado por getStudent, mas encontrado na lista. Usando dados da lista.", {
        workspaceId,
        studentId,
        studentName: studentFromList.name
      });
      // Buscar dados completos novamente sem filtro de workspace para debug
      const sb = (await import("@/lib/supabase")).getSupabase();
      const { data: fullData } = await sb
        .from("students")
        .select("id, workspace_id, name, grade, class_group, diagnosis, pei_data, paee_ciclos, planejamento_ativo, paee_data, daily_logs, created_at")
        .eq("id", studentId)
        .maybeSingle();

      if (fullData && fullData.workspace_id === workspaceId) {
        student = fullData as Student;
      } else {
        student = studentFromList;
        console.warn("⚠️ Hub: Usando dados básicos da lista", {
          studentId: student.id,
          fullDataWorkspaceId: fullData?.workspace_id,
          sessionWorkspaceId: workspaceId
        });
      }
    } else {
      console.error("❌ Hub: Estudante não encontrado após getStudent e não está na lista", {
        workspaceId,
        studentId,
        studentsCount: students.length,
        studentIds: students.map((s) => s.id),
        sessionWorkspaceId: session?.workspace_id,
        sessionExists: !!session
      });
    }
  } else if (workspaceId && studentId && student) {
  }

  // ── Fetch Ponte Pedagógica (professor's discipline-specific PEI) ──
  let pontePedagogica: Record<string, unknown> | null = null;
  if (workspaceId && student && studentId) {
    try {
      const sb = (await import("@/lib/supabase")).getSupabase();
      // Get professor's member_id
      const memberId = (session as Record<string, unknown>)?.member_id as string | undefined;
      if (memberId) {
        // Fetch pei_disciplinas for this student where this professor is assigned
        const { data: peiDiscs } = await sb
          .from("pei_disciplinas")
          .select("pei_disciplina_data, disciplina")
          .eq("student_id", studentId)
          .eq("professor_regente_id", memberId)
          .eq("workspace_id", workspaceId);

        if (peiDiscs?.length) {
          // Use the first discipline's ponte pedagógica (professor usually has one)
          const discData = peiDiscs[0].pei_disciplina_data as Record<string, unknown> | null;
          const rascunho = discData?.adaptacao_rascunho as Record<string, unknown> | undefined;
          if (rascunho && Object.keys(rascunho).length > 0) {
            pontePedagogica = rascunho;
          }
        }
      }
    } catch (err) {
      console.warn("Hub: Could not fetch ponte pedagógica:", err);
    }
  }

  return (
    <PageAccentProvider adminKey="hub">
      <div className="space-y-6">
        <PageHero moduleKey="hub"
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
