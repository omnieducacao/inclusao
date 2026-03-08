"use client";

import { useState } from "react";

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
            onError("Nome, email e senha são obrigatórios.");
            return;
        }
        if (password.length < 4) {
            onError("Senha deve ter no mínimo 4 caracteres.");
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
                onError(data.error || "Erro ao cadastrar master.");
                return;
            }
            onSuccess();
        } catch { /* expected fallback */
            onError("Erro de conexão. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
            <h3 className="font-semibold text-indigo-900 mb-2">🔐 Configurar usuário master</h3>
            <p className="text-sm text-indigo-800 mb-4">
                Seu workspace usa login com PIN. Configure o master para ativar a Gestão de Usuários. Depois disso, o login exigirá email + senha.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
                <input
                    type="text"
                    placeholder="Nome completo *"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <input
                    type="email"
                    placeholder="Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <input
                    type="password"
                    placeholder="Senha * (mín. 4 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <input
                    type="text"
                    placeholder="Telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <input
                    type="text"
                    placeholder="Cargo *"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                    {saving ? "Cadastrando…" : "Cadastrar master"}
                </button>
            </form>
        </div>
    );
}
