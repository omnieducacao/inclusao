"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type LandingProps = {
    stats: { schools: number; students: number; peis: number };
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Animated counter hook                                    */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function useAnimatedCounter(target: number, duration = 2000) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (target === 0) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                let start = 0;
                const step = Math.max(1, Math.ceil(target / (duration / 16)));
                const timer = setInterval(() => {
                    start += step;
                    if (start >= target) {
                        setCount(target);
                        clearInterval(timer);
                    } else {
                        setCount(start);
                    }
                }, 16);
                observer.disconnect();
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return { count, ref };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Modules data                                             */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const MODULES = [
    {
        icon: "🎓",
        title: "PEI — Plano Educacional Individual",
        desc: "Construção guiada por IA com barreiras, potencialidades e habilidades BNCC.",
        color: "#6366f1",
    },
    {
        icon: "🧩",
        title: "PAEE — Plano de Ação",
        desc: "Atendimento educacional especializado com relatórios contextualizados.",
        color: "#ec4899",
    },
    {
        icon: "🧠",
        title: "Avaliação Diagnóstica",
        desc: "Geração de itens com IA baseados na BNCC e matriz SAEB/CAEd.",
        color: "#f59e0b",
    },
    {
        icon: "🚀",
        title: "Hub de Inclusão",
        desc: "Crie atividades, jogos, mapas mentais e imagens com inteligência artificial.",
        color: "#10b981",
    },
    {
        icon: "📊",
        title: "Monitoramento e Evolução",
        desc: "Indicadores, relatórios de progresso e acompanhamento longitudinal.",
        color: "#0ea5e9",
    },
    {
        icon: "📔",
        title: "Diário de Bordo",
        desc: "Registro de observações, evidências e intervenções pedagógicas.",
        color: "#8b5cf6",
    },
];

