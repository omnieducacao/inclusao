"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import React from "react";

type AILoadingState = {
    isLoading: boolean;
    engine: string;
    module: string;
};

type AILoadingContextType = {
    state: AILoadingState;
    start: (engine: string, module: string) => void;
    stop: () => void;
};

const AILoadingContext = createContext<AILoadingContextType>({
    state: { isLoading: false, engine: "", module: "" },
    start: () => { },
    stop: () => { },
});

export function AILoadingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AILoadingState>({
        isLoading: false,
        engine: "",
        module: "",
    });

    const start = useCallback((engine: string, module: string) => {
        setState({ isLoading: true, engine, module });
    }, []);

    const stop = useCallback(() => {
        setState({ isLoading: false, engine: "", module: "" });
    }, []);

    // Listen for custom DOM events so any code (including non-hook code) can trigger the overlay
    useEffect(() => {
        function handleStart(e: Event) {
            const detail = (e as CustomEvent).detail;
            start(detail?.engine || "", detail?.module || "");
        }
        function handleStop() {
            stop();
        }
        window.addEventListener("ai-loading-start", handleStart);
        window.addEventListener("ai-loading-stop", handleStop);
        return () => {
            window.removeEventListener("ai-loading-start", handleStart);
            window.removeEventListener("ai-loading-stop", handleStop);
        };
    }, [start, stop]);

    return React.createElement(
        AILoadingContext.Provider,
        { value: { state, start, stop } },
        children
    );
}

export function useAILoading() {
    return useContext(AILoadingContext);
}

/**
 * Standalone functions that can be called from anywhere (no hook required).
 * Uses custom DOM events to communicate with the AILoadingProvider.
 */
export function aiLoadingStart(engine: string, module: string) {
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent("ai-loading-start", { detail: { engine, module } })
        );
    }
}

export function aiLoadingStop() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ai-loading-stop"));
    }
}

/**
 * Wraps an async function with automatic AI loading overlay.
 * Usage: const result = await withAILoading("red", "pei", () => fetch(...));
 */
export async function withAILoading<T>(
    engine: string,
    module: string,
    fn: () => Promise<T>
): Promise<T> {
    aiLoadingStart(engine, module);
    try {
        return await fn();
    } finally {
        aiLoadingStop();
    }
}
