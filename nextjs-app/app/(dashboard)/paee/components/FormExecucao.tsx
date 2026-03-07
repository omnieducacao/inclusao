"use client";
import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit2, Play, Pause, FileText, Download, Target, Calendar, CheckCircle2, ChevronDown, ChevronRight, MessageSquare, AlertTriangle, Users, BookOpen, Layout, Settings, Sparkles, Loader2, ArrowRight, Map, Search } from 'lucide-react';
import type { StudentFull } from "../lib/paee-types";
import type { CicloPAEE, MetaPei } from "@/lib/paee";
import { getSupabase } from "@/lib/supabase";
import { LottieIcon } from "@/components/LottieIcon";

import { Card, Input, Textarea, Button, Checkbox } from "@omni/ds";
import { EngineSelector } from "@/components/EngineSelector";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { fmtDataIso, badgeStatus } from "@/lib/paee";
import { OmniLoader } from "@/components/OmniLoader";
export function FormExecucao({
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
    Object.fromEntries(metasPei.map((m: any) => [m.id, true]))
  );

  const metasSelecionadas = metasPei.filter((m: any) => metasSel[m.id]);

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
          {metasPei.map((m: any) => (
            <label key={m.id} className="flex items-start gap-2">
              <Checkbox
                checked={metasSel[m.id] ?? true}
                onChange={(e) => setMetasSel((s: any) => ({ ...s, [m.id]: e.target.checked }))}
              />
              <span className="text-sm cursor-pointer">{m.tipo}: {m.descricao.slice(0, 60)}…</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data início</label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data fim</label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Foco</label>
        <Input type="text" value={foco} onChange={(e) => setFoco(e.target.value)} className="w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
        <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className="w-full" />
      </div>
      <Button type="submit" variant="primary" disabled={metasSelecionadas.length === 0} className="w-full sm:w-auto">
        Gerar preview
      </Button>
    </form>
  );
}
