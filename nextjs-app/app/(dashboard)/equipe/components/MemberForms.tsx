"use client";

import { useState, useEffect } from "react";
import { Edit, User, Heart, AlertTriangle, Check, Plus, X } from "lucide-react";
import type { WorkspaceMember } from "../types";
import { PERM_LABELS, LINK_OPTIONS } from "../types";
import { PAPEIS, papelPadrao, type Papel } from "@/lib/papeis";

/** Papel na escola: ao trocar, sugere as permissões e o vínculo daquele papel (onda 1). */
function SeletorPapel({ valor, onEscolher, id = "papel-membro" }: { valor: Papel; onEscolher: (p: Papel) => void; id?: string }) {
    const atual = papelPadrao(valor);
    return (
        <div className="omni-campo" style={{ maxWidth: "none" }}>
            <label className="omni-campo__rotulo" htmlFor={id}>Papel na escola</label>
            <select
                id={id}
                value={valor}
                onChange={(e) => onEscolher(e.target.value as Papel)}
                className="omni-entrada"
                aria-describedby={`${id}-ajuda`}
            >
                {PAPEIS.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
            </select>
            <p id={`${id}-ajuda`} className="omni-campo__ajuda" style={{ margin: 0 }}>{atual.descricao} As permissões abaixo foram sugeridas para o papel e podem ser ajustadas.</p>
        </div>
    );
}

/** Campo com rótulo visível (antes os campos só tinham placeholder). */
function Campo({ rotulo, opcional, ajuda, children }: { rotulo: string; opcional?: boolean; ajuda?: string; children: React.ReactNode }) {
    return (
        <label className="omni-campo" style={{ maxWidth: "none" }}>
            <span className="omni-campo__rotulo">
                {rotulo}
                {opcional && <span className="omni-campo__opcional"> (opcional)</span>}
            </span>
            {children}
            {ajuda && <span className="omni-campo__ajuda">{ajuda}</span>}
        </label>
    );
}

/** Páginas que a pessoa pode abrir (as chaves de PERM_LABELS não mudam). */
function EscolhaPermissoes({ marcadas, onMudar }: { marcadas: Record<string, boolean | undefined>; onMudar: (chave: string, valor: boolean) => void }) {
    return (
        <fieldset className="omni-escolhas">
            <legend>Páginas que pode abrir</legend>
            {Object.entries(PERM_LABELS).map(([key, label]) => (
                <label key={key} className="omni-chip">
                    <input
                        type="checkbox"
                        checked={marcadas[key] ?? false}
                        onChange={(e) => onMudar(key, e.target.checked)}
                    />
                    <Check className="omni-chip__marca" aria-hidden />
                    {label}
                </label>
            ))}
            <p className="omni-campo__ajuda" style={{ margin: "4px 0 0", flexBasis: "100%" }}>
                PEI: Plano Educacional Individualizado. PAEE: Plano de Atendimento Educacional Especializado.
            </p>
        </fieldset>
    );
}

type Opcao = { id: string; label: string };
type Atribuicao = { class_id: string; component_id: string };
type EstudanteOpcao = { id: string; name: string; grade?: string; class_group?: string };

/** Turmas e componentes de quem tem vínculo "por turma". */
function VinculosTurma({ atribuicoes, setAtribuicoes, turmas, componentes }: { atribuicoes: Atribuicao[]; setAtribuicoes: (a: Atribuicao[]) => void; turmas: Opcao[]; componentes: Opcao[] }) {
    return (
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            <p className="omni-campo__rotulo" style={{ margin: 0 }}>Turmas e componentes curriculares</p>
            {atribuicoes.map((assignment, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) auto", gap: 8, alignItems: "center" }}>
                    <select aria-label={`Turma do vínculo ${idx + 1}`} value={assignment.class_id} onChange={(e) => { const updated = [...atribuicoes]; updated[idx] = { ...updated[idx], class_id: e.target.value }; setAtribuicoes(updated); }} className="omni-entrada">
                        <option value="">Escolha a turma</option>
                        {turmas.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                    </select>
                    <select aria-label={`Componente do vínculo ${idx + 1}`} value={assignment.component_id} onChange={(e) => { const updated = [...atribuicoes]; updated[idx] = { ...updated[idx], component_id: e.target.value }; setAtribuicoes(updated); }} className="omni-entrada">
                        <option value="">Escolha o componente</option>
                        {componentes.map((comp) => (<option key={comp.id} value={comp.id}>{comp.label}</option>))}
                    </select>
                    <button type="button" aria-label={`Tirar o vínculo ${idx + 1}`} onClick={() => { setAtribuicoes(atribuicoes.filter((_, i) => i !== idx)); }} className="omni-btn omni-btn--discreto omni-btn--icone">
                        <X aria-hidden />
                    </button>
                </div>
            ))}
            <div>
                <button type="button" onClick={() => { setAtribuicoes([...atribuicoes, { class_id: "", component_id: "" }]); }} className="omni-btn omni-btn--discreto omni-btn--pequeno">
                    <Plus aria-hidden /> Adicionar turma e componente
                </button>
            </div>
            {turmas.length === 0 && (<p className="omni-campo__ajuda" style={{ margin: 0 }}>Primeiro, cadastre o ano letivo e as turmas em Configuração da escola.</p>)}
        </div>
    );
}

/** Lista de estudantes para escolher vários (tutor ou família). */
function EscolhaEstudantes({ id, rotulo, escolhidos, setEscolhidos, estudantes }: { id: string; rotulo: string; escolhidos: string[]; setEscolhidos: (ids: string[]) => void; estudantes: EstudanteOpcao[] }) {
    return (
        <div className="omni-campo" style={{ maxWidth: "none", marginTop: 12 }}>
            <label className="omni-campo__rotulo" htmlFor={id}>{rotulo}</label>
            <select
                id={id}
                multiple
                value={escolhidos}
                onChange={(e) => { const selected = Array.from(e.target.selectedOptions, (opt) => opt.value); setEscolhidos(selected); }}
                size={Math.min(estudantes.length || 1, 8)}
                className="omni-entrada"
                style={{ backgroundImage: "none", paddingRight: 12, height: "auto" }}
                aria-describedby={`${id}-ajuda`}
            >
                {estudantes.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.grade || "—"} - {s.class_group || "—"})</option>))}
            </select>
            <p id={`${id}-ajuda`} className="omni-campo__ajuda" style={{ margin: 0 }}>{escolhidos.length > 0 ? `${escolhidos.length} estudante(s) escolhido(s)` : "Para escolher mais de um, segure Ctrl (ou Cmd no Mac) e clique."}</p>
            {estudantes.length === 0 && (<p className="omni-campo__ajuda" style={{ margin: 0 }}>Ainda não há estudantes. Cadastre primeiro em Estudantes.</p>)}
        </div>
    );
}

