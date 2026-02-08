"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TIPOS_ACAO,
  PERFIS_ATENDIMENTO,
  type AcaoPGI,
  type DimensionamentoPGI,
} from "@/lib/pgi";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { Plus, User, Trash2, Save, MapPin, Calendar } from "lucide-react";

type TabId = "inicial" | "gerador";

export function PGIClient() {
  const [tab, setTab] = useState<TabId>("gerador");
  const [acoes, setAcoes] = useState<AcaoPGI[]>([]);
  const [dimensionamento, setDimensionamento] = useState<DimensionamentoPGI>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pgi");
      const data = await res.json();
      setAcoes(data.acoes ?? []);
      setDimensionamento(data.dimensionamento ?? {});
    } catch {
      setAcoes([]);
      setDimensionamento({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveData(nextAcoes: AcaoPGI[], nextDim?: DimensionamentoPGI) {
    try {
      const res = await fetch("/api/pgi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acoes: nextAcoes,
          dimensionamento: nextDim ?? dimensionamento,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setMessage({ type: "err", text: d.error || "Erro ao salvar." });
        return;
      }
      setAcoes(nextAcoes);
      if (nextDim) setDimensionamento(nextDim);
    } catch {
      setMessage({ type: "err", text: "Erro ao salvar." });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-amber-50/50 px-3 py-2 text-sm text-amber-800">
        <strong>Recurso destinado à gestão escolar</strong> — direção, coordenação pedagógica e equipe de planejamento.
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("inicial")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === "inicial"
              ? "bg-teal-50 text-teal-800 border border-slate-200 border-b-0 -mb-px"
              : "text-slate-600 hover:bg-slate-50"
            }`}
        >
          Inicial — Acolhimento
        </button>
        <button
          type="button"
          onClick={() => setTab("gerador")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === "gerador"
              ? "bg-teal-50 text-teal-800 border border-slate-200 border-b-0 -mb-px"
              : "text-slate-600 hover:bg-slate-50"
            }`}
        >
          Gerador — O Plano da Escola
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
        >
          {message.text}
        </div>
      )}

      {tab === "inicial" && <AcolhimentoTab />}
      {tab === "gerador" && (
        <GeradorTab
          acoes={acoes}
          dimensionamento={dimensionamento}
          loading={loading}
          onSave={saveData}
          onSuccess={() => setMessage({ type: "ok", text: "Plano atualizado." })}
          onError={(e) => setMessage({ type: "err", text: e })}
        />
      )}
    </div>
  );
}

function AcolhimentoTab() {
  return (
    <div className="prose prose-slate max-w-none space-y-6 text-sm">
      <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
        <h3 className="text-base font-semibold text-teal-800 mt-0">Acolhimento dos estudantes</h3>
        <p>
          A inclusão de estudantes com deficiência no ambiente escolar é um compromisso essencial. Todos os estudantes
          devem ser acolhidos em uma escola que não apenas os receba, mas os integre por meio de práticas pedagógicas
          significativas e inclusivas.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">Elementos fundamentais</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Políticas inclusivas:</strong> PPP que contemple a diversidade como valor essencial.</li>
          <li><strong>Ambientes acessíveis:</strong> rampas, banheiros adaptados, tecnologias assistivas.</li>
          <li><strong>Formação continuada:</strong> capacitação dos educadores para práticas inclusivas.</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">PGEI — Estrutura e equipe</h4>
        <p>
          O Plano Geral de Educação Inclusiva deve prever orientação educacional ou departamento de apoio. Equipe:
          orientadores, psicólogos, psicopedagogos, professores habilitados. Coordenação pedagógica na adaptação curricular.
        </p>
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">Salas Multifuncionais (SRM)</h4>
        <p>
          Decreto nº 6.571/2008: ambientes com equipamentos, mobiliários e materiais para o AEE. O trabalho nas SRM não
          substitui o das classes comuns — complementa e elimina obstáculos à plena participação.
        </p>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
        A escola <strong>não pode negar a matrícula</strong> aos alunos com deficiência (Lei 7.853/89). A matrícula é direito constitucional.
      </div>
    </div>
  );
}

