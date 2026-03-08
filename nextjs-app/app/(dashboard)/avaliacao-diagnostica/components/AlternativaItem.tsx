"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

export interface AlternativaItemProps {
    letra: string;
    texto: string;
    isCorrect: boolean;
    distratorInfo?: string;
}

export function AlternativaItem({ letra, texto, isCorrect, distratorInfo }: AlternativaItemProps) {
    return (
        <div
            className={`omni-flex-col omni-p-2 rounded-lg border ${isCorrect
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-transparent border-[var(--border-default)] opacity-90"
                }`}
        >
            <div className="omni-flex-row items-start omni-gap-2">
                <span className={`text-sm min-w-[20px] ${isCorrect ? "font-extrabold text-emerald-500" : "font-semibold text-[var(--text-primary)]"}`}>
                    {letra})
                </span>
                <span className={`text-sm leading-relaxed flex-1 ${isCorrect ? "font-semibold text-[var(--text-primary)]" : "font-normal text-[var(--text-primary)]"}`}>
                    {texto}
                </span>
                {isCorrect && (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-[3px]" />
                )}
            </div>
            {distratorInfo && (
                <div className={`mt-1 ml-7 text-[10px] leading-snug italic ${isCorrect ? "text-emerald-600" : "text-slate-400"}`}>
                    {isCorrect ? "✅ Resposta correta" : `⚡ ${distratorInfo}`}
                </div>
            )}
        </div>
    );
}
