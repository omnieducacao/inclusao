"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function AvisosTab({ workspaces }: { workspaces: Workspace[] }) {
  const [announcements, setAnnouncements] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "alert">("info");
  const [target, setTarget] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao carregar avisos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!title.trim() || !message.trim()) {
      alert("Preencha título e mensagem.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          announcement: { title: title.trim(), message: message.trim(), type, target },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
        setTitle("");
        setMessage("");
        setType("info");
        setTarget("all");
        setShowForm(false);
      }
    } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      alert("Erro ao criar aviso.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id: string) {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", announcement_id: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch { /* expected fallback */
      alert("Erro ao alterar aviso.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este aviso?")) return;
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", announcement_id: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch { /* expected fallback */
      alert("Erro ao excluir aviso.");
    }
  }

  const typeColors = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-amber-100 text-amber-800",
    alert: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* New Announcement Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">📢 Avisos da Plataforma</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            {showForm ? <X className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
            {showForm ? "Cancelar" : "Novo Aviso"}
          </button>
        </div>

        {showForm && (
          <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Manutenção programada"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mensagem *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Detalhe o aviso para os usuários..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "info" | "warning" | "alert")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="info">ℹ️ Informativo</option>
                  <option value="warning">⚠️ Aviso</option>
                  <option value="alert">🔴 Alerta</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Destino</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="all">Todas as escolas</option>
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              Publicar aviso
            </button>
          </div>
        )}
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Avisos Publicados</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : announcements.length === 0 ? (
          <p className="text-slate-600 text-center py-8">Nenhum aviso publicado.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
              const wsName = a.target === "all"
                ? "Todas as escolas"
                : workspaces.find((w) => w.id === a.target)?.name || a.target;
              const date = a.created_at
                ? new Date(a.created_at).toLocaleString("pt-BR", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                })
                : "";
              return (
                <div key={a.id} className={`border rounded-lg p-4 ${a.active ? "border-slate-200" : "border-slate-100 opacity-60"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${typeColors[a.type as keyof typeof typeColors] || typeColors.info}`}>
                          {a.type === "info" ? "INFO" : a.type === "warning" ? "AVISO" : "ALERTA"}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${a.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                          {a.active ? "Ativo" : "Inativo"}
                        </span>
                        <span className="text-xs text-slate-500">· {date} · {wsName}</span>
                      </div>
                      <h4 className="font-bold text-slate-900">{a.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{a.message}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggle(a.id)}
                        className="px-3 py-1 text-xs border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        {a.active ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="px-3 py-1 text-xs border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Tab: Feed Omnisfera (Upload de carrossel)
// ═══════════════════════════════════════════════════════════════
type FeedPost = {
  id: string;
  title: string | null;
  caption: string | null;
  category: string;
  instagram_url: string | null;
  images: string[];
  published: boolean;
  position: number;
  created_at: string;
};
