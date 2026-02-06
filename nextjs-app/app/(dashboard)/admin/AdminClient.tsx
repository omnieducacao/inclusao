"use client";

import { useState, useEffect, useCallback } from "react";

type TabId = "escolas" | "uso_ia" | "termo" | "dashboard" | "bugs";

type Workspace = {
  id: string;
  name: string;
  pin?: string;
  segments?: string[];
  ai_engines?: string[];
  enabled_modules?: string[];
  active?: boolean;
  plan?: string;
  credits_limit?: number | null;
};

type PlatformIssue = {
  id: string;
  title: string;
  description?: string;
  severity?: string;
  workspace_id?: string;
  source?: string;
  created_by?: string;
  status?: string;
  resolution_notes?: string;
  created_at?: string;
};

const SEGMENT_OPTIONS: Record<string, string> = {
  EI: "Educação Infantil",
  EF_AI: "Ensino Fundamental — Anos Iniciais",
  EF_AF: "Ensino Fundamental — Anos Finais",
  EM: "Ensino Médio",
};

const ENGINE_OPTIONS: Record<string, string> = {
  red: "OmniRed",
  blue: "OmniBlue",
  green: "OmniGreen",
  yellow: "OmniYellow",
  orange: "OmniOrange",
};

const MODULE_OPTIONS: Array<[string, string]> = [
  ["pei", "Estratégias & PEI"],
  ["paee", "Plano de Ação (AEE)"],
  ["hub", "Hub de Recursos"],
  ["diario", "Diário de Bordo"],
  ["avaliacao", "Evolução & Dados"],
];

export function AdminClient() {
  const [activeTab, setActiveTab] = useState<TabId>("escolas");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadWorkspaces = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/workspaces");
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "err", text: data.error });
        setWorkspaces([]);
      } else {
        setWorkspaces(data.workspaces || []);
      }
    } catch (e) {
      setMessage({ type: "err", text: "Erro ao carregar escolas." });
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("escolas")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
            activeTab === "escolas"
              ? "bg-indigo-100 text-indigo-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          🏫 Escolas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("uso_ia")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
            activeTab === "uso_ia"
              ? "bg-indigo-100 text-indigo-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          📊 Uso de IAs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("termo")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
            activeTab === "termo"
              ? "bg-indigo-100 text-indigo-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          📜 Termo de Uso
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
            activeTab === "dashboard"
              ? "bg-indigo-100 text-indigo-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          📊 Dashboard
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bugs")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
            activeTab === "bugs"
              ? "bg-indigo-100 text-indigo-800 border border-slate-200 border-b-white -mb-px"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          🐛 Bugs e Erros
        </button>
      </div>

      {/* Conteúdo das abas */}
      {activeTab === "escolas" && (
        <EscolasTab
          workspaces={workspaces}
          loading={loading}
          onRefresh={loadWorkspaces}
          onMessage={setMessage}
        />
      )}

      {activeTab === "uso_ia" && <UsoIATab workspaces={workspaces} />}

      {activeTab === "termo" && <TermoTab onMessage={setMessage} />}

      {activeTab === "dashboard" && <DashboardTab />}

      {activeTab === "bugs" && <BugsTab workspaces={workspaces} />}
    </div>
  );
}

