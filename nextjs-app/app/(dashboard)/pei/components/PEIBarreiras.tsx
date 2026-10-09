"use client";

import { Check } from "lucide-react";
import { NIVEIS_SUPORTE } from "@/lib/pei";
import type { PEIData } from "@/lib/pei";

// ─── NivelSuporteRange ──────────────────────────────────────────────────────
// Onda 18: um único componente, mantido em ./NivelSuporteRange (mesmo nome exportado)
export { NivelSuporteRange } from "./NivelSuporteRange";

// ─── BarreirasDominio ───────────────────────────────────────────────────────

const DESCRICAO_NIVEL: Record<string, string> = {
    "Autônomo": "Faz sem ajuda.",
    "Monitorado": "Precisa que alguém confira de vez em quando.",
    "Substancial": "Precisa de ajuda com frequência.",
    "Muito Substancial": "Precisa de apoio intenso e contínuo.",
};

export function BarreirasDominio({
    dominio,
    opcoes,
    peiData,
    updateField,
}: {
    dominio: string;
    opcoes: string[];
    peiData: PEIData;
    updateField: (k: keyof PEIData, v: unknown) => void;
}) {
    const barreiras = peiData.barreiras_selecionadas || {};
    const selecionadas = barreiras[dominio] || [];
    const niveis = peiData.niveis_suporte || {};
    const obs = peiData.observacoes_barreiras || {};
    const idBase = `barreiras-${dominio.replace(/[^a-zA-Z0-9]/g, "-")}`;

    return (
        <section
            className="omni-cartao"
            aria-labelledby={`${idBase}-titulo`}
            style={selecionadas.length > 0 ? { borderColor: "var(--acao)" } : undefined}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h5 id={`${idBase}-titulo`} className="omni-cartao__titulo" style={{ margin: 0 }}>{dominio}</h5>
                {selecionadas.length > 0 && (
                    <span className="omni-estado omni-estado--sucesso">
                        {selecionadas.length} marcada{selecionadas.length > 1 ? "s" : ""}
                    </span>
                )}
            </div>

            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="omni-campo__rotulo" style={{ marginBottom: 6 }}>Barreiras observadas</legend>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {opcoes.map((b) => {
                        const estaSelecionada = selecionadas.includes(b);
                        return (
                            <label key={b} className="omni-chip">
                                <input
                                    type="checkbox"
                                    checked={estaSelecionada}
                                    onChange={(e) => {
                                        const novas = e.target.checked ? [...selecionadas, b] : selecionadas.filter((item) => item !== b);
                                        const novasBarreiras = { ...barreiras, [dominio]: novas };
                                        updateField("barreiras_selecionadas", novasBarreiras);
                                        if (!e.target.checked) {
                                            const chave = `${dominio}_${b}`;
                                            const novosNiveis = { ...niveis };
                                            delete novosNiveis[chave];
                                            updateField("niveis_suporte", novosNiveis);
                                        }
                                    }}
                                />
                                <Check className="omni-chip__marca" aria-hidden />
                                {b}
                            </label>
                        );
                    })}
                </div>
            </fieldset>

            {selecionadas.length > 0 && (
                <div style={{ display: "grid", gap: 12, borderTop: "1px solid var(--borda)", paddingTop: 12 }}>
                    <div>
                        <h6 className="omni-campo__rotulo" style={{ margin: 0 }}>Nível de apoio para cada barreira</h6>
                        <p className="omni-campo__ajuda" style={{ margin: "4px 0 0" }}>
                            Do menor para o maior: Autônomo (faz sem ajuda), Monitorado, Substancial e Muito Substancial (apoio intenso e contínuo).
                        </p>
                    </div>
                    {selecionadas.map((b) => {
                        const chave = `${dominio}_${b}`;
                        const nivelAtual = niveis[chave] || "Monitorado";
                        const nomeGrupo = `nivel-${chave.replace(/[^a-zA-Z0-9]/g, "-")}`;
                        return (
                            <fieldset key={b} className="omni-cartao omni-cartao--plano" style={{ margin: 0, padding: 12, gap: 8 }} aria-describedby={`${nomeGrupo}-desc`}>
                                <legend className="omni-campo__rotulo" style={{ float: "left", width: "100%", marginBottom: 4 }}>{b}</legend>
                                <div className="omni-segmentado" style={{ flexWrap: "wrap", clear: "both" }}>
                                    {NIVEIS_SUPORTE.map((n) => (
                                        <label key={n}>
                                            <input
                                                type="radio"
                                                name={nomeGrupo}
                                                value={n}
                                                checked={nivelAtual === n}
                                                onChange={() => updateField("niveis_suporte", { ...niveis, [chave]: n })}
                                            />
                                            {n}
                                        </label>
                                    ))}
                                </div>
                                <p id={`${nomeGrupo}-desc`} className="omni-campo__ajuda" style={{ margin: 0 }}>
                                    {DESCRICAO_NIVEL[nivelAtual] || ""}
                                </p>
                            </fieldset>
                        );
                    })}
                </div>
            )}

            <div className="omni-campo" style={{ maxWidth: "none" }}>
                <label className="omni-campo__rotulo" htmlFor={`${idBase}-obs`}>
                    Observações <span className="omni-campo__opcional">(opcional)</span>
                </label>
                <textarea
                    id={`${idBase}-obs`}
                    className="omni-entrada"
                    value={obs[dominio] || ""}
                    onChange={(e) => updateField("observacoes_barreiras", { ...obs, [dominio]: e.target.value })}
                    placeholder="Ex.: quando acontece, o que desencadeia, o que ajuda, o que piora, o que já funciona..."
                    rows={3}
                />
            </div>
        </section>
    );
}
