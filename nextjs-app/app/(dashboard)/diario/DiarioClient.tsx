"use client";

import { useState, useCallback, useMemo, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useConfirmar } from "@/components/Confirmar";
import { CabecalhoEstudante, EscolherEstudante } from "@/components/estudante/CabecalhoEstudante";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { useStudentRealtime } from "@/hooks/useStudentRealtime";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";

const RelatoriosTab = dynamic(() => import("./components/RelatoriosTab"), {
  ssr: false,
  loading: () => (
    <p className="omni-apoio" role="status" style={{ padding: "40px 0", textAlign: "center" }}>Montando os gráficos…</p>
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

/** Data só com o dia ("2026-10-09") é lida ao meio-dia local, para não aparecer como o dia anterior. */
function lerData(s: string | undefined): Date | null {
  if (!s) return null;
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T12:00:00` : s);
  return isNaN(d.getTime()) ? null : d;
}

function fmtData(s: string | undefined): string {
  if (!s) return "—";
  const d = lerData(s);
  return d ? d.toLocaleDateString("pt-BR") : String(s);
}

const ENGAJAMENTO_ROTULO = ["Muito baixo", "Baixo", "Médio", "Bom", "Muito bom"];

/** Cor do ponto na linha do tempo, por modalidade (variáveis do design system). */
const COR_MODALIDADE: Record<string, string> = {
  individual: "var(--acao)",
  grupo: "var(--sucesso)",
  observacao_sala: "var(--atencao)",
  consultoria: "var(--info)",
};

function DiarioClientInner({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams?.get("student") || null;
  const router = useRouter();
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
        // Onda 16: um registro por vez; o servidor junta à lista sem apagar o de ninguém
        const res = await fetch(`/api/students/${student.id}/diario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registro: { ...reg, student_id: student.id } }),
        });
        if (res.ok) {
          setRefreshKey((k) => k + 1);
          router.refresh();
          return true;
        }
      } catch (e) {
        /* client-side */ console.error(e);
      }
      return false;
    },
    [student, router]
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
      const res = await fetch(`/api/students/${student.id}/diario?registro_id=${encodeURIComponent(registroId)}`, { method: "DELETE" }).catch(() => null);
      if (res?.ok) {
        setRefreshKey((k) => k + 1);
        router.refresh();
      }
      return !!res?.ok;
    },
    [student, registros, confirmar, router]
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

