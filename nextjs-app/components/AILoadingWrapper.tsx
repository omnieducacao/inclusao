"use client";

import { AILoadingProvider } from "@/hooks/useAILoading";
import { AILoadingOverlay } from "@/components/AILoadingOverlay";
import { GuidedTour } from "@/components/GuidedTour";
import { GlobalSearch } from "@/components/GlobalSearch";

/**
 * Client wrapper that provides AILoading context, renders the overlay,
 * the guided tour for new users, and the global search palette.
 */
export function AILoadingWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AILoadingProvider>
            {children}
            <AILoadingOverlay />
            <GuidedTour />
            <GlobalSearch />
        </AILoadingProvider>
    );
}
