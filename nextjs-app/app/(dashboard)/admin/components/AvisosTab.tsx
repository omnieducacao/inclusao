"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
import { useConfirmar } from "@/components/Confirmar";
import { MensagemAdmin, type Mensagem } from "./MensagemAdmin";
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
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const { confirmar, dialogo } = useConfirmar();

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
      setMensagem({ tipo: "atencao", texto: "Escreva o título e a mensagem do aviso." });
      return;
    }
    setMensagem(null);
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
        setMensagem({ tipo: "sucesso", texto: "Aviso publicado." });
      } else {
        setMensagem({ tipo: "erro", texto: "Não foi possível publicar o aviso." });
      }
    } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setMensagem({ tipo: "erro", texto: "Não foi possível publicar o aviso. Tente de novo." });
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
      setMensagem({ tipo: "erro", texto: "Não foi possível ligar ou desligar o aviso." });
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirmar({ titulo: "Excluir este aviso?", texto: "Ele some para todas as escolas. Não dá para desfazer.", acao: "Excluir aviso", cancelar: "Manter aviso", perigo: true }))) return;
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
      setMensagem({ tipo: "erro", texto: "Não foi possível excluir o aviso." });
    }
  }

  const classeTipo: Record<string, string> = {
    info: "omni-estado--info",
    warning: "omni-estado--atencao",
    alert: "omni-estado--erro",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {dialogo}
      <MensagemAdmin mensagem={mensagem} onFechar={() => setMensagem(null)} />
      {/* Novo aviso */}
      <section className="omni-cartao" aria-labelledby="avisos-titulo">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h3 id="avisos-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}>
            <Megaphone size={20} aria-hidden /> Avisos da plataforma
          </h3>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            aria-expanded={showForm}
            className={`omni-btn ${showForm ? "omni-btn--secundario" : "omni-btn--primario"}`}
          >
            {showForm ? <X size={18} aria-hidden /> : <Megaphone size={18} aria-hidden />}
            {showForm ? "Cancelar" : "Novo aviso"}
          </button>
        </div>

        {showForm && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, borderTop: "1px solid var(--borda)", paddingTop: 16, marginTop: 4 }}>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Título</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Manutenção programada"
                className="omni-entrada"
                required
              />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Mensagem</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="O que as escolas precisam saber."
                className="omni-entrada"
                required
              />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <label className="omni-campo">
                <span className="omni-campo__rotulo">Tipo</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "info" | "warning" | "alert")}
                  className="omni-entrada"
                >
                  <option value="info">Informativo</option>
                  <option value="warning">Atenção</option>
                  <option value="alert">Urgente</option>
                </select>
              </label>
              <label className="omni-campo">
                <span className="omni-campo__rotulo">Para quem</span>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="omni-entrada"
                >
                  <option value="all">Todas as escolas</option>
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <button
                type="button"
                onClick={handleCreate}
                disabled={submitting}
                className="omni-btn omni-btn--primario"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Megaphone size={18} aria-hidden />}
                Publicar aviso
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Lista de avisos */}
      <section className="omni-cartao" aria-labelledby="avisos-lista-titulo">
        <h3 id="avisos-lista-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Avisos publicados</h3>
        {loading ? (
          <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 0" }}>
            <Loader2 size={20} className="animate-spin" aria-hidden /> Carregando avisos…
          </p>
        ) : announcements.length === 0 ? (
          <p className="omni-apoio" style={{ textAlign: "center", padding: "24px 0" }}>Nenhum aviso publicado.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                <div key={a.id} className="omni-cartao omni-cartao--plano" style={{ padding: 16, opacity: a.active ? 1 : 0.65 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className={`omni-estado ${classeTipo[a.type] || classeTipo.info}`}>
                          {a.type === "info" ? "Informativo" : a.type === "warning" ? "Atenção" : "Urgente"}
                        </span>
                        <span className={`omni-estado ${a.active ? "omni-estado--sucesso" : "omni-estado--neutro"}`}>
                          {a.active ? "Ativo" : "Inativo"}
                        </span>
                        <span className="omni-apoio" style={{ fontSize: 13 }}>· {date} · {wsName}</span>
                      </div>
                      <h4 style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{a.title}</h4>
                      <p className="omni-apoio" style={{ marginTop: 4 }}>{a.message}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleToggle(a.id)}
                        className="omni-btn omni-btn--secundario omni-btn--pequeno"
                      >
                        {a.active ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
                        {a.active ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        className="omni-btn omni-btn--perigo omni-btn--pequeno"
                      >
                        <Trash2 size={16} aria-hidden />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
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
