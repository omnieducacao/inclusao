"use client";
import { OmniLoader } from "@/components/OmniLoader";
import React, { useState, useEffect } from "react";
import { ShieldCheck, Download, Activity, Search, RefreshCw, AlertTriangle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Workspace } from "../lib/admin-types";

type AuditLogEntry = {
    id: string;
    workspace_name: string;
    actor_id: string;
    actor_role: string;
    action: string;
    resource_type: string;
    resource_id: string;
    metadata: Record<string, any>;
    ip_address: string;
    created_at: string;
};

export function AuditoriaTab({ workspaces, isPlatformAdmin = false }: { workspaces: Workspace[], isPlatformAdmin?: boolean }) {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [availableActions, setAvailableActions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [wsFilter, setWsFilter] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [offset, setOffset] = useState(0);
    const limit = 50;

    useEffect(() => {
        loadAuditLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wsFilter, actionFilter, offset]);

    async function loadAuditLogs() {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
            if (wsFilter) params.set("workspace_id", wsFilter);
            if (actionFilter) params.set("action", actionFilter);

            const res = await fetch(`/api/admin/audit-log?${params}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
                setTotal(data.total || 0);
                if (data.available_actions) setAvailableActions(data.available_actions);
            } else {
                /* client-side */ console.error("Erro na requisição da auditoria:", res.status);
            }
        } catch (err) {
            /* client-side */ console.error("Erro ao carregar log de auditoria LGPD:", err);
        } finally {
            setLoading(false);
        }
    }

    // Nomes simples das ações
    const actionLabels: Record<string, string> = {
        view: "Consulta",
        export: "Exportação de dados",
        create: "Criação",
        update: "Alteração",
        delete: "Exclusão",
        login: "Entrada",
        logout: "Saída"
    };

    const actionColors: Record<string, string> = {
        view: "omni-estado--info",
        export: "omni-estado--atencao",
        delete: "omni-estado--erro",
        create: "omni-estado--sucesso",
        update: "omni-estado--atencao",
    };

    return (
        <section className="omni-cartao" aria-labelledby="auditoria-titulo">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                    <h3 id="auditoria-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}>
                        <ShieldCheck size={20} aria-hidden />
                        Auditoria de dados
                    </h3>
                    <p className="omni-apoio" style={{ marginTop: 4 }}>
                        Quem consultou, criou, alterou ou exportou dados de saúde e educação na plataforma.
                        Exigência da LGPD (Lei Geral de Proteção de Dados).
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => { setOffset(0); loadAuditLogs(); }}
                    className="omni-btn omni-btn--secundario omni-btn--pequeno"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : undefined} aria-hidden />
                    Atualizar
                </button>
            </div>

            <div className="omni-cartao omni-cartao--plano" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", gap: 12, padding: 12 }}>
                {isPlatformAdmin && (
                    <label className="omni-campo" style={{ flex: "0 1 260px" }}>
                        <span className="omni-campo__rotulo">Escola</span>
                        <select
                            value={wsFilter}
                            onChange={(e) => { setWsFilter(e.target.value); setOffset(0); }}
                            className="omni-entrada"
                        >
                            <option value="">Todas as escolas</option>
                            {workspaces.map((ws) => (
                                <option key={ws.id} value={ws.id}>{ws.name}</option>
                            ))}
                        </select>
                    </label>
                )}

                <label className="omni-campo" style={{ flex: "0 1 260px" }}>
                    <span className="omni-campo__rotulo">Tipo de ação</span>
                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setOffset(0); }}
                        className="omni-entrada"
                    >
                        <option value="">Todas as ações</option>
                        {availableActions.map((a) => (
                            <option key={a} value={a}>{actionLabels[a] || a}</option>
                        ))}
                    </select>
                </label>
                <span className="omni-estado omni-estado--neutro" style={{ alignSelf: "center" }}>
                    {total} {total === 1 ? "registro" : "registros"}
                </span>
            </div>

            {loading ? (
                <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "48px 0" }}>
                    <OmniLoader size={20} /> Carregando registros de auditoria…
                </p>
            ) : logs.length === 0 ? (
                <div className="omni-cartao omni-cartao--plano" style={{ alignItems: "center", padding: "48px 16px", border: "1.5px dashed var(--borda-forte)" }}>
                    <ShieldCheck size={40} aria-hidden style={{ color: "var(--tinta-3)" }} />
                    <p className="omni-apoio" style={{ textAlign: "center", fontWeight: 600 }}>Nenhum registro com estes filtros.</p>
                </div>
            ) : (
                <>
                    <div className="omni-tabela-caixa">
                        <table className="omni-tabela">
                            <thead>
                                <tr>
                                    <th scope="col">Data e hora</th>
                                    <th scope="col">Ação e área</th>
                                    <th scope="col">Quem fez</th>
                                    <th scope="col">Papel</th>
                                    <th scope="col">Item afetado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => {
                                    const date = log.created_at
                                        ? new Date(log.created_at).toLocaleString("pt-BR", {
                                            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
                                        })
                                        : "—";

                                    return (
                                        <tr key={log.id}>
                                            <td style={{ whiteSpace: "nowrap", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                                                {date}
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                                                    <span className={`omni-estado ${actionColors[log.action] || "omni-estado--neutro"}`}>
                                                        {actionLabels[log.action] || log.action}
                                                    </span>
                                                    <span style={{ color: "var(--tinta-2)", fontWeight: 600, textTransform: "capitalize" }}>
                                                        {log.resource_type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="omni-tabela__nome" title={log.actor_id} style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {log.actor_id || "Sistema"}
                                            </td>
                                            <td>
                                                <span className="omni-estado omni-estado--neutro" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                                                    {log.actor_role || "service_role"}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--tinta-2)" }}>
                                                <p title={log.resource_id} style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {log.resource_id ? `#${log.resource_id.split("-")[0]}` : "Geral"}
                                                </p>
                                                {log.metadata?.module && <span className="omni-tabela__sub">Módulo: {log.metadata.module}</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    <nav aria-label="Páginas da auditoria" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <button
                            type="button"
                            disabled={offset === 0}
                            onClick={() => setOffset(Math.max(0, offset - limit))}
                            className="omni-btn omni-btn--secundario omni-btn--pequeno"
                        >
                            <ChevronLeft size={16} aria-hidden /> Anterior
                        </button>
                        <span className="omni-apoio" style={{ fontVariantNumeric: "tabular-nums" }}>
                            {offset + 1} a {Math.min(offset + limit, total)} de {total}
                        </span>
                        <button
                            type="button"
                            disabled={offset + limit >= total}
                            onClick={() => setOffset(offset + limit)}
                            className="omni-btn omni-btn--secundario omni-btn--pequeno"
                        >
                            Próxima <ChevronRight size={16} aria-hidden />
                        </button>
                    </nav>
                </>
            )}
        </section>
    );
}
