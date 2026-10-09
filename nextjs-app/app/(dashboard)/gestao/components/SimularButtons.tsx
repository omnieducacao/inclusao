"use client";

/**
 * "Ver como" um membro da equipe ou um responsável (onda 11: confirmação e erros no padrão
 * do design system, em vez de confirm()/alert() do navegador).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { useConfirmar } from "@/components/Confirmar";

function useSimular(rota: string, corpo: Record<string, string>, destino: string) {
  const router = useRouter();
  const { confirmar, dialogo } = useConfirmar();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function simular(titulo: string, texto: string) {
    if (!(await confirmar({ titulo, texto, acao: "Ver como", cancelar: "Cancelar" }))) return;
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(rota, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { router.push(destino); router.refresh(); }
      else setErro(data.error || "Não foi possível abrir a visão.");
    } catch {
      setErro("Sem conexão. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }
  return { simular, loading, erro, dialogo };
}

function Botao({ loading, erro, onClick }: { loading: boolean; erro: string | null; onClick: () => void }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
      <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={onClick} disabled={loading}>
        <Eye aria-hidden /> {loading ? "Abrindo…" : "Ver como"}
      </button>
      {erro && <span className="omni-campo__erro" role="alert">{erro}</span>}
    </span>
  );
}

export function SimularButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  const s = useSimular("/api/simulate-member", { member_id: memberId }, "/");
  return (
    <>
      {s.dialogo}
      <Botao loading={s.loading} erro={s.erro} onClick={() => s.simular(`Ver a Omnisfera como ${memberName}?`, "Você vê só o que essa pessoa vê, com as permissões dela. Para voltar, use a faixa no topo da tela.")} />
    </>
  );
}

export function SimularFamilyButton({ responsavelId, responsavelName }: { responsavelId: string; responsavelName: string }) {
  const s = useSimular("/api/simulate-family", { family_responsible_id: responsavelId }, "/familia");
  return (
    <>
      {s.dialogo}
      <Botao loading={s.loading} erro={s.erro} onClick={() => s.simular(`Ver a área da família como ${responsavelName}?`, "Você vê o que esse responsável vê na área Família. Para voltar, use a faixa no topo da tela.")} />
    </>
  );
}
