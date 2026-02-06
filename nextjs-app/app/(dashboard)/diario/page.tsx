import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { listStudents, getStudent } from "@/lib/students";
import { PageHero } from "@/components/PageHero";
import { DiarioClient } from "./DiarioClient";

type Props = { searchParams: Promise<{ student?: string }> };

export default async function DiarioPage({ searchParams }: Props) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const params = await searchParams;
  const studentId = params.student || null;

  const students = workspaceId ? await listStudents(workspaceId) : [];
  const student =
    workspaceId && studentId
      ? await getStudent(workspaceId, studentId)
      : null;

  return (
    <div className="space-y-6">
      <PageHero
        icon="📝"
        title="Diário de Bordo"
        desc="Registro de atendimentos e sessões AEE."
        color="rose"
      />

      <Suspense fallback={<div className="text-slate-500">Carregando…</div>}>
        <DiarioClient
          students={students.map((s) => ({ id: s.id, name: s.name }))}
          studentId={studentId}
          student={
            student
              ? {
                  id: student.id,
                  name: student.name,
                  grade: student.grade,
                  daily_logs: (student.daily_logs || []) as Record<string, unknown>[],
                }
              : null
          }
        />
      </Suspense>
    </div>
  );
}
