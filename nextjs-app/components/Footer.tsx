/**
 * Rodapé com assinatura Omnisfera Soluções Educacionais + link OmniProf + Política de Privacidade
 * Reutilizado no dashboard, home e login.
 */
import Link from "next/link";
import Image from "next/image";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
export function OmniEducacaoSignature({ variant = "full" }: { variant?: "full" | "compact" }) {
  return (
    <div className={`flex flex-col ${variant === "full" ? "gap-4" : "gap-3"}`}>
      {/* Empresa (Omnisfera Soluções Educacionais) + "Conheça também" + OmniProf */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <div className="flex items-center gap-2.5 shrink-0">
          <SimboloOmnisfera tamanho={30} rotulo="Omnisfera" />
          <span className="flex flex-col leading-tight text-left">
            <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary, #1b2a4a)' }}>Omnisfera</span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted, #5d6a80)' }}>Soluções Educacionais</span>
          </span>
        </div>

        <a
          href="https://omniprof.net"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conheça também o OmniProf, ferramentas de inteligência artificial para professores"
          className="flex items-center gap-3 px-4 py-2 transition-transform duration-200 hover:-translate-y-0.5"
          style={{ background: '#f3fafe', borderRadius: '18px 40px 18px 4px' }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#44596a' }}>Conheça também</span>
          <img src="/omniprof_logo_flat_horizontal.webp" alt="OmniProf" className="h-6 w-auto object-contain" />
          <svg className="w-3 h-3 shrink-0" style={{ color: '#133040' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Copyright + links (apenas no variant full) */}
      {variant === "full" && (
        <div className="flex flex-col items-center gap-4 mt-2">
          {/* Trust Badges */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Adequado LGPD
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Acessível WCAG
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> 100/100 Perf
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[11px]" style={{ color: 'var(--text-muted, #94a3b8)' }}>
            <Link href="/privacidade" className="hover:text-indigo-600 transition-colors">Privacidade</Link>
            <span className="opacity-40">•</span>
            <Link href="/seguranca" className="hover:text-indigo-600 transition-colors font-semibold">Segurança e Transparência</Link>
            <span className="opacity-40">•</span>
            <span>© {new Date().getFullYear()} Omnisfera Soluções Educacionais Ltda.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto pt-8 pb-6" style={{ borderTop: '1px solid var(--border-default)' }}>
      {/* Aviso sobre IA */}
      <div className="w-full mb-5 px-6 py-2.5 text-center" style={{ backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          A Omnisfera utiliza motores de IA para apoiar sua prática. Essas ferramentas podem apresentar falhas. É fundamental{" "}
          <strong style={{ color: 'var(--text-primary)' }}>revisar sempre com muito cuidado</strong> todo conteúdo gerado, dada a sensibilidade dos dados tratados em educação inclusiva.
        </p>
      </div>
      {/* Assinatura + OmniProf */}
      <div className="px-6">
        <OmniEducacaoSignature variant="full" />
      </div>
    </footer>
  );
}