function formatPGIText(acoes: AcaoPGI[], dim: DimensionamentoPGI): string {
  const parts: string[] = [];
  if (dim.n_total != null || dim.n_deficiencia != null || dim.n_prof != null) {
    parts.push("DIMENSIONAMENTO PRELIMINAR");
    parts.push(`Nº total de alunos: ${dim.n_total ?? "—"}`);
    parts.push(`Nº alunos com deficiência: ${dim.n_deficiencia ?? "—"}`);
    parts.push(`Nº profissionais inclusão: ${dim.n_prof ?? "—"}`);
    parts.push(`Horas/dia da equipe: ${dim.horas_dia ?? "—"}`);
    parts.push("");
  }
  parts.push("AÇÕES DO PLANO");
  parts.push("—".repeat(40));
  acoes.forEach((a, i) => {
    const [label] = TIPOS_ACAO[a.tipo] ?? ["—"];
    const prazoFmt = a.prazo ? new Date(a.prazo + "T12:00:00").toLocaleDateString("pt-BR") : "—";
    parts.push(`\n${i + 1}. [${label}] ${a.o_que}`);
    if (a.por_que) parts.push(`   POR QUE: ${a.por_que}`);
    if (a.quem) parts.push(`   QUEM: ${a.quem}`);
    if (a.onde) parts.push(`   ONDE: ${a.onde}`);
    if (a.como) parts.push(`   COMO: ${a.como}`);
    parts.push(`   PRAZO: ${prazoFmt}`);
    if (a.custo) parts.push(`   CUSTO: ${a.custo}`);
    if (a.perfil?.length) parts.push(`   PERFIS: ${a.perfil.join(", ")}`);
  });
  return parts.join("\n");
}

type GeradorTabProps = {
  acoes: AcaoPGI[];
  dimensionamento: DimensionamentoPGI;
  loading: boolean;
  onSave: (acoes: AcaoPGI[], dim?: DimensionamentoPGI) => Promise<void>;
  onSuccess: () => void;
  onError: (err: string) => void;
};

