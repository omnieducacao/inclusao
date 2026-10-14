import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { BarraLateral } from "@/components/BarraLateral";
import { AIEnginesBadge } from "@/components/AIEnginesBadge";
import { Footer } from "@/components/Footer";
import { AILoadingWrapper } from "@/components/AILoadingWrapper";
import { SimulationBanner } from "@/components/SimulationBanner";
import { MemberSimulationBanner } from "@/components/MemberSimulationBanner";
import { AnnouncementModal } from "@/components/AnnouncementModal";
import { PermissoesProvider } from "@/components/jornada/PermissoesProvider";
import { podeVer } from "@/lib/navegacao";
import type { Permissao } from "@/lib/jornada";

const PERMISSOES: Permissao[] = ["can_estudantes", "can_pei", "can_pei_professor", "can_paee", "can_hub", "can_diario", "can_avaliacao", "can_gestao"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user_role === "family") {
    redirect("/familia");
  }

  const pode = Object.fromEntries(PERMISSOES.map((p) => [p, podeVer({ permissao: p }, session)]));

  return (
    <PermissoesProvider pode={pode}>
    <AILoadingWrapper>
      <div
        className="min-h-screen flex flex-col transition-colors duration-300"
        style={{ background: "var(--fundo)" }}
      >
        {/* Skip link for keyboard navigation (a11y) */}
        <a href="#main-content" className="omni-skip-link">
          Pular para o conteúdo principal
        </a>
        <SimulationBanner session={session} />
        <MemberSimulationBanner session={session} />
        {/* Onda 6: topo com logo, busca, sino e perfil; a navegação vai para a barra lateral */}
        <Navbar session={session} />
        <div className="omni-moldura">
          <BarraLateral session={session} />
          <div className="flex-1 min-w-0 flex flex-col">
            <main id="main-content" className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 py-6 flex-1">{children}</main>
            <div className="w-full px-6">
              <Footer />
            </div>
          </div>
        </div>
        <AIEnginesBadge />
        <AnnouncementModal />
      </div>
    </AILoadingWrapper>
    </PermissoesProvider>
  );
}
