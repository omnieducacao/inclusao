export function Footer() {
  return (
    <footer className="mt-auto pt-8 pb-6 border-t border-slate-200">
      {/* Aviso sobre IA - Barra fina de um lado ao outro */}
      <div className="w-full mb-4 px-6 py-2 bg-slate-50 border-t border-b border-slate-200 text-center">
        <p className="text-slate-600 text-xs leading-relaxed">
          A Omnisfera utiliza motores de IA para apoiar sua prática. Essas ferramentas podem apresentar falhas. É fundamental{" "}
          <strong className="text-slate-700">revisar sempre com muito cuidado</strong> todo conteúdo gerado, dada a sensibilidade dos dados tratados em educação inclusiva.
        </p>
      </div>
      {/* Assinatura */}
      <div className="text-center">
        <p className="text-slate-400 text-xs font-medium">
          Omnisfera — plataforma de inclusão ativa — criada e desenvolvida por{" "}
          <strong className="text-slate-500">Omni Soluções Educacionais</strong> — todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
