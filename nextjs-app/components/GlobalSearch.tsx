"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, User, Users, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type SearchResult = {
    id: string;
    name: string;
    subtitle: string;
    type: "student" | "member";
    diagnosis?: string;
    role?: string;
};

/**
 * GlobalSearch — Cmd+K palette for quick search across
 * students and members.
 */
export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ students: SearchResult[]; members: SearchResult[] }>({
        students: [],
        members: [],
    });
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const abortRef = useRef<AbortController | null>(null);

    // ⌘K / Ctrl+K to toggle
    useEffect(() => {
        function handleKeydown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        }
        window.addEventListener("keydown", handleKeydown);
        return () => window.removeEventListener("keydown", handleKeydown);
    }, []);

    // Focus input when opening
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery("");
            setResults({ students: [], members: [] });
            setSelectedIndex(0);
        }
    }, [open]);

    // Debounced search
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults({ students: [], members: [] });
            return;
        }

        const timer = setTimeout(async () => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error("Search failed");
                const data = await res.json();
                setResults(data);
                setSelectedIndex(0);
            } catch {
                // Ignore abort errors
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const allResults = [...results.students, ...results.members];

    const navigate = useCallback(
        (result: SearchResult) => {
            setOpen(false);
            if (result.type === "student") {
                router.push(`/pei?studentId=${result.id}`);
            } else {
                router.push(`/gestao`);
            }
        },
        [router]
    );

    // Keyboard nav
    const handleKeydown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === "Enter" && allResults[selectedIndex]) {
                e.preventDefault();
                navigate(allResults[selectedIndex]);
            }
        },
        [allResults, selectedIndex, navigate]
    );

    if (!open) return null;

    const hasResults = allResults.length > 0;
    const hasQuery = query.length >= 2;

    return (
        <div
            className="fixed inset-0 z-[9997] flex items-start justify-center pt-[15vh]"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}
            onClick={(e) => {
                if (e.target === e.currentTarget) setOpen(false);
            }}
        >
            <div
                className="rounded-2xl shadow-2xl max-w-xl w-full mx-4 overflow-hidden animate-fade-in"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
            >
                {/* Search input */}
                <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeydown}
                        placeholder="Pesquise pelo &quot;nome&quot; para encontrar estudantes rapidamente.óstico ou membro..."
                        className="flex-1 text-sm outline-none"
                        style={{ color: 'var(--text-primary)', backgroundColor: 'transparent' }}
                    />
                    {loading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />}
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="text-xs px-2 py-1 rounded-md font-mono"
                        style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}
                    >
                        ESC
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto">
                    {hasQuery && !hasResults && !loading && (
                        <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                            Nenhum resultado para "{query}"
                        </div>
                    )}

                    {!hasQuery && (
                        <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                            Digite ao menos 2 caracteres para buscar
                        </div>
                    )}

                    {/* Students */}
                    {results.students.length > 0 && (
                        <div className="px-2 pt-2">
                            <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Estudantes
                            </div>
                            {results.students.map((result, i) => {
                                const globalIdx = i;
                                return (
                                    <button
                                        key={result.id}
                                        type="button"
                                        onClick={() => navigate(result)}
                                        className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-colors ${selectedIndex === globalIdx
                                            ? "bg-blue-50 text-blue-800"
                                            : "hover:bg-slate-50 text-slate-700"
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-sky-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold truncate">{result.name}</div>
                                            <div className="text-xs text-slate-400 truncate">
                                                {result.subtitle}
                                                {result.diagnosis && ` · ${result.diagnosis}`}
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-300">→ PEI</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Members */}
                    {results.members.length > 0 && (
                        <div className="px-2 pt-1 pb-2">
                            <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Equipe
                            </div>
                            {results.members.map((result, i) => {
                                const globalIdx = results.students.length + i;
                                return (
                                    <button
                                        key={result.id}
                                        type="button"
                                        onClick={() => navigate(result)}
                                        className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-colors ${selectedIndex === globalIdx
                                            ? "bg-blue-50 text-blue-800"
                                            : "hover:bg-slate-50 text-slate-700"
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <Users className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold truncate">{result.name}</div>
                                            <div className="text-xs text-slate-400 truncate">
                                                {result.subtitle} · {result.role}
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-300">→ Gestão</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 flex items-center justify-between text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-3">
                        <span>↑↓ navegar</span>
                        <span>↵ selecionar</span>
                        <span>ESC fechar</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-mono px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: 'var(--border-strong)' }}>⌘</span>
                        <span className="font-mono px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: 'var(--border-strong)' }}>K</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
