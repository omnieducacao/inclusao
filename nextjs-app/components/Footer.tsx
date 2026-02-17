/**
 * Rodapé com assinatura Omni Educação + link OmniProf
 * Reutilizado no dashboard, home e login.
 */
export function OmniEducacaoSignature({ variant = "full" }: { variant?: "full" | "compact" }) {
  return (
    <div className={`flex flex-col ${variant === "full" ? "gap-4" : "gap-3"}`}>
      {/* Logos lado a lado: Omni Educação + "Conheça também" + OmniProf */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        {/* Omni Educação logo */}
        <img
          src="/omni_horizontal.png"
          alt="Omni Educação"
          className="h-8 w-auto object-contain"
          style={{ filter: 'var(--img-dark-invert, none)' }}
        />

        {/* Separador + "Conheça também" + OmniProf logo */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[10px] font-medium" style={{ color: 'var(--text-muted, #94a3b8)' }}>
            Conheça também
          </span>
          <a
            href="https://omniprof.net"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.03] hover:opacity-80"
          >
            <img
              src="/omniprof_logo_flat_horizontal.png"
              alt="OmniProf"
              className="h-7 w-auto object-contain"
              style={{ filter: 'var(--img-dark-invert, none)' }}
            />
            <svg className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted, #94a3b8)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Copyright (apenas no variant full) */}
      {variant === "full" && (
        <p className="text-center text-[10px]" style={{ color: 'var(--text-muted, #94a3b8)' }}>
          © {new Date().getFullYear()} Omni Soluções Educacionais — todos os direitos reservados.
        </p>
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
