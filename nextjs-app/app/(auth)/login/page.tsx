"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [adminMode, setAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao fazer login.");
        return;
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || "Credenciais inválidas.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setAdminError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-6 font-[Nunito,sans-serif]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Omnisfera
          </h1>
          <p className="text-[#64748b] mt-1 text-sm">
            Plataforma de Inclusão Educacional
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          {!adminMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="seu@email.escola.br"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-[#1d4ed8] disabled:opacity-60 transition-colors"
              >
                {loading ? "Entrando…" : "Entrar"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                Acesso administrativo da plataforma
              </p>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  E-mail
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Senha
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              {adminError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {adminError}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors"
              >
                {loading ? "Entrando…" : "Entrar como admin"}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => {
              setAdminMode(!adminMode);
              setError("");
              setAdminError("");
            }}
            className="w-full mt-4 text-sm text-slate-500 hover:text-slate-700"
          >
            {adminMode ? "← Voltar ao login escolar" : "Sou administrador da plataforma"}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Omnisfera — Inclusão Educacional
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">Carregando…</div>}>
      <LoginForm />
    </Suspense>
  );
}
