import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { AIEnginesBadge } from "@/components/AIEnginesBadge";
import { Footer } from "@/components/Footer";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/15 to-sky-50/10 flex flex-col">
      <Navbar session={session} />
      <main className="w-full px-6 py-6 flex-1">{children}</main>
      <div className="w-full px-6">
        <Footer />
      </div>
      <AIEnginesBadge />
    </div>
  );
}
