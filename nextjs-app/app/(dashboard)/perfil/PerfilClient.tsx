"use client";

import React, { useState, useEffect } from "react";
import {
    User, Mail, Phone, Briefcase, Shield, BookOpen,
    Lock, Eye, EyeOff, CheckCircle2, AlertTriangle,
    GraduationCap, Users, Loader2, Building2, Flame, Award, Lightbulb
} from "lucide-react";
import { ProfileCard, StreakCalendar, SkillBadge, Button, Input } from "@omni/ds";

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

const PERMISSION_LABELS: Record<string, { label: string; color: string }> = {
    can_estudantes: { label: "Estudantes", color: "#4F5BD5" },
    can_pei: { label: "PEI", color: "#4285F4" },
    can_pei_professor: { label: "PEI Professor", color: "#059669" },
    can_paee: { label: "PAEE", color: "#9334E6" },
    can_hub: { label: "Hub", color: "#34A853" },
    can_diario: { label: "Diário", color: "#E8453C" },
    can_avaliacao: { label: "Monitoramento", color: "#34A853" },
    can_gestao: { label: "Gestão", color: "#4285F4" },
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
            <div style={{ padding: 60, textAlign: "center" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "#4285F4", margin: "0 auto" }} />
                <p style={{ color: "var(--text-muted)", marginTop: 14, fontSize: 14 }}>Carregando perfil...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                Erro ao carregar perfil.
            </div>
        );
    }

    const activePerms = Object.entries(profile.permissoes || {}).filter(([, v]) => v);
    const vinculos = profile.vinculos || [];
    const alunos = profile.alunos_vinculados || [];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 800 }}>
            {/* Header */}
            <ProfileCard
                name={profile.nome}
                role={`${profile.is_master ? "Coordenador(a)" : "Professor(a)"} · ${profile.workspace_name}`}
                status="online"
                variant="horizontal"
                color="#4285F4"
            />

            {/* Personal Data */}
            <section style={{
                background: "var(--bg-secondary, rgba(15,23,42,.4))",
                border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                borderRadius: 14, padding: "20px 24px",
            }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                    <User size={16} style={{ color: "#4285F4" }} /> Dados Pessoais
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                    <InfoField icon={<User size={14} />} label="Nome" value={profile.nome} />
                    <InfoField icon={<Mail size={14} />} label="Email" value={profile.email || "—"} />
                    <InfoField icon={<Phone size={14} />} label="Telefone" value={profile.telefone || "—"} />
                    <InfoField icon={<Briefcase size={14} />} label="Cargo" value={profile.cargo || "—"} />
                    <InfoField icon={<Building2 size={14} />} label="Escola" value={profile.workspace_name} />
                    <InfoField icon={<Shield size={14} />} label="Papel" value={profile.is_master ? "Coordenador(a)" : "Professor(a)"} />
                </div>
            </section>

            {/* Gamification - Engajamento */}
            <section style={{
                background: "var(--bg-secondary, rgba(15,23,42,.4))",
                border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                borderRadius: 14, padding: "20px 24px",
            }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Flame size={16} className="text-orange-500" /> Meu Engajamento
                </h3>
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div>
                        <p className="text-sm font-semibold text-[var(--omni-text-muted)] mb-3">Dias preenchendo o Diário</p>
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
                        <p className="text-sm font-semibold text-[var(--omni-text-muted)] mb-3">Minhas Conquistas</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <SkillBadge name="Mestre do PEI" level={3} xp={450} xpNext={500} icon={<Award />} color="#059669" />
                            <SkillBadge name="Especialista em DUA" level={2} xp={200} xpNext={300} icon={<Lightbulb />} color="#4F5BD5" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Permissions */}
            <section style={{
                background: "var(--bg-secondary, rgba(15,23,42,.4))",
                border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                borderRadius: 14, padding: "20px 24px",
            }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Shield size={16} style={{ color: "#9334E6" }} /> Permissões
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {activePerms.map(([key]) => {
                        const perm = PERMISSION_LABELS[key];
                        if (!perm) return null;
                        return (
                            <span key={key} style={{
                                padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                background: `${perm.color}18`, color: perm.color,
                                border: `1px solid ${perm.color}30`,
                            }}>
                                {perm.label}
                            </span>
                        );
                    })}
                    {activePerms.length === 0 && (
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma permissão ativa</span>
                    )}
                </div>
            </section>

            {/* Teacher Assignments */}
            {vinculos.length > 0 && (
                <section style={{
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                    borderRadius: 14, padding: "20px 24px",
                }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                        <GraduationCap size={16} style={{ color: "#059669" }} /> Meus Vínculos
                        <span style={{
                            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                            background: "rgba(5,150,105,.1)", color: "#059669",
                        }}>{vinculos.length}</span>
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                        {vinculos.map((v, i) => (
                            <div key={i} style={{
                                padding: "12px 16px", borderRadius: 10,
                                border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                                background: "var(--bg-primary, rgba(15,23,42,.6))",
                            }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                                    {v.componente}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, display: "flex", gap: 8 }}>
                                    <span>{v.serie}</span>
                                    {v.turma && <span>· Turma {v.turma}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Student Links (tutor) */}
            {alunos.length > 0 && (
                <section style={{
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                    borderRadius: 14, padding: "20px 24px",
                }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                        <Users size={16} style={{ color: "#4F5BD5" }} /> Alunos Vinculados
                        <span style={{
                            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                            background: "rgba(79,91,213,.1)", color: "#4F5BD5",
                        }}>{alunos.length}</span>
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                        {alunos.map(a => (
                            <div key={a.id} style={{
                                padding: "10px 14px", borderRadius: 10, fontSize: 13,
                                border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                                background: "var(--bg-primary, rgba(15,23,42,.6))",
                                color: "var(--text-primary)",
                            }}>
                                <div style={{ fontWeight: 600 }}>{a.name}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                                    {a.grade} {a.class_group && `· Turma ${a.class_group}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty vinculos state */}
            {vinculos.length === 0 && alunos.length === 0 && !profile.is_master && (
                <section style={{
                    background: "var(--bg-secondary, rgba(15,23,42,.4))",
                    border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                    borderRadius: 14, padding: "20px 24px", textAlign: "center",
                }}>
                    <BookOpen size={28} style={{ color: "var(--text-muted)", margin: "0 auto 10px", opacity: 0.4 }} />
                    <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>
                        Nenhum vínculo de componente ou aluno encontrado.
                        <br />Peça ao coordenador para configurar em <strong>Gestão de Usuários</strong>.
                    </p>
                </section>
            )}

            {/* Change Password */}
            <section style={{
                background: "var(--bg-secondary, rgba(15,23,42,.4))",
                border: "1px solid var(--border-default, rgba(148,163,184,.12))",
                borderRadius: 14, padding: "20px 24px",
            }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Lock size={16} style={{ color: "#E8453C" }} /> Alterar Senha
                </h3>
                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 400 }}>
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
                        <div style={{
                            padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                            display: "flex", alignItems: "center", gap: 8,
                            background: message.type === "success" ? "rgba(5,150,105,.1)" : "rgba(232,69,60,.1)",
                            color: message.type === "success" ? "#059669" : "#E8453C",
                            border: `1px solid ${message.type === "success" ? "rgba(5,150,105,.2)" : "rgba(232,69,60,.2)"}`,
                        }}>
                            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                            {message.text}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={saving || !senhaAtual || !novaSenha || !confirmarSenha}
                        variant="primary"
                        className="w-fit"
                    >
                        {saving && <Loader2 size={16} className="animate-spin mr-2 inline" />}
                        Alterar Senha
                    </Button>
                </form>
            </section>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ color: "var(--text-muted)", marginTop: 2, flexShrink: 0 }}>{icon}</div>
            <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
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