const ENGINES = [
    { name: "OmniRed", desc: "DeepSeek — Raciocínio profundo", color: "#ef4444" },
    { name: "OmniBlue", desc: "Kimi — Contexto longo", color: "#3b82f6" },
    { name: "OmniGreen", desc: "Claude — Sensibilidade pedagógica", color: "#22c55e" },
    { name: "OmniYellow", desc: "Gemini — Multimodal e imagens", color: "#eab308" },
    { name: "OmniOrange", desc: "GPT — Parsing e laudos", color: "#f97316" },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Scroll-reveal wrapper                                    */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
            }}
        >
            {children}
        </div>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Main Component                                           */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function LandingClient({ stats }: LandingProps) {
    const schoolsCounter = useAnimatedCounter(stats.schools);
    const studentsCounter = useAnimatedCounter(stats.students);
    const peisCounter = useAnimatedCounter(stats.peis);

    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
            {/* ══════ NAVBAR ══════ */}
            <nav
                className="sticky top-0 z-50 backdrop-blur-xl border-b"
                style={{
                    background: "color-mix(in srgb, var(--bg-primary) 80%, transparent)",
                    borderColor: "var(--border-default)",
                }}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/omni_icone.webp"
                            alt="Omnisfera"
                            width={36}
                            height={36}
                            className="rounded-lg"
                        />
                        <span
                            className="text-xl font-bold tracking-tight"
                            style={{ color: "var(--text-primary)" }}
                        >
                            OmniProf
                        </span>
                    </div>
                    <Link
                        href="/login"
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                        style={{
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                        }}
                    >
                        Entrar na Plataforma
                    </Link>
                </div>
            </nav>

            {/* ══════ HERO B2C (Professores) ══════ */}
            <section className="relative overflow-hidden">
                {/* Background gradient orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    />
                    <div
                        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
                        style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
                    />
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
                        style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 flex flex-col items-center text-center">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8 transition-transform hover:scale-105 cursor-default"
                        style={{
                            background: "color-mix(in srgb, #6366f1 12%, transparent)",
                            color: "#818cf8",
                            border: "1px solid color-mix(in srgb, #6366f1 25%, transparent)",
                        }}
                    >
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        A inteligência artificial feita para Professores
                    </div>

                    <h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-4xl"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Acabe com a burocracia do seu planejamento em{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, #6366f1, #ec4899, #f59e0b)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            poucos minutos com IA
                        </span>
                    </h1>

                    <p
                        className="text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        A versão focada no Professor da plataforma mais completa do Brasil. PEI, PAEE,
                        avaliações diagnósticas e ferramentas de Inclusão, pagas do seu bolso sem burocracia.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/login"
                            className="px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            style={{
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                boxShadow: "0 8px 32px rgba(99, 102, 241, 0.35)",
                            }}
                        >
                            <svg className="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Experimentar Grátis
                        </Link>
                        <a
                            href="#precos"
                            className="px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105 flex items-center justify-center"
                            style={{
                                color: "var(--text-primary)",
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-default)",
                            }}
                        >
                            Ver Planos e Preços
                        </a>
                    </div>
                </div>
            </section>

            {/* ══════ STATS ══════ */}
            {(stats.schools > 0 || stats.students > 0) && (
                <section
                    className="border-y"
                    style={{
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border-default)",
                    }}
                >
                    <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                        <div ref={schoolsCounter.ref}>
                            <p
                                className="text-4xl font-extrabold mb-1"
                                style={{ color: "#6366f1" }}
                            >
                                {schoolsCounter.count}+
                            </p>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Professores ativos
                            </p>
                        </div>
                        <div ref={studentsCounter.ref}>
                            <p
                                className="text-4xl font-extrabold mb-1"
                                style={{ color: "#059669" }}
                            >
                                {studentsCounter.count}+
                            </p>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Horas de trabalho salvas
                            </p>
                        </div>
                        <div ref={peisCounter.ref}>
                            <p
                                className="text-4xl font-extrabold mb-1"
                                style={{ color: "#ec4899" }}
                            >
                                {peisCounter.count}+
                            </p>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Planejamentos criados por IA
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* ══════ MÓDULOS ══════ */}
            <section id="modulos" className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal>
                        <div className="text-center mb-14">
                            <h2
                                className="text-3xl sm:text-4xl font-extrabold mb-4"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Tudo que sua escola precisa
                            </h2>
                            <p
                                className="text-base sm:text-lg max-w-xl mx-auto"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Módulos integrados que cobrem todo o ciclo da inclusão — do
                                planejamento à avaliação.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MODULES.map((mod, i) => (
                            <Reveal key={mod.title}>
                                <div
                                    className="group rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl"
                                    style={{
                                        background: "var(--bg-secondary)",
                                        border: "1px solid var(--border-default)",
                                        transitionDelay: `${i * 80}ms`,
                                    }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                                        style={{
                                            background: `color-mix(in srgb, ${mod.color} 12%, transparent)`,
                                        }}
                                    >
                                        {mod.icon}
                                    </div>
                                    <h3
                                        className="text-base font-bold mb-2"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        {mod.title}
                                    </h3>
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        {mod.desc}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════ ENGINES ══════ */}
            <section
                className="py-20"
                style={{ background: "var(--bg-secondary)" }}
            >
                <div className="max-w-5xl mx-auto px-6">
                    <Reveal>
                        <div className="text-center mb-14">
                            <h2
                                className="text-3xl sm:text-4xl font-extrabold mb-4"
                                style={{ color: "var(--text-primary)" }}
                            >
                                5 Motores de IA
                            </h2>
                            <p
                                className="text-base sm:text-lg max-w-xl mx-auto"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Cada motor é especialista em um aspecto diferente da inclusão.
                                O professor escolhe qual usar em cada contexto.
                            </p>
                        </div>
                    </Reveal>

                    <div className="flex flex-wrap justify-center gap-4">
                        {ENGINES.map((engine) => (
                            <Reveal key={engine.name}>
                                <div
                                    className="flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all hover:scale-105"
                                    style={{
                                        background: "var(--bg-primary)",
                                        border: "1px solid var(--border-default)",
                                    }}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ background: engine.color }}
                                    />
                                    <div>
                                        <p
                                            className="text-sm font-bold"
                                            style={{ color: "var(--text-primary)" }}
                                        >
                                            {engine.name}
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{ color: "var(--text-tertiary)" }}
                                        >
                                            {engine.desc}
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════ TRUST & SECURITY ══════ */}
            <section className="py-24 border-y border-slate-200/50" style={{ background: "var(--bg-primary)" }}>
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "var(--text-primary)" }}>
                                Tecnologia em que você pode confiar
                            </h2>
                            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                                A Omnisfera cuida de toda infraestrutura complexa, privacidade de dados e acessibilidade
                                por trás dos panos para que os professores foquem 100% no ser humano.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <Reveal>
                            <div className="flex flex-col items-center text-center p-6">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Conformidade LGPD</h3>
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Laudos médicos e PDI's totalmente resguardados no Supabase e logs de auditoria contínuos.</p>
                            </div>
                        </Reveal>
                        <Reveal>
                            <div className="flex flex-col items-center text-center p-6">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>100/100 Acessível (WCAG)</h3>
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Design pensado nativamente para navegação por teclado e otimizado para TDAH e neurodivergentes.</p>
                            </div>
                        </Reveal>
                        <Reveal>
                            <div className="flex flex-col items-center text-center p-6">
                                <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Seu Próprio Workspace</h3>
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>O OmniProf provisiona um ambiente particular seu na nuvem, desvinculado de secretarias ou diretores.</p>
                            </div>
                        </Reveal>
                    </div>

                    <Reveal>
                        <div className="text-center mt-8">
                            <Link href="/seguranca" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center justify-center gap-2">
                                Saiba mais sobre nosso escudo de Proteção e Privacidade →
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ══════ TESTIMONIALS (Social Proof) ══════ */}
            <section className="py-20" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "var(--text-primary)" }}>
                                O que dizem os professores
                            </h2>
                            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                                Profissionais reais que transformaram sua rotina e voltaram a ter finais de semana livres com nossa inteligência artificial.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Reveal>
                            <div className="p-8 rounded-3xl" style={{ background: "var(--bg-primary)", border: "1px solid var(--border-default)" }}>
                                <div className="flex text-amber-400 mb-4">{"★".repeat(5)}</div>
                                <p className="text-base italic mb-6 leading-relaxed" style={{ color: "var(--text-primary)" }}>
                                    "Antes eu passava o domingo inteiro montando provas adaptadas. Hoje, com o OmniProf, eu gero provas inteiras com a mesma matriz em menos de 5 minutos, e fica sensacional."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">A</div>
                                    <div>
                                        <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Ana Silveira</p>
                                        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Professora Fundamental I</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                        <Reveal>
                            <div className="p-8 rounded-3xl relative overflow-hidden" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
                                <div className="flex text-amber-300 mb-4">{"★".repeat(5)}</div>
                                <p className="text-base italic mb-6 leading-relaxed text-white/90">
                                    "O Plano Educacional Individual (PEI) virou outra coisa. A IA cruza o laudo com a BNCC e me entrega um documento de 6 páginas extremamente assertivo. Surreal."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold uppercase">C</div>
                                    <div>
                                        <p className="font-bold text-sm text-white">Carlos Eduardo</p>
                                        <p className="text-xs text-indigo-200">Educador Especial</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                        <Reveal>
                            <div className="p-8 rounded-3xl" style={{ background: "var(--bg-primary)", border: "1px solid var(--border-default)" }}>
                                <div className="flex text-amber-400 mb-4">{"★".repeat(5)}</div>
                                <p className="text-base italic mb-6 leading-relaxed" style={{ color: "var(--text-primary)" }}>
                                    "As tabelas de planejamento do plano de curso são minha salvação. Ele alinha os códigos da BNCC exatos que eu preciso e sugere metodologias ativas perfeitas pra minha turma."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold uppercase">M</div>
                                    <div>
                                        <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Mariana Souza</p>
                                        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Prof. de História</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ══════ PRICING ══════ */}
            <section id="precos" className="py-24" style={{ background: "var(--bg-primary)" }}>
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "var(--text-primary)" }}>
                                Invista no seu <span style={{ color: "#6366f1" }}>tempo livre</span>
                            </h2>
                            <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                                Planos simples e acessíveis, pensados para o bolso do educador brasileiro. Cancele quando quiser.
                            </p>
                        </div>
                    </Reveal>

                    <div className="max-w-md mx-auto">
                        <Reveal>
                            <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: "var(--bg-secondary)", border: "2px solid #6366f1", boxShadow: "0 10px 40px -10px rgba(99, 102, 241, 0.4)" }}>
                                {/* Popular Badge */}
                                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">MAIS ESCOLHIDO</div>

                                <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Plano Prof</h3>
                                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Tudo que você precisa para automatizar seu ano letivo inteiro.</p>

                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-5xl font-extrabold" style={{ color: "var(--text-primary)" }}>R$39</span>
                                    <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>,90</span>
                                    <span className="text-sm ml-1" style={{ color: "var(--text-secondary)" }}>/mês</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {[
                                        "5 motores de IA ilimitados (DeepSeek, GPT-4o, etc)",
                                        "Importação de Laudos Médicos simplificada",
                                        "Geração de PEIs",
                                        "Provas e Avaliações Diagnósticas com 1 clique",
                                        "Planos de Curso e Aulas alinhados à BNCC",
                                        "Acesso antecipado a novas Ferramentas do Hub"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/register" className="block w-full text-center py-4 rounded-xl text-white font-bold transition-all hover:scale-105 active:scale-95" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                                    Assinar Agora e Começar
                                </Link>
                                <p className="text-center text-xs mt-4" style={{ color: "var(--text-tertiary)" }}>
                                    7 dias grátis para testar. Garantia incondicional.
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ══════ CTA FINAL ══════ */}
            <section className="py-24 border-t" style={{ borderColor: "var(--border-default)" }}>
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <Reveal>
                        <h2
                            className="text-3xl sm:text-4xl font-extrabold mb-6"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Pronto para transformar a inclusão na sua escola?
                        </h2>
                        <p
                            className="text-lg mb-10"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Entre na plataforma e comece a construir PEIs, gerar avaliações
                            diagnósticas e criar atividades adaptadas com inteligência artificial hoje mesmo.
                        </p>
                        <Link
                            href="/register"
                            className="inline-block px-10 py-5 rounded-2xl text-lg font-bold text-white transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                                boxShadow: "0 8px 40px rgba(99, 102, 241, 0.4)",
                            }}
                        >
                            Entrar no OmniProf →
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* ══════ FOOTER ══════ */}
            <footer
                className="border-t py-8"
                style={{
                    background: "var(--bg-secondary)",
                    borderColor: "var(--border-default)",
                }}
            >
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/omni_icone.webp"
                            alt="OmniEducação"
                            width={24}
                            height={24}
                            className="rounded-md opacity-60"
                        />
                        <span
                            className="text-sm"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            © {new Date().getFullYear()} OmniEducação. Todos os direitos reservados.
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/privacidade"
                            className="text-sm hover:underline"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            Privacidade
                        </Link>
                        <Link
                            href="/login"
                            className="text-sm font-medium hover:underline"
                            style={{ color: "#4f46e5" }}
                        >
                            Entrar
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
