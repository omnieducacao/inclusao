"use client";

import { useState, useEffect } from "react";
import { getColorClasses } from "@/lib/colors";
import { LottieIcon } from "./LottieIcon";

// Mapeamento de ícones para Lottie OUTLINE COLORIDOS (minimalistas coloridas) - versões com cores nos tons de cada página!
// Versões com "(1)" são as coloridas que você enviou mais para o final
const lottieMapOutlineColored: Record<string, string> = {
  UsersFour: "wired-outline-529-boy-girl-children-hover-pinch (1)", // Estudantes - children 🎨 (colorido)
  Student: "wired-outline-86-compass-hover-pinch (1)", // PEI - bússola 🧭 (colorido)
  PuzzlePiece: "wired-outline-106-map-hover-pinch (1)", // PAEE - mapa 🗺️ (colorido)
  RocketLaunch: "wired-outline-489-rocket-space-hover-flying", // Hub - foguete voando 🚀
  BookOpen: "wired-outline-3140-book-open-hover-pinch (1)", // Diário - livro aberto 📖 (colorido)
  ChartLineUp: "wired-outline-152-bar-chart-arrow-hover-growth", // Monitoramento - gráfico 📊
  UsersThree: "wired-outline-314-three-avatars-icon-calm-hover-nodding", // Gestão Usuários 👥
  GraduationCap: "wired-outline-486-school-hover-pinch (1)", // Config Escola - escola 🏫 (colorido)
  ClipboardText: "wired-outline-738-notebook-2-hover-pinch", // PGI - notebook/documento 📓
  Gear: "wired-outline-40-cogs-hover-mechanic", // Admin - engrenagem ⚙️
  BookBookmark: "wired-outline-2167-books-course-assign-hover-pinch", // Central Inteligência - livros (mesmo de PGI) 📚
  Compass: "wired-outline-86-compass-hover-pinch (1)", // Compass (PEI) - colorido
  Puzzle: "wired-outline-106-map-hover-pinch (1)", // Puzzle (PAEE) - colorido
  Rocket: "wired-outline-489-rocket-space-hover-flying", // Rocket (Hub)
  BarChart3: "wired-outline-152-bar-chart-arrow-hover-growth", // BarChart3 (Monitoramento)
  School: "wired-outline-486-school-hover-pinch (1)", // School (Config Escola) - colorido
  ClipboardList: "wired-outline-738-notebook-2-hover-pinch", // ClipboardList (PGI) - notebook/documento 📓
  Settings: "wired-outline-40-cogs-hover-mechanic", // Settings (Gestão)
};

// Mapeamento de nomes de ícones Lucide para nomes de ícones Lottie
const lucideToLottieMap: Record<string, string> = {
  Compass: "Student",
  Puzzle: "PuzzlePiece",
  Rocket: "RocketLaunch",
  BarChart3: "ChartLineUp",
  School: "GraduationCap",
  ClipboardList: "ClipboardText",
  Settings: "Gear",
  BookMarked: "BookBookmark",
};

type PageHeroProps = {
  iconName: string; // Nome do ícone (ex: "Student", "PuzzlePiece", "Compass")
  title: string;
  desc: string;
  color?: "sky" | "blue" | "cyan" | "violet" | "rose" | "slate" | "teal";
  useLottie?: boolean; // Se deve usar Lottie ao invés do ícone estático
};

export function PageHero({ iconName, title, desc, color = "sky", useLottie = true }: PageHeroProps) {
  const colors = getColorClasses(color);
  // Mapear nome do ícone Lucide para nome do ícone Lottie se necessário
  const lottieIconName = lucideToLottieMap[iconName] || iconName;
  const lottieAnimation = useLottie && lottieIconName ? lottieMapOutlineColored[lottieIconName] : null;
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Garantir que só renderiza Lottie no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Se não montado ainda OU não deve usar Lottie, mostrar placeholder
  if (!isMounted || !useLottie || !lottieAnimation) {
    return (
      <div
        className="rounded-2xl overflow-hidden animate-fade-in-up"
        style={{ backgroundColor: colors.bg, boxShadow: '0 4px 16px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.02)' }}
      >
        <div className="h-1 w-full opacity-60" style={{ background: `linear-gradient(to right, ${colors.text}, ${colors.icon || colors.text})` }} />
        <div className="flex items-center gap-5 h-[120px] px-8 md:px-10">
          <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-slate-200 rounded-xl animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: colors.text }}>{title}</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in-up"
      style={{
        backgroundColor: colors.bg,
        boxShadow: isHovered
          ? '0 8px 24px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)'
          : '0 4px 16px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.02)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${colors.text}, ${colors.icon || colors.text})` }} />

      <div className="flex items-center gap-6 h-[120px] px-8 md:px-10">
        {/* Ícone dentro do quadrado minimalista - estático, anima só no hover */}
        <div
          className="rounded-xl flex items-center justify-center backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:scale-105 flex-shrink-0"
          style={{ width: '64px', height: '64px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', backgroundColor: 'var(--surface-2)' }}
        >
          <LottieIcon
            animation={lottieAnimation}
            size={56}
            loop={isHovered}
            autoplay={isHovered}
            className="transition-all duration-300"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold mb-0.5 tracking-tight" style={{ color: colors.text }}>{title}</h1>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
        </div>
      </div>
    </div>
  );
}
