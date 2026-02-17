export function Footer() {
  return (
    <footer className="mt-auto pt-8 pb-6" style={{ borderTop: '1px solid var(--border-default)' }}>
      {/* Aviso sobre IA - Barra fina de um lado ao outro */}
      <div className="w-full mb-4 px-6 py-2 text-center" style={{ backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          A Omnisfera utiliza motores de IA para apoiar sua prática. Essas ferramentas podem apresentar falhas. É fundamental{" "}
          <strong style={{ color: 'var(--text-primary)' }}>revisar sempre com muito cuidado</strong> todo conteúdo gerado, dada a sensibilidade dos dados tratados em educação inclusiva.
        </p>
      </div>

      {/* Assinatura + OmniProf */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
        {/* Esquerda: Omni Educação */}
        <div className="flex items-center gap-3">
          <img
            src="/omni_icone.png"
            alt="Omni Educação"
            className="h-7 w-auto opacity-70"
          />
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Omni Educação
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Omnisfera — plataforma de inclusão ativa — todos os direitos reservados.
            </p>
          </div>
        </div>

        {/* Direita: OmniProf */}
        <a
          href="https://omniprof.net"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #1a365d, #2b6cb0)',
            boxShadow: '0 2px 8px rgba(43, 108, 176, 0.2)',
          }}
        >
          <span className="text-white text-xs font-bold tracking-wide">
            Conheça também o
          </span>
          <span
            className="text-sm font-extrabold tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #e53e3e, #3182ce)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'brightness(1.8)',
            }}
          >
            OMNIPROF
          </span>
          <svg className="w-3.5 h-3.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
