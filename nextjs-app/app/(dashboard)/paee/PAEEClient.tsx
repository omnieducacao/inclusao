"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";
import { EngineSelector } from "@/components/EngineSelector";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { getColorClasses } from "@/lib/colors";
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
import { Map, AlertTriangle, Target, Puzzle, Users, Search } from "lucide-react";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";

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
  const [jornadaEngine, setJornadaEngine] = useState<EngineId>("red");
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

  if (!student && studentId) {
    return (
      <div className="space-y-4">
        <StudentSelector students={students} currentId={currentId} />
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 font-medium">Estudante não encontrado</p>
          <p className="text-sm text-amber-700 mt-1">
            O estudante selecionado não foi encontrado neste workspace. Verifique se o estudante existe e se você tem acesso a ele.
          </p>
          {students.length > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              Estudantes disponíveis neste workspace: {students.length}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="space-y-4">
        <StudentSelector students={students} currentId={currentId} />
        <div className="text-slate-500 text-center py-8">
          Selecione um estudante para visualizar o PAEE.
        </div>
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

      {student && (
        <PEISummaryPanel peiData={peiData} studentName={student.name} />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl border-2 border-slate-200 min-h-[140px]" style={{ backgroundColor: getColorClasses("violet").bg }}>
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
          student={student}
          peiData={peiData}
          diagnosis={diagnosis}
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
          student={student}
          peiData={peiData}
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
          student={student}
          peiData={peiData}
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
          student={student}
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
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">📋 Planejamento AEE</h3>
            <p className="text-sm text-slate-700">
              <strong>Documento de referência:</strong> Registro pedagógico do ciclo de atendimento com objetivos, período, recursos e cronograma geral em <strong>fases</strong> (visão macro). Use "Definir como ciclo ativo" para referência em outras abas.
            </p>
            <p className="text-xs text-slate-600 mt-2">
              💡 Para metas SMART, acompanhamento por semanas e Jornada Gamificada, use a aba <strong>Execução e Metas SMART</strong>.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Histórico de ciclos de planejamento</h3>
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
        </div>
      )}

      {activeTab === "execucao" && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">🎯 Execução e Metas SMART</h3>
            <p className="text-sm text-slate-700">
              <strong>Norteador operacional:</strong> Plano de execução e acompanhamento com metas desdobradas em SMART, ações por <strong>semana</strong> e registro do que foi cumprido. Este ciclo alimenta a <strong>Jornada Gamificada</strong> do estudante.
            </p>
            <p className="text-xs text-slate-600 mt-2">
              💡 Para documento de planejamento geral (objetivos, período, recursos, cronograma em fases), use a aba <strong>Planejamento AEE</strong>.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Histórico de ciclos de execução</h3>
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
          engine={jornadaEngine}
          onEngineChange={setJornadaEngine}
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
  paeeData,
  onUpdate,
  engine,
  onEngineChange,
}: {
  student: StudentFull;
  ciclos: CicloPAEE[];
  cicloAtivo: CicloPAEE | null | undefined;
  cicloSelecionadoPlanejamento: CicloPAEE | null;
  cicloSelecionadoExecucao: CicloPAEE | null;
  peiData: Record<string, unknown>;
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
}) {
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "Interesses gerais";
  
  // Opções de origem
  const opcoesOrigem = [
    { value: "ciclo", label: "Execução e Metas SMART (ciclo)" },
    { value: "barreiras", label: "Mapear Barreiras" },
    { value: "plano-habilidades", label: "Plano de Habilidades" },
    { value: "tecnologia-assistiva", label: "Tecnologia Assistiva" },
  ];

  const [origemSelecionada, setOrigemSelecionada] = useState("ciclo");
  const [estilo, setEstilo] = useState("");
  const [texto, setTexto] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "ajustando" | "aprovado">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [mapaMental, setMapaMental] = useState<string | null>(null);
  const [mapaLoading, setMapaLoading] = useState(false);
  const [mapaErro, setMapaErro] = useState<string | null>(null);
  const [usarHiperfocoTema, setUsarHiperfocoTema] = useState(true);
  const [temaMapa, setTemaMapa] = useState(hiperfoco);

  // Ciclo de execução para usar na jornada
  const cicloExecucao = cicloSelecionadoExecucao || (cicloAtivo?.tipo === "execucao_smart" ? cicloAtivo : ciclos.find((c) => c.tipo === "execucao_smart"));
  
  // Conteúdos das outras abas
  const conteudoBarreiras = (paeeData.conteudo_diagnostico_barreiras as string) || "";
  const conteudoPlano = (paeeData.conteudo_plano_habilidades as string) || "";
  const conteudoTec = (paeeData.conteudo_tecnologia_assistiva as string) || "";

  // Chave única para esta jornada (por origem)
  const chaveJornada = origemSelecionada === "ciclo" 
    ? `ciclo_${cicloExecucao?.ciclo_id || "preview"}`
    : origemSelecionada;

  // Carregar estado salvo
  useEffect(() => {
    const jornadas = (paeeData.jornadas_gamificadas || {}) as Record<string, {
      texto?: string;
      status?: string;
      feedback?: string;
      origem?: string;
      imagem_bytes?: string;
    }>;
    const estado = jornadas[chaveJornada];
    if (estado) {
      setTexto(estado.texto || "");
      setStatus((estado.status as typeof status) || "rascunho");
      setFeedback(estado.feedback || "");
      if (estado.imagem_bytes) {
        setMapaMental(estado.imagem_bytes);
      }
    }
  }, [paeeData, chaveJornada]);

  const updateField = (key: string, value: unknown) => {
    const jornadas = (paeeData.jornadas_gamificadas || {}) as Record<string, unknown>;
    jornadas[chaveJornada] = { ...(jornadas[chaveJornada] as Record<string, unknown> || {}), [key]: value };
    onUpdate({ ...paeeData, jornadas_gamificadas: jornadas });
  };

  const gerar = async (feedbackAjuste?: string) => {
    setLoading(true);
    setErro(null);
    try {
      const body: Record<string, unknown> = {
        origem: origemSelecionada,
        engine,
        estudante: {
          nome: student.name,
          serie: student.grade,
          hiperfoco,
        },
      };

      if (estilo.trim()) {
        body.estilo = estilo;
      }

      if (feedbackAjuste || feedback) {
        body.feedback = feedbackAjuste || feedback;
      }

      if (origemSelecionada === "ciclo") {
        if (!cicloExecucao) {
          setErro("Selecione ou gere um ciclo na aba **Execução e Metas SMART** primeiro.");
          return;
        }
        body.ciclo = cicloExecucao;
      } else {
        let textoFonte = "";
        let nomeFonte = "";
        if (origemSelecionada === "barreiras") {
          textoFonte = conteudoBarreiras;
          nomeFonte = "Mapear Barreiras";
        } else if (origemSelecionada === "plano-habilidades") {
          textoFonte = conteudoPlano;
          nomeFonte = "Plano de Habilidades";
        } else if (origemSelecionada === "tecnologia-assistiva") {
          textoFonte = conteudoTec;
          nomeFonte = "Tecnologia Assistiva";
        }
        if (!textoFonte.trim()) {
          setErro(`Gere o conteúdo na aba **${nomeFonte}** primeiro.`);
          return;
        }
        body.texto_fonte = textoFonte;
        body.nome_fonte = nomeFonte;
      }

      const res = await fetch("/api/paee/jornada-gamificada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar jornada.");
      setTexto(data.texto || "");
      setStatus("revisao");
      updateField("texto", data.texto);
      updateField("status", "revisao");
      updateField("origem", origemSelecionada);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar.");
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setTexto("");
    setStatus("rascunho");
    setFeedback("");
    setMapaMental(null);
    updateField("texto", "");
    updateField("status", "rascunho");
    updateField("feedback", "");
    updateField("imagem_bytes", null);
  };

  const gerarMapaMental = async () => {
    setMapaLoading(true);
    setMapaErro(null);
    try {
      const res = await fetch("/api/paee/mapa-mental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: texto,
          nome: student.name,
          hiperfoco: usarHiperfocoTema ? temaMapa : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar mapa mental.");
      setMapaMental(data.image || null);
      updateField("imagem_bytes", data.image);
    } catch (e) {
      setMapaErro(e instanceof Error ? e.message : "Erro ao gerar mapa mental.");
    } finally {
      setMapaLoading(false);
    }
  };

  const downloadCSV = () => {
    const linhas = texto.split("\n").map((l) => l.trim() || "");
    const csvContent = linhas.map((l) => `"${l.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Jornada_${student.name.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6 rounded-xl border-2 border-slate-200 bg-white min-h-[200px]">
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Jornada Gamificada</div>
        <div className="text-2xl font-black text-slate-900">Missão do(a) {student.name}</div>
        <div className="text-sm text-slate-600">
          Gere missões motivadoras a partir do planejamento. O roteiro será entregue ao estudante e à família — use linguagem de conquistas, nunca diagnósticos.
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Cada aba do PAEE pode virar uma <strong>jornada gamificada</strong> para o estudante e a família.
          Escolha a <strong>origem</strong> na lista abaixo. ⚠️ O material gerado será entregue ao estudante — diagnósticos e dados clínicos não são incluídos.
        </p>
      </div>

      {status !== "rascunho" && (
        <button
          type="button"
          onClick={limpar}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Limpar / Abandonar
        </button>
      )}

      {status === "rascunho" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Gerar jornada a partir de:</label>
            <select
              value={origemSelecionada}
              onChange={(e) => setOrigemSelecionada(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {opcoesOrigem.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {origemSelecionada === "ciclo" && cicloExecucao && (
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-slate-700">Foco do ciclo</div>
                  <div className="text-slate-600">{cicloExecucao.config_ciclo?.foco_principal || "—"}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-700">Período</div>
                  <div className="text-slate-600">
                    {cicloExecucao.config_ciclo?.data_inicio || "—"} → {cicloExecucao.config_ciclo?.data_fim || "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Preferência de estilo (opcional)
            </label>
            <input
              type="text"
              value={estilo}
              onChange={(e) => setEstilo(e.target.value)}
              placeholder="Ex: super-heróis, exploração, futebol..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <EngineSelector value={engine} onChange={onEngineChange} />

          <p className="text-sm text-slate-600">
            <strong>Como funciona:</strong> O assistente transforma o conteúdo da aba escolhida em uma missão gamificada para o estudante e a família. O texto final não inclui diagnósticos — apenas desafios e conquistas.
          </p>

          <button
            type="button"
            onClick={() => gerar()}
            disabled={loading || (origemSelecionada === "ciclo" && !cicloExecucao)}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {loading ? "⏳ Criando missão..." : "✨ Criar Roteiro Gamificado"}
          </button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : status === "revisao" ? (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Missão gerada! Revise abaixo e aprove ou solicite ajustes.</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg bg-white">
            <h4 className="font-semibold text-slate-800 mb-2">Missão (prévia)</h4>
            <FormattedTextDisplay texto={texto} titulo="" />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-700">Mapa mental do roteiro</div>
            <p className="text-xs text-slate-600">
              Gere um mapa mental visual a partir do roteiro gamificado. Estrutura: nó central → missões → etapas. O mapa não inclui informações clínicas.
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={usarHiperfocoTema}
                  onChange={(e) => {
                    setUsarHiperfocoTema(e.target.checked);
                    if (e.target.checked) setTemaMapa(hiperfoco);
                  }}
                  className="rounded"
                />
                <span>Usar hiperfoco do estudante como tema do mapa mental (nó central)</span>
              </label>
              {usarHiperfocoTema && (
                <input
                  type="text"
                  value={temaMapa}
                  onChange={(e) => setTemaMapa(e.target.value)}
                  placeholder="Ex: dinossauros, espaço, música..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              )}
            </div>
            {mapaMental && (
              <div className="space-y-2">
                <img src={mapaMental} alt="Mapa mental da jornada" className="max-w-full rounded-lg border border-slate-200" />
                <a
                  href={mapaMental}
                  download="missao_visual.png"
                  className="inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200"
                >
                  📥 Baixar imagem
                </a>
              </div>
            )}
            <button
              type="button"
              onClick={gerarMapaMental}
              disabled={mapaLoading || !texto.trim()}
              className="px-4 py-2 bg-violet-100 text-violet-800 rounded-lg text-sm hover:bg-violet-200 disabled:opacity-50 flex items-center gap-2"
            >
              {mapaLoading ? "⏳ Gerando ilustração..." : (
                <>
                  <Map className="w-4 h-4" />
                  Gerar mapa mental do roteiro
                </>
              )}
            </button>
            {mapaErro && <p className="text-red-600 text-sm">{mapaErro}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setStatus("aprovado");
                updateField("status", "aprovado");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✅ Aprovar Missão
            </button>
            <button
              type="button"
              onClick={() => setStatus("ajustando")}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              🔄 Solicitar Ajustes
            </button>
          </div>
        </div>
      ) : status === "ajustando" ? (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-800">⚠️ Descreva o que ajustar e regenere.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">O que ajustar?</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex: mais curto, linguagem infantil..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => gerar(feedback)}
              disabled={loading || !feedback.trim()}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "⏳ Reescrevendo..." : "🔄 Regerar com Ajustes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ↩️ Voltar
            </button>
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Missão aprovada! Edite se quiser e exporte em PDF ou CSV.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Edição final (opcional)</label>
            <textarea
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                updateField("texto", e.target.value);
              }}
              rows={12}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-700">Mapa mental do roteiro</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={usarHiperfocoTema}
                  onChange={(e) => {
                    setUsarHiperfocoTema(e.target.checked);
                    if (e.target.checked) setTemaMapa(hiperfoco);
                  }}
                  className="rounded"
                />
                <span>Usar hiperfoco do estudante como tema do mapa mental (nó central)</span>
              </label>
              {usarHiperfocoTema && (
                <input
                  type="text"
                  value={temaMapa}
                  onChange={(e) => setTemaMapa(e.target.value)}
                  placeholder="Ex: dinossauros, espaço, música..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              )}
            </div>
            {mapaMental && (
              <div className="space-y-2">
                <img src={mapaMental} alt="Mapa mental da jornada" className="max-w-full rounded-lg border border-slate-200" />
                <a
                  href={mapaMental}
                  download="missao_visual.png"
                  className="inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200"
                >
                  📥 Baixar imagem
                </a>
              </div>
            )}
            <button
              type="button"
              onClick={gerarMapaMental}
              disabled={mapaLoading || !texto.trim()}
              className="px-4 py-2 bg-violet-100 text-violet-800 rounded-lg text-sm hover:bg-violet-200 disabled:opacity-50 flex items-center gap-2"
            >
              {mapaLoading ? "⏳ Gerando ilustração..." : (
                <>
                  <Map className="w-4 h-4" />
                  Gerar mapa mental do roteiro
                </>
              )}
            </button>
            {mapaErro && <p className="text-red-600 text-sm">{mapaErro}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <PdfDownloadButton
              text={texto}
              filename={`Missao_${student.name.replace(/\s+/g, "_")}.pdf`}
              title={`Missão - ${student.name}`}
            />
            <button
              type="button"
              onClick={downloadCSV}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              📊 Baixar CSV (importar no Sheets)
            </button>
          </div>
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
            <summary className="font-medium text-slate-700 cursor-pointer">
              {ciclo.tipo === "planejamento_aee" ? "🗓️ Cronograma (Fases)" : "📅 Cronograma (Semanas)"}
            </summary>
            <div className="mt-2 text-sm text-slate-600 space-y-2">
              {ciclo.tipo === "planejamento_aee" && cron.fases && cron.fases.length > 0 ? (
                <>
                  <p className="text-xs text-slate-500 mb-2">Visão macro em fases (documento de referência)</p>
                  {cron.fases.map((f, i) => (
                    <div key={i} className="p-2 rounded bg-slate-50 border border-slate-200">
                      <strong className="text-slate-800">{f.nome}</strong>
                      <p className="text-xs text-slate-600 mt-1">{f.objetivo_geral}</p>
                      {f.descricao && <p className="text-xs text-slate-500 mt-1">{f.descricao}</p>}
                    </div>
                  ))}
                </>
              ) : cron.semanas && cron.semanas.length > 0 ? (
                <>
                  <p className="text-xs text-slate-500 mb-2">Planejamento por semanas (norteador operacional)</p>
                  {cron.semanas.slice(0, 6).map((s) => (
                    <div key={s.numero} className="p-2 rounded bg-slate-50 border border-slate-200">
                      <strong className="text-slate-800">Semana {s.numero} — {s.tema}</strong>
                      <p className="text-xs text-slate-600 mt-1">{s.objetivo}</p>
                      {s.atividades && s.atividades.length > 0 && (
                        <ul className="text-xs text-slate-500 mt-1 list-disc list-inside">
                          {s.atividades.slice(0, 3).map((a, idx) => (
                            <li key={idx}>{a}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  {(cron.semanas?.length || 0) > 6 && (
                    <div className="text-xs text-slate-500 italic">+{(cron.semanas?.length || 0) - 6} semanas</div>
                  )}
                </>
              ) : null}
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
  student,
  peiData,
  diagnosis,
  paeeData,
  onUpdate,
}: {
  student: StudentFull | null;
  peiData: Record<string, unknown>;
  diagnosis: string;
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const [observacoes, setObservacoes] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");

  const contextoPei = (peiData.ia_sugestao as string) || "";

  // Carregar estado salvo
  useEffect(() => {
    const conteudoSalvo = paeeData.conteudo_diagnostico_barreiras as string;
    const statusSalvo = paeeData.status_diagnostico_barreiras as string;
    if (conteudoSalvo) {
      setDiagnostico(conteudoSalvo);
      setStatus((statusSalvo as typeof status) || "revisao");
    }
  }, [paeeData]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    if (!observacoes.trim()) {
      setErro("Por favor, descreva suas observações antes de analisar.");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/paee/diagnostico-barreiras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observacoes,
          studentId: student?.id,
          studentName: student?.name || "",
          diagnosis,
          contextoPei,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar diagnóstico");
      setDiagnostico(data.diagnostico || "");
      setStatus("revisao");
      updateField("conteudo_diagnostico_barreiras", data.diagnostico);
      updateField("status_diagnostico_barreiras", "revisao");
      if (feedbackAjuste) {
        updateField("input_original_diagnostico_barreiras", { obs: observacoes });
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar diagnóstico");
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setDiagnostico("");
    setStatus("rascunho");
    setObservacoes("");
    setFeedback("");
    updateField("conteudo_diagnostico_barreiras", "");
    updateField("status_diagnostico_barreiras", "rascunho");
  };

  return (
    <div className="space-y-6 p-6 rounded-xl border-2 border-slate-200 bg-white min-h-[200px]">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-violet-600" />
        <h3 className="text-xl font-bold text-slate-800">Mapear Barreiras</h3>
      </div>
      <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 mb-4">
        <p className="text-sm text-violet-800">
          <strong>Diagnóstico de Acessibilidade:</strong> Identifique o que impede a participação plena do estudante (barreiras atitudinais, arquitetônicas, tecnológicas). Resultado para uso da equipe.
        </p>
      </div>

      {status !== "rascunho" && (
        <button
          type="button"
          onClick={limpar}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Limpar / Abandonar
        </button>
      )}

      {status === "rascunho" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Observações Iniciais do AEE
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Exemplo: O estudante se recusa a escrever quando solicitado, demonstrando ansiedade e evitamento. Durante atividades de escrita, ele tenta sair da sala ou distrai os colegas. Quando consegue iniciar, abandona a tarefa após algumas linhas, dizendo que está cansado ou que não sabe fazer."
              rows={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          <EngineSelector value={engine} onChange={setEngine} />
          <button
            type="button"
            onClick={() => gerar()}
            disabled={loading || !observacoes.trim()}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Analisando barreiras...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                🔍 Analisar Barreiras
              </>
            )}
          </button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : status === "revisao" ? (
        <div className="space-y-4">
          <FormattedTextDisplay texto={diagnostico} titulo="Diagnóstico de Barreiras Gerado" />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_diagnostico_barreiras", "aprovado");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✅ Validar e Finalizar
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("ajustando");
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              🔄 Solicitar Ajustes
            </button>
            <button
              type="button"
              onClick={limpar}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              🗑️ Descartar e Regenerar
            </button>
            <PdfDownloadButton
              text={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              text={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              title={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
          </div>
        </div>
      ) : status === "ajustando" ? (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-800 mb-2">✏️ Modo de Ajuste Ativo</p>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descreva os ajustes necessários:
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex.: Incluir mais detalhes sobre barreiras metodológicas, focar em estratégias práticas..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => gerar(feedback)}
              disabled={loading || !feedback.trim()}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Regerando..." : "🔄 Regerar com Ajustes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ↩️ Cancelar Ajustes
            </button>
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Recurso Validado e Pronto para Uso</p>
          </div>
          <FormattedTextDisplay texto={diagnostico} titulo="Diagnóstico de Barreiras Final" />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                updateField("status_diagnostico_barreiras", "revisao");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ✏️ Editar Novamente
            </button>
            <PdfDownloadButton
              text={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              text={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              title={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Aba: Plano de Habilidades
function PlanoHabilidadesTab({
  student,
  peiData,
  paeeData,
  onUpdate,
}: {
  student: StudentFull | null;
  peiData: Record<string, unknown>;
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const [foco, setFoco] = useState("Funções Executivas");
  const [plano, setPlano] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");

  const contextoPei = (peiData.ia_sugestao as string) || "";

  const focosDisponiveis = [
    "Funções Executivas",
    "Autonomia",
    "Coordenação Motora",
    "Comunicação",
    "Habilidades Sociais",
    "Leitura e Escrita",
    "Matemática",
    "Tecnologias Assistivas",
    "Organização e Planejamento",
  ];

  // Carregar estado salvo
  useEffect(() => {
    const conteudoSalvo = paeeData.conteudo_plano_habilidades as string;
    const statusSalvo = paeeData.status_plano_habilidades as string;
    const inputSalvo = paeeData.input_original_plano_habilidades as { foco?: string };
    if (conteudoSalvo) {
      setPlano(conteudoSalvo);
      setStatus((statusSalvo as typeof status) || "revisao");
    }
    if (inputSalvo?.foco) {
      setFoco(inputSalvo.foco);
    }
  }, [paeeData]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/paee/plano-habilidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focoTreino: foco,
          studentId: student?.id,
          studentName: student?.name || "",
          contextoPei,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar plano");
      setPlano(data.plano || "");
      setStatus("revisao");
      updateField("conteudo_plano_habilidades", data.plano);
      updateField("status_plano_habilidades", "revisao");
      updateField("input_original_plano_habilidades", { foco });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar plano");
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setPlano("");
    setStatus("rascunho");
    setFeedback("");
    updateField("conteudo_plano_habilidades", "");
    updateField("status_plano_habilidades", "rascunho");
  };

  return (
    <div className="space-y-6 p-6 rounded-xl border-2 border-slate-200 bg-white min-h-[200px]">
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-6 h-6 text-violet-600" />
        <h3 className="text-xl font-bold text-slate-800">Plano de Habilidades</h3>
      </div>
      <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 mb-4">
        <p className="text-sm text-violet-800">
          <strong>Treino de Habilidades:</strong> Desenvolvimento de competências específicas no AEE.
        </p>
      </div>

      {status !== "rascunho" && (
        <button
          type="button"
          onClick={limpar}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Limpar / Abandonar
        </button>
      )}

      {status === "rascunho" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Foco do Atendimento</label>
            <select
              value={foco}
              onChange={(e) => setFoco(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              {focosDisponiveis.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <EngineSelector value={engine} onChange={setEngine} />
          <button
            type="button"
            onClick={() => gerar()}
            disabled={loading}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Elaborando plano de intervenção...
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                📋 Gerar Plano
              </>
            )}
          </button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : status === "revisao" ? (
        <div className="space-y-4">
          <FormattedTextDisplay texto={plano} titulo="Plano de Habilidades Gerado" />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_plano_habilidades", "aprovado");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✅ Validar e Finalizar
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("ajustando");
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              🔄 Solicitar Ajustes
            </button>
            <button
              type="button"
              onClick={limpar}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              🗑️ Descartar e Regenerar
            </button>
            <PdfDownloadButton
              text={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Plano de Habilidades - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              text={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              title={`Plano de Habilidades - ${student?.name || ""}`}
            />
          </div>
        </div>
      ) : status === "ajustando" ? (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-800 mb-2">✏️ Modo de Ajuste Ativo</p>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descreva os ajustes necessários:
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex.: Incluir mais detalhes sobre estratégias de ensino, focar em recursos práticos..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => gerar(feedback)}
              disabled={loading || !feedback.trim()}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Aplicando ajustes..." : "🔄 Regerar com Ajustes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ↩️ Cancelar Ajustes
            </button>
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Plano Validado e Pronto para Uso</p>
          </div>
          <FormattedTextDisplay texto={plano} titulo="Plano de Habilidades Final" />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                updateField("status_plano_habilidades", "revisao");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ✏️ Editar Novamente
            </button>
            <PdfDownloadButton
              text={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Plano de Habilidades - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              text={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              title={`Plano de Habilidades - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Aba: Tecnologias Assistivas
function TecAssistivaTab({
  student,
  peiData,
  paeeData,
  onUpdate,
}: {
  student: StudentFull | null;
  peiData: Record<string, unknown>;
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const [dificuldade, setDificuldade] = useState("");
  const [sugestoes, setSugestoes] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");

  const contextoPei = (peiData.ia_sugestao as string) || "";

  // Carregar estado salvo
  useEffect(() => {
    const conteudoSalvo = paeeData.conteudo_tecnologia_assistiva as string;
    const statusSalvo = paeeData.status_tecnologia_assistiva as string;
    const inputSalvo = paeeData.input_original_tecnologia_assistiva as { dificuldade?: string };
    if (conteudoSalvo) {
      setSugestoes(conteudoSalvo);
      setStatus((statusSalvo as typeof status) || "revisao");
    }
    if (inputSalvo?.dificuldade) {
      setDificuldade(inputSalvo.dificuldade);
    }
  }, [paeeData]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    if (!dificuldade.trim()) {
      setErro("Por favor, descreva a dificuldade específica.");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/paee/tecnologia-assistiva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dificuldade,
          studentId: student?.id,
          studentName: student?.name || "",
          contextoPei,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar sugestões");
      setSugestoes(data.sugestoes || "");
      setStatus("revisao");
      updateField("conteudo_tecnologia_assistiva", data.sugestoes);
      updateField("status_tecnologia_assistiva", "revisao");
      updateField("input_original_tecnologia_assistiva", { dificuldade });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar sugestões");
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setSugestoes("");
    setStatus("rascunho");
    setDificuldade("");
    setFeedback("");
    updateField("conteudo_tecnologia_assistiva", "");
    updateField("status_tecnologia_assistiva", "rascunho");
  };

  return (
    <div className="space-y-6 p-6 rounded-xl border-2 border-slate-200 bg-white min-h-[200px]">
      <div className="flex items-center gap-3 mb-4">
        <Puzzle className="w-6 h-6 text-violet-600" />
        <h3 className="text-xl font-bold text-slate-800">Tecnologia Assistiva</h3>
      </div>
      <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 mb-4">
        <p className="text-sm text-violet-800">
          <strong>Tecnologia Assistiva:</strong> Recursos para promover autonomia e participação.
        </p>
      </div>

      {status !== "rascunho" && (
        <button
          type="button"
          onClick={limpar}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Limpar / Abandonar
        </button>
      )}

      {status === "rascunho" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Dificuldade Específica</label>
            <input
              type="text"
              value={dificuldade}
              onChange={(e) => setDificuldade(e.target.value)}
              placeholder="Ex: Dificuldade na escrita, comunicação, mobilidade, organização..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          <EngineSelector value={engine} onChange={setEngine} />
          <button
            type="button"
            onClick={() => gerar()}
            disabled={loading || !dificuldade.trim()}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Buscando tecnologias assistivas...
              </>
            ) : (
              <>
                <Puzzle className="w-5 h-5" />
                🔧 Sugerir Recursos
              </>
            )}
          </button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : status === "revisao" ? (
        <div className="space-y-4">
          <FormattedTextDisplay texto={sugestoes} titulo="Sugestões de Tecnologia Assistiva Geradas" />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_tecnologia_assistiva", "aprovado");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✅ Validar e Finalizar
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("ajustando");
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              🔄 Solicitar Ajustes
            </button>
            <button
              type="button"
              onClick={limpar}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              🗑️ Descartar e Regenerar
            </button>
            <PdfDownloadButton
              text={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Tecnologia Assistiva - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              text={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              title={`Tecnologia Assistiva - ${student?.name || ""}`}
            />
          </div>
        </div>
      ) : status === "ajustando" ? (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-800 mb-2">✏️ Modo de Ajuste Ativo</p>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descreva os ajustes necessários:
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex.: Incluir mais recursos de baixa tecnologia, focar em soluções práticas..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => gerar(feedback)}
              disabled={loading || !feedback.trim()}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Aplicando ajustes..." : "🔄 Regerar com Ajustes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ↩️ Cancelar Ajustes
            </button>
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Sugestões Validadas e Prontas para Uso</p>
          </div>
          <FormattedTextDisplay texto={sugestoes} titulo="Sugestões de Tecnologia Assistiva Final" />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                updateField("status_tecnologia_assistiva", "revisao");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ✏️ Editar Novamente
            </button>
            <PdfDownloadButton
              text={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Tecnologia Assistiva - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              text={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              title={`Tecnologia Assistiva - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Aba: Articulação
function ArticulacaoTab({
  student,
  paeeData,
  onUpdate,
}: {
  student: StudentFull | null;
  paeeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  const [frequencia, setFrequencia] = useState("2x/sem");
  const [turno, setTurno] = useState("Manhã");
  const [acoes, setAcoes] = useState("");
  const [documento, setDocumento] = useState("");
  const [status, setStatus] = useState<"rascunho" | "revisao" | "aprovado" | "ajustando">("rascunho");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");
  const [feedback, setFeedback] = useState("");

  // Carregar estado salvo
  useEffect(() => {
    const conteudoSalvo = paeeData.conteudo_documento_articulacao as string;
    const statusSalvo = paeeData.status_documento_articulacao as string;
    const inputSalvo = paeeData.input_original_documento_articulacao as {
      freq?: string;
      turno?: string;
      acoes?: string;
    };
    if (conteudoSalvo) {
      setDocumento(conteudoSalvo);
      setStatus((statusSalvo as typeof status) || "revisao");
    }
    if (inputSalvo) {
      setFrequencia(inputSalvo.freq || "2x/sem");
      setTurno(inputSalvo.turno || "Manhã");
      setAcoes(inputSalvo.acoes || "");
    }
  }, [paeeData]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    if (!acoes.trim()) {
      setErro("Por favor, descreva o trabalho desenvolvido no AEE.");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/paee/documento-articulacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frequencia: `${frequencia} (${turno})`,
          acoes,
          studentId: student?.id,
          studentName: student?.name || "",
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar documento");
      setDocumento(data.documento || "");
      setStatus("revisao");
      updateField("conteudo_documento_articulacao", data.documento);
      updateField("status_documento_articulacao", "revisao");
      updateField("input_original_documento_articulacao", { freq: frequencia, turno, acoes });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar documento");
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setDocumento("");
    setStatus("rascunho");
    setAcoes("");
    setFeedback("");
    updateField("conteudo_documento_articulacao", "");
    updateField("status_documento_articulacao", "rascunho");
  };

  return (
    <div className="space-y-6 p-6 rounded-xl border-2 border-slate-200 bg-white min-h-[200px]">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-violet-600" />
        <h3 className="text-xl font-bold text-slate-800">Articulação</h3>
      </div>
      <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 mb-4">
        <p className="text-sm text-violet-800">
          <strong>Ponte com a Sala Regular:</strong> Documento colaborativo para articulação entre AEE e sala de aula.
        </p>
      </div>

      {status !== "rascunho" && (
        <button
          type="button"
          onClick={limpar}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Limpar / Abandonar
        </button>
      )}

      {status === "rascunho" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Frequência no AEE</label>
              <select
                value={frequencia}
                onChange={(e) => setFrequencia(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="1x/sem">1x/sem</option>
                <option value="2x/sem">2x/sem</option>
                <option value="3x/sem">3x/sem</option>
                <option value="Diário">Diário</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Turno</label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Integral">Integral</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Trabalho Desenvolvido no AEE
            </label>
            <textarea
              value={acoes}
              onChange={(e) => setAcoes(e.target.value)}
              placeholder="Descreva as principais ações, estratégias e recursos utilizados no AEE..."
              rows={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          <EngineSelector value={engine} onChange={setEngine} />
          <button
            type="button"
            onClick={() => gerar()}
            disabled={loading || !acoes.trim()}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Gerando documento...
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                📄 Gerar Documento
              </>
            )}
          </button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : status === "revisao" ? (
        <div className="space-y-4">
          <FormattedTextDisplay texto={documento} titulo="Documento de Articulação Gerado" />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_documento_articulacao", "aprovado");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ✅ Validar e Finalizar
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("ajustando");
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              🔄 Solicitar Ajustes
            </button>
            <button
              type="button"
              onClick={limpar}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              🗑️ Descartar e Regenerar
            </button>
            <PdfDownloadButton
              text={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Documento de Articulação - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              text={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              title={`Documento de Articulação - ${student?.name || ""}`}
            />
          </div>
        </div>
      ) : status === "ajustando" ? (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-800 mb-2">✏️ Modo de Ajuste Ativo</p>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descreva os ajustes necessários:
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ex.: Incluir mais detalhes sobre estratégias de generalização, focar em orientações práticas..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => gerar(feedback)}
              disabled={loading || !feedback.trim()}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Aplicando ajustes..." : "🔄 Regerar com Ajustes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ↩️ Cancelar Ajustes
            </button>
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">✅ Documento Validado e Pronto para Uso</p>
          </div>
          <FormattedTextDisplay texto={documento} titulo="Documento de Articulação Final" />
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                updateField("status_documento_articulacao", "revisao");
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ✏️ Editar Novamente
            </button>
            <PdfDownloadButton
              text={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Documento de Articulação - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              text={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              title={`Documento de Articulação - ${student?.name || ""}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para range input com cores (igual ao PEI)
function NivelSuporteRange({
  value,
  max,
  onChange,
  id,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  id: string;
}) {
  const thumbColor = value === 0 ? '#10b981' : value === 1 ? '#eab308' : value === 2 ? '#f97316' : '#ef4444';
  const rangeId = `range-${id.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  useEffect(() => {
    const style = document.createElement('style');
    style.id = `style-${rangeId}`;
    style.textContent = `
      #${rangeId}::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${thumbColor};
        border: 3px solid white;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: background 0.2s;
      }
      #${rangeId}::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${thumbColor};
        border: 3px solid white;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: background 0.2s;
      }
      #${rangeId}::-webkit-slider-runnable-track {
        background: transparent;
        height: 8px;
      }
      #${rangeId}::-moz-range-track {
        background: transparent;
        height: 8px;
      }
    `;
    const existingStyle = document.getElementById(`style-${rangeId}`);
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);
    return () => {
      const styleEl = document.getElementById(`style-${rangeId}`);
      if (styleEl) styleEl.remove();
    };
  }, [thumbColor, rangeId]);
  
  // Calcular cor da barra baseada na posição do marcador
  let barColor = '#10b981'; // Verde (Autônomo - valor 0)
  if (value === 1) barColor = '#eab308'; // Amarelo (Monitorado)
  if (value === 2) barColor = '#f97316'; // Laranja (Substancial)
  if (value === 3) barColor = '#ef4444'; // Vermelho (Muito Substancial)

  return (
    <div className="relative">
      {/* Barra de fundo cinza */}
      <div 
        className="absolute w-full h-2 rounded-lg pointer-events-none bg-slate-200"
      />
      {/* Barra inteira com a cor baseada na posição do marcador */}
      <div 
        className="absolute w-full h-2 rounded-lg pointer-events-none transition-all duration-200"
        style={{
          background: barColor,
        }}
      />
      {/* Input range transparente sobre a barra colorida */}
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="relative w-full h-2 rounded-lg appearance-none cursor-pointer bg-transparent"
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
        }}
        id={rangeId}
      />
    </div>
  );
}
