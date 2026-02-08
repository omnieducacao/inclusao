"use client";

import type { LucideIcon } from "lucide-react";
import { getColorClasses } from "@/lib/colors";
import { LottieIcon } from "./LottieIcon";

// Mapeamento de ícones para Lottie OUTLINE COLORIDOS (minimalistas coloridas) - para usar nas páginas!
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

type PageHeroProps = {
  icon: LucideIcon;
  iconName?: string; // Nome do ícone para mapear para Lottie (ex: "Student", "PuzzlePiece")
  title: string;
  desc: string;
  color?: "sky" | "blue" | "cyan" | "violet" | "rose" | "slate" | "teal";
  useLottie?: boolean; // Se deve usar Lottie ao invés do ícone estático
};

export function PageHero({ icon: Icon, iconName, title, desc, color = "sky", useLottie = true }: PageHeroProps) {
  const colors = getColorClasses(color);
  const lottieAnimation = iconName ? lottieMapOutlineColored[iconName] : null;
  
  return (
    <div
      className="rounded-xl border-2 border-slate-200 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="flex items-center gap-5 h-32 px-6">
        {/* Ícone: Lottie outline colorido se disponível, senão ícone estático */}
        {useLottie && lottieAnimation ? (
          <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
            <LottieIcon
              animation={lottieAnimation}
              size={56}
              loop={true}
              className="transition-all duration-300"
            />
          </div>
        ) : (
          <Icon className="w-14 h-14 flex-shrink-0" style={{ color: colors.icon }} />
        )}
        <div>
          <h1 className="text-xl font-bold" style={{ color: colors.text }}>{title}</h1>
          <p className="text-sm text-slate-600 mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  );
}
