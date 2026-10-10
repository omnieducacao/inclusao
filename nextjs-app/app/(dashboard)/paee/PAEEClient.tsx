"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CabecalhoEstudante, EscolherEstudante } from "@/components/estudante/CabecalhoEstudante";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import type { CicloPAEE, MetaPei } from "@/lib/paee";
import type { EngineId } from "@/lib/ai-engines";
import {
  extrairMetasDoPei,
  criarCronogramaBasico,
  fmtDataIso,
  badgeStatus,
} from "@/lib/paee";
import { AlertTriangle, Target, Search, FileText } from "lucide-react";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { ResumoAnexosEstudante } from "@/components/ResumoAnexosEstudante";
import { JornadaTab } from "./components/JornadaTab";
import { FormPlanejamento } from "./components/FormPlanejamento";
import { FormExecucao } from "./components/FormExecucao";
import { CicloCard } from "./components/CicloCard";
import { MapearBarreirasTab } from "./components/MapearBarreirasTab";
import { PlanoHabilidadesTab } from "./components/PlanoHabilidadesTab";
import { TecAssistivaTab } from "./components/TecAssistivaTab";
import { ArticulacaoTab } from "./components/ArticulacaoTab";

import { useStudentMutation } from "@/hooks/useStudentMutation";
import { useStudentRealtime } from "@/hooks/useStudentRealtime";

type Student = { id: string; name: string; grade?: string | null; class_group?: string | null };
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

// Ciclo do AEE (Atendimento Educacional Especializado), na ordem em que acontece
const FASES_AEE: Array<{ n: number; titulo: string; ajuda: string; abas: Array<{ id: TabId; nome: string }> }> = [
  { n: 1, titulo: "Avaliar", ajuda: "Barreiras do estudante", abas: [{ id: "mapear-barreiras", nome: "Barreiras" }] },
  { n: 2, titulo: "Planejar", ajuda: "Habilidades, recursos e ciclo", abas: [
    { id: "plano-habilidades", nome: "Plano de habilidades" },
    { id: "tec-assistiva", nome: "Recursos de acessibilidade" },
    { id: "planejamento", nome: "Ciclo do AEE" },
  ] },
  { n: 3, titulo: "Atender", ajuda: "Metas semana a semana", abas: [
    { id: "execucao", nome: "Execução e metas" },
    { id: "jornada", nome: "Jornada do estudante" },
  ] },
  { n: 4, titulo: "Articular", ajuda: "Com a sala de aula", abas: [{ id: "articulacao", nome: "Com o professor da sala" }] },
];

