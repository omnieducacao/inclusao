"use client";

import { useState, useEffect } from "react";
import type { SessionPayload } from "@/lib/session";

type WelcomeHeroProps = {
  saudacao: string;
  userFirst: string;
  session: SessionPayload | null;
};

export function WelcomeHero({ saudacao, userFirst, session }: WelcomeHeroProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Emoji and period label based on time of day
  const getTimeContext = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return { emoji: '☀️', period: 'manhã' };
    if (h >= 12 && h < 18) return { emoji: '🌤️', period: 'tarde' };
    return { emoji: '🌙', period: 'noite' };
  };

  const timeCtx = isMounted ? getTimeContext() : null;

  // Format current date
  const formattedDate = isMounted
    ? new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  // Capitalize first letter
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="rounded-2xl overflow-hidden animate-fade-in-up" style={{ boxShadow: 'var(--shadow-lg)' }}>
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }} />

        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-cyan-400/10 blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-[250px] h-[250px] rounded-full bg-violet-400/10 blur-[80px]" />

        <div className="relative z-10 px-8 md:px-10 py-7">
          <div className="flex items-start justify-between gap-6">
            {/* Left: Greeting + Context */}
            <div className="flex-1 min-w-0">
              <h1 className="heading-display text-white tracking-tight" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                {timeCtx && <span className="mr-2">{timeCtx.emoji}</span>}{saudacao}, {userFirst}!
              </h1>
              <p className="text-blue-100/80 mt-2 text-sm font-medium leading-relaxed">
                {session?.is_platform_admin
                  ? "Painel de administração da plataforma."
                  : `${session?.workspace_name}`}
              </p>
              <p className="text-blue-200/50 mt-1.5 text-[13px] italic">
                Incluir é garantir que cada estudante tenha vez e voz.
              </p>
            </div>

            {/* Right: Date pill */}
            {isMounted && (
              <div className="flex-shrink-0 hidden sm:flex flex-col items-end gap-1.5">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm text-white/90 text-[13px] font-medium">
                  {capitalizedDate}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