// Aba: Análise (filtros e números)
function FiltrosTab({ students, registros }: { students: Student[]; registros: RegistroDiario[] }) {
  const [filtroAluno, setFiltroAluno] = useState<string>("Todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("Todos");
  const [filtroModalidade, setFiltroModalidade] = useState<string[]>([]);

  const registrosFiltrados = registros.filter((r) => {
    if (filtroAluno !== "Todos" && r.student_id !== filtroAluno) return false;
    if (filtroPeriodo !== "Todos") {
      const data = lerData(r.data_sessao);
      if (!data) return false;
      const hoje = new Date();
      if (filtroPeriodo === "Últimos 7 dias") {
        const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (data < seteDiasAtras) return false;
      } else if (filtroPeriodo === "Últimos 30 dias") {
        const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (data < trintaDiasAtras) return false;
      } else if (filtroPeriodo === "Este mês") {
        // Onda 19: a opção existia mas não filtrava nada
        if (data.getFullYear() !== hoje.getFullYear() || data.getMonth() !== hoje.getMonth()) return false;
      }
    }
    if (filtroModalidade.length > 0 && !filtroModalidade.includes(r.modalidade_atendimento || "")) return false;
    return true;
  });

  const horas = Math.round(registrosFiltrados.reduce((acc, r) => acc + (r.duracao_minutos || 0), 0) / 60);
  const engajamentoMedio = registrosFiltrados.length > 0
    ? (registrosFiltrados.reduce((acc, r) => acc + (r.engajamento_aluno || 0), 0) / registrosFiltrados.length).toFixed(1).replace(".", ",")
    : "0";
  const numeros = [
    { valor: String(registrosFiltrados.length), rotulo: registrosFiltrados.length === 1 ? "Atendimento" : "Atendimentos" },
    { valor: String(horas), rotulo: "Horas de atendimento" },
    { valor: engajamentoMedio, rotulo: "Engajamento médio (1 a 5)" },
    { valor: String(new Set(registrosFiltrados.map((r) => r.student_id).filter(Boolean)).size), rotulo: "Estudantes" },
  ];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section className="omni-cartao" aria-labelledby="diario-filtros">
        <h2 id="diario-filtros" className="omni-cartao__titulo" style={{ marginTop: 0 }}>Filtrar atendimentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginTop: 12 }}>
          <div className="omni-campo">
            <label className="omni-campo__rotulo" htmlFor="diario-filtro-estudante">Estudante</label>
            <select id="diario-filtro-estudante" className="omni-entrada" value={filtroAluno} onChange={(e) => setFiltroAluno(e.target.value)}>
              <option value="Todos">Todos</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="omni-campo">
            <label className="omni-campo__rotulo" htmlFor="diario-filtro-periodo">Período</label>
            <select id="diario-filtro-periodo" className="omni-entrada" value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Últimos 7 dias">Últimos 7 dias</option>
              <option value="Últimos 30 dias">Últimos 30 dias</option>
              <option value="Este mês">Este mês</option>
            </select>
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            <legend className="omni-campo__rotulo" style={{ marginBottom: 6 }}>Como foi</legend>
            <div className="omni-escolhas" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {MODALIDADES.map((m) => (
                <label key={m.value} className="omni-chip">
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
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <section className="omni-cartao" aria-labelledby="diario-numeros">
        <h2 id="diario-numeros" className="omni-cartao__titulo" style={{ marginTop: 0 }}>Números do período</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginTop: 12 }} role="status">
          {numeros.map((n) => (
            <div key={n.rotulo} className="omni-cartao omni-cartao--plano" style={{ textAlign: "center", padding: 16 }}>
              <div style={{ font: "800 26px/32px var(--font-sans)", color: "var(--acao)", fontVariantNumeric: "tabular-nums" }}>{n.valor}</div>
              <div className="omni-apoio" style={{ marginTop: 4 }}>{n.rotulo}</div>
            </div>
          ))}
        </div>
      </section>
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
            <span className="omni-apoio">Para algo importante que ele precisa saber logo (mudança de comportamento, crise, um avanço). O professor recebe um aviso no sino, e o recado fica no PEI por 30 dias.</span>
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
    <section className="omni-cartao" aria-labelledby="diario-atendimentos">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 id="diario-atendimentos" className="omni-cartao__titulo" style={{ margin: 0 }}>Atendimentos</h2>
        <div style={{ display: "flex", gap: 4 }} role="group" aria-label="Como ver">
          <button type="button" className={`omni-btn omni-btn--pequeno ${viewMode === "timeline" ? "omni-btn--secundario" : "omni-btn--discreto"}`} aria-pressed={viewMode === "timeline"} onClick={() => setViewMode("timeline")}>Linha do tempo</button>
          <button type="button" className={`omni-btn omni-btn--pequeno ${viewMode === "lista" ? "omni-btn--secundario" : "omni-btn--discreto"}`} aria-pressed={viewMode === "lista"} onClick={() => setViewMode("lista")}>Lista</button>
        </div>
      </div>
      {registros.length === 0 ? (
        <p className="omni-apoio" style={{ marginTop: 16, padding: 16, textAlign: "center", border: "1.5px dashed var(--borda-forte)", borderRadius: "var(--o-radius-md)" }}>
          Nenhum atendimento registrado ainda. O primeiro que você registrar aparece aqui.
        </p>
      ) : viewMode === "lista" ? (
        <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 12 }}>
          {registros.map((r, i) => (
            <li key={r.registro_id || `temp-${i}`}>
              <RegistroCard
                registro={r}
                onDelete={() => r.registro_id && onDelete(r.registro_id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ marginTop: 20 }}>
          <TimelineView registros={registros} onDelete={onDelete} />
        </div>
      )}
    </section>
  );
}

