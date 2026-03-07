"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertTriangle, FileText, BarChart3, Printer, Eye, PenLine, Trash2, Plus, MinusCircle, Save, Info, Download, Upload, Target, Layers, BookOpen, Activity, ClipboardList } from "lucide-react";
import { OmniLoader } from "@/components/OmniLoader";

export function GabaritoRespostasPanel({ alunos }: { alunos: any[] }) {
    const [avaliacoes, setAvaliacoes] = useState<Array<{
        id: string; student_id: string; disciplina: string; status: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questoes_geradas: any; resultados: any; nivel_omnisfera_identificado: number | null;
        created_at: string;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [activeAval, setActiveAval] = useState<string | null>(null);
    const [respostas, setRespostas] = useState<Record<number, string>>({});
    const [analisando, setAnalisando] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [excluindo, setExcluindo] = useState(false);
    const [viewingReportId, setViewingReportId] = useState<string | null>(null);

    // Fetch all saved assessments
    useEffect(() => {
        setLoading(true);
        fetch("/api/pei/avaliacao-diagnostica?all=true")
            .then(r => r.json())
            .then(data => {
                setAvaliacoes(data.avaliacoes || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const getAluno = (studentId: string) => alunos.find(a => a.id === studentId);

    // ─── Excluir avaliação ────────────────────────────────────────────────
    const excluirAvaliacao = async (id: string) => {
        setExcluindo(true);
        try {
            const res = await fetch(`/api/pei/avaliacao-diagnostica?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.ok) {
                setAvaliacoes(prev => prev.filter(a => a.id !== id));
            }
        } catch { /* silent */ }
        setExcluindo(false);
        setConfirmDeleteId(null);
    };

    // Parse questions from the saved data — handles both JSON objects and text
    const extrairQuestoesTexto = (texto: string): { gabarito: string; habilidade: string }[] => {
        // 1) Try to parse as JSON (questoes_geradas may be a JSON object)
        try {
            const cleaned = texto.replace(/```(?:json)?\s*([\s\S]*?)```/, "$1").trim();
            const parsed = JSON.parse(cleaned);
            if (parsed?.questoes && Array.isArray(parsed.questoes)) {
                return parsed.questoes.map((q: { gabarito?: string; habilidade_bncc_ref?: string }) => ({
                    gabarito: (q.gabarito || "").toUpperCase(),
                    habilidade: q.habilidade_bncc_ref || "",
                }));
            }
            // raw_response fallback
            if (parsed?.raw_response) {
                return extrairQuestoesTexto(parsed.raw_response);
            }
        } catch { /* not JSON, continue to regex */ }

        // 2) Multi-pattern regex
        const questoes: { gabarito: string; habilidade: string }[] = [];
        const gabRegex1 = /(?:\*{0, 2})(?:gabarito|resposta\s*correta)(?:\*{0, 2})\s*[:]\s*\*{0, 2}\s*([A-Ea-e])\s*\*{0, 2}/gi;
        const gabRegex2 = /GABARITO\s*\(\s*(?:letra\s+)?([A-Ea-e])\s*\)/gi;
        const gabRegex3 = /(?:alternativa\s*correta|resposta)\s*[:]\s*\*{0, 2}\s*([A-Ea-e])\s*\*{0, 2}/gi;
        const habRegex = /(?:\*{0, 2})(?:habilidade|BNCC|habilidade_bncc)(?:\*{0, 2})\s*[:]\s*\*{0, 2}\s*([^\n*]+)/gi;

        const gabs: string[] = [];
        const habs: string[] = [];
        let m: RegExpExecArray | null;

        while ((m = gabRegex1.exec(texto)) !== null) gabs.push(m[1].toUpperCase());
        if (gabs.length === 0) { while ((m = gabRegex2.exec(texto)) !== null) gabs.push(m[1].toUpperCase()); }
        if (gabs.length === 0) { while ((m = gabRegex3.exec(texto)) !== null) gabs.push(m[1].toUpperCase()); }
        while ((m = habRegex.exec(texto)) !== null) habs.push(m[1].trim());

        for (let i = 0; i < gabs.length; i++) {
            const g = gabs[i] === "E" ? "D" : gabs[i];
            questoes.push({ gabarito: g, habilidade: habs[i] || "" });
        }
        return questoes;
    };

    const analisarRespostas = async (avalId: string, texto: string) => {
        setAnalisando(true);
        const questoes = extrairQuestoesTexto(texto);
        let acertos = 0;
        const distratores: { questao: number; marcada: string; correta: string; habilidade: string }[] = [];
        const habsOk: string[] = [];
        const habsFail: string[] = [];

        questoes.forEach((q, i) => {
            const marcada = respostas[i];
            if (!marcada) return;
            if (marcada === q.gabarito) {
                acertos++;
                if (q.habilidade && !habsOk.includes(q.habilidade)) habsOk.push(q.habilidade);
            } else {
                distratores.push({ questao: i + 1, marcada, correta: q.gabarito, habilidade: q.habilidade });
                if (q.habilidade && !habsFail.includes(q.habilidade)) habsFail.push(q.habilidade);
            }
        });

        const total = questoes.length;
        const pct = total > 0 ? Math.round((acertos / total) * 100) : 0;
        const nivel = pct >= 80 ? 4 : pct >= 60 ? 3 : pct >= 40 ? 2 : pct >= 20 ? 1 : 0;

        const analise = { score: pct, acertos, total, nivel, hab_dominadas: habsOk, hab_desenvolvimento: habsFail, distratores };

        try {
            await fetch("/api/pei/avaliacao-diagnostica", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: avalId,
                    resultados: { respostas, analise },
                    nivel_omnisfera_identificado: nivel,
                    status: "aplicada",
                }),
            });
            // Update local state
            setAvaliacoes(prev => prev.map(a =>
                a.id === avalId
                    ? { ...a, resultados: { respostas, analise }, nivel_omnisfera_identificado: nivel, status: "aplicada" }
                    : a
            ));
        } catch { /* silent */ }
        setAnalisando(false);
        setActiveAval(null);
        setRespostas({});
    };

    // ─── Nível Omnisfera labels ──────────────────────────────────────────
    const NIVEL_LABELS = [
        "Não demonstra", "Em desenvolvimento", "Parcialmente", "Satisfatório", "Pleno"
    ];
    const NIVEL_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"];

    // ─── Consolidated Report View ────────────────────────────────────────
    const avalReport = viewingReportId ? avaliacoes.find(a => a.id === viewingReportId) : null;
    if (avalReport && avalReport.status === "aplicada") {
        const aluno = getAluno(avalReport.student_id);
        const analise = avalReport.resultados?.analise;
        const nivel = analise?.nivel ?? 0;
        const score = analise?.score ?? 0;
        const acertos = analise?.acertos ?? 0;
        const total = analise?.total ?? 0;
        const habsDom = analise?.hab_dominadas || [];
        const habsDev = analise?.hab_desenvolvimento || [];
        const distratores = analise?.distratores || [];

        // Classify skills into proficiency groups
        const allHabs = [...habsDom.map((h: string) => ({ hab: h, ok: true })), ...habsDev.map((h: string) => ({ hab: h, ok: false }))];

        // SAEB domain breakdown from distratores
        const saebAcertos: Record<string, number> = { "I": 0, "II": 0, "III": 0 };
        const saebTotal: Record<string, number> = { "I": 0, "II": 0, "III": 0 };
        const respostasObj = avalReport.resultados?.respostas || {};
        // Try to extract SAEB level from habilidade codes
        const texto = typeof avalReport.questoes_geradas === "string" ? avalReport.questoes_geradas : JSON.stringify(avalReport.questoes_geradas || "");
        const questoesParsed = extrairQuestoesTexto(texto);

        questoesParsed.forEach((q, i) => {
            // Simple heuristic: first 40% → SAEB I, next 35% → SAEB II, rest → SAEB III
            const currentPct = total > 0 ? i / total : 0; // Renamed to avoid conflict with `pct` below
            const saebLevel = currentPct < 0.4 ? "I" : currentPct < 0.75 ? "II" : "III";
            saebTotal[saebLevel] = (saebTotal[saebLevel] || 0) + 1;
            const marcada = respostasObj[i];
            if (marcada === q.gabarito) {
                saebAcertos[saebLevel] = (saebAcertos[saebLevel] || 0) + 1;
            }
        });

        return (
            <div>
                <button onClick={() => setViewingReportId(null)} style={{
                    background: "none", border: "none", cursor: "pointer", color: "#3b82f6",
                    fontSize: 13, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 4,
                }}>← Voltar às avaliações</button>

                {/* ── 1. CABEÇALHO INSTITUCIONAL ── */}
                <div style={{
                    background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)",
                    borderRadius: 16, padding: "20px 24px", color: "#fff", marginBottom: 16,
                }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.7, marginBottom: 8 }}>
                        Relatório Consolidado — Avaliação Diagnóstica
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                        {aluno?.name || "Estudante"} · {avalReport.disciplina}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, opacity: 0.85 }}>
                        <span>📅 {new Date(avalReport.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                        {aluno?.grade && <span>📚 {aluno.grade} {aluno.class_group && `— ${aluno.class_group}`}</span>}
                        {aluno?.diagnostico && <span>🏥 {aluno.diagnostico}</span>}
                    </div>
                </div>

                {/* ── 2. RESUMO EXECUTIVO ── */}
                <div style={{
                    borderRadius: 14, padding: "18px 22px", marginBottom: 16,
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <BarChart3 size={16} style={{ color: "#3b82f6" }} /> Resumo Executivo
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 14 }}>
                        <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(16,185,129,.06)", textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 900, color: "#10b981" }}>{score}%</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Score Global</div>
                        </div>
                        <div style={{ padding: "14px 16px", borderRadius: 12, background: `${NIVEL_COLORS[nivel]}10`, textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 900, color: NIVEL_COLORS[nivel] }}>N{nivel}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{NIVEL_LABELS[nivel]}</div>
                        </div>
                        <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(99,102,241,.06)", textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 900, color: "#818cf8" }}>{acertos}/{total}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Acertos</div>
                        </div>
                        <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(239,68,68,.06)", textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 900, color: "#ef4444" }}>{distratores.length}</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>Distratores</div>
                        </div>
                    </div>
                    <div style={{
                        padding: "10px 14px", borderRadius: 8, fontSize: 12, lineHeight: 1.6,
                        background: score >= 70 ? "rgba(16,185,129,.05)" : score >= 40 ? "rgba(245,158,11,.05)" : "rgba(239,68,68,.05)",
                        color: "var(--text-secondary)",
                    }}>
                        {score >= 70
                            ? `O estudante demonstra bom domínio das habilidades avaliadas (${score}%). Recomenda-se aprofundamento e desafios de nível III.`
                            : score >= 40
                                ? `O estudante apresenta domínio parcial (${score}%). É necessário reforço nas habilidades em desenvolvimento, com foco em abordagens multimodais.`
                                : `O estudante apresenta dificuldades significativas (${score}%). Recomenda-se intervenção imediata com adaptações curriculares e suporte individual.`
                        }
                    </div>
                </div>

                {/* ── 3. MAPA DE PROFICIÊNCIA POR HABILIDADE ── */}
                <div style={{
                    borderRadius: 14, padding: "18px 22px", marginBottom: 16,
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <Target size={16} style={{ color: "#8b5cf6" }} /> Mapa de Proficiência por Habilidade
                    </div>
                    {allHabs.length === 0 ? (
                        <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 12, textAlign: "center" }}>
                            Dados de habilidades não disponíveis para esta avaliação.
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {allHabs.map(({ hab, ok }, i) => {
                                const pct = ok ? 100 : 0;
                                const color = ok ? "#10b981" : "#ef4444";
                                return (
                                    <div key={i}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                                                {hab.length > 50 ? hab.slice(0, 50) + "…" : hab}
                                            </span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color }}>{ok ? "Dominada" : "Em desenvolvimento"}</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 3, background: "var(--bg-primary, rgba(148,163,184,.08))", overflow: "hidden" }}>
                                            <div style={{
                                                width: `${ok ? 100 : 30}%`, height: "100%", borderRadius: 3,
                                                background: `linear-gradient(90deg, ${color}88, ${color})`,
                                                transition: "width .5s ease",
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── 4. ANÁLISE DE DISTRATORES ── */}
                {distratores.length > 0 && (
                    <div style={{
                        borderRadius: 14, padding: "18px 22px", marginBottom: 16,
                        background: "var(--bg-secondary, rgba(15,23,42,.4))",
                        border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                            <AlertTriangle size={16} style={{ color: "#f59e0b" }} /> Análise de Distratores
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {distratores.map((d: { questao: number; marcada: string; correta: string; habilidade: string }, i: number) => (
                                <div key={i} style={{
                                    padding: "12px 14px", borderRadius: 10,
                                    background: "rgba(239,68,68,.04)",
                                    border: "1px solid rgba(239,68,68,.1)",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                        <span style={{ fontWeight: 800, fontSize: 13, color: "#ef4444" }}>Q{d.questao}</span>
                                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                            Marcou <strong style={{ color: "#ef4444" }}>{d.marcada}</strong> · Correta: <strong style={{ color: "#10b981" }}>{d.correta}</strong>
                                        </span>
                                    </div>
                                    {d.habilidade && (
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                                            📝 {d.habilidade}
                                        </div>
                                    )}
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontStyle: "italic" }}>
                                        → Barreira identificada: O estudante pode ter dificuldade com o conceito associado a esta habilidade. Recomenda-se revisão com material concreto e abordagem multimodal.
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── 5. DOMÍNIO COGNITIVO (BLOOM/SAEB) ── */}
                <div style={{
                    borderRadius: 14, padding: "18px 22px", marginBottom: 16,
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <Layers size={16} style={{ color: "#6366f1" }} /> Domínio Cognitivo (SAEB)
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {(["I", "II", "III"] as const).map(lvl => {
                            const totalLvl = saebTotal[lvl] || 0;
                            const acertosLvl = saebAcertos[lvl] || 0;
                            const pctLvl = totalLvl > 0 ? Math.round((acertosLvl / totalLvl) * 100) : 0;
                            const label = lvl === "I" ? "Lembrar / Conhecer" : lvl === "II" ? "Aplicar / Analisar" : "Avaliar / Criar";
                            const barColor = lvl === "I" ? "#10b981" : lvl === "II" ? "#3b82f6" : "#8b5cf6";
                            return (
                                <div key={lvl}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                                            Nível {lvl} — {label}
                                        </span>
                                        <span style={{ fontSize: 12, fontWeight: 800, color: barColor }}>
                                            {totalLvl > 0 ? `${pctLvl}% (${acertosLvl}/${totalLvl})` : "—"}
                                        </span>
                                    </div>
                                    <div style={{ height: 8, borderRadius: 4, background: "var(--bg-primary, rgba(148,163,184,.08))", overflow: "hidden" }}>
                                        <div style={{
                                            width: `${pctLvl}%`, height: "100%", borderRadius: 4,
                                            background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                                            transition: "width .5s ease",
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                        {(saebTotal["III"] || 0) > 0 && (saebAcertos["III"] || 0) === 0
                            ? "⚠️ O estudante não acertou questões de nível III (reflexão). Opera no nível reprodutivo e precisa de andaimes para transferência de conhecimento."
                            : (saebAcertos["I"] || 0) === (saebTotal["I"] || 0) && (saebTotal["I"] || 0) > 0
                                ? "✅ Bom domínio no nível I (reprodução). Foco no avanço para níveis II e III com questões de aplicação e análise."
                                : "📊 Perfil cognitivo identificado. Use os dados acima para planejar intervenções progressivas."}
                    </div>
                </div>

                {/* ── 6. RECOMENDAÇÕES PEDAGÓGICAS ── */}
                <div style={{
                    borderRadius: 14, padding: "18px 22px", marginBottom: 16,
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <BookOpen size={16} style={{ color: "#10b981" }} /> Recomendações Pedagógicas
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {nivel <= 1 && (
                            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,.05)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                <strong style={{ color: "#ef4444" }}>🔴 Suporte Intensivo:</strong> Adaptar atividades com apoio visual e material concreto. Reduzir complexidade das tarefas. Utilizar dupla de trabalho com par tutor. Tempo adicional de +50%.
                            </div>
                        )}
                        {nivel === 2 && (
                            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(59,130,246,.05)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                <strong style={{ color: "#3b82f6" }}>🔵 Suporte Moderado:</strong> Manter adaptações com gradual retirada de apoio. Incluir atividades de nível II (aplicação). Rotina de exercícios com feedback imediato.
                            </div>
                        )}
                        {nivel >= 3 && (
                            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,.05)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                <strong style={{ color: "#10b981" }}>🟢 Aprofundamento:</strong> Propor desafios de nível III (análise/criação). Atividades de metacognição e autoavaliação. Estimular participação como par tutor.
                            </div>
                        )}
                        {habsDev.length > 0 && (
                            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(245,158,11,.05)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                <strong style={{ color: "#f59e0b" }}>📌 Habilidades para Reforço:</strong> {habsDev.join(", ")}
                            </div>
                        )}
                        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(99,102,241,.05)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                            <strong style={{ color: "#818cf8" }}>🎯 Recurso Hub:</strong> Gere atividades personalizadas no Hub de Atividades, focando nas habilidades em desenvolvimento identificadas acima.
                        </div>
                    </div>
                </div>

                {/* ── 7. ENCAMINHAMENTOS ── */}
                <div style={{
                    borderRadius: 14, padding: "18px 22px", marginBottom: 16,
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <Activity size={16} style={{ color: "#f59e0b" }} /> Encaminhamentos
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(139,92,246,.04)", border: "1px solid rgba(139,92,246,.1)" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6", marginBottom: 4 }}>Para o AEE</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                                {nivel <= 1 ? "Alertar sobre barreiras identificadas. Revisar PEI com urgência." : "Monitorar evolução nas próximas avaliações processuais."}
                            </div>
                        </div>
                        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(37,99,235,.04)", border: "1px solid rgba(37,99,235,.1)" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 4 }}>Para o Professor</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                                {habsDev.length > 0 ? `Focar em: ${habsDev.slice(0, 3).join(", ")}` : "Manter estratégias atuais. Avançar para próximo nível cognitivo."}
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(16,185,129,.04)", fontSize: 11, color: "var(--text-muted)" }}>
                        📆 Prazo sugerido para reavaliação: <strong style={{ color: "#10b981" }}>Avaliação Processual do próximo bimestre</strong>
                    </div>
                </div>

                {/* Link to Processual */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 18px", borderRadius: 12,
                    background: "rgba(16,185,129,.05)", border: "1px solid rgba(16,185,129,.15)",
                }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>📊 Acompanhe a evolução ao longo do ano</span>
                    <a href={`/avaliacao-processual${avalReport?.student_id ? `?student=${avalReport.student_id}` : ""}`} style={{ fontSize: 12, fontWeight: 700, color: "#10b981", textDecoration: "none" }}>Ir para Processual →</a>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-10">
                <OmniLoader variant="card" />
            </div>
        );
    }

    if (avaliacoes.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: 40 }}>
                <ClipboardList size={48} style={{ margin: "0 auto 12px", color: "var(--text-muted)", opacity: 0.3 }} />
                <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                    Nenhuma avaliação salva
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                    Gere e valide uma avaliação na aba &quot;Estudantes&quot; para poder lançar respostas aqui.
                </p>
            </div>
        );
    }

    // Active assessment for answer input
    const avalAtiva = avaliacoes.find(a => a.id === activeAval);
    if (avalAtiva) {
        const texto = typeof avalAtiva.questoes_geradas === "string" ? avalAtiva.questoes_geradas : JSON.stringify(avalAtiva.questoes_geradas || "");
        const questoes = extrairQuestoesTexto(texto);
        const aluno = getAluno(avalAtiva.student_id);
        const respondidas = Object.keys(respostas).length;

        return (
            <div>
                <button onClick={() => { setActiveAval(null); setRespostas({}); }} style={{
                    background: "none", border: "none", cursor: "pointer", color: "#3b82f6",
                    fontSize: 13, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 4,
                }}>← Voltar às avaliações</button>

                <div style={{
                    background: "linear-gradient(135deg, #6366f1, #818cf8)", borderRadius: 14,
                    padding: "16px 20px", color: "#fff", marginBottom: 20,
                }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>📋 Gabarito — {avalAtiva.disciplina}</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>
                        {aluno?.name || "Estudante"} · {respondidas} de {questoes.length} respondidas
                    </div>
                </div>

                {questoes.length === 0 ? (
                    <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                        Não foi possível extrair questões desta avaliação. Verifique se o formato está correto.
                    </div>
                ) : (
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10, marginBottom: 16 }}>
                            {questoes.map((q, i) => {
                                const gabCorreto = q.gabarito;
                                const marcada = respostas[i];
                                const respondida = !!marcada;
                                return (
                                    <div key={i} style={{
                                        padding: "12px 14px", borderRadius: 10,
                                        background: respondida
                                            ? marcada === gabCorreto ? "rgba(16,185,129,.06)" : "rgba(239,68,68,.06)"
                                            : "var(--bg-secondary, rgba(15,23,42,.3))",
                                        border: `1px solid ${respondida ? (marcada === gabCorreto ? "rgba(16,185,129,.2)" : "rgba(239,68,68,.2)") : "var(--border-default, rgba(148,163,184,.1))"}`,
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                            <span style={{ fontWeight: 800, fontSize: 13, color: "#818cf8" }}>Q{i + 1}</span>
                                            {q.habilidade && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "rgba(99,102,241,.1)", color: "#818cf8" }}>{q.habilidade}</span>}
                                            {respondida && (
                                                <span style={{ marginLeft: "auto", fontSize: 12 }}>
                                                    {marcada === gabCorreto ? "✅" : "❌"}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {["A", "B", "C", "D"].map(letra => {
                                                const isSelected = marcada === letra;
                                                const isCorrect = letra === gabCorreto;
                                                const showCorrect = respondida && isCorrect && !isSelected;
                                                return (
                                                    <button
                                                        key={letra}
                                                        onClick={() => setRespostas(prev => ({ ...prev, [i]: letra }))}
                                                        style={{
                                                            flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                                                            cursor: "pointer", transition: "all .15s",
                                                            border: isSelected
                                                                ? `2px solid ${isCorrect ? "#10b981" : "#ef4444"}`
                                                                : showCorrect ? "2px solid rgba(16,185,129,.4)" : "1px solid var(--border-default, rgba(148,163,184,.12))",
                                                            background: isSelected
                                                                ? isCorrect ? "rgba(16,185,129,.15)" : "rgba(239,68,68,.15)"
                                                                : showCorrect ? "rgba(16,185,129,.08)" : "transparent",
                                                            color: isSelected
                                                                ? isCorrect ? "#10b981" : "#ef4444"
                                                                : showCorrect ? "#10b981" : "var(--text-muted)",
                                                        }}
                                                    >{letra}</button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => analisarRespostas(avalAtiva.id, texto)}
                            disabled={analisando || respondidas === 0}
                            style={{
                                width: "100%", padding: "14px 20px", borderRadius: 12, border: "none",
                                cursor: analisando || respondidas === 0 ? "not-allowed" : "pointer",
                                background: analisando || respondidas === 0 ? "#64748b" : "linear-gradient(135deg, #059669, #10b981)",
                                color: "#fff", fontWeight: 700, fontSize: 14,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            }}
                        >
                            {analisando ? <OmniLoader engine="red" size={16} /> : <BarChart3 size={16} />}
                            {analisando ? "Analisando..." : `Salvar e Analisar (${respondidas}/${questoes.length})`}
                        </button>
                    </>
                )}
            </div>
        );
    }

    // ─── Confirmation modal ────────────────────────────────────────────
    const avalParaExcluir = avaliacoes.find(a => a.id === confirmDeleteId);
    const alunoExcluir = avalParaExcluir ? getAluno(avalParaExcluir.student_id) : null;

    // List of all assessments
    return (
        <>
            {/* Delete confirmation modal */}
            {confirmDeleteId && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)",
                }} onClick={() => !excluindo && setConfirmDeleteId(null)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: "var(--bg-primary, #0f172a)", borderRadius: 16,
                        border: "1px solid rgba(239,68,68,.25)", padding: "24px 28px",
                        maxWidth: 420, width: "90%", boxShadow: "0 25px 50px rgba(0,0,0,.5)",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10, display: "flex",
                                alignItems: "center", justifyContent: "center",
                                background: "rgba(239,68,68,.1)", color: "#ef4444",
                            }}>
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary, #e2e8f0)" }}>Excluir Avaliação</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)" }}>Esta ação não pode ser desfeita</div>
                            </div>
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-secondary, #cbd5e1)", margin: "0 0 20px", lineHeight: 1.6 }}>
                            Tem certeza que deseja excluir a avaliação de <strong>{avalParaExcluir?.disciplina}</strong> do estudante <strong>{alunoExcluir?.name || "Estudante"}</strong>?
                            {avalParaExcluir?.status === "aplicada" && " Os resultados e análises serão perdidos permanentemente."}
                        </p>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={excluindo}
                                style={{
                                    padding: "10px 20px", borderRadius: 10, cursor: "pointer",
                                    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                    background: "transparent", color: "var(--text-secondary, #cbd5e1)",
                                    fontWeight: 600, fontSize: 13,
                                }}
                            >Cancelar</button>
                            <button
                                onClick={() => confirmDeleteId && excluirAvaliacao(confirmDeleteId)}
                                disabled={excluindo}
                                style={{
                                    padding: "10px 20px", borderRadius: 10, cursor: excluindo ? "not-allowed" : "pointer",
                                    border: "none", background: "linear-gradient(135deg, #dc2626, #ef4444)",
                                    color: "#fff", fontWeight: 700, fontSize: 13,
                                    display: "flex", alignItems: "center", gap: 6, opacity: excluindo ? 0.7 : 1,
                                }}
                            >
                                {excluindo ? <OmniLoader size={14} /> : <Trash2 size={14} />}
                                {excluindo ? "Excluindo..." : "Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {avaliacoes.map(av => {
                    const aluno = getAluno(av.student_id);
                    const analise = av.resultados?.analise;
                    const isAplicada = av.status === "aplicada";
                    return (
                        <div key={av.id} style={{
                            padding: "14px 18px", borderRadius: 12,
                            background: "var(--bg-secondary, rgba(15,23,42,.3))",
                            border: `1px solid ${isAplicada ? "rgba(16,185,129,.2)" : "var(--border-default, rgba(148,163,184,.1))"}`,
                            cursor: "pointer", transition: "all .15s",
                        }}
                            onClick={() => {
                                if (isAplicada) {
                                    setViewingReportId(av.id);
                                } else {
                                    setActiveAval(av.id);
                                    setRespostas({});
                                }
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                    background: isAplicada ? "rgba(16,185,129,.1)" : "rgba(99,102,241,.1)",
                                    color: isAplicada ? "#10b981" : "#818cf8", fontWeight: 700, fontSize: 14,
                                }}>
                                    {isAplicada ? "✅" : "📝"}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                                        {aluno?.name || "Estudante"} · {av.disciplina}
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                        {new Date(av.created_at).toLocaleDateString("pt-BR")} ·{" "}
                                        {isAplicada ? `${analise?.score ?? 0}% — Nível ${analise?.nivel ?? "?"}` : "Aguardando respostas"}
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{
                                        padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                                        background: isAplicada ? "rgba(16,185,129,.1)" : "rgba(245,158,11,.1)",
                                        color: isAplicada ? "#10b981" : "#f59e0b",
                                    }}>
                                        {isAplicada ? "Analisada" : "Pendente"}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(av.id); }}
                                        title="Excluir avaliação"
                                        style={{
                                            width: 28, height: 28, borderRadius: 6, border: "none",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            cursor: "pointer", background: "rgba(239,68,68,.08)",
                                            color: "#ef4444", transition: "all .15s",
                                        }}
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>

                            {/* Show analysis summary if available */}
                            {isAplicada && analise && (
                                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                                    <div style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(16,185,129,.06)", textAlign: "center" }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>{analise.score}%</div>
                                        <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Score</div>
                                    </div>
                                    <div style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(99,102,241,.06)", textAlign: "center" }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: "#818cf8" }}>N{analise.nivel}</div>
                                        <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Nível</div>
                                    </div>
                                    <div style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(239,68,68,.06)", textAlign: "center" }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: "#ef4444" }}>{analise.distratores?.length || 0}</div>
                                        <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Erros</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

// ─── Matriz de Referência Panel ─────────────────────────────────────────────


