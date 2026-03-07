"use client";

import { useState, useCallback } from "react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type EngineId = "red" | "blue" | "green" | "yellow" | "orange";

interface UseHubGenerateOptions {
    /** API endpoint to call (e.g. "/api/hub/criar-atividade") */
    endpoint: string;
    /** AI engine to use */
    engine: EngineId;
    /** Module name for AI loading overlay */
    module?: string;
    /** Validation before generating — return error string or null */
    validate?: () => string | null;
    /** Transform the API response data into the result string */
    extractResult?: (data: Record<string, unknown>) => string;
}

interface UseHubGenerateReturn {
    loading: boolean;
    erro: string | null;
    resultado: string | null;
    validado: boolean;
    setErro: (e: string | null) => void;
    setResultado: (r: string | null) => void;
    setValidado: (v: boolean) => void;
    /** Generate content by calling the API */
    gerar: (body: Record<string, unknown>) => Promise<void>;
    /** Reset all state */
    reset: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Reusable hook for Hub tool generation.
 * Encapsulates the common pattern: loading → API call → result/error → cleanup.
 *
 * @example
 * ```tsx
 * const hub = useHubGenerate({
 *   endpoint: "/api/hub/papo-mestre",
 *   engine,
 *   validate: () => !assunto.trim() ? "Informe o assunto" : null,
 * });
 *
 * // In handler:
 * hub.gerar({ materia, assunto, engine, hiperfoco });
 *
 * // In JSX:
 * {hub.loading && <Spinner />}
 * {hub.erro && <Error>{hub.erro}</Error>}
 * {hub.resultado && <Result>{hub.resultado}</Result>}
 * ```
 */
export function useHubGenerate({
    endpoint,
    engine,
    module: moduleName = "hub",
    validate,
    extractResult,
}: UseHubGenerateOptions): UseHubGenerateReturn {
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [resultado, setResultado] = useState<string | null>(null);
    const [validado, setValidado] = useState(false);

    const gerar = useCallback(async (body: Record<string, unknown>) => {
        // Run validation if provided
        if (validate) {
            const validationError = validate();
            if (validationError) {
                setErro(validationError);
                return;
            }
        }

        setLoading(true);
        setErro(null);
        setResultado(null);
        setValidado(false);
        aiLoadingStart(engine || "green", moduleName);

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao gerar");

            const result = extractResult
                ? extractResult(data)
                : (data.texto || data.resultado || data.html || "") as string;

            setResultado(result);
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao gerar conteúdo.");
        } finally {
            setLoading(false);
            aiLoadingStop();
        }
    }, [endpoint, engine, moduleName, validate, extractResult]);

    const reset = useCallback(() => {
        setLoading(false);
        setErro(null);
        setResultado(null);
        setValidado(false);
    }, []);

    return {
        loading,
        erro,
        resultado,
        validado,
        setErro,
        setResultado,
        setValidado,
        gerar,
        reset,
    };
}
