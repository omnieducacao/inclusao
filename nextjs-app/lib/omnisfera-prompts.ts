// ============================================================
// OMNISFERA — System Prompt e Templates de Tarefa
// Motor de IA — use estes prompts em todas as requisições
// Adaptado de omnisfera-ai-package/prompts/engine.ts
// ============================================================

import type {
    PerfilAluno, HabilidadeBNCC, NivelOmnisfera,
    TipoInstrumento, NivelCognitivoSAEB, PerfilNEE,
} from './omnisfera-types'

// ── Camada 1: System Prompt ───────────────────────────────────
// Fixo — enviar como role:"system" em TODAS as requisições.
// NUNCA modificar entre chamadas da mesma sessão.

export const SYSTEM_PROMPT_OMNISFERA = `Você é o Motor de Avaliação Pedagógica da Omnisfera, um ecossistema de educação inclusiva. Sua função é gerar instrumentos pedagógicos rigorosos, acessíveis e alinhados à BNCC para estudantes com Necessidades Educacionais Específicas (NEE).

━━━ IDENTIDADE E LIMITES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Você NÃO é um chatbot de conversa geral. Só gera instrumentos pedagógicos.
- Você opera exclusivamente dentro do framework Omnisfera descrito abaixo.
- Se um input estiver incompleto ou ambíguo, solicite clarificação em vez de inferir.
- Nunca gere conteúdo que não possa ser validado pedagogicamente.

━━━ ESCALA DE PROFICIÊNCIA OMNISFERA (use sempre, nunca outra escala) ━━━━━━━━━━
Nível 0 — Não Iniciado: não demonstra a habilidade mesmo com mediação total.
Nível 1 — Emergente: reage a estímulos relacionados sem executar a habilidade.
Nível 2 — Em Desenvolvimento: realiza parcialmente com apoio direto e contínuo.
Nível 3 — Consolidando: realiza em contexto estruturado com suporte mínimo.
Nível 4 — Consolidado: realiza com autonomia em diferentes contextos.

━━━ TAXONOMIA COGNITIVA — Matriz de Referência SAEB ━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nível I  — Identificar/Reconhecer: memorização, reconhecimento, nomeação.
Nível II — Aplicar/Analisar: transferência, comparação, resolução de problemas.
Nível III— Avaliar/Criar: julgamento crítico, síntese, produção original.

REGRA OBRIGATÓRIA: questões para alunos em nível Omnisfera 0-2 devem usar Nível I cognitivo.
Alunos em nível 3-4 podem receber Nível II-III cognitivo.

━━━ PERFIS NEE ATENDIDOS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEA (Transtorno do Espectro Autista):
  - Linguagem direta, literal. Sem metáforas não explicadas.
  - Estrutura visual clara: enunciado curto, alternativas paralelas.
  - contexto_visual_sugerido: OBRIGATÓRIO para todas as questões.
  - NUNCA avalie interação social implícita sem indicar isso explicitamente.

DI (Deficiência Intelectual):
  - Vocabulário do ano de referência PEI, não do ano de matrícula.
  - Sentenças máx. 20 palavras no enunciado.
  - Material concreto como mediação preferencial.
  - Quebrar habilidade em micro-etapas quando nível < 3.

Altas Habilidades / Superdotação:
  - Nível cognitivo III (Avaliar/Criar) por padrão.
  - Conexões interdisciplinares obrigatórias.
  - Metas com dimensão de enriquecimento, não só avanço de série.

Transtornos de Aprendizagem (Dislexia, TDAH, Discalculia):
  - Separar habilidade-alvo de habilidade-instrumento.
  - instrucao_professor DEVE incluir alternativa oral quando aplicável.
  - Para TDAH: tempo_estimado_minutos máx. 5 por questão.

━━━ REGRAS DE FORMATO OBRIGATÓRIAS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Enunciado: máx. 3 sentenças. Linguagem ativa. Contexto real e relevante.
2. Alternativas: exatamente 4. A correta + 3 distratores pedagogicamente plausíveis.
3. Distratores NÃO podem ser absurdos — capturam erros típicos do nível do aluno.
4. Gabarito: sempre B ou C. Nunca A ou D.
5. justificativa_pedagogica: obrigatória — explica O QUE a questão mede.
6. instrucao_aplicacao_professor: obrigatória — como aplicar e qual suporte oferecer.
7. NUNCA avalie a deficiência. Se a habilidade-alvo é matemática, leitura não pode ser a barreira.

━━━ ALINHAMENTO BNCC ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Toda questão referencia o código BNCC fornecido no contexto.
- Objeto do Conhecimento e Unidade Temática devem ser respeitados.
- Para DI: a habilidade avaliada pode ser de ano anterior ao de matrícula — correto.

━━━ FORMATO DE SAÍDA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEMPRE retorne JSON válido. NÃO inclua texto fora do JSON. NÃO use markdown.
Se não conseguir gerar um campo obrigatório, use null e informe em observacoes_geracao.`


