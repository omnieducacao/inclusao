/**
 * Serviço de Prompts para o Hub de Inclusão
 * Baseado em services/hub_ia.py do Streamlit
 * Todos os prompts devem ser idênticos à versão Streamlit
 */

export interface CriarAtividadeParams {
  materia: string;
  objeto: string;
  qtd: number;
  tipo_q: "Objetiva" | "Discursiva";
  qtd_imgs: number;
  verbos_bloom?: string[];
  habilidades_bncc?: string[];
  modo_profundo?: boolean;
  checklist_adaptacao?: Record<string, boolean>;
  hiperfoco?: string;
  ia_sugestao?: string;
}

export function criarPromptProfissional(params: CriarAtividadeParams): string {
  const {
    materia,
    objeto,
    qtd,
    tipo_q,
    qtd_imgs,
    verbos_bloom = [],
    habilidades_bncc = [],
    modo_profundo = false,
    checklist_adaptacao = {},
    hiperfoco = "Geral",
    ia_sugestao = "",
  } = params;

  // Instrução de imagens
  const instrucao_img =
    qtd_imgs > 0
      ? `Incluir imagens em ${qtd_imgs} questões (use [[GEN_IMG: termo]]). REGRA DE POSIÇÃO: A tag da imagem ([[GEN_IMG: termo]]) DEVE vir logo APÓS o enunciado e ANTES das alternativas.`
      : "Sem imagens.";

  // Instrução de Bloom
  let instrucao_bloom = "";
  if (verbos_bloom.length > 0) {
    const lista_verbos = verbos_bloom.join(", ");
    instrucao_bloom = `
6. TAXONOMIA DE BLOOM (RIGOROSO):
   - Utilize OBRIGATORIAMENTE os seguintes verbos de ação selecionados: ${lista_verbos}.
   - Distribua esses verbos entre as questões criadas.
   - REGRA DE FORMATAÇÃO: O verbo de comando deve vir no início do enunciado, em **NEGRITO E CAIXA ALTA** (Ex: **ANALISE**, **IDENTIFIQUE**, **EXPLIQUE**).
   - Use apenas UM verbo de comando por questão.
`;
  }

  // Instrução de habilidades BNCC
  let instrucao_habilidades = "";
  if (habilidades_bncc.length > 0) {
    const habilidades_str = habilidades_bncc.map((h) => `- ${h}`).join("\n");
    instrucao_habilidades = `
7. HABILIDADES BNCC (RIGOROSO):
   - Alinhe as questões com as seguintes habilidades da BNCC:
   ${habilidades_str}
   - Inclua referências às habilidades nos enunciados quando pertinente.
`;
  }

  // Montar instruções do checklist de adaptação
  let instrucoes_checklist = "";
  const necessidades_ativas: string[] = [];
  if (checklist_adaptacao.questoes_desafiadoras) {
    necessidades_ativas.push("Incluir questões mais desafiadoras");
  } else {
    necessidades_ativas.push("Manter nível de dificuldade acessível");
  }
  if (!checklist_adaptacao.compreende_instrucoes_complexas) {
    necessidades_ativas.push("Usar instruções simples e diretas");
  }
  if (checklist_adaptacao.instrucoes_passo_a_passo) {
    necessidades_ativas.push("Fornecer instruções passo a passo");
  }
  if (checklist_adaptacao.dividir_em_etapas) {
    necessidades_ativas.push("Dividir em etapas menores");
  }
  if (checklist_adaptacao.paragrafos_curtos) {
    necessidades_ativas.push("Usar parágrafos curtos");
  }
  if (checklist_adaptacao.dicas_apoio) {
    necessidades_ativas.push("Incluir dicas de apoio");
  }
  if (!checklist_adaptacao.compreende_figuras_linguagem) {
    necessidades_ativas.push("Evitar figuras de linguagem complexas");
  }
  if (checklist_adaptacao.descricao_imagens) {
    necessidades_ativas.push("Incluir descrição de imagens quando houver");
  }
  if (necessidades_ativas.length > 0) {
    instrucoes_checklist = `
8. CHECKLIST DE ADAPTAÇÃO (baseado no PEI):
   ${necessidades_ativas.map((n) => `- ${n}`).join("\n   ")}
   Aplique essas orientações de forma coerente nas questões criadas.
`;
  }

  // Formato baseado no tipo
  const diretriz_tipo =
    tipo_q === "Discursiva"
      ? "3. FORMATO DISCURSIVO (RIGOROSO): Crie apenas questões abertas. NÃO inclua alternativas, apenas linhas para resposta."
      : "3. FORMATO OBJETIVO: Crie questões de múltipla escolha com distratores inteligentes.";

  const style = modo_profundo
    ? "Atue como uma banca examinadora rigorosa."
    : "Atue como professor elaborador.";

  return `
${style}
Crie prova de ${materia} (${objeto}). QTD: ${qtd} (${tipo_q}).

DIRETRIZES: 
1. Contexto Real. 
2. Hiperfoco (${hiperfoco}) em 30%. 
${diretriz_tipo}
4. Imagens: ${instrucao_img} (NUNCA repita a mesma imagem). 
5. Divisão Clara.

REGRA DE OURO GRAMATICAL (IMPERATIVO):
- TODOS os comandos das questões devem estar no modo IMPERATIVO (Ex: "Cite", "Explique", "Calcule", "Analise", "Escreva").
- JAMAIS use o infinitivo (Ex: "Citar", "Explicar", "Calcular").
- Se houver verbos de Bloom selecionados, CONJUGUE-OS para o IMPERATIVO.
- O verbo de comando deve vir no início do enunciado, em **NEGRITO E CAIXA ALTA** (Ex: **ANALISE**, **IDENTIFIQUE**).

${ia_sugestao ? `
9. PERFIL DO ESTUDANTE (PEI):
   Considere o seguinte perfil ao elaborar as questões:
   ${ia_sugestao.slice(0, 800)}
   Adapte linguagem, complexidade e abordagem de acordo com as necessidades indicadas.
` : ""}${instrucao_bloom}${instrucao_habilidades}${instrucoes_checklist}

SAÍDA OBRIGATÓRIA:
[ANÁLISE PEDAGÓGICA]
...análise...
---DIVISOR---
[ATIVIDADE]
...questões...

GABARITO (OBRIGATÓRIO):
Após todas as questões, inclua uma seção "GABARITO" com as respostas corretas de todas as questões criadas.
`.trim();
}

