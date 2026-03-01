"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Icon } from "phosphor-react";
import { getColorClasses, colorPalette, colorPaletteDark } from "@/lib/colors";
import { LottieIcon } from "@omni/ds";
import { ModuleCard } from "@omni/ds";
import { useRouter } from "next/navigation";
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
      Brain: phosphor.Brain,
      Users: phosphor.Users,
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
    UsersFour: "estudantes_flat", // Estudantes 🎨
    Student: "pei_flat", // PEI 🧭
    PuzzlePiece: "paee_flat", // PAEE 🗺️
    RocketLaunch: "hub_flat", // Hub 🚀
    BookOpen: "Diario_flat", // Diário 📖
    ChartLineUp: "dados_flat", // Evolução & Dados 📊
    UsersThree: "gestão_usuario_flat", // Gestão Usuários 👥
    GraduationCap: "configuracao_escola_flat", // Config Escola 🏫
    ClipboardText: "pgi_flat", // PGI 📄
    Gear: "configuracao_escola_flat", // Admin ⚙️
    BookBookmark: "central_inteligencia_flat", // Central Inteligência 📚
    Brain: "avaliacao_diagnostica_flat", // Avaliação Diagnóstica 🧠
    Users: "estudantes_flat", // Família 👨‍👩‍👧
  };

  // Mapeamento de ícones Phosphor para Lottie OUTLINE COLORIDOS (minimalistas coloridas) - para usar como estáticos na home
  const lottieMapOutlineColored: Record<string, string> = {
    UsersFour: "estudantes_flat", // Estudantes 🎨
    Student: "pei_flat", // PEI 🧭
    PuzzlePiece: "paee_flat", // PAEE 🗺️
    RocketLaunch: "hub_flat", // Hub 🚀
    BookOpen: "Diario_flat", // Diário 📖
    ChartLineUp: "dados_flat", // Evolução & Dados 📊
    UsersThree: "gestão_usuario_flat", // Gestão Usuários 👥
    GraduationCap: "configuracao_escola_flat", // Config Escola 🏫
    ClipboardText: "pgi_flat", // PGI 📄
    Gear: "configuracao_escola_flat", // Admin ⚙️
    BookBookmark: "central_inteligencia_flat", // Central Inteligência 📚
    Brain: "avaliacao_diagnostica_flat", // Avaliação Diagnóstica 🧠
    Users: "estudantes_flat", // Família 👨‍👩‍👧
  };

  return {
    colored: lottieMapColored,
    outline: lottieMapOutlineColored,
    default: lottieMapColored, // Por padrão, usar os coloridos
  };
}

type BadgeInfo = {
  text: string;
  variant: "green" | "yellow" | "red" | "gray";
};

type ModuleCard = {
  href: string;
  iconName: string;
  title: string;
  desc: string;
  color: string;
  badge?: string | BadgeInfo;
  useLottie?: boolean; // Flag para ativar Lottie no hover
  lottieOverride?: string; // Override de animação Lottie via admin
};

