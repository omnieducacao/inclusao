"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Sparkles, BookOpen, Network, Star, FileEdit, GraduationCap,
    Users, ListOrdered, MessageCircle, Image as ImageIcon, Clock, Gamepad2, HandHeart, Heart, Scissors, FileCheck,
    Settings2, X, Check
} from "lucide-react";

const MASTER_ACTIONS = [
    { id: "criar-questoes", label: "Criar Questões", href: "/ferramentas/criar-questoes", icon: Sparkles },
    { id: "criar-itens", label: "Criar Itens", href: "/ferramentas/criar-itens", icon: FileCheck },
    { id: "plano-aula", label: "Plano de Aula", href: "/ferramentas/plano-aula", icon: BookOpen },
    { id: "dinamica", label: "Dinâmica", href: "/ferramentas/dinamica", icon: Users },
    { id: "sequencia-didatica", label: "Seq. Didática", href: "/ferramentas/sequencia-didatica", icon: ListOrdered },
    { id: "papo-mestre", label: "Papo de Mestre", href: "/ferramentas/papo-mestre", icon: MessageCircle },
    { id: "mapa-mental", label: "Mapa Mental", href: "/ferramentas/mapa-mental", icon: Network },
    { id: "estudio-visual", label: "Estúdio Visual", href: "/ferramentas/estudio-visual", icon: ImageIcon },
    { id: "rotina-visual", label: "Rotina Visual", href: "/ferramentas/rotina-visual", icon: Clock },
    { id: "atividades-ludicas", label: "Ativ. Lúdicas", href: "/ferramentas/atividades-ludicas", icon: Gamepad2 },
    { id: "criar-questoes-inclusao", label: "Questões (Inclusão)", href: "/ferramentas/criar-questoes-inclusao", icon: HandHeart },
    { id: "criar-itens-inclusao", label: "Itens (Inclusão)", href: "/ferramentas/criar-itens-inclusao", icon: Heart },
    { id: "adaptar-prova", label: "Adaptar Prova", href: "/ferramentas/adaptar-prova", icon: FileEdit },
    { id: "adaptar-atividade", label: "Adaptar Atividade", href: "/ferramentas/adaptar-atividade", icon: Scissors },
    { id: "plano-curso", label: "Novo Plano BD", href: "/plano-curso", icon: GraduationCap },
];

const DEFAULT_PINS = ["criar-questoes", "plano-aula", "mapa-mental", "estudio-visual", "adaptar-prova", "plano-curso"];
const MAX_PINS = 6;
const STORAGE_KEY = "omniprof_pinned_actions";

export function QuickActionsHome() {
    const [pinnedIds, setPinnedIds] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setPinnedIds(JSON.parse(stored));
            } catch {
                setPinnedIds(DEFAULT_PINS);
            }
        } else {
            setPinnedIds(DEFAULT_PINS);
        }
    }, []);

    const togglePin = (id: string) => {
        setPinnedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(p => p !== id);
            }
            if (prev.length >= MAX_PINS) {
                return prev; // Reached limit
            }
            return [...prev, id];
        });
    };

    const savePins = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedIds));
        setIsEditing(false);
    };

    const pinnedActions = MASTER_ACTIONS.filter(a => pinnedIds.includes(a.id));

    if (!isClient) return <div className="h-64 rounded-2xl bg-slate-800 animate-pulse"></div>;

    return (
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-md text-white transition-all">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                    Acesso Rápido
                </h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                        title="Personalizar atalhos"
                    >
                        <Settings2 size={16} />
                    </button>
                ) : (
                    <button
                        onClick={savePins}
                        className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-xs font-bold"
                    >
                        <Check size={14} /> Salvar
                    </button>
                )}
            </div>

            {!isEditing ? (
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    {pinnedActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.id}
                                href={action.href}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-white/10 text-[#38bdf8]">
                                    <Icon size={18} />
                                </div>
                                <span className="font-semibold text-sm">{action.label}</span>
                            </Link>
                        );
                    })}
                    {pinnedActions.length === 0 && (
                        <div className="text-sm text-slate-400 py-4 text-center border border-dashed border-slate-600 rounded-xl">
                            Nenhum atalho fixado. <br /> Clique nas engrenagens para adicionar.
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                        Selecione até {MAX_PINS} ferramentas para fixar aqui ({pinnedIds.length}/{MAX_PINS}).
                    </p>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {MASTER_ACTIONS.map((action) => {
                            const isPinned = pinnedIds.includes(action.id);
                            const disabled = !isPinned && pinnedIds.length >= MAX_PINS;

                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    onClick={() => togglePin(action.id)}
                                    disabled={disabled}
                                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors border ${isPinned
                                            ? "bg-sky-500/20 border-sky-500/50"
                                            : disabled
                                                ? "opacity-50 border-white/5 cursor-not-allowed"
                                                : "hover:bg-white/5 border-white/10"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-md ${isPinned ? "bg-sky-500/30 text-sky-400" : "bg-white/10 text-slate-300"}`}>
                                            <Icon size={14} />
                                        </div>
                                        <span className="text-sm font-medium">{action.label}</span>
                                    </div>
                                    <div className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center">
                                        {isPinned && <Check size={12} className="text-sky-400" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )
            }
        </section >
    );
}
