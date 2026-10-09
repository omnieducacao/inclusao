"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const INTERVALO_MS = 20_000;

/**
 * useStudentRealtime
 * Atualiza a tela quando outra pessoa salva algo no mesmo estudante (Diário, PEI, PAEE).
 *
 * Onda 0: antes ouvia o realtime do Supabase direto do navegador, com a chave pública,
 * o que exigia o banco aberto. Agora pergunta ao servidor (sessão + escola conferidas)
 * a data da última alteração, a cada 20 s e quando a aba volta a ficar visível.
 */
export function useStudentRealtime(studentId: string | null) {
  const router = useRouter();

  useEffect(() => {
    if (!studentId) return;

    let ultima: string | null | undefined;
    let parado = false;

    const conferir = async () => {
      if (parado || document.visibilityState !== "visible") return;
      try {
        const r = await fetch(`/api/students/${encodeURIComponent(studentId)}/versao`, { cache: "no-store" });
        if (!r.ok) return;
        const { updated_at } = (await r.json()) as { updated_at: string | null };
        if (ultima === undefined) {
          ultima = updated_at;
        } else if (updated_at !== ultima) {
          ultima = updated_at;
          router.refresh();
        }
      } catch {
        /* sem rede: tenta de novo na próxima volta */
      }
    };

    conferir();
    const timer = window.setInterval(conferir, INTERVALO_MS);
    document.addEventListener("visibilitychange", conferir);

    return () => {
      parado = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", conferir);
    };
  }, [studentId, router]);
}