// ==============================================================================
// ADAPTAR PROVA (DOCX)
// ==============================================================================

export interface AdaptarProvaParams {
  aluno: { nome?: string; ia_sugestao?: string; hiperfoco?: string };
  texto: string;
  materia: string;
  tema: string;
  tipo_atv: string;
  remover_resp: boolean;
  questoes_mapeadas: number[];
  modo_profundo?: boolean;
  checklist_adaptacao?: Record<string, boolean>;
  questoes_com_imagem?: number[];
  unidade_tematica?: string;
  objeto_conhecimento?: string;
}

export function adaptarPromptProva(params: AdaptarProvaParams): string {
  const {
    aluno,
    texto,
    materia,
    tema,
    tipo_atv,
    remover_resp,
    questoes_mapeadas,
    modo_profundo = false,
    checklist_adaptacao = {},
    questoes_com_imagem = [],
    unidade_tematica,
    objeto_conhecimento,
  } = params;

  // Usar questoes_com_imagem como fonte principal (mais específico que questoes_mapeadas)
  const questoesComImagemFinal = questoes_com_imagem.length > 0 ? questoes_com_imagem : questoes_mapeadas;
  const lista_q = questoesComImagemFinal.length > 0 ? questoesComImagemFinal.join(", ") : "";

  const style = modo_profundo
    ? "Seja didático e use uma Cadeia de Pensamento para adaptar."
    : "Seja objetivo.";

  // Montar instruções baseadas no checklist de adaptação
  let instrucoes_checklist = "";
  const necessidades_ativas: string[] = [];

  if (checklist_adaptacao.questoes_desafiadoras) {
    necessidades_ativas.push("Aumentar o nível de desafio das questões");
  } else {
    necessidades_ativas.push("Manter ou reduzir o nível de dificuldade");
  }

  if (!checklist_adaptacao.compreende_instrucoes_complexas) {
    necessidades_ativas.push("Simplificar instruções complexas");
  }

  if (checklist_adaptacao.instrucoes_passo_a_passo) {
    necessidades_ativas.push("Fornecer instruções passo a passo");
  }

  if (checklist_adaptacao.dividir_em_etapas) {
    necessidades_ativas.push("Dividir questões em etapas menores e mais gerenciáveis");
  }

  if (checklist_adaptacao.paragrafos_curtos) {
    necessidades_ativas.push("Usar parágrafos curtos para melhor compreensão");
  }

  if (checklist_adaptacao.dicas_apoio) {
    necessidades_ativas.push("Incluir dicas de apoio para resolver questões");
  }

  if (!checklist_adaptacao.compreende_figuras_linguagem) {
    necessidades_ativas.push("Reduzir ou eliminar figuras de linguagem e inferências");
  }

  if (checklist_adaptacao.descricao_imagens) {
    necessidades_ativas.push("Incluir descrição detalhada de imagens");
  }

  if (necessidades_ativas.length > 0) {
    instrucoes_checklist = `

CHECKLIST DE ADAPTAÇÃO (baseado no PEI):
${necessidades_ativas.map((n) => `- ${n}`).join("\n")}

REGRA CRÍTICA: NÃO aplique todas as necessidades em uma única questão. 
Para cada questão, escolha APENAS 1-2 necessidades que façam mais sentido no contexto.
Analise cada questão individualmente e selecione as adaptações mais relevantes.
`;
  }

  // Instrução de imagens mais enfática e clara
  const instrucaoImagens =
    questoesComImagemFinal.length > 0
      ? `\n
REGRA CRÍTICA DE IMAGENS (OBRIGATÓRIA):
O professor mapeou imagens nas seguintes questões: ${questoesComImagemFinal.join(", ")}.

PARA CADA QUESTÃO COM IMAGEM, VOCÊ DEVE:
1. Manter a imagem no MESMO local onde estava na prova original
2. Inserir a tag [[IMG_N]] (onde N é o número da questão) EXATAMENTE após o enunciado e ANTES das alternativas
3. Exemplos:
   - Questão 1 tem imagem → use [[IMG_1]]
   - Questão 3 tem imagem → use [[IMG_3]]
   - Questão 5 tem imagem → use [[IMG_5]]

ESTRUTURA OBRIGATÓRIA para questões com imagem:
Questão N
[enunciado da questão]
[[IMG_N]]
a) alternativa 1
b) alternativa 2
...

ATENÇÃO: Se você não inserir as tags [[IMG_N]] corretamente, as imagens não aparecerão no documento final.
NUNCA remova ou mova imagens de sua posição original.
NUNCA esqueça de inserir as tags [[IMG_N]] para questões com imagens mapeadas.
`
      : "";

  const infoBncc = unidade_tematica || objeto_conhecimento
    ? `\nCONTEXTO BNCC:\n${unidade_tematica ? `- Unidade Temática: ${unidade_tematica}\n` : ""}${objeto_conhecimento ? `- Objeto do Conhecimento: ${objeto_conhecimento}\n` : ""}`
    : "";

  return `
ESPECIALISTA EM DUA E INCLUSÃO. ${style}
1. ANALISE O PERFIL: ${(aluno.ia_sugestao || "").slice(0, 1000)}
2. ADAPTE A ${tipo_atv}: Use o hiperfoco (${aluno.hiperfoco || "Geral"}) em 30% das questões.
${instrucoes_checklist}${infoBncc}${instrucaoImagens}

REGRA ABSOLUTA DE IMAGENS: O professor indicou imagens nas questões: ${lista_q || "nenhuma"}.
MANTENHA AS IMAGENS NO MESMO LOCAL ONDE ESTAVAM NA PROVA ORIGINAL.
Para questões com imagens, a estrutura OBRIGATÓRIA é: 1. Enunciado -> 2. [[IMG_número]] -> 3. Alternativas.
NUNCA remova ou mova imagens de sua posição original.

SAÍDA OBRIGATÓRIA (Use EXATAMENTE este divisor):
[ANÁLISE PEDAGÓGICA]
...análise...
---DIVISOR---
[ATIVIDADE]
...atividade...

CONTEXTO: ${materia} | ${tema}. ${remover_resp ? "REMOVA GABARITO." : ""}
TEXTO ORIGINAL: ${texto.slice(0, 12000)}
`.trim();
}

