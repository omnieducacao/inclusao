"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useConfirmar } from "@/components/Confirmar";
import { CabecalhoEstudante, EscolherEstudante } from "@/components/estudante/CabecalhoEstudante";
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

type Student = { id: string; name: string; grade?: string | null; class_group?: string | null };
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

type TabId = "filtros" | "novo" | "lista" | "relatorios";

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
        /* client-side */ console.error(e);
      }
      return false;
    },
    [student, registros]
  );

  const { confirmar, dialogo } = useConfirmar();
  const deleteRegistro = useCallback(
    async (registroId: string) => {
      if (!student?.id) return false;
      // Onda 9: confirmação no padrão do design system (antes, confirm() do navegador)
      const reg = registros.find((r) => r.registro_id === registroId);
      const ok = await confirmar({
        titulo: "Excluir este atendimento?",
        texto: reg?.data_sessao ? `O registro de ${fmtData(reg.data_sessao)} sai da linha do tempo e dos relatórios.` : "O registro sai da linha do tempo e dos relatórios.",
        acao: "Excluir atendimento",
        cancelar: "Manter",
        perigo: true,
      });
      if (!ok) return false;
      const lista = registros.filter((r) => r.registro_id !== registroId);
      const data = await updateDiario(student.id, { daily_logs: lista });
      if (data && data.ok) {
        setRefreshKey((k) => k + 1);
        window.location.reload();
      }
      return !!(data && data.ok);
    },
    [student, registros, confirmar]
  );

  if (!currentId) {
    return (
      <EscolherEstudante students={students} texto="Os atendimentos registrados aparecem na linha do tempo dele." />
    );
  }

  if (!student && studentId) {
    return (
      <EscolherEstudante students={students} texto="" naoEncontrado />
    );
  }

  if (!student) {
    return (
      <EscolherEstudante students={students} texto="Os atendimentos registrados aparecem na linha do tempo dele." />
    );
  }

  return (
    <div className="space-y-6">
      {dialogo}
      <CabecalhoEstudante students={students} student={{ ...student, pei_data: peiData }} />

      {student && (
        <PEISummaryPanel peiData={peiData} studentName={student.name} />
      )}

      {/* Onda 9: registrar e a linha do tempo lado a lado; análise e relatórios numa aba à parte; sem Configurações */}
      <div className="omni-abas" role="tablist" aria-label="Diário de bordo">
        {([
          { id: "novo", label: "Registrar e linha do tempo" },
          { id: "filtros", label: "Análise" },
          { id: "relatorios", label: "Relatórios" },
        ] as Array<{ id: TabId; label: string }>).map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className="omni-aba" onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {(activeTab === "novo" || activeTab === "lista") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <NovoRegistroTab studentId={student.id} onSave={saveRegistro} ultimo={registrosOrdenados[0]} />
          <ListaTab registros={registrosOrdenados} onDelete={deleteRegistro} />
        </div>
      )}
      {activeTab === "filtros" && (
        <FiltrosTab students={students} registros={registrosOrdenados} />
      )}
      {activeTab === "relatorios" && (
        <RelatoriosTab registros={registrosOrdenados} student={student} />
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
  ultimo,
}: {
  studentId: string;
  onSave: (r: RegistroDiario) => Promise<boolean>;
  /** Onda 9: duração e modalidade começam iguais às do último atendimento (substitui a aba Configurações) */
  ultimo?: RegistroDiario;
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [dataSessao, setDataSessao] = useState(hoje);
  const [duracao, setDuracao] = useState(ultimo?.duracao_minutos || 45);
  const [modalidade, setModalidade] = useState(ultimo?.modalidade_atendimento || "individual");
  const [engajamento, setEngajamento] = useState(3);
  const [atividade, setAtividade] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [estrategias, setEstrategias] = useState("");
  const [recursos, setRecursos] = useState("");
  const [nivelDificuldade, setNivelDificuldade] = useState("adequado");
  const [competencias, setCompetencias] = useState<string[]>(ultimo?.competencias_trabalhadas || []);
  const [pontosPositivos, setPontosPositivos] = useState("");
  const [dificuldades, setDificuldades] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [proximosPassos, setProximosPassos] = useState("");
  const [encaminhamentos, setEncaminhamentos] = useState("");
  const [alertaRegente, setAlertaRegente] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erroAtividade, setErroAtividade] = useState(false);
  // Onda 5: o registro avisa se salvou ou não (antes só limpava os campos, e a falha era silenciosa)
  const [retorno, setRetorno] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Onda 9: só "o que foi feito" é obrigatório; o resto pode ficar para depois
    if (!atividade.trim()) {
      setErroAtividade(true);
      document.getElementById("diario-atividade")?.focus();
      return;
    }
    setErroAtividade(false);
    setRetorno(null);
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
      setAtividade(""); setObjetivos(""); setEstrategias(""); setRecursos("");
      setPontosPositivos(""); setDificuldades(""); setObservacoes("");
      setProximosPassos(""); setEncaminhamentos(""); setAlertaRegente(false); setEngajamento(3);
      setRetorno({ tipo: "ok", texto: `Atendimento de ${new Date(dataSessao + "T12:00:00").toLocaleDateString("pt-BR")} registrado. Ele já aparece na linha do tempo.` });
    } else {
      setRetorno({ tipo: "erro", texto: "Não conseguimos salvar o registro agora. O que você escreveu continua aqui: confira a internet e tente de novo." });
    }
    setSaving(false);
  };

  const ENGAJ = ["Muito baixo", "Baixo", "Médio", "Bom", "Muito bom"];

  return (
    <section className="omni-cartao omni-cartao--plano" aria-labelledby="diario-novo">
      <h2 id="diario-novo" className="omni-cartao__titulo" style={{ marginTop: 0 }}>Registrar atendimento</h2>
      <p className="omni-apoio" style={{ marginTop: 0 }}>Leva menos de um minuto. Só o que foi feito é obrigatório.</p>
      {retorno && (
        <div className={`omni-aviso ${retorno.tipo === "ok" ? "omni-aviso--sucesso" : "omni-aviso--erro"}`} role={retorno.tipo === "erro" ? "alert" : "status"} style={{ maxWidth: "none", margin: "12px 0" }}>
          <div><div className="omni-aviso__texto">{retorno.texto}</div></div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="omni-campo">
            <label className="omni-campo__rotulo" htmlFor="diario-data">Data</label>
            <input id="diario-data" type="date" className="omni-entrada" value={dataSessao} max={hoje} onChange={(e) => setDataSessao(e.target.value)} />
          </div>
          <div className="omni-campo">
            <label className="omni-campo__rotulo" htmlFor="diario-duracao">Duração (min)</label>
            <input id="diario-duracao" type="number" className="omni-entrada" min={5} max={240} step={5} value={duracao} onChange={(e) => setDuracao(Number(e.target.value))} />
          </div>
          <div className="omni-campo">
            <label className="omni-campo__rotulo" htmlFor="diario-modalidade">Como foi</label>
            <select id="diario-modalidade" className="omni-entrada" value={modalidade} onChange={(e) => setModalidade(e.target.value)}>
              {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <div className="omni-campo" style={{ maxWidth: "none" }}>
          <label className="omni-campo__rotulo" htmlFor="diario-atividade">O que foi feito</label>
          <textarea id="diario-atividade" className="omni-entrada" rows={3} value={atividade}
            onChange={(e) => { setAtividade(e.target.value); if (e.target.value.trim()) setErroAtividade(false); }}
            aria-invalid={erroAtividade} aria-describedby={erroAtividade ? "diario-atividade-erro" : undefined}
            placeholder="Ex.: jogo de memória com sílabas; leitura compartilhada do livro da turma" />
          {erroAtividade && <span id="diario-atividade-erro" className="omni-campo__erro">Escreva o que foi feito para salvar.</span>}
        </div>

        <fieldset className="omni-campo" style={{ maxWidth: "none", border: 0, padding: 0, margin: 0 }}>
          <legend className="omni-campo__rotulo" style={{ marginBottom: 6 }}>Engajamento do estudante</legend>
          <div className="omni-segmentado" style={{ flexWrap: "wrap" }}>
            {ENGAJ.map((rotulo, i) => (
              <label key={rotulo}>
                <input type="radio" name="diario-engajamento" checked={engajamento === i + 1} onChange={() => setEngajamento(i + 1)} />
                {rotulo}
              </label>
            ))}
          </div>
        </fieldset>

        <details>
          <summary style={{ cursor: "pointer", font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>Mais detalhes <span className="omni-apoio" style={{ fontWeight: 400 }}>(opcional)</span></summary>
          <div className="space-y-4" style={{ marginTop: 12 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="omni-campo"><label className="omni-campo__rotulo" htmlFor="d-obj">Objetivos trabalhados</label><textarea id="d-obj" className="omni-entrada" rows={2} value={objetivos} onChange={(e) => setObjetivos(e.target.value)} /></div>
              <div className="omni-campo"><label className="omni-campo__rotulo" htmlFor="d-est">Estratégias usadas</label><textarea id="d-est" className="omni-entrada" rows={2} value={estrategias} onChange={(e) => setEstrategias(e.target.value)} placeholder="Ex.: modelagem, dicas visuais" /></div>
              <div className="omni-campo"><label className="omni-campo__rotulo" htmlFor="d-rec">Recursos e materiais</label><input id="d-rec" className="omni-entrada" value={recursos} onChange={(e) => setRecursos(e.target.value)} /></div>
              <div className="omni-campo"><label className="omni-campo__rotulo" htmlFor="d-dif">Nível de dificuldade da atividade</label>
                <select id="d-dif" className="omni-entrada" value={nivelDificuldade} onChange={(e) => setNivelDificuldade(e.target.value)}>
                  {NIVEL_DIFICULDADE.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              <div className="omni-campo"><label className="omni-campo__rotulo" htmlFor="d-pos">O que foi bem</label><textarea id="d-pos" className="omni-entrada" rows={2} value={pontosPositivos} onChange={(e) => setPontosPositivos(e.target.value)} /></div>
              <div className="omni-campo"><label className="omni-campo__rotulo" htmlFor="d-difi">Dificuldades</label><textarea id="d-difi" className="omni-entrada" rows={2} value={dificuldades} onChange={(e) => setDificuldades(e.target.value)} /></div>
              <div className="omni-campo"><label className="omni-campo__rotulo" htmlFor="d-prox">Próximos passos</label><textarea id="d-prox" className="omni-entrada" rows={2} value={proximosPassos} onChange={(e) => setProximosPassos(e.target.value)} /></div>
              <div className="omni-campo"><label className="omni-campo__rotulo" htmlFor="d-enc">Encaminhamentos</label><input id="d-enc" className="omni-entrada" value={encaminhamentos} onChange={(e) => setEncaminhamentos(e.target.value)} /></div>
            </div>
            <div className="omni-campo" style={{ maxWidth: "none" }}><label className="omni-campo__rotulo" htmlFor="d-obs">Observações</label><textarea id="d-obs" className="omni-entrada" rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></div>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="omni-campo__rotulo" style={{ marginBottom: 6 }}>Competências trabalhadas</legend>
              <div className="omni-escolhas" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {COMPETENCIAS.map((c) => (
                  <label key={c} className="omni-chip" style={{ cursor: "pointer" }}>
                    <input type="checkbox" checked={competencias.includes(c)} onChange={(e) => setCompetencias((prev) => e.target.checked ? [...prev, c] : prev.filter((x) => x !== c))} /> {c}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </details>

        <label className="flex items-start gap-3" style={{ padding: "var(--space-3)", border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", cursor: "pointer" }}>
          <input type="checkbox" checked={alertaRegente} onChange={(e) => setAlertaRegente(e.target.checked)} style={{ marginTop: 4 }} />
          <span>
            <span style={{ font: "700 15px/22px var(--font-sans)", color: "var(--tinta)", display: "block" }}>Avisar o professor da sala</span>
            <span className="omni-apoio">Para algo importante que ele precisa saber logo (mudança de comportamento, crise, um avanço). O aviso aparece no PEI por 30 dias.</span>
          </span>
        </label>

        <button type="submit" className="omni-btn omni-btn--primario" disabled={saving}>{saving ? "Salvando…" : "Registrar atendimento"}</button>
      </form>
    </section>
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
  const [viewMode, setViewMode] = useState<"lista" | "timeline">("timeline");

  return (
    <div className="space-y-4">
      <Card variant="default">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">Atendimentos</CardTitle>
            <div className="flex gap-1" role="group" aria-label="Como ver">
              <button type="button" className={`omni-btn omni-btn--pequeno ${viewMode === "timeline" ? "omni-btn--secundario" : "omni-btn--discreto"}`} aria-pressed={viewMode === "timeline"} onClick={() => setViewMode("timeline")}>Linha do tempo</button>
              <button type="button" className={`omni-btn omni-btn--pequeno ${viewMode === "lista" ? "omni-btn--secundario" : "omni-btn--discreto"}`} aria-pressed={viewMode === "lista"} onClick={() => setViewMode("lista")}>Lista</button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {registros.length === 0 ? (
            <div className="text-(--omni-text-muted) p-4 text-center border-2 border-dashed border-slate-200 rounded-xl mt-4">
              Nenhum atendimento registrado ainda. O primeiro que você registrar aparece aqui.
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
                      {
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
              onDelete();
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
