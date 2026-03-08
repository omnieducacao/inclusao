"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { EngineSelector } from "@/components/EngineSelector";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { getColorClasses } from "@/lib/colors";
import { gerarPdfJornada } from "@/lib/paee-pdf-export";
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
import { Map, AlertTriangle, Target, Puzzle, Users, Search, FileText, ExternalLink } from "lucide-react";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { ResumoAnexosEstudante } from "@/components/ResumoAnexosEstudante";
import { OmniLoader } from "@/components/OmniLoader";
import { JornadaTab } from "./components/JornadaTab";
import { FormPlanejamento } from "./components/FormPlanejamento";
import { FormExecucao } from "./components/FormExecucao";
import { CicloCard } from "./components/CicloCard";
import { MapearBarreirasTab } from "./components/MapearBarreirasTab";
import { PlanoHabilidadesTab } from "./components/PlanoHabilidadesTab";
import { TecAssistivaTab } from "./components/TecAssistivaTab";
import { ArticulacaoTab } from "./components/ArticulacaoTab";
import { NivelSuporteRange } from "./components/NivelSuporteRange";

import { useStudentMutation } from "@/hooks/useStudentMutation";
import { useStudentRealtime } from "@/hooks/useStudentRealtime";
import { Card, Button, Select } from "@omni/ds";

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

