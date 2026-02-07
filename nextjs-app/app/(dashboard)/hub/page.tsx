import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { listStudents, getStudent } from "@/lib/students";
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
  const student =
    workspaceId && studentId
      ? await getStudent(workspaceId, studentId)
      : null;

  // Debug: verificar se estudante foi encontrado
  if (workspaceId && studentId && !student) {
    console.error("❌ Hub: Estudante não encontrado após getStudent", {
      workspaceId,
      studentId,
      studentsCount: students.length,
      studentIds: students.map((s) => s.id),
      studentIdInList: students.some((s) => s.id === studentId),
      sessionWorkspaceId: session?.workspace_id,
      sessionExists: !!session
    });
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
        icon={Rocket}
        title="Hub de Recursos"
        desc="Adaptar provas, atividades, criar do zero e muito mais."
        color="cyan"
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
