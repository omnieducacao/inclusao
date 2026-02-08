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
      <Suspense fallback={<div className="rounded-2xl bg-white animate-pulse min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }} />}>
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
