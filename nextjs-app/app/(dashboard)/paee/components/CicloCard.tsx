"use client";
import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit2, Play, Pause, FileText, Download, Target, Calendar, CheckCircle2, ChevronDown, ChevronRight, MessageSquare, AlertTriangle, Users, BookOpen, Layout, Settings, Sparkles, Loader2, ArrowRight, Map, Search } from 'lucide-react';
import type { StudentFull } from "../lib/paee-types";
import type { CicloPAEE, MetaPei } from "@/lib/paee";
import { getSupabase } from "@/lib/supabase";
import { LottieIcon } from "@/components/LottieIcon";

import { Card, Button } from "@omni/ds";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { fmtDataIso, badgeStatus } from "@/lib/paee";
import { OmniLoader } from "@/components/OmniLoader";
export function CicloCard({
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
            {(cfg.metas_selecionadas || []).map((m: any) => (
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
                  {cron.fases.map((f: any, i: number) => (
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
                  {cron.semanas.slice(0, 6).map((s: any) => (
                    <div key={s.numero} className="p-2 rounded bg-slate-50 border border-slate-200">
                      <strong className="text-slate-800">Semana {s.numero} — {s.tema}</strong>
                      <p className="text-xs text-slate-600 mt-1">{s.objetivo}</p>
                      {s.atividades && s.atividades.length > 0 && (
                        <ul className="text-xs text-slate-500 mt-1 list-disc list-inside">
                          {s.atividades.slice(0, 3).map((a: any, idx: number) => (
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
          <Button
            type="button"
            variant="primary"
            onClick={onSalvar}
            disabled={saving}
          >
            {saving ? "Salvando…" : "Salvar na nuvem"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onLimpar}
          >
            Limpar
          </Button>
        </div>
      )}
    </div>
  );
}