// ==============================================================================
// ADAPTAR ATIVIDADE (IMAGEM)
// ==============================================================================

export interface AdaptarAtividadeParams {
  aluno: { nome?: string; ia_sugestao?: string; hiperfoco?: string };
  materia: string;
  tema: string;
  tipo_atv: string;
  livro_professor: boolean;
  modo_profundo?: boolean;
  checklist_adaptacao?: Record<string, boolean>;
  imagem_separada?: boolean;
  unidade_tematica?: string;
  objeto_conhecimento?: string;
}

export function adaptarPromptAtividade(params: AdaptarAtividadeParams): string {
  const {
    aluno,
    materia,
    tema,
    tipo_atv,
    livro_professor,
    modo_profundo = false,
    checklist_adaptacao = {},
    imagem_separada = false,
    unidade_tematica,
    objeto_conhecimento,
  } = params;

  const instrucao_livro = livro_professor
    ? "ATENÇÃO: IMAGEM COM RESPOSTAS. Remova todo gabarito/respostas."
    : "";
  const style = modo_profundo
    ? "Faça uma análise crítica para melhor adaptação."
    : "Transcreva e adapte.";
  const hiperfoco = aluno.hiperfoco || "Geral";

  const instrucao_imagem_separada = imagem_separada
    ? "\n    - O professor recortou a imagem da questão separadamente (Passo 2). Use APENAS a tag [[IMG_2]] para inserir ESSA imagem recortada no local correto da questão adaptada (onde a figura aparecia na questão original). NÃO use [[IMG_1]]. A imagem anexada a seguir é a que deve aparecer no documento."
    : "";

  // Montar instruções do checklist
  let instrucoes_checklist = "";
  const necessidades_ativas: string[] = [];

  if (checklist_adaptacao.questoes_desafiadoras) {
    necessidades_ativas.push("Aumentar o nível de desafio da questão");
  } else {
    necessidades_ativas.push("Manter ou reduzir o nível de dificuldade");
  }

  if (!checklist_adaptacao.compreende_instrucoes_complexas) {
    necessidades_ativas.push("Simplificar instruções complexas");
  }

  if (checklist_adaptacao.instrucoes_passo_a_passo) {
    necessidades_ativas.push("Fornecer instruções passo a passo detalhadas");
  }

  if (checklist_adaptacao.dividir_em_etapas) {
    necessidades_ativas.push("Dividir a questão em etapas menores e mais gerenciáveis");
  }

  if (checklist_adaptacao.paragrafos_curtos) {
    necessidades_ativas.push("Usar parágrafos curtos para melhor compreensão");
  }

  if (checklist_adaptacao.dicas_apoio) {
    necessidades_ativas.push("Incluir dicas de apoio específicas para resolver esta questão");
  }

  if (!checklist_adaptacao.compreende_figuras_linguagem) {
    necessidades_ativas.push("Reduzir ou eliminar figuras de linguagem e inferências");
  }

  if (checklist_adaptacao.descricao_imagens) {
    necessidades_ativas.push("Incluir descrição detalhada da imagem presente na questão");
  }

  if (necessidades_ativas.length > 0) {
    instrucoes_checklist = `
    CHECKLIST DE ADAPTAÇÃO (baseado no PEI - QUESTÃO ÚNICA):
    ${necessidades_ativas.map((n) => `- ${n}`).join("\n    ")}
    REGRA CRÍTICA: Como esta é uma questão única, aplique as adaptações selecionadas de forma específica e pontual.
    `;
  }

  const infoBncc = unidade_tematica || objeto_conhecimento
    ? `\nCONTEXTO BNCC:\n${unidade_tematica ? `- Unidade Temática: ${unidade_tematica}\n` : ""}${objeto_conhecimento ? `- Objeto do Conhecimento: ${objeto_conhecimento}\n` : ""}`
    : "";

  return `
    ATUAR COMO: Especialista em Acessibilidade e OCR. ${style}
    1. Transcreva o texto da imagem. ${instrucao_livro}
    2. Adapte para o estudante (PEI: ${(aluno.ia_sugestao || "").slice(0, 800)}).
    3. HIPERFOCO (${hiperfoco}): Use o hiperfoco do estudante sempre que possível para conectar e engajar na questão.
    ${instrucoes_checklist}
    4. REGRA DE IMAGEM:
    - A imagem que você recebeu primeiro é apenas para você LER e transcrever o conteúdo da questão. NÃO insira essa imagem no texto da atividade (não use [[IMG_1]]).
    ${instrucao_imagem_separada}
    - Se não houve imagem recortada separadamente pelo professor, não coloque nenhuma tag de imagem no texto.
    ${infoBncc}
    SAÍDA OBRIGATÓRIA (Respeite o divisor):
    [ANÁLISE PEDAGÓGICA]
    ...análise...
    ---DIVISOR---
    [ATIVIDADE]
    ...atividade...
    `.trim();
}