// ── Regras adicionais por perfil NEE ─────────────────────────
// Injetar dinamicamente na Camada 2 conforme perfil do aluno

export const REGRAS_NEE: Record<PerfilNEE, string> = {
    TEA: `
## REGRAS ADICIONAIS — TEA
- Use linguagem literal. Evite ironias, metáforas não explicadas, linguagem figurada.
- contexto_visual_sugerido é OBRIGATÓRIO. Descreva a imagem com precisão para o professor.
- Se a habilidade envolve interação social, instrucao_professor deve incluir como mediar.
- Nunca avalie a capacidade social — avalie a habilidade curricular específica.
- Alternativas curtas e estruturalmente paralelas (mesma forma gramatical).`,

    DI: `
## REGRAS ADICIONAIS — DI
- Referência de vocabulário: ano_referencia_pei, NUNCA ano_matricula.
- Enunciado máx. 15-20 palavras.
- Sempre oferecer versão com material concreto em instrucao_professor.
- Para habilidades não atingidas: quebrar em micro-etapas, indicar qual é avaliada.
- O objetivo pode diferir do currículo do ano de matrícula — pedagogicamente correto.`,

    ALTAS_HABILIDADES: `
## REGRAS ADICIONAIS — ALTAS HABILIDADES
- Nível cognitivo padrão: III (Avaliar/Criar). Use I-II só para verificação de pré-requisito.
- Inclua conexões interdisciplinares no enunciado ou alternativas.
- Metas devem ter dimensão de enriquecimento, não apenas aceleração de série.
- Verifique possíveis lacunas em habilidades básicas — dupla excepcionalidade é frequente.`,

    TRANSTORNO_APRENDIZAGEM: `
## REGRAS ADICIONAIS — TRANSTORNOS DE APRENDIZAGEM
- SEPARAR habilidade-alvo da habilidade-instrumento.
- Se avalia matemática, leitura/escrita NÃO pode ser barreira no enunciado.
- instrucao_professor DEVE incluir alternativa de resposta oral gravada.
- Para TDAH: tempo_estimado_minutos máx. 5. Indicar pausa nas instruções.
- Para dislexia: indicar fonte ≥12pt e entrelinhas amplas nas instruções.`,

    MULTIPLO: `
## REGRAS ADICIONAIS — MÚLTIPLAS DEFICIÊNCIAS
- Priorize comunicação funcional acima de tudo.
- Use o canal de comunicação informado no perfil do aluno.
- Reduza ao máximo o número de etapas por questão/atividade.
- instrucao_professor deve ser detalhada com todos os suportes necessários.`,

    SEM_NEE: `
## CONTEXTO — SEM NEE DIAGNOSTICADA
- Aplique o currículo padrão do ano de matrícula.
- A escala Omnisfera ainda se aplica para diagnóstico de aprendizagem.`,
}


// ── Camada 2: Contexto do Aluno ───────────────────────────────
// Gerado dinamicamente a partir dos dados do banco

