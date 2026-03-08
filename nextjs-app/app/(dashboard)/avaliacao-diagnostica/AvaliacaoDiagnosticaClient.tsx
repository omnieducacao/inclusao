"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RubricaOmnisfera } from "@/components/RubricaOmnisfera";
import dynamic from "next/dynamic";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";

// Extrações lazy (PDF, DOCX e Panels secundários)
const DocxDownloadButton = dynamic(() => import("@/components/DocxDownloadButton").then(mod => mod.DocxDownloadButton));
const PdfDownloadButton = dynamic(() => import("@/components/PdfDownloadButton").then(mod => mod.PdfDownloadButton));
const GabaritoRespostasPanel = dynamic(() => import("./components/GabaritoRespostasPanel").then(mod => mod.GabaritoRespostasPanel));
const MatrizReferenciaPanel = dynamic(() => import("./components/MatrizReferenciaPanel").then(mod => mod.MatrizReferenciaPanel));
const ManualAplicacaoPanel = dynamic(() => import("./components/ManualAplicacaoPanel").then(mod => mod.ManualAplicacaoPanel));

import {
    Brain, CheckCircle2, AlertTriangle,
    ChevronDown, ChevronUp, Sparkles, Save, ClipboardList, BarChart3,
    ArrowLeft, Users, BookOpen, Target, Zap, FileText, Layers, Activity,
    Grid3X3, BookMarked, ChevronRight, TrendingUp, Image, Trash2, Calendar,
} from "lucide-react";
import { OnboardingPanel } from "@/components/OnboardingPanel";
import { PageHero } from "@/components/PageHero";
import { OmniLoader } from "@/components/OmniLoader";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";
import { determinarTipoImagem } from "@/lib/avaliacao-imagens";
import { mapDiagnosticoToPerfilNEE, REGRAS_NEE } from "@/lib/omnisfera-prompts";
import type { EngineId } from "@/lib/ai-engines";
import { AlternativaItem } from "./components/AlternativaItem";
import { BadgeInfo } from "./components/BadgeInfo";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Textarea } from "@omni/ds";
import type { Aluno, PlanoVinculado, BlocoPlano, ChecklistAdaptacao } from "./types";
import { ENGINE_OPTIONS, TAXONOMIA_BLOOM, SAEB_TO_BLOOM } from "./types";
import { extractSaebLevel, flattenBarreiras, extrairQuestoes } from "./utils";

// Types, constants, and utils imported from ./types and ./utils



// ─── Styles ───────────────────────────────────────────────────────────────────



// ─── Componente Principal ─────────────────────────────────────────────────────

