/**
 * Rodapé com assinatura Omnisfera Soluções Educacionais + link OmniProf + Política de Privacidade
 * Reutilizado no dashboard, home e login.
 * Onda 20: levado ao design system (tokens e classes omni-*), sem classes de cor do Tailwind.
 */
import Link from "next/link";
import { ExternalLink, ShieldCheck, Accessibility, UserX as Gauge } from "lucide-react";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";

export function OmniEducacaoSignature({ variant = "full" }: { variant?: "full" | "compact" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: variant === "full" ? 16 : 12 }}>
      {/* Empresa (Omnisfera Soluções Educacionais) + "Conheça também" + OmniProf */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "16px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <SimboloOmnisfera tamanho={30} rotulo="Omnisfera" />
          <span style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <span style={{ font: "700 13px/18px var(--font-sans)", color: "var(--tinta)" }}>Omnisfera</span>
            <span style={{ font: "400 12px/16px var(--font-sans)", color: "var(--tinta-2)" }}>Soluções Educacionais</span>
          </span>
        </div>

        <a
          href="https://omniprof.net"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conheça também o OmniProf, ferramentas de inteligência artificial para professores (abre em nova aba)"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 16px",
            background: "var(--superficie-2)",
            border: "1px solid var(--borda)",
            borderRadius: "18px 40px 18px 4px",
            textDecoration: "none",
            color: "var(--tinta-2)",
          }}
        >
          <span className="omni-rotulo" style={{ fontSize: 11, color: "var(--tinta-2)" }}>Conheça também</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/omniprof_logo_flat_horizontal.webp" alt="OmniProf" style={{ height: 24, width: "auto", objectFit: "contain" }} />
          <ExternalLink aria-hidden style={{ width: 14, height: 14, flexShrink: 0 }} />
        </a>
      </div>

      {/* Selos + links + direitos (apenas no variant full) */}
      {variant === "full" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 8 }}>
          <ul aria-label="Compromissos da plataforma" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            <li className="omni-estado omni-estado--sucesso" style={{ whiteSpace: "normal" }}>
              <ShieldCheck aria-hidden /> Adequada à LGPD (Lei Geral de Proteção de Dados)
            </li>
            <li className="omni-estado omni-estado--info" style={{ whiteSpace: "normal" }}>
              <Accessibility aria-hidden /> Segue as diretrizes de acessibilidade WCAG (padrão internacional para a web)
            </li>
            <li className="omni-estado omni-estado--neutro" style={{ whiteSpace: "normal" }}>
              <Gauge aria-hidden /> IA sem o nome do estudante
            </li>
          </ul>

          <nav aria-label="Rodapé" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px 16px", font: "400 13px/18px var(--font-sans)", color: "var(--tinta-2)" }}>
            <Link href="/privacidade" style={{ color: "var(--tinta-2)" }}>Privacidade</Link>
            <span aria-hidden style={{ opacity: 0.4 }}>•</span>
            <Link href="/seguranca" style={{ color: "var(--tinta-2)", fontWeight: 700 }}>Segurança e transparência</Link>
            <span aria-hidden style={{ opacity: 0.4 }}>•</span>
            <span>© {new Date().getFullYear()} Omnisfera Soluções Educacionais Ltda.</span>
          </nav>
        </div>
      )}
    </div>
  );
}

export function Footer() {
  return (
    <footer style={{ marginTop: "auto", paddingTop: 32, paddingBottom: 24, borderTop: "1px solid var(--borda)" }}>
      {/* Aviso sobre IA */}
      <div style={{ width: "100%", marginBottom: 20, padding: "10px 24px", textAlign: "center", background: "var(--superficie-2)", borderTop: "1px solid var(--borda)", borderBottom: "1px solid var(--borda)" }}>
        <p className="omni-apoio" style={{ margin: 0, fontSize: 13 }}>
          A Omnisfera usa inteligência artificial (IA) para apoiar a sua prática. Essas ferramentas podem errar. Por isso,{" "}
          <strong style={{ color: "var(--tinta)" }}>revise sempre com muito cuidado</strong> todo conteúdo gerado: os dados da educação inclusiva são sensíveis.
        </p>
      </div>
      {/* Assinatura + OmniProf */}
      <div style={{ padding: "0 24px" }}>
        <OmniEducacaoSignature variant="full" />
      </div>
    </footer>
  );
}
