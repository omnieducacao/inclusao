"use client";

import { AILoadingProvider } from "@/hooks/useAILoading";
import { AILoadingOverlay } from "@/components/AILoadingOverlay";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ToastProvider } from "@/components/Toast";

/**
 * Client wrapper that provides AILoading context, renders the overlay,
 (onda 11: sem o tour guiado; o Início mostra os Primeiros passos da escola), the global search palette, and toast notifications.
 */
export function AILoadingWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AILoadingProvider>
            <ToastProvider>
                {children}
                <AILoadingOverlay />
                <GlobalSearch />
            </ToastProvider>
        </AILoadingProvider>
    );
}

