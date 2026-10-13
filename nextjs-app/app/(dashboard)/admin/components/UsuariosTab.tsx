"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
import { MensagemAdmin, type Mensagem } from "./MensagemAdmin";
export function UsuariosTab({ workspaces }: { workspaces: Workspace[] }) {
  const [users, setUsers] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [wsFilter, setWsFilter] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

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
      /* client-side */ console.error("Erro ao carregar usuários:", err);
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
      setMensagem({ tipo: "erro", texto: "Não foi possível ativar ou desativar o usuário." });
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
    <section className="omni-cartao" aria-labelledby="usuarios-titulo">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3 id="usuarios-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}>
          <Users size={20} aria-hidden /> Usuários
        </h3>
        <button
          type="button"
          onClick={() => window.open("/api/admin/export?type=users", "_blank")}
          className="omni-btn omni-btn--secundario omni-btn--pequeno"
        >
          <Download size={16} aria-hidden /> Baixar planilha (CSV)
        </button>
      </div>

      <MensagemAdmin mensagem={mensagem} onFechar={() => setMensagem(null)} />

      {/* Filtros */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
        <label className="omni-campo" style={{ flex: "1 1 240px" }}>
          <span className="omni-campo__rotulo">Buscar</span>
          <input
            type="search"
            placeholder="Nome ou e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadUsers()}
            className="omni-entrada"
          />
        </label>
        <label className="omni-campo" style={{ flex: "0 1 260px" }}>
          <span className="omni-campo__rotulo">Escola</span>
          <select
            value={wsFilter}
            onChange={(e) => setWsFilter(e.target.value)}
            className="omni-entrada"
          >
            <option value="">Todas as escolas</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={loadUsers}
          className="omni-btn omni-btn--primario"
        >
          Buscar
        </button>
      </div>

      {/* Tabela */}
      {loading ? (
        <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 0" }}>
          <OmniLoader size={20} /> Carregando usuários…
        </p>
      ) : filteredUsers.length === 0 ? (
        <p className="omni-apoio" style={{ textAlign: "center", padding: "24px 0" }}>Nenhum usuário encontrado.</p>
      ) : (
        <div className="omni-tabela-caixa">
          <table className="omni-tabela">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">E-mail</th>
                <th scope="col">Escola</th>
                <th scope="col">Papel</th>
                <th scope="col">Situação</th>
                <th scope="col"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="omni-tabela__nome">{user.nome || "—"}</td>
                  <td>{user.email || "—"}</td>
                  <td>{user.workspace_name}</td>
                  <td>
                    <span className={`omni-estado ${user.role === "master" ? "omni-estado--info" : "omni-estado--neutro"}`}>
                      {user.role === "master" ? "Coordenação" : "Equipe"}
                    </span>
                  </td>
                  <td>
                    <span className={`omni-estado ${user.active ? "omni-estado--sucesso" : "omni-estado--erro"}`}>
                      {user.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleUser(user.id, user.active)}
                      disabled={toggling === user.id}
                      aria-label={`${user.active ? "Desativar" : "Ativar"} ${user.nome || user.email || "usuário"}`}
                      className="omni-btn omni-btn--secundario omni-btn--pequeno"
                    >
                      {toggling === user.id ? <OmniLoader size={16} /> : null}
                      {toggling === user.id ? "Salvando" : user.active ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="omni-apoio" style={{ fontSize: 13 }}>
        {filteredUsers.length} {filteredUsers.length === 1 ? "usuário encontrado" : "usuários encontrados"}
      </p>
    </section>
  );
}
