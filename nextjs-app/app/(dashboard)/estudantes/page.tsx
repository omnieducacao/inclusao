import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { listStudents } from "@/lib/students";
import { PageHero } from "@/components/PageHero";
import { EstudantesClient } from "./EstudantesClient";

export default async function EstudantesPage() {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const students = workspaceId ? await listStudents(workspaceId) : [];

  return (
    <div className="space-y-6">
      <PageHero
        iconName="UsersFour"
        title="Gestão de Estudantes"
        desc="Dados dos estudantes vinculados aos PEIs neste workspace."
        color="sky"
        useLottie={true}
      />
      <Suspense fallback={<div className="text-slate-500">Carregando…</div>}>
        <EstudantesClient
          students={students.map((s) => ({
            id: s.id,
            name: s.name,
            grade: s.grade,
            class_group: s.class_group,
            diagnosis: s.diagnosis,
            pei_data: s.pei_data,
            paee_ciclos: s.paee_ciclos,
          }))}
        />
      </Suspense>
    </div>
  );
}
