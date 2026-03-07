"use client";
import { IssueCard } from "./IssueCard";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function BugsTab() {
  const [issues, setIssues] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSeverity, setFormSeverity] = useState("média");
  const [formWorkspace, setFormWorkspace] = useState<string>("");
  const [formSource, setFormSource] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadIssues();
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    try {
      const res = await fetch("/api/admin/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      }
    } catch (err) {
      console.error("Erro ao carregar escolas:", err);
    }
  }

  async function loadIssues() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues || []);
      }
    } catch (err) {
      console.error("Erro ao carregar bugs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!formTitle.trim()) {
      alert("Informe o título.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          severity: formSeverity,
          workspace_id: formWorkspace || null,
          source: formSource.trim(),
        }),
      });

      if (res.ok) {
        setFormTitle("");
        setFormDescription("");
        setFormSeverity("média");
        setFormWorkspace("");
        setFormSource("");
        setShowForm(false);
        loadIssues();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Erro: ${error.error || "Erro ao registrar bug"}`);
      }
    } catch (err) {
      console.error("Erro ao registrar bug:", err);
      alert("Erro ao registrar bug.");
    } finally {
      setSubmitting(false);
    }
  }

  async function _handleUpdateStatus(issueId: string, newStatus: string, notes: string) {
    try {
      const res = await fetch(`/api/admin/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, resolution_notes: notes }),
      });

      if (res.ok) {
        loadIssues();
      } else {
        alert("Erro ao atualizar status.");
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Erro ao atualizar status.");
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulário Novo Bug */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">🐛 Registro de bugs e inconsistências</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancelar" : "Novo Bug"}
          </button>
        </div>

        {showForm && (
          <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Escola relacionada (opcional)</label>
              <select
                value={formWorkspace}
                onChange={(e) => setFormWorkspace(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">(sem vínculo)</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} — PIN {ws.pin}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título do bug *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Master não consegue alterar senha"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Severidade</label>
              <select
                value={formSeverity}
                onChange={(e) => setFormSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="baixa">Baixa</option>
                <option value="média">Média</option>
                <option value="alta">Alta</option>
                <option value="crítica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Origem / Tela</label>
              <input
                type="text"
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                placeholder="Ex: Gestão de Usuários"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição detalhada</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
                placeholder="Explique o que aconteceu, quem foi impactado e como reproduzir."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Registrar bug
            </button>
          </div>
        )}
      </div>

      {/* Lista de Bugs */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Lista de Issues</h3>
        {issues.length === 0 ? (
          <p className="text-slate-600 text-center py-8">Nenhum bug registrado até o momento.</p>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} workspaces={workspaces} onUpdate={loadIssues} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
