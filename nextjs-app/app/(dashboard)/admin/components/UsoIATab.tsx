"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function UsoIATab() {
  const [usage, setUsage] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  async function loadUsage() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ia-usage?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setUsage(data.usage || []);
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao carregar uso de IA:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">📊 Uso de IAs por escola</h3>
          <p className="text-slate-600 text-sm mt-1">Controle de chamadas por motor e base para sistema de créditos.</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : usage.length === 0 ? (
        <p className="text-slate-600 text-center py-8">
          Ainda não há registros de uso de IA. As chamadas passam a ser contabilizadas após a migration 00022 estar aplicada.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Escola</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">OmniRed</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">OmniBlue</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">OmniGreen</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">OmniYellow</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">OmniOrange</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Créditos</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Plano</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Limite</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((u) => (
                <tr key={u.workspace_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">{u.workspace_name}</td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600">{u.red || 0}</td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600">{u.blue || 0}</td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600">{u.green || 0}</td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600">{u.yellow || 0}</td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600">{u.orange || 0}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-slate-900">{u.total_calls || 0}</td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600">{u.credits_used?.toFixed(1) || "0.0"}</td>
                  <td className="px-4 py-3 text-center text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.plan === "robusto" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                      }`}>
                      {u.plan === "robusto" ? "Robusto" : "Basic"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600">{u.credits_limit || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {usage.length > 0 && (
        <p className="text-xs text-slate-500 mt-4">
          Créditos usados = soma das unidades por chamada (1 por padrão, OmniGreen pode ter peso maior).
          No futuro, planos terão limite; ao atingir, a escola migra para plano mais robusto.
        </p>
      )}
    </div>
  );
}
