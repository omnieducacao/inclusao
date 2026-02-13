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
      {/* Assinatura */}
      <div className="text-center">
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Omnisfera — plataforma de inclusão ativa — criada e desenvolvida por{" "}
          <strong style={{ color: 'var(--text-secondary)' }}>Omni Soluções Educacionais</strong> — todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
