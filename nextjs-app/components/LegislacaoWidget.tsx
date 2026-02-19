"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Icon } from "phosphor-react";

const LEIS = [
    {
        nome: "Lei 13.146/2015",
        titulo: "Estatuto da Pessoa com Deficiência (LBI)",
        iconName: "Scales",
        href: "/infos?tab=legal",
        cor: "#3b82f6",
    },
    {
        nome: "Decreto 10.502/2020",
        titulo: "Política Nacional de Educação Especial",
        iconName: "Scroll",
        href: "/infos?tab=legal",
        cor: "#8b5cf6",
    },
    {
        nome: "BNCC",
        titulo: "Base Nacional Comum Curricular",
        iconName: "Books",
        href: "/infos?tab=legal",
        cor: "#10b981",
    },
    {
        nome: "Resolução CNE/CEB nº 4",
        titulo: "Diretrizes AEE",
        iconName: "Bank",
        href: "/infos?tab=legal",
        cor: "#f59e0b",
    },
];

export function LegislacaoWidget() {
    const [icons, setIcons] = useState<Record<string, Icon>>({});

    useEffect(() => {
        if (typeof window !== "undefined") {
            import("phosphor-react").then((phosphor) => {
                setIcons({
                    BookOpen: phosphor.BookOpen,
                    Scales: phosphor.Scales,
                    Scroll: phosphor.Scroll,
                    Books: phosphor.Books,
                    Bank: phosphor.Bank,
                });
            });
        }
    }, []);

    const HeaderIcon = icons.BookOpen;

    return (
        <div className="sidebar-glass-card">
            <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{
                    borderBottom: "1px solid var(--border-default)",
                    background: "var(--bg-tertiary)",
                }}
            >
                <h3
                    className="text-sm font-bold flex items-center gap-2"
                    style={{ color: "var(--text-primary)" }}
                >
                    {HeaderIcon ? (
                        <HeaderIcon weight="duotone" style={{ width: "18px", height: "18px", color: "#4F5BD5" }} />
                    ) : (
                        <span className="w-[18px] h-[18px] rounded bg-indigo-100 animate-pulse" />
                    )}
                    Legislação & Referências
                </h3>
                <Link
                    href="/infos?tab=legal"
                    className="text-[11px] font-semibold transition-colors"
                    style={{ color: "var(--text-link)" }}
                >
                    Ver tudo →
                </Link>
            </div>

            <div className="p-3 space-y-1">
                {LEIS.map((lei) => {
                    const LeiIcon = icons[lei.iconName];
                    return (
                        <Link
                            key={lei.nome}
                            href={lei.href}
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] group"
                            style={{
                                backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                e.currentTarget.style.boxShadow = `0 2px 12px ${lei.cor}12`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110"
                                style={{
                                    background: `linear-gradient(135deg, ${lei.cor}18, ${lei.cor}08)`,
                                    border: `1px solid ${lei.cor}20`,
                                }}
                            >
                                {LeiIcon ? (
                                    <LeiIcon weight="duotone" style={{ width: "16px", height: "16px", color: lei.cor }} />
                                ) : (
                                    <span className="w-4 h-4 rounded animate-pulse" style={{ backgroundColor: `${lei.cor}30` }} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-[13px] font-semibold leading-tight truncate"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    {lei.nome}
                                </p>
                                <p
                                    className="text-[11px] mt-0.5 truncate"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {lei.titulo}
                                </p>
                            </div>
                            <span
                                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                style={{ color: "var(--text-link)" }}
                            >
                                →
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
