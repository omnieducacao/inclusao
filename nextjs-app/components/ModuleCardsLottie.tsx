"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Icon } from "phosphor-react";
import { getColorClasses, colorPalette, colorPaletteDark } from "@/lib/colors";
import { LottieIcon } from "./LottieIcon";
import { useTheme } from "./ThemeProvider";

// Import dinâmico dos ícones Phosphor para evitar problemas de SSR
let iconMap: Record<string, Icon> | null = null;

async function loadIcons() {
  if (iconMap) return iconMap;

  if (typeof window === "undefined") {
    return {};
  }

  try {
    const phosphor = await import("phosphor-react");
    iconMap = {
      UsersFour: phosphor.UsersFour,
      RocketLaunch: phosphor.RocketLaunch,
      FileText: phosphor.FileText,
      PuzzlePiece: phosphor.PuzzlePiece,
      BookOpen: phosphor.BookOpen,
      ChartLineUp: phosphor.ChartLineUp,
      GraduationCap: phosphor.GraduationCap,
      ClipboardText: phosphor.ClipboardText,
      BookBookmark: phosphor.BookBookmark,
      Gear: phosphor.Gear,
      Sparkle: phosphor.Sparkle,
      UsersThree: phosphor.UsersThree,
      Student: phosphor.Student,
    };
    return iconMap;
  } catch (err) {
    console.warn("[ModuleCardsLottie] Failed to load phosphor-react:", err);
    return {};
  }
}

// Função para obter os mapeamentos Lottie de forma segura (evita problemas de SSR)
function getLottieMaps() {
  // Mapeamento de ícones Phosphor para Lottie COLORIDOS (wired-lineal) - versão colorida animada!
  const lottieMapColored: Record<string, string> = {
    UsersFour: "wired-lineal-529-boy-girl-children-hover-pinch", // Estudantes - children 🎨
    Student: "wired-lineal-86-compass-hover-pinch", // PEI - bússola 🧭
    PuzzlePiece: "wired-lineal-106-map-hover-pinch", // PAEE - mapa 🗺️
    RocketLaunch: "wired-lineal-489-rocket-space-hover-flying", // Hub - foguete voando 🚀
    BookOpen: "wired-lineal-3140-book-open-hover-pinch", // Diário - livro aberto 📖
    ChartLineUp: "wired-lineal-152-bar-chart-arrow-hover-growth", // Monitoramento - gráfico 📊
    UsersThree: "wired-lineal-314-three-avatars-icon-calm-hover-jumping", // Gestão Usuários 👥
    GraduationCap: "wired-lineal-486-school-hover-pinch", // Config Escola - escola 🏫
    ClipboardText: "wired-lineal-60-documents-hover-swipe", // PGI - documentos 📄
    Gear: "wired-lineal-40-cogs-hover-mechanic", // Admin - engrenagem ⚙️
    BookBookmark: "wired-lineal-2167-books-course-assign-hover-pinch", // Central Inteligência - livros (mesmo de PGI) 📚
  };

  // Mapeamento de ícones Phosphor para Lottie OUTLINE COLORIDOS (minimalistas coloridas) - para usar como estáticos na home
  const lottieMapOutlineColored: Record<string, string> = {
    UsersFour: "wired-outline-529-boy-girl-children-hover-pinch", // Estudantes - children 🎨
    Student: "wired-outline-86-compass-hover-pinch", // PEI - bússola 🧭
    PuzzlePiece: "wired-outline-106-map-hover-pinch", // PAEE - mapa 🗺️
    RocketLaunch: "wired-outline-489-rocket-space-hover-flying", // Hub - foguete voando 🚀
    BookOpen: "wired-outline-3140-book-open-hover-pinch", // Diário - livro aberto 📖
    ChartLineUp: "wired-outline-152-bar-chart-arrow-hover-growth", // Monitoramento - gráfico 📊
    UsersThree: "wired-outline-314-three-avatars-icon-calm-hover-nodding", // Gestão Usuários 👥
    GraduationCap: "wired-outline-486-school-hover-pinch", // Config Escola - escola 🏫
    ClipboardText: "wired-outline-738-notebook-2-hover-pinch", // PGI - notebook/documento 📓
    Gear: "wired-outline-40-cogs-hover-mechanic", // Admin - engrenagem ⚙️
    BookBookmark: "wired-outline-2167-books-course-assign-hover-pinch", // Central Inteligência - livros (mesmo de PGI) 📚
  };

  return {
    colored: lottieMapColored,
    outline: lottieMapOutlineColored,
    default: lottieMapColored, // Por padrão, usar os coloridos
  };
}

type ModuleCard = {
  href: string;
  iconName: string;
  title: string;
  desc: string;
  color: string;
  badge?: string;
  useLottie?: boolean; // Flag para ativar Lottie no hover
};

