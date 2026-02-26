"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RubricaOmnisfera } from "@/components/RubricaOmnisfera";
import { ProvaImprimivel } from "@/components/ProvaImprimivel";
import {
    Brain, Loader2, CheckCircle2, AlertTriangle,
    ChevronDown, ChevronUp, Sparkles, ClipboardCheck,
    ArrowLeft, Users, BookOpen, Target, Zap, FileText, Layers, Activity,
    Grid3X3, BookMarked, ChevronRight, TrendingUp,
    Trash2, RefreshCw, Printer, FileDown,
} from "lucide-react";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Aluno {
    id: string;
    name: string;
    grade: string;
    class_group: string;
    diagnostico: string;
    disciplinas: {
        id: string;
        disciplina: string;
        professor_regente_nome: string;
        has_avaliacao: boolean;
        nivel_omnisfera: number | null;
        avaliacao_status: string;
    }[];
}

interface Questao {
    id: string;
    enunciado: string;
    alternativas: { A: string; B: string; C: string; D: string };
    gabarito: string;
    justificativa_pedagogica: string;
    instrucao_aplicacao_professor: string;
    contexto_visual_sugerido?: string | null;
    adaptacao_nee_aplicada?: string;
}

interface PlanoVinculado {
    id: string;
    disciplina: string;
    ano_serie: string;
    bimestre: string;
    conteudo: string | null;
    habilidades_bncc: string[] | null;
}

