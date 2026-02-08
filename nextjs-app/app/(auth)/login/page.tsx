"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

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
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* ─── Animated Background ─── */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 animate-gradient" />

      {/* ─── Floating Decorative Blobs ─── */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-[100px] animate-blob" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
      <div className="fixed top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-blue-300/15 blur-[80px] animate-blob" style={{ animationDelay: '8s' }} />

      {/* ─── Subtle Grid Pattern ─── */}
      <div
        className="fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ─── Login Card ─── */}
      <div className="relative z-10 w-full max-w-[420px] animate-fade-in-up">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-xl shadow-lg mb-5 animate-float">
            <Image
              src="/omni_icone.png"
              alt="Omnisfera"
              width={40}
              height={40}
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            Omnisfera
          </h1>
          <p className="text-blue-200/90 mt-1.5 text-sm font-medium">
            Plataforma de Inclusão Educacional
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/40 p-8" style={{ boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15)' }}>
          {!adminMode ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200"
                  placeholder="seu@email.escola.br"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:hover:shadow-none transition-all duration-300 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Entrando…
                  </span>
                ) : "Entrar"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl mb-1">
                <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Acesso administrativo da plataforma
              </div>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  E-mail
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Senha
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200"
                />
              </div>
              {adminError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {adminError}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold rounded-xl hover:from-slate-800 hover:to-slate-900 hover:shadow-lg disabled:opacity-60 transition-all duration-300 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Entrando…
                  </span>
                ) : "Entrar como admin"}
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
            className="w-full mt-5 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors duration-200"
          >
            {adminMode ? "← Voltar ao login escolar" : "Sou administrador da plataforma"}
          </button>
        </div>

        <p className="text-center text-xs text-blue-200/60 mt-8 font-medium tracking-wide">
          Omnisfera — Inclusão Educacional
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