// ==============================================================================
// ROTEIRO DE AULA
// ==============================================================================

export interface RoteiroAulaParams {
  aluno: { nome: string; ia_sugestao?: string; hiperfoco?: string };
  materia: string;
  assunto: string;
  habilidades_bncc?: string[];
  verbos_bloom?: string[];
  ano?: string;
  unidade_tematica?: string;
  objeto_conhecimento?: string;
  feedback_anterior?: string;
}

export function gerarPromptRoteiroAula(params: RoteiroAulaParams): string {
  const {
    aluno,
    materia,
    assunto,
    habilidades_bncc = [],
    verbos_bloom = [],
    ano,
    unidade_tematica,
    objeto_conhecimento,
    feedback_anterior = "",
  } = params;

  let info_bncc = "";
  if (habilidades_bncc.length > 0) {
    info_bncc += "\nHabilidades BNCC:";
    habilidades_bncc.forEach((hab) => {
      info_bncc += `\n- ${hab}`;
    });
  }

  if (ano) info_bncc += `\nAno: ${ano}`;
  if (unidade_tematica) info_bncc += `\nUnidade Temática: ${unidade_tematica}`;
  if (objeto_conhecimento) info_bncc += `\nObjeto do Conhecimento: ${objeto_conhecimento}`;

  const info_bloom = verbos_bloom.length > 0
    ? `\nVerbos da Taxonomia de Bloom: ${verbos_bloom.join(", ")}`
    : "";

  const ajuste = feedback_anterior ? `\nAJUSTES SOLICITADOS: ${feedback_anterior}` : "";

  return `
    Crie um ROTEIRO DE AULA INDIVIDUALIZADO para ${aluno.nome}.
    
    INFORMAÇÕES DO ESTUDANTE:
    - Perfil: ${(aluno.ia_sugestao || "").slice(0, 500)}
    - Hiperfoco: ${aluno.hiperfoco || "Geral"}
    
    INFORMAÇÕES DA AULA:
    - Componente Curricular: ${materia}
    - Assunto: ${assunto}
    ${info_bncc}
    ${info_bloom}
    ${ajuste}
    
    ESTRUTURA OBRIGATÓRIA:
    
    1. **CONEXÃO INICIAL COM O HIPERFOCO** (2-3 minutos)
       - Como conectar o tema com o hiperfoco do estudante
    
    2. **OBJETIVOS DA AULA**
       - Objetivos claros e mensuráveis
    
    3. **DESENVOLVIMENTO PASSO A PASSO** (15-20 minutos)
       - Divida em 3-4 etapas claras
       - Inclua perguntas mediadoras
       - Use exemplos relacionados ao hiperfoco
    
    4. **ATIVIDADE PRÁTICA INDIVIDUAL** (5-7 minutos)
       - Tarefa que o estudante pode fazer sozinho
    
    5. **FECHAMENTO E REFLEXÃO** (3-5 minutos)
       - Verificação dos objetivos
       - Pergunta de reflexão
    
    6. **RECURSOS E MATERIAIS**
    
    7. **AVALIAÇÃO FORMATIVA**
       - Como avaliar durante a aula
    `.trim();
}

