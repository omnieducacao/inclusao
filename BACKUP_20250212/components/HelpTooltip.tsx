"use client";

import { useState, useRef, useEffect } from "react";
import { HELP_TOOLTIPS } from "@/lib/tour-content";

type HelpTooltipProps = {
    fieldId: string;
    className?: string;
};

/**
 * Contextual help tooltip — renders a small "?" icon that
 * shows a tooltip with title, description, and optional example.
 */
export function HelpTooltip({ fieldId, className = "" }: HelpTooltipProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const info = HELP_TOOLTIPS[fieldId];
    if (!info) return null;

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    return (
        <div ref={ref} className={`relative inline-flex ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-5 h-5 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-600 flex items-center justify-center text-xs font-bold transition-colors border border-slate-200 hover:border-blue-300 flex-shrink-0"
                title={info.title}
                aria-label={`Ajuda: ${info.title}`}
            >
                ?
            </button>
            {open && (
                <div
                    className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 animate-fade-in"
                    style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.12))" }}
                >
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-900 mb-1.5">{info.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{info.text}</p>
                        {info.example && (
                            <div className="mt-2.5 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-700">
                                    <span className="font-bold">Exemplo:</span> {info.example}
                                </p>
                            </div>
                        )}
                    </div>
                    {/* Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45" />
                </div>
            )}
        </div>
    );
}

/**
 * EmptyStateGuide — shown when a module has no content yet.
 * Provides gentle guidance on what to do first.
 */
export function EmptyStateGuide({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
}: {
    icon: string;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
            <span className="text-5xl mb-4">{icon}</span>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-4">{description}</p>
            {actionLabel && actionHref && (
                <a
                    href={actionHref}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                >
                    {actionLabel}
                </a>
            )}
        </div>
    );
}
