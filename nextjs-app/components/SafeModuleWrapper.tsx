"use client";

import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children: React.ReactNode;
    fallbackTitle?: string;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary que captura erros de runtime no frontend.
 * Previne que um componente quebrado derrube toda a página.
 *
 * Cenários que protege:
 * - Dados indefinidos/nulos ao acessar .name, .grade etc
 * - JSON inválido ao parsear pei_data
 * - Componente filha crashando por referência a dados apagados
 *
 * Uso:
 *   <SafeModuleWrapper fallbackTitle="PEI">
 *     <PEIRegenteClient .../>
 *   </SafeModuleWrapper>
 */
export class SafeModuleWrapper extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`[SafeModuleWrapper] Error in ${this.props.fallbackTitle || "module"}:`, error, errorInfo);

        // Optional: Report to monitoring service
        if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).__OMNI_ERROR_REPORTER) {
            if (typeof window !== 'undefined' && '__OMNI_ERROR_REPORTER' in window) {
                (window as Window & { __OMNI_ERROR_REPORTER?: (e: Error, i: React.ErrorInfo) => void }).__OMNI_ERROR_REPORTER?.(error, errorInfo);
            }
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            const title = this.props.fallbackTitle || "Módulo";
            return (
                <div style={{
                    padding: 32, textAlign: "center",
                    borderRadius: 16,
                    background: "var(--erro-suave)",
                    border: "1px solid var(--borda)",
                    margin: "20px 0",
                }}>
                    <AlertTriangle size={40} style={{ color: "var(--atencao)", margin: "0 auto 12px" }} />
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--tinta)", marginBottom: 8 }}>
                        Erro ao carregar {title}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--tinta-2)", marginBottom: 16, maxWidth: 400, margin: "0 auto 16px" }}>
                        Alguns dados podem estar indisponíveis. Isso geralmente é temporário. Tente recarregar o módulo.
                    </p>
                    {this.state.error && (
                        <details style={{ marginBottom: 16, textAlign: "left", maxWidth: 500, margin: "0 auto 16px" }}>
                            <summary style={{ fontSize: 11, color: "var(--tinta-2)", cursor: "pointer" }}>
                                Detalhes técnicos
                            </summary>
                            <pre style={{
                                fontSize: 10, padding: 8, marginTop: 8, borderRadius: 8,
                                background: "var(--superficie)", color: "var(--erro)",
                                overflow: "auto", maxHeight: 120,
                            }}>
                                {this.state.error.message}
                                {"\n"}
                                {this.state.error.stack?.split("\n").slice(0, 3).join("\n")}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={this.handleReset}
                        aria-label="Tentar novamente"
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "10px 20px", borderRadius: 10,
                            background: "var(--acao)",
                            color: "var(--sobre-acao)", fontSize: 13, fontWeight: 700,
                            border: "none", cursor: "pointer",
                        }}
                    >
                        <RefreshCcw size={14} />
                        Tentar novamente
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
