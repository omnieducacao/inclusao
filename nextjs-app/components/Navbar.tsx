"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionPayload } from "@/lib/session";

type PermissionKey =
  | "can_estudantes"
  | "can_pei"
  | "can_paee"
  | "can_hub"
  | "can_diario"
  | "can_avaliacao"
  | "can_gestao";

type NavItem = {
  href: string;
  label: string;
  permission?: PermissionKey;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/estudantes", label: "Estudantes", permission: "can_estudantes" },
  { href: "/pei", label: "PEI", permission: "can_pei" },
  { href: "/paee", label: "PAEE", permission: "can_paee" },
  { href: "/hub", label: "Hub", permission: "can_hub" },
  { href: "/diario", label: "Diário", permission: "can_diario" },
  { href: "/monitoramento", label: "Monitoramento", permission: "can_avaliacao" },
  { href: "/gestao", label: "Gestão", permission: "can_gestao" },
];

function canAccess(
  item: NavItem,
  session: SessionPayload
): boolean {
  if (!item.permission) return true;
  if (session.is_platform_admin) return true;
  const member = session.member as Record<string, boolean> | undefined;
  if (!member) return true;
  return member[item.permission] === true;
}

export function Navbar({ session }: { session: SessionPayload }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const items = session.is_platform_admin
    ? [{ href: "/admin", label: "Admin" }]
    : NAV_ITEMS.filter((item) => canAccess(item, session));

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
          >
            Omnisfera
          </Link>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {session.workspace_name} · {session.usuario_nome}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
