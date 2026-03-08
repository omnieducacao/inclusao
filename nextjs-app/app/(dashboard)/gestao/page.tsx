import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { GestaoClient } from "./GestaoClient";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { listMembers, getWorkspaceMaster } from "@/lib/members";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/Skeleton";
import { getAdminConfig } from "@/lib/getAdminConfig";

export default async function GestaoPage() {
  const session = await getSession();
  if (!session?.workspace_id) redirect("/login");

  const workspaceId = session.workspace_id;

  // Realizar fetch Server-Side
  const membersData = await listMembers(workspaceId);
  const masterData = await getWorkspaceMaster(workspaceId);

  const sb = getSupabase();
  const { data: responsaveisData } = await sb
    .from("family_responsibles")
    .select("id, nome, email, telefone, parentesco, active, created_at")
    .eq("workspace_id", workspaceId)
    .order("nome");

  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="gestao" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="gestao" serverConfig={adminConfig}
          title="Gestão de Usuários"
          desc="Membros e permissões do workspace."
        />
        <Suspense fallback={<Skeleton className="min-h-[200px] w-full rounded-2xl" />}>
          <GestaoClient
            initialMembers={membersData || []}
            initialMaster={masterData || null}
            initialFamily={responsaveisData || []}
          />
        </Suspense>
      </div>
    </PageAccentProvider>
  );
}
