"use client";

import { OmniLoader } from "@/components/OmniLoader";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, User, Users, X } from "lucide-react";
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
 * GlobalSearch — busca rápida (Ctrl+K ou ⌘K) por estudantes e pessoas da equipe.
 * Onda 20: design system; resultados como lista de opções (combobox) para leitor de tela.
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const allResults = [...results.students, ...results.members];

    const navigate = useCallback(
        (result: SearchResult) => {
            setOpen(false);
            if (result.type === "student") {
                router.push(`/estudantes/${result.id}`); // a ficha leva a todos os módulos que a pessoa pode usar
            } else {
                router.push(`/equipe`);
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
    const idOpcao = (i: number) => `busca-global-opcao-${i}`;

    const estiloGrupo: React.CSSProperties = { padding: "12px 12px 6px", margin: 0 };

    const opcao = (result: SearchResult, globalIdx: number, rotulo: string, destino: string) => {
        const ativa = selectedIndex === globalIdx;
        const Icone = result.type === "student" ? User : Users;
        return (
            <li
                key={result.id}
                id={idOpcao(globalIdx)}
                role="option"
                aria-selected={ativa}
                aria-label={rotulo}
                onClick={() => navigate(result)}
                onMouseEnter={() => setSelectedIndex(globalIdx)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: "var(--o-radius-sm)",
                    cursor: "pointer",
                    background: ativa ? "var(--acao-suave)" : "transparent",
                    outline: ativa ? "1.5px solid var(--acao)" : "none",
                    outlineOffset: -1.5,
                    color: "var(--tinta)",
                }}
            >
                <span
                    aria-hidden
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        background: result.type === "student" ? "var(--encontro-azul-suave)" : "var(--encontro-roxo-suave)",
                        color: result.type === "student" ? "var(--encontro-azul-forte)" : "var(--encontro-roxo-forte)",
                    }}
                >
                    <Icone style={{ width: 16, height: 16 }} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", font: "700 14px/20px var(--font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{result.name}</span>
                    <span style={{ display: "block", font: "400 13px/18px var(--font-sans)", color: "var(--tinta-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {result.type === "student"
                            ? <>{result.subtitle}{result.diagnosis && ` · ${result.diagnosis}`}</>
                            : <>{result.subtitle} · {result.role}</>}
                    </span>
                </span>
                <span aria-hidden style={{ font: "600 12px/16px var(--font-sans)", color: "var(--tinta-3)", flexShrink: 0 }}>{destino}</span>
            </li>
        );
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9997,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: "15vh",
                background: "rgba(13, 21, 38, 0.55)",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) setOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Busca rápida"
        >
            <div
                style={{
                    width: "calc(100% - 32px)",
                    maxWidth: 576,
                    overflow: "hidden",
                    background: "var(--superficie)",
                    border: "1px solid var(--borda)",
                    borderRadius: "var(--o-radius-lg) var(--o-radius-lg) var(--o-radius-lg) var(--o-radius-xs)",
                    boxShadow: "var(--sombra-2)",
                }}
            >
                {/* Campo de busca */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 12px 12px 20px", borderBottom: "1px solid var(--borda)" }}>
                    <Search aria-hidden style={{ width: 20, height: 20, flexShrink: 0, color: "var(--tinta-3)" }} />
                    <input
                        ref={inputRef}
                        type="text"
                        role="combobox"
                        aria-label="Buscar estudantes ou pessoas da equipe"
                        aria-expanded={hasResults}
                        aria-controls="busca-global-resultados"
                        aria-autocomplete="list"
                        aria-activedescendant={hasResults ? idOpcao(selectedIndex) : undefined}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeydown}
                        placeholder="Digite o nome de um estudante ou de alguém da equipe"
                        style={{ flex: 1, minWidth: 0, minHeight: 40, border: 0, outline: "none", background: "transparent", font: "400 16px/24px var(--font-sans)", color: "var(--tinta)" }}
                    />
                    {loading && <OmniLoader size={18} />}
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Fechar busca"
                        className="omni-btn omni-btn--secundario omni-btn--pequeno"
                        style={{ font: "500 12px/16px var(--font-mono)" }}
                    >
                        Esc
                    </button>
                </div>

                {/* Resultados */}
                <div style={{ maxHeight: "50vh", overflowY: "auto", padding: "0 8px 8px" }}>
                    <p role="status" className={hasQuery && !hasResults && !loading ? "omni-apoio" : "omni-so-leitor"} style={{ margin: 0, padding: hasQuery && !hasResults && !loading ? "32px 16px" : undefined, textAlign: "center" }}>
                        {hasQuery && !hasResults && !loading
                            ? <>Nada encontrado para &ldquo;{query}&rdquo;.</>
                            : hasResults
                                ? `${allResults.length} resultado${allResults.length === 1 ? "" : "s"}. Use as setas para escolher.`
                                : ""}
                    </p>

                    {!hasQuery && (
                        <p className="omni-apoio" style={{ margin: 0, padding: "32px 16px", textAlign: "center" }}>
                            Digite pelo menos 2 letras para buscar.
                        </p>
                    )}

                    {hasResults && (
                        <ul id="busca-global-resultados" role="listbox" aria-label="Resultados da busca" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                            {results.students.length > 0 && (
                                <li role="presentation">
                                    <p className="omni-rotulo" style={estiloGrupo} aria-hidden>Estudantes</p>
                                    <ul role="group" aria-label="Estudantes" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 2 }}>
                                        {results.students.map((result, i) => opcao(result, i, `Ir para o PEI de ${result.name}`, "Abrir PEI"))}
                                    </ul>
                                </li>
                            )}
                            {results.members.length > 0 && (
                                <li role="presentation">
                                    <p className="omni-rotulo" style={estiloGrupo} aria-hidden>Equipe</p>
                                    <ul role="group" aria-label="Equipe" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 2 }}>
                                        {results.members.map((result, i) => opcao(result, results.students.length + i, `Ir para a gestão de ${result.name}`, "Abrir gestão"))}
                                    </ul>
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                {/* Rodapé com atalhos */}
                <div aria-hidden style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 16px", background: "var(--superficie-2)", borderTop: "1px solid var(--borda)", font: "400 12px/16px var(--font-sans)", color: "var(--tinta-2)" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                        <span>↑↓ escolher</span>
                        <span>Enter abrir</span>
                        <span>Esc fechar</span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                        <kbd style={{ font: "500 11px/16px var(--font-mono)", padding: "1px 6px", borderRadius: "var(--o-radius-xs)", background: "var(--superficie)", border: "1px solid var(--borda-forte)" }}>Ctrl ou ⌘</kbd>
                        <kbd style={{ font: "500 11px/16px var(--font-mono)", padding: "1px 6px", borderRadius: "var(--o-radius-xs)", background: "var(--superficie)", border: "1px solid var(--borda-forte)" }}>K</kbd>
                    </div>
                </div>
            </div>
        </div>
    );
}
