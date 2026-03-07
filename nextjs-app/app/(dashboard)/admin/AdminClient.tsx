"use client";

import { useState, useEffect } from "react";
import type { SessionPayload } from "@/lib/session";
import { Loader2, Plus, Edit2, Trash2, Play, Pause, Save, X, Eye, Megaphone, Download, Activity, Camera, Upload, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { LottieIcon } from "@/components/LottieIcon";
import { EscolasTab } from "./components/EscolasTab";
import { WorkspaceCard } from "./components/WorkspaceCard";
import { UsoIATab } from "./components/UsoIATab";
import { TermoTab } from "./components/TermoTab";
import { BugsTab } from "./components/BugsTab";
import { IssueCard } from "./components/IssueCard";
import { SimulateButton } from "./components/SimulateButton";
import { EnhancedDashboardTab } from "./components/EnhancedDashboardTab";
import { UsuariosTab } from "./components/UsuariosTab";
import { LogsTab } from "./components/LogsTab";
import { AvisosTab } from "./components/AvisosTab";
import { InstagramFeedTab } from "./components/InstagramFeedTab";
import { AparenciaTab } from "./components/AparenciaTab";
import { TopbarTab } from "./components/TopbarTab";

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

type TabId = "escolas" | "usuarios" | "uso-ia" | "dashboard" | "logs" | "avisos" | "termo" | "bugs" | "instagram" | "aparencia" | "topbar";

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
          { id: "topbar" as TabId, label: "🧭 Topbar" },
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
      {activeTab === "topbar" && <TopbarTab />}
    </div>

  );
}
