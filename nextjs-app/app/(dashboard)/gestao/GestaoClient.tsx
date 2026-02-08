"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Settings,
  Trash2,
  Edit,
  Plus,
  CheckCircle2,
  User,
  Pause,
  Play,
  AlertTriangle,
} from "lucide-react";

type WorkspaceMember = {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  cargo?: string | null;
  can_estudantes: boolean;
  can_pei: boolean;
  can_paee: boolean;
  can_hub: boolean;
  can_diario: boolean;
  can_avaliacao: boolean;
  can_gestao: boolean;
  link_type: "todos" | "turma" | "tutor";
  active: boolean;
};

type WorkspaceMaster = { workspace_id: string; email: string; nome: string } | null;

const PERM_LABELS: Record<string, string> = {
  can_estudantes: "Estudantes",
  can_pei: "PEI",
  can_paee: "PAEE",
  can_hub: "Hub",
  can_diario: "Diário",
  can_avaliacao: "Avaliação",
  can_gestao: "Gestão",
};

const LINK_OPTIONS: { value: "todos" | "turma" | "tutor"; label: string }[] = [
  { value: "todos", label: "Todos (coordenação/AEE)" },
  { value: "turma", label: "Por turma" },
  { value: "tutor", label: "Por tutor (estudantes específicos)" },
];

