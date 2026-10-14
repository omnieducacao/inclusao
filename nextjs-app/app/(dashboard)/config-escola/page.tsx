import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { ComoFunciona } from "@/components/tutorial/ComoFunciona";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import { ConfigEscolaClient } from "./ConfigEscolaClient";
import TelaCarregando from "@/components/brand/TelaCarregando";
import { getAdminConfig } from "@/lib/getAdminConfig";
import { getSession } from "@/lib/session";
import { podeVer } from "@/lib/navegacao";
import { redirect } from "next/navigation";

export default async function ConfigEscolaPage() {
  const session = await getSession();
  if (!session?.workspace_id) redirect("/login");
  if (!podeVer({ permissao: "can_gestao" }, session)) redirect("/");
  const adminConfig = await getAdminConfig();

  return (
    <PageAccentProvider adminKey="config-escola" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="cursos" adminKey="config-escola" serverConfig={adminConfig}
          title="Configuração da escola"
          desc="Ano letivo, séries e turmas, e como a escola trabalha a inclusão (fluxo completo ou simplificado, área da família)."
        />
        <ComoFunciona modulo="config-escola" />
        <Suspense fallback={<TelaCarregando variante="secao" mensagens={["Abrindo a configuração da escola…"]} />}>
          <ConfigEscolaClient />
        </Suspense>
      </div>
    </PageAccentProvider>
  );
}
