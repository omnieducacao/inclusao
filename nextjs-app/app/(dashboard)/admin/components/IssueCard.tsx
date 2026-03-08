"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function IssueCard({
  issue,
  workspaces,
  onUpdate,
}: {
  issue: any /* eslint-disable-line @typescript-eslint/no-explicit-any */;
  workspaces: Workspace[];
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState(issue.status || "aberto");
  const [localNotes, setLocalNotes] = useState(issue.resolution_notes || "");
  const [saving, setSaving] = useState(false);

  const workspaceName =
    workspaces.find((w) => w.id === issue.workspace_id)?.name || "Geral";
  const statusOrder = ["aberto", "em_andamento", "resolvido", "arquivado"];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const statusIndex = statusOrder.indexOf(localStatus);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: localStatus, resolution_notes: localNotes }),
      });

      if (res.ok) {
        onUpdate();
      } else {
        alert("Erro ao atualizar.");
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao salvar:", err);
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const createdDate = issue.created_at
    ? new Date(issue.created_at).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "—";

  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${localStatus === "aberto" ? "bg-red-100 text-red-800" :
              localStatus === "em_andamento" ? "bg-yellow-100 text-yellow-800" :
                localStatus === "resolvido" ? "bg-green-100 text-green-800" :
                  "bg-slate-100 text-slate-800"
              }`}>
              {localStatus.toUpperCase()}
            </span>
            <h4 className="font-bold text-slate-900">{issue.title || "Sem título"}</h4>
            <span className="text-sm text-slate-500">• {workspaceName}</span>
          </div>
          {expanded && (
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>{issue.description || "_Sem descrição detalhada._"}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Severidade: {issue.severity || "média"}</p>
                  <p>Origem: {issue.source || "—"}</p>
                </div>
                <div>
                  <p>Criado em: {createdDate}</p>
                  <p>Registrado por: {issue.created_by || "—"}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {statusOrder.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notas / Próximos passos</label>
                <textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar atualização
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-4 px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          {expanded ? "Ocultar" : "Expandir"}
        </button>
      </div>
    </div>
  );
}
