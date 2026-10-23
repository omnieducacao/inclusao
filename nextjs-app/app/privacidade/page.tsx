/**
 * Política de Privacidade — página pública (LGPD), acessível sem login.
 * Onda 20: levada ao design system, com a mesma identidade do login (fundo, marca e cartões).
 * O conteúdo jurídico é o mesmo de antes; só foi reorganizado e revisado no português.
 * SCRUM-71 (23/10/2026): seções 3, 5 e 8 passaram a dizer só o que o código faz (IA, onde ficam os
 * dados, segurança). Se mudar lib/ai-engines.ts, lib/encryption.ts ou lib/audit.ts, revise.
 * SCRUM-231: a seção 8 segue lib/colunas-cifradas.ts (colunas cifradas) e lib/resumo-acesso.ts (IP).
 */
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import { OmniEducacaoSignature } from "@/components/Footer";

export const metadata = {
  title: "Política de Privacidade | Omnisfera",
  description: "Política de Privacidade da plataforma Omnisfera — educação inclusiva.",
};

const tituloSecao: React.CSSProperties = { font: "800 18px/24px var(--font-sans)", letterSpacing: "-.01em", color: "var(--tinta)", margin: "0 0 8px" };
const paragrafo: React.CSSProperties = { font: "400 16px/27px var(--font-sans)", color: "var(--tinta-2)", margin: 0 };
const lista: React.CSSProperties = { ...paragrafo, paddingLeft: 24, margin: "8px 0 0", display: "grid", gap: 6 };
const forte: React.CSSProperties = { color: "var(--tinta)" };

const SECOES = [
  { id: "introducao", titulo: "1. Introdução" },
  { id: "controlador", titulo: "2. Controlador e encarregado" },
  { id: "dados", titulo: "3. Dados coletados e finalidades" },
  { id: "base-legal", titulo: "4. Base legal" },
  { id: "compartilhamento", titulo: "5. Compartilhamento" },
  { id: "retencao", titulo: "6. Retenção" },
  { id: "direitos", titulo: "7. Direitos do titular" },
  { id: "seguranca", titulo: "8. Segurança" },
  { id: "alteracoes", titulo: "9. Alterações" },
];

