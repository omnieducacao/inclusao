"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { SessionPayload } from "@/lib/session";
import type { Icon } from "phosphor-react";
import { useState, useEffect, useRef } from "react";
import { LottieIcon } from "./LottieIcon";
import { useAILoading } from "@/hooks/useAILoading";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";

type PermissionKey =
  | "can_estudantes"
  | "can_pei"
  | "can_pei_professor"
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
    "/estudantes": "estudantes_simples", // Estudantes
    "/pei": "pei_simples", // PEI
    "/pei-regente": "pei_simples", // PEI Regente (usa mesmo ícone)
    "/plano-curso": "pei_simples", // Plano de Curso
    "/avaliacao-diagnostica": "pei_simples", // Avaliação Diagnóstica
    "/avaliacao-processual": "pei_simples", // Avaliação Processual
    "/paee": "paee_simples", // PAEE
    "/hub": "hub_simples", // Hub
    "/diario": "diario_simples", // Diário
    "/monitoramento": "dados_simples", // Evolução & Dados
    "/infos": "central_inteligencia_simples", // Central
    "/config-escola": "configuracao_escola_flat", // Config Escola (sem versão simples)
    "/gestao": "gestao_usuario_simples", // Gestão
    "/pgi": "pgi_simples", // PGI
  };
}

