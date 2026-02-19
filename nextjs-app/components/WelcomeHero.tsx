"use client";

import { useState, useEffect } from "react";
import type { SessionPayload } from "@/lib/session";
import type { EngineId } from "@/lib/ai-engines";
import type { Icon } from "phosphor-react";

type WelcomeHeroProps = {
  saudacao: string;
  userFirst: string;
  session: SessionPayload | null;
};

const ENGINE_DOT_COLORS: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#10b981",
  yellow: "#f59e0b",
  orange: "#f97316",
};

const ENGINE_SHORT: Record<string, string> = {
  red: "Red",
  blue: "Blue",
  green: "Green",
  yellow: "Yellow",
  orange: "Orange",
};

export function WelcomeHero({ saudacao, userFirst, session }: WelcomeHeroProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [icons, setIcons] = useState<Record<string, Icon>>({});

  // All platform engines (branding display — all schools have access)
  const engines: EngineId[] = ["red", "blue", "green", "yellow", "orange"];

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      import("phosphor-react").then((phosphor) => {
        setIcons({
          Sun: phosphor.Sun,
          CloudSun: phosphor.CloudSun,
          Moon: phosphor.Moon,
          Robot: phosphor.Robot,
        });
      });
    }
  }, []);

  // Icon and period label based on time of day
  const getTimeContext = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return { iconName: "Sun", period: "manhã", bg: "from-sky-500 via-blue-600 to-indigo-600" };
    if (h >= 12 && h < 18) return { iconName: "CloudSun", period: "tarde", bg: "from-orange-500 via-amber-500 to-yellow-500" };
    return { iconName: "Moon", period: "noite", bg: "from-indigo-600 via-purple-600 to-violet-600" };
  };

  const timeCtx = isMounted ? getTimeContext() : null;

  // Format current date
  const formattedDate = isMounted
    ? new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "";

  // Capitalize first letter
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Motivational quotes rotated by day
  const quotes = [
    "Incluir é garantir que cada estudante tenha vez e voz.",
    "A diferença enriquece — e a educação transforma.",
    "Cada plano é uma ponte para novas possibilidades.",
    "O olhar atento do professor muda trajetórias.",
    "Educação inclusiva é um direito, não um privilégio.",
    "Pequenos avanços diários constroem grandes conquistas.",
    "A diversidade na sala de aula é nossa maior força.",
  ];
  const dayOfYear = isMounted
    ? Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
    )
    : 0;
  const quote = quotes[dayOfYear % quotes.length];

  return (
    <div
      className="rounded-3xl overflow-hidden animate-fade-in-up"
      style={{ boxShadow: "0 20px 60px rgba(59, 130, 246, 0.15), 0 8px 24px rgba(99, 102, 241, 0.1)" }}
    >
      <div
        className="relative overflow-hidden hero-aurora"
      >
        {/* Subtle dots pattern — refined */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Ambient glow blobs — premium vivid */}
        <div className="absolute -top-24 -right-24 w-[450px] h-[450px] rounded-full bg-cyan-400/20 blur-[140px] animate-blob" />
        <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full bg-violet-500/18 blur-[140px] animate-blob" style={{ animationDelay: "4s" }} />
        <div className="absolute top-1/3 right-1/4 w-[280px] h-[280px] rounded-full bg-rose-400/10 blur-[120px] animate-blob" style={{ animationDelay: "8s" }} />
        <div className="absolute bottom-0 left-1/3 w-[220px] h-[220px] rounded-full bg-emerald-400/8 blur-[100px] animate-blob" style={{ animationDelay: "12s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full bg-white/5 blur-[80px]" />

        <div className="relative z-10 px-8 md:px-10 py-5 md:py-6">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Greeting + Context */}
            <div className="flex-1 min-w-0">
              <h1
                className="text-white tracking-tight flex items-center gap-2.5 flex-wrap"
                style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.15, textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
              >
                {timeCtx && (() => {
                  const TimeIcon = icons[timeCtx.iconName];
                  return TimeIcon ? (
                    <span className="animate-float-gentle" style={{ display: "inline-flex" }}>
                      <TimeIcon weight="duotone" style={{ width: "32px", height: "32px", color: "rgba(255,255,255,0.95)", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))" }} />
                    </span>
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
                  );
                })()}
                <span>
                  {saudacao},{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #67e8f9, #a5f3fc, #e0f2fe)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {userFirst}
                  </span>
                  !
                </span>
              </h1>

              <p className="text-blue-100/80 mt-1.5 text-sm font-medium leading-relaxed flex items-center gap-2">
                {session?.is_platform_admin ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" style={{ boxShadow: "0 0 8px rgba(52, 211, 153, 0.5)" }} />
                    Painel de administração da plataforma
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" style={{ boxShadow: "0 0 8px rgba(52, 211, 153, 0.5)" }} />
                    {session?.workspace_name}
                  </>
                )}
              </p>
            </div>

            {/* Right: Date pill */}
            {isMounted && (
              <div className="flex-shrink-0 hidden sm:flex flex-col items-end gap-2">
                <div
                  className="px-4 py-2.5 rounded-xl text-white/95 text-[13px] font-medium leading-tight text-right"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px) saturate(200%)",
                    WebkitBackdropFilter: "blur(20px) saturate(200%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 24px rgba(0,0,0,0.15), 0 0 1px rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <div className="text-white/45 text-[10px] uppercase tracking-[0.1em] font-semibold mb-1">
                    Hoje
                  </div>
                  {capitalizedDate}
                </div>
              </div>
            )}
          </div>

          {/* AI Engines — inline right */}
          {engines.length > 0 && (
            <div className="flex items-center justify-end gap-1.5 mt-3 flex-wrap">
              <span className="text-[11px] text-white/40 font-medium mr-1 inline-flex items-center gap-1.5">
                {icons.Robot ? (
                  <icons.Robot weight="duotone" style={{ width: "14px", height: "14px", color: "rgba(255,255,255,0.5)" }} />
                ) : null}
                Motores IA
              </span>
              {engines.map((eng) => (
                <span
                  key={eng}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white/90 backdrop-blur-md transition-all duration-200 hover:scale-110"
                  style={{
                    backgroundColor: `${ENGINE_DOT_COLORS[eng] || '#6366f1'}25`,
                    border: `1px solid ${ENGINE_DOT_COLORS[eng] || '#6366f1'}40`,
                    boxShadow: `0 0 12px ${ENGINE_DOT_COLORS[eng] || '#6366f1'}15`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
                    style={{ backgroundColor: ENGINE_DOT_COLORS[eng] || '#6366f1', boxShadow: `0 0 6px ${ENGINE_DOT_COLORS[eng] || '#6366f1'}` }}
                  />
                  Omni{ENGINE_SHORT[eng] || eng}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

