"use client";

import React, { useRef } from "react";
import { Printer, FileDown } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

interface Questao {
    id: string;
    enunciado: string;
    alternativas: { A: string; B: string; C: string; D: string };
    gabarito: string;
    justificativa_pedagogica: string;
    instrucao_aplicacao_professor: string;
    contexto_visual_sugerido?: string | null;
    adaptacao_nee_aplicada?: string;
    texto_base?: string;
}

interface ProvaImprimivelProps {
    questoes: Questao[];
    nomeAluno: string;
    serie: string;
    disciplina: string;
    nomeEscola?: string;
    nomeProfessor?: string;
    nomeAvaliacao?: string;
    respostas?: Record<string, string>;
    mostrarGabarito?: boolean;
}

// ── Styles (inline for print isolation) ────────────────────────────────

const pageStyle: React.CSSProperties = {
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    maxWidth: 800,
    margin: "0 auto",
    padding: "32px 24px",
    background: "#fff",
    color: "#1e293b",
    fontSize: 14,
    lineHeight: 1.6,
};

const headerStyle: React.CSSProperties = {
    borderBottom: "3px solid #0f172a",
    paddingBottom: 16,
    marginBottom: 24,
    display: "flex",
    flexDirection: "column",
    gap: 8,
};

const questaoBlockStyle: React.CSSProperties = {
    marginBottom: 28,
    pageBreakInside: "avoid",
};

const alternativaStyle = (letra: string, gabarito: string, mostrar: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "6px 12px",
    marginBottom: 4,
    borderRadius: 6,
    border: mostrar && letra === gabarito ? "1.5px solid #16a34a" : "1px solid #e2e8f0",
    background: mostrar && letra === gabarito ? "#f0fdf4" : "transparent",
});

const letraBadgeStyle = (letra: string, gabarito: string, mostrar: boolean): React.CSSProperties => ({
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 13,
    flexShrink: 0,
    background: mostrar && letra === gabarito ? "#16a34a" : "#f1f5f9",
    color: mostrar && letra === gabarito ? "#fff" : "#475569",
    border: mostrar && letra === gabarito ? "none" : "1px solid #cbd5e1",
});

// ── Print CSS ──────────────────────────────────────────────────────────

const printCSS = `
@media print {
    body * { visibility: hidden; }
    .prova-imprimivel, .prova-imprimivel * { visibility: visible; }
    .prova-imprimivel {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 20px;
    }
    .prova-no-print { display: none !important; }
    .prova-page-break { page-break-before: always; }
    @page {
        margin: 1.5cm;
        size: A4;
    }
}
`;

// ── Component ──────────────────────────────────────────────────────────

