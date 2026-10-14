import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";

export const metadata = {
    title: "Demonstração · Omnisfera",
    description: "Conheça a Omnisfera com dados fictícios.",
};

/**
 * Entrada da demonstração (onda 38: provisória).
 * A escola de demonstração com cadastro curto e escolha de papel chega nas próximas ondas; por enquanto,
 * a página mostra os vídeos e leva ao contato, para nenhum botão da home terminar num erro.
 */
export default function DemonstracaoPage() {
    return (
        <div className="omni-base" style={{ minHeight: "100dvh", background: "var(--fundo)", color: "var(--tinta)", display: "grid", placeItems: "center", paddingInline: 16 }}>
            <main id="conteudo" style={{ maxWidth: 640, display: "grid", gap: 20, justifyItems: "center", textAlign: "center", paddingBlock: 48 }}>
                <SimboloOmnisfera tamanho={88} animado />
                <h1 style={{ margin: 0, font: "800 clamp(28px, 5vw, 40px)/1.1 var(--font-sans)", letterSpacing: "-.03em" }}>
                    A demonstração está quase pronta
                </h1>
                <p style={{ margin: 0, font: "400 18px/28px var(--font-sans)", color: "var(--tinta-2)" }}>
                    Em breve você vai poder entrar numa escola fictícia como professor(a) do AEE, professor(a) regente ou coordenação.
                    Enquanto isso, veja os vídeos de cada papel ou peça uma apresentação com a nossa equipe.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
                    <Link href="/#jornada" className="omni-btn omni-btn--secundario omni-btn--grande">
                        <PlayCircle aria-hidden /> Ver os vídeos
                    </Link>
                    <Link href="/contato" className="omni-btn omni-btn--primario omni-btn--grande">
                        Falar com a equipe <ArrowRight aria-hidden />
                    </Link>
                </div>
            </main>
        </div>
    );
}
