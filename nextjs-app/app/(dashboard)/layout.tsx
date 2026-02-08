import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { AIEnginesBadge } from "@/components/AIEnginesBadge";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-sky-50/10">
      <Navbar session={session} />
      <main className="max-w-[1800px] mx-auto px-8 py-8 space-y-8">{children}</main>
      <AIEnginesBadge />
    </div>
  );
}
