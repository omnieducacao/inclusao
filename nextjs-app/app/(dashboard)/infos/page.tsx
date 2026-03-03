import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import InfosClient from "./InfosClient";

export default async function InfosPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <PageHero moduleKey="gestao" adminKey="infos"
        title="Central de Inteligência Inclusiva"
        desc="Fundamentos Pedagógicos, Marcos Legais e Ferramentas Práticas."
      />

      <InfosClient />
    </div>
  );
}
