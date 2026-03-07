"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function LogsTab({ workspaces }: { workspaces: Workspace[] }) {
  const [logs, setLogs] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
  const [total, setTotal] = useState(0);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsFilter, setWsFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsFilter, typeFilter, offset]);

  async function loadLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (wsFilter) params.set("workspace_id", wsFilter);
      if (typeFilter) params.set("event_type", typeFilter);
      const res = await fetch(`/api/admin/activity-log?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        if (data.event_types) setEventTypes(data.event_types);
      }
    } catch (err) {
      console.error("Erro ao carregar logs:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">📋 Logs de Atividade</h3>
          <button
            onClick={() => { setOffset(0); loadLogs(); }}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1"
          >
            <Activity className="w-4 h-4" /> Atualizar
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={wsFilter}
            onChange={(e) => { setWsFilter(e.target.value); setOffset(0); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">Todas as escolas</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setOffset(0); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">Todos os tipos</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="self-center text-sm text-slate-500">{total} evento(s) total</span>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-slate-600 text-center py-8">Nenhum log encontrado.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Evento</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Escola</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Origem</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Motor IA</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
                    const date = log.created_at
                      ? new Date(log.created_at).toLocaleString("pt-BR", {
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                      })
                      : "—";
                    return (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{date}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{log.event_type}</td>
                        <td className="py-3 px-4 text-slate-600">{log.workspace_name}</td>
                        <td className="py-3 px-4 text-slate-600">{log.source || "—"}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {log.ai_engine ? (ENGINE_OPTIONS[log.ai_engine] || log.ai_engine) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                ← Anterior
              </button>
              <span className="text-sm text-slate-600">
                {offset + 1}–{Math.min(offset + limit, total)} de {total}
              </span>
              <button
                disabled={offset + limit >= total}
                onClick={() => setOffset(offset + limit)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Próxima →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
