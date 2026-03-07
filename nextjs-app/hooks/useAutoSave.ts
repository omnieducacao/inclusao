"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
    /** Debounce delay in ms (default: 2000) */
    debounceMs?: number;
    /** Whether auto-save is enabled (default: true) */
    enabled?: boolean;
    /** Key for change detection — when this changes, trigger save check */
    watchKey?: string;
}

interface UseAutoSaveReturn {
    status: AutoSaveStatus;
    lastSaved: Date | null;
    /** Manually trigger a save immediately */
    saveNow: () => Promise<void>;
    /** Mark data as dirty (triggers debounced save) */
    markDirty: () => void;
}

/**
 * useAutoSave — Auto-saves data with debounce.
 * 
 * Usage:
 * ```tsx
 * const { status, lastSaved } = useAutoSave(
 *   myData,
 *   async (data) => { await fetch('/api/save', { method: 'PATCH', body: JSON.stringify(data) }) },
 *   { debounceMs: 2000 }
 * );
 * ```
 */
export function useAutoSave<T>(
    data: T,
    saveFn: (data: T) => Promise<void>,
    options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
    const { debounceMs = 2000, enabled = true } = options;
    const [status, setStatus] = useState<AutoSaveStatus>("idle");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    const dataRef = useRef(data);
    const saveFnRef = useRef(saveFn);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isSavingRef = useRef(false);
    const isFirstRender = useRef(true);

    // Update refs
    dataRef.current = data;
    saveFnRef.current = saveFn;

    // Detect changes (skip first render)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (!enabled) return;
        setIsDirty(true);
    }, [data, enabled, options.watchKey]);

    // Debounced save when dirty
    useEffect(() => {
        if (!isDirty || !enabled) return;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(async () => {
            if (isSavingRef.current) return;
            isSavingRef.current = true;
            setStatus("saving");

            try {
                await saveFnRef.current(dataRef.current);
                setStatus("saved");
                setLastSaved(new Date());
                setIsDirty(false);

                // Reset to idle after 3 seconds
                setTimeout(() => {
                    setStatus((prev) => (prev === "saved" ? "idle" : prev));
                }, 3000);
            } catch {
                setStatus("error");
                // Reset to idle after 5 seconds on error
                setTimeout(() => {
                    setStatus((prev) => (prev === "error" ? "idle" : prev));
                }, 5000);
            } finally {
                isSavingRef.current = false;
            }
        }, debounceMs);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isDirty, enabled, debounceMs]);

    const saveNow = useCallback(async () => {
        if (isSavingRef.current) return;
        if (timerRef.current) clearTimeout(timerRef.current);

        isSavingRef.current = true;
        setStatus("saving");

        try {
            await saveFnRef.current(dataRef.current);
            setStatus("saved");
            setLastSaved(new Date());
            setIsDirty(false);
            setTimeout(() => {
                setStatus((prev) => (prev === "saved" ? "idle" : prev));
            }, 3000);
        } catch {
            setStatus("error");
        } finally {
            isSavingRef.current = false;
        }
    }, []);

    const markDirty = useCallback(() => {
        setIsDirty(true);
    }, []);

    return { status, lastSaved, saveNow, markDirty };
}
