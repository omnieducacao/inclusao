"use client";

import { useState, useEffect } from "react";
import type { SessionPayload } from "@/lib/session";
import { Building2, Settings, FileText, BarChart3, Bug, Loader2, Plus, Edit2, Trash2, Play, Pause, Save, X } from "lucide-react";

type Workspace = {
  id: string;
  name: string;
  pin: string;
  segments: string[];
  ai_engines: string[];
  enabled_modules: string[] | null;
  active: boolean;
  plan: string;
  credits_limit: number | null;
  created_at?: string;
};

type TabId = "escolas" | "uso-ia" | "termo" | "dashboard" | "bugs";

const SEGMENT_OPTIONS: Record<string, string> = {
  EI: "Educação Infantil",
  EF_AI: "Ensino Fundamental — Anos Iniciais",
  EF_AF: "Ensino Fundamental — Anos Finais",
  EM: "Ensino Médio",
};

const ENGINE_OPTIONS: Record<string, string> = {
  red: "OmniRed (DeepSeek)",
  blue: "OmniBlue (Kimi)",
  green: "OmniGreen (Claude)",
  yellow: "OmniYellow (Gemini)",
  orange: "OmniOrange (OpenAI)",
};

const MODULE_OPTIONS: Array<[string, string]> = [
  ["pei", "Estratégias & PEI"],
  ["paee", "Plano de Ação (AEE)"],
  ["hub", "Hub de Recursos"],
  ["diario", "Diário de Bordo"],
  ["avaliacao", "Evolução & Dados"],
];

