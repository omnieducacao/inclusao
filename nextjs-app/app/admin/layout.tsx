import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <nav className="flex items-center gap-1">
            <Link href="/admin" className="px-3 py-2 rounded-lg font-medium text-slate-700">
              Admin
            </Link>
            <Link href="/" className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">
              Voltar ao início
            </Link>
          </nav>
          <span className="text-sm text-slate-600">{session.usuario_nome}</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
