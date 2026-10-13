"use client";
/**
 * Onda 22: visual do design system — cores dos níveis pelas cores do símbolo (--encontro-*),
 * superfícies e textos por variáveis, seleção com aria-pressed, linhas clicáveis viram botões.
 *
 * Guia visual da rubrica para atribuir o nível: os 5 níveis Omnisfera com suporte, descrição,
 * instrumento recomendado e o nível qualitativo correspondente (Guia MEC, do Ministério da Educação) com a faixa.
 */
import React from "react";
import { BarChart3, Wrench } from "lucide-react";
import { ESCALA_OMNISFERA, NivelOmnisfera } from "@/lib/omnisfera-types";

interface RubricaOmnisferaProps {
    nivelAtual?: NivelOmnisfera;
    onSelect?: (nivel: NivelOmnisfera) => void;
    compact?: boolean;
}

/* forte: texto e contorno; suave: fundo; pura + sobre: o círculo do nível escolhido (maior contraste) */
const LEVEL_COLORS: Record<NivelOmnisfera, { forte: string; suave: string; pura: string; sobre: string }> = {
    0: { forte: "var(--encontro-vermelho-forte)", suave: "var(--encontro-vermelho-suave)", pura: "var(--encontro-vermelho)", sobre: "var(--sobre-encontro-claro)" },
    1: { forte: "var(--encontro-amarelo-forte)", suave: "var(--encontro-amarelo-suave)", pura: "var(--encontro-amarelo)", sobre: "var(--sobre-encontro)" },
    2: { forte: "var(--encontro-azul-forte)", suave: "var(--encontro-azul-suave)", pura: "var(--encontro-azul)", sobre: "var(--sobre-encontro-claro)" },
    3: { forte: "var(--encontro-verde-forte)", suave: "var(--encontro-verde-suave)", pura: "var(--encontro-verde)", sobre: "var(--sobre-encontro)" },
    4: { forte: "var(--encontro-roxo-forte)", suave: "var(--encontro-roxo-suave)", pura: "var(--encontro-roxo)", sobre: "var(--sobre-encontro-claro)" },
};

/**
 * Níveis Omnisfera → níveis qualitativos do Guia MEC (faixas alinhadas).
 * Faixas: <25%=0, 25-49%=1, 50-69%=2, 70-89%=3, ≥90%=4
 */
const NIVEL_QUALITATIVO: Record<NivelOmnisfera, { label: string; faixa: string; grupo: string }> = {
    0: { label: "Em Processo", faixa: "<25%", grupo: "Defasagem" },
    1: { label: "Em Processo", faixa: "25–49%", grupo: "Defasagem" },
    2: { label: "Razoável", faixa: "50–69%", grupo: "Intermediário" },
    3: { label: "Adequado", faixa: "70–89%", grupo: "Avançado" },
    4: { label: "Avançado", faixa: "≥90%", grupo: "Avançado+" },
};

