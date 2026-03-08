"use client";

import { useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

/**
 * Omnisfera V5 Hook: useStudentRealtime
 * Ouve ativamente alterações no escopo do estudante para atualizar o VDOM sem requests pesados ou F5 manual.
 * Impede sobreposições de salvamento entre Especialistas (Diário de Bordo, PEI, PAEE).
 */
export function useStudentRealtime(studentId: string | null) {
    const router = useRouter();

    useEffect(() => {
        if (!studentId) return;

        const supabase = getSupabaseBrowser();

        // Listen to changes on the 'students' table specifically for this single student's updates
        const channel = supabase
            .channel(`realtime-student-${studentId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "students",
                    filter: `id=eq.${studentId}`,
                },
                (payload) => {
                    console.info("[Omnisfera Realtime] Student Document Updated by another session. Refreshing dataset... ");
                    // Aciona o Next.js App Router para revalidar a rota no Header e injetar os novos props
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [studentId, router]);
}
