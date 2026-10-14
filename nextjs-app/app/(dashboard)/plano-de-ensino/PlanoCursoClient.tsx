"use client";

/**
 * Plano de ensino — escolher componente e série (onda 22: visual do design system).
 * Antes: cartões coloridos por disciplina (biblioteca antiga @omni/ds) e cores fixas.
 * Agora: um grupo por componente, um cartão por série com o estado do plano (Omni.estado).
 */
import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, ChevronLeft, CheckCircle2, Plus } from "lucide-react";
import { PlanoCursoEditor } from "@/components/PlanoCursoEditor";
import { PageHero } from "@/components/PageHero";
import TelaCarregando from "@/components/brand/TelaCarregando";
import { ProximosPassos } from "@/components/jornada/ProximosPassos";
import { ComoFunciona } from "@/components/tutorial/ComoFunciona";

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

export default function PlanoCursoClient() {
    const [combos, setCombos] = useState<ComboItem[]>([]);
    const [planos, setPlanos] = useState<PlanoExistente[]>([]);
    const [loading, setLoading] = useState(true);
    const [professorName, setProfessorName] = useState("");
    const [selectedCombo, setSelectedCombo] = useState<ComboItem | null>(null);
    const [erroCarregar, setErroCarregar] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [compRes, planosRes] = await Promise.all([
                fetch("/api/plano-curso/meus-componentes").then(r => r.json()),
                fetch("/api/plano-curso").then(r => r.json()),
            ]);
            setCombos(compRes.componentes || []);
            setProfessorName(compRes.professor?.name || "");
            setPlanos(planosRes.planos || []);
            setErroCarregar(false);
        } catch {
            setErroCarregar(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const planosDe = (componente: string, serie: string) =>
        planos.filter(p => p.disciplina === componente && p.ano_serie === serie)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    const grupos = combos.reduce<Record<string, ComboItem[]>>((acc, c) => {
        (acc[c.componente] ||= []).push(c);
        return acc;
    }, {});

    if (loading) return <TelaCarregando variante="secao" mensagens={["Buscando seus componentes e planos…"]} />;

    if (selectedCombo) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ alignSelf: "flex-start" }}
                    onClick={() => { setSelectedCombo(null); fetchData(); }}>
                    <ChevronLeft size={18} aria-hidden /> Voltar aos componentes
                </button>
                <PlanoCursoEditor componente={selectedCombo.componente} serie={selectedCombo.serie} onSaved={() => fetchData()} />
            </div>
        );
    }

    const n = combos.length;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <PageHero
                route="/plano-de-ensino"
                title="Plano de ensino"
                desc={`${professorName ? `${professorName} · ` : ""}${n} ${n === 1 ? "componente e série vinculados" : "componentes e séries vinculados"}`}
            />
            <ComoFunciona modulo="plano-de-ensino" />

            {erroCarregar && (
                <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
                    <div><div className="omni-aviso__titulo">Não conseguimos carregar seus componentes e planos agora.</div>
                        <div className="omni-aviso__texto">Recarregue a página para tentar de novo.</div></div>
                    <span />
                </div>
            )}

            {!erroCarregar && n === 0 && (
                <div className="omni-vazio" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
                    <div className="omni-vazio__texto">
                        <BookOpen size={40} aria-hidden style={{ color: "var(--tinta-3)" }} />
                        <h2 className="omni-vazio__titulo" style={{ margin: 0 }}>Nenhum componente vinculado</h2>
                        <p style={{ margin: 0 }}>Você ainda não está ligado a componentes e séries. Peça à coordenação para cadastrar seus vínculos em Equipe e papéis.</p>
                    </div>
                </div>
            )}

            {Object.entries(grupos).map(([componente, itens]) => (
                <section key={componente} aria-labelledby={`pc-${componente}`} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", paddingBottom: 8, borderBottom: "1px solid var(--borda)" }}>
                        <h2 id={`pc-${componente}`} style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>{componente}</h2>
                        <span className="omni-apoio" style={{ fontSize: 14 }}>{itens.length} {itens.length === 1 ? "série" : "séries"}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                        {itens.map((item) => {
                            const lista = planosDe(item.componente, item.serie);
                            const tem = lista.length > 0;
                            return (
                                <button
                                    key={`${item.componente}:${item.serie}`}
                                    type="button"
                                    className="omni-cartao"
                                    onClick={() => setSelectedCombo(item)}
                                    style={{ font: "inherit", textAlign: "left", cursor: "pointer", gap: 8, padding: 18 }}
                                >
                                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                        <span className="omni-cartao__titulo">{item.serie}</span>
                                        {tem ? <CheckCircle2 size={20} aria-hidden style={{ color: "var(--sucesso)" }} /> : <Plus size={20} aria-hidden style={{ color: "var(--acao)" }} />}
                                    </span>
                                    {item.classGroup && <span className="omni-apoio" style={{ fontSize: 14 }}>Turma {item.classGroup}</span>}
                                    {tem ? (
                                        <span className="omni-estado omni-estado--sucesso" style={{ alignSelf: "flex-start" }}>
                                            {lista.length === 1 ? "Plano feito" : `${lista.length} planos`} · {new Date(lista[0].updated_at).toLocaleDateString("pt-BR")}
                                        </span>
                                    ) : (
                                        <span className="omni-estado omni-estado--neutro" style={{ alignSelf: "flex-start" }}>Sem plano ainda</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>
            ))}

            {n > 0 && <ProximosPassos atual="plano-de-ensino" />}
        </div>
    );
}
