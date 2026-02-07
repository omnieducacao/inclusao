"use client";

import { useState, useCallback, useEffect } from "react";
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
import { LISTAS_BARREIRAS, NIVEIS_SUPORTE } from "@/lib/pei";
import { Map, AlertTriangle, Target, Puzzle, Users } from "lucide-react";

type Student = { id: string; name: string };
type StudentFull = Student & {
  grade?: string | null;
  diagnosis?: string | null;
  pei_data?: Record<string, unknown>;
  paee_ciclos?: CicloPAEE[];
  planejamento_ativo?: string | null;
  paee_data?: Record<string, unknown>;
};

type Props = {
  students: Student[];
  studentId: string | null;
  student: StudentFull | null;
};

type TabId = "mapear-barreiras" | "plano-habilidades" | "tec-assistiva" | "articulacao" | "planejamento" | "execucao" | "jornada";

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
  const [paeeData, setPaeeData] = useState<Record<string, unknown>>({});

  const ciclos = (student?.paee_ciclos || []) as CicloPAEE[];

  // Carregar dados do PAEE quando o estudante mudar
  useEffect(() => {
    if (student?.paee_data) {
      setPaeeData(student.paee_data);
    } else {
      setPaeeData({});
    }
  }, [student?.id, student?.paee_data]);
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white min-h-[140px]">
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

      {/* Tabs Navigation - 7 abas */}
      <div className="border-b border-slate-200 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("mapear-barreiras")}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
              activeTab === "mapear-barreiras"
                ? "bg-violet-100 text-violet-800 border border-slate-200 border-b-white -mb-px"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Mapear Barreiras
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("plano-habilidades")}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
              activeTab === "plano-habilidades"
                ? "bg-violet-100 text-violet-800 border border-slate-200 border-b-white -mb-px"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Plano de Habilidades
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tec-assistiva")}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
              activeTab === "tec-assistiva"
                ? "bg-violet-100 text-violet-800 border border-slate-200 border-b-white -mb-px"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Tec. Assistiva
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("articulacao")}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
              activeTab === "articulacao"
                ? "bg-violet-100 text-violet-800 border border-slate-200 border-b-white -mb-px"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Articulação
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("planejamento")}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
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
            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
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
            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
              activeTab === "jornada"
                ? "bg-violet-100 text-violet-800 border border-slate-200 border-b-white -mb-px"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Jornada Gamificada
          </button>
        </div>
      </div>

      {activeTab === "mapear-barreiras" && (
        <MapearBarreirasTab
          paeeData={paeeData}
          onUpdate={(data) => {
            setPaeeData(data);
            if (student?.id) {
              fetch(`/api/students/${student.id}/paee`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paee_data: data }),
              }).catch(console.error);
            }
          }}
        />
      )}

      {activeTab === "plano-habilidades" && (
        <PlanoHabilidadesTab
          paeeData={paeeData}
          onUpdate={(data) => {
            setPaeeData(data);
            if (student?.id) {
              fetch(`/api/students/${student.id}/paee`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paee_data: data }),
              }).catch(console.error);
            }
          }}
        />
      )}

      {activeTab === "tec-assistiva" && (
        <TecAssistivaTab
          paeeData={paeeData}
          onUpdate={(data) => {
            setPaeeData(data);
            if (student?.id) {
              fetch(`/api/students/${student.id}/paee`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paee_data: data }),
              }).catch(console.error);
            }
          }}
        />
      )}

      {activeTab === "articulacao" && (
        <ArticulacaoTab
          paeeData={paeeData}
          onUpdate={(data) => {
            setPaeeData(data);
            if (student?.id) {
              fetch(`/api/students/${student.id}/paee`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paee_data: data }),
              }).catch(console.error);
            }
          }}
        />
      )}

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
    <div className="space-y-4 p-6 rounded-xl border-2 border-slate-200 bg-white min-h-[200px]">
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
                {mapaLoading ? "Gerando…" : (
                  <>
                    <Map className="w-4 h-4 inline mr-1" />
                    Gerar mapa mental
                  </>
                )}
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

