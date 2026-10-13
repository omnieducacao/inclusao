"use client";

import React from "react";
import { PageHero } from "@/components/PageHero";
import { Activity, Server, Clock, BarChart3, AlertTriangle } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PerformanceClient({ initialVitals }: { initialVitals: any[] }) {

    const renderEmptyState = () => (
        <div className="omni-cartao omni-cartao--plano" style={{ alignItems: "center", textAlign: "center", padding: 40, border: "1.5px dashed var(--borda-forte)" }}>
            <Server size={40} aria-hidden style={{ color: "var(--tinta-3)" }} />
            <h3 style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>
                Ainda não há medições salvas
            </h3>
            <p className="omni-apoio" style={{ maxWidth: 440 }}>
                A tabela <code>web_vitals</code> ainda não existe no banco de dados ou ainda não recebeu medições.
                As medições da Vercel continuam ativas e podem ser vistas no painel da Vercel.
            </p>
            <span className="omni-estado omni-estado--info">
                <Activity aria-hidden /> Acompanhamento ligado
            </span>
        </div>
    );

    const cartoes = [
        { Icone: Clock, sigla: "FCP", nome: "Primeiro conteúdo na tela", valor: "< 1,5 s", nota: "Referência: excelente" },
        { Icone: Activity, sigla: "LCP", nome: "Maior conteúdo na tela", valor: "< 2,5 s", nota: "Referência: bom" },
        { Icone: AlertTriangle, sigla: "CLS", nome: "Quanto a tela pula enquanto carrega", valor: "0,01", nota: "Referência: quase nada" },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
            <PageHero
                title="Desempenho da plataforma"
                desc="Velocidade de carregamento e estabilidade das telas da plataforma."
                moduleKey="admin"
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
                {cartoes.map(({ Icone, sigla, nome, valor, nota }) => (
                    <div key={sigla} className="omni-cartao" style={{ gap: 4 }}>
                        <p className="omni-apoio" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                            <Icone size={16} aria-hidden /> {nome} ({sigla})
                        </p>
                        <div style={{ font: "800 30px/36px var(--font-sans)", color: "var(--tinta)", fontVariantNumeric: "tabular-nums" }}>{valor}</div>
                        <p className="omni-apoio" style={{ fontSize: 13 }}>{nota}</p>
                    </div>
                ))}
            </div>

            <section aria-labelledby="medicoes-titulo" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                <h2 id="medicoes-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}>
                    <BarChart3 size={20} aria-hidden /> Medições recentes
                </h2>

                {(!initialVitals || initialVitals.length === 0) ? renderEmptyState() : (
                    <div className="omni-tabela-caixa">
                        <table className="omni-tabela">
                            <thead>
                                <tr>
                                    <th scope="col">Medida</th>
                                    <th scope="col" className="num">Valor (ms)</th>
                                    <th scope="col">Página</th>
                                    <th scope="col">Horário</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {initialVitals.map((v: any) => {
                                    const ruim = v.name === "CLS" || v.value > 2500;
                                    return (
                                        <tr key={v.id}>
                                            <td className="omni-tabela__nome">{v.name}</td>
                                            <td className="num" style={{ color: ruim ? "var(--erro)" : "var(--sucesso)", fontWeight: 700 }}>
                                                {Math.round(v.value)}
                                            </td>
                                            <td style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--tinta-2)" }}>{v.path}</td>
                                            <td style={{ color: "var(--tinta-2)" }}>{new Date(v.timestamp).toLocaleString("pt-BR")}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
