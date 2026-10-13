import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { ConfigEscolaClient } from "./ConfigEscolaClient";
import TelaCarregando from "@/components/brand/TelaCarregando";
import { getAdminConfig } from "@/lib/getAdminConfig";

export default async function ConfigEscolaPage() {
  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="config-escola" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="cursos" adminKey="config-escola" serverConfig={adminConfig}
          title="Configuração da escola"
          desc="Ano letivo, séries e turmas."
        />
        <Suspense fallback={<TelaCarregando variante="secao" mensagens={["Abrindo a configuração da escola…"]} />}>
          <ConfigEscolaClient />
        </Suspense>
      </div>
    </PageAccentProvider>
  );
}
