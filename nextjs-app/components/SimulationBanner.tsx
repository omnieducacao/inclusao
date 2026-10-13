"use client";

import { OmniLoader } from "@/components/OmniLoader";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, X } from "lucide-react";
import type { SessionPayload } from "@/lib/session";

export function SimulationBanner({ session }: { session: SessionPayload }) {
    const router = useRouter();
    const [ending, setEnding] = useState(false);
    // Onda 20: erro mostrado na própria faixa (antes era um alerta do navegador)
    const [erro, setErro] = useState<string | null>(null);

    if (!session?.simulating_workspace_id) return null;

    async function handleEnd() {
        setEnding(true);
        setErro(null);
        try {
            const res = await fetch("/api/admin/simulate", { method: "DELETE" });
            if (res.ok) {
                router.push("/admin");
                router.refresh();
            } else {
                setErro("Não foi possível encerrar a simulação. Tente de novo.");
            }
        } catch {
            setErro("Não foi possível encerrar a simulação. Confira a internet e tente de novo.");
        } finally {
            setEnding(false);
        }
    }

    // Onda 20: faixa no design system (antes era um degradê laranja), no mesmo jeito da MemberSimulationBanner
    return (
        <div style={{ position: "sticky", top: 0, zIndex: 60, background: "var(--noite)", color: "var(--sobre-noite)", borderBottom: "3px solid var(--encontro-laranja)" }}>
            <div style={{ maxWidth: 1920, margin: "0 auto", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <p role="status" style={{ margin: 0, display: "flex", alignItems: "center", gap: 10, font: "600 14px/20px var(--font-sans)" }}>
                    <Eye aria-hidden style={{ width: 18, height: 18, flexShrink: 0 }} />
                    <span>
                        <strong style={{ color: "var(--sobre-noite)" }}>Simulação</strong>
                        <span aria-hidden style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
                        Você está vendo a escola {session.simulating_workspace_name}
                    </span>
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    {erro && (
                        <p role="alert" style={{ margin: 0, font: "600 13px/18px var(--font-sans)", color: "var(--sobre-noite)" }}>{erro}</p>
                    )}
                    <button
                        type="button"
                        onClick={handleEnd}
                        disabled={ending}
                        aria-busy={ending}
                        className="omni-btn omni-btn--pequeno"
                        style={{ background: "var(--sobre-noite)", color: "var(--noite)" }}
                    >
                        {ending ? <OmniLoader size={18} /> : <X aria-hidden />}
                        Encerrar simulação
                    </button>
                </div>
            </div>
        </div>
    );
}