function PAEEClientInner({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams?.get("student") || null;
  const mutation = useStudentMutation();
  const savingCiclo = mutation.loading;

  // Omni V5: Real-time Multi-User Subscription
  useStudentRealtime(currentId);

  // Abre na primeira fase do ciclo que falta (antes abria sempre em "Planejamento AEE")
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const pd = (student?.paee_data || {}) as Record<string, unknown>;
    const tem = (k: string) => Boolean(String(pd[k] || "").trim());
    if (!tem("conteudo_diagnostico_barreiras")) return "mapear-barreiras";
    if (!tem("conteudo_plano_habilidades") && !student?.planejamento_ativo) return "plano-habilidades";
    return "execucao";
  });
  const [cicloSelecionadoPlanejamento, setCicloSelecionadoPlanejamento] = useState<CicloPAEE | null>(null);
  const [cicloSelecionadoExecucao, setCicloSelecionadoExecucao] = useState<CicloPAEE | null>(null);
  const [cicloPreview, setCicloPreview] = useState<CicloPAEE | null>(null);
  const [saved, setSaved] = useState(false);
  const [jornadaEngine, setJornadaEngine] = useState<EngineId>("red");
  const [paeeData, setPaeeData] = useState<Record<string, unknown>>({});
  const [relatorio, setRelatorio] = useState<string | null>(null);
  const [relLoading, setRelLoading] = useState(false);
  const [relErro, setRelErro] = useState<string | null>(null);
  // Onda 5: o salvamento do PAEE avisa quando falha (antes o erro ia só para o console e o trabalho se perdia)
  const [salvamento, setSalvamento] = useState<{ estado: "salvando" | "salvo" | "erro"; hora?: string } | null>(null);
  const salvarPaee = async (id: string, data: Record<string, unknown>) => {
    setSalvamento({ estado: "salvando" });
    try {
      const res = await fetch(`/api/students/${id}/paee`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paee_data: data }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSalvamento({ estado: "salvo", hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) });
    } catch {
      setSalvamento({ estado: "erro" });
    }
  };

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

      // Onda 16: o salvar do ciclo mostra "Salvando…" e avisa quando falha (antes dizia ok sempre)
      setSalvamento({ estado: "salvando" });
      const resultado = await mutation.updatePAEECiclos(student.id, {
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
      if (!resultado) {
        setSalvamento({ estado: "erro" });
        return false;
      }
      setSalvamento({ estado: "salvo", hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) });
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
      <EscolherEstudante students={students} texto="O PAEE organiza o AEE (Atendimento Educacional Especializado) dele em ciclos." />
    );
  }

  if (!student) {
    return <EscolherEstudante students={students} texto="O PAEE organiza o AEE (Atendimento Educacional Especializado) dele em ciclos." naoEncontrado={Boolean(studentId)} />;
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


  return (
    <div className="space-y-6">
      {salvamento?.estado === "erro" && (
        <div className="omni-aviso omni-aviso--erro" role="alert">
          <AlertTriangle className="omni-aviso__icone" aria-hidden />
          <div>
            <div className="omni-aviso__titulo">Não conseguimos salvar o PAEE agora</div>
            <div className="omni-aviso__texto">O que você fez continua nesta tela. Confira a internet e faça a última alteração de novo; se persistir, avise o suporte.</div>
          </div>
          <span />
        </div>
      )}
      <CabecalhoEstudante
        students={students}
        student={{ ...student, pei_data: peiData }}
        acoes={
          <>
            {salvamento && salvamento.estado !== "erro" && (
              <span className="omni-apoio" role="status" aria-live="polite">
                {salvamento.estado === "salvando" ? "Salvando…" : `Salvo às ${salvamento.hora}`}
              </span>
            )}
            <a href={`/pei?student=${student.id}`} className="omni-btn omni-btn--discreto omni-btn--pequeno">
              <FileText aria-hidden /> Ver PEI
            </a>
          </>
        }
      />

      {/* Painel PEI Retrátil */}
      {student && (
        <PEISummaryPanel peiData={peiData} studentName={student.name} />
      )}

      {/* Onda 9: as sete abas viram o ciclo do AEE (Avaliar → Planejar → Atender → Articular) */}
      {student && (() => {
        const faseAtual = FASES_AEE.find((f) => f.abas.some((x) => x.id === activeTab)) || FASES_AEE[0];
        const feito: Record<number, boolean> = {
          1: temBarreiras,
          2: temPlano || temTec || Boolean(cicloAtivoPlanejamento),
          3: Boolean(cicloAtivoExecucao),
          4: temArticulacao,
        };
        return (
          <>
            <p className="omni-apoio" style={{ margin: 0 }}>
              O PAEE (Plano de Atendimento Educacional Especializado) organiza o AEE (Atendimento Educacional Especializado) do estudante em quatro fases.
            </p>
            <nav aria-label="Ciclo do AEE">
              <ol className="omni-passos">
                {FASES_AEE.map((f) => {
                  const atual = f.n === faseAtual.n;
                  return (
                    <li key={f.n} className={`omni-passo ${feito[f.n] ? "omni-passo--feito" : ""} ${atual ? "omni-passo--atual" : ""}`} style={{ padding: 0 }}>
                      <button type="button" onClick={() => setActiveTab(f.abas[0].id)} aria-current={atual ? "step" : undefined}
                        style={{ display: "flex", gap: 10, alignItems: "flex-start", width: "100%", padding: "var(--space-3)", background: "none", border: 0, textAlign: "left", cursor: "pointer", color: "inherit", borderRadius: "inherit" }}>
                        <span className="omni-passo__num" aria-hidden>{feito[f.n] ? "✓" : f.n}</span>
                        <span>
                          <span className="omni-passo__titulo">{f.titulo}</span>
                          <span className="omni-passo__estado" style={{ display: "block" }}>{feito[f.n] ? "Feito" : f.ajuda}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
            {faseAtual.abas.length > 1 && (
              <div className="omni-abas" role="tablist" aria-label={`Partes de ${faseAtual.titulo}`}>
                {faseAtual.abas.map((x) => (
                  <button key={x.id} type="button" role="tab" aria-selected={activeTab === x.id} className="omni-aba" onClick={() => setActiveTab(x.id)}>
                    {x.nome}
                  </button>
                ))}
              </div>
            )}
          </>
        );
      })()}

      {student && activeTab === "mapear-barreiras" && (
        <MapearBarreirasTab
          student={student}
          peiData={peiData}
          diagnosis={diagnosis}
          paeeData={paeeData}
          onUpdate={(data) => {
            setPaeeData(data);
            if (student?.id) {
              salvarPaee(student.id, data);
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
              await salvarPaee(student.id, data);
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
              salvarPaee(student.id, data);
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
              salvarPaee(student.id, data);
            }
          }}
        />
      )}

      {student && activeTab === "planejamento" && (
        <section className="omni-cartao" aria-labelledby="paee-ciclo-titulo">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Search aria-hidden style={{ width: 22, height: 22, color: "var(--acao)", flexShrink: 0, marginTop: 2 }} />
            <div style={{ display: "grid", gap: 6 }}>
              <h2 id="paee-ciclo-titulo" className="omni-cartao__titulo" style={{ margin: 0, font: "800 18px/24px var(--font-sans)" }}>Ciclo do AEE</h2>
              <p className="omni-cartao__texto" style={{ margin: 0 }}>
                O documento de referência do atendimento: objetivos, período, recursos e cronograma em fases (visão geral).
                Use &quot;Definir como ativo&quot; para que as outras partes do PAEE usem este ciclo.
              </p>
              <p className="omni-apoio" style={{ margin: 0 }}>
                Para metas semana a semana e a jornada do estudante, use a parte <strong>Execução e metas</strong>.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 24 }}>
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Ciclos já feitos</h3>
              {cicloAtivoPlanejamento && (
                <div className="omni-cartao omni-cartao--plano" style={{ padding: 16, gap: 4 }}>
                  <span className="omni-estado omni-estado--sucesso" style={{ alignSelf: "flex-start" }}>Ciclo ativo</span>
                  <div style={{ color: "var(--tinta)" }}>
                    Foco: {cicloAtivoPlanejamento.config_ciclo?.foco_principal || "—"}
                  </div>
                  <div className="omni-apoio">
                    {fmtDataIso(cicloAtivoPlanejamento.config_ciclo?.data_inicio)} a {fmtDataIso(cicloAtivoPlanejamento.config_ciclo?.data_fim)}
                  </div>
                </div>
              )}
              {ciclosPlanejamento.length > 0 && (
                <label className="omni-campo">
                  <span className="omni-campo__rotulo">Escolher um ciclo</span>
                  <select
                    className="omni-entrada"
                    style={{ maxWidth: "none" }}
                    value={cicloSelecionadoPlanejamento?.ciclo_id || ""}
                    onChange={(e) => {
                      const c = ciclosPlanejamento.find((x) => x.ciclo_id === e.target.value);
                      setCicloSelecionadoPlanejamento(c || null);
                      setCicloPreview(null);
                    }}
                  >
                    <option value="">Selecione um ciclo</option>
                    {ciclosPlanejamento.map((c) => {
                      const [estado] = badgeStatus(c.status || "rascunho");
                      const cfg = c.config_ciclo || {};
                      return (
                        <option key={String(c.ciclo_id)} value={String(c.ciclo_id)}>
                          {`${cfg.foco_principal || "Ciclo"} · ${fmtDataIso(cfg.data_inicio)} · versão ${c.versao || 1} · ${estado}`}
                        </option>
                      );
                    })}
                  </select>
                </label>
              )}
              {ciclosPlanejamento.length > 0 && cicloSelecionadoPlanejamento?.ciclo_id && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button
                    type="button"
                    className="omni-btn omni-btn--secundario omni-btn--pequeno"
                    onClick={() => definirCicloAtivo(cicloSelecionadoPlanejamento.ciclo_id!)}
                  >
                    Definir como ativo
                  </button>
                  <button
                    type="button"
                    className="omni-btn omni-btn--primario omni-btn--pequeno"
                    disabled={relLoading}
                    aria-busy={relLoading}
                    onClick={async () => {
                      setRelLoading(true);
                      setRelErro(null);
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
                        else setRelErro(data.error || "A geração do relatório falhou. Tente de novo.");
                      } catch {
                        setRelErro("Não conseguimos gerar o relatório agora. Confira a internet e tente de novo.");
                      } finally {
                        setRelLoading(false);
                        aiLoadingStop();
                      }
                    }}
                  >
                    <FileText aria-hidden /> {relLoading ? "Gerando…" : "Relatório do ciclo"}
                  </button>
                </div>
              )}
              {relErro && (
                <div className="omni-aviso omni-aviso--erro" role="alert">
                  <AlertTriangle className="omni-aviso__icone" aria-hidden />
                  <div><div className="omni-aviso__titulo">{relErro}</div></div>
                  <span />
                </div>
              )}
              {relatorio && (
                <div className="omni-resultado">
                  <div className="omni-resultado__topo">
                    <h4 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Relatório do ciclo</h4>
                    <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => setRelatorio(null)}>Fechar</button>
                  </div>
                  <div className="omni-resultado__texto">
                    <FormattedTextDisplay texto={relatorio} />
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gap: 12, paddingTop: 16, borderTop: "1px solid var(--borda)" }}>
                <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Gerar novo ciclo</h3>
                <FormPlanejamento
                  metasPei={metasPei}
                  hiperfoco={hiperfoco}
                  onGerar={gerarPreviewPlanejamento}
                />
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Prévia do ciclo</h3>
              {cicloParaVerPlanejamento ? (
                <CicloCard ciclo={cicloParaVerPlanejamento} onSalvar={cicloPreview?.tipo === "planejamento_aee" ? () => saveCiclo(cicloParaVerPlanejamento) : undefined} saving={savingCiclo} onLimpar={() => setCicloPreview(null)} />
              ) : (
                <div className="omni-vazio">
                  <div className="omni-vazio__texto">Escolha um ciclo ou gere um novo.</div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {student && activeTab === "execucao" && (
        <section className="omni-cartao" aria-labelledby="paee-execucao-titulo">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Target aria-hidden style={{ width: 22, height: 22, color: "var(--acao)", flexShrink: 0, marginTop: 2 }} />
            <div style={{ display: "grid", gap: 6 }}>
              <h2 id="paee-execucao-titulo" className="omni-cartao__titulo" style={{ margin: 0, font: "800 18px/24px var(--font-sans)" }}>Execução e metas</h2>
              <p className="omni-cartao__texto" style={{ margin: 0 }}>
                O guia prático do atendimento: metas SMART (específicas, mensuráveis, alcançáveis, relevantes e com prazo),
                ações por <strong>semana</strong> e registro do que foi feito. Este ciclo alimenta a jornada do estudante.
              </p>
              <p className="omni-apoio" style={{ margin: 0 }}>
                Para o planejamento geral (objetivos, período, recursos e cronograma em fases), use a parte <strong>Ciclo do AEE</strong>.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 24 }}>
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Ciclos de execução já feitos</h3>
              {ciclosExecucao.length > 0 && (
                <>
                  <label className="omni-campo">
                    <span className="omni-campo__rotulo">Escolher um ciclo</span>
                    <select
                      className="omni-entrada"
                      style={{ maxWidth: "none" }}
                      value={cicloSelecionadoExecucao?.ciclo_id || ""}
                      onChange={(e) => {
                        const c = ciclosExecucao.find((x) => x.ciclo_id === e.target.value);
                        setCicloSelecionadoExecucao(c || null);
                        setCicloPreview(null);
                      }}
                    >
                      <option value="">Selecione um ciclo</option>
                      {ciclosExecucao.map((c) => {
                        const cfg = c.config_ciclo || {};
                        return (
                          <option key={String(c.ciclo_id)} value={String(c.ciclo_id)}>
                            {`${cfg.foco_principal || "Ciclo"} · ${fmtDataIso(cfg.data_inicio)}`}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  {cicloSelecionadoExecucao?.ciclo_id && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="omni-btn omni-btn--secundario omni-btn--pequeno"
                        onClick={() => definirCicloAtivo(cicloSelecionadoExecucao.ciclo_id!)}
                      >
                        Definir como ativo
                      </button>
                    </div>
                  )}
                </>
              )}
              <div style={{ display: "grid", gap: 12, paddingTop: 16, borderTop: "1px solid var(--borda)" }}>
                <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Gerar ciclo de execução</h3>
                <FormExecucao metasPei={metasPei} onGerar={gerarPreviewExecucao} />
              </div>
            </div>
            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <h3 style={{ margin: 0, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>Prévia do ciclo</h3>
              {cicloParaVerExecucao ? (
                <CicloCard ciclo={cicloParaVerExecucao} onSalvar={cicloPreview?.tipo === "execucao_smart" ? () => saveCiclo(cicloParaVerExecucao) : undefined} saving={savingCiclo} onLimpar={() => setCicloPreview(null)} />
              ) : (
                <div className="omni-vazio">
                  <div className="omni-vazio__texto">Gere um ciclo de execução para ver a prévia aqui.</div>
                </div>
              )}
            </div>
          </div>
        </section>
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
              salvarPaee(student.id, data);
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
      <p className="omni-apoio" role="status" style={{ textAlign: "center", padding: "32px 0" }}>Carregando…</p>
    }>
      <PAEEClientInner key={studentId ?? "nenhum"} students={students} studentId={studentId} student={student} />
    </Suspense>
  );
}
