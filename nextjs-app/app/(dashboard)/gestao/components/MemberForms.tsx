"use client";

import { useState, useEffect } from "react";
import { Edit, User, Heart, AlertTriangle } from "lucide-react";
import type { WorkspaceMember } from "../types";
import { PERM_LABELS, LINK_OPTIONS } from "../types";

export function NovoUsuarioForm({
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
        } catch { /* expected fallback */
            onError("Erro de conexão. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <input type="text" placeholder="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="password" placeholder="Senha * (mín. 4 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="text" placeholder="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
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
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    {linkType === "turma" && (
                        <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-slate-700">Turmas e componentes curriculares</p>
                            {teacherAssignments.map((assignment, idx) => (
                                <div key={idx} className="grid grid-cols-2 gap-2">
                                    <select value={assignment.class_id} onChange={(e) => { const updated = [...teacherAssignments]; updated[idx] = { ...updated[idx], class_id: e.target.value }; setTeacherAssignments(updated); }} className="px-2 py-1.5 border border-slate-200 rounded text-sm">
                                        <option value="">Selecione turma</option>
                                        {classes.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                                    </select>
                                    <div className="flex gap-1">
                                        <select value={assignment.component_id} onChange={(e) => { const updated = [...teacherAssignments]; updated[idx] = { ...updated[idx], component_id: e.target.value }; setTeacherAssignments(updated); }} className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm">
                                            <option value="">Selecione componente</option>
                                            {components.map((comp) => (<option key={comp.id} value={comp.id}>{comp.label}</option>))}
                                        </select>
                                        <button type="button" onClick={() => { setTeacherAssignments(teacherAssignments.filter((_, i) => i !== idx)); }} className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm">×</button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => { setTeacherAssignments([...teacherAssignments, { class_id: "", component_id: "" }]); }} className="text-xs text-sky-600 hover:underline">+ Adicionar vínculo turma + componente</button>
                            {classes.length === 0 && (<p className="text-xs text-amber-600">Configure ano letivo e turmas em Configuração Escola primeiro.</p>)}
                        </div>
                    )}
                    {linkType === "tutor" && (
                        <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-slate-700">Estudantes de que é tutor</p>
                            <select multiple value={studentIds} onChange={(e) => { const selected = Array.from(e.target.selectedOptions, (opt) => opt.value); setStudentIds(selected); }} size={Math.min(students.length || 1, 8)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm">
                                {students.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.grade || "—"} - {s.class_group || "—"})</option>))}
                            </select>
                            <p className="text-xs text-slate-500">{studentIds.length > 0 ? `${studentIds.length} estudante(s) selecionado(s)` : "Selecione os estudantes (segure Ctrl/Cmd para múltiplos)"}</p>
                            {students.length === 0 && (<p className="text-xs text-amber-600">Cadastre estudantes primeiro no módulo PEI ou Estudantes.</p>)}
                        </div>
                    )}
                </div>
            </div>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60">
                {saving ? "Salvando…" : "Salvar"}
            </button>
        </form>
    );
}

export function EditarUsuarioForm({
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
        } catch { /* expected fallback */
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
                        <input type="text" placeholder="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                        <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                        <input type="password" placeholder="Nova senha (deixe em branco para manter)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                        <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                        <input type="text" placeholder="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Páginas que pode acessar</p>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(PERM_LABELS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={perms[key as keyof typeof perms]} onChange={(e) => setPerms((p) => ({ ...p, [key]: e.target.checked }))} className="rounded border-slate-300" />
                                    {label}
                                </label>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-slate-700 mt-4 mb-2">Vínculo</p>
                        <select value={linkType} onChange={(e) => { setLinkType(e.target.value as "todos" | "turma" | "tutor"); setTeacherAssignments([]); setStudentIds([]); }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                            {LINK_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                        </select>
                        {linkType === "turma" && (
                            <div className="mt-3 space-y-2">
                                <p className="text-xs font-medium text-slate-700">Turmas e componentes curriculares</p>
                                {teacherAssignments.map((assignment, idx) => (
                                    <div key={idx} className="grid grid-cols-2 gap-2">
                                        <select value={assignment.class_id} onChange={(e) => { const updated = [...teacherAssignments]; updated[idx] = { ...updated[idx], class_id: e.target.value }; setTeacherAssignments(updated); }} className="px-2 py-1.5 border border-slate-200 rounded text-sm">
                                            <option value="">Selecione turma</option>
                                            {classes.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                                        </select>
                                        <div className="flex gap-1">
                                            <select value={assignment.component_id} onChange={(e) => { const updated = [...teacherAssignments]; updated[idx] = { ...updated[idx], component_id: e.target.value }; setTeacherAssignments(updated); }} className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm">
                                                <option value="">Selecione componente</option>
                                                {components.map((comp) => (<option key={comp.id} value={comp.id}>{comp.label}</option>))}
                                            </select>
                                            <button type="button" onClick={() => { setTeacherAssignments(teacherAssignments.filter((_, i) => i !== idx)); }} className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm">×</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => { setTeacherAssignments([...teacherAssignments, { class_id: "", component_id: "" }]); }} className="text-xs text-sky-600 hover:underline">+ Adicionar vínculo turma + componente</button>
                                {classes.length === 0 && (<p className="text-xs text-amber-600">Configure ano letivo e turmas em Configuração Escola primeiro.</p>)}
                            </div>
                        )}
                        {linkType === "tutor" && (
                            <div className="mt-3 space-y-2">
                                <p className="text-xs font-medium text-slate-700">Estudantes de que é tutor</p>
                                <select multiple value={studentIds} onChange={(e) => { const selected = Array.from(e.target.selectedOptions, (opt) => opt.value); setStudentIds(selected); }} size={Math.min(students.length || 1, 8)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm">
                                    {students.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.grade || "—"} - {s.class_group || "—"})</option>))}
                                </select>
                                <p className="text-xs text-slate-500">{studentIds.length > 0 ? `${studentIds.length} estudante(s) selecionado(s)` : "Selecione os estudantes (segure Ctrl/Cmd para múltiplos)"}</p>
                                {students.length === 0 && (<p className="text-xs text-amber-600">Cadastre estudantes primeiro no módulo PEI ou Estudantes.</p>)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 disabled:opacity-60">{saving ? "Salvando…" : "Salvar alterações"}</button>
                    <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">Cancelar</button>
                </div>
            </form>
        </div>
    );
}

export function NovoUsuarioUnificado({
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

export function NovoFamiliaForm({
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
        } catch { /* expected fallback */
            onError("Erro de conexão. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <input type="text" placeholder="Nome completo *" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="password" placeholder="Senha * (mín. 4 caracteres)" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="text" placeholder="Parentesco (Mãe, Pai, Avó, Tutor...)" value={parentesco} onChange={(e) => setParentesco(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Vincular a estudante(s)</p>
                    <select
                        multiple
                        value={studentIds}
                        onChange={(e) => { const selected = Array.from(e.target.selectedOptions, (opt) => opt.value); setStudentIds(selected); }}
                        size={Math.min(students.length || 1, 8)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                    >
                        {students.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.grade || "—"} - {s.class_group || "—"})</option>))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">{studentIds.length > 0 ? `${studentIds.length} estudante(s) selecionado(s)` : "Selecione os estudantes (segure Ctrl/Cmd para múltiplos)"}</p>
                    {students.length === 0 && (<p className="text-xs text-amber-600 mt-1">Cadastre estudantes primeiro no módulo PEI ou Estudantes.</p>)}
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                            O responsável poderá acessar a área <strong>Família</strong> usando este e-mail e senha.
                            Envie as credenciais por canal seguro.
                        </p>
                    </div>
                </div>
            </div>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-60">{saving ? "Cadastrando…" : "Cadastrar responsável"}</button>
        </form>
    );
}