// ==============================================================================
// DINÂMICA INCLUSIVA
// ==============================================================================

export interface DinamicaInclusivaParams {
  aluno: { nome: string; ia_sugestao?: string; hiperfoco?: string };
  materia: string;
  assunto: string;
  qtd_alunos: number;
  caracteristicas_turma: string;
  habilidades_bncc?: string[];
  verbos_bloom?: string[];
  ano?: string;
  unidade_tematica?: string;
  objeto_conhecimento?: string;
  feedback_anterior?: string;
}

export function gerarPromptDinamicaInclusiva(params: DinamicaInclusivaParams): string {
  const {
    aluno,
    materia,
    assunto,
    qtd_alunos,
    caracteristicas_turma,
    habilidades_bncc = [],
    verbos_bloom = [],
    ano,
    unidade_tematica,
    objeto_conhecimento,
    feedback_anterior = "",
  } = params;

  let info_bncc = "";
  if (habilidades_bncc.length > 0) {
    info_bncc += "\nHabilidades BNCC:";
    habilidades_bncc.forEach((hab) => {
      info_bncc += `\n- ${hab}`;
    });
  }

  if (ano) info_bncc += `\nAno: ${ano}`;
  if (unidade_tematica) info_bncc += `\nUnidade Temática: ${unidade_tematica}`;
  if (objeto_conhecimento) info_bncc += `\nObjeto do Conhecimento: ${objeto_conhecimento}`;

  const info_bloom = verbos_bloom.length > 0
    ? `\nVerbos da Taxonomia de Bloom: ${verbos_bloom.join(", ")}`
    : "";

  const ajuste = feedback_anterior ? `\nAJUSTES SOLICITADOS: ${feedback_anterior}` : "";

  return `
    Crie uma DINÂMICA INCLUSIVA para ${qtd_alunos} estudantes.
    
    INFORMAÇÕES DO ESTUDANTE FOCAL:
    - Nome: ${aluno.nome}
    - Perfil: ${(aluno.ia_sugestao || "").slice(0, 400)}
    - Hiperfoco: ${aluno.hiperfoco || "Geral"}
    
    INFORMAÇÕES DA DINÂMICA:
    - Componente Curricular: ${materia}
    - Tema: ${assunto}
    - Características da turma: ${caracteristicas_turma}
    ${info_bncc}
    ${info_bloom}
    ${ajuste}
    
    ESTRUTURA OBRIGATÓRIA:
    
    1. **NOME DA DINÂMICA E OBJETIVO**
       - Nome criativo
       - Objetivo claro
    
    2. **MATERIAIS NECESSÁRIOS**
    
    3. **PREPARAÇÃO**
       - Como preparar a sala/ambiente
    
    4. **PASSO A PASSO** (detalhado)
       - Instruções claras para o professor
       - Inclua adaptações para o estudante focal
    
    5. **DURAÇÃO ESTIMADA**
    
    6. **AVALIAÇÃO**
       - Como avaliar a participação de todos
    
    7. **VARIAÇÕES**
       - Sugestões para adaptar a dinâmica
    `.trim();
}

