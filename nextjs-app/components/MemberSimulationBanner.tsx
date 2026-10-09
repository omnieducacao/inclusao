"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, X, Loader2 } from "lucide-react";
import type { SessionPayload } from "@/lib/session";

export function MemberSimulationBanner({ session }: { session: SessionPayload }) {
    const router = useRouter();
    const [ending, setEnding] = useState(false);

    if (!session?.simulating_member_id) return null;

    async function handleEnd() {
        setEnding(true);
        try {
            const res = await fetch("/api/simulate-member", { method: "DELETE" });
            if (res.ok) {
                router.push("/gestao");
                router.refresh();
            } else {
                setEnding(false);
            }
        } catch {
            setEnding(false);
        } finally {
            setEnding(false);
        }
    }

    // Onda 15: faixa no design system (antes era um degradê roxo); a cor de noite separa bem do app
    return (
        <div role="status" style={{ position: "sticky", top: 0, zIndex: 60, background: "var(--noite)", color: "var(--sobre-noite)", borderBottom: "3px solid var(--encontro-roxo)" }}>
            <div style={{ maxWidth: 1920, margin: "0 auto", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 10, font: "600 14px/20px var(--font-sans)" }}>
                    <Eye aria-hidden style={{ width: 18, height: 18 }} />
                    <span>Você está vendo a Omnisfera como <strong style={{ color: "#fff" }}>{session.simulating_member_name}</strong>. O que você fizer aqui fica registrado como dessa pessoa.</span>
                </p>
                <button type="button" onClick={handleEnd} disabled={ending} className="omni-btn omni-btn--pequeno" style={{ background: "#fff", color: "var(--noite)" }}>
                    {ending ? <Loader2 aria-hidden className="animate-spin" /> : <X aria-hidden />}
                    Voltar para a minha conta
                </button>
            </div>
        </div>
    );
}
