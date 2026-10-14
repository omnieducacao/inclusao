"use client";

import { useState } from "react";
import { BookOpen, ClipboardList, Layers } from "lucide-react";
import { FormularioContato } from "@/components/vendas/FormularioContato";

const PAPEIS = [
    { id: "aee", Icone: Layers, titulo: "Professor(a) do AEE", texto: "Ficha do estudante, PEI em quatro etapas, ciclos do PAEE e diário de bordo.", cor: "paee" },
    { id: "regente", Icone: BookOpen, titulo: "Professor(a) regente", texto: "Ler o PEI, dar ciência e fazer a parte da sua disciplina: diagnóstica, plano e adaptações.", cor: "pei" },
    { id: "coordenacao", Icone: ClipboardList, titulo: "Coordenação", texto: "A escola inteira: envio aos professores, consolidação, evolução e o resumo para a família.", cor: "gestao" },
];

export function EntradaDemo() {
    const [papel, setPapel] = useState<string>("");
    return (
        <div style={{ display: "grid", gap: 24 }}>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: "grid", gap: 12 }}>
                <legend style={{ font: "800 20px/28px var(--font-sans)", marginBottom: 12 }}>1. Com qual papel você quer entrar?</legend>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" }}>
                    {PAPEIS.map((p) => (
                        <label key={p.id} className={`omni-cartao omni-modulo omni-modulo--${p.cor}`}
                            style={{ cursor: "pointer", gap: 8, outline: papel === p.id ? "3px solid var(--acao)" : undefined, outlineOffset: 2 }}>
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <span className="omni-modulo__selo" aria-hidden><p.Icone /></span>
                                <input type="radio" name="papel" value={p.id} checked={papel === p.id} onChange={() => setPapel(p.id)} style={{ width: 20, height: 20 }} />
                            </span>
                            <strong style={{ font: "800 17px/24px var(--font-sans)", color: "var(--tinta)" }}>{p.titulo}</strong>
                            <span className="omni-cartao__texto">{p.texto}</span>
                        </label>
                    ))}
                </div>
            </fieldset>
            <section className="omni-cartao" aria-label="Seus dados" style={{ padding: "clamp(20px, 4vw, 32px)", gap: 16 }}>
                <h2 style={{ margin: 0, font: "800 20px/28px var(--font-sans)" }}>2. Conte quem você é</h2>
                <p className="omni-apoio" style={{ margin: 0 }}>Usamos esses dados só para a nossa equipe falar com você depois da visita.</p>
                <FormularioContato
                    origem="demonstracao"
                    endpoint="/api/public/demonstracao"
                    extra={{ papel }}
                    conferir={() => (papel ? null : "Escolha com qual papel quer entrar (passo 1).")}
                    mostrarMensagem={false}
                    textoBotao="Entrar na demonstração"
                />
            </section>
        </div>
    );
}
