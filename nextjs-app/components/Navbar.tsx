"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { SessionPayload } from "@/lib/session";
import type { Icon } from "phosphor-react";
import { useState, useEffect } from "react";
import { LottieIcon } from "./LottieIcon";
import { useAILoading } from "@/hooks/useAILoading";
import { NotificationBell } from "@/components/NotificationBell";

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
  group?: "main" | "modules" | "admin";
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
    { href: "/", label: "Home", icon: icons.House, group: "main" },
    { href: "/estudantes", label: "Estudantes", icon: icons.UsersFour, permission: "can_estudantes", group: "main" },
    { href: "/pei", label: "PEI", icon: icons.FileText, permission: "can_pei", group: "modules" },
    { href: "/paee", label: "PAEE", icon: icons.PuzzlePiece, permission: "can_paee", group: "modules" },
    { href: "/hub", label: "Hub", icon: icons.RocketLaunch, permission: "can_hub", group: "modules" },
    { href: "/diario", label: "Diário", icon: icons.BookOpen, permission: "can_diario", group: "modules" },
    { href: "/monitoramento", label: "Monitoramento", icon: icons.ChartLineUp, permission: "can_avaliacao", group: "modules" },
    { href: "/pgi", label: "PGI", icon: icons.ClipboardText, permission: "can_gestao", group: "admin" },
    { href: "/infos", label: "Central", icon: icons.BookBookmark, group: "modules" },
    { href: "/config-escola", label: "Config", icon: icons.Gear, permission: "can_gestao", group: "admin" },
    { href: "/gestao", label: "Gestão", icon: icons.UsersThree, permission: "can_gestao", group: "admin" },
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

// Cor da pill ativa por rota (corresponde à cor de cada módulo)
const NAV_ROUTE_COLORS: Record<string, { from: string; to: string }> = {
  "/": { from: "#3b82f6", to: "#6366f1" },           // Home: blue → indigo
  "/estudantes": { from: "#4F5BD5", to: "#6366f1" },  // Estudantes: índigo
  "/pei": { from: "#4285F4", to: "#3574D4" },         // PEI: azul
  "/paee": { from: "#9334E6", to: "#7C2BC4" },        // PAEE: roxo
  "/hub": { from: "#34A853", to: "#2D8C47" },         // Hub: verde
  "/diario": { from: "#E8453C", to: "#C33B34" },      // Diário: vermelho
  "/monitoramento": { from: "#34A853", to: "#2D8C47" }, // Monitoramento: verde
  "/infos": { from: "#9334E6", to: "#6366f1" },       // Central: violeta
  "/config-escola": { from: "#F9AB00", to: "#D49300" }, // Config: âmbar
  "/gestao": { from: "#4285F4", to: "#3574D4" },      // Gestão: azul
  "/pgi": { from: "#7CB342", to: "#6A9A38" },         // PGI: verde oliva
  "/admin": { from: "#64748b", to: "#475569" },       // Admin: slate
};

