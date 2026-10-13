"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Layers, Brain, Sparkles, ChartLine, NotebookPen, Lock, Accessibility, Zap } from "lucide-react";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import { OmniEducacaoSignature } from "@/components/Footer";

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
// Onda 20: ícones do lucide (antes eram emojis) e cores dos módulos do design system
const MODULES = [
    {
        Icone: GraduationCap,
        title: "PEI — Plano Educacional Individualizado",
        desc: "Construção guiada por inteligência artificial (IA), com barreiras, potencialidades e habilidades da BNCC (Base Nacional Comum Curricular).",
        modulo: "pei",
    },
    {
        Icone: Layers,
        title: "PAEE — Plano de Atendimento Educacional Especializado",
        desc: "Atendimento educacional especializado com relatórios contextualizados.",
        modulo: "paee",
    },
    {
        Icone: Brain,
        title: "Avaliação diagnóstica",
        desc: "Criação de questões com IA, baseadas na BNCC e na matriz do SAEB (Sistema de Avaliação da Educação Básica) e do CAEd (Centro de Políticas Públicas e Avaliação da Educação).",
        modulo: "hub",
    },
    {
        Icone: Sparkles,
        title: "Hub de inclusão",
        desc: "Crie atividades, jogos, mapas mentais e imagens com inteligência artificial.",
        modulo: "hub",
    },
    {
        Icone: ChartLine,
        title: "Monitoramento e evolução",
        desc: "Indicadores, relatórios de progresso e acompanhamento ao longo do tempo.",
        modulo: "monitoramento",
    },
    {
        Icone: NotebookPen,
        title: "Diário de bordo",
        desc: "Registro de observações, evidências e intervenções pedagógicas.",
        modulo: "diario",
    },
];

