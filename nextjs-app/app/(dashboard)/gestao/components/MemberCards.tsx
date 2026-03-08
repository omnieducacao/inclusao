"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit, Pause, Play, User } from "lucide-react";
import { TableRow, TableCell, Avatar, Badge, Button } from "@omni/ds";
import type { WorkspaceMember, FamilyResponsavel } from "../types";
import { PERM_LABELS } from "../types";
import { EditarUsuarioForm } from "./MemberForms";
import { SimularButton, SimularFamilyButton } from "./SimularButtons";

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

export function InactiveMemberCard({
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
