import { Shield, Lock, Server, CheckCircle2, Baseline, HeartHandshake } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SegurancaPage() {
    return (
        <div className="min-h-dvh flex flex-col bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/landing" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image
                            src="/omni_icone.webp"
                            alt="Omnisfera"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <span className="text-xl font-bold tracking-tight text-slate-800">
                            Omnisfera
                        </span>
                    </Link>
                    <Link
                        href="/login"
                        className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Entrar na Plataforma
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <main className="flex-1">
                <section className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-700 rounded-2xl mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Segurança e Confiança
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                        Nós cuidamos da infraestrutura, da proteção de dados (LGPD) e da performance técnica
                        para que sua escola possa focar no que realmente importa: a inclusão dos estudantes.
                    </p>
                </section>

                {/* Pilares */}
                <section className="py-16 px-6 bg-white border-y border-slate-100">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* LGPD */}
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-shadow">
                            <Lock className="w-10 h-10 text-indigo-600 mb-6" />
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                Proteção de Dados (LGPD)
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Os laudos e dados sensíveis dos alunos são protegidos em nuvem com criptografia de ponta a ponta (Supabase).
                            </p>
                            <ul className="space-y-2 text-sm text-slate-700 font-medium">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Logs de auditoria rigorosos
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Banco isolado
                                </li>
                            </ul>
                        </div>

                        {/* Performance */}
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-shadow">
                            <Server className="w-10 h-10 text-sky-500 mb-6" />
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                Performance Enterprise
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Construída com a mais nova tecnologia (Next.js v16), a Omnisfera carrega módulos
                                institucionais complexos em menos de 1 segundo (FCP 1.1s).
                            </p>
                            <ul className="space-y-2 text-sm text-slate-700 font-medium">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Certificado 100/100 Best Practices
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sem carregamentos lentos
                                </li>
                            </ul>
                        </div>

                        {/* Acessibilidade */}
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-shadow">
                            <Baseline className="w-10 h-10 text-emerald-500 mb-6" />
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                100% Acessível (WCAG AAA)
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Design aprovado nas métricas internacionais de acessibilidade web. Contraste perfeito
                                e navegação inclusiva para diretores e professores.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-700 font-medium">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Contraste Aprovado (A11y 100/100)
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Design System Inclusivo
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-6 max-w-4xl mx-auto text-center">
                    <HeartHandshake className="w-12 h-12 text-rose-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        Transparência é Inclusão
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-10">
                        Nossos modelos de Inteligência Artificial (DeepSeek, Kimi, Claude, Gemini, OpenAI) são
                        orquestrados por um Firewall estrito. Seus "prompts" educacionais, ao construírem o PEI,
                        não são usados para treinar IAs públicas. O foco é exclusivo no aluno.
                    </p>
                    <Link
                        href="/landing"
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                        Voltar para a Página Inicial
                    </Link>
                </section>
            </main>

            {/* Footer super limpo */}
            <footer className="py-10 text-center border-t border-slate-200 text-slate-500 text-sm">
                <p>© {new Date().getFullYear()} OmniEducação. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}