// ==============================================================================
// PLANO DE AULA
// ==============================================================================

export interface PlanoAulaParams {
  materia: string;
  assunto: string;
  metodologia: string;
  tecnica: string;
  qtd_alunos: number;
  recursos: string[];
  habilidades_bncc?: string[];
  verbos_bloom?: string[];
  ano?: string;
  unidade_tematica?: string;
  objeto_conhecimento?: string;
  aluno_info?: { nome?: string; hiperfoco?: string; ia_sugestao?: string };
  duracao_minutos?: number;
}

export function gerarPromptPlanoAula(params: PlanoAulaParams): string {
  const {
    materia,
    assunto,
    metodologia,
    tecnica,
    qtd_alunos,
    recursos,
    habilidades_bncc = [],
    verbos_bloom = [],
    ano,
    unidade_tematica,
    objeto_conhecimento,
    aluno_info,
    duracao_minutos = 50,
  } = params;

  let info_bncc = "";
  if (habilidades_bncc.length > 0) {
    info_bncc += "\nHABILIDADES BNCC:";
    habilidades_bncc.forEach((hab) => {
      info_bncc += `\n- ${hab}`;
    });
  }

  if (ano) info_bncc += `\nAno: ${ano}`;
  if (unidade_tematica) info_bncc += `\nUnidade Temática: ${unidade_tematica}`;
  if (objeto_conhecimento) info_bncc += `\nObjeto do Conhecimento: ${objeto_conhecimento}`;

  const info_bloom = verbos_bloom.length > 0
    ? `\nVERBOS DA TAXONOMIA DE BLOOM: ${verbos_bloom.join(", ")}`
    : "";

  const info_aluno = aluno_info
    ? `
    INFORMAÇÕES DO ESTUDANTE (DUA):
    - Nome: ${aluno_info.nome || ""}
    - Hiperfoco: ${aluno_info.hiperfoco || ""}
    - Perfil: ${(aluno_info.ia_sugestao || "").slice(0, 300)}
    `
    : "";

  return `
    ATUAR COMO: Coordenador Pedagógico Especialista em BNCC, DUA e Metodologias Ativas.
    
    Crie um PLANO DE AULA COMPLETO com as seguintes informações:
    
    INFORMAÇÕES BÁSICAS:
    - Componente Curricular: ${materia}
    - Tema/Assunto: ${assunto}
    - Metodologia: ${metodologia}
    - Técnica: ${tecnica || "Não especificada"}
    - Quantidade de Estudantes: ${qtd_alunos}
    - Duração da aula: ${duracao_minutos} minutos (${duracao_minutos === 50 ? "1 aula" : "2 aulas"})
    - Recursos Disponíveis: ${recursos.join(", ")}
    
    ${info_bncc}
    ${info_bloom}
    ${info_aluno}
    
    ESTRUTURA DO PLANO (Markdown):
    
    ## 📋 PLANO DE AULA: ${assunto}
    
    ### 🎯 OBJETIVOS DE APRENDIZAGEM
    - Objetivo geral
    - Objetivos específicos (3-4)
    - Habilidades da BNCC trabalhadas
    
    ### 📚 CONTEÚDOS
    - Conteúdos conceituais
    - Conteúdos procedimentais
    - Conteúdos atitudinais
    
    ### ⏰ TEMPO ESTIMADO
    - Duração total: ${duracao_minutos} minutos — distribua o tempo entre as etapas (acolhida, desenvolvimento, avaliação) de forma coerente.
    
    ### 🛠 RECURSOS DIDÁTICOS
    - Lista de recursos necessários
    
    ### 🚀 DESENVOLVIMENTO DA AULA
    #### 1. ACOLHIDA E MOTIVAÇÃO (__ minutos)
    - Atividade de engajamento
    
    #### 2. APRESENTAÇÃO DO CONTEÚDO (__ minutos)
    - Explicação do tema
    - Conexões com conhecimentos prévios
    
    #### 3. ATIVIDADE PRÁTICA (__ minutos)
    - Descrição detalhada da atividade
    - Papel do professor
    - Papel dos estudantes
    
    #### 4. SOCIALIZAÇÃO (__ minutos)
    - Compartilhamento dos resultados
    - Discussão coletiva
    
    #### 5. AVALIAÇÃO (__ minutos)
    - Instrumentos de avaliação
    - Critérios
    
    ### ♿ ADAPTAÇÕES DUA (DESIGN UNIVERSAL PARA APRENDIZAGEM)
    - Engajamento: Como manter todos motivados
    - Representação: Múltiplas formas de apresentar o conteúdo
    - Ação e Expressão: Múltiplas formas de expressar o aprendizado
    
    ### 📝 AVALIAÇÃO
    - Avaliação diagnóstica
    - Avaliação formativa
    - Avaliação somativa
    
    ### 🔄 RECUPERAÇÃO
    - Estratégias para estudantes com dificuldades
    
    ### 📚 REFERÊNCIAS
    - Referências bibliográficas
    - Sites recomendados
    `.trim();
}