function GeradorTab({ acoes, dimensionamento, loading, onSave, onSuccess, onError }: GeradorTabProps) {
  const [tipo, setTipo] = useState("dimensionamento_pgei");
  const [oQue, setOQue] = useState("");
  const [porQue, setPorQue] = useState("");
  const [quem, setQuem] = useState("");
  const [onde, setOnde] = useState("");
  const [como, setComo] = useState("");
  const [prazo, setPrazo] = useState(() => new Date().toISOString().slice(0, 10));
  const [custo, setCusto] = useState("");
  const [perfil, setPerfil] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

  const [dimLocal, setDimLocal] = useState<DimensionamentoPGI>(dimensionamento);
  useEffect(() => {
    setDimLocal(dimensionamento);
  }, [dimensionamento]);

  const nTotal = dimLocal.n_total ?? 0;
  const nDef = dimLocal.n_deficiencia ?? 0;
  const nProf = dimLocal.n_prof ?? 0;
  const horasDia = dimLocal.horas_dia ?? 0;

  async function handleAddAcao(e: React.FormEvent) {
    e.preventDefault();
    if (!oQue.trim()) {
      onError("Informe a ação (O QUE) para cadastrar.");
      return;
    }
    setSaving(true);
    const nova: AcaoPGI = {
      tipo,
      o_que: oQue.trim(),
      por_que: porQue.trim() || undefined,
      quem: quem.trim() || undefined,
      onde: onde.trim() || undefined,
      como: como.trim() || undefined,
      prazo: prazo || undefined,
      custo: custo.trim() || undefined,
      perfil: perfil.length ? perfil : undefined,
      criado_em: new Date().toISOString(),
    };
    await onSave([...acoes, nova]);
    setOQue("");
    setPorQue("");
    setQuem("");
    setOnde("");
    setComo("");
    setCusto("");
    setPerfil([]);
    onSuccess();
    setSaving(false);
  }

  async function addRapida(oQueVal: string, porQueVal: string, tipoVal: string) {
    const nova: AcaoPGI = {
      tipo: tipoVal,
      o_que: oQueVal,
      por_que: porQueVal,
      criado_em: new Date().toISOString(),
    };
    await onSave([...acoes, nova]);
    onSuccess();
  }

  async function remover(i: number) {
    const next = acoes.filter((_, idx) => idx !== i);
    await onSave(next);
    setConfirmDel(null);
    onSuccess();
  }

  async function salvarDimensionamento(
    nTotalVal: number,
    nDefVal: number,
    nProfVal: number,
    horasVal: number
  ) {
    const dim = { n_total: nTotalVal, n_deficiencia: nDefVal, n_prof: nProfVal, horas_dia: horasVal };
    await onSave(acoes, dim);
    onSuccess();
  }

  return (
    <div className="space-y-6">
      {/* Dimensionamento */}
      <details className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
        <summary className="cursor-pointer font-medium text-slate-700">Dimensionamento preliminar (opcional)</summary>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Nº total de alunos</label>
            <input
              type="number"
              min={0}
              value={nTotal}
              onChange={(e) => setDimLocal((d) => ({ ...d, n_total: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Nº alunos com deficiência</label>
            <input
              type="number"
              min={0}
              value={nDef}
              onChange={(e) => setDimLocal((d) => ({ ...d, n_deficiencia: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Nº profissionais inclusão</label>
            <input
              type="number"
              min={0}
              value={nProf}
              onChange={(e) => setDimLocal((d) => ({ ...d, n_prof: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Horas/dia da equipe</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={horasDia}
              onChange={(e) => setDimLocal((d) => ({ ...d, horas_dia: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => salvarDimensionamento(nTotal, nDef, nProf, horasDia)}
          className="mt-2 px-3 py-1.5 text-sm bg-teal-100 text-teal-800 rounded-lg hover:bg-teal-200"
        >
          Salvar dimensionamento
        </button>
      </details>

      {/* Ações rápidas */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Ações sugeridas</p>
        <div className="flex flex-wrap gap-2">
          {[
            ["Contratar mediador adicional", "Insuficiência de mediadores", "dimensionamento_pgei"],
            ["Grupo enriquecimento altas habilidades", "Atendimento diferenciado", "dimensionamento_pgei"],
            ["Reorganizar rotina da equipe", "Otimização do dimensionamento", "dimensionamento_pgei"],
            ["Fluxo recepção família e documentação", "Garantir sigilo e disponibilizar", "comunicacao_procedimentos"],
            ["Equipar SRM com mesas adaptáveis", "Decreto 6.571/2008", "sala_multifuncional"],
            ["Alinhamento AEE + classe comum", "Coerência do programa", "comunicacao_procedimentos"],
          ].map(([oq, pq, t], i) => (
            <button
              key={i}
              type="button"
              onClick={() => addRapida(oq, pq, t)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              {oq}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleAddAcao} className="rounded-2xl bg-white p-6 space-y-4 min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
        <h4 className="font-semibold text-slate-800">Adicionar ação ao plano</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Tipo de ação</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              {Object.entries(TIPOS_ACAO).map(([k, [label]]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">O QUE (Ação prática) *</label>
            <input
              type="text"
              value={oQue}
              onChange={(e) => setOQue(e.target.value)}
              placeholder="Ex: Contratar mediador / Equipar SRM"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">POR QUE (Justificativa)</label>
            <textarea
              value={porQue}
              onChange={(e) => setPorQue(e.target.value)}
              rows={2}
              placeholder="Ex: Dimensionamento PGEI"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">QUEM (Responsável)</label>
            <input
              type="text"
              value={quem}
              onChange={(e) => setQuem(e.target.value)}
              placeholder="Ex: Coordenação pedagógica"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">ONDE (Local)</label>
            <input
              type="text"
              value={onde}
              onChange={(e) => setOnde(e.target.value)}
              placeholder="Ex: SRM, Bloco A"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">COMO (Método)</label>
            <input
              type="text"
              value={como}
              onChange={(e) => setComo(e.target.value)}
              placeholder="Ex: Palestra em HTPC"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">PRAZO</label>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">CUSTO (R$)</label>
            <input
              type="text"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              placeholder="Ex: 5.000,00"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Perfil de atendimento</label>
          <div className="flex flex-wrap gap-2">
            {PERFIS_ATENDIMENTO.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={perfil.includes(p)}
                  onChange={(e) =>
                    setPerfil((prev) =>
                      e.target.checked ? [...prev, p] : prev.filter((x) => x !== p)
                    )
                  }
                  className="rounded border-slate-300"
                />
                {p}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? "Salvando…" : (
            <>
              <Plus className="w-4 h-4 inline mr-1" />
              Adicionar ação ao plano
            </>
          )}
        </button>
      </form>

      {/* Lista de ações */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-slate-800">O Plano da Escola</h4>
          {acoes.length > 0 && (
            <PdfDownloadButton
              text={formatPGIText(acoes, dimLocal)}
              filename={`PGI_${new Date().toISOString().slice(0, 10)}.pdf`}
              title="Plano de Gestão Inclusiva (PGI)"
            />
          )}
        </div>
        {loading ? (
          <p className="text-slate-500">Carregando…</p>
        ) : acoes.length === 0 ? (
          <p className="text-slate-500 p-4 bg-slate-50 rounded-lg">Nenhuma ação cadastrada. Use o formulário ou os botões acima.</p>
        ) : (
          <div className="space-y-4">
            {acoes.map((a, i) => {
              const [label] = TIPOS_ACAO[a.tipo] ?? ["—"];
              const prazoFmt = a.prazo
                ? new Date(a.prazo + "T12:00:00").toLocaleDateString("pt-BR")
                : "—";
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800 mb-2">
                      {label.split(" (")[0]}
                    </span>
                    <p className="font-medium text-slate-800">{a.o_que}</p>
                    {a.por_que && (
                      <p className="text-sm text-slate-500 mt-1">{a.por_que}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {a.quem || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {a.onde || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {prazoFmt}
                      </span>
                      <span>💰 {a.custo || "—"}</span>
                    </div>
                    {a.perfil?.length ? (
                      <p className="text-xs text-slate-500 mt-1">Perfis: {a.perfil.join(", ")}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0">
                    {confirmDel === i ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => remover(i)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDel(null)}
                          className="px-2 py-1 text-xs border border-slate-200 rounded"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDel(i)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
