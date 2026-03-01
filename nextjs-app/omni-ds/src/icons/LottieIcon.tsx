import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Player } from "@lordicon/react";

// ─── Cache singleton ───
const jsonCache = new Map<string, object>();
const fetchPromises = new Map<string, Promise<object>>();

function fetchIcon(animation: string, basePath: string): Promise<object> {
    const url = `${basePath}${animation}.json`;
    const cached = jsonCache.get(url);
    if (cached) return Promise.resolve(cached);
    const existing = fetchPromises.get(url);
    if (existing) return existing;
    const promise = fetch(url)
        .then((res) => {
            if (!res.ok) throw new Error(`Failed: ${url}`);
            return res.json() as Promise<object>;
        })
        .then((data) => {
            jsonCache.set(url, data);
            fetchPromises.delete(url);
            return data;
        })
        .catch((err) => {
            fetchPromises.delete(url);
            throw err;
        });
    fetchPromises.set(url, promise);
    return promise;
}

// ─── Color helpers ───

/** Lighten a hex color by a percentage (0-1). E.g. lighten("#7c3aed", 0.3) */
export function lighten(hex: string, amount: number): string {
    const m = hex.replace(/^#/, "").match(/.{2}/g);
    if (!m || m.length < 3) return hex;
    const r = Math.min(255, Math.round(parseInt(m[0], 16) + (255 - parseInt(m[0], 16)) * amount));
    const g = Math.min(255, Math.round(parseInt(m[1], 16) + (255 - parseInt(m[1], 16)) * amount));
    const b = Math.min(255, Math.round(parseInt(m[2], 16) + (255 - parseInt(m[2], 16)) * amount));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Darken a hex color by a percentage (0-1). E.g. darken("#7c3aed", 0.2) */
export function darken(hex: string, amount: number): string {
    const m = hex.replace(/^#/, "").match(/.{2}/g);
    if (!m || m.length < 3) return hex;
    const r = Math.max(0, Math.round(parseInt(m[0], 16) * (1 - amount)));
    const g = Math.max(0, Math.round(parseInt(m[1], 16) * (1 - amount)));
    const b = Math.max(0, Math.round(parseInt(m[2], 16) * (1 - amount)));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Generate Lordicon colors string with primary + lighter secondary */
/**
 * Generate Lordicon standard colors string.
 * Primary = grafite #121331 (FIXED, never changes)
 * Secondary = accent color (customizable per module)
 *
 * Follows the 161-growth icon standard: dark outlines + colored accents.
 */
export function dualTone(accentHex: string, graphite = "#121331"): string {
    return `primary:${graphite},secondary:${accentHex}`;
}

// ─── Stroke normalization ───

/** Normalize all stroke widths in a Lottie JSON to a target width */
function normalizeStrokes(data: object, targetWidth: number): object {
    const setWidth = (w: unknown): unknown => {
        if (!w || typeof w !== "object" || w === null) return w;
        const next = { ...(w as Record<string, unknown>) };
        // Remove dynamic expressions
        if (next.x) delete next.x;
        if (typeof next.k === "number") {
            next.k = targetWidth;
            return next;
        }
        if (Array.isArray(next.k)) {
            next.k = (next.k as unknown[]).map((kf: unknown) => {
                if (kf == null || typeof kf !== "object") return kf;
                const kfr = kf as Record<string, unknown>;
                const s = kfr.s;
                if (typeof s === "number") return { ...kfr, s: targetWidth };
                if (Array.isArray(s)) return { ...kfr, s: s.map(() => targetWidth) };
                return kf;
            });
        }
        return next;
    };
    const walk = (obj: unknown): unknown => {
        if (obj === null || typeof obj !== "object") return obj;
        if (Array.isArray(obj)) return obj.map(walk);
        const o = obj as Record<string, unknown>;
        // Stroke shape: ty === "st" has width prop "w"
        if (o.ty === "st" && o.w != null) {
            return { ...o, w: setWidth(o.w) };
        }
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(o)) out[key] = walk(o[key]);
        return out;
    };
    return walk(JSON.parse(JSON.stringify(data))) as object;
}

// ─── Props ───
export type LottieIconProps = {
    /** JSON filename without extension (fetched from basePath) */
    animation?: string;
    /** Pre-loaded icon JSON data */
    icon?: object;
    /** Base URL for fetching JSONs. Default: "/lottie/" */
    basePath?: string;
    /** Icon size in px */
    size?: number;
    /** Single color override (hex) — replaces all colors */
    colorize?: string;
    /** Multi-color string, e.g. "primary:#7c3aed,secondary:#a78bfa" */
    colors?: string;
    /** Target stroke width for normalization (e.g. 2.5). If set, all strokes become this width. */
    strokeWidth?: number;
    /** Animation state name */
    state?: string;
    /** Playback direction: 1 or -1 */
    direction?: 1 | -1;
    /** Auto-play from beginning on mount */
    autoplay?: boolean;
    /** CSS class */
    className?: string;
    /** Inline style */
    style?: CSSProperties;
    /** Called when player is ready */
    onReady?: () => void;
    /** Called when animation completes */
    onComplete?: () => void;
};

/**
 * LottieIcon — Animated icon using @lordicon/react Player.
 *
 * @example Single color
 * ```tsx
 * <LottieIcon animation="pei_flat" size={48} colorize="#7c3aed" />
 * ```
 *
 * @example Dual-tone (primary + lighter secondary)
 * ```tsx
 * <LottieIcon animation="wired-outline-426-brain" size={48} colors={dualTone("#7c3aed")} />
 * ```
 *
 * @example Normalized strokes
 * ```tsx
 * <LottieIcon animation="wired-outline-426-brain" size={48} strokeWidth={2.5} colorize="#7c3aed" />
 * ```
 */
export function LottieIcon({
    animation,
    icon: preloaded,
    basePath = "/lottie/",
    size = 48,
    colorize,
    colors,
    strokeWidth,
    state,
    direction,
    autoplay = true,
    className = "",
    style = {},
    onReady,
    onComplete,
}: LottieIconProps) {
    const playerRef = useRef<Player>(null);
    const [iconData, setIconData] = useState<object | null>(preloaded ?? null);
    const [error, setError] = useState(false);

    // Fetch animation JSON
    useEffect(() => {
        if (preloaded) { setIconData(preloaded); return; }
        if (!animation) return;
        let cancelled = false;
        fetchIcon(animation, basePath)
            .then((d) => { if (!cancelled) setIconData(d); })
            .catch(() => { if (!cancelled) setError(true); });
        return () => { cancelled = true; };
    }, [animation, preloaded, basePath]);

    // Auto-play on mount
    useEffect(() => {
        if (autoplay && iconData && playerRef.current) {
            playerRef.current.playFromBeginning();
        }
    }, [iconData, autoplay]);

    const boxStyle: CSSProperties = {
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
    };

    if (error) {
        return (
            <div className={className} style={boxStyle}>
                <span style={{ fontSize: 10, opacity: 0.4 }}>⚠️</span>
            </div>
        );
    }

    if (!iconData) {
        return <div className={className} style={boxStyle} />;
    }

    // Apply stroke normalization if requested
    const processedIcon = strokeWidth ? normalizeStrokes(iconData, strokeWidth) : iconData;

    return (
        <div className={className} style={boxStyle}>
            <Player
                ref={playerRef}
                icon={processedIcon}
                size={size}
                colorize={colorize}
                colors={colors}
                state={state}
                direction={direction}
                onReady={onReady}
                onComplete={onComplete}
            />
        </div>
    );
}

/** Pre-load an animation JSON into cache */
export function preloadAnimation(animation: string, basePath = "/lottie/"): void {
    fetchIcon(animation, basePath).catch(() => { });
}