// ==============================================================================
// PAPO DE MESTRE (QUEBRA-GELO)
// ==============================================================================

export interface PapoMestreParams {
  aluno: { nome: string; hiperfoco?: string };
  materia: string;
  assunto: string;
  tema_turma_extra?: string;
}

export function gerarPromptPapoMestre(params: PapoMestreParams): string {
  const { aluno, materia, assunto, tema_turma_extra = "" } = params;

  return `
    Crie 3 sugestões de 'Papo de Mestre' (Quebra-gelo/Introdução) para conectar o estudante ${aluno.nome} à aula.
    Componente Curricular: ${materia}. Assunto: ${assunto}.
    Hiperfoco do estudante: ${aluno.hiperfoco || "Geral"}.
    Tema de interesse da turma (DUA): ${tema_turma_extra || "Não informado"}.
    
    O objetivo é usar o hiperfoco ou o interesse da turma como UMA PONTE (estratégia DUA de engajamento) para explicar o conceito de ${assunto}.
    Seja criativo e profundo.
    `.trim();
}

// ==============================================================================
// EXPERIÊNCIA EI (EDUCAÇÃO INFANTIL)
// ==============================================================================

export interface ExperienciaEiParams {
  aluno: { nome: string; hiperfoco?: string; ia_sugestao?: string };
  campo_exp: string;
  objetivo: string;
  feedback_anterior?: string;
}

export function gerarPromptExperienciaEi(params: ExperienciaEiParams): string {
  const { aluno, campo_exp, objetivo, feedback_anterior = "" } = params;

  const ajuste_prompt = feedback_anterior
    ? `AJUSTE SOLICITADO PELO PROFESSOR: ${feedback_anterior}. Refaça considerando isso.`
    : "";

  return `
    ATUAR COMO: Especialista em Educação Infantil (BNCC) e Inclusão.
    ESTUDANTE: ${aluno.nome} (Educação Infantil).
    HIPERFOCO: ${aluno.hiperfoco || "Brincar"}.
    RESUMO DAS NECESSIDADES (PEI): ${(aluno.ia_sugestao || "").slice(0, 600)}
    
    SUA MISSÃO: Criar uma EXPERIÊNCIA LÚDICA, CONCRETA E VISUAL focada no Campo de Experiência: "${campo_exp}".
    Objetivo(s) de Aprendizagem (BNCC - use APENAS estes, não invente): ${objetivo}
    ${ajuste_prompt}
    
    REGRAS:
    1. Não crie "provas" ou "folhinhas". Crie VIVÊNCIAS.
    2. Use o hiperfoco para engajar (ex: se gosta de dinossauros, conte dinossauros).
    3. Liste materiais concretos (massinha, tinta, blocos).
    4. Dê o passo a passo para o professor.
    
    SAÍDA ESPERADA (Markdown):
    ## 🧸 Experiência: [Nome Criativo]
    **🎯 Intencionalidade:** ...
    **📦 Materiais:** ...
    **👣 Como Acontece:** ...
    **🎨 Adaptação para ${aluno.nome.split(" ")[0]}:** ...
    `.trim();
}

// ==============================================================================
// MAPA MENTAL (IMAGEM + HTML)
// ==============================================================================

export interface MapaMentalParams {
  materia: string;
  assunto: string;
  planoTexto: string;
  estudante?: { nome?: string; hiperfoco?: string };
  unidade_tematica?: string;
  objeto_conhecimento?: string;
}

