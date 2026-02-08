"use client";

import Link from "next/link";
import { useState } from "react";
import {
  UsersFour,
  RocketLaunch,
  FileText as FileTextPhosphor,
  PuzzlePiece,
  BookOpen as BookOpenPhosphor,
  ChartLineUp,
  GraduationCap,
  ClipboardText,
  BookBookmark,
  Gear,
  Sparkle,
  UsersThree,
  Student,
} from "phosphor-react";
import type { Icon } from "phosphor-react";
import { getColorClasses, colorPalette } from "@/lib/colors";
import { LottieIcon } from "./LottieIcon";

const iconMap: Record<string, Icon> = {
  UsersFour,
  RocketLaunch,
  FileText: FileTextPhosphor,
  PuzzlePiece,
  BookOpen: BookOpenPhosphor,
  ChartLineUp,
  GraduationCap,
  ClipboardText,
  BookBookmark,
  Gear,
  Sparkle,
  UsersThree,
  Student,
};

// Mapeamento de ícones Phosphor para Lottie OUTLINE (minimalistas) - perfeitos para home!
const lottieMapOutline: Record<string, string> = {
  UsersFour: "wired-outline-44-avatar-user-in-circle-hover-looking-around", // Minimalista ✅
  Student: "wired-outline-406-study-graduation-hover-pinch", // Minimalista ✅
  PuzzlePiece: "wired-outline-458-goal-target-hover-hit", // Minimalista ✅
  RocketLaunch: "wired-outline-3139-rocket-space-alt-hover-pinch", // Minimalista ✅
  BookOpen: "wired-outline-738-notebook-2-hover-pinch", // Minimalista ✅
  ChartLineUp: "wired-outline-153-bar-chart-hover-pinch", // Minimalista ✅
  UsersThree: "wired-outline-44-avatar-user-in-circle-hover-looking-around", // Minimalista ✅
  GraduationCap: "wired-outline-406-study-graduation-hover-pinch", // Minimalista ✅
  ClipboardText: "wired-outline-754-pin-attachement-hover-pinch", // Minimalista ✅
  Gear: "wired-outline-40-cogs-hover-mechanic", // Minimalista ✅
};

// Mapeamento de ícones Phosphor para Lottie COLORIDOS (wired-lineal) - versão colorida!
const lottieMapColored: Record<string, string> = {
  UsersFour: "wired-lineal-529-boy-girl-children-hover-pinch", // Estudantes - children 🎨
  Student: "wired-lineal-86-compass-hover-pinch", // PEI - bússola 🧭
  PuzzlePiece: "wired-lineal-106-map-hover-pinch", // PAEE - mapa 🗺️
  RocketLaunch: "wired-lineal-489-rocket-space-hover-flying", // Hub - foguete voando 🚀
  BookOpen: "wired-lineal-3140-book-open-hover-pinch", // Diário - livro aberto 📖
  ChartLineUp: "wired-lineal-152-bar-chart-arrow-hover-growth", // Monitoramento - gráfico 📊
  UsersThree: "wired-lineal-314-three-avatars-icon-calm-hover-jumping", // Gestão Usuários 👥
  GraduationCap: "wired-lineal-486-school-hover-pinch", // Config Escola - escola 🏫
  ClipboardText: "wired-lineal-2167-books-course-assign-hover-pinch", // PGI - livros 📚
  Gear: "wired-lineal-40-cogs-hover-mechanic", // Admin - engrenagem ⚙️
  BookBookmark: "wired-lineal-2512-artificial-intelligence-ai-alt-hover-pinch", // Central Inteligência - cérebro/chip 🧠💻
};

