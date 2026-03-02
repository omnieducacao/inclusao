import Image from "next/image";
/**
 * Política de Privacidade — Página pública (LGPD)
 * Acessível sem autenticação.
 */
import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade | Omnisfera",
  description: "Política de Privacidade da plataforma Omnisfera — educação inclusiva.",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-slate-50/50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-700 hover:text-sky-600 transition-colors">
            <Image src="/omni_icone.png" alt="Logo Omnisfera" width={24} height={24} className="h-6 w-auto" style={{ filter: "var(--img-dark-invert, none)" }} />
          </Link>
          <Link href="/login" className="text-sm font-medium text-sky-600 hover:text-sky-700">
            Entrar
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-slate-500 mb-8">Última atualização: Fevereiro de 2025</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">1. Introdução</h2>
            <p>
              A Omnisfera (&quot;plataforma&quot;) é operada pela Omni Soluções Educacionais e tem como finalidade apoiar a educação inclusiva em escolas, por meio de gestão de PEI (Plano Educacional Individualizado), PAEE, avaliações diagnósticas e processuais, diário de bordo e módulo família. Esta Política de Privacidade descreve como tratamos os dados pessoais dos usuários e dos estudantes, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">2. Controlador e Encarregado (DPO)</h2>
            <p>
              O controlador dos dados é a <strong>Omni Soluções Educacionais</strong>. Para exercer seus direitos como titular de dados (acesso, correção, eliminação, portabilidade, revogação do consentimento), entre em contato com o Encarregado de Proteção de Dados (DPO):
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Email:</strong> privacidade@omnisfera.net</li>
              <li><strong>Assunto:</strong> LGPD / Direitos do Titular</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">3. Dados Coletados e Finalidades</h2>
            <p className="mb-2">Tratamos os seguintes tipos de dados:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Usuários (professores, gestores, AEE):</strong> email, nome, senha (hash), permissões e vínculos com turmas/estudantes — para autenticação, autorização e operação da plataforma.</li>
              <li><strong>Estudantes:</strong> nome, data de nascimento, série, turma, diagnóstico, laudos, dados do PEI e PAEE — para elaboração e acompanhamento de planos educacionais individualizados.</li>
              <li><strong>Responsáveis (módulo família):</strong> nome, email, vínculo com o estudante — para participação da família e ciência do PEI.</li>
              <li><strong>Uso de IA:</strong> conteúdos anonimizados são enviados a provedores de IA (OpenAI, Google, Anthropic, etc.) para geração de sugestões. Não enviamos dados identificáveis aos provedores.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">4. Base Legal (Art. 7º LGPD)</h2>
            <p>
              O tratamento baseia-se em: <strong>(i)</strong> consentimento do titular ou do responsável legal (quando aplicável); <strong>(ii)</strong> execução de contrato ou procedimentos preliminares (prestação do serviço educacional); <strong>(iii)</strong> cumprimento de obrigação legal ou regulatória; <strong>(iv)</strong> proteção da vida ou da incolumidade física; e <strong>(v)</strong> legítimo interesse do controlador, quando compatível com os direitos do titular.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">5. Compartilhamento</h2>
            <p>
              Os dados são armazenados em infraestrutura na nuvem (Supabase/PostgreSQL) e podem ser enviados, de forma anonimizada, a provedores de IA para geração de conteúdos. Não vendemos nem compartilhamos dados pessoais com terceiros para fins de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">6. Retenção</h2>
            <p>
              Mantemos os dados pelo tempo necessário ao cumprimento das finalidades e das obrigações legais. Após o encerramento do vínculo com a escola, os dados podem ser anonimizados ou eliminados conforme solicitação e política interna de retenção.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">7. Direitos do Titular</h2>
            <p>
              Você pode solicitar: acesso aos dados, correção de dados incompletos ou desatualizados, anonimização ou eliminação de dados desnecessários, portabilidade, revogação do consentimento e informações sobre compartilhamento. Entre em contato com o DPO pelo email indicado na seção 2.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">8. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, alteração, divulgação ou destruição, incluindo criptografia, controle de acesso e auditoria.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">9. Alterações</h2>
            <p>
              Esta política pode ser atualizada. Alterações relevantes serão comunicadas por meio da plataforma ou por email. O uso continuado após as alterações constitui aceitação da nova versão.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <Link href="/" className="text-sky-600 hover:text-sky-700 font-medium">
            ← Voltar à página inicial
          </Link>
        </div>
      </main>
    </div>
  );
}
