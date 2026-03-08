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

// Admin color keys → hex (single source of truth)
import { ADMIN_COLOR_HEX } from "@/lib/admin-colors";

type Props = {
    /** The admin key for this module (matches HOME_MODULES key) */
    adminKey: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serverConfig?: Record<string, any>;
    children: React.ReactNode;
};

export function PageAccentProvider({ adminKey, serverConfig, children }: Props) {
    const [accentHex, setAccentHex] = useState<string | null>(() => {
        // Compatibility: check 'pei_professor' mapped to 'pei-regente'
        if (serverConfig) {
            const adminKeySafe = serverConfig[adminKey] ? adminKey : adminKey === "pei-regente" && serverConfig["pei_professor"] ? "pei_professor" : adminKey;
            const colorKey = serverConfig[adminKeySafe]?.heroColor || serverConfig[adminKeySafe]?.color;
            return colorKey && ADMIN_COLOR_HEX[colorKey] ? ADMIN_COLOR_HEX[colorKey] : null;
        }
        return null;
    });

    useEffect(() => {
        if (serverConfig) return; // Skip logic se ja injetado!
        fetch("/api/public/platform-config?key=card_customizations")
            .then(r => r.json())
            .then(data => {
                if (data?.value) {
                    try {
                        const customs = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
                        const adminKeySafe = customs[adminKey] ? adminKey : adminKey === "pei-regente" && customs["pei_professor"] ? "pei_professor" : adminKey;
                        // Use heroColor if set, else color
                        const colorKey = customs[adminKeySafe]?.heroColor || customs[adminKeySafe]?.color;
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
