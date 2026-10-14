"use client";

/**
 * Home de vendas da Omnisfera (onda 38).
 * Quem chega sem login em "/" vê esta página (o proxy.ts reescreve para /landing).
 * O conteúdo gratuito sobre inclusão continua em /inclusao (site estático em public/site).
 * Ordem das seções = as perguntas de quem decide a compra: o problema, como funciona, se dá para confiar, como começar.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Brain, ChartLine, CheckCircle2, FileText, Layers, Lock, Accessibility, NotebookPen,
  Smartphone, Sparkles, Users, House, School, Landmark, GraduationCap, ExternalLink,
} from "lucide-react";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import { OmniEducacaoSignature } from "@/components/Footer";
import s from "./landing.module.css";

const NORMAS = [
  { data: "20 de outubro de 2025", nome: "Decreto 12.686", texto: "Institui a Política Nacional de Educação Especial Inclusiva e faz do estudo de caso a porta de entrada." },
  { data: "8 de dezembro de 2025", nome: "Decreto 12.773", texto: "Coloca o PEI ao lado do PAEE e amplia a formação do professor do AEE." },
  { data: "15 de maio de 2026", nome: "Portaria MEC 421", texto: "Regulamenta PAEE e PEI e estende a dispensa de laudo à matrícula." },
];

const CICLO = ["Estudo de caso", "PEI", "PAEE", "Diário de bordo", "Avaliação", "Evolução"];

const PAPEIS = [
  {
    video: "paee",
    titulo: "Professor(a) do AEE",
    itens: [
      "Faz o estudo de caso e constrói o PEI em quatro etapas, com a IA escrevendo o rascunho.",
      "Transforma as metas do PEI em ciclos de atendimento (PAEE).",
      "Registra cada atendimento no diário em poucos toques, ligado às metas.",
    ],
  },
  {
    video: "pei-professor",
    titulo: "Professor(a) regente",
    itens: [
      "Lê o PEI de cada estudante da turma e dá ciência.",
      "Faz a avaliação diagnóstica da sua disciplina, descritor por descritor.",
      "Adapta o plano de ensino e cria atividades com a IA, a partir do PEI.",
    ],
  },
  {
    video: "evolucao",
    titulo: "Coordenação e gestão",
    itens: [
      "Configura a escola, as turmas e a equipe, cada pessoa com o seu papel.",
      "Envia o PEI aos professores e consolida o que cada disciplina fez.",
      "Acompanha a evolução de cada estudante e libera o resumo para a família.",
    ],
  },
];

const MODULOS = [
  { Icone: Users, titulo: "Estudantes", texto: "A ficha de cada estudante reúne tudo o que já foi feito com ele.", cor: "pei" },
  { Icone: FileText, titulo: "PEI", texto: "Plano Educacional Individualizado em quatro etapas, do estudo de caso à revisão.", cor: "pei" },
  { Icone: BookOpen, titulo: "PEI do professor", texto: "A parte de cada disciplina, feita por quem dá a aula.", cor: "pei" },
  { Icone: Layers, titulo: "PAEE", texto: "Plano de Atendimento Educacional Especializado em ciclos, com metas do PEI.", cor: "paee" },
  { Icone: NotebookPen, titulo: "Diário de bordo", texto: "Cada atendimento registrado, com frequência e metas trabalhadas.", cor: "diario" },
  { Icone: Brain, titulo: "Avaliação", texto: "Diagnóstica e processual, com questões alinhadas à BNCC (Base Nacional Comum Curricular) e ao SAEB.", cor: "hub" },
  { Icone: Sparkles, titulo: "Hub de recursos", texto: "Atividades, provas adaptadas e materiais criados a partir do PEI.", cor: "hub" },
  { Icone: ChartLine, titulo: "Evolução e dados", texto: "Avaliações, diário e PAEE juntos para decidir os próximos passos.", cor: "monitoramento" },
  { Icone: House, titulo: "Família", texto: "A família recebe um resumo do PEI em linguagem simples, quando a escola libera.", cor: "gestao" },
];

const PERGUNTAS = [
  {
    p: "Precisa de laudo para usar?",
    r: "Não. Desde o Decreto 12.686, quem define os apoios é o estudo de caso feito pela escola. A Omnisfera começa por ele; o laudo, quando existe, entra como mais uma informação.",
  },
  {
    p: "A IA escreve o PEI sozinha?",
    r: "Não. A IA escreve um rascunho a partir do estudo de caso, e o professor revisa, muda e aprova. Se o estudo de caso mudar depois, a plataforma avisa que o texto precisa ser refeito.",
  },
  {
    p: "Quem vê os dados de cada estudante?",
    r: "Cada escola só vê os seus estudantes, e cada pessoa só vê o que o seu papel permite. A família vê apenas o resumo que a escola liberou.",
  },
  {
    p: "Funciona no celular?",
    r: "Sim. Todas as telas funcionam no celular e no tablet, e o diário foi pensado para registrar o atendimento ali mesmo.",
  },
  {
    p: "Como a escola começa?",
    r: "A configuração é guiada em passos: ano letivo, turmas, equipe e estudantes. Cada módulo tem um vídeo curto e um passo a passo que abrem na primeira visita.",
  },
  {
    p: "Sou professor(a). Posso assinar sozinho(a)?",
    r: "A Omnisfera é contratada pela escola ou pela rede. Para usar por conta própria, o caminho é o OmniProf (omniprof.net): ferramentas de IA para o dia a dia da aula, com recursos de inclusão a partir da ficha de cada estudante.",
  },
  {
    p: "Quanto custa?",
    r: "O valor depende do tamanho da escola ou da rede. Conte o seu cenário para a nossa equipe e enviamos uma proposta.",
  },
];

/** Vídeo curto que só baixa e toca quando aparece na tela (e fica parado com movimento reduzido). */
function VideoNaTela({ id, rotulo }: { id: string; rotulo: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      v.controls = true;
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => { v.controls = true; });
      else v.pause();
    }, { threshold: 0.4 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video ref={ref} muted loop playsInline preload="none" poster={`/tutoriais/${id}.webp`} aria-label={rotulo}>
      <source src={`/tutoriais/${id}.webm`} type="video/webm" />
      <source src={`/tutoriais/${id}.mp4`} type="video/mp4" />
    </video>
  );
}

