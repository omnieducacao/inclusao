"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";
import { EngineSelector } from "@/components/EngineSelector";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import type { CicloPAEE, MetaPei, ConfigCiclo } from "@/lib/paee";
import type { EngineId } from "@/lib/ai-engines";
import {
  extrairMetasDoPei,
  criarCronogramaBasico,
  fmtDataIso,
  badgeStatus,
  FREQUENCIAS,
} from "@/lib/paee";

type Student = { id: string; name: string };
type StudentFull = Student & {
  grade?: string | null;
  diagnosis?: string | null;
  pei_data?: Record<string, unknown>;
  paee_ciclos?: CicloPAEE[];
  planejamento_ativo?: string | null;
};

type Props = {
  students: Student[];
  studentId: string | null;
  student: StudentFull | null;
};

type TabId = "planejamento" | "execucao" | "jornada";

export function PAEEClient({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams.get("student");

  const [activeTab, setActiveTab] = useState<TabId>("planejamento");
  const [cicloSelecionadoPlanejamento, setCicloSelecionadoPlanejamento] = useState<CicloPAEE | null>(null);
  const [cicloSelecionadoExecucao, setCicloSelecionadoExecucao] = useState<CicloPAEE | null>(null);
  const [cicloPreview, setCicloPreview] = useState<CicloPAEE | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [jornadaEngine, setJornadaEngine] = useState<EngineId>("yellow");
  const [jornadaTexto, setJornadaTexto] = useState("");
  const [jornadaLoading, setJornadaLoading] = useState(false);
  const [jornadaErro, setJornadaErro] = useState<string | null>(null);

  const ciclos = (student?.paee_ciclos || []) as CicloPAEE[];
  const cicloAtivoId = student?.planejamento_ativo ?? null;
  const cicloAtivo = ciclos.find((c) => c.ciclo_id === cicloAtivoId) ?? null;

  const peiData = student?.pei_data || {};
  const metasPei = extrairMetasDoPei(peiData);

  const hiperfoco =
    (peiData.hiperfoco as string) || (peiData.interesses as string) || "Interesses gerais (A descobrir)";
  const diagnosis = (peiData.diagnostico as string) || student?.diagnosis || "Não informado";

  const saveCiclo = useCallback(
    async (ciclo: CicloPAEE) => {
      if (!student?.id) return false;
      setSaving(true);
      try {
        const ciclosAtualizados = [...ciclos];
        const cfg = ciclo.config_ciclo || {};
        const cicloComId = { ...ciclo, ciclo_id: ciclo.ciclo_id || crypto.randomUUID() };
        if (!ciclo.ciclo_id) {
          cicloComId.criado_em = new Date().toISOString();
          cicloComId.versao = 1;
          ciclosAtualizados.push(cicloComId);
        } else {
          const idx = ciclosAtualizados.findIndex((c) => c.ciclo_id === ciclo.ciclo_id);
          if (idx >= 0) {
            cicloComId.versao = (ciclosAtualizados[idx].versao || 1) + 1;
            cicloComId.atualizado_em = new Date().toISOString();
            ciclosAtualizados[idx] = cicloComId;
          } else {
            ciclosAtualizados.push(cicloComId);
          }
        }

        const res = await fetch(`/api/students/${student.id}/paee`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paee_ciclos: ciclosAtualizados,
            planejamento_ativo: cicloComId.ciclo_id,
            status_planejamento: cicloComId.status,
            data_inicio_ciclo: cfg.data_inicio ?? null,
            data_fim_ciclo: cfg.data_fim ?? null,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          setSaved(true);
          setCicloPreview(null);
          window.location.reload();
          return true;
        }
      } catch (e) {
        console.error("Erro ao salvar PAEE:", e);
      }
      setSaving(false);
      return false;
    },
    [student?.id, ciclos]
  );

  const definirCicloAtivo = useCallback(
    async (cicloId: string) => {
      if (!student?.id) return false;
      const ciclo = ciclos.find((c) => c.ciclo_id === cicloId);
      if (!ciclo) return false;
      const cfg = ciclo.config_ciclo || {};
      const res = await fetch(`/api/students/${student.id}/paee`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paee_ciclos: ciclos,
          planejamento_ativo: cicloId,
          status_planejamento: "ativo",
          data_inicio_ciclo: cfg.data_inicio ?? null,
          data_fim_ciclo: cfg.data_fim ?? null,
        }),
      });
      const data = await res.json();
      if (data.ok) window.location.reload();
      return data.ok;
    },
    [student?.id, ciclos]
  );

  const gerarPreviewPlanejamento = useCallback(
    (form: {
      duracao: number;
      frequencia: string;
      dataInicio: string;
      dataFim: string;
      foco: string;
      descricao: string;
      metasSelecionadas: MetaPei[];
    }) => {
      const cronograma = criarCronogramaBasico(form.duracao, form.metasSelecionadas);
      const ciclo: CicloPAEE = {
        ciclo_id: undefined,
        status: "rascunho",
        tipo: "planejamento_aee",
        config_ciclo: {
          duracao_semanas: form.duracao,
          frequencia: form.frequencia,
          foco_principal: form.foco,
          descricao: form.descricao,
          data_inicio: form.dataInicio,
          data_fim: form.dataFim,
          metas_selecionadas: form.metasSelecionadas,
        },
        recursos_incorporados: {},
        cronograma,
        versao: 1,
      };
      setCicloPreview(ciclo);
    },
    []
  );

  const gerarPreviewExecucao = useCallback(
    (form: {
      dataInicio: string;
      dataFim: string;
      foco: string;
      descricao: string;
      metasSelecionadas: MetaPei[];
    }) => {
      const duracao = Math.max(1, Math.floor((new Date(form.dataFim).getTime() - new Date(form.dataInicio).getTime()) / (7 * 24 * 60 * 60 * 1000)));
      const cronograma = criarCronogramaBasico(duracao, form.metasSelecionadas);
      const ciclo: CicloPAEE = {
        ciclo_id: undefined,
        status: "rascunho",
        tipo: "execucao_smart",
        config_ciclo: {
          foco_principal: form.foco,
          descricao: form.descricao,
          data_inicio: form.dataInicio,
          data_fim: form.dataFim,
          metas_selecionadas: form.metasSelecionadas,
        },
        recursos_incorporados: {},
        cronograma,
        versao: 1,
      };
      setCicloPreview(ciclo);
    },
    []
  );

  if (!currentId) {
    return (
      <div className="space-y-4">
        <StudentSelector students={students} currentId={currentId} placeholder="Selecione o estudante" />
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
          Selecione um estudante para visualizar e editar o PAEE.
        </div>
        <a href="/estudantes" className="text-sky-600 hover:underline text-sm">
          Ir para Estudantes
        </a>
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

  const ciclosPlanejamento = ciclos.filter((c) => c.tipo === "planejamento_aee");
  const ciclosExecucao = ciclos.filter((c) => c.tipo === "execucao_smart");
  const cicloAtivoPlanejamento = cicloAtivo?.tipo === "planejamento_aee" ? cicloAtivo : null;
  const cicloAtivoExecucao = cicloAtivo?.tipo === "execucao_smart" ? cicloAtivo : null;

  const cicloParaVerPlanejamento = cicloPreview?.tipo === "planejamento_aee" ? cicloPreview : cicloSelecionadoPlanejamento || cicloAtivoPlanejamento;
  const cicloParaVerExecucao = cicloPreview?.tipo === "execucao_smart" ? cicloPreview : cicloSelecionadoExecucao || cicloAtivoExecucao;

  return (
    <div className="space-y-6">
      <StudentSelector students={students} currentId={currentId} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</div>
          <div className="font-bold text-slate-800">{student.name}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Série</div>
          <div className="font-bold text-slate-800">{student.grade || "—"}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Diagnóstico</div>
          <div className="font-bold text-slate-800 truncate" title={diagnosis}>{diagnosis}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hiperfoco</div>
          <div className="font-bold text-slate-800 truncate" title={hiperfoco}>{hiperfoco}</div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("planejamento")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
            activeTab === "planejamento"
              ? "bg-violet-100 text-violet-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Planejamento AEE
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("execucao")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
            activeTab === "execucao"
              ? "bg-violet-100 text-violet-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Execução e Metas SMART
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("jornada")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
            activeTab === "jornada"
              ? "bg-violet-100 text-violet-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Jornada Gamificada
        </button>
      </div>

      {activeTab === "planejamento" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800">Histórico de ciclos</h3>
            {cicloAtivoPlanejamento && (
              <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
                <div className="text-sm font-semibold text-emerald-800">Ciclo ativo</div>
                <div className="text-slate-700 mt-1">
                  Foco: {cicloAtivoPlanejamento.config_ciclo?.foco_principal || "—"}
                </div>
                <div className="text-slate-600 text-sm">
                  {fmtDataIso(cicloAtivoPlanejamento.config_ciclo?.data_inicio)} → {fmtDataIso(cicloAtivoPlanejamento.config_ciclo?.data_fim)}
                </div>
              </div>
            )}
            {ciclosPlanejamento.length > 0 && (
              <select
                value={cicloSelecionadoPlanejamento?.ciclo_id || ""}
                onChange={(e) => {
                  const c = ciclosPlanejamento.find((x) => x.ciclo_id === e.target.value);
                  setCicloSelecionadoPlanejamento(c || null);
                  setCicloPreview(null);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="">Selecione um ciclo</option>
                {ciclosPlanejamento.map((c) => {
                  const [ic] = badgeStatus(c.status || "rascunho");
                  const cfg = c.config_ciclo || {};
                  return (
                    <option key={c.ciclo_id} value={c.ciclo_id}>
                      {ic} {cfg.foco_principal || "Ciclo"} • {fmtDataIso(cfg.data_inicio)} • v{c.versao || 1}
                    </option>
                  );
                })}
              </select>
            )}
            {ciclosPlanejamento.length > 0 && cicloSelecionadoPlanejamento?.ciclo_id && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => definirCicloAtivo(cicloSelecionadoPlanejamento.ciclo_id!)}
                  className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Definir como ativo
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3">Gerar novo ciclo</h3>
              <FormPlanejamento
                metasPei={metasPei}
                hiperfoco={hiperfoco}
                onGerar={gerarPreviewPlanejamento}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800">Visualização</h3>
            {cicloParaVerPlanejamento ? (
              <CicloCard ciclo={cicloParaVerPlanejamento} onSalvar={cicloPreview?.tipo === "planejamento_aee" ? () => saveCiclo(cicloParaVerPlanejamento) : undefined} saving={saving} onLimpar={() => setCicloPreview(null)} />
            ) : (
              <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                Selecione um ciclo ou gere um novo.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "execucao" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800">Ciclos de execução</h3>
            {ciclosExecucao.length > 0 && (
              <>
                <select
                  value={cicloSelecionadoExecucao?.ciclo_id || ""}
                  onChange={(e) => {
                    const c = ciclosExecucao.find((x) => x.ciclo_id === e.target.value);
                    setCicloSelecionadoExecucao(c || null);
                    setCicloPreview(null);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">Selecione um ciclo</option>
                  {ciclosExecucao.map((c) => {
                    const cfg = c.config_ciclo || {};
                    return (
                      <option key={c.ciclo_id} value={c.ciclo_id}>
                        {cfg.foco_principal || "Ciclo"} • {fmtDataIso(cfg.data_inicio)}
                      </option>
                    );
                  })}
                </select>
                {cicloSelecionadoExecucao?.ciclo_id && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => definirCicloAtivo(cicloSelecionadoExecucao.ciclo_id!)}
                      className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Definir como ativo
                    </button>
                  </div>
                )}
              </>
            )}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3">Gerar ciclo de execução</h3>
              <FormExecucao metasPei={metasPei} onGerar={gerarPreviewExecucao} />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800">Visualização</h3>
            {cicloParaVerExecucao ? (
              <CicloCard ciclo={cicloParaVerExecucao} onSalvar={cicloPreview?.tipo === "execucao_smart" ? () => saveCiclo(cicloParaVerExecucao) : undefined} saving={saving} onLimpar={() => setCicloPreview(null)} />
            ) : (
              <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                Gere um ciclo de execução à esquerda.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "jornada" && (
        <JornadaTab
          student={student}
          ciclos={ciclos}
          cicloAtivo={cicloAtivo}
          cicloSelecionadoPlanejamento={cicloSelecionadoPlanejamento}
          cicloSelecionadoExecucao={cicloSelecionadoExecucao}
          peiData={peiData}
          engine={jornadaEngine}
          onEngineChange={setJornadaEngine}
          texto={jornadaTexto}
          onTextoChange={setJornadaTexto}
          loading={jornadaLoading}
          onLoadingChange={setJornadaLoading}
          erro={jornadaErro}
          onErroChange={setJornadaErro}
        />
      )}
    </div>
  );
}

function JornadaTab({
  student,
  ciclos,
  cicloAtivo,
  cicloSelecionadoPlanejamento,
  cicloSelecionadoExecucao,
  peiData,
  engine,
  onEngineChange,
  texto,
  onTextoChange,
  loading,
  onLoadingChange,
  erro,
  onErroChange,
}: {
  student: StudentFull;
  ciclos: CicloPAEE[];
  cicloAtivo: CicloPAEE | null | undefined;
  cicloSelecionadoPlanejamento: CicloPAEE | null;
  cicloSelecionadoExecucao: CicloPAEE | null;
  peiData: Record<string, unknown>;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  texto: string;
  onTextoChange: (t: string) => void;
  loading: boolean;
  onLoadingChange: (l: boolean) => void;
  erro: string | null;
  onErroChange: (e: string | null) => void;
}) {
  const [origem, setOrigem] = useState<"ciclo" | "texto">("ciclo");
  const [mapaMental, setMapaMental] = useState<string | null>(null);
  const [mapaLoading, setMapaLoading] = useState(false);
  const [mapaErro, setMapaErro] = useState<string | null>(null);
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "Interesses gerais";

  const cicloPlanejamento = cicloSelecionadoPlanejamento || (cicloAtivo?.tipo === "planejamento_aee" ? cicloAtivo : ciclos.find((c) => c.tipo === "planejamento_aee"));
  const cicloExecucao = cicloSelecionadoExecucao || (cicloAtivo?.tipo === "execucao_smart" ? cicloAtivo : ciclos.find((c) => c.tipo === "execucao_smart"));
  const cicloParaJornada = cicloPlanejamento || cicloExecucao;
  const textoFonte = (peiData.ia_sugestao as string) || "";

  const gerar = async () => {
    onLoadingChange(true);
    onErroChange(null);
    try {
      const body: Record<string, unknown> = {
        origem,
        engine,
        estudante: {
          nome: student.name,
          serie: student.grade,
          hiperfoco,
        },
      };
      if (origem === "ciclo" && cicloParaJornada) {
        body.ciclo = cicloParaJornada;
      } else if (origem === "texto" && textoFonte.trim()) {
        body.texto_fonte = textoFonte;
      } else {
        onErroChange(origem === "ciclo" ? "Selecione ou gere um ciclo primeiro." : "O PEI precisa ter relatório da Consultoria IA (ia_sugestao).");
        return;
      }
      const res = await fetch("/api/paee/jornada-gamificada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar jornada.");
      onTextoChange(data.texto || "");
    } catch (e) {
      onErroChange(e instanceof Error ? e.message : "Erro ao gerar.");
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-white">
      <h3 className="font-bold text-slate-800">Jornada Gamificada</h3>
      <p className="text-sm text-slate-600">
        Transforme o planejamento ou o relatório do PEI em uma missão gamificada para o estudante e a família.
      </p>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Origem</label>
        <select value={origem} onChange={(e) => setOrigem(e.target.value as "ciclo" | "texto")} className="w-full max-w-xs px-3 py-2 border border-slate-200 rounded-lg">
          <option value="ciclo">Ciclo de planejamento/execução</option>
          <option value="texto">Relatório PEI (ia_sugestao)</option>
        </select>
      </div>
      <button
        type="button"
        onClick={gerar}
        disabled={loading || (origem === "ciclo" && !cicloParaJornada) || (origem === "texto" && !textoFonte.trim())}
        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? "Gerando…" : "✨ Gerar Jornada Gamificada"}
      </button>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {texto && (
        <div className="space-y-2">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-sm font-medium text-slate-700">Resultado</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  setMapaLoading(true);
                  setMapaErro(null);
                  try {
                    const res = await fetch("/api/paee/mapa-mental", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        texto,
                        nome: student.name,
                        hiperfoco,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Erro");
                    setMapaMental(data.image || null);
                  } catch (e) {
                    setMapaErro(e instanceof Error ? e.message : "Erro ao gerar mapa mental.");
                  } finally {
                    setMapaLoading(false);
                  }
                }}
                disabled={mapaLoading}
                className="px-3 py-1.5 bg-violet-100 text-violet-800 rounded-lg text-sm hover:bg-violet-200 disabled:opacity-50"
              >
                {mapaLoading ? "Gerando…" : "🗺️ Gerar mapa mental"}
              </button>
              <PdfDownloadButton
                text={texto}
                filename={`Jornada_${student.name.replace(/\s+/g, "_")}.pdf`}
                title={`Jornada - ${student.name}`}
              />
            </div>
          </div>
          {mapaErro && <p className="text-red-600 text-sm">{mapaErro}</p>}
          {mapaMental && (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <img src={mapaMental} alt="Mapa mental da jornada" className="max-w-full max-h-[400px] object-contain" />
            </div>
          )}
          <textarea
            value={texto}
            onChange={(e) => onTextoChange(e.target.value)}
            rows={14}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}

function FormPlanejamento({
  metasPei,
  hiperfoco,
  onGerar,
}: {
  metasPei: MetaPei[];
  hiperfoco: string;
  onGerar: (form: {
    duracao: number;
    frequencia: string;
    dataInicio: string;
    dataFim: string;
    foco: string;
    descricao: string;
    metasSelecionadas: MetaPei[];
  }) => void;
}) {
  const [duracao, setDuracao] = useState(12);
  const [frequencia, setFrequencia] = useState("2x_semana");
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().slice(0, 10));
  const [dataFim, setDataFim] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 84);
    return d.toISOString().slice(0, 10);
  });
  const [foco, setFoco] = useState(hiperfoco);
  const [descricao, setDescricao] = useState("");
  const [metasSel, setMetasSel] = useState<Record<string, boolean>>(
    Object.fromEntries(metasPei.map((m) => [m.id, true]))
  );

  const metasSelecionadas = metasPei.filter((m) => metasSel[m.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (metasSelecionadas.length === 0) return;
    onGerar({ duracao, frequencia, dataInicio, dataFim, foco, descricao, metasSelecionadas });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Metas do PEI</label>
        <div className="space-y-2 max-h-32 overflow-y-auto border border-slate-200 rounded p-2">
          {metasPei.map((m) => (
            <label key={m.id} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={metasSel[m.id] ?? true}
                onChange={(e) => setMetasSel((s) => ({ ...s, [m.id]: e.target.checked }))}
              />
              <span className="text-sm">{m.tipo}: {m.descricao.slice(0, 60)}…</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Duração (semanas)</label>
        <input type="number" min={4} max={24} value={duracao} onChange={(e) => setDuracao(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Frequência</label>
        <select value={frequencia} onChange={(e) => setFrequencia(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
          {FREQUENCIAS.map((f) => (
            <option key={f} value={f}>{f.replace("_", " ")}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data início</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data fim</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Foco principal</label>
        <input type="text" value={foco} onChange={(e) => setFoco(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" />
      </div>
      <button type="submit" disabled={metasSelecionadas.length === 0} className="px-4 py-2 bg-violet-600 text-white rounded-lg disabled:opacity-50">
        Gerar preview
      </button>
    </form>
  );
}

function FormExecucao({
  metasPei,
  onGerar,
}: {
  metasPei: MetaPei[];
  onGerar: (form: {
    dataInicio: string;
    dataFim: string;
    foco: string;
    descricao: string;
    metasSelecionadas: MetaPei[];
  }) => void;
}) {
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().slice(0, 10));
  const [dataFim, setDataFim] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 84);
    return d.toISOString().slice(0, 10);
  });
  const [foco, setFoco] = useState("Plano de ação AEE — execução e acompanhamento");
  const [descricao, setDescricao] = useState("");
  const [metasSel, setMetasSel] = useState<Record<string, boolean>>(
    Object.fromEntries(metasPei.map((m) => [m.id, true]))
  );

  const metasSelecionadas = metasPei.filter((m) => metasSel[m.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (metasSelecionadas.length === 0) return;
    onGerar({ dataInicio, dataFim, foco, descricao, metasSelecionadas });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Metas do PEI</label>
        <div className="space-y-2 max-h-32 overflow-y-auto border border-slate-200 rounded p-2">
          {metasPei.map((m) => (
            <label key={m.id} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={metasSel[m.id] ?? true}
                onChange={(e) => setMetasSel((s) => ({ ...s, [m.id]: e.target.checked }))}
              />
              <span className="text-sm">{m.tipo}: {m.descricao.slice(0, 60)}…</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data início</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data fim</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Foco</label>
        <input type="text" value={foco} onChange={(e) => setFoco(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" />
      </div>
      <button type="submit" disabled={metasSelecionadas.length === 0} className="px-4 py-2 bg-violet-600 text-white rounded-lg disabled:opacity-50">
        Gerar preview
      </button>
    </form>
  );
}

function CicloCard({
  ciclo,
  onSalvar,
  saving,
  onLimpar,
}: {
  ciclo: CicloPAEE;
  onSalvar?: () => void;
  saving: boolean;
  onLimpar: () => void;
}) {
  const cfg = ciclo.config_ciclo || {};
  const [ic, cor] = badgeStatus(ciclo.status || "rascunho");
  const cron = ciclo.cronograma;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center" style={{ borderLeft: `4px solid ${cor}` }}>
        <div>
          <div className="font-bold text-slate-800">{ic} {cfg.foco_principal || "Ciclo AEE"}</div>
          <div className="text-sm text-slate-500">
            {fmtDataIso(cfg.data_inicio)} → {fmtDataIso(cfg.data_fim)}
            {cfg.duracao_semanas && ` • ${cfg.duracao_semanas} sem`}
            {cfg.frequencia && ` • ${String(cfg.frequencia).replace("_", " ")}`}
          </div>
        </div>
        <span className="text-xs font-bold uppercase" style={{ color: cor }}>
          {ciclo.status || "rascunho"}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <details open>
          <summary className="font-medium text-slate-700 cursor-pointer">Metas</summary>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {(cfg.metas_selecionadas || []).map((m) => (
              <li key={m.id}>• {m.tipo}: {m.descricao}</li>
            ))}
          </ul>
        </details>
        {cron && (cron.fases?.length > 0 || cron.semanas?.length > 0) && (
          <details>
            <summary className="font-medium text-slate-700 cursor-pointer">Cronograma</summary>
            <div className="mt-2 text-sm text-slate-600 space-y-2">
              {cron.fases?.map((f, i) => (
                <div key={i}>
                  <strong>{f.nome}</strong>: {f.objetivo_geral}
                </div>
              ))}
              {cron.semanas?.slice(0, 4).map((s) => (
                <div key={s.numero}>
                  Semana {s.numero} — {s.tema}
                </div>
              ))}
              {(cron.semanas?.length || 0) > 4 && (
                <div className="text-slate-500">+{(cron.semanas?.length || 0) - 4} semanas</div>
              )}
            </div>
          </details>
        )}
      </div>
      {onSalvar && (
        <div className="p-4 border-t border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={onSalvar}
            disabled={saving}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar na nuvem"}
          </button>
          <button type="button" onClick={onLimpar} className="px-4 py-2 border border-slate-200 rounded-lg">
            Limpar
          </button>
        </div>
      )}
    </div>
  );
}
