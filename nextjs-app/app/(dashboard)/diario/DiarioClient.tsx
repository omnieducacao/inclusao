"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { getColorClasses } from "@/lib/colors";

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

  const [saving, setSaving] = useState(false);
  const [expandForm, setExpandForm] = useState(true);

  const peiData = student?.pei_data || {};
  const registros = (student?.daily_logs || []) as RegistroDiario[];
  const registrosOrdenados = [...registros].sort(
    (a, b) => (b.data_sessao || "").localeCompare(a.data_sessao || "")
  );

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
    async (registroId: string) => {
      if (!student?.id) return false;
      const lista = registros.filter((r) => r.registro_id !== registroId);
      const res = await fetch(`/api/students/${student.id}/diario`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daily_logs: lista }),
      });
      const data = await res.json();
      if (data.ok) window.location.reload();
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
          <p className="text-sm text-amber-700 mt-1">
            O estudante selecionado não foi encontrado neste workspace. Verifique se o estudante existe e se você tem acesso a ele.
          </p>
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 rounded-xl border-2 border-slate-200 min-h-[140px]" style={{ backgroundColor: getColorClasses("rose").bg }}>
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

      <details open={expandForm} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <summary
          className="px-4 py-3 cursor-pointer font-semibold text-slate-800"
          style={{ backgroundColor: getColorClasses("rose").bg }}
          onClick={() => setExpandForm((x) => !x)}
        >
          Nova sessão de AEE
        </summary>
        <div className="p-4 bg-white">
          <FormNovaSessao studentId={student.id} onSave={saveRegistro} saving={saving} />
        </div>
      </details>

      <div>
        <h3 className="font-bold text-slate-800 mb-3">Histórico de sessões</h3>
        {registrosOrdenados.length === 0 ? (
          <div className="p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white text-slate-500 min-h-[180px]">
            Nenhum registro ainda. Preencha o formulário acima para criar o primeiro.
          </div>
        ) : (
          <div className="space-y-3">
            {registrosOrdenados.map((r) => (
              <RegistroCard
                key={r.registro_id || Math.random()}
                registro={r}
                onDelete={() => r.registro_id && deleteRegistro(r.registro_id)}
              />
            ))}
          </div>
        )}
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