function PAEEClientInner({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams?.get("student") || null;
  const mutation = useStudentMutation();
  const savingCiclo = mutation.loading;

  // Omni V5: Real-time Multi-User Subscription
  useStudentRealtime(currentId);

  const [activeTab, setActiveTab] = useState<TabId>("planejamento");
  const [cicloSelecionadoPlanejamento, setCicloSelecionadoPlanejamento] = useState<CicloPAEE | null>(null);
  const [cicloSelecionadoExecucao, setCicloSelecionadoExecucao] = useState<CicloPAEE | null>(null);
  const [cicloPreview, setCicloPreview] = useState<CicloPAEE | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [jornadaEngine, setJornadaEngine] = useState<EngineId>("red");
  const [paeeData, setPaeeData] = useState<Record<string, unknown>>({});
  const [relatorio, setRelatorio] = useState<string | null>(null);
  const [relLoading, setRelLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

      await mutation.updatePAEECiclos(student.id, {
        paee_ciclos: ciclosAtualizados,
        planejamento_ativo: cicloComId.ciclo_id,
        status_planejamento: cicloComId.status,
        data_inicio_ciclo: cfg.data_inicio ?? null,
        data_fim_ciclo: cfg.data_fim ?? null,
      }, () => {
        setSaved(true);
        setCicloPreview(null);
        // O backend via Supabase Realtime emitirá o router.refresh() automático
      });
      return true;
    },
    [student?.id, ciclos, mutation]
  );

  const definirCicloAtivo = useCallback(
    async (cicloId: string) => {
      if (!student?.id) return false;
      const ciclo = ciclos.find((c) => c.ciclo_id === cicloId);
      if (!ciclo) return false;
      const cfg = ciclo.config_ciclo || {};
      await mutation.updatePAEECiclos(student.id, {
        paee_ciclos: ciclos,
        planejamento_ativo: cicloId,
        status_planejamento: "ativo",
        data_inicio_ciclo: cfg.data_inicio ?? null,
        data_fim_ciclo: cfg.data_fim ?? null,
      }, () => { /* O backend via Supabase Realtime emitirá o router.refresh() automático */ });
      return true;
    },
    [student?.id, ciclos, mutation]
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

  // Verificar status de cada aba para indicadores visuais
  const temBarreiras = Boolean((paeeData.conteudo_diagnostico_barreiras as string)?.trim());
  const temPlano = Boolean((paeeData.conteudo_plano_habilidades as string)?.trim());
  const temTec = Boolean((paeeData.conteudo_tecnologia_assistiva as string)?.trim());
  const temArticulacao = Boolean((paeeData.conteudo_documento_articulacao as string)?.trim());

  const tabsConfig: Array<{ id: TabId; label: string; icon: typeof AlertTriangle; desc: string; badge?: boolean }> = [
    { id: "mapear-barreiras", label: "Mapear Barreiras", icon: AlertTriangle, desc: "Diagnóstico de barreiras para aprendizagem", badge: temBarreiras },
    { id: "plano-habilidades", label: "Plano de Habilidades", icon: Target, desc: "Plano de intervenção com metas SMART", badge: temPlano },
    { id: "tec-assistiva", label: "Tec. Assistiva", icon: Puzzle, desc: "Recursos de tecnologia assistiva", badge: temTec },
    { id: "articulacao", label: "Articulação", icon: Users, desc: "Documento de articulação AEE ↔ Sala Regular", badge: temArticulacao },
    { id: "planejamento", label: "Planejamento AEE", icon: Search, desc: "Documento de referência (cronograma em fases)", badge: Boolean(cicloAtivoPlanejamento) },
    { id: "execucao", label: "Execução e Metas SMART", icon: Target, desc: "Norteador operacional (cronograma por semanas)", badge: Boolean(cicloAtivoExecucao) },
    { id: "jornada", label: "Jornada Gamificada", icon: Map, desc: "Missão gamificada para o estudante e família", badge: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <StudentSelector students={students} currentId={currentId} />
        {currentId && (
          <a
            href={`/pei?student=${currentId}`}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg border border-sky-200 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Ver PEI
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Painel PEI Retrátil */}
      {student && (
        <PEISummaryPanel peiData={peiData} studentName={student.name} />
      )}

      {/* Card de informações do estudante */}
      {student && (
        <Card padding="none" className="p-6 bg-(--module-primary-soft) border-(--module-primary)/10">
          <div className="space-y-1">
            <div className="text-xs font-bold text-(--module-primary) uppercase tracking-wider">Nome</div>
            <div className="font-bold text-slate-900 text-lg">{student.name}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-(--module-primary) uppercase tracking-wider">Série</div>
            <div className="font-bold text-slate-800">{student.grade || "—"}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-(--module-primary) uppercase tracking-wider">Diagnóstico</div>
            <div className="font-semibold text-slate-800 truncate" title={diagnosis}>{diagnosis}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-(--module-primary) uppercase tracking-wider">Hiperfoco</div>
            <div className="font-semibold text-slate-800 truncate" title={hiperfoco}>{hiperfoco}</div>
          </div>
        </Card>
      )}

      {/* Tabs Navigation - Melhorada com ícones e badges */}
      {student && (
        <div className="flex gap-1.5 p-1.5 bg-(--omni-bg-secondary) rounded-2xl overflow-x-auto scrollbar-hide border border-(--omni-border-default)">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group relative px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 shrink-0 ${isActive
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }`}
                title={tab.desc}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-(--module-primary)" : "text-slate-400 group-hover:text-(--module-primary)"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-(--module-primary)" : "bg-emerald-500"}`} title="Conteúdo gerado" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {student && activeTab === "mapear-barreiras" && (
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

      {student && activeTab === "plano-habilidades" && (
        <PlanoHabilidadesTab
          student={student}
          peiData={peiData}
          paeeData={paeeData}
          onUpdate={async (data) => {
            setPaeeData(data);
            if (student?.id) {
              try {
                const res = await fetch(`/api/students/${student.id}/paee`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paee_data: data }),
                });
                if (!res.ok) {
                  console.error("Erro ao salvar paee_data:", await res.text());
                } else {
                }
              } catch (err) {
                console.error("Erro ao salvar paee_data:", err);
              }
            }
          }}
        />
      )}

      {student && activeTab === "tec-assistiva" && (
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

      {student && activeTab === "planejamento" && (
        <Card padding="none" className="p-6">
          {/* Header da aba */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-(--module-primary-soft) to-(--module-primary)/10 flex items-center justify-center shrink-0">
              <Search className="w-6 h-6 text-(--module-primary)" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Planejamento AEE</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-(--module-primary)">Documento de referência:</strong> Registro pedagógico do ciclo de atendimento
                com objetivos, período, recursos e cronograma geral em <strong>fases</strong> (visão macro). Este documento serve
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                como referência para o planejamento geral do AEE. Use "Definir como ciclo ativo" para referência em outras abas.
              </p>
              <p className="text-xs text-(--module-primary) mt-3 font-medium bg-(--module-primary-soft) px-3 py-2 rounded-lg border border-(--module-primary)/20">
                💡 Para metas SMART, acompanhamento por semanas e Jornada Gamificada, use a aba <strong>Execução e Metas SMART</strong>.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                Histórico de ciclos de planejamento
              </h3>
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
                <Select
                  value={cicloSelecionadoPlanejamento?.ciclo_id || ""}
                  onChange={(e) => {
                    const c = ciclosPlanejamento.find((x) => x.ciclo_id === e.target.value);
                    setCicloSelecionadoPlanejamento(c || null);
                    setCicloPreview(null);
                  }}
                  className="w-full"
                  options={[
                    { value: "", label: "Selecione um ciclo" },
                    ...ciclosPlanejamento.map((c) => {
                      const [ic] = badgeStatus(c.status || "rascunho");
                      const cfg = c.config_ciclo || {};
                      return {
                        value: String(c.ciclo_id),
                        label: `${ic} ${cfg.foco_principal || "Ciclo"} • ${fmtDataIso(cfg.data_inicio)} • v${c.versao || 1}`
                      };
                    })
                  ]}
                />
              )}
              {ciclosPlanejamento.length > 0 && cicloSelecionadoPlanejamento?.ciclo_id && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="text-white border-0 bg-emerald-600 hover:bg-emerald-700 text-sm"
                    size="sm"
                    onClick={() => definirCicloAtivo(cicloSelecionadoPlanejamento.ciclo_id!)}
                  >
                    Definir como ativo
                  </Button>
                  <Button
                    type="button"
                    disabled={relLoading}
                    onClick={async () => {
                      setRelLoading(true);
                      setRelatorio(null);
                      aiLoadingStart(jornadaEngine || "red", "paee");
                      try {
                        const res = await fetch("/api/paee/relatorio-ciclo", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            studentId: currentId,
                            ciclo: cicloSelecionadoPlanejamento,
                            engine: jornadaEngine,
                          }),
                        });
                        const data = await res.json();
                        if (res.ok && data.texto) setRelatorio(data.texto);
                      } catch { /* ignore */ } finally {
                        setRelLoading(false);
                        aiLoadingStop();
                      }
                    }}
                    className="text-white border-0 bg-(--module-primary) hover:brightness-110 flex items-center gap-1.5 text-sm"
                    size="sm"
                  >
                    {relLoading ? "Gerando..." : "📊 Relatório do Ciclo"}
                  </Button>
                </div>
              )}
              {relatorio && (
                <div className="mt-4 p-5 rounded-xl bg-(--module-primary-soft) border border-(--module-primary)/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-(--module-text) flex items-center gap-2">📊 Relatório do Ciclo</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setRelatorio(null)} className="text-(--module-primary)/70 hover:text-(--module-primary) hover:bg-(--module-primary-soft)">Fechar</Button>
                  </div>
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{relatorio}</div>
                </div>
              )}

              <div className="pt-4 border-t border-(--module-primary)/20">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                  Gerar novo ciclo
                </h3>
                <FormPlanejamento
                  metasPei={metasPei}
                  hiperfoco={hiperfoco}
                  onGerar={gerarPreviewPlanejamento}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                Visualização
              </h3>
              {cicloParaVerPlanejamento ? (
                <CicloCard ciclo={cicloParaVerPlanejamento} onSalvar={cicloPreview?.tipo === "planejamento_aee" ? () => saveCiclo(cicloParaVerPlanejamento) : undefined} saving={saving} onLimpar={() => setCicloPreview(null)} />
              ) : (
                <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                  Selecione um ciclo ou gere um novo.
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {student && activeTab === "execucao" && (
        <Card padding="none" className="p-6">
          {/* Header da aba */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-(--module-primary-soft) to-(--module-primary)/10 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-(--module-primary)" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Execução e Metas SMART</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-(--module-primary)">Norteador operacional:</strong> Plano de execução e acompanhamento com metas
                desdobradas em SMART, ações por <strong>semana</strong> e registro do que foi cumprido. Este ciclo alimenta a
                <strong> Jornada Gamificada</strong> do estudante e serve como guia prático para a execução do trabalho no AEE.
              </p>
              <p className="text-xs text-(--module-primary) mt-3 font-medium bg-(--module-primary-soft) px-3 py-2 rounded-lg border border-(--module-primary)/20">
                💡 Para documento de planejamento geral (objetivos, período, recursos, cronograma em fases), use a aba <strong>Planejamento AEE</strong>.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                Histórico de ciclos de execução
              </h3>
              {ciclosExecucao.length > 0 && (
                <>
                  <Select
                    value={cicloSelecionadoExecucao?.ciclo_id || ""}
                    onChange={(e) => {
                      const c = ciclosExecucao.find((x) => x.ciclo_id === e.target.value);
                      setCicloSelecionadoExecucao(c || null);
                      setCicloPreview(null);
                    }}
                    className="w-full"
                    options={[
                      { value: "", label: "Selecione um ciclo" },
                      ...ciclosExecucao.map((c) => {
                        const cfg = c.config_ciclo || {};
                        return {
                          value: String(c.ciclo_id),
                          label: `${cfg.foco_principal || "Ciclo"} • ${fmtDataIso(cfg.data_inicio)}`
                        };
                      })
                    ]}
                  />
                  {cicloSelecionadoExecucao?.ciclo_id && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        className="text-white border-0 bg-emerald-600 hover:bg-emerald-700 text-sm"
                        size="sm"
                        onClick={() => definirCicloAtivo(cicloSelecionadoExecucao.ciclo_id!)}
                      >
                        Definir como ativo
                      </Button>
                    </div>
                  )}
                </>
              )}
              <div className="pt-4 border-t border-(--module-primary)/20">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                  Gerar ciclo de execução
                </h3>
                <FormExecucao metasPei={metasPei} onGerar={gerarPreviewExecucao} />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                Visualização
              </h3>
              {cicloParaVerExecucao ? (
                <CicloCard ciclo={cicloParaVerExecucao} onSalvar={cicloPreview?.tipo === "execucao_smart" ? () => saveCiclo(cicloParaVerExecucao) : undefined} saving={saving} onLimpar={() => setCicloPreview(null)} />
              ) : (
                <div className="p-6 rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                  Gere um ciclo de execução à esquerda.
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {student && activeTab === "jornada" && (
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

      {/* Resumo de Anexos do Estudante */}
      {student && (
        <ResumoAnexosEstudante
          nomeEstudante={student.name}
          temRelatorioPei={Boolean((peiData.ia_sugestao as string)?.trim())}
          temJornada={Boolean((peiData.ia_mapa_texto as string)?.trim())}
          nCiclosPae={ciclos.length}
          pagina="PAEE"
        />
      )}
    </div>
  );
}

export function PAEEClient({ students, studentId, student }: Props) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
        <div className="text-slate-500 text-center py-8">Carregando...</div>
      </div>
    }>
      <PAEEClientInner students={students} studentId={studentId} student={student} />
    </Suspense>
  );
}
