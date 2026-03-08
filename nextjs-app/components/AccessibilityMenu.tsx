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
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                aria-label="Menu de Acessibilidade e Aparência"
                aria-expanded={isOpen}
            >
                <Settings2 className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-fade-in-scale origin-top-right overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Aparência e Acessibilidade
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Ajuste a interface para suas necessidades.
                        </p>
                    </div>

                    <div className="p-3 space-y-4 max-h-[60vh] overflow-y-auto">
                        {/* THEME */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <ThemeIcon className="w-3.5 h-3.5" /> Tema
                            </label>
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors text-sm text-slate-800 dark:text-slate-200 text-left"
                                aria-pressed={theme === "dark"}
                                aria-label="Alternar Tema Principal"
                            >
                                <span>Alternar Tema Principal</span>
                                <span className="text-xs font-medium px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 capitalize">
                                    {theme}
                                </span>
                            </button>
                        </div>

                        {/* VISUAL CONTRAST & READING */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5" /> Leitura & Foco
                            </label>

                            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Alto Contraste</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Melhora legibilidade (WCAG AAA)</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={highContrast}
                                    onChange={toggleHighContrast}
                                    aria-label="Ativar modo de Alto Contraste"
                                />
                                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full peer peer-checked:bg-blue-600 peer-checked:border-blue-600 relative transition-colors duration-200 ease-in-out">
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${highContrast ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                                        Modo Dislexia <Type className="w-3 h-3" />
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Fonte focada e maior espaçamento</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={dyslexiaFont}
                                    onChange={toggleDyslexiaFont}
                                    aria-label="Ativar Modo Fonte de Dislexia"
                                />
                                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full peer peer-checked:bg-blue-600 peer-checked:border-blue-600 relative transition-colors duration-200 ease-in-out">
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${dyslexiaFont ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                            </label>
                        </div>

                        {/* COLOR BLINDNESS */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Droplet className="w-3.5 h-3.5" /> Daltonismo
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setColorBlindMode("none")}
                                    className={`p-2 rounded-lg border text-sm flex flex-col items-center justify-center gap-1 transition-all
                                        ${colorBlindMode === "none" ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}
                                    `}
                                    aria-pressed={colorBlindMode === "none"}
                                    aria-label="Sem modo daltônico"
                                >
                                    <span className="font-medium">Nenhum</span>
                                </button>
                                <button
                                    onClick={() => setColorBlindMode("protanopia")}
                                    className={`p-2 rounded-lg border text-sm flex flex-col items-center justify-center gap-1 transition-all
                                        ${colorBlindMode === "protanopia" ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}
                                    `}
                                    aria-pressed={colorBlindMode === "protanopia"}
                                >
                                    <span className="font-medium">Protanopia</span>
                                    <span className="text-[10px] opacity-70">Vermelho Cego</span>
                                </button>
                                <button
                                    onClick={() => setColorBlindMode("deuteranopia")}
                                    className={`p-2 rounded-lg border text-sm flex flex-col items-center justify-center gap-1 transition-all
                                        ${colorBlindMode === "deuteranopia" ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}
                                    `}
                                    aria-pressed={colorBlindMode === "deuteranopia"}
                                >
                                    <span className="font-medium">Deutera.</span>
                                    <span className="text-[10px] opacity-70">Verde Cego</span>
                                </button>
                                <button
                                    onClick={() => setColorBlindMode("tritanopia")}
                                    className={`p-2 rounded-lg border text-sm flex flex-col items-center justify-center gap-1 transition-all
                                        ${colorBlindMode === "tritanopia" ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}
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
