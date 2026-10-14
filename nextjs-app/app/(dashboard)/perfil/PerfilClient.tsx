"use client";

/**
 * Onda 22: visual do design system.
 * Saiu a biblioteca antiga @omni/ds (ProfileCard, Card, Badge, Input, Alert, EmptyState…) e as
 * cores Tailwind/hex. Agora: cabeçalho no padrão do PageHero, cartões omni-cartao, campos
 * omni-campo/omni-entrada, selos omni-estado, avisos omni-aviso e botões omni-btn.
 * O bloco "Meu engajamento" saiu: mostrava números fixos (sequência e conquistas inventadas),
 * não dados da pessoa.
 */
import React, { useState, useEffect } from "react";
import {
    User, Mail, Phone, Briefcase, Shield, BookOpen,
    Lock, Eye, EyeOff, GraduationCap, Users, Building2,
    AlertTriangle, CheckCircle2,
} from "lucide-react";
import TelaCarregando, { CarregandoLinha } from "@/components/brand/TelaCarregando";
import hero from "@/components/PageHero.module.css";

// ─── Tipos ────────────────────────────────────────────────────────────────────

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

// ─── Nomes das permissões ────────────────────────────────────────────────────

const PERMISSION_LABELS: Record<string, string> = {
    can_estudantes: "Estudantes",
    can_pei: "PEI (Plano Educacional Individualizado)",
    can_pei_professor: "PEI do professor",
    can_paee: "PAEE (Plano de Atendimento Educacional Especializado)",
    can_hub: "Hub de recursos",
    can_diario: "Diário de bordo",
    can_avaliacao: "Monitoramento",
    can_gestao: "Gestão",
};

const GRADE: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "var(--space-4)",
};

