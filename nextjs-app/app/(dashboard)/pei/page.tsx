import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { listStudents, getStudent } from "@/lib/students";
import { PageHero } from "@/components/PageHero";
import { PEIClient } from "./PEIClient";

type Props = { searchParams: Promise<{ student?: string }> };

export default async function PEIPage({ searchParams }: Props) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const params = await searchParams;
  const studentId = params.student || null;

  const students = workspaceId ? await listStudents(workspaceId) : [];
  const student =
    workspaceId && studentId
      ? await getStudent(workspaceId, studentId)
      : null;

  const peiData = student?.pei_data
    ? (student.pei_data as Record<string, unknown>)
    : {};

  return (
    <div className="space-y-6">
      <PageHero
        icon="📘"
        title="PEI — Plano de Ensino Individualizado"
        desc="Estratégias pedagógicas alinhadas à BNCC."
        color="sky"
      />

      <Suspense fallback={<div className="text-slate-500">Carregando…</div>}>
        <PEIClient
          students={students.map((s) => ({ id: s.id, name: s.name }))}
          studentId={studentId}
          student={student}
          initialPeiData={peiData}
        />
      </Suspense>
    </div>
  );
}
