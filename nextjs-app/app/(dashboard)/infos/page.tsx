import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import InfosClient from "./InfosClient";
import { getAdminConfig } from "@/lib/getAdminConfig";

export default async function InfosPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="infos" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="gestao" adminKey="infos" serverConfig={adminConfig}
          title="Central de Inteligência Inclusiva"
          desc="Fundamentos Pedagógicos, Marcos Legais e Ferramentas Práticas."
        />

        <InfosClient />
      </div>
    </PageAccentProvider>
  );
}
