"use client";

import {
    BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const CORES_MODALIDADE = ["var(--acao)", "var(--sucesso)", "var(--atencao)", "var(--erro)", "var(--tinta-2)"];
const ESTILO_DICA = {
    backgroundColor: "var(--superficie)",
    border: "1px solid var(--borda)",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "var(--tinta)",
};
const EIXO = { fontSize: 12, fill: "var(--tinta-2)" };


function Grafico({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
    return (
        <section className="omni-cartao" aria-labelledby={id}>
            <h2 id={id} className="omni-cartao__titulo" style={{ marginTop: 0 }}>{titulo}</h2>
            <div style={{ height: 300, paddingTop: 8 }}>{children}</div>
        </section>
    );
}


type PontoMes = { mes: string; atendimentos: number };
type PontoModalidade = { modalidade: string; quantidade: number };
type PontoCompetencia = { competencia: string; quantidade: number };
type PontoEngajamento = { data: string; engajamento: number };

export default function GraficosDiario({
    dadosPorMes,
    dadosPorModalidade,
    dadosTopCompetencias,
    engajamentoTempo,
}: {
    dadosPorMes: PontoMes[];
    dadosPorModalidade: PontoModalidade[];
    dadosTopCompetencias: PontoCompetencia[];
    engajamentoTempo: PontoEngajamento[];
}) {
    return (
        <>
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
        </>
    );
}