export function gerarPromptMapaMentalImagem(params: MapaMentalParams): string {
  const { materia, assunto, planoTexto, estudante, unidade_tematica, objeto_conhecimento } = params;
  const hiperfoco = estudante?.hiperfoco || "Geral";

  const contexto = [
    `Subject: ${materia}`,
    `Topic: ${assunto}`,
    unidade_tematica ? `BNCC Unit: ${unidade_tematica}` : "",
    objeto_conhecimento ? `Knowledge Object: ${objeto_conhecimento}` : "",
    `Student interest (hiperfoco): ${hiperfoco}`,
  ].filter(Boolean).join(". ");

  // Extrair tópicos-chave do plano para o mapa mental
  const resumoPlano = planoTexto.slice(0, 2000);

  return `Create a BEAUTIFUL, COLORFUL educational MIND MAP image about this lesson topic.

CONTEXT: ${contexto}

LESSON CONTENT TO MAP (extract the key concepts):
${resumoPlano}

STYLE RULES:
- Central node: main topic in a large, bold, colorful circle
- Branch out into 4-6 main branches with different vibrant colors
- Each branch has 2-4 sub-nodes with key concepts
- Use clean, modern flat design with rounded shapes
- White or very light background  
- Use icons/emojis where appropriate for visual engagement
- Text should be in PORTUGUESE (Brazilian)
- Make it visually stunning - suitable for classroom display
- NO walls of text - short labels only (2-5 words per node)
- Use a radial/organic layout, not a tree
- Colors: use a harmonious palette (teals, purples, oranges, greens)

CRITICAL: This is an IMAGE of a mind map, not text. Create a visual diagram.`.trim();
}

export function gerarPromptMapaMentalHtml(params: MapaMentalParams): string {
  const { materia, assunto, planoTexto, estudante, unidade_tematica, objeto_conhecimento } = params;
  const hiperfoco = estudante?.hiperfoco || "Geral";

  const infoBncc = [
    unidade_tematica ? `Unidade Temática: ${unidade_tematica}` : "",
    objeto_conhecimento ? `Objeto do Conhecimento: ${objeto_conhecimento}` : "",
  ].filter(Boolean).join("\n");

  const resumoPlano = planoTexto.slice(0, 3000);

  return `
Você é um designer de mapas mentais interativos. Crie um arquivo HTML COMPLETO e AUTOSSUFICIENTE (sem dependências externas) que renderiza um MAPA MENTAL VISUAL INCRÍVEL para ser usado em sala de aula.

INFORMAÇÕES DA AULA:
- Componente Curricular: ${materia}
- Assunto: ${assunto}
- Hiperfoco do estudante: ${hiperfoco}
${infoBncc ? `- ${infoBncc}` : ""}

CONTEÚDO DO PLANO (extraia os conceitos-chave):
${resumoPlano}

REGRAS DO HTML:
1. ARQUIVO HTML COMPLETO: <!DOCTYPE html>, <html>, <head> com <style>, <body> com <script>
2. TODO o CSS deve estar inline no <style> (não use CDNs, não use Tailwind)
3. TODO o JavaScript deve estar inline no <script> (não use bibliotecas externas)
4. Use Canvas API ou SVG para desenhar o mapa mental. Prefira SVG para qualidade.
5. Design PREMIUM e MODERNO:
   - Fundo escuro (gradiente de #0f172a para #1e293b)
   - Nós com bordas arredondadas, cores vibrantes (cyan, purple, orange, emerald, pink)
   - Linhas curvas conectando os nós (bezier curves)
   - Sombras suaves (drop-shadow)
   - Tipografia limpa (system-ui, -apple-system)
   - Nó central grande e chamativo
6. INTERATIVIDADE:
   - Hover nos nós mostra tooltip com detalhe
   - Nós expandem/contraem ao clicar
   - Animação suave de entrada (fade-in)
7. ORGANIZAÇÃO:
   - Nó central: tema principal
   - 4-6 ramos principais com cores distintas
   - Cada ramo com 2-4 sub-nós
   - Textos curtos (2-5 palavras por nó)
   - Todo texto em PORTUGUÊS (brasileiro)
8. No canto superior direito, adicione um botão discreto "📥 Salvar como Imagem" que usa html2canvas inline ou captura via Canvas
9. Responsivo: funciona bem em telas de 1024px+ 
10. Adicione no rodapé: "Mapa Mental — ${materia}: ${assunto} | Omnisfera"

SAÍDA: Apenas o HTML completo. Nenhum texto antes ou depois. Comece com <!DOCTYPE html> e termine com </html>.
`.trim();
}