type ModuleCardsProps = {
  modules: ModuleCard[];
  title: string;
  titleIconName: string;
  titleIconColor?: string;
  useLottieOnHover?: boolean; // Ativar Lottie no hover para todos
  useLottieByDefault?: boolean; // Mostrar Lottie por padrão (não apenas no hover)
  compact?: boolean; // Compact mode for 2-column layouts
  hideTitle?: boolean; // Hide the section title
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
  useLottieByDefault = false,
  compact = false,
  hideTitle = false,
}: ModuleCardsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [loadedIconMap, setLoadedIconMap] = useState<Record<string, Icon>>({});
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    loadIcons().then((map) => {
      setLoadedIconMap(map);
      setIconsLoaded(true);
    });
    return () => clearTimeout(timer);
  }, []);

  const TitleIcon = loadedIconMap[titleIconName];
  if (!isMounted || !iconsLoaded || !TitleIcon) {
    return (
      <div>
        {!hideTitle && (
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-slate-300 animate-pulse" />
            <div className="w-5 h-5 bg-slate-200 rounded-lg animate-pulse" />
            {title}
          </h2>
        )}
        <div className={`grid gap-${compact ? '3' : '5'} ${compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} ${compact ? 'mb-0' : 'mb-10'}`}>
          {modules.map((m) => (
            <div
              key={m.href}
              className={`${compact ? 'h-[90px]' : 'h-[130px]'} rounded-2xl animate-pulse`}
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
      {!hideTitle && (
        <h2 className={`premium-section-title ${compact ? 'mb-3' : 'mb-5'}`}>
          <TitleIcon className={`${compact ? 'w-4 h-4' : 'w-[18px] h-[18px]'} ${titleIconColor}`} weight="duotone" />
          {title}
        </h2>
      )}
      <div className={`grid ${compact ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10'} stagger-children`}>
        {modules.map((m, index) => {
          const Icon = loadedIconMap[m.iconName];
          if (!Icon) return null;
          const colors = getColorClasses(m.color, isDark);
          const lottieMaps = getLottieMaps();
          const lottieAnimation = m.lottieOverride || lottieMaps.default[m.iconName];
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
              compact={compact}
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
  compact = false,
}: {
  href: string;
  icon: Icon;
  lottieAnimation?: string;
  colors: ReturnType<typeof getColorClasses>;
  title: string;
  desc: string;
  badge?: string | BadgeInfo;
  useLottie: boolean;
  useLottieByDefault?: boolean;
  index?: number;
  compact?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Garantir que só renderiza no cliente
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
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
        className="group relative block rounded-2xl transition-all duration-500 shadow-sm hover:shadow-lg hover:scale-[1.01] hover:-translate-y-0.5 opacity-100 aspect-square"
        style={{ backgroundColor: colors.bg, border: '1px solid var(--border-default)' }}
      >
        {badge && (() => {
          const badgeInfo: BadgeInfo = typeof badge === "string"
            ? { text: badge, variant: "green" }
            : badge;
          const badgeStyles: Record<string, { bg: string; shadow: string }> = {
            green: { bg: "linear-gradient(135deg, #10b981, #059669)", shadow: "0 2px 8px rgba(16,185,129,0.3)" },
            yellow: { bg: "linear-gradient(135deg, #f59e0b, #d97706)", shadow: "0 2px 8px rgba(245,158,11,0.3)" },
            red: { bg: "linear-gradient(135deg, #ef4444, #dc2626)", shadow: "0 2px 8px rgba(239,68,68,0.3)" },
            gray: { bg: "linear-gradient(135deg, #94a3b8, #64748b)", shadow: "0 2px 8px rgba(100,116,139,0.25)" },
          };
          const s = badgeStyles[badgeInfo.variant] || badgeStyles.green;
          return (
            <span
              className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold text-white rounded-full z-10"
              style={{ background: s.bg, boxShadow: s.shadow }}
            >
              {badgeInfo.text}
            </span>
          );
        })()}
        <div className="flex flex-col items-center justify-center text-center h-full p-4 gap-3">
          <div
            className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur shadow-xl"
          >
            <Icon
              className="w-7 h-7 transition-all duration-300"
              style={{ color: colors.icon }}
              weight="duotone"
            />
          </div>
          <div className="min-w-0">
            <span className="font-bold block text-sm transition-colors leading-tight" style={{ color: colors.text }}>
              {title}
            </span>
            <p className="text-[11px] mt-1 leading-snug line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
          </div>
        </div>
      </Link>
    );
  }

  const iconSize = compact ? 40 : 80;
  const lottieSize = compact ? 32 : 72;

  return (
    <div
      className={`group relative block transition-all duration-300 ease-out stagger-item ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ModuleCard
        moduleKey={(href.replace("/", "") as any) || "pei"}
        title={title}
        description={desc}
        badge={typeof badge === "string" ? badge : badge?.text}
        onClick={() => router.push(href)}
        className={`w-full h-full cursor-pointer ${compact ? 'min-h-[120px]' : 'min-h-[150px]'}`}
        iconElement={
          <div className={`transition-all duration-300 ease-out mb-2`}>
            {shouldShowLottie && lottieAnimation ? (
              <div
                className={`rounded-xl flex items-center justify-center backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 shadow-sm group-hover:shadow-md border border-white/20`}
                style={{
                  width: `${iconSize}px`,
                  height: `${iconSize}px`,
                  background: `linear-gradient(135deg, ${colors.icon}20, ${colors.icon}09)`,
                  boxShadow: isHovered ? `0 8px 20px ${colors.icon}25` : undefined,
                }}
              >
                <LottieIcon
                  animation={lottieAnimation}
                  size={lottieSize}
                  state={isHovered ? "hover" : undefined}
                  autoplay={isHovered}
                  className="transition-all duration-300"
                />
              </div>
            ) : (
              <div
                className={`rounded-xl flex items-center justify-center backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 shadow-sm group-hover:shadow-md border border-white/20`}
                style={{
                  width: `${iconSize}px`,
                  height: `${iconSize}px`,
                  background: `linear-gradient(135deg, ${colors.icon}20, ${colors.icon}09)`,
                  boxShadow: isHovered ? `0 8px 20px ${colors.icon}25` : undefined,
                }}
              >
                <Icon
                  className="transition-all duration-300 group-hover:scale-105"
                  style={{ color: colors.icon, width: `${lottieSize}px`, height: `${lottieSize}px` }}
                  weight="duotone"
                />
              </div>
            )}
          </div>
        }
      />
    </div>
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
    const timer = setTimeout(() => setIsMounted(true), 0);
    if (typeof window !== "undefined") {
      loadIcons().then((map) => {
        setClipboardTextIcon(map.ClipboardText || null);
      });
    }
    return () => clearTimeout(timer);
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
        className="group relative block rounded-2xl overflow-hidden transition-all duration-300 ease-out
          hover:-translate-y-1 hover:shadow-premium-lg shadow-premium
          border border-(--border-default) hover:border-purple-500/30"
        style={{ backgroundColor: isDark ? colorPaletteDark.table.bg : colorPalette.table.bg }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top accent bar */}
        <div
          className="h-[3px] group-hover:h-[4px] w-full transition-all duration-300 ease-out"
          style={{ background: `linear-gradient(to right, ${isDark ? colorPaletteDark.table.icon : colorPalette.table.icon}, #a855f7)` }}
        />

        {/* Glow no topo */}
        <div
          className="w-full h-[4px] absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 2px 12px #a855f750` }}
        />

        <div className="p-5 relative z-10">
          <div className="absolute inset-0 bg-linear-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: `linear-gradient(to right, ${isDark ? colorPaletteDark.table.icon : colorPalette.table.icon}15, transparent, ${isDark ? colorPaletteDark.table.icon : colorPalette.table.icon}15)` }} />
          <div className="relative flex items-start gap-4">
            {lottieAnimation ? (
              <div
                className="rounded-xl bg-white/30 flex items-center justify-center backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2"
                style={{ width: '44px', height: '44px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              >
                <LottieIcon
                  animation={lottieAnimation}
                  size={36}
                  state={isHovered ? "hover" : undefined}
                  autoplay={isHovered}
                  className="transition-all duration-300"
                />
              </div>
            ) : (
              ClipboardTextIcon && (
                <div
                  className="rounded-xl bg-white/30 flex items-center justify-center backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2"
                  style={{ width: '44px', height: '44px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                >
                  <ClipboardTextIcon
                    className="transition-all duration-300"
                    style={{ color: isDark ? colorPaletteDark.table.icon : colorPalette.table.icon, width: '36px', height: '36px' }}
                    weight="duotone"
                  />
                </div>
              )
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-extrabold text-lg transition-colors" style={{ color: isDark ? colorPaletteDark.table.text : colorPalette.table.text }}>
                  {title}
                </span>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed">
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
