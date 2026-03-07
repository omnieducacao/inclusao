"use client";

import React, { useState, useEffect } from "react";
import type { PEIData } from "@/lib/pei";
import Link from "next/link";
import { HelpTooltip } from "@/components/HelpTooltip";
import { StudentSelector } from "@/components/StudentSelector";
import { TransicaoAnoButton } from "../PEIClient";
import { PEIVersionHistory, createPEISnapshot } from "@/components/PEIVersionHistory";
import { OnboardingPanel, OnboardingResetButton } from "@/components/OnboardingPanel";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@omni/ds";
import {
  SERIES,
  detectarNivelEnsino,
} from "@/lib/pei";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  User,
  Search,
  Users,
  Radar,
  Puzzle,
  RotateCw,
  ClipboardList,
  Bot,
  FileDown,
  Info,
  Settings,
  BookOpen,
  Send,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

type TabInicioProps = {
  students: { id: string; name: string }[];
  peiData: PEIData;
  setPeiData: React.Dispatch<React.SetStateAction<PEIData>>;
  handleSave: () => void;
  handleUpdate: () => void;
  saving: boolean;
  saved: boolean;
  currentStudentId: string | null;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string) => void;
  isLoadingRascunho: boolean;
  setIsLoadingRascunho: React.Dispatch<React.SetStateAction<boolean>>;
  skipNextFetchRef: React.MutableRefObject<boolean>;
  aplicarJson: (data: Record<string, unknown>) => void;
  jsonPending: Record<string, unknown> | null;
  setJsonPending: (v: Record<string, unknown> | null) => void;
  jsonFileName: string | null;
  setJsonFileName: (v: string | null) => void;
  studentPendingId: string | null;
  setStudentPendingId: (id: string | null) => void;
  studentPendingName: string | null;
  setStudentPendingName: (name: string | null) => void;
  serie: string;
  showOnboarding: boolean;
  setShowOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
  privacyConsentAccepted: boolean;
  setPrivacyConsentAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  progresso: number;
  tabStatuses: Record<string, string>;
  erroGlobal: string | null;
  setErroGlobal: React.Dispatch<React.SetStateAction<string | null>>;
};

