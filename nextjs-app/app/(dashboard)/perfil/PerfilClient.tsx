"use client";

import React, { useState, useEffect } from "react";
import {
    User, Mail, Phone, Briefcase, Shield, BookOpen,
    Lock, Eye, EyeOff,
    GraduationCap, Users, Building2, Flame, Award, Lightbulb
} from "lucide-react";
import { OmniLoader } from "@/components/OmniLoader";
import {
    ProfileCard, StreakCalendar, SkillBadge,
    Button, Input, Card, Badge, Alert, EmptyState, SectionTitle
} from "@omni/ds";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vinculo {
    componente: string;
    serie: string;
    serieCode: string;
    turma: string;
}

interface AlunoVinculado {
    id: string;
    name: string;
    grade: string;
    class_group: string;
}

interface ProfileData {
    nome: string;
    email?: string;
    telefone?: string;
    cargo?: string;
    workspace_name: string;
    user_role: string;
    is_master: boolean;
    member_id?: string;
    link_type?: string;
    permissoes?: Record<string, boolean>;
    vinculos?: Vinculo[];
    alunos_vinculados?: AlunoVinculado[];
}

// ─── Permission labels ───────────────────────────────────────────────────────

const PERMISSION_LABELS: Record<string, { label: string; variant: "primary" | "success" | "warning" | "danger" | "default" }> = {
    can_estudantes: { label: "Estudantes", variant: "primary" },
    can_pei: { label: "PEI", variant: "primary" },
    can_pei_professor: { label: "PEI Professor", variant: "success" },
    can_paee: { label: "PAEE", variant: "danger" },
    can_hub: { label: "Hub", variant: "success" },
    can_diario: { label: "Diário", variant: "warning" },
    can_avaliacao: { label: "Monitoramento", variant: "success" },
    can_gestao: { label: "Gestão", variant: "primary" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PerfilClient() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [showSenhaAtual, setShowSenhaAtual] = useState(false);
    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetch("/api/perfil")
            .then(r => r.json())
            .then(d => setProfile(d))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);
        if (novaSenha !== confirmarSenha) {
            setMessage({ type: "error", text: "As senhas não coincidem." });
            return;
        }
        if (novaSenha.length < 4) {
            setMessage({ type: "error", text: "Nova senha deve ter no mínimo 4 caracteres." });
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/perfil", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: "success", text: "Senha alterada com sucesso!" });
                setSenhaAtual("");
                setNovaSenha("");
                setConfirmarSenha("");
            } else {
                setMessage({ type: "error", text: data.error || "Erro ao alterar senha." });
            }
        } catch {
            setMessage({ type: "error", text: "Erro de conexão." });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <OmniLoader variant="card" />
            </div>
        );
    }

    if (!profile) {
        return (
            <EmptyState
                title="Erro ao carregar perfil"
                description="Não foi possível carregar seus dados. Tente recarregar a página."
            />
        );
    }

    const activePerms = Object.entries(profile.permissoes || {}).filter(([, v]) => v);
    const vinculos = profile.vinculos || [];
    const alunos = profile.alunos_vinculados || [];

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <ProfileCard
                name={profile.nome}
                role={`${profile.is_master ? "Coordenador(a)" : "Professor(a)"} · ${profile.workspace_name}`}
                status="online"
                variant="horizontal"
                color="#4285F4"
            />

            {/* Personal Data */}
            <Card>
                <SectionTitle title="Dados Pessoais" icon={<User size={16} className="text-sky-500" />} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <InfoField icon={<User size={14} />} label="Nome" value={profile.nome} />
                    <InfoField icon={<Mail size={14} />} label="Email" value={profile.email || "—"} />
                    <InfoField icon={<Phone size={14} />} label="Telefone" value={profile.telefone || "—"} />
                    <InfoField icon={<Briefcase size={14} />} label="Cargo" value={profile.cargo || "—"} />
                    <InfoField icon={<Building2 size={14} />} label="Escola" value={profile.workspace_name} />
                    <InfoField icon={<Shield size={14} />} label="Papel" value={profile.is_master ? "Coordenador(a)" : "Professor(a)"} />
                </div>
            </Card>

            {/* Gamification - Engajamento */}
            <Card>
                <SectionTitle title="Meu Engajamento" icon={<Flame size={16} className="text-orange-500" />} />
                <div className="flex flex-col lg:flex-row gap-8 items-start mt-4">
                    <div>
                        <p className="text-sm font-semibold text-(--omni-text-muted) mb-3">Dias preenchendo o Diário</p>
                        <StreakCalendar
                            days={[
                                { date: new Date().toISOString().slice(0, 10), intensity: 3 },
                                { date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), intensity: 4 },
                                { date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10), intensity: 2 }
                            ]}
                            weeks={10}
                            streakCount={12}
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-(--omni-text-muted) mb-3">Minhas Conquistas</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SkillBadge name="Mestre do PEI" level={3} xp={450} xpNext={500} icon={<Award />} color="#059669" />
                            <SkillBadge name="Especialista em DUA" level={2} xp={200} xpNext={300} icon={<Lightbulb />} color="#4F5BD5" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Permissions */}
            <Card>
                <SectionTitle title="Permissões" icon={<Shield size={16} className="text-purple-500" />} />
                <div className="flex flex-wrap gap-2 mt-4">
                    {activePerms.map(([key]) => {
                        const perm = PERMISSION_LABELS[key];
                        if (!perm) return null;
                        return (
                            <Badge key={key} variant={perm.variant} size="md">
                                {perm.label}
                            </Badge>
                        );
                    })}
                    {activePerms.length === 0 && (
                        <span className="text-sm text-(--omni-text-muted)">Nenhuma permissão ativa</span>
                    )}
                </div>
            </Card>

            {/* Teacher Assignments */}
            {vinculos.length > 0 && (
                <Card>
                    <SectionTitle
                        title="Meus Vínculos"
                        icon={<GraduationCap size={16} className="text-emerald-500" />}
                        action={<Badge variant="success" size="sm">{vinculos.length}</Badge>}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                        {vinculos.map((v, i) => (
                            <Card key={i} variant="flat" padding="sm" className="bg-(--omni-bg-primary) border border-(--omni-border-default)">
                                <div className="text-sm font-bold text-(--omni-text-primary)">
                                    {v.componente}
                                </div>
                                <div className="text-xs text-(--omni-text-muted) mt-1 flex gap-2">
                                    <span>{v.serie}</span>
                                    {v.turma && <span>· Turma {v.turma}</span>}
                                </div>
                            </Card>
                        ))}
                    </div>
                </Card>
            )}

            {/* Student Links (tutor) */}
            {alunos.length > 0 && (
                <Card>
                    <SectionTitle
                        title="Alunos Vinculados"
                        icon={<Users size={16} className="text-indigo-500" />}
                        action={<Badge variant="primary" size="sm">{alunos.length}</Badge>}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {alunos.map(a => (
                            <Card key={a.id} variant="flat" padding="sm" className="bg-(--omni-bg-primary) border border-(--omni-border-default)">
                                <div className="text-sm font-semibold text-(--omni-text-primary)">{a.name}</div>
                                <div className="text-xs text-(--omni-text-muted) mt-1">
                                    {a.grade} {a.class_group && `· Turma ${a.class_group}`}
                                </div>
                            </Card>
                        ))}
                    </div>
                </Card>
            )}

            {/* Empty vinculos state */}
            {vinculos.length === 0 && alunos.length === 0 && !profile.is_master && (
                <EmptyState
                    icon={BookOpen}
                    title="Nenhum vínculo encontrado"
                    description="Nenhum vínculo de componente ou aluno encontrado. Peça ao coordenador para configurar em Gestão de Usuários."
                />
            )}

            {/* Change Password */}
            <Card>
                <SectionTitle title="Alterar Senha" icon={<Lock size={16} className="text-red-500" />} />
                <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-sm mt-4">
                    <PasswordInput
                        label="Senha atual"
                        value={senhaAtual}
                        onChange={setSenhaAtual}
                        show={showSenhaAtual}
                        onToggle={() => setShowSenhaAtual(v => !v)}
                    />
                    <PasswordInput
                        label="Nova senha"
                        value={novaSenha}
                        onChange={setNovaSenha}
                        show={showNovaSenha}
                        onToggle={() => setShowNovaSenha(v => !v)}
                    />
                    <PasswordInput
                        label="Confirmar nova senha"
                        value={confirmarSenha}
                        onChange={setConfirmarSenha}
                        show={showNovaSenha}
                        onToggle={() => setShowNovaSenha(v => !v)}
                    />

                    {message && (
                        <Alert variant={message.type === "success" ? "success" : "error"}>
                            {message.text}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        disabled={saving || !senhaAtual || !novaSenha || !confirmarSenha}
                        variant="primary"
                        className="w-fit"
                    >
                        {saving && <OmniLoader size={16} />}
                        Alterar Senha
                    </Button>
                </form>
            </Card>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2.5">
            <div className="text-(--omni-text-muted) mt-0.5 shrink-0">{icon}</div>
            <div>
                <div className="text-[10px] font-semibold text-(--omni-text-muted) uppercase tracking-wider">
                    {label}
                </div>
                <div className="text-sm font-semibold text-(--omni-text-primary) mt-0.5">
                    {value}
                </div>
            </div>
        </div>
    );
}

function PasswordInput({ label, value, onChange, show, onToggle }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
}) {
    return (
        <Input
            label={label}
            type={show ? "text" : "password"}
            value={value}
            onChange={e => onChange(e.target.value)}
            rightIcon={
                <button
                    type="button"
                    onClick={onToggle}
                    className="focus:outline-none flex items-center justify-center p-1"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            }
        />
    );
}
