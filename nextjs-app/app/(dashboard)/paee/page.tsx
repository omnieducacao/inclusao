import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { listStudents, getStudent } from "@/lib/students";
import { PageHero } from "@/components/PageHero";
import { PAEEClient } from "./PAEEClient";
import type { CicloPAEE } from "@/lib/paee";
import { Puzzle } from "lucide-react";

type Props = { searchParams: Promise<{ student?: string }> };

export default async function PAEEPage({ searchParams }: Props) {
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
        icon={Puzzle}
        title="Plano de Ação / PAEE"
        desc="Plano de Atendimento Educacional Especializado e sala de recursos."
        color="violet"
      />

      <Suspense fallback={<div className="text-slate-500">Carregando…</div>}>
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
                }
              : null
          }
        />
      </Suspense>
    </div>
  );
}
