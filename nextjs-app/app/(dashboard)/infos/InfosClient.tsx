"use client";

import { useState } from "react";
import { Card } from "@omni/ds";
import { RestartTourButton } from "@/components/GuidedTour";
import {
  BookMarked,
  BarChart3,
  Scale,
  BookOpen,
  MessageSquare,
  BookText,
  Search,
  ExternalLink,
  FileText,
  Users,
  Rocket,
  BookOpenCheck,
  CheckCircle2,
  XCircle,
  Puzzle,
} from "lucide-react";

export default function InfosClient() {
  const [activeTab, setActiveTab] = useState("panorama");
  const [searchTerm, setSearchTerm] = useState("");
  const [legalQuestion, setLegalQuestion] = useState("");

  const tabs = [
    { id: "panorama", label: "Panorama & Fluxos", icon: BarChart3 },
    { id: "legal", label: "Legislação & IA", icon: Scale },
    { id: "glossario", label: "Glossário Técnico", icon: BookOpen },
    { id: "linguagem", label: "Dicionário Inclusivo", icon: MessageSquare },
    { id: "biblio", label: "Biblioteca Virtual", icon: BookText },
    { id: "manual", label: "Manual da Jornada", icon: BookOpenCheck },
  ];

  const glossario = [
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

  const filteredGlossario = glossario.filter(
    (item) =>
      item.t.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.d.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const termosBons = [
    {
      termo: "Pessoa com Deficiência (PcD)",
      desc: "Termo legal da LBI. Marca a deficiência como atributo, não identidade total.",
    },
    {
      termo: "Estudante com Deficiência",
      desc: "Foco na pessoa primeiro.",
    },
    {
      termo: "Neurodivergente",
      desc: "Funcionamento cerebral atípico (TEA, TDAH), sem conotação de doença.",
    },
    {
      termo: "Surdo",
      desc: "Termo identitário correto (Comunidade Surda).",
    },
    {
      termo: "Ritmo Próprio",
      desc: "Respeita a singularidade da aprendizagem.",
    },
    {
      termo: "Típico / Atípico",
      desc: "Substitui 'Normal' e 'Anormal'.",
    },
  ];

  const termosRuins = [
    {
      termo: "Portador de Deficiência",
      desc: "Deficiência não se porta (como uma bolsa). É intrínseca.",
    },
    {
      termo: "Aluno de Inclusão",
      desc: "Segrega. Todos são alunos de inclusão.",
    },
    {
      termo: "Criança Especial",
      desc: "Eufemismo que infantiliza. Use o nome da criança.",
    },
    {
      termo: "Surdo-Mudo",
      desc: "Erro técnico. A surdez não implica mudez. Surdos têm voz.",
    },
    {
      termo: "Atrasado / Lento",
      desc: "Pejorativo. Ignora a neurodiversidade.",
    },
    {
      termo: "Doença Mental",
      desc: "Deficiência não é doença. Doença tem cura; deficiência é condição.",
    },
    {
      termo: "Fingir de João-sem-braço / Deu uma de João sem braço",
      desc: "Expressão capacitista.",
    },
    {
      termo: "O pior cego é aquele que não quer ver",
      desc: "Metáfora capacitista.",
    },
    {
      termo: "Desculpa de aleijado é muleta / Na terra de cego quem tem um olho é rei",
      desc: "Expressões que desconsideram a PcD.",
    },
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
          link: null,
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
          link: null,
        },
        {
          titulo: "Mentes que mudam: a arte e a ciência de mudar as nossas mentes",
          autor: "Howard Gardner (2005)",
          resumo: "Teoria das Inteligências Múltiplas aplicada.",
          link: null,
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
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex gap-1.5 p-1.5 bg-(--omni-bg-secondary) rounded-2xl overflow-x-auto scrollbar-hide border border-(--omni-border-default)">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap flex items-center gap-2 shrink-0 rounded-xl transition-all duration-200 ${activeTab === tab.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "panorama" && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-section text-slate-800 mb-2 flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-linear-to-b from-[#4285F4] to-[#3574D4]" />
                <BarChart3 className="w-5 h-5 text-blue-600" />
                O Fluxo da Inclusão (Omnisfera 2025)
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Visualização do ecossistema escolar atualizado com os novos decretos.
              </p>
              <Card className="bg-linear-to-r from-blue-50 via-purple-50 to-cyan-50">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 stagger-children">
                  {[
                    { num: "1", title: "ACOLHIMENTO", desc: "(Matrícula Garantida)", color: "bg-blue-100 text-blue-700 border-blue-300" },
                    { num: "2", title: "ESTUDO DE CASO", desc: "(Avaliação Pedagógica)", color: "bg-blue-600 text-white border-blue-800" },
                    { num: "3", title: "IDENTIFICAÇÃO", desc: "(Necessidades)", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
                    { num: "4", title: "PLANEJAMENTO", desc: "(PEI + PAEE)", color: "bg-purple-100 text-purple-700 border-purple-300" },
                    { num: "5", title: "PRÁTICA", desc: "(Sala + AEE)", color: "bg-amber-100 text-amber-700 border-amber-300" },
                  ].map((step, idx) => (
                    <div key={idx} className={`${step.color} rounded-xl p-4 border text-center transition-all duration-200 hover:scale-[1.03]`}>
                      <div className="text-2xl font-bold mb-1">{step.num}</div>
                      <div className="text-xs font-bold mb-1">{step.title}</div>
                      <div className="text-xs opacity-90">{step.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-slate-600 text-center">
                  Fluxo: Equipe → Substitui Laudo → Duplo Fundo
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="transition-all duration-200 hover:shadow-md">
                <h4 className="heading-subsection text-slate-800 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-600" />
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  Filosofia: "Outrar-se"
                </h4>
                <p className="text-slate-600 text-sm">
                  A capacidade de sentir o mundo do outro mantendo o distanciamento profissional. É ter empatia sem confundir papéis, superando o capacitismo.
                </p>
              </Card>
              <Card>
                <h4 className="heading-subsection text-slate-800 mb-2 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-sky-600" />
                  Justiça Curricular
                </h4>
                <p className="text-slate-600 text-sm">
                  O currículo não pode ser uma barreira. O PEI materializa a justiça curricular, garantindo acesso ao conhecimento através da adaptação.
                </p>
              </Card>
            </div>

            <div>
              <h4 className="heading-subsection text-slate-800 mb-4">Amplie o Conhecimento — Fundamentos da Educação Inclusiva</h4>
              <div className="space-y-3">
                <Card padding="none" className="p-5 transition-all duration-200 hover:shadow-md">
                  <details>
                    <summary className="cursor-pointer heading-subsection text-slate-800 mb-2">
                      1. Educação Inclusiva – Definição
                    </summary>
                    <div className="mt-3 text-sm text-slate-600 space-y-2">
                      <blockquote className="border-l-4 border-sky-500 pl-4 italic text-slate-700">
                        &quot;Temos direito à igualdade, quando a diferença nos inferioriza, e direito à diferença, quando a igualdade nos descaracteriza.&quot;
                        <br />
                        <strong>Boaventura de Souza Santos</strong>
                      </blockquote>
                      <p>
                        A educação inclusiva é a efetiva realização do que dispõe a Constituição: todos devem ter direitos iguais à educação, frequentar os mesmos ambientes e serem beneficiados pelo processo de socialização. Engloba a educação especial e a regular, da Educação Infantil ao Ensino Superior, incluindo EJA, ensino profissionalizante e grupos quilombolas e indígenas.
                      </p>
                      <p>
                        <strong>Todos devem aprender juntos</strong>, independentemente de suas diferenças e dificuldades. Apesar de técnicas aplicáveis de forma geral, é necessária uma <strong>seleção específica e individualizada</strong> dos recursos e planos de ensino — a diversidade exige clareza de objetivos, respeito ao tempo do aluno e identificação de necessidades e potencialidades.
                      </p>
                    </div>
                  </details>
                </Card>

                <Card padding="none" className="p-5 transition-all duration-200 hover:shadow-md">
                  <details>
                    <summary className="cursor-pointer heading-subsection text-slate-800 mb-2">
                      2. Capacitismo
                    </summary>
                    <div className="mt-3 text-sm text-slate-600 space-y-2">
                      <p>
                        Conforme a <strong>Lei Brasileira de Inclusão (Lei nº 13.146/2015)</strong>, o capacitismo é <em>&quot;toda forma de distinção, restrição ou exclusão, por ação ou omissão, que tenha o propósito ou o efeito de prejudicar, impedir ou anular o reconhecimento ou o exercício dos direitos e das liberdades fundamentais de pessoa com deficiência, incluindo a recusa de adaptações razoáveis e de fornecimento de tecnologias assistivas&quot;</em>.
                      </p>
                      <p>
                        O termo vem do inglês <em>ableism</em> (able + ism). As consequências podem ser <strong>físicas</strong> (barreiras estruturais em ambientes) ou <strong>simbólicas</strong> (metáforas, gestos e sons que reforçam estigmas).
                      </p>
                    </div>
                  </details>
                </Card>

                <Card padding="none" className="p-5 transition-all duration-200 hover:shadow-md">
                  <details>
                    <summary className="cursor-pointer heading-subsection text-slate-800 mb-2">
                      3. Uma escola para todos: recursos, currículo e gestão
                    </summary>
                    <div className="mt-3 text-sm text-slate-600 space-y-2">
                      <p>
                        O <strong>IBGE (PNAD Contínua 2022)</strong> revelou: <strong>18,6 milhões</strong> de pessoas com 2 anos ou mais têm deficiência no Brasil (8,9% da população). Dados relevantes:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>19,5% das PcD são analfabetas (vs 4,1% sem deficiência)</li>
                        <li>25,6% das PcD concluíram o Ensino Médio (vs 57,3%)</li>
                        <li>55% das PcD que trabalham estão na informalidade</li>
                      </ul>
                    </div>
                  </details>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === "legal" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-sky-600" />
                  Legislação em Foco (2025)
                </h3>

                <Card padding="none" className="p-5 transition-all duration-200 hover:shadow-md">
                  <details open>
                    <summary className="cursor-pointer font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-sky-600" />
                      Decreto 12.686/2025: O Financiamento (Duplo Fundo)
                    </summary>
                    <div className="mt-3 text-sm text-slate-700 space-y-2">
                      <p className="font-semibold">Mudança Estrutural:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>
                          <strong>Dupla Matrícula:</strong> O aluno público-alvo da educação especial é contabilizado <strong>duas vezes</strong> no FUNDEB (Matrícula Comum + AEE).
                        </li>
                        <li>
                          <strong>Destinação:</strong> A verba extra deve ser usada para Sala de Recursos, materiais adaptados e contratação de profissionais de apoio.
                        </li>
                      </ol>
                    </div>
                  </details>
                </Card>

                <Card padding="none" className="p-5 transition-all duration-200 hover:shadow-md">
                  <details>
                    <summary className="cursor-pointer font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      Decreto 12.773/2025: Garantia de Acesso (Escolas Privadas)
                    </summary>
                    <div className="mt-3 text-sm text-slate-700 space-y-2">
                      <p className="font-semibold">Tolerância Zero para Barreiras:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>
                          <strong>Taxas Extras:</strong> É <strong>ilegal</strong> cobrar valor adicional na mensalidade para custear monitor ou material.
                        </li>
                        <li>
                          <strong>Porta de Entrada:</strong> A escola não pode exigir laudo médico para efetivar a matrícula. A avaliação pedagógica é soberana.
                        </li>
                      </ol>
                    </div>
                  </details>
                </Card>
              </div>

              <div className="bg-linear-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200/60 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="font-bold text-teal-900">Consultor Legal IA</div>
                </div>
                <p className="text-sm text-teal-800 mb-4">
                  Dúvidas sobre a lei? Pergunte à nossa inteligência especializada nos decretos de inclusão.
                </p>
                <input
                  type="text"
                  value={legalQuestion}
                  onChange={(e) => setLegalQuestion(e.target.value)}
                  placeholder="Ex: A escola pode exigir laudo para matricular?"
                  className="w-full px-3 py-2 border-2 border-teal-200 rounded-lg text-sm mb-3 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
                {legalQuestion && (
                  <div className="bg-white rounded-lg p-4 border-l-4 border-teal-500">
                    <div className="font-bold text-teal-700 text-sm mb-2">Resposta da IA:</div>
                    <div className="text-xs text-slate-700">
                      Com base no <strong>Decreto 12.773/2025</strong>, a exigência de laudo médico como condição prévia para matrícula é ilegal. A escola deve realizar o <strong>Estudo de Caso</strong> pedagógico.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "glossario" && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-section text-slate-800 mb-2 flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-linear-to-b from-[#4285F4] to-[#3574D4]" />
                <BookOpen className="w-5 h-5 text-blue-600" />
                Glossário Técnico Conceitual
              </h3>
              <p className="text-sm text-slate-600 mb-4">Definições oficiais para embasar relatórios e PEIs.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar conceitos..."
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="space-y-3">
              {filteredGlossario.map((item, idx) => (
                <Card key={idx} className="transition-all duration-200 hover:shadow-md hover:border-blue-200">
                  <div className="font-bold text-sky-700 text-base mb-2">{item.t}</div>
                  <div className="text-sm text-slate-600 leading-relaxed">{item.d}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "linguagem" && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-section text-slate-800 mb-2 flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-linear-to-b from-[#4285F4] to-[#3574D4]" />
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Guia de Linguagem Inclusiva
              </h3>
              <p className="text-sm text-slate-600 mb-4">Termos para adotar e termos para abolir, baseados no respeito e na técnica.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-bold text-emerald-700 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  PREFIRA (Termos Corretos)
                </h4>
                <div className="space-y-3">
                  {termosBons.map((termo, idx) => (
                    <div key={idx} className="bg-emerald-50 rounded-lg border border-emerald-200/60 p-4">
                      <div className="font-bold text-emerald-800 text-sm mb-1">{termo.termo}</div>
                      <div className="text-xs text-emerald-700">{termo.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  EVITE (Termos Ofensivos)
                </h4>
                <div className="space-y-3">
                  {termosRuins.map((termo, idx) => (
                    <div key={idx} className="bg-red-50 rounded-lg border border-red-200/60 p-4">
                      <div className="font-bold text-red-800 text-sm mb-1 line-through">{termo.termo}</div>
                      <div className="text-xs text-red-700">{termo.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "biblio" && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-section text-slate-800 mb-2 flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-linear-to-b from-[#4285F4] to-[#3574D4]" />
                <BookText className="w-5 h-5 text-blue-600" />
                Acervo Bibliográfico Completo
              </h3>
              <p className="text-sm text-slate-600 mb-4">Clique nos itens para expandir o resumo e acessar o link (quando disponível).</p>
            </div>

            {biblioteca.map((categoria, catIdx) => (
              <div key={catIdx} className="space-y-4">
                <h4 className="heading-subsection text-slate-800">{categoria.categoria}</h4>
                <div className="space-y-3">
                  {categoria.livros.map((livro, livroIdx) => (
                    <Card key={livroIdx} padding="none" className="p-5 transition-all duration-200 hover:shadow-md">
                      <details>
                        <summary className="cursor-pointer font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          <BookText className="w-4 h-4 text-sky-600" />
                          {livro.titulo}
                        </summary>
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
                              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Acessar Documento
                            </a>
                          )}
                        </div>
                      </details>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "manual" && (
          <div className="space-y-6">
            <div>
              <h3 className="heading-section text-slate-800 mb-2 flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-linear-to-b from-[#4285F4] to-[#3574D4]" />
                <BookOpenCheck className="w-5 h-5 text-blue-600" />
                Manual da Jornada Omnisfera: O Ciclo da Inclusão
              </h3>
              <p className="text-sm text-slate-600 mb-4">Fluxo de trabalho ideal conectando planejamento, AEE e prática.</p>
            </div>

            <div className="space-y-6">
              <div className="bg-linear-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-200/60 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-7 h-7 text-sky-600" />
                  <h4 className="text-lg font-bold text-slate-800">O Alicerce: Planejamento (PEI)</h4>
                </div>
                <blockquote className="border-l-4 border-sky-500 pl-4 italic text-slate-700 mb-3 text-sm">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  "Não há inclusão sem intenção. Conhecer para incluir."
                </blockquote>
                <p className="text-sm text-slate-700 mb-3">
                  Tudo começa na página <strong>Estratégias & PEI</strong>. Antes de pensar em recursos, precisamos mapear quem é o estudante.
                </p>
                <p className="text-sm font-semibold text-slate-800 mb-2">Ação na Plataforma:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 ml-2">
                  <li>Registre o histórico e o contexto clínico na aba Estudante (uso interno da equipe).</li>
                  <li>Mapeie as barreiras de aprendizagem (cognitivas, sensoriais ou físicas).</li>
                  <li>Use a IA para estruturar metas de curto, médio e longo prazo.</li>
                </ul>
                <div className="mt-4 bg-white rounded-lg p-3 border border-sky-200">
                  <p className="text-xs text-slate-700">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <strong>💡 Conceito Chave:</strong> O PEI não é um "laudo", é um projeto de futuro. Ele define O QUE vamos ensinar e QUAIS barreiras remover.
                  </p>
                </div>
              </div>

              <div className="bg-linear-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200/60 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Puzzle className="w-7 h-7 text-purple-600" />
                  <h4 className="text-lg font-bold text-slate-800">A Estratégia: O AEE e o Plano de Ação (PAEE)</h4>
                </div>
                <blockquote className="border-l-4 border-purple-500 pl-4 italic text-slate-700 mb-3 text-sm">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  "A articulação entre o suporte especializado e a sala comum."
                </blockquote>
                <p className="text-sm text-slate-700 mb-3">
                  Aqui entra a execução técnica do PEI. Na página <strong>Plano de Ação / PAEE</strong>, organizamos o Atendimento Especializado.
                </p>
                <p className="text-sm font-semibold text-slate-800 mb-2">Ação na Plataforma:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 ml-2">
                  <li>Defina a frequência e o foco dos atendimentos no contraturno.</li>
                  <li>Estabeleça a ponte com o professor regente.</li>
                  <li>Organize a Tecnologia Assistiva.</li>
                </ul>
                <div className="mt-4 bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-xs text-slate-700">
                    <strong>💡 Conceito Chave:</strong> O AEE não funciona isolado. Ele é o laboratório onde se testam as ferramentas que permitirão ao aluno acessar o currículo comum.
                  </p>
                </div>
              </div>

              <div className="bg-linear-to-br from-cyan-50 to-teal-50 rounded-xl border border-cyan-200/60 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Rocket className="w-7 h-7 text-cyan-600" />
                  <h4 className="text-lg font-bold text-slate-800">A Ferramenta: Adaptação (Hub de Inclusão)</h4>
                </div>
                <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-slate-700 mb-3 text-sm">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  "Acessibilidade é garantir que o conteúdo chegue a todos."
                </blockquote>
                <p className="text-sm text-slate-700 mb-3">
                  Com o plano definido, vamos construir a aula. A página <strong>Hub de Recursos</strong> é sua oficina.
                </p>
                <div className="mt-4 bg-white rounded-lg p-3 border border-cyan-200">
                  <p className="text-xs text-slate-700">
                    <strong>💡 Conceito Chave:</strong> Adaptar não é empobrecer o currículo, é torná-lo flexível.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-linear-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200/60 p-5">
                  <h4 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-rose-600" />
                    O Registro: Diário de Bordo
                  </h4>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  <p className="text-xs italic text-slate-700 mb-2">"O olhar atento transforma a prática."</p>
                  <p className="text-sm text-slate-700">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    Registre o que funcionou e o engajamento. Use o conceito de <strong>"outrar-se"</strong>.
                  </p>
                </div>
                <div className="bg-linear-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200/60 p-5">
                  <h4 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-slate-600" />
                    O Fechamento: Avaliação
                  </h4>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  <p className="text-xs italic text-slate-700 mb-2">"Avaliar para recalcular a rota."</p>
                  <p className="text-sm text-slate-700">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    Use as <strong>Rubricas</strong> para fugir do "achismo". Se a meta foi atingida, avançamos.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/60 p-6">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Resumo do Ecossistema</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-2 px-3 font-bold text-slate-800">Passo</th>
                        <th className="text-left py-2 px-3 font-bold text-slate-800">Módulo</th>
                        <th className="text-left py-2 px-3 font-bold text-slate-800">Função</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { passo: "1", modulo: "PEI", funcao: "Fundamentar: Quem é o aluno?" },
                        { passo: "2", modulo: "PAEE", funcao: "Estruturar: Suporte especializado." },
                        { passo: "3", modulo: "Hub", funcao: "Instrumentalizar: Criar recursos." },
                        { passo: "4", modulo: "Diário", funcao: "Registrar: Execução diária." },
                        { passo: "5", modulo: "Dados", funcao: "Validar: Medir sucesso." },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="py-2 px-3 font-semibold text-slate-700">{row.passo}</td>
                          <td className="py-2 px-3 font-semibold text-sky-600">{row.modulo}</td>
                          <td className="py-2 px-3 text-slate-600">{row.funcao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Restart Tour */}
              <div className="flex justify-center pt-2">
                <RestartTourButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