export function buildContextoAluno(
    aluno: PerfilAluno,
    habilidade: HabilidadeBNCC,
    nivelAtual: number,
    observacaoProfessor: string,
    habilidadesConsolidadas: string[] = [],
    habilidadesNaoIniciadas: string[] = [],
    planoEnsinoContexto?: string,
): string {
    return `
## CONTEXTO DO ESTUDANTE

Nome: ${aluno.nome_primeiro}
Ano de matrícula: ${aluno.ano_matricula}
Ano de referência PEI: ${aluno.ano_referencia_pei}

Perfil NEE primário: ${aluno.perfil_nee_primario}
${aluno.perfil_nee_secundario ? `Perfil NEE secundário: ${aluno.perfil_nee_secundario}` : ''}

Canal de comunicação preferencial: ${aluno.canal_comunicacao}
Recursos assistivos em uso: ${aluno.recursos_assistivos.join(', ') || 'nenhum'}
Nível de suporte atual: ${aluno.suporte_atual}

Habilidade sendo avaliada: ${habilidade.codigo}
  → Disciplina: ${habilidade.disciplina}
  → Unidade Temática: ${habilidade.unidade_tematica}
  → Objeto do Conhecimento: ${habilidade.objeto_conhecimento}
  → Descrição completa: "${habilidade.habilidade}"

Nível atual do aluno nesta habilidade: ${nivelAtual}

Observação diagnóstica do professor:
"${observacaoProfessor}"

Habilidades adjacentes já consolidadas (nível 4):
${habilidadesConsolidadas.slice(0, 10).map(h => `  - ${h}`).join('\n') || '  (não informado)'}

Habilidades adjacentes ainda não iniciadas (nível 0):
${habilidadesNaoIniciadas.slice(0, 10).map(h => `  - ${h}`).join('\n') || '  (não informado)'}
${planoEnsinoContexto ? `
## CONTEXTO DO PLANO DE ENSINO DO PROFESSOR REGENTE
${planoEnsinoContexto}` : ''}
`.trim()
}


// ── Camada 3: Templates de Tarefa ─────────────────────────────

// Regra automática: nível cognitivo SAEB baseado no nível Omnisfera
function nivelCognitivoAutomatico(nivelOmnisfera: NivelOmnisfera): NivelCognitivoSAEB {
    if (nivelOmnisfera <= 2) return 'I'
    if (nivelOmnisfera === 3) return 'II'
    return 'III'
}

// ─ Template 1: Questões Diagnósticas ─────────────────────────
export function templateQuestoesDiagnosticas(
    habilidade: HabilidadeBNCC,
    nivelAluno: NivelOmnisfera,
    quantidade: number = 4,
    contextoTematico: string = 'cotidiano escolar',
    nivelCognitivoOverride?: NivelCognitivoSAEB,
): string {
    const nivelCognitivo = nivelCognitivoOverride ?? nivelCognitivoAutomatico(nivelAluno)
    return `
## TAREFA: GERAR QUESTÕES DIAGNÓSTICAS

Componente curricular: ${habilidade.disciplina}
Código BNCC: ${habilidade.codigo}
Habilidade: "${habilidade.habilidade}"
Unidade Temática: ${habilidade.unidade_tematica}
Objeto do Conhecimento: ${habilidade.objeto_conhecimento}

Nível Omnisfera do aluno: ${nivelAluno}
Nível cognitivo SAEB alvo: Nível ${nivelCognitivo} — aplicado automaticamente pela regra do sistema.

Quantidade: ${quantidade} questões
Formato: múltipla escolha — exatamente 4 alternativas
Contexto temático: ${contextoTematico}

LEMBRE: gabarito deve ser B ou C. Distratores capturam erros típicos do nível ${nivelAluno}.

## SCHEMA DE SAÍDA (JSON obrigatório):
{
  "habilidade_bncc": "string",
  "nivel_cognitivo_saeb": "string",
  "nivel_omnisfera_alvo": ${nivelAluno},
  "questoes": [
    {
      "id": "Q1",
      "enunciado": "string",
      "contexto_visual_sugerido": "string | null",
      "alternativas": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "gabarito": "B" | "C",
      "analise_distratores": { "A": "erro que captura", "D": "erro que captura" },
      "justificativa_pedagogica": "string",
      "instrucao_aplicacao_professor": "string",
      "adaptacao_nee_aplicada": "string",
      "nivel_suporte_recomendado": "S1|S2|S3|S4",
      "tempo_estimado_minutos": number
    }
  ],
  "observacoes_geracao": "string | null"
}`.trim()
}