export function PEITabInicio(props: TabInicioProps) {
  const {
    students, peiData, setPeiData, handleSave, handleUpdate, saving, saved,
    currentStudentId, selectedStudentId, setSelectedStudentId,
    isLoadingRascunho, setIsLoadingRascunho, skipNextFetchRef, aplicarJson,
    jsonPending, setJsonPending, jsonFileName, setJsonFileName,
    studentPendingId, setStudentPendingId, studentPendingName, setStudentPendingName,
    serie, showOnboarding, setShowOnboarding,
    privacyConsentAccepted, setPrivacyConsentAccepted,
    progresso, tabStatuses, erroGlobal, setErroGlobal,
  } = props;

  return (
    <div className="space-y-4">
      {/* Título da aba com ícone */}
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-5 h-5 text-sky-600" />
        <h3 className="text-lg font-semibold text-slate-800">Central de Fundamentos e Gestão</h3>
      </div>

      {/* Grid principal: 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coluna Esquerda: Fundamentos */}
        <div className="space-y-4">
          <Card variant="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                Fundamentos do PEI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 leading-relaxed">
                O PEI organiza o planejamento individualizado com foco em <strong>barreiras e apoios</strong>.
                <strong>Equidade:</strong> ajustar acesso, ensino e avaliação, sem baixar expectativas.
                Base: <strong>LBI (Lei 13.146/2015)</strong>, LDB.
              </p>
            </CardContent>
          </Card>

          <Card variant="default">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-5 h-5 text-violet-600" />
                Como usar a Omnisfera
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
                <li><strong>Estudante:</strong> identificação + contexto + laudo (opcional)</li>
                <li><strong>Evidências:</strong> o que foi observado e como aparece na rotina</li>
                <li><strong>Mapeamento:</strong> barreiras + nível de apoio + potências</li>
                <li><strong>Plano de Ação:</strong> acesso/ensino/avaliação</li>
                <li><strong>Consultoria IA:</strong> gerar o documento técnico (validação do educador)</li>
                <li><strong>Dashboard:</strong> KPIs + exportações + sincronização</li>
              </ol>
            </CardContent>
          </Card>

          <Card variant="default" className="overflow-hidden">
            <details className="group">
              <summary className="cursor-pointer p-4 bg-slate-50/50 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors">
                📘 PEI/PDI e a Prática Inclusiva — Amplie o conhecimento
              </summary>
              <CardContent className="pt-2 pb-4 text-xs text-slate-600 space-y-3 leading-relaxed border-t border-slate-100">
                <p>
                  O <strong>Plano Educacional Individualizado (PEI)</strong>, também denominado <strong>Plano de Desenvolvimento Individual (PDI)</strong>, é um roteiro de intervenção pedagógica personalizado e flexível que norteia o processo de aprendizagem em sala comum para público-alvo da educação inclusiva. Tem o objetivo de <strong>remover obstáculos</strong> e <strong>promover a escolarização</strong>.
                </p>
                <p>
                  O PEI/PDI leva em conta as particularidades do(a) aluno(a), incluindo-o no repertório da classe que frequenta e tendo como referência a <strong>mesma matriz curricular</strong> do ano a ser cursado.
                </p>
                <p>
                  <strong>Caráter obrigatório:</strong> deve ser atualizado sistematicamente e compor a documentação escolar de alunos com deficiência, transtorno global do desenvolvimento e altas habilidades/superdotação. Respeita as orientações do laudo médico, quando houver.
                </p>
                <p>
                  <strong>Elaboração:</strong> pela equipe multidisciplinar da escola; discutido com a família e profissionais externos no início do ano letivo; replanejado ao final de cada unidade e/ou período de avaliação.
                </p>
                <div className="bg-violet-50/50 p-3 rounded-lg border border-violet-100/50">
                  <p className="font-semibold mb-2 text-violet-900 text-xs flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-violet-600" /> Registros fundamentais:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-1 text-violet-800 text-[11px]">
                    <li>Identidade do aluno</li>
                    <li>Necessidades específicas (características mais recorrentes)</li>
                    <li>Dados sobre autonomia</li>
                    <li>Dados atualizados sobre atendimentos externos</li>
                    <li>Desenvolvimento escolar (leitura e raciocínio lógico-matemático)</li>
                    <li>Necessidades de material pedagógico e tecnologias assistivas</li>
                  </ul>
                </div>
                <p className="text-[11px] text-slate-500 italic mt-2 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>A família deve acompanhar a elaboração do PEI/PDI e consentir formalmente, participando da análise das avaliações sistemáticas.</span>
                </p>
              </CardContent>
            </details>
          </Card>
        </div>

        {/* Coluna Direita: Gestão de Estudantes */}
        <div className="space-y-4">
          <Card variant="default">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-600" />
                Gestão de Estudantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Status do vínculo */}
              {currentStudentId ? (
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 mb-4 shadow-sm">
                  <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Estudante vinculado ao Hub
                  </p>
                  <p className="text-[10px] text-emerald-600/80 mt-1 pl-5 font-mono">ID: {currentStudentId.slice(0, 8)}...</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 mb-4 shadow-sm">
                  <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Modo rascunho (Local)
                  </p>
                  <p className="text-[10px] text-amber-600/80 mt-1 pl-5">Nenhum vínculo na nuvem. Selecione ou crie um novo.</p>
                </div>
              )}

              {/* Seleção de Estudante */}
              <div className="mb-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">Selecione o estudante</label>
                <StudentSelector
                  students={students}
                  currentId={studentPendingId || null}
                  placeholder="Pesquisar estudantes cadastrados..."
                  onChange={(id) => {
                    setErroGlobal(null);
                    if (id) {
                      const studentFromList = students.find((s) => s.id === id);
                      if (!studentFromList) {
                        setErroGlobal("Estudante não encontrado na lista");
                        return;
                      }
                      setStudentPendingId(id);
                      setStudentPendingName(studentFromList.name);
                      const url = new URL(window.location.href);
                      url.searchParams.delete("student");
                      window.history.pushState({}, "", url.toString());
                    } else {
                      setStudentPendingId(null);
                      setStudentPendingName("");
                      setErroGlobal(null);
                      const url = new URL(window.location.href);
                      url.searchParams.delete("student");
                      window.history.pushState({}, "", url.toString());
                    }
                  }}
                />
                {studentPendingId && (
                  <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 rounded-xl bg-violet-50/40 border border-violet-100 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="text-xs font-bold text-violet-900">{studentPendingName}</p>
                        <p className="text-[10px] text-violet-600/70 mt-0.5">Clique em Carregar para iniciar edição</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full flex-1"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          const idToLoad = studentPendingId;
                          if (!idToLoad) return;

                          setErroGlobal(null);
                          const studentFromList = students.find((s) => s.id === idToLoad);
                          if (!studentFromList) {
                            setErroGlobal("Estudante não encontrado na lista");
                            return;
                          }

                          setIsLoadingRascunho(true);
                          try {
                            let apiUrl = `/api/students/${idToLoad}`;
                            let res = await fetch(apiUrl);

                            if (!res.ok) {
                              apiUrl = `/api/students/${idToLoad}/pei-data`;
                              res = await fetch(apiUrl);
                            }

                            if (!res.ok) {
                              let errorMessage = "Estudante não encontrado";
                              try {
                                const errorData = await res.json();
                                errorMessage = errorData.error || `Erro HTTP ${res.status}`;
                              } catch (e) {
                                // silent
                              }
                              setErroGlobal(`Erro: ${errorMessage} (Status: ${res.status})`);
                              setIsLoadingRascunho(false);
                              return;
                            }

                            const data = await res.json();
                            const peiDataJson = data.pei_data;

                            if (peiDataJson && typeof peiDataJson === 'object' && !Array.isArray(peiDataJson) && Object.keys(peiDataJson).length > 0) {
                              const jsonCopiado = JSON.parse(JSON.stringify(peiDataJson)) as PEIData;
                              skipNextFetchRef.current = true;
                              setPeiData(jsonCopiado);
                              setSelectedStudentId(idToLoad);
                              setStudentPendingId(null);
                              setStudentPendingName("");
                              setIsLoadingRascunho(false);
                              setErroGlobal(null);

                              const url = new URL(window.location.href);
                              url.searchParams.delete("student");
                              window.history.pushState({}, "", url.toString());
                            } else {
                              setErroGlobal("Estudante encontrado mas sem dados de PEI salvos no Supabase");
                              setStudentPendingId(null);
                              setStudentPendingName("");
                              setIsLoadingRascunho(false);
                            }
                          } catch (err) {
                            const errorMsg = err instanceof Error ? err.message : String(err);
                            setErroGlobal(`Erro ao carregar dados: ${errorMsg}`);
                            setStudentPendingId(null);
                            setStudentPendingName("");
                            setIsLoadingRascunho(false);
                          }
                        }}
                      >
                        📥 Carregar Rascunho
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setStudentPendingId(null);
                          setStudentPendingName("");
                        }}
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigate to Estudantes module */}
                <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500 bg-slate-50/50 p-2 rounded-lg">
                  <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />Não encontrou o estudante?</span>
                  <Link href="/estudantes" className="text-violet-600 hover:text-violet-700 font-medium hover:underline flex items-center gap-1">
                    Ir para o Gestor <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup Local: Upload JSON */}
          <Card variant="default">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileDown className="w-5 h-5 text-violet-600" />
                Backup Offline (.JSON)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-slate-500 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                Ideal para restaurações manuais. Selecione o arquivo `.json` exportado anteriormente na plataforma e certifique-se da compatibilidade da versão.
              </p>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try {
                        const json = JSON.parse(ev.target?.result as string);
                        setJsonPending(json as PEIData);
                        setJsonFileName(file.name);
                      } catch (err) {
                        alert(`Erro ao ler JSON: ${err}`);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all mb-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
              {jsonPending && (
                <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 rounded-xl bg-violet-50/40 border border-violet-100 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-violet-900 line-clamp-1" title={jsonFileName!}>
                        {jsonFileName}
                      </p>
                      <p className="text-[10px] text-violet-600/70 mt-0.5">Pronto para injeção</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => jsonPending && aplicarJson(jsonPending)}
                    >
                      📥 Extrair Dados
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setJsonPending(null);
                        setJsonFileName("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sincronização Cloud */}
          <Card variant="glass" className="mb-6 relative overflow-visible">
            {/* Decorative glowing orb */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  Omnisfera Sync
                </span>
                {selectedStudentId && (
                  <PEIVersionHistory
                    studentId={selectedStudentId}
                    currentPeiData={peiData}
                    onRestore={() => window.location.reload()}
                  />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {selectedStudentId ? (
                /* Estudante existente — atualizar */
                <>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-white/50 p-2 rounded-lg border border-white/60">
                    Suas alterações neste rascunho serão salvas em definitivo no **banco de dados da nuvem**, afetando todos os usuários que têm este estudante vinculado.
                  </p>
                  <Button
                    variant="primary"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-500"
                    onClick={handleUpdate}
                    loading={saving}
                    disabled={saving}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Atualizar PEI na Nuvem
                  </Button>
                </>
              ) : (
                /* Novo estudante — criar */
                <>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    Este formulário criará um <strong>Novo Perfil de Estudante</strong> global na plataforma.
                  </p>
                  <label className="flex items-start gap-2.5 mb-4 cursor-pointer group bg-white/40 p-2.5 rounded-lg hover:bg-white/60 transition-colors border border-transparent hover:border-violet-100/50">
                    <input
                      type="checkbox"
                      checked={privacyConsentAccepted}
                      onChange={(e) => setPrivacyConsentAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500/30 transition-shadow"
                    />
                    <span className="text-[11px] text-slate-600 leading-snug">
                      Afirmo ter consentimento da família e aceito a{" "}
                      <Link href="/privacidade" target="_blank" className="text-violet-600 font-medium hover:underline">
                        Política de LGPD
                      </Link>{" "}
                      no tratamento destes dados sensíveis.
                    </span>
                  </label>
                  <Button
                    variant="primary"
                    className="w-full bg-violet-600 hover:bg-violet-500 focus-visible:ring-violet-500"
                    onClick={handleSave}
                    loading={saving}
                    disabled={saving || !peiData.nome || !privacyConsentAccepted}
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Criar Perfil na Nuvem
                  </Button>
                </>
              )}
              {saved && (
                <a
                  href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(peiData, null, 2))}`}
                  download={`PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`}
                  className="flex w-full items-center justify-center mt-3 px-3 py-2 border border-slate-200 bg-white/60 text-slate-700 text-xs font-semibold rounded-xl hover:bg-white transition-colors shadow-sm"
                >
                  📥 Exportar Backup Manual (.JSON)
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

  );
}