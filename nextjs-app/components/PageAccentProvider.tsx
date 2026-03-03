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

// Admin color keys → hex (same as AdminClient.tsx COLOR_OPTIONS)
const ADMIN_COLOR_HEX: Record<string, string> = {
    sky: "#4F5BD5", blue: "#4285F4", teal: "#34A853", green: "#2E7D32",
    cyan: "#34A853", violet: "#9334E6", rose: "#E8453C", amber: "#F57F17",
    slate: "#F9AB00", presentation: "#7CB342", table: "#1A73E8",
    test: "#4285F4", reports: "#F9AB00",
};

type Props = {
    /** The admin key for this module (matches HOME_MODULES key) */
    adminKey: string;
    children: React.ReactNode;
};

export function PageAccentProvider({ adminKey, children }: Props) {
    const [accentHex, setAccentHex] = useState<string | null>(null);

    useEffect(() => {
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
    }, [adminKey]);

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