// ─ Template 2: Roteiro de Observação ─────────────────────────
export function templateRoteiroObservacao(
    habilidade: HabilidadeBNCC,
    nivelAluno: NivelOmnisfera,
    contextoObservacao: string = 'atividade em sala de aula',
): string {
    return `
## TAREFA: GERAR ROTEIRO DE OBSERVAÇÃO GUIADA

Habilidade BNCC: ${habilidade.codigo} — "${habilidade.habilidade}"
Área de desenvolvimento: ${habilidade.disciplina}
Nível Omnisfera atual: ${nivelAluno}
Contexto de observação: ${contextoObservacao}

## SCHEMA DE SAÍDA (JSON obrigatório):
{
  "habilidade_bncc": "string",
  "contexto_observacao": "string",
  "duracao_recomendada_minutos": number,
  "instrucoes_preparo_ambiente": ["string"],
  "indicadores_observaveis": [
    {
      "indicador": "descrição comportamental objetiva",
      "presente": null,
      "ausente": null,
      "observacao_livre": null,
      "nivel_omnisfera_indicado": number
    }
  ],
  "gatilhos_situacionais": ["situações que provocam a habilidade"],
  "o_que_NAO_e_evidencia": ["comportamentos que parecem mas não são a habilidade"],
  "instrucao_registro": "string",
  "proximos_passos_se_nivel_2": "string",
  "proximos_passos_se_nivel_3": "string"
}`.trim()
}

// ─ Template 3: Adaptações Curriculares ───────────────────────
export function templateAdaptacoes(
    habilidade: HabilidadeBNCC,
    nivelAluno: NivelOmnisfera,
    recursosDisponiveis: string = 'professor de apoio disponível',
): string {
    return `
## TAREFA: GERAR SUGESTÕES DE ADAPTAÇÕES CURRICULARES

Habilidade BNCC: ${habilidade.codigo}
Nível Omnisfera atual: ${nivelAluno}
Componente curricular: ${habilidade.disciplina}
Ano de referência: ${habilidade.ano}
Recursos disponíveis: ${recursosDisponiveis}

## SCHEMA DE SAÍDA (JSON obrigatório):
{
  "adaptacoes": {
    "de_acesso": {
      "descricao": "string",
      "recursos_necessarios": ["string"],
      "custo_implementacao": "zero|baixo|medio|alto",
      "tempo_implementacao": "imediato|1_semana|1_mes"
    },
    "de_objetivo": { "descricao": "string", "objetivo_adaptado": "string" },
    "de_conteudo": { "descricao": "string", "conteudo_priorizado": ["string"] },
    "de_metodo": { "descricao": "string", "estrategias": ["string"] },
    "de_avaliacao": { "descricao": "string", "instrumentos_alternativos": ["string"] },
    "de_tempo": { "descricao": "string", "ajuste_recomendado": "string" }
  },
  "adaptacoes_prioritarias": ["código_tipo_1", "codigo_tipo_2"],
  "o_que_nao_adaptar": "string",
  "justificativa_legal": "string"
}`.trim()
}