function getNavItems(icons: ReturnType<typeof loadNavIcons> extends Promise<infer T> ? T : any): NavItem[] {
  if (!icons) return [];

  return [
    { href: "/estudantes", label: "Estudantes", icon: icons.UsersFour, permission: "can_estudantes", group: "main" },
    { href: "/pei", label: "PEI", icon: icons.FileText, permission: "can_pei", group: "modules" },
    { href: "/pei-regente", label: "PEI - Professor", icon: icons.BookOpen, permission: "can_pei_professor", group: "modules" },
    { href: "/plano-curso", label: "Plano de Curso", icon: icons.BookOpen, permission: "can_pei_professor", group: "modules" },
    { href: "/avaliacao-diagnostica", label: "Avaliação Diagnóstica", icon: icons.BookOpen, permission: "can_pei_professor", group: "modules" },
    { href: "/avaliacao-processual", label: "Avaliação Processual", icon: icons.ChartLineUp, permission: "can_pei_professor", group: "modules" },
    { href: "/paee", label: "PAEE", icon: icons.PuzzlePiece, permission: "can_paee", group: "modules" },
    { href: "/hub", label: "Hub", icon: icons.RocketLaunch, permission: "can_hub", group: "modules" },
    { href: "/diario", label: "Diário", icon: icons.BookOpen, permission: "can_diario", group: "modules" },
    { href: "/monitoramento", label: "Evolução & Dados", icon: icons.ChartLineUp, permission: "can_avaliacao", group: "modules" },
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
  if (session?.is_platform_admin) return true;
  const member = session?.member as Record<string, boolean> | undefined;
  // Se não tem member e não é admin, deve negar o acesso para evitar vazamento
  if (!member) return false;
  return member[item.permission] === true;
}

// Cor da pill ativa por rota (corresponde à cor de cada módulo)
const NAV_ROUTE_COLORS: Record<string, { from: string; to: string }> = {
  "/": { from: "#3b82f6", to: "#6366f1" },           // Home: blue → indigo
  "/estudantes": { from: "#4F5BD5", to: "#6366f1" },  // Estudantes: índigo
  "/pei": { from: "#4285F4", to: "#3574D4" },         // PEI: azul
  "/pei-regente": { from: "#059669", to: "#10b981" },   // PEI Regente: emerald
  "/plano-curso": { from: "#0ea5e9", to: "#0284c7" },   // Plano de Curso: sky
  "/avaliacao-diagnostica": { from: "#2563eb", to: "#1d4ed8" }, // Avaliação Diagnóstica: blue
  "/avaliacao-processual": { from: "#10b981", to: "#059669" }, // Avaliação Processual: green
  "/paee": { from: "#9334E6", to: "#7C2BC4" },        // PAEE: roxo
  "/hub": { from: "#34A853", to: "#2D8C47" },         // Hub: verde
  "/diario": { from: "#E8453C", to: "#C33B34" },      // Diário: vermelho
  "/monitoramento": { from: "#34A853", to: "#2D8C47" }, // Evolução & Dados: verde
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

  // Evitar crash se ícone não carregou (ex.: admin com ShieldCheckered)
  if (!Icon) {
    return (
      <Link href={item.href} className="px-3.5 py-2 rounded-xl text-[13px] font-semibold text-slate-500">
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap flex-shrink-0 ${isActive
        ? "text-white shadow-md"
        : "hover:shadow-sm"
        }`}
      style={{
        color: isActive ? 'white' : 'var(--text-muted)',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        ...(isActive ? { background: `linear-gradient(to right, ${routeColor.from}, ${routeColor.to})` } : {}),
      }}
      onMouseOver={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
        }
      }}
      onMouseOut={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor = '';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
        }
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
  return <div className="w-1 h-1 rounded-full mx-2 flex-shrink-0" style={{ backgroundColor: 'var(--border-strong)' }} />;
}

// Dropdown component for navigation items
function NavDropdown({ label, items, isActive, icon: Icon, pathname }: { label: string; items: NavItem[]; isActive: boolean; icon: Icon; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const routeColor = { from: "#F9AB00", to: "#D49300" }; // Cor para Config/Gestão

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Delay para permitir movimento entre botão e menu
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      className="relative flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ zIndex: isOpen ? 100 : 1 }}
    >
      <button
        type="button"
        className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap flex-shrink-0 ${isActive
          ? "text-white shadow-md"
          : "hover:shadow-sm"
          }`}
        style={{
          color: isActive ? 'white' : 'var(--text-muted)',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          ...(isActive
            ? { backgroundImage: `linear-gradient(to right, ${routeColor.from}, ${routeColor.to})` }
            : { backgroundColor: isOpen ? 'var(--bg-hover)' : 'transparent' }
          ),
        }}
      >
        {Icon && (
          <Icon
            className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
            weight={isActive ? "fill" : "regular"}
          />
        )}
        <span>{label}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && items.length > 0 && (
        <div
          className="absolute top-full left-0 py-2 rounded-xl border min-w-[220px]"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-default)',
            zIndex: 9999,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            marginTop: '2px',
          }}
        >
          {items.map((item) => {
            const ItemIcon = item.icon;
            const lottieMap = getNavLottieMap();
            const lottieAnimation = lottieMap[item.href];
            const isCurrentPage = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-all block rounded-lg mx-2"
                style={{
                  color: isCurrentPage ? '#4285F4' : 'var(--text-primary)',
                  backgroundColor: isCurrentPage ? 'rgba(66, 133, 244, 0.1)' : 'transparent',
                  fontWeight: isCurrentPage ? 600 : 500,
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentPage) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentPage) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '';
                  } else {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(66, 133, 244, 0.1)';
                  }
                }}
              >
                {lottieAnimation ? (
                  <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
                    <LottieIcon
                      animation={lottieAnimation}
                      size={18}
                      loop={false}
                      autoplay={false}
                      className={isCurrentPage ? "opacity-100" : "opacity-60 grayscale"}
                    />
                  </div>
                ) : ItemIcon ? (
                  <ItemIcon
                    className="w-[18px] h-[18px] flex-shrink-0"
                    style={{ color: isCurrentPage ? '#4285F4' : 'var(--text-muted)' }}
                    weight={isCurrentPage ? "fill" : "regular"}
                  />
                ) : null}
                <span>{item.label}</span>
                {isCurrentPage && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4285F4' }} />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Profile dropdown component
function ProfileDropdown({
  session,
  initials,
  onLogout,
  signOutIcon
}: {
  session: SessionPayload;
  initials: string;
  onLogout: () => void;
  signOutIcon?: Icon;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      className="relative flex items-center gap-3 flex-shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ zIndex: isOpen ? 100 : 1 }}
    >
      {/* Profile trigger button */}
      <button
        type="button"
        className="flex items-center gap-3 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="hidden lg:flex flex-col items-end text-right">
          <span className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {session?.usuario_nome ?? "Admin"}
          </span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {session?.workspace_name ?? "Plataforma"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white">
            {initials}
          </div>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: 'var(--text-muted)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute top-full right-0 py-2 rounded-xl border min-w-[200px]"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-default)',
            zIndex: 9999,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            marginTop: '2px',
          }}
        >
          {/* User info */}
          <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <div className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {session?.usuario_nome ?? "Admin"}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {session?.workspace_name ?? "Plataforma"}
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <a
              href="/perfil"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-all text-left block"
              style={{
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '';
              }}
            >
              <svg className="w-[18px] h-[18px] flex-shrink-0" style={{ color: '#4285F4' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Meu Perfil</span>
            </a>
            <div className="mx-3 my-1 border-t" style={{ borderColor: 'var(--border-default)' }} />
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-all text-left"
              style={{
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '';
              }}
            >
              {signOutIcon && (() => {
                const SignOutIcon = signOutIcon;
                return <SignOutIcon className="w-[18px] h-[18px] flex-shrink-0 text-red-500" weight="regular" />;
              })()}
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ session, hideMenu = false }: { session: SessionPayload; hideMenu?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navIcons, setNavIcons] = useState<Awaited<ReturnType<typeof loadNavIcons>>>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { state: aiState } = useAILoading();
  const { isDark } = useTheme();

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
    : session?.is_platform_admin
      ? [{ href: "/admin", label: "Admin", icon: navIcons.ShieldCheckered, group: "main" as const }]
      : navItems.filter((item) => canAccess(item, session));

  // Get initials for avatar (safe para admin sem workspace)
  const initials = (session?.usuario_nome || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Skeleton navbar during SSR
  const navSkeleton = (
    <header className="glass-strong sticky top-0 z-50" style={{ boxShadow: 'var(--shadow-xs)', borderBottom: '1px solid var(--border-default)', overflow: 'visible' }}>
      <div className="max-w-[1920px] mx-auto px-5" style={{ overflow: 'visible' }}>
        <div className="flex items-center h-[68px]" style={{ overflow: 'visible' }}>
          <Link href="/" className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-slate-800 hover:bg-slate-50/80 font-bold transition-all group flex-shrink-0">
            <div className="relative">
              <div className="flex items-center justify-center group-hover:scale-105 transition-transform omni-logo-spin">
                <Image src={isDark ? "/logo-dark.png" : "/omni_icone.png"} alt="Omnisfera" width={36} height={36} className="object-contain" priority />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-[1.5px] border-white animate-pulse-soft" />
            </div>
            <img src={isDark ? "/omni_texto_branco.png" : "/omni_texto.png"} alt="Omnisfera" className="h-8 object-contain" style={{ width: 'auto', maxHeight: '32px' }} />
          </Link>
          {!hideMenu && (
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center px-4">
              <div className="w-32 h-7 bg-slate-100 rounded-lg animate-pulse" />
            </nav>
          )}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
            <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
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

  // Items para o dropdown "Configuração e Gestão"
  const configDropdownPaths = ["/gestao", "/config-escola", "/estudantes"];
  const configDropdownItems = items.filter((i: NavItem) => configDropdownPaths.includes(i.href));
  const hasConfigDropdown = configDropdownItems.length > 0;
  const isConfigDropdownActive = configDropdownPaths.includes(pathname);

  // Remove config dropdown items from their respective groups
  const filteredMainItems = mainItems.filter((i: NavItem) => !configDropdownPaths.includes(i.href));
  const filteredModuleItems = moduleItems.filter((i: NavItem) => !configDropdownPaths.includes(i.href));
  const filteredAdminItems = adminItems.filter((i: NavItem) => !configDropdownPaths.includes(i.href));

  return (
    <header className="glass-strong sticky top-0 z-50" style={{ boxShadow: 'var(--shadow-xs)', borderBottom: '1px solid var(--border-default)', overflow: 'visible' }}>
      <div className="max-w-[1920px] mx-auto px-5" style={{ overflow: 'visible' }}>
        {/* LAYOUT: Logo (esquerda) | Nav (centro, flex-1) | Busca+Ícones (direita) | Perfil (extrema direita) */}
        <div className="flex items-center h-[68px]" style={{ overflow: 'visible' }}>

          {/* 1️⃣ LOGO - Sempre esquerda, nunca encolhe */}
          <Link
            href="/"
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-slate-800 hover:bg-slate-50/80 font-bold transition-all group flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={`flex items-center justify-center group-hover:scale-105 transition-transform omni-logo-spin ${aiState.isLoading ? 'opacity-30' : ''}`}>
                  <Image
                    src={isDark ? "/logo-dark.png" : "/omni_icone.png"}
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
                      src={isDark ? "/logo-dark.png" : "/omni_icone.png"}
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
                src={isDark ? "/omni_texto_branco.png" : "/omni_texto.png"}
                alt="Omnisfera"
                className="h-8 object-contain"
                style={{ width: 'auto', maxHeight: '32px' }}
              />
            </div>
          </Link>


          {/* 2️⃣ NAVEGAÇÃO - Centro, expande para ocupar espaço disponível */}
          {!hideMenu && (
            <>
              <div className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0" style={{ position: 'relative' }}>
                <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide" style={{ flexShrink: 1 }}>
                  {filteredMainItems.map((item: NavItem) => (
                    <NavItemWithLottie key={item.href} item={item} isActive={pathname === item.href} />
                  ))}
                  {filteredModuleItems.map((item: NavItem) => (
                    <NavItemWithLottie key={item.href} item={item} isActive={pathname === item.href} />
                  ))}
                  {(filteredAdminItems.length > 0 || hasConfigDropdown)}
                  {filteredAdminItems.map((item: NavItem) => (
                    <NavItemWithLottie key={item.href} item={item} isActive={pathname === item.href} />
                  ))}
                </nav>

                {/* Dropdown fora do nav para evitar overflow */}
                {hasConfigDropdown && navIcons && (
                  <div className="flex-shrink-0">
                    <NavDropdown
                      label=""
                      items={configDropdownItems}
                      isActive={isConfigDropdownActive}
                      icon={navIcons.Gear}
                      pathname={pathname}
                    />
                  </div>
                )}
              </div>

              {/* Menu Mobile/Tablet - Aparece no lugar da nav em lg */}
              <div className="lg:hidden flex items-center gap-2 flex-1 justify-center">
                <select
                  value={pathname}
                  onChange={(e) => router.push(e.target.value)}
                  className="text-sm px-3 py-2 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-default)', border: '1px solid var(--border-default)' }}
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

          {/* 3️⃣ BUSCA + ÍCONES AUXILIARES - Direita, antes do perfil */}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0 pl-4">
            {/* Global Search Trigger */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-105"
              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-default)' }}
              title="Buscar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell */}
            <NotificationBell />
          </div>

          {/* 4️⃣ PERFIL - Extrema direita, elemento final */}
          <ProfileDropdown
            session={session}
            initials={initials}
            onLogout={handleLogout}
            signOutIcon={navIcons?.SignOut}
          />
        </div>
      </div>
    </header>
  );
}