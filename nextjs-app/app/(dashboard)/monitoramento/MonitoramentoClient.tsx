"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { StudentSelector } from "@/components/StudentSelector";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { CheckCircle2, Info, AlertTriangle, Save } from "lucide-react";

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
  } catch {
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
    } catch {
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
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200">
          Selecione um estudante para ver o consolidado de dados (PEI, PAEE, Diário) e registrar avaliações.
        </div>
      )}

      {currentId && !student && (
        <div className="text-slate-500">Estudante não encontrado.</div>
      )}

      {currentId && student && (
        <PEISummaryPanel peiData={peiData} studentName={student.name} />
      )}

      {currentId && student && (
        <div className="space-y-6">
          {/* Consolidação: PEI | PAEE | Diário */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Consolidação de Dados
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Expectativa (PEI), Planejamento (PAEE) e Realidade (Diário de Bordo).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Expectativa (PEI) */}
              <div className="p-6 rounded-2xl bg-white min-h-[180px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
                <h4 className="font-medium text-sky-700 mb-2">Expectativa (PEI)</h4>
                <p className="text-xs text-slate-500 mb-2">Objetivos cadastrados no Plano de Ensino</p>
                {objetivosList.length > 0 ? (
                  <ul className="space-y-2 max-h-64 overflow-y-auto">
                    {objetivosList.map((obj, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-sky-500 mt-0.5 flex-shrink-0">📍</span>
                        <span className="flex-1">{typeof obj === "string" ? obj : String(obj)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><strong>Contexto:</strong> {student.diagnosis || "Não informado"}</p>
                    {peiData.ia_sugestao && typeof peiData.ia_sugestao === "string" ? (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Resumo das Estratégias (IA):</p>
                        <p className="text-xs text-slate-700 line-clamp-4">{peiData.ia_sugestao.substring(0, 200)}...</p>
                      </div>
                    ) : (
                      <p>Sem objetivos estruturados no PEI.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Planejamento (PAEE) */}
              <div className="p-6 rounded-2xl bg-white min-h-[180px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
                <h4 className="font-medium text-emerald-700 mb-2">Planejamento (PAEE)</h4>
                <p className="text-xs text-slate-500 mb-2">Ciclos de AEE planejados</p>
                {paeeAtivo ? (
                  <div className="text-sm space-y-2">
                    <p className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Ciclo PAEE Ativo
                    </p>
                    <div className="space-y-1">
                      <p>
                        <strong>Período:</strong> {fmtData(paeeAtivo.config_ciclo?.data_inicio)} a{" "}
                        {fmtData(paeeAtivo.config_ciclo?.data_fim)}
                      </p>
                      <p><strong>Status:</strong> {paeeAtivo.status || "rascunho"}</p>
                      {paeeAtivo.config_ciclo?.foco_principal && (
                        <p><strong>Foco:</strong> {paeeAtivo.config_ciclo.foco_principal}</p>
                      )}
                    </div>
                    {planoHabilidades && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Plano de Habilidades:</p>
                        <p className="text-xs text-slate-700 line-clamp-3">{planoHabilidades.substring(0, 150)}...</p>
                      </div>
                    )}
                    {tecnologiasAssistivas && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Tecnologias Assistivas:</p>
                        <p className="text-xs text-slate-700 line-clamp-2">{tecnologiasAssistivas.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>
                ) : paeeCiclos.length > 0 ? (
                  <p className="text-sm text-amber-700">
                    <span className="flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      {paeeCiclos.length} ciclo(s) cadastrado(s), nenhum ativo
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Nenhum ciclo PAEE cadastrado
                  </p>
                )}
              </div>

              {/* Realidade (Diário) */}
              <div className="p-6 rounded-2xl bg-white min-h-[180px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
                <h4 className="font-medium text-rose-600 mb-2">Realidade (Diário)</h4>
                <p className="text-xs text-slate-500 mb-2">Últimos registros de atividades</p>
                {registrosOrdenados.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {registrosOrdenados.slice(0, 5).map((r, idx) => {
                      const data = r.data_sessao || r.criado_em || "";
                      const atividade = r.atividade_principal || "";
                      const objetivos = r.objetivos_trabalhados || "";
                      const observacoes = r.observacoes || "";
                      const engajamento = r.engajamento_aluno;
                      const modalidade = r.modalidade_atendimento;
                      
                      const getModalidadeColor = (mod?: string) => {
                        switch (mod) {
                          case "individual": return "bg-blue-100 border-blue-300";
                          case "grupo": return "bg-green-100 border-green-300";
                          case "observacao_sala": return "bg-yellow-100 border-yellow-300";
                          case "consultoria": return "bg-purple-100 border-purple-300";
                          default: return "bg-slate-100 border-slate-300";
                        }
                      };

                      return (
                        <div
                          key={r.registro_id || `${data}-${idx}`}
                          className={`border-l-4 pl-3 py-2 rounded-r text-sm ${getModalidadeColor(modalidade)}`}
                          style={{ borderLeftColor: modalidade === "individual" ? "#3b82f6" : modalidade === "grupo" ? "#10b981" : modalidade === "observacao_sala" ? "#f59e0b" : modalidade === "consultoria" ? "#a855f7" : "#64748b" }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-slate-600 text-xs font-semibold">{fmtData(data)}</span>
                            {engajamento && (
                              <span className="text-xs text-slate-500">{"⭐".repeat(engajamento)}</span>
                            )}
                          </div>
                          {atividade && (
                            <p className="text-slate-800 font-medium text-xs mb-1 line-clamp-1">{atividade}</p>
                          )}
                          {objetivos && (
                            <p className="text-slate-700 text-xs line-clamp-1"><strong>Objetivos:</strong> {objetivos}</p>
                          )}
                          {observacoes && (
                            <p className="text-slate-600 text-xs line-clamp-1 mt-1">{observacoes}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-amber-600">Nenhum registro no diário para este estudante.</p>
                )}
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Info className="w-4 h-4" />
                Recursos gerados no Hub de Inclusão não são persistidos. Registre o uso no Diário de Bordo.
              </span>
            </p>
          </div>

          {/* Links rápidos */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/pei?student=${student.id}`}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700"
            >
              Ver PEI
            </Link>
            <Link
              href={`/paee?student=${student.id}`}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
            >
              Ver PAEE
            </Link>
            <Link
              href={`/diario?student=${student.id}`}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
            >
              Ver Diário
            </Link>
          </div>

          {/* Rubrica de Avaliação */}
          <div className="p-6 rounded-2xl bg-white min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Rubrica de Desenvolvimento</h3>
            <form onSubmit={handleSalvarAvaliacao} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(CRITERIOS).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                    <select
                      value={rubrica[key] || "Em Desenvolvimento"}
                      onChange={(e) => setRubrica((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Observação Final da Avaliação
                </label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Registre observações relevantes..."
                />
              </div>
              {message && (
                <div
                  className={
                    message.type === "ok"
                      ? "text-emerald-600 text-sm"
                      : "text-red-600 text-sm"
                  }
                >
                  {message.text}
                </div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60"
              >
                {saving ? "Salvando…" : (
                  <>
                    <Save className="w-4 h-4 inline mr-1" />
                    Salvar Monitoramento
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function MonitoramentoClient({ students, studentId, student }: Props) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
        <div className="text-slate-500 text-center py-8">Carregando...</div>
      </div>
    }>
      <MonitoramentoClientInner students={students} studentId={studentId} student={student} />
    </Suspense>
  );
}