interface BlocoPlano {
    titulo: string;
    habilidades_bncc?: string[];
    objetivos?: string[];
    objetivos_livre?: string;
    metodologia?: string[];
    avaliacao?: string[];
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardS: React.CSSProperties = {
    borderRadius: 14, border: "1px solid var(--border-default, rgba(148,163,184,.15))",
    backgroundColor: "var(--bg-secondary, rgba(15,23,42,.4))", overflow: "hidden",
};
const headerS: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8, padding: "12px 16px",
    borderBottom: "1px solid var(--border-default, rgba(148,163,184,.1))",
    backgroundColor: "var(--bg-tertiary, rgba(15,23,42,.3))",
};
const bodyS: React.CSSProperties = { padding: 16 };

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function AvaliacaoDiagnosticaClient() {
    const [loading, setLoading] = useState(true);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [professorName, setProfessorName] = useState("");
    const [error, setError] = useState("");

    // Top-level tab: "estudantes" | "matriz" | "manual"
    const [activeTab, setActiveTab] = useState<"estudantes" | "matriz" | "manual">("estudantes");

    // Navigation
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [selectedDisc, setSelectedDisc] = useState<string | null>(null);

    // NEE guidance from planos_genericos
    const [neeAlert, setNeeAlert] = useState<string>("");
    const [instrucaoDiag, setInstrucaoDiag] = useState<string>("");

    // Avaliação state
    const [gerando, setGerando] = useState(false);
    const [questoes, setQuestoes] = useState<Questao[]>([]);
    const [avaliacaoId, setAvaliacaoId] = useState<string | null>(null);
    const [respostas, setRespostas] = useState<Record<string, string>>({});
    const [nivelIdentificado, setNivelIdentificado] = useState<number | null>(null);
    const [expandedQ, setExpandedQ] = useState<string | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [avalError, setAvalError] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [showProvaImprimivel, setShowProvaImprimivel] = useState(false);
    const [showGabarito, setShowGabarito] = useState(false);

    // Plano de ensino vinculado
    const [planoVinculado, setPlanoVinculado] = useState<PlanoVinculado | null>(null);
    const [blocosPlano, setBlocosPlano] = useState<BlocoPlano[]>([]);
    const [showMatrix, setShowMatrix] = useState(false);

    // Matrix habilidades for item creation
    const [matrizHabs, setMatrizHabs] = useState<{ habilidade: string; tema: string; descritor: string; competencia: string }[]>([]);
    const [habsSelecionadas, setHabsSelecionadas] = useState<string[]>([]);
    const [qtdQuestoes, setQtdQuestoes] = useState(4);
    const [tipoQuestao, setTipoQuestao] = useState<"Objetiva" | "Discursiva">("Objetiva");

    // ─── Camada B: Cognitivo-Funcional ───────────────────────────────────
    const [dimensoesNEE, setDimensoesNEE] = useState<Array<{
        id: string; dimensao: string; o_que_o_professor_observa: string;
        acao_pratica: string; indicadores_observaveis: string[];
        perguntas_professor: string[];
        niveis_omnisfera: Record<string, string>;
    }>>([]);
    const [dimensoesAvaliadas, setDimensoesAvaliadas] = useState<Record<string, { nivel: number; observacao: string }>>({});
    const [showCamadaB, setShowCamadaB] = useState(false);

    // ─── Outputs V3 ─────────────────────────────────────────────────────
    const [perfilGerado, setPerfilGerado] = useState<Record<string, unknown> | null>(null);
    const [estrategiasGeradas, setEstrategiasGeradas] = useState<Record<string, unknown> | null>(null);
    const [gerandoPerfil, setGerandoPerfil] = useState(false);
    const [gerandoEstrategias, setGerandoEstrategias] = useState(false);

    // ─── Processual evolution feed ─────────────────────────────────────────
    const [evolucaoProcessual, setEvolucaoProcessual] = useState<{
        disciplina: string;
        periodos: { bimestre: number; media_nivel: number | null }[];
        tendencia: string;
        media_mais_recente: number | null;
    }[]>([]);
    const [showProcessual, setShowProcessual] = useState(false);

    // ─── Fetch students ─────────────────────────────────────────────────

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

    // ─── Load NEE guidance from planos_genericos ──────────────────────────
    useEffect(() => {
        if (!selectedAluno || !selectedDisc) {
            setNeeAlert("");
            setInstrucaoDiag("");
            return;
        }
        const diag = selectedAluno.diagnostico || "";
        const grade = selectedAluno.grade || "";
        const disc = selectedDisc || "";

        (async () => {
            try {
                const url = `/api/avaliacao-diagnostica/planos-genericos?disciplina=${encodeURIComponent(disc)}&ano=${encodeURIComponent(grade)}`;
                const res = await fetch(url);
                const data = await res.json();
                const planos = data.planos || [];
                if (planos.length > 0) {
                    const plano = planos[0];
                    // Map diagnostico to NEE key
                    const neeKey = diag.includes("TEA") ? "TEA"
                        : diag.includes("DI") ? "DI"
                            : diag.includes("TDAH") || diag.includes("TA") || diag.includes("dislexia") ? "TA"
                                : diag.includes("AH") ? "AH" : "";
                    const alert = neeKey && plano.alertas_por_perfil_nee?.[neeKey];
                    setNeeAlert(alert || "");
                    setInstrucaoDiag(plano.instrucao_uso_diagnostica || "");
                } else {
                    setNeeAlert("");
                    setInstrucaoDiag("");
                }
            } catch {
                setNeeAlert("");
                setInstrucaoDiag("");
            }
        })();
    }, [selectedAluno, selectedDisc]);

    // ─── Load existing avaliação ────────────────────────────────────────

    const loadExistingAvaliacao = useCallback(async (studentId: string, disciplina: string) => {
        try {
            const res = await fetch(`/api/pei/avaliacao-diagnostica?studentId=${studentId}&disciplina=${encodeURIComponent(disciplina)}`);
            const data = await res.json();
            const avs = data.avaliacoes || [];
            if (avs.length > 0) {
                const av = avs[0];
                setAvaliacaoId(av.id);
                const qg = av.questoes_geradas;
                if (qg?.questoes) {
                    setQuestoes(qg.questoes);
                }
                if (av.resultados) setRespostas(av.resultados as Record<string, string>);
                if (av.nivel_omnisfera_identificado != null) setNivelIdentificado(av.nivel_omnisfera_identificado);
            }
        } catch { /* silent */ }
    }, []);

    // ─── Select student + discipline ────────────────────────────────────

    const openAvaliacao = useCallback((aluno: Aluno, disciplina: string) => {
        setSelectedAluno(aluno);
        setSelectedDisc(disciplina);
        setQuestoes([]);
        setRespostas({});
        setNivelIdentificado(null);
        setAvaliacaoId(null);
        setExpandedQ(null);
        setAvalError("");
        setCurrentStep(0);
        setPlanoVinculado(null);
        setBlocosPlano([]);
        setShowMatrix(false);
        setDimensoesNEE([]);
        setDimensoesAvaliadas({});
        setShowCamadaB(false);
        setPerfilGerado(null);
        setEstrategiasGeradas(null);
        loadExistingAvaliacao(aluno.id, disciplina);

        // Load processual evolution for this student+discipline
        fetch(`/api/avaliacao-processual/evolucao?studentId=${aluno.id}&disciplina=${encodeURIComponent(disciplina)}`)
            .then(r => r.json())
            .then(data => { if (data.evolucao) setEvolucaoProcessual(data.evolucao); })
            .catch(() => { });

        // Load dimensões NEE for this student's profile
        const mapDiag = (d: string) => {
            const dl = (d || "").toLowerCase();
            if (dl.includes("tea") || dl.includes("autis")) return "TEA";
            if (dl.includes("deficiência intelectual") || dl === "di") return "DI";
            if (dl.includes("altas hab") || dl.includes("superdota")) return "AH";
            if (dl.includes("dislexia") || dl.includes("tdah") || dl.includes("discalculia") || dl.includes("transtorno")) return "TA";
            return null;
        };
        const perfil = mapDiag(aluno.diagnostico);
        if (perfil) {
            fetch("/api/avaliacao-diagnostica/dimensoes-nee?perfil=" + perfil)
                .then(r => r.json())
                .then(data => {
                    if (data.dimensoes) setDimensoesNEE(data.dimensoes);
                })
                .catch(() => {
                    // Fallback: load from static JSON
                    import("@/data/dimensoes_nee.json").then(mod => {
                        const all = mod.default || mod;
                        const found = (all as Array<{ perfil: string; dimensoes: typeof dimensoesNEE }>).find(p => p.perfil === perfil);
                        if (found) setDimensoesNEE(found.dimensoes);
                    }).catch(() => { });
                });
        }

        // Fetch plano de ensino vinculado
        const serieBase = aluno.grade?.replace(/\s*\(.*\)\s*$/, "").trim() || "";
        fetch(`/api/plano-curso?componente=${encodeURIComponent(disciplina)}&serie=${encodeURIComponent(serieBase)}`)
            .then(r => r.json())
            .then(data => {
                const planos = data.planos || [];
                if (planos.length > 0) {
                    const p = planos[0];
                    setPlanoVinculado(p);
                    try {
                        const conteudo = typeof p.conteudo === "string" ? JSON.parse(p.conteudo) : p.conteudo;
                        if (conteudo?.blocos) setBlocosPlano(conteudo.blocos);
                    } catch { /* silent */ }
                }
            })
            .catch(() => { });

        // Fetch matrix habilidades for the discipline
        const discAreaMap: Record<string, string> = {
            "Matemática": "Matemática",
            "Língua Portuguesa": "Linguagens",
            "Arte": "Linguagens",
            "Educação Física": "Linguagens",
            "Língua Inglesa": "Linguagens",
            "Ciências": "Ciências da Natureza",
            "Geografia": "Ciências Humanas",
            "História": "Ciências Humanas",
            "Ensino Religioso": "Ciências Humanas",
        };
        const area = discAreaMap[disciplina] || "Linguagens";
        const gradeNum = aluno.grade?.match(/\d+/)?.[0] || "6";
        const serieName = `EF${gradeNum}`;

        fetch(`/api/avaliacao-diagnostica/matriz?area=${encodeURIComponent(area)}&serie=${serieName}`)
            .then(r => r.json())
            .then(data => {
                setMatrizHabs(data.habilidades || []);
            })
            .catch(() => { });
    }, [loadExistingAvaliacao]);

    const goBack = () => {
        setSelectedAluno(null);
        setSelectedDisc(null);
        setQuestoes([]);
        setRespostas({});
        setNivelIdentificado(null);
        setAvaliacaoId(null);
        setCurrentStep(0);
        setPlanoVinculado(null);
        setBlocosPlano([]);
        setDimensoesNEE([]);
        setDimensoesAvaliadas({});
        setShowCamadaB(false);
        setPerfilGerado(null);
        setEstrategiasGeradas(null);
        setEvolucaoProcessual([]);
        setShowProcessual(false);
    };

    // ─── Generate Perfil de Funcionamento ────────────────────────────────

    const gerarPerfil = async () => {
        if (!selectedAluno) return;
        setGerandoPerfil(true);
        try {
            const res = await fetch("/api/avaliacao-diagnostica/perfil-funcionamento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: selectedAluno.name,
                    serie: selectedAluno.grade,
                    diagnostico: selectedAluno.diagnostico || "SEM_NEE",
                    dimensoes_avaliadas: Object.entries(dimensoesAvaliadas).map(([id, val]) => {
                        const dim = dimensoesNEE.find(d => d.id === id);
                        return { dimensao: dim?.dimensao || id, nivel_observado: val.nivel, observacao: val.observacao };
                    }),
                    habilidades_curriculares: [],
                }),
            });
            const data = await res.json();
            if (data.perfil) setPerfilGerado(data.perfil as Record<string, unknown>);
        } catch (err) {
            console.error("Erro ao gerar perfil:", err);
        } finally { setGerandoPerfil(false); }
    };

    // ─── Generate Estratégias Práticas ───────────────────────────────────

    const gerarEstrategias = async () => {
        if (!selectedAluno) return;
        setGerandoEstrategias(true);
        try {
            const dimsComDificuldade = Object.entries(dimensoesAvaliadas)
                .filter(([, val]) => val.nivel <= 2)
                .map(([id, val]) => {
                    const dim = dimensoesNEE.find(d => d.id === id);
                    return { dimensao: dim?.dimensao || id, nivel: val.nivel, observacao: val.observacao };
                });

            const res = await fetch("/api/avaliacao-diagnostica/estrategias-praticas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: selectedAluno.name,
                    serie: selectedAluno.grade,
                    diagnostico: selectedAluno.diagnostico || "SEM_NEE",
                    dimensoes_com_dificuldade: dimsComDificuldade.length > 0 ? dimsComDificuldade : [
                        { dimensao: "Geral", nivel: 1, observacao: "Avaliação inicial" },
                    ],
                }),
            });
            const data = await res.json();
            if (data.estrategias) setEstrategiasGeradas(data.estrategias as Record<string, unknown>);
        } catch (err) {
            console.error("Erro ao gerar estratégias:", err);
        } finally { setGerandoEstrategias(false); }
    };

    // ─── Generate avaliação ─────────────────────────────────────────────

    const gerarAvaliacao = async () => {
        if (!selectedAluno || !selectedDisc) return;
        setGerando(true);
        setAvalError("");
        setQuestoes([]);

        try {
            // Use the new criar-itens API with matrix habilidades
            const res = await fetch("/api/avaliacao-diagnostica/criar-itens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    disciplina: selectedDisc,
                    serie: selectedAluno.grade || "",
                    habilidades_selecionadas: habsSelecionadas.length > 0
                        ? habsSelecionadas
                        : matrizHabs.slice(0, 6).map(h => h.habilidade),
                    qtd_questoes: qtdQuestoes,
                    tipo_questao: tipoQuestao,
                    diagnostico_aluno: selectedAluno.diagnostico || "",
                    nome_aluno: selectedAluno.name,
                    plano_ensino_contexto: planoVinculado?.conteudo || "",
                    alerta_nee: neeAlert || "",
                    instrucao_uso_diagnostica: instrucaoDiag || "",
                    engine: "red",
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Try parsed questoes first
            if (data.questoes?.questoes) {
                setQuestoes(data.questoes.questoes);
                setCurrentStep(1);
                // Save to database via existing API
                try {
                    const saveRes = await fetch("/api/pei/avaliacao-diagnostica", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            studentId: selectedAluno.id,
                            disciplina: selectedDisc,
                            questoes_geradas: data.questoes,
                            habilidades_bncc: habsSelecionadas,
                        }),
                    });
                    const saveData = await saveRes.json();
                    if (saveData.avaliacao?.id) setAvaliacaoId(saveData.avaliacao.id);
                } catch { /* save silently */ }
            } else {
                setAvalError("Resposta da IA não está no formato esperado. Tente novamente.");
            }
        } catch (err) {
            setAvalError(err instanceof Error ? err.message : "Erro ao gerar avaliação");
        } finally { setGerando(false); }
    };

    // ─── Save results ───────────────────────────────────────────────────

    const salvarResultados = async () => {
        if (!avaliacaoId) return;
        setSalvando(true);

        let acertos = 0;
        for (const q of questoes) {
            if (respostas[q.id] === q.gabarito) acertos++;
        }
        const percentual = questoes.length > 0 ? acertos / questoes.length : 0;
        let nivel: NivelOmnisfera = 0;
        if (percentual >= 0.9) nivel = 4;
        else if (percentual >= 0.7) nivel = 3;
        else if (percentual >= 0.5) nivel = 2;
        else if (percentual >= 0.25) nivel = 1;
        else nivel = 0;

        try {
            const res = await fetch("/api/pei/avaliacao-diagnostica", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: avaliacaoId,
                    resultados: respostas,
                    nivel_omnisfera_identificado: nivel,
                    status: "aplicada",
                }),
            });
            if (!res.ok) throw new Error("Erro ao salvar");
            setNivelIdentificado(nivel);
            setCurrentStep(questoes.length + 1); // Go to results step
            fetchAlunos(); // Refresh list
        } catch (err) {
            setAvalError(err instanceof Error ? err.message : "Erro ao salvar resultados");
        } finally { setSalvando(false); }
    };

    // ─── Loading ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ padding: 60, textAlign: "center" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "#3b82f6", margin: "0 auto 12px" }} />
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Carregando estudantes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f87171", marginBottom: 12 }}>
                    <AlertTriangle size={20} /> <span style={{ fontWeight: 600 }}>{error}</span>
                </div>
                <button onClick={fetchAlunos} style={{
                    padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)",
                    background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: 13,
                }}>Tentar novamente</button>
            </div>
        );
    }

    // ─── Avaliação View (student selected) ──────────────────────────────

    if (selectedAluno && selectedDisc) {
        const totalSteps = questoes.length + 2; // intro + questions + results
        const allAnswered = questoes.length > 0 && Object.keys(respostas).length >= questoes.length;

        return (
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                {/* Breadcrumb */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
                    padding: "12px 16px", borderRadius: 12,
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                }}>
                    <button onClick={goBack} style={{
                        display: "flex", alignItems: "center", padding: 6, borderRadius: 8,
                        border: "none", background: "rgba(99,102,241,.1)", color: "#818cf8", cursor: "pointer",
                    }}><ArrowLeft size={16} /></button>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {selectedAluno.name} <span style={{ margin: "0 6px", opacity: .5 }}>›</span>
                        <strong style={{ color: "var(--text-primary)" }}>{selectedDisc}</strong>
                    </span>
                </div>

                {/* Header */}
                <div style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    borderRadius: 14, padding: "20px 24px", color: "#fff", marginBottom: 20,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <Brain size={22} />
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                            Avaliação Diagnóstica — {selectedDisc}
                        </h2>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
                        Estudante: <strong>{selectedAluno.name}</strong> · {selectedAluno.grade}
                        {selectedAluno.diagnostico && ` · ${selectedAluno.diagnostico}`}
                    </p>
                </div>

                {/* NEE Alert from Planos Genéricos */}
                {Boolean(neeAlert) && (
                    <div style={{
                        padding: "14px 18px", borderRadius: 12,
                        background: "rgba(245,158,11,.08)", border: "1.5px solid rgba(245,158,11,.25)",
                        marginBottom: 16, fontSize: 13, lineHeight: 1.6,
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#f59e0b", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            ⚠️ Orientação para {selectedAluno?.diagnostico || "NEE"}
                        </div>
                        <div style={{ color: "var(--text-secondary)" }}>{neeAlert}</div>
                    </div>
                )}
                {Boolean(instrucaoDiag) && (
                    <div style={{
                        padding: "14px 18px", borderRadius: 12,
                        background: "rgba(59,130,246,.06)", border: "1.5px solid rgba(59,130,246,.2)",
                        marginBottom: 16, fontSize: 13, lineHeight: 1.6,
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#3b82f6", marginBottom: 6 }}>
                            📋 Instrução de Uso
                        </div>
                        <div style={{ color: "var(--text-secondary)" }}>{instrucaoDiag}</div>
                    </div>
                )}

                {/* Level already identified */}
                {nivelIdentificado !== null && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                        borderRadius: 14, background: "rgba(16,185,129,.08)", border: "1.5px solid rgba(16,185,129,.3)",
                        marginBottom: 20,
                    }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center",
                            justifyContent: "center", background: "linear-gradient(135deg, #059669, #10b981)",
                            color: "#fff", fontSize: 22, fontWeight: 800,
                        }}>{nivelIdentificado}</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "#10b981" }}>
                                Nível Omnisfera: {nivelIdentificado} — {ESCALA_OMNISFERA[nivelIdentificado as NivelOmnisfera]?.label}
                            </div>
                            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
                                {ESCALA_OMNISFERA[nivelIdentificado as NivelOmnisfera]?.descricao}
                            </div>
                            <div style={{ fontSize: 12, color: "#10b981", marginTop: 4, fontWeight: 600 }}>
                                ✓ Resultado vinculado ao PEI do estudante
                            </div>
                        </div>
                    </div>
                )}

                {/* Rubrica reference — shows before assessment or after level is identified */}
                {(nivelIdentificado !== null || (questoes.length === 0 && !gerando)) && (
                    <div style={{ marginBottom: 20 }}>
                        <RubricaOmnisfera
                            nivelAtual={nivelIdentificado !== null ? nivelIdentificado as 0 | 1 | 2 | 3 | 4 : undefined}
                        />
                    </div>
                )}

                {/* Step 0: Plano de Ensino context + Matrix picker + Generate button */}
                {questoes.length === 0 && !gerando && nivelIdentificado === null && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* Plano de Ensino vinculado */}
                        {planoVinculado && (
                            <div style={{
                                ...cardS,
                                border: "1.5px solid rgba(14,165,233,.3)",
                            }}>
                                <button
                                    onClick={() => setShowMatrix(!showMatrix)}
                                    style={{
                                        ...headerS, width: "100%", cursor: "pointer",
                                        justifyContent: "space-between", border: "none",
                                        background: "rgba(14,165,233,.05)",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <FileText size={16} style={{ color: "#0ea5e9" }} />
                                        <span style={{ fontWeight: 700, fontSize: 14, color: "#0ea5e9" }}>
                                            Plano de Ensino vinculado — {planoVinculado.disciplina}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ fontSize: 11, color: "#0ea5e9", fontWeight: 600 }}>
                                            {showMatrix ? "Ocultar" : "Ver"} Plano
                                        </span>
                                        {showMatrix ? <ChevronUp size={14} style={{ color: "#0ea5e9" }} /> : <ChevronDown size={14} style={{ color: "#0ea5e9" }} />}
                                    </div>
                                </button>
                                {showMatrix && (
                                    <div style={bodyS}>
                                        {planoVinculado.habilidades_bncc && planoVinculado.habilidades_bncc.length > 0 && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                                                {planoVinculado.habilidades_bncc.map((h, i) => (
                                                    <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "rgba(99,102,241,.08)", color: "#818cf8", border: "1px solid rgba(99,102,241,.15)" }}>{h}</span>
                                                ))}
                                            </div>
                                        )}
                                        {blocosPlano.length > 0 && blocosPlano.map((bloco, i) => (
                                            <div key={i} style={{ padding: "8px 12px", borderRadius: 8, background: "var(--bg-primary, rgba(2,6,23,.2))", border: "1px solid var(--border-default, rgba(148,163,184,.1))", marginBottom: 6 }}>
                                                <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-primary)" }}>{bloco.titulo || `Bloco ${i + 1}`}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {!planoVinculado && (
                            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(245,158,11,.05)", border: "1px solid rgba(245,158,11,.15)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#fbbf24" }}>
                                <FileText size={16} /> Nenhum plano de ensino vinculado.
                                <a href="/plano-curso" style={{ color: "#38bdf8", fontWeight: 600, textDecoration: "none", marginLeft: "auto" }}>Criar plano →</a>
                            </div>
                        )}

                        {/* Habilidades da Matriz de Referência */}
                        {matrizHabs.length > 0 && (
                            <div style={cardS}>
                                <div style={{ ...headerS, background: "rgba(99,102,241,.05)" }}>
                                    <Layers size={16} style={{ color: "#818cf8" }} />
                                    <span style={{ fontWeight: 700, fontSize: 14, color: "#818cf8" }}>Habilidades da Matriz de Referência</span>
                                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                                        {habsSelecionadas.length} de {matrizHabs.length} selecionadas
                                    </span>
                                </div>
                                <div style={{ ...bodyS, maxHeight: 260, overflowY: "auto" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {matrizHabs.map((h, i) => {
                                            const selected = habsSelecionadas.includes(h.habilidade);
                                            const codeMatch = h.habilidade.match(/^(EF\d+\w+\d+H?\d*|\(EF\d+\w+\d+\))/i);
                                            const code = codeMatch ? codeMatch[1].replace(/[()]/g, '') : '';
                                            return (
                                                <label key={i} style={{
                                                    display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px",
                                                    borderRadius: 8, cursor: "pointer",
                                                    background: selected ? "rgba(99,102,241,.08)" : "transparent",
                                                    border: selected ? "1px solid rgba(99,102,241,.2)" : "1px solid transparent",
                                                    transition: "all .15s",
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() => {
                                                            setHabsSelecionadas(prev =>
                                                                selected
                                                                    ? prev.filter(x => x !== h.habilidade)
                                                                    : [...prev, h.habilidade]
                                                            );
                                                        }}
                                                        style={{ marginTop: 2, accentColor: "#6366f1" }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                            {code && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "rgba(99,102,241,.1)", color: "#818cf8" }}>{code}</span>}
                                                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{h.tema}</span>
                                                        </div>
                                                        <div style={{ fontSize: 12, color: "var(--text-primary)", marginTop: 2, lineHeight: 1.4 }}>
                                                            {h.habilidade.slice(0, 150)}{h.habilidade.length > 150 ? "..." : ""}
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border-default, rgba(148,163,184,.08))", display: "flex", gap: 8 }}>
                                    <button onClick={() => setHabsSelecionadas(matrizHabs.map(h => h.habilidade))} style={{ fontSize: 11, color: "#818cf8", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Selecionar todas</button>
                                    <button onClick={() => setHabsSelecionadas([])} style={{ fontSize: 11, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>Limpar</button>
                                </div>
                            </div>
                        )}

                        {/* Configuração da Geração */}
                        <div style={cardS}>
                            <div style={{ ...headerS, background: "rgba(37,99,235,.05)" }}>
                                <Sparkles size={16} style={{ color: "#3b82f6" }} />
                                <span style={{ fontWeight: 700, fontSize: 14, color: "#3b82f6" }}>Configurar Avaliação</span>
                            </div>
                            <div style={{ ...bodyS, display: "flex", flexDirection: "column", gap: 14 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Quantidade de Questões</label>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <input
                                                type="range"
                                                min={2}
                                                max={10}
                                                value={qtdQuestoes}
                                                onChange={e => setQtdQuestoes(Number(e.target.value))}
                                                style={{ flex: 1, accentColor: "#3b82f6" }}
                                            />
                                            <span style={{ fontSize: 14, fontWeight: 800, color: "#3b82f6", minWidth: 20, textAlign: "center" }}>{qtdQuestoes}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Tipo de Questão</label>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {(["Objetiva", "Discursiva"] as const).map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTipoQuestao(t)}
                                                    style={{
                                                        flex: 1, padding: "8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                                        border: tipoQuestao === t ? "1.5px solid #3b82f6" : "1px solid var(--border-default, rgba(148,163,184,.12))",
                                                        background: tipoQuestao === t ? "rgba(59,130,246,.08)" : "transparent",
                                                        color: tipoQuestao === t ? "#3b82f6" : "var(--text-muted)",
                                                        cursor: "pointer",
                                                    }}
                                                >{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(37,99,235,.04)", fontSize: 12, color: "#60a5fa", lineHeight: 1.5 }}>
                                    ✨ <strong>Modo Avançado (INEP/BNI):</strong> A IA gerará itens com texto-base obrigatório, distratores com diagnóstico de erro e dificuldade progressiva (níveis Omnisfera 0→4).
                                    {habsSelecionadas.length > 0 && <> · {habsSelecionadas.length} habilidade(s) da matriz selecionada(s).</>}
                                </div>

                                <button onClick={gerarAvaliacao} style={{
                                    padding: "14px 28px", borderRadius: 12,
                                    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                    color: "#fff", border: "none", cursor: "pointer",
                                    fontWeight: 700, fontSize: 15,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    boxShadow: "0 4px 20px rgba(37,99,235,.3)",
                                }}>
                                    <Sparkles size={20} /> Gerar Avaliação Diagnóstica com IA
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generating state */}
                {gerando && (
                    <div style={{
                        padding: 50, textAlign: "center",
                        ...cardS, border: "1.5px solid rgba(37,99,235,.3)",
                    }}>
                        <Loader2 size={36} className="animate-spin" style={{ color: "#3b82f6", margin: "0 auto 14px" }} />
                        <p style={{ color: "#94a3b8", fontSize: 15, fontWeight: 600 }}>
                            Gerando questões diagnósticas com IA...
                        </p>
                        <p style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
                            Isso pode levar até 30 segundos
                        </p>
                    </div>
                )}

                {avalError && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "12px 16px", borderRadius: 10,
                        background: "rgba(239,68,68,.1)", color: "#f87171", fontSize: 13,
                        marginBottom: 16,
                    }}>
                        <AlertTriangle size={16} /> {avalError}
                    </div>
                )}

                {/* Progress bar */}
                {questoes.length > 0 && nivelIdentificado === null && (
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                                {Object.keys(respostas).length} de {questoes.length} respondidas
                            </span>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                {Math.round((Object.keys(respostas).length / questoes.length) * 100)}%
                            </span>
                        </div>
                        <div style={{
                            height: 6, borderRadius: 3,
                            background: "var(--bg-tertiary, rgba(15,23,42,.5))",
                        }}>
                            <div style={{
                                height: "100%", borderRadius: 3,
                                background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                                width: `${(Object.keys(respostas).length / questoes.length) * 100}%`,
                                transition: "width .3s ease",
                            }} />
                        </div>
                    </div>
                )}

                {/* Questions */}
                {questoes.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {questoes.map((q, idx) => {
                            const respondida = !!respostas[q.id];
                            const correta = respostas[q.id] === q.gabarito;
                            const showResult = respondida && nivelIdentificado !== null;

                            return (
                                <div key={q.id} style={{
                                    ...cardS,
                                    border: respondida
                                        ? showResult
                                            ? `1.5px solid ${correta ? "rgba(16,185,129,.4)" : "rgba(239,68,68,.4)"}`
                                            : "1.5px solid rgba(99,102,241,.3)"
                                        : "1px solid var(--border-default, rgba(148,163,184,.15))",
                                }}>
                                    {/* Question header */}
                                    <button
                                        onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                                        style={{
                                            ...headerS, width: "100%", cursor: "pointer",
                                            justifyContent: "space-between", border: "none",
                                            background: showResult && correta
                                                ? "rgba(16,185,129,.05)"
                                                : showResult && !correta
                                                    ? "rgba(239,68,68,.05)"
                                                    : "var(--bg-tertiary, rgba(15,23,42,.3))",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{
                                                width: 28, height: 28, borderRadius: "50%",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 12, fontWeight: 800,
                                                background: respondida
                                                    ? showResult && correta ? "rgba(16,185,129,.15)" : showResult ? "rgba(239,68,68,.15)" : "rgba(99,102,241,.15)"
                                                    : "rgba(148,163,184,.1)",
                                                color: respondida
                                                    ? showResult && correta ? "#10b981" : showResult ? "#f87171" : "#818cf8"
                                                    : "var(--text-muted)",
                                            }}>{idx + 1}</span>
                                            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary, #e2e8f0)" }}>
                                                Questão {idx + 1}
                                                {respondida && showResult && (
                                                    <span style={{ marginLeft: 8, fontSize: 12, color: correta ? "#10b981" : "#f87171" }}>
                                                        {correta ? "✓ Correta" : "✗ Incorreta"}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            {respondida && !showResult && (
                                                <span style={{ fontSize: 11, fontWeight: 600, color: "#818cf8", background: "rgba(99,102,241,.1)", padding: "2px 8px", borderRadius: 4 }}>
                                                    Respondida
                                                </span>
                                            )}
                                            {expandedQ === q.id ? <ChevronUp size={16} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />}
                                        </div>
                                    </button>

                                    {/* Per-question action buttons */}
                                    {expandedQ === q.id && nivelIdentificado === null && (
                                        <div style={{
                                            display: "flex", gap: 6, padding: "6px 14px",
                                            borderBottom: "1px solid var(--border-default, rgba(148,163,184,.08))",
                                        }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setQuestoes(prev => prev.filter(qq => qq.id !== q.id));
                                                    const newRespostas = { ...respostas };
                                                    delete newRespostas[q.id];
                                                    setRespostas(newRespostas);
                                                }}
                                                title="Apagar esta questão"
                                                style={{
                                                    padding: "4px 10px", borderRadius: 6, fontSize: 11,
                                                    border: "1px solid rgba(239,68,68,.2)",
                                                    background: "rgba(239,68,68,.05)", color: "#f87171",
                                                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                                                }}
                                            >
                                                <Trash2 size={12} /> Apagar
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    // Regenerate single question
                                                    try {
                                                        const res = await fetch("/api/avaliacao-diagnostica/criar-itens", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                disciplina: selectedDisc || "",
                                                                serie: selectedAluno?.grade || "",
                                                                habilidades: habsSelecionadas,
                                                                qtd_questoes: 1,
                                                                nivel_omnisfera_estimado: 1,
                                                                diagnostico_aluno: selectedAluno?.diagnostico || "",
                                                                nome_aluno: selectedAluno?.name || "",
                                                                engine: "red",
                                                            }),
                                                        });
                                                        const data = await res.json();
                                                        if (data.questoes?.[0]) {
                                                            const novaQ = data.questoes[0];
                                                            setQuestoes(prev => prev.map(qq => qq.id === q.id ? novaQ : qq));
                                                            const newRespostas = { ...respostas };
                                                            delete newRespostas[q.id];
                                                            setRespostas(newRespostas);
                                                        }
                                                    } catch { /* silent */ }
                                                }}
                                                title="Regenerar esta questão"
                                                style={{
                                                    padding: "4px 10px", borderRadius: 6, fontSize: 11,
                                                    border: "1px solid rgba(99,102,241,.2)",
                                                    background: "rgba(99,102,241,.05)", color: "#818cf8",
                                                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                                                }}
                                            >
                                                <RefreshCw size={12} /> Regenerar
                                            </button>
                                        </div>
                                    )}

                                    {/* Question content (expanded) */}
                                    {expandedQ === q.id && (
                                        <div style={bodyS}>
                                            {/* Instruction for professor */}
                                            {q.instrucao_aplicacao_professor && (
                                                <div style={{
                                                    padding: "10px 14px", borderRadius: 10, fontSize: 12,
                                                    background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.15)",
                                                    color: "#fbbf24", marginBottom: 14, lineHeight: 1.5,
                                                }}>
                                                    <strong>📋 Instrução para o professor:</strong> {q.instrucao_aplicacao_professor}
                                                </div>
                                            )}

                                            {/* Visual context suggestion */}
                                            {q.contexto_visual_sugerido && (
                                                <div style={{
                                                    padding: "8px 12px", borderRadius: 8, fontSize: 12,
                                                    background: "rgba(14,165,233,.06)", border: "1px solid rgba(14,165,233,.12)",
                                                    color: "#38bdf8", marginBottom: 12,
                                                }}>
                                                    🖼️ <strong>Contexto visual sugerido:</strong> {q.contexto_visual_sugerido}
                                                </div>
                                            )}

                                            {/* NEE adaptation */}
                                            {q.adaptacao_nee_aplicada && (
                                                <div style={{
                                                    padding: "8px 12px", borderRadius: 8, fontSize: 12,
                                                    background: "rgba(139,92,246,.06)", border: "1px solid rgba(139,92,246,.12)",
                                                    color: "#a78bfa", marginBottom: 12,
                                                }}>
                                                    ♿ <strong>Adaptação NEE:</strong> {q.adaptacao_nee_aplicada}
                                                </div>
                                            )}

                                            {/* Enunciado */}
                                            <p style={{
                                                fontSize: 15, lineHeight: 1.7, color: "var(--text-primary, #e2e8f0)",
                                                marginBottom: 16, fontWeight: 500,
                                            }}>
                                                {q.enunciado}
                                            </p>

                                            {/* Alternatives */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                                                {(["A", "B", "C", "D"] as const).map((letra) => {
                                                    const selected = respostas[q.id] === letra;
                                                    const isCorrect = letra === q.gabarito;

                                                    let bg = "var(--bg-primary, rgba(2,6,23,.3))";
                                                    let borderColor = "var(--border-default, rgba(148,163,184,.12))";
                                                    let textColor = "var(--text-primary, #e2e8f0)";
                                                    if (selected) { bg = "rgba(99,102,241,.12)"; borderColor = "#6366f1"; textColor = "#c7d2fe"; }
                                                    if (showResult && isCorrect) { bg = "rgba(16,185,129,.08)"; borderColor = "#10b981"; textColor = "#a7f3d0"; }
                                                    if (showResult && selected && !isCorrect) { bg = "rgba(239,68,68,.08)"; borderColor = "#f87171"; textColor = "#fecaca"; }

                                                    return (
                                                        <button
                                                            key={letra}
                                                            onClick={() => {
                                                                if (nivelIdentificado !== null) return;
                                                                setRespostas({ ...respostas, [q.id]: letra });
                                                            }}
                                                            style={{
                                                                padding: "12px 16px", borderRadius: 10, textAlign: "left",
                                                                background: bg, border: `1.5px solid ${borderColor}`,
                                                                color: textColor, cursor: nivelIdentificado !== null ? "default" : "pointer",
                                                                fontSize: 14, transition: "all .2s", display: "flex", alignItems: "center", gap: 10,
                                                            }}
                                                        >
                                                            <span style={{
                                                                width: 26, height: 26, borderRadius: "50%",
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                fontSize: 12, fontWeight: 800,
                                                                background: selected ? "rgba(99,102,241,.2)" : "rgba(148,163,184,.08)",
                                                                color: selected ? "#818cf8" : "var(--text-muted)",
                                                                flexShrink: 0,
                                                            }}>{letra}</span>
                                                            {q.alternativas[letra]}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Pedagogical justification */}
                                            {showResult && q.justificativa_pedagogica && (
                                                <div style={{
                                                    padding: "12px 16px", borderRadius: 10, fontSize: 13,
                                                    background: "rgba(99,102,241,.06)", border: "1px solid rgba(99,102,241,.12)",
                                                    color: "#a5b4fc", lineHeight: 1.6,
                                                }}>
                                                    <strong>💡 Justificativa pedagógica:</strong> {q.justificativa_pedagogica}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Save results button */}
                        {nivelIdentificado === null && allAnswered && (
                            <button
                                onClick={salvarResultados}
                                disabled={salvando}
                                style={{
                                    padding: "16px 24px", borderRadius: 14,
                                    background: "linear-gradient(135deg, #059669, #10b981)",
                                    color: "#fff", border: "none", cursor: "pointer",
                                    fontWeight: 700, fontSize: 16,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                    boxShadow: "0 4px 20px rgba(16,185,129,.3)",
                                }}
                            >
                                {salvando ? (
                                    <><Loader2 size={20} className="animate-spin" /> Calculando nível Omnisfera...</>
                                ) : (
                                    <><ClipboardCheck size={20} /> Registrar respostas e calcular nível</>
                                )}
                            </button>
                        )}

                        {/* Print / Export bar */}
                        {questoes.length > 0 && (
                            <div style={{
                                ...cardS,
                                border: "1.5px solid rgba(99,102,241,.2)",
                                background: "rgba(99,102,241,.03)",
                            }}>
                                <div style={{ ...headerS, background: "rgba(99,102,241,.05)" }}>
                                    <Printer size={16} style={{ color: "#818cf8" }} />
                                    <span style={{ fontWeight: 700, fontSize: 13, color: "#818cf8" }}>Imprimir / Exportar Prova</span>
                                </div>
                                <div style={{ ...bodyS, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    <button
                                        onClick={() => setShowProvaImprimivel(!showProvaImprimivel)}
                                        style={{
                                            padding: "8px 16px", borderRadius: 8, border: "none",
                                            background: showProvaImprimivel ? "#4f46e5" : "linear-gradient(135deg, #6366f1, #818cf8)",
                                            color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                                            display: "flex", alignItems: "center", gap: 6,
                                        }}
                                    >
                                        <FileText size={14} />
                                        {showProvaImprimivel ? "Fechar Preview" : "Preview da Prova"}
                                    </button>
                                    <label style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        fontSize: 12, color: "var(--text-secondary)", cursor: "pointer",
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={showGabarito}
                                            onChange={(e) => setShowGabarito(e.target.checked)}
                                            style={{ width: 14, height: 14 }}
                                        />
                                        Incluir gabarito
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* ProvaImprimivel */}
                        {showProvaImprimivel && questoes.length > 0 && (
                            <div style={{ ...cardS, padding: 0 }}>
                                <ProvaImprimivel
                                    questoes={questoes}
                                    nomeAluno={selectedAluno?.name || ""}
                                    serie={selectedAluno?.grade || ""}
                                    disciplina={selectedDisc || ""}
                                    respostas={respostas}
                                    mostrarGabarito={showGabarito}
                                />
                            </div>
                        )}

                        {/* Regenerate button */}
                        {questoes.length > 0 && (
                            <button
                                onClick={() => { setQuestoes([]); setRespostas({}); setNivelIdentificado(null); setAvaliacaoId(null); setCurrentStep(0); setDimensoesNEE([]); setDimensoesAvaliadas({}); setShowCamadaB(false); setPerfilGerado(null); setEstrategiasGeradas(null); }}
                                style={{
                                    padding: "10px 18px", borderRadius: 10,
                                    background: "transparent", color: "var(--text-muted, #94a3b8)",
                                    border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                    cursor: "pointer", fontSize: 13, textAlign: "center",
                                }}
                            >
                                Gerar nova avaliação
                            </button>
                        )}
                    </div>
                )}

                {/* ─── CAMADA B: Cognitivo-Funcional ──────────────────── */}
                {nivelIdentificado !== null && dimensoesNEE.length > 0 && (
                    <div style={{ ...cardS, marginBottom: 20 }}>
                        <button
                            onClick={() => setShowCamadaB(!showCamadaB)}
                            style={{
                                ...headerS, width: "100%", cursor: "pointer",
                                justifyContent: "space-between", border: "none",
                                background: "rgba(168,85,247,.05)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Layers size={16} style={{ color: "#a855f7" }} />
                                <span style={{ fontWeight: 700, fontSize: 14, color: "#a855f7" }}>
                                    Camada B — Avaliação Cognitivo-Funcional
                                </span>
                                <span style={{
                                    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                                    background: "rgba(168,85,247,.1)", color: "#a855f7",
                                }}>{dimensoesNEE.length} dimensões</span>
                            </div>
                            {showCamadaB ? <ChevronUp size={14} style={{ color: "#a855f7" }} /> : <ChevronDown size={14} style={{ color: "#a855f7" }} />}
                        </button>
                        {showCamadaB && (
                            <div style={bodyS}>
                                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 0, marginBottom: 12 }}>
                                    Avalie cada dimensão cognitivo-funcional com base na sua observação.
                                    Específicas para o perfil <strong>{selectedAluno.diagnostico}</strong>.
                                </p>
                                {dimensoesNEE.map((dim) => {
                                    const val = dimensoesAvaliadas[dim.id] || { nivel: -1, observacao: "" };
                                    const nivelColors: Record<number, string> = { 0: "#f87171", 1: "#fbbf24", 2: "#60a5fa", 3: "#34d399", 4: "#818cf8" };
                                    return (
                                        <div key={dim.id} style={{
                                            padding: "14px 16px", borderRadius: 12, marginBottom: 10,
                                            background: val.nivel >= 0 ? "rgba(168,85,247,.03)" : "var(--bg-primary, rgba(2,6,23,.2))",
                                            border: val.nivel >= 0 ? "1.5px solid rgba(168,85,247,.15)" : "1px solid var(--border-default, rgba(148,163,184,.1))",
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 3 }}>{dim.dimensao}</div>
                                                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>👁️ {dim.o_que_o_professor_observa}</div>
                                                    <div style={{ fontSize: 11, color: "#a855f7", marginTop: 3, fontWeight: 600 }}>💡 {dim.acao_pratica}</div>
                                                </div>
                                                <div style={{ display: "flex", gap: 3 }}>
                                                    {[0, 1, 2, 3, 4].map(n => (
                                                        <button key={n}
                                                            onClick={() => setDimensoesAvaliadas(prev => ({
                                                                ...prev, [dim.id]: { ...prev[dim.id], nivel: n, observacao: prev[dim.id]?.observacao || "" }
                                                            }))}
                                                            title={dim.niveis_omnisfera?.[String(n)] || ""}
                                                            style={{
                                                                width: 30, height: 30, borderRadius: 8,
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                cursor: "pointer", fontSize: 12, fontWeight: 800,
                                                                border: val.nivel === n ? `2px solid ${nivelColors[n]}` : "1px solid var(--border-default, rgba(148,163,184,.12))",
                                                                background: val.nivel === n ? `${nivelColors[n]}15` : "transparent",
                                                                color: val.nivel === n ? nivelColors[n] : "var(--text-muted)",
                                                                transition: "all .15s",
                                                            }}
                                                        >{n}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            {val.nivel >= 0 && (
                                                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, fontStyle: "italic" }}>
                                                    Nível {val.nivel}: {dim.niveis_omnisfera?.[String(val.nivel)] || ""}
                                                </div>
                                            )}
                                            <textarea
                                                placeholder={dim.perguntas_professor?.[0] || "Observação..."}
                                                value={val.observacao}
                                                onChange={(e) => setDimensoesAvaliadas(prev => ({
                                                    ...prev, [dim.id]: { ...prev[dim.id], nivel: prev[dim.id]?.nivel ?? -1, observacao: e.target.value }
                                                }))}
                                                rows={1}
                                                style={{
                                                    width: "100%", padding: "6px 10px", borderRadius: 8, fontSize: 11,
                                                    border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                                                    background: "var(--bg-primary, rgba(2,6,23,.2))",
                                                    color: "var(--text-primary)", resize: "vertical", fontFamily: "inherit",
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Generate V3 Outputs ─────────────────────────────── */}
                {nivelIdentificado !== null && (
                    <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                        <button onClick={gerarPerfil} disabled={gerandoPerfil} style={{
                            flex: 1, padding: "14px 16px", borderRadius: 12,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            cursor: gerandoPerfil ? "not-allowed" : "pointer",
                            fontSize: 13, fontWeight: 700, border: "none",
                            background: gerandoPerfil ? "var(--bg-tertiary)" : "linear-gradient(135deg, #7c3aed, #a855f7)",
                            color: "#fff", boxShadow: "0 4px 16px rgba(168,85,247,.2)",
                        }}>
                            {gerandoPerfil ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {gerandoPerfil ? "Gerando..." : "Gerar Perfil de Funcionamento"}
                        </button>
                        <button onClick={gerarEstrategias} disabled={gerandoEstrategias} style={{
                            flex: 1, padding: "14px 16px", borderRadius: 12,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            cursor: gerandoEstrategias ? "not-allowed" : "pointer",
                            fontSize: 13, fontWeight: 700, border: "none",
                            background: gerandoEstrategias ? "var(--bg-tertiary)" : "linear-gradient(135deg, #059669, #10b981)",
                            color: "#fff", boxShadow: "0 4px 16px rgba(16,185,129,.2)",
                        }}>
                            {gerandoEstrategias ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
                            {gerandoEstrategias ? "Gerando..." : "Gerar Estratégias Práticas"}
                        </button>
                    </div>
                )}

                {/* ─── Perfil de Funcionamento Output ─────────────────── */}
                {perfilGerado && (
                    <div style={{ ...cardS, marginBottom: 20, border: "1.5px solid rgba(168,85,247,.2)" }}>
                        <div style={{ ...headerS, background: "rgba(168,85,247,.05)" }}>
                            <Sparkles size={16} style={{ color: "#a855f7" }} />
                            <span style={{ fontWeight: 700, fontSize: 14, color: "#a855f7" }}>Perfil de Funcionamento</span>
                        </div>
                        <div style={bodyS}>
                            {Boolean(perfilGerado.resumo_geral) && (
                                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginTop: 0, marginBottom: 12 }}>
                                    {String(perfilGerado.resumo_geral)}
                                </p>
                            )}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                                {Array.isArray(perfilGerado.pontos_fortes) && (
                                    <div style={{ padding: 12, borderRadius: 10, background: "rgba(16,185,129,.05)", border: "1px solid rgba(16,185,129,.12)" }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", marginBottom: 6 }}>✅ Pontos Fortes</div>
                                        {(perfilGerado.pontos_fortes as string[]).map((p, i) => (
                                            <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>• {p}</div>
                                        ))}
                                    </div>
                                )}
                                {Array.isArray(perfilGerado.areas_atencao) && (
                                    <div style={{ padding: 12, borderRadius: 10, background: "rgba(245,158,11,.05)", border: "1px solid rgba(245,158,11,.12)" }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", marginBottom: 6 }}>⚠️ Áreas de Atenção</div>
                                        {(perfilGerado.areas_atencao as string[]).map((a, i) => (
                                            <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>• {a}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {Array.isArray(perfilGerado.recomendacao_prioridade) && (
                                <div style={{ padding: 12, borderRadius: 10, background: "rgba(99,102,241,.05)", border: "1px solid rgba(99,102,241,.12)" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", marginBottom: 6 }}>🎯 Prioridades</div>
                                    {(perfilGerado.recomendacao_prioridade as string[]).map((r, i) => (
                                        <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>{i + 1}. {r}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── Estratégias Práticas Output ────────────────────── */}
                {estrategiasGeradas && (
                    <div style={{ ...cardS, marginBottom: 20, border: "1.5px solid rgba(16,185,129,.2)" }}>
                        <div style={{ ...headerS, background: "rgba(16,185,129,.05)" }}>
                            <Target size={16} style={{ color: "#10b981" }} />
                            <span style={{ fontWeight: 700, fontSize: 14, color: "#10b981" }}>Estratégias Práticas</span>
                        </div>
                        <div style={bodyS}>
                            {Array.isArray(estrategiasGeradas.estrategias) && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                                    {(estrategiasGeradas.estrategias as Array<Record<string, string>>).map((est, i) => (
                                        <div key={i} style={{
                                            padding: "12px 14px", borderRadius: 10,
                                            background: est.prioridade === "essencial" ? "rgba(239,68,68,.04)" : "var(--bg-primary, rgba(2,6,23,.2))",
                                            border: est.prioridade === "essencial" ? "1px solid rgba(239,68,68,.15)" : "1px solid var(--border-default, rgba(148,163,184,.1))",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                                <span style={{
                                                    fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase",
                                                    background: est.prioridade === "essencial" ? "rgba(239,68,68,.1)" : est.prioridade === "recomendada" ? "rgba(245,158,11,.1)" : "rgba(148,163,184,.1)",
                                                    color: est.prioridade === "essencial" ? "#f87171" : est.prioridade === "recomendada" ? "#fbbf24" : "#94a3b8",
                                                }}>{est.prioridade || "sugerida"}</span>
                                            </div>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>
                                                👁️ {est.comportamento_observado}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginBottom: 3 }}>
                                                ✋ {est.acao_concreta}
                                            </div>
                                            {est.quando_usar && (
                                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>📍 {est.quando_usar}</div>
                                            )}
                                            {est.exemplo_pratico && (
                                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontStyle: "italic" }}>
                                                    💬 Exemplo: {est.exemplo_pratico}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {Array.isArray(estrategiasGeradas.o_que_evitar) && (
                                <div style={{ padding: 12, borderRadius: 10, background: "rgba(239,68,68,.04)", border: "1px solid rgba(239,68,68,.12)" }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>🚫 O que evitar</div>
                                    {(estrategiasGeradas.o_que_evitar as string[]).map((e, i) => (
                                        <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>• {e}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── Processual Data Feed ──────────────────────────── */}
                {evolucaoProcessual.length > 0 && evolucaoProcessual[0]?.periodos?.length > 0 && (
                    <div style={{ ...cardS, marginBottom: 20 }}>
                        <button
                            onClick={() => setShowProcessual(!showProcessual)}
                            style={{
                                ...headerS, width: "100%", cursor: "pointer",
                                justifyContent: "space-between", border: "none",
                                background: "rgba(16,185,129,.05)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Activity size={16} style={{ color: "#10b981" }} />
                                <span style={{ fontWeight: 700, fontSize: 14, color: "#10b981" }}>
                                    Dados da Avaliação Processual
                                </span>
                                {evolucaoProcessual[0].tendencia && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                                        background: evolucaoProcessual[0].tendencia === "melhora" ? "rgba(16,185,129,.1)" : evolucaoProcessual[0].tendencia === "regressao" ? "rgba(239,68,68,.1)" : "rgba(148,163,184,.1)",
                                        color: evolucaoProcessual[0].tendencia === "melhora" ? "#10b981" : evolucaoProcessual[0].tendencia === "regressao" ? "#f87171" : "#94a3b8",
                                    }}>
                                        {evolucaoProcessual[0].tendencia === "melhora" ? "↗ Progresso" : evolucaoProcessual[0].tendencia === "regressao" ? "↘ Atenção" : "→ Estável"}
                                    </span>
                                )}
                                {evolucaoProcessual[0].media_mais_recente !== null && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                                        background: "rgba(16,185,129,.08)", color: "#10b981",
                                    }}>Média: {evolucaoProcessual[0].media_mais_recente}</span>
                                )}
                            </div>
                            {showProcessual ? <ChevronUp size={14} style={{ color: "#10b981" }} /> : <ChevronDown size={14} style={{ color: "#10b981" }} />}
                        </button>
                        {showProcessual && (
                            <div style={bodyS}>
                                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 0, marginBottom: 12 }}>
                                    Evolução registrada na Avaliação Processual — dados integrados automaticamente.
                                </p>
                                {evolucaoProcessual.map(evo => (
                                    <div key={evo.disciplina} style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>
                                            {evo.disciplina}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90, padding: "0 4px" }}>
                                            {evo.periodos.map((p, i) => {
                                                const val = p.media_nivel ?? 0;
                                                const height = Math.max((val / 4) * 70, 4);
                                                const nc = val >= 3 ? "#10b981" : val >= 2 ? "#3b82f6" : val >= 1 ? "#fbbf24" : "#f87171";
                                                return (
                                                    <div key={p.bimestre} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: nc }}>{val}</span>
                                                        <div style={{
                                                            width: "100%", maxWidth: 36, height, borderRadius: 6,
                                                            background: `linear-gradient(180deg, ${nc}, ${nc}88)`,
                                                            transition: "height .3s ease",
                                                        }} />
                                                        <span style={{ fontSize: 9, color: "var(--text-muted)", textAlign: "center" }}>
                                                            {p.bimestre}º
                                                        </span>
                                                        {i > 0 && evo.periodos[i - 1].media_nivel !== null && p.media_nivel !== null && (
                                                            <span style={{
                                                                fontSize: 8, fontWeight: 700,
                                                                color: (p.media_nivel ?? 0) > (evo.periodos[i - 1].media_nivel ?? 0) ? "#10b981" : (p.media_nivel ?? 0) < (evo.periodos[i - 1].media_nivel ?? 0) ? "#f87171" : "#94a3b8",
                                                            }}>
                                                                {(p.media_nivel ?? 0) > (evo.periodos[i - 1].media_nivel ?? 0) ? "▲" : (p.media_nivel ?? 0) < (evo.periodos[i - 1].media_nivel ?? 0) ? "▼" : "="}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "0 4px" }}>
                                            {[0, 1, 2, 3, 4].map(n => (
                                                <span key={n} style={{ fontSize: 8, color: "var(--text-muted)", opacity: 0.5 }}>N{n}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <a href="/avaliacao-processual" style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    fontSize: 12, fontWeight: 700, color: "#10b981", textDecoration: "none",
                                    padding: "8px 14px", borderRadius: 8, background: "rgba(16,185,129,.06)",
                                    border: "1px solid rgba(16,185,129,.15)",
                                }}>
                                    <Activity size={12} /> Ver Avaliação Processual completa →
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Diagnóstica vs Processual Comparison ─────────── */}
                {nivelIdentificado !== null && evolucaoProcessual.length > 0 && evolucaoProcessual[0]?.media_mais_recente !== null && (
                    (() => {
                        const diagLevel = nivelIdentificado;
                        const procLevel = evolucaoProcessual[0].media_mais_recente ?? 0;
                        const delta = procLevel - diagLevel;
                        const diagPct = Math.max((diagLevel / 4) * 100, 5);
                        const procPct = Math.max((procLevel / 4) * 100, 5);
                        const diagColor = diagLevel >= 3 ? "#10b981" : diagLevel >= 2 ? "#3b82f6" : diagLevel >= 1 ? "#fbbf24" : "#f87171";
                        const procColor = procLevel >= 3 ? "#10b981" : procLevel >= 2 ? "#3b82f6" : procLevel >= 1 ? "#fbbf24" : "#f87171";
                        return (
                            <div style={{
                                ...cardS, marginBottom: 20,
                                border: `1.5px solid ${delta > 0 ? "rgba(16,185,129,.2)" : delta < 0 ? "rgba(239,68,68,.15)" : "rgba(148,163,184,.12)"}`,
                            }}>
                                <div style={{
                                    ...headerS,
                                    background: delta > 0 ? "rgba(16,185,129,.03)" : delta < 0 ? "rgba(239,68,68,.03)" : "rgba(148,163,184,.03)",
                                }}>
                                    <TrendingUp size={16} style={{ color: delta > 0 ? "#10b981" : delta < 0 ? "#f87171" : "#94a3b8" }} />
                                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                                        Diagnóstica vs Processual
                                    </span>
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 6,
                                        background: delta > 0 ? "rgba(16,185,129,.1)" : delta < 0 ? "rgba(239,68,68,.1)" : "rgba(148,163,184,.1)",
                                        color: delta > 0 ? "#10b981" : delta < 0 ? "#f87171" : "#94a3b8",
                                    }}>
                                        {delta > 0 ? `↗ +${delta.toFixed(1)}` : delta < 0 ? `↘ ${delta.toFixed(1)}` : "→ 0"}
                                    </span>
                                </div>
                                <div style={bodyS}>
                                    <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
                                        {/* Diagnostic bar */}
                                        <div style={{ flex: 1, textAlign: "center" }}>
                                            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Diagnóstica Inicial</div>
                                            <div style={{ fontSize: 28, fontWeight: 800, color: diagColor, lineHeight: 1 }}>{diagLevel}</div>
                                            <div style={{
                                                height: 8, borderRadius: 4, marginTop: 8,
                                                background: "var(--bg-primary, rgba(148,163,184,.08))",
                                                overflow: "hidden",
                                            }}>
                                                <div style={{
                                                    width: `${diagPct}%`, height: "100%", borderRadius: 4,
                                                    background: `linear-gradient(90deg, ${diagColor}88, ${diagColor})`,
                                                    transition: "width .5s ease",
                                                }} />
                                            </div>
                                            <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>
                                                {ESCALA_OMNISFERA[diagLevel as 0 | 1 | 2 | 3 | 4]?.label || ""}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div style={{
                                            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                                            padding: "0 8px",
                                        }}>
                                            <div style={{
                                                fontSize: 20,
                                                color: delta > 0 ? "#10b981" : delta < 0 ? "#f87171" : "#94a3b8",
                                            }}>
                                                {delta > 0 ? "▶" : delta < 0 ? "◀" : "▬"}
                                            </div>
                                        </div>

                                        {/* Processual bar */}
                                        <div style={{ flex: 1, textAlign: "center" }}>
                                            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Processual Atual</div>
                                            <div style={{ fontSize: 28, fontWeight: 800, color: procColor, lineHeight: 1 }}>{procLevel}</div>
                                            <div style={{
                                                height: 8, borderRadius: 4, marginTop: 8,
                                                background: "var(--bg-primary, rgba(148,163,184,.08))",
                                                overflow: "hidden",
                                            }}>
                                                <div style={{
                                                    width: `${procPct}%`, height: "100%", borderRadius: 4,
                                                    background: `linear-gradient(90deg, ${procColor}88, ${procColor})`,
                                                    transition: "width .5s ease",
                                                }} />
                                            </div>
                                            <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>
                                                Média mais recente
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        marginTop: 12, padding: "8px 12px", borderRadius: 8, fontSize: 12,
                                        background: delta > 0 ? "rgba(16,185,129,.04)" : delta < 0 ? "rgba(239,68,68,.04)" : "rgba(148,163,184,.04)",
                                        color: "var(--text-secondary)",
                                    }}>
                                        {delta > 0 ?
                                            `O estudante evoluiu ${delta.toFixed(1)} pontos desde a avaliação diagnóstica inicial. Continue com as estratégias atuais.` :
                                            delta < 0 ?
                                                `O estudante apresentou queda de ${Math.abs(delta).toFixed(1)} pontos. Considere revisar o PEI e as estratégias de intervenção.` :
                                                "O estudante mantém o mesmo nível da avaliação diagnóstica. Avalie se novas estratégias podem impulsionar a evolução."
                                        }
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                )}

                {/* No processual data - show link */}
                {evolucaoProcessual.length === 0 && nivelIdentificado !== null && (
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 16px", borderRadius: 10, marginBottom: 20,
                        background: "rgba(16,185,129,.04)", border: "1px solid rgba(16,185,129,.12)",
                    }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            📊 Acompanhe a evolução deste estudante ao longo do ano
                        </span>
                        <a href="/avaliacao-processual" style={{
                            fontSize: 12, fontWeight: 700, color: "#10b981", textDecoration: "none",
                        }}>Ir para Processual →</a>
                    </div>
                )}
            </div>
        );
    }

    // ─── Student List ───────────────────────────────────────────────────

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Page header */}
            <div style={{
                background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
                borderRadius: 16, padding: "24px 28px", color: "#fff", marginBottom: 24,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center",
                        justifyContent: "center", background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)",
                    }}>
                        <Brain size={24} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Avaliação Diagnóstica</h1>
                        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
                            {professorName} · {alunos.length} estudante{alunos.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.8, maxWidth: 600 }}>
                    Gere avaliações diagnósticas com IA, aplique as questões e identifique o nível Omnisfera de cada estudante por componente curricular.
                </p>
            </div>

            {/* Cross-link to Processual */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px", borderRadius: 10, marginBottom: 20,
                background: "rgba(16,185,129,.05)", border: "1px solid rgba(16,185,129,.15)",
            }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    📊 Já fez a diagnóstica? Registre a evolução bimestral.
                </span>
                <a href="/avaliacao-processual" style={{
                    fontSize: 12, fontWeight: 700, color: "#10b981", textDecoration: "none",
                }}>Ir para Processual →</a>
            </div>

            {/* ── Tab Bar ── */}
            <div style={{
                display: "flex", gap: 4, padding: 4, borderRadius: 12,
                background: "var(--bg-secondary, rgba(15,23,42,.4))",
                border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                marginBottom: 20,
            }}>
                {([
                    { key: "estudantes" as const, label: "Estudantes", icon: <Users size={14} /> },
                    { key: "matriz" as const, label: "Matriz de Referência", icon: <Grid3X3 size={14} /> },
                    { key: "manual" as const, label: "Manual de Aplicação", icon: <BookMarked size={14} /> },
                ]).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1, padding: "10px 14px", borderRadius: 10,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            cursor: "pointer", fontSize: 13, fontWeight: 700,
                            border: "none",
                            background: activeTab === tab.key ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "transparent",
                            color: activeTab === tab.key ? "#fff" : "var(--text-muted, #94a3b8)",
                            transition: "all .2s",
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab: Matriz de Referência ── */}
            {activeTab === "matriz" && <MatrizReferenciaPanel />}

            {/* ── Tab: Manual de Aplicação ── */}
            {activeTab === "manual" && <ManualAplicacaoPanel />}

            {/* ── Tab: Estudantes ── */}
            {activeTab === "estudantes" && (
                <>

                    {/* Empty state */}
                    {alunos.length === 0 && (
                        <div style={{ ...cardS, textAlign: "center", padding: "40px 20px" }}>
                            <Users size={48} style={{ margin: "0 auto 12px", color: "var(--text-muted)", opacity: 0.3 }} />
                            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                                Nenhum estudante encontrado
                            </h3>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                                Estudantes em Fase 2 do PEI aparecerão aqui.
                            </p>
                        </div>
                    )}

                    {/* Student cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {alunos.map(aluno => {
                            const totalDisc = aluno.disciplinas.length;
                            const avaliadasCompletas = aluno.disciplinas.filter(d => d.avaliacao_status === "aplicada").length;

                            return (
                                <div key={aluno.id} style={cardS}>
                                    <div style={{ ...headerS, justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: "50%", display: "flex",
                                                alignItems: "center", justifyContent: "center",
                                                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                                                color: "#fff", fontSize: 12, fontWeight: 800,
                                            }}>
                                                {aluno.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary, #e2e8f0)" }}>
                                                    {aluno.name}
                                                </div>
                                                <div style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)" }}>
                                                    {aluno.grade} {aluno.class_group && `— ${aluno.class_group}`}
                                                    {aluno.diagnostico && ` · ${aluno.diagnostico}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <span style={{
                                                fontSize: 12, fontWeight: 700,
                                                color: avaliadasCompletas === totalDisc && totalDisc > 0 ? "#10b981" : "var(--text-muted)",
                                            }}>
                                                {avaliadasCompletas}/{totalDisc}
                                            </span>
                                            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>avaliações</div>
                                        </div>
                                    </div>

                                    {/* Discipline buttons */}
                                    <div style={{ ...bodyS, display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {aluno.disciplinas.map(disc => {
                                            const applied = disc.avaliacao_status === "aplicada";
                                            const hasAvaliacao = disc.has_avaliacao;

                                            return (
                                                <button
                                                    key={disc.id}
                                                    onClick={() => openAvaliacao(aluno, disc.disciplina)}
                                                    style={{
                                                        padding: "8px 14px", borderRadius: 10,
                                                        display: "flex", alignItems: "center", gap: 6,
                                                        cursor: "pointer", fontSize: 13, fontWeight: 600,
                                                        border: applied
                                                            ? "1.5px solid rgba(16,185,129,.3)"
                                                            : hasAvaliacao
                                                                ? "1.5px solid rgba(245,158,11,.3)"
                                                                : "1px solid var(--border-default, rgba(148,163,184,.12))",
                                                        background: applied
                                                            ? "rgba(16,185,129,.06)"
                                                            : hasAvaliacao
                                                                ? "rgba(245,158,11,.06)"
                                                                : "var(--bg-primary, rgba(2,6,23,.3))",
                                                        color: applied
                                                            ? "#10b981"
                                                            : hasAvaliacao
                                                                ? "#f59e0b"
                                                                : "var(--text-secondary, #cbd5e1)",
                                                        transition: "all .2s",
                                                    }}
                                                >
                                                    {applied ? <CheckCircle2 size={14} /> : hasAvaliacao ? <Target size={14} /> : <Zap size={14} />}
                                                    {disc.disciplina}
                                                    {disc.nivel_omnisfera !== null && (
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 4,
                                                            background: "rgba(99,102,241,.12)", color: "#818cf8",
                                                        }}>N{disc.nivel_omnisfera}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Matriz de Referência Panel ─────────────────────────────────────────────

function MatrizReferenciaPanel() {
    const [areas, setAreas] = useState<{ area: string; total: number; series: string[] }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [selectedSerie, setSelectedSerie] = useState<string | null>(null);
    const [habilidades, setHabilidades] = useState<{
        serie: string; ano: string; tema: string; objeto_conhecimento: string;
        competencia: string; habilidade: string; descritor: string;
    }[]>([]);
    const [loadingHabs, setLoadingHabs] = useState(false);

    useEffect(() => {
        fetch("/api/avaliacao-diagnostica/matriz")
            .then(r => r.json())
            .then(d => setAreas(d.areas || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const selectSerie = async (area: string, serie: string) => {
        setSelectedArea(area);
        setSelectedSerie(serie);
        setLoadingHabs(true);
        try {
            const res = await fetch(`/api/avaliacao-diagnostica/matriz?area=${encodeURIComponent(area)}&serie=${serie}`);
            const data = await res.json();
            setHabilidades(data.habilidades || []);
        } catch { setHabilidades([]); }
        finally { setLoadingHabs(false); }
    };

    const areaColors: Record<string, string> = {
        "Matemática": "#3b82f6",
        "Linguagens": "#8b5cf6",
        "Ciências da Natureza": "#10b981",
        "Ciências Humanas": "#f59e0b",
    };

    if (loading) return <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={28} className="animate-spin" style={{ color: "#3b82f6", margin: "0 auto" }} /></div>;

    if (selectedArea && selectedSerie) {
        const color = areaColors[selectedArea] || "#3b82f6";
        // Group by tema
        const temas: Record<string, typeof habilidades> = {};
        for (const h of habilidades) {
            const t = h.tema || "Geral";
            if (!temas[t]) temas[t] = [];
            temas[t].push(h);
        }

        return (
            <div>
                <button onClick={() => { setSelectedArea(null); setSelectedSerie(null); setHabilidades([]); }} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                    border: "none", background: "rgba(99,102,241,.08)", color: "#818cf8", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, marginBottom: 14,
                }}><ArrowLeft size={14} /> Voltar</button>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                        {selectedArea} — {selectedSerie}
                    </h3>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{habilidades.length} habilidades</span>
                </div>

                {loadingHabs ? (
                    <div style={{ textAlign: "center", padding: 30 }}><Loader2 size={24} className="animate-spin" style={{ color: "#3b82f6" }} /></div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {Object.entries(temas).map(([tema, items]) => (
                            <div key={tema} style={{
                                borderRadius: 14, overflow: "hidden",
                                border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                                background: "var(--bg-secondary, rgba(15,23,42,.4))",
                            }}>
                                <div style={{
                                    padding: "10px 16px", fontWeight: 700, fontSize: 13, color,
                                    borderBottom: "1px solid var(--border-default, rgba(148,163,184,.08))",
                                    background: `${color}08`,
                                }}>
                                    {tema} <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>({items.length})</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {items.map((h, i) => {
                                        // Extract code from habilidade text
                                        const codeMatch = h.habilidade.match(/^(EF\d+\w+\d+H?\d*|\(EF\d+\w+\d+\))/i);
                                        const code = codeMatch ? codeMatch[1].replace(/[()]/g, '') : '';
                                        return (
                                            <div key={i} style={{
                                                padding: "12px 16px",
                                                borderBottom: i < items.length - 1 ? "1px solid var(--border-default, rgba(148,163,184,.06))" : "none",
                                            }}>
                                                <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                                    {code && <span style={{
                                                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                                                        background: `${color}12`, color, whiteSpace: "nowrap",
                                                    }}>{code}</span>}
                                                    {h.competencia && <span style={{
                                                        fontSize: 10, color: "var(--text-muted)", overflow: "hidden",
                                                        textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300,
                                                    }}>{h.competencia.slice(0, 60)}...</span>}
                                                </div>
                                                <p style={{ fontSize: 13, color: "var(--text-primary)", margin: "0 0 4px", lineHeight: 1.5 }}>
                                                    {h.habilidade}
                                                </p>
                                                {h.descritor && (
                                                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                                                        📝 {h.descritor}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 4px" }}>
                Navegue pelas habilidades da matriz avaliativa por área do conhecimento e ano/série.
            </p>
            {areas.map(a => {
                const color = areaColors[a.area] || "#3b82f6";
                return (
                    <div key={a.area} style={{
                        borderRadius: 14, overflow: "hidden",
                        border: `1.5px solid ${color}30`,
                        background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    }}>
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 18px",
                            background: `${color}08`,
                            borderBottom: "1px solid var(--border-default, rgba(148,163,184,.08))",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                                <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text-primary)" }}>{a.area}</span>
                            </div>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.total} habilidades</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 18px" }}>
                            {a.series.sort().map(s => (
                                <button
                                    key={s}
                                    onClick={() => selectSerie(a.area, s)}
                                    style={{
                                        padding: "8px 16px", borderRadius: 10,
                                        background: `${color}08`, border: `1px solid ${color}25`,
                                        color, cursor: "pointer", fontSize: 13, fontWeight: 700,
                                        display: "flex", alignItems: "center", gap: 4,
                                        transition: "all .2s",
                                    }}
                                >
                                    {s} <ChevronRight size={14} />
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Manual de Aplicação Panel ──────────────────────────────────────────────

function ManualAplicacaoPanel() {
    const [manual, setManual] = useState<{ passo: number; titulo: string; instrucao: string }[]>([]);
    const [escala, setEscala] = useState<{ nivel: number; label: string; codigo: string; descritor: string; observar: string; suporte: string }[]>([]);
    const [adaptacoes, setAdaptacoes] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [expandedStep, setExpandedStep] = useState<number | null>(1);

    useEffect(() => {
        Promise.all([
            fetch("/api/avaliacao-diagnostica/matriz?section=manual").then(r => r.json()),
            fetch("/api/avaliacao-diagnostica/matriz?section=escala").then(r => r.json()),
        ]).then(([manualData, escalaData]) => {
            setManual(manualData.manual || []);
            setEscala(escalaData.escala || []);
            setAdaptacoes(escalaData.adaptacoes_nee || {});
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const nivelColors = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"];

    if (loading) return <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={28} className="animate-spin" style={{ color: "#3b82f6", margin: "0 auto" }} /></div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Step-by-step manual */}
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <BookMarked size={18} style={{ color: "#3b82f6" }} />
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Passo a Passo</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {manual.map(step => (
                        <div key={step.passo} style={{
                            borderRadius: 12, overflow: "hidden",
                            border: expandedStep === step.passo
                                ? "1.5px solid rgba(37,99,235,.3)"
                                : "1px solid var(--border-default, rgba(148,163,184,.1))",
                            background: "var(--bg-secondary, rgba(15,23,42,.4))",
                        }}>
                            <button
                                onClick={() => setExpandedStep(expandedStep === step.passo ? null : step.passo)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    width: "100%", padding: "12px 16px",
                                    border: "none", cursor: "pointer",
                                    background: expandedStep === step.passo ? "rgba(37,99,235,.05)" : "transparent",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 12, fontWeight: 800,
                                        background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                                        color: "#fff",
                                    }}>{step.passo}</span>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{step.titulo}</span>
                                </div>
                                {expandedStep === step.passo ? <ChevronUp size={16} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />}
                            </button>
                            {expandedStep === step.passo && (
                                <div style={{ padding: "0 16px 14px", fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)" }}>
                                    {step.instrucao}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Escala de Proficiência Omnisfera */}
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <Target size={18} style={{ color: "#8b5cf6" }} />
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Escala de Proficiência Omnisfera</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {escala.map(e => (
                        <div key={e.nivel} style={{
                            display: "flex", gap: 14, padding: "14px 16px", borderRadius: 12,
                            border: `1.5px solid ${nivelColors[e.nivel]}30`,
                            background: `${nivelColors[e.nivel]}06`,
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: `linear-gradient(135deg, ${nivelColors[e.nivel]}, ${nivelColors[e.nivel]}cc)`,
                                color: "#fff", fontSize: 18, fontWeight: 800,
                            }}>{e.nivel}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: nivelColors[e.nivel] }}>
                                    {e.label} <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>({e.codigo})</span>
                                </div>
                                <div style={{ fontSize: 13, color: "var(--text-primary)", marginTop: 2, lineHeight: 1.5 }}>
                                    {e.descritor}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                                    👁️ {e.observar}
                                </div>
                                <div style={{ fontSize: 11, color: nivelColors[e.nivel], marginTop: 4, fontWeight: 600 }}>
                                    Suporte: {e.suporte}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Adaptações por perfil NEE */}
            {Object.keys(adaptacoes).length > 0 && (
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <Users size={18} style={{ color: "#10b981" }} />
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Adaptações por Perfil NEE</h3>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                        {Object.entries(adaptacoes).map(([perfil, desc]) => (
                            <div key={perfil} style={{
                                padding: "14px 16px", borderRadius: 12,
                                border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                                background: "var(--bg-secondary, rgba(15,23,42,.4))",
                            }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#10b981", marginBottom: 6 }}>{perfil}</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