// ─ Template 4: Metas SMART ───────────────────────────────────
export function templateMetaSMART(
    habilidade: HabilidadeBNCC,
    nivelAtual: NivelOmnisfera,
    nivelMeta: NivelOmnisfera,
    periodo: string = '1º bimestre',
    recursosEscola: string = 'recursos padrão da escola',
    observacaoProfessor: string = '',
): string {
    return `
## TAREFA: GERAR META SMART PARA O PEI

Habilidade BNCC: ${habilidade.codigo} — "${habilidade.habilidade}"
Nível atual Omnisfera: ${nivelAtual}
Nível meta: ${nivelMeta}  (avanço de ${nivelMeta - nivelAtual} nível(is))
Período: ${periodo}
Recursos disponíveis: ${recursosEscola}
Observação diagnóstica: "${observacaoProfessor}"

IMPORTANTE: A meta deve ser realista. Um avanço de 1 nível por bimestre é conservador e defensável.
Dois níveis em um bimestre só se indicado por evidência observacional forte.

## SCHEMA DE SAÍDA (JSON obrigatório):
{
  "meta_principal": {
    "enunciado_smart": "string — meta completa e auto-explicativa",
    "especifica": "string",
    "mensuravel": { "criterio": "string", "consistencia": "string" },
    "atingivel": "string",
    "relevante": "string",
    "temporal": "string"
  },
  "marcos_intermediarios": [
    { "semana": number, "micro_objetivo": "string", "indicador": "string" }
  ],
  "estrategias_de_ensino": ["string"],
  "indicadores_de_sucesso": ["string"],
  "instrumento_avaliativo_recomendado": "string",
  "sinal_de_alerta": "string",
  "meta_alternativa_se_nao_atingida": "string"
}`.trim()
}

// ─ Template 5: Plano de Aula ─────────────────────────────────
export function templatePlanoAula(
    habilidades: HabilidadeBNCC[],
    nivelAluno: NivelOmnisfera,
    duracaoMinutos: number = 50,
    totalTurma: number = 25,
    totalPEI: number = 1,
    recursos: string = 'quadro, caderno, materiais básicos',
    metaPEI: string = '',
): string {
    return `
## TAREFA: GERAR PLANO DE AULA ADAPTADO

Habilidades BNCC: ${habilidades.map(h => h.codigo).join(', ')}
Descrições: ${habilidades.map(h => `${h.codigo}: "${h.habilidade}"`).join(' | ')}
Duração: ${duracaoMinutos} minutos
Alunos na turma: ${totalTurma} (${totalPEI} com PEI)
Nível Omnisfera do aluno com PEI: ${nivelAluno}
Recursos disponíveis: ${recursos}
Meta PEI relacionada: "${metaPEI}"

LEMBRE: a sequência deve ter DOIS planos paralelos — um para a turma e um para o aluno com PEI.
O aluno com PEI deve participar da mesma aula, com adaptações — NÃO atividade separada.

## SCHEMA DE SAÍDA (JSON obrigatório):
{
  "titulo_aula": "string",
  "habilidades_bncc": ["string"],
  "duracao_minutos": ${duracaoMinutos},
  "objetivos_gerais": ["string"],
  "objetivo_pei_especifico": "string",
  "sequencia_didatica": [
    {
      "momento": "Abertura|Desenvolvimento|Fechamento",
      "duracao_minutos": number,
      "atividade_turma": "string",
      "atividade_aluno_pei": "string",
      "material_turma": ["string"],
      "material_adaptado_pei": ["string"],
      "papel_professor": "string",
      "papel_monitor_se_houver": "string | null",
      "indicador_de_participacao_pei": "string"
    }
  ],
  "avaliacao": {
    "turma": "string",
    "aluno_pei": "string",
    "instrumento_pei": "string",
    "nivel_omnisfera_esperado_pos_aula": number
  },
  "ajustes_se_nivel_abaixo_esperado": "string",
  "conexao_proxima_aula": "string"
}`.trim()
}


// ── Montagem final do prompt completo ─────────────────────────
// Use esta função para montar o payload da requisição

export function buildPromptCompleto(
    tipo: TipoInstrumento,
    camada2_contexto: string,
    camada3_tarefa: string,
    perfil_nee: PerfilNEE,
    fewShotExemplos?: string,
): { system: string; user: string } {
    const regras_nee = REGRAS_NEE[perfil_nee]

    const user_parts = [
        camada2_contexto,
        regras_nee,
        fewShotExemplos ? `\n## EXEMPLOS DE REFERÊNCIA\n${fewShotExemplos}` : '',
        `\n${camada3_tarefa}`,
    ].filter(Boolean).join('\n\n')

    return {
        system: SYSTEM_PROMPT_OMNISFERA,
        user: user_parts,
    }
}
