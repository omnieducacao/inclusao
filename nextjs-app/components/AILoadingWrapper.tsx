"use client";

import { AILoadingProvider } from "@/hooks/useAILoading";
import { AILoadingOverlay } from "@/components/AILoadingOverlay";
import { GuidedTour } from "@/components/GuidedTour";

/**
 * Client wrapper that provides AILoading context, renders the overlay
 * and the guided tour for new users.
 */
export function AILoadingWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AILoadingProvider>
            {children}
            <AILoadingOverlay />
            <GuidedTour />
        </AILoadingProvider>
    );
}