export function ProvaImprimivel({
    questoes,
    nomeAluno,
    serie,
    disciplina,
    nomeEscola = "Escola",
    nomeProfessor = "",
    nomeAvaliacao = "Avaliação Diagnóstica",
    respostas = {},
    mostrarGabarito = false,
}: ProvaImprimivelProps) {
    const provaRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleExportWord = () => {
        if (!provaRef.current) return;

        const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12pt; color: #1e293b; line-height: 1.6; }
table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
td, th { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
h1 { font-size: 16pt; margin-bottom: 4px; }
h2 { font-size: 14pt; margin-top: 20px; }
.questao { margin-bottom: 24px; page-break-inside: avoid; }
.alternativa { margin-bottom: 4px; padding: 4px 8px; }
.correta { background: #f0fdf4; border: 1px solid #16a34a; border-radius: 4px; }
.header-info { font-size: 11pt; color: #475569; }
</style>
</head>
<body>
<h1>${nomeAvaliacao}</h1>
<table>
<tr><td><strong>Escola:</strong> ${nomeEscola}</td><td><strong>Data:</strong> ___/___/______</td></tr>
<tr><td><strong>Aluno(a):</strong> ${nomeAluno}</td><td><strong>Turma:</strong> ${serie}</td></tr>
<tr><td><strong>Professor(a):</strong> ${nomeProfessor}</td><td><strong>Disciplina:</strong> ${disciplina}</td></tr>
</table>
<hr>
${questoes.map((q, idx) => `
<div class="questao">
<h2>Questão ${idx + 1}</h2>
${q.texto_base ? `<p style="background:#f8fafc;padding:8px;border-left:3px solid #3b82f6;margin-bottom:8px"><em>${q.texto_base}</em></p>` : ""}
<p>${q.enunciado}</p>
${q.contexto_visual_sugerido ? `<p style="color:#6366f1;font-style:italic">[Imagem sugerida: ${q.contexto_visual_sugerido}]</p>` : ""}
${Object.entries(q.alternativas).map(([letra, texto]) => `
<div class="alternativa${mostrarGabarito && letra === q.gabarito ? ' correta' : ''}">
<strong>(${letra})</strong> ${texto}
</div>`).join("")}
${mostrarGabarito ? `<p style="color:#16a34a;font-size:10pt;margin-top:4px"><strong>Gabarito: ${q.gabarito}</strong> — ${q.justificativa_pedagogica}</p>` : ""}
</div>`).join("")}
${mostrarGabarito ? `
<hr>
<h2>Gabarito Resumido</h2>
<table>
<tr>${questoes.map((_, i) => `<th>${i + 1}</th>`).join("")}</tr>
<tr>${questoes.map(q => `<td><strong>${q.gabarito}</strong></td>`).join("")}</tr>
</table>` : ""}
</body>
</html>`;

        const blob = new Blob([html], { type: "application/msword" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${nomeAvaliacao.replace(/\s+/g, "_")}_${nomeAluno.replace(/\s+/g, "_")}.doc`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const today = new Date();
    const dataFormatada = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`;

    return (
        <>
            <style>{printCSS}</style>

            {/* Action bar — hidden in print */}
            <div className="prova-no-print" style={{
                display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap",
            }}>
                <button
                    onClick={handlePrint}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 16px", borderRadius: 8, border: "none",
                        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                        color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}
                >
                    <Printer size={16} /> Imprimir / PDF
                </button>
                <button
                    onClick={handleExportWord}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0",
                        background: "#fff", color: "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}
                >
                    <FileDown size={16} /> Exportar Word (.doc)
                </button>
            </div>

            {/* Printable content */}
            <div ref={provaRef} className="prova-imprimivel" style={pageStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                        {nomeAvaliacao}
                    </div>
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px",
                        fontSize: 13, color: "#475569",
                    }}>
                        <div><strong>Escola:</strong> {nomeEscola}</div>
                        <div><strong>Data:</strong> {dataFormatada}</div>
                        <div><strong>Aluno(a):</strong> {nomeAluno}</div>
                        <div><strong>Turma:</strong> {serie}</div>
                        <div><strong>Professor(a):</strong> {nomeProfessor}</div>
                        <div><strong>Disciplina:</strong> {disciplina}</div>
                    </div>
                </div>

                {/* Instructions */}
                <div style={{
                    padding: "10px 14px", borderRadius: 8, marginBottom: 24,
                    background: "#f8fafc", border: "1px solid #e2e8f0",
                    fontSize: 12, color: "#64748b",
                }}>
                    <strong>Instruções:</strong> Leia atentamente cada questão. Marque com um <strong>X</strong> a alternativa correta.
                    Não é permitido rasura no gabarito.
                </div>

                {/* Questions */}
                {questoes.map((q, idx) => (
                    <div key={q.id} style={questaoBlockStyle}>
                        {/* Question number */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
                        }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "#0f172a", color: "#fff",
                                fontSize: 14, fontWeight: 800,
                            }}>
                                {idx + 1}
                            </div>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                {q.instrucao_aplicacao_professor}
                            </span>
                        </div>

                        {/* Texto-base (if exists) */}
                        {q.texto_base && (
                            <div style={{
                                padding: "10px 14px", marginBottom: 10,
                                borderLeft: "3px solid #3b82f6",
                                background: "#f8fafc", borderRadius: "0 6px 6px 0",
                                fontSize: 13, color: "#334155", fontStyle: "italic",
                                lineHeight: 1.7,
                            }}>
                                {q.texto_base}
                            </div>
                        )}

                        {/* Visual context placeholder */}
                        {q.contexto_visual_sugerido && (
                            <div style={{
                                padding: "12px 14px", marginBottom: 10,
                                border: "2px dashed #c7d2fe", borderRadius: 8,
                                background: "#eef2ff",
                                display: "flex", alignItems: "center", gap: 8,
                                fontSize: 11, color: "#6366f1",
                            }}>
                                🖼️ <em>Espaço para imagem: {q.contexto_visual_sugerido}</em>
                            </div>
                        )}

                        {/* Enunciado */}
                        <div style={{
                            fontSize: 14, fontWeight: 500, color: "#1e293b",
                            marginBottom: 10, lineHeight: 1.7,
                        }}>
                            {q.enunciado}
                        </div>

                        {/* Alternatives */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {(Object.entries(q.alternativas) as [string, string][]).map(([letra, texto]) => (
                                <div key={letra} style={alternativaStyle(letra, q.gabarito, mostrarGabarito)}>
                                    <div style={letraBadgeStyle(letra, q.gabarito, mostrarGabarito)}>
                                        {letra}
                                    </div>
                                    <div style={{ fontSize: 13, color: "#334155", paddingTop: 2 }}>
                                        {texto}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Teacher justification (gabarito mode only) */}
                        {mostrarGabarito && (
                            <div style={{
                                marginTop: 8, padding: "8px 12px", borderRadius: 6,
                                background: "#f0fdf4", border: "1px solid #bbf7d0",
                                fontSize: 12, color: "#166534",
                            }}>
                                <strong>Gabarito: ({q.gabarito})</strong> — {q.justificativa_pedagogica}
                                {q.adaptacao_nee_aplicada && (
                                    <div style={{ marginTop: 4, color: "#b45309", fontSize: 11 }}>
                                        ⚠️ Adaptação NEE: {q.adaptacao_nee_aplicada}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Answer sheet */}
                {!mostrarGabarito && (
                    <div className="prova-page-break" style={{
                        marginTop: 32, paddingTop: 20,
                        borderTop: "2px solid #e2e8f0",
                    }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                            Folha de Respostas
                        </div>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                            gap: 8,
                        }}>
                            {questoes.map((q, idx) => (
                                <div key={q.id} style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 6,
                                }}>
                                    <strong style={{ fontSize: 13, color: "#0f172a" }}>{idx + 1}.</strong>
                                    {["A", "B", "C", "D"].map(l => (
                                        <div key={l} style={{
                                            width: 22, height: 22, borderRadius: "50%",
                                            border: respostas[q.id] === l ? "2px solid #3b82f6" : "1.5px solid #cbd5e1",
                                            background: respostas[q.id] === l ? "#dbeafe" : "transparent",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 10, fontWeight: 700, color: "#475569",
                                        }}>
                                            {l}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
