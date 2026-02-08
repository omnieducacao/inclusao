import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { listStudents, getStudent, type Student } from "@/lib/students";
import { PageHero } from "@/components/PageHero";
import { HubClient } from "./HubClient";
import { Rocket } from "lucide-react";

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
        console.log("✅ Hub: Estudante encontrado sem filtro de workspace", {
          studentId: student.id,
          workspaceId: student.workspace_id
        });
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
    console.log("✅ Hub: Estudante encontrado", {
      studentId: student.id,
      studentName: student.name,
      workspaceId: student.workspace_id
    });
  }

  return (
    <div className="space-y-6">
      <PageHero
        iconName="Rocket"
        title="Hub de Recursos"
        desc="Adaptar provas, atividades, criar do zero e muito mais."
        color="cyan"
        useLottie={true}
      />

      <Suspense fallback={<div className="text-slate-500">Carregando…</div>}>
        <HubClient
          students={students.map((s) => ({ id: s.id, name: s.name }))}
          studentId={studentId}
          student={
            student
              ? {
                  id: student.id,
                  name: student.name,
                  grade: student.grade,
                  pei_data: (student.pei_data || {}) as Record<string, unknown>,
                }
              : null
          }
        />
      </Suspense>
    </div>
  );
}
