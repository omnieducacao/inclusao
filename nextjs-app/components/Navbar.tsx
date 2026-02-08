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
import type { Icon } from "phosphor-react";
import { useState, useEffect } from "react";
import { LottieIcon } from "./LottieIcon";

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
  icon: Icon;
  permission?: PermissionKey;
};

// Função para carregar ícones Phosphor dinamicamente
async function loadNavIcons() {
  if (typeof window === "undefined") {
    return null;
  }
  
  try {
    const phosphor = await import("phosphor-react");
    return {
      House: phosphor.House,
      UsersFour: phosphor.UsersFour,
      FileText: phosphor.FileText,
      PuzzlePiece: phosphor.PuzzlePiece,
      RocketLaunch: phosphor.RocketLaunch,
      BookOpen: phosphor.BookOpen,
      ChartLineUp: phosphor.ChartLineUp,
      Gear: phosphor.Gear,
      UsersThree: phosphor.UsersThree,
      ClipboardText: phosphor.ClipboardText,
      ShieldCheckered: phosphor.ShieldCheckered,
      SignOut: phosphor.SignOut,
      Sparkle: phosphor.Sparkle,
      BookBookmark: phosphor.BookBookmark,
    };
  } catch (err) {
    console.warn("[Navbar] Failed to load phosphor-react:", err);
    return null;
  }
}

// Mapeamento de rotas para ícones Lottie (mesmos dos cards)
function getNavLottieMap(): Record<string, string> {
  return {
    "/": "system-solid-41-home-hover-pinch", // Home
    "/estudantes": "wired-outline-529-boy-girl-children-hover-pinch", // Estudantes
    "/pei": "wired-outline-86-compass-hover-pinch", // PEI
    "/paee": "wired-outline-106-map-hover-pinch", // PAEE
    "/hub": "wired-outline-489-rocket-space-hover-flying", // Hub
    "/diario": "wired-outline-3140-book-open-hover-pinch", // Diário
    "/monitoramento": "wired-outline-152-bar-chart-arrow-hover-growth", // Monitoramento
    "/infos": "wired-outline-2167-books-course-assign-hover-pinch", // Central
    "/config-escola": "wired-outline-486-school-hover-pinch", // Config Escola
    "/gestao": "wired-outline-314-three-avatars-icon-calm-hover-nodding", // Gestão
    "/pgi": "wired-outline-738-notebook-2-hover-pinch", // PGI
  };
}

function getNavItems(icons: ReturnType<typeof loadNavIcons> extends Promise<infer T> ? T : any): NavItem[] {
  if (!icons) return [];
  
  return [
    { href: "/", label: "Home", icon: icons.House },
    { href: "/estudantes", label: "Estudantes", icon: icons.UsersFour, permission: "can_estudantes" },
    { href: "/pei", label: "PEI", icon: icons.FileText, permission: "can_pei" },
    { href: "/paee", label: "PAEE", icon: icons.PuzzlePiece, permission: "can_paee" },
    { href: "/hub", label: "Hub", icon: icons.RocketLaunch, permission: "can_hub" },
    { href: "/diario", label: "Diário", icon: icons.BookOpen, permission: "can_diario" },
    { href: "/monitoramento", label: "Monitoramento", icon: icons.ChartLineUp, permission: "can_avaliacao" },
    { href: "/infos", label: "Central", icon: icons.BookBookmark },
    { href: "/config-escola", label: "Config", icon: icons.Gear, permission: "can_gestao" },
    { href: "/gestao", label: "Gestão", icon: icons.UsersThree, permission: "can_gestao" },
    { href: "/pgi", label: "PGI", icon: icons.ClipboardText, permission: "can_gestao" },
  ];
}

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

// Componente para item de navegação com ícone Lottie
function NavItemWithLottie({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;
  const lottieMap = getNavLottieMap();
  const lottieAnimation = lottieMap[item.href];
  
  return (
    <Link
      href={item.href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
        isActive
          ? "bg-blue-50 text-blue-700 shadow-sm"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
      title={item.label}
    >
      {lottieAnimation ? (
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <LottieIcon
            animation={lottieAnimation}
            size={20}
            loop={isHovered || isActive}
            autoplay={isHovered || isActive}
            className={`transition-all duration-300 ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
          />
        </div>
      ) : (
        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-500"}`} weight={isActive ? "fill" : "regular"} />
      )}
      <span>{item.label}</span>
    </Link>
  );
}

export function Navbar({ session, hideMenu = false }: { session: SessionPayload; hideMenu?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navIcons, setNavIcons] = useState<Awaited<ReturnType<typeof loadNavIcons>>>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadNavIcons().then(setNavIcons);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navItems = navIcons ? getNavItems(navIcons) : [];
  const items = !isMounted || !navIcons
    ? []
    : session.is_platform_admin
    ? [{ href: "/admin", label: "Admin", icon: navIcons.ShieldCheckered }]
    : navItems.filter((item) => canAccess(item, session));

  // Durante SSR ou enquanto carrega ícones, mostrar versão simplificada
  if (!isMounted || !navIcons || items.length === 0) {
    return (
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm rounded-b-xl">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
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
            {!hideMenu && (
              <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center px-4">
                <div className="w-32 h-8 bg-slate-200 rounded animate-pulse" />
              </nav>
            )}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200 flex-shrink-0">
              <div className="hidden lg:flex flex-col items-end text-right">
                <span className="text-sm font-medium text-slate-800">{session.usuario_nome}</span>
                <span className="text-xs text-slate-500">{session.workspace_name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm rounded-b-2xl">
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
          {!hideMenu && (
            <>
              <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center px-4 overflow-x-auto scrollbar-hide">
                {items.map((item) => (
                  <NavItemWithLottie key={item.href} item={item} isActive={pathname === item.href} />
                ))}
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
            </>
          )}

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
              {navIcons?.SignOut && <navIcons.SignOut className="w-4 h-4" weight="regular" />}
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
