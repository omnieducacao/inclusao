"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, X, Loader2 } from "lucide-react";
import type { SessionPayload } from "@/lib/session";

export function SimulationBanner({ session }: { session: SessionPayload }) {
    const router = useRouter();
    const [ending, setEnding] = useState(false);

    if (!session?.simulating_workspace_id) return null;

    async function handleEnd() {
        setEnding(true);
        try {
            const res = await fetch("/api/admin/simulate", { method: "DELETE" });
            if (res.ok) {
                router.push("/admin");
                router.refresh();
            } else {
                alert("Erro ao encerrar simulação.");
            }
        } catch {
            alert("Erro ao encerrar simulação.");
        } finally {
            setEnding(false);
        }
    }

    return (
        <div className="sticky top-0 z-[60] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white shadow-lg">
            <div className="max-w-[1920px] mx-auto px-5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-sm font-bold">Modo Simulação</span>
                        <span className="mx-2 opacity-60">·</span>
                        <span className="text-sm font-medium opacity-90">
                            {session.simulating_workspace_name}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleEnd}
                    disabled={ending}
                    className="flex items-center gap-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                    {ending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <X className="w-4 h-4" />
                    )}
                    Encerrar simulação
                </button>
            </div>
        </div>
    );
}
