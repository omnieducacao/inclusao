import Link from "next/link";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import { FormularioContato } from "@/components/vendas/FormularioContato";

export const metadata = {
    title: "Falar com a equipe · Omnisfera",
    description: "Peça uma apresentação da Omnisfera para a sua escola ou rede.",
};

/** Contato comercial (onda 39). Página pública: está em PUBLIC_PATHS no proxy.ts. */
export default function ContatoPage() {
    return (
        <div className="omni-base" style={{ minHeight: "100dvh", background: "var(--fundo)", color: "var(--tinta)" }}>
            <header className="omni-topo">
                <Link href="/" className="omni-topo__marca" aria-label="Omnisfera, página inicial">
                    <SimboloOmnisfera tamanho={34} />
                    <span className="omni-topo__nome" aria-hidden>omnisfera</span>
                </Link>
                <div className="omni-topo__acoes">
                    <Link href="/demonstracao" className="omni-btn omni-btn--secundario omni-btn--pequeno">Ver a demonstração</Link>
                </div>
            </header>
            <main id="conteudo" style={{ maxWidth: 880, margin: "0 auto", paddingInline: 16, paddingBlock: "48px 72px", display: "grid", gap: 28 }}>
                <div style={{ display: "grid", gap: 12 }}>
                    <span style={{ font: "500 12px/16px var(--font-mono)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--acao)" }}>Falar com a equipe</span>
                    <h1 style={{ margin: 0, font: "800 clamp(30px, 5vw, 44px)/1.1 var(--font-sans)", letterSpacing: "-.03em", textWrap: "balance" }}>
                        Conte como está a inclusão na sua escola
                    </h1>
                    <p style={{ margin: 0, maxWidth: "60ch", font: "400 18px/28px var(--font-sans)", color: "var(--tinta-2)" }}>
                        A nossa equipe responde com uma apresentação da Omnisfera e uma proposta de acordo com o tamanho da escola ou da rede.
                    </p>
                </div>
                <section className="omni-cartao" aria-label="Formulário de contato" style={{ padding: "clamp(20px, 4vw, 32px)" }}>
                    <FormularioContato textoBotao="Enviar pedido" />
                </section>
            </main>
        </div>
    );
}
