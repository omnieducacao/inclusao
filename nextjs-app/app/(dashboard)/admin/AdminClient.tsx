"use client";

import { useState, useEffect } from "react";
import type { SessionPayload } from "@/lib/session";
import { School, Users, Cpu, BarChart3, ScrollText, ShieldCheck, Megaphone, FileText, Bug, Camera, Palette, PanelTop, Inbox, RefreshCw } from "lucide-react";
import { MensagemAdmin, type Mensagem } from "./components/MensagemAdmin";
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
import { AuditoriaTab } from "./components/AuditoriaTab";
import { LeadsTab } from "./components/LeadsTab";

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

type TabId = "escolas" | "usuarios" | "uso-ia" | "dashboard" | "logs" | "auditoria" | "avisos" | "termo" | "bugs" | "instagram" | "aparencia" | "topbar" | "contatos";

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
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

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
      /* client-side */ console.error("[AdminClient] Erro ao carregar escolas:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function createWorkspace() {
    if (!newSchoolName.trim()) {
      setMensagem({ tipo: "atencao", texto: "Escreva o nome da escola." });
      return;
    }
    if (newSchoolSegments.length === 0) {
      setMensagem({ tipo: "atencao", texto: "Marque pelo menos uma etapa de ensino." });
      return;
    }
    if (newSchoolEngines.length === 0) {
      setMensagem({ tipo: "atencao", texto: "Marque pelo menos um motor de IA." });
      return;
    }

    setMensagem(null);
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
        setMensagem({ tipo: "sucesso", titulo: `Escola "${data.workspace.name}" criada`, texto: "Para a escola entrar: use \"Simular\" nesta escola, abra Equipe e papéis e crie a conta da coordenação com e-mail e senha. A entrada da escola é sempre com e-mail e senha." });
        setNewSchoolName("");
        setNewSchoolSegments([]);
        setNewSchoolEngines([]);
        loadWorkspaces();
      } else {
        const error = await res.json().catch(() => ({}));
        setMensagem({ tipo: "erro", texto: `Não foi possível criar a escola. ${error.error || ""}`.trim() });
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao criar escola:", err);
      setMensagem({ tipo: "erro", texto: "Não foi possível criar a escola. Tente de novo." });
    } finally {
      setCreating(false);
    }
  }

  // Mostrar erro de carregamento em vez de quebrar
  if (error) {
    return (
      <div className="omni-aviso omni-aviso--atencao" role="alert" style={{ maxWidth: "none" }}>
        <div>
          <div className="omni-aviso__titulo">Não foi possível carregar o painel</div>
          <div className="omni-aviso__texto">{error}</div>
          <div className="omni-aviso__acoes">
            <button
              type="button"
              onClick={() => { setError(null); loadWorkspaces(); }}
              className="omni-btn omni-btn--secundario omni-btn--pequeno"
            >
              <RefreshCw size={16} aria-hidden /> Tentar de novo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const abas: { id: TabId; label: string; Icone: typeof School }[] = [
    { id: "escolas", label: "Escolas", Icone: School },
    { id: "usuarios", label: "Usuários", Icone: Users },
    { id: "uso-ia", label: "Uso de IA", Icone: Cpu },
    { id: "dashboard", label: "Painel geral", Icone: BarChart3 },
    { id: "logs", label: "Registros", Icone: ScrollText },
    { id: "auditoria", label: "Auditoria", Icone: ShieldCheck },
    { id: "avisos", label: "Avisos", Icone: Megaphone },
    { id: "termo", label: "Termo de uso", Icone: FileText },
    { id: "bugs", label: "Erros relatados", Icone: Bug },
    { id: "instagram", label: "Instagram", Icone: Camera },
    { id: "aparencia", label: "Aparência", Icone: Palette },
    { id: "topbar", label: "Barra do topo", Icone: PanelTop },
    { id: "contatos", label: "Contatos", Icone: Inbox },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ font: "800 28px/34px var(--font-sans)", color: "var(--tinta)", margin: 0 }}>Administração da Omnisfera</h1>
        <p className="omni-apoio" style={{ marginTop: 4 }}>Escolas, usuários, avisos e aparência da plataforma.</p>
      </div>

      {/* Abas */}
      <div className="omni-abas" role="tablist" aria-label="Seções da administração">
        {abas.map(({ id, label, Icone }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className="omni-aba"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Icone size={16} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={abas.find((t) => t.id === activeTab)?.label}>
      {/* Conteúdo das abas */}
      {activeTab === "escolas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <MensagemAdmin mensagem={mensagem} onFechar={() => setMensagem(null)} />
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
        </div>
      )}

      {activeTab === "uso-ia" && <UsoIATab />}
      {activeTab === "usuarios" && <UsuariosTab workspaces={workspaces} />}
      {activeTab === "dashboard" && <EnhancedDashboardTab />}
      {activeTab === "logs" && <LogsTab workspaces={workspaces} />}
      {activeTab === "auditoria" && <AuditoriaTab workspaces={workspaces} isPlatformAdmin={session.is_platform_admin} />}
      {activeTab === "avisos" && <AvisosTab workspaces={workspaces} />}
      {activeTab === "termo" && <TermoTab />}
      {activeTab === "bugs" && <BugsTab />}
      {activeTab === "instagram" && <InstagramFeedTab />}
      {activeTab === "aparencia" && <AparenciaTab />}
      {activeTab === "topbar" && <TopbarTab />}
      {activeTab === "contatos" && <LeadsTab />}
      </div>
    </div>

  );
}
