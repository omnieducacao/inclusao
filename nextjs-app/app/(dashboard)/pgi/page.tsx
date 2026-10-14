import { PageHero } from "@/components/PageHero";
import { ComoFunciona } from "@/components/tutorial/ComoFunciona";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { getAdminConfig } from "@/lib/getAdminConfig";
import { getSession } from "@/lib/session";
import { podeVer } from "@/lib/navegacao";
import { redirect } from "next/navigation";
import { PGIClient } from "./PGIClient";

export default async function PGIPage() {
  const session = await getSession();
  if (!session?.workspace_id) redirect("/login");
  if (!podeVer({ permissao: "can_gestao" }, session)) redirect("/");
  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="pgi" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="pgi" serverConfig={adminConfig}
          title="PGI"
          desc="Plano de Gestão Inclusiva: o acolhimento antes da matrícula e o plano da escola nos eixos de infraestrutura, equipe e cultura."
        />
        <ComoFunciona modulo="pgi" />
        <PGIClient />
      </div>
    </PageAccentProvider>
  );
}
