import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Footer } from "@/components/Footer";
import { AnnouncementModal } from "@/components/AnnouncementModal";

export default async function FamiliaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user_role !== "family") {
    redirect("/");
  }

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{
        background: `linear-gradient(135deg, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))`,
      }}
    >
      {/* Navbar simplificada para família */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/familia" className="flex items-center gap-2">
            <Image
              src="/omni_icone.png"
              alt="Logo Omnisfera"
              width={32}
              height={32}
              className="w-8 h-8 drop-shadow-sm"
              unoptimized
              style={{ width: "auto", maxHeight: "32px", filter: "var(--img-dark-invert, none)" }}
            />
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">Acesso Família</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session.usuario_nome}</span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="w-full px-6 py-6 flex-1 max-w-6xl mx-auto">{children}</main>

      <AnnouncementModal />

      <div className="w-full px-6">
        <Footer />
      </div>
    </div>
  );
}
