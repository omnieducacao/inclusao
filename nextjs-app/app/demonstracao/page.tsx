import Link from "next/link";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import { EntradaDemo } from "./EntradaDemo";

export const metadata = {
    title: "Demonstração · Omnisfera",
    description: "Entre numa escola fictícia e veja a Omnisfera funcionando, como professor do AEE, professor regente ou coordenação.",
};

/** Entrada da demonstração (onda 44): cadastro curto (vira contato) + escolha do papel → Escola Demo, só leitura. */
export default function DemonstracaoPage() {
    return (
        <div className="omni-base" style={{ minHeight: "100dvh", background: "var(--fundo)", color: "var(--tinta)" }}>
            <header className="omni-topo">
                <Link href="/" className="omni-topo__marca" aria-label="Omnisfera, página inicial">
                    <SimboloOmnisfera tamanho={34} />
                    <span className="omni-topo__nome" aria-hidden>omnisfera</span>
                </Link>
                <div className="omni-topo__acoes">
                    <Link href="/contato" className="omni-btn omni-btn--discreto omni-btn--pequeno">Falar com a equipe</Link>
                </div>
            </header>
            <main id="conteudo" style={{ maxWidth: 940, margin: "0 auto", paddingInline: 16, paddingBlock: "40px 72px", display: "grid", gap: 28 }}>
                <div style={{ display: "grid", gap: 12 }}>
                    <span style={{ font: "500 12px/16px var(--font-mono)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--acao)" }}>Demonstração</span>
                    <h1 style={{ margin: 0, font: "800 clamp(30px, 5vw, 46px)/1.08 var(--font-sans)", letterSpacing: "-.035em", textWrap: "balance" }}>
                        Entre numa escola fictícia e use a Omnisfera como quem está lá todo dia
                    </h1>
                    <p style={{ margin: 0, maxWidth: "62ch", font: "400 18px/28px var(--font-sans)", color: "var(--tinta-2)" }}>
                        A Escola Demo tem quatro estudantes fictícios com a jornada completa: estudo de caso, PEI, PAEE, diário, avaliações e evolução.
                        Você navega por tudo; nada do que fizer é salvo. A visita dura até 3 horas.
                    </p>
                </div>
                <EntradaDemo />
            </main>
        </div>
    );
}
