"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { Settings2, Eye, Type, Droplet, Moon, Sun, Check, NotebookPen } from "lucide-react";
import type { PreferenciaTema } from "./ThemeProvider";

// Amostras: o fundo, o texto e a ação de cada tema (valores de tokens.json do design system)
// "Automático" (padrão) segue o modo claro/escuro do computador ou do celular
const TEMAS: Array<{ id: PreferenciaTema; nome: string; fundo: string; tinta: string; acao: string }> = [
    { id: "auto", nome: "Automático", fundo: "linear-gradient(90deg, #f6f4f0 50%, #0d1526 50%)", tinta: "#5d6a80", acao: "#7db6f2" },
    { id: "light", nome: "Claro", fundo: "#f6f4f0", tinta: "#1b2a4a", acao: "#1d5f9f" },
    { id: "notebook", nome: "Caderno", fundo: "#faf6f1", tinta: "#1c1917", acao: "#1b5894" },
    { id: "dark", nome: "Escuro", fundo: "#0d1526", tinta: "#eef1f6", acao: "#7db6f2" },
];

export function AccessibilityMenu() {
    const {
        theme, preferencia, setPreferencia,
        highContrast, toggleHighContrast,
        dyslexiaFont, toggleDyslexiaFont,
        colorBlindMode, setColorBlindMode
    } = useTheme();

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside or Escape key
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && isOpen) {
                e.preventDefault();
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const toggleOpen = () => setIsOpen(!isOpen);

    const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : NotebookPen;

    // Daltonismo: mesmas opções e mesmos valores de antes
    const DALTONISMO: Array<{ id: "none" | "protanopia" | "deuteranopia" | "tritanopia"; nome: string; ajuda?: string; rotulo: string }> = [
        { id: "none", nome: "Nenhum", rotulo: "Sem ajuste para daltonismo" },
        { id: "protanopia", nome: "Protanopia", ajuda: "Dificuldade com vermelho", rotulo: "Ajuste para protanopia (dificuldade com vermelho)" },
        { id: "deuteranopia", nome: "Deuteranopia", ajuda: "Dificuldade com verde", rotulo: "Ajuste para deuteranopia (dificuldade com verde)" },
        { id: "tritanopia", nome: "Tritanopia", ajuda: "Dificuldade com azul", rotulo: "Ajuste para tritanopia (dificuldade com azul)" },
    ];

    const estiloGrupo: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 8, font: "500 12px/16px var(--font-mono)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--tinta-2)" };

    return (
        <div style={{ position: "relative", display: "inline-block", textAlign: "left" }} ref={menuRef}>
            <button
                type="button"
                onClick={toggleOpen}
                className="omni-btn omni-btn--secundario omni-btn--icone"
                style={{ width: 40, minHeight: 40, borderRadius: "50%", borderWidth: 1, borderColor: "var(--borda)", color: "var(--tinta-2)" }}
                aria-label="Aparência e acessibilidade"
                aria-expanded={isOpen}
                aria-controls="menu-acessibilidade"
            >
                <Settings2 aria-hidden style={{ width: 20, height: 20 }} />
            </button>

            {isOpen && (
                <div
                    id="menu-acessibilidade"
                    role="region"
                    aria-labelledby="menu-acessibilidade-titulo"
                    style={{
                        position: "absolute",
                        right: 0,
                        marginTop: 8,
                        width: "min(300px, calc(100vw - 32px))",
                        zIndex: 60, // = --camada-menu
                        overflow: "hidden",
                        background: "var(--superficie)",
                        border: "1px solid var(--borda)",
                        borderRadius: "var(--o-radius-lg) var(--o-radius-xs) var(--o-radius-lg) var(--o-radius-lg)",
                        boxShadow: "var(--sombra-2)",
                    }}
                >
                    <div style={{ padding: 16, borderBottom: "1px solid var(--borda)", background: "var(--superficie-2)" }}>
                        <h3 id="menu-acessibilidade-titulo" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>
                            <Settings2 aria-hidden style={{ width: 16, height: 16, color: "var(--acao)" }} />
                            Aparência e acessibilidade
                        </h3>
                        <p className="omni-apoio" style={{ margin: "4px 0 0", fontSize: 13 }}>
                            Ajuste a tela do jeito que funciona melhor para você.
                        </p>
                    </div>

                    <div style={{ padding: 12, display: "grid", gap: 20, maxHeight: "60vh", overflowY: "auto" }}>
                        {/* TEMA: o padrão segue o aparelho; a pessoa pode fixar Claro, Caderno ou Escuro (design system: SeletorTema) */}
                        <fieldset className="omni-temas" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                            <legend style={estiloGrupo}>
                                <ThemeIcon aria-hidden style={{ width: 14, height: 14 }} /> Tema
                            </legend>
                            {TEMAS.map((t) => (
                                <label key={t.id} className="omni-tema">
                                    <input type="radio" name="omni-tema" value={t.id} checked={preferencia === t.id} onChange={() => setPreferencia(t.id)} />
                                    <span className="omni-tema__amostra" style={{ background: t.fundo }} aria-hidden="true">
                                        <i style={{ width: "45%", background: t.tinta }} />
                                        <i style={{ width: "25%", background: t.acao }} />
                                    </span>
                                    {t.nome}
                                </label>
                            ))}
                        </fieldset>

                        {/* LEITURA E FOCO */}
                        <fieldset style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                            <legend style={estiloGrupo}>
                                <Eye aria-hidden style={{ width: 14, height: 14 }} /> Leitura e foco
                            </legend>

                            <label className="omni-preferencia" style={{ cursor: "pointer", paddingInline: 4 }}>
                                <span className="omni-preferencia__texto">
                                    <span className="omni-preferencia__nome" style={{ display: "block", fontSize: 14 }}>Alto contraste</span>
                                    <span className="omni-preferencia__ajuda" style={{ display: "block", fontSize: 13 }}>Mais diferença entre texto e fundo, para ler com mais facilidade</span>
                                </span>
                                <input
                                    type="checkbox"
                                    role="switch"
                                    className="omni-interruptor"
                                    checked={highContrast}
                                    onChange={toggleHighContrast}
                                />
                            </label>

                            <label className="omni-preferencia" style={{ cursor: "pointer", paddingInline: 4, borderBottom: 0 }}>
                                <span className="omni-preferencia__texto">
                                    <span className="omni-preferencia__nome" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                                        Fonte para leitura <Type aria-hidden style={{ width: 12, height: 12 }} />
                                    </span>
                                    <span className="omni-preferencia__ajuda" style={{ display: "block", fontSize: 13 }}>Atkinson Hyperlegible: letras fáceis de diferenciar</span>
                                </span>
                                <input
                                    type="checkbox"
                                    role="switch"
                                    className="omni-interruptor"
                                    checked={dyslexiaFont}
                                    onChange={toggleDyslexiaFont}
                                />
                            </label>
                        </fieldset>

                        {/* DALTONISMO */}
                        <fieldset style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
                            <legend style={estiloGrupo}>
                                <Droplet aria-hidden style={{ width: 14, height: 14 }} /> Daltonismo
                            </legend>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                                {DALTONISMO.map((d) => (
                                    <button
                                        key={d.id}
                                        type="button"
                                        onClick={() => setColorBlindMode(d.id)}
                                        className="omni-chip"
                                        aria-pressed={colorBlindMode === d.id}
                                        aria-label={d.rotulo}
                                        style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, minHeight: 48, padding: "6px 8px", borderRadius: "var(--o-radius-sm)", textAlign: "center", whiteSpace: "normal" }}
                                    >
                                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            {colorBlindMode === d.id && <Check aria-hidden style={{ width: 14, height: 14, color: "var(--acao)" }} />}
                                            {d.nome}
                                        </span>
                                        {d.ajuda && <span style={{ font: "400 11px/14px var(--font-sans)", color: "var(--tinta-2)" }}>{d.ajuda}</span>}
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                </div>
            )}
        </div>
    );
}
