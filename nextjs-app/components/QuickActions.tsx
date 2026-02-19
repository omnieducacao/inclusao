"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { Icon } from "phosphor-react";
import type { SessionPayload } from "@/lib/session";

// Internal actions within pages — these are the real quick access items
const ALL_ACTIONS = [
    // Hub AI Tools
    {
        id: "hub-criar-questoes",
        href: "/hub?tool=criar-zero",
        label: "Criar Questões",
        emoji: "✨",
        iconName: "Lightbulb",
        gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
        permission: "can_hub",
        category: "Hub de IA",
    },
    {
        id: "hub-adaptar-prova",
        href: "/hub?tool=adaptar-prova",
        label: "Adaptar Prova",
        emoji: "�",
        iconName: "FileText",
        gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
        permission: "can_hub",
        category: "Hub de IA",
    },
    {
        id: "hub-adaptar-atividade",
        href: "/hub?tool=adaptar-atividade",
        label: "Adaptar Atividade",
        emoji: "🖼️",
        iconName: "ImageSquare",
        gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
        permission: "can_hub",
        category: "Hub de IA",
    },
    {
        id: "hub-estudio-visual",
        href: "/hub?tool=estudio-visual",
        label: "Estúdio Visual",
        emoji: "🎨",
        iconName: "Palette",
        gradient: "linear-gradient(135deg, #ec4899, #db2777)",
        permission: "can_hub",
        category: "Hub de IA",
    },
    {
        id: "hub-plano-aula",
        href: "/hub?tool=plano-aula",
        label: "Plano de Aula DUA",
        emoji: "📋",
        iconName: "ClipboardText",
        gradient: "linear-gradient(135deg, #14b8a6, #0d9488)",
        permission: "can_hub",
        category: "Hub de IA",
    },
    {
        id: "hub-papo-mestre",
        href: "/hub?tool=papo-mestre",
        label: "Papo de Mestre",
        emoji: "💬",
        iconName: "ChatCircleText",
        gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        permission: "can_hub",
        category: "Hub de IA",
    },
    {
        id: "hub-dinamica",
        href: "/hub?tool=dinamica",
        label: "Dinâmica Inclusiva",
        emoji: "🤝",
        iconName: "HandshakeIcon",
        gradient: "linear-gradient(135deg, #10b981, #059669)",
        permission: "can_hub",
        category: "Hub de IA",
    },
    {
        id: "hub-roteiro",
        href: "/hub?tool=roteiro",
        label: "Roteiro Individual",
        emoji: "📝",
        iconName: "NotePencil",
        gradient: "linear-gradient(135deg, #6366f1, #4f46e5)",
        permission: "can_hub",
        category: "Hub de IA",
    },
    // Diário de Bordo internal tabs
    {
        id: "diario-novo",
        href: "/diario?tab=novo",
        label: "Novo Registro",
        emoji: "➕",
        iconName: "PlusCircle",
        gradient: "linear-gradient(135deg, #f43f5e, #e11d48)",
        permission: "can_diario",
        category: "Diário de Bordo",
    },
    {
        id: "diario-lista",
        href: "/diario?tab=lista",
        label: "Listar Registros",
        emoji: "�",
        iconName: "ListBullets",
        gradient: "linear-gradient(135deg, #f97316, #ea580c)",
        permission: "can_diario",
        category: "Diário de Bordo",
    },
    {
        id: "diario-relatorios",
        href: "/diario?tab=relatorios",
        label: "Relatórios do Diário",
        emoji: "�",
        iconName: "ChartBar",
        gradient: "linear-gradient(135deg, #a855f7, #9333ea)",
        permission: "can_diario",
        category: "Diário de Bordo",
    },
    // PEI actions
    {
        id: "pei-gerar",
        href: "/pei?action=gerar",
        label: "Gerar PEI com IA",
        emoji: "🧠",
        iconName: "Brain",
        gradient: "linear-gradient(135deg, #4285F4, #3574D4)",
        permission: "can_pei",
        category: "PEI",
    },
    {
        id: "pei-exportar",
        href: "/pei?action=exportar",
        label: "Exportar PEI (PDF)",
        emoji: "📑",
        iconName: "FilePdf",
        gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
        permission: "can_pei",
        category: "PEI",
    },
    // PAEE actions
    {
        id: "paee-mapa",
        href: "/paee?tool=mapa-mental",
        label: "Mapa Mental PAEE",
        emoji: "🗺️",
        iconName: "TreeStructure",
        gradient: "linear-gradient(135deg, #9334E6, #7C2BC4)",
        permission: "can_paee",
        category: "PAEE",
    },
    // Monitoramento
    {
        id: "monitoramento-ver",
        href: "/monitoramento",
        label: "Ver Evolução",
        emoji: "📈",
        iconName: "TrendUp",
        gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
        permission: "can_avaliacao",
        category: "Monitoramento",
    },
    // Infos
    {
        id: "infos-legislacao",
        href: "/infos?tab=legal",
        label: "Legislação Inclusiva",
        emoji: "⚖️",
        iconName: "Scales",
        gradient: "linear-gradient(135deg, #64748b, #475569)",
        category: "C. Inteligência",
    },
    {
        id: "infos-glossario",
        href: "/infos?tab=glossario",
        label: "Glossário",
        emoji: "📖",
        iconName: "BookOpen",
        gradient: "linear-gradient(135deg, #0ea5e9, #0284c7)",
        category: "C. Inteligência",
    },
];

