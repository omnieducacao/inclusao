"use client";

/**
 * SCRUM-231: painel do admin da plataforma para regravar, cifrados, os dados antigos que ainda estão
 * em texto claro (estudantes, telefones) e trocar IP e navegador pelo resumo. Mesmo padrão visual do
 * DataCleanupPanel: primeiro verifica (simulação), depois aplica.
 */
import { CarregandoLinha } from "@/components/brand/TelaCarregando";
import React, { useState } from "react";
import { Lock, Search, AlertTriangle, CheckCircle2 } from "lucide-react";

type Contagem = { linhas: number; a_mudar: number; gravadas: number; erros: number };
type Resposta = { aplicado: boolean; total_a_mudar: number; relatorio: Record<string, Contagem> };

const ROTULOS: Record<string, string> = {
    estudantes: "Estudantes (diagnóstico, PEI e PAEE)",
    colunas_workspace_members: "Equipe (telefone e índice do e-mail)",
    colunas_workspace_masters: "Coordenação (telefone e índice do e-mail)",
    colunas_family_responsibles: "Famílias (telefone e índice do e-mail)",
    colunas_platform_admins: "Admins da plataforma (índice do e-mail)",
    ip_audit_log: "IPs no registro de auditoria",
    ciencia_pei: "Ciência do PEI (IP e navegador)",
};

export function ProtecaoDadosPanel() {
    const [resp, setResp] = useState<Resposta | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const rodar = async (aplicar: boolean) => {
        setCarregando(true);
        setErro(null);
        try {
            const res = await fetch("/api/admin/cifrar-dados", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ aplicar }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Não deu para verificar agora. Tente de novo.");
            setResp(data);
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Algo deu errado. Tente de novo.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <section className="omni-cartao" style={{ padding: 0, gap: 0, overflow: "hidden" }} aria-labelledby="protecao-titulo">
            <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--borda)", background: "var(--superficie-2)" }}>
                <div className="flex items-center gap-3">
                    <Lock size={20} aria-hidden="true" style={{ color: "var(--acao)" }} />
                    <div>
                        <h2 id="protecao-titulo" className="omni-cartao__titulo" style={{ fontSize: 18 }}>Proteção dos dados</h2>
                        <p className="omni-apoio">Cifra os dados antigos que ainda estão em texto aberto no banco.</p>
                    </div>
                </div>
            </div>
            <div className="space-y-6" style={{ padding: "var(--space-6)" }}>
                <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => rodar(false)} disabled={carregando} aria-busy={carregando} className="omni-btn omni-btn--primario">
                        {carregando ? <CarregandoLinha tamanho={16} /> : <Search aria-hidden="true" />}
                        Verificar (sem mudar nada)
                    </button>
                    {resp && !resp.aplicado && resp.total_a_mudar > 0 && (
                        <button
                            type="button"
                            onClick={() => { if (confirm(`Cifrar ${resp.total_a_mudar} registros agora?`)) rodar(true); }}
                            disabled={carregando}
                            className="omni-btn omni-btn--secundario"
                        >
                            <Lock aria-hidden="true" /> Cifrar {resp.total_a_mudar} registros
                        </button>
                    )}
                </div>

                {erro && (
                    <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
                        <AlertTriangle className="omni-aviso__icone" aria-hidden="true" />
                        <p className="omni-aviso__texto" style={{ marginTop: 0, color: "var(--tinta)" }}>{erro}</p>
                    </div>
                )}

                {resp && (
                    <div role="status" className="space-y-3">
                        <p className="omni-cartao__titulo" style={{ fontSize: 15 }}>
                            {resp.aplicado ? "Feito" : "Simulação"}: {resp.total_a_mudar === 0 ? "nada em texto aberto." : `${resp.total_a_mudar} registros ${resp.aplicado ? "eram" : "estão"} em texto aberto.`}
                        </p>
                        <ul className="space-y-1.5" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                            {Object.entries(resp.relatorio).map(([k, c]) => (
                                <li key={k} className="flex items-center gap-2 omni-apoio">
                                    {c.a_mudar === 0 ? <CheckCircle2 size={16} aria-hidden="true" style={{ color: "var(--sucesso)" }} /> : <Lock size={16} aria-hidden="true" />}
                                    {ROTULOS[k] || k}: {c.linhas} registros, {c.a_mudar} {resp.aplicado ? `cifrados (${c.gravadas} gravados)` : "a cifrar"}{c.erros ? `, ${c.erros} erros` : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
