"use client";

import { useState } from "react";
import Link from "next/link";

type TabId = "panorama" | "legal" | "glossario" | "linguagem" | "biblio" | "manual";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "panorama", label: "📊 Panorama & Fluxos", icon: "📊" },
  { id: "legal", label: "⚖️ Legislação & IA", icon: "⚖️" },
  { id: "glossario", label: "📖 Glossário Técnico", icon: "📖" },
  { id: "linguagem", label: "🗣️ Dicionário Inclusivo", icon: "🗣️" },
  { id: "biblio", label: "📚 Biblioteca Virtual", icon: "📚" },
  { id: "manual", label: "📘 Manual da Jornada", icon: "📘" },
];

type Props = {
  session: { usuario_nome?: string; workspace_name?: string } | null;
};

export function InfosClient({ session }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("panorama");
  const [legalQuestion, setLegalQuestion] = useState("");
  const [legalAnswer, setLegalAnswer] = useState("");
  const [glossarioFilter, setGlossarioFilter] = useState("");

  const glossarioDb = [
    {
      t: "AEE (Atendimento Educacional Especializado)",
      d: "Serviços educacionais suplementares que potencializam habilidades para que o aluno adquira autonomia. É transversal a todos os níveis, mas não substitui a escolarização regular.",
    },
    {
      t: "Alteridade",
      d: "Conceito relacionado à capacidade de reconhecer e respeitar o 'outro' em sua diferença, incorporado por uma escola com responsabilidade social.",
    },
    {
      t: "Capacitismo",
      d: "Toda forma de distinção, restrição ou exclusão que tenha o propósito de prejudicar, impedir ou anular o reconhecimento dos direitos da pessoa com deficiência.",
    },
    {
      t: "Cultura do Pertencimento",
      d: "Uma cultura escolar onde o aluno realmente faz parte da comunidade, sendo condição essencial para o desenvolvimento inclusivo.",
    },
    {
      t: "Declaração de Salamanca",
      d: "Resolução da ONU (1994) que estabeleceu princípios para a educação especial, formalizando o compromisso com a escola inclusiva.",
    },
    {
      t: "Educação Especial",
      d: "Modalidade que oferece serviços, recursos e estratégias. Originalmente para deficiências (mental, visual, auditiva, físico-motoras, múltiplas), condutas típicas e altas habilidades; hoje abrange também dificuldades de aprendizagem, fatores ecológicos e socioeconômicos (BRASIL, 2001).",
    },
    {
      t: "Educação Inclusiva",
      d: "Efetivação do direito constitucional: todos frequentam os mesmos ambientes e são beneficiados pela socialização. Da EI ao Superior, incluindo EJA, profissionalizante, quilombolas e indígenas. Não substitui a escolarização regular.",
    },
    {
      t: "Público-alvo da Educação Especial",
      d: "Deficiências; transtornos globais do desenvolvimento; altas habilidades/superdotação; dificuldades de aprendizagem (cognitivas, psicomotoras, comportamentais); privações socioculturais e nutricionais.",
    },
    {
      t: "Estudo de Caso",
      d: "Metodologia de produção e registro de informações. Em 2025, é a porta de entrada que substitui o laudo médico.",
    },
    {
      t: "Justiça Curricular",
      d: "Conceito que busca um currículo relevante e representativo, promovendo igualdade de condições e respeitando particularidades.",
    },
    {
      t: "Outragem / Outrar-se",
      d: "Postura de quem é capaz de se colocar no lugar do outro, sentir o mundo do outro como se fosse seu próprio, numa relação empática.",
    },
    {
      t: "PcD",
      d: "Sigla utilizada para se referir à Pessoa com Deficiência.",
    },
    {
      t: "PEI (Plano Educacional Individualizado)",
      d: "Documento pedagógico de natureza obrigatória e atualização contínua ('documento vivo'), que visa garantir o atendimento personalizado.",
    },
    {
      t: "PNEEPEI",
      d: "Política Nacional de Educação Especial na Perspectiva da Educação Inclusiva (2008).",
    },
    {
      t: "PNAD Contínua",
      d: "Pesquisa do IBGE que produziu estatísticas sobre pessoas com deficiência no Brasil.",
    },
    {
      t: "Profissional de Apoio Escolar",
      d: "Atua no suporte (higiene, alimentação, locomoção). Deve ter nível médio e formação de 180h. Substitui 'cuidador'.",
    },
    {
      t: "Tecnologias Assistivas",
      d: "Ferramentas, recursos ou dispositivos que auxiliam na funcionalidade e autonomia (pranchas, softwares, dispositivos).",
    },
    {
      t: "Vieses Inconscientes",
      d: "Processos inconscientes que levam a reproduzir comportamentos e discursos preconceituosos por associações aprendidas socialmente.",
    },
  ];

  const termosBons = [
    ["Pessoa com Deficiência (PcD)", "Termo legal da LBI. Marca a deficiência como atributo, não identidade total."],
    ["Estudante com Deficiência", "Foco na pessoa primeiro."],
    ["Neurodivergente", "Funcionamento cerebral atípico (TEA, TDAH), sem conotação de doença."],
    ["Surdo", "Termo identitário correto (Comunidade Surda)."],
    ["Ritmo Próprio", "Respeita a singularidade da aprendizagem."],
    ["Típico / Atípico", "Substitui 'Normal' e 'Anormal'."],
  ];

  const termosRuins = [
    ["Portador de Deficiência", "Deficiência não se porta (como uma bolsa). É intrínseca."],
    ["Aluno de Inclusão", "Segrega. Todos são alunos de inclusão."],
    ["Criança Especial", "Eufemismo que infantiliza. Use o nome da criança."],
    ["Surdo-Mudo", "Erro técnico. A surdez não implica mudez. Surdos têm voz."],
    ["Atrasado / Lento", "Pejorativo. Ignora a neurodiversidade."],
    ["Doença Mental", "Deficiência não é doença. Doença tem cura; deficiência é condição."],
    ["Fingir de João-sem-braço / Deu uma de João sem braço", "Expressão capacitista."],
    ["O pior cego é aquele que não quer ver", "Metáfora capacitista."],
    ["Desculpa de aleijado é muleta / Na terra de cego quem tem um olho é rei", "Expressões que desconsideram a PcD."],
  ];

  const biblioteca = [
    {
      categoria: "Legislação e Documentos Oficiais",
      livros: [
        {
          titulo: "Lei Brasileira de Inclusão (13.146/2015)",
          autor: "Brasil",
          resumo: "Estatuto da PcD. Define barreira e criminaliza discriminação.",
          link: "http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm",
        },
        {
          titulo: "Decretos 12.686 e 12.773 (2025)",
          autor: "Governo Federal",
          resumo: "Regulamentam o financiamento do AEE (Duplo Fundo) e proíbem cobranças extras.",
          link: "https://www.planalto.gov.br",
        },
        {
          titulo: "Política Nacional de Educação Especial (2008)",
          autor: "MEC",
          resumo: "Consolidou a matrícula na escola comum.",
          link: "http://portal.mec.gov.br/seesp/arquivos/pdf/politica.pdf",
        },
        {
          titulo: "Declaração de Salamanca (1994)",
          autor: "UNESCO",
          resumo: "Marco mundial da escola inclusiva.",
          link: "https://unesdoc.unesco.org/ark:/48223/pf0000139394",
        },
        {
          titulo: "Base Nacional Comum Curricular (BNCC)",
          autor: "MEC",
          resumo: "Define as aprendizagens essenciais.",
          link: "https://www.gov.br/mec/pt-br/escola-em-tempo-integral/BNCC_EI_EF_110518_versaofinal.pdf",
        },
        {
          titulo: "Convenção sobre os Direitos das Pessoas com Deficiência",
          autor: "ONU/Brasil (2008)",
          resumo: "Tratado internacional com status de emenda constitucional.",
          link: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/decreto/d6949.htm",
        },
      ],
    },
    {
      categoria: "Fundamentos Pedagógicos e Autores",
      livros: [
        {
          titulo: "Inclusão Escolar: O que é? Como fazer?",
          autor: "Maria Teresa Eglér Mantoan (2003)",
          resumo: "Diferencia integração de inclusão. Obra clássica.",
        },
        {
          titulo: "O Currículo e seus desafios: em busca da justiça curricular",
          autor: "Branca Jurema Ponce (2018)",
          resumo: "Discute a justiça curricular como base da inclusão.",
          link: "http://www.curriculosemfronteiras.org/vol18iss3articles/ponce.pdf",
        },
        {
          titulo: "Altas Habilidades/Superdotação: inteligência e criatividade",
          autor: "Virgolim, A. M. R. (2014)",
          resumo: "Conceitos de Renzulli e modelo dos três anéis.",
        },
        {
          titulo: "Mentes que mudam: a arte e a ciência de mudar as nossas mentes",
          autor: "Howard Gardner (2005)",
          resumo: "Teoria das Inteligências Múltiplas aplicada.",
        },
        {
          titulo: "Capacitismo: o que é, onde vive?",
          autor: "Sidney Andrade",
          resumo: "Entendendo o preconceito estrutural.",
          link: "https://medium.com/@sidneyandrade23",
        },
        {
          titulo: "Os Benefícios da Educação Inclusiva (2016)",
          autor: "Instituto Alana",
          resumo: "Estudos comprovam ganhos para todos.",
          link: "https://alana.org.br/wp-content/uploads/2016/11/Os_Beneficios_da_Ed_Inclusiva_final.pdf",
        },
        {
          titulo: "Desarrollo de escuelas inclusivas",
          autor: "AINSCOW, M. (2001)",
          resumo: "Ideas, propuestas y experiencias para mejorar las instituciones escolares. Madri: Narcea.",
        },
        {
          titulo: "Educação Inclusiva",
          autor: "SILVA, B. M. D.; PEDRO, V. I. D. C.; JESUS, E. M.",
          resumo: "Revista Científica Semana Acadêmica. Fortaleza, 2017.",
        },
        {
          titulo: "Como educar crianças anticapacitistas",
          autor: "ROSA, M.; LUIZ, K. G.; BÖCK, G. L. K. (org.) (2023)",
          resumo: "Florianópolis: Editora das Autoras. Aborda vieses inconscientes e comentários aparentemente de simpatia.",
        },
        {
          titulo: "O Corpo Como Personificação da Diferença e o Capacitismo",
          autor: "RODRIGUES, M. B.; LOPES, P. G.; BIDARTE M. V. DALAGOSTINI",
          resumo: "XXVI SemAd - Seminário em Administração, 2023.",
        },
        {
          titulo: "Educação inclusiva: 7 filmes para abordar a inclusão",
          autor: "Educa SC",
          resumo: "Lista para introduzir o tema na escola. Educação inclusiva é o primeiro passo para acabar com o capacitismo.",
          link: "https://educa.sc.gov.br",
        },
        {
          titulo: "Diversidade",
          autor: "Lenine",
          resumo: "Canção sobre diversidade e respeito às diferenças. Recurso para sensibilização.",
        },
        {
          titulo: "10 Desenhos animados sobre inclusão e diferença",
          autor: "Instituto Nacional de Nanismo",
          resumo: "Indicações para cine fórum e discussões sobre inclusão na escola.",
        },
      ],
    },
  ];

  const handleLegalQuestion = () => {
    if (!legalQuestion.trim()) return;
    setLegalAnswer(
      "Com base no Decreto 12.773/2025, a exigência de laudo médico como condição prévia para matrícula é ilegal. A escola deve realizar o Estudo de Caso pedagógico."
    );
  };

  const filteredGlossario = glossarioFilter
    ? glossarioDb.filter(
        (g) =>
          g.t.toLowerCase().includes(glossarioFilter.toLowerCase()) ||
          g.d.toLowerCase().includes(glossarioFilter.toLowerCase())
      )
    : glossarioDb;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="flex items-center gap-6 h-36 px-6 bg-gradient-to-r from-blue-600 to-sky-600">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl backdrop-blur">
            📚
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Central de Inteligência Inclusiva</h1>
            <p className="text-blue-100 mt-1">
              Fundamentos Pedagógicos, Marcos Legais e Ferramentas Práticas.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${
              activeTab === t.id
                ? "bg-blue-100 text-blue-800 border border-slate-200 border-b-white -mb-px"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {activeTab === "panorama" && <PanoramaTab />}
        {activeTab === "legal" && (
          <LegalTab
            question={legalQuestion}
            onQuestionChange={setLegalQuestion}
            answer={legalAnswer}
            onAsk={handleLegalQuestion}
          />
        )}
        {activeTab === "glossario" && (
          <GlossarioTab filter={glossarioFilter} onFilterChange={setGlossarioFilter} items={filteredGlossario} />
        )}
        {activeTab === "linguagem" && <LinguagemTab termosBons={termosBons} termosRuins={termosRuins} />}
        {activeTab === "biblio" && <BibliotecaTab biblioteca={biblioteca} />}
        {activeTab === "manual" && <ManualTab />}
      </div>
    </div>
  );
}

