/**
 * Segurança e transparência — página pública, acessível sem login.
 * Onda 20: levada ao design system, com a mesma identidade do login (fundo, marca, círculos e cartões).
 * O conteúdo é o mesmo de antes; só foi reorganizado e revisado no português (sem termos em inglês).
 * SCRUM-71 (23/10/2026): só afirma o que o código faz. Se mudar a criptografia (lib/encryption.ts),
 * a auditoria (lib/audit.ts) ou os motores de IA (lib/ai-engines.ts), revise este texto.
 * SCRUM-231: o que é cifrado está em lib/colunas-cifradas.ts e lib/encryption.ts (SENSITIVE_PEI_FIELDS).
 */
import { Shield, Lock, Server, CheckCircle2, Baseline, HeartHandshake, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import { OmniEducacaoSignature } from "@/components/Footer";

export const metadata = {
    title: "Segurança e transparência | Omnisfera",
    description: "Como a Omnisfera protege os dados, cuida da acessibilidade e usa inteligência artificial com transparência.",
};

const PILARES = [
    {
        Icone: Lock,
        modulo: "pei",
        titulo: "Proteção de dados (LGPD)",
        texto: "A própria plataforma cifra, antes de ir para o banco, o nome do estudante e os dados de saúde (diagnóstico, laudos, medicação e mensagens com a família), além dos e-mails e telefones da equipe e das famílias. Toda conexão é segura (HTTPS). Cada escola só enxerga os próprios estudantes, e cada pessoa só vê o que o seu papel permite.",
        itens: [
            "O login encontra a conta por um código derivado do e-mail, sem guardar o e-mail aberto",
            "Os registros de acesso guardam só um resumo do endereço de rede (IP), nunca o endereço",
            "Registro de exportações e de exclusões de dados",
            "Cópia no Google Drive só quando a escola permite, com aviso e registro de quem salvou",
            "Exportar e apagar dados de um membro a pedido (direitos da LGPD)",
        ],
    },
    {
        Icone: Server,
        modulo: "diario",
        titulo: "Rápida e estável",
        texto: "Construída com tecnologia atual (Next.js), a Omnisfera é pensada para abrir rápido mesmo em conexões de escola, com o conteúdo principal carregado primeiro.",
        itens: ["Testes automáticos a cada atualização", "Funciona no computador, no tablet e no celular"],
    },
    {
        Icone: Baseline,
        modulo: "hub",
        titulo: "Acessibilidade como regra",
        texto: "O design segue as diretrizes internacionais de acessibilidade na web (WCAG, as diretrizes de acessibilidade para conteúdo web), com meta no nível AA: contraste adequado, navegação por teclado e leitores de tela.",
        itens: ["Menu de acessibilidade: alto contraste e fonte mais legível", "Sistema de design inclusivo"],
    },
] as const;

export default function SegurancaPage() {
    return (
        <div className="omni-base" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--fundo)", color: "var(--tinta)" }}>
            <a href="#conteudo" className="omni-pular">Pular para o conteúdo</a>

            <header className="omni-topo">
                <Link href="/" className="omni-topo__marca" aria-label="Omnisfera, página inicial">
                    <SimboloOmnisfera tamanho={34} />
                    <span className="omni-topo__nome" aria-hidden>omnisfera</span>
                </Link>
                <div className="omni-topo__acoes">
                    <Link href="/login" className="omni-btn omni-btn--primario omni-btn--pequeno">Entrar na plataforma</Link>
                </div>
            </header>

            <main id="conteudo" style={{ flex: 1 }}>
                {/* Abertura */}
                <section style={{ position: "relative", overflow: "hidden", isolation: "isolate", padding: "64px 16px 56px" }}>
                    {/* círculos de fundo, como no login */}
                    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none" }}>
                        <i style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", opacity: 0.12, background: "var(--encontro-vermelho)", top: -120, left: -80 }} />
                        <i style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", opacity: 0.12, background: "var(--encontro-verde)", top: "10%", right: -100 }} />
                        <i style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", opacity: 0.12, background: "var(--encontro-amarelo)", bottom: -60, left: "30%" }} />
                    </div>
                    <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", display: "grid", justifyItems: "center", gap: 16 }}>
                        <span aria-hidden style={{ width: 64, height: 64, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--encontro-verde)", color: "var(--sobre-encontro)" }}>
                            <Shield style={{ width: 30, height: 30 }} />
                        </span>
                        <span className="omni-rotulo" style={{ color: "var(--acao)" }}>Segurança e transparência</span>
                        <h1 style={{ margin: 0, font: "800 clamp(32px, 6vw, 52px)/1.08 var(--font-sans)", letterSpacing: "-.035em", color: "var(--tinta)" }}>
                            Segurança e confiança
                        </h1>
                        <p style={{ margin: 0, maxWidth: "60ch", font: "400 18px/29px var(--font-sans)", color: "var(--tinta-2)" }}>
                            Nós cuidamos da infraestrutura, da proteção de dados (de acordo com a LGPD, a Lei Geral de Proteção de Dados) e do desempenho técnico, para que a sua escola possa focar no que realmente importa: a inclusão dos estudantes.
                        </p>
                    </div>
                </section>

                {/* Pilares */}
                <section aria-label="Nossos pilares" style={{ padding: "48px 16px", background: "var(--superficie-2)", borderBlock: "1px solid var(--borda)" }}>
                    <ul style={{ listStyle: "none", margin: "0 auto", padding: 0, maxWidth: 1120, display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" }}>
                        {PILARES.map(({ Icone, modulo, titulo, texto, itens }) => (
                            <li key={titulo} className={`omni-cartao omni-modulo omni-modulo--${modulo}`} style={{ gap: 16, padding: "clamp(20px, 3vw, 32px)" }}>
                                <span className="omni-modulo__selo" aria-hidden><Icone /></span>
                                <h2 style={{ margin: 0, font: "800 20px/26px var(--font-sans)", letterSpacing: "-.015em", color: "var(--tinta)" }}>{titulo}</h2>
                                <p className="omni-cartao__texto" style={{ margin: 0 }}>{texto}</p>
                                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                                    {itens.map((item) => (
                                        <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, font: "600 14px/20px var(--font-sans)", color: "var(--tinta)" }}>
                                            <CheckCircle2 aria-hidden style={{ width: 18, height: 18, flexShrink: 0, color: "var(--sucesso)" }} /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Transparência */}
                <section style={{ padding: "64px 16px", maxWidth: 760, margin: "0 auto", textAlign: "center", display: "grid", justifyItems: "center", gap: 16 }}>
                    <span aria-hidden style={{ width: 56, height: 56, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--encontro-vermelho)", color: "var(--sobre-encontro-claro)" }}>
                        <HeartHandshake style={{ width: 28, height: 28 }} />
                    </span>
                    <h2 style={{ margin: 0, font: "800 clamp(26px, 4vw, 34px)/1.15 var(--font-sans)", letterSpacing: "-.025em", color: "var(--tinta)" }}>
                        Transparência é inclusão
                    </h2>
                    <p style={{ margin: 0, font: "400 17px/28px var(--font-sans)", color: "var(--tinta-2)" }}>
                        A Omnisfera usa modelos de inteligência artificial (IA) de vários fornecedores. Pedidos com informações de um estudante só vão para o Omni IA, um modelo aberto que roda na Fireworks AI, nos Estados Unidos, com retenção zero: o fornecedor não guarda o pedido nem a resposta e não treina modelos com eles. Os outros fornecedores (DeepSeek, Kimi, OpenAI, Google e Anthropic) só recebem pedidos sem dados de estudante. Antes de sair, o nome do estudante e dados como CPF, telefone, e-mail, data de nascimento e nomes de responsáveis e profissionais são trocados por códigos, que voltam só na resposta, dentro da plataforma. O que a sugestão precisa, como o diagnóstico e as metas do PEI, pode seguir no pedido. A exceção são as fotos de laudo, que vão ao Google ou à OpenAI para leitura, porque o Omni IA não lê imagens. Antes, a foto perde os metadados (local e aparelho), e a tela pede que o cabeçalho com o nome seja recortado; a foto não fica guardada. A outra exceção é a imagem do mapa mental da jornada gamificada (PAEE): o roteiro da jornada vai ao Google, sem o nome do estudante, porque o Omni IA não desenha imagens. E todo conteúdo da IA é uma sugestão: a professora revisa antes de usar.
                    </p>
                    <Link href="/" className="omni-btn omni-btn--secundario omni-btn--grande" style={{ marginTop: 16 }}>
                        <ArrowLeft aria-hidden /> Voltar para a página inicial
                    </Link>
                </section>
            </main>

            <footer style={{ padding: "24px 16px 32px", borderTop: "1px solid var(--borda)", background: "var(--superficie)" }}>
                <OmniEducacaoSignature variant="full" />
            </footer>
        </div>
    );
}
