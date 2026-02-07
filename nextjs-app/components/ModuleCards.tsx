"use client";

import Link from "next/link";
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

type ModuleCard = {
  href: string;
  iconName: string;
  title: string;
  desc: string;
  color: string;
  badge?: string;
};

type ModuleCardsProps = {
  modules: ModuleCard[];
  title: string;
  titleIconName: string;
  titleIconColor?: string;
};

export function ModuleCards({ modules, title, titleIconName, titleIconColor = "text-slate-600" }: ModuleCardsProps) {
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
          return (
            <Link
              key={m.href}
              href={m.href}
              className="group relative block p-6 rounded-xl border-2 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
              style={{ backgroundColor: colors.bg }}
            >
              {m.badge && (
                <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm">
                  {m.badge}
                </span>
              )}
              <div className="flex items-start gap-5">
                <Icon 
                  className="w-14 h-14 flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" 
                  style={{ color: colors.icon }}
                  weight="duotone"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-bold block text-lg transition-colors" style={{ color: colors.text }}>{m.title}</span>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

type IntelligenceModuleProps = {
  href: string;
  title: string;
  desc: string;
};

export function IntelligenceModuleCard({ href, title, desc }: IntelligenceModuleProps) {
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
          <BookBookmark 
            className="w-16 h-16 flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" 
            style={{ color: colorPalette.table.icon }}
            weight="duotone"
          />
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
