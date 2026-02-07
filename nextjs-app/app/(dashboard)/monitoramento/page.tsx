import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { listStudents, getStudent } from "@/lib/students";
import { PageHero } from "@/components/PageHero";
import { MonitoramentoClient } from "./MonitoramentoClient";
import { BarChart3 } from "lucide-react";

type Props = { searchParams: Promise<{ student?: string }> };

export default async function MonitoramentoPage({ searchParams }: Props) {
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
        icon={BarChart3}
        title="Evolução & Dados"
        desc="Indicadores, gráficos e relatórios de progresso dos estudantes."
        color="sky"
      />

      <Suspense fallback={<div className="text-slate-500">Carregando…</div>}>
        <MonitoramentoClient
          students={students.map((s) => ({ id: s.id, name: s.name }))}
          studentId={studentId}
          student={student}
        />
      </Suspense>
    </div>
  );
}
