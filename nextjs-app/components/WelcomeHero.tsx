"use client";

import { useState, useEffect } from "react";
import { LottieIcon } from "./LottieIcon";
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

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-lg">
      <div className="flex items-center gap-6 h-36 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur shadow-xl relative z-10" style={{ animation: 'float 6s ease-in-out infinite' }}>
          {/* Ícone Lottie de brilho/faíscas colorido */}
          {isMounted ? (
            <LottieIcon
              animation="wired-lineal-2474-sparkles-glitter-hover-pinch"
              size={32}
              loop={true}
              className="transition-all duration-300"
            />
          ) : (
            <div className="w-8 h-8 bg-white/30 rounded" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            {saudacao}, {userFirst}!
          </h1>
          <p className="text-blue-100 mt-1">
            {session?.is_platform_admin
              ? "Painel de administração da plataforma."
              : `${session?.workspace_name} — Central de conhecimento e inclusão.`}
          </p>
        </div>
      </div>
    </div>
  );
}
