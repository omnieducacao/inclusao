/**
 * Passo a passo de cada módulo (o "Como funciona" no topo de cada tela) e os vídeos curtos.
 * Escrito para a professora do AEE (Atendimento Educacional Especializado), na ordem da jornada (lib/jornada.ts).
 * Os nomes de abas e botões são os da tela; se mudar a tela, mude aqui.
 * Vídeos: public/tutoriais/<id>.mp4, .webm e .webp (capa), gerados por scripts/tutoriais (motor.html + gravar.py).
 */
import type { EtapaId } from "@/lib/jornada";

export type PassoTutorial = { titulo: string; texto: string };
/** As etapas da jornada e as telas da gestão da escola, que não entram na jornada do estudante. */
export type TutorialId = EtapaId | "config-escola" | "equipe" | "pgi" | "central";

export type Tutorial = {
  id: TutorialId;
  /** Para que serve, numa frase. */
  paraQue: string;
  passos: PassoTutorial[];
  dica?: string;
  /** Tem vídeo em public/tutoriais. */
  video: boolean;
};

export const TUTORIAIS: Record<TutorialId, Tutorial> = {
  estudantes: {
    id: "estudantes",
    paraQue: "Cadastrar cada estudante e abrir a ficha, de onde se chega a tudo o que já foi feito com ele.",
    passos: [
      { titulo: "Cadastre", texto: "Em \"Cadastrar estudante\", informe o nome e a turma e marque que a família autorizou o registro. O laudo não é condição: ele entra depois, no estudo de caso, se existir." },
      { titulo: "Abra a ficha", texto: "Clique no nome. A ficha mostra a situação do PEI, do PAEE, do diário e das avaliações, cada um com um atalho." },
      { titulo: "Siga para o PEI", texto: "Na ficha, \"PEI\" abre o estudo de caso desse estudante." },
    ],
    dica: "Use o filtro \"Situação do PEI\" para achar quem está sem PEI ou com revisão vencida.",
    video: true,
  },
  pei: {
    id: "pei",
    paraQue: "Construir o Plano Educacional Individualizado em quatro etapas, do estudo de caso à revisão.",
    passos: [
      { titulo: "1. Estudo de caso", texto: "Dados do estudante, estudo de caso e, no modo completo, evidências, rede de apoio e barreiras e potências. Escreva o que observa, não o diagnóstico." },
      { titulo: "2. PEI", texto: "Em \"Texto do PEI\", a IA (inteligência artificial) propõe metas e estratégias a partir do estudo de caso; você revisa. Ligue as habilidades da BNCC (Base Nacional Comum Curricular) e monte o plano de ação." },
      { titulo: "3. Vigente e ciência", texto: "Torne o PEI vigente com a data da próxima revisão e envie aos professores regentes, que dão ciência." },
      { titulo: "4. Revisão", texto: "Acompanhe e revise. Em \"Acompanhamento\", no cartão \"Resumo para a família\", escreva o resumo em linguagem simples e use \"Liberar para a família\"." },
    ],
    dica: "Com o PEI vigente, o próximo passo aparece no fim da tela: planejar o AEE (PAEE), avaliar e criar materiais.",
    video: true,
  },
  paee: {
    id: "paee",
    paraQue: "Transformar as metas do PEI em ciclos de atendimento do AEE.",
    passos: [
      { titulo: "1. Avaliar", texto: "Em \"Barreiras\", veja o que impede a participação do estudante, a partir do PEI." },
      { titulo: "2. Planejar", texto: "Monte o plano de habilidades, escolha os recursos de acessibilidade e gere o ciclo do AEE: duração, frequência e as metas do PEI que ele vai trabalhar." },
      { titulo: "3. Atender", texto: "Em \"Execução e metas\", acompanhe semana a semana. A \"Jornada do estudante\" conta o caminho dele." },
      { titulo: "4. Articular", texto: "Em \"Com o professor da sala\", combine o que levar para a sala de aula." },
    ],
    dica: "O ciclo parte das metas do PEI. Se o PEI ainda não tem metas, o aviso leva direto ao Texto do PEI.",
    video: true,
  },
  hub: {
    id: "hub",
    paraQue: "Criar atividades, provas e recursos adaptados ao PEI do estudante.",
    passos: [
      { titulo: "Escolha o estudante", texto: "O Hub usa o perfil dele (interesses, barreiras e estratégias do PEI) em cada material." },
      { titulo: "Escolha a ferramenta", texto: "Adaptar prova, adaptar atividade, criar questões, plano de aula com DUA (Desenho Universal para a Aprendizagem), estúdio visual e outras." },
      { titulo: "Gere e revise", texto: "Confira o material, ajuste o que precisar e baixe. Tudo fica no histórico do estudante." },
    ],
    dica: "Na Educação Infantil aparecem ferramentas próprias, como Rotina e AVD (atividades de vida diária) e Inclusão no brincar.",
    video: true,
  },
  diario: {
    id: "diario",
    paraQue: "Registrar cada atendimento em poucos toques, para não depender da memória na hora de avaliar e revisar.",
    passos: [
      { titulo: "Registre", texto: "Data, duração, como foi (individual, grupo, observação em sala), o que foi feito, as metas do ciclo do AEE trabalhadas e como o estudante respondeu (engajamento de 1 a 5)." },
      { titulo: "Acompanhe na linha do tempo", texto: "Os registros ficam ao lado do formulário, do mais recente para o mais antigo." },
      { titulo: "Analise e gere relatórios", texto: "Em \"Análise\", filtre por período e modalidade. Em \"Relatórios\", a IA resume o período." },
    ],
    dica: "Marque \"Avisar o professor da sala\" quando algo importante precisar chegar logo à sala de aula: ele recebe um aviso no sino.",
    video: true,
  },
  avaliacao: {
    id: "avaliacao",
    paraQue: "Ver onde o estudante está (diagnóstica) e como evolui (processual), descritor por descritor, na escala de 0 a 4: quanto apoio ele precisa.",
    passos: [
      { titulo: "Escolha estudante e componente", texto: "Na diagnóstica, cada componente mostra se já foi avaliado." },
      { titulo: "Escolha de 6 a 10 descritores", texto: "Os que mais pesam agora. Com defasagem, escolha um ano de referência abaixo da série." },
      { titulo: "Observe ou aplique a prova", texto: "Marque o nível observando em sala, ou use \"Avaliar com prova em papel\": a IA monta a prova adaptada, você imprime e corrige pela grade ou por foto." },
      { titulo: "Conclua e acompanhe", texto: "Os níveis viram sugestão de meta no PEI. Na aba Processual, registre cada período sobre os mesmos descritores." },
    ],
    dica: "A escala mede apoio, não nota: 4 é fazer sozinho, com autonomia.",
    video: true,
  },
  evolucao: {
    id: "evolucao",
    paraQue: "Juntar avaliações, diário e PAEE para decidir os próximos passos com cada estudante.",
    passos: [
      { titulo: "Visão da escola", texto: "Sem estudante escolhido, a tela mostra quem precisa de atenção: revisões vencidas ou chegando, PEIs em rascunho e PEIs vigentes sem ciclo de AEE." },
      { titulo: "Escolha o estudante", texto: "Veja a evolução por componente (da diagnóstica a cada período), o resumo do diário e o ciclo do PAEE em andamento, com quantas vezes cada meta foi trabalhada." },
      { titulo: "Volte ao PEI", texto: "Com o que a evolução mostrou, revise metas e estratégias no PEI." },
    ],
    video: true,
  },
  "pei-professor": {
    id: "pei-professor",
    paraQue: "Para o professor da sala: ler o PEI de cada estudante, dar ciência e fazer a parte da sua disciplina.",
    passos: [
      { titulo: "Ler e dar ciência", texto: "Na aba \"Ler e dar ciência\", abra \"Ler o PEI\": interesses, potencialidades e as estratégias de acesso, de ensino e de avaliação. Depois, \"Li e estou ciente\". Quando o PEI muda de versão, a leitura é pedida de novo." },
      { titulo: "Minha disciplina: plano de ensino", texto: "Na aba \"Minha disciplina\", escolha o estudante e a disciplina. Em \"Plano de ensino\", use o plano da turma (\"Usar este plano\") ou crie um no módulo Plano de ensino." },
      { titulo: "Avaliação diagnóstica", texto: "Avalie o estudante na sua disciplina. Com a diagnóstica concluída, a disciplina segue para o PEI da disciplina." },
      { titulo: "PEI da disciplina", texto: "\"Sugerir adaptações\" cruza o plano da turma com o nível do estudante. Revise e use \"Concluir e enviar à coordenação\", com um recado se quiser." },
      { titulo: "Leve para a sala", texto: "Crie atividades e provas adaptadas no Hub e registre no Diário o que observou." },
    ],
    dica: "Se a coordenação devolver uma disciplina com um recado, ele aparece em \"Minha disciplina\" e no sino.",
    video: true,
  },
  "plano-de-ensino": {
    id: "plano-de-ensino",
    paraQue: "O planejamento do componente e da série para a turma toda. O PEI da disciplina parte dele para adaptar.",
    passos: [
      { titulo: "Escolha componente e série", texto: "Aparecem os componentes que a coordenação ligou a você em Equipe e papéis. Cada série mostra \"Sem plano ainda\" ou \"Plano feito\"." },
      { titulo: "Monte a sequência", texto: "Escolha o período, a unidade temática, o objeto de conhecimento e as habilidades da BNCC. \"Sugerir com IA\" propõe objetivos, metodologia, recursos e avaliação; você ajusta." },
      { titulo: "Adicione os blocos", texto: "\"Adicionar à sequência\" guarda cada bloco. O plano salva sozinho." },
      { titulo: "Use no PEI da disciplina", texto: "No PEI do professor, em \"Minha disciplina\", o plano aparece para ser usado com cada estudante." },
    ],
    video: true,
  },
  "config-escola": {
    id: "config-escola",
    paraQue: "O primeiro passo da escola: ano letivo, séries e turmas, e como a escola trabalha a inclusão.",
    passos: [
      { titulo: "1. Ano letivo", texto: "\"Adicionar ano letivo\". As turmas ficam dentro dele." },
      { titulo: "2. Séries", texto: "Marque as séries que a escola oferece e use \"Salvar séries\". Só elas aparecem na hora de criar turmas." },
      { titulo: "3. Turmas", texto: "Etapa, série e letra da turma, e \"Adicionar turma\". É pela turma que cada professor fica ligado aos estudantes." },
      { titulo: "Como a escola trabalha", texto: "Completo: o PEI vai a cada professor, que faz a parte da sua disciplina. Simplificado: um PEI único, que os professores leem e dão ciência. Aqui também se liga a área da família." },
    ],
    dica: "Depois das turmas, cadastre a equipe em Equipe e papéis.",
    video: true,
  },
  equipe: {
    id: "equipe",
    paraQue: "Quem trabalha na escola, o papel de cada um, as páginas que abre e os estudantes com quem trabalha.",
    passos: [
      { titulo: "Convide", texto: "\"Convidar pessoa\" → \"Equipe da escola\". Nome, e-mail, uma senha inicial e o papel na escola (Direção, Coordenação, Professor, Professor do AEE, Profissional de apoio). O papel já marca as páginas que a pessoa abre." },
      { titulo: "Vínculo com estudantes", texto: "Toda a escola, as turmas em que dá aula (com os componentes curriculares) ou estudantes escolhidos um a um. É o vínculo que leva o PEI ao professor certo." },
      { titulo: "Famílias", texto: "Com a área da família ligada, \"Convidar pessoa\" → \"Família\" cadastra o responsável e o estudante dele." },
    ],
    dica: "Professor sem turma e componente não recebe PEI para a disciplina dele.",
    video: true,
  },
  pgi: {
    id: "pgi",
    paraQue: "O Plano de Gestão Inclusiva: o acolhimento antes da matrícula e o plano da escola em infraestrutura, equipe e cultura.",
    passos: [
      { titulo: "Acolhimento", texto: "O roteiro para receber a família e o estudante antes da matrícula." },
      { titulo: "O plano da escola", texto: "Use \"Ações prontas\", \"Sugerir ações com IA\" ou \"Adicionar ação ao plano\": o que fazer, por quê, quem, onde, como e quanto custa." },
      { titulo: "Dimensionamento", texto: "Opcional: quantos estudantes, quantos com deficiência e quantos profissionais, para a IA sugerir ações do tamanho da escola." },
    ],
    video: false,
  },
  central: {
    id: "central",
    paraQue: "A lei, os termos e o caminho do estudante na Omnisfera, em linguagem de sala de aula.",
    passos: [
      { titulo: "A lei em 1 minuto", texto: "O que a escola precisa garantir, sem juridiquês." },
      { titulo: "Glossário e Como falar", texto: "Os termos do dia a dia e as expressões que vale evitar, com o porquê." },
      { titulo: "O ciclo na Omnisfera", texto: "Do cadastro à revisão do PEI: quem faz cada passo e em que tela." },
    ],
    video: false,
  },
};

export function tutorialDe(id: TutorialId): Tutorial {
  return TUTORIAIS[id];
}

export function videoDoTutorial(id: TutorialId): { mp4: string; webm: string; capa: string } | null {
  if (!TUTORIAIS[id]?.video) return null;
  return { mp4: `/tutoriais/${id}.mp4`, webm: `/tutoriais/${id}.webm`, capa: `/tutoriais/${id}.webp` };
}
