"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

/* ═══════════════════════════════════════════════════
   Floating Particle — decorative circle
   ═══════════════════════════════════════════════════ */
function Particle({ color, size, top, left, delay, duration }: {
  color: string; size: number; top: string; left: string; delay: string; duration: string;
}) {
  return (
    <div
      className="absolute rounded-full animate-float"
      style={{
        width: size,
        height: size,
        top,
        left,
        background: color,
        opacity: 0.25,
        animationDelay: delay,
        animationDuration: duration,
        filter: `blur(${size < 10 ? 0 : 1}px)`,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════
   Login Form Component
   ═══════════════════════════════════════════════════ */
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

  const inputCls =
    "w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200";

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-white">
      {/* ═══════ Full-Screen Aurora Background ═══════ */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[5%] left-[2%] w-[500px] h-[500px] rounded-full bg-red-400/[0.07] blur-[120px] animate-blob" />
        <div className="absolute top-[55%] left-[8%] w-[450px] h-[450px] rounded-full bg-blue-500/[0.08] blur-[110px] animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute top-[15%] right-[5%] w-[420px] h-[420px] rounded-full bg-emerald-400/[0.07] blur-[100px] animate-blob" style={{ animationDelay: "6s" }} />
        <div className="absolute bottom-[10%] right-[15%] w-[380px] h-[380px] rounded-full bg-amber-400/[0.09] blur-[90px] animate-blob" style={{ animationDelay: "9s" }} />
        <div className="absolute bottom-[25%] left-[35%] w-[350px] h-[350px] rounded-full bg-purple-500/[0.06] blur-[100px] animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] right-[25%] w-[320px] h-[320px] rounded-full bg-cyan-400/[0.07] blur-[90px] animate-blob" style={{ animationDelay: "5s" }} />
        <div className="absolute top-[70%] left-[55%] w-[280px] h-[280px] rounded-full bg-orange-400/[0.05] blur-[80px] animate-blob" style={{ animationDelay: "7s" }} />
        <div className="absolute top-[10%] left-[50%] w-[300px] h-[300px] rounded-full bg-indigo-400/[0.06] blur-[90px] animate-blob" style={{ animationDelay: "4s" }} />
      </div>

      {/* Subtle Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%23cbd5e1' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Particles */}
      <Particle color="#E8453C" size={8} top="12%" left="15%" delay="0s" duration="7s" />
      <Particle color="#4285F4" size={6} top="25%" left="75%" delay="1s" duration="8s" />
      <Particle color="#34A853" size={10} top="70%" left="20%" delay="2s" duration="9s" />
      <Particle color="#F9AB00" size={7} top="80%" left="70%" delay="0.5s" duration="6s" />
      <Particle color="#9334E6" size={5} top="35%" left="8%" delay="3s" duration="10s" />
      <Particle color="#00BCD4" size={9} top="45%" left="88%" delay="1.5s" duration="7.5s" />
      <Particle color="#E8453C" size={4} top="88%" left="45%" delay="4s" duration="8.5s" />
      <Particle color="#4285F4" size={6} top="8%" left="60%" delay="2.5s" duration="9s" />
      <Particle color="#F9AB00" size={5} top="55%" left="35%" delay="1s" duration="6.5s" />
      <Particle color="#34A853" size={7} top="18%" left="90%" delay="3.5s" duration="7s" />
      <Particle color="#9334E6" size={6} top="62%" left="82%" delay="2s" duration="8s" />
      <Particle color="#00BCD4" size={4} top="78%" left="12%" delay="4.5s" duration="7s" />

      {/* ═══════ Two-Column Layout (over shared aurora) ═══════ */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-56 w-full min-h-screen max-w-[1500px] mx-auto px-8">

        {/* ────────────────────────────────────────
            LEFT — Brand Element (logo + wordmark)
           ──────────────────────────────────────── */}
        <div className="flex items-center justify-center py-12 lg:py-0 flex-shrink-0">
          <div className="flex flex-col items-center gap-0 animate-fade-in-up">
            {/* Glow + Orbital rings + Logo */}
            <div className="relative">
              <div
                className="absolute inset-[-60px] rounded-full opacity-25 blur-[50px]"
                style={{
                  background:
                    "radial-gradient(circle, rgba(66,133,244,0.35) 0%, rgba(234,67,53,0.25) 25%, rgba(52,168,83,0.25) 50%, rgba(249,171,0,0.25) 75%, rgba(147,52,230,0.2) 100%)",
                }}
              />
              <div
                className="absolute w-[320px] h-[320px] rounded-full border border-slate-200/20 login-orbit"
                style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
              />
              <div
                className="absolute w-[450px] h-[450px] rounded-full border border-slate-100/12 login-orbit-reverse"
                style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
              />
              {/* Logo — 200px for strong visual presence */}
              <div className="omni-logo-spin relative">
                <Image
                  src="/omni_icone.png"
                  alt="Omnisfera"
                  width={240}
                  height={240}
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>

            {/* Wordmark — large and proportional */}
            <img
              src="/omni_texto.png"
              alt="Omnisfera"
              className="h-[66px] object-contain -mt-4"
              style={{ width: "auto", maxHeight: "66px" }}
            />

            {/* Tagline */}
            <p className="text-slate-400 text-base font-medium tracking-wide -mt-1">
              Plataforma de Inclusão Educacional
            </p>
          </div>
        </div>

        {/* ────────────────────────────────────────
            RIGHT HALF — Login Module
           ──────────────────────────────────────── */}
        <div className="flex items-center justify-center py-12 lg:py-0 w-full max-w-[440px] lg:mt-4">
          <div className="w-full animate-fade-in-up" style={{ animationDelay: "0.15s" }}>

            {/* Welcome header — centered with form */}
            <div className="text-center mb-5">
              <h2 className="text-lg font-semibold text-slate-500 tracking-tight">
                {adminMode ? "Acesso Administrativo" : "Bem-vindo de volta"}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {adminMode
                  ? "Entre com suas credenciais de administrador"
                  : "Entre com suas credenciais para continuar"}
              </p>
            </div>

            {/* Form Card */}
            <div
              className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-7"
              style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.02)" }}
            >
              {!adminMode ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputCls}
                      placeholder="seu@email.escola.br"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Senha
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={inputCls}
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
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50/80 border border-slate-200 px-4 py-2.5 rounded-xl mb-1">
                    <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Acesso administrativo da plataforma
                  </div>
                  <div>
                    <label htmlFor="admin-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      E-mail
                    </label>
                    <input
                      id="admin-email"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="admin-password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Senha
                    </label>
                    <input
                      id="admin-password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className={inputCls}
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
                className="w-full mt-5 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors duration-200"
              >
                {adminMode ? "← Voltar ao login escolar" : "Sou administrador da plataforma"}
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-300 mt-1.5 font-medium tracking-wide">
              © {new Date().getFullYear()} Omnisfera — Inclusão Educacional
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="omni-logo-spin">
          <Image src="/omni_icone.png" alt="Omnisfera" width={48} height={48} className="object-contain" priority />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
