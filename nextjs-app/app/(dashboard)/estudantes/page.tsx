import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { listStudents } from "@/lib/students";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { SafeModuleWrapper } from "@/components/SafeModuleWrapper";
import { EstudantesClient } from "./EstudantesClient";
import { Skeleton } from "@/components/Skeleton";

export default async function EstudantesPage() {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const students = workspaceId ? await listStudents(workspaceId) : [];

  let familyModuleEnabled = false;
  if (workspaceId) {
    const sb = getSupabase();
    const { data } = await sb.from("workspaces").select("family_module_enabled").eq("id", workspaceId).maybeSingle();
    familyModuleEnabled = Boolean((data as { family_module_enabled?: boolean } | null)?.family_module_enabled);
  }

  return (
    <PageAccentProvider adminKey="estudantes">
      <div className="space-y-6">
        <PageHero
          moduleKey="omnisfera"
          title="Gestão de Estudantes"
          desc="Dados dos estudantes vinculados aos PEIs neste workspace."
        />
        <Suspense fallback={<Skeleton className="min-h-[200px] w-full rounded-2xl" />}>
          <SafeModuleWrapper fallbackTitle="Estudantes">
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
              familyModuleEnabled={familyModuleEnabled}
            />
          </SafeModuleWrapper>
        </Suspense>
      </div>
    </PageAccentProvider>
  );
}