// Default pinned actions for first-time users
const DEFAULT_PINNED = [
    "hub-criar-questoes",
    "diario-novo",
    "hub-estudio-visual",
    "pei-gerar",
];

function getStorageKey(workspaceId: string) {
    return `omniprof_quick_actions_${workspaceId}`;
}

type QuickActionsProps = {
    session: SessionPayload;
};

export function QuickActions({ session }: QuickActionsProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [icons, setIcons] = useState<Record<string, Icon>>({});
    const [pinnedIds, setPinnedIds] = useState<string[]>(DEFAULT_PINNED);
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);

        if (typeof window !== "undefined") {
            import("phosphor-react").then((phosphor) => {
                setIcons({
                    Lightbulb: phosphor.Lightbulb,
                    FileText: phosphor.FileText,
                    ImageSquare: phosphor.ImageSquare,
                    Palette: phosphor.Palette,
                    ClipboardText: phosphor.ClipboardText,
                    ChatCircleText: phosphor.ChatCircleText,
                    HandshakeIcon: phosphor.Handshake,
                    NotePencil: phosphor.NotePencil,
                    PlusCircle: phosphor.PlusCircle,
                    ListBullets: phosphor.ListBullets,
                    ChartBar: phosphor.ChartBar,
                    Brain: phosphor.Brain,
                    FilePdf: phosphor.FilePdf,
                    TreeStructure: phosphor.TreeStructure,
                    TrendUp: phosphor.TrendUp,
                    Scales: phosphor.Scales,
                    BookOpen: phosphor.BookOpen,
                    PencilSimple: phosphor.PencilSimple,
                    Check: phosphor.Check,
                    X: phosphor.X,
                    PushPin: phosphor.PushPin,
                });
            });

            const wsId = session.workspace_id || "default";
            const saved = localStorage.getItem(getStorageKey(wsId));
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setPinnedIds(parsed);
                    }
                } catch {
                    // ignore
                }
            }
        }
    }, [session.workspace_id]);

    // Close picker on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowPicker(false);
            }
        }
        if (showPicker) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showPicker]);

    function canAccess(permission?: string): boolean {
        if (!permission) return true;
        if (session.is_platform_admin) return true;
        if (session.user_role === "master") return true;
        const member = session.member as Record<string, boolean> | undefined;
        if (!member) return false;
        return member[permission] === true;
    }

    function togglePin(actionId: string) {
        setPinnedIds((prev) => {
            const next = prev.includes(actionId)
                ? prev.filter((id) => id !== actionId)
                : [...prev, actionId];

            const wsId = session.workspace_id || "default";
            localStorage.setItem(getStorageKey(wsId), JSON.stringify(next));
            return next;
        });
    }

    const availableActions = ALL_ACTIONS.filter((a) => canAccess(a.permission));
    const pinnedActions = availableActions.filter((a) =>
        pinnedIds.includes(a.id)
    );

    // Group available actions by category for the picker
    const categorized = availableActions.reduce(
        (acc, action) => {
            const cat = action.category;
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(action);
            return acc;
        },
        {} as Record<string, typeof availableActions>
    );

    if (!isMounted) {
        return (
            <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-11 w-36 rounded-xl animate-pulse"
                        style={{ backgroundColor: "var(--bg-tertiary)" }}
                    />
                ))}
            </div>
        );
    }

    const PencilIcon = icons.PencilSimple;
    const CheckIcon = icons.Check;
    const PinIcon = icons.PushPin;

    return (
        <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3">
                {/* Pinned action pills */}
                {pinnedActions.map((action, index) => {
                    const IconComp = icons[action.iconName];
                    // Extract gradient colors for glow effect
                    const glowColor = action.gradient.match(/#[0-9a-f]{6}/i)?.[0] || '#6366f1';
                    return (
                        <Link
                            key={action.id}
                            href={action.href}
                            className="premium-shimmer quick-action-pill group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 active:scale-[0.96]"
                            style={{
                                background: action.gradient,
                                boxShadow:
                                    "0 2px 8px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.25)",
                                animationDelay: `${index * 0.08}s`,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = `0 8px 24px ${glowColor}40, 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.25)';
                            }}
                        >
                            {IconComp ? (
                                <IconComp
                                    className="relative z-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                                    weight="bold"
                                    style={{ width: "18px", height: "18px" }}
                                />
                            ) : (
                                <span className="text-base relative z-10">{action.emoji}</span>
                            )}
                            <span className="relative z-10">{action.label}</span>
                            <span className="relative z-10 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 text-xs">
                                →
                            </span>
                        </Link>
                    );
                })}

                {/* Empty state */}
                {pinnedActions.length === 0 && (
                    <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
                        Nenhum atalho fixado. Clique em &quot;Personalizar&quot; para
                        escolher.
                    </p>
                )}

                {/* Edit button */}
                <button
                    onClick={() => setShowPicker((v) => !v)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                    style={{
                        backgroundColor: showPicker
                            ? "var(--bg-hover)"
                            : "var(--bg-secondary)",
                        color: "var(--text-secondary)",
                        border: `1px solid ${showPicker ? "var(--border-strong)" : "var(--border-default)"}`,
                        boxShadow: "var(--shadow-xs)",
                    }}
                    title="Personalizar atalhos"
                >
                    {showPicker && PinIcon ? (
                        <PinIcon
                            weight="fill"
                            style={{ width: "16px", height: "16px" }}
                        />
                    ) : PencilIcon ? (
                        <PencilIcon
                            weight="bold"
                            style={{ width: "16px", height: "16px" }}
                        />
                    ) : (
                        <span>✏️</span>
                    )}
                    <span className="hidden sm:inline">
                        {showPicker ? "Fechar" : "Personalizar"}
                    </span>
                </button>
            </div>

            {/* Picker dropdown */}
            {showPicker && (
                <div
                    ref={pickerRef}
                    className="absolute left-0 top-full mt-3 z-50 w-full max-w-2xl rounded-2xl overflow-hidden animate-fade-in-up"
                    style={{
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-default)",
                        boxShadow: "var(--shadow-xl)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="px-5 py-3.5 flex items-center justify-between"
                        style={{
                            borderBottom: "1px solid var(--border-default)",
                            background: "var(--bg-tertiary)",
                        }}
                    >
                        <div>
                            <h3
                                className="text-sm font-bold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Personalizar Atalhos Rápidos
                            </h3>
                            <p
                                className="text-xs mt-0.5"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Fixe os recursos que você mais usa no dia a dia
                            </p>
                        </div>
                        <button
                            onClick={() => setShowPicker(false)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {icons.X ? (
                                <icons.X
                                    weight="bold"
                                    style={{ width: "16px", height: "16px" }}
                                />
                            ) : (
                                "✕"
                            )}
                        </button>
                    </div>

                    {/* Categorized action list */}
                    <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
                        {Object.entries(categorized).map(([category, actions]) => (
                            <div key={category}>
                                <h4
                                    className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {category}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {actions.map((action) => {
                                        const isPinned = pinnedIds.includes(action.id);
                                        const ActionIcon = icons[action.iconName];
                                        return (
                                            <button
                                                key={action.id}
                                                onClick={() => togglePin(action.id)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 hover:scale-[1.01]"
                                                style={{
                                                    backgroundColor: isPinned
                                                        ? "var(--bg-hover)"
                                                        : "transparent",
                                                    border: isPinned
                                                        ? "1px solid var(--border-strong)"
                                                        : "1px solid transparent",
                                                }}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                    style={{
                                                        background: action.gradient,
                                                        opacity: isPinned ? 1 : 0.5,
                                                    }}
                                                >
                                                    {ActionIcon ? (
                                                        <ActionIcon
                                                            weight="bold"
                                                            style={{
                                                                width: "16px",
                                                                height: "16px",
                                                                color: "white",
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-xs">{action.emoji}</span>
                                                    )}
                                                </div>

                                                <span
                                                    className="text-sm font-medium flex-1 truncate"
                                                    style={{
                                                        color: isPinned
                                                            ? "var(--text-primary)"
                                                            : "var(--text-secondary)",
                                                    }}
                                                >
                                                    {action.label}
                                                </span>

                                                <div
                                                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-200"
                                                    style={{
                                                        backgroundColor: isPinned
                                                            ? "#3b82f6"
                                                            : "var(--bg-tertiary)",
                                                        border: isPinned
                                                            ? "none"
                                                            : "1px solid var(--border-default)",
                                                    }}
                                                >
                                                    {isPinned && CheckIcon ? (
                                                        <CheckIcon
                                                            weight="bold"
                                                            style={{
                                                                width: "12px",
                                                                height: "12px",
                                                                color: "white",
                                                            }}
                                                        />
                                                    ) : null}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div
                        className="px-5 py-2.5 text-center"
                        style={{
                            borderTop: "1px solid var(--border-default)",
                            background: "var(--bg-tertiary)",
                        }}
                    >
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                            Preferências salvas automaticamente neste dispositivo
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
