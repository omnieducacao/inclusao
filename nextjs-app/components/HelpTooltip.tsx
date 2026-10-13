"use client";

import { useState, useRef, useEffect, useId } from "react";
import { HELP_TOOLTIPS } from "@/lib/tour-content";

type HelpTooltipProps = {
    fieldId: string;
    className?: string;
};

/**
 * Dica de ajuda contextual: um pequeno botão "?" que mostra uma dica com título, texto e exemplo opcional.
 * Onda 20: design system + acessibilidade. A dica fica ligada ao botão por aria-describedby,
 * abre com foco do teclado, com o mouse por cima ou com clique, e fecha com Esc ou clique fora.
 */
export function HelpTooltip({ fieldId, className = "" }: HelpTooltipProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    const idDica = useId();

    const info = HELP_TOOLTIPS[fieldId];

    // Fecha com clique fora e com Esc
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    if (!info) return null;

    return (
        <span
            ref={ref}
            className={className}
            style={{ position: "relative", display: "inline-flex", verticalAlign: "middle" }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); setOpen(!open); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                aria-label={`Ajuda: ${info.title}`}
                aria-describedby={idDica}
                aria-expanded={open}
                style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    padding: 0,
                    cursor: "pointer",
                    font: "700 13px/1 var(--font-sans)",
                    background: open ? "var(--acao-suave)" : "var(--superficie-2)",
                    color: open ? "var(--acao)" : "var(--tinta-2)",
                    border: `1.5px solid ${open ? "var(--acao)" : "var(--borda-forte)"}`,
                }}
            >
                <span aria-hidden>?</span>
            </button>
            <span
                id={idDica}
                role="tooltip"
                hidden={!open}
                style={{
                    position: "absolute",
                    zIndex: 50,
                    bottom: "calc(100% + 8px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "min(288px, calc(100vw - 32px))",
                    padding: 16,
                    textAlign: "left",
                    background: "var(--superficie)",
                    color: "var(--tinta)",
                    border: "1px solid var(--borda)",
                    borderRadius: "var(--o-radius-md)",
                    boxShadow: "var(--sombra-2)",
                    whiteSpace: "normal",
                }}
            >
                <span style={{ display: "block", font: "700 14px/20px var(--font-sans)", color: "var(--tinta)", marginBottom: 6 }}>{info.title}</span>
                <span style={{ display: "block", font: "400 13px/20px var(--font-sans)", color: "var(--tinta-2)" }}>{info.text}</span>
                {info.example && (
                    <span style={{ display: "block", marginTop: 10, padding: "8px 12px", background: "var(--info-suave)", borderRadius: "var(--o-radius-sm)", font: "400 13px/20px var(--font-sans)", color: "var(--tinta)" }}>
                        <strong>Exemplo:</strong> {info.example}
                    </span>
                )}
            </span>
        </span>
    );
}

/**
 * EmptyStateGuide — mostrado quando um módulo ainda não tem conteúdo.
 * Orienta com calma o que fazer primeiro.
 */
export function EmptyStateGuide({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
}: {
    icon: string;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center", gap: 8 }}>
            {icon && <span aria-hidden style={{ fontSize: 40, lineHeight: 1, marginBottom: 8 }}>{icon}</span>}
            <h3 style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>{title}</h3>
            <p className="omni-apoio" style={{ margin: 0, maxWidth: 448 }}>{description}</p>
            {actionLabel && actionHref && (
                <a href={actionHref} className="omni-btn omni-btn--primario" style={{ marginTop: 8 }}>
                    {actionLabel}
                </a>
            )}
        </div>
    );
}
