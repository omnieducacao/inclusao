"use client";
import { WorkspaceCard } from "./WorkspaceCard";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function EscolasTab({
  workspaces,
  loading,
  editingId,
  setEditingId,
  confirmDeleteId,
  setConfirmDeleteId,
  onRefresh,
  newSchoolName,
  setNewSchoolName,
  newSchoolSegments,
  setNewSchoolSegments,
  newSchoolEngines,
  setNewSchoolEngines,
  onCreate,
  creating,
}: {
  workspaces: Workspace[];
  loading: boolean;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  onRefresh: () => void;
  newSchoolName: string;
  setNewSchoolName: (name: string) => void;
  newSchoolSegments: string[];
  setNewSchoolSegments: (segments: string[]) => void;
  newSchoolEngines: string[];
  setNewSchoolEngines: (engines: string[]) => void;
  onCreate: () => void;
  creating: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Formulário Nova Escola */}
      <section className="omni-cartao" aria-labelledby="nova-escola-titulo">
        <h3 id="nova-escola-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={20} aria-hidden /> Nova escola
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label className="omni-campo">
            <span className="omni-campo__rotulo">Nome da escola</span>
            <input
              type="text"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              placeholder="Ex.: Escola Municipal Monteiro Lobato"
              className="omni-entrada"
            />
          </label>
          <fieldset style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <legend className="omni-campo__rotulo" style={{ marginBottom: 8 }}>Etapas de ensino atendidas</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(SEGMENT_OPTIONS).map(([key, label]) => (
                <label key={key} className="omni-chip">
                  <input
                    type="checkbox"
                    checked={newSchoolSegments.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewSchoolSegments([...newSchoolSegments, key]);
                      } else {
                        setNewSchoolSegments(newSchoolSegments.filter((s) => s !== key));
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
            <legend className="omni-campo__rotulo" style={{ marginBottom: 8 }}>Motores de IA disponíveis</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(ENGINE_OPTIONS).map(([key, label]) => (
                <label key={key} className="omni-chip">
                  <input
                    type="checkbox"
                    checked={newSchoolEngines.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewSchoolEngines([...newSchoolEngines, key]);
                      } else {
                        setNewSchoolEngines(newSchoolEngines.filter((e) => e !== key));
                      }
                    }}
                  />
                  <CheckCircle2 className="omni-chip__marca" aria-hidden />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <button
              type="button"
              onClick={onCreate}
              disabled={creating}
              className="omni-btn omni-btn--primario"
            >
              {creating ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Plus size={18} aria-hidden />}
              Criar escola e gerar PIN
            </button>
          </div>
        </div>
      </section>

      {/* Lista de Escolas */}
      <section className="omni-cartao" aria-labelledby="escolas-lista-titulo">
        <h3 id="escolas-lista-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>
          Escolas cadastradas
        </h3>
        {loading ? (
          <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 0" }}>
            <Loader2 size={20} className="animate-spin" aria-hidden /> Carregando escolas…
          </p>
        ) : workspaces.length === 0 ? (
          <p className="omni-apoio" style={{ textAlign: "center", padding: "24px 0" }}>Nenhuma escola cadastrada. Crie a primeira acima.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                editingId={editingId}
                setEditingId={setEditingId}
                confirmDeleteId={confirmDeleteId}
                setConfirmDeleteId={setConfirmDeleteId}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
