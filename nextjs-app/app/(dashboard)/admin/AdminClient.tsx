"use client";

import { useState, useEffect } from "react";
import type { SessionPayload } from "@/lib/session";
import { Building2, Settings, FileText, BarChart3, Bug, Loader2, Plus, Edit2, Trash2, Play, Pause, Save, X, Eye, Users, ScrollText, Megaphone, Download, Activity, Camera, Upload, ExternalLink, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { LottieIcon } from "@/components/LottieIcon";

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
  family_module_enabled?: boolean;
  created_at?: string;
};

type TabId = "escolas" | "usuarios" | "uso-ia" | "dashboard" | "logs" | "avisos" | "termo" | "bugs" | "instagram" | "aparencia";

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      const res = await fetch("/api/admin/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      } else {
        const errorText = await res.text();
        setError(`Erro ao carregar: ${res.status}. ${errorText.slice(0, 200)}`);
      }
    } catch (err) {
      console.error("[AdminClient] Erro ao carregar escolas:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
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

  // Mostrar erro de carregamento em vez de quebrar
  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-bold text-amber-900 mb-2">Erro ao carregar painel</h2>
        <p className="text-sm text-amber-800 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => { setError(null); loadWorkspaces(); }}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 mb-2">🔧 Admin Plataforma Omnisfera</h1>
        <p className="text-slate-600">Gerenciamento completo da plataforma</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        {[
          { id: "escolas" as TabId, label: "🏫 Escolas" },
          { id: "usuarios" as TabId, label: "👥 Usuários" },
          { id: "uso-ia" as TabId, label: "📊 Uso de IAs" },
          { id: "dashboard" as TabId, label: "📈 Dashboard" },
          { id: "logs" as TabId, label: "📋 Logs" },
          { id: "avisos" as TabId, label: "📢 Avisos" },
          { id: "termo" as TabId, label: "📜 Termo" },
          { id: "bugs" as TabId, label: "🐛 Bugs" },
          { id: "instagram" as TabId, label: "📸 Feed" },
          { id: "aparencia" as TabId, label: "🎨 Aparência" },
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
      {activeTab === "usuarios" && <UsuariosTab workspaces={workspaces} />}
      {activeTab === "dashboard" && <EnhancedDashboardTab />}
      {activeTab === "logs" && <LogsTab workspaces={workspaces} />}
      {activeTab === "avisos" && <AvisosTab workspaces={workspaces} />}
      {activeTab === "termo" && <TermoTab />}
      {activeTab === "bugs" && <BugsTab />}
      {activeTab === "instagram" && <InstagramFeedTab />}
      {activeTab === "aparencia" && <AparenciaTab />}
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
  const [localSegments, setLocalSegments] = useState(workspace.segments ?? []);
  const [localEngines, setLocalEngines] = useState(workspace.ai_engines ?? []);
  const [localPlan, setLocalPlan] = useState(workspace.plan || "basic");
  const [localCreditsLimit, setLocalCreditsLimit] = useState(workspace.credits_limit || 0);
  const [localModules, setLocalModules] = useState<Record<string, boolean>>(() => {
    const mods = workspace.enabled_modules;
    const result: Record<string, boolean> = {};
    MODULE_OPTIONS.forEach(([key]) => {
      result[key] = mods == null || (Array.isArray(mods) && mods.includes(key));
    });
    return result;
  });
  const [localFamilyEnabled, setLocalFamilyEnabled] = useState(Boolean(workspace.family_module_enabled));
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
          family_module_enabled: localFamilyEnabled,
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
          <div>
            <label className="flex items-center gap-3 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={localFamilyEnabled}
                onChange={(e) => setLocalFamilyEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-semibold">👨‍👩‍👧 Módulo Família habilitado</span>
            </label>
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
                {(workspace.segments ?? []).length > 0 && (
                  <p>Segmentos: {(workspace.segments ?? []).map((s) => SEGMENT_OPTIONS[s] || s).join(", ")}</p>
                )}
                {(workspace.ai_engines ?? []).length > 0 && (
                  <p>Motores IA: {(workspace.ai_engines ?? []).map((e) => ENGINE_OPTIONS[e] || e).join(", ")}</p>
                )}
                <p>
                  Plano: {workspace.plan === "robusto" ? "Robusto (omnigreen)" : "Basic"} · Limite créditos:{" "}
                  {workspace.credits_limit || "ilimitado"}
                  {workspace.family_module_enabled && " · 👨‍👩‍👧 Família ativo"}
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
              <SimulateButton workspaceId={workspace.id} workspaceName={workspace.name} />
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

// Simulate School Button
function SimulateButton({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSimulate() {
    if (!confirm(`Deseja simular a escola "${workspaceName}"?\nVocê verá a plataforma como o master desta escola.`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erro ao iniciar simulação.");
      }
    } catch {
      alert("Erro ao iniciar simulação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSimulate}
      disabled={loading}
      className="px-3 py-1.5 text-sm border border-amber-400 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 flex items-center gap-1 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
      Simular
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// Tab: Enhanced Dashboard
// ═══════════════════════════════════════════════════════════════
function EnhancedDashboardTab() {
  const [data, setData] = useState<any>(null);
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
              {(school_breakdown || []).map((s: any) => (
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

// ═══════════════════════════════════════════════════════════════
// Tab: Usuarios (Global User Management)
// ═══════════════════════════════════════════════════════════════
function UsuariosTab({ workspaces }: { workspaces: Workspace[] }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [wsFilter, setWsFilter] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
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
    } catch (err) {
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

// ═══════════════════════════════════════════════════════════════
// Tab: Logs de Atividade
// ═══════════════════════════════════════════════════════════════
function LogsTab({ workspaces }: { workspaces: Workspace[] }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsFilter, setWsFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadLogs();
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
                  {logs.map((log: any) => {
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

// ═══════════════════════════════════════════════════════════════
// Tab: Avisos (Announcements)
// ═══════════════════════════════════════════════════════════════
function AvisosTab({ workspaces }: { workspaces: Workspace[] }) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "alert">("info");
  const [target, setTarget] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error("Erro ao carregar avisos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!title.trim() || !message.trim()) {
      alert("Preencha título e mensagem.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          announcement: { title: title.trim(), message: message.trim(), type, target },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
        setTitle("");
        setMessage("");
        setType("info");
        setTarget("all");
        setShowForm(false);
      }
    } catch (err) {
      alert("Erro ao criar aviso.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id: string) {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", announcement_id: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch {
      alert("Erro ao alterar aviso.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este aviso?")) return;
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", announcement_id: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch {
      alert("Erro ao excluir aviso.");
    }
  }

  const typeColors = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-amber-100 text-amber-800",
    alert: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* New Announcement Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">📢 Avisos da Plataforma</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            {showForm ? <X className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
            {showForm ? "Cancelar" : "Novo Aviso"}
          </button>
        </div>

        {showForm && (
          <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Manutenção programada"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mensagem *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Detalhe o aviso para os usuários..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="info">ℹ️ Informativo</option>
                  <option value="warning">⚠️ Aviso</option>
                  <option value="alert">🔴 Alerta</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Destino</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="all">Todas as escolas</option>
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              Publicar aviso
            </button>
          </div>
        )}
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Avisos Publicados</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : announcements.length === 0 ? (
          <p className="text-slate-600 text-center py-8">Nenhum aviso publicado.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a: any) => {
              const wsName = a.target === "all"
                ? "Todas as escolas"
                : workspaces.find((w) => w.id === a.target)?.name || a.target;
              const date = a.created_at
                ? new Date(a.created_at).toLocaleString("pt-BR", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                })
                : "";
              return (
                <div key={a.id} className={`border rounded-lg p-4 ${a.active ? "border-slate-200" : "border-slate-100 opacity-60"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${typeColors[a.type as keyof typeof typeColors] || typeColors.info}`}>
                          {a.type === "info" ? "INFO" : a.type === "warning" ? "AVISO" : "ALERTA"}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${a.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                          {a.active ? "Ativo" : "Inativo"}
                        </span>
                        <span className="text-xs text-slate-500">· {date} · {wsName}</span>
                      </div>
                      <h4 className="font-bold text-slate-900">{a.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{a.message}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggle(a.id)}
                        className="px-3 py-1 text-xs border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        {a.active ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="px-3 py-1 text-xs border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Tab: Feed Omnisfera (Upload de carrossel)
// ═══════════════════════════════════════════════════════════════
type FeedPost = {
  id: string;
  title: string | null;
  caption: string | null;
  category: string;
  instagram_url: string | null;
  images: string[];
  published: boolean;
  position: number;
  created_at: string;
};

const FEED_CATEGORIES = [
  { value: "instagram", label: "📰 Feed Integrado" },
  { value: "informativo", label: "📢 Informativo" },
  { value: "comemorativo", label: "🎉 Data Comemorativa" },
  { value: "institucional", label: "🏫 Institucional" },
];

function InstagramFeedTab() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("instagram");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/instagram-feed");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Erro ao carregar feed:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 8 - selectedFiles.length;
    const newFiles = files.slice(0, remaining);

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (selectedFiles.length === 0) {
      alert("Adicione pelo menos 1 imagem.");
      return;
    }

    setCreating(true);
    try {
      const formData = new FormData();
      if (title) formData.append("title", title);
      if (caption) formData.append("caption", caption);
      formData.append("category", category);
      if (instagramUrl) formData.append("instagram_url", instagramUrl);

      selectedFiles.forEach((file, i) => {
        formData.append(`image_${i}`, file);
      });

      const res = await fetch("/api/admin/instagram-feed", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("✅ Post criado com sucesso!");
        setTitle("");
        setCaption("");
        setCategory("instagram");
        setInstagramUrl("");
        setSelectedFiles([]);
        setPreviews([]);
        setShowForm(false);
        loadPosts();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Erro: ${error.error || "Erro ao criar post"}`);
      }
    } catch (err) {
      console.error("Erro ao criar post:", err);
      alert("Erro ao criar post.");
    } finally {
      setCreating(false);
    }
  }

  async function handleTogglePublish(postId: string, currentPublished: boolean) {
    try {
      const res = await fetch(`/api/admin/instagram-feed/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentPublished }),
      });
      if (res.ok) loadPosts();
    } catch (err) {
      console.error("Erro:", err);
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm("Excluir este post permanentemente?")) return;
    try {
      const res = await fetch(`/api/admin/instagram-feed/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) loadPosts();
    } catch (err) {
      console.error("Erro:", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + New Post Button */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">📸 Feed Omnisfera</h3>
            <p className="text-slate-600 text-sm mt-1">
              Posts com carrossel de imagens. Aparece na Home de todas as escolas.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2 text-sm"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancelar" : "Novo Post"}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Título (opcional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Dia da Inclusão"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {FEED_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Legenda / Texto</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva o texto do post..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Link externo (opcional)
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Imagens ({selectedFiles.length}/8)
              </label>

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {previews.map((preview, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/50 px-1 rounded">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedFiles.length < 8 && (
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                  <Upload className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    Clique para adicionar imagens ({8 - selectedFiles.length} restantes)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={creating || selectedFiles.length === 0}
              className="px-6 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              Publicar Post
            </button>
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">📋 Posts publicados</h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-slate-600 text-center py-8">
            Nenhum post ainda. Crie o primeiro acima.
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const catLabel = FEED_CATEGORIES.find((c) => c.value === post.category)?.label || post.category;
              return (
                <div key={post.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {post.images[0] && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                        <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-pink-100 text-pink-800">
                          {catLabel}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${post.published ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                          {post.published ? "Publicado" : "Rascunho"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {post.images.length} foto{post.images.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-slate-400">
                          · {new Date(post.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {post.title && <h4 className="font-bold text-slate-900 text-sm">{post.title}</h4>}
                      {post.caption && (
                        <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                          {post.caption}
                        </p>
                      )}
                      {post.instagram_url && (
                        <a
                          href={post.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-pink-600 mt-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> Ver link
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleTogglePublish(post.id, post.published)}
                        className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        {post.published ? "Despublicar" : "Publicar"}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1.5 text-xs border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Tab: Aparência — Customização de Cor e Ícone dos Cards da Home
   ═══════════════════════════════════════════════════════════════ */

const HOME_MODULES = [
  { key: "estudantes", title: "Estudantes", defaultColor: "sky", defaultIcon: "estudantes_flat" },
  { key: "pei", title: "Estratégias & PEI", defaultColor: "blue", defaultIcon: "pei_flat" },
  { key: "pei-professor", title: "PEI - Professor", defaultColor: "teal", defaultIcon: "pei_flat" },
  { key: "plano-curso", title: "Plano de Curso", defaultColor: "sky", defaultIcon: "central_inteligencia_flat" },
  { key: "avaliacao-diagnostica", title: "Avaliação Diagnóstica", defaultColor: "blue", defaultIcon: "avaliacao_diagnostica_flat" },
  { key: "avaliacao-processual", title: "Avaliação Processual", defaultColor: "green", defaultIcon: "dados_flat" },
  { key: "paee", title: "Plano de Ação / PAEE", defaultColor: "violet", defaultIcon: "paee_flat" },
  { key: "hub", title: "Hub de Inclusão", defaultColor: "cyan", defaultIcon: "hub_flat" },
  { key: "diario", title: "Diário de Bordo", defaultColor: "rose", defaultIcon: "Diario_flat" },
  { key: "monitoramento", title: "Evolução & Dados", defaultColor: "slate", defaultIcon: "dados_flat" },
  { key: "pgi", title: "PGI", defaultColor: "presentation", defaultIcon: "pgi_flat" },
  { key: "gestao", title: "Gestão de Usuários", defaultColor: "test", defaultIcon: "gestão_usuario_flat" },
  { key: "config-escola", title: "Configuração Escola", defaultColor: "reports", defaultIcon: "configuracao_escola_flat" },
];

const COLOR_OPTIONS = [
  { key: "sky", label: "Azul Índigo", hex: "#4F5BD5" },
  { key: "blue", label: "Azul Vivo", hex: "#4285F4" },
  { key: "teal", label: "Teal", hex: "#34A853" },
  { key: "green", label: "Verde", hex: "#2E7D32" },
  { key: "cyan", label: "Ciano", hex: "#34A853" },
  { key: "violet", label: "Roxo", hex: "#9334E6" },
  { key: "rose", label: "Rosa", hex: "#E8453C" },
  { key: "amber", label: "Âmbar", hex: "#F57F17" },
  { key: "slate", label: "Cinza", hex: "#F9AB00" },
  { key: "presentation", label: "Verde Lima", hex: "#7CB342" },
  { key: "table", label: "Azul Google", hex: "#1A73E8" },
  { key: "test", label: "Azul PEI", hex: "#4285F4" },
  { key: "reports", label: "Amarelo", hex: "#F9AB00" },
];

type CardCustomization = Record<string, { color?: string; icon?: string }>;

function AparenciaTab() {
  const [customizations, setCustomizations] = useState<CardCustomization>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flatIcons, setFlatIcons] = useState<string[]>([]);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [iconSearch, setIconSearch] = useState("");

  // Load saved customizations and available flat icons
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/platform-config?key=card_customizations")
        .then((r) => r.json())
        .then((d) => {
          if (d.value) {
            try {
              setCustomizations(JSON.parse(d.value));
            } catch { /* ignore parse errors */ }
          }
        })
        .catch(() => { }),
      fetch("/api/admin/flat-icons")
        .then((r) => r.json())
        .then((d) => setFlatIcons(d.icons || []))
        .catch(() => {
          // Fallback: use known icons
          setFlatIcons([]);
        }),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/platform-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "card_customizations",
          value: JSON.stringify(customizations),
        }),
      });
      if (res.ok) {
        alert("✅ Customizações de aparência salvas! Os cards serão atualizados ao recarregar a home.");
      } else {
        alert("Erro ao salvar.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  function updateModule(moduleKey: string, field: "color" | "icon", value: string) {
    setCustomizations((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [field]: value,
      },
    }));
  }

  function resetModule(moduleKey: string) {
    setCustomizations((prev) => {
      const next = { ...prev };
      delete next[moduleKey];
      return next;
    });
  }

  const filteredIcons = flatIcons.filter((ic) =>
    iconSearch ? ic.toLowerCase().includes(iconSearch.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">🎨 Aparência dos Cards da Home</h3>
            <p className="text-slate-600 text-sm mt-1">
              Personalize a cor e o ícone de cada módulo na página inicial.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar alterações
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {HOME_MODULES.map((mod) => {
              const custom = customizations[mod.key] || {};
              const currentColor = custom.color || mod.defaultColor;
              const currentIcon = custom.icon || mod.defaultIcon;
              const isEditing = editingModule === mod.key;
              const colorInfo = COLOR_OPTIONS.find((c) => c.key === currentColor);

              return (
                <div
                  key={mod.key}
                  className={`border rounded-xl p-4 transition-all ${isEditing ? "border-blue-300 bg-blue-50/30" : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Color preview */}
                      <div
                        className="w-8 h-8 rounded-lg border border-white shadow"
                        style={{ backgroundColor: colorInfo?.hex || "#4285F4" }}
                      />
                      <div>
                        <h4 className="font-semibold text-slate-800">{mod.title}</h4>
                        <p className="text-xs text-slate-500">
                          Cor: {colorInfo?.label || currentColor} · Ícone: {currentIcon}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingModule(isEditing ? null : mod.key)}
                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                      >
                        {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        {isEditing ? "Fechar" : "Editar"}
                      </button>
                      {custom.color || custom.icon ? (
                        <button
                          onClick={() => resetModule(mod.key)}
                          className="px-3 py-1.5 text-sm border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50"
                        >
                          Resetar
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 space-y-4">
                      {/* Color picker */}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Cor do card</p>
                        <div className="flex flex-wrap gap-2">
                          {COLOR_OPTIONS.map((color) => (
                            <button
                              key={color.key}
                              onClick={() => updateModule(mod.key, "color", color.key)}
                              className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${currentColor === color.key
                                ? "border-blue-500 scale-110 shadow-lg"
                                : "border-transparent hover:border-slate-300"
                                }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.label}
                            >
                              {currentColor === color.key && (
                                <span className="text-white text-xs font-bold">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Icon picker */}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Ícone Lottie</p>
                        <input
                          type="text"
                          placeholder="Buscar ícone..."
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3"
                        />
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[280px] overflow-y-auto p-1">
                          {filteredIcons.map((iconName) => {
                            const isSelected = currentIcon === `flat/${iconName}`;
                            return (
                              <button
                                key={iconName}
                                onClick={() => updateModule(mod.key, "icon", `flat/${iconName}`)}
                                className={`relative aspect-square rounded-lg border-2 p-1.5 transition-all hover:scale-105 flex flex-col items-center justify-center gap-0.5 ${isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-md"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                                  }`}
                                title={iconName.replace(/wired-flat-\d+-/, "").replace(/-hover.*/, "").replace(/-/g, " ")}
                              >
                                <LottieIcon
                                  animation={`flat/${iconName}`}
                                  size={36}
                                  loop={false}
                                  autoplay={true}
                                />
                                <span className="text-[8px] text-slate-500 truncate w-full text-center leading-tight">
                                  {iconName.replace(/wired-flat-\d+-/, "").replace(/-hover.*/, "").replace(/-/g, " ").substring(0, 12)}
                                </span>
                              </button>
                            );
                          })}
                          {filteredIcons.length === 0 && (
                            <p className="col-span-full text-sm text-slate-500 text-center py-4">
                              {flatIcons.length === 0
                                ? "Nenhum ícone flat encontrado. Crie a API /api/admin/flat-icons."
                                : "Nenhum ícone encontrado para a busca."}
                            </p>
                          )}
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
