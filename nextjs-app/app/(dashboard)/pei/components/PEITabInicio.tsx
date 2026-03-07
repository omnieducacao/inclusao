"use client";

import React, { useState, useEffect } from "react";
import type { PEIData } from "@/lib/pei";
import Link from "next/link";
import { HelpTooltip } from "@/components/HelpTooltip";
import { StudentSelector } from "@/components/StudentSelector";
import { TransicaoAnoButton } from "../PEIClient";
import { PEIVersionHistory, createPEISnapshot } from "@/components/PEIVersionHistory";
import { OnboardingPanel, OnboardingResetButton } from "@/components/OnboardingPanel";
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Coluna Esquerda: Fundamentos */}
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200/60 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    Fundamentos do PEI
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O PEI organiza o planejamento individualizado com foco em <strong>barreiras e apoios</strong>.
                    <strong>Equidade:</strong> ajustar acesso, ensino e avaliação, sem baixar expectativas.
                    Base: <strong>LBI (Lei 13.146/2015)</strong>, LDB.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200/60 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-sky-600" />
                    Como usar a Omnisfera
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed">
                    <li><strong>Estudante:</strong> identificação + contexto + laudo (opcional)</li>
                    <li><strong>Evidências:</strong> o que foi observado e como aparece na rotina</li>
                    <li><strong>Mapeamento:</strong> barreiras + nível de apoio + potências</li>
                    <li><strong>Plano de Ação:</strong> acesso/ensino/avaliação</li>
                    <li><strong>Consultoria IA:</strong> gerar o documento técnico (validação do educador)</li>
                    <li><strong>Dashboard:</strong> KPIs + exportações + sincronização</li>
                  </ol>
                </div>

                <details className="rounded-lg border border-slate-200/60 p-3 bg-white">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-800 mb-2">
                    📘 PEI/PDI e a Prática Inclusiva — Amplie o conhecimento
                  </summary>
                  <div className="mt-2 text-xs text-slate-600 space-y-2 leading-relaxed">
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
                    <div>
                      <p className="font-semibold mb-1 text-xs">Registros fundamentais:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
                        <li>Identidade do aluno</li>
                        <li>Necessidades específicas (características mais recorrentes)</li>
                        <li>Dados sobre autonomia</li>
                        <li>Dados atualizados sobre atendimentos externos</li>
                        <li>Desenvolvimento escolar (leitura e raciocínio lógico-matemático)</li>
                        <li>Necessidades de material pedagógico e tecnologias assistivas</li>
                      </ul>
                    </div>
                    <p className="text-xs text-slate-500 italic mt-2">
                      A família deve acompanhar a elaboração do PEI/PDI e consentir formalmente, participando da análise das avaliações sistemáticas.
                    </p>
                  </div>
                </details>
              </div>

              {/* Coluna Direita: Gestão de Estudantes */}
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200/60 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-600" />
                    Gestão de Estudantes
                  </h4>

                  {/* Status do vínculo */}
                  {currentStudentId ? (
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 mb-3">
                      <p className="text-xs font-medium text-emerald-800">✅ Estudante vinculado ao Supabase (nuvem)</p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">student_id: {currentStudentId.slice(0, 8)}...</p>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 mb-3">
                      <p className="text-xs font-medium text-amber-800">📝 Modo rascunho (sem vínculo na nuvem)</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">Selecione um estudante ou carregue um backup JSON</p>
                    </div>
                  )}

                  {/* Seleção de Estudante */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Selecione o estudante</label>
                    <StudentSelector
                      students={students}
                      currentId={studentPendingId || null}
                      placeholder="Selecione o estudante"
                      onChange={(id) => {
                        setErroGlobal(null);
                        if (id) {
                          // Verificar se o estudante está na lista primeiro
                          const studentFromList = students.find((s) => s.id === id);
                          if (!studentFromList) {
                            setErroGlobal("Estudante não encontrado na lista");
                            // O primeiro Passo é gerar a Análise Inicial do estudante usando a função &quot;Gerar PEI com IA&quot;, que utilizará os relatórios ou o questionário.le.log("Armazenando estudante como pendente:", studentFromList.name);
                            return;
                          }
                          // Apenas armazenar como pendente - não carregar ainda
                          setStudentPendingId(id);
                          setStudentPendingName(studentFromList.name);
                          // Limpar URL
                          const url = new URL(window.location.href);
                          url.searchParams.delete("student");
                          window.history.pushState({}, "", url.toString());
                        } else {
                          // Limpar dados quando nenhum estudante está selecionado
                          setStudentPendingId(null);
                          setStudentPendingName("");
                          setErroGlobal(null);
                          // Limpar URL
                          const url = new URL(window.location.href);
                          url.searchParams.delete("student");
                          window.history.pushState({}, "", url.toString());
                        }
                      }}
                    />
                    {studentPendingId && (
                      <div className="mt-2 space-y-1.5">
                        <div className="p-2 rounded bg-white border border-slate-200">
                          <p className="text-[10px] font-medium text-slate-700">Estudante selecionado ✅ ({studentPendingName})</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Clique no botão abaixo para carregar como rascunho.</p>
                          <p className="text-[9px] text-slate-400 mt-1">ID: {studentPendingId}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              // Usar o valor atual diretamente
                              const idToLoad = studentPendingId;
                              if (!idToLoad) {
                                alert("Nenhum estudante selecionado");
                                console.error("idToLoad está vazio!");
                                return;
                              }

                              setErroGlobal(null);
                              const studentFromList = students.find((s) => s.id === idToLoad);
                              if (!studentFromList) {
                                setErroGlobal("Estudante não encontrado na lista");
                                alert("Estudante não encontrado na lista");
                                return;
                              }

                              setIsLoadingRascunho(true);
                              try {
                                // Tentar primeiro a API principal
                                let apiUrl = `/api/students/${idToLoad}`;
                                let res = await fetch(apiUrl);

                                // Se falhar, tentar a rota alternativa que busca apenas pei_data
                                if (!res.ok) {
                                  apiUrl = `/api/students/${idToLoad}/pei-data`;
                                  res = await fetch(apiUrl);
                                }

                                if (!res.ok) {
                                  // Tentar ler a mensagem de erro
                                  let errorMessage = "Estudante não encontrado";
                                  try {
                                    const errorData = await res.json();
                                    errorMessage = errorData.error || `Erro HTTP ${res.status}`;
                                    console.error("Erro da API:", errorData);
                                  } catch (e) {
                                    console.error("Erro ao ler resposta de erro:", e);
                                  }

                                  console.error("❌ Não foi possível buscar o PEI:", {
                                    id: idToLoad,
                                    status: res.status,
                                    statusText: res.statusText,
                                    errorMessage
                                  });

                                  setErroGlobal(`Erro: ${errorMessage} (Status: ${res.status})`);
                                  alert(`Erro ao buscar PEI: ${errorMessage}\n\nID: ${idToLoad}\nStatus: ${res.status}\n\nO estudante pode não ter PEI salvo ainda.`);
                                  setIsLoadingRascunho(false);
                                  return;
                                }

                                const data = await res.json();

                                // A rota alternativa retorna { pei_data: ... }, a principal retorna { pei_data: ..., id: ..., name: ... }
                                // Pegar o pei_data de qualquer uma das rotas
                                const peiDataJson = data.pei_data;
                                if (peiDataJson && typeof peiDataJson === 'object') {
                                }

                                if (peiDataJson && typeof peiDataJson === 'object' && !Array.isArray(peiDataJson) && Object.keys(peiDataJson).length > 0) {
                                  const campos = Object.keys(peiDataJson);

                                  // Criar cópia profunda do JSON
                                  const jsonCopiado = JSON.parse(JSON.stringify(peiDataJson)) as PEIData;

                                  // *** CORREÇÃO: Aplicar diretamente em vez de usar jsonPending ***
                                  // O fluxo jsonPending → useEffect → setTimeout criava race condition
                                  // com o useEffect de fetch (que dispara ao mudar isLoadingRascunho)
                                  skipNextFetchRef.current = true;
                                  setPeiData(jsonCopiado);
                                  setSelectedStudentId(idToLoad);

                                  // Limpar estados de seleção
                                  setStudentPendingId(null);
                                  setStudentPendingName("");
                                  setIsLoadingRascunho(false);
                                  // Saved state is managed by the hook
                                  setErroGlobal(null);

                                  // Limpar parâmetro student da URL
                                  const url = new URL(window.location.href);
                                  url.searchParams.delete("student");
                                  window.history.pushState({}, "", url.toString());

                                } else {
                                  // Estudante encontrado mas sem pei_data
                                  setErroGlobal("Estudante encontrado mas sem dados de PEI salvos no Supabase");
                                  alert("Estudante encontrado mas sem dados de PEI salvos.\n\nPreencha o PEI e use o botão 'Criar Novo Estudante' no Dashboard para salvar.");
                                  setStudentPendingId(null);
                                  setStudentPendingName("");
                                  setIsLoadingRascunho(false);
                                }
                              } catch (err) {
                                console.error("❌ Erro ao carregar estudante:", err);
                                const errorMsg = err instanceof Error ? err.message : String(err);
                                setErroGlobal(`Erro ao carregar dados: ${errorMsg}`);
                                alert(`Erro ao carregar dados do estudante:\n\n${errorMsg}\n\nID: ${idToLoad}`);
                                setStudentPendingId(null);
                                setStudentPendingName("");
                                setIsLoadingRascunho(false);
                              }
                            }}
                            className="flex-1 px-2 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-lg hover:bg-sky-700"
                          >
                            📥 Carregar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStudentPendingId(null);
                              setStudentPendingName("");
                            }}
                            className="px-2 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
                          >
                            🧹 Limpar
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="mt-2">
                      <Link
                        href="/estudantes"
                        className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
                      >
                        ← Estudantes
                      </Link>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      {/* eslint-disable-next-line react/no-unescaped-entities */}
                      {/* eslint-disable-next-line react/no-unescaped-entities */}
                      💡 <strong>Dica:</strong> Selecione um estudante e clique em <strong>Carregar</strong> para trabalhar como <strong>rascunho</strong> (sem vínculo com a nuvem). Use o botão "Criar Novo Estudante" abaixo para salvar como um novo estudante na nuvem quando estiver pronto.
                    </p>
                  </div>
                </div>

                {/* Backup Local: Upload JSON */}
                <div className="rounded-lg border border-slate-200/60 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                    <FileDown className="w-4 h-4 text-sky-600" />
                    1) Carregar Backup Local (.JSON)
                  </h4>
                  <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                    ✅ Não comunica com Supabase. Envie o arquivo e clique em <strong>Carregar no formulário</strong>.
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
                    className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg bg-white mb-2"
                  />
                  {jsonPending && (
                    <div className="mt-2 space-y-1.5">
                      <div className="p-2 rounded bg-white border border-slate-200">
                        <p className="text-[10px] font-medium text-slate-700">Arquivo pronto ✅ ({jsonFileName})</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Clique no botão abaixo para aplicar os dados.</p>
                      </div>
                      <details className="text-[10px]">
                        <summary className="cursor-pointer text-slate-600 mb-0.5">👀 Prévia do backup</summary>
                        <div className="p-1.5 bg-slate-50 rounded text-[10px] font-mono mt-1">
                          {JSON.stringify({
                            nome: jsonPending.nome,
                            serie: jsonPending.serie,
                            turma: jsonPending.turma,
                            diagnostico: jsonPending.diagnostico,
                            tem_ia_sugestao: !!jsonPending.ia_sugestao,
                          }, null, 2)}
                        </div>
                      </details>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => jsonPending && aplicarJson(jsonPending)}
                          className="flex-1 px-2 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-lg hover:bg-sky-700"
                        >
                          📥 Carregar
                        </button>
                        <button
                          onClick={() => {
                            setJsonPending(null);
                            setJsonFileName("");
                          }}
                          className="px-2 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
                        >
                          🧹 Limpar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Links rápidos PEI ↔ PAEE + Transição de ano */}
                {selectedStudentId && (
                  <div className="rounded-lg border border-slate-200/60 p-3 bg-white mb-3 space-y-2">
                    <a
                      href={`/paee?student=${selectedStudentId}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700"
                    >
                      <Puzzle className="w-4 h-4" />
                      Ver PAEE
                    </a>
                    <TransicaoAnoButton studentId={selectedStudentId} studentName={peiData.nome as string} />
                  </div>
                )}

                {/* Sincronização Cloud */}
                <div className="rounded-lg border border-slate-200/60 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    Omnisfera Cloud
                    {selectedStudentId && (
                      <PEIVersionHistory
                        studentId={selectedStudentId}
                        currentPeiData={peiData}
                        onRestore={() => window.location.reload()}
                      />
                    )}
                  </h4>

                  {selectedStudentId ? (
                    /* Estudante existente — atualizar */
                    <>
                      <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                        <strong>Atualiza os dados do PEI</strong> do estudante já salvo na nuvem.
                      </p>
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="w-full px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 mb-2"
                      >
                        {saving ? "Atualizando…" : "💾 Atualizar PEI"}
                      </button>
                    </>
                  ) : (
                    /* Novo estudante — criar */
                    <>
                      <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                        <strong>Cria um novo estudante</strong> no Supabase com todos os dados do PEI preenchidos.
                      </p>
                      <label className="flex items-start gap-2 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacyConsentAccepted}
                          onChange={(e) => setPrivacyConsentAccepted(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-[10px] text-slate-600">
                          Li e aceito a{" "}
                          <Link href="/privacidade" target="_blank" className="text-sky-600 hover:underline">
                            Política de Privacidade
                          </Link>{" "}
                          para o cadastro deste estudante (LGPD).
                        </span>
                      </label>
                      <button
                        onClick={handleSave}
                        disabled={saving || !peiData.nome || !privacyConsentAccepted}
                        className="w-full px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:opacity-60 mb-2"
                      >
                        {saving ? "Criando estudante…" : "🔗 Criar Novo Estudante"}
                      </button>
                    </>
                  )}
                  {saved && (
                    <a
                      href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(peiData, null, 2))}`}
                      download={`PEI_${(peiData.nome || "Estudante").toString().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`}
                      className="block w-full px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 text-center"
                    >
                      📂 BAIXAR BACKUP (.JSON)
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

  );
}