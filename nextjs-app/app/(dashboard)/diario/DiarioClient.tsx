"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { useStudentMutation } from "@/hooks/useStudentMutation";
import { useStudentRealtime } from "@/hooks/useStudentRealtime";
import { getColorClasses } from "@/lib/colors";
import { Card, CardHeader, CardTitle, CardContent, Input, Textarea, Select, Button, Checkbox, Slider } from "@omni/ds";
import { OmniLoader } from "@/components/OmniLoader";
import { Filter, Plus, List, Settings, BarChart3, Download, FileText, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

const RelatoriosTab = dynamic(() => import("./components/RelatoriosTab"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-10 space-y-4">
      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-violet-600 animate-spin" />
      <span className="text-sm font-medium text-slate-500">Montando os gráficos da IA...</span>
    </div>
  )
});

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
  alerta_regente?: boolean;
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
  } catch { /* expected fallback */
    return String(s);
  }
}

function DiarioClientInner({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams?.get("student") || null;
  const { updateDiario } = useStudentMutation();
  const [activeTab, setActiveTab] = useState<TabId>("novo");

  // Omni V5: Real-time Multi-User Subscription
  useStudentRealtime(currentId);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

        const data = await updateDiario(student.id, { daily_logs: lista });
        if (data && data.ok) {
          setRefreshKey((k) => k + 1);
          // O backend via Supabase Realtime emitirá o router.refresh() automático
          return true;
        }
      } catch (e) {
        console.error(e);
      }
      return false;
    },
    [student, registros]
  );

  const deleteRegistro = useCallback(
    async (registroId: string) => {
      if (!student?.id) return false;
      const lista = registros.filter((r) => r.registro_id !== registroId);
      const data = await updateDiario(student.id, { daily_logs: lista });
      if (data && data.ok) {
        setRefreshKey((k) => k + 1);
        window.location.reload();
      }
      return !!(data && data.ok);
    },
    [student, registros]
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 rounded-2xl border border-(--omni-border-default) shadow-sm min-h-[140px]" style={{ backgroundColor: getColorClasses("rose").bg }}>
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
      <Card variant="default">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">🔍 Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label="Estudante"
              value={filtroAluno}
              onChange={(e) => setFiltroAluno(e.target.value)}
              options={[
                { value: "Todos", label: "Todos" },
                ...students.map(s => ({ value: s.id, label: s.name }))
              ]}
            />
            <Select
              label="Período"
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              options={[
                { value: "Todos", label: "Todos" },
                { value: "Últimos 7 dias", label: "Últimos 7 dias" },
                { value: "Últimos 30 dias", label: "Últimos 30 dias" },
                { value: "Este mês", label: "Este mês" },
              ]}
            />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Modalidade</label>
              <div className="flex flex-wrap gap-3 mt-1">
                {MODALIDADES.map((m) => (
                  <div key={m.value} className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <Checkbox
                      label={m.label}
                      checked={filtroModalidade.includes(m.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFiltroModalidade([...filtroModalidade, m.value]);
                        } else {
                          setFiltroModalidade(filtroModalidade.filter((v) => v !== m.value));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="default">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">📊 Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-2xl font-bold text-rose-600">{registrosFiltrados.length}</div>
              <div className="text-sm text-slate-600 mt-1">Total de Registros</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-2xl font-bold text-rose-600">
                {Math.round(registrosFiltrados.reduce((acc, r) => acc + (r.duracao_minutos || 0), 0) / 60)}
              </div>
              <div className="text-sm text-slate-600 mt-1">Horas de Atend.</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-2xl font-bold text-rose-600">
                {registrosFiltrados.length > 0
                  ? (registrosFiltrados.reduce((acc, r) => acc + (r.engajamento_aluno || 0), 0) / registrosFiltrados.length).toFixed(1)
                  : "0"}
              </div>
              <div className="text-sm text-slate-600 mt-1">Engajamento Médio</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-2xl font-bold text-rose-600">
                {new Set(registrosFiltrados.map((r) => r.student_id).filter(Boolean)).size}
              </div>
              <div className="text-sm text-slate-600 mt-1">Estudantes</div>
            </div>
          </div>
        </CardContent>
      </Card>
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
  const [alertaRegente, setAlertaRegente] = useState(false);
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
      alerta_regente: alertaRegente,
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
      setAlertaRegente(false);
    }
    setSaving(false);
  };

  return (
    <Card variant="default">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <span>➕</span> Nova Sessão de AEE
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Data da sessão *"
              type="date"
              value={dataSessao}
              onChange={(e) => setDataSessao(e.target.value)}
              required
            />
            <Input
              label="Duração (min)"
              type="number"
              min={15}
              max={240}
              step={15}
              value={duracao}
              onChange={(e) => setDuracao(Number(e.target.value))}
            />
            <Select
              label="Modalidade"
              options={MODALIDADES}
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
            />
          </div>

          <Textarea
            label="Atividade principal *"
            value={atividade}
            onChange={(e) => setAtividade(e.target.value)}
            rows={3}
            required
            placeholder="Descreva a atividade..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Textarea
              label="Objetivos trabalhados *"
              value={objetivos}
              onChange={(e) => setObjetivos(e.target.value)}
              rows={3}
              required
              placeholder="Quais objetivos?"
            />
            <Textarea
              label="Estratégias utilizadas *"
              value={estrategias}
              onChange={(e) => setEstrategias(e.target.value)}
              rows={3}
              required
              placeholder="Ex: Modelagem, dicas visuais..."
            />
          </div>

          <Input
            label="Recursos e materiais"
            value={recursos}
            onChange={(e) => setRecursos(e.target.value)}
            placeholder="Tablets, jogos..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Slider
              label="Engajamento (1-5)"
              min={1}
              max={5}
              value={engajamento}
              onChange={(e) => setEngajamento(Number(e.target.value))}
              color="#e11d48"
            />
            <Select
              label="Nível de dificuldade"
              options={NIVEL_DIFICULDADE}
              value={nivelDificuldade}
              onChange={(e) => setNivelDificuldade(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Competências trabalhadas</label>
            <div className="flex flex-wrap gap-3">
              {COMPETENCIAS.map((c) => (
                <div key={c} className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                  <Checkbox
                    label={c}
                    checked={competencias.includes(c)}
                    onChange={(e) =>
                      setCompetencias((prev) =>
                        e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Textarea
              label="Pontos positivos"
              value={pontosPositivos}
              onChange={(e) => setPontosPositivos(e.target.value)}
              rows={2}
            />
            <Textarea
              label="Dificuldades identificadas"
              value={dificuldades}
              onChange={(e) => setDificuldades(e.target.value)}
              rows={2}
            />
          </div>

          <Textarea
            label="Observações gerais"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Textarea
              label="Próximos passos"
              value={proximosPassos}
              onChange={(e) => setProximosPassos(e.target.value)}
              rows={2}
            />
            <Input
              label="Encaminhamentos"
              value={encaminhamentos}
              onChange={(e) => setEncaminhamentos(e.target.value)}
            />
          </div>

          {/* Notificação Regente */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start mt-6 mb-2">
            <Checkbox
              id="alertaRegente"
              label="⚠️ Sinalizar Evolução Crítica (Aviso Regente)"
              description="Marque esta opção se houve um evento importante nesta sessão que o Professor Regente deve saber imediatamente (ex: mudança de comportamento severa, pico de engajamento, colapso sensorial). O aviso ficará visível no PEI por 30 dias."
              checked={alertaRegente}
              onChange={(e) => setAlertaRegente(e.target.checked)}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600"
              disabled={saving}
              loading={saving}
            >
              Salvar registro
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
      <Card variant="default">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">📋 Lista de Registros</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "lista" ? "primary" : "secondary"}
                size="sm"
                className={viewMode === "lista" ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600" : ""}
                onClick={() => setViewMode("lista")}
              >
                Lista
              </Button>
              <Button
                variant={viewMode === "timeline" ? "primary" : "secondary"}
                size="sm"
                className={viewMode === "timeline" ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600" : ""}
                onClick={() => setViewMode("timeline")}
              >
                Timeline
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {registros.length === 0 ? (
            <div className="text-(--omni-text-muted) p-4 text-center border-2 border-dashed border-slate-200 rounded-xl mt-4">
              Nenhum registro ainda. Preencha o formulário acima para criar o primeiro.
            </div>
          ) : viewMode === "lista" ? (
            <div className="space-y-3 mt-4">
              {registros.map((r, i) => (
                <RegistroCard
                  key={r.registro_id || `temp-${i}`}
                  registro={r}
                  onDelete={() => r.registro_id && onDelete(r.registro_id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <TimelineView registros={registros} onDelete={onDelete} />
            </div>
          )}
        </CardContent>
      </Card>
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
              <div className="relative z-10 shrink-0">
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
                        if (r.registro_id) onDelete(r.registro_id);
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
      setTimeout(() => {
        try {
          const config = JSON.parse(saved);
          setDuracaoPadrao(config.duracaoPadrao || 45);
          setModalidadePadrao(config.modalidadePadrao || "individual");
          setCompetenciasPadrao(config.competenciasPadrao || ["atenção", "memória"]);
          setNotificacoes(config.notificacoes !== false);
        } catch (e) {
          console.error("Erro ao carregar configurações:", e);
        }
      }, 0);
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
      <Card variant="default">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">⚙️ Configurações do Diário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Opções Padrão</h4>

              <Input
                label="Duração Padrão (minutos)"
                type="number"
                min={15}
                max={120}
                step={15}
                value={duracaoPadrao}
                onChange={(e) => setDuracaoPadrao(Number(e.target.value))}
              />

              <Select
                label="Modalidade Padrão"
                value={modalidadePadrao}
                onChange={(e) => setModalidadePadrao(e.target.value)}
                options={MODALIDADES}
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Competências Padrão</label>
                <div className="flex flex-wrap gap-2">
                  {COMPETENCIAS.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
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
                        className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                      />
                      <span className="capitalize">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificacoes}
                    onChange={(e) => setNotificacoes(e.target.checked)}
                    className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Receber lembretes de registro contínuo</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <span className="text-xl">💡</span> Ajuda e Boas Práticas
              </h4>
              <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
                <p>Nesta área, você pode definir os valores padrão que virão preenchidos automaticamente num <strong>Novo Registro</strong>, garantindo mais agilidade no dia a dia.</p>

                <div>
                  <strong className="text-slate-800 block mb-1">Guia de Uso do Diário:</strong>
                  <ul className="list-disc list-inside space-y-1.5 marker:text-rose-400">
                    <li><strong className="text-slate-700">Novo Registro:</strong> Preencha todos os campos obrigatórios (*) para criar o documento probatório.</li>
                    <li><strong className="text-slate-700">Aviso Regente:</strong> Use o alerta no fim do registro apenas para eventos críticos.</li>
                    <li><strong className="text-slate-700">Relatórios:</strong> Exporte um dossiê robusto usando JSON ou Relatório Resumido para apresentar na coordenação.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
            <Button
              onClick={handleSave}
              disabled={saving}
              loading={saving}
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700 justify-center w-full sm:w-auto"
            >
              💾 Salvar Configurações
            </Button>
            <Button
              onClick={handleReset}
              variant="secondary"
              className="justify-center w-full sm:w-auto"
            >
              🔄 Restaurar Padrões
            </Button>
          </div>
        </CardContent>
      </Card>
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
