"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
const OmniEducacaoSignature = dynamic(() => import("@/components/Footer").then(mod => mod.OmniEducacaoSignature), { ssr: true });

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
   Register Form Component
   ═══════════════════════════════════════════════════ */
function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Erro ao criar conta.");
                return;
            }
            router.push(data.redirect || redirect);
            router.refresh();
        } catch { /* expected fallback */
            setError("Erro de conexão. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    const inputCls =
        "w-full px-4 py-3 bg-(--omni-bg-secondary) border border-(--omni-border-default) rounded-xl text-(--omni-text-primary) placeholder:text-(--omni-text-muted) focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all duration-200";

    return (
        <div className="bg-(--omni-bg-primary) min-h-screen relative flex items-center justify-center overflow-hidden">
            {/* ═══════ Full-Screen Aurora Background ═══════ */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[5%] left-[2%] w-[500px] h-[500px] rounded-full bg-red-400/[0.07] blur-[120px] animate-blob" />
                <div className="absolute top-[55%] left-[8%] w-[450px] h-[450px] rounded-full bg-blue-500/8 blur-[110px] animate-blob" style={{ animationDelay: "3s" }} />
                <div className="absolute top-[15%] right-[5%] w-[420px] h-[420px] rounded-full bg-emerald-400/[0.07] blur-[100px] animate-blob" style={{ animationDelay: "6s" }} />
                <div className="absolute bottom-[10%] right-[15%] w-[380px] h-[380px] rounded-full bg-amber-400/9 blur-[90px] animate-blob" style={{ animationDelay: "9s" }} />
                <div className="absolute bottom-[25%] left-[35%] w-[350px] h-[350px] rounded-full bg-purple-500/6 blur-[100px] animate-blob" style={{ animationDelay: "2s" }} />
                <div className="absolute top-[40%] right-[25%] w-[320px] h-[320px] rounded-full bg-cyan-400/[0.07] blur-[90px] animate-blob" style={{ animationDelay: "5s" }} />
                <div className="absolute top-[70%] left-[55%] w-[280px] h-[280px] rounded-full bg-orange-400/5 blur-[80px] animate-blob" style={{ animationDelay: "7s" }} />
                <div className="absolute top-[10%] left-[50%] w-[300px] h-[300px] rounded-full bg-indigo-400/6 blur-[90px] animate-blob" style={{ animationDelay: "4s" }} />
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
                <div className="flex items-center justify-center py-12 lg:py-0 shrink-0">
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
                                    src="/omni_icone.webp"
                                    alt="Omnisfera"
                                    width={240}
                                    height={240}
                                    className="object-contain drop-shadow-xl"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Wordmark — large and proportional */}
                        <Image
                            src="/omni_texto.webp"
                            alt="Omnisfera"
                            width={300}
                            height={86}
                            className="h-[86px] object-contain -mt-4"
                            style={{ width: "auto", maxHeight: "86px", filter: 'var(--img-dark-invert, none)' }}
                            priority
                        />

                        {/* Tagline */}
                        <p className="text-base font-medium tracking-wide -mt-1" style={{ color: 'var(--omni-text-muted)' }}>
                            A plataforma definitiva para Professores Inclusivos
                        </p>
                    </div>
                </div>

                {/* ────────────────────────────────────────
            RIGHT HALF — Register Module
           ──────────────────────────────────────── */}
                <div className="flex items-center justify-center py-12 lg:py-0 w-full max-w-[440px] lg:mt-4">
                    <div className="w-full animate-fade-in-up" style={{ animationDelay: "0.15s" }}>

                        {/* Welcome header — centered with form */}
                        <div className="text-center mb-5">
                            <h2 className="text-lg font-semibold text-slate-500 tracking-tight">
                                Crie sua conta no OmniProf
                            </h2>
                            <p className="text-slate-400 text-xs mt-1">
                                7 dias grátis. Transforme seu planejamento com Inteligência Artificial.
                            </p>
                        </div>

                        {/* Form Card */}
                        <div
                            className="backdrop-blur-xl rounded-2xl p-7"
                            style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--omni-border-default)', border: '1px solid var(--omni-border-default)', boxShadow: 'var(--shadow-lg)' }}
                        >
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label htmlFor="nome" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Nome Completo
                                    </label>
                                    <input
                                        id="nome"
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        required
                                        className={inputCls}
                                        placeholder="Professora Maria Eduarda"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Seu melhor E-mail
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={inputCls}
                                        placeholder="professora@exemplo.com.br"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Criar Senha
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={4}
                                        className={inputCls}
                                        placeholder="No mínimo 4 caracteres"
                                    />
                                </div>
                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
                                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    aria-label="Criar conta e iniciar teste grátis"
                                    disabled={loading}
                                    className="w-full py-3 mt-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:hover:shadow-none transition-all duration-300 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                            Criando seu ambiente…
                                        </span>
                                    ) : "Assinar Grátis"}
                                </button>
                            </form>

                            <div className="mt-5 space-y-2">
                                <Link
                                    href="/login"
                                    className="block w-full text-center text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors duration-200"
                                >
                                    Já é assinante? Fazer Login
                                </Link>
                                <p className="text-xs text-slate-400 text-center px-4 leading-relaxed pt-2">
                                    Ao assinar, você concorda que leu e aceita nossos
                                    <Link href="/privacidade" className="text-indigo-500 hover:text-indigo-600 px-1">Termos de Uso</Link>
                                    e nossa Política de Privacidade.
                                </p>
                            </div>
                        </div>

                        {/* Footer — Omni Educação + OmniProf */}
                        <div className="mt-6">
                            <OmniEducacaoSignature variant="compact" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="bg-(--omni-bg-primary) min-h-screen flex items-center justify-center">
                <div className="omni-logo-spin">
                    <Image src="/omni_icone.webp" alt="Omnisfera" width={48} height={48} className="object-contain" priority />
                </div>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
