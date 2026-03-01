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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-gradient-to-br from-violet-50/80 to-purple-50/50" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(196,181,253,0.4)' }}>
          <div className="space-y-1">
            <div className="text-xs font-bold text-violet-600 uppercase tracking-wider">Nome</div>
            <div className="font-bold text-slate-900 text-lg">{student.name}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-violet-600 uppercase tracking-wider">Série</div>
            <div className="font-bold text-slate-800">{student.grade || "—"}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-violet-600 uppercase tracking-wider">Diagnóstico</div>
            <div className="font-semibold text-slate-800 truncate" title={diagnosis}>{diagnosis}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-violet-600 uppercase tracking-wider">Hiperfoco</div>
            <div className="font-semibold text-slate-800 truncate" title={hiperfoco}>{hiperfoco}</div>
          </div>
        </div>
      )}

      {/* Tabs Navigation - Melhorada com ícones e badges */}
      {student && (
        <div className="flex gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl overflow-x-auto scrollbar-hide" style={{ border: '1px solid rgba(226,232,240,0.6)' }}>
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group relative px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 flex-shrink-0 ${isActive
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }`}
                title={tab.desc}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-violet-600" : "text-slate-400 group-hover:text-violet-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? "bg-violet-500" : "bg-emerald-500"}`} title="Conteúdo gerado" />
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
                  console.log("✅ paee_data salvo com sucesso");
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
        <div className="space-y-6 p-6 rounded-2xl bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
          {/* Header da aba */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              <Search className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Planejamento AEE</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-violet-700">Documento de referência:</strong> Registro pedagógico do ciclo de atendimento
                com objetivos, período, recursos e cronograma geral em <strong>fases</strong> (visão macro). Este documento serve
                como referência para o planejamento geral do AEE. Use "Definir como ciclo ativo" para referência em outras abas.
              </p>
              <p className="text-xs text-violet-600 mt-3 font-medium bg-violet-50 px-3 py-2 rounded-lg border border-violet-200">
                💡 Para metas SMART, acompanhamento por semanas e Jornada Gamificada, use a aba <strong>Execução e Metas SMART</strong>.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
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
                  <button
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
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {relLoading ? "Gerando..." : "📊 Relatório do Ciclo"}
                  </button>
                </div>
              )}
              {relatorio && (
                <div className="mt-4 p-5 rounded-xl bg-violet-50 border border-violet-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-violet-900 flex items-center gap-2">📊 Relatório do Ciclo</h4>
                    <button type="button" onClick={() => setRelatorio(null)} className="text-xs text-violet-400 hover:text-violet-600">Fechar</button>
                  </div>
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{relatorio}</div>
                </div>
              )}

              <div className="pt-4 border-t border-violet-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
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
                <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
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
        </div>
      )}

      {student && activeTab === "execucao" && (
        <div className="space-y-6 p-6 rounded-2xl bg-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
          {/* Header da aba */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Execução e Metas SMART</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-violet-700">Norteador operacional:</strong> Plano de execução e acompanhamento com metas
                desdobradas em SMART, ações por <strong>semana</strong> e registro do que foi cumprido. Este ciclo alimenta a
                <strong> Jornada Gamificada</strong> do estudante e serve como guia prático para a execução do trabalho no AEE.
              </p>
              <p className="text-xs text-violet-600 mt-3 font-medium bg-violet-50 px-3 py-2 rounded-lg border border-violet-200">
                💡 Para documento de planejamento geral (objetivos, período, recursos, cronograma em fases), use a aba <strong>Planejamento AEE</strong>.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
                Histórico de ciclos de execução
              </h3>
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
              <div className="pt-4 border-t border-violet-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
                  Gerar ciclo de execução
                </h3>
                <FormExecucao metasPei={metasPei} onGerar={gerarPreviewExecucao} />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
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
        </div>
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

  // Conteúdos das outras abas - verificar se estão disponíveis
  const conteudoBarreiras = (paeeData.conteudo_diagnostico_barreiras as string) || "";
  const conteudoPlano = (paeeData.conteudo_plano_habilidades as string) || "";
  const conteudoTec = (paeeData.conteudo_tecnologia_assistiva as string) || "";

  // Log para debug
  useEffect(() => {
    console.log("📋 Jornada - Conteúdos disponíveis:", {
      barreiras: conteudoBarreiras ? `${conteudoBarreiras.length} chars` : "vazio",
      plano: conteudoPlano ? `${conteudoPlano.length} chars` : "vazio",
      tec: conteudoTec ? `${conteudoTec.length} chars` : "vazio",
    });
  }, [conteudoBarreiras, conteudoPlano, conteudoTec]);

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
    updateFields({ [key]: value });
  };

  const updateFields = (fields: Record<string, unknown>) => {
    const jornadas = (paeeData.jornadas_gamificadas || {}) as Record<string, unknown>;
    jornadas[chaveJornada] = { ...(jornadas[chaveJornada] as Record<string, unknown> || {}), ...fields };
    onUpdate({ ...paeeData, jornadas_gamificadas: jornadas });
  };

  const gerar = async (feedbackAjuste?: string) => {
    setLoading(true);
    setErro(null);
    aiLoadingStart(engine || "red", "paee");
    try {
      const body: Record<string, unknown> = {
        origem: origemSelecionada,
        engine,
        estudante: {
          nome: student.name,
          serie: student.grade,
          hiperfoco,
          ia_sugestao: ((peiData.ia_sugestao as string) || "").slice(0, 1500) || undefined,
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
        if (!textoFonte || !textoFonte.trim()) {
          console.error(`❌ Conteúdo não encontrado para ${nomeFonte}:`, {
            origem: origemSelecionada,
            conteudoPlano: conteudoPlano ? `${conteudoPlano.length} chars` : "vazio",
            conteudoBarreiras: conteudoBarreiras ? `${conteudoBarreiras.length} chars` : "vazio",
            conteudoTec: conteudoTec ? `${conteudoTec.length} chars` : "vazio",
          });
          setErro(`Gere o conteúdo na aba **${nomeFonte}** primeiro. O conteúdo precisa estar salvo e aprovado.`);
          return;
        }

        console.log(`✅ Usando conteúdo de ${nomeFonte}:`, `${textoFonte.length} caracteres`);
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
      updateFields({ texto: data.texto, status: "revisao", origem: origemSelecionada });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  const limpar = () => {
    setTexto("");
    setStatus("rascunho");
    setFeedback("");
    setMapaMental(null);
    updateFields({ texto: "", status: "rascunho", feedback: "", imagem_bytes: null });
  };

  const gerarMapaMental = async () => {
    setMapaLoading(true);
    setMapaErro(null);
    aiLoadingStart("yellow", "paee");
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
      aiLoadingStop();
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

  const downloadMapaPNG = () => {
    if (!mapaMental) return;

    // Se for base64, converter para blob
    let blob: Blob;
    if (mapaMental.startsWith("data:image")) {
      const base64Data = mapaMental.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: "image/png" });
    } else {
      // Se for URL, fazer fetch
      fetch(mapaMental)
        .then((res) => res.blob())
        .then((b) => {
          const url = URL.createObjectURL(b);
          const a = document.createElement("a");
          a.href = url;
          a.download = `MapaMental_${student.name.replace(/\s+/g, "_")}.png`;
          a.click();
          URL.revokeObjectURL(url);
        })
        .catch((err) => {
          console.error("Erro ao baixar mapa mental:", err);
          alert("Erro ao baixar imagem. Tente novamente.");
        });
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MapaMental_${student.name.replace(/\s+/g, "_")}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6 rounded-2xl bg-white min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
      {/* Header da aba */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <Map className="w-6 h-6 text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Jornada Gamificada</h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            <strong className="text-violet-700">Missão do(a) {student.name}:</strong> Transforme o planejamento do AEE em uma
            jornada gamificada motivadora para o estudante e a família. A IA cria um roteiro com linguagem de conquistas, missões
            e recompensas, sem incluir diagnósticos ou informações clínicas.
          </p>
          <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg">
            <p className="text-sm text-violet-800">
              Cada aba do PAEE pode virar uma <strong>jornada gamificada</strong>. Escolha a <strong>origem</strong> na lista abaixo.
              ⚠️ O material gerado será entregue ao estudante — diagnósticos e dados clínicos não são incluídos.
            </p>
          </div>
        </div>
      </div>

      {status !== "rascunho" && (
        <button
          type="button"
          onClick={limpar}
          className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-300 shadow-md hover:shadow-lg hover:bg-white hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
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
              <div className="space-y-3">
                <div className="border-2 border-violet-200 rounded-lg p-2 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mapaMental}
                    alt="Mapa mental da jornada"
                    className="max-w-full rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={downloadMapaPNG}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
                >
                  📥 Baixar PNG do Mapa Mental
                </button>
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
              {loading ? "⏳ Reescrevendo..." : "🔄 Gerar Novamente com Ajustes"}
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
              <div className="space-y-3">
                <div className="border-2 border-violet-200 rounded-lg p-2 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mapaMental}
                    alt="Mapa mental da jornada"
                    className="max-w-full rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={downloadMapaPNG}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
                >
                  📥 Baixar PNG do Mapa Mental
                </button>
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
              onClick={() => gerarPdfJornada(texto, student.name)}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center justify-center gap-2"
            >
              📄 Baixar PDF da Jornada
            </button>
            <button
              type="button"
              onClick={downloadCSV}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2"
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
        <div className="space-y-2 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2">
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
        <select value={frequencia} onChange={(e) => setFrequencia(e.target.value)} className="omni-input w-full">
          {FREQUENCIAS.map((f) => (
            <option key={f} value={f}>{f.replace("_", " ")}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data início</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="omni-input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data fim</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Foco principal</label>
        <input type="text" value={foco} onChange={(e) => setFoco(e.target.value)} className="omni-input w-full" />
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
        <div className="space-y-2 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2">
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
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="omni-input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data fim</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Foco</label>
        <input type="text" value={foco} onChange={(e) => setFoco(e.target.value)} className="omni-input w-full" />
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
    aiLoadingStart(engine || "red", "paee");
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
      const diagnosticoTexto = (data.diagnostico || "").trim();
      setDiagnostico(diagnosticoTexto);
      setStatus("revisao");

      // Atualização atômica do paeeData (mesmo padrão do PlanoHabilidadesTab)
      const novoPaeeData = {
        ...paeeData,
        conteudo_diagnostico_barreiras: diagnosticoTexto,
        status_diagnostico_barreiras: "revisao",
        input_original_diagnostico_barreiras: feedbackAjuste ? { obs: observacoes } : undefined,
      };
      onUpdate(novoPaeeData);

      // Salvar no Supabase explicitamente
      if (student?.id) {
        try {
          await fetch(`/api/students/${student.id}/paee`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paee_data: novoPaeeData }),
          });
        } catch (saveErr) {
          console.error("Erro ao salvar barreiras no Supabase:", saveErr);
        }
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar diagnóstico");
    } finally {
      setLoading(false);
      aiLoadingStop();
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
    <div className="space-y-6 p-6 rounded-2xl bg-white min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
      {/* Header da aba */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Mapear Barreiras</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-violet-700">Diagnóstico de Barreiras:</strong> Mapeie barreiras na aprendizagem (uso interno da equipe).
            O resultado ajuda a planejar estratégias; não será exposto ao estudante. A IA classifica as barreiras segundo a LBI
            (Lei Brasileira de Inclusão) em: <strong>Comunicacionais</strong>, <strong>Metodológicas</strong>,
            <strong> Atitudinais</strong>, <strong>Tecnológicas</strong> e <strong>Arquitetônicas</strong>.
          </p>
        </div>
      </div>

      {status !== "rascunho" && (
        <button
          type="button"
          onClick={limpar}
          className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-300 shadow-md hover:shadow-lg hover:bg-white hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
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
              className="omni-input w-full text-sm focus:border-violet-500 focus:ring-violet-500/20"
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
                <OmniLoader engine={engine} size={16} />
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
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus("aprovado");
                updateField("status_diagnostico_barreiras", "aprovado");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Validar e Finalizar
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("ajustando");
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Solicitar Ajustes
            </button>
            <button
              type="button"
              onClick={limpar}
              className="px-5 py-2.5 bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-300 rounded-xl shadow-md hover:shadow-lg hover:bg-white hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-semibold"
            >
              Descartar e Regenerar
            </button>
            <PdfDownloadButton
              text={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.pdf`}
              title={`Diagnóstico de Barreiras - ${student?.name || ""}`}
            />
            <DocxDownloadButton
              texto={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Diagnóstico de Barreiras - ${student?.name || ""}`}
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
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => gerar(feedback)}
              disabled={loading || !feedback.trim()}
              className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <OmniLoader engine={engine} size={16} />
                  Regerando...
                </>
              ) : (
                <>
                  Gerar Novamente com Ajustes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("revisao");
                setFeedback("");
              }}
              className="px-5 py-2.5 bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-300 rounded-xl shadow-md hover:shadow-lg hover:bg-white hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-semibold"
            >
              Cancelar Ajustes
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
              texto={diagnostico}
              filename={`Diagnostico_Barreiras_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Diagnóstico de Barreiras - ${student?.name || ""}`}
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
  const [isGenerating, setIsGenerating] = useState(false); // Flag para evitar sincronização durante geração

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

  // Carregar estado salvo - sincronizar com paeeData (apenas quando paeeData mudar externamente)
  useEffect(() => {
    // Não sincronizar durante geração (evitar race condition)
    if (isGenerating) {
      console.log("⏸️ Sincronização pausada durante geração");
      return;
    }

    const conteudoSalvo = (paeeData.conteudo_plano_habilidades as string) || "";
    const statusSalvo = (paeeData.status_plano_habilidades as string) || "rascunho";
    const inputSalvo = (paeeData.input_original_plano_habilidades as { foco?: string }) || {};

    // Só atualizar se o conteúdo salvo for diferente E não estiver vazio
    if (conteudoSalvo && conteudoSalvo !== plano) {
      console.log("🔄 Sincronizando plano do paeeData:", {
        conteudoSalvoLength: conteudoSalvo.length,
        planoLength: plano.length
      });
      setPlano(conteudoSalvo);
    }

    if (statusSalvo && statusSalvo !== status) {
      console.log("🔄 Sincronizando status do paeeData:", { statusSalvo, status });
      setStatus((statusSalvo as typeof status) || "rascunho");
    }

    if (inputSalvo?.foco && inputSalvo.foco !== foco) {
      setFoco(inputSalvo.foco);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paeeData.conteudo_plano_habilidades, paeeData.status_plano_habilidades, paeeData.input_original_plano_habilidades, isGenerating]);

  const updateField = (key: string, value: unknown) => {
    onUpdate({ ...paeeData, [key]: value });
  };

  const gerar = async (feedbackAjuste?: string) => {
    setLoading(true);
    setErro(null);
    setIsGenerating(true); // Bloquear sincronização durante geração
    aiLoadingStart(engine || "red", "paee");
    try {
      console.log("Gerando plano de habilidades...", { foco, engine });
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("Plano gerado com sucesso, salvando...", {
        planoLength: data.plano?.length,
        planoPreview: data.plano?.substring(0, 100)
      });

      const planoTexto = (data.plano || "").trim();

      if (!planoTexto) {
        throw new Error("A IA retornou um plano vazio. Tente novamente.");
      }

      // Atualizar paeeData de forma atômica PRIMEIRO (antes de atualizar estado local)
      const novoPaeeData = {
        ...paeeData,
        conteudo_plano_habilidades: planoTexto,
        status_plano_habilidades: "revisao",
        input_original_plano_habilidades: { foco },
      };

      // Atualizar via onUpdate PRIMEIRO (isso atualiza o estado pai)
      onUpdate(novoPaeeData);

      // Depois atualizar estado local (para garantir sincronização)
      setPlano(planoTexto);
      setStatus("revisao");

      console.log("✅ Estado atualizado:", {
        planoLength: planoTexto.length,
        status: "revisao",
        paeeDataUpdated: !!novoPaeeData.conteudo_plano_habilidades,
        planoPreview: planoTexto.substring(0, 100)
      });

      // Salvar no Supabase e aguardar
      if (student?.id) {
        try {
          const saveRes = await fetch(`/api/students/${student.id}/paee`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paee_data: novoPaeeData }),
          });

          if (!saveRes.ok) {
            console.error("Erro ao salvar plano no Supabase:", await saveRes.text());
          } else {
            console.log("✅ Plano salvo no Supabase com sucesso");
          }
        } catch (saveErr) {
          console.error("Erro ao salvar plano:", saveErr);
          // Não bloquear o fluxo, apenas logar o erro
        }
      }

      console.log("✅ Plano de habilidades gerado e disponível para jornada gamificada");
    } catch (e) {
      console.error("Erro ao gerar plano:", e);
      setErro(e instanceof Error ? e.message : "Erro ao gerar plano");
    } finally {
      setLoading(false);
      setIsGenerating(false); // Liberar sincronização após geração
      aiLoadingStop();
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
    <div className="space-y-6 p-6 rounded-2xl bg-white min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
      {/* Header da aba */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <Target className="w-6 h-6 text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Plano de Habilidades</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-violet-700">Plano de Intervenção AEE:</strong> A IA cria um plano detalhado de intervenção
            a partir do foco de atendimento selecionado. O plano inclui 3 metas SMART (curto, médio e longo prazo) com estratégias
            de ensino, recursos necessários, frequência de intervenção e critérios de sucesso. Este plano orienta o trabalho do AEE.
          </p>
        </div>
      </div>

      {status !== "rascunho" && (
        <button
          type="button"
          onClick={limpar}
          className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-300 shadow-md hover:shadow-lg hover:bg-white hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
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
                <OmniLoader engine={engine} size={16} />
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
          {!plano || plano.trim() === "" ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ O plano foi gerado mas o conteúdo não está disponível.
                <br />
                <span className="text-xs">Status: {status} | Plano length: {plano?.length || 0} | Loading: {loading ? "sim" : "não"}</span>
                <br />
                <button
                  onClick={() => {
                    const conteudoSalvo = (paeeData.conteudo_plano_habilidades as string) || "";
                    console.log("🔍 Debug - Tentando recarregar:", {
                      conteudoSalvoLength: conteudoSalvo.length,
                      planoLength: plano.length,
                      paeeDataKeys: Object.keys(paeeData)
                    });
                    if (conteudoSalvo) {
                      setPlano(conteudoSalvo);
                      setStatus("revisao");
                    }
                  }}
                  className="mt-2 px-3 py-1 bg-amber-600 text-white rounded text-xs"
                >
                  🔄 Tentar Recarregar do paeeData
                </button>
              </p>
            </div>
          ) : (
            <>
              <FormattedTextDisplay texto={plano} titulo="Plano de Habilidades Gerado" />
              <div className="text-xs text-slate-500">
                ✅ Plano carregado: {plano.length} caracteres
              </div>
            </>
          )}
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
              texto={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Plano de Habilidades - ${student?.name || ""}`}
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
              {loading ? "Aplicando ajustes..." : "🔄 Gerar Novamente com Ajustes"}
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
              texto={plano}
              filename={`Plano_Habilidades_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Plano de Habilidades - ${student?.name || ""}`}
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
    aiLoadingStart(engine || "red", "paee");
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
      const sugestoesTexto = (data.sugestoes || "").trim();
      setSugestoes(sugestoesTexto);
      setStatus("revisao");

      // Atualização atômica do paeeData (mesmo padrão do PlanoHabilidadesTab)
      const novoPaeeData = {
        ...paeeData,
        conteudo_tecnologia_assistiva: sugestoesTexto,
        status_tecnologia_assistiva: "revisao",
        input_original_tecnologia_assistiva: { dificuldade },
      };
      onUpdate(novoPaeeData);

      // Salvar no Supabase explicitamente
      if (student?.id) {
        try {
          await fetch(`/api/students/${student.id}/paee`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paee_data: novoPaeeData }),
          });
        } catch (saveErr) {
          console.error("Erro ao salvar tec assistiva no Supabase:", saveErr);
        }
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar sugestões");
    } finally {
      setLoading(false);
      aiLoadingStop();
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
    <div className="space-y-6 p-6 rounded-2xl bg-white min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
      {/* Header da aba */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <Puzzle className="w-6 h-6 text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Tecnologia Assistiva</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-violet-700">Recursos de Tecnologia Assistiva:</strong> A IA sugere recursos em 3 níveis
            (Baixa, Média e Alta Tecnologia) para promover autonomia e participação do estudante. Cada sugestão inclui descrição,
            finalidade, como usar na prática, benefícios e onde encontrar/comprar. Esses recursos eliminam barreiras e ampliam
            as possibilidades de participação do estudante.
          </p>
        </div>
      </div>

      {status !== "rascunho" && (
        <button
          type="button"
          onClick={limpar}
          className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-300 shadow-md hover:shadow-lg hover:bg-white hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
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
                <OmniLoader engine={engine} size={16} />
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
              texto={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Tecnologia Assistiva - ${student?.name || ""}`}
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
              {loading ? "Aplicando ajustes..." : "🔄 Gerar Novamente com Ajustes"}
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
              texto={sugestoes}
              filename={`Tecnologia_Assistiva_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Tecnologia Assistiva - ${student?.name || ""}`}
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
    aiLoadingStart(engine || "red", "paee");
    try {
      const res = await fetch("/api/paee/documento-articulacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frequencia: `${frequencia} (${turno})`,
          acoes,
          studentId: student?.id,
          studentName: student?.name || "",
          contextoPei: ((peiData.ia_sugestao as string) || "").slice(0, 2000) || undefined,
          diagnosis: diagnosis || undefined,
          feedback: feedbackAjuste || feedback || undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar documento");
      const docTexto = (data.documento || "").trim();

      // Atualização atômica
      const novoPaeeData = {
        ...paeeData,
        conteudo_documento_articulacao: docTexto,
        status_documento_articulacao: "revisao",
        input_original_documento_articulacao: { freq: frequencia, turno, acoes },
      };
      onUpdate(novoPaeeData);
      setDocumento(docTexto);
      setStatus("revisao");

      // Salvar no Supabase
      if (student?.id) {
        try {
          const saveRes = await fetch(`/api/students/${student.id}/paee`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paee_data: novoPaeeData }),
          });
          if (!saveRes.ok) {
            console.error("Erro ao salvar articulação no Supabase:", await saveRes.text());
          }
        } catch (saveErr) {
          console.error("Erro ao salvar articulação:", saveErr);
        }
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar documento");
    } finally {
      setLoading(false);
      aiLoadingStop();
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
    <div className="space-y-6 p-6 rounded-2xl bg-white min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
      {/* Header da aba */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 mb-2">Articulação</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-violet-700">Documento de Articulação AEE ↔ Sala Regular:</strong> A IA gera uma carta formal
            mas acolhedora que articula o trabalho desenvolvido no AEE com a sala regular. O documento inclui resumo das habilidades
            desenvolvidas, estratégias de generalização, orientações práticas, plano de ação conjunto e próximos passos.
            Este documento fortalece a colaboração entre AEE e sala de aula.
          </p>
        </div>
      </div>

      {status !== "rascunho" && (
        <button
          type="button"
          onClick={limpar}
          className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-300 shadow-md hover:shadow-lg hover:bg-white hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
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
                <OmniLoader engine={engine} size={16} />
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
              texto={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Documento de Articulação - ${student?.name || ""}`}
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
              {loading ? "Aplicando ajustes..." : "🔄 Gerar Novamente com Ajustes"}
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
              texto={documento}
              filename={`Documento_Articulacao_${student?.name?.replace(/\s+/g, "_") || "estudante"}.docx`}
              titulo={`Documento de Articulação - ${student?.name || ""}`}
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
