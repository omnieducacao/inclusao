import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { listStudents } from "@/lib/students";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { SafeModuleWrapper } from "@/components/SafeModuleWrapper";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/Skeleton";
import { getAdminConfig } from "@/lib/getAdminConfig";

const EstudantesClient = dynamic(
  () => import("./EstudantesClient").then(mod => ({ default: mod.EstudantesClient })),
  { loading: () => <Skeleton className="min-h-[200px] w-full rounded-2xl" /> }
);

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

  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="estudantes" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero
          moduleKey="omnisfera" serverConfig={adminConfig}
          title="Gestão de Estudantes"
          desc="Dados dos estudantes vinculados aos PEIs neste workspace."
        />
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
      </div>
    </PageAccentProvider>
  );
}