export function GestaoClient() {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [master, setMaster] = useState<WorkspaceMaster>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelId, setConfirmDelId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersRes, masterRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/members?master=1"),
      ]);
      const membersData = await membersRes.json();
      const masterData = await masterRes.json();
      setMembers(membersData.members ?? []);
      setMaster(masterData.master ?? null);
    } catch {
      setMembers([]);
      setMaster(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeMembers = members.filter((m) => m.active);
  const inactiveMembers = members.filter((m) => !m.active);

  return (
    <div className="space-y-6">
      {/* Configurar master (se não existir) */}
      {!loading && !master && (
        <MasterSetupForm
          onSuccess={() => {
            loadData();
            setMessage({ type: "ok", text: "Usuário master cadastrado!" });
          }}
          onError={(err) => setMessage({ type: "err", text: err })}
        />
      )}

      {!loading && master && (
        <p className="text-sm text-slate-600 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Usuário master configurado. Login: PIN + email + senha.
        </p>
      )}

      {/* Novo usuário */}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)', border: '1px solid rgba(226,232,240,0.6)' }}>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="w-full px-4 py-3 text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Novo usuário
          <span className="text-slate-400">{showForm ? "▲" : "▼"}</span>
        </button>
        {showForm && (
          <div className="border-t border-slate-100 p-4 bg-slate-50">
            <NovoUsuarioForm
              onSuccess={() => {
                loadData();
                setShowForm(false);
                setMessage({ type: "ok", text: "Usuário cadastrado!" });
              }}
              onError={(err) => setMessage({ type: "err", text: err })}
            />
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Lista de membros ativos */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Usuários cadastrados
        </h3>
        {loading ? (
          <p className="text-slate-500">Carregando…</p>
        ) : activeMembers.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <p className="text-slate-600">
              Nenhum usuário cadastrado. Configure o master acima (se necessário) e use o formulário para adicionar membros.
            </p>
            <Link
              href="/config-escola"
              className="inline-flex items-center gap-1 text-sm text-sky-600 hover:underline"
            >
              <Settings className="w-4 h-4 mr-2" />
              Ir para Configuração Escola
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {activeMembers.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                editingId={editingId}
                confirmDelId={confirmDelId}
                setEditingId={setEditingId}
                setConfirmDelId={setConfirmDelId}
                onAction={loadData}
                onError={(err) => setMessage({ type: "err", text: err })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Usuários desativados */}
      {inactiveMembers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Usuários desativados
          </h3>
          <p className="text-xs text-slate-500 mb-2">Excluir libera o email para novo cadastro.</p>
          <div className="space-y-2">
            {inactiveMembers.map((m) => (
              <InactiveMemberCard
                key={m.id}
                member={m}
                confirmDelId={confirmDelId}
                setConfirmDelId={setConfirmDelId}
                onAction={loadData}
                onError={(err) => setMessage({ type: "err", text: err })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MasterSetupForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (err: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !password) {
      onError("Nome, email e senha são obrigatórios.");
      return;
    }
    if (password.length < 4) {
      onError("Senha deve ter no mínimo 4 caracteres.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_master",
          nome: nome.trim(),
          email: email.trim(),
          password,
          telefone: telefone.trim() || undefined,
          cargo: cargo.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Erro ao cadastrar master.");
        return;
      }
      onSuccess();
    } catch {
      onError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
      <h3 className="font-semibold text-indigo-900 mb-2">🔐 Configurar usuário master</h3>
      <p className="text-sm text-indigo-800 mb-4">
        Seu workspace usa login com PIN. Configure o master para ativar a Gestão de Usuários. Depois disso, o login exigirá email + senha.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        <input
          type="text"
          placeholder="Nome completo *"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <input
          type="password"
          placeholder="Senha * (mín. 4 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <input
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <input
          type="text"
          placeholder="Cargo *"
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Cadastrando…" : "Cadastrar master"}
        </button>
      </form>
    </div>
  );
}

function NovoUsuarioForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (err: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState("");
  const [perms, setPerms] = useState<Record<string, boolean>>({
    can_estudantes: false,
    can_pei: false,
    can_paee: false,
    can_hub: false,
    can_diario: false,
    can_avaliacao: false,
    can_gestao: false,
  });
  const [linkType, setLinkType] = useState<"todos" | "turma" | "tutor">("todos");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      onError("Nome e email são obrigatórios.");
      return;
    }
    if (!password || password.length < 4) {
      onError("Senha obrigatória com no mínimo 4 caracteres.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          password,
          telefone: telefone.trim() || undefined,
          cargo: cargo.trim() || undefined,
          link_type: linkType,
          ...perms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Erro ao cadastrar.");
        return;
      }
      onSuccess();
    } catch {
      onError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nome *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            type="password"
            placeholder="Senha * (mín. 4 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Cargo"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Páginas que pode acessar</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PERM_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={perms[key] ?? false}
                  onChange={(e) => setPerms((p) => ({ ...p, [key]: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                {label}
              </label>
            ))}
          </div>
          <p className="text-sm font-medium text-slate-700 mt-4 mb-2">Vínculo com estudantes</p>
          <select
            value={linkType}
            onChange={(e) => setLinkType(e.target.value as "todos" | "turma" | "tutor")}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            {LINK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {linkType !== "todos" && (
            <p className="text-xs text-amber-600 mt-1">
              Configure ano letivo e turmas em Configuração Escola para vínculos por turma. Para tutor, cadastre estudantes primeiro.
            </p>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60"
      >
        {saving ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}

function MemberCard({
  member,
  editingId,
  confirmDelId,
  setEditingId,
  setConfirmDelId,
  onAction,
  onError,
}: {
  member: WorkspaceMember;
  editingId: string | null;
  confirmDelId: string | null;
  setEditingId: (id: string | null) => void;
  setConfirmDelId: (id: string | null) => void;
  onAction: () => void;
  onError: (err: string) => void;
}) {
  const perms = Object.entries(PERM_LABELS)
    .filter(([k]) => member[k as keyof WorkspaceMember])
    .map(([, v]) => v);
  const linkTxt =
    member.link_type === "todos"
      ? "Todos"
      : member.link_type === "turma"
        ? "Por turma"
        : "Por tutor";

  if (confirmDelId === member.id) {
    return (
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
        <p className="text-amber-800 font-medium mb-2">Excluir permanentemente? O email será liberado.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              const res = await fetch(`/api/members/${member.id}`, { method: "DELETE" });
              if (!res.ok) {
                const d = await res.json();
                onError(d.error || "Erro ao excluir.");
                return;
              }
              setConfirmDelId(null);
              onAction();
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Sim, excluir
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelId(null)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (editingId === member.id) {
    return (
      <EditarUsuarioForm
        member={member}
        onSuccess={() => {
          setEditingId(null);
          onAction();
        }}
        onCancel={() => setEditingId(null)}
        onError={onError}
      />
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="font-medium text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5" />
            {member.nome}
          </h4>
          {member.cargo && <span className="text-sm text-slate-500"> · {member.cargo}</span>}
          <p className="text-sm text-slate-600 mt-0.5">
            {member.email} · Tel: {member.telefone || "—"}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {perms.map((p) => (
              <span
                key={p}
                className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-700"
              >
                {p}
              </span>
            ))}
            {perms.length === 0 && <span className="text-slate-400 text-sm">—</span>}
          </div>
          <p className="text-xs text-slate-500 mt-1">Vínculo: {linkTxt}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setEditingId(member.id)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </button>
          <button
            type="button"
            onClick={async () => {
              const res = await fetch(`/api/members/${member.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "deactivate" }),
              });
              if (!res.ok) {
                const d = await res.json();
                onError(d.error || "Erro ao desativar.");
                return;
              }
              onAction();
            }}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
          >
            <Pause className="w-4 h-4 mr-2" />
            Desativar
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelId(member.id)}
            className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function EditarUsuarioForm({
  member,
  onSuccess,
  onCancel,
  onError,
}: {
  member: WorkspaceMember;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (err: string) => void;
}) {
  const [nome, setNome] = useState(member.nome);
  const [email, setEmail] = useState(member.email);
  const [password, setPassword] = useState("");
  const [telefone, setTelefone] = useState(member.telefone ?? "");
  const [cargo, setCargo] = useState(member.cargo ?? "");
  const [perms, setPerms] = useState({
    can_estudantes: member.can_estudantes,
    can_pei: member.can_pei,
    can_paee: member.can_paee,
    can_hub: member.can_hub,
    can_diario: member.can_diario,
    can_avaliacao: member.can_avaliacao,
    can_gestao: member.can_gestao,
  });
  const [linkType, setLinkType] = useState<"todos" | "turma" | "tutor">(member.link_type);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      onError("Nome e email são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim() || undefined,
        cargo: cargo.trim() || undefined,
        link_type: linkType,
        ...perms,
      };
      if (password.length >= 4) payload.password = password;

      const res = await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Erro ao atualizar.");
        return;
      }
      onSuccess();
    } catch {
      onError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50">
      <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
        <Edit className="w-5 h-5" />
        Editar: {member.nome}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nome *"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <input
              type="password"
              placeholder="Nova senha (deixe em branco para manter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Cargo"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Páginas que pode acessar</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PERM_LABELS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={perms[key as keyof typeof perms]}
                    onChange={(e) =>
                      setPerms((p) => ({ ...p, [key]: e.target.checked }))
                    }
                    className="rounded border-slate-300"
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="text-sm font-medium text-slate-700 mt-4 mb-2">Vínculo</p>
            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value as "todos" | "turma" | "tutor")}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              {LINK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar alterações"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function InactiveMemberCard({
  member,
  confirmDelId,
  setConfirmDelId,
  onAction,
  onError,
}: {
  member: WorkspaceMember;
  confirmDelId: string | null;
  setConfirmDelId: (id: string | null) => void;
  onAction: () => void;
  onError: (err: string) => void;
}) {
  if (confirmDelId === member.id) {
    return (
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
        <p className="text-amber-800 font-medium mb-2">Confirma exclusão permanente? O email será liberado.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              const res = await fetch(`/api/members/${member.id}`, { method: "DELETE" });
              if (!res.ok) {
                const d = await res.json();
                onError(d.error || "Erro ao excluir.");
                return;
              }
              setConfirmDelId(null);
              onAction();
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Sim, excluir
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelId(null)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
      <div className="flex justify-between items-center">
        <p className="text-slate-700">
          <User className="w-4 h-4 inline mr-1" />
          {member.nome} — {member.email} (inativo)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              const res = await fetch(`/api/members/${member.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reactivate" }),
              });
              if (!res.ok) {
                const d = await res.json();
                onError(d.error || "Erro ao reativar.");
                return;
              }
              onAction();
            }}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-100"
          >
            <Play className="w-4 h-4 mr-2" />
            Reativar
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelId(member.id)}
            className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir permanentemente
          </button>
        </div>
      </div>
    </div>
  );
}
