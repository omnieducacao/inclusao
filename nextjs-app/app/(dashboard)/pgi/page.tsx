import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { getAdminConfig } from "@/lib/getAdminConfig";
import { PGIClient } from "./PGIClient";

export default async function PGIPage() {
  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="pgi" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="pgi" serverConfig={adminConfig}
          title="PGI"
          desc="Plano de Gestão Inclusiva: o acolhimento antes da matrícula e o plano da escola nos eixos de infraestrutura, equipe e cultura."
        />
        <PGIClient />
      </div>
    </PageAccentProvider>
  );
}