function EscolasTab({
  workspaces,
  loading,
  onRefresh,
  onMessage,
}: {
  workspaces: Workspace[];
  loading: boolean;
  onRefresh: () => void;
  onMessage: (msg: { type: "ok" | "err"; text: string }) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [nomeEscola, setNomeEscola] = useState("");
  const [segmentosEscola, setSegmentosEscola] = useState<string[]>([]);
  const [motoresEscola, setMotoresEscola] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createdPin, setCreatedPin] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelId, setConfirmDelId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!nomeEscola.trim()) {
      onMessage({ type: "err", text: "Informe o nome da escola." });
      return;
    }
    if (segmentosEscola.length === 0) {
      onMessage({ type: "err", text: "Selecione ao menos um segmento." });
      return;
    }
    if (motoresEscola.length === 0) {
      onMessage({ type: "err", text: "Selecione ao menos um motor de IA." });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nomeEscola.trim(),
          segments: segmentosEscola,
          ai_engines: motoresEscola,
        }),
      });
      const data = await res.json();
      if (data.error) {
        onMessage({ type: "err", text: data.error });
      } else {
        setCreatedPin(data.pin);
        onMessage({ type: "ok", text: `✅ Escola criada! PIN: ${data.pin} — Guarde este PIN.` });
        setNomeEscola("");
        setSegmentosEscola([]);
        setMotoresEscola([]);
        setShowForm(false);
        onRefresh();
      }
    } catch (e) {
      onMessage({ type: "err", text: "Erro ao criar escola." });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 text-lg">🏫 Escolas</h3>

      {/* Formulário nova escola */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="w-full px-4 py-3 text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
        >
          ➕ Nova escola
          <span>{showForm ? "▲" : "▼"}</span>
        </button>
        {showForm && (
          <div className="p-4 bg-white border-t border-slate-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da escola *</label>
              <input
                type="text"
                value={nomeEscola}
                onChange={(e) => setNomeEscola(e.target.value)}
                placeholder="Ex: Escola Municipal XYZ"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Segmentos atendidos *</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SEGMENT_OPTIONS).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={segmentosEscola.includes(key)}
                      onChange={(e) =>
                        setSegmentosEscola(
                          e.target.checked ? [...segmentosEscola, key] : segmentosEscola.filter((x) => x !== key)
                        )
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motores de IA disponíveis *</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ENGINE_OPTIONS).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={motoresEscola.includes(key)}
                      onChange={(e) =>
                        setMotoresEscola(
                          e.target.checked ? [...motoresEscola, key] : motoresEscola.filter((x) => x !== key)
                        )
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            {createdPin && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold">
                PIN gerado: <span className="text-lg">{createdPin}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? "Criando…" : "Criar escola e gerar PIN"}
            </button>
          </div>
        )}
      </div>

      {/* Lista de escolas */}
      <div>
        <h4 className="font-semibold text-slate-800 mb-3">📋 Escolas cadastradas</h4>
        {loading ? (
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
            Carregando…
          </div>
        ) : workspaces.length === 0 ? (
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
            Nenhuma escola cadastrada. Crie a primeira acima.
          </div>
        ) : (
          <div className="space-y-3">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                editingId={editingId}
                setEditingId={setEditingId}
                confirmDelId={confirmDelId}
                setConfirmDelId={setConfirmDelId}
                onRefresh={onRefresh}
                onMessage={onMessage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkspaceCard({
  workspace,
  editingId,
  setEditingId,
  confirmDelId,
  setConfirmDelId,
  onRefresh,
  onMessage,
}: {
  workspace: Workspace;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  confirmDelId: string | null;
  setConfirmDelId: (id: string | null) => void;
  onRefresh: () => void;
  onMessage: (msg: { type: "ok" | "err"; text: string }) => void;
}) {
  const [editName, setEditName] = useState(workspace.name);
  const [editSegments, setEditSegments] = useState<string[]>(workspace.segments || []);
  const [editEngines, setEditEngines] = useState<string[]>(workspace.ai_engines || []);
  const [editModules, setEditModules] = useState<string[]>(workspace.enabled_modules || []);
  const [editActive, setEditActive] = useState(workspace.active ?? true);
  const [saving, setSaving] = useState(false);

  const isEditing = editingId === workspace.id;
  const isDeleting = confirmDelId === workspace.id;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          segments: editSegments,
          ai_engines: editEngines,
          enabled_modules: editModules,
          active: editActive,
        }),
      });
      const data = await res.json();
      if (data.error) {
        onMessage({ type: "err", text: data.error });
      } else {
        onMessage({ type: "ok", text: "Escola atualizada com sucesso." });
        setEditingId(null);
        onRefresh();
      }
    } catch (e) {
      onMessage({ type: "err", text: "Erro ao atualizar escola." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/workspaces/${workspace.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        onMessage({ type: "err", text: data.error });
      } else {
        onMessage({ type: "ok", text: "Escola excluída com sucesso." });
        setConfirmDelId(null);
        onRefresh();
      }
    } catch (e) {
      onMessage({ type: "err", text: "Erro ao excluir escola." });
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
        <div>
          <span className="font-semibold text-slate-800">{workspace.name}</span>
          <span className="mx-2 text-slate-400">•</span>
          <span className="text-sm text-slate-600">PIN: {workspace.pin || "—"}</span>
          <span className="mx-2 text-slate-400">•</span>
          <span className={`text-sm ${workspace.active ? "text-emerald-600" : "text-red-600"}`}>
            {workspace.active ? "🟢 Ativa" : "🔴 Inativa"}
          </span>
        </div>
        <div className="flex gap-2">
          {!isEditing && !isDeleting && (
            <>
              <button
                type="button"
                onClick={() => setEditingId(workspace.id)}
                className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelId(workspace.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

      {isDeleting && (
        <div className="p-4 border-t border-slate-200">
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm mb-3">
            ⚠️ Excluir remove a escola e dados relacionados. Esta ação não pode ser desfeita.
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Sim, excluir permanentemente
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelId(null)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="p-4 border-t border-slate-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Segmentos</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SEGMENT_OPTIONS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={editSegments.includes(key)}
                    onChange={(e) =>
                      setEditSegments(
                        e.target.checked ? [...editSegments, key] : editSegments.filter((x) => x !== key)
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motores de IA</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ENGINE_OPTIONS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={editEngines.includes(key)}
                    onChange={(e) =>
                      setEditEngines(
                        e.target.checked ? [...editEngines, key] : editEngines.filter((x) => x !== key)
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Módulos habilitados</label>
            <div className="flex flex-wrap gap-2">
              {MODULE_OPTIONS.map(([key, label]) => (
                <label key={key} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={editModules.includes(key)}
                    onChange={(e) =>
                      setEditModules(
                        e.target.checked ? [...editModules, key] : editModules.filter((x) => x !== key)
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
              />
              Escola ativa
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setEditName(workspace.name);
                setEditSegments(workspace.segments || []);
                setEditEngines(workspace.ai_engines || []);
                setEditModules(workspace.enabled_modules || []);
                setEditActive(workspace.active ?? true);
              }}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!isEditing && !isDeleting && (
        <div className="px-4 py-3 border-t border-slate-200 text-sm text-slate-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Segmentos:</strong> {(workspace.segments || []).map((s) => SEGMENT_OPTIONS[s] || s).join(", ") || "—"}
            </div>
            <div>
              <strong>Motores:</strong> {(workspace.ai_engines || []).map((e) => ENGINE_OPTIONS[e] || e).join(", ") || "—"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsoIATab({ workspaces }: { workspaces: Workspace[] }) {
  const [days, setDays] = useState(30);
  const [usage, setUsage] = useState<Array<{
    workspace_id: string;
    workspace_name: string;
    red: number;
    blue: number;
    green: number;
    yellow: number;
    orange: number;
    total_calls: number;
    credits_used: number;
    plan: string;
    credits_limit: number | null;
  }>>([]);
  const [loading, setLoading] = useState(false);

  const loadUsage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ia-usage?days=${days}`);
      const data = await res.json();
      if (data.error) {
        setUsage([]);
      } else {
        setUsage(data.usage || []);
      }
    } catch (e) {
      setUsage([]);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-lg">📊 Uso de IAs por escola</h3>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
      </div>
      <p className="text-sm text-slate-600">
        Controle de chamadas por motor e base para sistema de créditos. Motores disponíveis conforme associados à escola no cadastro.
      </p>

      {loading ? (
        <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
          Carregando…
        </div>
      ) : usage.length === 0 ? (
        <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
          Ainda não há registros de uso de IA. As chamadas passam a ser contabilizadas após a migration 00022 estar aplicada.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200">Escola</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">OmniRed</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">OmniBlue</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">OmniGreen</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">OmniYellow</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">OmniOrange</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">Total chamadas</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">Créditos usados</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">Plano</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200">Limite créditos</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((u) => (
                <tr key={u.workspace_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-800">{u.workspace_name}</td>
                  <td className="px-4 py-3 text-sm text-center text-slate-600">{u.red}</td>
                  <td className="px-4 py-3 text-sm text-center text-slate-600">{u.blue}</td>
                  <td className="px-4 py-3 text-sm text-center text-slate-600">{u.green}</td>
                  <td className="px-4 py-3 text-sm text-center text-slate-600">{u.yellow}</td>
                  <td className="px-4 py-3 text-sm text-center text-slate-600">{u.orange}</td>
                  <td className="px-4 py-3 text-sm text-center font-semibold text-slate-800">{u.total_calls}</td>
                  <td className="px-4 py-3 text-sm text-center font-semibold text-slate-800">{u.credits_used.toFixed(1)}</td>
                  <td className="px-4 py-3 text-sm text-center text-slate-600">{u.plan}</td>
                  <td className="px-4 py-3 text-sm text-center text-slate-600">{u.credits_limit || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-500">
        Créditos usados = soma das unidades por chamada (1 por padrão). No futuro, planos terão limite; ao atingir, a escola migra para plano mais robusto.
      </p>
    </div>
  );
}

function TermoTab({ onMessage }: { onMessage: (msg: { type: "ok" | "err"; text: string }) => void }) {
  const [terms, setTerms] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/config?key=terms_of_use");
        const data = await res.json();
        if (data.value) {
          setTerms(data.value);
        } else {
          // Valor padrão
          setTerms(
            "1. Uso profissional: A Omnisfera é uma ferramenta profissional de apoio à inclusão.\n\n" +
              "2. Confidencialidade: É proibido inserir dados pessoais sensíveis de estudantes.\n\n" +
              "3. Responsabilidade: Recomendações da IA devem ser validadas por profissionais.\n\n" +
              "4. Segurança: Credenciais são pessoais e intransferíveis.\n\n" +
              "5. Conformidade: O uso deve seguir políticas e legislação vigente."
          );
        }
      } catch (e) {
        console.error("Erro ao carregar termo:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "terms_of_use", value: terms }),
      });
      const data = await res.json();
      if (data.error) {
        onMessage({ type: "err", text: data.error });
      } else {
        onMessage({ type: "ok", text: "Termo salvo. Os usuários verão a nova versão no próximo primeiro acesso." });
      }
    } catch (e) {
      onMessage({ type: "err", text: "Erro ao salvar termo." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 text-lg">📜 Termo de Uso e Confidencialidade</h3>
      <p className="text-sm text-slate-600">Este texto aparece no primeiro acesso de cada usuário após o login.</p>

      {loading ? (
        <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
          Carregando…
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={14}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm"
            placeholder="Digite o texto do termo de uso..."
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar termo"}
          </button>
        </div>
      )}
    </div>
  );
}

function DashboardTab() {
  const [usage, setUsage] = useState<{
    total: number;
    by_type: Array<{ event_type: string; count: number }>;
    by_engine: Array<{ ai_engine: string; count: number }>;
    timeline: Array<{ day: string; count: number }>;
    recent: Array<Record<string, unknown>>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/usage?days=7");
        const data = await res.json();
        if (data.usage) {
          setUsage(data.usage);
        }
      } catch (e) {
        console.error("Erro ao carregar dashboard:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
        Carregando…
      </div>
    );
  }

  if (!usage || usage.total === 0) {
    return (
      <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
        Ainda não há eventos registrados. Assim que os usuários começarem a acessar, o dashboard será preenchido automaticamente.
      </div>
    );
  }

  const byTypeMap = Object.fromEntries(usage.by_type.map((item) => [item.event_type, item.count]));
  const loginEvents = Object.entries(byTypeMap).reduce(
    (sum, [event, count]) => sum + (event.startsWith("login") ? count : 0),
    0
  );
  const pageViews = byTypeMap["page_view"] || 0;

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 text-lg">📊 Uso da plataforma (últimos 7 dias)</h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-slate-200 bg-white">
          <div className="text-2xl font-bold text-slate-800">{usage.total}</div>
          <div className="text-xs text-slate-500">Eventos capturados</div>
        </div>
        <div className="p-4 rounded-lg border border-slate-200 bg-white">
          <div className="text-2xl font-bold text-slate-800">{pageViews}</div>
          <div className="text-xs text-slate-500">Page views</div>
        </div>
        <div className="p-4 rounded-lg border border-slate-200 bg-white">
          <div className="text-2xl font-bold text-slate-800">{loginEvents}</div>
          <div className="text-xs text-slate-500">Logins</div>
        </div>
      </div>

      {usage.timeline.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <h4 className="font-semibold text-slate-800 mb-4">Atividade diária</h4>
          <div className="space-y-2">
            {usage.timeline
              .sort((a, b) => a.day.localeCompare(b.day))
              .map((item) => {
                const maxCount = Math.max(...usage.timeline.map((t) => t.count));
                const porcentagem = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={item.day} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700">{item.day}</span>
                      <span className="font-semibold text-slate-800">{item.count}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${porcentagem}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {usage.by_engine.filter((e) => e.ai_engine !== "—").length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <h4 className="font-semibold text-slate-800 mb-4">Motores de IA mais usados</h4>
          <div className="space-y-2">
            {usage.by_engine
              .filter((e) => e.ai_engine !== "—")
              .sort((a, b) => b.count - a.count)
              .map((item) => {
                const maxCount = Math.max(...usage.by_engine.map((e) => e.count));
                const porcentagem = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={item.ai_engine} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700">{item.ai_engine}</span>
                      <span className="font-semibold text-slate-800">{item.count}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full transition-all"
                        style={{ width: `${porcentagem}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {usage.recent.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <h4 className="font-semibold text-slate-800 mb-4">Eventos recentes</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {usage.recent.slice(0, 10).map((event, idx) => {
              const date = event.created_at
                ? new Date(event.created_at as string).toLocaleString("pt-BR")
                : "—";
              return (
                <div key={idx} className="text-sm text-slate-600 border-b border-slate-100 pb-2">
                  {date} · {String(event.event_type || "—")} · {String(event.source || "—")}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BugsTab({ workspaces }: { workspaces: Workspace[] }) {
  const [issues, setIssues] = useState<PlatformIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSeverity, setFormSeverity] = useState("média");
  const [formWorkspace, setFormWorkspace] = useState("");
  const [formSource, setFormSource] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [savingIssue, setSavingIssue] = useState(false);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/issues");
      const data = await res.json();
      if (data.error) {
        setIssues([]);
      } else {
        setIssues(data.issues || []);
      }
    } catch (e) {
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleCreate = async () => {
    if (!formTitle.trim()) {
      alert("Informe o título.");
      return;
    }

    setCreating(true);
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
      const data = await res.json();
      if (data.error) {
        alert("Erro: " + data.error);
      } else {
        setFormTitle("");
        setFormDescription("");
        setFormSeverity("média");
        setFormWorkspace("");
        setFormSource("");
        setShowForm(false);
        loadIssues();
      }
    } catch (e) {
      alert("Erro ao registrar bug.");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveIssue = async (issueId: string) => {
    setSavingIssue(true);
    try {
      const res = await fetch(`/api/admin/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          resolution_notes: editNotes,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("Erro: " + data.error);
      } else {
        setEditingIssueId(null);
        loadIssues();
      }
    } catch (e) {
      alert("Erro ao atualizar issue.");
    } finally {
      setSavingIssue(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800 text-lg">🐛 Registro de bugs e inconsistências</h3>

      {/* Formulário novo bug */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="w-full px-4 py-3 text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
        >
          ➕ Registrar bug
          <span>{showForm ? "▲" : "▼"}</span>
        </button>
        {showForm && (
          <div className="p-4 bg-white border-t border-slate-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título do bug *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Master não consegue alterar senha"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Severidade</label>
                <select
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                  <option value="crítica">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Origem / Tela</label>
                <input
                  type="text"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  placeholder="Ex: Gestão de Usuários"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Escola relacionada (opcional)</label>
              <select
                value={formWorkspace}
                onChange={(e) => setFormWorkspace(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="">(sem vínculo)</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} — PIN {ws.pin || "—"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição detalhada</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
                placeholder="Explique o que aconteceu, quem foi impactado e como reproduzir."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? "Registrando…" : "Registrar bug"}
            </button>
          </div>
        )}
      </div>

      {/* Lista de bugs */}
      <div>
        <h4 className="font-semibold text-slate-800 mb-3">📋 Bugs registrados</h4>
        {loading ? (
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
            Carregando…
          </div>
        ) : issues.length === 0 ? (
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-center">
            Nenhum bug registrado até o momento.
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => {
              const isEditing = editingIssueId === issue.id;
              const workspaceName =
                workspaces.find((w) => w.id === issue.workspace_id)?.name || "Geral";
              const statusColors: Record<string, string> = {
                aberto: "bg-blue-100 text-blue-800",
                em_andamento: "bg-yellow-100 text-yellow-800",
                resolvido: "bg-emerald-100 text-emerald-800",
                arquivado: "bg-slate-100 text-slate-800",
              };

              return (
                <div key={issue.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[issue.status || "aberto"] || statusColors.aberto}`}>
                        [{String(issue.status || "aberto").toUpperCase()}]
                      </span>
                      <span className="ml-2 font-semibold text-slate-800">{issue.title}</span>
                      <span className="mx-2 text-slate-400">•</span>
                      <span className="text-sm text-slate-600">{workspaceName}</span>
                    </div>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIssueId(issue.id);
                          setEditStatus(issue.status || "aberto");
                          setEditNotes(issue.resolution_notes || "");
                        }}
                        className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="p-4 border-t border-slate-200 space-y-4">
                      <div>
                        <p className="text-sm text-slate-700 mb-2">{issue.description || "Sem descrição detalhada."}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 mb-4">
                          <div>
                            <strong>Severidade:</strong> {issue.severity || "média"}
                          </div>
                          <div>
                            <strong>Origem:</strong> {issue.source || "—"}
                          </div>
                          <div>
                            <strong>Criado em:</strong>{" "}
                            {issue.created_at
                              ? new Date(issue.created_at).toLocaleString("pt-BR")
                              : "—"}
                          </div>
                          <div>
                            <strong>Registrado por:</strong> {issue.created_by || "—"}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        >
                          <option value="aberto">Aberto</option>
                          <option value="em_andamento">Em Andamento</option>
                          <option value="resolvido">Resolvido</option>
                          <option value="arquivado">Arquivado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notas / Próximos passos</label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveIssue(issue.id)}
                          disabled={savingIssue}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                        >
                          {savingIssue ? "Salvando…" : "Salvar atualização"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIssueId(null);
                            setEditStatus(issue.status || "aberto");
                            setEditNotes(issue.resolution_notes || "");
                          }}
                          className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3 border-t border-slate-100 text-sm text-slate-700">
                      <p className="mb-2">{issue.description || "Sem descrição detalhada."}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                        <div>
                          <strong>Severidade:</strong> {issue.severity || "média"}
                        </div>
                        <div>
                          <strong>Origem:</strong> {issue.source || "—"}
                        </div>
                        <div>
                          <strong>Criado em:</strong>{" "}
                          {issue.created_at ? new Date(issue.created_at).toLocaleString("pt-BR") : "—"}
                        </div>
                        <div>
                          <strong>Registrado por:</strong> {issue.created_by || "—"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
