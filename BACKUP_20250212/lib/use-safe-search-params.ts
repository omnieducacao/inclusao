"use client";

import { useSearchParams } from "next/navigation";
import { use } from "react";

/**
 * Hook seguro para usar searchParams em componentes client
 * Trata erros e casos onde searchParams pode não estar disponível
 */
export function useSafeSearchParams() {
  try {
    const searchParams = useSearchParams();
    return {
      get: (key: string) => searchParams?.get(key) || null,
      has: (key: string) => searchParams?.has(key) || false,
      toString: () => searchParams?.toString() || "",
      searchParams,
    };
  } catch (error) {
    // Fallback se useSearchParams falhar
    console.warn("useSearchParams não disponível, usando fallback:", error);
    return {
      get: () => null,
      has: () => false,
      toString: () => "",
      searchParams: null,
    };
  }
}
