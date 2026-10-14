"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

export function MasterSetupForm({
    onSuccess,
    onError,
}: {
    onSuccess: () => void;
    onError: (err: string) => void;
}) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cargo, setCargo] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!nome.trim() || !email.trim() || !password) {
            onError("Nome, e-mail e senha são obrigatórios.");
            return;
        }
        if (password.length < 4) {
            onError("A senha precisa ter pelo menos 4 caracteres.");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "create_master",
                    nome: nome.trim(),
                    email: email.trim(),
                    password,
                    telefone: telefone.trim() || undefined,
                    cargo: cargo.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                onError(data.error || "Não foi possível criar a conta da coordenação.");
                return;
            }
            onSuccess();
        } catch { /* expected fallback */
            onError("Erro de conexão. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    const campo = (rotulo: string, opcional: boolean, el: React.ReactNode, ajuda?: string) => (
        <label className="omni-campo">
            <span className="omni-campo__rotulo">
                {rotulo}
                {opcional && <span className="omni-campo__opcional"> (opcional)</span>}
            </span>
            {el}
            {ajuda && <span className="omni-campo__ajuda">{ajuda}</span>}
        </label>
    );

    return (
        <section className="omni-cartao" aria-labelledby="master-t">
            <h2 id="master-t" className="omni-cartao__titulo" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <KeyRound aria-hidden style={{ width: 20, height: 20, color: "var(--acao)" }} />
                Criar a conta da coordenação
            </h2>
            <p className="omni-cartao__texto" style={{ margin: 0 }}>
                Hoje a escola entra na Omnisfera com um código numérico (PIN). Crie a conta principal da coordenação
                para liberar a gestão da equipe. Depois disso, a entrada passa a ser com e-mail e senha.
            </p>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 480 }} noValidate>
                {campo("Nome completo", false, <input type="text" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} className="omni-entrada" aria-required="true" />)}
                {campo("E-mail", false, <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="omni-entrada" aria-required="true" />)}
                {campo("Senha", false, <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="omni-entrada" aria-required="true" />, "Pelo menos 4 caracteres.")}
                {campo("Telefone", true, <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="omni-entrada" />)}
                {campo("Cargo", true, <input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} className="omni-entrada" />, "Ex.: coordenadora pedagógica.")}
                <div>
                    <button type="submit" disabled={saving} aria-busy={saving} className="omni-btn omni-btn--primario">
                        {saving ? "Criando…" : "Criar conta da coordenação"}
                    </button>
                </div>
            </form>
        </section>
    );
}
