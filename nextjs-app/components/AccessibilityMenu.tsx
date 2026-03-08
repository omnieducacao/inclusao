"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { Settings2, Eye, Type, Droplet, Moon, Sun, Check, Laptop } from "lucide-react";

export function AccessibilityMenu() {
    const {
        theme, toggleTheme,
        highContrast, toggleHighContrast,
        dyslexiaFont, toggleDyslexiaFont,
        colorBlindMode, setColorBlindMode
    } = useTheme();

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={toggleOpen}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-1 border border-subtle text-text-secondary hover:text-primary hover:bg-surface-2 transition-premium"
                aria-label="Menu de Acessibilidade e Aparência"
                aria-expanded={isOpen}
            >
                <Settings2 className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-surface-1 border border-strong shadow-premium-xl z-50 animate-fade-in-scale origin-top-right overflow-hidden">
                    <div className="p-4 border-b border-subtle bg-surface-0">
                        <h3 className="font-semibold text-text-primary flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-primary" />
                            Aparência e Acessibilidade
                        </h3>
                        <p className="text-xs text-text-muted mt-1">
                            Ajuste a interface para suas necessidades.
                        </p>
                    </div>

                    <div className="p-3 space-y-4 max-h-[60vh] overflow-y-auto">
                        {/* THEME */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                <ThemeIcon className="w-3.5 h-3.5" /> Tema
                            </label>
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-0 hover:bg-surface-2 border border-subtle transition-colors text-sm text-text-primary text-left"
                            >
                                <span>Alternar Tema Principal</span>
                                <span className="text-xs font-medium px-2 py-1 rounded bg-surface-2 border border-subtle text-text-muted capitalize">
                                    {theme}
                                </span>
                            </button>
                        </div>

                        {/* VISUAL CONTRAST & READING */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5" /> Leitura & Foco
                            </label>

                            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-0 cursor-pointer transition-colors group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">Alto Contraste</span>
                                    <span className="text-xs text-text-muted">Melhora legibilidade (WCAG AAA)</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={highContrast}
                                    onChange={toggleHighContrast}
                                />
                                <div className="w-10 h-6 bg-surface-2 border border-subtle rounded-full peer peer-checked:bg-primary peer-checked:border-primary relative transition-colors duration-200 ease-in-out">
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${highContrast ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-0 cursor-pointer transition-colors group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors flex items-center gap-1.5">
                                        Modo Dislexia <Type className="w-3 h-3" />
                                    </span>
                                    <span className="text-xs text-text-muted">Fonte focada e maior espaçamento</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={dyslexiaFont}
                                    onChange={toggleDyslexiaFont}
                                />
                                <div className="w-10 h-6 bg-surface-2 border border-subtle rounded-full peer peer-checked:bg-primary peer-checked:border-primary relative transition-colors duration-200 ease-in-out">
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${dyslexiaFont ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                            </label>
                        </div>

                        {/* COLOR BLINDNESS */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                                <Droplet className="w-3.5 h-3.5" /> Daltonismo
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setColorBlindMode("none")}
                                    className={`p-2 rounded-lg border text-sm flex flex-col items-center justify-center gap-1 transition-all
                                        ${colorBlindMode === "none" ? "bg-primary/10 border-primary text-primary" : "bg-surface-0 border-subtle text-text-secondary hover:bg-surface-2"}
                                    `}
                                >
                                    <span className="font-medium">Nenhum</span>
                                </button>
                                <button
                                    onClick={() => setColorBlindMode("protanopia")}
                                    className={`p-2 rounded-lg border text-sm flex flex-col items-center justify-center gap-1 transition-all
                                        ${colorBlindMode === "protanopia" ? "bg-primary/10 border-primary text-primary" : "bg-surface-0 border-subtle text-text-secondary hover:bg-surface-2"}
                                    `}
                                >
                                    <span className="font-medium">Protanopia</span>
                                    <span className="text-[10px] opacity-70">Vermelho Cego</span>
                                </button>
                                <button
                                    onClick={() => setColorBlindMode("deuteranopia")}
                                    className={`p-2 rounded-lg border text-sm flex flex-col items-center justify-center gap-1 transition-all
                                        ${colorBlindMode === "deuteranopia" ? "bg-primary/10 border-primary text-primary" : "bg-surface-0 border-subtle text-text-secondary hover:bg-surface-2"}
                                    `}
                                >
                                    <span className="font-medium">Deutera.</span>
                                    <span className="text-[10px] opacity-70">Verde Cego</span>
                                </button>
                                <button
                                    onClick={() => setColorBlindMode("tritanopia")}
                                    className={`p-2 rounded-lg border text-sm flex flex-col items-center justify-center gap-1 transition-all
                                        ${colorBlindMode === "tritanopia" ? "bg-primary/10 border-primary text-primary" : "bg-surface-0 border-subtle text-text-secondary hover:bg-surface-2"}
                                    `}
                                >
                                    <span className="font-medium">Tritanopia</span>
                                    <span className="text-[10px] opacity-70">Azul Cego</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
