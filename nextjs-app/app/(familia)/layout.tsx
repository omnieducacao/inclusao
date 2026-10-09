import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Footer } from "@/components/Footer";
import { AnnouncementModal } from "@/components/AnnouncementModal";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import { FaixaSimulacaoFamilia } from "@/components/familia/FaixaSimulacaoFamilia";

/** Área da família no design system (10/10/2026): o mesmo topo, tema e cores do resto da Omnisfera. */
export default async function FamiliaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user_role !== "family") redirect("/");

  return (
    <div className="omni-base" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--fundo)" }}>
      {session.original_master_session && <FaixaSimulacaoFamilia nome={session.simulating_member_name || session.usuario_nome} />}
      <header className="omni-topo">
        <Link href="/familia" aria-label="Omnisfera, área da família" className="omni-topo__marca">
          <SimboloOmnisfera tamanho={34} animacao="hover" />
          <span className="omni-topo__nome">omnisfera</span>
        </Link>
        <span className="omni-rotulo" style={{ margin: 0 }}>Família</span>
        <div className="omni-topo__acoes">
          <span className="omni-apoio" style={{ margin: 0 }}>{session.usuario_nome}</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="omni-btn omni-btn--discreto omni-btn--pequeno">Sair</button>
          </form>
        </div>
      </header>

      <main id="conteudo" style={{ flex: 1, width: "100%", maxWidth: 1120, margin: "0 auto", padding: "24px 20px 40px" }}>{children}</main>

      <AnnouncementModal />
      <div style={{ padding: "0 20px" }}><Footer /></div>
    </div>
  );
}
