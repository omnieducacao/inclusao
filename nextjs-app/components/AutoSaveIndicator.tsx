"use client";

import { Check, AlertCircle } from "lucide-react";
import { CarregandoLinha } from "@/components/brand/TelaCarregando";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface AutoSaveIndicatorProps {
    status: AutoSaveStatus;
    lastSaved: Date | null;
}

/**
 * AutoSaveIndicator — aviso curto do salvamento automático (onda 22: visual do design system).
 * "Salvando…" com o símbolo, "Rascunho salvo (14:32)" ou "Não deu para salvar".
 */
export function AutoSaveIndicator({ status, lastSaved }: AutoSaveIndicatorProps) {
    if (status === "idle") return null;
    if (status === "saving") return <CarregandoLinha texto="Salvando…" tamanho={14} />;

    const ok = status === "saved";
    const Icone = ok ? Check : AlertCircle;
    return (
        <span className="omni-carregando-linha" role="status" aria-live="polite" style={{ color: ok ? "var(--sucesso)" : "var(--erro)" }}>
            <Icone size={14} aria-hidden />
            <span>{ok ? "Rascunho salvo" : "Não deu para salvar"}</span>
            {ok && lastSaved && (
                <span style={{ color: "var(--tinta-3)" }}>
                    ({lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})
                </span>
            )}
        </span>
    );
}
