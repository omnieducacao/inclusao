"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RubricaOmnisfera } from "@/components/RubricaOmnisfera";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import {
    Brain, Loader2, CheckCircle2, AlertTriangle,
    ChevronDown, ChevronUp, Sparkles, Save, ClipboardList, BarChart3,
    ArrowLeft, Users, BookOpen, Target, Zap, FileText, Layers, Activity,
    Grid3X3, BookMarked, ChevronRight, TrendingUp, Image, Trash2,
} from "lucide-react";
import { OnboardingPanel } from "@/components/OnboardingPanel";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";
import type { EngineId } from "@/lib/ai-engines";

const ENGINE_OPTIONS: { id: EngineId; label: string; color: string }[] = [
    { id: "red", label: "OmniRed (DeepSeek)", color: "#ef4444" },
    { id: "green", label: "OmniGreen (Claude)", color: "#10b981" },
    { id: "blue", label: "OmniBlue (Kimi)", color: "#3b82f6" },
    { id: "orange", label: "OmniOrange (GPT)", color: "#f59e0b" },
];

// Taxonomia de Bloom (reutilizada do Hub)
const TAXONOMIA_BLOOM: Record<string, string[]> = {
    "1. Lembrar": ["Citar", "Definir", "Identificar", "Listar", "Nomear", "Reconhecer", "Recordar"],
    "2. Entender": ["Classificar", "Descrever", "Explicar", "Expressar", "Resumir", "Traduzir"],
    "3. Aplicar": ["Aplicar", "Demonstrar", "Ilustrar", "Interpretar", "Operar", "Usar"],
    "4. Analisar": ["Analisar", "Comparar", "Contrastar", "Diferenciar", "Distinguir", "Examinar"],
    "5. Avaliar": ["Argumentar", "Avaliar", "Defender", "Julgar", "Selecionar", "Validar"],
    "6. Criar": ["Compor", "Construir", "Criar", "Desenvolver", "Formular", "Propor"],
};

// Mapear domínio cognitivo SAEB → domínios Bloom correspondentes
const SAEB_TO_BLOOM: Record<string, string[]> = {
    "I": ["1. Lembrar", "2. Entender"],
    "II": ["3. Aplicar", "4. Analisar"],
    "III": ["5. Avaliar", "6. Criar"],
};

/** Extrai o nível SAEB (I, II, III) do campo competencia */
function extractSaebLevel(competencia: string): string | null {
    const m = competencia.match(/^(I{1,3})\s*[–\-—]/i);
    return m ? m[1].toUpperCase() : null;
}