/** A lista de /api/students vem como array (ou {students} em versões antigas). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function listaDeEstudantes(d: any): any[] {
    return Array.isArray(d) ? d : d?.students || [];
}

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
    const [papel, setPapel] = useState<Papel>("professor");
    const [perms, setPerms] = useState<Record<string, boolean>>({ ...papelPadrao("professor").permissoes });
    const [linkType, setLinkType] = useState<"todos" | "turma" | "tutor">(papelPadrao("professor").vinculo);
    function escolherPapel(p: Papel) {
        const preset = papelPadrao(p);
        setPapel(p);
        setPerms({ ...preset.permissoes });
        setLinkType(preset.vinculo);
    }
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
                    setStudents(listaDeEstudantes(d).map((s: any) => ({
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
            onError("Nome e e-mail são obrigatórios.");
            return;
        }
        if (!password || password.length < 4) {
            onError("A senha precisa ter pelo menos 4 caracteres.");
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
                    papel,
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
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                    <Campo rotulo="Nome"><input type="text" autoComplete="off" value={nome} onChange={(e) => setNome(e.target.value)} className="omni-entrada" aria-required="true" /></Campo>
                    <Campo rotulo="E-mail"><input type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className="omni-entrada" aria-required="true" /></Campo>
                    <Campo rotulo="Senha" ajuda="Pelo menos 4 caracteres."><input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="omni-entrada" aria-required="true" /></Campo>
                    <Campo rotulo="Telefone" opcional><input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="omni-entrada" /></Campo>
                    <Campo rotulo="Cargo" opcional ajuda="Como a escola chama. Ex.: Professora de Matemática."><input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} className="omni-entrada" /></Campo>
                    <SeletorPapel valor={papel} onEscolher={escolherPapel} id="papel-novo" />
                </div>
                <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
                    <EscolhaPermissoes marcadas={perms} onMudar={(k, v) => setPerms((p) => ({ ...p, [k]: v }))} />
                    <div>
                        <Campo rotulo="Vínculo com estudantes">
                            <select
                                value={linkType}
                                onChange={(e) => setLinkType(e.target.value as "todos" | "turma" | "tutor")}
                                className="omni-entrada"
                            >
                                {LINK_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </Campo>
                        {linkType === "turma" && (
                            <VinculosTurma atribuicoes={teacherAssignments} setAtribuicoes={setTeacherAssignments} turmas={classes} componentes={components} />
                        )}
                        {linkType === "tutor" && (
                            <EscolhaEstudantes id="tutor-novo" rotulo="Estudantes que acompanha como tutor" escolhidos={studentIds} setEscolhidos={setStudentIds} estudantes={students} />
                        )}
                    </div>
                </div>
            </div>
            <div>
                <button type="submit" disabled={saving} aria-busy={saving} className="omni-btn omni-btn--primario">
                    {saving ? "Salvando…" : "Cadastrar pessoa"}
                </button>
            </div>
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
    const [papel, setPapel] = useState<Papel>((member.papel as Papel) ?? "professor");
    function escolherPapel(p: Papel) {
        const preset = papelPadrao(p);
        setPapel(p);
        setPerms({ ...preset.permissoes });
        setLinkType(preset.vinculo);
    }
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
                    setStudents(listaDeEstudantes(d).map((s: any) => ({
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
            onError("Nome e e-mail são obrigatórios.");
            return;
        }
        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                nome: nome.trim(),
                email: email.trim().toLowerCase(),
                telefone: telefone.trim() || undefined,
                cargo: cargo.trim() || undefined,
                papel,
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
        <section className="omni-cartao omni-cartao--plano" aria-labelledby={`editar-${member.id}-t`} style={{ margin: 8 }}>
            <h3 id={`editar-${member.id}-t`} className="omni-cartao__titulo" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Edit aria-hidden style={{ width: 20, height: 20 }} />
                Editar {member.nome}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        <Campo rotulo="Nome"><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="omni-entrada" aria-required="true" /></Campo>
                        <Campo rotulo="E-mail"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="omni-entrada" aria-required="true" /></Campo>
                        <Campo rotulo="Nova senha" opcional ajuda="Deixe em branco para manter a senha atual."><input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="omni-entrada" /></Campo>
                        <Campo rotulo="Telefone" opcional><input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="omni-entrada" /></Campo>
                        <Campo rotulo="Cargo" opcional ajuda="Como a escola chama."><input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} className="omni-entrada" /></Campo>
                        <SeletorPapel valor={papel} onEscolher={escolherPapel} id={`papel-${member.id}`} />
                    </div>
                    <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
                        <EscolhaPermissoes marcadas={perms} onMudar={(k, v) => setPerms((p) => ({ ...p, [k]: v }))} />
                        <div>
                            <Campo rotulo="Vínculo com estudantes">
                                <select value={linkType} onChange={(e) => { setLinkType(e.target.value as "todos" | "turma" | "tutor"); setTeacherAssignments([]); setStudentIds([]); }} className="omni-entrada">
                                    {LINK_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                                </select>
                            </Campo>
                            {linkType === "turma" && (
                                <VinculosTurma atribuicoes={teacherAssignments} setAtribuicoes={setTeacherAssignments} turmas={classes} componentes={components} />
                            )}
                            {linkType === "tutor" && (
                                <EscolhaEstudantes id={`tutor-${member.id}`} rotulo="Estudantes que acompanha como tutor" escolhidos={studentIds} setEscolhidos={setStudentIds} estudantes={students} />
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <button type="submit" disabled={saving} aria-busy={saving} className="omni-btn omni-btn--primario">{saving ? "Salvando…" : "Salvar alterações"}</button>
                    <button type="button" onClick={onCancel} className="omni-btn omni-btn--secundario">Cancelar</button>
                </div>
            </form>
        </section>
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
        <div style={{ display: "grid", gap: 16 }}>
            <div className="omni-segmentado" role="radiogroup" aria-label="Quem você vai cadastrar" style={{ justifySelf: "start" }}>
                <label>
                    <input type="radio" name="tipo-cadastro" value="membro" checked={tipo === "membro"} onChange={() => setTipo("membro")} />
                    <User aria-hidden style={{ width: 16, height: 16, marginRight: 6 }} />
                    Equipe da escola
                </label>
                <label>
                    <input type="radio" name="tipo-cadastro" value="familia" checked={tipo === "familia"} onChange={() => setTipo("familia")} />
                    <Heart aria-hidden style={{ width: 16, height: 16, marginRight: 6 }} />
                    Família
                </label>
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
            onError("A senha precisa ter pelo menos 4 caracteres.");
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
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
                <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                    <Campo rotulo="Nome completo"><input type="text" autoComplete="off" value={nome} onChange={(e) => setNome(e.target.value)} className="omni-entrada" aria-required="true" /></Campo>
                    <Campo rotulo="E-mail"><input type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className="omni-entrada" aria-required="true" /></Campo>
                    <Campo rotulo="Senha" ajuda="Pelo menos 4 caracteres."><input type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} className="omni-entrada" aria-required="true" /></Campo>
                    <Campo rotulo="Telefone" opcional><input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="omni-entrada" /></Campo>
                    <Campo rotulo="Parentesco" opcional ajuda="Ex.: mãe, pai, avó, tutor."><input type="text" value={parentesco} onChange={(e) => setParentesco(e.target.value)} className="omni-entrada" /></Campo>
                </div>
                <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
                    <EscolhaEstudantes id="familia-estudantes" rotulo="Estudantes desta família" escolhidos={studentIds} setEscolhidos={setStudentIds} estudantes={students} />
                    <div className="omni-aviso omni-aviso--atencao" role="note" style={{ maxWidth: "none" }}>
                        <AlertTriangle className="omni-aviso__icone" aria-hidden />
                        <div>
                            <div className="omni-aviso__texto" style={{ marginTop: 0 }}>
                                O responsável entra na área <strong>Família</strong> com este e-mail e esta senha.
                                Envie os dados de acesso por um canal seguro.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <button type="submit" disabled={saving} aria-busy={saving} className="omni-btn omni-btn--primario">{saving ? "Cadastrando…" : "Cadastrar responsável"}</button>
            </div>
        </form>
    );
}
