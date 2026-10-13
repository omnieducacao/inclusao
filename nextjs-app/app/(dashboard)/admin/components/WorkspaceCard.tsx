"use client";
import { SimulateButton } from "./SimulateButton";
import { MensagemAdmin, type Mensagem } from "./MensagemAdmin";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

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
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

  async function handleSave() {
    setSaving(true);
    setMensagem(null);
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
        setMensagem({ tipo: "erro", texto: `Não foi possível salvar. ${error.error || ""}`.trim() });
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao salvar:", err);
      setMensagem({ tipo: "erro", texto: "Não foi possível salvar. Tente de novo." });
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
        setMensagem({ tipo: "erro", texto: "Não foi possível excluir a escola." });
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao excluir:", err);
      setMensagem({ tipo: "erro", texto: "Não foi possível excluir a escola. Tente de novo." });
    }
  }

  const isEditing = editingId === workspace.id;
  const isConfirmingDelete = confirmDeleteId === workspace.id;

  return (
    <div className="omni-cartao omni-cartao--plano" style={{ padding: 16 }}>
      <MensagemAdmin mensagem={mensagem} onFechar={() => setMensagem(null)} />
      {isConfirmingDelete ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="omni-aviso omni-aviso--atencao" role="alert" style={{ maxWidth: "none" }}>
            <AlertTriangle className="omni-aviso__icone" aria-hidden />
            <div>
              <div className="omni-aviso__titulo">Excluir a escola {workspace.name}?</div>
              <div className="omni-aviso__texto">A escola e os dados ligados a ela serão apagados. Não dá para desfazer.</div>
              <div className="omni-aviso__acoes">
                <button type="button" onClick={() => setConfirmDeleteId(null)} className="omni-btn omni-btn--secundario omni-btn--pequeno">
                  Manter escola
                </button>
                <button type="button" onClick={handleDelete} className="omni-btn omni-btn--perigo omni-btn--pequeno">
                  <Trash2 size={16} aria-hidden /> Excluir para sempre
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : isEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label className="omni-campo">
            <span className="omni-campo__rotulo">Nome</span>
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="omni-entrada"
            />
          </label>
          <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <legend className="omni-campo__rotulo" style={{ marginBottom: 8 }}>Etapas de ensino</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(SEGMENT_OPTIONS).map(([key, label]) => (
                <label key={key} className="omni-chip">
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
                  />
                  <CheckCircle2 className="omni-chip__marca" aria-hidden />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <legend className="omni-campo__rotulo" style={{ marginBottom: 8 }}>Motores de IA</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(ENGINE_OPTIONS).map(([key, label]) => (
                <label key={key} className="omni-chip">
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
                  />
                  <CheckCircle2 className="omni-chip__marca" aria-hidden />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Plano</span>
              <select
                value={localPlan}
                onChange={(e) => setLocalPlan(e.target.value)}
                className="omni-entrada"
              >
                <option value="basic">Básico (sem OmniGreen)</option>
                <option value="robusto">Robusto (com OmniGreen)</option>
              </select>
            </label>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Limite de créditos</span>
              <input
                type="number"
                value={localCreditsLimit}
                onChange={(e) => setLocalCreditsLimit(parseInt(e.target.value) || 0)}
                placeholder="0 = sem limite"
                min={0}
                className="omni-entrada"
              />
              <span className="omni-campo__ajuda">0 = sem limite.</span>
            </label>
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <legend className="omni-campo__rotulo" style={{ marginBottom: 8 }}>Módulos ligados</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {MODULE_OPTIONS.map(([key, label]) => (
                <label key={key} className="omni-chip">
                  <input
                    type="checkbox"
                    checked={localModules[key]}
                    onChange={(e) => setLocalModules({ ...localModules, [key]: e.target.checked })}
                  />
                  <CheckCircle2 className="omni-chip__marca" aria-hidden />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label className="omni-chip">
              <input
                type="checkbox"
                checked={localFamilyEnabled}
                onChange={(e) => setLocalFamilyEnabled(e.target.checked)}
              />
              <CheckCircle2 className="omni-chip__marca" aria-hidden />
              <Users size={16} aria-hidden /> Módulo Família ligado
            </label>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="omni-btn omni-btn--primario"
            >
              {saving ? <OmniLoader size={18} /> : <Save size={18} aria-hidden />}
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="omni-btn omni-btn--secundario"
            >
              <X size={18} aria-hidden />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h4 style={{ font: "700 17px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              {workspace.name}
              <span className={`omni-estado ${workspace.active ? "omni-estado--sucesso" : "omni-estado--neutro"}`}>
                {workspace.active ? <CheckCircle2 aria-hidden /> : <Pause aria-hidden />}
                {workspace.active ? "Ativa" : "Inativa"}
              </span>
            </h4>
            <p className="omni-apoio" style={{ marginTop: 2 }}>PIN: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--tinta)" }}>{workspace.pin}</strong></p>
            <div className="omni-apoio" style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
              {(workspace.segments ?? []).length > 0 && (
                <p>Etapas: {(workspace.segments ?? []).map((s) => SEGMENT_OPTIONS[s] || s).join(", ")}</p>
              )}
              {(workspace.ai_engines ?? []).length > 0 && (
                <p>Motores de IA: {(workspace.ai_engines ?? []).map((e) => ENGINE_OPTIONS[e] || e).join(", ")}</p>
              )}
              <p>
                Plano: {workspace.plan === "robusto" ? "Robusto (OmniGreen)" : "Básico"} · Limite de créditos:{" "}
                {workspace.credits_limit || "sem limite"}
                {workspace.family_module_enabled && " · Família ligado"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              onClick={() => setEditingId(workspace.id)}
              className="omni-btn omni-btn--secundario omni-btn--pequeno"
            >
              <Edit2 size={16} aria-hidden />
              Editar
            </button>
            <button
              type="button"
              onClick={handleToggleActive}
              className={`omni-btn omni-btn--pequeno ${workspace.active ? "omni-btn--secundario" : "omni-btn--primario"}`}
            >
              {workspace.active ? (
                <>
                  <Pause size={16} aria-hidden />
                  Desativar
                </>
              ) : (
                <>
                  <Play size={16} aria-hidden />
                  Reativar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteId(workspace.id)}
              className="omni-btn omni-btn--perigo omni-btn--pequeno"
            >
              <Trash2 size={16} aria-hidden />
              Excluir
            </button>
            <SimulateButton workspaceId={workspace.id} workspaceName={workspace.name} />
          </div>
        </div>
      )}
    </div>
  );
}
