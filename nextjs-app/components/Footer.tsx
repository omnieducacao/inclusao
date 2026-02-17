/**
 * Rodapé com assinatura Omni Educação + link OmniProf
 * Reutilizado no dashboard, home e login.
 */
export function OmniEducacaoSignature({ variant = "full" }: { variant?: "full" | "compact" }) {
  return (
    <div className={`flex flex-col ${variant === "full" ? "gap-4" : "gap-3"}`}>
      {/* Linha principal: Omni Educação (esquerda) + OmniProf (direita) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Esquerda: Omni Educação */}
        <div className="flex items-center gap-2.5">
          {/* Ícone espiral estilizado - referência ao logo Omni Educação */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #3b82f6, #60a5fa)',
              boxShadow: '0 2px 6px rgba(99, 102, 241, 0.25)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 12c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6c-4.97 0-9-4.03-9-9S7.03 0 12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12" transform="scale(0.5) translate(12, 12)" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold tracking-wide" style={{ color: 'var(--text-secondary, #475569)' }}>
              <span style={{ color: '#6366f1' }}>omni</span>{" "}
              <span style={{ color: '#3b82f6' }}>educação</span>
            </p>
            {variant === "full" && (
              <p className="text-[10px]" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                Omnisfera — plataforma de inclusão ativa — todos os direitos reservados.
              </p>
            )}
          </div>
        </div>

        {/* Direita: OmniProf */}
        <a
          href="https://omniprof.net"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.03] group"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.9), rgba(37, 99, 180, 0.9))',
            boxShadow: '0 1px 4px rgba(37, 99, 180, 0.15)',
          }}
        >
          <span className="text-white/80 text-[10px] font-medium">
            Conheça também
          </span>
          {/* OmniProf mini-logo inline */}
          <span className="flex items-center gap-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
              <rect x="2" y="4" width="9" height="16" rx="2" fill="#2563eb" />
              <rect x="13" y="4" width="9" height="16" rx="2" fill="#dc2626" />
              <circle cx="17" cy="12" r="3" fill="white" />
            </svg>
            <span className="text-xs font-extrabold tracking-tight">
              <span style={{ color: '#93c5fd' }}>OMNI</span>
              <span style={{ color: '#fca5a5' }}>PROF</span>
            </span>
          </span>
          <svg className="w-3 h-3 text-white/60 group-hover:text-white/90 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Copyright (apenas no variant full) */}
      {variant === "full" && (
        <p className="text-center text-[10px]" style={{ color: 'var(--text-muted, #94a3b8)' }}>
          © {new Date().getFullYear()} Omni Soluções Educacionais
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
