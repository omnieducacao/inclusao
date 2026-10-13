"use client";

/** Onda 22: visual do design system — tiradas as últimas cores fixas (hex, rgba, Tailwind) e as variáveis antigas --omni-*; esqueleto com omni-esqueleto. */

import Link from "next/link";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import { useRouter } from "next/navigation";
import type { SessionPayload } from "@/lib/session";
import type { Icon } from "phosphor-react";
import { useState, useEffect, useRef } from "react";
import { useAILoading } from "@/hooks/useAILoading";
import { NotificationBell } from "@/components/NotificationBell";
import { AccessibilityMenu } from "./AccessibilityMenu";
import { useTheme } from "./ThemeProvider";

// Carrega o ícone de saída (Phosphor) só no cliente
async function loadNavIcons() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const phosphor = await import("phosphor-react");
    return { SignOut: phosphor.SignOut };
  } catch (err) {
    console.warn("[Navbar] Failed to load phosphor-react:", err);
    return null;
  }
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
      className="relative flex items-center gap-3 shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ zIndex: isOpen ? 100 : 1 }}
    >
      {/* Profile trigger button */}
      <button
        type="button"
        aria-label="Menu do perfil"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Escape") setIsOpen(false); }}
        className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="hidden lg:flex flex-col items-end text-right">
          <span className="omni-body-sm font-semibold leading-tight" style={{ color: 'var(--tinta)' }}>
            {session?.usuario_nome ?? "Admin"}
          </span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--tinta-3)' }}>
            {session?.workspace_name ?? "Plataforma"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="omni-avatar" aria-hidden="true">
            {initials}
          </div>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: 'var(--tinta-3)' }}
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
            backgroundColor: 'var(--superficie)',
            borderColor: 'var(--borda)',
            zIndex: 9999,
            boxShadow: 'var(--sombra-2)',
            marginTop: '2px',
          }}
        >
          {/* User info */}
          <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--borda)' }}>
            <div className="omni-body-sm font-semibold" style={{ color: 'var(--tinta)' }}>
              {session?.usuario_nome ?? "Admin"}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--tinta-3)' }}>
              {session?.workspace_name ?? "Plataforma"}
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <a
              href="/perfil"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 omni-body-sm font-medium transition-all text-left"
              style={{
                color: 'var(--tinta)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--superficie-2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '';
              }}
            >
              <svg className="w-[18px] h-[18px] shrink-0" style={{ color: 'var(--acao)' }} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Meu Perfil</span>
            </a>
            <div className="mx-3 my-1 border-t" style={{ borderColor: 'var(--borda)' }} />
            <button
              onClick={onLogout}
              aria-label="Sair da plataforma"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 omni-body-sm font-medium transition-all text-left"
              style={{
                color: 'var(--tinta)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--superficie-2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '';
              }}
            >
              {signOutIcon && (() => {
                const SignOutIcon = signOutIcon;
                return <SignOutIcon className="w-[18px] h-[18px] shrink-0" style={{ color: "var(--erro)" }} weight="regular" aria-hidden="true" />;
              })()}
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ session }: { session: SessionPayload }) {
  const router = useRouter();
  const [navIcons, setNavIcons] = useState<Awaited<ReturnType<typeof loadNavIcons>>>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { state: aiState } = useAILoading();
  useTheme(); // mantém o tema sincronizado no topo

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    loadNavIcons().then(setNavIcons);
    return () => clearTimeout(timer);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  // Get initials for avatar (safe para admin sem workspace)
  const initials = (session?.usuario_nome || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Skeleton navbar during SSR
  const navSkeleton = (
    <header className="glass-strong sticky top-0 z-50 shadow-premium" style={{ borderBottom: '1px solid var(--borda)', overflow: 'visible' }}>
      <div className="max-w-[1920px] mx-auto px-5" style={{ overflow: 'visible' }}>
        <div className="flex items-center h-[68px]" style={{ overflow: 'visible' }}>
          <Link href="/" aria-label="Omnisfera, início" className="omni-topo__marca shrink-0">
            <SimboloOmnisfera tamanho={34} />
            <span className="omni-topo__nome">omnisfera</span>
          </Link>
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <span className="omni-esqueleto w-8 h-8" style={{ borderRadius: "50%" }} />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="omni-esqueleto w-8 h-8" style={{ borderRadius: "50%" }} />
          </div>
        </div>
      </div>
    </header>
  );

  if (!isMounted || !navIcons) {
    return navSkeleton;
  }

  return (
    <header className="glass-strong sticky top-0 z-50 shadow-premium" style={{ borderBottom: '1px solid var(--borda)', overflow: 'visible' }}>
      <div className="max-w-[1920px] mx-auto px-5" style={{ overflow: 'visible' }}>
        {/* LAYOUT: Logo (esquerda) | Busca+Ícones (direita) | Perfil (extrema direita) */}
        <div className="flex items-center h-[68px]" style={{ overflow: 'visible' }}>

          {/* 1️⃣ LOGO vivo: abre no hover; gira enquanto a IA trabalha (design system: Navegacao) */}
          <Link
            href="/"
            aria-label={aiState.isLoading ? "Omnisfera, início (IA trabalhando)" : "Omnisfera, início"}
            className="omni-topo__marca shrink-0"
          >
            <SimboloOmnisfera key={aiState.isLoading ? "ia" : "hover"} tamanho={34} animacao={aiState.isLoading ? "carregando" : "hover"} />
            <span className="omni-topo__nome">omnisfera</span>
          </Link>

          {/* 3️⃣ BUSCA + ÍCONES AUXILIARES - Direita, antes do perfil */}
          <div className="flex items-center gap-1 ml-auto shrink-0 pl-4">
            {/* Global Search Trigger */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-105"
              style={{ color: 'var(--tinta-3)', backgroundColor: 'var(--superficie-2)', border: '1px solid var(--borda)' }}
              aria-label="Buscar na plataforma (Atalho Command K)"
              aria-keyshortcuts="Control+K Meta+K"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Theme & A11y Menu Menu */}
            <AccessibilityMenu />

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