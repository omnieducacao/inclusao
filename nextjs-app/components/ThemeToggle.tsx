"use client";

import { useTheme } from "./ThemeProvider";
import { Eye } from "lucide-react";

export function ThemeToggle() {
    const { theme, toggleTheme, highContrast, toggleHighContrast } = useTheme();

    // Theme-specific styles
    const themeStyles: Record<string, { bg: string; shadow: string; title: string }> = {
        notebook: {
            bg: "linear-gradient(135deg, #f5e6d3, #e8d5c0)",
            shadow: "0 2px 8px rgba(180, 140, 100, 0.25), inset 0 1px 0 rgba(255,255,255,0.5)",
            title: "Modo Notebook (pastel) → Claro",
        },
        light: {
            bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
            shadow: "0 2px 8px rgba(251, 191, 36, 0.25), inset 0 1px 0 rgba(255,255,255,0.5)",
            title: "Modo Claro → Escuro",
        },
        dark: {
            bg: "linear-gradient(135deg, #1e293b, #334155)",
            shadow: "0 2px 8px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
            title: "Modo Escuro → Notebook",
        },
    };

    const current = themeStyles[theme] || themeStyles.notebook;

    return (
        <div className="flex items-center gap-1.5">
            {/* Theme cycle button */}
            <button
                onClick={toggleTheme}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                    background: current.bg,
                    boxShadow: current.shadow,
                }}
                title={current.title}
                aria-label={current.title}
            >
                {/* Notebook icon (📓 style) */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#b45309"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute w-[18px] h-[18px] transition-all duration-500"
                    style={{
                        opacity: theme === "notebook" ? 1 : 0,
                        transform: theme === "notebook" ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
                    }}
                >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <line x1="12" y1="6" x2="16" y2="6" />
                    <line x1="12" y1="10" x2="16" y2="10" />
                </svg>

                {/* Sun icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute w-5 h-5 transition-all duration-500"
                    style={{
                        opacity: theme === "light" ? 1 : 0,
                        transform: theme === "light" ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
                    }}
                >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>

                {/* Moon icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a5b4fc"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute w-[18px] h-[18px] transition-all duration-500"
                    style={{
                        opacity: theme === "dark" ? 1 : 0,
                        transform: theme === "dark" ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)",
                    }}
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            </button>

            {/* High contrast toggle */}
            <button
                onClick={toggleHighContrast}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                    background: highContrast
                        ? "linear-gradient(135deg, #000000, #1a1a1a)"
                        : "var(--bg-secondary, #f1f5f9)",
                    boxShadow: highContrast
                        ? "0 0 0 2px #FFD700, 0 2px 8px rgba(0,0,0,0.3)"
                        : "0 1px 4px rgba(0,0,0,0.08)",
                    border: highContrast ? "none" : "1px solid var(--border-default, rgba(226,232,240,0.6))",
                }}
                title={highContrast ? "Desativar Alto Contraste" : "Ativar Alto Contraste"}
                aria-label={highContrast ? "Desativar modo de alto contraste" : "Ativar modo de alto contraste"}
                aria-pressed={highContrast}
            >
                <Eye
                    size={16}
                    style={{
                        color: highContrast ? "#FFD700" : "var(--text-muted, #94a3b8)",
                        transition: "color 300ms",
                    }}
                    strokeWidth={highContrast ? 2.5 : 2}
                />
            </button>
        </div>
    );
}