function PanoramaTab() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">O Fluxo da Inclusão (Omnisfera 2025)</h2>
        <p className="text-sm text-slate-500">Visualização do ecossistema escolar atualizado com os novos decretos.</p>
      </div>

      {/* Fluxo visual simplificado */}
      <div className="grid grid-cols-5 gap-2 my-6">
        {[
          { num: "1", label: "ACOLHIMENTO", sub: "(Matrícula Garantida)", color: "bg-blue-100 text-blue-800" },
          { num: "2", label: "ESTUDO DE CASO", sub: "(Avaliação Pedagógica)", color: "bg-blue-600 text-white" },
          { num: "3", label: "IDENTIFICAÇÃO", sub: "(Necessidades)", color: "bg-emerald-100 text-emerald-800" },
          { num: "4", label: "PLANEJAMENTO", sub: "(PEI + PAEE)", color: "bg-violet-100 text-violet-800" },
          { num: "5", label: "PRÁTICA", sub: "(Sala + AEE)", color: "bg-amber-100 text-amber-800" },
        ].map((item, i) => (
          <div key={i} className="relative">
            <div className={`${item.color} p-4 rounded-lg text-center text-xs font-semibold`}>
              <div className="text-lg font-bold mb-1">{item.num}</div>
              <div>{item.label}</div>
              <div className="text-[10px] mt-1 opacity-80">{item.sub}</div>
            </div>
            {i < 4 && (
              <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 text-slate-400">→</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💭 Filosofia: &quot;Outrar-se&quot;</h3>
          <p className="text-sm text-slate-600">
            A capacidade de sentir o mundo do outro mantendo o distanciamento profissional. É ter empatia sem confundir
            papéis, superando o capacitismo.
          </p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <h3 className="font-semibold text-blue-800 mb-2">⚖️ Justiça Curricular</h3>
          <p className="text-sm text-slate-600">
            O currículo não pode ser uma barreira. O PEI materializa a justiça curricular, garantindo acesso ao
            conhecimento através da adaptação.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Amplie o Conhecimento — Fundamentos da Educação Inclusiva</h3>

        <div className="space-y-3">
          <details className="rounded-lg border border-slate-200 p-4">
            <summary className="font-semibold text-slate-800 cursor-pointer">1. Educação Inclusiva – Definição</summary>
            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                &quot;Temos direito à igualdade, quando a diferença nos inferioriza, e direito à diferença, quando a
                igualdade nos descaracteriza.&quot; — <strong>Boaventura de Souza Santos</strong>
              </blockquote>
              <p>
                A educação inclusiva é a efetiva realização do que dispõe a Constituição: todos devem ter direitos
                iguais à educação, frequentar os mesmos ambientes e serem beneficiados pelo processo de socialização.
                Engloba a educação especial e a regular, da Educação Infantil ao Ensino Superior, incluindo EJA, ensino
                profissionalizante e grupos quilombolas e indígenas.
              </p>
              <p>
                <strong>Todos devem aprender juntos</strong>, independentemente de suas diferenças e dificuldades. Apesar
                de técnicas aplicáveis de forma geral, é necessária uma <strong>seleção específica e individualizada</strong>{" "}
                dos recursos e planos de ensino — a diversidade exige clareza de objetivos, respeito ao tempo do aluno e
                identificação de necessidades e potencialidades.
              </p>
              <p>
                A educação inclusiva garante a oferta da <strong>educação especial</strong> (serviços suplementares que
                potencializam habilidades para autonomia), mas <strong>não substitui</strong> o trabalho nas salas de aula
                comuns. O público-alvo ampliou-se: deficiências, condutas típicas de síndromes, altas habilidades,
                dificuldades de aprendizagem (cognitivas, psicomotoras, comportamentais), privações socioculturais e
                nutricionais.
              </p>
              <p>
                Diante dessa diversidade, as escolas precisam <strong>se adaptar</strong> para acolher todos, garantindo não
                apenas presença física, mas <strong>inclusão efetiva</strong> — condições físicas, currículo possível e
                cultura do pertencimento (AINSCOW, 2001).
              </p>
            </div>
          </details>

          <details className="rounded-lg border border-slate-200 p-4">
            <summary className="font-semibold text-slate-800 cursor-pointer">2. Capacitismo</summary>
            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <p>
                Conforme a <strong>Lei Brasileira de Inclusão (Lei nº 13.146/2015)</strong>, o capacitismo é{" "}
                <em>
                  &quot;toda forma de distinção, restrição ou exclusão, por ação ou omissão, que tenha o propósito ou o
                  efeito de prejudicar, impedir ou anular o reconhecimento ou o exercício dos direitos e das liberdades
                  fundamentais de pessoa com deficiência, incluindo a recusa de adaptações razoáveis e de fornecimento de
                  tecnologias assistivas&quot;
                </em>
                .
              </p>
              <p>
                O termo vem do inglês <em>ableism</em> (able + ism). As consequências podem ser <strong>físicas</strong>{" "}
                (barreiras estruturais em ambientes) ou <strong>simbólicas</strong> (metáforas, gestos e sons que reforçam
                estigmas). A PcD frequentemente é vista pela ótica pré-concebida de limitação, associada à funcionalidade do
                corpo, ignorando que pode desenvolver habilidades independentes de suas deficiências.
              </p>
              <p>
                Os <strong>vieses inconscientes</strong> (associações aprendidas socialmente) têm grande impacto em
                preconceitos. O capacitismo se esconde atrás da pena, da não inclusão em brincadeiras ou grupos, e de
                comentários aparentemente de simpatia. (ROSA; LUIZ; BÖCK, 2023)
              </p>
              <details className="mt-3 ml-4">
                <summary className="font-medium cursor-pointer">a) O papel do diretor nas práticas anticapacitistas</summary>
                <div className="mt-2 text-sm space-y-2">
                  <p>
                    O capacitismo no trabalho relega a PcD à invisibilidade. Evidências: ausência de práticas que valorizem a
                    diversidade, infraestrutura não acessível, suposição de incapacidade, normatização de padrão corporal
                    ideal, metáforas capacitistas (&quot;deu uma de João sem braço&quot;, &quot;o pior cego é aquele que não
                    quer ver&quot;).
                  </p>
                  <p>
                    <strong>O diretor empenhado em educação inclusiva</strong> deve instalar política inclusiva e liderar pelo
                    exemplo, mobilizando a comunidade. Ações: espaço físico acessível, recursos assistivos, sensibilização da
                    equipe, formação dos educadores, acompanhamento periódico, atividades inclusivas, comunicação transparente
                    com pais.
                  </p>
                  <p>
                    Para viabilizar: visão estratégica de gestão, recursos financeiros, treinamento contínuo e amparo jurídico
                    alinhado às secretarias de educação.
                  </p>
                </div>
              </details>
            </div>
          </details>

          <details className="rounded-lg border border-slate-200 p-4">
            <summary className="font-semibold text-slate-800 cursor-pointer">
              3. Uma escola para todos: recursos, currículo e gestão
            </summary>
            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <p>
                O <strong>IBGE (PNAD Contínua 2022)</strong> revelou: <strong>18,6 milhões</strong> de pessoas com 2 anos
                ou mais têm deficiência no Brasil (8,9% da população). Dados relevantes:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>19,5% das PcD são analfabetas (vs 4,1% sem deficiência)</li>
                <li>25,6% das PcD concluíram o Ensino Médio (vs 57,3%)</li>
                <li>55% das PcD que trabalham estão na informalidade</li>
                <li>Maior percentual: Nordeste (10,3%); menor: Sudeste (8,2%)</li>
              </ul>
              <p>
                <strong>Qual a escola necessária?</strong> Aquela que desenvolve política e cultura voltadas às diferenças e
                à igualdade, mantém equipe interessada nos direitos de todos, considera a parceria com a família, garante
                formação de professores, prioriza necessidades nos processos de adaptação e avaliação, garante espaços,
                equipamentos e instrumental adequados, desenvolve práticas emancipatórias e respeita os marcos legais.
              </p>
            </div>
          </details>

          <details className="rounded-lg border border-slate-200 p-4">
            <summary className="font-semibold text-slate-800 cursor-pointer">4. Cultura da Educação Inclusiva</summary>
            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <p>
                A cultura inclusiva consiste em <strong>valores e atitudes compartilhados</strong> pela comunidade escolar,
                que garantem a igualdade de desenvolvimento para todos os alunos, acolhendo-os e tratando-os de forma
                igualitária, permitindo-lhes se desenvolver de acordo com suas potencialidades, ritmo e singularidades.
              </p>
              <p>
                Criar uma cultura de inclusão significa <strong>conviver com a visibilidade da diferença</strong>, valorizar
                o diferente e aprender a conectar-se com a diversidade sem preconceitos. O gestor comunica as regras da
                estrutura escolar, as concepções do Projeto Pedagógico e a visão acerca das responsabilidades da escola e
                suas relações com a comunidade. O cenário construído será o espaço em que os educadores trabalharão de forma
                colaborativa, orientados por visões comuns (GIDDENS, 2003).
              </p>
              <p>
                Segundo Heloisa Lück (2000), a ação dos gestores articula-se em três verbos: <strong>organizar, mobilizar e
                articular</strong> todas as condições materiais e humanas para garantir o avanço dos processos
                socioeducacionais e promover a aprendizagem efetiva — aquela que garante competências necessárias à cidadania.
              </p>
              <p>
                <strong>Fatores que fortalecem a cultura de inclusão:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Formação dos educadores e valorização dos talentos</li>
                <li>Prevenção da rotatividade de profissionais (preservar a história da instituição)</li>
                <li>Diversidade na composição da equipe</li>
                <li>Metas focadas na inclusão em todos os níveis</li>
                <li>Cumprimento da legislação</li>
                <li>Escuta ativa para mapear pontos fortes e ajustes necessários</li>
              </ul>
              <p>
                Cada escola é única. Mesmo fazendo parte de uma rede, os procedimentos, ênfases e acordos são irrepetíveis
                — a cultura é gerada pela liderança, corpo docente, discente, colaboradores e famílias num espaço específico.
              </p>
            </div>
          </details>

          <details className="rounded-lg border border-slate-200 p-4">
            <summary className="font-semibold text-slate-800 cursor-pointer">5. Sensibilização da comunidade escolar</summary>
            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <blockquote className="border-l-4 border-blue-500 pl-4 italic">
                &quot;A cegueira moral é a incapacidade de ver a humanidade no outro e, por consequência, a incapacidade de
                agir de maneira justa e solidária.&quot; — <strong>Zygmunt Bauman</strong>
              </blockquote>
              <p>
                Vivemos em uma sociedade consumista e individualista, com meritocracia que justifica desigualdades. São
                tempos de desumanização, nos quais não percebemos a dor do outro (BAUMANN; DONSKIS, 2014). Há leis suficientes,
                porém o cumprimento burocrático não leva às transformações necessárias. O trabalho com a inclusão exige dos
                gestores um <strong>esforço potente</strong> para que a comunidade se alie e se comprometa com o projeto.
              </p>
              <p>
                <strong>Para sensibilizar a comunidade:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Promover atividades de respeito à diversidade, diferenças e empatia</li>
                <li>Formar parcerias com organizações de inclusão e especialistas; palestras e rodas de conversa com pais</li>
                <li>
                  Estimular a participação dos pais: comunicação aberta, envolvê-los no processo, visitas para comentar
                  produções, vídeos com alunos em atividades
                </li>
                <li>
                  Criar canais de formação digital: lives, seminários, cine fórum sobre deficiências e altas habilidades
                </li>
                <li>
                  Capacitar líderes estudantis: voluntariado que promova inserção cultural e social; multiplicadores da
                  cultura inclusiva; monitores de atividades sociais, esportivas e culturais
                </li>
              </ul>
              <p>
                A construção de uma cultura inclusiva não é simples, mas é fundamental. A sensibilização dos gestores e
                educadores sobre diversidade, empatia e respeito às singularidades cria um ambiente acolhedor. A cultura
                inclusiva deve ser <strong>compromisso de todos</strong>, não apenas da equipe escolar — um compromisso da
                comunidade.
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

function LegalTab({
  question,
  onQuestionChange,
  answer,
  onAsk,
}: {
  question: string;
  onQuestionChange: (q: string) => void;
  answer: string;
  onAsk: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">⚖️ Legislação em Foco (2025)</h2>

        <details className="rounded-lg border border-slate-200 p-4" open>
          <summary className="font-semibold text-slate-800 cursor-pointer">
            ⚖️ Decreto 12.686/2025: O Financiamento (Duplo Fundo)
          </summary>
          <div className="mt-4 text-sm text-slate-600 space-y-2">
            <p>
              <strong>Mudança Estrutural:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>
                <strong>Dupla Matrícula:</strong> O aluno público-alvo da educação especial é contabilizado{" "}
                <strong>duas vezes</strong> no FUNDEB (Matrícula Comum + AEE).
              </li>
              <li>
                <strong>Destinação:</strong> A verba extra deve ser usada para Sala de Recursos, materiais adaptados e
                contratação de profissionais de apoio.
              </li>
            </ol>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4">
          <summary className="font-semibold text-slate-800 cursor-pointer">
            🚫 Decreto 12.773/2025: Garantia de Acesso (Escolas Privadas)
          </summary>
          <div className="mt-4 text-sm text-slate-600 space-y-2">
            <p>
              <strong>Tolerância Zero para Barreiras:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>
                <strong>Taxas Extras:</strong> É <strong>ilegal</strong> cobrar valor adicional na mensalidade para custear
                monitor ou material.
              </li>
              <li>
                <strong>Porta de Entrada:</strong> A escola não pode exigir laudo médico para efetivar a matrícula. A
                avaliação pedagógica é soberana.
              </li>
            </ol>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4">
          <summary className="font-semibold text-slate-800 cursor-pointer">4. Marcos Legais e Linha do Tempo</summary>
          <div className="mt-4 text-sm text-slate-600 space-y-2">
            <p>
              Desde a década de 1960, o conceito de deficiência foi se distanciando do foco na incapacidade para ocupar-se
              do potencial dos indivíduos, delegando a tarefa de derrubar barreiras à sociedade (TEZANI, 2008). Conferência
              Mundial &quot;Educação para Todos&quot; (1990, Jomtien); Declaração de Salamanca (1994); LDB (1996, art. 59);
              PNEEPEI (2008); Convenção Internacional sobre os Direitos das Pessoas com Deficiência (Nova York, 2007; Brasil,
              Decreto 6.949/2009); Decreto 7.611/2011 (apoio especializado e formação); Lei 12.796/2013 (substituição de
              &quot;portadores&quot; por &quot;educandos com deficiência, transtornos globais e altas habilidades&quot;). A
              Meta 4 do PNE (2014-2024) prescreve universalizar o acesso à educação básica e ao AEE preferencialmente na rede
              regular.
            </p>
            <p className="text-xs text-slate-500">
              Linha do Tempo: 1960 (foco no potencial) → 1980 (organismos multilaterais) → 1990 (Educação para Todos) → 1994
              (Salamanca) → 1996 (LDB) → 2007-2009 (Convenção ONU) → 2008 (PNEEPEI) → 2011 (Decreto 7.611) → 2013 (alteração
              LDB) → 2021 (Diretrizes Nacionais MEC)
            </p>
          </div>
        </details>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🤖</span>
            <div className="font-bold text-teal-800">Consultor Legal IA</div>
          </div>
          <p className="text-sm text-slate-600">
            Dúvidas sobre a lei? Pergunte à nossa inteligência especializada nos decretos de inclusão.
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder="Ex: A escola pode exigir laudo para matricular?"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
          <button
            type="button"
            onClick={onAsk}
            disabled={!question.trim()}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            Perguntar
          </button>

          {answer && (
            <div className="rounded-lg border-l-4 border-teal-500 bg-white p-4 shadow-sm">
              <div className="font-bold text-teal-800 mb-2">Resposta da IA:</div>
              <div className="text-sm text-slate-600">{answer}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GlossarioTab({
  filter,
  onFilterChange,
  items,
}: {
  filter: string;
  onFilterChange: (f: string) => void;
  items: Array<{ t: string; d: string }>;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">📖 Glossário Técnico Conceitual</h2>
        <p className="text-sm text-slate-500">Definições oficiais para embasar relatórios e PEIs.</p>
      </div>

      <input
        type="text"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder="🔍 Filtrar conceitos..."
        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
      />

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4">
            <div className="font-bold text-blue-800 mb-1">{item.t}</div>
            <div className="text-sm text-slate-600">{item.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinguagemTab({
  termosBons,
  termosRuins,
}: {
  termosBons: string[][];
  termosRuins: string[][];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">🗣️ Guia de Linguagem Inclusiva</h2>
        <p className="text-sm text-slate-500">Termos para adotar e termos para abolir, baseados no respeito e na técnica.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-emerald-800">✅ PREFIRA (Termos Corretos)</h3>
          {termosBons.map(([termo, desc], i) => (
            <div key={i} className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="font-semibold text-emerald-800">{termo}</div>
              <div className="text-sm text-slate-600 mt-1">{desc}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-red-800">❌ EVITE (Termos Ofensivos)</h3>
          {termosRuins.map(([termo, desc], i) => (
            <div key={i} className="rounded-lg border border-red-200 bg-red-50/50 p-3">
              <div className="font-semibold text-red-800 line-through">{termo}</div>
              <div className="text-sm text-slate-600 mt-1">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BibliotecaTab({ biblioteca }: { biblioteca: Array<{ categoria: string; livros: Array<any> }> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">📚 Acervo Bibliográfico Completo</h2>
        <p className="text-sm text-slate-500">Clique nos itens para expandir o resumo e acessar o link (quando disponível).</p>
      </div>

      {biblioteca.map((cat, catIdx) => (
        <div key={catIdx} className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">{cat.categoria}</h3>
          {cat.livros.map((livro, livroIdx) => (
            <details key={livroIdx} className="rounded-lg border border-slate-200 p-4">
              <summary className="font-semibold text-slate-800 cursor-pointer">📚 {livro.titulo}</summary>
              <div className="mt-3 text-sm text-slate-600 space-y-2">
                <p>
                  <strong>Autor/Fonte:</strong> {livro.autor}
                </p>
                <p>
                  <strong>Sobre:</strong> {livro.resumo}
                </p>
                {livro.link && (
                  <a
                    href={livro.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    🔗 Acessar Documento
                  </a>
                )}
              </div>
            </details>
          ))}
        </div>
      ))}
    </div>
  );
}

function ManualTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">📘 Manual da Jornada Omnisfera: O Ciclo da Inclusão</h2>
        <p className="text-sm text-slate-500">Fluxo de trabalho ideal conectando planejamento, AEE e prática.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📘</span>
            <h3 className="text-lg font-bold text-blue-800">O Alicerce: Planejamento (PEI)</h3>
          </div>
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 mb-3">
            &quot;Não há inclusão sem intenção. Conhecer para incluir.&quot;
          </blockquote>
          <p className="text-sm text-slate-600 mb-3">
            Tudo começa na página <strong>Estratégias & PEI</strong>. Antes de pensar em recursos, precisamos mapear quem é o
            estudante.
          </p>
          <p className="text-sm font-semibold text-slate-700 mb-2">Ação na Plataforma:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 ml-4">
            <li>Registre o histórico e o contexto clínico na aba Estudante (uso interno da equipe).</li>
            <li>Mapeie as barreiras de aprendizagem (cognitivas, sensoriais ou físicas).</li>
            <li>Use a IA para estruturar metas de curto, médio e longo prazo.</li>
          </ul>
          <div className="mt-3 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm">
              💡 <strong>Conceito Chave:</strong> O PEI não é um &quot;laudo&quot;, é um projeto de futuro. Ele define O QUE
              vamos ensinar e QUAIS barreiras remover.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🧩</span>
            <h3 className="text-lg font-bold text-violet-800">A Estratégia: O AEE e o Plano de Ação (PAEE)</h3>
          </div>
          <blockquote className="border-l-4 border-violet-500 pl-4 italic text-slate-600 mb-3">
            &quot;A articulação entre o suporte especializado e a sala comum.&quot;
          </blockquote>
          <p className="text-sm text-slate-600 mb-3">
            Aqui entra a execução técnica do PEI. Na página <strong>Plano de Ação / PAEE</strong>, organizamos o Atendimento
            Especializado.
          </p>
          <p className="text-sm font-semibold text-slate-700 mb-2">Ação na Plataforma:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 ml-4">
            <li>Defina a frequência e o foco dos atendimentos no contraturno.</li>
            <li>Estabeleça a ponte com o professor regente.</li>
            <li>Organize a Tecnologia Assistiva.</li>
          </ul>
          <div className="mt-3 p-3 bg-violet-100 rounded-lg">
            <p className="text-sm">
              💡 <strong>Conceito Chave:</strong> O AEE não funciona isolado. Ele é o laboratório onde se testam as
              ferramentas que permitirão ao aluno acessar o currículo comum.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🚀</span>
            <h3 className="text-lg font-bold text-cyan-800">A Ferramenta: Adaptação (Hub de Inclusão)</h3>
          </div>
          <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-slate-600 mb-3">
            &quot;Acessibilidade é garantir que o conteúdo chegue a todos.&quot;
          </blockquote>
          <p className="text-sm text-slate-600 mb-3">
            Com o plano definido, vamos construir a aula. A página <strong>Hub de Recursos</strong> é sua oficina.
          </p>
          <div className="mt-3 p-3 bg-cyan-100 rounded-lg">
            <p className="text-sm">
              💡 <strong>Conceito Chave:</strong> Adaptar não é empobrecer o currículo, é torná-lo flexível.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border-l-4 border-rose-500 border border-rose-200 bg-white p-4">
            <h4 className="font-semibold text-rose-800 mb-2">📝 O Registro: Diário de Bordo</h4>
            <p className="text-sm italic text-slate-600 mb-2">&quot;O olhar atento transforma a prática.&quot;</p>
            <p className="text-sm text-slate-600">
              Registre o que funcionou e o engajamento. Use o conceito de <strong>&quot;outrar-se&quot;</strong>.
            </p>
          </div>
          <div className="rounded-lg border-l-4 border-sky-500 border border-sky-200 bg-white p-4">
            <h4 className="font-semibold text-sky-800 mb-2">📊 O Fechamento: Avaliação</h4>
            <p className="text-sm italic text-slate-600 mb-2">&quot;Avaliar para recalcular a rota.&quot;</p>
            <p className="text-sm text-slate-600">
              Use as <strong>Rubricas</strong> para fugir do &quot;achismo&quot;. Se a meta foi atingida, avançamos.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-3">Resumo do Ecossistema</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2">Passo</th>
                  <th className="text-left py-2">Módulo</th>
                  <th className="text-left py-2">Função</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { passo: "1", modulo: "📘 PEI", funcao: "Fundamentar: Quem é o aluno?" },
                  { passo: "2", modulo: "🧩 PAEE", funcao: "Estruturar: Suporte especializado." },
                  { passo: "3", modulo: "🚀 Hub", funcao: "Instrumentalizar: Criar recursos." },
                  { passo: "4", modulo: "📝 Diário", funcao: "Registrar: Execução diária." },
                  { passo: "5", modulo: "📊 Dados", funcao: "Validar: Medir sucesso." },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2">{row.passo}</td>
                    <td className="py-2 font-medium">{row.modulo}</td>
                    <td className="py-2 text-slate-600">{row.funcao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
