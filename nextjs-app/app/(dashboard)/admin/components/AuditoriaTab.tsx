"use client";
import React, { useState, useEffect } from "react";
import { Loader2, ShieldCheck, Download, Activity, Search, RefreshCw, AlertTriangle, Eye } from 'lucide-react';
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
                console.error("Erro na requisição da auditoria:", res.status);
            }
        } catch (err) {
            console.error("Erro ao carregar log de auditoria LGPD:", err);
        } finally {
            setLoading(false);
        }
    }

    // Traduções amigáveis dos métodos
    const actionLabels: Record<string, string> = {
        view: "Visualização",
        export: "Exportação Dados",
        create: "Criação",
        update: "Atualização",
        delete: "Exclusão",
        login: "Acesso (Login)",
        logout: "Saída (Logout)"
    };

    const actionColors: Record<string, string> = {
        view: "bg-blue-100 text-blue-700",
        export: "bg-purple-100 text-purple-700 font-bold",
        delete: "bg-red-100 text-red-700 font-bold",
        create: "bg-emerald-100 text-emerald-700",
        update: "bg-amber-100 text-amber-700",
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="text-emerald-600" />
                            Auditoria & Portabilidade (LGPD)
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Trilha inalterável de quem acessa, insere ou processa dados de Saúde e Educação na Plataforma.</p>
                    </div>

                    <button
                        onClick={() => { setOffset(0); loadAuditLogs(); }}
                        className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {isPlatformAdmin && (
                        <select
                            value={wsFilter}
                            onChange={(e) => { setWsFilter(e.target.value); setOffset(0); }}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        >
                            <option value="">Todas as instâncias (Escolas)</option>
                            {workspaces.map((ws) => (
                                <option key={ws.id} value={ws.id}>{ws.name}</option>
                            ))}
                        </select>
                    )}

                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setOffset(0); }}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                        <option value="">Foco de Rastreio (Todos)</option>
                        {availableActions.map((a) => (
                            <option key={a} value={a}>{actionLabels[a] || a}</option>
                        ))}
                    </select>
                    <span className="self-center text-sm font-medium bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
                        {total} Registo(s) Sensível(is)
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
                        <span className="text-slate-500 font-medium">Lendo trilha de dados na blockchain local...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <ShieldCheck className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-slate-500 text-center font-medium">Nenhum evento auditável correspondente aos filtros.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Timestamp</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Recurso/Módulo</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Acionador</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Operador (Role)</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">ID / Alvo (IP)</th>
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
                                            <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-mono text-xs">
                                                    {date}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium uppercase tracking-wider ${actionColors[log.action] || 'bg-slate-100 text-slate-700'}`}>
                                                            {actionLabels[log.action] || log.action}
                                                        </span>
                                                        <span className="text-slate-600 font-medium capitalize">
                                                            {log.resource_type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-900 font-medium truncate max-w-[150px]" title={log.actor_id}>
                                                    {log.actor_id || "Sistema Automático"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-slate-600 uppercase text-[11px] bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                                        {log.actor_role || "service_role"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                                                    <p className="truncate max-w-[180px]" title={log.resource_id}>
                                                        {log.resource_id ? `#${log.resource_id.split("-")[0]}` : "Global"}
                                                    </p>
                                                    {log.metadata?.module && <p className="text-[10px] text-slate-400 mt-0.5">Módulo: {log.metadata.module}</p>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        <div className="flex items-center justify-between mt-6 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <button
                                disabled={offset === 0}
                                onClick={() => setOffset(Math.max(0, offset - limit))}
                                className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all font-medium"
                            >
                                ← Anterior
                            </button>
                            <span className="text-sm font-medium text-slate-600">
                                Mostrando {offset + 1} a {Math.min(offset + limit, total)} de {total}
                            </span>
                            <button
                                disabled={offset + limit >= total}
                                onClick={() => setOffset(offset + limit)}
                                className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all font-medium"
                            >
                                Próxima →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
