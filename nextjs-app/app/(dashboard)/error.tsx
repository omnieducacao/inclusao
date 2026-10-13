"use client";

/**
 * Onda 22: visual do design system.
 * Saíram o gradiente, o emoji e as cores Tailwind. Agora usa o ErroDoModulo (omni-aviso de erro
 * com omni-btn), a mesma tela de erro dos módulos. A mensagem técnica fica só no console.
 */
import { ErroDoModulo } from "@/components/erro/ErroDoModulo";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return <ErroDoModulo modulo="esta página" error={error} reset={reset} />;
}
