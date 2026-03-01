"use client";

import { useState, useEffect } from "react";
import {
    Loader2, Users, BookOpen, Brain, CheckCircle2, ChevronDown,
    ChevronUp, Sparkles, Save, FileText, TrendingUp, ArrowLeft,
    Target, Lightbulb, ClipboardList, Package,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DisciplinaInfo = {
    disciplina: string;
    fase_status: string;
    pei_disciplina_data: Record<string, unknown> | null;
};

type EstudanteInfo = {
    id: string;
    name: string;
    grade: string;
    class_group: string;
    diagnosis: string | null;
    pei_resumo: string | null;
    disciplinas: DisciplinaInfo[];
};

type PEIDisciplina = {
    direcionamento: string;
    objetivos: string;
    estrategias_neurociencia: string;
    adaptacoes_curriculares: string;
    criterios_avaliacao: string;
    recursos_recomendados: string;
    anotacoes_professor: string;
};

const FASE_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    plano_ensino: { label: "Plano de Ensino", color: "#f59e0b", icon: <FileText className="w-4 h-4" /> },
    diagnostica: { label: "Diagnóstica", color: "#3b82f6", icon: <TrendingUp className="w-4 h-4" /> },
    pei_disciplina: { label: "PEI Disciplina", color: "#8b5cf6", icon: <Brain className="w-4 h-4" /> },
    concluido: { label: "Concluído", color: "#10b981", icon: <CheckCircle2 className="w-4 h-4" /> },
};

const SECTION_CONFIG = [
    { key: "direcionamento", label: "Perfil do Estudante na Disciplina", icon: <Target className="w-5 h-5" />, color: "text-blue-600" },
    { key: "objetivos", label: "Objetivos de Aprendizagem", icon: <ClipboardList className="w-5 h-5" />, color: "text-emerald-600" },
    { key: "estrategias_neurociencia", label: "Estratégias baseadas em Neurociência", icon: <Brain className="w-5 h-5" />, color: "text-purple-600" },
    { key: "adaptacoes_curriculares", label: "Adaptações Curriculares", icon: <Lightbulb className="w-5 h-5" />, color: "text-amber-600" },
    { key: "criterios_avaliacao", label: "Critérios de Avaliação", icon: <TrendingUp className="w-5 h-5" />, color: "text-sky-600" },
    { key: "recursos_recomendados", label: "Recursos Recomendados", icon: <Package className="w-5 h-5" />, color: "text-rose-600" },
] as const;

