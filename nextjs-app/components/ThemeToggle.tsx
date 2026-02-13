"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
                background: isDark
                    ? "linear-gradient(135deg, #1e293b, #334155)"
                    : "linear-gradient(135deg, #fef3c7, #fde68a)",
                boxShadow: isDark
                    ? "0 2px 8px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
                    : "0 2px 8px rgba(251, 191, 36, 0.25), inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
            title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
        >
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
                    opacity: isDark ? 0 : 1,
                    transform: isDark ? "rotate(-90deg) scale(0.5)" : "rotate(0deg) scale(1)",
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
                    opacity: isDark ? 1 : 0,
                    transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)",
                }}
            >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
        </button>
    );
}
