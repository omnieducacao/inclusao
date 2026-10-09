"use client";

/**
 * "O que o PEI diz" nas telas dos módulos (PAEE, Hub, Diário, Evolução).
 *
 * Teste no ar (out/2026): o painel antigo era uma faixa azul com "Expandir", abria primeiro no
 * diagnóstico, falava em "OmniRed" e mandava gerar o relatório "na aba Consultoria IA", que não
 * existe mais. Agora é uma faixa recolhida no design system com o que o professor usa na sala:
 * interesses, potencialidades, barreiras principais e estratégias. O texto completo fica num
 * segundo nível, e o diagnóstico não aparece aqui (ele está no PEI, para quem precisa).
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import type { PEIData } from "@/lib/pei";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";

type Props = {
  peiData: PEIData | Record<string, unknown> | null;
  studentName?: string;
};

function Lista({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (!itens.length) return null;
  return (
    <div>
      <p className="omni-rotulo" style={{ margin: "0 0 6px" }}>{titulo}</p>
      <ul className="flex flex-wrap gap-1.5" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {itens.map((i) => <li key={i} className="omni-estado omni-estado--neutro" style={{ whiteSpace: "normal" }}>{i}</li>)}
      </ul>
    </div>
  );
}

export function PEISummaryPanel({ peiData, studentName }: Props) {
  const searchParams = useSearchParams();
  const studentId = searchParams?.get("student");
  if (!peiData || Object.keys(peiData).length === 0) return null;

  const texto = ((peiData.ia_sugestao as string) || "").trim();
  const barreiras = (peiData.barreiras_selecionadas || {}) as Record<string, string[]>;
  const principais = Object.values(barreiras).flat().filter(Boolean).slice(0, 6);
  const potencias = ((peiData.potencias || []) as string[]).filter(Boolean);
  const interesse = ((peiData.hiperfoco as string) || (peiData.interesses as string) || "").trim();
  const acesso = (peiData.estrategias_acesso || []) as string[];
  const ensino = (peiData.estrategias_ensino || []) as string[];
  const avaliacao = (peiData.estrategias_avaliacao || []) as string[];
  const temResumo = Boolean(interesse || potencias.length || principais.length || acesso.length || ensino.length || avaliacao.length);

  return (
    <details className="omni-cartao omni-cartao--plano" style={{ padding: "var(--space-4) var(--space-5)" }}>
      <summary style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <FileText aria-hidden size={18} style={{ color: "var(--modulo-pei)" }} />
        <span style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>
          O que o PEI{studentName ? ` de ${studentName.split(" ")[0]}` : ""} diz
        </span>
        <span className="omni-apoio" style={{ fontSize: 14 }}>interesses, barreiras e estratégias</span>
      </summary>

      <div className="space-y-4" style={{ marginTop: "var(--space-4)" }}>
        {temResumo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interesse && (
              <div>
                <p className="omni-rotulo" style={{ margin: "0 0 6px" }}>Interesse do estudante</p>
                <p style={{ margin: 0 }}>{interesse}</p>
              </div>
            )}
            <Lista titulo="Potencialidades" itens={potencias} />
            <Lista titulo="Barreiras principais" itens={principais} />
            <Lista titulo="Estratégias de acesso" itens={acesso} />
            <Lista titulo="Estratégias de ensino" itens={ensino} />
            <Lista titulo="Na avaliação" itens={avaliacao} />
          </div>
        ) : (
          <p className="omni-apoio" style={{ margin: 0 }}>O estudo de caso deste estudante ainda está vazio.</p>
        )}

        {texto ? (
          <details>
            <summary style={{ cursor: "pointer", font: "600 15px/22px var(--font-sans)", color: "var(--acao)" }}>Ler o texto completo do PEI</summary>
            <div style={{ marginTop: 10, maxHeight: "50vh", overflowY: "auto", padding: "var(--space-4)", border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", background: "var(--superficie)" }}>
              <FormattedTextDisplay texto={texto} />
            </div>
          </details>
        ) : (
          <p className="omni-apoio" style={{ margin: 0 }}>O texto do PEI ainda não foi escrito.</p>
        )}

        {studentId && (
          <Link href={`/pei?student=${studentId}`} className="omni-btn omni-btn--discreto omni-btn--pequeno">Abrir o PEI</Link>
        )}
      </div>
    </details>
  );
}
