"use client";
import { useConfirmar } from "@/components/Confirmar";

import { useState, useEffect } from "react";
import { nomeDoPapel } from "@/lib/papeis";
import { Trash2, Edit, Pause, Play, User, AlertTriangle, Heart } from "lucide-react";
import type { WorkspaceMember, FamilyResponsavel } from "../types";
import { PERM_LABELS } from "../types";
import { EditarUsuarioForm } from "./MemberForms";
import { SimularButton, SimularFamilyButton } from "./SimularButtons";

/** Iniciais para o avatar (até duas letras). */
function iniciais(nome: string): string {
    const partes = (nome || "").trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return "?";
    const primeira = partes[0][0] ?? "";
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] ?? "" : "";
    return (primeira + ultima).toUpperCase();
}

function Avatar({ nome }: { nome: string }) {
    return <span className="omni-avatar" aria-hidden style={{ flex: "none" }}>{iniciais(nome)}</span>;
}

const nomeEstilo: React.CSSProperties = { margin: 0, font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" };
const subEstilo: React.CSSProperties = { margin: "2px 0 0", font: "400 13px/18px var(--font-sans)", color: "var(--tinta-2)" };
const acoesEstilo: React.CSSProperties = { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, flexWrap: "wrap" };

export function MemberCard({
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
    const { confirmar, dialogo } = useConfirmar();
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
            <tr>
                <td colSpan={4} style={{ background: hasData ? "var(--atencao-suave)" : "var(--erro-suave)" }}>
                    <div role="group" aria-labelledby={`excluir-${member.id}-t`} style={{ display: "grid", gap: 12, padding: "4px 0" }}>
                        <p id={`excluir-${member.id}-t`} style={{ ...nomeEstilo, font: "800 16px/22px var(--font-sans)" }}>
                            Excluir {member.nome}?
                        </p>

                        {loadingImpact && (
                            <p className="omni-apoio" role="status" style={{ margin: 0 }}>Vendo o que está ligado a essa pessoa…</p>
                        )}

                        {hasData && (
                            <div className="omni-aviso omni-aviso--atencao" role="alert" style={{ maxWidth: "none", background: "var(--superficie)", borderColor: "var(--borda)" }}>
                                <AlertTriangle className="omni-aviso__icone" aria-hidden />
                                <div>
                                    <div className="omni-aviso__titulo">Essa pessoa tem registros pedagógicos</div>
                                    <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {impactData!.pei_disciplinas > 0 && (
                                            <li className="omni-estado omni-estado--atencao">
                                                {impactData!.pei_disciplinas} disciplina(s) de PEI
                                            </li>
                                        )}
                                        {impactData!.planos_ensino > 0 && (
                                            <li className="omni-estado omni-estado--atencao">
                                                {impactData!.planos_ensino} plano(s) de ensino
                                            </li>
                                        )}
                                        {impactData!.avaliacoes_diagnosticas > 0 && (
                                            <li className="omni-estado omni-estado--atencao">
                                                {impactData!.avaliacoes_diagnosticas} avaliação(ões) diagnóstica(s)
                                            </li>
                                        )}
                                    </ul>
                                    <div className="omni-aviso__texto" style={{ marginTop: 8 }}>
                                        Esses registros ficam guardados (o PEI continua funcionando), mas deixam de mostrar quem os fez.
                                        Recomendamos <strong>desativar</strong> em vez de excluir.
                                    </div>
                                </div>
                            </div>
                        )}

                        {!hasData && !loadingImpact && (
                            <p className="omni-apoio" style={{ margin: 0 }}>
                                Não há registros pedagógicos ligados a essa pessoa. O e-mail fica livre para um novo cadastro.
                            </p>
                        )}

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            <button
                                type="button"
                                className="omni-btn omni-btn--secundario omni-btn--pequeno"
                                onClick={() => { setConfirmDelId(null); setImpactData(null); }}
                            >
                                Cancelar
                            </button>
                            {hasData && (
                                <button
                                    type="button"
                                    className="omni-btn omni-btn--primario omni-btn--pequeno"
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
                                    <Pause aria-hidden /> Desativar (recomendado)
                                </button>
                            )}
                            <button
                                type="button"
                                className="omni-btn omni-btn--perigo omni-btn--pequeno"
                                disabled={deleting || loadingImpact}
                                aria-busy={deleting}
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
                                <Trash2 aria-hidden /> {deleting ? "Excluindo…" : hasData ? "Excluir mesmo assim" : "Excluir"}
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }

    if (editingId === member.id) {
        return (
            <tr>
                <td colSpan={4} style={{ padding: 0 }}>
                    <EditarUsuarioForm
                        member={member}
                        onSuccess={() => {
                            setEditingId(null);
                            onAction();
                        }}
                        onCancel={() => setEditingId(null)}
                        onError={onError}
                    />
                </td>
            </tr>
        );
    }

    return (
        <tr
            className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
            style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
        >
            <td style={{ verticalAlign: "top" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar nome={member.nome} />
                    <div style={{ minWidth: 0 }}>
                        <p style={nomeEstilo}>
                            {member.nome}
                            <span style={{ fontWeight: 400, color: "var(--tinta-2)" }}> · {nomeDoPapel(member.papel)}{member.cargo ? ` (${member.cargo})` : ""}</span>
                        </p>
                        <p style={subEstilo}>
                            {member.email} · {member.telefone || "—"}
                        </p>
                    </div>
                </div>
            </td>
            <td style={{ verticalAlign: "top" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {perms.map((p) => (
                        <span key={p} className="omni-estado omni-estado--neutro">{p}</span>
                    ))}
                    {perms.length === 0 && <span style={{ color: "var(--tinta-3)" }}>—</span>}
                </div>
            </td>
            <td style={{ verticalAlign: "top" }}>
                <p style={{ ...subEstilo, margin: 0, whiteSpace: "nowrap" }}>{linkTxt}</p>
            </td>
            <td style={{ verticalAlign: "top" }}>
                <div style={acoesEstilo}>
                    {dialogo}
                    <SimularButton memberId={member.id} memberName={member.nome} />
                    <button
                        type="button"
                        className="omni-btn omni-btn--discreto omni-btn--pequeno"
                        onClick={() => setEditingId(member.id)}
                        aria-label={`Editar ${member.nome}`}
                    >
                        <Edit aria-hidden />
                        Editar
                    </button>
                    <button
                        type="button"
                        className="omni-btn omni-btn--discreto omni-btn--pequeno"
                        aria-label={`Desativar ${member.nome}`}
                        onClick={async () => {
                            const ok = await confirmar({
                                titulo: `Desativar ${member.nome}?`,
                                texto: "A pessoa deixa de entrar na Omnisfera. O que ela registrou continua salvo, e você pode reativar depois.",
                                acao: "Desativar",
                                cancelar: "Manter ativo",
                                perigo: true,
                            });
                            if (!ok) return;
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
                    >
                        <Pause aria-hidden />
                        Desativar
                    </button>
                    <button
                        type="button"
                        className="omni-btn omni-btn--discreto omni-btn--pequeno"
                        style={{ color: "var(--erro)" }}
                        onClick={() => setConfirmDelId(member.id)}
                        aria-label={`Excluir ${member.nome}`}
                    >
                        <Trash2 aria-hidden />
                        Excluir
                    </button>
                </div>
            </td>
        </tr>
    );
}

export function InactiveMemberCard({
    member,
    index,
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
    // Onda 19: a confirmação feita à mão na linha virou o diálogo do design system
    const { confirmar, dialogo } = useConfirmar();

    async function excluirDeVez() {
        const ok = await confirmar({
            titulo: `Excluir ${member.nome} de vez?`,
            texto: "Não dá para desfazer. O e-mail fica livre para um novo cadastro.",
            acao: "Excluir de vez",
            cancelar: "Manter",
            perigo: true,
        });
        if (!ok) return;
        const res = await fetch(`/api/members/${member.id}`, { method: "DELETE" });
        if (!res.ok) {
            const d = await res.json();
            onError(d.error || "Erro ao excluir.");
            return;
        }
        setConfirmDelId(null);
        onAction();
    }

    return (
        <tr
            className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
            style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
        >
            <td style={{ verticalAlign: "top" }}>
                <p style={{ ...nomeEstilo, display: "flex", alignItems: "center", gap: 6 }}>
                    <User aria-hidden style={{ width: 16, height: 16, color: "var(--tinta-3)" }} />
                    {member.nome}
                </p>
                <p style={subEstilo}>{member.email}</p>
            </td>
            <td style={{ verticalAlign: "top" }}>
                <span className="omni-estado omni-estado--neutro">Equipe · desativado</span>
            </td>
            <td style={{ verticalAlign: "top" }}>
                <div style={acoesEstilo}>
                    {dialogo}
                    <button
                        type="button"
                        className="omni-btn omni-btn--discreto omni-btn--pequeno"
                        aria-label={`Reativar ${member.nome}`}
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
                    >
                        <Play aria-hidden />
                        Reativar
                    </button>
                    <button
                        type="button"
                        className="omni-btn omni-btn--discreto omni-btn--pequeno"
                        style={{ color: "var(--erro)" }}
                        aria-label={`Excluir ${member.nome} de vez`}
                        onClick={excluirDeVez}
                    >
                        <Trash2 aria-hidden />
                        Excluir de vez
                    </button>
                </div>
            </td>
        </tr>
    );
}

export function FamilyCard({
    responsavel,
    index,
}: {
    responsavel: FamilyResponsavel;
    index: number;
    onAction: () => void;
    onError: (err: string) => void;
}) {
    return (
        <tr
            className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
            style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
        >
            <td style={{ verticalAlign: "top" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar nome={responsavel.nome} />
                    <div style={{ minWidth: 0 }}>
                        <p style={nomeEstilo}>{responsavel.nome}</p>
                        <p style={subEstilo}>
                            {responsavel.email} {responsavel.telefone && `· Tel.: ${responsavel.telefone}`}
                        </p>
                    </div>
                </div>
            </td>
            <td style={{ verticalAlign: "top" }}>
                <span className="omni-estado omni-estado--info"><Heart aria-hidden /> Família</span>
            </td>
            <td style={{ verticalAlign: "top" }}>
                <p style={{ ...subEstilo, margin: 0 }}>{responsavel.parentesco || "—"}</p>
            </td>
            <td style={{ verticalAlign: "top" }}>
                <div style={acoesEstilo}>
                    <SimularFamilyButton responsavelId={responsavel.id} responsavelName={responsavel.nome} />
                </div>
            </td>
        </tr>
    );
}
