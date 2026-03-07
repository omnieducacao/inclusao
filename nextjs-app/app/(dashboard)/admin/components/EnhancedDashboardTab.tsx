"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function EnhancedDashboardTab() {
  const [data, setData] = useState<any /* eslint-disable-line @typescript-eslint/no-explicit-any */>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-center text-slate-600 py-8">Erro ao carregar dashboard.</p>;
  }

  const { kpis, school_breakdown } = data;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total de Escolas</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{kpis.total_schools}</p>
          <p className="text-xs text-blue-600 mt-1">{kpis.active_schools} ativas, {kpis.inactive_schools} inativas</p>
        </div>
        <div className="p-5 bg-green-50 rounded-xl border border-green-200">
          <p className="text-sm text-green-700 font-medium">Usuários Cadastrados</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{kpis.total_users}</p>
          <p className="text-xs text-green-600 mt-1">{kpis.active_users} ativos</p>
        </div>
        <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Total de Alunos</p>
          <p className="text-3xl font-bold text-purple-900 mt-1">{kpis.total_students}</p>
          <p className="text-xs text-purple-600 mt-1">{kpis.students_with_pei} com PEI</p>
        </div>
        <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-700 font-medium">Eventos (7 dias)</p>
          <p className="text-3xl font-bold text-amber-900 mt-1">{kpis.recent_events_7d}</p>
          <p className="text-xs text-amber-600 mt-1">uso da plataforma</p>
        </div>
      </div>

      {/* Per-School Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">📊 Panorama por Escola</h3>
          <button
            onClick={() => window.open("/api/admin/export?type=schools", "_blank")}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Escola</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Usuários</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Alunos</th>
              </tr>
            </thead>
            <tbody>
              {(school_breakdown || []).map((s: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{s.name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${s.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {s.active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium">{s.users}</td>
                  <td className="py-3 px-4 text-center font-medium">{s.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
