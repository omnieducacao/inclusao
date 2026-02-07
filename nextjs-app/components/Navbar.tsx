"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { SessionPayload } from "@/lib/session";
import {
  Home,
  Users,
  FileText,
  Puzzle,
  Rocket,
  BookOpen,
  BarChart3,
  Settings,
  UserCog,
  ClipboardList,
  Shield,
  LogOut,
  Sparkles,
  BookMarked,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  icon: LucideIcon;
  permission?: PermissionKey;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/estudantes", label: "Estudantes", icon: Users, permission: "can_estudantes" },
  { href: "/pei", label: "PEI", icon: FileText, permission: "can_pei" },
  { href: "/paee", label: "PAEE", icon: Puzzle, permission: "can_paee" },
  { href: "/hub", label: "Hub", icon: Rocket, permission: "can_hub" },
  { href: "/diario", label: "Diário", icon: BookOpen, permission: "can_diario" },
  { href: "/monitoramento", label: "Monitoramento", icon: BarChart3, permission: "can_avaliacao" },
  { href: "/infos", label: "Central", icon: BookMarked },
  { href: "/config-escola", label: "Config", icon: Settings, permission: "can_gestao" },
  { href: "/gestao", label: "Gestão", icon: UserCog, permission: "can_gestao" },
  { href: "/pgi", label: "PGI", icon: ClipboardList, permission: "can_gestao" },
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
    ? [{ href: "/admin", label: "Admin", icon: Shield }]
    : NAV_ITEMS.filter((item) => canAccess(item, session));

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-50 font-bold transition-colors group flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex items-center justify-center group-hover:scale-105 transition-all omni-logo-spin">
                  <Image 
                    src="/omni_icone.png" 
                    alt="Omnisfera" 
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" title="Sistema online e funcionando"></div>
              </div>
              <img 
                src="/omni_texto.png" 
                alt="Omnisfera" 
                className="h-8 object-contain"
                style={{ width: 'auto', maxHeight: '32px' }}
              />
            </div>
          </Link>
          
          {/* Navegação Principal - Desktop e Tablet (lg+) */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center px-4 overflow-x-auto scrollbar-hide">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Menu Mobile/Tablet pequeno - Dropdown */}
          <div className="lg:hidden flex items-center gap-2 ml-2 flex-shrink-0">
            <select
              value={pathname}
              onChange={(e) => router.push(e.target.value)}
              className="text-sm px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {items.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Info e Logout */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200 flex-shrink-0">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-sm font-medium text-slate-800">{session.usuario_nome}</span>
              <span className="text-xs text-slate-500">{session.workspace_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