// Componente para item de navegação com ícone Lottie
function NavItemWithLottie({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;
  const lottieMap = getNavLottieMap();
  const lottieAnimation = lottieMap[item.href];
  const routeColor = NAV_ROUTE_COLORS[item.href] || { from: "#3b82f6", to: "#6366f1" };

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap flex-shrink-0 ${isActive
        ? "text-white shadow-md"
        : "text-slate-500 hover:bg-white/60 hover:text-slate-800 hover:shadow-sm"
        }`}
      style={{
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        ...(isActive ? { background: `linear-gradient(to right, ${routeColor.from}, ${routeColor.to})` } : {}),
      }}
      title={item.label}
    >
      {lottieAnimation ? (
        <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
          <LottieIcon
            animation={lottieAnimation}
            size={18}
            loop={isHovered || isActive}
            autoplay={isHovered || isActive}
            className={`transition-all duration-300 ${isActive ? "opacity-100 brightness-0 invert" : "opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0"}`}
          />
        </div>
      ) : (
        <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} weight={isActive ? "fill" : "regular"} />
      )}
      <span>{item.label}</span>
    </Link>
  );
}

// Separator dot between nav groups
function NavSeparator() {
  return <div className="w-1 h-1 bg-slate-300 rounded-full mx-2 flex-shrink-0" />;
}

export function Navbar({ session, hideMenu = false }: { session: SessionPayload; hideMenu?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navIcons, setNavIcons] = useState<Awaited<ReturnType<typeof loadNavIcons>>>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { state: aiState } = useAILoading();

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

  // Get initials for avatar
  const initials = (session.usuario_nome || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Skeleton navbar during SSR
  const navSkeleton = (
    <header className="glass-strong border-b border-slate-200/60 sticky top-0 z-50" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="max-w-[1920px] mx-auto px-5">
        <div className="flex items-center justify-between h-[68px]">
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-slate-800 hover:bg-slate-50/80 font-bold transition-all group flex-shrink-0">
            <div className="relative">
              <div className="flex items-center justify-center group-hover:scale-105 transition-transform omni-logo-spin">
                <Image src="/omni_icone.png" alt="Omnisfera" width={36} height={36} className="object-contain" priority />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-[1.5px] border-white animate-pulse-soft" />
            </div>
            <img src="/omni_texto.png" alt="Omnisfera" className="h-7 object-contain" style={{ width: 'auto', maxHeight: '28px' }} />
          </Link>
          {!hideMenu && (
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center px-4">
              <div className="w-32 h-7 bg-slate-100 rounded-lg animate-pulse" />
            </nav>
          )}
          <div className="flex items-center gap-3 ml-2 flex-shrink-0">
            <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );

  if (!isMounted || !navIcons || items.length === 0) {
    return navSkeleton;
  }

  // Group items for separators
  const mainItems = items.filter((i: NavItem) => i.group === "main" || !i.group);
  const moduleItems = items.filter((i: NavItem) => i.group === "modules");
  const adminItems = items.filter((i: NavItem) => i.group === "admin");

  return (
    <header className="glass-strong border-b border-slate-200/60 sticky top-0 z-50" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="max-w-[1920px] mx-auto px-5">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-slate-800 hover:bg-slate-50/80 font-bold transition-all group flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={`flex items-center justify-center group-hover:scale-105 transition-transform omni-logo-spin ${aiState.isLoading ? 'opacity-30' : ''}`}>
                  <Image
                    src="/omni_icone.png"
                    alt="Omnisfera"
                    width={36}
                    height={36}
                    className="object-contain"
                    priority
                  />
                </div>
                {aiState.isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center omni-logo-spin-fast">
                    <Image
                      src="/omni_icone.png"
                      alt=""
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                )}
                <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 ${aiState.isLoading ? 'bg-amber-400' : 'bg-emerald-400'} rounded-full border-[1.5px] border-white animate-pulse-soft`} title={aiState.isLoading ? 'IA processando' : 'Sistema online'} />
              </div>
              <img
                src="/omni_texto.png"
                alt="Omnisfera"
                className="h-7 object-contain"
                style={{ width: 'auto', maxHeight: '28px' }}
              />
            </div>
          </Link>

          {/* Navegação Principal - Desktop (lg+) */}
          {!hideMenu && (
            <>
              <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center px-4 overflow-x-auto scrollbar-hide">
                {mainItems.map((item: NavItem) => (
                  <NavItemWithLottie key={item.href} item={item} isActive={pathname === item.href} />
                ))}
                {moduleItems.length > 0 && <NavSeparator />}
                {moduleItems.map((item: NavItem) => (
                  <NavItemWithLottie key={item.href} item={item} isActive={pathname === item.href} />
                ))}
                {adminItems.length > 0 && <NavSeparator />}
                {adminItems.map((item: NavItem) => (
                  <NavItemWithLottie key={item.href} item={item} isActive={pathname === item.href} />
                ))}
              </nav>

              {/* Menu Mobile/Tablet */}
              <div className="lg:hidden flex items-center gap-2 ml-2 flex-shrink-0">
                <select
                  value={pathname}
                  onChange={(e) => router.push(e.target.value)}
                  className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                >
                  {items.map((item: NavItem) => (
                    <option key={item.href} value={item.href}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {/* Global Search Trigger */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Buscar (⌘K)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Buscar...</span>
            <span className="font-mono bg-slate-200 px-1 py-0.5 rounded text-[10px]">⌘K</span>
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 ml-3 flex-shrink-0">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-[13px] font-semibold text-slate-800 leading-tight">{session.usuario_nome}</span>
              <span className="text-[11px] text-slate-400 font-medium">{session.workspace_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white">
                {initials}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                title="Sair"
              >
                {navIcons?.SignOut && <navIcons.SignOut className="w-4 h-4" weight="regular" />}
                <span className="hidden md:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