export function RubricaOmnisfera({ nivelAtual, onSelect, compact }: RubricaOmnisferaProps) {
    const levels = [0, 1, 2, 3, 4] as NivelOmnisfera[];

    const circulo = (n: NivelOmnisfera, tam: number, selected: boolean): React.CSSProperties => {
        const c = LEVEL_COLORS[n];
        return {
            width: tam, height: tam, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: selected ? c.pura : "transparent",
            color: selected ? c.sobre : c.forte,
            border: selected ? "none" : `1.5px solid ${c.forte}`,
            fontSize: tam > 26 ? 14 : 12, fontWeight: 800,
        };
    };

    if (compact) {
        // Compacto: seletor horizontal de nível (sem o conteúdo da rubrica)
        return (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "8px 0" }}>
                {levels.map(n => {
                    const c = LEVEL_COLORS[n];
                    const esc = ESCALA_OMNISFERA[n];
                    const nq = NIVEL_QUALITATIVO[n];
                    const selected = nivelAtual === n;
                    return (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onSelect?.(n)}
                            aria-label={`Selecionar nível ${n}`}
                            aria-pressed={selected}
                            title={`${esc.label}: ${esc.descricao} | ${nq.label} (${nq.faixa})`}
                            style={{
                                flex: 1, minWidth: 70, padding: "8px 6px", borderRadius: "var(--o-radius-md)",
                                border: selected ? `2px solid ${c.forte}` : "1px solid var(--borda)",
                                background: selected ? c.suave : "var(--superficie)",
                                cursor: onSelect ? "pointer" : "default",
                                transition: "background-color var(--duracao-rapida), border-color var(--duracao-rapida)",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ ...circulo(n, 24, selected), margin: "0 auto 4px" }}>{n}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: c.forte }}>{esc.label}</div>
                            <div className="omni-dado" style={{ fontSize: 11, lineHeight: "14px", color: "var(--tinta-3)" }}>{nq.faixa}</div>
                        </button>
                    );
                })}
            </div>
        );
    }

    // Rubrica completa
    return (
        <div style={{ borderRadius: "var(--o-radius-md)", overflow: "hidden", border: "1px solid var(--borda)", background: "var(--superficie)" }}>
            <div style={{
                padding: "10px 14px",
                background: "var(--superficie-2)",
                borderBottom: "1px solid var(--borda)",
                fontSize: 13, fontWeight: 700, color: "var(--tinta)",
                display: "flex", alignItems: "center", gap: 6,
            }}>
                <BarChart3 size={16} aria-hidden="true" style={{ color: "var(--tinta-2)" }} />
                Rubrica de correção: escala Omnisfera e Guia MEC
            </div>
            <div style={{ padding: 0 }}>
                {levels.map(n => {
                    const c = LEVEL_COLORS[n];
                    const esc = ESCALA_OMNISFERA[n];
                    const nq = NIVEL_QUALITATIVO[n];
                    const selected = nivelAtual === n;
                    const Tag = onSelect ? "button" : "div";

                    return (
                        <Tag
                            key={n}
                            {...(onSelect ? { type: "button" as const, onClick: () => onSelect(n), "aria-pressed": selected } : {})}
                            style={{
                                display: "flex", alignItems: "flex-start", gap: 12, width: "100%", textAlign: "left",
                                font: "inherit", border: 0,
                                padding: "10px 14px",
                                background: selected ? c.suave : "transparent",
                                borderBottom: n < 4 ? "1px solid var(--borda)" : "none",
                                cursor: onSelect ? "pointer" : "default",
                                transition: "background-color var(--duracao-rapida)",
                                borderLeft: selected ? `3px solid ${c.forte}` : "3px solid transparent",
                            }}
                        >
                            <div style={{ ...circulo(n, 30, selected), marginTop: 2 }}>{n}</div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: selected ? c.forte : "var(--tinta)" }}>
                                        {esc.label}
                                    </span>
                                    <span className="omni-estado" style={{ minHeight: 20, padding: "1px 8px", fontSize: 11, lineHeight: "16px", background: c.suave, color: c.forte }}>
                                        {esc.suporte_correspondente}
                                    </span>
                                    {/* Nível qualitativo do Guia MEC */}
                                    <span className="omni-rotulo" style={{ fontSize: 10, lineHeight: "14px", padding: "1px 6px", borderRadius: "var(--o-radius-xs)", border: `1px solid ${c.forte}`, color: c.forte }}>
                                        {nq.label} • {nq.faixa}
                                    </span>
                                </div>
                                <div className="omni-apoio" style={{ fontSize: 13 }}>
                                    {esc.descricao}
                                </div>
                                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--tinta-3)", fontStyle: "italic" }}>
                                        <Wrench size={12} aria-hidden="true" /> {esc.instrumento_recomendado}
                                    </span>
                                    <span style={{ fontSize: 12, color: "var(--tinta-3)" }}>
                                        | Grupo: {nq.grupo}
                                    </span>
                                </div>
                            </div>
                        </Tag>
                    );
                })}
            </div>
        </div>
    );
}
