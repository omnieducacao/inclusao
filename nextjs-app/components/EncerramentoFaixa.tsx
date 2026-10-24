/**
 * SCRUM-247: faixa para a escola cujo contrato foi encerrado (escola desativada no painel admin).
 * Diz até quando dá para baixar PEI, PAEE e relatórios antes de os dados serem apagados (90 dias).
 */
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { prazoEncerramento, dataCurta, textoPrazo } from "@/lib/encerramento";

export async function EncerramentoFaixa({ session }: { session: SessionPayload }) {
  const workspaceId = session.simulating_workspace_id || session.workspace_id;
  if (!workspaceId || session.is_demo) return null;

  let prazo = null;
  try {
    const { data } = await getSupabase()
      .from("workspaces")
      .select("active, contrato_encerrado_em")
      .eq("id", workspaceId)
      .maybeSingle();
    prazo = prazoEncerramento(data?.active as boolean | undefined, data?.contrato_encerrado_em as string | undefined);
  } catch {
    return null; // a faixa nunca derruba a página
  }
  if (!prazo) return null;

  return (
    <div role="alert" style={{ background: "var(--atencao-suave)", color: "var(--tinta)", borderBottom: "3px solid var(--atencao)" }}>
      <div style={{ maxWidth: 1920, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
        <AlertTriangle aria-hidden style={{ width: 20, height: 20, flex: "none", marginTop: 2, color: "var(--atencao)" }} />
        <p style={{ margin: 0, flex: "1 1 320px", font: "500 15px/22px var(--font-sans)" }}>
          <strong style={{ fontWeight: 800 }}>O contrato da escola foi encerrado em {dataCurta(prazo.encerradoEm)}.</strong>{" "}
          {textoPrazo(prazo)} Até lá, baixe em PDF ou Word os PEI, PAEE e relatórios de que a escola precisar.
        </p>
        <Link href="/estudantes" className="omni-btn omni-btn--pequeno omni-btn--primario">Ir para os estudantes</Link>
      </div>
    </div>
  );
}
