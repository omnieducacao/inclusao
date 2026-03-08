"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { OmniLoader } from "@/components/OmniLoader";
import { Button } from "@omni/ds";

export function SimularButton({ memberId, memberName }: { memberId: string; memberName: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSimulate() {
        if (!confirm(`Iniciar simulação como "${memberName}"? Você verá a plataforma como este membro.`)) return;
        setLoading(true);
        try {
            const res = await fetch("/api/simulate-member", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ member_id: memberId }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push("/");
                router.refresh();
            } else {
                alert(data.error || "Erro ao simular.");
            }
        } catch { /* expected fallback */
            alert("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleSimulate}
            disabled={loading}
            className="px-3 py-1.5 border border-purple-200 text-purple-600 rounded-lg text-sm hover:bg-purple-50 flex items-center gap-2 disabled:opacity-50"
        >
            {loading ? <OmniLoader size={16} /> : <Eye className="w-4 h-4" />}
            Simular
        </button>
    );
}

export function SimularFamilyButton({
    responsavelId,
    responsavelName,
}: {
    responsavelId: string;
    responsavelName: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSimulate() {
        if (!confirm(`Iniciar simulação como "${responsavelName}"? Você verá a plataforma como este responsável (área Família).`)) return;
        setLoading(true);
        try {
            const res = await fetch("/api/simulate-family", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ family_responsible_id: responsavelId }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push("/familia");
                router.refresh();
            } else {
                alert(data.error || "Erro ao simular.");
            }
        } catch { /* expected fallback */
            alert("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            variant="secondary"
            size="sm"
            onClick={handleSimulate}
            disabled={loading}
            className="text-amber-600 border-amber-200 hover:bg-amber-50 h-8"
        >
            {loading ? <OmniLoader size={14} /> : <Eye size={14} />}
            Simular
        </Button>
    );
}
