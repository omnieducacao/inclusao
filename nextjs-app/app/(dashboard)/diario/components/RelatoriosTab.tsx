"use client";

import { useState } from "react";
import { BarChart3, Copy, Download, FileText, Sparkles } from "lucide-react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { baixarPdfDiario, calcularResumoDiario } from "@/lib/diario-pdf";
import {
    BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from "recharts";

type Student = { id: string; name: string };
type RegistroDiario = {
    registro_id?: string;
    student_id?: string;
    data_sessao?: string;
    duracao_minutos?: number;
    modalidade_atendimento?: string;
    atividade_principal?: string;
    objetivos_trabalhados?: string;
    estrategias_utilizadas?: string;
    recursos_materiais?: string;
    engajamento_aluno?: number;
    nivel_dificuldade?: string;
    competencias_trabalhadas?: string[];
    pontos_positivos?: string;
    dificuldades_identificadas?: string;
    observacoes?: string;
    proximos_passos?: string;
    encaminhamentos?: string;
    alerta_regente?: boolean;
    criado_em?: string;
    atualizado_em?: string;
    students?: { name?: string; grade?: string; class_group?: string };
};

type StudentFull = Student & {
    grade?: string | null;
    daily_logs?: RegistroDiario[];
    pei_data?: Record<string, unknown>;
};

const MODALIDADES = [
    { label: "Individual", value: "individual" },
    { label: "Grupo", value: "grupo" },
    { label: "Observação em Sala", value: "observacao_sala" },
    { label: "Consultoria", value: "consultoria" },
];

function AnaliseIADiario({ registros, student }: { registros: RegistroDiario[]; student: StudentFull }) {
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [copiado, setCopiado] = useState(false);

    const gerar = async () => {
        setLoading(true); setErro(null); setResultado(null);
        aiLoadingStart("red", "diario");
        try {
            const res = await fetch("/api/diario/analise-ia", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registros: registros.slice(0, 30).map((r) => ({
                        data_sessao: r.data_sessao,
                        duracao_minutos: r.duracao_minutos,
                        modalidade_atendimento: r.modalidade_atendimento,
                        atividade_principal: r.atividade_principal,
                        objetivos_trabalhados: r.objetivos_trabalhados,
                        estrategias_utilizadas: r.estrategias_utilizadas,
                        engajamento_aluno: r.engajamento_aluno,
                        nivel_dificuldade: r.nivel_dificuldade,
                        competencias_trabalhadas: r.competencias_trabalhadas,
                        pontos_positivos: r.pontos_positivos,
                        dificuldades_identificadas: r.dificuldades_identificadas,
                        proximos_passos: r.proximos_passos,
                    })),
                    nomeEstudante: student.name,
                    diagnostico: (student.pei_data?.diagnostico as string) || "",
                    engine: "red",
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro");
            setResultado(data.texto);
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Erro ao analisar.");
        } finally {
            setLoading(false);
            aiLoadingStop();
        }
    };

    const copiar = async () => {
        if (!resultado) return;
        try {
            await navigator.clipboard.writeText(resultado);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch { /* sem permissão para copiar: o texto continua na tela */ }
    };

    if (registros.length < 2) return null;

    return (
        <section className="omni-cartao" aria-labelledby="diario-analise">
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <h2 id="diario-analise" className="omni-cartao__titulo" style={{ margin: 0 }}>Análise da IA</h2>
                <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno" onClick={gerar} disabled={loading} aria-busy={loading}>
                    <Sparkles className="w-4 h-4" aria-hidden />
                    {loading ? "Analisando…" : resultado ? "Analisar de novo" : "Analisar os registros"}
                </button>
            </div>
            <p className="omni-apoio">
                A IA lê os últimos registros e aponta como o engajamento está mudando, o que avançou, pontos de atenção e sugestões práticas.
            </p>
            {erro && (
                <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none", marginTop: 12 }}>
                    <div>
                        <div className="omni-aviso__titulo">Não deu para analisar agora</div>
                        <div className="omni-aviso__texto">{erro}</div>
                    </div>
                </div>
            )}
            {resultado && (
                <div className="omni-cartao omni-cartao--plano" style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                        <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={copiar}>
                            <Copy className="w-4 h-4" aria-hidden />
                            {copiado ? "Copiado" : "Copiar texto"}
                        </button>
                    </div>
                    <FormattedTextDisplay texto={resultado} />
                </div>
            )}
        </section>
    );
}

const CORES_MODALIDADE = ["var(--acao)", "var(--sucesso)", "var(--atencao)", "var(--erro)", "var(--tinta-2)"];
const ESTILO_DICA = {
    backgroundColor: "var(--superficie)",
    border: "1px solid var(--borda)",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "var(--tinta)",
};
const EIXO = { fontSize: 12, fill: "var(--tinta-2)" };

function hojeIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDia(iso: string): string {
    const d = new Date(`${iso}T12:00:00`);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString("pt-BR");
}

function Grafico({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
    return (
        <section className="omni-cartao" aria-labelledby={id}>
            <h2 id={id} className="omni-cartao__titulo" style={{ marginTop: 0 }}>{titulo}</h2>
            <div style={{ height: 300, paddingTop: 8 }}>{children}</div>
        </section>
    );
}

export default function RelatoriosTab({ registros, student }: { registros: RegistroDiario[]; student: StudentFull }) {
    const [selectedStudent] = useState<string>(student.id);
    const [de, setDe] = useState("");
    const [ate, setAte] = useState("");
    const [avisoPdf, setAvisoPdf] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

    const registrosComData = registros
        .filter((r) => r.data_sessao)
        .map((r) => ({
            ...r,
            data: new Date(r.data_sessao!),
            mes: new Date(r.data_sessao!).toLocaleDateString("pt-BR", { year: "numeric", month: "short" }),
        }));

    const porMes = registrosComData.reduce((acc, r) => {
        const mes = r.mes;
        acc[mes] = (acc[mes] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const porModalidade = registros.reduce((acc, r) => {
        const mod = r.modalidade_atendimento || "N/A";
        acc[mod] = (acc[mod] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const engajamentoTempo = registrosComData
        .filter((r) => r.student_id === selectedStudent && r.engajamento_aluno)
        .sort((a, b) => a.data.getTime() - b.data.getTime())
        .map((r) => ({
            data: r.data.toLocaleDateString("pt-BR"),
            engajamento: r.engajamento_aluno || 0,
        }));

    const competenciasCount: Record<string, number> = {};
    registros.forEach((r) => {
        (r.competencias_trabalhadas || []).forEach((c) => {
            competenciasCount[c] = (competenciasCount[c] || 0) + 1;
        });
    });
    const topCompetencias = Object.entries(competenciasCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const exportarCSV = () => {
        const headers = [
            "Data", "Duração (min)", "Modalidade", "Atividade", "Objetivos",
            "Estratégias", "Engajamento", "Competências"
        ];
        const rows = registros.map((r) => [
            r.data_sessao || "",
            r.duracao_minutos || 0,
            r.modalidade_atendimento || "",
            r.atividade_principal || "",
            r.objetivos_trabalhados || "",
            r.estrategias_utilizadas || "",
            r.engajamento_aluno || 0,
            (r.competencias_trabalhadas || []).join("; "),
        ]);

        const csv = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `diario_bordo_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportarJSON = () => {
        const json = JSON.stringify(registros, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `diario_bordo_${new Date().toISOString().split("T")[0]}.json`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Onda 19: o relatório sai em PDF, só com os atendimentos do período escolhido (antes baixava um JSON)
    const registrosPeriodo = registros.filter((r) => {
        const dia = (r.data_sessao || "").slice(0, 10);
        if (!de && !ate) return true;
        if (!dia) return false;
        if (de && dia < de) return false;
        if (ate && dia > ate) return false;
        return true;
    });
    const periodoInvalido = !!de && !!ate && de > ate;

    const textoPeriodo = (): string => {
        if (de && ate) return `${fmtDia(de)} a ${fmtDia(ate)}`;
        if (de) return `a partir de ${fmtDia(de)}`;
        if (ate) return `até ${fmtDia(ate)}`;
        const dias = registrosPeriodo.map((r) => (r.data_sessao || "").slice(0, 10)).filter(Boolean).sort();
        return dias.length ? `Todos os atendimentos (${fmtDia(dias[0])} a ${fmtDia(dias[dias.length - 1])})` : "Todos os atendimentos";
    };

    const gerarRelatorio = () => {
        setAvisoPdf(null);
        try {
            const ordenados = [...registrosPeriodo].sort((a, b) => (a.data_sessao || "").localeCompare(b.data_sessao || ""));
            baixarPdfDiario({
                estudante: student.name,
                periodo: textoPeriodo(),
                registros: ordenados,
                resumo: calcularResumoDiario(ordenados),
            });
            setAvisoPdf({ tipo: "sucesso", texto: `Relatório baixado com ${ordenados.length} ${ordenados.length === 1 ? "atendimento" : "atendimentos"}.` });
        } catch {
            setAvisoPdf({ tipo: "erro", texto: "Não conseguimos montar o PDF agora. Tente de novo em instantes." });
        }
    };

    if (registros.length === 0) {
        return (
            <section className="omni-cartao omni-cartao--plano" aria-labelledby="diario-relatorios-vazio">
                <h2 id="diario-relatorios-vazio" className="omni-cartao__titulo" style={{ marginTop: 0 }}>Relatórios</h2>
                <p className="omni-apoio" style={{ margin: 0 }}>Ainda não há atendimentos registrados. Os gráficos e o relatório aparecem depois do primeiro registro.</p>
            </section>
        );
    }

    const dadosPorMes = Object.entries(porMes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mes, count]) => ({ mes, atendimentos: count }));

    const dadosPorModalidade = Object.entries(porModalidade).map(([mod, count]) => {
        const modLabel = MODALIDADES.find((m) => m.value === mod)?.label || mod;
        return { modalidade: modLabel, quantidade: count };
    });

    const dadosTopCompetencias = topCompetencias.map(([comp, count]) => ({
        competencia: comp.charAt(0).toUpperCase() + comp.slice(1),
        quantidade: count,
    }));

    return (
        <div style={{ display: "grid", gap: 24 }}>
            <Grafico id="diario-graf-mes" titulo="Atendimentos por mês">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosPorMes} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--borda)" />
                        <XAxis dataKey="mes" angle={-45} textAnchor="end" height={80} tick={EIXO} />
                        <YAxis tick={EIXO} allowDecimals={false} />
                        <Tooltip contentStyle={ESTILO_DICA} formatter={(value: number) => [`${value} atendimentos`, "Quantidade"]} />
                        <Bar dataKey="atendimentos" fill="var(--acao)" radius={[8, 8, 0, 0]} animationDuration={800} />
                    </BarChart>
                </ResponsiveContainer>
            </Grafico>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Grafico id="diario-graf-modalidade" titulo="Como foram os atendimentos">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dadosPorModalidade}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ modalidade, quantidade, percent }) =>
                                    `${modalidade}: ${quantidade} (${(percent * 100).toFixed(0)}%)`
                                }
                                outerRadius={100}
                                dataKey="quantidade"
                                animationDuration={800}
                            >
                                {dadosPorModalidade.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={CORES_MODALIDADE[index % CORES_MODALIDADE.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={ESTILO_DICA} formatter={(value: number) => [`${value} atendimentos`, "Quantidade"]} />
                        </PieChart>
                    </ResponsiveContainer>
                </Grafico>

                <Grafico id="diario-graf-competencias" titulo="Competências mais trabalhadas">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dadosTopCompetencias} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--borda)" />
                            <XAxis type="number" tick={EIXO} allowDecimals={false} />
                            <YAxis dataKey="competencia" type="category" width={90} tick={{ ...EIXO, fontSize: 11 }} />
                            <Tooltip contentStyle={ESTILO_DICA} formatter={(value: number) => [`${value} vezes`, "Frequência"]} />
                            <Bar dataKey="quantidade" fill="var(--acao)" radius={[0, 8, 8, 0]} animationDuration={800} />
                        </BarChart>
                    </ResponsiveContainer>
                </Grafico>
            </div>

            {engajamentoTempo.length > 1 && (
                <Grafico id="diario-graf-engajamento" titulo="Engajamento ao longo do tempo">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={engajamentoTempo} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--borda)" />
                            <XAxis dataKey="data" tick={EIXO} angle={-45} textAnchor="end" height={80} />
                            <YAxis
                                domain={[0, 5]}
                                tick={EIXO}
                                label={{ value: "Engajamento (1 a 5)", angle: -90, position: "insideLeft", style: { fill: "var(--tinta-2)" } }}
                            />
                            <Tooltip contentStyle={ESTILO_DICA} formatter={(value: number) => [`${value} de 5`, "Engajamento"]} />
                            <Line
                                type="monotone"
                                dataKey="engajamento"
                                stroke="var(--sucesso)"
                                strokeWidth={3}
                                dot={{ fill: "var(--sucesso)", r: 5 }}
                                activeDot={{ r: 7 }}
                                animationDuration={800}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Grafico>
            )}

            <AnaliseIADiario registros={registros} student={student} />

            <section className="omni-cartao" aria-labelledby="diario-relatorio-pdf">
                <h2 id="diario-relatorio-pdf" className="omni-cartao__titulo" style={{ marginTop: 0 }}>Relatório em PDF</h2>
                <p className="omni-apoio">
                    Escolha o período. O PDF traz o total de atendimentos, os minutos somados, o engajamento médio e a lista dos atendimentos. Sem datas, entram todos.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", marginTop: 12 }}>
                    <div className="omni-campo">
                        <label className="omni-campo__rotulo" htmlFor="diario-pdf-de">De</label>
                        <input id="diario-pdf-de" type="date" className="omni-entrada" value={de} max={ate || hojeIso()} onChange={(e) => setDe(e.target.value)} />
                    </div>
                    <div className="omni-campo">
                        <label className="omni-campo__rotulo" htmlFor="diario-pdf-ate">Até</label>
                        <input id="diario-pdf-ate" type="date" className="omni-entrada" value={ate} min={de || undefined} onChange={(e) => setAte(e.target.value)} />
                    </div>
                    {(de || ate) && (
                        <button type="button" className="omni-btn omni-btn--discreto" onClick={() => { setDe(""); setAte(""); }}>Limpar datas</button>
                    )}
                </div>
                <p className="omni-apoio" role="status" style={{ marginTop: 8 }}>
                    {periodoInvalido
                        ? "A data inicial está depois da final. Ajuste o período."
                        : `${registrosPeriodo.length} ${registrosPeriodo.length === 1 ? "atendimento" : "atendimentos"} no período.`}
                </p>
                {avisoPdf && (
                    <div className={`omni-aviso omni-aviso--${avisoPdf.tipo}`} role={avisoPdf.tipo === "erro" ? "alert" : "status"} style={{ maxWidth: "none", marginTop: 8 }}>
                        <div><div className="omni-aviso__texto">{avisoPdf.texto}</div></div>
                    </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
                    <button type="button" className="omni-btn omni-btn--primario" onClick={gerarRelatorio} disabled={periodoInvalido || registrosPeriodo.length === 0}>
                        <BarChart3 className="w-4 h-4" aria-hidden />
                        Gerar relatório em PDF
                    </button>
                    <button type="button" className="omni-btn omni-btn--secundario" onClick={exportarCSV}>
                        <Download className="w-4 h-4" aria-hidden />
                        Baixar planilha (CSV)
                    </button>
                    <button type="button" className="omni-btn omni-btn--discreto" onClick={exportarJSON}>
                        <FileText className="w-4 h-4" aria-hidden />
                        Baixar cópia dos dados (JSON)
                    </button>
                </div>
                <p className="omni-apoio" style={{ marginTop: 8 }}>A planilha e a cópia dos dados trazem todos os atendimentos, sem o filtro de datas.</p>
            </section>
        </div>
    );
}
