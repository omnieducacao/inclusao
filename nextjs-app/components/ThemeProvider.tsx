"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type Theme = "light" | "dark" | "notebook";
/** O que a pessoa escolheu: um tema, ou "auto" (segue o computador ou o celular) */
export type PreferenciaTema = Theme | "auto";
export type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    /** escolha direta (Claro, Caderno ou Escuro): a pessoa decide */
    setTheme: (t: Theme) => void;
    /** "auto" (padrão) segue o modo claro/escuro do aparelho; um tema fixa a escolha */
    preferencia: PreferenciaTema;
    setPreferencia: (p: PreferenciaTema) => void;
    isDark: boolean;
    highContrast: boolean;
    toggleHighContrast: () => void;
    dyslexiaFont: boolean;
    toggleDyslexiaFont: () => void;
    colorBlindMode: ColorBlindMode;
    setColorBlindMode: (mode: ColorBlindMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => { },
    setTheme: () => { },
    preferencia: "auto",
    setPreferencia: () => { },
    isDark: false,
    highContrast: false,
    toggleHighContrast: () => { },
    dyslexiaFont: false,
    toggleDyslexiaFont: () => { },
    colorBlindMode: "none",
    setColorBlindMode: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

const STORAGE_KEY = "omnisfera-theme";
const HC_STORAGE_KEY = "omnisfera-high-contrast";
const DYS_STORAGE_KEY = "omnisfera-dyslexia";
const CB_STORAGE_KEY = "omnisfera-colorblind";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [preferencia, setPreferenciaState] = useState<PreferenciaTema>("auto");
    const [sistemaEscuro, setSistemaEscuro] = useState(false);
    // Sem escolha, o tema segue o aparelho (Escuro ou Claro); com escolha, vale a escolha
    const theme: Theme = preferencia === "auto" ? (sistemaEscuro ? "dark" : "light") : preferencia;
    const [highContrast, setHighContrast] = useState(false);
    const [dyslexiaFont, setDyslexiaFont] = useState(false);
    const [colorBlindMode, setColorBlindMode] = useState<ColorBlindMode>("none");
    const [mounted, setMounted] = useState(false);

    // Initialize theme + high contrast from localStorage
    useEffect(() => {
        let timer: NodeJS.Timeout;
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        const hcStored = localStorage.getItem(HC_STORAGE_KEY);
        const dysStored = localStorage.getItem(DYS_STORAGE_KEY);
        const cbStored = localStorage.getItem(CB_STORAGE_KEY) as ColorBlindMode | null;

        timer = setTimeout(() => {
            setSistemaEscuro(window.matchMedia("(prefers-color-scheme: dark)").matches);
            if (stored === "light" || stored === "dark" || stored === "notebook") {
                setPreferenciaState(stored);
            }
            if (hcStored === "true") {
                setHighContrast(true);
            }
            if (dysStored === "true") {
                setDyslexiaFont(true);
            }
            if (cbStored === "protanopia" || cbStored === "deuteranopia" || cbStored === "tritanopia") {
                setColorBlindMode(cbStored);
            }
            setMounted(true);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    // Apply theme to <html> element
    useEffect(() => {
        if (!mounted) return;
        document.documentElement.setAttribute("data-theme", theme);
        // Só guarda o que a pessoa escolheu; "auto" não fica salvo, para continuar seguindo o aparelho
        if (preferencia === "auto") localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, preferencia);
    }, [theme, preferencia, mounted]);

    // O aparelho mudou de claro para escuro (ou o contrário): acompanha, se a pessoa não fixou um tema
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent) => setSistemaEscuro(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Apply high contrast class to <html>
    useEffect(() => {
        if (!mounted) return;
        document.documentElement.classList.toggle("high-contrast", highContrast);
        localStorage.setItem(HC_STORAGE_KEY, String(highContrast));
    }, [highContrast, mounted]);

    // Apply dyslexia font to <html>
    useEffect(() => {
        if (!mounted) return;
        document.documentElement.classList.toggle("dyslexia-font", dyslexiaFont);
        localStorage.setItem(DYS_STORAGE_KEY, String(dyslexiaFont));
    }, [dyslexiaFont, mounted]);

    // Apply color blind modes
    useEffect(() => {
        if (!mounted) return;
        document.documentElement.classList.remove("cb-protanopia", "cb-deuteranopia", "cb-tritanopia");
        if (colorBlindMode !== "none") {
            document.documentElement.classList.add(`cb-${colorBlindMode}`);
        }
        localStorage.setItem(CB_STORAGE_KEY, colorBlindMode);
    }, [colorBlindMode, mounted]);


    // Listen for prefers-contrast: more (system-level high contrast)
    useEffect(() => {
        const mq = window.matchMedia("(prefers-contrast: more)");
        if (mq.matches && !localStorage.getItem(HC_STORAGE_KEY)) {
            setHighContrast(true);
        }
        const handler = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem(HC_STORAGE_KEY)) {
                setHighContrast(e.matches);
            }
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const setPreferencia = useCallback((p: PreferenciaTema) => setPreferenciaState(p), []);
    const setTheme = useCallback((t: Theme) => setPreferenciaState(t), []);
    const toggleTheme = useCallback(() => {
        setPreferenciaState(theme === "notebook" ? "light" : theme === "light" ? "dark" : "notebook");
    }, [theme]);

    const toggleHighContrast = useCallback(() => {
        setHighContrast((prev) => !prev);
    }, []);

    const toggleDyslexiaFont = useCallback(() => {
        setDyslexiaFont((prev) => !prev);
    }, []);

    return (
        <ThemeContext.Provider value={{
            theme,
            toggleTheme,
            setTheme,
            preferencia,
            setPreferencia,
            isDark: theme === "dark",
            highContrast,
            toggleHighContrast,
            dyslexiaFont,
            toggleDyslexiaFont,
            colorBlindMode,
            setColorBlindMode,
        }}>
            {/* 
                We always return the Provider so the React Tree structure is identical 
                during SSR and CSR. This prevents massive re-mounts and Error 310 (Hook Mismatches).
            */}
            <div style={{ visibility: mounted ? "visible" : "hidden", display: "contents" }}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}
