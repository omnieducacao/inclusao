"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    BookOpen, Plus, ChevronLeft, CheckCircle2,
    GraduationCap, FileText, ListChecks, Save,
} from "lucide-react";
import { PlanoCursoEditor } from "@/components/PlanoCursoEditor";
import { PageHero } from "@/components/PageHero";
import { OnboardingPanel } from "@/components/OnboardingPanel";
import { Card, Button, Badge, EmptyState, SectionTitle } from "@omni/ds";
import { OmniLoader } from "@/components/OmniLoader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComboItem {
    serie: string;
    serieCode: string;
    componente: string;
    componenteId: string | null;
    classGroup: string;
    gradeId: string;
}

interface PlanoExistente {
    id: string;
    disciplina: string;
    ano_serie: string;
    bimestre: string | null;
    conteudo: string | null;
    habilidades_bncc: string[];
    professor_nome: string;
    updated_at: string;
}

// ─── Component Colors ─────────────────────────────────────────────────────────

const COMPONENT_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
    "Língua Portuguesa": { bg: "rgba(59,130,246,.08)", border: "rgba(59,130,246,.25)", text: "#60a5fa", accent: "#3b82f6" },
    "Matemática": { bg: "rgba(245,158,11,.08)", border: "rgba(245,158,11,.25)", text: "#fbbf24", accent: "#f59e0b" },
    "Ciências": { bg: "rgba(16,185,129,.08)", border: "rgba(16,185,129,.25)", text: "#34d399", accent: "#10b981" },
    "História": { bg: "rgba(168,85,247,.08)", border: "rgba(168,85,247,.25)", text: "#c084fc", accent: "#a855f7" },
    "Geografia": { bg: "rgba(6,182,212,.08)", border: "rgba(6,182,212,.25)", text: "#22d3ee", accent: "#06b6d4" },
    "Arte": { bg: "rgba(236,72,153,.08)", border: "rgba(236,72,153,.25)", text: "#f472b6", accent: "#ec4899" },
    "Educação Física": { bg: "rgba(249,115,22,.08)", border: "rgba(249,115,22,.25)", text: "#fb923c", accent: "#f97316" },
    "Língua Inglesa": { bg: "rgba(99,102,241,.08)", border: "rgba(99,102,241,.25)", text: "#818cf8", accent: "#6366f1" },
    "Ensino Religioso": { bg: "rgba(139,92,246,.08)", border: "rgba(139,92,246,.25)", text: "#a78bfa", accent: "#8b5cf6" },
    "Prática Textual": { bg: "rgba(14,165,233,.08)", border: "rgba(14,165,233,.25)", text: "#38bdf8", accent: "#0ea5e9" },
    "Literatura": { bg: "rgba(217,70,239,.08)", border: "rgba(217,70,239,.25)", text: "#e879f9", accent: "#d946ef" },
};

const DEFAULT_COLOR = { bg: "rgba(148,163,184,.08)", border: "rgba(148,163,184,.2)", text: "#94a3b8", accent: "#64748b" };

