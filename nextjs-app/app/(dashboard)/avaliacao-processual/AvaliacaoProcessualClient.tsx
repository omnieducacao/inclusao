"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@omni/ds";
import {
    Activity /* eslint-disable-line @typescript-eslint/no-unused-vars */, AlertTriangle, ChevronDown, ChevronUp,
    Users, ArrowLeft, Save, BarChart3, Calendar, BookOpen, TrendingUp, Sparkles, FileText,
    Printer,
} from "lucide-react";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";
import { RubricaOmnisfera } from "@/components/RubricaOmnisfera";
import { OnboardingPanel } from "@/components/OnboardingPanel";
import { PageHero } from "@/components/PageHero";
import { OmniLoader } from "@/components/OmniLoader";
import type { AlunoProcessual as Aluno, HabilidadeAvaliada, TipoPeriodo } from "./types";
import { cardS, headerS, bodyS, NIVEL_COLORS, PERIODOS } from "./types";

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function AvaliacaoProcessualClient() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [professorName, setProfessorName] = useState("");
    const [error, setError] = useState("");

    // Navigation
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [selectedDisc, setSelectedDisc] = useState<string | null>(null);
    const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>("bimestral");
    const [selectedPeriodo, setSelectedPeriodo] = useState(1);

    // Avaliação state
    const [habilidades, setHabilidades] = useState<HabilidadeAvaliada[]>([]);
    const [observacaoGeral, setObservacaoGeral] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [salvou, setSalvou] = useState(false);
    const [expandedHab, setExpandedHab] = useState<string | null>(null);

    // Evolution data
    const [evolucao, setEvolucao] = useState<{
        disciplina: string;
        periodos: { bimestre: number; media_nivel: number | null }[];
        tendencia: string;
        media_mais_recente: number | null;
    }[]>([]);
    const [showEvolucao, setShowEvolucao] = useState(false);

    // Report
    const [relatorio, setRelatorio] = useState<Record<string, unknown> | null>(null);
    const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
    const [showRelatorio, setShowRelatorio] = useState(false);

    // Integrated report
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [relatorioIntegrado, setRelatorioIntegrado] = useState<Record<string, any> | null>(null);
    const [gerandoIntegrado, setGerandoIntegrado] = useState(false);
    const [showIntegrado, setShowIntegrado] = useState(false);

    const [showOnboarding, setShowOnboarding] = useState(false);

    // ─── Fetch students ──────────────────────────────────────────────────

    const fetchAlunos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/pei-regente/meus-alunos");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setAlunos(data.alunos || []);
            setProfessorName(data.professor?.name || "");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAlunos(); }, [fetchAlunos]);

    // Pré-selecionar estudante quando a URL tiver ?student=xxx (ex.: vindo do Monitoramento ou PEI)
    const studentIdFromUrl = searchParams?.get("student") || null;
    useEffect(() => {
        if (!studentIdFromUrl || alunos.length === 0) return;
        const found = alunos.find((a) => a.id === studentIdFromUrl);
        if (found) setSelectedAluno(found);
    }, [studentIdFromUrl, alunos]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!localStorage.getItem("onboarding_processual")) setShowOnboarding(true);
    }, []);

    // ─── Load existing processual for this bimestre ─────────────────────

    const loadRegistro = useCallback(async (studentId: string, disciplina: string, periodo: number) => {
        try {
            const res = await fetch(
                `/api/avaliacao-processual?studentId=${studentId}&disciplina=${encodeURIComponent(disciplina)}&bimestre=${periodo}`
            );
            const data = await res.json();
            const registros = data.registros || [];
            if (registros.length > 0) {
                const reg = registros[0];
                if (reg.habilidades?.length) {
                    setHabilidades(reg.habilidades.map((h: Record<string, unknown>) => ({
                        codigo_bncc: h.codigo_bncc as string || "",
                        descricao: h.descricao as string || "",
                        nivel_atual: (h.nivel_atual as NivelOmnisfera) ?? 0,
                        nivel_anterior: (h.nivel_anterior as NivelOmnisfera) ?? null,
                        observacao: h.observacao as string || "",
                    })));
                }
                setObservacaoGeral(reg.observacao_geral || "");
            }
        } catch { /* silent */ }
    }, []);

    // ─── Load habilidades: Plano de Curso → Matriz → BNCC ─────────────────

    const [habSource, setHabSource] = useState<string>("");

    // Diagnostic baseline state
    const [diagBaseline, setDiagBaseline] = useState<{ nivel: number; score: number; disciplina: string } | null>(null);

    const loadHabilidades = useCallback(async (aluno: Aluno, disciplina: string) => {
        try {
            const gradeNum = aluno.grade?.match(/\d+/)?.[0] || "6";
            const res = await fetch(
                `/api/plano-curso/habilidades?disciplina=${encodeURIComponent(disciplina)}&serie=${encodeURIComponent(aluno.grade || `EF${gradeNum}`)}`
            );
            const data = await res.json();

            if (data.habilidades?.length) {
                let mapped: HabilidadeAvaliada[] = data.habilidades.slice(0, 12).map(
                    (h: { codigo_bncc: string; descricao: string }) => ({
                        codigo_bncc: h.codigo_bncc || "",
                        descricao: h.descricao || "",
                        nivel_atual: 0 as NivelOmnisfera,
                        nivel_anterior: null,
                        observacao: "",
                    })
                );

                // ─── Fetch diagnostic baseline to pre-populate nivel_anterior ────
                try {
                    const diagRes = await fetch(
                        `/api/pei/avaliacao-diagnostica?studentId=${aluno.id}&disciplina=${encodeURIComponent(disciplina)}`
                    );
                    const diagData = await diagRes.json();
                    const avaliacoes = diagData.avaliacoes || [];
                    // Find the most recent analyzed assessment
                    const aplicada = avaliacoes.find((a: { status: string }) => a.status === "aplicada");
                    if (aplicada) {
                        const analise = aplicada.resultados?.analise;
                        if (analise) {
                            const globalNivel = analise.nivel ?? aplicada.nivel_omnisfera_identificado ?? null;
                            if (globalNivel !== null) {
                                setDiagBaseline({
                                    nivel: globalNivel,
                                    score: analise.score ?? 0,
                                    disciplina: aplicada.disciplina,
                                });
                            }

                            // Map hab_dominadas/hab_desenvolvimento to BNCC codes
                            const habDomSet: Set<string> = new Set((analise.hab_dominadas || []).map((h: string) => h.trim().toUpperCase()));
                            const habDevSet: Set<string> = new Set((analise.hab_desenvolvimento || []).map((h: string) => h.trim().toUpperCase()));

                            mapped = mapped.map(h => {
                                const code = h.codigo_bncc.trim().toUpperCase();
                                // Exact match or prefix match (EF06MA01 matches EF06MA01H)
                                const isDominada = habDomSet.has(code) || [...habDomSet].some((d: string) => code.startsWith(d) || d.startsWith(code));
                                const isDesenvolvimento = habDevSet.has(code) || [...habDevSet].some((d: string) => code.startsWith(d) || d.startsWith(code));

                                let nivel_anterior: NivelOmnisfera | null = null;
                                if (isDominada) {
                                    nivel_anterior = (globalNivel !== null && globalNivel >= 3 ? globalNivel : 3) as NivelOmnisfera;
                                } else if (isDesenvolvimento) {
                                    nivel_anterior = (globalNivel !== null && globalNivel <= 1 ? globalNivel : 1) as NivelOmnisfera;
                                } else if (globalNivel !== null) {
                                    // For skills not explicitly categorized, use global level as baseline
                                    nivel_anterior = globalNivel as NivelOmnisfera;
                                }

                                return { ...h, nivel_anterior };
                            });
                        }
                    }
                } catch { /* diagnostic fetch failed, proceed without baseline */ }

                setHabilidades(mapped);
                setHabSource(data.source || "");
            } else {
                setHabilidades([]);
                setHabSource("none");
            }
        } catch { /* expected fallback */
            setHabilidades([]);
            setHabSource("error");
        }
    }, []);

    // ─── Navigation handlers ────────────────────────────────────────────

    const openProcessual = useCallback((aluno: Aluno, disciplina: string) => {
        setSelectedAluno(aluno);
        setSelectedDisc(disciplina);
        setHabilidades([]);
        setObservacaoGeral("");
        setSalvou(false);

        // Load existing registro for current periodo
        loadRegistro(aluno.id, disciplina, selectedPeriodo);
        // Load habilidades
        loadHabilidades(aluno, disciplina);
        // Load evolution
        fetch(`/api/avaliacao-processual/evolucao?studentId=${aluno.id}&disciplina=${encodeURIComponent(disciplina)}`)
            .then(r => r.json())
            .then(data => { if (data.evolucao) setEvolucao(data.evolucao); })
            .catch(() => { });
    }, [selectedPeriodo, loadRegistro, loadHabilidades]);

    const goBack = () => {
        setSelectedAluno(null);
        setSelectedDisc(null);
        setHabilidades([]);
        setObservacaoGeral("");
        setSalvou(false);
        setEvolucao([]);
        setShowEvolucao(false);
        setRelatorio(null);
        setShowRelatorio(false);
        setDiagBaseline(null);
    };

    // Update nivel for a habilidade
    const setNivel = (idx: number, nivel: NivelOmnisfera) => {
        setHabilidades(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], nivel_atual: nivel };
            return updated;
        });
    };

    // Update observacao for a habilidade
    const setObsHab = (idx: number, obs: string) => {
        setHabilidades(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], observacao: obs };
            return updated;
        });
    };

    // ─── Save ───────────────────────────────────────────────────────────

    const salvar = async () => {
        if (!selectedAluno || !selectedDisc) return;
        setSalvando(true);
        setSalvou(false);

        try {
            const res = await fetch("/api/avaliacao-processual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: selectedAluno.id,
                    disciplina: selectedDisc,
                    bimestre: selectedPeriodo,
                    tipo_periodo: tipoPeriodo,
                    ano_letivo: new Date().getFullYear(),
                    habilidades: habilidades.map(h => ({
                        codigo_bncc: h.codigo_bncc,
                        descricao: h.descricao,
                        nivel_atual: h.nivel_atual,
                        nivel_anterior: h.nivel_anterior,
                        observacao: h.observacao,
                    })),
                    observacao_geral: observacaoGeral,
                }),
            });

            if (!res.ok) throw new Error("Erro ao salvar");
            setSalvou(true);
            setTimeout(() => setSalvou(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar");
        } finally { setSalvando(false); }
    };

    // ─── Generate report ──────────────────────────────────────────────

    const gerarRelatorio = async () => {
        if (!selectedAluno || !selectedDisc || evolucao.length === 0) return;
        setGerandoRelatorio(true);
        setShowRelatorio(true);
        try {
            const evo = evolucao.find(e => e.disciplina === selectedDisc) || evolucao[0];
            const res = await fetch("/api/avaliacao-processual/gerar-relatorio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: selectedAluno.name,
                    serie: selectedAluno.grade,
                    diagnostico: selectedAluno.diagnostico,
                    disciplina: selectedDisc,
                    tipo_periodo: tipoPeriodo,
                    periodos: evo.periodos.map(p => ({
                        bimestre: p.bimestre,
                        media_nivel: p.media_nivel,
                    })),
                }),
            });
            const data = await res.json();
            if (data.relatorio) setRelatorio(data.relatorio);
        } catch (err) {
            /* client-side */ console.error("Erro ao gerar relatório:", err);
        } finally { setGerandoRelatorio(false); }
    };

    // ─── Loading ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="p-15 text-center">
                <OmniLoader variant="card" />
                <p className="text-(--omni-text-muted) text-sm mt-4">Carregando estudantes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10">
                <div className="flex items-center gap-2 text-red-400 mb-3">
                    <AlertTriangle size={20} /> <span className="font-semibold">{error}</span>
                </div>
                <button onClick={() => { setError(""); fetchAlunos(); }}
                    className="px-4 py-2 rounded-lg border border-(--omni-border-default) bg-transparent text-(--omni-text-primary) cursor-pointer omni-body"
                >Tentar novamente</button>
            </div>
        );
    }

    // ─── Registro View (student + discipline selected) ──────────────────

    if (selectedAluno && selectedDisc) {
        const mediaHabs = habilidades.length > 0
            ? Math.round(habilidades.reduce((acc, h) => acc + h.nivel_atual, 0) / habilidades.length * 10) / 10
            : 0;

        return (
            <div className="w-full">
                {/* Overlay: ícone girando + motor trabalhando (igual Hub / Diagnóstica) */}
                {(salvando || gerandoRelatorio || gerandoIntegrado) && (
                    <OmniLoader
                        engine={salvando ? "green" : "red"}
                        variant="overlay"
                        module="processual"
                    />
                )}

                {/* Breadcrumb */}
                <div className="flex items-center gap-2.5 mb-5 px-4 py-3 rounded-xl bg-(--omni-bg-secondary) border border-(--omni-border-default)">
                    <button onClick={goBack} className="flex items-center p-1.5 rounded-lg border-none bg-emerald-500/10 text-emerald-400 cursor-pointer">
                        <ArrowLeft size={16} />
                    </button>
                    <span className="omni-body text-(--omni-text-muted)">
                        {selectedAluno.name} <span className="mx-1.5 opacity-50">›</span>
                        <strong className="text-(--omni-text-primary)">{selectedDisc}</strong>
                    </span>
                </div>

                {/* Header */}
                <div className="bg-linear-to-br from-emerald-600 to-emerald-500 rounded-xl px-6 py-5 text-white mb-5">
                    <div className="flex items-center gap-2.5 mb-2">
                        <Activity size={22} />
                        <h2 className="m-0 text-lg font-bold">
                            Avaliação Processual — {selectedDisc}
                        </h2>
                    </div>
                    <p className="m-0 omni-body opacity-85">
                        Registre o nível Omnisfera atual do estudante em cada habilidade.
                    </p>
                </div>

                {/* Tipo de período */}
                <div className="flex gap-1.5 mb-2.5 p-1 rounded-xl bg-() border border-()">
                    {(["bimestral", "trimestral", "semestral"] as TipoPeriodo[]).map(tipo => (
                        <button
                            key={tipo}
                            onClick={() => {
                                setTipoPeriodo(tipo);
                                setSelectedPeriodo(1);
                                loadRegistro(selectedAluno.id, selectedDisc, 1);
                            }}
                            className={`flex-1 px-2.5 py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold border-none transition-all ${tipoPeriodo === tipo ? 'bg-emerald-500/10 text-emerald-500' : 'bg-transparent text-()'}`}
                        >
                            {PERIODOS[tipo].label}
                        </button>
                    ))}
                </div>

                {/* Período selector */}
                <div className="flex gap-1.5 mb-5 p-1 rounded-xl bg-() border border-()">
                    {PERIODOS[tipoPeriodo].periodos.map(p => (
                        <button
                            key={p.value}
                            onClick={() => {
                                setSelectedPeriodo(p.value);
                                loadRegistro(selectedAluno.id, selectedDisc, p.value);
                            }}
                            className={`flex-1 px-3 py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer omni-body font-bold border-none transition-all ${selectedPeriodo === p.value ? 'bg-linear-to-br from-emerald-600 to-emerald-500 text-white' : 'bg-transparent text-()'}`}
                        >
                            <Calendar size={13} /> {p.label}
                        </button>
                    ))}
                </div>

                {/* Summary card */}
                <div className={`grid gap-3 mb-5 ${diagBaseline ? 'grid-cols-4' : 'grid-cols-3'}`}>
                    <div className={`${cardS} p-4 text-center bg-emerald-500/5`}>
                        <div className="text-2xl font-extrabold text-emerald-500">{mediaHabs}</div>
                        <div className="text-xs text-()">Média Omnisfera</div>
                        {diagBaseline && (
                            <div className={`omni-label-xs font-bold mt-1 ${mediaHabs > diagBaseline.nivel ? 'text-emerald-500' : mediaHabs < diagBaseline.nivel ? 'text-red-500' : 'text-slate-400'}`}>
                                {mediaHabs > diagBaseline.nivel ? "↗️ Progresso" : mediaHabs < diagBaseline.nivel ? "↘️ Atenção" : "→ Estável"}
                            </div>
                        )}
                    </div>
                    {diagBaseline && (
                        <div className={`${cardS} p-4 text-center bg-sky-500/5`}>
                            <div className="text-2xl font-extrabold text-sky-500">N{diagBaseline.nivel}</div>
                            <div className="text-xs text-()">Baseline Diag.</div>
                            <div className="omni-label-xs text-() mt-0.5">{diagBaseline.score}% score</div>
                        </div>
                    )}
                    <div className={`${cardS} p-4 text-center bg-blue-500/5`}>
                        <div className="text-2xl font-extrabold text-blue-500">{habilidades.length}</div>
                        <div className="text-xs text-()">Habilidades</div>
                    </div>
                    <div className={`${cardS} p-4 text-center bg-indigo-500/5`}>
                        <div className="text-2xl font-extrabold text-indigo-400">{selectedPeriodo}º</div>
                        <div className="text-xs text-()">{PERIODOS[tipoPeriodo].label.slice(0, -1)}</div>
                    </div>
                </div>

                {/* Evolution chart */}
                {evolucao.length > 0 && evolucao[0].periodos.length > 0 && (
                    <div className={`${cardS} mb-5`}>
                        <button
                            onClick={() => setShowEvolucao(!showEvolucao)}
                            className={`${headerS} w-full cursor-pointer justify-between border-none bg-indigo-500/5`}
                        >
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-indigo-400" />
                                <span className="font-bold text-sm text-indigo-400">Evolução ao Longo do Tempo</span>
                                {evolucao[0].tendencia && (
                                    <span className={`omni-label-xs font-semibold px-2 py-0.5 rounded-md ${evolucao[0].tendencia === "melhora" ? "bg-emerald-500/10 text-emerald-500" :
                                        evolucao[0].tendencia === "regressao" ? "bg-red-500/10 text-red-500" :
                                            "bg-slate-500/10 text-slate-400"
                                        }`}>
                                        {evolucao[0].tendencia === "melhora" ? "↗ Progresso" : evolucao[0].tendencia === "regressao" ? "↘ Atenção" : "→ Estável"}
                                    </span>
                                )}
                            </div>
                            {showEvolucao ? <ChevronUp size={14} className="text-indigo-400" /> : <ChevronDown size={14} className="text-indigo-400" />}
                        </button>
                        {showEvolucao && (
                            <div className={bodyS}>
                                {evolucao.map(evo => (
                                    <div key={evo.disciplina} className="mb-4">
                                        <div className="text-xs font-semibold text-() mb-2.5">
                                            {evo.disciplina}
                                        </div>
                                        <div className="flex items-end gap-2 h-[100px] px-1">
                                            {evo.periodos.map((p, i) => {
                                                const val = p.media_nivel ?? 0;
                                                const height = Math.max((val / 4) * 80, 4);
                                                const nc = val >= 3 ? "#10b981" : val >= 2 ? "#3b82f6" : val >= 1 ? "#fbbf24" : "#f87171";
                                                return (
                                                    <div key={p.bimestre} className="flex-1 flex flex-col items-center gap-1">
                                                        <span className="text-xs font-bold" style={{ color: nc }}>{val}</span>
                                                        <div style={{
                                                            width: "100%", maxWidth: 40, height, borderRadius: 6,
                                                            background: `linear-gradient(180deg, ${nc}, ${nc}88)`,
                                                            transition: "height .3s ease",
                                                        }} />
                                                        <span className="omni-label-xs text-() text-center">
                                                            {p.bimestre}º
                                                        </span>
                                                        {i > 0 && evo.periodos[i - 1].media_nivel !== null && p.media_nivel !== null && (
                                                            <span className={`omni-label-xs font-bold ${(p.media_nivel ?? 0) > (evo.periodos[i - 1].media_nivel ?? 0) ? "text-emerald-500" :
                                                                (p.media_nivel ?? 0) < (evo.periodos[i - 1].media_nivel ?? 0) ? "text-red-500" :
                                                                    "text-slate-400"
                                                                }`}>
                                                                {(p.media_nivel ?? 0) > (evo.periodos[i - 1].media_nivel ?? 0) ? "▲" : (p.media_nivel ?? 0) < (evo.periodos[i - 1].media_nivel ?? 0) ? "▼" : "="}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Scale reference */}
                                        <div className="flex justify-between mt-1.5 px-1">
                                            {[0, 1, 2, 3, 4].map(n => (
                                                <span key={n} className="omni-label-xs text-() opacity-50">N{n}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Diagnóstica baseline context */}
                {diagBaseline && (
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg mb-3 bg-sky-500/5 border border-sky-500/15">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-linear-to-br from-sky-600 to-sky-500 text-white omni-body font-extrabold shrink-0">
                            {diagBaseline.nivel}
                        </div>
                        <div className="text-xs text-()">
                            Linha de base <strong>Diagnóstica</strong> ({diagBaseline.disciplina}): Nível {diagBaseline.nivel} · {diagBaseline.score}% score
                        </div>
                        <div className={`ml-auto omni-label-xs font-bold ${mediaHabs > diagBaseline.nivel ? 'text-emerald-500' : mediaHabs < diagBaseline.nivel ? 'text-red-500' : 'text-slate-400'}`}>
                            {mediaHabs > diagBaseline.nivel ? "↗️ Progrediu" : mediaHabs < diagBaseline.nivel ? "↘️ Regrediu" : "→ Mesma faixa"}
                        </div>
                    </div>
                )}

                {/* Habilidades list */}
                <div className={`${cardS} mb-5`}>
                    <div className={`${headerS} bg-emerald-500/5`}>
                        <BookOpen size={16} className="text-emerald-500" />
                        <span className="font-bold text-sm text-emerald-500">
                            {habSource === "plano_curso_professor" ? "Habilidades do Plano de Curso" :
                                habSource === "matriz_referencia" ? "Habilidades da Matriz de Referência" :
                                    "Habilidades BNCC"}
                        </span>
                        <span className="text-xs text-() ml-auto">
                            Avalie cada habilidade na escala 0-4
                        </span>
                    </div>
                    <div className={bodyS}>
                        {habilidades.map((hab, idx) => {
                            const colors = NIVEL_COLORS[hab.nivel_atual] || NIVEL_COLORS[0];
                            const expanded = expandedHab === hab.codigo_bncc;
                            return (
                                <div key={hab.codigo_bncc + idx} className="px-3.5 py-3 rounded-lg mb-2 transition-all" style={{ border: `1px solid ${colors.border}`, background: colors.bg }}>
                                    <div className="flex items-start justify-between gap-2.5">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="omni-label-xs font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 shrink-0">
                                                    {hab.codigo_bncc}
                                                </span>
                                                {hab.nivel_anterior !== null && hab.nivel_anterior !== hab.nivel_atual && (
                                                    <span className={`omni-label-xs font-semibold flex items-center gap-0.5 shrink-0 ${hab.nivel_atual > hab.nivel_anterior ? 'text-emerald-500' : 'text-red-400'}`}>
                                                        <TrendingUp size={10} />
                                                        {hab.nivel_anterior} → {hab.nivel_atual}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="omni-body text-() leading-relaxed">
                                                {hab.descricao}
                                            </div>
                                        </div>

                                        {/* Nivel buttons */}
                                        <div className="flex gap-1 shrink-0">
                                            {([0, 1, 2, 3, 4] as NivelOmnisfera[]).map(n => {
                                                const nc = NIVEL_COLORS[n];
                                                const selected = hab.nivel_atual === n;
                                                return (
                                                    <button
                                                        key={n}
                                                        onClick={() => setNivel(idx, n)}
                                                        title={ESCALA_OMNISFERA[n]?.label}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer omni-body font-extrabold transition-all border ${selected ? 'border-transparent' : 'border-() bg-transparent text-()'}`}
                                                        style={selected ? { background: nc.bg, color: nc.text, border: `2px solid ${nc.text}` } : {}}
                                                    >
                                                        {n}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setExpandedHab(expanded ? null : hab.codigo_bncc)}
                                            className="flex items-center p-1 border-none bg-transparent text-() cursor-pointer shrink-0"
                                        >
                                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </div>

                                    {/* Expanded observation */}
                                    {expanded && (
                                        <div className="mt-2.5">
                                            {/* Rubrica guide */}
                                            <RubricaOmnisfera
                                                nivelAtual={hab.nivel_atual}
                                                onSelect={(n) => setNivel(idx, n)}
                                                compact
                                            />
                                            <div className="text-xs font-semibold text-() mb-1 mt-2.5">
                                                Observação do professor:
                                            </div>
                                            <textarea
                                                value={hab.observacao}
                                                onChange={(e) => setObsHab(idx, e.target.value)}
                                                placeholder="Descreva o que observou..."
                                                rows={2}
                                                className="w-full px-2.5 py-2 rounded-lg border border-() bg-() text-() text-xs resize-y font-inherit"
                                            />
                                            <div className="omni-label-xs text-() mt-1 flex items-center gap-1">
                                                <BarChart3 size={10} />
                                                {ESCALA_OMNISFERA[hab.nivel_atual]?.label} — {ESCALA_OMNISFERA[hab.nivel_atual]?.descricao}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Observação geral */}
                <div className={`${cardS} mb-5`}>
                    <div className={headerS}>
                        <Activity size={16} className="text-()" />
                        <span className="font-bold text-sm text-()">Observação Geral</span>
                    </div>
                    <div className={bodyS}>
                        <textarea
                            value={observacaoGeral}
                            onChange={(e) => setObservacaoGeral(e.target.value)}
                            placeholder={`Percepções gerais sobre o estudante neste ${PERIODOS[tipoPeriodo].label.toLowerCase().slice(0, -1)}...`}
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-lg border border-() bg-() text-() omni-body resize-y font-inherit"
                        />
                    </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end gap-3">
                    {salvou && (
                        <div className="flex items-center gap-1.5 text-emerald-500 omni-body font-semibold">
                            ✓ Salvo com sucesso
                        </div>
                    )}
                    <button
                        onClick={salvar}
                        disabled={salvando || habilidades.length === 0}
                        className={`px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer text-sm font-bold border-none transition-all ${salvando ? 'bg-() cursor-not-allowed' : 'bg-linear-to-br from-emerald-600 to-emerald-500'} text-white ${habilidades.length === 0 ? 'opacity-50' : 'opacity-100'}`}
                    >
                        {salvando ? <OmniLoader engine="green" size={16} /> : <Save size={16} />}
                        {salvando ? "Salvando..." : "Salvar Avaliação"}
                    </button>

                    {/* Generate Report button */}
                    {evolucao.length > 0 && evolucao[0]?.periodos?.length > 1 && (
                        <button
                            onClick={gerarRelatorio}
                            disabled={gerandoRelatorio}
                            className={`px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer text-sm font-bold border-none transition-all shadow-[0_4px_16px_rgba(168,85,247,0.2)] text-white ${gerandoRelatorio ? 'bg-() cursor-not-allowed' : 'bg-linear-to-br from-purple-600 to-purple-500'}`}
                        >
                            {gerandoRelatorio ? <OmniLoader engine="red" size={16} /> : <FileText size={16} />}
                            {gerandoRelatorio ? "Gerando..." : "Gerar Relatório IA"}
                        </button>
                    )}

                    {/* Integrated Report button */}
                    <button
                        onClick={async () => {
                            if (relatorioIntegrado) { setShowIntegrado(!showIntegrado); return; }
                            if (!selectedAluno || !selectedDisc) return;
                            setGerandoIntegrado(true);
                            try {
                                const res = await fetch(
                                    `/api/avaliacao-processual/relatorio-integrado?student_id=${selectedAluno.id}&disciplina=${encodeURIComponent(selectedDisc)}`
                                );
                                const data = await res.json();
                                setRelatorioIntegrado(data);
                                setShowIntegrado(true);
                            } catch { /* silent */ }
                            setGerandoIntegrado(false);
                        }}
                        disabled={gerandoIntegrado}
                        className={`px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer text-sm font-bold border-none transition-all text-white ${gerandoIntegrado ? 'bg-() cursor-not-allowed' : 'bg-linear-to-br from-sky-500 to-sky-400'}`}
                    >
                        {gerandoIntegrado ? <OmniLoader engine="red" size={16} /> : <BarChart3 size={16} />}
                        {gerandoIntegrado ? "Carregando..." : relatorioIntegrado ? (showIntegrado ? "Ocultar Integrado" : "Ver Integrado") : "Relatório Integrado"}
                    </button>
                </div>

                {/* AI Report output */}
                {relatorio && showRelatorio && (
                    <div className={`${cardS} mt-5 border-[1.5px] border-purple-500/20`}>
                        <button
                            onClick={() => setShowRelatorio(!showRelatorio)}
                            className={`${headerS} w-full cursor-pointer justify-between border-none bg-purple-500/5`}
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-500" />
                                <span className="font-bold text-sm text-purple-500">
                                    {String(relatorio.titulo || "Relatório de Evolução")}
                                </span>
                                {Boolean(relatorio.tendencia_geral) && (
                                    <span className={`omni-label-xs font-semibold px-2 py-0.5 rounded-md ${relatorio.tendencia_geral === "melhora" ? "bg-emerald-500/10 text-emerald-500" :
                                        relatorio.tendencia_geral === "regressao" ? "bg-red-500/10 text-red-500" :
                                            "bg-slate-500/10 text-slate-400"
                                        }`}>
                                        {relatorio.tendencia_geral === "melhora" ? "↗ Melhora" : relatorio.tendencia_geral === "regressao" ? "↘ Atenção" : "→ Estável"}
                                    </span>
                                )}
                            </div>
                            <ChevronUp size={14} className="text-purple-500" />
                        </button>
                        <div className={bodyS}>
                            {Boolean(relatorio.periodo_analisado) && (
                                <div className="text-xs text-() mb-2">
                                    Período: {String(relatorio.periodo_analisado)}
                                </div>
                            )}
                            {Boolean(relatorio.resumo_evolucao) && (
                                <p className="omni-body text-() leading-relaxed mt-0 mb-3.5">
                                    {String(relatorio.resumo_evolucao)}
                                </p>
                            )}

                            {/* Pontos de destaque */}
                            {Array.isArray(relatorio.pontos_destaque) && (relatorio.pontos_destaque as Array<{ tipo: string; texto: string }>).length > 0 && (
                                <div className="flex flex-col gap-1.5 mb-3.5">
                                    {(relatorio.pontos_destaque as Array<{ tipo: string; texto: string }>).map((p, i) => (
                                        <div key={i} className={`px-3 py-2 rounded-lg text-xs text-() border ${p.tipo === "positivo" ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/10"}`}>
                                            {p.tipo === "positivo" ? "✅" : "⚠️"} {p.texto}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Ações sugeridas */}
                            {Array.isArray(relatorio.acoes_sugeridas) && (relatorio.acoes_sugeridas as Array<{ acao: string; justificativa: string; prioridade: string }>).length > 0 && (
                                <div className="mb-3.5">
                                    <div className="text-xs font-bold text-purple-500 mb-2">🎯 Ações Sugeridas</div>
                                    {(relatorio.acoes_sugeridas as Array<{ acao: string; justificativa: string; prioridade: string }>).map((a, i) => (
                                        <div key={i} className="px-3.5 py-2.5 rounded-lg mb-1.5 bg-() border border-()">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className={`omni-label-xs font-bold px-1.5 py-px rounded uppercase ${a.prioridade === "alta" ? "bg-red-500/10 text-red-400" : a.prioridade === "media" ? "bg-amber-500/10 text-amber-400" : "bg-slate-500/10 text-slate-400"}`}>
                                                    {a.prioridade}
                                                </span>
                                            </div>
                                            <div className="text-xs font-semibold text-() mb-0.5">{a.acao}</div>
                                            <div className="text-xs text-()">{a.justificativa}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Nota para PEI */}
                            {Boolean(relatorio.nota_para_pei) && (
                                <div className="px-3.5 py-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-400">
                                    📝 <strong>Nota para o PEI:</strong> {String(relatorio.nota_para_pei)}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Integrated Report Panel ──────────────────────────────── */}
                {relatorioIntegrado && showIntegrado && (
                    <div id="relatorio-integrado-print" className={`${cardS} mt-5 border-[1.5px] border-sky-500/20`}>
                        <div className={`${headerS} justify-between bg-sky-500/5`}>
                            <div className="flex items-center gap-2">
                                <BarChart3 size={16} className="text-sky-500" />
                                <span className="font-bold text-sm text-sky-500">Relatório Integrado — Diagnóstica + Processual</span>
                            </div>
                            <button
                                onClick={() => {
                                    const el = document.getElementById("relatorio-integrado-print");
                                    if (!el) return;
                                    const w = window.open("", "_blank");
                                    if (!w) return;
                                    w.document.write(`<html><head><title>Relatório Integrado</title><style>
                                        body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; }
                                        h2 { color: #0ea5e9; margin: 0 0 16px; }
                                        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                                        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
                                        th { background: #f1f5f9; font-weight: 700; }
                                        .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
                                        .melhora { background: #dcfce7; color: #15803d; }
                                        .regressao { background: #fee2e2; color: #dc2626; }
                                        .estavel { background: #f1f5f9; color: #64748b; }
                                        .alert { padding: 10px 14px; border-radius: 8px; background: #fef3c7; border: 1px solid #fde68a; margin: 8px 0; font-size: 12px; }
                                        @media print { body { padding: 20px; } }
                                    </style></head><body>`);
                                    w.document.write(`<h2>Relatório Integrado — ${selectedAluno?.name} · ${selectedDisc}</h2>`);
                                    w.document.write(`<p style="color:#64748b;font-size:12px;">Gerado em ${new Date().toLocaleDateString("pt-BR")} · ${selectedAluno?.grade}</p>`);

                                    // Baseline
                                    const bl = relatorioIntegrado.diagnostico_baseline;
                                    if (bl?.nivel_omnisfera != null) {
                                        w.document.write(`<h3>📊 Linha de Base (Diagnóstica)</h3>`);
                                        w.document.write(`<p>Nível Omnisfera identificado: <strong>${bl.nivel_omnisfera}</strong> — ${bl.status}</p>`);
                                    }

                                    // Evolution table
                                    const evs = relatorioIntegrado.evolucao_por_habilidade || [];
                                    if (evs.length > 0) {
                                        w.document.write(`<h3>📈 Evolução por Habilidade</h3>`);
                                        w.document.write(`<table><tr><th>Habilidade</th><th>Inicial</th><th>Atual</th><th>Δ</th><th>Tendência</th></tr>`);
                                        for (const e of evs) {
                                            const cls = e.tendencia === "melhora" ? "melhora" : e.tendencia === "regressao" ? "regressao" : "estavel";
                                            w.document.write(`<tr><td>${e.codigo}<br/><small>${e.descricao.slice(0, 80)}</small></td><td>${e.nivel_inicial}</td><td>${e.nivel_atual}</td><td>${e.delta > 0 ? "+" : ""}${e.delta}</td><td><span class="badge ${cls}">${e.tendencia}</span></td></tr>`);
                                        }
                                        w.document.write(`</table>`);
                                    }

                                    // Alerts
                                    const alerts = relatorioIntegrado.alertas_regressao || [];
                                    if (alerts.length > 0) {
                                        w.document.write(`<h3>⚠️ Alertas de Regressão</h3>`);
                                        for (const a of alerts) {
                                            w.document.write(`<div class="alert">⚠️ <strong>${a.codigo}</strong>: regrediu de ${a.de} para ${a.para} (${a.descricao_nivel})</div>`);
                                        }
                                    }

                                    w.document.write(`</body></html>`);
                                    w.document.close();
                                    setTimeout(() => w.print(), 300);
                                }}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-sky-500/30 bg-sky-500/10 text-sky-500 flex items-center gap-1"
                            >
                                <Printer size={12} /> Exportar PDF
                            </button>
                        </div>
                        <div className={bodyS}>
                            {/* Diagnóstica baseline */}
                            {relatorioIntegrado.diagnostico_baseline?.nivel_omnisfera != null && (
                                <div className="px-4 py-3 rounded-xl mb-3.5 bg-sky-500/5 border border-sky-500/15 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-linear-to-br from-sky-600 to-sky-500 text-white text-lg font-extrabold shrink-0">
                                        {relatorioIntegrado.diagnostico_baseline.nivel_omnisfera}
                                    </div>
                                    <div>
                                        <div className="omni-body font-bold text-sky-500">
                                            Linha de Base — Nível {relatorioIntegrado.diagnostico_baseline.nivel_omnisfera}
                                        </div>
                                        <div className="text-xs text-() mt-0.5">
                                            Via Diagnóstica · {relatorioIntegrado.diagnostico_baseline.status}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Overall trend */}
                            <div className="flex gap-3 mb-3.5 flex-wrap">
                                <div className={`flex-1 min-w-[120px] px-3.5 py-2.5 rounded-xl text-center border
                                    ${relatorioIntegrado.tendencia_geral === "melhora" ? "bg-emerald-500/5 border-emerald-500/20" :
                                        relatorioIntegrado.tendencia_geral === "regressao" ? "bg-red-500/5 border-red-500/20" :
                                            "bg-slate-500/5 border-slate-500/15"}`}>
                                    <div className={`text-[22px] font-extrabold ${relatorioIntegrado.tendencia_geral === "melhora" ? "text-emerald-500" :
                                        relatorioIntegrado.tendencia_geral === "regressao" ? "text-red-500" : "text-slate-400"}`}>
                                        {relatorioIntegrado.tendencia_geral === "melhora" ? "↗" : relatorioIntegrado.tendencia_geral === "regressao" ? "↘" : "→"}
                                    </div>
                                    <div className="text-xs font-semibold text-() mt-0.5">Tendência Geral</div>
                                </div>
                                <div className="flex-1 min-w-[120px] px-3.5 py-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-center">
                                    <div className="text-[22px] font-extrabold text-indigo-500">{relatorioIntegrado.registros_processual || 0}</div>
                                    <div className="text-xs font-semibold text-() mt-0.5">Registros</div>
                                </div>
                                <div className="flex-1 min-w-[120px] px-3.5 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center">
                                    <div className="text-[22px] font-extrabold text-amber-500">{(relatorioIntegrado.alertas_regressao || []).length}</div>
                                    <div className="text-xs font-semibold text-() mt-0.5">Alertas</div>
                                </div>
                            </div>

                            {/* Evolution per habilidade */}
                            {(relatorioIntegrado.evolucao_por_habilidade || []).length > 0 && (
                                <div className="mb-3.5">
                                    <div className="text-xs font-bold text-sky-500 mb-2">📈 Evolução por Habilidade</div>
                                    {(relatorioIntegrado.evolucao_por_habilidade as Array<{ codigo: string; descricao: string; nivel_inicial: number; nivel_atual: number; delta: number; tendencia: string }>).map((e, i) => (
                                        <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 border ${e.tendencia === "regressao" ? "bg-red-500/5 border-red-500/10" : "bg-transparent border-()"}`}>
                                            <span className="omni-label-xs font-bold px-1.5 py-px rounded bg-indigo-500/10 text-indigo-400 shrink-0">{e.codigo}</span>
                                            <span className="flex-1 text-xs text-() py-0.5 line-clamp-1">{e.descricao}</span>
                                            <span className="text-xs text-() shrink-0">{e.nivel_inicial} → {e.nivel_atual}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md shrink-0
                                                ${e.tendencia === "melhora" ? "bg-emerald-500/10 text-emerald-500" :
                                                    e.tendencia === "regressao" ? "bg-red-500/10 text-red-500" :
                                                        "bg-slate-500/10 text-slate-400"}`}>
                                                {e.delta > 0 ? `+${e.delta}` : e.delta}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Regression alerts */}
                            {(relatorioIntegrado.alertas_regressao || []).length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-amber-500 mb-2">⚠️ Alertas de Regressão</div>
                                    {(relatorioIntegrado.alertas_regressao as Array<{ codigo: string; descricao: string; de: number; para: number; descricao_nivel: string }>).map((a, i) => (
                                        <div key={i} className="px-3.5 py-2.5 rounded-xl mb-1.5 bg-amber-500/5 border border-amber-500/15 text-xs text-()">
                                            ⚠️ <strong>{a.codigo}</strong>: nível {a.de} → {a.para} ({a.descricao_nivel})
                                            <div className="text-xs text-() mt-0.5 py-0.5 line-clamp-1">{a.descricao}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── Student List ───────────────────────────────────────────────────

    return (
        <div>
            {/* Onboarding Panel */}
            {showOnboarding && (
                <OnboardingPanel
                    moduleKey="processual"
                    moduleTitle="Bem-vindo à Avaliação Processual"
                    moduleSubtitle="Acompanhe a evolução do estudante ao longo dos períodos"
                    accentColor="#059669"
                    accentColorLight="#10b981"
                    steps={[
                        { icon: <Users size={22} />, title: "Selecionar", description: "Estudante + disciplina + período" },
                        { icon: <Activity size={22} />, title: "Avaliar", description: "Nível 0-4 em cada habilidade BNCC" },
                        { icon: <Save size={22} />, title: "Salvar", description: "Registrar avaliação do período" },
                        { icon: <TrendingUp size={22} />, title: "Evolução", description: "Ver gráfico e relatório IA" },
                    ]}
                    onStart={() => setShowOnboarding(false)}
                />
            )}

            {/* Page header — unified PageHero */}
            <PageHero
                route="/avaliacao-processual"
                title="Avaliação Processual"
                desc={`${professorName} · ${alunos.length} estudante${alunos.length !== 1 ? "s" : ""}`}
            />

            {/* Link to Diagnóstica */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-5 bg-blue-500/5 border border-blue-500/15">
                <span className="text-xs text-()">
                    📋 Precisa fazer a avaliação diagnóstica inicial?
                </span>
                <a href="/avaliacao-diagnostica" className="text-xs font-bold text-blue-500 no-underline hover:underline">
                    Ir para Diagnóstica →
                </a>
            </div>

            {/* Empty state */}
            {alunos.length === 0 && (
                <div className={`${cardS} text-center px-5 py-10`}>
                    <Users size={48} className="mx-auto mb-3 text-() opacity-30" />
                    <h3 className="m-0 mb-1.5 text-[15px] font-bold text-()">
                        Nenhum estudante encontrado
                    </h3>
                    <p className="m-0 omni-body text-()">
                        Estudantes em Fase 2 do PEI aparecerão aqui.
                    </p>
                </div>
            )}

            {/* Student cards */}
            <div className="flex flex-col gap-3">
                {alunos.map(aluno => (
                    <div key={aluno.id} className={cardS}>
                        <div className={`${headerS} justify-between`}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-linear-to-br from-emerald-600 to-emerald-500 text-white text-xs font-extrabold">
                                    {aluno.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-()">
                                        {aluno.name}
                                    </div>
                                    <div className="text-xs text-()">
                                        {aluno.grade} {aluno.class_group && `— ${aluno.class_group}`}
                                        {aluno.diagnostico && ` · ${aluno.diagnostico}`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Discipline buttons */}
                        <div className={`${bodyS} flex flex-wrap gap-2 pt-3`}>
                            {aluno.disciplinas.map(disc => (
                                <button
                                    key={disc.id}
                                    onClick={() => openProcessual(aluno, disc.disciplina)}
                                    className="px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer omni-body font-semibold border border-() bg-() text-() transition-all hover:bg-()"
                                >
                                    <Activity size={14} />
                                    {disc.disciplina}
                                    {disc.nivel_omnisfera !== null && (
                                        <span className="omni-label-xs font-extrabold px-1.5 py-px rounded bg-emerald-500/10 text-emerald-500">
                                            N{disc.nivel_omnisfera}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