export default function PrivacidadePage() {
  return (
    <div className="omni-base" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--fundo)", color: "var(--tinta)" }}>
      <a href="#conteudo" className="omni-pular">Pular para o conteúdo</a>

      <header className="omni-topo">
        <Link href="/" className="omni-topo__marca" aria-label="Omnisfera, página inicial">
          <SimboloOmnisfera tamanho={34} />
          <span className="omni-topo__nome" aria-hidden>omnisfera</span>
        </Link>
        <div className="omni-topo__acoes">
          <Link href="/login" className="omni-btn omni-btn--primario omni-btn--pequeno">Entrar</Link>
        </div>
      </header>

      <main id="conteudo" style={{ flex: 1, width: "100%", maxWidth: 1040, margin: "0 auto", padding: "40px 16px 56px", display: "grid", gap: 24 }}>
        <div style={{ display: "grid", gap: 8, maxWidth: "70ch" }}>
          <span className="omni-rotulo" style={{ color: "var(--acao)" }}>Privacidade</span>
          <h1 style={{ margin: 0, font: "800 clamp(30px, 5vw, 40px)/1.1 var(--font-sans)", letterSpacing: "-.03em", color: "var(--tinta)" }}>
            Política de Privacidade
          </h1>
          <p className="omni-apoio" style={{ margin: 0 }}>Última atualização: outubro de 2026</p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
          {/* Sumário */}
          <nav aria-label="Seções da política" className="omni-cartao omni-cartao--plano" style={{ gap: 8, padding: 20, flex: "1 1 240px", maxWidth: 320 }}>
            <p className="omni-rotulo" style={{ margin: 0 }}>Nesta página</p>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
              {SECOES.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} style={{ font: "600 14px/22px var(--font-sans)", color: "var(--tinta-2)", textDecoration: "none" }}>{s.titulo}</a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="omni-cartao" style={{ gap: 32, padding: "clamp(20px, 4vw, 36px)", flex: "999 1 520px", minWidth: 0 }}>
            <section id="introducao" aria-labelledby="t-introducao">
              <h2 id="t-introducao" style={tituloSecao}>1. Introdução</h2>
              <p style={paragrafo}>
                A Omnisfera (&quot;plataforma&quot;) é operada pela Omnisfera Soluções Educacionais. Ela existe para apoiar a educação inclusiva nas escolas, com: gestão do PEI (Plano Educacional Individualizado) e do PAEE (Plano de Atendimento Educacional Especializado), avaliações diagnósticas e processuais, diário de bordo e módulo família.
              </p>
              <p style={{ ...paragrafo, marginTop: 12 }}>
                Esta Política de Privacidade descreve como tratamos os dados pessoais das pessoas usuárias e dos estudantes, de acordo com a LGPD (Lei Geral de Proteção de Dados, Lei nº 13.709/2018).
              </p>
            </section>

            <section id="controlador" aria-labelledby="t-controlador">
              <h2 id="t-controlador" style={tituloSecao}>2. Controlador e encarregado</h2>
              <p style={paragrafo}>
                O controlador dos dados é a <strong style={forte}>Omnisfera Soluções Educacionais</strong>. Para exercer seus direitos como titular dos dados (acesso, correção, eliminação, portabilidade e revogação do consentimento), fale com o Encarregado de Proteção de Dados (em inglês, DPO, de <em>Data Protection Officer</em>):
              </p>
              <ul style={{ ...lista, listStyle: "none", paddingLeft: 0 }}>
                <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail aria-hidden style={{ width: 18, height: 18, color: "var(--acao)", flexShrink: 0 }} />
                  <span><strong style={forte}>E-mail:</strong> <a href="mailto:privacidade@omnisfera.net">privacidade@omnisfera.net</a></span>
                </li>
                <li style={{ paddingLeft: 26 }}><strong style={forte}>Assunto:</strong> LGPD / Direitos do titular</li>
              </ul>
            </section>

            <section id="dados" aria-labelledby="t-dados">
              <h2 id="t-dados" style={tituloSecao}>3. Dados coletados e finalidades</h2>
              <p style={paragrafo}>Tratamos os seguintes tipos de dados:</p>
              <ul style={lista}>
                <li><strong style={forte}>Pessoas usuárias (professores, gestores e profissionais do AEE, o Atendimento Educacional Especializado):</strong> e-mail, nome, senha (guardada só em forma embaralhada, o chamado <em>hash</em>), permissões e vínculos com turmas e estudantes. Finalidade: login, controle de acesso e funcionamento da plataforma.</li>
                <li><strong style={forte}>Estudantes:</strong> nome, data de nascimento, série, turma, diagnóstico, laudos e dados do PEI e do PAEE. Finalidade: elaborar e acompanhar os planos educacionais individualizados.</li>
                <li><strong style={forte}>Responsáveis (módulo família):</strong> nome, e-mail e vínculo com o estudante. Finalidade: participação da família e ciência do PEI.</li>
                <li><strong style={forte}>Uso de inteligência artificial (IA):</strong> para gerar sugestões, parte do conteúdo é enviada a provedores de IA. Pedidos com informações de estudante vão só para a OpenAI, o Google (Gemini) e, no plano Robusto, a Anthropic (Claude); a DeepSeek e a Moonshot (Kimi) recebem apenas pedidos sem dados de estudante. Antes do envio, o nome do estudante e dados de identificação e contato (como CPF, RG, telefone, e-mail, data de nascimento e nomes de responsáveis e profissionais) são trocados por códigos (pseudonimização). Informações pedagógicas e de saúde necessárias à sugestão, como o diagnóstico, podem seguir no pedido. Fotos de laudo enviadas pela escola vão inteiras ao Google ou à OpenAI, para leitura do texto.</li>
              </ul>
            </section>

            <section id="base-legal" aria-labelledby="t-base-legal">
              <h2 id="t-base-legal" style={tituloSecao}>4. Base legal (art. 7º da LGPD)</h2>
              <p style={paragrafo}>O tratamento se baseia em:</p>
              <ol style={{ ...lista, listStyle: "lower-roman" }}>
                <li>consentimento do titular ou do responsável legal (quando aplicável);</li>
                <li>execução de contrato ou de procedimentos preliminares (prestação do serviço educacional);</li>
                <li>cumprimento de obrigação legal ou regulatória;</li>
                <li>proteção da vida ou da incolumidade física; e</li>
                <li>legítimo interesse do controlador, quando compatível com os direitos do titular.</li>
              </ol>
            </section>

            <section id="compartilhamento" aria-labelledby="t-compartilhamento">
              <h2 id="t-compartilhamento" style={tituloSecao}>5. Compartilhamento</h2>
              <p style={paragrafo}>
                Os dados ficam no banco de dados do Supabase (PostgreSQL), em São Paulo; o servidor do aplicativo fica nos Estados Unidos (Render). Para gerar sugestões, parte do conteúdo é enviada, sem o nome do estudante e sem dados de contato, aos provedores de IA indicados na seção 3, que processam os pedidos nos próprios servidores, em geral fora do Brasil. Não vendemos nem compartilhamos dados pessoais com terceiros para fins de marketing.
              </p>
            </section>

            <section id="retencao" aria-labelledby="t-retencao">
              <h2 id="t-retencao" style={tituloSecao}>6. Retenção</h2>
              <p style={paragrafo}>
                Mantemos os dados pelo tempo necessário para cumprir as finalidades e as obrigações legais. Depois que o vínculo com a escola termina, os dados podem ser anonimizados ou eliminados, conforme solicitação e política interna de retenção.
              </p>
            </section>

            <section id="direitos" aria-labelledby="t-direitos">
              <h2 id="t-direitos" style={tituloSecao}>7. Direitos do titular</h2>
              <p style={paragrafo}>
                Você pode pedir: acesso aos dados; correção de dados incompletos ou desatualizados; anonimização ou eliminação de dados desnecessários; portabilidade; revogação do consentimento; e informações sobre compartilhamento. Fale com o encarregado pelo e-mail indicado na seção 2.
              </p>
            </section>

            <section id="seguranca" aria-labelledby="t-seguranca">
              <h2 id="t-seguranca" style={tituloSecao}>8. Segurança</h2>
              <p style={paragrafo}>
                Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, alteração, divulgação ou destruição, incluindo: conexão segura (HTTPS); criptografia, feita pela própria plataforma antes de gravar no banco, do nome do estudante, dos dados de saúde (diagnóstico, laudos, medicação e mensagens com a família) e dos e-mails e telefones da equipe e das famílias; registros de acesso que guardam só um resumo do endereço de rede (IP), nunca o endereço; controle de acesso por escola e por papel; e registro das exportações e exclusões de dados. Veja também a página <Link href="/seguranca">Segurança e transparência</Link>.
              </p>
            </section>

            <section id="alteracoes" aria-labelledby="t-alteracoes">
              <h2 id="t-alteracoes" style={tituloSecao}>9. Alterações</h2>
              <p style={paragrafo}>
                Esta política pode ser atualizada. Mudanças relevantes serão comunicadas pela plataforma ou por e-mail. Continuar usando a plataforma depois das mudanças significa aceitar a nova versão.
              </p>
            </section>

            <div style={{ paddingTop: 24, borderTop: "1px solid var(--borda)" }}>
              <Link href="/" className="omni-btn omni-btn--secundario">
                <ArrowLeft aria-hidden /> Voltar à página inicial
              </Link>
            </div>
          </article>
        </div>
      </main>

      <footer style={{ padding: "24px 16px 32px", borderTop: "1px solid var(--borda)", background: "var(--superficie)" }}>
        <OmniEducacaoSignature variant="full" />
      </footer>
    </div>
  );
}
