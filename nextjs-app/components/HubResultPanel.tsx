"use client";

import { useState, useCallback } from "react";
import { Loader2, RefreshCw, Copy, Check, Save } from "lucide-react";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface HubResultPanelProps {
    result: string;
    generating: boolean;
    studentName?: string;
    moduleName?: string;
    onRegenerate?: () => void;
    onClose?: () => void;
    pdfTitle?: string;
    pdfFilename?: string;
    showSaveToPlano?: boolean;
    studentId?: string;
    formatoInclusivo?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────────

/**
 * HubResultPanel — Reusable result display panel for all Hub tools.
 * Shows the AI-generated result with copy, PDF download, save actions.
 * 
 * Extracted from HubClient to reduce duplication across:
 * CriarDoZero, AdaptarProva, PlanoAulaDua, DinamicaInclusiva, etc.
 */
export function HubResultPanel({
    result,
    generating,
    studentName,
    moduleName = "Hub Pedagógico",
    onRegenerate,
    onClose,
    pdfTitle,
    pdfFilename,
    showSaveToPlano = false,
    studentId,
    formatoInclusivo = true,
}: HubResultPanelProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [result]);

    if (generating) {
        return (
            <div
                role="status"
                aria-live="polite"
                style={{
                    padding: "40px 20px",
                    textAlign: "center",
                }}
            >
                <Loader2 size={28} className="animate-spin" style={{ color: "#818cf8", margin: "0 auto 10px" }} />
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                    Gerando com IA...
                </p>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div style={{
            borderRadius: 14,
            border: "1px solid var(--border-default)",
            overflow: "hidden",
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-tertiary)",
            }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    Resultado {studentName ? `— ${studentName}` : ""}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                    <button
                        type="button"
                        onClick={handleCopy}
                        aria-label="Copiar resultado"
                        style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                            border: "1px solid var(--border-default)",
                            background: "transparent",
                            color: copied ? "#10b981" : "var(--text-secondary)",
                            cursor: "pointer",
                        }}
                    >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "Copiado!" : "Copiar"}
                    </button>
                    {onRegenerate && (
                        <button
                            type="button"
                            onClick={onRegenerate}
                            aria-label="Regenerar resultado"
                            style={{
                                display: "flex", alignItems: "center", gap: 4,
                                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                border: "1px solid var(--border-default)",
                                background: "transparent",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                            }}
                        >
                            <RefreshCw size={12} /> Refazer
                        </button>
                    )}
                    {pdfTitle && pdfFilename && (
                        <PdfDownloadButton
                            text={result}
                            title={pdfTitle}
                            filename={pdfFilename}
                            formatoInclusivo={formatoInclusivo}
                        />
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: "16px 20px" }}>
                <FormattedTextDisplay texto={result} />
            </div>

            {/* Footer actions */}
            {(showSaveToPlano || onClose) && (
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8,
                    padding: "10px 16px",
                    borderTop: "1px solid var(--border-default)",
                }}>
                    {showSaveToPlano && (
                        <SalvarNoPlanoButton
                            conteudo={result}
                            tipo={moduleName}
                        />
                    )}
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Fechar resultado"
                            style={{
                                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                border: "1px solid var(--border-default)",
                                background: "transparent",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                            }}
                        >
                            Fechar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
