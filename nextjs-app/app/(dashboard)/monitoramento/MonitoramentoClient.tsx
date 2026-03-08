"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { StudentSelector } from "@/components/StudentSelector";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { CheckCircle2, Info, AlertTriangle, Save, Sparkles, TrendingUp, ExternalLink } from "lucide-react";
import { OmniLoader } from "@/components/OmniLoader";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { Card, CardHeader, CardTitle, CardContent, ActivityRow, SubjectProgressRow, StatusDot, Button, Select, Textarea, Alert } from "@omni/ds";

type Student = { id: string; name: string };
type CicloPAEE = {
  ciclo_id?: string;
  config_ciclo?: { data_inicio?: string; data_fim?: string; foco_principal?: string };
  status?: string;
};
type RegistroDiario = {
  registro_id?: string;
  data_sessao?: string;
  atividade_principal?: string;
  objetivos_trabalhados?: string;
  observacoes?: string;
  engajamento_aluno?: number | null;
  modalidade_atendimento?: string | null;
  criado_em?: string;
};

type StudentFull = Student & {
  grade?: string | null;
  diagnosis?: string | null;
  pei_data?: Record<string, unknown>;
  paee_ciclos?: unknown[];
  paee_data?: Record<string, unknown> | null;
  planejamento_ativo?: string | null;
  daily_logs?: unknown[];
};

type Props = {
  students: Student[];
  studentId: string | null;
  student: StudentFull | null;
};

const CRITERIOS: Record<string, string> = {
  autonomia: "Nível de Autonomia",
  social: "Interação Social",
  conteudo: "Apropriação do Conteúdo (PEI)",
  comportamento: "Regulação Comportamental",
};
const OPCOES_RUBRICA = ["Não Iniciado", "Iniciado", "Em Desenvolvimento", "Consolidado"];

function fmtData(s: string | undefined): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch { /* expected fallback */
    return String(s);
  }
}

