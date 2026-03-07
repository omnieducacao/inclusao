"use client";

import React from "react";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    style?: React.CSSProperties;
}

interface SkeletonTextProps {
    lines?: number;
    lastLineWidth?: string;
    gap?: number;
}

interface SkeletonCardProps {
    showAvatar?: boolean;
    showAction?: boolean;
    lines?: number;
}

// ─── Base Skeleton ──────────────────────────────────────────────────────────────

/**
 * Skeleton — Base shimmer loading placeholder.
 * Uses CSS variables for theming compatibility.
 */
export function Skeleton({
    width = "100%",
    height = 16,
    borderRadius = 6,
    className = "",
    style,
}: SkeletonProps) {
    return (
        <div
            className={`omni-skeleton ${className}`}
            aria-hidden="true"
            style={{
                width: typeof width === "number" ? `${width}px` : width,
                height: typeof height === "number" ? `${height}px` : height,
                borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
                background: "var(--skeleton-bg, rgba(148, 163, 184, 0.12))",
                backgroundImage:
                    "linear-gradient(90deg, transparent, var(--skeleton-shimmer, rgba(255,255,255,0.15)), transparent)",
                backgroundSize: "200% 100%",
                animation: "omni-shimmer 1.5s ease-in-out infinite",
                ...style,
            }}
        />
    );
}

// ─── Skeleton Text ──────────────────────────────────────────────────────────────

/**
 * SkeletonText — Multiple lines of skeleton text.
 */
export function SkeletonText({
    lines = 3,
    lastLineWidth = "60%",
    gap = 8,
}: SkeletonTextProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap }} aria-hidden="true">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height={12}
                    width={i === lines - 1 ? lastLineWidth : "100%"}
                />
            ))}
        </div>
    );
}

// ─── Skeleton Card ──────────────────────────────────────────────────────────────

/**
 * SkeletonCard — Full card placeholder with optional avatar and action.
 */
export function SkeletonCard({
    showAvatar = true,
    showAction = false,
    lines = 3,
}: SkeletonCardProps) {
    return (
        <div
            aria-hidden="true"
            style={{
                borderRadius: 14,
                border: "1px solid var(--border-default, #e2e8f0)",
                padding: "18px 22px",
                background: "var(--bg-secondary, #f8fafc)",
            }}
        >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                {showAvatar && <Skeleton width={36} height={36} borderRadius={999} />}
                <div style={{ flex: 1 }}>
                    <Skeleton height={14} width="40%" style={{ marginBottom: 6 }} />
                    <Skeleton height={10} width="25%" />
                </div>
                {showAction && <Skeleton width={60} height={28} borderRadius={8} />}
            </div>

            {/* Content */}
            <SkeletonText lines={lines} />
        </div>
    );
}

// ─── Skeleton Table Row ─────────────────────────────────────────────────────────

/**
 * SkeletonTableRow — Table row placeholder for lists.
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
    return (
        <div
            aria-hidden="true"
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-default, #e2e8f0)",
            }}
        >
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton
                    key={i}
                    height={12}
                    width={i === 0 ? "30%" : `${15 + Math.random() * 10}%`}
                />
            ))}
        </div>
    );
}

// ─── Skeleton List ──────────────────────────────────────────────────────────────

/**
 * SkeletonList — Multiple card or row skeletons.
 */
export function SkeletonList({
    count = 3,
    variant = "card",
}: {
    count?: number;
    variant?: "card" | "row";
}) {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Carregando..."
            style={{ display: "flex", flexDirection: "column", gap: variant === "card" ? 12 : 0 }}
        >
            {Array.from({ length: count }).map((_, i) =>
                variant === "card" ? (
                    <SkeletonCard key={i} />
                ) : (
                    <SkeletonTableRow key={i} />
                )
            )}
        </div>
    );
}
