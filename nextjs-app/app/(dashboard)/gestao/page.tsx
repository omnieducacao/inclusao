import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { GestaoClient } from "./GestaoClient";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { listMembers, getWorkspaceMaster } from "@/lib/members";
import { redirect } from "next/navigation";

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

  return (
    <div className="space-y-6">
      <PageHero moduleKey="gestao"
        title="Gestão de Usuários"
        desc="Membros e permissões do workspace."
      />
      <Suspense fallback={<div className="rounded-2xl bg-white animate-pulse min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }} />}>
        <GestaoClient 
          initialMembers={membersData || []} 
          initialMaster={masterData || null} 
          initialFamily={responsaveisData || []} 
        />
      </Suspense>
    </div>
  );
}
