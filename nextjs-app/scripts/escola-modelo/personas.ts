/**
 * Colégio Modelo — escola fictícia para avaliação aprofundada da Omnisfera (SCRUM-275).
 * TODAS as pessoas aqui são PERSONAS CRIADAS para demonstração: nenhum estudante, família,
 * profissional ou diagnóstico é real. Qualquer semelhança é coincidência.
 */

export const AVISO_PERSONA = "Persona fictícia, criada para demonstração da Omnisfera (Colégio Modelo).";
export const DOMINIO = "colegiomodelo.omnisfera.net";

export const ESCOLA = {
  nome: "Colégio Modelo",
  ano: 2026,
  turmas: [
    { chave: "inf5", grade_code: "5anos", serie: "Educação Infantil (5 anos)", grupo: "A", componente: "educacao_infantil" },
    { chave: "1a", grade_code: "1", serie: "1º Ano (EFAI)", grupo: "A", componente: "lingua_portuguesa" },
    { chave: "3a", grade_code: "3", serie: "3º Ano (EFAI)", grupo: "A", componente: "lingua_portuguesa" },
    { chave: "5a", grade_code: "5", serie: "5º Ano (EFAI)", grupo: "A", componente: "lingua_portuguesa" },
  ],
} as const;

export type ChaveTurma = (typeof ESCOLA.turmas)[number]["chave"];

export const DIRETORA = { nome: "Maria Aparecida Souza", login: "direcao", cargo: "Diretora (persona fictícia)" };

export type PersonaEquipe = {
  nome: string;
  login: string;
  cargo: string;
  papel: "coordenacao" | "professor" | "aee" | "apoio";
  turmas?: ChaveTurma[];
  estudantes?: string[]; // chaves dos estudantes (vínculo tutor)
};

export const EQUIPE: PersonaEquipe[] = [
  { nome: "Helena Prado", login: "coordenacao", cargo: "Coordenadora pedagógica (persona fictícia)", papel: "coordenacao" },
  { nome: "Juliana Reis", login: "aee", cargo: "Professora do AEE · sala de recursos (persona fictícia)", papel: "aee", estudantes: ["pedro", "laura", "gabriel", "sofia", "miguel", "alice"] },
  { nome: "Ana Paula Martins", login: "infantil5", cargo: "Professora do Infantil 5 (persona fictícia)", papel: "professor", turmas: ["inf5"] },
  { nome: "Carla Mendes", login: "1ano", cargo: "Professora do 1º ano (persona fictícia)", papel: "professor", turmas: ["1a"] },
  { nome: "Renata Lima", login: "3ano", cargo: "Professora do 3º ano (persona fictícia)", papel: "professor", turmas: ["3a"] },
  { nome: "Marcos Vieira", login: "5ano", cargo: "Professor do 5º ano (persona fictícia)", papel: "professor", turmas: ["5a"] },
  { nome: "Sônia Ferreira", login: "apoio", cargo: "Profissional de apoio escolar (persona fictícia)", papel: "apoio", estudantes: ["pedro", "miguel"] },
];

export type PersonaEstudante = {
  chave: string;
  nome: string;
  turma: ChaveTurma;
  nasc: string;
  diagnostico: string;
  pei: Record<string, unknown>;
};

const vigencia = { status: "vigente", versao: 1, vigente_desde: "2026-03-16", proxima_revisao: "2026-12-04", periodicidade: "semestral", fechado_por: "Helena Prado" };

