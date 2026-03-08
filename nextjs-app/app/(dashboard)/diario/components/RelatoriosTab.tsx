"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@omni/ds";
import { BarChart3, Download, FileText, Sparkles } from "lucide-react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
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

    if (registros.length < 2) return null;

    return (
        <Card variant="premium">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-600" />
                        Análise IA dos Registros
                    </CardTitle>
                    <Button
                        type="button"
                        onClick={gerar}
                        disabled={loading}
                        loading={loading}
                        variant="module"
                        moduleColor="violet"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        {!loading && <Sparkles className="w-4 h-4" />}
                        {loading ? "Analisando..." : "Analisar com IA"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-500 mb-4 mt-2">
                    A IA analisa os registros e identifica tendências de engajamento, competências em progresso, alertas e recomendações práticas.
                </p>
                {erro && <p className="text-red-600 text-sm mb-3">❌ {erro}</p>}
                {resultado && (
                    <div className="p-5 rounded-xl bg-linear-to-br from-violet-50 to-slate-50 border border-violet-200">
                        <div className="flex justify-end mb-2">
                            <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(resultado)}
                                className="px-3 py-1 text-xs bg-violet-100 text-violet-700 rounded hover:bg-violet-200 transition-colors"
                            >
                                📋 Copiar
                            </button>
                        </div>
                        <div className="prose prose-sm prose-violet max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {resultado}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function RelatoriosTab({ registros, student }: { registros: RegistroDiario[]; student: StudentFull }) {
    const [selectedStudent] = useState<string>(student.id);

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

    const gerarRelatorio = () => {
        const totalHoras = Math.round(registros.reduce((acc, r) => acc + (r.duracao_minutos || 0), 0) / 60);
        const engajamentoMedio =
            registros.length > 0
                ? registros.reduce((acc, r) => acc + (r.engajamento_aluno || 0), 0) / registros.length
                : 0;

        const relatorio = {
            data_geracao: new Date().toISOString(),
            total_registros: registros.length,
            periodo_analisado: registrosComData.length > 0
                ? `${registrosComData[registrosComData.length - 1].data.toLocaleDateString("pt-BR")} a ${registrosComData[0].data.toLocaleDateString("pt-BR")}`
                : "N/A",
            total_horas: totalHoras,
            engajamento_medio: engajamentoMedio.toFixed(1),
            modalidades: porModalidade,
            top_competencias: topCompetencias.map(([c, count]) => ({ competencia: c, count })),
        };

        const json = JSON.stringify(relatorio, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_diario_${new Date().toISOString().split("T")[0]}.json`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (registros.length === 0) {
        return (
            <Card variant="default">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl">📊 Relatórios e Análises</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600">Nenhum dado disponível para gerar relatórios.</p>
                </CardContent>
            </Card>
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

    const coresModalidade = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

    return (
        <div className="space-y-6">
            <Card variant="default">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl">📅 Atendimentos por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="pt-4 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dadosPorMes} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="mes"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    tick={{ fontSize: 12, fill: "#64748b" }}
                                />
                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        padding: "8px 12px",
                                    }}
                                    formatter={(value: number) => [`${value} atendimentos`, "Quantidade"]}
                                />
                                <Bar dataKey="atendimentos" fill="#ef4444" radius={[8, 8, 0, 0]} animationDuration={800} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="default">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">📊 Distribuição por Modalidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="pt-4 h-[300px]">
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
                                        fill="#8884d8"
                                        dataKey="quantidade"
                                        animationDuration={800}
                                    >
                                        {dadosPorModalidade.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={coresModalidade[index % coresModalidade.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            padding: "8px 12px",
                                        }}
                                        formatter={(value: number) => [`${value} atendimentos`, "Quantidade"]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card variant="default">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">🎯 Top 10 Competências Trabalhadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="pt-4 h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={dadosTopCompetencias}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
                                    <YAxis
                                        dataKey="competencia"
                                        type="category"
                                        width={90}
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            padding: "8px 12px",
                                        }}
                                        formatter={(value: number) => [`${value} vezes`, "Frequência"]}
                                    />
                                    <Bar dataKey="quantidade" fill="#3b82f6" radius={[0, 8, 8, 0]} animationDuration={800} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {engajamentoTempo.length > 1 && (
                <Card variant="default">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">📈 Evolução do Engajamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="pt-4 h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={engajamentoTempo} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="data"
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        domain={[0, 5]}
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                        label={{ value: "Engajamento (1-5)", angle: -90, position: "insideLeft", style: { fill: "#64748b" } }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            padding: "8px 12px",
                                        }}
                                        formatter={(value: number) => [`${value}/5`, "Engajamento"]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="engajamento"
                                        stroke="#22c55e"
                                        strokeWidth={3}
                                        dot={{ fill: "#22c55e", r: 5 }}
                                        activeDot={{ r: 7 }}
                                        animationDuration={800}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            <AnaliseIADiario registros={registros} student={student} />

            <Card variant="default">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl">💾 Exportar Dados</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <Button
                            variant="primary"
                            onClick={exportarCSV}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            <Download className="w-4 h-4" />
                            Exportar CSV
                        </Button>
                        <Button
                            variant="primary"
                            onClick={exportarJSON}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            <FileText className="w-4 h-4" />
                            Exportar JSON
                        </Button>
                        <Button
                            variant="primary"
                            onClick={gerarRelatorio}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Relatório Resumido
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
