"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function UsuariosTab({ workspaces }: { workspaces: Workspace[] }) {
  const [users, setUsers] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [wsFilter, setWsFilter] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsFilter]);

  async function loadUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (wsFilter) params.set("workspace_id", wsFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleUser(userId: string, currentActive: boolean) {
    setToggling(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, active: !currentActive }),
      });
      if (res.ok) {
        loadUsers();
      }
    } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      alert("Erro ao alterar status.");
    } finally {
      setToggling(null);
    }
  }

  const filteredUsers = search
    ? users.filter(
      (u) =>
        u.nome.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )
    : users;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">👥 Gestão de Usuários</h3>
          <button
            onClick={() => window.open("/api/admin/export?type=users", "_blank")}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadUsers()}
            className="flex-1 min-w-[200px] px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <select
            value={wsFilter}
            onChange={(e) => setWsFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">Todas as escolas</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Buscar
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-slate-600 text-center py-8">Nenhum usuário encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Escola</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Papel</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{user.nome || "—"}</td>
                    <td className="py-3 px-4 text-slate-600">{user.email || "—"}</td>
                    <td className="py-3 px-4 text-slate-600">{user.workspace_name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${user.role === "master"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                        }`}>
                        {user.role === "master" ? "Master" : "Membro"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                        {user.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleUser(user.id, user.active)}
                        disabled={toggling === user.id}
                        className="px-3 py-1 text-xs border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                      >
                        {toggling === user.id ? "..." : user.active ? "Desativar" : "Ativar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-sm text-slate-500 mt-3">{filteredUsers.length} usuário(s) encontrado(s)</p>
      </div>
    </div>
  );
}
