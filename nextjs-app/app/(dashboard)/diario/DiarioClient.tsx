"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";

type Student = { id: string; name: string };
type StudentFull = Student & {
  grade?: string | null;
  daily_logs?: RegistroDiario[];
};

type TabId = "filtros" | "novo" | "lista" | "relatorios" | "config";

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

export function DiarioClient({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams.get("student");

  const [activeTab, setActiveTab] = useState<TabId>("novo");
  const [saving, setSaving] = useState(false);
  const [expandForm, setExpandForm] = useState(true);
  const [allRegistros, setAllRegistros] = useState<Array<RegistroDiario & { student_id?: string; student_name?: string }>>([]);
  const [loadingRegistros, setLoadingRegistros] = useState(false);

  // Filtros (estado global para todas as abas)
  const [filtroAluno, setFiltroAluno] = useState<string>("Todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("Todos");
  const [filtroModalidade, setFiltroModalidade] = useState<string[]>([]);
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>("");
  const [filtroDataFim, setFiltroDataFim] = useState<string>("");

  const registros = (student?.daily_logs || []) as RegistroDiario[];
  const registrosOrdenados = [...registros].sort(
    (a, b) => (b.data_sessao || "").localeCompare(a.data_sessao || "")
  );

  // Carregar todos os registros para relatórios
  const loadAllRegistros = useCallback(async () => {
    setLoadingRegistros(true);
    try {
      const res = await fetch("/api/diario/all");
      const data = await res.json();
      setAllRegistros((data.registros || []) as Array<RegistroDiario & { student_id?: string; student_name?: string }>);
    } catch (e) {
      console.error("Erro ao carregar registros:", e);
    } finally {
      setLoadingRegistros(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "filtros" || activeTab === "relatorios") {
      loadAllRegistros();
    }
  }, [activeTab, loadAllRegistros]);

  const saveRegistro = useCallback(
    async (reg: RegistroDiario) => {
      if (!student?.id) return false;
      setSaving(true);
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

        const res = await fetch(`/api/students/${student.id}/diario`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ daily_logs: lista }),
        });
        const data = await res.json();
        if (data.ok) {
          window.location.reload();
          return true;
        }
      } catch (e) {
        console.error(e);
      }
      setSaving(false);
      return false;
    },
    [student?.id, registros]
  );

  const deleteRegistro = useCallback(
    async (registroId: string, studentIdForDelete?: string) => {
      const targetStudentId = studentIdForDelete || student?.id;
      if (!targetStudentId) return false;
      
      // Se for o estudante atual, usar os registros já carregados
      if (targetStudentId === student?.id) {
        const lista = registros.filter((r) => r.registro_id !== registroId);
        const res = await fetch(`/api/students/${targetStudentId}/diario`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ daily_logs: lista }),
        });
        const data = await res.json();
        if (data.ok) {
          if (activeTab === "lista") {
            await loadAllRegistros();
          } else {
            window.location.reload();
          }
        }
        return !!data.ok;
      } else {
        // Para outros estudantes, precisamos buscar primeiro
        // Por enquanto, recarregar a página
        if (confirm("Excluir este registro? A ação não pode ser desfeita.")) {
          window.location.reload();
        }
        return false;
      }
    },
    [student?.id, registros, activeTab, loadAllRegistros]
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

  if (!student) {
    return (
      <div className="space-y-4">
        <StudentSelector students={students} currentId={currentId} />
        <div className="text-slate-500">Estudante não encontrado.</div>
      </div>
    );
  }

  // Aplicar filtros aos registros
  const registrosFiltrados = useMemo(() => {
    let filtrados = allRegistros.length > 0 ? allRegistros : registros.map((r) => ({ ...r, student_id: student?.id, student_name: student?.name }));

    // Filtro por estudante
    if (filtroAluno && filtroAluno !== "Todos") {
      const alunoNome = filtroAluno.split("(")[0].trim();
      filtrados = filtrados.filter((r) => r.student_name === alunoNome);
    }

    // Filtro por período
    if (filtroPeriodo && filtroPeriodo !== "Todos") {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      filtrados = filtrados.filter((r) => {
        if (!r.data_sessao) return false;
        const dataSessao = new Date(r.data_sessao);
        dataSessao.setHours(0, 0, 0, 0);
        if (filtroPeriodo === "Últimos 7 dias") {
          const seteDiasAtras = new Date(hoje);
          seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
          return dataSessao >= seteDiasAtras;
        }
        if (filtroPeriodo === "Últimos 30 dias") {
          const trintaDiasAtras = new Date(hoje);
          trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
          return dataSessao >= trintaDiasAtras;
        }
        if (filtroPeriodo === "Este mês") {
          return dataSessao.getMonth() === hoje.getMonth() && dataSessao.getFullYear() === hoje.getFullYear();
        }
        if (filtroPeriodo === "Mês passado") {
          const mesPassado = new Date(hoje);
          mesPassado.setMonth(mesPassado.getMonth() - 1);
          return dataSessao.getMonth() === mesPassado.getMonth() && dataSessao.getFullYear() === mesPassado.getFullYear();
        }
        if (filtroPeriodo === "Personalizado" && filtroDataInicio && filtroDataFim) {
          const inicio = new Date(filtroDataInicio);
          const fim = new Date(filtroDataFim);
          return dataSessao >= inicio && dataSessao <= fim;
        }
        return true;
      });
    }

    // Filtro por modalidade
    if (filtroModalidade.length > 0) {
      filtrados = filtrados.filter((r) => filtroModalidade.includes(r.modalidade_atendimento || ""));
    }

    return filtrados.sort((a, b) => (b.data_sessao || "").localeCompare(a.data_sessao || ""));
  }, [allRegistros, registros, student, filtroAluno, filtroPeriodo, filtroModalidade, filtroDataInicio, filtroDataFim]);

  return (
    <div className="space-y-6">
      <StudentSelector students={students} currentId={currentId} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("filtros")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
            activeTab === "filtros"
              ? "bg-rose-100 text-rose-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          🔍 Filtros & Estatísticas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("novo")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
            activeTab === "novo"
              ? "bg-rose-100 text-rose-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          ➕ Novo Registro
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("lista")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
            activeTab === "lista"
              ? "bg-rose-100 text-rose-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          📋 Lista de Registros
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("relatorios")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
            activeTab === "relatorios"
              ? "bg-rose-100 text-rose-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          📊 Relatórios
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
            activeTab === "config"
              ? "bg-rose-100 text-rose-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          ⚙️ Configurações
        </button>
      </div>

      {/* Conteúdo das abas */}
      {activeTab === "filtros" && (
        <FiltrosTab
          students={students}
          filtroAluno={filtroAluno}
          setFiltroAluno={setFiltroAluno}
          filtroPeriodo={filtroPeriodo}
          setFiltroPeriodo={setFiltroPeriodo}
          filtroModalidade={filtroModalidade}
          setFiltroModalidade={setFiltroModalidade}
          filtroDataInicio={filtroDataInicio}
          setFiltroDataInicio={setFiltroDataInicio}
          filtroDataFim={filtroDataFim}
          setFiltroDataFim={setFiltroDataFim}
          registrosFiltrados={registrosFiltrados}
          loadingRegistros={loadingRegistros}
          onLoadRegistros={loadAllRegistros}
        />
      )}

      {activeTab === "novo" && (
        <NovoRegistroTab
          student={student}
          currentId={currentId}
          saveRegistro={saveRegistro}
          saving={saving}
          expandForm={expandForm}
          setExpandForm={setExpandForm}
        />
      )}

      {activeTab === "lista" && (
        <ListaRegistrosTab
          registrosFiltrados={registrosFiltrados}
          deleteRegistro={deleteRegistro}
          student={student}
          currentId={currentId}
        />
      )}

      {activeTab === "relatorios" && (
        <RelatoriosTab registrosFiltrados={registrosFiltrados} students={students} loadingRegistros={loadingRegistros} />
      )}

      {activeTab === "config" && <ConfigTab />}
    </div>
  );
}

