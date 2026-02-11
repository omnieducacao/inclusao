"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook that warns the user before closing the tab/window
 * when there are unsaved changes.
 * 
 * Usage:
 *   const { markDirty, markClean } = useUnsavedChanges();
 *   // Call markDirty() when user modifies data
 *   // Call markClean() after successful save
 */
export function useUnsavedChanges() {
    const isDirty = useRef(false);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty.current) {
                e.preventDefault();
                // Modern browsers ignore custom messages, but we need to set returnValue
                e.returnValue = "Você tem alterações não salvas. Deseja sair?";
                return e.returnValue;
            }
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, []);

    const markDirty = useCallback(() => {
        isDirty.current = true;
    }, []);

    const markClean = useCallback(() => {
        isDirty.current = false;
    }, []);

    return { markDirty, markClean, isDirty };
}
