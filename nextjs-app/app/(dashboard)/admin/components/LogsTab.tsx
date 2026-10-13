"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink, ScrollText, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

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
      /* client-side */ console.error("Erro ao carregar logs:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="omni-cartao" aria-labelledby="registros-titulo">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3 id="registros-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}>
          <ScrollText size={20} aria-hidden /> Registro de atividades
        </h3>
        <button
          type="button"
          onClick={() => { setOffset(0); loadLogs(); }}
          className="omni-btn omni-btn--secundario omni-btn--pequeno"
        >
          <RefreshCw size={16} aria-hidden /> Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
        <label className="omni-campo" style={{ flex: "0 1 260px" }}>
          <span className="omni-campo__rotulo">Escola</span>
          <select
            value={wsFilter}
            onChange={(e) => { setWsFilter(e.target.value); setOffset(0); }}
            className="omni-entrada"
          >
            <option value="">Todas as escolas</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
        </label>
        <label className="omni-campo" style={{ flex: "0 1 260px" }}>
          <span className="omni-campo__rotulo">Tipo de ação</span>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setOffset(0); }}
            className="omni-entrada"
          >
            <option value="">Todos os tipos</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <span className="omni-apoio" style={{ alignSelf: "center" }}>{total} {total === 1 ? "registro" : "registros"} no total</span>
      </div>

      {/* Tabela */}
      {loading ? (
        <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 0" }}>
          <Loader2 size={20} className="animate-spin" aria-hidden /> Carregando registros…
        </p>
      ) : logs.length === 0 ? (
        <p className="omni-apoio" style={{ textAlign: "center", padding: "24px 0" }}>Nenhum registro encontrado.</p>
      ) : (
        <>
          <div className="omni-tabela-caixa">
            <table className="omni-tabela">
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Ação</th>
                  <th scope="col">Escola</th>
                  <th scope="col">Origem</th>
                  <th scope="col">Motor de IA</th>
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
                    <tr key={log.id}>
                      <td style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{date}</td>
                      <td className="omni-tabela__nome">{log.event_type}</td>
                      <td>{log.workspace_name}</td>
                      <td>{log.source || "—"}</td>
                      <td>
                        {log.ai_engine ? (ENGINE_OPTIONS[log.ai_engine] || log.ai_engine) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <nav aria-label="Páginas de registros" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              className="omni-btn omni-btn--secundario omni-btn--pequeno"
            >
              <ChevronLeft size={16} aria-hidden /> Anterior
            </button>
            <span className="omni-apoio" style={{ fontVariantNumeric: "tabular-nums" }}>
              {offset + 1}–{Math.min(offset + limit, total)} de {total}
            </span>
            <button
              type="button"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
              className="omni-btn omni-btn--secundario omni-btn--pequeno"
            >
              Próxima <ChevronRight size={16} aria-hidden />
            </button>
          </nav>
        </>
      )}
    </section>
  );
}
