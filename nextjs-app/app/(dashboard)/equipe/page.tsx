import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { ComoFunciona } from "@/components/tutorial/ComoFunciona";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { GestaoClient } from "./GestaoClient";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { listMembers, getWorkspaceMaster } from "@/lib/members";
import { redirect } from "next/navigation";
import { podeVer } from "@/lib/navegacao";
import TelaCarregando from "@/components/brand/TelaCarregando";
import { getAdminConfig } from "@/lib/getAdminConfig";

export default async function GestaoPage() {
  const session = await getSession();
  if (!session?.workspace_id) redirect("/login");
  // a página carrega a equipe e os contatos das famílias no servidor: só para a gestão
  if (!podeVer({ permissao: "can_gestao" }, session)) redirect("/");

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
          title="Equipe e papéis"
          desc="Quem trabalha na escola, o papel de cada um, as páginas que abre e os estudantes com quem trabalha."
        />
        <ComoFunciona modulo="equipe" />
        <Suspense fallback={<TelaCarregando variante="secao" mensagens={["Abrindo a equipe…"]} />}>
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