// Linha do tempo
function TimelineView({
  registros,
  onDelete,
}: {
  registros: RegistroDiario[];
  onDelete: (id: string) => void;
}) {
  return (
    <ol style={{ position: "relative", listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 16 }}>
      {/* Linha vertical */}
      <span aria-hidden style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "var(--borda)" }} />
      {registros.map((r, idx) => {
        const modLabel = MODALIDADES.find((m) => m.value === r.modalidade_atendimento)?.label || r.modalidade_atendimento || "Sem modalidade";
        const data = lerData(r.data_sessao);
        const dataFormatada = data ? data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "Sem data";
        const engaj = r.engajamento_aluno || 0;

        return (
          <li key={r.registro_id || idx} style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 14 }}>
            {/* Ponto na linha do tempo */}
            <span aria-hidden style={{ position: "relative", zIndex: 1, flexShrink: 0, width: 16, height: 16, marginTop: 4, borderRadius: "50%", background: COR_MODALIDADE[r.modalidade_atendimento || ""] || "var(--tinta-3)", border: "3px solid var(--superficie)", boxShadow: "0 0 0 1px var(--borda)" }} />
            <div className="omni-cartao omni-cartao--plano" style={{ flex: 1, minWidth: 0, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                  <span style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{dataFormatada}</span>
                  <span className="omni-estado omni-estado--neutro">{modLabel}</span>
                </div>
                {r.registro_id && (
                  <button
                    type="button"
                    className="omni-btn omni-btn--discreto omni-btn--pequeno"
                    onClick={() => { if (r.registro_id) onDelete(r.registro_id); }}
                    aria-label={`Excluir atendimento de ${fmtData(r.data_sessao)}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                    Excluir
                  </button>
                )}
              </div>
              <dl style={{ margin: "8px 0 0", display: "grid", gap: 4, font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
                <div><dt style={{ display: "inline", fontWeight: 700, color: "var(--tinta)" }}>Duração: </dt><dd style={{ display: "inline", margin: 0 }}>{r.duracao_minutos || 0} minutos</dd></div>
                {engaj > 0 && (
                  <div><dt style={{ display: "inline", fontWeight: 700, color: "var(--tinta)" }}>Engajamento: </dt><dd style={{ display: "inline", margin: 0 }}>{ENGAJAMENTO_ROTULO[engaj - 1] || ""} ({engaj} de 5)</dd></div>
                )}
                {r.atividade_principal && (
                  <div><dt style={{ display: "inline", fontWeight: 700, color: "var(--tinta)" }}>O que foi feito: </dt><dd style={{ display: "inline", margin: 0 }}>{r.atividade_principal.substring(0, 100)}{r.atividade_principal.length > 100 ? "…" : ""}</dd></div>
                )}
                {r.competencias_trabalhadas && r.competencias_trabalhadas.length > 0 && (
                  <div><dt style={{ display: "inline", fontWeight: 700, color: "var(--tinta)" }}>Competências: </dt><dd style={{ display: "inline", margin: 0 }}>{r.competencias_trabalhadas.join(", ")}</dd></div>
                )}
              </dl>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function RegistroCard({ registro, onDelete }: { registro: RegistroDiario; onDelete: () => void }) {
  const [expand, setExpand] = useState(false);
  const modLabel = MODALIDADES.find((m) => m.value === registro.modalidade_atendimento)?.label || registro.modalidade_atendimento;
  const idDetalhe = `diario-reg-${registro.registro_id || registro.data_sessao || "x"}`;
  const linha = (rotulo: string, valor?: string) => valor ? (
    <div><strong style={{ color: "var(--tinta)" }}>{rotulo}:</strong> {valor}</div>
  ) : null;

  return (
    <div className="omni-cartao omni-cartao--plano" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 12px" }}>
        <button
          type="button"
          onClick={() => setExpand((x) => !x)}
          aria-expanded={expand}
          aria-controls={idDetalhe}
          style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, background: "none", border: 0, padding: "4px 0", textAlign: "left", cursor: "pointer", font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}
        >
          {expand ? <ChevronUp className="w-4 h-4" aria-hidden /> : <ChevronDown className="w-4 h-4" aria-hidden />}
          <span style={{ fontWeight: 700, color: "var(--tinta)" }}>{fmtData(registro.data_sessao)}</span>
          <span aria-hidden>·</span>
          <span>{modLabel}</span>
          <span aria-hidden>·</span>
          <span>{registro.duracao_minutos || 0} min</span>
        </button>
        <button
          type="button"
          className="omni-btn omni-btn--discreto omni-btn--pequeno"
          onClick={onDelete}
          aria-label={`Excluir atendimento de ${fmtData(registro.data_sessao)}`}
        >
          <Trash2 className="w-4 h-4" aria-hidden />
          Excluir
        </button>
      </div>
      {expand && (
        <div id={idDetalhe} style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--borda)", display: "grid", gap: 6, font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>
          {linha("O que foi feito", registro.atividade_principal)}
          {linha("Objetivos", registro.objetivos_trabalhados)}
          {linha("Estratégias", registro.estrategias_utilizadas)}
          {linha("Recursos", registro.recursos_materiais)}
          {linha("O que foi bem", registro.pontos_positivos)}
          {linha("Dificuldades", registro.dificuldades_identificadas)}
          {linha("Observações", registro.observacoes)}
          {linha("Próximos passos", registro.proximos_passos)}
        </div>
      )}
    </div>
  );
}

export function DiarioClient({ students, studentId, student }: Props) {
  return (
    <Suspense fallback={
      <p className="omni-apoio" role="status" style={{ padding: "32px 0", textAlign: "center" }}>Carregando…</p>
    }>
      <DiarioClientInner students={students} studentId={studentId} student={student} />
    </Suspense>
  );
}