// Mapeamento de ícones Phosphor para Lottie OUTLINE COLORIDOS (minimalistas coloridas) - para usar nas páginas!
const lottieMapOutlineColored: Record<string, string> = {
  UsersFour: "wired-outline-529-boy-girl-children-hover-pinch", // Estudantes - children 🎨
  Student: "wired-outline-86-compass-hover-pinch", // PEI - bússola 🧭
  PuzzlePiece: "wired-outline-106-map-hover-pinch", // PAEE - mapa 🗺️
  RocketLaunch: "wired-outline-489-rocket-space-hover-flying", // Hub - foguete voando 🚀
  BookOpen: "wired-outline-3140-book-open-hover-pinch", // Diário - livro aberto 📖
  ChartLineUp: "wired-outline-152-bar-chart-arrow-hover-growth", // Monitoramento - gráfico 📊
  UsersThree: "wired-outline-314-three-avatars-icon-calm-hover-nodding", // Gestão Usuários 👥
  GraduationCap: "wired-outline-486-school-hover-pinch", // Config Escola - escola 🏫
  ClipboardText: "wired-outline-2167-books-course-assign-hover-pinch", // PGI - livros 📚
  Gear: "wired-outline-40-cogs-hover-mechanic", // Admin - engrenagem ⚙️
  BookBookmark: "wired-outline-2512-artificial-intelligence-ai-alt-hover-pinch", // Central Inteligência - cérebro/chip 🧠💻
};

// Por padrão, usar os coloridos para teste
const lottieMap = lottieMapColored;

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
  const TitleIcon = iconMap[titleIconName];
  if (!TitleIcon) return null;
  
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <TitleIcon className={`w-5 h-5 ${titleIconColor}`} weight="duotone" />
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {modules.map((m) => {
          const Icon = iconMap[m.iconName];
          if (!Icon) return null;
          const colors = getColorClasses(m.color);
          const lottieAnimation = lottieMap[m.iconName];
          const shouldUseLottie = m.useLottie ?? useLottieOnHover;
          
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
              useLottie={shouldUseLottie && !!lottieAnimation}
              useLottieByDefault={useLottieByDefault}
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
}: {
  href: string;
  icon: Icon;
  lottieAnimation?: string;
  colors: ReturnType<typeof getColorClasses>;
  title: string;
  desc: string;
  badge?: string;
  useLottie: boolean;
  useLottieByDefault?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Se useLottieByDefault=true, mostrar Lottie sempre (não apenas no hover)
  const shouldShowLottie = useLottieByDefault 
    ? (useLottie && !!lottieAnimation) 
    : (useLottie && isHovered && lottieAnimation);

  return (
    <Link
      href={href}
      className="group relative block p-6 rounded-xl border-2 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
      style={{ backgroundColor: colors.bg }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-5">
        {/* Ícone: Lottie por padrão (se useLottieByDefault) ou apenas no hover */}
        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
          {shouldShowLottie ? (
            <LottieIcon
              animation={lottieAnimation!}
              size={56}
              loop={true}
              className="transition-all duration-300 group-hover:scale-110"
            />
          ) : (
            <Icon
              className="w-14 h-14 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{ color: colors.icon }}
              weight="duotone"
            />
          )}
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
  const lottieAnimation = lottieMapColored.BookBookmark;
  
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <BookBookmark className="w-5 h-5 text-purple-600" weight="duotone" />
        Conhecimento e Referência
      </h2>
      <Link
        href={href}
        className="group relative block p-8 rounded-2xl border-2 border-slate-200 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.01] hover:border-slate-300 overflow-hidden"
        style={{ backgroundColor: colorPalette.table.bg }}
      >
        <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: `linear-gradient(to right, ${colorPalette.table.icon}15, transparent, ${colorPalette.table.icon}15)` }}></div>
        <div className="relative flex items-start gap-6">
          {/* Ícone Lottie colorido para Central de Inteligência */}
          {lottieAnimation ? (
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <LottieIcon
                animation={lottieAnimation}
                size={64}
                loop={true}
                className="transition-all duration-300 group-hover:scale-110"
              />
            </div>
          ) : (
            <BookBookmark
              className="w-16 h-16 flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
              style={{ color: colorPalette.table.icon }}
              weight="duotone"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-2xl transition-colors" style={{ color: colorPalette.table.text }}>
                {title}
              </span>
              <span className="px-3 py-1 text-xs font-bold text-white rounded-full shadow-sm" style={{ backgroundColor: colorPalette.table.icon }}>
                Novo
              </span>
            </div>
            <p className="text-base text-slate-700 leading-relaxed font-medium">
              {desc}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all" style={{ color: colorPalette.table.icon }}>
              <span>Explorar recursos</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
