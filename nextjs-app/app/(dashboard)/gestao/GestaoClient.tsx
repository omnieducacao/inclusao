"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Eye,
  Heart,
} from "lucide-react";
import { OmniLoader } from "@/components/OmniLoader";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Avatar, Badge, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, DonutChart } from "@omni/ds";

type WorkspaceMember = {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  cargo?: string | null;
  can_estudantes: boolean;
  can_pei: boolean;
  can_pei_professor: boolean;
  can_paee: boolean;
  can_hub: boolean;
  can_diario: boolean;
  can_avaliacao: boolean;
  can_gestao: boolean;
  link_type: "todos" | "turma" | "tutor";
  active: boolean;
};

type FamilyResponsavel = {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  parentesco?: string | null;
  active: boolean;
  created_at: string;
};

type WorkspaceMaster = { workspace_id: string; email: string; nome: string } | null;

const PERM_LABELS: Record<string, string> = {
  can_estudantes: "Estudantes",
  can_pei: "PEI",
  can_pei_professor: "PEI - Professor",
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


export function GestaoClient({
  initialMembers,
  initialMaster,
  initialFamily
}: {
  initialMembers: WorkspaceMember[];
  initialMaster: WorkspaceMaster;
  initialFamily: FamilyResponsavel[];
}) {

  const [members, setMembers] = useState<WorkspaceMember[]>(initialMembers);
  const [familyResponsaveis, setFamilyResponsaveis] = useState<FamilyResponsavel[]>(initialFamily);
  const [master, setMaster] = useState<WorkspaceMaster>(initialMaster);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelId, setConfirmDelId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersRes, masterRes, familyRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/members?master=1"),
        fetch("/api/familia/responsaveis"),
      ]);
      const membersData = await membersRes.json();
      const masterData = await masterRes.json();
      const familyData = await familyRes.json();
      setMembers(membersData.members ?? []);
      setMaster(masterData.master ?? null);
      setFamilyResponsaveis(familyData.responsaveis ?? []);
    } catch {
      setMembers([]);
      setMaster(null);
      setFamilyResponsaveis([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const activeMembers = members.filter((m) => m.active);
  const inactiveMembers = members.filter((m) => !m.active);
  const activeFamily = familyResponsaveis.filter((f) => f.active !== false);
  const inactiveFamily = familyResponsaveis.filter((f) => f.active === false);

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
      <Card padding="none" className="overflow-hidden">
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
            <NovoUsuarioUnificado
              onSuccess={() => {
                loadData();
                setShowForm(false);
                setMessage({ type: "ok", text: "Usuário cadastrado!" });
              }}
              onError={(err) => setMessage({ type: "err", text: err })}
            />
          </div>
        )}
      </Card>

      {
        message && (
          <div
            className={`p-3 rounded-lg text-sm ${message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
          >
            {message.text}
          </div>
        )
      }

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Demografia de Estudantes</CardTitle>
            <CardDescription>Estudantes regulares vs. Inclusão (PEI)</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <DonutChart
              segments={[
                { label: "Ensino Regular", value: 340, color: "#94a3b8" },
                { label: "Inclusão (PEI)", value: 45, color: "#6366f1" },
              ]}
              size={180}
            />
          </CardContent>
        </Card>
      </div>

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
          <div className="rounded-xl border border-(--omni-border-default) overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeMembers.map((m, idx) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    index={idx}
                    editingId={editingId}
                    confirmDelId={confirmDelId}
                    setEditingId={setEditingId}
                    setConfirmDelId={setConfirmDelId}
                    onAction={loadData}
                    onError={(err) => setMessage({ type: "err", text: err })}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Responsáveis / Família */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-amber-600" />
          Responsáveis / Família
        </h3>
        {loading ? (
          <p className="text-slate-500">Carregando…</p>
        ) : activeFamily.length === 0 ? (
          <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg">
            Nenhum responsável cadastrado. Use o formulário acima e selecione &quot;Família&quot; para criar.
          </p>
        ) : (
          <div className="rounded-xl border border-(--omni-border-default) overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Parentesco</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeFamily.map((f, idx) => (
                  <FamilyCard
                    key={f.id}
                    responsavel={f}
                    index={idx}
                    onAction={loadData}
                    onError={(err) => setMessage({ type: "err", text: err })}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Usuários desativados */}
      {
        (inactiveMembers.length > 0 || inactiveFamily.length > 0) && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Usuários desativados
            </h3>
            <p className="text-xs text-slate-500 mb-2">Excluir libera o email para novo cadastro.</p>
            <div className="rounded-xl border border-(--omni-border-default) overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário/Responsável</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveMembers.map((m, idx) => (
                    <InactiveMemberCard
                      key={m.id}
                      member={m}
                      index={idx}
                      confirmDelId={confirmDelId}
                      setConfirmDelId={setConfirmDelId}
                      onAction={loadData}
                      onError={(err) => setMessage({ type: "err", text: err })}
                    />
                  ))}
                  {inactiveFamily.map((f, idx) => (
                    <TableRow key={f.id} className="bg-slate-50/50 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}>
                      <TableCell>
                        <p className="font-medium text-(--omni-text-primary)">
                          <Heart className="w-4 h-4 inline mr-1 text-amber-500" />
                          {f.nome}
                        </p>
                        <p className="text-xs text-(--omni-text-muted) mt-0.5">{f.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-amber-100 text-amber-700 font-medium text-[10px]">Família (inativo)</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="text-xs text-(--omni-text-muted)">Nenhuma ação disponível</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      }
    </div >
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
    can_pei_professor: false,
    can_paee: false,
    can_hub: false,
    can_diario: false,
    can_avaliacao: false,
    can_gestao: false,
  });
  const [linkType, setLinkType] = useState<"todos" | "turma" | "tutor">("todos");
  const [teacherAssignments, setTeacherAssignments] = useState<{ class_id: string; component_id: string }[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [classes, setClasses] = useState<Array<{ id: string; label: string }>>([]);
  const [components, setComponents] = useState<Array<{ id: string; label: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string; grade?: string; class_group?: string }>>([]);
  const [saving, setSaving] = useState(false);

  // Carregar turmas, componentes e estudantes quando necessário
  useEffect(() => {
    if (linkType === "turma") {
      Promise.all([
        fetch("/api/school/classes").then((r) => r.json()).then((d) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const classesData = (d.classes || []).map((c: any) => ({
            id: c.id,
            label: `${(c.grade || c.grades)?.label || c.grade_id || ""} - Turma ${c.class_group || ""}`,
          }));
          setClasses(classesData);
        }),
        fetch("/api/school/components").then((r) => r.json()).then((d) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setComponents((d.components || []).map((c: any) => ({
            id: c.id,
            label: c.label || c.id,
          })));
        }),
      ]).catch(() => { });
    } else if (linkType === "tutor") {
      fetch("/api/students")
        .then((r) => r.json())
        .then((d) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setStudents((d.students || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            grade: s.grade,
            class_group: s.class_group,
          })));
        })
        .catch(() => { });
    }
  }, [linkType]);

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
          teacher_assignments: linkType === "turma" && teacherAssignments.length > 0 ? teacherAssignments : undefined,
          student_ids: linkType === "tutor" && studentIds.length > 0 ? studentIds : undefined,
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
          {linkType === "turma" && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-slate-700">Turmas e componentes curriculares</p>
              {teacherAssignments.map((assignment, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2">
                  <select
                    value={assignment.class_id}
                    onChange={(e) => {
                      const updated = [...teacherAssignments];
                      updated[idx] = { ...updated[idx], class_id: e.target.value };
                      setTeacherAssignments(updated);
                    }}
                    className="px-2 py-1.5 border border-slate-200 rounded text-sm"
                  >
                    <option value="">Selecione turma</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <select
                      value={assignment.component_id}
                      onChange={(e) => {
                        const updated = [...teacherAssignments];
                        updated[idx] = { ...updated[idx], component_id: e.target.value };
                        setTeacherAssignments(updated);
                      }}
                      className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm"
                    >
                      <option value="">Selecione componente</option>
                      {components.map((comp) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setTeacherAssignments(teacherAssignments.filter((_, i) => i !== idx));
                      }}
                      className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setTeacherAssignments([...teacherAssignments, { class_id: "", component_id: "" }]);
                }}
                className="text-xs text-sky-600 hover:underline"
              >
                + Adicionar vínculo turma + componente
              </button>
              {classes.length === 0 && (
                <p className="text-xs text-amber-600">
                  Configure ano letivo e turmas em Configuração Escola primeiro.
                </p>
              )}
            </div>
          )}
          {linkType === "tutor" && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-slate-700">Estudantes de que é tutor</p>
              <select
                multiple
                value={studentIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                  setStudentIds(selected);
                }}
                size={Math.min(students.length || 1, 8)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.grade || "—"} - {s.class_group || "—"})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {studentIds.length > 0 ? `${studentIds.length} estudante(s) selecionado(s)` : "Selecione os estudantes (segure Ctrl/Cmd para múltiplos)"}
              </p>
              {students.length === 0 && (
                <p className="text-xs text-amber-600">
                  Cadastre estudantes primeiro no módulo PEI ou Estudantes.
                </p>
              )}
            </div>
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
  index,
  editingId,
  confirmDelId,
  setEditingId,
  setConfirmDelId,
  onAction,
  onError,
}: {
  member: WorkspaceMember;
  index: number;
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

  const [impactData, setImpactData] = useState<{ pei_disciplinas: number; planos_ensino: number; avaliacoes_diagnosticas: number; total: number } | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch impact when delete confirmation is shown
  useEffect(() => {
    if (confirmDelId === member.id && !impactData && !loadingImpact) {
      setLoadingImpact(true);
      fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "impact" }),
      })
        .then(r => r.json())
        .then(d => setImpactData(d))
        .catch(() => { })
        .finally(() => setLoadingImpact(false));
    }
  }, [confirmDelId, member.id, impactData, loadingImpact]);

  if (confirmDelId === member.id) {
    const hasData = impactData && impactData.total > 0;
    return (
      <TableRow className={hasData ? "bg-amber-50" : "bg-red-50"}>
        <TableCell colSpan={4}>
          <div className="py-3 space-y-3">
            <p className="font-semibold text-sm text-slate-800">
              Excluir {member.nome}?
            </p>

            {loadingImpact && (
              <p className="text-xs text-slate-500 animate-pulse">Verificando dados vinculados...</p>
            )}

            {hasData && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-800">
                  ⚠️ Este professor possui dados pedagógicos vinculados:
                </p>
                <div className="flex flex-wrap gap-2">
                  {impactData!.pei_disciplinas > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-medium">
                      📋 {impactData!.pei_disciplinas} disciplina(s) PEI
                    </span>
                  )}
                  {impactData!.planos_ensino > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-medium">
                      📝 {impactData!.planos_ensino} plano(s) de ensino
                    </span>
                  )}
                  {impactData!.avaliacoes_diagnosticas > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-medium">
                      📊 {impactData!.avaliacoes_diagnosticas} avaliação(ões) diagnóstica(s)
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-700">
                  Esses registros serão <strong>preservados</strong> (o PEI continua funcionando),
                  mas a referência ao professor será removida.
                  <br />
                  💡 <strong>Recomendação:</strong> prefira <em>desativar</em> em vez de excluir.
                </p>
              </div>
            )}

            {!hasData && !loadingImpact && (
              <p className="text-xs text-slate-600">
                Nenhum dado pedagógico vinculado. O email será liberado.
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                disabled={deleting || loadingImpact}
                onClick={async () => {
                  setDeleting(true);
                  const res = await fetch(`/api/members/${member.id}`, { method: "DELETE" });
                  if (!res.ok) {
                    const d = await res.json();
                    onError(d.error || "Erro ao excluir.");
                    setDeleting(false);
                    return;
                  }
                  setConfirmDelId(null);
                  onAction();
                }}
              >
                {deleting ? "Excluindo..." : hasData ? "Excluir mesmo assim" : "Sim, excluir"}
              </Button>
              {hasData && (
                <Button
                  variant="secondary"
                  size="sm"
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
                    setConfirmDelId(null);
                    onAction();
                  }}
                >
                  <Pause size={14} /> Desativar (recomendado)
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setConfirmDelId(null); setImpactData(null); }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (editingId === member.id) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="p-0">
          <EditarUsuarioForm
            member={member}
            onSuccess={() => {
              setEditingId(null);
              onAction();
            }}
            onCancel={() => setEditingId(null)}
            onError={onError}
          />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <TableCell className="align-top">
        <div className="flex items-center gap-3">
          <div className="hidden auto-cols-auto md:block">
            <Avatar name={member.nome} size="sm" />
          </div>
          <div>
            <p className="font-medium text-(--omni-text-primary)">
              {member.nome}
              {member.cargo && <span className="font-normal text-(--omni-text-muted)"> · {member.cargo}</span>}
            </p>
            <p className="text-xs text-(--omni-text-muted) mt-0.5">
              {member.email} · {member.telefone || "—"}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="align-top">
        <div className="flex flex-wrap gap-1">
          {perms.map((p) => (
            <Badge key={p} variant="default" className="font-medium text-[10px]">{p}</Badge>
          ))}
          {perms.length === 0 && <span className="text-slate-400 text-sm">—</span>}
        </div>
      </TableCell>
      <TableCell className="align-top">
        <p className="text-xs text-(--omni-text-muted) whitespace-nowrap">{linkTxt}</p>
      </TableCell>
      <TableCell className="align-top text-right">
        <div className="flex justify-end items-center gap-1.5 shrink-0 flex-wrap">
          <SimularButton memberId={member.id} memberName={member.nome} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingId(member.id)}
            className="h-8"
          >
            <Edit size={14} />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
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
            className="h-8"
          >
            <Pause size={14} />
            Desativar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelId(member.id)}
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={14} />
            Excluir
          </Button>
        </div>
      </TableCell>
    </TableRow>
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
    can_pei_professor: member.can_pei_professor,
    can_paee: member.can_paee,
    can_hub: member.can_hub,
    can_diario: member.can_diario,
    can_avaliacao: member.can_avaliacao,
    can_gestao: member.can_gestao,
  });
  const [linkType, setLinkType] = useState<"todos" | "turma" | "tutor">(member.link_type);
  const [teacherAssignments, setTeacherAssignments] = useState<{ class_id: string; component_id: string }[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [classes, setClasses] = useState<Array<{ id: string; label: string }>>([]);
  const [components, setComponents] = useState<Array<{ id: string; label: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string; grade?: string; class_group?: string }>>([]);
  const [saving, setSaving] = useState(false);

  // Carregar vínculos existentes e dados necessários
  useEffect(() => {
    // Carregar turmas e componentes se necessário
    if (linkType === "turma") {
      Promise.all([
        fetch("/api/school/classes").then((r) => r.json()).then((d) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const classesData = (d.classes || []).map((c: any) => ({
            id: c.id,
            label: `${(c.grade || c.grades)?.label || c.grade_id || ""} - Turma ${c.class_group || ""}`,
          }));
          setClasses(classesData);
        }),
        fetch("/api/school/components").then((r) => r.json()).then((d) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setComponents((d.components || []).map((c: any) => ({
            id: c.id,
            label: c.label || c.id,
          })));
        }),
        // Carregar vínculos existentes
        fetch(`/api/members/${member.id}/assignments`).then((r) => r.json()).then((d) => {
          if (d.assignments) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setTeacherAssignments(d.assignments.map((a: any) => ({
              class_id: a.class_id || "",
              component_id: a.component_id || "",
            })));
          }
        }),
      ]).catch(() => { });
    } else if (linkType === "tutor") {
      Promise.all([
        fetch("/api/students").then((r) => r.json()).then((d) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setStudents((d.students || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            grade: s.grade,
            class_group: s.class_group,
          })));
        }),
        // Carregar vínculos existentes
        fetch(`/api/members/${member.id}/student-links`).then((r) => r.json()).then((d) => {
          if (d.student_ids) {
            setStudentIds(d.student_ids);
          }
        }),
      ]).catch(() => { });
    }
  }, [linkType, member.id]);

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
        teacher_assignments: linkType === "turma" ? teacherAssignments.filter((a) => a.class_id && a.component_id) : undefined,
        student_ids: linkType === "tutor" ? studentIds : undefined,
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
              onChange={(e) => {
                setLinkType(e.target.value as "todos" | "turma" | "tutor");
                setTeacherAssignments([]);
                setStudentIds([]);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              {LINK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {linkType === "turma" && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-slate-700">Turmas e componentes curriculares</p>
                {teacherAssignments.map((assignment, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <select
                      value={assignment.class_id}
                      onChange={(e) => {
                        const updated = [...teacherAssignments];
                        updated[idx] = { ...updated[idx], class_id: e.target.value };
                        setTeacherAssignments(updated);
                      }}
                      className="px-2 py-1.5 border border-slate-200 rounded text-sm"
                    >
                      <option value="">Selecione turma</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <select
                        value={assignment.component_id}
                        onChange={(e) => {
                          const updated = [...teacherAssignments];
                          updated[idx] = { ...updated[idx], component_id: e.target.value };
                          setTeacherAssignments(updated);
                        }}
                        className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm"
                      >
                        <option value="">Selecione componente</option>
                        {components.map((comp) => (
                          <option key={comp.id} value={comp.id}>
                            {comp.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setTeacherAssignments(teacherAssignments.filter((_, i) => i !== idx));
                        }}
                        className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setTeacherAssignments([...teacherAssignments, { class_id: "", component_id: "" }]);
                  }}
                  className="text-xs text-sky-600 hover:underline"
                >
                  + Adicionar vínculo turma + componente
                </button>
                {classes.length === 0 && (
                  <p className="text-xs text-amber-600">
                    Configure ano letivo e turmas em Configuração Escola primeiro.
                  </p>
                )}
              </div>
            )}
            {linkType === "tutor" && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-slate-700">Estudantes de que é tutor</p>
                <select
                  multiple
                  value={studentIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                    setStudentIds(selected);
                  }}
                  size={Math.min(students.length || 1, 8)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade || "—"} - {s.class_group || "—"})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  {studentIds.length > 0 ? `${studentIds.length} estudante(s) selecionado(s)` : "Selecione os estudantes (segure Ctrl/Cmd para múltiplos)"}
                </p>
                {students.length === 0 && (
                  <p className="text-xs text-amber-600">
                    Cadastre estudantes primeiro no módulo PEI ou Estudantes.
                  </p>
                )}
              </div>
            )}
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
  index,
  confirmDelId,
  setConfirmDelId,
  onAction,
  onError,
}: {
  member: WorkspaceMember;
  index: number;
  confirmDelId: string | null;
  setConfirmDelId: (id: string | null) => void;
  onAction: () => void;
  onError: (err: string) => void;
}) {
  if (confirmDelId === member.id) {
    return (
      <TableRow className="bg-amber-50">
        <TableCell colSpan={3}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2">
            <p className="text-amber-800 font-medium text-sm">Confirma exclusão permanente? O email será liberado.</p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
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
              >
                Sim, excluir
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmDelId(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      className="bg-slate-50/50 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <TableCell className="align-top">
        <p className="font-medium text-(--omni-text-primary)">
          <User className="w-4 h-4 inline mr-1" />
          {member.nome}
        </p>
        <p className="text-xs text-(--omni-text-muted) mt-0.5">{member.email}</p>
      </TableCell>
      <TableCell className="align-top">
        <Badge variant="default" className="bg-slate-200 text-slate-700 font-medium text-[10px]">Membro (inativo)</Badge>
      </TableCell>
      <TableCell className="align-top text-right">
        <div className="flex justify-end gap-1.5 shrink-0 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
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
            className="h-8"
          >
            <Play size={14} />
            Reativar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelId(member.id)}
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={14} />
            Excluir permanentemente
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function SimularButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSimulate() {
    if (!confirm(`Iniciar simulação como "${memberName}"? Você verá a plataforma como este membro.`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/simulate-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        alert(data.error || "Erro ao simular.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSimulate}
      disabled={loading}
      className="px-3 py-1.5 border border-purple-200 text-purple-600 rounded-lg text-sm hover:bg-purple-50 flex items-center gap-2 disabled:opacity-50"
    >
      {loading ? <OmniLoader size={16} /> : <Eye className="w-4 h-4" />}
      Simular
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   NovoUsuarioUnificado — Seletor de tipo (Membro / Família)
   ═══════════════════════════════════════════════════ */
function NovoUsuarioUnificado({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (err: string) => void;
}) {
  const [tipo, setTipo] = useState<"membro" | "familia">("membro");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTipo("membro")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === "membro"
            ? "bg-sky-600 text-white"
            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
        >
          <User className="w-4 h-4 inline mr-1.5" />
          Membro / Professor
        </button>
        <button
          type="button"
          onClick={() => setTipo("familia")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === "familia"
            ? "bg-amber-600 text-white"
            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
        >
          <Heart className="w-4 h-4 inline mr-1.5" />
          Família / Responsável
        </button>
      </div>

      {tipo === "membro" ? (
        <NovoUsuarioForm onSuccess={onSuccess} onError={onError} />
      ) : (
        <NovoFamiliaForm onSuccess={onSuccess} onError={onError} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   NovoFamiliaForm — Cria responsável com vínculo a estudantes
   ═══════════════════════════════════════════════════ */
function NovoFamiliaForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (err: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string; grade?: string; class_group?: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((d) => {
        // API returns array directly OR { students: [...] }
        const list = Array.isArray(d) ? d : (d.students || []);
        setStudents(
          list.map((s: Record<string, unknown>) => ({
            id: s.id as string,
            name: s.name as string,
            grade: s.grade as string | undefined,
            class_group: s.class_group as string | undefined,
          }))
        );
      })
      .catch(() => { });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      onError("Nome, e-mail e senha são obrigatórios.");
      return;
    }
    if (senha.length < 4) {
      onError("Senha deve ter no mínimo 4 caracteres.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/familia/responsaveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha,
          telefone: telefone.trim() || undefined,
          parentesco: parentesco.trim() || undefined,
          studentIds: studentIds.length > 0 ? studentIds : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Erro ao cadastrar responsável.");
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
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
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
            placeholder="Parentesco (Mãe, Pai, Avó, Tutor...)"
            value={parentesco}
            onChange={(e) => setParentesco(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Vincular a estudante(s)</p>
          <select
            multiple
            value={studentIds}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
              setStudentIds(selected);
            }}
            size={Math.min(students.length || 1, 8)}
            className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.grade || "—"} - {s.class_group || "—"})
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            {studentIds.length > 0
              ? `${studentIds.length} estudante(s) selecionado(s)`
              : "Selecione os estudantes (segure Ctrl/Cmd para múltiplos)"}
          </p>
          {students.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Cadastre estudantes primeiro no módulo PEI ou Estudantes.
            </p>
          )}

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
              O responsável poderá acessar a área <strong>Família</strong> usando este e-mail e senha.
              Envie as credenciais por canal seguro.
            </p>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-60"
      >
        {saving ? "Cadastrando…" : "Cadastrar responsável"}
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════
   FamilyCard — Card de responsável na lista
   ═══════════════════════════════════════════════════ */
function FamilyCard({
  responsavel,
  index,
  onAction,
  onError,
}: {
  responsavel: FamilyResponsavel;
  index: number;
  onAction: () => void;
  onError: (err: string) => void;
}) {
  return (
    <TableRow
      className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      <TableCell className="align-top">
        <div className="flex items-center gap-3">
          <div className="hidden auto-cols-auto md:block">
            <Avatar name={responsavel.nome} size="sm" />
          </div>
          <div>
            <p className="font-medium text-(--omni-text-primary)">
              {responsavel.nome}
            </p>
            <p className="text-xs text-(--omni-text-muted) mt-0.5">
              {responsavel.email} {responsavel.telefone && `· Tel: ${responsavel.telefone}`}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="align-top">
        <Badge variant="default" className="bg-amber-100 text-amber-700 font-medium text-[10px]">Família</Badge>
      </TableCell>
      <TableCell className="align-top">
        <p className="text-xs text-(--omni-text-muted)">{responsavel.parentesco || "—"}</p>
      </TableCell>
      <TableCell className="align-top text-right">
        <div className="flex justify-end gap-2 shrink-0 flex-wrap">
          <SimularFamilyButton responsavelId={responsavel.id} responsavelName={responsavel.nome} />
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ═══════════════════════════════════════════════════
   SimularFamilyButton — Simula acesso como família
   ═══════════════════════════════════════════════════ */
function SimularFamilyButton({
  responsavelId,
  responsavelName,
}: {
  responsavelId: string;
  responsavelName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSimulate() {
    if (!confirm(`Iniciar simulação como "${responsavelName}"? Você verá a plataforma como este responsável (área Família).`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/simulate-family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family_responsible_id: responsavelId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/familia");
        router.refresh();
      } else {
        alert(data.error || "Erro ao simular.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleSimulate}
      disabled={loading}
      className="text-amber-600 border-amber-200 hover:bg-amber-50 h-8"
    >
      {loading ? <OmniLoader size={14} /> : <Eye size={14} />}
      Simular
    </Button>
  );
}
