import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { ConfigEscolaClient } from "./ConfigEscolaClient";
import { Skeleton } from "@/components/Skeleton";
import { getAdminConfig } from "@/lib/getAdminConfig";

export default async function ConfigEscolaPage() {
  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="config-escola" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="cursos" adminKey="config-escola" serverConfig={adminConfig}
          title="Configuração da Escola"
          desc="Ano letivo, séries e turmas."
        />
        <Suspense fallback={<Skeleton className="min-h-[200px] w-full rounded-2xl" />}>
          <ConfigEscolaClient />
        </Suspense>
      </div>
    </PageAccentProvider>
  );
}
