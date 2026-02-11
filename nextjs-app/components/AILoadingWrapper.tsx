"use client";

import { AILoadingProvider } from "@/hooks/useAILoading";
import { AILoadingOverlay } from "@/components/AILoadingOverlay";
import { GuidedTour } from "@/components/GuidedTour";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ToastProvider } from "@/components/Toast";

/**
 * Client wrapper that provides AILoading context, renders the overlay,
 * the guided tour for new users, the global search palette, and toast notifications.
 */
export function AILoadingWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AILoadingProvider>
            <ToastProvider>
                {children}
                <AILoadingOverlay />
                <GuidedTour />
                <GlobalSearch />
            </ToastProvider>
        </AILoadingProvider>
    );
}