function MonitoramentoClientInner({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams?.get("student") || null;

  const [rubrica, setRubrica] = useState<Record<string, string>>({
    autonomia: "Em Desenvolvimento",
    social: "Em Desenvolvimento",
    conteudo: "Em Desenvolvimento",
    comportamento: "Em Desenvolvimento",
  });
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [sugLoading, setSugLoading] = useState(false);

  // Evolução da Avaliação Processual (escala 0–4 Omnisfera)
  type EvolucaoProcessual = {
    evolucao: Array<{
      disciplina: string;
      periodos: Array<{ bimestre: number; media_nivel: number | null }>;
      tendencia: "melhora" | "estavel" | "regressao" | "sem_dados";
      media_mais_recente: number | null;
    }>;
    resumo: { total_registros: number; media_geral: number | null; tendencia: string; disciplinas: string[] };
  };
  const [evolucaoProcessual, setEvolucaoProcessual] = useState<EvolucaoProcessual | null>(null);
  const [evolucaoProcessualLoading, setEvolucaoProcessualLoading] = useState(false);

  useEffect(() => {
    if (!currentId) {
      setEvolucaoProcessual(null);
      return;
    }
    setEvolucaoProcessualLoading(true);
    fetch(`/api/avaliacao-processual/evolucao?studentId=${encodeURIComponent(currentId)}`)
      .then((r) => r.json())
      .then((data) => {
        setEvolucaoProcessual({
          evolucao: data.evolucao || [],
          resumo: data.resumo || { total_registros: 0, media_geral: null, tendencia: "sem_dados", disciplinas: [] },
        });
      })
      .catch(() => setEvolucaoProcessual(null))
      .finally(() => setEvolucaoProcessualLoading(false));
  }, [currentId]);

  const sugerirRubricas = async () => {
    if (!currentId) return;
    setSugLoading(true);
    setMessage(null);
    aiLoadingStart("red", "monitoramento");
    try {
      const res = await fetch("/api/monitoring/sugerir-rubricas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: currentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Erro ao sugerir rubricas." });
        return;
      }
      if (data.rubricas) {
        const map: Record<number, string> = { 1: "Não Iniciado", 2: "Iniciado", 3: "Em Desenvolvimento", 4: "Consolidado", 5: "Consolidado" };
        const r = data.rubricas;
        setRubrica({
          autonomia: map[r.autonomia?.score] || "Em Desenvolvimento",
          social: map[r.social?.score] || "Em Desenvolvimento",
          conteudo: map[r.conteudo?.score] || "Em Desenvolvimento",
          comportamento: map[r.comportamento?.score] || "Em Desenvolvimento",
        });
        const justifs = [r.autonomia, r.social, r.conteudo, r.comportamento]
          .filter(Boolean)
          .map((x: { justificativa?: string }) => x.justificativa)
          .filter(Boolean)
          .join(" | ");
        setObservacao(r.resumo ? `${r.resumo}\n\nDetalhes: ${justifs}` : justifs);
        setMessage({ type: "ok", text: "Rubricas sugeridas pela IA! Revise antes de salvar." });
      }
    } catch { /* expected fallback */
      setMessage({ type: "err", text: "Erro ao sugerir rubricas." });
    } finally {
      setSugLoading(false);
      aiLoadingStop();
    }
  };

  const peiData = student?.pei_data || {};
  const paeeCiclos = (student?.paee_ciclos || []) as CicloPAEE[];
  const planejamentoAtivo = student?.planejamento_ativo;
  const paeeAtivo = planejamentoAtivo
    ? paeeCiclos.find((c) => c.ciclo_id === planejamentoAtivo)
    : null;
  const paeeData = (student?.paee_data || {}) as Record<string, unknown>;
  const planoHabilidades = (paeeData.conteudo_plano_habilidades as string) || "";
  const tecnologiasAssistivas = (paeeData.tec_assistivas as string) || "";

  // Extrair objetivos do PEI de múltiplas fontes possíveis
  let objetivosList: string[] = [];
  if (Array.isArray(peiData.objetivos)) {
    objetivosList = peiData.objetivos;
  } else if (Array.isArray(peiData.goals)) {
    objetivosList = peiData.goals;
  } else if (Array.isArray(peiData.proximos_passos_select)) {
    objetivosList = peiData.proximos_passos_select;
  } else if (typeof peiData.ia_sugestao === "string" && peiData.ia_sugestao) {
    // Tentar extrair objetivos do texto da sugestão IA
    const linhas = peiData.ia_sugestao.split("\n");
    const metas = linhas
      .filter((l) => {
        const lower = l.toLowerCase().trim();
        return (
          lower.startsWith("meta:") ||
          lower.startsWith("objetivo:") ||
          lower.startsWith("- ") ||
          lower.startsWith("* ") ||
          (lower.includes("meta") && lower.length > 10)
        );
      })
      .map((l) => l.replace(/^(meta:|objetivo:|- |\* )/i, "").trim())
      .filter((l) => l.length > 10)
      .slice(0, 5);
    objetivosList = metas;
  }

  const dailyLogs = (student?.daily_logs || []) as RegistroDiario[];
  const registrosOrdenados = [...dailyLogs].sort((a, b) => {
    const da = a.data_sessao || a.criado_em || "";
    const db = b.data_sessao || b.criado_em || "";
    return db.localeCompare(da);
  });

  async function handleSalvarAvaliacao(e: React.FormEvent) {
    e.preventDefault();
    if (!currentId) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/monitoring/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: currentId,
          rubric_data: rubrica,
          observation: observacao,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Erro ao salvar avaliação." });
        return;
      }
      setMessage({ type: "ok", text: "Avaliação salva com sucesso!" });
      setObservacao("");
    } catch { /* expected fallback */
      setMessage({ type: "err", text: "Erro ao salvar. Tente novamente." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <StudentSelector
        students={students}
        currentId={currentId}
        placeholder="Selecione o estudante"
      />

      {!currentId && (
        <Alert variant="warning">
          Selecione um estudante para ver o consolidado de dados (PEI, PAEE, Diário) e registrar avaliações.
        </Alert>
      )}

      {currentId && !student && (
        <div className="text-(--omni-text-muted)">Estudante não encontrado.</div>
      )}

      {currentId && student && (
        <PEISummaryPanel peiData={peiData} studentName={student.name} />
      )}

      {currentId && student && (
        <div className="space-y-6">
          {/* Consolidação: PEI | PAEE | Diário */}
          <div>
            <h3 className="text-lg font-semibold text-(--omni-text-primary) mb-2">
              Consolidação de Dados
            </h3>
            <p className="text-sm text-(--omni-text-secondary) mb-4">
              Expectativa (PEI), Planejamento (PAEE) e Realidade (Diário de Bordo).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Expectativa (PEI) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sky-700 text-base">Expectativa (PEI)</CardTitle>
                  <p className="text-xs text-(--omni-text-muted)">Objetivos cadastrados no Plano</p>
                </CardHeader>
                <CardContent>
                  {objetivosList.length > 0 ? (
                    <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {objetivosList.map((obj, i) => (
                        <li key={i} className="text-sm text-(--omni-text-primary) flex items-start gap-2">
                          <span className="text-sky-500 mt-0.5 shrink-0">📍</span>
                          <span className="flex-1">{typeof obj === "string" ? obj : String(obj)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-(--omni-text-secondary) space-y-1">
                      <p><strong>Contexto:</strong> {student.diagnosis || "Não informado"}</p>
                      {peiData.ia_sugestao && typeof peiData.ia_sugestao === "string" ? (
                        <div className="mt-2 pt-2 border-t border-(--omni-border-default)">
                          <p className="text-xs text-(--omni-text-muted) mb-1">Resumo das Estratégias (IA):</p>
                          <p className="text-xs text-(--omni-text-primary) line-clamp-4">{peiData.ia_sugestao.substring(0, 200)}...</p>
                        </div>
                      ) : (
                        <p>Sem objetivos estruturados no PEI.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Planejamento (PAEE) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-emerald-700 text-base">Planejamento (PAEE)</CardTitle>
                  <p className="text-xs text-(--omni-text-muted)">Ciclos de AEE planejados</p>
                </CardHeader>
                <CardContent>
                  {paeeAtivo ? (
                    <div className="text-sm space-y-2">
                      <StatusDot variant="success" label="Ciclo PAEE Ativo" />
                      <div className="space-y-1 mt-2 text-(--omni-text-primary)">
                        <p><strong>Período:</strong> {fmtData(paeeAtivo.config_ciclo?.data_inicio)} a {fmtData(paeeAtivo.config_ciclo?.data_fim)}</p>
                        <p><strong>Status:</strong> {paeeAtivo.status || "rascunho"}</p>
                        {paeeAtivo.config_ciclo?.foco_principal && (
                          <p><strong>Foco:</strong> {paeeAtivo.config_ciclo.foco_principal}</p>
                        )}
                      </div>
                      {planoHabilidades && (
                        <div className="mt-3 pt-3 border-t border-(--omni-border-default)">
                          <p className="text-xs font-semibold text-(--omni-text-secondary) mb-1">Plano de Habilidades:</p>
                          <p className="text-xs text-(--omni-text-primary) line-clamp-3">{planoHabilidades.substring(0, 150)}...</p>
                        </div>
                      )}
                      {tecnologiasAssistivas && (
                        <div className="mt-2 text-(--omni-text-primary)">
                          <p className="text-xs font-semibold text-(--omni-text-secondary) mb-1">Tecnologias Assistivas:</p>
                          <p className="text-xs text-(--omni-text-primary) line-clamp-2">{tecnologiasAssistivas.substring(0, 100)}...</p>
                        </div>
                      )}
                    </div>
                  ) : paeeCiclos.length > 0 ? (
                    <p className="text-sm text-amber-700 flex items-center gap-1">
                      <Info className="w-4 h-4" /> {paeeCiclos.length} ciclo(s) cadastrado(s), nenhum ativo
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Nenhum ciclo PAEE cadastrado
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Realidade (Diário) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-rose-600 text-base">Realidade (Diário)</CardTitle>
                  <p className="text-xs text-(--omni-text-muted)">Últimos registros de atividades</p>
                </CardHeader>
                <CardContent>
                  {registrosOrdenados.length > 0 ? (
                    <div className="space-y-3 max-h-68 overflow-y-auto pr-2">
                      {registrosOrdenados.slice(0, 5).map((r, idx) => {
                        const data = r.data_sessao || r.criado_em || "";
                        const atividade = r.atividade_principal || "";
                        const objetivos = r.objetivos_trabalhados || "";
                        const engajamento = r.engajamento_aluno;
                        const modalidade = r.modalidade_atendimento;

                        const getModColor = (mod?: string | null) => {
                          switch (mod) {
                            case "individual": return "#3b82f6";
                            case "grupo": return "#10b981";
                            case "observacao_sala": return "#f59e0b";
                            case "consultoria": return "#a855f7";
                            default: return "#64748b";
                          }
                        };

                        return (
                          <ActivityRow
                            key={r.registro_id || `${data}-${idx}`}
                            icon={<span className="text-[10px] font-bold text-white">{fmtData(data).slice(0, 5)}</span>}
                            iconColor={getModColor(modalidade)}
                            title={atividade || "Sessão registrada"}
                            subtitle={objetivos ? `Obj: ${objetivos.substring(0, 40)}...` : undefined}
                            trailing={engajamento ? <span className="text-xs text-amber-500 font-bold">{"⭐".repeat(engajamento)}</span> : undefined}
                            className="bg-(--omni-bg-primary) border border-(--omni-border-default) px-3 py-2"
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600">Nenhum registro no diário para este estudante.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Card Avaliação Processual — evolução por disciplina */}
            <Card className="mt-4 border-emerald-500/30 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-700 text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Avaliação Processual
                </CardTitle>
                <p className="text-xs text-(--omni-text-muted)">
                  Registro bimestral por habilidade na escala 0–4 (Omnisfera).
                </p>
              </CardHeader>
              <CardContent>
                {evolucaoProcessualLoading ? (
                  <div className="flex items-center gap-2 text-(--omni-text-muted) text-sm">
                    <OmniLoader size={16} />
                    Carregando evolução...
                  </div>
                ) : evolucaoProcessual && evolucaoProcessual.resumo.total_registros > 0 ? (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {evolucaoProcessual.evolucao.map((e) => {
                        // Converter nota 0-4 para percentage 0-100%
                        const pct = e.media_mais_recente ? (e.media_mais_recente / 4) * 100 : 0;
                        const status: "intervir" | "acompanhar" | "desafiar" = pct < 40 ? "intervir" : pct < 70 ? "acompanhar" : "desafiar";

                        return (
                          <SubjectProgressRow
                            key={e.disciplina}
                            subject={e.disciplina}
                            meta={`${e.periodos.length} bimestres`}
                            percentage={Math.round(pct)}
                            status={status}
                          />
                        );
                      })}
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Link href={`/avaliacao-processual?student=${currentId}`} className="flex items-center gap-2 text-white">
                        <ExternalLink className="w-4 h-4" />
                        Abrir Avaliação Completa
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-(--omni-text-secondary)">
                      Nenhum registro de Avaliação Processual neste ano. Registre no módulo Avaliação Processual.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Link href={`/avaliacao-processual?student=${currentId}`} className="flex items-center gap-2 text-white">
                        <ExternalLink className="w-4 h-4" />
                        Abrir Avaliação Processual
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="mt-4 text-sm text-(--omni-text-muted)">
              <span className="flex items-center gap-1">
                <Info className="w-4 h-4" />
                Recursos gerados no Hub de Inclusão não são persistidos. Registre o uso no Diário de Bordo.
              </span>
            </p>
          </div>

          {/* Links rápidos */}
          <div className="flex flex-wrap gap-2">
            <Link href={`/pei?student=${student.id}`}>
              <Button variant="primary" size="sm" className="bg-sky-600 hover:bg-sky-700">Ver PEI</Button>
            </Link>
            <Link href={`/paee?student=${student.id}`}>
              <Button variant="ghost" size="sm">Ver PAEE</Button>
            </Link>
            <Link href={`/diario?student=${student.id}`}>
              <Button variant="ghost" size="sm">Ver Diário</Button>
            </Link>
            <Link href={`/avaliacao-processual?student=${student.id}`}>
              <Button variant="ghost" size="sm">Avaliação Processual</Button>
            </Link>
          </div>

          {/* Rubrica de Avaliação */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-(--omni-text-primary)">Rubrica de Desenvolvimento</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={sugerirRubricas}
                disabled={sugLoading}
                className="bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                title="Analisa registros do Diário para sugerir pontuações"
              >
                {sugLoading ? <OmniLoader engine="red" size={14} /> : <Sparkles className="w-3.5 h-3.5" />}
                Sugerir com IA
              </Button>
            </div>
            <form onSubmit={handleSalvarAvaliacao} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(CRITERIOS).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-(--omni-text-secondary) mb-1">{label}</label>
                    <select
                      value={rubrica[key] || "Em Desenvolvimento"}
                      onChange={(e) => setRubrica((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-(--omni-border-default) rounded-lg text-sm bg-(--omni-bg-primary) text-(--omni-text-primary) focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      {OPCOES_RUBRICA.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-(--omni-text-secondary) mb-1">
                  Observação Final da Avaliação
                </label>
                <Textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={4}
                  placeholder="Registre observações relevantes..."
                />
              </div>
              {message && (
                <Alert variant={message.type === "ok" ? "success" : "error"}>
                  {message.text}
                </Alert>
              )}
              <Button
                type="submit"
                disabled={saving}
                variant="primary"
                className="bg-sky-600 hover:bg-sky-700"
              >
                {saving ? "Salvando…" : (
                  <>
                    <Save className="w-4 h-4 inline mr-1" />
                    Salvar Monitoramento
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export function MonitoramentoClient({ students, studentId, student }: Props) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-10 bg-(--omni-bg-tertiary) rounded-lg animate-pulse" />
        <div className="text-(--omni-text-muted) text-center py-8">Carregando...</div>
      </div>
    }>
      <MonitoramentoClientInner students={students} studentId={studentId} student={student} />
    </Suspense>
  );
}
