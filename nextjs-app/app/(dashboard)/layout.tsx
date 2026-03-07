import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
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
        style={{
          background: `linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))`,
        }}
      >
        {/* Skip link for keyboard navigation (a11y) */}
        <a href="#main-content" className="omni-skip-link">
          Pular para o conteúdo principal
        </a>
        <SimulationBanner session={session} />
        <MemberSimulationBanner session={session} />
        <nav aria-label="Navegação principal">
          <Navbar session={session} />
        </nav>
        <main id="main-content" className="w-full px-6 py-6 flex-1">{children}</main>
        <footer className="w-full px-6" role="contentinfo">
          <Footer />
        </footer>
        <AIEnginesBadge />
        <AnnouncementModal />
      </div>
    </AILoadingWrapper>
  );
}
