"use client";

import { useState, useEffect } from "react";
import { getColorClasses } from "@/lib/colors";
import { LottieIcon } from "./LottieIcon";
import { useTheme } from "./ThemeProvider";

// Mapeamento de ícones para Lottie OUTLINE COLORIDOS (minimalistas coloridas) - versões com cores nos tons de cada página!
// Versões com "(1)" são as coloridas que você enviou mais para o final
const lottieMapOutlineColored: Record<string, string> = {
  UsersFour: "estudantes_simples", // Estudantes 🎨
  Student: "pei_simples", // PEI 🧭
  PuzzlePiece: "paee_simples", // PAEE 🗺️
  RocketLaunch: "hub_simples", // Hub 🚀
  BookOpen: "diario_simples", // Diário 📖
  ChartLineUp: "dados_simples", // Evolução & Dados 📊
  UsersThree: "gestao_usuario_simples", // Gestão Usuários 👥
  GraduationCap: "configuracao_escola_flat", // Config Escola 🏫 (sem versão simples)
  ClipboardText: "pgi_simples", // PGI 📄
  Gear: "configuracao_escola_flat", // Admin ⚙️ (sem versão simples)
  BookBookmark: "central_inteligencia_simples", // Central Inteligência 📚
  Compass: "pei_simples", // Compass (PEI)
  Puzzle: "paee_simples", // Puzzle (PAEE)
  Rocket: "hub_simples", // Rocket (Hub)
  BarChart3: "dados_simples", // BarChart3 (Monitoramento)
  School: "configuracao_escola_flat", // School (Config Escola) (sem versão simples)
  ClipboardList: "pgi_simples", // ClipboardList (PGI)
  Settings: "configuracao_escola_flat", // Settings (Gestão) (sem versão simples)
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getColorClasses(color, isDark);
  // Mapear nome do ícone Lucide para nome do ícone Lottie se necessário
  const lottieIconName = lucideToLottieMap[iconName] || iconName;
  const lottieAnimation = useLottie && lottieIconName ? lottieMapOutlineColored[lottieIconName] : null;
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Garantir que só renderiza Lottie no cliente
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
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
            size={48}
            className="flex-shrink-0"
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
