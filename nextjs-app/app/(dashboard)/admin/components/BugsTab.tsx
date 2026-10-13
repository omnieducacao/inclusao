"use client";
import { IssueCard } from "./IssueCard";
import { MensagemAdmin, type Mensagem } from "./MensagemAdmin";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink, Bug } from 'lucide-react';

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
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

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
      /* client-side */ console.error("Erro ao carregar escolas:", err);
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
      /* client-side */ console.error("Erro ao carregar bugs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!formTitle.trim()) {
      setMensagem({ tipo: "atencao", texto: "Escreva o título do erro." });
      return;
    }

    setMensagem(null);
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
        setMensagem({ tipo: "sucesso", texto: "Erro registrado." });
        loadIssues();
      } else {
        const error = await res.json().catch(() => ({}));
        setMensagem({ tipo: "erro", texto: `Não foi possível registrar. ${error.error || ""}`.trim() });
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao registrar bug:", err);
      setMensagem({ tipo: "erro", texto: "Não foi possível registrar. Tente de novo." });
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
        setMensagem({ tipo: "erro", texto: "Não foi possível atualizar a situação." });
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao atualizar status:", err);
      setMensagem({ tipo: "erro", texto: "Não foi possível atualizar a situação." });
    }
  }

  if (loading) {
    return (
      <div className="omni-cartao">
        <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 0" }}>
          <Loader2 size={20} className="animate-spin" aria-hidden /> Carregando erros relatados…
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <MensagemAdmin mensagem={mensagem} onFechar={() => setMensagem(null)} />
      {/* Formulário novo erro */}
      <section className="omni-cartao" aria-labelledby="bugs-titulo">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h3 id="bugs-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}>
            <Bug size={20} aria-hidden /> Erros e problemas da plataforma
          </h3>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            aria-expanded={showForm}
            className={`omni-btn ${showForm ? "omni-btn--secundario" : "omni-btn--primario"}`}
          >
            {showForm ? <X size={18} aria-hidden /> : <Plus size={18} aria-hidden />}
            {showForm ? "Cancelar" : "Registrar erro"}
          </button>
        </div>

        {showForm && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, borderTop: "1px solid var(--borda)", paddingTop: 16, marginTop: 4 }}>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Escola relacionada <span className="omni-campo__opcional">(opcional)</span></span>
              <select
                value={formWorkspace}
                onChange={(e) => setFormWorkspace(e.target.value)}
                className="omni-entrada"
              >
                <option value="">Nenhuma escola</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} — PIN {ws.pin}
                  </option>
                ))}
              </select>
            </label>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Título do erro</span>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex.: Gestor não consegue trocar a senha"
                className="omni-entrada"
                required
              />
            </label>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Gravidade</span>
              <select
                value={formSeverity}
                onChange={(e) => setFormSeverity(e.target.value)}
                className="omni-entrada"
              >
                <option value="baixa">Baixa</option>
                <option value="média">Média</option>
                <option value="alta">Alta</option>
                <option value="crítica">Crítica</option>
              </select>
            </label>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Onde aconteceu <span className="omni-campo__opcional">(opcional)</span></span>
              <input
                type="text"
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                placeholder="Ex.: Gestão de usuários"
                className="omni-entrada"
              />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Descrição <span className="omni-campo__opcional">(opcional)</span></span>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
                placeholder="O que aconteceu, quem foi afetado e como repetir o problema."
                className="omni-entrada"
              />
            </label>
            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="omni-btn omni-btn--primario"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Plus size={18} aria-hidden />}
                Registrar erro
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Lista */}
      <section className="omni-cartao" aria-labelledby="bugs-lista-titulo">
        <h3 id="bugs-lista-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Erros registrados</h3>
        {issues.length === 0 ? (
          <p className="omni-apoio" style={{ textAlign: "center", padding: "24px 0" }}>Nenhum erro registrado até agora.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} workspaces={workspaces} onUpdate={loadIssues} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
