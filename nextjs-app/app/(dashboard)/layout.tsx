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

  return (
    <AILoadingWrapper>
      <div
        className="min-h-screen flex flex-col transition-colors duration-300"
        style={{
          background: `linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))`,
        }}
      >
        <SimulationBanner session={session} />
        <MemberSimulationBanner session={session} />
        <Navbar session={session} />
        <main className="w-full px-6 py-6 flex-1">{children}</main>
        <div className="w-full px-6">
          <Footer />
        </div>
        <AIEnginesBadge />
        <AnnouncementModal />
      </div>
    </AILoadingWrapper>
  );
}
