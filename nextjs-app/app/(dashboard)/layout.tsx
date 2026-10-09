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

  return (
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
        <Navbar session={session} hideMenu />
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
  );
}