// Aba: Mapear Barreiras
function MapearBarreirasTab({
  paeeData,
  onUpdate,
}: {
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const barreiras = (paeeData.barreiras_selecionadas || {}) as Record<string, string[]>;
  const niveis = (paeeData.niveis_suporte || {}) as Record<string, string>;
  const obs = (paeeData.observacoes_barreiras || {}) as Record<string, string>;

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  return (
    <div className="space-y-6 p-6 rounded-xl border-2 border-slate-200 bg-white min-h-[200px]">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-violet-600" />
        <h3 className="text-xl font-bold text-slate-800">Mapear Barreiras</h3>
      </div>
      <p className="text-sm text-slate-600 mb-6">
        Identifique e mapeie as barreiras específicas encontradas no contexto do AEE. Para cada barreira selecionada, indique o nível de apoio necessário.
      </p>

      {Object.entries(LISTAS_BARREIRAS).map(([dominio, opcoes]) => {
        const selecionadas = barreiras[dominio] || [];
        return (
          <div
            key={dominio}
            className={`p-4 rounded-lg border-2 ${
              selecionadas.length > 0 ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200 bg-white"
            } transition-all`}
          >
            <h5 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <strong>{dominio}</strong>
              {selecionadas.length > 0 && (
                <span className="text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {selecionadas.length} selecionada{selecionadas.length > 1 ? "s" : ""}
                </span>
              )}
            </h5>

            <div className="space-y-2 mb-4">
              {opcoes.map((b) => {
                const estaSelecionada = selecionadas.includes(b);
                return (
                  <label
                    key={b}
                    className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${
                      estaSelecionada
                        ? "bg-emerald-50 border-2 border-emerald-300 shadow-sm"
                        : "hover:bg-slate-50 border-2 border-transparent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={estaSelecionada}
                      onChange={(e) => {
                        const novas = e.target.checked
                          ? [...selecionadas, b]
                          : selecionadas.filter((item) => item !== b);
                        const novasBarreiras = { ...barreiras, [dominio]: novas };
                        updateField("barreiras_selecionadas", novasBarreiras);

                        if (!e.target.checked) {
                          const chave = `${dominio}_${b}`;
                          const novosNiveis = { ...niveis };
                          delete novosNiveis[chave];
                          updateField("niveis_suporte", novosNiveis);
                        }
                      }}
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <span className={`text-sm ${estaSelecionada ? "text-emerald-900 font-medium" : "text-slate-700"}`}>
                      {b}
                    </span>
                  </label>
                );
              })}
            </div>

            {selecionadas.length > 0 && (
              <>
                <hr className="my-4 border-slate-300" />
                <h6 className="text-sm font-semibold text-slate-700 mb-2">Nível de apoio por barreira</h6>
                <p className="text-xs text-slate-500 mb-4">
                  Escala: Autônomo (faz sozinho) → Monitorado → Substancial → Muito Substancial (suporte intenso/contínuo).
                </p>
                <div className="space-y-4">
                  {selecionadas.map((b) => {
                    const chave = `${dominio}_${b}`;
                    const nivelAtual = niveis[chave] || "Monitorado";
                    const nivelIndex = NIVEIS_SUPORTE.indexOf(nivelAtual);
                    return (
                      <div key={b} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="mb-2">
                          <strong className="text-sm text-slate-800">{b}</strong>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max={NIVEIS_SUPORTE.length - 1}
                            value={nivelIndex}
                            onChange={(e) => {
                              const novoNivel = NIVEIS_SUPORTE[parseInt(e.target.value)];
                              updateField("niveis_suporte", { ...niveis, [chave]: novoNivel });
                            }}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                            style={{
                              background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(nivelIndex / (NIVEIS_SUPORTE.length - 1)) * 100}%, #e2e8f0 ${(nivelIndex / (NIVEIS_SUPORTE.length - 1)) * 100}%, #e2e8f0 100%)`,
                            }}
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-violet-700 bg-violet-100 px-2 py-1 rounded">
                              {nivelAtual}
                            </span>
                            <div className="flex gap-1 text-[10px] text-slate-500">
                              {NIVEIS_SUPORTE.map((n, idx) => (
                                <span key={n} className={idx === nivelIndex ? "font-bold text-violet-600" : ""}>
                                  {n.slice(0, 3)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {nivelAtual === "Autônomo" && "Realiza sem mediação"}
                            {nivelAtual === "Monitorado" && "Precisa de checagens"}
                            {nivelAtual === "Substancial" && "Precisa de mediação frequente"}
                            {nivelAtual === "Muito Substancial" && "Precisa de suporte intenso/contínuo"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Observações (opcional)</label>
              <textarea
                value={obs[dominio] || ""}
                onChange={(e) => updateField("observacoes_barreiras", { ...obs, [dominio]: e.target.value })}
                placeholder="Ex.: quando ocorre, gatilhos, o que ajuda, o que piora, estratégias que já funcionam..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Aba: Plano de Habilidades
function PlanoHabilidadesTab({
  paeeData,
  onUpdate,
}: {
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const habilidades = (paeeData.habilidades_plano || []) as Array<{
    id: string;
    habilidade: string;
    objetivo: string;
    estrategias: string;
    prazo: string;
    status: string;
  }>;
  const [novaHabilidade, setNovaHabilidade] = useState("");
  const [novoObjetivo, setNovoObjetivo] = useState("");
  const [novaEstrategia, setNovaEstrategia] = useState("");
  const [novoPrazo, setNovoPrazo] = useState("");

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const adicionarHabilidade = () => {
    if (!novaHabilidade.trim()) return;
    const nova = {
      id: crypto.randomUUID(),
      habilidade: novaHabilidade,
      objetivo: novoObjetivo,
      estrategias: novaEstrategia,
      prazo: novoPrazo,
      status: "em_andamento",
    };
    updateField("habilidades_plano", [...habilidades, nova]);
    setNovaHabilidade("");
    setNovoObjetivo("");
    setNovaEstrategia("");
    setNovoPrazo("");
  };

  const removerHabilidade = (id: string) => {
    updateField("habilidades_plano", habilidades.filter((h) => h.id !== id));
  };

  const atualizarHabilidade = (id: string, campo: string, valor: string) => {
    updateField(
      "habilidades_plano",
      habilidades.map((h) => (h.id === id ? { ...h, [campo]: valor } : h))
    );
  };

  return (
    <div className="space-y-6 p-6 rounded-xl border-2 border-slate-200 bg-white min-h-[200px]">
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-6 h-6 text-violet-600" />
        <h3 className="text-xl font-bold text-slate-800">Plano de Habilidades</h3>
      </div>
      <p className="text-sm text-slate-600 mb-6">
        Elabore um plano detalhado para o desenvolvimento de habilidades específicas do estudante no contexto do AEE.
      </p>

      <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50">
        <h4 className="font-semibold text-slate-800 mb-3">Adicionar Nova Habilidade</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Habilidade</label>
            <input
              type="text"
              value={novaHabilidade}
              onChange={(e) => setNovaHabilidade(e.target.value)}
              placeholder="Ex.: Leitura e compreensão de textos"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo</label>
            <input
              type="text"
              value={novoObjetivo}
              onChange={(e) => setNovoObjetivo(e.target.value)}
              placeholder="Ex.: Melhorar a compreensão leitora"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estratégias</label>
            <textarea
              value={novaEstrategia}
              onChange={(e) => setNovaEstrategia(e.target.value)}
              placeholder="Descreva as estratégias a serem utilizadas"
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prazo</label>
              <input
                type="date"
                value={novoPrazo}
                onChange={(e) => setNovoPrazo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={adicionarHabilidade}
                className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-slate-800">Habilidades Planejadas</h4>
        {habilidades.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhuma habilidade adicionada ainda.</p>
        ) : (
          habilidades.map((h) => (
            <div key={h.id} className="p-4 rounded-lg border-2 border-slate-200 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h5 className="font-semibold text-slate-800">{h.habilidade}</h5>
                  <p className="text-sm text-slate-600 mt-1">{h.objetivo}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removerHabilidade(h.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remover
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Estratégias</label>
                  <textarea
                    value={h.estrategias}
                    onChange={(e) => atualizarHabilidade(h.id, "estrategias", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Prazo</label>
                    <input
                      type="date"
                      value={h.prazo}
                      onChange={(e) => atualizarHabilidade(h.id, "prazo", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={h.status}
                      onChange={(e) => atualizarHabilidade(h.id, "status", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluida">Concluída</option>
                      <option value="pausada">Pausada</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Aba: Tecnologias Assistivas
function TecAssistivaTab({
  paeeData,
  onUpdate,
}: {
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const tecnologias = (paeeData.tecnologias_assistivas || []) as Array<{
    id: string;
    tipo: string;
    nome: string;
    descricao: string;
    fornecedor: string;
    status: string;
  }>;
  const [novoTipo, setNovoTipo] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoFornecedor, setNovoFornecedor] = useState("");

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const tiposTA = [
    "Comunicação Alternativa",
    "Acessibilidade Digital",
    "Mobilidade",
    "Visão",
    "Audição",
    "Cognição",
    "Outros",
  ];

  const adicionarTA = () => {
    if (!novoNome.trim()) return;
    const nova = {
      id: crypto.randomUUID(),
      tipo: novoTipo || "Outros",
      nome: novoNome,
      descricao: novaDescricao,
      fornecedor: novoFornecedor,
      status: "solicitada",
    };
    updateField("tecnologias_assistivas", [...tecnologias, nova]);
    setNovoTipo("");
    setNovoNome("");
    setNovaDescricao("");
    setNovoFornecedor("");
  };

  const removerTA = (id: string) => {
    updateField("tecnologias_assistivas", tecnologias.filter((t) => t.id !== id));
  };

  const atualizarTA = (id: string, campo: string, valor: string) => {
    updateField(
      "tecnologias_assistivas",
      tecnologias.map((t) => (t.id === id ? { ...t, [campo]: valor } : t))
    );
  };

  return (
    <div className="space-y-6 p-6 rounded-xl border-2 border-slate-200 bg-white min-h-[200px]">
      <div className="flex items-center gap-3 mb-4">
        <Puzzle className="w-6 h-6 text-violet-600" />
        <h3 className="text-xl font-bold text-slate-800">Tecnologias Assistivas</h3>
      </div>
      <p className="text-sm text-slate-600 mb-6">
        Registre e gerencie as tecnologias assistivas necessárias para o estudante no contexto do AEE.
      </p>

      <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50">
        <h4 className="font-semibold text-slate-800 mb-3">Adicionar Tecnologia Assistiva</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="">Selecione</option>
                {tiposTA.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome/Modelo</label>
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex.: Software de leitura de tela"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              placeholder="Descreva a tecnologia e como será utilizada"
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedor/Origem</label>
              <input
                type="text"
                value={novoFornecedor}
                onChange={(e) => setNovoFornecedor(e.target.value)}
                placeholder="Ex.: Secretaria de Educação"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={adicionarTA}
                className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-slate-800">Tecnologias Assistivas Registradas</h4>
        {tecnologias.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhuma tecnologia assistiva registrada ainda.</p>
        ) : (
          tecnologias.map((t) => (
            <div key={t.id} className="p-4 rounded-lg border-2 border-slate-200 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-violet-600 bg-violet-100 px-2 py-0.5 rounded">
                      {t.tipo}
                    </span>
                    <h5 className="font-semibold text-slate-800">{t.nome}</h5>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{t.descricao}</p>
                  {t.fornecedor && (
                    <p className="text-xs text-slate-500 mt-1">Fornecedor: {t.fornecedor}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removerTA(t.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remover
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={t.status}
                  onChange={(e) => atualizarTA(t.id, "status", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="solicitada">Solicitada</option>
                  <option value="em_avaliacao">Em Avaliação</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="disponivel">Disponível</option>
                  <option value="em_uso">Em Uso</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Aba: Articulação
function ArticulacaoTab({
  paeeData,
  onUpdate,
}: {
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const articulacoes = (paeeData.articulacoes || []) as Array<{
    id: string;
    tipo: string;
    profissional: string;
    contato: string;
    responsabilidades: string;
    frequencia: string;
    observacoes: string;
  }>;
  const [novoTipo, setNovoTipo] = useState("");
  const [novoProfissional, setNovoProfissional] = useState("");
  const [novoContato, setNovoContato] = useState("");
  const [novasResponsabilidades, setNovasResponsabilidades] = useState("");
  const [novaFrequencia, setNovaFrequencia] = useState("");
  const [novasObservacoes, setNovasObservacoes] = useState("");

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const tiposArticulacao = [
    "Professor AEE",
    "Professor Regente",
    "Coordenador Pedagógico",
    "Diretor",
    "Psicólogo Escolar",
    "Fonoaudiólogo",
    "Terapeuta Ocupacional",
    "Família",
    "Outros Profissionais",
  ];

  const adicionarArticulacao = () => {
    if (!novoProfissional.trim()) return;
    const nova = {
      id: crypto.randomUUID(),
      tipo: novoTipo || "Outros Profissionais",
      profissional: novoProfissional,
      contato: novoContato,
      responsabilidades: novasResponsabilidades,
      frequencia: novaFrequencia,
      observacoes: novasObservacoes,
    };
    updateField("articulacoes", [...articulacoes, nova]);
    setNovoTipo("");
    setNovoProfissional("");
    setNovoContato("");
    setNovasResponsabilidades("");
    setNovaFrequencia("");
    setNovasObservacoes("");
  };

  const removerArticulacao = (id: string) => {
    updateField("articulacoes", articulacoes.filter((a) => a.id !== id));
  };

  const atualizarArticulacao = (id: string, campo: string, valor: string) => {
    updateField(
      "articulacoes",
      articulacoes.map((a) => (a.id === id ? { ...a, [campo]: valor } : a))
    );
  };

  return (
    <div className="space-y-6 p-6 rounded-xl border-2 border-slate-200 bg-white min-h-[200px]">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-violet-600" />
        <h3 className="text-xl font-bold text-slate-800">Articulação</h3>
      </div>
      <p className="text-sm text-slate-600 mb-6">
        Registre e gerencie a articulação entre diferentes profissionais e serviços envolvidos no atendimento do estudante no AEE.
      </p>

      <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50">
        <h4 className="font-semibold text-slate-800 mb-3">Adicionar Articulação</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Profissional/Serviço</label>
              <select
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="">Selecione</option>
                {tiposArticulacao.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Profissional</label>
              <input
                type="text"
                value={novoProfissional}
                onChange={(e) => setNovoProfissional(e.target.value)}
                placeholder="Ex.: Maria Silva"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contato</label>
            <input
              type="text"
              value={novoContato}
              onChange={(e) => setNovoContato(e.target.value)}
              placeholder="Ex.: email@escola.com.br ou (11) 99999-9999"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Responsabilidades</label>
            <textarea
              value={novasResponsabilidades}
              onChange={(e) => setNovasResponsabilidades(e.target.value)}
              placeholder="Descreva as responsabilidades deste profissional/serviço"
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frequência de Articulação</label>
              <input
                type="text"
                value={novaFrequencia}
                onChange={(e) => setNovaFrequencia(e.target.value)}
                placeholder="Ex.: Semanal, Quinzenal, Mensal"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={adicionarArticulacao}
                className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Adicionar
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea
              value={novasObservacoes}
              onChange={(e) => setNovasObservacoes(e.target.value)}
              placeholder="Observações adicionais sobre a articulação"
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-slate-800">Articulações Registradas</h4>
        {articulacoes.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhuma articulação registrada ainda.</p>
        ) : (
          articulacoes.map((a) => (
            <div key={a.id} className="p-4 rounded-lg border-2 border-slate-200 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-violet-600 bg-violet-100 px-2 py-0.5 rounded">
                      {a.tipo}
                    </span>
                    <h5 className="font-semibold text-slate-800">{a.profissional}</h5>
                  </div>
                  {a.contato && <p className="text-sm text-slate-600 mt-1">Contato: {a.contato}</p>}
                  {a.responsabilidades && (
                    <p className="text-sm text-slate-600 mt-1">Responsabilidades: {a.responsabilidades}</p>
                  )}
                  {a.frequencia && (
                    <p className="text-xs text-slate-500 mt-1">Frequência: {a.frequencia}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removerArticulacao(a.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remover
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Observações</label>
                <textarea
                  value={a.observacoes}
                  onChange={(e) => atualizarArticulacao(a.id, "observacoes", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