function getColor(comp: string) {
    return COMPONENT_COLORS[comp] || DEFAULT_COLOR;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlanoCursoClient() {
    const [combos, setCombos] = useState<ComboItem[]>([]);
    const [planos, setPlanos] = useState<PlanoExistente[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMaster, setIsMaster] = useState(false);
    const [professorName, setProfessorName] = useState("");
    const [selectedCombo, setSelectedCombo] = useState<ComboItem | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('onboarding_plano_curso')) setShowOnboarding(true);
    }, []);

    // ─── Fetch data ─────────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [compRes, planosRes] = await Promise.all([
                fetch("/api/plano-curso/meus-componentes").then(r => r.json()),
                fetch("/api/plano-curso").then(r => r.json()),
            ]);
            setCombos(compRes.componentes || []);
            setIsMaster(compRes.is_master || false);
            setProfessorName(compRes.professor?.name || "Professor");
            setPlanos(planosRes.planos || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ─── Helpers ────────────────────────────────────────────────────────────

    function getPlanoCount(componente: string, serie: string): number {
        return planos.filter(p => p.disciplina === componente && p.ano_serie === serie).length;
    }

    function getLastUpdated(componente: string, serie: string): string | null {
        const matching = planos.filter(p => p.disciplina === componente && p.ano_serie === serie);
        if (matching.length === 0) return null;
        matching.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        return matching[0].updated_at;
    }

    // Group combos by componente
    const grouped = combos.reduce<Record<string, ComboItem[]>>((acc, c) => {
        if (!acc[c.componente]) acc[c.componente] = [];
        acc[c.componente].push(c);
        return acc;
    }, {});

    // ─── Loading ────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <OmniLoader variant="card" />
            </div>
        );
    }

    // ─── Editor view ────────────────────────────────────────────────────────

    if (selectedCombo) {
        return (
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedCombo(null); fetchData(); }}
                    className="w-fit"
                >
                    <ChevronLeft size={16} /> Voltar aos componentes
                </Button>

                <PlanoCursoEditor
                    componente={selectedCombo.componente}
                    serie={selectedCombo.serie}
                    onSaved={() => fetchData()}
                />
            </div>
        );
    }

    // ─── Grid view ──────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-5">
            {/* Onboarding Panel */}
            {showOnboarding && (
                <OnboardingPanel
                    moduleKey="plano_curso"
                    moduleTitle="Bem-vindo ao Plano de Curso"
                    moduleSubtitle="Organize seu planejamento por componente e série"
                    accentColor="#0ea5e9"
                    accentColorLight="#38bdf8"
                    steps={[
                        { icon: <GraduationCap size={22} />, title: "Componente", description: "Selecione disciplina e série" },
                        { icon: <ListChecks size={22} />, title: "Habilidades BNCC", description: "Escolha as habilidades do ano letivo" },
                        { icon: <FileText size={22} />, title: "Conteúdo", description: "Descreva objetivos e metodologia" },
                        { icon: <Save size={22} />, title: "Salvar", description: "Salve e disponibilize para o PEI" },
                    ]}
                    onStart={() => setShowOnboarding(false)}
                />
            )}

            {/* Header — unified PageHero */}
            <PageHero
                route="/plano-curso"
                title="Plano de Curso"
                desc={`${professorName} · ${combos.length} componente${combos.length !== 1 ? "s" : ""}/série${combos.length !== 1 ? "s" : ""} vinculado${combos.length !== 1 ? "s" : ""}`}
            />

            {/* Empty state */}
            {combos.length === 0 && (
                <EmptyState
                    icon={BookOpen}
                    title="Nenhum componente vinculado"
                    description="Você ainda não está vinculado a componentes curriculares e séries. Peça ao coordenador para cadastrar seus vínculos em Gestão de Usuários."
                />
            )}

            {/* Component groups */}
            {Object.entries(grouped).map(([componente, items]) => {
                const color = getColor(componente);
                return (
                    <div key={componente}>
                        <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: `2px solid ${color.border}` }}>
                            <GraduationCap size={18} style={{ color: color.accent }} />
                            <h3 className="text-base font-bold m-0" style={{ color: color.text }}>{componente}</h3>
                            <Badge size="sm" style={{ background: color.bg, color: color.text }}>
                                {items.length} série{items.length !== 1 ? "s" : ""}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {items.map((item) => {
                                const count = getPlanoCount(item.componente, item.serie);
                                const lastUpdated = getLastUpdated(item.componente, item.serie);
                                const hasPlanos = count > 0;

                                return (
                                    <Card
                                        key={`${item.componente}:${item.serie}`}
                                        variant="interactive"
                                        padding="md"
                                        className="cursor-pointer"
                                        style={{
                                            borderColor: hasPlanos ? color.border : undefined,
                                            background: hasPlanos ? color.bg : undefined,
                                        }}
                                        onClick={() => setSelectedCombo(item)}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-[15px] font-bold text-(--omni-text-primary)">
                                                {item.serie}
                                            </span>
                                            {hasPlanos ? (
                                                <CheckCircle2 size={16} style={{ color: color.accent }} />
                                            ) : (
                                                <Plus size={16} className="text-(--omni-text-muted)" />
                                            )}
                                        </div>

                                        {item.classGroup && (
                                            <span className="text-xs text-(--omni-text-muted) mt-1">
                                                Turma {item.classGroup}
                                            </span>
                                        )}

                                        {hasPlanos ? (
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <FileText size={12} style={{ color: color.text }} />
                                                <span className="text-xs font-semibold" style={{ color: color.text }}>
                                                    {count} plano{count !== 1 ? "s" : ""}
                                                </span>
                                                {lastUpdated && (
                                                    <span className="text-[10px] text-(--omni-text-muted)">
                                                        · {new Date(lastUpdated).toLocaleDateString("pt-BR")}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-(--omni-text-muted) mt-2">
                                                Criar plano
                                            </span>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