type ModuleCardsProps = {
  modules: ModuleCard[];
  title: string;
  titleIconName: string;
  titleIconColor?: string;
  useLottieOnHover?: boolean; // Ativar Lottie no hover para todos
  useLottieByDefault?: boolean; // Mostrar Lottie por padrão (não apenas no hover)
};

/**
 * Versão híbrida dos ModuleCards com suporte a Lottie no hover
 * 
 * Comportamento:
 * - Por padrão: mostra ícone estático (Phosphor)
 * - No hover: se useLottieOnHover=true, mostra animação Lottie sutil
 * - Mais sutil que animação constante
 */
export function ModuleCardsLottie({
  modules,
  title,
  titleIconName,
  titleIconColor = "text-slate-600",
  useLottieOnHover = false,
  useLottieByDefault = false, // Novo: mostrar Lottie por padrão
}: ModuleCardsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [loadedIconMap, setLoadedIconMap] = useState<Record<string, Icon>>({});
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    setIsMounted(true);
    loadIcons().then((map) => {
      setLoadedIconMap(map);
      setIconsLoaded(true);
    });
  }, []);

  const TitleIcon = loadedIconMap[titleIconName];
  if (!isMounted || !iconsLoaded || !TitleIcon) {
    return (
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-slate-300 animate-pulse" />
          <div className="w-5 h-5 bg-slate-200 rounded-lg animate-pulse" />
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {modules.map((m) => (
            <div
              key={m.href}
              className="h-[130px] rounded-2xl animate-pulse"
              style={{ backgroundColor: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Remove unreachable SSR fallback (already handled above)

  return (
    <div>
      <h2 className="heading-section text-slate-800 mb-5 flex items-center gap-3">
        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: titleIconColor === 'text-slate-600' ? '#94a3b8' : undefined, background: titleIconColor !== 'text-slate-600' ? 'linear-gradient(to bottom, #3b82f6, #6366f1)' : undefined }} />
        <TitleIcon className={`w-5 h-5 ${titleIconColor}`} weight="duotone" />
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 stagger-children">
        {modules.map((m, index) => {
          const Icon = loadedIconMap[m.iconName];
          if (!Icon) return null;
          const colors = getColorClasses(m.color, isDark);
          const lottieMaps = getLottieMaps();
          const lottieAnimation = lottieMaps.default[m.iconName];
          const shouldUseLottie = (m.useLottie ?? useLottieOnHover) || useLottieByDefault;

          return (
            <ModuleCardWithLottie
              key={m.href}
              href={m.href}
              icon={Icon}
              lottieAnimation={lottieAnimation}
              colors={colors}
              title={m.title}
              desc={m.desc}
              badge={m.badge}
              useLottie={shouldUseLottie}
              useLottieByDefault={useLottieByDefault}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}

function ModuleCardWithLottie({
  href,
  icon: Icon,
  lottieAnimation,
  colors,
  title,
  desc,
  badge,
  useLottie,
  useLottieByDefault = false,
  index = 0,
}: {
  href: string;
  icon: Icon;
  lottieAnimation?: string; // Colorido (lineal) - sempre em movimento
  colors: ReturnType<typeof getColorClasses>;
  title: string;
  desc: string;
  badge?: string;
  useLottie: boolean;
  useLottieByDefault?: boolean;
  index?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Garantir que só renderiza no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animação de entrada escalonada (apenas no cliente)
  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100); // Delay de 100ms entre cada card
    return () => clearTimeout(timer);
  }, [index, isMounted]);

  // Sempre mostrar Lottie quando disponível (usando colorido/lineal)
  // Se useLottieByDefault=true, sempre mostrar Lottie quando mapeado
  // Se useLottieByDefault=false, só mostrar se useLottie=true
  const shouldShowLottie = useLottieByDefault
    ? !!lottieAnimation
    : (useLottie && !!lottieAnimation);

  // Durante SSR, mostrar versão estática
  if (!isMounted) {
    return (
      <Link
        href={href}
        className="group relative block p-6 rounded-2xl transition-all duration-500 shadow-sm hover:shadow-lg hover:scale-[1.01] hover:-translate-y-0.5 opacity-100"
        style={{ backgroundColor: colors.bg, border: '1px solid var(--border-default)' }}
      >
        {badge && (
          <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm">
            {badge}
          </span>
        )}
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0">
            <div
              className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur shadow-xl relative z-10"
            >
              <Icon
                className="w-10 h-10 transition-all duration-300"
                style={{ color: colors.icon }}
                weight="duotone"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold block text-lg transition-colors" style={{ color: colors.text }}>
              {title}
            </span>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{desc}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group relative block rounded-2xl overflow-hidden transition-all duration-500 ${isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-4'
        }`}
      style={{
        backgroundColor: colors.bg,
        boxShadow: isHovered
          ? '0 8px 24px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)'
          : '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)',
        border: isHovered
          ? `1px solid ${colors.icon}40`
          : '1px solid var(--border-default)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${colors.icon}, ${colors.text})` }} />

      <div className="p-6">
        {badge && (
          <span className="absolute top-4 right-4 px-2.5 py-0.5 text-[11px] font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm">
            {badge}
          </span>
        )}
        <div className="flex items-start gap-5">
          <div className={`flex-shrink-0 transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}>
            {shouldShowLottie && lottieAnimation ? (
              <div
                className="rounded-xl bg-white/30 flex items-center justify-center backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2"
                style={{ width: '64px', height: '64px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              >
                <LottieIcon
                  animation={lottieAnimation}
                  size={56}
                  loop={isHovered}
                  autoplay={isHovered}
                  className="transition-all duration-300"
                />
              </div>
            ) : (
              <div
                className="rounded-xl bg-white/30 flex items-center justify-center backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2"
                style={{ width: '64px', height: '64px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              >
                <Icon
                  className="transition-all duration-300"
                  style={{ color: colors.icon, width: '56px', height: '56px' }}
                  weight="duotone"
                />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <span className="font-bold block text-[17px] transition-colors leading-tight" style={{ color: colors.text }}>
              {title}
            </span>
            <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{desc}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Manter o componente original para compatibilidade
export function ModuleCards({ modules, title, titleIconName, titleIconColor = "text-slate-600" }: ModuleCardsProps) {
  return (
    <ModuleCardsLottie
      modules={modules}
      title={title}
      titleIconName={titleIconName}
      titleIconColor={titleIconColor}
      useLottieOnHover={false}
    />
  );
}

type IntelligenceModuleProps = {
  href: string;
  title: string;
  desc: string;
};

export function IntelligenceModuleCard({ href, title, desc }: IntelligenceModuleProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [ClipboardTextIcon, setClipboardTextIcon] = useState<Icon | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const lottieMaps = getLottieMaps();
  const lottieAnimation = lottieMaps.colored.BookBookmark; // Agora aponta para livros (mesmo de PGI)

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      loadIcons().then((map) => {
        setClipboardTextIcon(map.ClipboardText || null);
      });
    }
  }, []);

  if (!isMounted || !ClipboardTextIcon) {
    return (
      <div>
        <h2 className="text-lg font-extrabold text-slate-800 mb-5 flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-purple-400 animate-pulse" />
          <div className="w-5 h-5 bg-purple-200 rounded-lg animate-pulse" />
          Conhecimento e Referência
        </h2>
        <div className="h-40 bg-white rounded-2xl animate-pulse" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="heading-section text-slate-800 mb-5 flex items-center gap-3">
        <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #8b5cf6, #a855f7)' }} />
        <ClipboardTextIcon className="w-5 h-5 text-purple-600" weight="duotone" />
        Conhecimento e Referência
      </h2>
      <Link
        href={href}
        className="group relative block rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: isDark ? colorPaletteDark.table.bg : colorPalette.table.bg,
          boxShadow: isHovered
            ? '0 8px 32px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)'
            : '0 4px 12px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
          border: '1px solid var(--border-default)',
          transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${isDark ? colorPaletteDark.table.icon : colorPalette.table.icon}, #a855f7)` }} />

        <div className="p-8">
          <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: `linear-gradient(to right, ${isDark ? colorPaletteDark.table.icon : colorPalette.table.icon}15, transparent, ${isDark ? colorPaletteDark.table.icon : colorPalette.table.icon}15)` }} />
          <div className="relative flex items-start gap-6">
            {lottieAnimation ? (
              <div
                className="rounded-xl bg-white/30 flex items-center justify-center backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2"
                style={{ width: '64px', height: '64px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              >
                <LottieIcon
                  animation={lottieAnimation}
                  size={56}
                  loop={isHovered}
                  autoplay={isHovered}
                  className="transition-all duration-300"
                />
              </div>
            ) : (
              ClipboardTextIcon && (
                <div
                  className="rounded-xl bg-white/30 flex items-center justify-center backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2"
                  style={{ width: '64px', height: '64px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                >
                  <ClipboardTextIcon
                    className="transition-all duration-300"
                    style={{ color: isDark ? colorPaletteDark.table.icon : colorPalette.table.icon, width: '56px', height: '56px' }}
                    weight="duotone"
                  />
                </div>
              )
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-extrabold text-2xl transition-colors" style={{ color: isDark ? colorPaletteDark.table.text : colorPalette.table.text }}>
                  {title}
                </span>
                <span className="px-2.5 py-0.5 text-[11px] font-bold text-white rounded-full shadow-sm" style={{ backgroundColor: isDark ? colorPaletteDark.table.icon : colorPalette.table.icon }}>
                  Novo
                </span>
              </div>
              <p className="text-[15px] text-slate-600 leading-relaxed">
                {desc}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all" style={{ color: isDark ? colorPaletteDark.table.icon : colorPalette.table.icon }}>
                <span>Explorar recursos</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
