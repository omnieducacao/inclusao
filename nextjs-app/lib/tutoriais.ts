/**
 * Passo a passo de cada módulo (o "Como funciona" no topo de cada tela) e os vídeos curtos.
 * Escrito para a professora do AEE (Atendimento Educacional Especializado), na ordem da jornada (lib/jornada.ts).
 * Os nomes de abas e botões são os da tela; se mudar a tela, mude aqui.
 * Vídeos: public/tutoriais/<id>.mp4, .webm e .webp (capa), gerados por scripts/tutoriais (motor.html + gravar.py).
 */
import type { EtapaId } from "@/lib/jornada";

export type PassoTutorial = { titulo: string; texto: string };
export type Tutorial = {
  id: EtapaId;
  /** Para que serve, numa frase. */
  paraQue: string;
  passos: PassoTutorial[];
  dica?: string;
  /** Tem vídeo em public/tutoriais. */
  video: boolean;
};

export const TUTORIAIS: Record<EtapaId, Tutorial> = {
  estudantes: {
    id: "estudantes",
    paraQue: "Cadastrar cada estudante e abrir a ficha, de onde se chega a tudo o que já foi feito com ele.",
    passos: [
      { titulo: "Cadastre", texto: "Em \"Cadastrar estudante\", informe nome, série e turma. O laudo não é condição: ele entra depois, no estudo de caso, se existir." },
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
      { titulo: "4. Revisão", texto: "Acompanhe e revise. É aqui que você libera o resumo para a família." },
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
      { titulo: "Registre", texto: "Data, duração, como foi (individual, grupo, observação em sala), o que foi feito e como o estudante respondeu (engajamento de 1 a 5)." },
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
      { titulo: "Escolha o estudante", texto: "Veja a evolução por componente (da diagnóstica a cada período), o resumo do diário e o ciclo do PAEE em andamento." },
      { titulo: "Volte ao PEI", texto: "Com o que a evolução mostrou, revise metas e estratégias no PEI." },
    ],
    video: true,
  },
  "pei-professor": {
    id: "pei-professor",
    paraQue: "Para o professor regente: ler o PEI, dar ciência e fazer a parte da sua disciplina.",
    passos: [
      { titulo: "Ler e dar ciência", texto: "Leia o PEI vigente de cada estudante da sua turma e confirme a ciência." },
      { titulo: "Minha disciplina", texto: "Siga as três etapas: plano de ensino, diagnóstica da disciplina e PEI da disciplina." },
      { titulo: "Crie o material", texto: "Use o Hub para adaptar atividades e provas a partir do PEI." },
    ],
    video: false,
  },
  "plano-de-ensino": {
    id: "plano-de-ensino",
    paraQue: "O planejamento do componente e da série, que o PEI da disciplina adapta.",
    passos: [
      { titulo: "Escolha componente e série", texto: "Aparecem os que a coordenação ligou a você em Equipe e papéis." },
      { titulo: "Monte o plano", texto: "Habilidades da BNCC, objetivos e avaliação de cada período." },
    ],
    video: false,
  },
};

export function tutorialDe(id: EtapaId): Tutorial {
  return TUTORIAIS[id];
}

export function videoDoTutorial(id: EtapaId): { mp4: string; webm: string; capa: string } | null {
  if (!TUTORIAIS[id]?.video) return null;
  return { mp4: `/tutoriais/${id}.mp4`, webm: `/tutoriais/${id}.webm`, capa: `/tutoriais/${id}.webp` };
}
