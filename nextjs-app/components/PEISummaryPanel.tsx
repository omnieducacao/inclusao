"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, FileText, User, AlertTriangle, Target, Users, BookOpen } from "lucide-react";
import type { PEIData } from "@/lib/pei";
import { LISTAS_BARREIRAS, NIVEIS_SUPORTE } from "@/lib/pei";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";

type Props = {
  peiData: PEIData | Record<string, unknown> | null;
  studentName?: string;
};

export function PEISummaryPanel({ peiData, studentName }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchParams = useSearchParams();
  const studentId = searchParams.get("student");

  if (!peiData || Object.keys(peiData).length === 0) {
    return null;
  }

  const relatorioIA = (peiData.ia_sugestao as string) || "";
  const barreiras = (peiData.barreiras_selecionadas || {}) as Record<string, string[]>;
  const niveis = (peiData.niveis_suporte || {}) as Record<string, string>;
  const potencias = (peiData.potencias || []) as string[];
  const hiperfoco = (peiData.hiperfoco as string) || "";
  const redeApoio = (peiData.rede_apoio || []) as string[];
  const diagnostico = (peiData.diagnostico as string) || "";
  const estrategiasAcesso = (peiData.estrategias_acesso || []) as string[];
  const estrategiasEnsino = (peiData.estrategias_ensino || []) as string[];
  const estrategiasAvaliacao = (peiData.estrategias_avaliacao || []) as string[];

  const totalBarreiras = Object.values(barreiras).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  const temRelatorioIA = !!relatorioIA && relatorioIA.trim().length > 0;

  return (
    <div className="mb-6 rounded-2xl border border-sky-200/50 bg-gradient-to-r from-sky-50 to-blue-50 shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-sky-100/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-sky-600" />
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              PEI - Plano de Ensino Individualizado
            </h3>
            {studentName && (
              <p className="text-xs text-slate-600 mt-0.5">Estudante: {studentName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 px-2 py-1 bg-white rounded">
            {isExpanded ? "Recolher" : "Expandir"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-sky-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-sky-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-sky-200">
          {/* Relatório Completo da IA - Documento Norteador */}
          {temRelatorioIA ? (
            <div className="p-4 rounded-lg bg-white border border-sky-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-sky-600" />
                <h4 className="text-sm font-semibold text-slate-800">PEI Completo - Relatório Gerado pela IA</h4>
              </div>
              <div className="prose prose-slate max-w-none">
                <FormattedTextDisplay texto={relatorioIA} />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-semibold text-amber-800">Relatório não gerado</h4>
              </div>
              <p className="text-xs text-amber-700 mb-2">
                O relatório completo do PEI ainda não foi gerado pela IA. Gere o relatório na aba "Consultoria IA" do PEI.
              </p>
              <a
                href={`/pei?student=${studentId || ""}`}
                className="text-xs text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 font-medium"
              >
                <FileText className="w-3 h-3" />
                Ir para PEI e gerar relatório →
              </a>
            </div>
          )}

          {/* Informações Resumidas (Contexto Rápido) */}
          <details className="border border-slate-200 rounded-lg">
            <summary className="px-3 py-2 cursor-pointer text-xs font-medium text-slate-600 hover:bg-slate-50">
              📋 Ver informações resumidas (diagnóstico, barreiras, estratégias)
            </summary>
            <div className="p-3 space-y-3 bg-slate-50">
              {/* Diagnóstico */}
              {diagnostico && (
                <div className="p-2 rounded bg-white border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 text-sky-600" />
                    <h5 className="text-xs font-semibold text-slate-800">Diagnóstico</h5>
                  </div>
                  <p className="text-xs text-slate-700">{diagnostico}</p>
                </div>
              )}

              {/* Potencialidades e Hiperfoco */}
              {(potencias.length > 0 || hiperfoco) && (
                <div className="p-2 rounded bg-white border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-3 h-3 text-emerald-600" />
                    <h5 className="text-xs font-semibold text-slate-800">Potencialidades</h5>
                  </div>
                  {hiperfoco && (
                    <p className="text-xs text-slate-700 mb-1">
                      <strong>Hiperfoco:</strong> {hiperfoco}
                    </p>
                  )}
                  {potencias.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {potencias.map((p, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Barreiras */}
              {totalBarreiras > 0 && (
                <div className="p-2 rounded bg-white border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <h5 className="text-xs font-semibold text-slate-800">
                      Barreiras ({totalBarreiras})
                    </h5>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(barreiras).slice(0, 3).map(([dom, barrs]) => {
                      if (!barrs || barrs.length === 0) return null;
                      return (
                        <div key={dom} className="text-xs">
                          <strong className="text-amber-900">{dom}:</strong>{" "}
                          <span className="text-slate-700">
                            {barrs.slice(0, 2).join(", ")}
                            {barrs.length > 2 && ` +${barrs.length - 2} mais`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rede de Apoio */}
              {redeApoio.length > 0 && (
                <div className="p-2 rounded bg-white border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3 h-3 text-purple-600" />
                    <h5 className="text-xs font-semibold text-slate-800">
                      Rede de Apoio ({redeApoio.length})
                    </h5>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {redeApoio.slice(0, 4).map((p, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded"
                      >
                        {p}
                      </span>
                    ))}
                    {redeApoio.length > 4 && (
                      <span className="text-xs px-1.5 py-0.5 text-slate-600">
                        +{redeApoio.length - 4} mais
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Estratégias */}
              {(estrategiasAcesso.length > 0 || estrategiasEnsino.length > 0 || estrategiasAvaliacao.length > 0) && (
                <div className="p-2 rounded bg-white border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-3 h-3 text-blue-600" />
                    <h5 className="text-xs font-semibold text-slate-800">Estratégias</h5>
                  </div>
                  <div className="space-y-1 text-xs">
                    {estrategiasAcesso.length > 0 && (
                      <div>
                        <strong className="text-blue-900">Acesso:</strong>{" "}
                        <span className="text-slate-700">
                          {estrategiasAcesso.slice(0, 2).join(", ")}
                          {estrategiasAcesso.length > 2 && ` +${estrategiasAcesso.length - 2} mais`}
                        </span>
                      </div>
                    )}
                    {estrategiasEnsino.length > 0 && (
                      <div>
                        <strong className="text-blue-900">Ensino:</strong>{" "}
                        <span className="text-slate-700">
                          {estrategiasEnsino.slice(0, 2).join(", ")}
                          {estrategiasEnsino.length > 2 && ` +${estrategiasEnsino.length - 2} mais`}
                        </span>
                      </div>
                    )}
                    {estrategiasAvaliacao.length > 0 && (
                      <div>
                        <strong className="text-blue-900">Avaliação:</strong>{" "}
                        <span className="text-slate-700">
                          {estrategiasAvaliacao.slice(0, 2).join(", ")}
                          {estrategiasAvaliacao.length > 2 && ` +${estrategiasAvaliacao.length - 2} mais`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </details>

          {/* Link para PEI completo */}
          <div className="pt-2 border-t border-sky-200">
            <a
              href={`/pei?student=${studentId || ""}`}
              className="text-xs text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 font-medium"
            >
              <FileText className="w-3 h-3" />
              Editar PEI completo →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
