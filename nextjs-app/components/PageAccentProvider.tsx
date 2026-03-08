"use client";

import { useEffect, useState } from "react";

/**
 * PageAccentProvider — injects CSS custom properties from admin color config.
 *
 * When the admin sets a color for a module (e.g., "violet" for PEI-Professor),
 * this component fetches that color and sets CSS variables on its container:
 *   --module-accent      (primary hex)
 *   --module-accent-light (hex + 30 alpha for lighter backgrounds)
 *   --module-accent-bg   (hex + 12 alpha for very light backgrounds)
 *
 * Child elements can reference these via CSS or inline styles.
 * Global CSS rules in globals.css also target common patterns like
 * avatar backgrounds, badge colors, section title icons, etc.
 */

// Admin color keys → hex (matches DS moduleColors)
const ADMIN_COLOR_HEX: Record<string, string> = {
    omnisfera: "#0ea5e9", pei: "#7c3aed", paee: "#e11d48", hub: "#0891b2",
    diario: "#059669", monitoramento: "#0d9488", ferramentas: "#2563eb",
    gestao: "#6366f1", cursos: "#d97706", pgi: "#8b5cf6", admin: "#475569",
    // Legacy keys (backwards compat)
    sky: "#0ea5e9", blue: "#2563eb", teal: "#0d9488", green: "#059669",
    cyan: "#0891b2", violet: "#7c3aed", rose: "#e11d48", amber: "#d97706",
    slate: "#475569", presentation: "#8b5cf6", table: "#2563eb",
    test: "#6366f1", reports: "#d97706",
};

type Props = {
    /** The admin key for this module (matches HOME_MODULES key) */
    adminKey: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serverConfig?: Record<string, any>;
    children: React.ReactNode;
};

export function PageAccentProvider({ adminKey, serverConfig, children }: Props) {
    const [accentHex, setAccentHex] = useState<string | null>(() => {
        if (serverConfig) {
            const colorKey = serverConfig[adminKey]?.heroColor || serverConfig[adminKey]?.color;
            return colorKey && ADMIN_COLOR_HEX[colorKey] ? ADMIN_COLOR_HEX[colorKey] : null;
        }
        return null;
    });

    useEffect(() => {
        if (serverConfig) return; // Skip if injected by server
        fetch("/api/public/platform-config?key=card_customizations")
            .then(r => r.json())
            .then(data => {
                if (data?.value) {
                    try {
                        const customs = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
                        // Use heroColor if set, else color
                        const colorKey = customs[adminKey]?.heroColor || customs[adminKey]?.color;
                        if (colorKey && ADMIN_COLOR_HEX[colorKey]) {
                            setAccentHex(ADMIN_COLOR_HEX[colorKey]);
                        }
                    } catch { /* silent */ }
                }
            })
            .catch(() => { /* silent */ });
    }, [adminKey, serverConfig]);

    const style = accentHex
        ? {
            "--module-accent": accentHex,
            "--module-accent-light": `${accentHex}30`,
            "--module-accent-bg": `${accentHex}12`,
        } as React.CSSProperties
        : undefined;

    return (
        <div style={style} data-module-accent={accentHex ? "true" : undefined}>
            {children}
        </div>
    );
}