export default function AvaliacaoDiagnosticaClient({
    initialAlunos,
    initialProfessorName
}: {
    initialAlunos?: Aluno[];
    initialProfessorName?: string;
}) {
    const [loading, setLoading] = useState(false);
    const [alunos, setAlunos] = useState<Aluno[]>(initialAlunos || []);
    const [professorName, setProfessorName] = useState(initialProfessorName || "");
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

    // Momento da avaliação: início do ano (matriz ano anterior) ou decorrer do ano (plano do professor)
    const [momentoDiagnostica, setMomentoDiagnostica] = useState<"inicio_ano" | "decorrer_ano">("inicio_ano");

    // Matrix habilidades for item creation
    const [matrizHabs, setMatrizHabs] = useState<{ habilidade: string; tema: string; descritor: string; competencia: string }[]>([]);
    const [habsSelecionadas, setHabsSelecionadas] = useState<string[]>([]);
    const [qtdQuestoes, setQtdQuestoes] = useState(12);
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

    // ─── Progressive Generation (Phase 1: 1 item at a time) ──────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [questoesIndividuais, setQuestoesIndividuais] = useState<Array<Record<string, any>>>([]);
    const [progressoGeracao, setProgressoGeracao] = useState<{ atual: number; total: number; status: 'idle' | 'gerando' | 'concluido' | 'erro' }>({ atual: 0, total: 0, status: 'idle' });

    // Helper: rebuild resultadoFormatado with current images
    const rebuildResultadoFormatado = useCallback((questoes: Record<string, any>[], imagens: Record<number, string>) => {
        let texto = '';
        for (let i = 0; i < questoes.length; i++) {
            const q = questoes[i];
            if (q._erro) {
                texto += `### Questão ${i + 1}\n\n⚠️ Erro ao gerar: ${q._erro}\n\n---\n\n`;
                continue;
            }
            const sv = q.suporte_visual;
            let enunciadoClean = (q.enunciado || '') as string;
            if (sv?.descricao_para_geracao) {
                enunciadoClean = enunciadoClean.replace(sv.descricao_para_geracao, '').replace(/\n{3,}/g, '\n\n').trim();
            }
            enunciadoClean = enunciadoClean
                .replace(/\[?\s*(?:Ilustra[çc][aã]o|Imagem|Fotografia|Diagrama|Gr[aá]fico|Mapa)\s*(?:mostrando|representando|de|com|:)[^\]\n]*\]?/gi, '')
                .replace(/\n{3,}/g, '\n\n').trim();

            const imgUrl = imagens[i + 1] || q._imagemUrl;
            texto += [
                `### Questão ${i + 1} — ${q.habilidade_bncc_ref || ''}`,
                '', enunciadoClean || '',
                q.comando ? `\n**${q.comando}**` : '',
                imgUrl ? `\n![${sv?.texto_alternativo || `Imagem Q${i + 1}`}](${imgUrl})` : '',
                '',
                q.alternativas ? Object.entries(q.alternativas as Record<string, string>).map(([k, v]) =>
                    `${k === q.gabarito ? `**${k})** ${v}` : `${k}) ${v}`}`
                ).join('\n') : '',
                '', `**Gabarito:** ${q.gabarito || ''}`, '', `*${q.justificativa_pedagogica || ''}*`, '', '---',
            ].join('\n') + '\n\n';
        }
        setResultadoFormatado(texto.trim());
    }, []);

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
    const [perfilError, setPerfilError] = useState<string | null>(null);

    // ─── Processual evolution feed ─────────────────────────────────────────
    const [evolucaoProcessual, setEvolucaoProcessual] = useState<{
        disciplina: string;
        periodos: { bimestre: number; media_nivel: number | null }[];
        tendencia: string;
        media_mais_recente: number | null;
    }[]>([]);
    const [showProcessual, setShowProcessual] = useState(false);

    // ─── Fetch students (removidos devido ao Shift Left para o Server) ─────────────────────────────────────────────────

    // Auto-select student + discipline when coming from PEI module
    useEffect(() => {
        if (alunos.length === 0 || selectedAluno) return;
        const params = new URLSearchParams(window.location.search);
        const fromPEI = params.get("fromPEI");
        const studentId = params.get("studentId");
        const disciplina = params.get("disciplina");
        if (fromPEI && studentId) {
            const aluno = alunos.find(a => a.id === studentId);
            if (aluno) {
                setSelectedAluno(aluno);
                if (disciplina) {
                    setSelectedDisc(disciplina);
                }
            }
        }
    }, [alunos, selectedAluno]);

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
            } catch { /* expected fallback */
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
                setAvaliacaoSalvaId(av.id);

                // Restore questions from questoes_geradas
                const qg = av.questoes_geradas;
                if (qg) {
                    let questoesArr: Record<string, any>[] = [];

                    if (typeof qg === 'object' && !Array.isArray(qg)) {
                        if (qg.questoes && Array.isArray(qg.questoes)) {
                            questoesArr = qg.questoes;
                        } else if (qg.raw_response) {
                            // Try parsing raw_response
                            try {
                                const cleaned = String(qg.raw_response).replace(/```(?:json)?\s*([\s\S]*?)```/, "$1").trim();
                                const parsed = JSON.parse(cleaned);
                                if (parsed?.questoes) questoesArr = parsed.questoes;
                            } catch { /* fallback: set formatted text from raw */ }

                            if (questoesArr.length === 0) {
                                setResultadoFormatado(String(qg.raw_response));
                                setValidadoFormatado(true);
                            }
                        }
                    } else if (typeof qg === 'string') {
                        try {
                            const cleaned = qg.replace(/```(?:json)?\s*([\s\S]*?)```/, "$1").trim();
                            const parsed = JSON.parse(cleaned);
                            if (parsed?.questoes) questoesArr = parsed.questoes;
                        } catch { /* expected fallback */
                            setResultadoFormatado(qg);
                            setValidadoFormatado(true);
                        }
                    }

                    if (questoesArr.length > 0) {
                        setQuestoesIndividuais(questoesArr);
                        setProgressoGeracao({ atual: questoesArr.length, total: questoesArr.length, status: 'concluido' });
                        // Rebuild formatted text
                        rebuildResultadoFormatado(questoesArr, {});
                        setValidadoFormatado(true);
                    }
                }

                // Restore saved responses if any
                if (av.resultados?.respostas) {
                    setRespostasAluno(av.resultados.respostas);
                    setShowGabarito(true);
                }
                if (av.resultados?.analise) {
                    setAnaliseResultado(av.resultados.analise);
                }
            }
        } catch { /* silent */ }
    }, [rebuildResultadoFormatado]);

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

        // Só carrega plano do professor quando momento = "decorrer do ano". Em "início do ano" usa só matriz genérica.
        if (momentoDiagnostica === "decorrer_ano") {
            const gradeNum = parseInt(aluno.grade?.match(/\d+/)?.[0] || "6", 10);
            const gradeAnterior = Math.max(gradeNum - 1, 1);
            const serieAnterior = aluno.grade?.replace(/\d+/, String(gradeAnterior)).replace(/\s*\(.*\)\s*$/, "").trim() || `${gradeAnterior}º Ano`;
            const serieAtual = aluno.grade?.replace(/\s*\(.*\)\s*$/, "").trim() || `${gradeNum}º Ano`;
            const carregarPlano = async () => {
                try {
                    const res1 = await fetch(`/api/plano-curso?componente=${encodeURIComponent(disciplina)}&serie=${encodeURIComponent(serieAnterior)}`);
                    const d1 = await res1.json();
                    if (d1.planos?.length > 0) return d1.planos[0];
                } catch { /* silent */ }
                try {
                    const res2 = await fetch(`/api/plano-curso?componente=${encodeURIComponent(disciplina)}&serie=${encodeURIComponent(serieAtual)}`);
                    const d2 = await res2.json();
                    if (d2.planos?.length > 0) return d2.planos[0];
                } catch { /* silent */ }
                try {
                    const res3 = await fetch(`/api/plano-curso?componente=${encodeURIComponent(disciplina)}`);
                    const d3 = await res3.json();
                    if (d3.planos?.length > 0) return d3.planos[0];
                } catch { /* silent */ }
                return null;
            };
            carregarPlano().then(p => {
                if (p) {
                    setPlanoVinculado(p);
                    try {
                        const conteudo = typeof p.conteudo === "string" ? JSON.parse(p.conteudo) : p.conteudo;
                        if (conteudo?.blocos) setBlocosPlano(conteudo.blocos);
                    } catch { /* silent */ }
                }
            });
        }

        // Fetch matrix habilidades do ANO ANTERIOR (sempre — matriz genérica Omnisfera)
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

        // Fetch matrix habilidades do ANO ANTERIOR, filtradas por componente curricular
        const gradeNum = parseInt(aluno.grade?.match(/\d+/)?.[0] || "6", 10);
        const gradeAnterior = Math.max(gradeNum - 1, 1);
        const serieNameAnterior = `EF${gradeAnterior}`;

        fetch(`/api/avaliacao-diagnostica/matriz?disciplina=${encodeURIComponent(disciplina)}&serie=${serieNameAnterior}`)
            .then(r => r.json())
            .then(data => {
                const habs = data.habilidades || [];
                if (habs.length > 0) {
                    setMatrizHabs(habs.slice(0, 40));
                } else {
                    // Fallback: buscar BNCC do ano atual quando o ano anterior não tem dados
                    const serieAtual = `EF${gradeNum}`;
                    fetch(`/api/avaliacao-diagnostica/matriz?disciplina=${encodeURIComponent(disciplina)}&serie=${serieAtual}`)
                        .then(r2 => r2.json())
                        .then(d2 => {
                            const habs2 = d2.habilidades || [];
                            if (habs2.length > 0) {
                                setMatrizHabs(habs2.slice(0, 40));
                            } else {
                                // Último fallback: buscar só por disciplina, sem filtro de série
                                fetch(`/api/avaliacao-diagnostica/matriz?disciplina=${encodeURIComponent(disciplina)}`)
                                    .then(r3 => r3.json())
                                    .then(d3 => {
                                        setMatrizHabs((d3.habilidades || []).slice(0, 40));
                                    })
                                    .catch(err => console.error('[Diagnóstica] Fallback 2 error:', err));
                            }
                        })
                        .catch(err => console.error('[Diagnóstica] Fallback 1 error:', err));
                }
            })
            .catch(err => console.error('[Diagnóstica] Matrix fetch error:', err));
    }, [loadExistingAvaliacao, momentoDiagnostica]);

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
        setPerfilError(null);
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
        aiLoadingStart("green", "diagnostica");
        try {
            const usarPlanoProfessor = momentoDiagnostica === "decorrer_ano" && planoVinculado;
            const habilidadesParaSalvar = usarPlanoProfessor && planoVinculado?.habilidades_bncc?.length
                ? planoVinculado.habilidades_bncc
                : (habsSelecionadas.length > 0 ? habsSelecionadas : matrizHabs.slice(0, 4).map(h => h.habilidade));
            const res = await fetch("/api/pei/avaliacao-diagnostica/salvar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: selectedAluno.id,
                    disciplina: selectedDisc,
                    questoes_geradas: resultadoFormatado,
                    habilidades_bncc: habilidadesParaSalvar,
                    plano_ensino_id: usarPlanoProfessor ? planoVinculado?.id : undefined,
                }),
            });
            const data = await res.json();
            if (res.ok && (data.ok || data.avaliacao?.id)) {
                setAvaliacaoSalvaId(data.avaliacao?.id || '');
                setValidadoFormatado(true);
            } else {
                setAvalError(`Erro ao salvar: ${data.error || 'Resposta inesperada do servidor'}`);
                // Still allow gabarito — questions are already generated
                setValidadoFormatado(true);
            }
        } catch (err) {
            setAvalError(`Erro ao salvar: ${err instanceof Error ? err.message : 'erro de conexão'}`);
            // Still allow gabarito even on network error
            setValidadoFormatado(true);
        }
        setSalvandoAvaliacao(false);
        aiLoadingStop();
    };

    // ─── Analisar Respostas + Calcular Nível + Resultado Qualitativo ─────
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
            const nivel = score >= 90 ? 4 : score >= 70 ? 3 : score >= 50 ? 2 : score >= 25 ? 1 : 0;

            // Build basic analysis
            const analise: Record<string, unknown> = {
                total: totalQ,
                acertos,
                score,
                nivel,
                distratores: distratoresAtivados,
                hab_dominadas: habDominadas,
                hab_desenvolvimento: habDesenvolvimento,
            };

            // ── Phase 4: Qualitative Result via API ──────────────────
            try {
                // Build questões data for qualitative analysis
                const questoesParaAnalise = questoesIndividuais.length > 0
                    ? questoesIndividuais.filter(q => !q._erro).map(q => ({
                        id: q.id || `Q${q._numero}`,
                        habilidade_bncc_ref: q.habilidade_bncc_ref || q._habilidade || "",
                        gabarito: q.gabarito || "",
                        analise_distratores: q.analise_distratores || {},
                        nivel_omnisfera_alvo: q.nivel_omnisfera_alvo,
                    }))
                    : questoes.map((q, i) => ({
                        id: `Q${i + 1}`,
                        habilidade_bncc_ref: q.habilidade,
                        gabarito: q.gabarito,
                        analise_distratores: {},
                    }));

                const respostasFormatadas: Record<string, string> = {};
                for (const [k, v] of Object.entries(respostasAluno)) {
                    const num = k.replace("q", "Q");
                    respostasFormatadas[num] = v;
                }

                const resQual = await fetch("/api/avaliacao-diagnostica/resultado-qualitativo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        questoes: questoesParaAnalise,
                        respostas: respostasFormatadas,
                        perfil_nee: selectedAluno?.diagnostico || "",
                        nome_aluno: selectedAluno?.name?.split(" ")[0] || "",
                        disciplina: selectedDisc || "",
                        serie: selectedAluno?.grade || "",
                    }),
                });
                if (resQual.ok) {
                    const dataQual = await resQual.json();
                    if (dataQual.resultado) {
                        analise.qualitativo = dataQual.resultado;
                    }
                }
            } catch { /* qualitative analysis is optional, don't block */ }

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

    // extrairQuestoes imported from ./utils

    // ─── Generate Perfil de Funcionamento ────────────────────────────────

    const gerarPerfil = async () => {
        if (!selectedAluno) return;
        setGerandoPerfil(true);
        aiLoadingStart("red", "diagnostica");
        setPerfilError(null);
        try {
            const dims = Object.entries(dimensoesAvaliadas)
                .filter(([, v]) => v.nivel >= 0)
                .map(([id, val]) => {
                    const dim = dimensoesNEE.find(d => d.id === id);
                    return { dimensao: dim?.dimensao || id, nivel_observado: val.nivel, observacao: val.observacao || "" };
                });
            const res = await fetch("/api/avaliacao-diagnostica/perfil-funcionamento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: selectedAluno.name,
                    serie: selectedAluno.grade,
                    diagnostico: selectedAluno.diagnostico || "SEM_NEE",
                    dimensoes_avaliadas: dims,
                    habilidades_curriculares: [],
                }),
            });
            const data = await res.json();
            if (data.perfil) {
                setPerfilGerado(data.perfil as Record<string, unknown>);
            } else if (data.error) {
                setPerfilError(data.error);
            }
        } catch (err) {
            console.error("Erro ao gerar perfil:", err);
            setPerfilError(err instanceof Error ? err.message : "Erro ao gerar perfil");
        } finally { setGerandoPerfil(false); aiLoadingStop(); }
    };

    // ─── Generate Estratégias Práticas ───────────────────────────────────

    const gerarEstrategias = async () => {
        if (!selectedAluno) return;
        setGerandoEstrategias(true);
        aiLoadingStart("red", "diagnostica");
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
        } finally { setGerandoEstrategias(false); aiLoadingStop(); }
    };

    // ─── Generate avaliação ─────────────────────────────────────────────



    // ─── Loading ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ padding: 60, textAlign: "center" }}>
                <OmniLoader variant="card" />
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 16 }}>Carregando estudantes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="omni-p-10">
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f87171", marginBottom: 12 }}>
                    <AlertTriangle size={20} /> <span style={{ fontWeight: 600 }}>{error}</span>
                </div>
                <button onClick={() => window.location.reload()} style={{
                    padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)",
                    background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: 13,
                }}>Tentar novamente</button>
            </div>
        );
    }

    // ─── Avaliação View (student selected) ──────────────────────────────

    if (selectedAluno && selectedDisc) {
        return (
            <div className="w-full">
                {/* Overlay Omnisfera é controlado via aiLoadingStart/Stop (AILoadingOverlay global) */}

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
                        <strong className="omni-text-primary">{selectedDisc}</strong>
                    </span>
                </div>

                {/* Header */}
                <div style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    borderRadius: 14, padding: "20px 24px", color: "#fff", marginBottom: 20,
                }}>
                    <div className="omni-flex-row omni-gap-2.5 mb-2">
                        <Brain size={22} />
                        <h2 className="omni-m-0 omni-text-xl font-bold">
                            Avaliação Diagnóstica — {selectedDisc}
                        </h2>
                    </div>
                    <p className="omni-m-0 omni-text-sm">
                        Estudante: <strong>{selectedAluno.name}</strong> · {selectedAluno.grade}
                        {selectedAluno.diagnostico && ` · ${selectedAluno.diagnostico}`}
                    </p>
                </div>

                {/* ── Progress Stepper ── */}
                <div style={{
                    display: "flex", gap: 4, marginBottom: 16, padding: "12px 16px",
                    borderRadius: 12, background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.1))",
                }}>
                    {([
                        {
                            label: "① Gerar Avaliação",
                            desc: "IA cria questões baseadas na BNCC",
                            done: !!resultadoFormatado || !!avaliacaoSalvaId,
                            current: !resultadoFormatado && !avaliacaoSalvaId,
                        },
                        {
                            label: "② Aplicar Gabarito",
                            desc: "Registrar respostas do estudante",
                            done: nivelIdentificado !== null,
                            current: !!avaliacaoSalvaId && nivelIdentificado === null,
                        },
                        {
                            label: "③ Perfil de Funcionamento",
                            desc: "Avaliação cognitivo-funcional (NEE)",
                            done: !!perfilGerado,
                            current: nivelIdentificado !== null && !perfilGerado,
                        },
                        {
                            label: "④ Estratégias Práticas",
                            desc: "Relatório com estratégias adaptadas",
                            done: !!estrategiasGeradas,
                            current: !!perfilGerado && !estrategiasGeradas,
                        },
                    ] as const).map((step, i) => (
                        <div key={i} style={{
                            flex: 1, padding: "10px 12px", borderRadius: 10, textAlign: "center",
                            background: step.done ? "rgba(16,185,129,.1)" : step.current ? "rgba(59,130,246,.1)" : "transparent",
                            border: step.done ? "1px solid rgba(16,185,129,.2)" : step.current ? "1px solid rgba(59,130,246,.2)" : "1px solid transparent",
                            opacity: (!step.done && !step.current) ? 0.45 : 1,
                        }}>
                            <div style={{
                                fontSize: 12, fontWeight: 800,
                                color: step.done ? "#10b981" : step.current ? "#3b82f6" : "var(--text-muted)",
                                marginBottom: 2,
                            }}>
                                {step.done ? "✅ " : ""}{step.label}
                            </div>
                            <div className="omni-text-xs omni-text-muted">
                                {step.desc}
                            </div>
                        </div>
                    ))}
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
                        <div className="omni-text-secondary">{neeAlert}</div>
                    </div>
                )}

                {/* ── Orientação Pedagógica NEE — Explicação das escolhas automáticas ── */}
                {selectedAluno?.diagnostico && (() => {
                    const perfil = mapDiagnosticoToPerfilNEE(selectedAluno.diagnostico);
                    if (perfil === "SEM_NEE") return null;

                    const barreirasFlat = flattenBarreiras(selectedAluno.barreiras_selecionadas);
                    const barreirasAtivas = Object.entries(barreirasFlat).filter(([, v]) => v).map(([k]) => k);
                    const decisaoImagem = determinarTipoImagem({
                        perfilNEE: perfil,
                        barreirasAtivas: barreirasFlat,
                    });

                    const regrasNEE = REGRAS_NEE[perfil];
                    const regrasLinhas = regrasNEE
                        ? regrasNEE.split("\n").filter(l => l.startsWith("- ")).map(l => l.slice(2))
                        : [];

                    const perfilLabels: Record<string, { label: string; emoji: string; cor: string }> = {
                        TEA: { label: "Transtorno do Espectro Autista", emoji: "🧩", cor: "#6366f1" },
                        DI: { label: "Deficiência Intelectual", emoji: "🧠", cor: "#0ea5e9" },
                        ALTAS_HABILIDADES: { label: "Altas Habilidades/Superdotação", emoji: "⭐", cor: "#f59e0b" },
                        TRANSTORNO_APRENDIZAGEM: { label: "Transtorno de Aprendizagem", emoji: "📖", cor: "#10b981" },
                    };
                    const info = perfilLabels[perfil] || { label: perfil, emoji: "📋", cor: "#94a3b8" };

                    return (
                        <details style={{ marginBottom: 16, borderRadius: 14, overflow: "hidden", border: `2px solid ${info.cor}25`, background: `${info.cor}06` }}>
                            <summary style={{
                                padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                                fontWeight: 700, fontSize: 14, color: info.cor,
                                background: `${info.cor}0a`,
                            }}>
                                <span style={{ fontSize: 20 }}>{info.emoji}</span>
                                Por que a avaliação será assim? — {info.label}
                                <span style={{
                                    marginLeft: "auto", fontSize: 10, padding: "3px 10px", borderRadius: 20,
                                    background: `${info.cor}15`, color: info.cor, fontWeight: 700,
                                }}>
                                    {barreirasAtivas.length > 0 ? `${barreirasAtivas.length} barreira(s)` : "perfil geral"}
                                </span>
                            </summary>
                            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

                                {/* ── Perfil do Estudante ── */}
                                <div style={{
                                    padding: "12px 16px", borderRadius: 10,
                                    background: "var(--bg-primary)", border: "1px solid var(--border-default)",
                                }}>
                                    <div style={{ fontWeight: 700, fontSize: 12, color: info.cor, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        {info.emoji} Perfil identificado: {info.label}
                                    </div>
                                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                                        {perfil === "TEA" && `Como ${selectedAluno.name} tem diagnóstico de TEA, a avaliação precisa de adaptações específicas para garantir que meça a habilidade curricular — e não a capacidade de interpretação social ou linguística. A Omnisfera aplicará linguagem literal, alternativas paralelas e suporte visual em todas as questões.`}
                                        {perfil === "DI" && `Como ${selectedAluno.name} tem diagnóstico de DI, a avaliação será ajustada ao nível de referência do PEI (não ao ano de matrícula). Enunciados serão mais curtos, com vocabulário acessível e micro-etapas quando necessário. O professor receberá instruções para oferecer versão com material concreto.`}
                                        {perfil === "ALTAS_HABILIDADES" && `Como ${selectedAluno.name} tem perfil de Altas Habilidades/Superdotação, a avaliação priorizará questões de nível cognitivo superior (Avaliar e Criar na taxonomia de Bloom). As questões incluirão conexões interdisciplinares e enriquecimento, não apenas aceleração.`}
                                        {perfil === "TRANSTORNO_APRENDIZAGEM" && `Como ${selectedAluno.name} tem diagnóstico de ${selectedAluno.diagnostico}, a avaliação separará a habilidade-alvo da habilidade-instrumento. Instruções ao professor incluirão alternativa de resposta oral. ${selectedAluno.diagnostico?.toLowerCase().includes("tdah") ? "Para TDAH, questões terão tempo máximo de 5 minutos cada." : "Para dislexia, fonte mínima de 12pt e espaçamento amplo serão indicados."}`}
                                    </p>
                                </div>

                                {/* ── Barreiras do PEI ── */}
                                {barreirasAtivas.length > 0 && (
                                    <div style={{
                                        padding: "12px 16px", borderRadius: 10,
                                        background: "rgba(239,68,68,.04)", border: "1px solid rgba(239,68,68,.15)",
                                    }}>
                                        <div style={{ fontWeight: 700, fontSize: 12, color: "#ef4444", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            🚧 Barreiras identificadas no PEI
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {barreirasAtivas.map((b, i) => (
                                                <span key={i} style={{
                                                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                                    background: "rgba(239,68,68,.08)", color: "#dc2626",
                                                    border: "1px solid rgba(239,68,68,.15)",
                                                }}>
                                                    {b}
                                                </span>
                                            ))}
                                        </div>
                                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "8px 0 0", lineHeight: 1.5 }}>
                                            Estas barreiras foram mapeadas no PEI pelo profissional AEE. A IA ajustará a abordagem das questões para não avaliar competências comprometidas pelas barreiras, e sim a habilidade curricular em si.
                                        </p>
                                    </div>
                                )}

                                {/* ── Decisão de Imagens ── */}
                                <div style={{
                                    padding: "12px 16px", borderRadius: 10,
                                    background: decisaoImagem.necessario ? "rgba(99,102,241,.04)" : "rgba(16,185,129,.04)",
                                    border: decisaoImagem.necessario ? "1px solid rgba(99,102,241,.15)" : "1px solid rgba(16,185,129,.15)",
                                }}>
                                    <div style={{
                                        fontWeight: 700, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px",
                                        color: decisaoImagem.necessario ? "#6366f1" : "#10b981",
                                    }}>
                                        🖼️ {decisaoImagem.necessario ? "Imagens obrigatórias" : "Imagens opcionais"} nesta avaliação
                                    </div>
                                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                                        <strong>Motivo:</strong> {decisaoImagem.justificativa}
                                    </p>
                                    {decisaoImagem.tipo && (
                                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>
                                            <strong>Tipo recomendado:</strong> {decisaoImagem.tipo} — {decisaoImagem.descricaoPrompt?.split(".")[0]}.
                                        </p>
                                    )}
                                    {decisaoImagem.prioridadeVisual === "obrigatoria" && (
                                        <div style={{
                                            marginTop: 8, padding: "6px 10px", borderRadius: 6,
                                            background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.2)",
                                            fontSize: 11, fontWeight: 600, color: "#f59e0b",
                                        }}>
                                            ⚡ Por isso a quantidade de imagens será ajustada automaticamente para {decisaoImagem.prioridadeVisual === "obrigatoria" ? "TODAS as questões" : "questões selecionadas"}.
                                        </div>
                                    )}
                                </div>

                                {/* ── Regras que a IA seguirá ── */}
                                {regrasLinhas.length > 0 && (
                                    <div style={{
                                        padding: "12px 16px", borderRadius: 10,
                                        background: "rgba(14,165,233,.04)", border: "1px solid rgba(14,165,233,.15)",
                                    }}>
                                        <div style={{ fontWeight: 700, fontSize: 12, color: "#0ea5e9", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                            🤖 O que a IA fará diferente nesta prova
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: 16, listStyleType: "none" }}>
                                            {regrasLinhas.map((regra, i) => (
                                                <li key={i} style={{
                                                    fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7,
                                                    padding: "2px 0",
                                                }}>
                                                    <span style={{ color: "#0ea5e9", fontWeight: 700, marginRight: 6 }}>→</span>
                                                    {regra}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </details>
                    );
                })()}
                {Boolean(instrucaoDiag) && (
                    <div style={{
                        padding: "14px 18px", borderRadius: 12,
                        background: "rgba(59,130,246,.06)", border: "1.5px solid rgba(59,130,246,.2)",
                        marginBottom: 16, fontSize: 13, lineHeight: 1.6,
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#3b82f6", marginBottom: 6 }}>
                            📋 Instrução de Uso
                        </div>
                        <div className="omni-text-secondary">{instrucaoDiag}</div>
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
                {!resultadoFormatado && !gerando && (
                    <div className="omni-flex-col omni-gap-1">
                        {/* Plano de Ensino vinculado */}
                        {planoVinculado && (
                            <Card variant="default" style={{ border: "1.5px solid rgba(14,165,233,.3)" }}>
                                <button
                                    onClick={() => setShowMatrix(!showMatrix)}
                                    className="flex items-center gap-2 px-4 py-3 w-full cursor-pointer justify-between border-none"
                                    style={{ background: "rgba(14,165,233,.05)" }}
                                >
                                    <div className="omni-flex-row omni-gap-2">
                                        <FileText size={16} style={{ color: "#0ea5e9" }} />
                                        <span style={{ fontWeight: 700, fontSize: 14, color: "#0ea5e9" }}>
                                            Plano de Curso — {planoVinculado.disciplina}
                                            {planoVinculado.ano_serie && <span style={{ fontWeight: 400, fontSize: 12, marginLeft: 6, opacity: .7 }}>({planoVinculado.ano_serie})</span>}
                                        </span>
                                    </div>
                                    <div className="omni-flex-row omni-gap-6">
                                        <a
                                            href={`/plano-curso?id=${planoVinculado.id}`}
                                            onClick={e => e.stopPropagation()}
                                            style={{ fontSize: 11, color: "#38bdf8", fontWeight: 600, textDecoration: "none", padding: "4px 10px", borderRadius: 6, background: "rgba(56,189,248,.08)", border: "1px solid rgba(56,189,248,.15)" }}
                                        >
                                            ✏️ Editar Plano
                                        </a>
                                        <span style={{ fontSize: 11, color: "#0ea5e9", fontWeight: 600 }}>
                                            {showMatrix ? "Ocultar" : "Ver"} Plano
                                        </span>
                                        {showMatrix ? <ChevronUp size={14} style={{ color: "#0ea5e9" }} /> : <ChevronDown size={14} style={{ color: "#0ea5e9" }} />}
                                    </div>
                                </button>
                                {showMatrix && (
                                    <CardContent className="p-4" style={{ borderTop: "1px solid var(--omni-border-default)" }}>
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
                                    </CardContent>
                                )}
                            </Card>
                        )}

                        {!planoVinculado && (
                            <div style={{ padding: "12px 16px", borderRadius: 10, background: momentoDiagnostica === "inicio_ano" ? "rgba(99,102,241,.06)" : "rgba(245,158,11,.05)", border: momentoDiagnostica === "inicio_ano" ? "1px solid rgba(99,102,241,.15)" : "1px solid rgba(245,158,11,.15)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: momentoDiagnostica === "inicio_ano" ? "#818cf8" : "#fbbf24" }}>
                                {momentoDiagnostica === "inicio_ano" ? (
                                    <>
                                        <Layers size={16} /> No início do ano a avaliação usa a <strong>matriz de referência</strong> (habilidades do ano anterior). As habilidades aparecem abaixo.
                                    </>
                                ) : (
                                    <>
                                        <FileText size={16} /> Nenhum plano de curso encontrado para {selectedDisc} ({selectedAluno?.grade}).
                                        <a href="/plano-curso" style={{ color: "#38bdf8", fontWeight: 600, textDecoration: "none", marginLeft: "auto" }}>Criar plano →</a>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Habilidades da Matriz BNCC — sempre visível */}
                        <Card variant="default" style={{ border: "1.5px solid rgba(99,102,241,.2)" }}>
                            <CardHeader className="flex flex-row items-center justify-between pb-3" style={{ background: "rgba(99,102,241,.05)" }}>
                                <CardTitle className="text-sm flex items-center gap-2 m-0 text-indigo-500">
                                    <Layers size={16} />
                                    Habilidades BNCC para Avaliação
                                </CardTitle>
                                {matrizHabs.length > 0 && (
                                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                        {habsSelecionadas.length} de {matrizHabs.length} selecionadas
                                    </span>
                                )}
                            </CardHeader>
                            <CardContent className="max-h-[320px] overflow-y-auto p-0 m-0">
                                {matrizHabs.length === 0 ? (
                                    /* Loading / empty state */
                                    <div style={{ padding: "20px 0", textAlign: "center" }}>
                                        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                                            <OmniLoader size={18} /> Carregando habilidades BNCC para <strong>{selectedDisc}</strong>...
                                        </div>
                                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "8px 0" }}>
                                            Se as habilidades não carregarem, clique abaixo para tentar novamente.
                                        </p>
                                        <button
                                            onClick={() => {
                                                if (!selectedAluno || !selectedDisc) return;
                                                const gradeNum = parseInt(selectedAluno.grade?.match(/\d+/)?.[0] || "6", 10);
                                                // Try direct discipline fetch (no serie filter)
                                                fetch(`/api/avaliacao-diagnostica/matriz?disciplina=${encodeURIComponent(selectedDisc)}`)
                                                    .then(r => r.json())
                                                    .then(data => {
                                                        const habs = data.habilidades || [];
                                                        if (habs.length > 0) {
                                                            // Filter by grade if possible
                                                            const gradeAnterior = Math.max(gradeNum - 1, 1);
                                                            const filtered = habs.filter((h: { ano?: string }) =>
                                                                h.ano?.includes(String(gradeAnterior)) || h.ano?.includes(String(gradeNum))
                                                            );
                                                            setMatrizHabs(filtered.length > 0 ? filtered.slice(0, 40) : habs.slice(0, 40));
                                                        }
                                                    })
                                                    .catch(err => console.error('[Diagnóstica] Retry error:', err));
                                            }}
                                            style={{
                                                padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                                background: "rgba(99,102,241,.1)", color: "#6366f1",
                                                border: "1px solid rgba(99,102,241,.2)", cursor: "pointer",
                                            }}
                                        >
                                            🔄 Carregar Habilidades BNCC
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {momentoDiagnostica === "decorrer_ano" && planoVinculado?.habilidades_bncc?.length ? (
                                            <p style={{ fontSize: 11, color: "#0ea5e9", margin: "0 0 10px 0", padding: "6px 10px", borderRadius: 6, background: "rgba(14,165,233,.08)", border: "1px solid rgba(14,165,233,.15)" }}>
                                                No decorrer do ano com plano vinculado: a geração usará as habilidades do plano de ensino. Abaixo, matriz do ano anterior para referência.
                                            </p>
                                        ) : null}
                                        <div className="omni-flex-col omni-gap-1">
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
                                                                <span className="omni-text-xs omni-text-muted">{h.tema}</span>
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
                                    </>
                                )}
                            </CardContent>
                            {matrizHabs.length > 0 && (
                                <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border-default, rgba(148,163,184,.08))", display: "flex", gap: 8 }}>
                                    <button onClick={() => setHabsSelecionadas(matrizHabs.map(h => h.habilidade))} style={{ fontSize: 11, color: "#818cf8", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Selecionar todas</button>
                                    <button onClick={() => setHabsSelecionadas([])} style={{ fontSize: 11, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>Limpar</button>
                                </div>
                            )}
                        </Card>

                        {/* Painéis de consulta inline: Matriz completa + Manual */}
                        <div className="omni-flex-col omni-gap-2">
                            {/* Matriz Completa — expandível */}
                            <Card variant="default" style={{ border: "1px solid rgba(99,102,241,.12)" }}>
                                <button
                                    onClick={() => setShowMatrix(prev => !prev)}
                                    className="flex items-center gap-2 px-4 py-3 w-full cursor-pointer justify-between border-none"
                                    style={{ background: "rgba(99,102,241,.04)" }}
                                >
                                    <div className="omni-flex-row omni-gap-6">
                                        <Grid3X3 size={14} style={{ color: "#818cf8" }} />
                                        <span style={{ fontWeight: 700, fontSize: 13, color: "#818cf8" }}>Matriz de Referência Completa</span>
                                    </div>
                                    {showMatrix ? <ChevronUp size={14} style={{ color: "#818cf8" }} /> : <ChevronDown size={14} style={{ color: "#818cf8" }} />}
                                </button>
                                {showMatrix && (
                                    <CardContent className="p-4" style={{ maxHeight: 400, overflowY: "auto", borderTop: "1px solid var(--omni-border-default)" }}>
                                        <MatrizReferenciaPanel />
                                    </CardContent>
                                )}
                            </Card>

                            {/* Manual de Aplicação — expandível */}
                            <details style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(245,158,11,.12)", background: "var(--bg-secondary, rgba(15,23,42,.4))" }}>
                                <summary style={{
                                    padding: "12px 16px", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 6,
                                    background: "rgba(245,158,11,.04)",
                                    listStyle: "none",
                                }}>
                                    <BookMarked size={14} style={{ color: "#f59e0b" }} />
                                    <span style={{ fontWeight: 700, fontSize: 13, color: "#f59e0b" }}>Manual de Aplicação</span>
                                    <ChevronDown size={14} style={{ color: "#f59e0b", marginLeft: "auto" }} />
                                </summary>
                                <div style={{ maxHeight: 400, overflowY: "auto", padding: "0 16px 16px" }}>
                                    <ManualAplicacaoPanel />
                                </div>
                            </details>
                        </div>

                        {/* Configuração da Geração */}
                        <Card variant="premium">
                            <CardHeader className="pb-2" style={{ background: "rgba(37,99,235,.05)" }}>
                                <CardTitle className="text-sm flex items-center gap-2 m-0 text-blue-500">
                                    <Sparkles size={16} />
                                    <span style={{ fontWeight: 700 }}>Configurar Avaliação</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3.5 p-4 pt-4">
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Quantidade de Questões</label>
                                        <div className="omni-flex-row omni-gap-10">
                                            <input
                                                type="range"
                                                min={4}
                                                max={20}
                                                value={qtdQuestoes}
                                                onChange={e => setQtdQuestoes(Number(e.target.value))}
                                                style={{ flex: 1, accentColor: qtdQuestoes < 8 ? "#ef4444" : qtdQuestoes < 10 ? "#f59e0b" : qtdQuestoes <= 15 ? "#10b981" : "#3b82f6" }}
                                            />
                                            <span style={{ fontSize: 14, fontWeight: 800, color: qtdQuestoes < 8 ? "#ef4444" : qtdQuestoes < 10 ? "#f59e0b" : qtdQuestoes <= 15 ? "#10b981" : "#3b82f6", minWidth: 20, textAlign: "center" }}>{qtdQuestoes}</span>
                                        </div>
                                        {qtdQuestoes < 8 && (
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 6,
                                                marginTop: 6, padding: "6px 10px", borderRadius: 6,
                                                background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.15)",
                                                fontSize: 10, color: "#ef4444", fontWeight: 600,
                                            }}>
                                                <AlertTriangle size={12} /> Quantidade insuficiente — mínimo de 8 questões para confiabilidade diagnóstica
                                            </div>
                                        )}
                                        {qtdQuestoes >= 8 && qtdQuestoes < 10 && (
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 6,
                                                marginTop: 6, padding: "6px 10px", borderRadius: 6,
                                                background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.15)",
                                                fontSize: 10, color: "#f59e0b", fontWeight: 600,
                                            }}>
                                                <AlertTriangle size={12} /> Recomendado mínimo de 10 questões para maior precisão
                                            </div>
                                        )}
                                        {qtdQuestoes >= 10 && qtdQuestoes <= 15 && (
                                            <div style={{
                                                marginTop: 6, padding: "6px 10px", borderRadius: 6,
                                                background: "rgba(16,185,129,.04)", border: "1px solid rgba(16,185,129,.12)",
                                                fontSize: 10, color: "#10b981", fontWeight: 600,
                                            }}>
                                                ✅ Quantidade ideal para diagnóstica confiável
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
                                        <div className="flex gap-1.5">
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
                                        <div className="omni-flex-row omni-gap-2">
                                            <input
                                                type="range" min={1} max={qtdQuestoes} value={qtdImagens}
                                                onChange={e => setQtdImagens(Number(e.target.value))}
                                                style={{ flex: 1, accentColor: "#3b82f6" }}
                                            />
                                            <span style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>{qtdImagens}</span>
                                        </div>
                                    )}
                                </div>
                                {usarImagens && (
                                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                                        As imagens usam primeiro o <strong>banco de imagens</strong> (Unsplash). Se não houver resultado, a IA gera a figura. Elas são inseridas após o enunciado de cada questão e devem fazer sentido com o que se pergunta (ex.: gráfico, mapa, figura). Tags vagas são ignoradas.
                                    </p>
                                )}

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
                                    aiLoadingStart(engineSel, "diagnostica");
                                    setResultadoFormatado(null);
                                    setMapaImagensResultado({});
                                    setValidadoFormatado(false);
                                    setQuestoesIndividuais([]);
                                    setProgressoGeracao({ atual: 0, total: 0, status: 'idle' });
                                    try {
                                        // ── Montar fila de habilidades ──────────
                                        const usarPlanoProfessor = momentoDiagnostica === "decorrer_ano" && planoVinculado?.habilidades_bncc && planoVinculado.habilidades_bncc.length > 0;
                                        let habilidadesParaGerar: string[];
                                        if (usarPlanoProfessor) {
                                            habilidadesParaGerar = planoVinculado!.habilidades_bncc!;
                                        } else if (habsSelecionadas.length > 0) {
                                            habilidadesParaGerar = matrizHabs.filter(h => habsSelecionadas.includes(h.habilidade)).map(h => {
                                                const codeMatch = h.habilidade.match(/^(EF\d+\w+\d+H?\d*|\(EF\d+\w+\d+\))/i);
                                                return codeMatch ? codeMatch[1].replace(/[()]/g, '') : h.habilidade;
                                            });
                                        } else {
                                            habilidadesParaGerar = matrizHabs.slice(0, Math.min(qtdQuestoes, 4)).map(h => {
                                                const codeMatch = h.habilidade.match(/^(EF\d+\w+\d+H?\d*|\(EF\d+\w+\d+\))/i);
                                                return codeMatch ? codeMatch[1].replace(/[()]/g, '') : h.habilidade;
                                            });
                                        }

                                        // Expand: if more questions than skills, cycle through skills
                                        const fila: string[] = [];
                                        for (let i = 0; i < qtdQuestoes; i++) {
                                            fila.push(habilidadesParaGerar[i % habilidadesParaGerar.length] || selectedDisc);
                                        }

                                        // ── Distribuir gabaritos A-D ────────────
                                        const letras = ['A', 'B', 'C', 'D'];
                                        const gabaritos: string[] = [];
                                        for (let i = 0; i < fila.length; i++) gabaritos.push(letras[i % 4]);
                                        for (let i = gabaritos.length - 1; i > 0; i--) {
                                            const j = Math.floor(Math.random() * (i + 1));
                                            [gabaritos[i], gabaritos[j]] = [gabaritos[j], gabaritos[i]];
                                        }

                                        // ── Distribuir dificuldade progressiva (25% fácil, 50% médio, 25% difícil) ──
                                        const dificuldades = fila.map((_, i) => {
                                            const pct = i / (fila.length - 1 || 1);
                                            return pct < 0.2 ? 'facil' : pct < 0.75 ? 'medio' : 'dificil';
                                        });

                                        setProgressoGeracao({ atual: 0, total: fila.length, status: 'gerando' });

                                        // ── Loop progressivo: 1 item por vez ────
                                        const questoesGeradas: Record<string, unknown>[] = [];
                                        let textoCompleto = '';
                                        let imagensGeradas = 0;  // Track images generated vs qtdImagens limit

                                        for (let i = 0; i < fila.length; i++) {
                                            setProgressoGeracao({ atual: i + 1, total: fila.length, status: 'gerando' });

                                            try {
                                                const res = await fetch("/api/avaliacao-diagnostica/criar-item", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        habilidade_codigo: fila[i],
                                                        disciplina: selectedDisc,
                                                        serie: selectedAluno.grade || '',
                                                        gabarito_definido: gabaritos[i],
                                                        nivel_dificuldade: dificuldades[i],
                                                        numero_questao: i + 1,
                                                        total_questoes: fila.length,
                                                        diagnostico_aluno: selectedAluno.diagnostico || '',
                                                        nome_aluno: selectedAluno.name || 'o estudante',
                                                        nivel_omnisfera_estimado: nivelIdentificado ?? 1,
                                                        plano_ensino_contexto: planoVinculado?.conteudo,
                                                        alerta_nee: neeAlert || '',
                                                        instrucao_uso_diagnostica: instrucaoDiag || '',
                                                        barreiras_ativas: flattenBarreiras(selectedAluno.barreiras_selecionadas),
                                                        engine: engineSel,
                                                    }),
                                                });
                                                const data = await res.json();
                                                if (!res.ok) throw new Error(data.error || 'Erro ao gerar item');

                                                const questao = data.questao || {};
                                                questao._numero = i + 1;
                                                questao._gabarito_esperado = gabaritos[i];
                                                // Store full habilidade info from BNCC resolution
                                                if (data.habilidade) {
                                                    if (data.habilidade.habilidade) {
                                                        questao._habilidadeTexto = data.habilidade.habilidade;
                                                    }
                                                    if (data.habilidade.codigo && !questao.habilidade_bncc_ref) {
                                                        questao.habilidade_bncc_ref = data.habilidade.codigo;
                                                        questao._habilidade = data.habilidade.codigo;
                                                    }
                                                    if (data.habilidade.unidade_tematica) {
                                                        questao._unidadeTematica = data.habilidade.unidade_tematica;
                                                    }
                                                    if (data.habilidade.objeto_conhecimento) {
                                                        questao._objetoConhecimento = data.habilidade.objeto_conhecimento;
                                                    }
                                                }
                                                // Fallback: store habilidade from the generation queue
                                                if (!questao._habilidadeTexto && fila[i]) {
                                                    questao._habilidadeTexto = fila[i];
                                                }
                                                // Store instrucao_aplicacao_professor into instrucao_professor
                                                if (questao.instrucao_aplicacao_professor && !questao.instrucao_professor) {
                                                    questao.instrucao_professor = questao.instrucao_aplicacao_professor;
                                                }
                                                questoesGeradas.push(questao);
                                                setQuestoesIndividuais([...questoesGeradas]);

                                                // ── Phase 2: Auto-generate image if needed AND within limit ──
                                                const sv = questao.suporte_visual;
                                                const withinImageLimit = usarImagens && imagensGeradas < qtdImagens;
                                                if (sv && sv.necessario && sv.descricao_para_geracao && withinImageLimit) {
                                                    questao._imagemPermitida = true;
                                                    setProgressoGeracao(p => ({ ...p, status: 'gerando' as const }));
                                                    try {
                                                        const imgRes = await fetch("/api/avaliacao-diagnostica/gerar-imagem", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                tipo: sv.tipo || 'ilustracao',
                                                                descricao: sv.descricao_para_geracao,
                                                                texto_alternativo: sv.texto_alternativo || sv.descricao_para_geracao,
                                                                disciplina: selectedDisc,
                                                                serie: selectedAluno.grade || '',
                                                            }),
                                                        });
                                                        if (imgRes.ok) {
                                                            const imgData = await imgRes.json();
                                                            if (imgData.imageUrl) {
                                                                setMapaImagensResultado(prev => ({ ...prev, [i + 1]: imgData.imageUrl }));
                                                                questao._imagemUrl = imgData.imageUrl;
                                                                questao._imagemGerada = true;
                                                                imagensGeradas++;
                                                            }
                                                        }
                                                    } catch { /* image generation is optional */ }
                                                } else if (sv && sv.necessario) {
                                                    // AI says it needs an image, but professor limit reached
                                                    questao._imagemPermitida = false;
                                                }

                                                // Build text representation for backward compatibility
                                                const q = questao;
                                                // Strip image description text from enunciado if the AI embedded it
                                                let enunciadoClean = (q.enunciado || '') as string;
                                                if (sv?.descricao_para_geracao) {
                                                    // Remove the AI's image description from the text
                                                    enunciadoClean = enunciadoClean
                                                        .replace(sv.descricao_para_geracao, '')
                                                        .replace(/\n{3,}/g, '\n\n')
                                                        .trim();
                                                }
                                                // Also strip common AI patterns like "Ilustração mostrando..." or "[Imagem: ...]"
                                                enunciadoClean = enunciadoClean
                                                    .replace(/\[?\s*(?:Ilustra[çc][aã]o|Imagem|Fotografia|Diagrama|Gr[aá]fico|Mapa)\s*(?:mostrando|representando|de|com|:)[^\]\n]*\]?/gi, '')
                                                    .replace(/\n{3,}/g, '\n\n')
                                                    .trim();

                                                const imgUrl = q._imagemUrl || mapaImagensResultado[i + 1];
                                                const textoQ = [
                                                    `### Questão ${i + 1} — ${q.habilidade_bncc_ref || fila[i]}`,
                                                    '',
                                                    enunciadoClean || '',
                                                    q.comando ? `\n**${q.comando}**` : '',
                                                    // Image INLINE in the question (not just in the strip)
                                                    imgUrl ? `\n![${sv?.texto_alternativo || `Imagem Q${i + 1}`}](${imgUrl})` : '',
                                                    '',
                                                    q.alternativas ? Object.entries(q.alternativas as Record<string, string>).map(([k, v]) =>
                                                        `${k === q.gabarito ? `**${k})** ${v}` : `${k}) ${v}`}`
                                                    ).join('\n') : '',
                                                    '',
                                                    `**Gabarito:** ${q.gabarito || gabaritos[i]}`,
                                                    '',
                                                    `*${q.justificativa_pedagogica || ''}*`,
                                                    '',
                                                    '---',
                                                ].join('\n');
                                                textoCompleto += textoQ + '\n\n';
                                            } catch (itemErr) {
                                                const errMsg = itemErr instanceof Error ? itemErr.message : 'Erro';
                                                questoesGeradas.push({ _numero: i + 1, _erro: errMsg, _gabarito_esperado: gabaritos[i] });
                                                setQuestoesIndividuais([...questoesGeradas]);
                                                textoCompleto += `### Questão ${i + 1}\n\n⚠️ Erro ao gerar: ${errMsg}\n\n---\n\n`;
                                            }
                                        }

                                        setResultadoFormatado(textoCompleto.trim());
                                        setProgressoGeracao({ atual: fila.length, total: fila.length, status: 'concluido' });
                                    } catch (err) {
                                        setAvalError(err instanceof Error ? err.message : "Erro ao gerar");
                                        setProgressoGeracao(p => ({ ...p, status: 'erro' }));
                                    }
                                    setGerando(false);
                                    aiLoadingStop();
                                }} disabled={gerando} style={{
                                    width: "100%", padding: "16px 24px", borderRadius: 12,
                                    background: gerando ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #818cf8)",
                                    color: "#fff", border: "none", cursor: gerando ? "wait" : "pointer",
                                    fontWeight: 700, fontSize: 15,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                    boxShadow: "0 4px 20px rgba(99,102,241,.3)",
                                }}>
                                    {gerando ? <OmniLoader engine={engineSel} size={20} /> : <Sparkles size={20} />}
                                    {gerando
                                        ? `Gerando questão ${progressoGeracao.atual} de ${progressoGeracao.total}...`
                                        : "Gerar Itens com IA"
                                    }
                                </button>

                                {/* ── Progress bar during generation ── */}
                                {gerando && progressoGeracao.total > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                            <span>Questão {progressoGeracao.atual} de {progressoGeracao.total}</span>
                                            <span>{Math.round((progressoGeracao.atual / progressoGeracao.total) * 100)}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: 6, background: 'var(--bg-tertiary, rgba(148,163,184,.12))', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${(progressoGeracao.atual / progressoGeracao.total) * 100}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                                                borderRadius: 3,
                                                transition: 'width 0.4s ease',
                                            }} />
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            {/* Overlay já exibido no topo da view quando gerando/salvando/perfil/estratégias */}
                        </Card>
                    </div>
                )
                }

                {/* Formatted result (Hub-style) */}
                {
                    resultadoFormatado && (
                        <div className="omni-flex-col omni-gap-14">
                            {!validadoFormatado && (
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button onClick={salvarAvaliacao} disabled={salvandoAvaliacao} style={{
                                        padding: "8px 16px", borderRadius: 8, border: "none", cursor: salvandoAvaliacao ? "wait" : "pointer",
                                        background: salvandoAvaliacao ? "#94a3b8" : "linear-gradient(135deg, #059669, #10b981)",
                                        color: "#fff", fontSize: 13, fontWeight: 700,
                                        display: "flex", alignItems: "center", gap: 6,
                                    }}>
                                        {salvandoAvaliacao ? <OmniLoader size={14} /> : <Save size={14} />}
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
                                <div className="omni-flex-col omni-gap-3">
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
                                    <Card variant="default" style={{
                                        border: "2px solid rgba(99,102,241,.2)",
                                        background: "rgba(99,102,241,.02)",
                                    }}>
                                        <CardHeader className="pb-3" style={{ background: "rgba(99,102,241,.05)" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                                <CardTitle className="text-sm flex items-center gap-2 m-0 text-indigo-500">
                                                    <ClipboardList size={16} />
                                                    Gabarito — Respostas do Estudante
                                                </CardTitle>
                                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                                    {Object.keys(respostasAluno).length} de {totalQ} respondidas
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-2.5 p-4">
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
                                                    {analisando ? <OmniLoader engine="red" size={16} /> : <BarChart3 size={16} />}
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
                                                                        {d.habilidade && <span className="omni-text-muted"> — {d.habilidade}</span>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* ── Phase 4: Qualitative Analysis Panel ── */}
                                                    {analiseResultado.qualitativo && (() => {
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        const qual = analiseResultado.qualitativo as Record<string, any>;
                                                        const nivelColors: Record<string, { bg: string; border: string; text: string; emoji: string }> = {
                                                            avancado: { bg: "rgba(16,185,129,.06)", border: "rgba(16,185,129,.2)", text: "#10b981", emoji: "🌟" },
                                                            adequado: { bg: "rgba(59,130,246,.06)", border: "rgba(59,130,246,.2)", text: "#3b82f6", emoji: "✅" },
                                                            razoavel: { bg: "rgba(245,158,11,.06)", border: "rgba(245,158,11,.2)", text: "#f59e0b", emoji: "🔄" },
                                                            em_processo: { bg: "rgba(239,68,68,.06)", border: "rgba(239,68,68,.2)", text: "#ef4444", emoji: "📌" },
                                                        };
                                                        const nv = nivelColors[qual.nivel_desempenho] || nivelColors.em_processo;
                                                        const grupoColors: Record<string, { bg: string; border: string; text: string }> = {
                                                            defasagem: { bg: "rgba(239,68,68,.05)", border: "rgba(239,68,68,.15)", text: "#ef4444" },
                                                            intermediario: { bg: "rgba(245,158,11,.05)", border: "rgba(245,158,11,.15)", text: "#f59e0b" },
                                                            avancado: { bg: "rgba(16,185,129,.05)", border: "rgba(16,185,129,.15)", text: "#10b981" },
                                                        };
                                                        const gc = grupoColors[qual.grupo_sugerido] || grupoColors.intermediario;

                                                        return (
                                                            <>
                                                                {/* Separator */}
                                                                <div style={{ margin: "8px 0", borderTop: "1px dashed rgba(148,163,184,.15)" }} />

                                                                {/* Performance Level */}
                                                                <div style={{
                                                                    padding: "12px 14px", borderRadius: 10,
                                                                    background: nv.bg, border: `1px solid ${nv.border}`,
                                                                }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                                                        <span style={{ fontSize: 16 }}>{nv.emoji}</span>
                                                                        <span style={{ fontSize: 12, fontWeight: 700, color: nv.text, textTransform: "capitalize" }}>
                                                                            Nível de Desempenho: {(qual.nivel_desempenho as string).replace("_", " ")}
                                                                        </span>
                                                                    </div>
                                                                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                                                                        {qual.descricao_nivel}
                                                                    </p>
                                                                </div>

                                                                {/* Grouping Suggestion */}
                                                                <div style={{
                                                                    padding: "12px 14px", borderRadius: 10,
                                                                    background: gc.bg, border: `1px solid ${gc.border}`,
                                                                }}>
                                                                    <span style={{ fontSize: 12, fontWeight: 700, color: gc.text }}>
                                                                        👥 Agrupamento Sugerido: {(qual.grupo_sugerido as string).charAt(0).toUpperCase() + (qual.grupo_sugerido as string).slice(1)}
                                                                    </span>
                                                                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: 1.5 }}>
                                                                        {qual.descricao_grupo}
                                                                    </p>
                                                                </div>

                                                                {/* Competency Map */}
                                                                {qual.mapa_competencias && (
                                                                    <div style={{
                                                                        padding: "12px 14px", borderRadius: 10,
                                                                        background: "rgba(99,102,241,.04)", border: "1px solid rgba(99,102,241,.12)",
                                                                    }}>
                                                                        <span style={{ fontSize: 12, fontWeight: 700, color: "#818cf8" }}>🗺️ Mapa de Competências</span>
                                                                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                                                                            {(qual.mapa_competencias.dominadas as string[])?.length > 0 && (
                                                                                <div>
                                                                                    <span style={{ fontSize: 10, fontWeight: 600, color: "#10b981" }}>✅ Dominadas:</span>
                                                                                    <div style={{ marginTop: 2, display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                                                        {(qual.mapa_competencias.dominadas as string[]).map((h: string, i: number) => (
                                                                                            <span key={i} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(16,185,129,.1)", color: "#10b981", fontWeight: 600 }}>{h}</span>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {(qual.mapa_competencias.em_desenvolvimento as string[])?.length > 0 && (
                                                                                <div>
                                                                                    <span style={{ fontSize: 10, fontWeight: 600, color: "#f59e0b" }}>🔄 Em desenvolvimento:</span>
                                                                                    <div style={{ marginTop: 2, display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                                                        {(qual.mapa_competencias.em_desenvolvimento as string[]).map((h: string, i: number) => (
                                                                                            <span key={i} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(245,158,11,.1)", color: "#f59e0b", fontWeight: 600 }}>{h}</span>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {(qual.mapa_competencias.nao_demonstradas as string[])?.length > 0 && (
                                                                                <div>
                                                                                    <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8" }}>⬜ Não demonstradas:</span>
                                                                                    <div style={{ marginTop: 2, display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                                                        {(qual.mapa_competencias.nao_demonstradas as string[]).map((h: string, i: number) => (
                                                                                            <span key={i} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(148,163,184,.08)", color: "#94a3b8", fontWeight: 600 }}>{h}</span>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Mediation */}
                                                                {qual.mediacao_sugerida && (
                                                                    <div style={{
                                                                        padding: "12px 14px", borderRadius: 10,
                                                                        background: "rgba(139,92,246,.04)", border: "1px solid rgba(139,92,246,.12)",
                                                                    }}>
                                                                        <span style={{ fontSize: 12, fontWeight: 700, color: "#8b5cf6" }}>🎯 Mediação Pedagógica (Como chegar lá?)</span>
                                                                        <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "6px 0 0", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                                                                            {qual.mediacao_sugerida}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* Pedagogical Disclaimer */}
                                                                {qual.aviso_hipotese && (
                                                                    <div style={{
                                                                        padding: "8px 12px", borderRadius: 8,
                                                                        background: "rgba(245,158,11,.04)", border: "1px solid rgba(245,158,11,.12)",
                                                                        fontSize: 10, color: "#f59e0b", lineHeight: 1.5,
                                                                    }}>
                                                                        {qual.aviso_hipotese}
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}{/* /Phase 4 */}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })()}
                            {/* ── Card-based Question Display ── */}
                            <div className="omni-flex-col omni-gap-1">
                                {/* Header with download buttons */}
                                <div style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "12px 16px", borderRadius: 10,
                                    background: "rgba(99,102,241,.05)", border: "1px solid rgba(99,102,241,.15)",
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: "#818cf8" }}>
                                        📝 Prova Gerada — {questoesIndividuais.length} questões
                                    </span>
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

                                {/* ── Individual Question Cards ── */}
                                {questoesIndividuais.map((q, idx) => {
                                    const qNum = q._numero || idx + 1;
                                    const imgUrl = mapaImagensResultado[qNum] || q._imagemUrl;
                                    const hab = q.habilidade_bncc_ref || q._habilidade || '';
                                    const habTexto = q._habilidadeTexto || q.habilidade_texto || '';
                                    const analiseDistratores = q.analise_distratores as Record<string, string> | undefined;
                                    const sv = q.suporte_visual;
                                    const isError = Boolean(q._erro);
                                    const isRegenerating = q._refazendo || false;
                                    const isRegeneratingImg = q._regeneratingImage || false;
                                    const feedbackKey = `_feedbackRefazer_${qNum}`;
                                    const showFeedback = q._showFeedbackRefazer || false;

                                    return (
                                        <div key={qNum} style={{
                                            borderRadius: 14, overflow: "hidden",
                                            border: isError
                                                ? "2px solid rgba(239,68,68,.3)"
                                                : "2px solid var(--border-default, rgba(148,163,184,.1))",
                                            background: "var(--bg-primary, #fff)",
                                            transition: "all .2s ease",
                                        }}>
                                            {/* ── Card Header: número + habilidade ── */}
                                            <div className={`flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-default)] ${isError ? "bg-red-500/5" : "bg-indigo-500/5"}`}>
                                                <div className="omni-flex-row omni-gap-10">
                                                    <span className={`w-[30px] h-[30px] rounded-full flex items-center justify-center font-extrabold text-sm ${isError ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-500"}`}>{qNum}</span>
                                                    {hab && (
                                                        <BadgeInfo variant="indigo">{hab}</BadgeInfo>
                                                    )}
                                                    {q.nivel_bloom && (
                                                        <BadgeInfo variant="purple">{q.nivel_bloom}</BadgeInfo>
                                                    )}
                                                    {q.gabarito && (
                                                        <BadgeInfo variant="emerald">Gabarito: {q.gabarito}</BadgeInfo>
                                                    )}
                                                </div>
                                                <div className="flex gap-1.5">
                                                    {/* Refazer button */}
                                                    <button
                                                        onClick={() => {
                                                            q._showFeedbackRefazer = !q._showFeedbackRefazer;
                                                            setQuestoesIndividuais([...questoesIndividuais]);
                                                        }}
                                                        className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border border-amber-500/25 bg-amber-500/5 text-amber-500 font-semibold cursor-pointer"
                                                    >
                                                        🔄 Refazer
                                                    </button>
                                                    {/* Gerar/Regenerar Imagem */}
                                                    <button
                                                        onClick={async () => {
                                                            q._regeneratingImage = true;
                                                            setQuestoesIndividuais([...questoesIndividuais]);
                                                            try {
                                                                const imgPrompt = sv?.descricao_para_geracao
                                                                    || `Ilustração educacional clara para questão de ${selectedDisc} sobre: ${q.enunciado?.slice(0, 120) || hab}`;
                                                                const r = await fetch("/api/avaliacao-diagnostica/gerar-imagem", {
                                                                    method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({
                                                                        tipo: sv?.tipo || 'ilustracao',
                                                                        descricao: imgPrompt,
                                                                        texto_alternativo: sv?.texto_alternativo || imgPrompt,
                                                                        disciplina: selectedDisc,
                                                                        serie: selectedAluno?.grade || '',
                                                                    }),
                                                                });
                                                                if (r.ok) {
                                                                    const d = await r.json();
                                                                    if (d.imageUrl) {
                                                                        const newMapa = { ...mapaImagensResultado, [qNum]: d.imageUrl };
                                                                        setMapaImagensResultado(newMapa);
                                                                        rebuildResultadoFormatado(questoesIndividuais, newMapa);
                                                                    }
                                                                }
                                                            } catch { /* silent */ }
                                                            q._regeneratingImage = false;
                                                            setQuestoesIndividuais([...questoesIndividuais]);
                                                        }}
                                                        disabled={isRegeneratingImg}
                                                        className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-semibold ${isRegeneratingImg ? "cursor-wait" : "cursor-pointer"}`}
                                                    >
                                                        {isRegeneratingImg ? "⏳ Gerando..." : imgUrl ? "🖼️ Refazer Imagem" : "🖼️ Gerar Imagem"}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* ── Feedback para Refazer ── */}
                                            {showFeedback && (
                                                <div className="flex flex-col gap-2 px-4 py-3 bg-amber-500/5 border-b border-amber-500/15">
                                                    <label style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>
                                                        💬 O que precisa mudar nesta questão?
                                                    </label>
                                                    <textarea
                                                        value={((q as Record<string, unknown>)[feedbackKey] as string) || ''}
                                                        onChange={e => {
                                                            (q as Record<string, unknown>)[feedbackKey] = e.target.value;
                                                            setQuestoesIndividuais([...questoesIndividuais]);
                                                        }}
                                                        placeholder="Ex: A imagem mostra ciclo da borracha, mas a questão é sobre ciclo do açúcar..."
                                                        rows={2}
                                                        className="w-full px-3 py-2 rounded-lg border border-amber-500/25 bg-amber-500/5 text-sm resize-y text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-amber-500/30"
                                                    />
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={async () => {
                                                                const feedback = ((q as Record<string, unknown>)[feedbackKey] as string) || '';
                                                                q._refazendo = true;
                                                                q._showFeedbackRefazer = false;
                                                                setQuestoesIndividuais([...questoesIndividuais]);

                                                                try {
                                                                    const res = await fetch("/api/avaliacao-diagnostica/criar-item", {
                                                                        method: "POST",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify({
                                                                            habilidade_codigo: hab || selectedDisc,
                                                                            disciplina: selectedDisc,
                                                                            serie: selectedAluno?.grade || '',
                                                                            gabarito_definido: q.gabarito || q._gabarito_esperado || '',
                                                                            nivel_dificuldade: q.nivel_dificuldade || 'medio',
                                                                            numero_questao: qNum,
                                                                            total_questoes: questoesIndividuais.length,
                                                                            diagnostico_aluno: selectedAluno?.diagnostico || '',
                                                                            nome_aluno: selectedAluno?.name || 'o estudante',
                                                                            nivel_omnisfera_estimado: nivelIdentificado ?? 1,
                                                                            plano_ensino_contexto: planoVinculado?.conteudo,
                                                                            alerta_nee: neeAlert || '',
                                                                            instrucao_uso_diagnostica: instrucaoDiag || '',
                                                                            barreiras_ativas: flattenBarreiras(selectedAluno?.barreiras_selecionadas),
                                                                            engine: engineSel,
                                                                            feedback_professor: feedback
                                                                                ? `O PROFESSOR PEDIU AJUSTE: ${feedback}. A questão anterior era sobre "${(q.enunciado || '').slice(0, 200)}". CORRIJA conforme o pedido.`
                                                                                : undefined,
                                                                        }),
                                                                    });
                                                                    const data = await res.json();
                                                                    if (res.ok && data.questao) {
                                                                        const novaQ = data.questao;
                                                                        novaQ._numero = qNum;
                                                                        novaQ._gabarito_esperado = q._gabarito_esperado || q.gabarito;

                                                                        // Replace question in array
                                                                        const newQs = [...questoesIndividuais];
                                                                        newQs[idx] = novaQ;
                                                                        setQuestoesIndividuais(newQs);

                                                                        // Rebuild text
                                                                        rebuildResultadoFormatado(newQs, mapaImagensResultado);

                                                                        // Auto-generate image if needed
                                                                        const newSv = novaQ.suporte_visual;
                                                                        if (newSv?.necessario && newSv?.descricao_para_geracao) {
                                                                            novaQ._regeneratingImage = true;
                                                                            setQuestoesIndividuais([...newQs]);
                                                                            try {
                                                                                const imgRes = await fetch("/api/avaliacao-diagnostica/gerar-imagem", {
                                                                                    method: "POST",
                                                                                    headers: { "Content-Type": "application/json" },
                                                                                    body: JSON.stringify({
                                                                                        tipo: newSv.tipo || 'ilustracao',
                                                                                        descricao: newSv.descricao_para_geracao,
                                                                                        texto_alternativo: newSv.texto_alternativo || newSv.descricao_para_geracao,
                                                                                        disciplina: selectedDisc,
                                                                                        serie: selectedAluno?.grade || '',
                                                                                    }),
                                                                                });
                                                                                if (imgRes.ok) {
                                                                                    const imgData = await imgRes.json();
                                                                                    if (imgData.imageUrl) {
                                                                                        const nm = { ...mapaImagensResultado, [qNum]: imgData.imageUrl };
                                                                                        setMapaImagensResultado(nm);
                                                                                        rebuildResultadoFormatado(newQs, nm);
                                                                                    }
                                                                                }
                                                                            } catch { /* silent */ }
                                                                            novaQ._regeneratingImage = false;
                                                                            setQuestoesIndividuais([...newQs]);
                                                                        }
                                                                    } else {
                                                                        q._refazendo = false;
                                                                        setQuestoesIndividuais([...questoesIndividuais]);
                                                                    }
                                                                } catch { /* expected fallback */
                                                                    q._refazendo = false;
                                                                    setQuestoesIndividuais([...questoesIndividuais]);
                                                                }
                                                            }}
                                                            disabled={isRegenerating}
                                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md border-none text-white text-xs font-bold ${isRegenerating ? "bg-slate-400 cursor-wait" : "bg-gradient-to-br from-amber-500 to-amber-400 cursor-pointer"}`}
                                                        >
                                                            {isRegenerating ? <OmniLoader size={12} /> : <Sparkles size={12} />}
                                                            {isRegenerating ? "Regenerando..." : "Regenerar Questão"}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                q._showFeedbackRefazer = false;
                                                                setQuestoesIndividuais([...questoesIndividuais]);
                                                            }}
                                                            className="px-3 py-1.5 rounded-md border border-[var(--border-default)] bg-transparent text-[var(--text-muted)] text-xs cursor-pointer hover:bg-slate-500/5"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── Card Body: conteúdo da questão ── */}
                                            <div style={{ padding: "14px 18px" }}>
                                                {isError ? (
                                                    <div style={{ color: "#ef4444", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                                        <AlertTriangle size={14} /> Erro ao gerar: {q._erro}
                                                    </div>
                                                ) : isRegenerating ? (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "20px 0", justifyContent: "center", color: "#818cf8", fontSize: 13 }}>
                                                        <OmniLoader size={18} /> Regenerando questão {qNum}...
                                                    </div>
                                                ) : (
                                                    <div className="omni-flex-col omni-gap-10">
                                                        {/* Habilidade BNCC texto completo */}
                                                        {(habTexto || q._unidadeTematica) && (
                                                            <div style={{
                                                                padding: "8px 12px", borderRadius: 8,
                                                                background: "rgba(99,102,241,.03)",
                                                                border: "1px solid rgba(99,102,241,.08)",
                                                                fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6,
                                                            }}>
                                                                {q._unidadeTematica && (
                                                                    <div style={{ display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                                                                        <span style={{ fontSize: 10, fontWeight: 700, color: "#818cf8", padding: "1px 6px", borderRadius: 4, background: "rgba(99,102,241,.08)" }}>
                                                                            {q._unidadeTematica}
                                                                        </span>
                                                                        {q._objetoConhecimento && (
                                                                            <span style={{ fontSize: 10, color: "#a855f7" }}>
                                                                                → {q._objetoConhecimento}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {habTexto && (
                                                                    <div>📚 <strong>Habilidade:</strong> {habTexto}</div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Enunciado */}
                                                        {q.enunciado && (
                                                            <p className="text-sm leading-relaxed text-[var(--text-primary)] m-0">
                                                                {q.enunciado}
                                                            </p>
                                                        )}

                                                        {/* Comando */}
                                                        {q.comando && (
                                                            <p className="text-[13px] font-bold text-[var(--text-primary)] my-1 italic">
                                                                {q.comando}
                                                            </p>
                                                        )}

                                                        {/* Imagem inline */}
                                                        {imgUrl && (
                                                            <div style={{
                                                                display: "flex", justifyContent: "center", padding: "8px 0",
                                                            }}>
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={imgUrl}
                                                                    alt={sv?.texto_alternativo || `Imagem Q${qNum}`}
                                                                    style={{
                                                                        maxWidth: "100%", maxHeight: 280, borderRadius: 10,
                                                                        border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                                                        objectFit: "contain",
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Alternativas + Distratores */}
                                                        {q.alternativas && (
                                                            <div className="flex flex-col gap-2 mt-2">
                                                                {Object.entries(q.alternativas as Record<string, string>).map(([letra, texto]) => {
                                                                    const isCorrect = letra === q.gabarito;
                                                                    const distratorInfo = analiseDistratores?.[letra];
                                                                    return (
                                                                        <AlternativaItem
                                                                            key={letra}
                                                                            letra={letra}
                                                                            texto={texto}
                                                                            isCorrect={isCorrect}
                                                                            distratorInfo={distratorInfo}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {/* Justificativa Pedagógica */}
                                                        {q.justificativa_pedagogica && (
                                                            <div className="mt-1.5 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-400 italic leading-snug">
                                                                💡 {q.justificativa_pedagogica}
                                                            </div>
                                                        )}

                                                        {/* Instrução Professor */}
                                                        {q.instrucao_professor && (
                                                            <div className="px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-amber-700 leading-snug">
                                                                👩‍🏫 <strong>Para o professor:</strong> {q.instrucao_professor}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={() => { setResultadoFormatado(null); setValidadoFormatado(false); setQuestoesIndividuais([]); }} style={{
                                padding: "10px 18px", borderRadius: 10,
                                background: "transparent", color: "var(--text-muted, #94a3b8)",
                                border: "1px solid var(--border-default, rgba(148,163,184,.15))",
                                cursor: "pointer", fontSize: 13, textAlign: "center",
                            }}>
                                Gerar nova prova
                            </button>
                        </div>
                    )
                }

                {
                    avalError && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "12px 16px", borderRadius: 10,
                            background: "rgba(239,68,68,.1)", color: "#f87171", fontSize: 13,
                            marginBottom: 16,
                        }}>
                            <AlertTriangle size={16} /> {avalError}
                        </div>
                    )
                }


                {/* ─── CAMADA B: Cognitivo-Funcional ──────────────────── */}
                {
                    nivelIdentificado !== null && dimensoesNEE.length > 0 && (
                        <Card variant="default" className="mb-5">
                            <button
                                onClick={() => setShowCamadaB(!showCamadaB)}
                                className="flex items-center gap-2 px-4 py-3 w-full cursor-pointer justify-between border-none"
                                style={{
                                    background: "rgba(168,85,247,.05)",
                                }}
                            >
                                <div className="omni-flex-row omni-gap-2">
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
                                <CardContent className="p-4" style={{ borderTop: "1px solid var(--omni-border-default)" }}>
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
                                </CardContent>
                            )}
                        </Card>
                    )
                }

                {/* ─── Generate V3 Outputs ─────────────────────────────── */}
                {
                    nivelIdentificado !== null && (
                        <div style={{ marginBottom: 20 }}>
                            {/* Section header */}
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8,
                                marginBottom: 12, paddingBottom: 8,
                                borderBottom: "1px solid var(--border-default, rgba(148,163,184,.1))",
                            }}>
                                <Target size={18} style={{ color: "#a855f7" }} />
                                <div>
                                    <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary, #e2e8f0)" }}>
                                        Relatórios IA (Opcionais)
                                    </span>
                                    <p style={{ fontSize: 11, color: "var(--text-muted, #64748b)", margin: "2px 0 0" }}>
                                        Com o nível Omnisfera identificado, você pode gerar dois relatórios complementares para enriquecer o PEI.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                                    <button onClick={gerarPerfil} disabled={gerandoPerfil} style={{
                                        flex: 1, padding: "14px 16px", borderRadius: 12,
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                        cursor: gerandoPerfil ? "not-allowed" : "pointer",
                                        fontSize: 13, fontWeight: 700, border: "none",
                                        background: perfilGerado ? "rgba(168,85,247,.1)" : gerandoPerfil ? "var(--bg-tertiary)" : "linear-gradient(135deg, #7c3aed, #a855f7)",
                                        color: perfilGerado ? "#a855f7" : "#fff",
                                        boxShadow: perfilGerado ? "none" : "0 4px 16px rgba(168,85,247,.2)",
                                    }}>
                                        {gerandoPerfil ? <OmniLoader engine="red" size={16} /> : perfilGerado ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
                                        {gerandoPerfil ? "Gerando..." : perfilGerado ? "✅ Perfil gerado — Regenerar" : "Gerar Perfil de Funcionamento"}
                                    </button>
                                    <span style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center" }}>
                                        Analisa dimensões cognitivo-funcionais do estudante
                                    </span>
                                </div>

                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                                    <button onClick={gerarEstrategias} disabled={gerandoEstrategias} style={{
                                        flex: 1, padding: "14px 16px", borderRadius: 12,
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                        cursor: gerandoEstrategias ? "not-allowed" : "pointer",
                                        fontSize: 13, fontWeight: 700, border: "none",
                                        background: estrategiasGeradas ? "rgba(16,185,129,.1)" : gerandoEstrategias ? "var(--bg-tertiary)" : "linear-gradient(135deg, #059669, #10b981)",
                                        color: estrategiasGeradas ? "#10b981" : "#fff",
                                        boxShadow: estrategiasGeradas ? "none" : "0 4px 16px rgba(16,185,129,.2)",
                                    }}>
                                        {gerandoEstrategias ? <OmniLoader engine="red" size={16} /> : estrategiasGeradas ? <CheckCircle2 size={16} /> : <Target size={16} />}
                                        {gerandoEstrategias ? "Gerando..." : estrategiasGeradas ? "✅ Estratégias geradas — Regenerar" : "Gerar Estratégias Práticas"}
                                    </button>
                                    <span style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center" }}>
                                        Sugere intervenções para dimensões com dificuldade
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* ─── Erro ao gerar perfil ─────────────────────────────── */}
                {
                    perfilError && (
                        <div style={{ padding: 12, marginBottom: 16, borderRadius: 10, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", color: "#f87171", fontSize: 13 }}>
                            <strong>Erro:</strong> {perfilError}
                        </div>
                    )
                }

                {/* ─── Perfil de Funcionamento Output ─────────────────── */}
                {
                    perfilGerado && (
                        <Card variant="default" className="mb-5" style={{ border: "1.5px solid rgba(168,85,247,.2)" }}>
                            <CardHeader className="pb-3" style={{ background: "rgba(168,85,247,.05)" }}>
                                <CardTitle className="text-sm flex items-center gap-2 m-0 text-fuchsia-500">
                                    <Sparkles size={16} />
                                    Perfil de Funcionamento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-4">
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
                            </CardContent>
                        </Card>
                    )
                }

                {/* ─── Estratégias Práticas Output ────────────────────── */}
                {
                    estrategiasGeradas && (
                        <Card variant="default" className="mb-5" style={{ border: "1.5px solid rgba(16,185,129,.2)" }}>
                            <CardHeader className="pb-3" style={{ background: "rgba(16,185,129,.05)" }}>
                                <CardTitle className="text-sm flex items-center gap-2 m-0 text-emerald-500">
                                    <Target size={16} />
                                    Estratégias Práticas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-4">
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
                            </CardContent>
                        </Card>
                    )
                }

                {/* ─── Processual Data Feed ──────────────────────────── */}
                {
                    evolucaoProcessual.length > 0 && evolucaoProcessual[0]?.periodos?.length > 0 && (
                        <Card variant="default" className="mb-5">
                            <button
                                onClick={() => setShowProcessual(!showProcessual)}
                                className="flex items-center gap-2 px-4 py-3 w-full cursor-pointer justify-between border-none"
                                style={{
                                    background: "rgba(16,185,129,.05)",
                                }}
                            >
                                <div className="omni-flex-row omni-gap-2">
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
                                <CardContent className="p-4" style={{ borderTop: "1px solid var(--omni-border-default)" }}>
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
                                    <a href={`/avaliacao-processual${selectedAluno ? `?student=${selectedAluno.id}` : ""}`} style={{
                                        display: "inline-flex", alignItems: "center", gap: 6,
                                        fontSize: 12, fontWeight: 700, color: "#10b981", textDecoration: "none",
                                        padding: "8px 14px", borderRadius: 8, background: "rgba(16,185,129,.06)",
                                        border: "1px solid rgba(16,185,129,.15)",
                                    }}>
                                        <Activity size={12} /> Ver Avaliação Processual completa →
                                    </a>
                                </CardContent>
                            )}
                        </Card>
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
                                <Card variant="default" className="mb-5" style={{
                                    border: `1.5px solid ${delta > 0 ? "rgba(16,185,129,.2)" : delta < 0 ? "rgba(239,68,68,.15)" : "rgba(148,163,184,.12)"}`,
                                }}>
                                    <CardHeader className="pb-3" style={{
                                        background: delta > 0 ? "rgba(16,185,129,.03)" : delta < 0 ? "rgba(239,68,68,.03)" : "rgba(148,163,184,.03)",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                            <CardTitle className="text-sm flex items-center gap-2 m-0 text-(--text-primary)">
                                                <TrendingUp size={16} style={{ color: delta > 0 ? "#10b981" : delta < 0 ? "#f87171" : "#94a3b8" }} />
                                                Diagnóstica vs Processual
                                            </CardTitle>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 6,
                                                background: delta > 0 ? "rgba(16,185,129,.1)" : delta < 0 ? "rgba(239,68,68,.1)" : "rgba(148,163,184,.1)",
                                                color: delta > 0 ? "#10b981" : delta < 0 ? "#f87171" : "#94a3b8",
                                            }}>
                                                {delta > 0 ? `↗ +${delta.toFixed(1)}` : delta < 0 ? `↘ ${delta.toFixed(1)}` : "→ 0"}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-4">
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
                                    </CardContent>
                                </Card>
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
                            <span className="omni-text-sm omni-text-muted">
                                📊 Acompanhe a evolução deste estudante ao longo do ano
                            </span>
                            <a href={`/avaliacao-processual${selectedAluno ? `?student=${selectedAluno.id}` : ""}`} style={{
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
        <div>
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

            {/* Page header — unified PageHero */}
            <PageHero
                route="/avaliacao-diagnostica"
                title="Avaliação Diagnóstica"
                desc={`${professorName} · ${alunos.length} estudante${alunos.length !== 1 ? "s" : ""}`}
            />

            {/* Cross-link to Processual */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px", borderRadius: 10, marginBottom: 20,
                background: "rgba(16,185,129,.05)", border: "1px solid rgba(16,185,129,.15)",
            }}>
                <span className="omni-text-sm omni-text-muted">
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
                    {/* Seletor de momento — início do fluxo */}
                    <Card variant="default" className="mb-4" style={{ border: "1px solid rgba(99,102,241,.2)" }}>
                        <CardHeader className="pb-3" style={{ background: "rgba(99,102,241,.04)" }}>
                            <CardTitle className="text-sm flex items-center gap-2 m-0 text-indigo-500">
                                <Calendar size={16} /> Momento da avaliação
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2.5 p-4">
                            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                                A avaliação diagnóstica verifica habilidades do <strong>ano anterior</strong>. No início do ano use a matriz de referência; no decorrer do ano você pode usar o plano de ensino que criou.
                            </p>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <label style={{
                                    flex: 1, minWidth: 200, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                                    border: momentoDiagnostica === "inicio_ano" ? "2px solid #818cf8" : "1px solid var(--border-default)",
                                    background: momentoDiagnostica === "inicio_ano" ? "rgba(99,102,241,.1)" : "transparent",
                                    display: "flex", alignItems: "flex-start", gap: 8,
                                }}>
                                    <input type="radio" name="momento" checked={momentoDiagnostica === "inicio_ano"} onChange={() => setMomentoDiagnostica("inicio_ano")} style={{ marginTop: 2, accentColor: "#818cf8" }} />
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>Início do ano letivo</span>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Matriz de referência Omnisfera (habilidades do ano anterior)</div>
                                    </div>
                                </label>
                                <label style={{
                                    flex: 1, minWidth: 200, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                                    border: momentoDiagnostica === "decorrer_ano" ? "2px solid #0ea5e9" : "1px solid var(--border-default)",
                                    background: momentoDiagnostica === "decorrer_ano" ? "rgba(14,165,233,.1)" : "transparent",
                                    display: "flex", alignItems: "flex-start", gap: 8,
                                }}>
                                    <input type="radio" name="momento" checked={momentoDiagnostica === "decorrer_ano"} onChange={() => setMomentoDiagnostica("decorrer_ano")} style={{ marginTop: 2, accentColor: "#0ea5e9" }} />
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>No decorrer do ano letivo</span>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Usar plano de ensino do professor (se houver)</div>
                                    </div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Empty state */}
                    {alunos.length === 0 && (
                        <Card variant="default" className="text-center px-5 py-10 border-dashed">
                            <Users size={48} style={{ margin: "0 auto 12px", color: "var(--text-muted)", opacity: 0.3 }} />
                            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                                Nenhum estudante encontrado
                            </h3>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                                Estudantes em Fase 2 do PEI aparecerão aqui.
                            </p>
                        </Card>
                    )}

                    {/* Student cards */}
                    <div className="omni-flex-col omni-gap-3">
                        {alunos.map(aluno => {
                            const totalDisc = aluno.disciplinas.length;
                            const avaliadasCompletas = aluno.disciplinas.filter(d => d.avaliacao_status === "aplicada").length;

                            return (
                                <Card variant="default" key={aluno.id} className="mb-0 overflow-hidden">
                                    <div className="p-4 py-3 flex items-center justify-between border-b border-(--omni-border-default) bg-(--omni-surface-elevated)">
                                        <div className="omni-flex-row omni-gap-10">
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
                                            <div className="omni-text-xs omni-text-muted">avaliações</div>
                                        </div>
                                    </div>

                                    {/* Discipline buttons */}
                                    <CardContent className="flex flex-wrap gap-2 p-4">
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
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