export const ESTUDANTES: PersonaEstudante[] = [
  {
    chave: "pedro",
    nome: "Pedro Henrique Alves",
    turma: "inf5",
    nasc: "2021-03-14",
    diagnostico: "TEA (Transtorno do Espectro Autista), nível 1 de suporte",
    pei: {
      diagnostico: "TEA (Transtorno do Espectro Autista), nível 1 de suporte. Laudo do neuropediatra de 2024.",
      historico: `${AVISO_PERSONA} Pedro está no Colégio Modelo desde o Infantil 3. Começou a falar frases curtas aos 3 anos e meio, com apoio da fonoaudiologia. Hoje se comunica bem sobre o que gosta, mas tem dificuldade em pedir ajuda e em brincadeiras de faz de conta com os colegas. Mudanças de rotina (troca de sala, festas) costumam gerar choro e recusa.`,
      familia: "Moramos com o Pedro e a irmã mais velha, de 9 anos. Em casa ele adora montar trilhos de trem e repete os nomes das estações. A gente quer que ele faça amigos e consiga dizer quando algo incomoda, em vez de se esconder embaixo da mesa.",
      hiperfoco: "Trens e mapas de metrô",
      potencias: ["Memória Visual", "Hiperfoco Construtivo", "Curiosidade Investigativa"],
      rede_apoio: ["Fonoaudiólogo", "Terapeuta Ocupacional", "Neuropediatra"],
      composicao_familiar_tags: ["Mãe", "Pai", "Irmãos"],
      tecnologias_assistivas: ["Prancha de comunicação"],
      nivel_alfabetizacao: "Não se aplica (Educação Infantil)",
      barreiras_selecionadas: {
        "Comunicação e Linguagem": ["Pragmática (Uso social da língua)", "Intenção Comunicativa"],
        "Socioemocional": ["Interação Social com Pares", "Tolerância à Frustração"],
        "Funções Cognitivas": ["Flexibilidade Mental"],
      },
      niveis_suporte: {
        "Comunicação e Linguagem_Pragmática (Uso social da língua)": "Substancial",
        "Comunicação e Linguagem_Intenção Comunicativa": "Monitorado",
        "Socioemocional_Interação Social com Pares": "Substancial",
        "Socioemocional_Tolerância à Frustração": "Monitorado",
        "Funções Cognitivas_Flexibilidade Mental": "Substancial",
      },
      checklist_evidencias: { "Baixa tolerância à frustração": true, "Dependência de mediação (1:1)": true, "Dificuldade de generalização": true },
      estrategias_acesso: ["Pistas Visuais", "Rotina Estruturada"],
      estrategias_ensino: ["Modelagem", "Fragmentação de Tarefas"],
      estrategias_avaliacao: ["Parecer Descritivo", "Portfólio"],
      orientacoes_por_profissional: {
        "Fonoaudiólogo": "Usar perguntas fechadas com duas opções e esperar 10 segundos pela resposta. Valorizar qualquer pedido de ajuda.",
        "Terapeuta Ocupacional": "Antecipar barulhos fortes (sinal, festas). Oferecer o canto calmo com almofada quando ele se desorganizar.",
      },
      estudo_caso: {
        data: "2026-03-10",
        participantes: ["Coordenação", "Professor(a) regente", "Professor(a) do AEE", "Família", "Profissionais externos"],
        demandas: "Comunicação para pedir ajuda, participação nas brincadeiras com colegas e adaptação a mudanças de rotina.",
        contexto_escolar: "Turma de 18 crianças, rotina com quadro visual na porta da sala. Recreio no parque é o momento mais difícil.",
        necessita_aee: "sim",
        necessita_profissional_apoio: "sim",
        justificativa_apoio: "Apoio nas transições e no recreio, retirado aos poucos conforme ele ganha autonomia.",
        recursos: "Quadro de rotina com fotos, prancha de comunicação simples, cartões de 'preciso de ajuda' e 'quero parar'.",
        conclusao: "Pedro participa bem das atividades de interesse. O foco do semestre é comunicação funcional e brincadeiras em dupla.",
        concluido_em: "2026-03-12",
      },
      vigencia,
    },
  },
  {
    chave: "laura",
    nome: "Laura Beatriz Costa",
    turma: "1a",
    nasc: "2019-08-02",
    diagnostico: "Síndrome de Down (trissomia do 21)",
    pei: {
      diagnostico: "Síndrome de Down (trissomia do 21). Hipotireoidismo acompanhado pela pediatra.",
      historico: `${AVISO_PERSONA} Laura é alegre, sociável e adora música. Reconhece as letras do próprio nome e de alguns colegas. Cansa rápido em tarefas longas de escrita e precisa de mais tempo para responder. Tem boa memória para rotinas e canções.`,
      familia: "A Laura é muito carinhosa e quer fazer tudo o que a irmã faz. Em casa a gente lê histórias todas as noites. Queremos que ela aprenda a ler e ganhe independência para ir ao banheiro e lanchar sozinha.",
      hiperfoco: "Música e dança",
      potencias: ["Musicalidade/Ritmo", "Empatia/Cuidado com o outro", "Memória Visual"],
      rede_apoio: ["Fonoaudiólogo", "Terapeuta Ocupacional", "Psicopedagogo Clínico"],
      composicao_familiar_tags: ["Mãe", "Pai", "Irmãos"],
      lista_medicamentos: [{ nome: "Levotiroxina (fictício)", posologia: "1 comprimido em jejum", escola: false }],
      nivel_alfabetizacao: "Pré-Silábico (Letras aleatórias sem valor sonoro)",
      barreiras_selecionadas: {
        "Funções Cognitivas": ["Velocidade de Processamento", "Memória de Trabalho (Operacional)"],
        "Sensorial e Motor": ["Praxias Finas (Coordenação Fina)"],
        "Acadêmico": ["Decodificação Leitora", "Grafomotricidade (Escrita manual)"],
      },
      niveis_suporte: {
        "Funções Cognitivas_Velocidade de Processamento": "Substancial",
        "Funções Cognitivas_Memória de Trabalho (Operacional)": "Substancial",
        "Sensorial e Motor_Praxias Finas (Coordenação Fina)": "Monitorado",
        "Acadêmico_Decodificação Leitora": "Substancial",
        "Acadêmico_Grafomotricidade (Escrita manual)": "Monitorado",
      },
      checklist_evidencias: { "Fadiga mental rápida": true, "Lacuna em pré-requisitos": true },
      estrategias_acesso: ["Tempo Estendido", "Pistas Visuais", "Material Ampliado"],
      estrategias_ensino: ["Instrução Explícita", "Prática Guiada", "Fragmentação de Tarefas"],
      estrategias_avaliacao: ["Avaliação Prática (Demonstração)", "Portfólio", "Prova Oral"],
      orientacoes_por_profissional: {
        "Fonoaudiólogo": "Trabalhar consciência fonológica com músicas e rimas. Pedir que repita palavras novas em voz alta.",
        "Terapeuta Ocupacional": "Usar lápis mais grosso e engrossador. Atividades de pinça antes da escrita.",
      },
      estudo_caso: {
        data: "2026-03-09",
        participantes: ["Coordenação", "Professor(a) regente", "Professor(a) do AEE", "Família"],
        demandas: "Alfabetização inicial, coordenação fina para a escrita e autonomia na rotina (lanche, banheiro).",
        contexto_escolar: "Turma de 22 estudantes, com momentos de leitura compartilhada todos os dias.",
        necessita_aee: "sim",
        necessita_profissional_apoio: "nao",
        recursos: "Alfabeto móvel, letras em EVA, músicas com as sílabas do nome, material com letra bastão ampliada.",
        conclusao: "Laura aprende melhor com música e material concreto. Meta do semestre: escrever o nome sem modelo e reconhecer as vogais.",
        concluido_em: "2026-03-11",
      },
      vigencia,
    },
  },
  {
    chave: "gabriel",
    nome: "Gabriel Souza Lima",
    turma: "3a",
    nasc: "2017-11-20",
    diagnostico: "TDAH (Transtorno do Déficit de Atenção com Hiperatividade); dislexia em investigação",
    pei: {
      diagnostico: "TDAH, apresentação combinada. Dislexia em investigação pela neuropsicóloga (avaliação em andamento).",
      historico: `${AVISO_PERSONA} Gabriel é criativo, falante e ótimo em desafios práticos. Perde-se nas tarefas longas, levanta várias vezes e esquece o material. Lê devagar, troca letras parecidas (b/d, p/q) e fica frustrado quando precisa ler em voz alta para a turma.`,
      familia: "O Gabriel é muito esperto, mas acha que é 'burro' porque demora para ler. Em casa ele monta coisas com sucata o dia inteiro. A lição de casa vira briga todos os dias.",
      hiperfoco: "Construir robôs e engenhocas com sucata",
      potencias: ["Criatividade/Imaginação", "Resolução de Problemas", "Oralidade/Vocabulário"],
      rede_apoio: ["Neuropsicólogo", "Psicopedagogo Clínico", "Neuropediatra"],
      composicao_familiar_tags: ["Mãe", "Avó Materna"],
      nivel_alfabetizacao: "Silábico-Alfabético (Transição)",
      barreiras_selecionadas: {
        "Funções Cognitivas": ["Atenção Sustentada/Focada", "Planejamento e Organização"],
        "Socioemocional": ["Autoestima e Autoimagem", "Tolerância à Frustração"],
        "Acadêmico": ["Decodificação Leitora", "Produção Textual"],
      },
      niveis_suporte: {
        "Funções Cognitivas_Atenção Sustentada/Focada": "Substancial",
        "Funções Cognitivas_Planejamento e Organização": "Monitorado",
        "Socioemocional_Autoestima e Autoimagem": "Monitorado",
        "Socioemocional_Tolerância à Frustração": "Monitorado",
        "Acadêmico_Decodificação Leitora": "Substancial",
        "Acadêmico_Produção Textual": "Substancial",
      },
      checklist_evidencias: { "Oscilação de foco": true, "Desorganização de materiais": true, "Dificuldade de iniciar tarefas": true, "Baixa tolerância à frustração": true },
      estrategias_acesso: ["Tempo Estendido", "Apoio Leitura/Escrita"],
      estrategias_ensino: ["Fragmentação de Tarefas", "Organizadores Gráficos", "Instrução Explícita"],
      estrategias_avaliacao: ["Prova Oral", "Questões Menores por Bloco", "Prova Adaptada"],
      orientacoes_por_profissional: {
        "Neuropsicólogo": "Evitar leitura em voz alta para a turma sem aviso. Dividir a tarefa em blocos de 10 minutos com checagem.",
        "Psicopedagogo Clínico": "Usar letra bastão e espaçamento maior. Valorizar a resposta oral.",
      },
      estudo_caso: {
        data: "2026-03-12",
        participantes: ["Coordenação", "Professor(a) regente", "Professor(a) do AEE", "Família", "Profissionais externos"],
        demandas: "Atenção nas tarefas, organização do material, leitura e autoestima como estudante.",
        contexto_escolar: "Turma de 25 estudantes, senta perto da janela. Rende muito mais em atividades em grupo e mão na massa.",
        necessita_aee: "sim",
        necessita_profissional_apoio: "nao",
        recursos: "Checklist de rotina na mesa, timer visual, textos com fonte ampliada e espaçamento, provas com menos questões por página.",
        conclusao: "Gabriel aprende fazendo. Prioridade: leitura com apoio e organização, sem expô-lo diante da turma.",
        concluido_em: "2026-03-14",
      },
      vigencia,
    },
  },
  {
    chave: "sofia",
    nome: "Sofia Ribeiro Nunes",
    turma: "3a",
    nasc: "2018-02-08",
    diagnostico: "Baixa visão (deficiência visual)",
    pei: {
      diagnostico: "Baixa visão por retinopatia congênita. Acuidade reduzida para longe e para perto; usa óculos com lente especial.",
      historico: `${AVISO_PERSONA} Sofia é dedicada, organizada e gosta muito de ouvir histórias. Lê com o rosto bem perto do papel e se cansa com textos de letra pequena. Não enxerga o que está no quadro sem ajuda. Tem ótima memória auditiva.`,
      familia: "A Sofia é muito caprichosa e não gosta de parecer diferente. Às vezes ela não pede para ampliar o material para não chamar atenção.",
      hiperfoco: "Audiolivros e podcasts de histórias",
      potencias: ["Oralidade/Vocabulário", "Musicalidade/Ritmo", "Empatia/Cuidado com o outro"],
      rede_apoio: ["Oftalmologista", "Terapeuta Ocupacional"],
      composicao_familiar_tags: ["Mãe", "Pai"],
      tecnologias_assistivas: ["Ampliador de tela", "Suporte de livros", "Gravador de áudio"],
      nivel_alfabetizacao: "Alfabético (Escrita fonética, com erros ortográficos)",
      barreiras_selecionadas: {
        "Sensorial e Motor": ["Hipersensibilidade Sensorial"],
        "Acadêmico": ["Decodificação Leitora", "Grafomotricidade (Escrita manual)"],
        "Socioemocional": ["Autoestima e Autoimagem"],
      },
      niveis_suporte: {
        "Sensorial e Motor_Hipersensibilidade Sensorial": "Monitorado",
        "Acadêmico_Decodificação Leitora": "Substancial",
        "Acadêmico_Grafomotricidade (Escrita manual)": "Monitorado",
        "Socioemocional_Autoestima e Autoimagem": "Monitorado",
      },
      checklist_evidencias: { "Fadiga mental rápida": true },
      estrategias_acesso: ["Material Ampliado", "Tecnologia Assistiva", "Mobiliário Adaptado"],
      estrategias_ensino: ["Instrução Explícita", "Organizadores Gráficos"],
      estrategias_avaliacao: ["Prova Adaptada", "Prova Oral"],
      orientacoes_por_profissional: {
        "Oftalmologista": "Fonte mínima 24, alto contraste (preto no amarelo claro). Sentar na primeira fila, de costas para a janela.",
      },
      estudo_caso: {
        data: "2026-03-11",
        participantes: ["Coordenação", "Professor(a) regente", "Professor(a) do AEE", "Família"],
        demandas: "Acesso ao material escrito e ao quadro, leitura sem cansaço e participação sem constrangimento.",
        contexto_escolar: "Mesma turma do Gabriel. Sala clara, com reflexo da janela no quadro à tarde.",
        necessita_aee: "sim",
        necessita_profissional_apoio: "nao",
        recursos: "Material ampliado em A3, suporte inclinado, lupa eletrônica, foto do quadro no tablet da escola.",
        conclusao: "Com o material certo, Sofia acompanha a turma. Foco: autonomia para pedir o recurso e uso da lupa eletrônica.",
        concluido_em: "2026-03-13",
      },
      vigencia,
    },
  },
  {
    chave: "miguel",
    nome: "Miguel Andrade Rocha",
    turma: "5a",
    nasc: "2015-06-30",
    diagnostico: "TEA (Transtorno do Espectro Autista), nível 2 de suporte",
    pei: {
      diagnostico: "TEA nível 2 de suporte, com hipersensibilidade auditiva. Acompanhamento com psiquiatra infantil.",
      historico: `${AVISO_PERSONA} Miguel lê bem e tem ótima memória para fatos sobre dinossauros e planetas. Barulho alto, mudança de professor e filas o desorganizam: tapa os ouvidos, grita ou sai da sala. Usa abafador de ruído. Tem dificuldade em trabalhos em grupo e em entender ironias.`,
      familia: "O Miguel é muito inteligente, mas sofre com o barulho. Quando chega em casa depois de um dia difícil, fica horas sem falar. Queremos que a escola nos avise antes de passeios e mudanças.",
      hiperfoco: "Dinossauros e sistema solar",
      potencias: ["Memória Visual", "Curiosidade Investigativa", "Cálculo Mental Rápido"],
      rede_apoio: ["Psiquiatra Infantil", "Psicólogo Clínico", "Terapeuta Ocupacional", "Acompanhante Terapêutico (AT)"],
      composicao_familiar_tags: ["Pai", "Avó Paterna"],
      acompanhante_nome: "Sônia Ferreira",
      acompanhante_carga_horaria: "Período integral das aulas",
      lista_medicamentos: [{ nome: "Risperidona (fictício)", posologia: "à noite", escola: false }],
      nivel_alfabetizacao: "Ortográfico (Escrita convencional consolidada)",
      barreiras_selecionadas: {
        "Sensorial e Motor": ["Hipersensibilidade Sensorial"],
        "Socioemocional": ["Regulação Emocional (Autocontrole)", "Interação Social com Pares"],
        "Comunicação e Linguagem": ["Pragmática (Uso social da língua)"],
        "Funções Cognitivas": ["Flexibilidade Mental"],
      },
      niveis_suporte: {
        "Sensorial e Motor_Hipersensibilidade Sensorial": "Muito Substancial",
        "Socioemocional_Regulação Emocional (Autocontrole)": "Substancial",
        "Socioemocional_Interação Social com Pares": "Substancial",
        "Comunicação e Linguagem_Pragmática (Uso social da língua)": "Substancial",
        "Funções Cognitivas_Flexibilidade Mental": "Substancial",
      },
      checklist_evidencias: { "Recusa de tarefas": true, "Baixa tolerância à frustração": true, "Dependência de mediação (1:1)": true },
      estrategias_acesso: ["Sala Silenciosa", "Rotina Estruturada", "Pistas Visuais"],
      estrategias_ensino: ["Instrução Explícita", "Andaimagem (Scaffolding)", "Organizadores Gráficos"],
      estrategias_avaliacao: ["Prova Adaptada", "Consulta Permitida", "Questões Menores por Bloco"],
      orientacoes_por_profissional: {
        "Psiquiatra Infantil": "Antecipar mudanças com um dia de antecedência. Permitir saída para o canto calmo sem precisar pedir.",
        "Terapeuta Ocupacional": "Abafador de ruído liberado. Evitar filas: ele entra primeiro ou por último.",
      },
      estudo_caso: {
        data: "2026-03-09",
        participantes: ["Coordenação", "Direção", "Professor(a) regente", "Professor(a) do AEE", "Profissional de apoio", "Família", "Profissionais externos"],
        demandas: "Regulação sensorial e emocional, participação em atividades coletivas e previsibilidade da rotina.",
        contexto_escolar: "Turma de 27 estudantes, sala ao lado da quadra (barulho no 3º e 4º horários).",
        necessita_aee: "sim",
        necessita_profissional_apoio: "sim",
        justificativa_apoio: "Crises sensoriais frequentes e necessidade de mediação nas transições e no recreio.",
        recursos: "Abafador de ruído, canto calmo, agenda visual do dia, cartão de pausa, aviso prévio de mudanças.",
        conclusao: "Miguel acompanha o conteúdo do 5º ano. O PEI foca regulação, previsibilidade e participação em duplas antes de grupos.",
        concluido_em: "2026-03-13",
      },
      vigencia,
    },
  },
  {
    chave: "alice",
    nome: "Alice Fernandes Duarte",
    turma: "5a",
    nasc: "2015-09-12",
    diagnostico: "Altas habilidades/superdotação (área acadêmica)",
    pei: {
      diagnostico: "Altas habilidades/superdotação na área acadêmica (matemática e ciências), identificada por avaliação neuropsicológica em 2025.",
      historico: `${AVISO_PERSONA} Alice termina as tarefas muito antes da turma e se entedia. Faz perguntas além do conteúdo e às vezes corrige o professor. É perfeccionista: fica muito frustrada quando erra e evita atividades em que não se sente boa, como educação física.`,
      familia: "A Alice lê livros de adulto e pergunta sobre o universo. Mas chora quando tira nota menor que 10. Queremos que ela seja desafiada sem perder a infância.",
      hiperfoco: "Astronomia e quebra-cabeças lógicos",
      potencias: ["Cálculo Mental Rápido", "Resolução de Problemas", "Curiosidade Investigativa", "Liderança Natural"],
      rede_apoio: ["Psicólogo Clínico", "Neuropsicólogo"],
      composicao_familiar_tags: ["Mãe", "Mãe 2"],
      nivel_alfabetizacao: "Ortográfico (Escrita convencional consolidada)",
      barreiras_selecionadas: {
        "Socioemocional": ["Tolerância à Frustração", "Regulação Emocional (Autocontrole)", "Interação Social com Pares"],
      },
      niveis_suporte: {
        "Socioemocional_Tolerância à Frustração": "Monitorado",
        "Socioemocional_Regulação Emocional (Autocontrole)": "Monitorado",
        "Socioemocional_Interação Social com Pares": "Monitorado",
      },
      checklist_evidencias: { "Baixa tolerância à frustração": true },
      estrategias_acesso: [],
      estrategias_ensino: ["Ensino Híbrido", "Mapas Mentais", "Andaimagem (Scaffolding)"],
      estrategias_avaliacao: ["Portfólio", "Autoavaliação", "Avaliação Prática (Demonstração)"],
      orientacoes_por_profissional: {
        "Psicólogo Clínico": "Elogiar o esforço e a estratégia, não o resultado. Propor desafios com erro esperado.",
      },
      estudo_caso: {
        data: "2026-03-16",
        participantes: ["Coordenação", "Professor(a) regente", "Professor(a) do AEE", "Família", "O próprio estudante"],
        demandas: "Enriquecimento curricular em matemática e ciências e manejo do perfeccionismo e da frustração.",
        contexto_escolar: "Mesma turma do Miguel. É procurada pelos colegas para explicar exercícios.",
        necessita_aee: "sim",
        necessita_profissional_apoio: "nao",
        recursos: "Projeto de astronomia no AEE, olimpíada de matemática, monitoria de colegas com regras combinadas.",
        conclusao: "Alice precisa de desafio e de espaço para errar. Enriquecimento no AEE e acompanhamento socioemocional.",
        concluido_em: "2026-03-18",
      },
      vigencia,
    },
  },
];

export const FAMILIAS = [
  { nome: "Patrícia Alves", login: "familia.pedro", parentesco: "Mãe", estudantes: ["pedro"] },
  { nome: "Roberto Rocha", login: "familia.miguel", parentesco: "Pai", estudantes: ["miguel"] },
];