// ─── Componente ───────────────────────────────────────────────────────────────

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
            setMessage({ type: "error", text: "A nova senha e a confirmação estão diferentes. Digite as duas iguais." });
            return;
        }
        if (novaSenha.length < 4) {
            setMessage({ type: "error", text: "A nova senha precisa ter pelo menos 4 caracteres." });
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
                setMessage({ type: "success", text: "Senha alterada. Use a nova senha no próximo acesso." });
                setSenhaAtual("");
                setNovaSenha("");
                setConfirmarSenha("");
            } else {
                setMessage({ type: "error", text: data.error || "Não deu para alterar a senha. Tente de novo." });
            }
        } catch { /* expected fallback */
            setMessage({ type: "error", text: "Sem conexão com o servidor. Confira a internet e tente de novo." });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <TelaCarregando variante="secao" mensagens={["Carregando seu perfil…"]} />;
    }

    if (!profile) {
        return (
            <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
                <AlertTriangle className="omni-aviso__icone" aria-hidden style={{ width: 22, height: 22 }} />
                <div>
                    <div className="omni-aviso__titulo">Não conseguimos carregar seu perfil</div>
                    <div className="omni-aviso__texto">Recarregue a página para tentar de novo.</div>
                    <div className="omni-aviso__acoes">
                        <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" onClick={() => window.location.reload()}>
                            Recarregar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const activePerms = Object.entries(profile.permissoes || {}).filter(([, v]) => v);
    const vinculos = profile.vinculos || [];
    const alunos = profile.alunos_vinculados || [];
    const papel = profile.is_master ? "Coordenador(a)" : "Professor(a)";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {/* Cabeçalho no padrão do PageHero */}
            <header className={`omni-modulo omni-modulo--pei ${hero.cabecalho}`}>
                <span className={`omni-modulo__selo ${hero.selo}`} aria-hidden="true">
                    <User />
                </span>
                <div className={hero.texto}>
                    <p className="omni-rotulo">Minha conta</p>
                    <h1 className={hero.titulo}>{profile.nome}</h1>
                    <p className={hero.desc}>{papel} · {profile.workspace_name}</p>
                </div>
            </header>

            {/* Dados pessoais */}
            <section className="omni-cartao" aria-labelledby="perfil-dados">
                <TituloCartao id="perfil-dados" icone={<User aria-hidden size={18} />}>Dados pessoais</TituloCartao>
                <dl style={{ ...GRADE, margin: 0 }}>
                    <InfoField icon={<User size={16} aria-hidden />} label="Nome" value={profile.nome} />
                    <InfoField icon={<Mail size={16} aria-hidden />} label="E-mail" value={profile.email || "—"} />
                    <InfoField icon={<Phone size={16} aria-hidden />} label="Telefone" value={profile.telefone || "—"} />
                    <InfoField icon={<Briefcase size={16} aria-hidden />} label="Cargo" value={profile.cargo || "—"} />
                    <InfoField icon={<Building2 size={16} aria-hidden />} label="Escola" value={profile.workspace_name} />
                    <InfoField icon={<Shield size={16} aria-hidden />} label="Papel" value={papel} />
                </dl>
            </section>

            {/* Permissões */}
            <section className="omni-cartao" aria-labelledby="perfil-permissoes">
                <TituloCartao id="perfil-permissoes" icone={<Shield aria-hidden size={18} />}>O que você pode acessar</TituloCartao>
                {activePerms.length > 0 ? (
                    <ul style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", margin: 0, padding: 0, listStyle: "none" }}>
                        {activePerms.map(([key]) => {
                            const nome = PERMISSION_LABELS[key];
                            if (!nome) return null;
                            return (
                                <li key={key} className="omni-estado omni-estado--info" style={{ whiteSpace: "normal", maxWidth: "100%" }}>{nome}</li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="omni-apoio">Nenhum acesso liberado ainda. Fale com a coordenação.</p>
                )}
            </section>

            {/* Vínculos do professor */}
            {vinculos.length > 0 && (
                <section className="omni-cartao" aria-labelledby="perfil-vinculos">
                    <TituloCartao id="perfil-vinculos" icone={<GraduationCap aria-hidden size={18} />} contagem={vinculos.length}>
                        Meus componentes e turmas
                    </TituloCartao>
                    <ul style={{ ...GRADE, gap: "var(--space-3)", margin: 0, padding: 0, listStyle: "none" }}>
                        {vinculos.map((v, i) => (
                            <li key={i} className="omni-cartao omni-cartao--plano" style={{ padding: "var(--space-4)", gap: "var(--space-1)" }}>
                                <span style={{ font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>{v.componente}</span>
                                <span className="omni-apoio">
                                    {v.serie}{v.turma && ` · Turma ${v.turma}`}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Estudantes vinculados (tutoria) */}
            {alunos.length > 0 && (
                <section className="omni-cartao" aria-labelledby="perfil-alunos">
                    <TituloCartao id="perfil-alunos" icone={<Users aria-hidden size={18} />} contagem={alunos.length}>
                        Estudantes que você acompanha
                    </TituloCartao>
                    <ul style={{ ...GRADE, gap: "var(--space-3)", margin: 0, padding: 0, listStyle: "none" }}>
                        {alunos.map(a => (
                            <li key={a.id} className="omni-cartao omni-cartao--plano" style={{ padding: "var(--space-4)", gap: "var(--space-1)" }}>
                                <span style={{ font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>{a.name}</span>
                                <span className="omni-apoio">
                                    {a.grade}{a.class_group && ` · Turma ${a.class_group}`}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Sem vínculos */}
            {vinculos.length === 0 && alunos.length === 0 && !profile.is_master && (
                <div className="omni-vazio" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
                    <div className="omni-vazio__texto">
                        <BookOpen size={40} aria-hidden style={{ color: "var(--tinta-3)" }} />
                        <h2 className="omni-vazio__titulo" style={{ margin: 0 }}>Você ainda não tem vínculos</h2>
                        <p style={{ margin: 0 }}>
                            Nenhum componente, turma ou estudante está ligado a você. Peça à coordenação para cadastrar em Equipe e papéis.
                        </p>
                    </div>
                </div>
            )}

            {/* Alterar senha */}
            <section className="omni-cartao" aria-labelledby="perfil-senha">
                <TituloCartao id="perfil-senha" icone={<Lock aria-hidden size={18} />}>Alterar senha</TituloCartao>
                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: 400 }}>
                    <PasswordInput
                        id="perfil-senha-atual"
                        label="Senha atual"
                        autoComplete="current-password"
                        value={senhaAtual}
                        onChange={setSenhaAtual}
                        show={showSenhaAtual}
                        onToggle={() => setShowSenhaAtual(v => !v)}
                    />
                    <PasswordInput
                        id="perfil-senha-nova"
                        label="Nova senha"
                        ajuda="Pelo menos 4 caracteres."
                        autoComplete="new-password"
                        value={novaSenha}
                        onChange={setNovaSenha}
                        show={showNovaSenha}
                        onToggle={() => setShowNovaSenha(v => !v)}
                    />
                    <PasswordInput
                        id="perfil-senha-confirmar"
                        label="Confirmar nova senha"
                        autoComplete="new-password"
                        value={confirmarSenha}
                        onChange={setConfirmarSenha}
                        show={showNovaSenha}
                        onToggle={() => setShowNovaSenha(v => !v)}
                    />

                    {message && (
                        <div
                            className={`omni-aviso ${message.type === "success" ? "omni-aviso--sucesso" : "omni-aviso--erro"}`}
                            role={message.type === "success" ? "status" : "alert"}
                        >
                            {message.type === "success"
                                ? <CheckCircle2 className="omni-aviso__icone" aria-hidden style={{ width: 20, height: 20 }} />
                                : <AlertTriangle className="omni-aviso__icone" aria-hidden style={{ width: 20, height: 20 }} />}
                            <div className="omni-aviso__texto">{message.text}</div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="omni-btn omni-btn--primario"
                            disabled={saving || !senhaAtual || !novaSenha || !confirmarSenha}
                        >
                            {saving ? <CarregandoLinha texto="Salvando…" /> : "Alterar senha"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

// ─── Partes ───────────────────────────────────────────────────────────────────

function TituloCartao({ id, icone, contagem, children }: { id: string; icone: React.ReactNode; contagem?: number; children: React.ReactNode }) {
    return (
        <h2 id={id} className="omni-cartao__titulo" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", margin: 0 }}>
            <span style={{ color: "var(--tinta-3)", display: "inline-flex" }}>{icone}</span>
            {children}
            {contagem !== undefined && (
                <span className="omni-estado omni-estado--neutro" style={{ marginLeft: "var(--space-1)" }}>{contagem}</span>
            )}
        </h2>
    );
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)", minWidth: 0 }}>
            <span style={{ color: "var(--tinta-3)", marginTop: 2, flex: "none", display: "inline-flex" }}>{icon}</span>
            <div style={{ minWidth: 0 }}>
                <dt className="omni-rotulo">{label}</dt>
                <dd style={{ margin: "2px 0 0", font: "600 15px/22px var(--font-sans)", color: "var(--tinta)", overflowWrap: "anywhere" }}>
                    {value}
                </dd>
            </div>
        </div>
    );
}

function PasswordInput({ id, label, ajuda, autoComplete, value, onChange, show, onToggle }: {
    id: string;
    label: string;
    ajuda?: string;
    autoComplete?: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="omni-campo">
            <label className="omni-campo__rotulo" htmlFor={id}>{label}</label>
            {ajuda && <span id={`${id}-ajuda`} className="omni-campo__ajuda">{ajuda}</span>}
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                <input
                    id={id}
                    className="omni-entrada"
                    style={{ flex: 1, minWidth: 0 }}
                    type={show ? "text" : "password"}
                    autoComplete={autoComplete}
                    aria-describedby={ajuda ? `${id}-ajuda` : undefined}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
                <button
                    type="button"
                    className="omni-btn omni-btn--discreto omni-btn--icone"
                    aria-label={show ? `Esconder ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
                    aria-pressed={show}
                    onClick={onToggle}
                >
                    {show ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                </button>
            </div>
        </div>
    );
}