export default function LandingClient() {
  return (
    <div className="omni-base" style={{ minHeight: "100dvh", background: "var(--fundo)", color: "var(--tinta)" }}>
      <a href="#conteudo" className="omni-pular">Pular para o conteúdo</a>

      {/* ══════ TOPO ══════ */}
      <header className="omni-topo">
        <Link href="/" className="omni-topo__marca" aria-label="Omnisfera, página inicial">
          <SimboloOmnisfera tamanho={34} />
          <span className="omni-topo__nome" aria-hidden>omnisfera</span>
        </Link>
        <nav className={s.nav} aria-label="Seções da página">
          <a href="#como-funciona">Como funciona</a>
          <a href="#para-quem">Para quem</a>
          <a href="#professor">Para professores</a>
          <a href="#perguntas">Perguntas</a>
          <Link href="/inclusao">Sobre inclusão</Link>
        </nav>
        <div className="omni-topo__acoes">
          <Link href="/login" className={`omni-btn omni-btn--discreto omni-btn--pequeno ${s.soGrande}`}>Entrar</Link>
          <Link href="/contato" className="omni-btn omni-btn--primario omni-btn--pequeno">Falar com a equipe</Link>
        </div>
      </header>

      <main id="conteudo">
        {/* ══════ ABERTURA ══════ */}
        <section className={s.abertura} aria-labelledby="titulo-abertura">
          <i aria-hidden className={s.circulo} style={{ width: 340, height: 340, background: "var(--encontro-vermelho)", top: -140, left: -100 }} />
          <i aria-hidden className={s.circulo} style={{ width: 280, height: 280, background: "var(--encontro-verde)", top: "10%", right: -120 }} />
          <i aria-hidden className={s.circulo} style={{ width: 200, height: 200, background: "var(--encontro-amarelo)", bottom: -80, left: "38%" }} />
          <div className={`${s.secao} ${s.aberturaGrade}`}>
            <div>
              <span className={s.rotulo}>Plataforma de inclusão escolar</span>
              <h1 id="titulo-abertura" className={s.h1}>
                O PEI, o AEE e a sala de aula <em>no mesmo lugar</em>.
              </h1>
              <p className={s.lead}>
                A Omnisfera organiza a inclusão da escola: do estudo de caso ao PEI e ao PAEE, do atendimento no AEE (Atendimento Educacional Especializado) à aula do professor regente, com a coordenação acompanhando tudo.
              </p>
              <div className={s.ctas}>
                <Link href="/demonstracao" className="omni-btn omni-btn--primario omni-btn--grande">
                  Ver a demonstração <ArrowRight aria-hidden />
                </Link>
                <Link href="/contato" className="omni-btn omni-btn--secundario omni-btn--grande">
                  Falar com a equipe
                </Link>
              </div>
              <p className={s.nota}>Para escolas particulares e redes públicas · funciona no computador, no tablet e no celular</p>
            </div>
            <figure className={s.tela}>
              <VideoNaTela id="pei" rotulo="Vídeo curto: o PEI construído em quatro etapas, com dados fictícios" />
              <figcaption>O PEI em quatro etapas · exemplo com dados fictícios</figcaption>
            </figure>
          </div>
        </section>

        {/* ══════ POR QUE AGORA ══════ */}
        <section className={`${s.faixa} ${s.faixaClara}`} aria-labelledby="titulo-agora">
          <div className={s.secao}>
            <div className={s.cabeca}>
              <span className={s.rotulo}>Por que agora</span>
              <h2 id="titulo-agora" className={s.h2}>PEI e PAEE agora são obrigatórios. Papel e planilha não dão conta.</h2>
              <p className={s.intro}>Em menos de um ano, a política de educação especial mudou. Toda escola precisa fazer o estudo de caso, ter PEI e PAEE para cada estudante do público da educação especial e mostrar que eles chegam à sala de aula.</p>
            </div>
            <ol className={s.normas}>
              {NORMAS.map((n) => (
                <li key={n.nome} className={s.norma}>
                  <span className={s.normaData}>{n.data}</span>
                  <span className={s.normaNome}>{n.nome}</span>
                  <p className={s.normaTexto}>{n.texto}</p>
                </li>
              ))}
            </ol>
            <div className={s.dores}>
              <div className={s.dor}>
                <h3>O PEI fica na gaveta</h3>
                <p>Escrito uma vez no Word, ninguém revisa e o professor da sala nunca lê.</p>
              </div>
              <div className={s.dor}>
                <h3>O AEE e a sala não se falam</h3>
                <p>O que se planeja no atendimento não vira adaptação na aula, e vice-versa.</p>
              </div>
              <div className={s.dor}>
                <h3>A coordenação não enxerga</h3>
                <p>Na hora da reunião com a família ou da supervisão, o histórico está espalhado em grupos de mensagem.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ COMO FUNCIONA ══════ */}
        <section id="como-funciona" className={s.faixa} aria-labelledby="titulo-como">
          <div className={s.secao}>
            <div className={s.cabeca}>
              <span className={s.rotulo}>Como funciona</span>
              <h2 id="titulo-como" className={s.h2}>Um ciclo, três papéis, tudo ligado.</h2>
              <p className={s.intro}>Cada etapa entrega para a próxima. O que o AEE planeja chega ao professor regente, e o que acontece na sala volta para a avaliação.</p>
            </div>
            <ol className={s.ciclo} aria-label="O ciclo da inclusão na Omnisfera">
              {CICLO.map((etapa, i) => (
                <li key={etapa}>
                  <span className={s.etapa}>{etapa}</span>
                  {i < CICLO.length - 1 && <ArrowRight aria-hidden className={s.seta} width={18} height={18} />}
                </li>
              ))}
            </ol>
            <div className={s.papeis}>
              {PAPEIS.map((p) => (
                <article key={p.titulo} className={s.papel}>
                  <VideoNaTela id={p.video} rotulo={`Vídeo curto: o dia a dia de ${p.titulo.toLowerCase()} na Omnisfera, com dados fictícios`} />
                  <h3>{p.titulo}</h3>
                  <ul>{p.itens.map((t) => <li key={t}>{t}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ O QUE A ESCOLA GANHA ══════ */}
        <section className={`${s.faixa} ${s.faixaClara}`} aria-labelledby="titulo-ganhos">
          <div className={s.secao}>
            <div className={s.cabeca}>
              <span className={s.rotulo}>O que a escola ganha</span>
              <h2 id="titulo-ganhos" className={s.h2}>Menos tempo escrevendo, mais tempo com o estudante.</h2>
            </div>
            <div className={s.grade3}>
              <div className="omni-cartao omni-cartao--plano">
                <span className={s.ganhoNumero}>01 · Tempo</span>
                <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>O texto sai pronto para revisar</h3>
                <p className="omni-cartao__texto" style={{ margin: 0 }}>A IA escreve o rascunho do PEI, do PAEE e das adaptações a partir do estudo de caso. O professor revisa em vez de começar do zero.</p>
              </div>
              <div className="omni-cartao omni-cartao--plano">
                <span className={s.ganhoNumero}>02 · Continuidade</span>
                <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>O planejado chega à sala</h3>
                <p className="omni-cartao__texto" style={{ margin: 0 }}>O professor regente recebe o PEI, dá ciência e adapta a sua disciplina. A coordenação vê quem já fez a sua parte.</p>
              </div>
              <div className="omni-cartao omni-cartao--plano">
                <span className={s.ganhoNumero}>03 · Registro</span>
                <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>O histórico está num lugar só</h3>
                <p className="omni-cartao__texto" style={{ margin: 0 }}>Atendimentos, avaliações e versões do PEI ficam guardados por estudante, prontos para a reunião com a família ou a supervisão.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ MÓDULOS ══════ */}
        <section className={s.faixa} aria-labelledby="titulo-modulos">
          <div className={s.secao}>
            <div className={s.cabeca}>
              <span className={s.rotulo}>Módulos</span>
              <h2 id="titulo-modulos" className={s.h2}>Tudo o que a inclusão pede, conectado.</h2>
            </div>
            <div className={s.grade3}>
              {MODULOS.map((m) => (
                <div key={m.titulo} className={`omni-cartao omni-modulo omni-modulo--${m.cor}`}>
                  <span className="omni-modulo__selo" aria-hidden><m.Icone /></span>
                  <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>{m.titulo}</h3>
                  <p className="omni-cartao__texto" style={{ margin: 0 }}>{m.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ IA E CONFIANÇA ══════ */}
        <section className={`${s.faixa} ${s.faixaClara}`} aria-labelledby="titulo-ia">
          <div className={`${s.secao} ${s.ia}`}>
            <div>
              <span className={s.rotulo}>Inteligência artificial com responsabilidade</span>
              <h2 id="titulo-ia" className={s.h2}>A IA rascunha. O professor decide.</h2>
              <p className={s.intro}>A Omnisfera usa cinco motores de IA (inteligência artificial), cada um no que faz melhor. Se um falha, outro assume.</p>
            </div>
            <ul className={s.lista}>
              <li><CheckCircle2 aria-hidden /><span><strong>Todo texto é revisável.</strong> Nada vai para o PEI sem a aprovação de quem é responsável por ele.</span></li>
              <li><CheckCircle2 aria-hidden /><span><strong>A plataforma avisa quando algo mudou.</strong> Se o estudo de caso muda depois que o texto foi gerado, aparece o aviso para refazer.</span></li>
              <li><Lock aria-hidden /><span><strong>LGPD (Lei Geral de Proteção de Dados).</strong> Dados separados por escola, acesso por papel e registro de quem acessou, exportou ou apagou. <Link href="/seguranca">Ver segurança e privacidade</Link>.</span></li>
              <li><Accessibility aria-hidden /><span><strong>Acessível.</strong> Segue as WCAG (diretrizes internacionais de acessibilidade na web), com navegação por teclado, alto contraste e tema escuro.</span></li>
              <li><Smartphone aria-hidden /><span><strong>Leve.</strong> Feita para abrir rápido em computadores e conexões de escola, e no celular.</span></li>
            </ul>
          </div>
        </section>

        {/* ══════ PARA QUEM ══════ */}
        <section id="para-quem" className={s.faixa} aria-labelledby="titulo-quem">
          <div className={s.secao}>
            <div className={s.cabeca}>
              <span className={s.rotulo}>Para quem</span>
              <h2 id="titulo-quem" className={s.h2}>Uma escola ou uma rede inteira.</h2>
            </div>
            <div className={s.publico}>
              <div className="omni-cartao omni-modulo omni-modulo--pei">
                <span className="omni-modulo__selo" aria-hidden><School /></span>
                <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>Escolas particulares</h3>
                <p className="omni-cartao__texto" style={{ margin: 0 }}>Para a direção e a coordenação que precisam cumprir a nova política, mostrar o trabalho às famílias e dar ao professor da sala um caminho claro para cada estudante.</p>
              </div>
              <div className="omni-cartao omni-modulo omni-modulo--paee">
                <span className="omni-modulo__selo" aria-hidden><Landmark /></span>
                <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>Redes municipais e estaduais</h3>
                <p className="omni-cartao__texto" style={{ margin: 0 }}>Para secretarias de educação que querem o mesmo padrão de estudo de caso, PEI e PAEE em todas as escolas, com cada escola enxergando só os seus estudantes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ PARA O PROFESSOR: OMNIPROF ══════ */}
        {/* A Omnisfera é da escola; o professor que gostou dos recursos e quer usar sozinho vai para o OmniProf (assinatura individual). */}
        <section id="professor" className={s.faixa} aria-labelledby="titulo-professor">
          <div className={`${s.secao} ${s.omniprof}`}>
            <div>
              <span className={s.rotulo}>É professor(a)?</span>
              <h2 id="titulo-professor" className={s.h2}>Gostou dos recursos? Use por conta própria com o OmniProf.</h2>
              <p className={s.intro}>
                A Omnisfera é contratada pela escola. Se a sua escola ainda não tem, você pode assinar o OmniProf, a plataforma da mesma equipe feita para o professor: muito mais ferramentas de IA para o dia a dia da aula, incluindo os recursos de inclusão.
              </p>
              <div className={s.ctas}>
                <a href="https://www.omniprof.net" target="_blank" rel="noopener" className="omni-btn omni-btn--primario omni-btn--grande">
                  Conhecer o OmniProf <ExternalLink aria-hidden />
                </a>
                <Link href="/contato" className="omni-btn omni-btn--discreto omni-btn--grande">Indicar a Omnisfera para a minha escola</Link>
              </div>
            </div>
            <ul className={s.lista}>
              <li><GraduationCap aria-hidden /><span><strong>Adaptar provas e atividades</strong> para cada estudante, a partir da ficha dele, inclusive a foto de uma página do livro.</span></li>
              <li><Sparkles aria-hidden /><span><strong>Criar aulas, questões e avaliações</strong> alinhadas às habilidades oficiais da BNCC, com questões que trazem imagens.</span></li>
              <li><Brain aria-hidden /><span><strong>Criar itens</strong> com base na Matriz Omni, a mesma matriz da avaliação diagnóstica da Omnisfera.</span></li>
              <li><Users aria-hidden /><span><strong>Educação Infantil</strong> com projetos e atividades ilustradas.</span></li>
              <li><BookOpen aria-hidden /><span><strong>Formação</strong> em inclusão escolar, no mesmo jeito do nosso conteúdo gratuito.</span></li>
            </ul>
          </div>
        </section>

        {/* ══════ PERGUNTAS ══════ */}
        <section id="perguntas" className={`${s.faixa} ${s.faixaClara}`} aria-labelledby="titulo-perguntas">
          <div className={`${s.secao} ${s.estreita}`}>
            <div className={s.cabeca}>
              <span className={s.rotulo}>Perguntas frequentes</span>
              <h2 id="titulo-perguntas" className={s.h2}>Antes de conversar com a gente</h2>
            </div>
            <div className={s.perguntas}>
              {PERGUNTAS.map((q) => (
                <details key={q.p}>
                  <summary>{q.p}</summary>
                  <p>{q.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ FECHAMENTO ══════ */}
        <section className={s.faixa} aria-labelledby="titulo-fecho" style={{ paddingInline: 16 }}>
          <div className={s.fecho}>
            <h2 id="titulo-fecho">Veja a Omnisfera funcionando na sua escola.</h2>
            <p>Entre na demonstração com dados fictícios ou peça uma apresentação com a nossa equipe. O valor é sob consulta, de acordo com o tamanho da escola ou da rede.</p>
            <div className={s.ctas} style={{ justifyContent: "center", marginTop: 8 }}>
              <Link href="/demonstracao" className={`omni-btn omni-btn--grande ${s.claro}`}>Ver a demonstração <ArrowRight aria-hidden /></Link>
              <Link href="/contato" className={`omni-btn omni-btn--grande ${s.contorno}`}>Falar com a equipe</Link>
            </div>
            <Link href="/inclusao" className={s.linkFecho}>Ou leia o nosso conteúdo gratuito sobre inclusão escolar</Link>
          </div>
        </section>
      </main>

      {/* ══════ RODAPÉ ══════ */}
      <footer className={s.rodape}>
        <nav className={s.rodapeLinks} aria-label="Rodapé">
          <Link href="/inclusao">Conteúdo sobre inclusão</Link>
          <Link href="/formacao">Formação gratuita</Link>
          <Link href="/seguranca">Segurança</Link>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/contato">Contato</Link>
          <a href="https://www.omniprof.net" target="_blank" rel="noopener">OmniProf, para professores</a>
          <Link href="/login">Entrar</Link>
        </nav>
        <OmniEducacaoSignature variant="full" />
      </footer>
    </div>
  );
}
