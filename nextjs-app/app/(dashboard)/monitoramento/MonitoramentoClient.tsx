"use client";

import { useState } from "react";
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
  criado_em?: string;
};

type StudentFull = Student & {
  grade?: string | null;
  diagnosis?: string | null;
  pei_data?: Record<string, unknown>;
  paee_ciclos?: unknown[];
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

export function MonitoramentoClient({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams.get("student");

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

  const objetivos = (peiData.objetivos || peiData.goals) as string[] | undefined;
  const objetivosList = Array.isArray(objetivos) ? objetivos : [];

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
              <div className="p-6 rounded-2xl border border-slate-200/50 bg-white shadow-sm min-h-[180px]">
                <h4 className="font-medium text-sky-800 mb-2">Expectativa (PEI)</h4>
                <p className="text-xs text-slate-500 mb-2">Objetivos cadastrados no Plano de Ensino</p>
                {objetivosList.length > 0 ? (
                  <ul className="space-y-2">
                    {objetivosList.map((obj, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-sky-500">📍</span>
                        {typeof obj === "string" ? obj : String(obj)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-slate-600">
                    <p className="mb-1">Contexto: {student.diagnosis || "Não informado"}</p>
                    <p>Sem objetivos estruturados no PEI.</p>
                  </div>
                )}
              </div>

              {/* Planejamento (PAEE) */}
              <div className="p-6 rounded-2xl border border-slate-200/50 bg-white shadow-sm min-h-[180px]">
                <h4 className="font-medium text-sky-800 mb-2">Planejamento (PAEE)</h4>
                <p className="text-xs text-slate-500 mb-2">Ciclos de AEE planejados</p>
                {paeeAtivo ? (
                  <div className="text-sm space-y-1">
                    <p className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Ciclo PAEE Ativo
                    </p>
                    <p>
                      Período: {fmtData(paeeAtivo.config_ciclo?.data_inicio)} a{" "}
                      {fmtData(paeeAtivo.config_ciclo?.data_fim)}
                    </p>
                    <p>Status: {paeeAtivo.status || "rascunho"}</p>
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
              <div className="p-6 rounded-2xl border border-slate-200/50 bg-white shadow-sm min-h-[180px]">
                <h4 className="font-medium text-sky-800 mb-2">Realidade (Diário)</h4>
                <p className="text-xs text-slate-500 mb-2">Últimos registros de atividades</p>
                {registrosOrdenados.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {registrosOrdenados.slice(0, 5).map((r) => {
                      const data = r.data_sessao || r.criado_em || "";
                      const conteudo =
                        r.atividade_principal ||
                        r.objetivos_trabalhados ||
                        r.observacoes ||
                        "—";
                      return (
                        <div
                          key={r.registro_id || data + conteudo}
                          className="border-l-2 border-sky-500 pl-3 py-2 bg-slate-50 rounded-r text-sm"
                        >
                          <span className="text-slate-500 text-xs">{fmtData(data)}</span>
                          <p className="text-slate-700 line-clamp-2">{conteudo}</p>
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
          <div className="p-6 rounded-2xl border border-slate-200/50 bg-white shadow-sm min-h-[200px]">
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
