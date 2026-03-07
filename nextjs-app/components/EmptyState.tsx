"use client";

import type { LucideIcon } from "lucide-react";
import { FileText } from "lucide-react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    color?: string;
}

/**
 * EmptyState — Reusable empty/zero-state component.
 * Used throughout the platform when lists or sections have no data.
 * 
 * Replaces ~15+ inline empty state blocks across modules.
 */
export function EmptyState({
    icon: Icon = FileText,
    title,
    description,
    action,
    color = "var(--text-muted)",
}: EmptyStateProps) {
    return (
        <div style={{
            textAlign: "center",
            padding: "32px 20px",
            color,
        }}>
            <Icon
                size={36}
                style={{ margin: "0 auto 12px", opacity: 0.35 }}
            />
            <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>
                {title}
            </p>
            {description && (
                <p style={{ fontSize: 12, margin: "0 0 16px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {description}
                </p>
            )}
            {action && (
                action.href ? (
                    <a
                        href={action.href}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 18px",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 700,
                            background: "var(--color-primary)",
                            color: "#fff",
                            textDecoration: "none",
                        }}
                    >
                        {action.label}
                    </a>
                ) : (
                    <button
                        type="button"
                        onClick={action.onClick}
                        aria-label={action.label}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 18px",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 700,
                            background: "var(--color-primary)",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        {action.label}
                    </button>
                )
            )}
        </div>
    );
}