type ChecklistAdaptacao = Record<string, boolean>;

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

    const [activeTab, setActiveTab] = useState<"estudantes" | "matriz" | "manual" | "gabarito">("estudantes");
    const [pendingCount, setPendingCount] = useState(0);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('onboarding_diagnostica')) setShowOnboarding(true);
    }, []);

    // Navigation
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [selectedDisc, setSelectedDisc] = useState<string | null>(null);

    // NEE guidance from planos_genericos
    const [neeAlert, setNeeAlert] = useState<string>("");
    const [instrucaoDiag, setInstrucaoDiag] = useState<string>("");

    // Avaliação state
    const [gerando, setGerando] = useState(false);
    const [nivelIdentificado, setNivelIdentificado] = useState<number | null>(null);
    const [avalError, setAvalError] = useState("");

    // Plano de ensino vinculado
    const [planoVinculado, setPlanoVinculado] = useState<PlanoVinculado | null>(null);
    const [blocosPlano, setBlocosPlano] = useState<BlocoPlano[]>([]);
    const [showMatrix, setShowMatrix] = useState(false);

    // Matrix habilidades for item creation
    const [matrizHabs, setMatrizHabs] = useState<{ habilidade: string; tema: string; descritor: string; competencia: string }[]>([]);
    const [habsSelecionadas, setHabsSelecionadas] = useState<string[]>([]);
    const [qtdQuestoes, setQtdQuestoes] = useState(4);
    const [tipoQuestao, setTipoQuestao] = useState<"Objetiva" | "Discursiva">("Objetiva");

    // Hub-style config (Bloom, images, checklist, assunto, formatted result)
    const [assunto, setAssunto] = useState("");
    const [usarBloom, setUsarBloom] = useState(false);
    const [dominioBloomSel, setDominioBloomSel] = useState("");
    const [verbosBloomSel, setVerbosBloomSel] = useState<Record<string, string[]>>({});
    const [usarImagens, setUsarImagens] = useState(false);
    const [qtdImagens, setQtdImagens] = useState(0);
    const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
    const [resultadoFormatado, setResultadoFormatado] = useState<string | null>(null);
    const [mapaImagensResultado, setMapaImagensResultado] = useState<Record<number, string>>({});
    const [formatoInclusivo, setFormatoInclusivo] = useState(false);
    const [validadoFormatado, setValidadoFormatado] = useState(false);
    const [engineSel, setEngineSel] = useState<EngineId>("red");

    // ─── Gabarito de Respostas ────────────────────────────────────────────
    const [avaliacaoSalvaId, setAvaliacaoSalvaId] = useState<string | null>(null);
    const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
    const [respostasAluno, setRespostasAluno] = useState<Record<string, string>>({});
    const [showGabarito, setShowGabarito] = useState(false);
    const [analisando, setAnalisando] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [analiseResultado, setAnaliseResultado] = useState<Record<string, any> | null>(null);


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

    // Fetch pending assessments count for badge
    useEffect(() => {
        fetch('/api/pei/avaliacao-diagnostica?all=true')
            .then(r => r.json())
            .then(data => {
                const avs = data.avaliacoes || [];
                const pending = avs.filter((a: { status: string }) => a.status !== 'aplicada').length;
                setPendingCount(pending);
            })
            .catch(() => { });
    }, []);

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
                if (av.nivel_omnisfera_identificado != null) setNivelIdentificado(av.nivel_omnisfera_identificado);
            }
        } catch { /* silent */ }
    }, []);

    // ─── Select student + discipline ────────────────────────────────────

    const openAvaliacao = useCallback((aluno: Aluno, disciplina: string) => {
        setSelectedAluno(aluno);
        setSelectedDisc(disciplina);
        setNivelIdentificado(null);
        setAvalError("");
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

        // Fetch plano de curso genérico do ANO ANTERIOR
        // (se aluno está no 6º, a diagnóstica avalia o que deveria ter aprendido no 5º)
        const gradeNum = parseInt(aluno.grade?.match(/\d+/)?.[0] || "6", 10);
        const gradeAnterior = Math.max(gradeNum - 1, 1);
        const serieAnterior = aluno.grade?.replace(/\d+/, String(gradeAnterior)).replace(/\s*\(.*\)\s*$/, "").trim() || `${gradeAnterior}º Ano`;

        fetch(`/api/plano-curso?componente=${encodeURIComponent(disciplina)}&serie=${encodeURIComponent(serieAnterior)}`)
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

        // Fetch matrix habilidades do ANO ANTERIOR, filtradas por componente curricular
        const serieNameAnterior = `EF${gradeAnterior}`;

        fetch(`/api/avaliacao-diagnostica/matriz?disciplina=${encodeURIComponent(disciplina)}&serie=${serieNameAnterior}`)
            .then(r => r.json())
            .then(data => {
                setMatrizHabs(data.habilidades || []);
            })
            .catch(() => { });
    }, [loadExistingAvaliacao]);

    const goBack = () => {
        setSelectedAluno(null);
        setSelectedDisc(null);
        setNivelIdentificado(null);
        setPlanoVinculado(null);
        setBlocosPlano([]);
        setDimensoesNEE([]);
        setDimensoesAvaliadas({});
        setShowCamadaB(false);
        setPerfilGerado(null);
        setEstrategiasGeradas(null);
        setEvolucaoProcessual([]);
        setShowProcessual(false);
        setAvaliacaoSalvaId(null);
        setRespostasAluno({});
        setShowGabarito(false);
        setAnaliseResultado(null);
    };

    // ─── Salvar Avaliação no Supabase ────────────────────────────────────
    const salvarAvaliacao = async () => {
        if (!selectedAluno || !selectedDisc || !resultadoFormatado) return;
        setSalvandoAvaliacao(true);
        try {
            const res = await fetch("/api/pei/avaliacao-diagnostica/salvar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: selectedAluno.id,
                    disciplina: selectedDisc,
                    questoes_geradas: resultadoFormatado,
                    habilidades_bncc: habsSelecionadas.length > 0 ? habsSelecionadas : matrizHabs.slice(0, 4).map(h => h.habilidade),
                    plano_ensino_id: planoVinculado?.id || undefined,
                }),
            });
            const data = await res.json();
            if (data.ok && data.avaliacao?.id) {
                setAvaliacaoSalvaId(data.avaliacao.id);
                setValidadoFormatado(true);
            }
        } catch { /* silent */ }
        setSalvandoAvaliacao(false);
    };

    // ─── Analisar Respostas + Calcular Nível ─────────────────────────────
    const analisarRespostas = async () => {
        if (!avaliacaoSalvaId || Object.keys(respostasAluno).length === 0) return;
        setAnalisando(true);
        try {
            // Parse questions from the formatted result to get gabarito
            const questoes = extrairQuestoes(resultadoFormatado || "");
            const totalQ = questoes.length;
            let acertos = 0;
            const distratoresAtivados: { questao: number; marcada: string; correta: string; habilidade: string }[] = [];
            const habDominadas: string[] = [];
            const habDesenvolvimento: string[] = [];

            questoes.forEach((q, i) => {
                const marcada = respostasAluno[`q${i + 1}`];
                if (marcada === q.gabarito) {
                    acertos++;
                    if (q.habilidade && !habDominadas.includes(q.habilidade)) habDominadas.push(q.habilidade);
                } else if (marcada) {
                    distratoresAtivados.push({
                        questao: i + 1,
                        marcada,
                        correta: q.gabarito,
                        habilidade: q.habilidade || `Questão ${i + 1}`,
                    });
                    if (q.habilidade && !habDesenvolvimento.includes(q.habilidade)) habDesenvolvimento.push(q.habilidade);
                }
            });

            const score = totalQ > 0 ? Math.round((acertos / totalQ) * 100) : 0;
            // Map score to Omnisfera level (0-4)
            const nivel = score >= 90 ? 4 : score >= 70 ? 3 : score >= 50 ? 2 : score >= 25 ? 1 : 0;

            const analise = {
                total: totalQ,
                acertos,
                score,
                nivel,
                distratores: distratoresAtivados,
                hab_dominadas: habDominadas,
                hab_desenvolvimento: habDesenvolvimento,
            };

            setAnaliseResultado(analise);
            setNivelIdentificado(nivel);

            // Persist to Supabase
            await fetch("/api/pei/avaliacao-diagnostica", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: avaliacaoSalvaId,
                    resultados: {
                        respostas: respostasAluno,
                        analise,
                    },
                    nivel_omnisfera_identificado: nivel,
                    status: "aplicada",
                }),
            });
        } catch { /* silent */ }
        setAnalisando(false);
    };

    // ─── Helper: extrair questões do markdown ─────────────────────────────
    const extrairQuestoes = (texto: string): { gabarito: string; habilidade: string }[] => {
        const questoes: { gabarito: string; habilidade: string }[] = [];
        // Match patterns like "Gabarito: A" or "**Gabarito:** A" or "Resposta correta: B"
        const gabRegex = /(?:gabarito|resposta\s*correta)[:\s]*\**([A-D])\**/gi;
        const habRegex = /(?:habilidade|BNCC)[:\s]*\**([^\n*]+)/gi;
        const gabs: string[] = [];
        const habs: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = gabRegex.exec(texto)) !== null) gabs.push(m[1].toUpperCase());
        while ((m = habRegex.exec(texto)) !== null) habs.push(m[1].trim());
        for (let i = 0; i < gabs.length; i++) {
            questoes.push({ gabarito: gabs[i], habilidade: habs[i] || "" });
        }
        return questoes;
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

                {/* Rubrica reference */}
                {(nivelIdentificado !== null || !gerando) && (
                    <div style={{ marginBottom: 20 }}>
                        <RubricaOmnisfera
                            nivelAtual={nivelIdentificado !== null ? nivelIdentificado as 0 | 1 | 2 | 3 | 4 : undefined}
                        />
                    </div>
                )}

                {/* Step 0: Config + Generate */}
                {!resultadoFormatado && !gerando && nivelIdentificado === null && (
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
                                            Plano de Curso (ano anterior) — {planoVinculado.disciplina}
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
                                <FileText size={16} /> Nenhum plano de curso genérico encontrado para esta disciplina/série.
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
                                                            const newSelected = selected
                                                                ? habsSelecionadas.filter(x => x !== h.habilidade)
                                                                : [...habsSelecionadas, h.habilidade];
                                                            setHabsSelecionadas(newSelected);

                                                            // Auto-ativar Bloom com base no domínio cognitivo SAEB
                                                            if (!selected && h.competencia) {
                                                                const saebLevel = extractSaebLevel(h.competencia);
                                                                if (saebLevel) {
                                                                    const bloomDomains = SAEB_TO_BLOOM[saebLevel];
                                                                    if (bloomDomains?.length) {
                                                                        setUsarBloom(true);
                                                                        setDominioBloomSel(bloomDomains[0]);
                                                                        const newVerbos: Record<string, string[]> = {};
                                                                        for (const dom of bloomDomains) {
                                                                            newVerbos[dom] = (TAXONOMIA_BLOOM[dom] || []).slice(0, 3);
                                                                        }
                                                                        setVerbosBloomSel(prev => ({ ...prev, ...newVerbos }));
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                        style={{ marginTop: 2, accentColor: "#6366f1" }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                            {code && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "rgba(99,102,241,.1)", color: "#818cf8" }}>{code}</span>}
                                                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{h.tema}</span>
                                                        </div>
                                                        <div style={{ fontSize: 12, color: "var(--text-primary)", marginTop: 2, lineHeight: 1.4 }}>
                                                            {h.competencia && <span style={{ fontSize: 10, fontWeight: 600, color: "#a855f7", display: "block", marginBottom: 2 }}>{h.competencia}</span>}
                                                            {h.habilidade}
                                                        </div>
                                                        {h.descritor && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>📝 {h.descritor}</div>}
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
                                                min={4}
                                                max={20}
                                                value={qtdQuestoes}
                                                onChange={e => setQtdQuestoes(Number(e.target.value))}
                                                style={{ flex: 1, accentColor: qtdQuestoes < 8 ? "#f59e0b" : "#3b82f6" }}
                                            />
                                            <span style={{ fontSize: 14, fontWeight: 800, color: qtdQuestoes < 8 ? "#f59e0b" : "#3b82f6", minWidth: 20, textAlign: "center" }}>{qtdQuestoes}</span>
                                        </div>
                                        {qtdQuestoes < 8 && (
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 6,
                                                marginTop: 6, padding: "6px 10px", borderRadius: 6,
                                                background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.15)",
                                                fontSize: 10, color: "#f59e0b", fontWeight: 600,
                                            }}>
                                                <AlertTriangle size={12} /> Mínimo de 8 questões recomendado para confiabilidade diagnóstica
                                            </div>
                                        )}
                                        {qtdQuestoes >= 8 && (
                                            <div style={{
                                                marginTop: 6, padding: "6px 10px", borderRadius: 6,
                                                background: "rgba(99,102,241,.04)", fontSize: 10,
                                                color: "var(--text-muted)", lineHeight: 1.5,
                                            }}>
                                                📊 Distribuição sugerida: <strong style={{ color: "#10b981" }}>{Math.round(qtdQuestoes * 0.33)} fáceis</strong> · <strong style={{ color: "#3b82f6" }}>{Math.round(qtdQuestoes * 0.42)} médias</strong> · <strong style={{ color: "#8b5cf6" }}>{Math.round(qtdQuestoes * 0.25)} difíceis</strong>
                                            </div>
                                        )}
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

                                {/* Motor de IA */}
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Motor de IA</label>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {ENGINE_OPTIONS.map(eng => (
                                            <button
                                                key={eng.id}
                                                onClick={() => setEngineSel(eng.id)}
                                                style={{
                                                    padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                                                    border: engineSel === eng.id ? `2px solid ${eng.color}` : "1px solid var(--border-default, rgba(148,163,184,.12))",
                                                    background: engineSel === eng.id ? `${eng.color}15` : "transparent",
                                                    color: engineSel === eng.id ? eng.color : "var(--text-muted)",
                                                    cursor: "pointer", transition: "all .15s",
                                                }}
                                            >{eng.label}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Assunto / tema */}
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
                                        Assunto / Tema (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={assunto}
                                        onChange={e => setAssunto(e.target.value)}
                                        placeholder={habsSelecionadas.length > 0 ? "Opcional — BNCC já selecionada" : "Ex: Frações, Sistema Solar..."}
                                        style={{
                                            width: "100%", padding: "8px 12px", borderRadius: 8,
                                            border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                            background: "var(--bg-primary, rgba(2,6,23,.3))",
                                            color: "var(--text-primary)", fontSize: 13,
                                        }}
                                    />
                                </div>

                                {/* Imagens */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={usarImagens}
                                            onChange={e => {
                                                setUsarImagens(e.target.checked);
                                                if (!e.target.checked) setQtdImagens(0);
                                                else if (qtdImagens === 0) setQtdImagens(Math.floor(qtdQuestoes / 2));
                                            }}
                                            style={{ accentColor: "#3b82f6" }}
                                        />
                                        <Image size={14} style={{ color: "#3b82f6" }} />
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Incluir Imagens</span>
                                    </label>
                                    {usarImagens && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <input
                                                type="range" min={1} max={qtdQuestoes} value={qtdImagens}
                                                onChange={e => setQtdImagens(Number(e.target.value))}
                                                style={{ flex: 1, accentColor: "#3b82f6" }}
                                            />
                                            <span style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>{qtdImagens}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Bloom + Checklist row */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    {/* Bloom */}
                                    <details style={{ border: "1px solid var(--border-default, rgba(148,163,184,.12))", borderRadius: 10 }}>
                                        <summary style={{ padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                                            🧠 Taxonomia de Bloom
                                        </summary>
                                        <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                                            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                                                <input type="checkbox" checked={usarBloom} onChange={e => {
                                                    setUsarBloom(e.target.checked);
                                                    if (!e.target.checked) { setDominioBloomSel(""); setVerbosBloomSel({}); }
                                                    else if (!dominioBloomSel) setDominioBloomSel(Object.keys(TAXONOMIA_BLOOM)[0]);
                                                }} style={{ accentColor: "#6366f1" }} />
                                                <span style={{ fontSize: 11, color: "var(--text-primary)" }}>Usar Bloom</span>
                                            </label>
                                            {usarBloom && (
                                                <>
                                                    <select value={dominioBloomSel} onChange={e => { setDominioBloomSel(e.target.value); if (!verbosBloomSel[e.target.value]) setVerbosBloomSel(p => ({ ...p, [e.target.value]: [] })); }}
                                                        style={{ width: "100%", padding: "6px 8px", borderRadius: 6, fontSize: 11, border: "1px solid var(--border-default)", background: "var(--bg-primary)" }}>
                                                        <option value="">Categoria</option>
                                                        {Object.keys(TAXONOMIA_BLOOM).map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                    {dominioBloomSel && TAXONOMIA_BLOOM[dominioBloomSel] && (
                                                        <select multiple value={verbosBloomSel[dominioBloomSel] || []} onChange={e => { const s = Array.from(e.target.selectedOptions, o => o.value); setVerbosBloomSel(p => ({ ...p, [dominioBloomSel]: s })); }}
                                                            style={{ width: "100%", padding: "4px 6px", borderRadius: 6, fontSize: 10, minHeight: 80, border: "1px solid var(--border-default)", background: "var(--bg-primary)" }}>
                                                            {TAXONOMIA_BLOOM[dominioBloomSel].map(v => <option key={v} value={v}>{v}</option>)}
                                                        </select>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </details>

                                    {/* Checklist */}
                                    <details style={{ border: "1px solid var(--border-default, rgba(148,163,184,.12))", borderRadius: 10 }}>
                                        <summary style={{ padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                                            ♿ Checklist Adaptação
                                        </summary>
                                        <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                                            {[
                                                { k: "instrucoes_passo_a_passo", l: "Instruções passo a passo" },
                                                { k: "paragrafos_curtos", l: "Parágrafos curtos" },
                                                { k: "dicas_apoio", l: "Dicas de apoio" },
                                                { k: "descricao_imagens", l: "Descrição de imagens" },
                                                { k: "dividir_em_etapas", l: "Dividir em etapas" },
                                            ].map(({ k, l }) => (
                                                <label key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-primary)", cursor: "pointer" }}>
                                                    <input type="checkbox" checked={!!checklist[k]} onChange={e => setChecklist(c => ({ ...c, [k]: e.target.checked }))} style={{ accentColor: "#6366f1" }} />
                                                    {l}
                                                </label>
                                            ))}
                                        </div>
                                    </details>
                                </div>

                                <button onClick={async () => {
                                    if (!selectedAluno || !selectedDisc) return;
                                    setGerando(true);
                                    setResultadoFormatado(null);
                                    setMapaImagensResultado({});
                                    setValidadoFormatado(false);
                                    try {
                                        const verbosFinais = usarBloom ? Object.values(verbosBloomSel).flat() : [];
                                        const res = await fetch("/api/hub/criar-itens", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                assunto: assunto.trim() || (habsSelecionadas.length > 0 ? habsSelecionadas[0] : selectedDisc),
                                                engine: engineSel,
                                                habilidades: habsSelecionadas.length > 0
                                                    ? matrizHabs.filter(h => habsSelecionadas.includes(h.habilidade)).map(h => {
                                                        const codeMatch = h.habilidade.match(/^(EF\d+\w+\d+H?\d*|\(EF\d+\w+\d+\))/i);
                                                        return `[${codeMatch ? codeMatch[1].replace(/[()]/g, '') : ''}] ${h.competencia ? `(${h.competencia}) ` : ''}${h.habilidade}${h.descritor ? ` | ${h.descritor}` : ''}`;
                                                    })
                                                    : matrizHabs.slice(0, 4).map(h => h.habilidade),
                                                verbos_bloom: verbosFinais.length > 0 ? verbosFinais : undefined,
                                                qtd_questoes: qtdQuestoes,
                                                distribuicao_cognitiva: qtdQuestoes >= 8 ? {
                                                    facil: Math.round(qtdQuestoes * 0.33),
                                                    medio: Math.round(qtdQuestoes * 0.42),
                                                    dificil: Math.round(qtdQuestoes * 0.25),
                                                } : undefined,
                                                tipo_questao: tipoQuestao,
                                                qtd_imagens: usarImagens ? qtdImagens : 0,
                                                checklist_adaptacao: Object.keys(checklist).length > 0 ? checklist : undefined,
                                                estudante: {
                                                    nome: selectedAluno.name,
                                                    serie: selectedAluno.grade,
                                                    hiperfoco: undefined,
                                                    perfil: selectedAluno.diagnostico || undefined,
                                                },
                                            }),
                                        });
                                        const data = await res.json();
                                        if (!res.ok) throw new Error(data.error || "Erro");
                                        let textoFinal = data.texto || "Atividade gerada.";
                                        if (textoFinal.includes("---DIVISOR---")) {
                                            const parts = textoFinal.split("---DIVISOR---");
                                            const analise = parts[0]?.replace("[ANÁLISE PEDAGÓGICA]", "").trim();
                                            const atividade = parts[1]?.replace("[ATIVIDADE]", "").trim() || textoFinal;
                                            textoFinal = analise ? `## Análise Pedagógica\n\n${analise}\n\n---\n\n## Atividade\n\n${atividade}` : atividade;
                                        }
                                        // Process images
                                        const mapa: Record<number, string> = {};
                                        if (usarImagens && qtdImagens > 0) {
                                            const genImgRegex = /\[\[GEN_IMG:\s*([^\]]+)\]\]/gi;
                                            const termos: string[] = [];
                                            let m: RegExpExecArray | null;
                                            while ((m = genImgRegex.exec(textoFinal)) !== null) termos.push(m[1].trim());
                                            for (let i = 0; i < termos.length && i < qtdImagens; i++) {
                                                try {
                                                    const imgRes = await fetch("/api/hub/gerar-imagem", {
                                                        method: "POST", headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ prompt: termos[i], prioridade: "BANCO" }),
                                                    });
                                                    const imgData = await imgRes.json();
                                                    if (imgRes.ok && imgData.image) {
                                                        const imgStr = imgData.image as string;
                                                        const base64 = imgStr.startsWith("data:image") ? imgStr.replace(/^data:image\/\w+;base64,/, "") : imgStr;
                                                        if (base64?.length > 100) mapa[i + 1] = base64;
                                                    }
                                                } catch { /* silent */ }
                                            }
                                            let idx = 0;
                                            textoFinal = textoFinal.replace(/\[\[GEN_IMG:\s*[^\]]+\]\]/gi, () => { idx++; return `[[IMG_${idx}]]`; });
                                        }
                                        setMapaImagensResultado(mapa);
                                        setResultadoFormatado(textoFinal);
                                    } catch (err) {
                                        setAvalError(err instanceof Error ? err.message : "Erro ao gerar");
                                    }
                                    setGerando(false);
                                }} disabled={gerando} style={{
                                    width: "100%", padding: "16px 24px", borderRadius: 12,
                                    background: gerando ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #818cf8)",
                                    color: "#fff", border: "none", cursor: gerando ? "wait" : "pointer",
                                    fontWeight: 700, fontSize: 15,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                    boxShadow: "0 4px 20px rgba(99,102,241,.3)",
                                }}>
                                    {gerando ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                    {gerando ? "Gerando itens com IA..." : "Gerar Itens com IA"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formatted result (Hub-style) */}
                {resultadoFormatado && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {!validadoFormatado && (
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={salvarAvaliacao} disabled={salvandoAvaliacao} style={{
                                    padding: "8px 16px", borderRadius: 8, border: "none", cursor: salvandoAvaliacao ? "wait" : "pointer",
                                    background: salvandoAvaliacao ? "#94a3b8" : "linear-gradient(135deg, #059669, #10b981)",
                                    color: "#fff", fontSize: 13, fontWeight: 700,
                                    display: "flex", alignItems: "center", gap: 6,
                                }}>
                                    {salvandoAvaliacao ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    {salvandoAvaliacao ? "Salvando..." : "Validar e Salvar Avaliação"}
                                </button>
                                <button onClick={() => { setResultadoFormatado(null); setValidadoFormatado(false); }} style={{
                                    padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                                    background: "transparent", color: "var(--text-muted)",
                                    border: "1px solid var(--border-default, rgba(148,163,184,.15))", fontSize: 13,
                                }}>
                                    🗑️ Descartar
                                </button>
                            </div>
                        )}
                        {validadoFormatado && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", color: "#10b981", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                                    <CheckCircle2 size={14} /> AVALIAÇÃO SALVA — Imprima, aplique e lance as respostas abaixo
                                </div>
                                {/* Toggle gabarito */}
                                <button onClick={() => setShowGabarito(!showGabarito)} style={{
                                    padding: "12px 18px", borderRadius: 10, border: "2px solid rgba(99,102,241,.2)",
                                    background: showGabarito ? "rgba(99,102,241,.08)" : "transparent",
                                    color: "#818cf8", fontSize: 14, fontWeight: 700, cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 8,
                                }}>
                                    <ClipboardList size={16} />
                                    {showGabarito ? "Ocultar Gabarito" : "📋 Lançar Respostas do Estudante"}
                                </button>
                            </div>
                        )}

                        {/* ── Gabarito de Respostas ──────────────────────────── */}
                        {showGabarito && validadoFormatado && (() => {
                            const questoes = extrairQuestoes(resultadoFormatado || "");
                            const totalQ = questoes.length || qtdQuestoes;
                            return (
                                <div style={{
                                    ...cardS,
                                    border: "2px solid rgba(99,102,241,.2)",
                                    background: "rgba(99,102,241,.02)",
                                }}>
                                    <div style={{ ...headerS, background: "rgba(99,102,241,.05)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <ClipboardList size={16} style={{ color: "#818cf8" }} />
                                            <span style={{ fontWeight: 700, fontSize: 14, color: "#818cf8" }}>
                                                Gabarito — Respostas do Estudante
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                            {Object.keys(respostasAluno).length} de {totalQ} respondidas
                                        </span>
                                    </div>
                                    <div style={{ ...bodyS, display: "flex", flexDirection: "column", gap: 10 }}>
                                        {Array.from({ length: totalQ }, (_, i) => {
                                            const qKey = `q${i + 1}`;
                                            const marcada = respostasAluno[qKey];
                                            const gabCorreto = questoes[i]?.gabarito;
                                            const temAnalise = !!analiseResultado;
                                            return (
                                                <div key={i} style={{
                                                    display: "flex", alignItems: "center", gap: 10,
                                                    padding: "8px 12px", borderRadius: 8,
                                                    background: temAnalise && marcada
                                                        ? (marcada === gabCorreto ? "rgba(16,185,129,.06)" : "rgba(239,68,68,.06)")
                                                        : "transparent",
                                                    border: temAnalise && marcada
                                                        ? `1px solid ${marcada === gabCorreto ? "rgba(16,185,129,.2)" : "rgba(239,68,68,.2)"}`
                                                        : "1px solid var(--border-default, rgba(148,163,184,.1))",
                                                }}>
                                                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", minWidth: 32 }}>
                                                        Q{i + 1}
                                                    </span>
                                                    {["A", "B", "C", "D"].map(alt => {
                                                        const isSelected = marcada === alt;
                                                        const isCorrect = temAnalise && alt === gabCorreto;
                                                        const isWrong = temAnalise && isSelected && alt !== gabCorreto;
                                                        return (
                                                            <button
                                                                key={alt}
                                                                onClick={() => {
                                                                    if (analiseResultado) return; // Locked after analysis
                                                                    setRespostasAluno(prev => ({ ...prev, [qKey]: alt }));
                                                                }}
                                                                style={{
                                                                    width: 36, height: 36, borderRadius: 8,
                                                                    border: isSelected
                                                                        ? `2px solid ${isWrong ? "#ef4444" : isCorrect ? "#10b981" : "#818cf8"}`
                                                                        : isCorrect ? "2px solid #10b981" : "1px solid var(--border-default, rgba(148,163,184,.15))",
                                                                    background: isSelected
                                                                        ? (isWrong ? "rgba(239,68,68,.1)" : isCorrect ? "rgba(16,185,129,.1)" : "rgba(99,102,241,.1)")
                                                                        : isCorrect ? "rgba(16,185,129,.06)" : "transparent",
                                                                    color: isSelected
                                                                        ? (isWrong ? "#ef4444" : isCorrect ? "#10b981" : "#818cf8")
                                                                        : isCorrect ? "#10b981" : "var(--text-secondary, #94a3b8)",
                                                                    fontWeight: 700, fontSize: 13,
                                                                    cursor: analiseResultado ? "default" : "pointer",
                                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                                    transition: "all .15s",
                                                                }}
                                                            >
                                                                {alt}
                                                            </button>
                                                        );
                                                    })}
                                                    {temAnalise && marcada && (
                                                        <span style={{ fontSize: 12, marginLeft: 4 }}>
                                                            {marcada === gabCorreto ? "✅" : `❌ (${gabCorreto})`}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* Actions */}
                                        {!analiseResultado ? (
                                            <button
                                                onClick={analisarRespostas}
                                                disabled={analisando || Object.keys(respostasAluno).length === 0}
                                                style={{
                                                    width: "100%", padding: "14px 20px", borderRadius: 10,
                                                    background: analisando ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #818cf8)",
                                                    color: "#fff", border: "none", fontSize: 14, fontWeight: 700,
                                                    cursor: analisando ? "wait" : "pointer",
                                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                                    opacity: Object.keys(respostasAluno).length === 0 ? 0.5 : 1,
                                                }}
                                            >
                                                {analisando ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
                                                {analisando ? "Analisando..." : "Salvar e Analisar Respostas"}
                                            </button>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                                                {/* Score + Level */}
                                                <div style={{
                                                    display: "flex", gap: 12, flexWrap: "wrap",
                                                }}>
                                                    <div style={{
                                                        flex: 1, minWidth: 120, padding: "14px 16px", borderRadius: 10,
                                                        background: "rgba(99,102,241,.06)", border: "1px solid rgba(99,102,241,.15)",
                                                        textAlign: "center",
                                                    }}>
                                                        <div style={{ fontSize: 28, fontWeight: 800, color: "#818cf8" }}>
                                                            {analiseResultado.score}%
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                                            {analiseResultado.acertos}/{analiseResultado.total} acertos
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        flex: 1, minWidth: 120, padding: "14px 16px", borderRadius: 10,
                                                        background: `rgba(${analiseResultado.nivel >= 3 ? "16,185,129" : analiseResultado.nivel >= 2 ? "245,158,11" : "239,68,68"},.06)`,
                                                        border: `1px solid rgba(${analiseResultado.nivel >= 3 ? "16,185,129" : analiseResultado.nivel >= 2 ? "245,158,11" : "239,68,68"},.15)`,
                                                        textAlign: "center",
                                                    }}>
                                                        <div style={{
                                                            fontSize: 28, fontWeight: 800,
                                                            color: analiseResultado.nivel >= 3 ? "#10b981" : analiseResultado.nivel >= 2 ? "#f59e0b" : "#ef4444",
                                                        }}>
                                                            N{analiseResultado.nivel}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                                            {ESCALA_OMNISFERA[analiseResultado.nivel as NivelOmnisfera]?.label || ""}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Habilidades */}
                                                {analiseResultado.hab_dominadas?.length > 0 && (
                                                    <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,.05)", border: "1px solid rgba(16,185,129,.15)" }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>✅ Habilidades Dominadas</span>
                                                        <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                            {(analiseResultado.hab_dominadas as string[]).map((h: string, i: number) => (
                                                                <span key={i} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(16,185,129,.1)", color: "#10b981", fontWeight: 600 }}>{h}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {analiseResultado.hab_desenvolvimento?.length > 0 && (
                                                    <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(245,158,11,.05)", border: "1px solid rgba(245,158,11,.15)" }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b" }}>🔄 Em Desenvolvimento</span>
                                                        <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                            {(analiseResultado.hab_desenvolvimento as string[]).map((h: string, i: number) => (
                                                                <span key={i} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(245,158,11,.1)", color: "#f59e0b", fontWeight: 600 }}>{h}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Distratores */}
                                                {analiseResultado.distratores?.length > 0 && (
                                                    <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,.04)", border: "1px solid rgba(239,68,68,.12)" }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444" }}>🔍 Análise de Distratores</span>
                                                        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                                                            {(analiseResultado.distratores as { questao: number; marcada: string; correta: string; habilidade: string }[]).map((d, i) => (
                                                                <div key={i} style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                                                                    <strong>Q{d.questao}</strong>: marcou <strong style={{ color: "#ef4444" }}>{d.marcada}</strong>, correto era <strong style={{ color: "#10b981" }}>{d.correta}</strong>
                                                                    {d.habilidade && <span style={{ color: "var(--text-muted)" }}> — {d.habilidade}</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                        <div style={{
                            ...cardS, padding: 0,
                            border: "2px solid rgba(99,102,241,.2)",
                        }}>
                            <div style={{
                                ...headerS, background: "rgba(99,102,241,.05)",
                                justifyContent: "space-between",
                            }}>
                                <span style={{ fontWeight: 700, fontSize: 14, color: "#818cf8" }}>Prova Gerada</span>
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#818cf8", cursor: "pointer", background: "rgba(99,102,241,.08)", padding: "3px 8px", borderRadius: 6 }}>
                                        <input type="checkbox" checked={formatoInclusivo} onChange={e => setFormatoInclusivo(e.target.checked)} style={{ accentColor: "#6366f1" }} />
                                        ♿ Inclusivo
                                    </label>
                                    <DocxDownloadButton
                                        texto={resultadoFormatado}
                                        titulo="Avaliação Diagnóstica"
                                        filename={`Avaliacao_${selectedDisc || ""}_${new Date().toISOString().slice(0, 10)}.docx`}
                                        mapaImagens={Object.keys(mapaImagensResultado).length > 0 ? mapaImagensResultado : undefined}
                                        formatoInclusivo={formatoInclusivo}
                                    />
                                    <PdfDownloadButton
                                        text={resultadoFormatado}
                                        filename={`Avaliacao_${selectedDisc || ""}_${new Date().toISOString().slice(0, 10)}.pdf`}
                                        title="Avaliação Diagnóstica"
                                        formatoInclusivo={formatoInclusivo}
                                    />
                                </div>
                            </div>
                            <div style={bodyS}>
                                <FormattedTextDisplay
                                    texto={resultadoFormatado}
                                    mapaImagens={Object.keys(mapaImagensResultado).length > 0 ? mapaImagensResultado : undefined}
                                />
                            </div>
                        </div>
                        <button onClick={() => { setResultadoFormatado(null); setValidadoFormatado(false); }} style={{
                            padding: "10px 18px", borderRadius: 10,
                            background: "transparent", color: "var(--text-muted, #94a3b8)",
                            border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                            cursor: "pointer", fontSize: 13, textAlign: "center",
                        }}>
                            Gerar nova prova
                        </button>
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


                {/* ─── CAMADA B: Cognitivo-Funcional ──────────────────── */}
                {
                    nivelIdentificado !== null && dimensoesNEE.length > 0 && (
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
                    )
                }

                {/* ─── Generate V3 Outputs ─────────────────────────────── */}
                {
                    nivelIdentificado !== null && (
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
                    )
                }

                {/* ─── Perfil de Funcionamento Output ─────────────────── */}
                {
                    perfilGerado && (
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
                    )
                }

                {/* ─── Estratégias Práticas Output ────────────────────── */}
                {
                    estrategiasGeradas && (
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
                    )
                }

                {/* ─── Processual Data Feed ──────────────────────────── */}
                {
                    evolucaoProcessual.length > 0 && evolucaoProcessual[0]?.periodos?.length > 0 && (
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
                    )
                }

                {/* ─── Diagnóstica vs Processual Comparison ─────────── */}
                {
                    nivelIdentificado !== null && evolucaoProcessual.length > 0 && evolucaoProcessual[0]?.media_mais_recente !== null && (
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
                    )
                }

                {/* No processual data - show link */}
                {
                    evolucaoProcessual.length === 0 && nivelIdentificado !== null && (
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
                    )
                }
            </div >
        );
    }

    // ─── Student List ───────────────────────────────────────────────────

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Onboarding Panel */}
            {showOnboarding && (
                <OnboardingPanel
                    moduleKey="diagnostica"
                    moduleTitle="Bem-vindo à Avaliação Diagnóstica"
                    moduleSubtitle="Identifique o nível de cada estudante com questões adaptadas por IA"
                    accentColor="#2563eb"
                    accentColorLight="#3b82f6"
                    steps={[
                        { icon: <Users size={22} />, title: "Selecionar", description: "Estudante + disciplina + habilidades" },
                        { icon: <Sparkles size={22} />, title: "Gerar", description: "Questões adaptadas via IA" },
                        { icon: <ClipboardList size={22} />, title: "Aplicar", description: "Registrar respostas no gabarito" },
                        { icon: <BarChart3 size={22} />, title: "Relatório", description: "Ver análise e nível Omnisfera" },
                    ]}
                    onStart={() => setShowOnboarding(false)}
                />
            )}

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

            {/* ── Stepper: Jornada do Professor ── */}
            <div style={{
                display: "flex", alignItems: "center", gap: 0, marginBottom: 16,
                padding: "14px 20px", borderRadius: 12,
                background: "var(--bg-secondary, rgba(15,23,42,.4))",
                border: "1px solid var(--border-default, rgba(148,163,184,.1))",
            }}>
                {[
                    { num: 1, label: "Selecionar", sub: "Estudante + disciplina", color: "#3b82f6" },
                    { num: 2, label: "Gerar", sub: "Questões via IA", color: "#8b5cf6" },
                    { num: 3, label: "Aplicar", sub: "Registrar respostas", color: "#f59e0b" },
                    { num: 4, label: "Relatório", sub: "Ver análise completa", color: "#10b981" },
                ].map((step, i) => (
                    <React.Fragment key={step.num}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 800,
                                background: `${step.color}18`, color: step.color,
                                border: `1.5px solid ${step.color}40`,
                            }}>{step.num}</div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: step.color }}>{step.label}</div>
                                <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{step.sub}</div>
                            </div>
                        </div>
                        {i < 3 && (
                            <div style={{ width: 24, height: 2, background: "var(--border-default, rgba(148,163,184,.15))", flexShrink: 0 }} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* AEE Alert for low-level students */}
            {alunos.filter(a => {
                const discs = a.disciplinas || [];
                return discs.some((d: { nivel_omnisfera?: number | null }) => d.nivel_omnisfera !== null && d.nivel_omnisfera !== undefined && d.nivel_omnisfera < 2);
            }).length > 0 && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                        borderRadius: 10, marginBottom: 16,
                        background: "rgba(239,68,68,.05)", border: "1px solid rgba(239,68,68,.15)",
                    }}>
                        <span style={{ fontSize: 16 }}>🚨</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>Atenção AEE</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                {alunos.filter(a => (a.disciplinas || []).some((d: { nivel_omnisfera?: number | null }) => d.nivel_omnisfera !== null && d.nivel_omnisfera !== undefined && d.nivel_omnisfera < 2)).length} estudante(s)
                                com nível Omnisfera {'<'} 2. Considere revisar o PEI e estratégias de suporte.
                            </div>
                        </div>
                        <a href="/pei" style={{
                            fontSize: 11, fontWeight: 700, color: "#ef4444", textDecoration: "none",
                            padding: "4px 10px", borderRadius: 6,
                            background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.15)",
                        }}>Revisar PEI →</a>
                    </div>
                )}

            {/* ── Tab Bar ── */}
            <div style={{
                display: "flex", gap: 4, padding: 4, borderRadius: 12,
                background: "var(--bg-secondary, rgba(15,23,42,.4))",
                border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                marginBottom: 20,
            }}>
                {([
                    { key: "estudantes" as const, label: "Estudantes", icon: <Users size={14} /> },
                    { key: "gabarito" as const, label: "Respostas", icon: <ClipboardList size={14} />, badge: pendingCount },
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
                            border: "none", position: "relative",
                            background: activeTab === tab.key ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "transparent",
                            color: activeTab === tab.key ? "#fff" : "var(--text-muted, #94a3b8)",
                            transition: "all .2s",
                        }}
                    >
                        {tab.icon} {tab.label}
                        {'badge' in tab && (tab as { badge?: number }).badge != null && (tab as { badge?: number }).badge! > 0 && (
                            <span style={{
                                position: "absolute", top: 4, right: 8,
                                width: 18, height: 18, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, fontWeight: 800,
                                background: "#ef4444", color: "#fff",
                            }}>{(tab as { badge?: number }).badge}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Tab: Matriz de Referência ── */}
            {activeTab === "matriz" && <MatrizReferenciaPanel />}

            {/* ── Tab: Manual de Aplicação ── */}
            {activeTab === "manual" && <ManualAplicacaoPanel />}

            {/* ── Tab: Gabarito / Respostas ── */}
            {activeTab === "gabarito" && <GabaritoRespostasPanel alunos={alunos} />}

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

// ─── Gabarito / Respostas Panel ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GabaritoRespostasPanel({ alunos }: { alunos: any[] }) {
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

    // Parse questions from the saved text
    const extrairQuestoesTexto = (texto: string): { gabarito: string; habilidade: string }[] => {
        const questoes: { gabarito: string; habilidade: string }[] = [];
        const gabRegex = /(?:gabarito|resposta\s*correta)[:\s]*\**([A-D])\**/gi;
        const habRegex = /(?:habilidade|BNCC)[:\s]*\**([A-Za-z0-9]+)\**/gi;
        const gabs = [...texto.matchAll(gabRegex)].map(m => m[1].toUpperCase());
        const habs = [...texto.matchAll(habRegex)].map(m => m[1]);
        for (let i = 0; i < gabs.length; i++) {
            questoes.push({ gabarito: gabs[i], habilidade: habs[i] || "" });
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
            const pct = total > 0 ? i / total : 0;
            const saebLevel = pct < 0.4 ? "I" : pct < 0.75 ? "II" : "III";
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
                    <a href="/avaliacao-processual" style={{ fontSize: 12, fontWeight: 700, color: "#10b981", textDecoration: "none" }}>Ir para Processual →</a>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                Carregando avaliações...
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
                            {analisando ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
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
                                {excluindo ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
