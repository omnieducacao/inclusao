"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

type Theme = "light" | "dark" | "notebook";
export type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
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
    const [theme, setTheme] = useState<Theme>("notebook");
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
            if (stored === "light" || stored === "dark" || stored === "notebook") {
                setTheme(stored);
            } else {
                setTheme("notebook");
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
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme, mounted]);

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

    // Listen for system preference changes
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent) => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                setTheme(e.matches ? "dark" : "light");
            }
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

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

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            if (prev === "notebook") return "light";
            if (prev === "light") return "dark";
            return "notebook";
        });
    }, []);

    const toggleHighContrast = useCallback(() => {
        setHighContrast((prev) => !prev);
    }, []);

    const toggleDyslexiaFont = useCallback(() => {
        setDyslexiaFont((prev) => !prev);
    }, []);

    // Prevent flash of wrong theme
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{
            theme,
            toggleTheme,
            isDark: theme === "dark",
            highContrast,
            toggleHighContrast,
            dyslexiaFont,
            toggleDyslexiaFont,
            colorBlindMode,
            setColorBlindMode,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}
