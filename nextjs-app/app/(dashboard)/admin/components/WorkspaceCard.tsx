"use client";
import { SimulateButton } from "./SimulateButton";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES, MODULE_OPTIONS } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function WorkspaceCard({
  workspace,
  editingId,
  setEditingId,
  confirmDeleteId,
  setConfirmDeleteId,
  onRefresh,
}: {
  workspace: Workspace;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  onRefresh: () => void;
}) {
  const [localName, setLocalName] = useState(workspace.name);
  const [localSegments, setLocalSegments] = useState(workspace.segments ?? []);
  const [localEngines, setLocalEngines] = useState(workspace.ai_engines ?? []);
  const [localPlan, setLocalPlan] = useState(workspace.plan || "basic");
  const [localCreditsLimit, setLocalCreditsLimit] = useState(workspace.credits_limit || 0);
  const [localModules, setLocalModules] = useState<Record<string, boolean>>(() => {
    const mods = workspace.enabled_modules;
    const result: Record<string, boolean> = {};
    MODULE_OPTIONS.forEach(([key]) => {
      result[key] = mods == null || (Array.isArray(mods) && mods.includes(key));
    });
    return result;
  });
  const [localFamilyEnabled, setLocalFamilyEnabled] = useState(Boolean(workspace.family_module_enabled));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const enabledModules = Object.entries(localModules)
        .filter(([, checked]) => checked)
        .map(([key]) => key);

      const res = await fetch(`/api/admin/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: localName,
          segments: localSegments,
          ai_engines: localEngines,
          enabled_modules: enabledModules,
          plan: localPlan,
          credits_limit: localCreditsLimit || null,
          family_module_enabled: localFamilyEnabled,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        onRefresh();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Erro: ${error.error || "Erro ao salvar"}`);
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao salvar:", err);
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    try {
      const res = await fetch(`/api/admin/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !workspace.active }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao alterar status:", err);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/admin/workspaces/${workspace.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConfirmDeleteId(null);
        onRefresh();
      } else {
        alert("Erro ao excluir.");
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao excluir:", err);
      alert("Erro ao excluir.");
    }
  }

  const isEditing = editingId === workspace.id;
  const isConfirmingDelete = confirmDeleteId === workspace.id;

  return (
    <div className="border border-slate-200 rounded-lg p-4">
      {isConfirmingDelete ? (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 font-semibold">⚠️ Excluir remove a escola e dados relacionados. Esta ação não pode ser desfeita.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sim, excluir permanentemente
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nome</label>
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Segmentos</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SEGMENT_OPTIONS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={localSegments.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLocalSegments([...localSegments, key]);
                      } else {
                        setLocalSegments(localSegments.filter((s) => s !== key));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Motores IA</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ENGINE_OPTIONS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={localEngines.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLocalEngines([...localEngines, key]);
                      } else {
                        setLocalEngines(localEngines.filter((e) => e !== key));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Plano e créditos</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  value={localPlan}
                  onChange={(e) => setLocalPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="basic">Basic (sem omnigreen)</option>
                  <option value="robusto">Robusto (com omnigreen)</option>
                </select>
              </div>
              <div>
                <input
                  type="number"
                  value={localCreditsLimit}
                  onChange={(e) => setLocalCreditsLimit(parseInt(e.target.value) || 0)}
                  placeholder="Limite de créditos (0 = ilimitado)"
                  min={0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Módulos habilitados</label>
            <div className="flex flex-wrap gap-2">
              {MODULE_OPTIONS.map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={localModules[key]}
                    onChange={(e) => setLocalModules({ ...localModules, [key]: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-3 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={localFamilyEnabled}
                onChange={(e) => setLocalFamilyEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-semibold">👨‍👩‍👧 Módulo Família habilitado</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-slate-900">
                🏫 {workspace.name} — PIN: {workspace.pin} · {workspace.active ? "🟢 Ativa" : "🔴 Inativa"}
              </h4>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                {(workspace.segments ?? []).length > 0 && (
                  <p>Segmentos: {(workspace.segments ?? []).map((s) => SEGMENT_OPTIONS[s] || s).join(", ")}</p>
                )}
                {(workspace.ai_engines ?? []).length > 0 && (
                  <p>Motores IA: {(workspace.ai_engines ?? []).map((e) => ENGINE_OPTIONS[e] || e).join(", ")}</p>
                )}
                <p>
                  Plano: {workspace.plan === "robusto" ? "Robusto (omnigreen)" : "Basic"} · Limite créditos:{" "}
                  {workspace.credits_limit || "ilimitado"}
                  {workspace.family_module_enabled && " · 👨‍👩‍👧 Família ativo"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingId(workspace.id)}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleToggleActive}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${workspace.active
                  ? "border border-slate-300 hover:bg-slate-50"
                  : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                {workspace.active ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Reativar
                  </>
                )}
              </button>
              <button
                onClick={() => setConfirmDeleteId(workspace.id)}
                className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
              <SimulateButton workspaceId={workspace.id} workspaceName={workspace.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
