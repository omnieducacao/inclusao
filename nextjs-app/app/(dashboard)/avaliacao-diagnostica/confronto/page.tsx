import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PageHero } from "@/components/PageHero";
import ConfrontoMatrizes from "./ConfrontoMatrizes";

/** Onda 17: Matriz Omni × matriz antiga, lado a lado, para decidir quando apagar a antiga. */
export default async function ConfrontoPage() {
  const session = await getSession();
  if (!session?.workspace_id && !session?.is_platform_admin) redirect("/login");
  if (!(session?.is_platform_admin || session?.user_role === "master")) redirect("/avaliacao-diagnostica");
  return (
    <div className="space-y-6">
      <PageHero route="/avaliacao-diagnostica" title="Confronto das matrizes" desc="Matriz Omni e matriz antiga lado a lado. Marque se o descritor Omni é melhor, igual ou pior; quando fechar, a antiga sai." />
      <ConfrontoMatrizes />
    </div>
  );
}
