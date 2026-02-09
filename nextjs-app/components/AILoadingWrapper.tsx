"use client";

import { AILoadingProvider } from "@/hooks/useAILoading";
import { AILoadingOverlay } from "@/components/AILoadingOverlay";

/**
 * Client wrapper that provides AILoading context and renders the overlay.
 * Used in the dashboard layout (server component) to wrap children.
 */
export function AILoadingWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AILoadingProvider>
            {children}
            <AILoadingOverlay />
        </AILoadingProvider>
    );
}
