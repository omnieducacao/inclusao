```
"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { getColorClasses } from "@/lib/colors";
import { Filter, Plus, List, BarChart3, Settings, Download, FileText, Calendar, Clock, Users, Loader2, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

type Student = { id: string; name: string };
type StudentFull = Student & {
  grade?: string | null;
  daily_logs?: RegistroDiario[];
  pei_data?: Record<string, unknown>;
};

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
  criado_em?: string;
  atualizado_em?: string;
  students?: { name?: string; grade?: string; class_group?: string };
};

const MODALIDADES = [
  { label: "Individual", value: "individual" },
  { label: "Grupo", value: "grupo" },
  { label: "Observação em Sala", value: "observacao_sala" },
  { label: "Consultoria", value: "consultoria" },
];

const NIVEL_DIFICULDADE = [
  { label: "Muito Fácil", value: "muito_facil" },
  { label: "Fácil", value: "facil" },
  { label: "Adequado", value: "adequado" },
  { label: "Desafiador", value: "desafiador" },
  { label: "Muito Difícil", value: "muito_dificil" },
];

const COMPETENCIAS = [
  "atenção", "memória", "raciocínio", "linguagem",
  "socialização", "autonomia", "motricidade", "percepção",
  "organização", "regulação emocional",
];

type TabId = "filtros" | "novo" | "lista" | "relatorios" | "configuracoes";

type Props = {
  students: Student[];
  studentId: string | null;
  student: StudentFull | null;
};

function fmtData(s: string | undefined): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("pt-BR");
  } catch {
    return String(s);
  }
}

function DiarioClientInner({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams?.get("student") || null;
  const [activeTab, setActiveTab] = useState<TabId>("novo");
  const [refreshKey, setRefreshKey] = useState(0);

  const peiData = student?.pei_data || {};
  const registros = useMemo(() => {
    return (student?.daily_logs as RegistroDiario[]) || [];
  }, [student?.daily_logs]);
  const registrosOrdenados = [...registros].sort(
    (a, b) => (b.data_sessao || "").localeCompare(a.data_sessao || "")
  );

  const saveRegistro = useCallback(
    async (reg: RegistroDiario) => {
      if (!student?.id) return false;
      try {
        const lista = [...registros];
        const id = reg.registro_id || crypto.randomUUID();
        const novo: RegistroDiario = { ...reg, registro_id: id, student_id: student.id };
        if (!reg.registro_id) {
          novo.criado_em = new Date().toISOString();
          lista.push(novo);
        } else {
          const idx = lista.findIndex((r) => r.registro_id === reg.registro_id);
          if (idx >= 0) {
            novo.atualizado_em = new Date().toISOString();
            lista[idx] = novo;
          } else lista.push(novo);
        }

        const res = await fetch(`/ api / students / ${ student.id }/diario`, {
method: "PATCH",
  headers: { "Content-Type": "application/json" },
body: JSON.stringify({ daily_logs: lista }),
        });
const data = await res.json();
if (data.ok) {
  setRefreshKey((k) => k + 1);
  window.location.reload();
  return true;
}
      } catch (e) {
  console.error(e);
}
return false;
    },
[student?.id, registros]
  );

const deleteRegistro = useCallback(
  async (registroId: string) => {
    if (!student?.id) return false;
    const lista = registros.filter((r) => r.registro_id !== registroId);
    const res = await fetch(`/api/students/${student.id}/diario`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daily_logs: lista }),
    });
    const data = await res.json();
    if (data.ok) {
      setRefreshKey((k) => k + 1);
      window.location.reload();
    }
    return !!data.ok;
  },
  [student?.id, registros]
);

if (!currentId) {
  return (
    <div className="space-y-4">
      <StudentSelector students={students} currentId={currentId} placeholder="Selecione o estudante" />
      <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
        Selecione um estudante para registrar atendimentos.
      </div>
    </div>
  );
}

if (!student && studentId) {
  return (
    <div className="space-y-4">
      <StudentSelector students={students} currentId={currentId} />
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-800 font-medium">Estudante não encontrado</p>
      </div>
    </div>
  );
}

if (!student) {
  return (
    <div className="space-y-4">
      <StudentSelector students={students} currentId={currentId} />
      <div className="text-slate-500 text-center py-8">
        Selecione um estudante para visualizar o diário.
      </div>
    </div>
  );
}

return (
  <div className="space-y-6">
    <StudentSelector students={students} currentId={currentId} />

    {student && (
      <PEISummaryPanel peiData={peiData} studentName={student.name} />
    )}

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 rounded-2xl min-h-[140px]" style={{ backgroundColor: getColorClasses("rose").bg, boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase">Estudante</div>
        <div className="font-bold text-slate-800">{student.name}</div>
      </div>
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase">Série</div>
        <div className="font-bold text-slate-800">{student.grade || "—"}</div>
      </div>
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase">Registros</div>
        <div className="font-bold text-slate-800">{registros.length}</div>
      </div>
    </div>

    {/* Tabs */}
    <div className="flex gap-2 border-b border-slate-200 mb-6">
      {[
        { id: "filtros" as TabId, label: "🔍 Filtros & Estatísticas", icon: Filter },
        { id: "novo" as TabId, label: "➕ Novo Registro", icon: Plus },
        { id: "lista" as TabId, label: "📋 Lista de Registros", icon: List },
        { id: "relatorios" as TabId, label: "📊 Relatórios", icon: BarChart3 },
        { id: "configuracoes" as TabId, label: "⚙️ Configurações", icon: Settings },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === tab.id
            ? "border-rose-600 text-rose-600"
            : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>

    {/* Tab Content */}
    {activeTab === "filtros" && (
      <FiltrosTab students={students} registros={registrosOrdenados} />
    )}
    {activeTab === "novo" && (
      <NovoRegistroTab studentId={student.id} onSave={saveRegistro} />
    )}
    {activeTab === "lista" && (
      <ListaTab registros={registrosOrdenados} onDelete={deleteRegistro} />
    )}
    {activeTab === "relatorios" && (
      <RelatoriosTab registros={registrosOrdenados} student={student} />
    )}
    {activeTab === "configuracoes" && (
      <ConfiguracoesTab />
    )}
  </div>
);
}

// Aba: Filtros & Estatísticas
function FiltrosTab({ students, registros }: { students: Student[]; registros: RegistroDiario[] }) {
  const [filtroAluno, setFiltroAluno] = useState<string>("Todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("Todos");
  const [filtroModalidade, setFiltroModalidade] = useState<string[]>([]);

  const registrosFiltrados = registros.filter((r) => {
    if (filtroAluno !== "Todos" && r.student_id !== filtroAluno) return false;
    if (filtroPeriodo !== "Todos") {
      const data = r.data_sessao ? new Date(r.data_sessao) : null;
      if (!data) return false;
      const hoje = new Date();
      if (filtroPeriodo === "Últimos 7 dias") {
        const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (data < seteDiasAtras) return false;
      } else if (filtroPeriodo === "Últimos 30 dias") {
        const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (data < trintaDiasAtras) return false;
      }
    }
    if (filtroModalidade.length > 0 && !filtroModalidade.includes(r.modalidade_atendimento || "")) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">🔍 Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Estudante</label>
            <select
              value={filtroAluno}
              onChange={(e) => setFiltroAluno(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="Todos">Todos</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Período</label>
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="Todos">Todos</option>
              <option value="Últimos 7 dias">Últimos 7 dias</option>
              <option value="Últimos 30 dias">Últimos 30 dias</option>
              <option value="Este mês">Este mês</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Modalidade</label>
            <div className="flex flex-wrap gap-2">
              {MODALIDADES.map((m) => (
                <label key={m.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filtroModalidade.includes(m.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFiltroModalidade([...filtroModalidade, m.value]);
                      } else {
                        setFiltroModalidade(filtroModalidade.filter((v) => v !== m.value));
                      }
                    }}
                    className="rounded"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">📊 Estatísticas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-rose-600">{registrosFiltrados.length}</div>
            <div className="text-sm text-slate-600">Total de Registros</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-rose-600">
              {Math.round(registrosFiltrados.reduce((acc, r) => acc + (r.duracao_minutos || 0), 0) / 60)}
            </div>
            <div className="text-sm text-slate-600">Horas de Atendimento</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-rose-600">
              {registrosFiltrados.length > 0
                ? (registrosFiltrados.reduce((acc, r) => acc + (r.engajamento_aluno || 0), 0) / registrosFiltrados.length).toFixed(1)
                : "0"}
            </div>
            <div className="text-sm text-slate-600">Engajamento Médio</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-rose-600">
              {new Set(registrosFiltrados.map((r) => r.student_id).filter(Boolean)).size}
            </div>
            <div className="text-sm text-slate-600">Estudantes Atendidos</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Aba: Novo Registro (mantém o código existente)
function NovoRegistroTab({
  studentId,
  onSave,
}: {
  studentId: string;
  onSave: (r: RegistroDiario) => Promise<boolean>;
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [dataSessao, setDataSessao] = useState(hoje);
  const [duracao, setDuracao] = useState(45);
  const [modalidade, setModalidade] = useState("individual");
  const [engajamento, setEngajamento] = useState(3);
  const [atividade, setAtividade] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [estrategias, setEstrategias] = useState("");
  const [recursos, setRecursos] = useState("");
  const [nivelDificuldade, setNivelDificuldade] = useState("adequado");
  const [competencias, setCompetencias] = useState<string[]>(["atenção", "memória"]);
  const [pontosPositivos, setPontosPositivos] = useState("");
  const [dificuldades, setDificuldades] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [proximosPassos, setProximosPassos] = useState("");
  const [encaminhamentos, setEncaminhamentos] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!atividade.trim() || !objetivos.trim() || !estrategias.trim()) return;
    setSaving(true);
    const reg: RegistroDiario = {
      student_id: studentId,
      data_sessao: dataSessao,
      duracao_minutos: duracao,
      modalidade_atendimento: modalidade,
      atividade_principal: atividade,
      objetivos_trabalhados: objetivos,
      estrategias_utilizadas: estrategias,
      recursos_materiais: recursos,
      engajamento_aluno: engajamento,
      nivel_dificuldade: nivelDificuldade,
      competencias_trabalhadas: competencias,
      pontos_positivos: pontosPositivos,
      dificuldades_identificadas: dificuldades,
      observacoes,
      proximos_passos: proximosPassos,
      encaminhamentos,
    };
    const ok = await onSave(reg);
    if (ok) {
      setAtividade("");
      setObjetivos("");
      setEstrategias("");
      setRecursos("");
      setPontosPositivos("");
      setDificuldades("");
      setObservacoes("");
      setProximosPassos("");
      setEncaminhamentos("");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-4">➕ Nova Sessão de AEE</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data da sessão *</label>
            <input
              type="date"
              value={dataSessao}
              onChange={(e) => setDataSessao(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duração (min)</label>
            <input
              type="number"
              min={15}
              max={240}
              step={15}
              value={duracao}
              onChange={(e) => setDuracao(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Modalidade</label>
            <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              {MODALIDADES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Atividade principal *</label>
          <textarea value={atividade} onChange={(e) => setAtividade(e.target.value)} rows={3} required className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="Descreva a atividade..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Objetivos trabalhados *</label>
            <textarea value={objetivos} onChange={(e) => setObjetivos(e.target.value)} rows={3} required className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="Quais objetivos?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estratégias utilizadas *</label>
            <textarea value={estrategias} onChange={(e) => setEstrategias(e.target.value)} rows={3} required className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="Ex: Modelagem, dicas visuais..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Recursos e materiais</label>
          <input type="text" value={recursos} onChange={(e) => setRecursos(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="Tablets, jogos..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Engajamento (1-5)</label>
            <input type="range" min={1} max={5} value={engajamento} onChange={(e) => setEngajamento(Number(e.target.value))} className="w-full" />
            <span className="text-sm text-slate-500">{engajamento}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nível de dificuldade</label>
            <select value={nivelDificuldade} onChange={(e) => setNivelDificuldade(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              {NIVEL_DIFICULDADE.map((n) => (
                <option key={n.value} value={n.value}>{n.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Competências trabalhadas</label>
          <div className="flex flex-wrap gap-2">
            {COMPETENCIAS.map((c) => (
              <label key={c} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={competencias.includes(c)}
                  onChange={(e) =>
                    setCompetencias((prev) =>
                      e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)
                    )
                  }
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pontos positivos</label>
            <textarea value={pontosPositivos} onChange={(e) => setPontosPositivos(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dificuldades identificadas</label>
            <textarea value={dificuldades} onChange={(e) => setDificuldades(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Observações gerais</label>
          <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Próximos passos</label>
            <textarea value={proximosPassos} onChange={(e) => setProximosPassos(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Encaminhamentos</label>
            <input type="text" value={encaminhamentos} onChange={(e) => setEncaminhamentos(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="px-4 py-2 bg-rose-600 text-white rounded-lg disabled:opacity-50">
          {saving ? "Salvando…" : "Salvar registro"}
        </button>
      </form>
    </div>
  );
}

// Aba: Lista de Registros
function ListaTab({
  registros,
  onDelete,
}: {
  registros: RegistroDiario[];
  onDelete: (id: string) => void;
}) {
  const [viewMode, setViewMode] = useState<"lista" | "timeline">("lista");

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">📋 Lista de Registros</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("lista")}
              className={`px-3 py-1 text-sm rounded-lg ${viewMode === "lista" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1 text-sm rounded-lg ${viewMode === "timeline" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
            >
              Timeline
            </button>
          </div>
        </div>
        {registros.length === 0 ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white text-slate-500 min-h-[180px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
            Nenhum registro ainda. Preencha o formulário acima para criar o primeiro.
          </div>
        ) : viewMode === "lista" ? (
          <div className="space-y-3">
            {registros.map((r) => (
              <RegistroCard
                key={r.registro_id || Math.random()}
                registro={r}
                onDelete={() => r.registro_id && onDelete(r.registro_id)}
              />
            ))}
          </div>
        ) : (
          <TimelineView registros={registros} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
}

// Timeline Visual
function TimelineView({
  registros,
  onDelete,
}: {
  registros: RegistroDiario[];
  onDelete: (id: string) => void;
}) {
  const getModalidadeColor = (mod: string) => {
    switch (mod) {
      case "individual":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "grupo":
        return "bg-green-100 border-green-300 text-green-800";
      case "observacao_sala":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "consultoria":
        return "bg-purple-100 border-purple-300 text-purple-800";
      default:
        return "bg-slate-100 border-slate-300 text-slate-800";
    }
  };

  return (
    <div className="relative">
      {/* Linha vertical da timeline */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-300" />
      <div className="space-y-6">
        {registros.map((r, idx) => {
          const modLabel = MODALIDADES.find((m) => m.value === r.modalidade_atendimento)?.label || r.modalidade_atendimento;
          const data = r.data_sessao ? new Date(r.data_sessao) : null;
          const dataFormatada = data ? data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
          const horaFormatada = data ? data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

          return (
            <div key={r.registro_id || idx} className="relative flex items-start gap-4">
              {/* Ponto na timeline */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-4 h-4 rounded-full border-2 ${r.modalidade_atendimento === "individual" ? "bg-blue-500 border-blue-700" :
                  r.modalidade_atendimento === "grupo" ? "bg-green-500 border-green-700" :
                    r.modalidade_atendimento === "observacao_sala" ? "bg-yellow-500 border-yellow-700" :
                      r.modalidade_atendimento === "consultoria" ? "bg-purple-500 border-purple-700" :
                        "bg-slate-500 border-slate-700"
                  }`} />
              </div>
              {/* Card do registro */}
              <div className={`flex-1 border-2 rounded-lg p-4 ${getModalidadeColor(r.modalidade_atendimento || "")}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">{dataFormatada}</span>
                      {horaFormatada && <span className="text-sm opacity-75">{horaFormatada}</span>}
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getModalidadeColor(r.modalidade_atendimento || "")}`}>
                        {modLabel}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div><strong>Duração:</strong> {r.duracao_minutos || 0} minutos</div>
                      {r.engajamento_aluno && (
                        <div><strong>Engajamento:</strong> {"⭐".repeat(r.engajamento_aluno)} ({r.engajamento_aluno}/5)</div>
                      )}
                      {r.atividade_principal && (
                        <div><strong>Atividade:</strong> {r.atividade_principal.substring(0, 100)}{r.atividade_principal.length > 100 ? "..." : ""}</div>
                      )}
                      {r.competencias_trabalhadas && r.competencias_trabalhadas.length > 0 && (
                        <div><strong>Competências:</strong> {r.competencias_trabalhadas.join(", ")}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Excluir este registro?")) {
                        r.registro_id && onDelete(r.registro_id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RegistroCard({ registro, onDelete }: { registro: RegistroDiario; onDelete: () => void }) {
  const [expand, setExpand] = useState(false);
  const modLabel = MODALIDADES.find((m) => m.value === registro.modalidade_atendimento)?.label || registro.modalidade_atendimento;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div
        className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-slate-50"
        onClick={() => setExpand((x) => !x)}
      >
        <div>
          <span className="font-semibold text-slate-800">{fmtData(registro.data_sessao)}</span>
          <span className="mx-2 text-slate-400">•</span>
          <span className="text-sm text-slate-600">{modLabel}</span>
          <span className="mx-2 text-slate-400">•</span>
          <span className="text-sm text-slate-600">{registro.duracao_minutos || 0} min</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Excluir este registro?")) onDelete();
            }}
            className="text-red-600 text-sm hover:underline"
          >
            Excluir
          </button>
          <span className="text-slate-400">{expand ? "▲" : "▼"}</span>
        </div>
      </div>
      {expand && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 space-y-2 text-sm text-slate-700">
          <div><strong>Atividade:</strong> {registro.atividade_principal}</div>
          <div><strong>Objetivos:</strong> {registro.objetivos_trabalhados}</div>
          <div><strong>Estratégias:</strong> {registro.estrategias_utilizadas}</div>
          {registro.recursos_materiais && <div><strong>Recursos:</strong> {registro.recursos_materiais}</div>}
          {registro.pontos_positivos && <div><strong>Pontos positivos:</strong> {registro.pontos_positivos}</div>}
          {registro.dificuldades_identificadas && <div><strong>Dificuldades:</strong> {registro.dificuldades_identificadas}</div>}
          {registro.observacoes && <div><strong>Observações:</strong> {registro.observacoes}</div>}
          {registro.proximos_passos && <div><strong>Próximos passos:</strong> {registro.proximos_passos}</div>}
        </div>
      )}
    </div>
  );
}

// Aba: Relatórios
function RelatoriosTab({ registros, student }: { registros: RegistroDiario[]; student: StudentFull }) {
  const [selectedStudent, setSelectedStudent] = useState<string>(student.id);

  // Processar dados para gráficos
  const registrosComData = registros
    .filter((r) => r.data_sessao)
    .map((r) => ({
      ...r,
      data: new Date(r.data_sessao!),
      mes: new Date(r.data_sessao!).toLocaleDateString("pt-BR", { year: "numeric", month: "short" }),
    }));

  // Agrupar por mês
  const porMes = registrosComData.reduce((acc, r) => {
    const mes = r.mes;
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Agrupar por modalidade
  const porModalidade = registros.reduce((acc, r) => {
    const mod = r.modalidade_atendimento || "N/A";
    acc[mod] = (acc[mod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Engajamento ao longo do tempo (para estudante selecionado)
  const engajamentoTempo = registrosComData
    .filter((r) => r.student_id === selectedStudent && r.engajamento_aluno)
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .map((r) => ({
      data: r.data.toLocaleDateString("pt-BR"),
      engajamento: r.engajamento_aluno || 0,
    }));

  // Top competências
  const competenciasCount: Record<string, number> = {};
  registros.forEach((r) => {
    (r.competencias_trabalhadas || []).forEach((c) => {
      competenciasCount[c] = (competenciasCount[c] || 0) + 1;
    });
  });
  const topCompetencias = Object.entries(competenciasCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Exportar CSV
  const exportarCSV = () => {
    const headers = [
      "Data",
      "Duração (min)",
      "Modalidade",
      "Atividade",
      "Objetivos",
      "Estratégias",
      "Engajamento",
      "Competências",
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

  // Exportar JSON
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

  // Gerar relatório resumido
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">📊 Relatórios e Análises</h3>
        <p className="text-slate-600">Nenhum dado disponível para gerar relatórios.</p>
      </div>
    );
  }

  // Preparar dados para gráficos recharts
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
      {/* Gráfico: Atendimentos por Mês */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">📅 Atendimentos por Mês</h3>
        <ResponsiveContainer width="100%" height={300}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico: Distribuição por Modalidade (Pizza) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">📊 Distribuição por Modalidade</h3>
          <ResponsiveContainer width="100%" height={300}>
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

        {/* Gráfico: Top 10 Competências */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">🎯 Top 10 Competências Trabalhadas</h3>
          <ResponsiveContainer width="100%" height={300}>
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
      </div>

      {/* Gráfico: Evolução do Engajamento (Linha) */}
      {engajamentoTempo.length > 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">📈 Evolução do Engajamento</h3>
          <ResponsiveContainer width="100%" height={300}>
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
      )}

      {/* 🤖 Análise IA */}
      <AnaliseIADiario registros={registros} student={student} />

      {/* Exportação */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">💾 Exportar Dados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={exportarCSV}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={exportarJSON}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Exportar JSON
          </button>
          <button
            onClick={gerarRelatorio}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Relatório Resumido
          </button>
        </div>
      </div>
    </div>
  );
}

// Aba: Configurações
function ConfiguracoesTab() {
  const [duracaoPadrao, setDuracaoPadrao] = useState(45);
  const [modalidadePadrao, setModalidadePadrao] = useState("individual");
  const [competenciasPadrao, setCompetenciasPadrao] = useState<string[]>(["atenção", "memória"]);
  const [notificacoes, setNotificacoes] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Carregar configurações salvas do localStorage
    const saved = localStorage.getItem("diario_config");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setDuracaoPadrao(config.duracaoPadrao || 45);
        setModalidadePadrao(config.modalidadePadrao || "individual");
        setCompetenciasPadrao(config.competenciasPadrao || ["atenção", "memória"]);
        setNotificacoes(config.notificacoes !== false);
      } catch (e) {
        console.error("Erro ao carregar configurações:", e);
      }
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    const config = {
      duracaoPadrao,
      modalidadePadrao,
      competenciasPadrao,
      notificacoes,
    };
    localStorage.setItem("diario_config", JSON.stringify(config));
    setTimeout(() => {
      setSaving(false);
      alert("Configurações salvas com sucesso!");
    }, 500);
  };

  const handleReset = () => {
    setDuracaoPadrao(45);
    setModalidadePadrao("individual");
    setCompetenciasPadrao(["atenção", "memória"]);
    setNotificacoes(true);
    localStorage.removeItem("diario_config");
    alert("Configurações restauradas para os padrões!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">⚙️ Configurações do Diário</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800">Configurações de Registro</h4>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Duração Padrão (minutos)</label>
              <input
                type="number"
                min={15}
                max={120}
                step={15}
                value={duracaoPadrao}
                onChange={(e) => setDuracaoPadrao(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Modalidade Padrão</label>
              <select
                value={modalidadePadrao}
                onChange={(e) => setModalidadePadrao(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {MODALIDADES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Competências Padrão</label>
              <div className="flex flex-wrap gap-2">
                {COMPETENCIAS.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={competenciasPadrao.includes(c)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCompetenciasPadrao([...competenciasPadrao, c]);
                        } else {
                          setCompetenciasPadrao(competenciasPadrao.filter((x) => x !== c));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="capitalize">{c}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notificacoes}
                  onChange={(e) => setNotificacoes(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-700">Receber lembretes de registro</span>
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800">Ajuda</h4>
            <div className="text-sm text-slate-600 space-y-2">
              <p><strong>Guia de Uso do Diário de Bordo:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Novo Registro:</strong> Preencha todos os campos obrigatórios (*) para criar um registro</li>
                <li><strong>Lista de Registros:</strong> Visualize, filtre e gerencie todos os registros</li>
                <li><strong>Relatórios:</strong> Acompanhe métricas e gere análises</li>
                <li><strong>Configurações:</strong> Personalize o comportamento do sistema</li>
              </ul>
              <p className="mt-4"><strong>Dicas:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use tags e competências para facilitar buscas</li>
                <li>Exporte regularmente seus dados</li>
                <li>Mantenha observações detalhadas para acompanhamento longitudinal</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? "Salvando..." : "💾 Salvar Configurações"}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            🔄 Restaurar Padrões
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// Sub-componente: Análise IA do Diário
// ================================================================
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          Análise IA dos Registros
        </h3>
        <button
          type="button"
          onClick={gerar}
          disabled={loading}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-60 flex items-center gap-2 text-sm transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analisando padrões...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analisar com IA
            </>
          )}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        A IA analisa os registros e identifica tendências de engajamento, competências em progresso, alertas e recomendações práticas.
      </p>
      {erro && <p className="text-red-600 text-sm mb-3">❌ {erro}</p>}
      {resultado && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-slate-50 border border-violet-200">
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
    </div>
  );
}

export function DiarioClient({ students, studentId, student }: Props) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
        <div className="text-slate-500 text-center py-8">Carregando...</div>
      </div>
    }>
      <DiarioClientInner students={students} studentId={studentId} student={student} />
    </Suspense>
  );
}
