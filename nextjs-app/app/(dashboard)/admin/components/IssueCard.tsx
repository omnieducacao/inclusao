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
  const [erro, setErro] = useState<string | null>(null);

  const workspaceName =
    workspaces.find((w) => w.id === issue.workspace_id)?.name || "Geral";
  const statusOrder = ["aberto", "em_andamento", "resolvido", "arquivado"];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const statusIndex = statusOrder.indexOf(localStatus);

  async function handleSave() {
    setSaving(true);
    setErro(null);
    try {
      const res = await fetch(`/api/admin/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: localStatus, resolution_notes: localNotes }),
      });

      if (res.ok) {
        onUpdate();
      } else {
        setErro("Não foi possível atualizar.");
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao salvar:", err);
      setErro("Não foi possível salvar. Tente de novo.");
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

  const ROTULO_SITUACAO: Record<string, string> = {
    aberto: "Aberto",
    em_andamento: "Em andamento",
    resolvido: "Resolvido",
    arquivado: "Arquivado",
  };
  const classeSituacao =
    localStatus === "aberto" ? "omni-estado--erro" :
      localStatus === "em_andamento" ? "omni-estado--atencao" :
        localStatus === "resolvido" ? "omni-estado--sucesso" :
          "omni-estado--neutro";
  const idBase = `issue-${issue.id}`;

  return (
    <div className="omni-cartao omni-cartao--plano" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <span className={`omni-estado ${classeSituacao}`}>
              {ROTULO_SITUACAO[localStatus] || localStatus}
            </span>
            <h4 style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{issue.title || "Sem título"}</h4>
            <span className="omni-apoio">· {workspaceName}</span>
          </div>
          {expanded && (
            <div id={`${idBase}-detalhes`} style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              <p className="omni-apoio" style={{ color: "var(--tinta)" }}>{issue.description || "Sem descrição detalhada."}</p>
              <div className="omni-apoio" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div>
                  <p style={{ fontWeight: 600 }}>Gravidade: {issue.severity || "média"}</p>
                  <p>Origem: {issue.source || "—"}</p>
                </div>
                <div>
                  <p>Criado em: {createdDate}</p>
                  <p>Registrado por: {issue.created_by || "—"}</p>
                </div>
              </div>
              <label className="omni-campo">
                <span className="omni-campo__rotulo">Situação</span>
                <select
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value)}
                  className="omni-entrada"
                >
                  {statusOrder.map((s) => (
                    <option key={s} value={s}>
                      {ROTULO_SITUACAO[s] || s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="omni-campo" style={{ maxWidth: "none" }}>
                <span className="omni-campo__rotulo">Notas e próximos passos</span>
                <textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  rows={3}
                  className="omni-entrada"
                />
              </label>
              {erro && (
                <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>
              )}
              <div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="omni-btn omni-btn--primario omni-btn--pequeno"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Save size={16} aria-hidden />}
                  Salvar atualização
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={`${idBase}-detalhes`}
          className="omni-btn omni-btn--discreto omni-btn--pequeno"
        >
          {expanded ? "Ocultar" : "Ver detalhes"}
        </button>
      </div>
    </div>
  );
}