const ENGINES = [
    { name: "OmniRed", desc: "DeepSeek — raciocínio profundo", color: "var(--encontro-vermelho)" },
    { name: "OmniBlue", desc: "Kimi — textos longos", color: "var(--encontro-azul)" },
    { name: "OmniGreen", desc: "Claude — sensibilidade pedagógica", color: "var(--encontro-verde)" },
    { name: "OmniYellow", desc: "Gemini — imagens e outros formatos", color: "var(--encontro-amarelo)" },
    { name: "OmniOrange", desc: "GPT — leitura de documentos e laudos", color: "var(--encontro-laranja)" },
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

    const h2: React.CSSProperties = { margin: "0 0 16px", font: "800 clamp(28px, 4.5vw, 38px)/1.15 var(--font-sans)", letterSpacing: "-.03em", color: "var(--tinta)" };
    const intro: React.CSSProperties = { margin: "0 auto", maxWidth: "56ch", font: "400 17px/28px var(--font-sans)", color: "var(--tinta-2)" };
    const secao: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "0 16px" };
    const numero: React.CSSProperties = { margin: "0 0 4px", font: "800 40px/1 var(--font-sans)", letterSpacing: "-.03em", fontVariantNumeric: "tabular-nums" };
    const legendaNumero: React.CSSProperties = { margin: 0, font: "600 14px/20px var(--font-sans)", color: "var(--tinta-2)" };

    return (
        <div className="omni-base" style={{ minHeight: "100dvh", background: "var(--fundo)", color: "var(--tinta)" }}>
            <a href="#conteudo" className="omni-pular">Pular para o conteúdo</a>

            {/* ══════ TOPO ══════ */}
            <header className="omni-topo">
                <Link href="/landing" className="omni-topo__marca" aria-label="Omnisfera, página inicial">
                    <SimboloOmnisfera tamanho={34} />
                    <span className="omni-topo__nome" aria-hidden>omnisfera</span>
                </Link>
                <div className="omni-topo__acoes">
                    <Link href="/login" className="omni-btn omni-btn--primario omni-btn--pequeno">
                        Entrar na plataforma
                    </Link>
                </div>
            </header>

            <main id="conteudo">
                {/* ══════ ABERTURA ══════ */}
                <section style={{ position: "relative", overflow: "hidden", isolation: "isolate" }}>
                    {/* círculos de fundo, como no login */}
                    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none" }}>
                        <i style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", opacity: 0.12, background: "var(--encontro-vermelho)", top: -120, left: -80 }} />
                        <i style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", opacity: 0.12, background: "var(--encontro-azul)", bottom: -90, left: "22%" }} />
                        <i style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", opacity: 0.12, background: "var(--encontro-verde)", top: "12%", right: -110 }} />
                        <i style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", opacity: 0.12, background: "var(--encontro-amarelo)", bottom: "12%", right: "18%" }} />
                        <i style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", opacity: 0.12, background: "var(--encontro-roxo)", top: "46%", left: "44%" }} />
                    </div>

                    <div style={{ ...secao, padding: "72px 16px 88px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 24 }}>
                        <SimboloOmnisfera tamanho={120} animado />
                        <span className="omni-estado omni-estado--sucesso">
                            <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sucesso)" }} />
                            Plataforma ativa · 5 motores de IA
                        </span>

                        <h1 style={{ margin: 0, maxWidth: "18ch", font: "800 clamp(36px, 7vw, 64px)/1.05 var(--font-sans)", letterSpacing: "-.04em", color: "var(--tinta)" }}>
                            Educação inclusiva <span style={{ color: "var(--acao)" }}>com inteligência artificial</span>
                        </h1>

                        <p style={{ margin: 0, maxWidth: "52ch", font: "400 clamp(17px, 2.2vw, 20px)/1.6 var(--font-sans)", color: "var(--tinta-2)" }}>
                            A plataforma mais completa do Brasil para a inclusão escolar. PEI, PAEE, avaliações diagnósticas, Hub de atividades e muito mais, tudo integrado com 5 motores de inteligência artificial (IA).
                        </p>

                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
                            <Link href="/login" className="omni-btn omni-btn--primario omni-btn--grande">
                                Começar agora <ArrowRight aria-hidden />
                            </Link>
                            <a href="#modulos" className="omni-btn omni-btn--secundario omni-btn--grande">
                                Conhecer os módulos
                            </a>
                        </div>
                    </div>
                </section>

                {/* ══════ NÚMEROS ══════ */}
                {(stats.schools > 0 || stats.students > 0) && (
                    <section aria-label="A Omnisfera em números" style={{ background: "var(--superficie)", borderBlock: "1px solid var(--borda)" }}>
                        <div style={{ ...secao, maxWidth: 960, padding: "48px 16px", display: "grid", gap: 32, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", textAlign: "center" }}>
                            <div ref={schoolsCounter.ref}>
                                <p style={{ ...numero, color: "var(--encontro-azul-forte)" }}>{schoolsCounter.count}+</p>
                                <p style={legendaNumero}>Escolas cadastradas</p>
                            </div>
                            <div ref={studentsCounter.ref}>
                                <p style={{ ...numero, color: "var(--encontro-verde-forte)" }}>{studentsCounter.count}+</p>
                                <p style={legendaNumero}>Estudantes acompanhados</p>
                            </div>
                            <div ref={peisCounter.ref}>
                                <p style={{ ...numero, color: "var(--encontro-vermelho-forte)" }}>{peisCounter.count}+</p>
                                <p style={legendaNumero}>PEIs construídos com IA</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* ══════ MÓDULOS ══════ */}
                <section id="modulos" aria-labelledby="titulo-modulos" style={{ padding: "80px 0" }}>
                    <div style={secao}>
                        <Reveal>
                            <div style={{ textAlign: "center", marginBottom: 48 }}>
                                <span className="omni-rotulo" style={{ color: "var(--acao)" }}>Módulos</span>
                                <h2 id="titulo-modulos" style={{ ...h2, marginTop: 8 }}>Tudo o que a sua escola precisa</h2>
                                <p style={intro}>
                                    Módulos integrados que cobrem todo o ciclo da inclusão, do planejamento à avaliação.
                                </p>
                            </div>
                        </Reveal>

                        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" }}>
                            {MODULES.map((mod, i) => (
                                <Reveal key={mod.title}>
                                    <div
                                        className={`omni-cartao omni-modulo omni-modulo--${mod.modulo}`}
                                        style={{ height: "100%", transitionDelay: `${i * 80}ms` }}
                                    >
                                        <span className="omni-modulo__selo" aria-hidden>
                                            <mod.Icone />
                                        </span>
                                        <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>{mod.title}</h3>
                                        <p className="omni-cartao__texto" style={{ margin: 0 }}>{mod.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════ MOTORES ══════ */}
                <section aria-labelledby="titulo-motores" style={{ padding: "80px 0", background: "var(--superficie-2)", borderBlock: "1px solid var(--borda)" }}>
                    <div style={{ ...secao, maxWidth: 1000 }}>
                        <Reveal>
                            <div style={{ textAlign: "center", marginBottom: 48 }}>
                                <span className="omni-rotulo" style={{ color: "var(--acao)" }}>Inteligência artificial</span>
                                <h2 id="titulo-motores" style={{ ...h2, marginTop: 8 }}>5 motores de IA</h2>
                                <p style={intro}>
                                    Cada motor é especialista em um aspecto diferente da inclusão. O professor escolhe qual usar em cada situação.
                                </p>
                            </div>
                        </Reveal>

                        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
                            {ENGINES.map((engine) => (
                                <li key={engine.name}>
                                    <Reveal>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: "var(--superficie)", border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)" }}>
                                            <span aria-hidden style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, background: engine.color }} />
                                            <div>
                                                <p style={{ margin: 0, font: "700 15px/20px var(--font-sans)", color: "var(--tinta)" }}>{engine.name}</p>
                                                <p style={{ margin: 0, font: "400 13px/18px var(--font-sans)", color: "var(--tinta-2)" }}>{engine.desc}</p>
                                            </div>
                                        </div>
                                    </Reveal>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* ══════ CONFIANÇA E SEGURANÇA ══════ */}
                <section aria-labelledby="titulo-confianca" style={{ padding: "88px 0" }}>
                    <div style={secao}>
                        <Reveal>
                            <div style={{ textAlign: "center", marginBottom: 48 }}>
                                <span className="omni-rotulo" style={{ color: "var(--acao)" }}>Segurança</span>
                                <h2 id="titulo-confianca" style={{ ...h2, marginTop: 8 }}>Tecnologia em que você pode confiar</h2>
                                <p style={{ ...intro, maxWidth: "62ch" }}>
                                    A Omnisfera cuida de toda a infraestrutura complexa, da privacidade dos dados e da acessibilidade, por trás dos panos, para que os professores foquem 100% no ser humano.
                                </p>
                            </div>
                        </Reveal>

                        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", marginBottom: 32 }}>
                            <Reveal>
                                <div className="omni-cartao omni-modulo omni-modulo--diario" style={{ height: "100%", alignItems: "center", textAlign: "center" }}>
                                    <span className="omni-modulo__selo" aria-hidden><Lock /></span>
                                    <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>Conformidade com a LGPD</h3>
                                    <p className="omni-cartao__texto" style={{ margin: 0 }}>
                                        LGPD é a Lei Geral de Proteção de Dados. Laudos médicos e PDIs (Planos de Desenvolvimento Individual) ficam guardados no Supabase, criptografados, separados por escola e com registro de quem acessou, exportou ou apagou dados.
                                    </p>
                                </div>
                            </Reveal>
                            <Reveal>
                                <div className="omni-cartao omni-modulo omni-modulo--pei" style={{ height: "100%", alignItems: "center", textAlign: "center" }}>
                                    <span className="omni-modulo__selo" aria-hidden><Accessibility /></span>
                                    <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>Acessibilidade como regra (WCAG)</h3>
                                    <p className="omni-cartao__texto" style={{ margin: 0 }}>
                                        Segue as WCAG, diretrizes internacionais de acessibilidade na web. Design pensado desde o início para navegação por teclado e adaptado para pessoas com TDAH (Transtorno do Déficit de Atenção com Hiperatividade) e outras pessoas neurodivergentes.
                                    </p>
                                </div>
                            </Reveal>
                            <Reveal>
                                <div className="omni-cartao omni-modulo omni-modulo--monitoramento" style={{ height: "100%", alignItems: "center", textAlign: "center" }}>
                                    <span className="omni-modulo__selo" aria-hidden><Zap /></span>
                                    <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>Rápida na escola</h3>
                                    <p className="omni-cartao__texto" style={{ margin: 0 }}>
                                        Pensada para abrir rápido mesmo em computadores e conexões de escola, no computador, no tablet ou no celular.
                                    </p>
                                </div>
                            </Reveal>
                        </div>

                        <Reveal>
                            <div style={{ textAlign: "center" }}>
                                <Link href="/seguranca" className="omni-btn omni-btn--discreto">
                                    Saiba mais sobre segurança e privacidade <ArrowRight aria-hidden />
                                </Link>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ══════ CHAMADA FINAL ══════ */}
                <section aria-labelledby="titulo-chamada" style={{ padding: "0 16px 88px" }}>
                    <Reveal>
                        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", padding: "clamp(32px, 6vw, 56px)", background: "var(--noite)", color: "var(--sobre-noite)", borderRadius: "var(--o-radius-xl) var(--o-radius-xl) var(--o-radius-xl) var(--o-radius-xs)", display: "grid", justifyItems: "center", gap: 16 }}>
                            <h2 id="titulo-chamada" style={{ margin: 0, font: "800 clamp(26px, 4vw, 36px)/1.15 var(--font-sans)", letterSpacing: "-.03em", color: "var(--sobre-noite)" }}>
                                Pronto para transformar a inclusão na sua escola?
                            </h2>
                            <p style={{ margin: 0, maxWidth: "56ch", font: "400 17px/28px var(--font-sans)", color: "var(--sobre-noite-2)" }}>
                                Entre na plataforma e comece a construir PEIs, gerar avaliações diagnósticas e criar atividades adaptadas com inteligência artificial.
                            </p>
                            <Link href="/login" className="omni-btn omni-btn--grande" style={{ marginTop: 8, background: "var(--sobre-noite)", color: "var(--noite)" }}>
                                Entrar na Omnisfera <ArrowRight aria-hidden />
                            </Link>
                        </div>
                    </Reveal>
                </section>
            </main>

            {/* ══════ RODAPÉ ══════ */}
            <footer style={{ padding: "24px 16px 32px", borderTop: "1px solid var(--borda)", background: "var(--superficie)" }}>
                <OmniEducacaoSignature variant="full" />
            </footer>
        </div>
    );
}