// Componentes das abas
function FiltrosTab({
  students,
  filtroAluno,
  setFiltroAluno,
  filtroPeriodo,
  setFiltroPeriodo,
  filtroModalidade,
  setFiltroModalidade,
  filtroDataInicio,
  setFiltroDataInicio,
  filtroDataFim,
  setFiltroDataFim,
  registrosFiltrados,
  loadingRegistros,
  onLoadRegistros,
}: {
  students: Student[];
  filtroAluno: string;
  setFiltroAluno: (v: string) => void;
  filtroPeriodo: string;
  setFiltroPeriodo: (v: string) => void;
  filtroModalidade: string[];
  setFiltroModalidade: (v: string[]) => void;
  filtroDataInicio: string;
  setFiltroDataInicio: (v: string) => void;
  filtroDataFim: string;
  setFiltroDataFim: (v: string) => void;
  registrosFiltrados: Array<RegistroDiario & { student_id?: string; student_name?: string }>;
  loadingRegistros: boolean;
  onLoadRegistros: () => void;
}) {
  const nomesAlunos = students.map((s) => `${s.name} (${s.grade || "N/I"})`);
  const hoje = new Date();
  const trintaDiasAtras = new Date(hoje);
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const totalRegistros = registrosFiltrados.length;
  const registrosUltimos30 = registrosFiltrados.filter((r) => {
    if (!r.data_sessao) return false;
    const data = new Date(r.data_sessao);
    const limite = new Date(hoje);
    limite.setDate(limite.getDate() - 30);
    return data >= limite;
  }).length;
  const alunosComRegistros = new Set(registrosFiltrados.map((r) => r.student_id).filter(Boolean)).size;

  const modalidadesCount: Record<string, number> = {};
  for (const r of registrosFiltrados) {
    const mod = r.modalidade_atendimento || "N/A";
    modalidadesCount[mod] = (modalidadesCount[mod] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 text-lg">🔍 Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estudante</label>
          <select
            value={filtroAluno}
            onChange={(e) => setFiltroAluno(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          >
            <option value="Todos">Todos</option>
            {nomesAlunos.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Período</label>
          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          >
            <option value="Todos">Todos</option>
            <option value="Últimos 7 dias">Últimos 7 dias</option>
            <option value="Últimos 30 dias">Últimos 30 dias</option>
            <option value="Este mês">Este mês</option>
            <option value="Mês passado">Mês passado</option>
            <option value="Personalizado">Personalizado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Modalidade</label>
          <div className="flex flex-wrap gap-2">
            {MODALIDADES.map((m) => (
              <label key={m.value} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={filtroModalidade.includes(m.value)}
                  onChange={(e) =>
                    setFiltroModalidade(
                      e.target.checked ? [...filtroModalidade, m.value] : filtroModalidade.filter((x) => x !== m.value)
                    )
                  }
                />
                {m.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {filtroPeriodo === "Personalizado" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">De</label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Até</label>
            <input
              type="date"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-lg">📊 Estatísticas</h3>
          <button
            type="button"
            onClick={onLoadRegistros}
            disabled={loadingRegistros}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {loadingRegistros ? "Carregando…" : "📊 Carregar Estatísticas"}
          </button>
        </div>

        {registrosFiltrados.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <div className="text-2xl font-bold text-slate-800">{totalRegistros}</div>
                <div className="text-xs text-slate-500">Total de Registros</div>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <div className="text-2xl font-bold text-slate-800">{registrosUltimos30}</div>
                <div className="text-xs text-slate-500">Últimos 30 dias</div>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <div className="text-2xl font-bold text-slate-800">{alunosComRegistros}</div>
                <div className="text-xs text-slate-500">Estudantes Atendidos</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Por Modalidade</h4>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(modalidadesCount).map(([mod, count]) => {
                  const modLabel = MODALIDADES.find((m) => m.value === mod)?.label || mod;
                  return (
                    <div key={mod} className="p-3 rounded-lg border border-slate-200 bg-white">
                      <div className="text-lg font-bold text-slate-800">{count}</div>
                      <div className="text-xs text-slate-500">{modLabel}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-center">
            {loadingRegistros ? "Carregando registros…" : "Nenhum registro encontrado com os filtros aplicados."}
          </div>
        )}
      </div>
    </div>
  );
}

function NovoRegistroTab({
  student,
  currentId,
  saveRegistro,
  saving,
  expandForm,
  setExpandForm,
}: {
  student: StudentFull | null;
  currentId: string | null;
  saveRegistro: (r: RegistroDiario) => Promise<boolean>;
  saving: boolean;
  expandForm: boolean;
  setExpandForm: (v: boolean) => void;
}) {
  if (!currentId || !student) {
    return (
      <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
        Selecione um estudante para registrar atendimentos.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 bg-rose-50/30">
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
          <div className="font-bold text-slate-800">{(student.daily_logs || []).length}</div>
        </div>
      </div>

      <details open={expandForm} className="border border-slate-200 rounded-xl overflow-hidden">
        <summary
          className="px-4 py-3 bg-rose-50 cursor-pointer font-semibold text-slate-800"
          onClick={() => setExpandForm((x) => !x)}
        >
          Nova sessão de AEE
        </summary>
        <div className="p-4 bg-white">
          <FormNovaSessao studentId={student.id} onSave={saveRegistro} saving={saving} />
        </div>
      </details>
    </div>
  );
}

function ListaRegistrosTab({
  registrosFiltrados,
  deleteRegistro,
  student,
  currentId,
}: {
  registrosFiltrados: Array<RegistroDiario & { student_id?: string; student_name?: string }>;
  deleteRegistro: (id: string, studentId?: string) => Promise<boolean>;
  student: StudentFull | null;
  currentId: string | null;
}) {
  const registrosParaExibir = registrosFiltrados.length > 0 ? registrosFiltrados : (student?.daily_logs || []) as RegistroDiario[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-lg">📋 Registros de Atendimento</h3>
        <div className="text-sm text-slate-500">
          {registrosParaExibir.length} registro{registrosParaExibir.length !== 1 ? "s" : ""}
        </div>
      </div>

      {registrosParaExibir.length === 0 ? (
        <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
          Nenhum registro encontrado.
        </div>
      ) : (
        <div className="space-y-3">
          {registrosParaExibir.map((r) => {
            const registroComNome = r as RegistroDiario & { student_id?: string; student_name?: string };
            return (
              <RegistroCard
                key={r.registro_id || Math.random()}
                registro={registroComNome}
                onDelete={async () => {
                  if (r.registro_id) {
                    await deleteRegistro(r.registro_id, registroComNome.student_id);
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function RelatoriosTab({
  registrosFiltrados,
  students,
  loadingRegistros,
}: {
  registrosFiltrados: Array<RegistroDiario & { student_id?: string; student_name?: string }>;
  students: Student[];
  loadingRegistros: boolean;
}) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Agrupar por mês
  const registrosPorMes: Record<string, number> = {};
  for (const r of registrosFiltrados) {
    if (!r.data_sessao) continue;
    const data = new Date(r.data_sessao);
    const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
    registrosPorMes[mesAno] = (registrosPorMes[mesAno] || 0) + 1;
  }

  // Distribuição por modalidade
  const modalidadesCount: Record<string, number> = {};
  for (const r of registrosFiltrados) {
    const mod = r.modalidade_atendimento || "N/A";
    modalidadesCount[mod] = (modalidadesCount[mod] || 0) + 1;
  }

  // Competências trabalhadas
  const competenciasCount: Record<string, number> = {};
  for (const r of registrosFiltrados) {
    const comps = r.competencias_trabalhadas || [];
    for (const comp of comps) {
      competenciasCount[comp] = (competenciasCount[comp] || 0) + 1;
    }
  }

  // Filtrar registros do estudante selecionado
  const registrosAluno = selectedStudentId
    ? registrosFiltrados.filter((r) => r.student_id === selectedStudentId)
    : [];

  const engajamentoMedio =
    registrosAluno.length > 0
      ? registrosAluno.reduce((sum, r) => sum + (r.engajamento_aluno || 0), 0) / registrosAluno.length
      : 0;

  const exportarCSV = () => {
    const headers = [
      "Data",
      "Estudante",
      "Modalidade",
      "Duração (min)",
      "Engajamento",
      "Atividade",
      "Objetivos",
      "Competências",
    ];
    const rows = registrosFiltrados.map((r) => [
      fmtData(r.data_sessao),
      r.student_name || "—",
      MODALIDADES.find((m) => m.value === r.modalidade_atendimento)?.label || r.modalidade_atendimento || "—",
      r.duracao_minutos || 0,
      r.engajamento_aluno || 0,
      r.atividade_principal || "—",
      r.objetivos_trabalhados || "—",
      (r.competencias_trabalhadas || []).join(", ") || "—",
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diario_bordo_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportarJSON = () => {
    const json = JSON.stringify(registrosFiltrados, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diario_bordo_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 text-lg">📊 Relatórios e Análises</h3>

      {loadingRegistros ? (
        <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-center">
          Carregando registros…
        </div>
      ) : registrosFiltrados.length === 0 ? (
        <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-center">
          Nenhum dado disponível para gerar relatórios.
        </div>
      ) : (
        <>
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Atendimentos por mês */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="font-semibold text-slate-800 mb-4">Atendimentos por Mês</h4>
              {Object.keys(registrosPorMes).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(registrosPorMes)
                    .sort(([a], [b]) => {
                      const [mesA, anoA] = a.split("/").map(Number);
                      const [mesB, anoB] = b.split("/").map(Number);
                      if (anoA !== anoB) return anoA - anoB;
                      return mesA - mesB;
                    })
                    .map(([mes, count]) => {
                      const maxCount = Math.max(...Object.values(registrosPorMes));
                      const porcentagem = (count / maxCount) * 100;
                      return (
                        <div key={mes} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-700">{mes}</span>
                            <span className="font-semibold text-slate-800">{count}</span>
                          </div>
                          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full transition-all"
                              style={{ width: `${porcentagem}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Dados insuficientes</p>
              )}
            </div>

            {/* Distribuição por modalidade */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h4 className="font-semibold text-slate-800 mb-4">Distribuição por Modalidade</h4>
              {Object.keys(modalidadesCount).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(modalidadesCount).map(([mod, count]) => {
                    const total = Object.values(modalidadesCount).reduce((a, b) => a + b, 0);
                    const porcentagem = (count / total) * 100;
                    const modLabel = MODALIDADES.find((m) => m.value === mod)?.label || mod;
                    return (
                      <div key={mod} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-700">{modLabel}</span>
                          <span className="font-semibold text-slate-800">
                            {count} ({porcentagem.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-400 rounded-full transition-all"
                            style={{ width: `${porcentagem}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Dados insuficientes</p>
              )}
            </div>
          </div>

          {/* Evolução do engajamento */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="font-semibold text-slate-800 mb-4">Evolução do Engajamento</h4>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o estudante:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="">Todos</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedStudentId && registrosAluno.length > 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-lg font-bold text-slate-800">{registrosAluno.length}</div>
                    <div className="text-xs text-slate-500">Total Sessões</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-lg font-bold text-slate-800">{engajamentoMedio.toFixed(1)}/5</div>
                    <div className="text-xs text-slate-500">Engajamento Médio</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-lg font-bold text-slate-800">
                      {Math.round(
                        registrosAluno.reduce((sum, r) => sum + (r.duracao_minutos || 0), 0) / registrosAluno.length
                      )}
                    </div>
                    <div className="text-xs text-slate-500">Duração Média (min)</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-lg font-bold text-slate-800">
                      {fmtData(registrosAluno[0]?.data_sessao)}
                    </div>
                    <div className="text-xs text-slate-500">Última Sessão</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {registrosAluno
                    .sort((a, b) => (a.data_sessao || "").localeCompare(b.data_sessao || ""))
                    .map((r, idx) => {
                      const eng = r.engajamento_aluno || 0;
                      return (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-24 text-xs text-slate-600">{fmtData(r.data_sessao)}</div>
                          <div className="flex-1">
                            <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-500 rounded-full transition-all flex items-center justify-end pr-2"
                                style={{ width: `${(eng / 5) * 100}%` }}
                              >
                                <span className="text-xs font-semibold text-white">{eng}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : selectedStudentId ? (
              <p className="text-sm text-slate-500">Dados insuficientes para análise (mínimo 2 sessões)</p>
            ) : (
              <p className="text-sm text-slate-500">Selecione um estudante para ver a evolução</p>
            )}
          </div>

          {/* Competências trabalhadas */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="font-semibold text-slate-800 mb-4">Top 10 Competências Trabalhadas</h4>
            {Object.keys(competenciasCount).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(competenciasCount)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([comp, count]) => {
                    const maxCount = Math.max(...Object.values(competenciasCount));
                    const porcentagem = (count / maxCount) * 100;
                    return (
                      <div key={comp} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-700 capitalize">{comp}</span>
                          <span className="font-semibold text-slate-800">{count}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-400 rounded-full transition-all"
                            style={{ width: `${porcentagem}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nenhuma competência registrada</p>
            )}
          </div>

          {/* Exportação */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="font-semibold text-slate-800 mb-4">📤 Exportar Dados</h4>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportarCSV}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
              >
                📥 Exportar CSV
              </button>
              <button
                type="button"
                onClick={exportarJSON}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
              >
                📥 Exportar JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ConfigTab() {
  const [duracaoPadrao, setDuracaoPadrao] = useState(45);
  const [modalidadePadrao, setModalidadePadrao] = useState("individual");
  const [competenciasPadrao, setCompetenciasPadrao] = useState<string[]>(["atenção", "memória"]);
  const [notificacoes, setNotificacoes] = useState(true);
  const [formatoExport, setFormatoExport] = useState("CSV");
  const [autoBackup, setAutoBackup] = useState(true);
  const [freqBackup, setFreqBackup] = useState("Semanal");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Salvar no localStorage (ou API no futuro)
    localStorage.setItem(
      "diario_config",
      JSON.stringify({
        duracaoPadrao,
        modalidadePadrao,
        competenciasPadrao,
        notificacoes,
        formatoExport,
        autoBackup,
        freqBackup,
      })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setDuracaoPadrao(45);
    setModalidadePadrao("individual");
    setCompetenciasPadrao(["atenção", "memória"]);
    setNotificacoes(true);
    setFormatoExport("CSV");
    setAutoBackup(true);
    setFreqBackup("Semanal");
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 text-lg">⚙️ Configurações do Diário</h3>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
          ✅ Configurações salvas com sucesso!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-800">Configurações de Registro</h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duração Padrão (minutos)</label>
            <input
              type="number"
              min={15}
              max={120}
              step={15}
              value={duracaoPadrao}
              onChange={(e) => setDuracaoPadrao(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Modalidade Padrão</label>
            <select
              value={modalidadePadrao}
              onChange={(e) => setModalidadePadrao(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              {MODALIDADES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Competências Padrão</label>
            <div className="flex flex-wrap gap-2">
              {COMPETENCIAS.map((c) => (
                <label key={c} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={competenciasPadrao.includes(c)}
                    onChange={(e) =>
                      setCompetenciasPadrao(
                        e.target.checked ? [...competenciasPadrao, c] : competenciasPadrao.filter((x) => x !== c)
                      )
                    }
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notificacoes}
                onChange={(e) => setNotificacoes(e.target.checked)}
              />
              Receber lembretes de registro
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-slate-800">Configurações de Exportação</h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Formato Padrão de Exportação</label>
            <select
              value={formatoExport}
              onChange={(e) => setFormatoExport(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              <option value="CSV">CSV</option>
              <option value="JSON">JSON</option>
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={autoBackup} onChange={(e) => setAutoBackup(e.target.checked)} />
              Backup Automático
            </label>
          </div>
          {autoBackup && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frequência do Backup</label>
              <select
                value={freqBackup}
                onChange={(e) => setFreqBackup(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="Diário">Diário</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensal">Mensal</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-medium"
        >
          💾 Salvar Configurações
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
        >
          🔄 Restaurar Padrões
        </button>
      </div>
    </div>
  );
}

function FormNovaSessao({
  studentId,
  onSave,
  saving,
}: {
  studentId: string;
  onSave: (r: RegistroDiario) => Promise<boolean>;
  saving: boolean;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!atividade.trim() || !objetivos.trim() || !estrategias.trim()) return;
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
  };

  return (
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
  );
}

function RegistroCard({
  registro,
  onDelete,
}: {
  registro: RegistroDiario & { student_name?: string };
  onDelete: () => void;
}) {
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
          {registro.student_name && (
            <>
              <span className="mx-2 text-slate-400">•</span>
              <span className="text-sm font-medium text-slate-700">{registro.student_name}</span>
            </>
          )}
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