export function AdminClient({ session }: { session: SessionPayload }) {
  const [activeTab, setActiveTab] = useState<TabId>("escolas");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Formulário nova escola
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolSegments, setNewSchoolSegments] = useState<string[]>([]);
  const [newSchoolEngines, setNewSchoolEngines] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      }
    } catch (err) {
      console.error("Erro ao carregar escolas:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createWorkspace() {
    if (!newSchoolName.trim()) {
      alert("Informe o nome da escola.");
      return;
    }
    if (newSchoolSegments.length === 0) {
      alert("Selecione ao menos um segmento.");
      return;
    }
    if (newSchoolEngines.length === 0) {
      alert("Selecione ao menos um motor de IA.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSchoolName.trim(),
          segments: newSchoolSegments,
          ai_engines: newSchoolEngines,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ Escola "${data.workspace.name}" criada! PIN: ${data.pin} — Guarde este PIN.`);
        setNewSchoolName("");
        setNewSchoolSegments([]);
        setNewSchoolEngines([]);
        loadWorkspaces();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Erro: ${error.error || "Erro ao criar escola"}`);
      }
    } catch (err) {
      console.error("Erro ao criar escola:", err);
      alert("Erro ao criar escola.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 mb-2">🔧 Admin Plataforma Omnisfera</h1>
        <p className="text-slate-600">Gerenciamento completo da plataforma</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {[
          { id: "escolas" as TabId, label: "🏫 Escolas", icon: Building2 },
          { id: "uso-ia" as TabId, label: "📊 Uso de IAs", icon: BarChart3 },
          { id: "termo" as TabId, label: "📜 Termo de Uso", icon: FileText },
          { id: "dashboard" as TabId, label: "📊 Dashboard", icon: BarChart3 },
          { id: "bugs" as TabId, label: "🐛 Bugs e Erros", icon: Bug },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === tab.id
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das tabs */}
      {activeTab === "escolas" && (
        <EscolasTab
          workspaces={workspaces}
          loading={loading}
          editingId={editingId}
          setEditingId={setEditingId}
          confirmDeleteId={confirmDeleteId}
          setConfirmDeleteId={setConfirmDeleteId}
          onRefresh={loadWorkspaces}
          newSchoolName={newSchoolName}
          setNewSchoolName={setNewSchoolName}
          newSchoolSegments={newSchoolSegments}
          setNewSchoolSegments={setNewSchoolSegments}
          newSchoolEngines={newSchoolEngines}
          setNewSchoolEngines={setNewSchoolEngines}
          onCreate={createWorkspace}
          creating={creating}
        />
      )}

      {activeTab === "uso-ia" && <UsoIATab />}
      {activeTab === "termo" && <TermoTab />}
      {activeTab === "dashboard" && <DashboardTab />}
      {activeTab === "bugs" && <BugsTab />}
    </div>

  );
}

// Tab: Escolas
function EscolasTab({
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

// Card de Workspace
function WorkspaceCard({
  workspace,
  editingId,
  setEditingId,
  confirmDeleteId,
  setConfirmDeleteId,
  onRefresh,
}: {
  workspace: Workspace;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  onRefresh: () => void;
}) {
  const [localName, setLocalName] = useState(workspace.name);
  const [localSegments, setLocalSegments] = useState(workspace.segments);
  const [localEngines, setLocalEngines] = useState(workspace.ai_engines);
  const [localPlan, setLocalPlan] = useState(workspace.plan || "basic");
  const [localCreditsLimit, setLocalCreditsLimit] = useState(workspace.credits_limit || 0);
  const [localModules, setLocalModules] = useState<Record<string, boolean>>(() => {
    const mods = workspace.enabled_modules;
    const result: Record<string, boolean> = {};
    MODULE_OPTIONS.forEach(([key]) => {
      result[key] = mods === null || mods.includes(key);
    });
    return result;
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const enabledModules = Object.entries(localModules)
        .filter(([, checked]) => checked)
        .map(([key]) => key);

      const res = await fetch(`/api/admin/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: localName,
          segments: localSegments,
          ai_engines: localEngines,
          enabled_modules: enabledModules,
          plan: localPlan,
          credits_limit: localCreditsLimit || null,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        onRefresh();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Erro: ${error.error || "Erro ao salvar"}`);
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    try {
      const res = await fetch(`/api/admin/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !workspace.active }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/admin/workspaces/${workspace.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConfirmDeleteId(null);
        onRefresh();
      } else {
        alert("Erro ao excluir.");
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir.");
    }
  }

  const isEditing = editingId === workspace.id;
  const isConfirmingDelete = confirmDeleteId === workspace.id;

  return (
    <div className="border border-slate-200 rounded-lg p-4">
      {isConfirmingDelete ? (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 font-semibold">⚠️ Excluir remove a escola e dados relacionados. Esta ação não pode ser desfeita.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sim, excluir permanentemente
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nome</label>
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Segmentos</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SEGMENT_OPTIONS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={localSegments.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLocalSegments([...localSegments, key]);
                      } else {
                        setLocalSegments(localSegments.filter((s) => s !== key));
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">Motores IA</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ENGINE_OPTIONS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={localEngines.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLocalEngines([...localEngines, key]);
                      } else {
                        setLocalEngines(localEngines.filter((e) => e !== key));
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">Plano e créditos</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  value={localPlan}
                  onChange={(e) => setLocalPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="basic">Basic (sem omnigreen)</option>
                  <option value="robusto">Robusto (com omnigreen)</option>
                </select>
              </div>
              <div>
                <input
                  type="number"
                  value={localCreditsLimit}
                  onChange={(e) => setLocalCreditsLimit(parseInt(e.target.value) || 0)}
                  placeholder="Limite de créditos (0 = ilimitado)"
                  min={0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Módulos habilitados</label>
            <div className="flex flex-wrap gap-2">
              {MODULE_OPTIONS.map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={localModules[key]}
                    onChange={(e) => setLocalModules({ ...localModules, [key]: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-slate-900">
                🏫 {workspace.name} — PIN: {workspace.pin} · {workspace.active ? "🟢 Ativa" : "🔴 Inativa"}
              </h4>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                {workspace.segments.length > 0 && (
                  <p>Segmentos: {workspace.segments.map((s) => SEGMENT_OPTIONS[s] || s).join(", ")}</p>
                )}
                {workspace.ai_engines.length > 0 && (
                  <p>Motores IA: {workspace.ai_engines.map((e) => ENGINE_OPTIONS[e] || e).join(", ")}</p>
                )}
                <p>
                  Plano: {workspace.plan === "robusto" ? "Robusto (omnigreen)" : "Basic"} · Limite créditos:{" "}
                  {workspace.credits_limit || "ilimitado"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingId(workspace.id)}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleToggleActive}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${workspace.active
                  ? "border border-slate-300 hover:bg-slate-50"
                  : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                {workspace.active ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Reativar
                  </>
                )}
              </button>
              <button
                onClick={() => setConfirmDeleteId(workspace.id)}
                className="px-3 py-1.5 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tab: Uso de IAs
function UsoIATab() {
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadUsage();
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
      console.error("Erro ao carregar uso de IA:", err);
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

// Tab: Termo de Uso
function TermoTab() {
  const [termsText, setTermsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTerms();
  }, []);

  async function loadTerms() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/platform-config?key=terms_of_use");
      if (res.ok) {
        const data = await res.json();
        const value = data.value || "";
        if (value) {
          setTermsText(value);
        } else {
          // Valor padrão
          setTermsText(
            "1. Uso profissional: A Omnisfera é uma ferramenta profissional de apoio à inclusão.\n\n" +
            "2. Confidencialidade: É proibido inserir dados pessoais sensíveis de estudantes.\n\n" +
            "3. Responsabilidade: Recomendações da IA devem ser validadas por profissionais.\n\n" +
            "4. Segurança: Credenciais são pessoais e intransferíveis.\n\n" +
            "5. Conformidade: O uso deve seguir políticas e legislação vigente."
          );
        }
      }
    } catch (err) {
      console.error("Erro ao carregar termos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/platform-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "terms_of_use", value: termsText }),
      });

      if (res.ok) {
        alert("Termo salvo. Os usuários verão a nova versão no próximo primeiro acesso.");
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Erro ao salvar: ${error.error || "Erro desconhecido"}`);
      }
    } catch (err) {
      console.error("Erro ao salvar termos:", err);
      alert("Erro ao salvar termo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-2">📜 Termo de Uso e Confidencialidade</h3>
      <p className="text-slate-600 text-sm mb-4">Este texto aparece no primeiro acesso de cada usuário após o login.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Texto do termo</label>
          <textarea
            value={termsText}
            onChange={(e) => setTermsText(e.target.value)}
            rows={14}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
            placeholder="Digite o texto do termo de uso..."
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar termo
        </button>
      </div>
    </div>
  );
}

// Tab: Dashboard
function DashboardTab() {
  const [metrics, setMetrics] = useState<{
    total: number;
    by_type: Array<{ event_type: string; count: number }>;
    by_engine: Array<{ ai_engine: string; count: number }>;
    timeline: Array<{ day: string; count: number }>;
    recent: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadMetrics();
  }, [days]);

  async function loadMetrics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/metrics?days=${days}&limit=500`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error("Erro ao carregar métricas:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">📊 Dashboard de Métricas</h3>
            <p className="text-slate-600 text-sm mt-1">Uso da plataforma</p>
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
        ) : !metrics ? (
          <p className="text-slate-600 text-center py-8">Erro ao carregar métricas.</p>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">Total de Eventos</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{metrics.total}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">Tipos de Evento</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{metrics.by_type.length}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 font-medium">Motores Usados</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{metrics.by_engine.filter((e) => e.ai_engine !== "—").length}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700 font-medium">Dias com Atividade</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">{metrics.timeline.length}</p>
              </div>
            </div>

            {/* Por Tipo */}
            {metrics.by_type.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Eventos por Tipo</h4>
                <div className="space-y-2">
                  {metrics.by_type.map((item) => (
                    <div key={item.event_type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">{item.event_type}</span>
                      <span className="text-sm font-bold text-slate-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Por Motor */}
            {metrics.by_engine.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Chamadas por Motor de IA</h4>
                <div className="space-y-2">
                  {metrics.by_engine
                    .filter((e) => e.ai_engine !== "—")
                    .map((item) => (
                      <div key={item.ai_engine} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">
                          {ENGINE_OPTIONS[item.ai_engine] || item.ai_engine}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{item.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {metrics.timeline.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Timeline de Atividade</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {metrics.timeline.map((item) => {
                    const date = new Date(item.day);
                    const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
                    return (
                      <div key={item.day} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">{dateStr}</span>
                        <span className="text-sm font-bold text-slate-900">{item.count} eventos</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Eventos Recentes */}
            {metrics.recent.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Eventos Recentes</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {metrics.recent.map((ev: any) => {
                    const date = new Date(ev.created_at);
                    const dateStr = date.toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div key={ev.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{ev.event_type}</p>
                            {ev.source && <p className="text-xs text-slate-500 mt-1">Fonte: {ev.source}</p>}
                            {ev.ai_engine && (
                              <p className="text-xs text-slate-500">
                                Motor: {ENGINE_OPTIONS[ev.ai_engine] || ev.ai_engine}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 ml-4">{dateStr}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Tab: Bugs
function BugsTab() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSeverity, setFormSeverity] = useState("média");
  const [formWorkspace, setFormWorkspace] = useState<string>("");
  const [formSource, setFormSource] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadIssues();
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    try {
      const res = await fetch("/api/admin/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      }
    } catch (err) {
      console.error("Erro ao carregar escolas:", err);
    }
  }

  async function loadIssues() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues || []);
      }
    } catch (err) {
      console.error("Erro ao carregar bugs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!formTitle.trim()) {
      alert("Informe o título.");
      return;
    }

    setSubmitting(true);
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

      if (res.ok) {
        setFormTitle("");
        setFormDescription("");
        setFormSeverity("média");
        setFormWorkspace("");
        setFormSource("");
        setShowForm(false);
        loadIssues();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Erro: ${error.error || "Erro ao registrar bug"}`);
      }
    } catch (err) {
      console.error("Erro ao registrar bug:", err);
      alert("Erro ao registrar bug.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateStatus(issueId: string, newStatus: string, notes: string) {
    try {
      const res = await fetch(`/api/admin/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, resolution_notes: notes }),
      });

      if (res.ok) {
        loadIssues();
      } else {
        alert("Erro ao atualizar status.");
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Erro ao atualizar status.");
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulário Novo Bug */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">🐛 Registro de bugs e inconsistências</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancelar" : "Novo Bug"}
          </button>
        </div>

        {showForm && (
          <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Escola relacionada (opcional)</label>
              <select
                value={formWorkspace}
                onChange={(e) => setFormWorkspace(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">(sem vínculo)</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} — PIN {ws.pin}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título do bug *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Master não consegue alterar senha"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Severidade</label>
              <select
                value={formSeverity}
                onChange={(e) => setFormSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="baixa">Baixa</option>
                <option value="média">Média</option>
                <option value="alta">Alta</option>
                <option value="crítica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Origem / Tela</label>
              <input
                type="text"
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                placeholder="Ex: Gestão de Usuários"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição detalhada</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
                placeholder="Explique o que aconteceu, quem foi impactado e como reproduzir."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Registrar bug
            </button>
          </div>
        )}
      </div>

      {/* Lista de Bugs */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Lista de Issues</h3>
        {issues.length === 0 ? (
          <p className="text-slate-600 text-center py-8">Nenhum bug registrado até o momento.</p>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} workspaces={workspaces} onUpdate={loadIssues} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Card de Issue
function IssueCard({
  issue,
  workspaces,
  onUpdate,
}: {
  issue: any;
  workspaces: Workspace[];
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState(issue.status || "aberto");
  const [localNotes, setLocalNotes] = useState(issue.resolution_notes || "");
  const [saving, setSaving] = useState(false);

  const workspaceName =
    workspaces.find((w) => w.id === issue.workspace_id)?.name || "Geral";
  const statusOrder = ["aberto", "em_andamento", "resolvido", "arquivado"];
  const statusIndex = statusOrder.indexOf(localStatus);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: localStatus, resolution_notes: localNotes }),
      });

      if (res.ok) {
        onUpdate();
      } else {
        alert("Erro ao atualizar.");
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar.");
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

  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${localStatus === "aberto" ? "bg-red-100 text-red-800" :
              localStatus === "em_andamento" ? "bg-yellow-100 text-yellow-800" :
                localStatus === "resolvido" ? "bg-green-100 text-green-800" :
                  "bg-slate-100 text-slate-800"
              }`}>
              {localStatus.toUpperCase()}
            </span>
            <h4 className="font-bold text-slate-900">{issue.title || "Sem título"}</h4>
            <span className="text-sm text-slate-500">• {workspaceName}</span>
          </div>
          {expanded && (
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>{issue.description || "_Sem descrição detalhada._"}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Severidade: {issue.severity || "média"}</p>
                  <p>Origem: {issue.source || "—"}</p>
                </div>
                <div>
                  <p>Criado em: {createdDate}</p>
                  <p>Registrado por: {issue.created_by || "—"}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {statusOrder.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notas / Próximos passos</label>
                <textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar atualização
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-4 px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          {expanded ? "Ocultar" : "Expandir"}
        </button>
      </div>
    </div>
  );
}
