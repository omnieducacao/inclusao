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
    <div className="space-y-6">
      {/* Formulário Nova Escola */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">➕ Nova escola</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nome da escola</label>
            <input
              type="text"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              placeholder="Ex: Escola Municipal XYZ"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Segmentos atendidos</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SEGMENT_OPTIONS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
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
                    className="rounded"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Motores de IA disponíveis</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ENGINE_OPTIONS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
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
                    className="rounded"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={onCreate}
            disabled={creating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Criar escola e gerar PIN
          </button>
        </div>
      </div>

      {/* Lista de Escolas */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">📋 Escolas cadastradas</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : workspaces.length === 0 ? (
          <p className="text-slate-600 text-center py-8">Nenhuma escola cadastrada. Crie a primeira acima.</p>
        ) : (
          <div className="space-y-4">
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
      </div>
    </div>
  );
}
