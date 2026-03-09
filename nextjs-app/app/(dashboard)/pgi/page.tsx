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
          title="Plano de Gestão Inclusiva — PGI"
          desc="Estruture o acolhimento antes da matrícula. Organize sua escola nos eixos de Infraestrutura, Equipe e Cultura."
        />
        <PGIClient />
      </div>
    </PageAccentProvider>
  );
}