const EMPTY_PEI: PEIDisciplina = {
    direcionamento: "",
    objetivos: "",
    estrategias_neurociencia: "",
    adaptacoes_curriculares: "",
    criterios_avaliacao: "",
    recursos_recomendados: "",
    anotacoes_professor: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PEIProfessorClient() {
    const [estudantes, setEstudantes] = useState<EstudanteInfo[]>([]);
    const [loading, setLoading] = useState(true);

    // Seleção
    const [selectedStudent, setSelectedStudent] = useState<EstudanteInfo | null>(null);
    const [selectedDisc, setSelectedDisc] = useState<DisciplinaInfo | null>(null);

    // PEI editável
    const [peiContent, setPeiContent] = useState<PEIDisciplina>(EMPTY_PEI);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    // Fetch estudantes
    useEffect(() => {
        fetch("/api/pei-professor")
            .then((r) => r.json())
            .then((d) => setEstudantes(d.estudantes || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Ao selecionar disciplina, carregar dados existentes
    function openDisciplina(student: EstudanteInfo, disc: DisciplinaInfo) {
        setSelectedStudent(student);
        setSelectedDisc(disc);
        setSaved(false);

        if (disc.pei_disciplina_data && typeof disc.pei_disciplina_data === "object") {
            const d = disc.pei_disciplina_data as Record<string, string>;
            setPeiContent({
                direcionamento: d.direcionamento || "",
                objetivos: d.objetivos || "",
                estrategias_neurociencia: d.estrategias_neurociencia || "",
                adaptacoes_curriculares: d.adaptacoes_curriculares || "",
                criterios_avaliacao: d.criterios_avaliacao || "",
                recursos_recomendados: d.recursos_recomendados || "",
                anotacoes_professor: d.anotacoes_professor || "",
            });
        } else {
            setPeiContent(EMPTY_PEI);
        }
        setExpandedSection(null);
    }

    // Gerar PEI via IA
    async function gerarPEI() {
        if (!selectedStudent || !selectedDisc) return;
        setGenerating(true);
        try {
            const res = await fetch("/api/pei-professor/gerar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: selectedStudent.id,
                    disciplina: selectedDisc.disciplina,
                }),
            });
            const json = await res.json();
            if (res.ok && json.pei_disciplina) {
                const g = json.pei_disciplina as Record<string, string>;
                setPeiContent((prev) => ({
                    ...prev,
                    direcionamento: g.direcionamento || prev.direcionamento,
                    objetivos: g.objetivos || prev.objetivos,
                    estrategias_neurociencia: g.estrategias_neurociencia || prev.estrategias_neurociencia,
                    adaptacoes_curriculares: g.adaptacoes_curriculares || prev.adaptacoes_curriculares,
                    criterios_avaliacao: g.criterios_avaliacao || prev.criterios_avaliacao,
                    recursos_recomendados: g.recursos_recomendados || prev.recursos_recomendados,
                }));
                setExpandedSection("direcionamento");
            } else {
                alert(json.error || "Erro ao gerar PEI.");
            }
        } catch {
            alert("Erro ao gerar PEI.");
        } finally {
            setGenerating(false);
        }
    }

    // Salvar
    async function salvarPEI() {
        if (!selectedStudent || !selectedDisc) return;
        setSaving(true);
        try {
            const res = await fetch("/api/pei-professor/salvar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: selectedStudent.id,
                    disciplina: selectedDisc.disciplina,
                    pei_disciplina_data: peiContent,
                    fase_status: peiContent.direcionamento ? "pei_disciplina" : selectedDisc.fase_status,
                }),
            });
            const json = await res.json();
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
                // Atualizar dados locais
                setEstudantes((prev) =>
                    prev.map((e) =>
                        e.id === selectedStudent.id
                            ? {
                                ...e,
                                disciplinas: e.disciplinas.map((d) =>
                                    d.disciplina === selectedDisc.disciplina
                                        ? { ...d, pei_disciplina_data: peiContent as unknown as Record<string, unknown>, fase_status: peiContent.direcionamento ? "pei_disciplina" : d.fase_status }
                                        : d
                                ),
                            }
                            : e
                    )
                );
            } else {
                alert(json.error || "Erro ao salvar.");
            }
        } catch {
            alert("Erro ao salvar.");
        } finally {
            setSaving(false);
        }
    }

    function updateField(key: keyof PEIDisciplina, value: string) {
        setPeiContent((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }

    // ─── Loading ──────
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin" /> Carregando...
            </div>
        );
    }

    // ─── Lista de estudantes ──────
    if (!selectedDisc) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-7 h-7" />
                        <h1 className="text-xl font-bold">PEI Professor</h1>
                    </div>
                    <p className="text-sm opacity-90">
                        Seu material de trabalho individualizado por estudante e disciplina.
                        Gerado por IA com fundamentação em neurociência.
                    </p>
                </div>

                {estudantes.length === 0 ? (
                    <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">Nenhum estudante com PEI atribuído.</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Solicite ao coordenador que envie o PEI para sua disciplina na aba Regentes.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {estudantes.map((est) => (
                            <div key={est.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 text-lg">{est.name}</h3>
                                        <p className="text-sm text-slate-500">
                                            {est.grade} {est.class_group && `• ${est.class_group}`}
                                            {est.diagnosis && ` • ${est.diagnosis}`}
                                        </p>
                                    </div>
                                </div>

                                {/* PEI 1 resumo */}
                                {est.pei_resumo && (
                                    <div className="mb-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 line-clamp-2">
                                        <span className="font-medium text-slate-700">PEI 1:</span> {est.pei_resumo}
                                    </div>
                                )}

                                {/* Disciplinas cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {est.disciplinas.map((disc) => {
                                        const fase = FASE_LABELS[disc.fase_status] || FASE_LABELS.plano_ensino;
                                        const hasContent = disc.pei_disciplina_data && Object.keys(disc.pei_disciplina_data).length > 0;
                                        return (
                                            <button
                                                key={disc.disciplina}
                                                onClick={() => openDisciplina(est, disc)}
                                                className="text-left p-4 rounded-xl border-2 hover:shadow-md transition-all"
                                                style={{ borderColor: `${fase.color}44` }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-slate-800">{disc.disciplina}</span>
                                                    {hasContent && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                </div>
                                                <div
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full"
                                                    style={{ background: `${fase.color}15`, color: fase.color }}
                                                >
                                                    {fase.icon}
                                                    {fase.label}
                                                </div>
                                            </button>
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

    // ─── Detalhe da disciplina ──────
    const fase = FASE_LABELS[selectedDisc.fase_status] || FASE_LABELS.plano_ensino;
    const hasContent = peiContent.direcionamento || peiContent.objetivos;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 text-white">
                <button
                    onClick={() => { setSelectedStudent(null); setSelectedDisc(null); }}
                    className="inline-flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100 mb-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <h2 className="text-lg font-bold">{selectedDisc.disciplina} — {selectedStudent?.name}</h2>
                <p className="text-sm opacity-80">
                    {selectedStudent?.grade} {selectedStudent?.class_group && `• ${selectedStudent.class_group}`}
                </p>
                <div
                    className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2 px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,.2)" }}
                >
                    {fase.icon} {fase.label}
                </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 flex-wrap">
                <button
                    onClick={gerarPEI}
                    disabled={generating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 disabled:opacity-60 shadow-sm"
                >
                    {generating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Gerando PEI...</>
                    ) : (
                        <><Sparkles className="w-4 h-4" /> {hasContent ? "Regenerar com IA" : "Gerar PEI com IA"}</>
                    )}
                </button>
                <button
                    onClick={salvarPEI}
                    disabled={saving || !hasContent}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-60 shadow-sm"
                >
                    {saving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                    ) : saved ? (
                        <><CheckCircle2 className="w-4 h-4" /> Salvo!</>
                    ) : (
                        <><Save className="w-4 h-4" /> Salvar</>
                    )}
                </button>
            </div>

            {/* PEI 1 resumo */}
            {selectedStudent?.pei_resumo && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" /> Resumo do PEI 1
                    </h4>
                    <p className="text-sm text-slate-600">{selectedStudent.pei_resumo}</p>
                </div>
            )}

            {/* Seções do PEI */}
            {!hasContent && !generating && (
                <div className="rounded-2xl bg-violet-50 border border-violet-200 p-8 text-center">
                    <Brain className="w-12 h-12 text-violet-400 mx-auto mb-3" />
                    <p className="text-violet-800 font-medium">PEI da disciplina ainda não gerado.</p>
                    <p className="text-sm text-violet-600 mt-1">
                        Clique em &quot;Gerar PEI com IA&quot; para criar automaticamente com base no PEI 1, avaliação diagnóstica e habilidades BNCC.
                    </p>
                </div>
            )}

            {(hasContent || generating) && (
                <div className="space-y-3">
                    {SECTION_CONFIG.map(({ key, label, icon, color }) => {
                        const isExpanded = expandedSection === key;
                        const value = peiContent[key];
                        return (
                            <div key={key} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setExpandedSection(isExpanded ? null : key)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={color}>{icon}</span>
                                        <span className="font-semibold text-slate-800">{label}</span>
                                        {value && <span className="text-xs text-emerald-500">✓</span>}
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </button>
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-slate-100">
                                        <textarea
                                            value={value}
                                            onChange={(e) => updateField(key, e.target.value)}
                                            placeholder={`Escreva ou edite ${label.toLowerCase()}...`}
                                            rows={8}
                                            className="w-full mt-3 px-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y bg-slate-50"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Anotações do professor */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                            <ClipboardList className="w-5 h-5 text-slate-600" />
                            Anotações do Professor
                        </h4>
                        <textarea
                            value={peiContent.anotacoes_professor}
                            onChange={(e) => updateField("anotacoes_professor", e.target.value)}
                            placeholder="Escreva suas observações, anotações e estratégias pessoais aqui..."
                            rows={5}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y bg-slate-50"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
