"use client";

import { useState, useCallback } from "react";

interface StatusOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

export function useUIState() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setSuccess(false);
    }, []);

    const execute = useCallback(
        async <T>(promiseFn: () => Promise<T>, options?: StatusOptions<T>): Promise<T | null> => {
            setLoading(true);
            setError(null);
            setSuccess(false);

            try {
                const result = await promiseFn();
                setSuccess(true);
                if (options?.onSuccess) {
                    options.onSuccess(result);
                }
                return result;
            } catch (err) {
                setSuccess(false);
                const errorMessage = err instanceof Error ? err.message : "Erro desconhecido.";
                setError(errorMessage);
                if (options?.onError) {
                    options.onError(err instanceof Error ? err : new Error(errorMessage));
                }
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { loading, error, success, execute, reset, setError, setSuccess };
}
