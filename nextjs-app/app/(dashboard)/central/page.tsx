import { Suspense } from "react";
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
          title="Central de inteligência"
          desc="A lei, os termos e o caminho do estudante na Omnisfera, em linguagem de sala de aula."
        />

        <Suspense fallback={null}>
          <InfosClient />
        </Suspense>
      </div>
    </PageAccentProvider>
  );
}
