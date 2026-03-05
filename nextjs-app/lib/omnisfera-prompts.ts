// ============================================================
// OMNISFERA — Prompts Engine for Avaliação Diagnóstica
// Adapted from omnisfera-ai-package/prompts/engine.ts
// 3-layer prompt system: System → Context → Task
// Ref: Guia de Ação Avaliativa (CAEd/UFJF)
//      Guia de Avaliação e Mediações Pedagógicas (MEC/CONSED 2025)
// ============================================================

import type {
  NivelCognitivoSAEB,
} from './omnisfera-types'

// ── Utilitário: distribuir gabaritos A-D ──────────────────────

/**
 * Distribui gabaritos equilibradamente entre A, B, C, D.
 * Garante ~25% em cada letra e embaralha para evitar padrões.
 */
export function distribuirGabaritos(total: number): string[] {
  const letras = ['A', 'B', 'C', 'D']
  const resultado: string[] = []
  for (let i = 0; i < total; i++) {
    resultado.push(letras[i % 4])
  }
  // Fisher-Yates shuffle
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]]
  }
  return resultado
}

// ── Camada 1: System Prompt ───────────────────────────────────

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

━━━ ESTRUTURA PEDAGÓGICA DO ITEM (Guia CAEd/UFJF) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Todo item de múltipla escolha DEVE seguir esta estrutura:

1. ENUNCIADO: instrução inicial clara e direta (máx. 2 sentenças)
   - Direciona o estudante para o suporte quando necessário
   - Ex: "Leia o texto abaixo." ou "Observe o gráfico a seguir."

2. SUPORTE (quando necessário):
   - Texto, gráfico, tabela ou descrição de cenário
   - SÓ incluir se ESSENCIAL ao percurso cognitivo
   - Adequado à etapa de ensino e faixa etária
   - Contextualizado e relevante para o estudante

3. COMANDO:
   - Pergunta ou sentença a ser completada
   - SEM negativas ("Qual NÃO é..." = PROIBIDO)
   - Claro, direto, sem ambiguidade
   - O verbo indica a operação cognitiva esperada

4. ALTERNATIVAS (exatamente 4):
   - GABARITO: resposta inequivocamente correta
   - DISTRATORES: baseados em ERROS COGNITIVOS REAIS (ver regras abaixo)

REGRA FUNDAMENTAL: 1 ITEM = 1 HABILIDADE.
Cada questão avalia somente UMA habilidade BNCC específica.

━━━ REGRAS PARA DISTRATORES (Guia CAEd) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cada distrator deve capturar um ERRO COGNITIVO REAL e plausível:
- Leitura/interpretação superficial do suporte
- Confusão entre conceitos relacionados
- Aplicação parcial ou incompleta da habilidade
- Inversão de relações (causa/efeito, maior/menor)
- Generalização indevida de uma informação

PROIBIDO:
- Distratores absurdos ou incoerentes ("pegadinhas")
- Distratores óbvios que qualquer estudante descartaria
- Alternativas com extensão muito diferente das demais

Para cada distrator, justifique BREVEMENTE em analise_distratores o erro que ele captura.

━━━ REGRAS PARA SUPORTE VISUAL (Guia CAEd) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quando incluir suporte visual:
✅ A habilidade exige interpretação visual (gráficos, mapas, diagramas)
✅ O contexto precisa de cenário que texto puro não comunica bem
✅ O perfil NEE indica necessidade de apoio visual (ex: TEA)

Quando NÃO incluir:
❌ Apenas para "decorar" ou "enfeitar" a questão
❌ Quando o texto já é suficiente para o percurso cognitivo
❌ Quando a imagem pode confundir mais do que ajudar

Se suporte visual for necessário, preencha o campo suporte_visual com detalhes.
Se NÃO for necessário, defina suporte_visual.necessario = false.

━━━ CONTROLE DE DIFICULDADE (Guia CAEd) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A dificuldade é controlada por 3 fatores:
1. Complexidade do SUPORTE (texto mais simples → mais complexo)
2. Sofisticação dos DISTRATORES (erros mais óbvios → mais sutis)
3. Nível do VERBO cognitivo (identificar < comparar < avaliar)
NUNCA torne difícil por linguagem inacessível ou pegadinhas.

━━━ PERFIS NEE ATENDIDOS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEA (Transtorno do Espectro Autista):
  - Linguagem direta, literal. Sem metáforas não explicadas.
  - Estrutura visual clara: enunciado curto, alternativas paralelas.
  - suporte_visual.necessario: OBRIGATÓRIO (true) para todas as questões.

DI (Deficiência Intelectual):
  - Vocabulário do ano de referência PEI, não do ano de matrícula.
  - Sentenças máx. 20 palavras no enunciado.
  - Material concreto como mediação preferencial.

Altas Habilidades / Superdotação:
  - Nível cognitivo III (Avaliar/Criar) por padrão.
  - Conexões interdisciplinares obrigatórias.

Transtornos de Aprendizagem (Dislexia, TDAH, Discalculia):
  - Separar habilidade-alvo de habilidade-instrumento.
  - Para TDAH: tempo_estimado_minutos máx. 5 por questão.

━━━ REGRAS DE FORMATO OBRIGATÓRIAS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Enunciado: máx. 3 sentenças. Linguagem ativa. Contexto real e relevante.
2. Alternativas: exatamente 4. A correta + 3 distratores pedagogicamente plausíveis.
3. Distratores capturam erros cognitivos reais do nível do aluno (ver regras acima).
4. Gabarito: a letra do gabarito é DEFINIDA pelo sistema e informada na tarefa.
5. justificativa_pedagogica: obrigatória.
6. instrucao_aplicacao_professor: obrigatória — como aplicar e qual suporte oferecer.
7. NUNCA avalie a deficiência. Se a habilidade-alvo é matemática, leitura não pode ser a barreira.

━━━ FORMATO DE SAÍDA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEMPRE retorne JSON válido. NÃO inclua texto fora do JSON. NÃO use markdown.
Se não conseguir gerar um campo obrigatório, use null e informe em observacoes_geracao.`


// ── Regras por perfil NEE ─────────────────────────────────────

export const REGRAS_NEE: Record<string, string> = {
  TEA: `## REGRAS ADICIONAIS — TEA
- Use linguagem literal. Evite ironias, metáforas não explicadas.
- suporte_visual.necessario DEVE ser true em TODAS as questões.
- Alternativas curtas e estruturalmente paralelas.
- Nunca avalie capacidade social — avalie habilidade curricular específica.`,

  DI: `## REGRAS ADICIONAIS — DI
- Referência de vocabulário: ano_referencia_pei, NUNCA ano_matricula.
- Enunciado máx. 15-20 palavras.
- Sempre oferecer versão com material concreto em instrucao_professor.
- Quebrar em micro-etapas se nível < 3.`,

  ALTAS_HABILIDADES: `## REGRAS ADICIONAIS — ALTAS HABILIDADES
- Nível cognitivo padrão: III (Avaliar/Criar).
- Inclua conexões interdisciplinares.
- Metas com dimensão de enriquecimento, não apenas aceleração.`,

  TRANSTORNO_APRENDIZAGEM: `## REGRAS ADICIONAIS — TRANSTORNOS DE APRENDIZAGEM
- SEPARAR habilidade-alvo da habilidade-instrumento.
- instrucao_professor DEVE incluir alternativa de resposta oral.
- Para TDAH: tempo_estimado_minutos máx. 5.
- Para dislexia: indicar fonte ≥12pt e entrelinhas amplas.`,

  SEM_NEE: `## CONTEXTO — SEM NEE DIAGNOSTICADA
- Aplique o currículo padrão do ano de matrícula.
- A escala Omnisfera ainda se aplica para diagnóstico de aprendizagem.`,
}

// Map common diagnostic names to NEE profile keys
export function mapDiagnosticoToPerfilNEE(diagnostico: string): string {
  const d = (diagnostico || '').toLowerCase()
  if (d.includes('tea') || d.includes('autis')) return 'TEA'
  if (d.includes('deficiência intelectual') || d.includes(' di ') || d === 'di') return 'DI'
  if (d.includes('altas habilidades') || d.includes('superdota')) return 'ALTAS_HABILIDADES'
  if (d.includes('dislexia') || d.includes('tdah') || d.includes('discalculia') || d.includes('transtorno')) return 'TRANSTORNO_APRENDIZAGEM'
  return 'SEM_NEE'
}

// ── Cognitive level auto-rule ────────────────────────────────

export function nivelCognitivoAutomatico(nivelOmnisfera: number): NivelCognitivoSAEB {
  if (nivelOmnisfera <= 2) return 'I'
  if (nivelOmnisfera === 3) return 'II'
  return 'III'
}

// ── Camada 2: Contexto do Aluno ───────────────────────────────

export function buildContextoAluno(params: {
  nome: string
  serie: string
  diagnostico: string
  nivel_omnisfera_estimado?: number
  observacao_professor?: string
}): string {
  const perfil = mapDiagnosticoToPerfilNEE(params.diagnostico)
  return `
## CONTEXTO DO ESTUDANTE
Nome: ${params.nome}
Ano de matrícula: ${params.serie}
Perfil NEE: ${perfil} (${params.diagnostico || 'não informado'})
Nível Omnisfera estimado: ${params.nivel_omnisfera_estimado ?? 'a identificar'}
${params.observacao_professor ? `Observação do professor: "${params.observacao_professor}"` : ''}

${REGRAS_NEE[perfil] || REGRAS_NEE.SEM_NEE}
`.trim()
}

// ── Camada 3: Template de Questões Diagnósticas ──────────────

export function templateQuestoesDiagnosticas(params: {
  habilidades: Array<{
    codigo: string
    disciplina: string
    unidade_tematica: string
    objeto_conhecimento: string
    habilidade: string
    nivel_cognitivo_saeb?: string
  }>
  quantidade: number
  tipo_questao: 'Objetiva' | 'Discursiva'
  nivel_omnisfera_estimado?: number
  plano_ensino_contexto?: string
  gabaritos_definidos?: string[]  // ['B', 'A', 'D', 'C', ...] — defined by system
}): string {
  const nivelAluno = params.nivel_omnisfera_estimado ?? 1
  const nivelCognitivo = nivelCognitivoAutomatico(nivelAluno)

  const habsStr = params.habilidades.map((h, i) =>
    `${i + 1}. [${h.codigo}] ${h.disciplina} — ${h.unidade_tematica} / ${h.objeto_conhecimento}
   "${h.habilidade}"
   Nível Cognitivo SAEB: ${h.nivel_cognitivo_saeb || nivelCognitivo}`
  ).join('\n\n')

  const planoContext = params.plano_ensino_contexto
    ? `\n## PLANO DE ENSINO VINCULADO (use como contexto)\n${params.plano_ensino_contexto.slice(0, 2000)}`
    : ''

  // Build gabarito instructions
  const gabs = params.gabaritos_definidos || distribuirGabaritos(params.quantidade)
  const gabaritoInstrucao = gabs.map((g, i) =>
    `Questão ${i + 1}: gabarito DEVE ser letra ${g}`
  ).join('\n')

  if (params.tipo_questao === 'Objetiva') {
    return `
## TAREFA: GERAR ${params.quantidade} QUESTÕES DIAGNÓSTICAS — MÚLTIPLA ESCOLHA

Nível Omnisfera do aluno: ${nivelAluno}
Nível cognitivo SAEB alvo: Nível ${nivelCognitivo}

HABILIDADES BNCC A AVALIAR:
${habsStr}
${planoContext}

REGRAS DE DIFICULDADE PROGRESSIVA:
- Crie questões com dificuldade CRESCENTE: começa nível ${Math.max(0, nivelAluno - 1)}, vai até ${Math.min(4, nivelAluno + 2)}.
- Cada questão DEVE avaliar UMA habilidade diferente (1 item = 1 habilidade).

GABARITOS DEFINIDOS PELO SISTEMA (obrigatório seguir):
${gabaritoInstrucao}
Organize as alternativas de modo que a resposta correta esteja na posição indicada.

ESTRUTURA OBRIGATÓRIA DE CADA ITEM (Guia CAEd):
1. ENUNCIADO: instrução clara e direta (máx. 2 sentenças)
2. SUPORTE: texto/cenário contextualizado (SÓ se essencial ao percurso cognitivo)
3. COMANDO: pergunta SEM negativas, SEM ambiguidade
4. ALTERNATIVAS: 4 opções paralelas em estrutura e comprimento
   - Gabarito inequívoco na posição definida acima
   - 3 distratores baseados em erros cognitivos reais

REGRAS OBRIGATÓRIAS:
- Enunciado: máx. 3 sentenças, contexto real, linguagem ativa
- Distratores: cada um captura um erro cognitivo específico (justificar em analise_distratores)
- instrucao_aplicacao_professor: obrigatória, mín. 20 caracteres
- suporte_visual: definir se é necessário ou não (ver schema)

## SCHEMA DE SAÍDA (JSON obrigatório):
{
  "questoes": [
    {
      "id": "Q1",
      "habilidade_bncc_ref": "código BNCC",
      "enunciado": "string — instrução inicial + suporte textual quando necessário",
      "comando": "string — a pergunta em si",
      "suporte_visual": {
        "necessario": true | false,
        "justificativa": "string — por que é ou não necessário",
        "tipo": "grafico | mapa | diagrama | tabela | ilustracao | fotografia | null",
        "descricao_para_geracao": "string detalhada para gerar a imagem | null",
        "texto_alternativo": "string — acessibilidade | null"
      },
      "alternativas": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "gabarito": "A | B | C | D",
      "analise_distratores": {
        "A": "erro cognitivo que captura (se A não for gabarito) | gabarito",
        "B": "erro cognitivo que captura (se B não for gabarito) | gabarito",
        "C": "erro cognitivo que captura (se C não for gabarito) | gabarito",
        "D": "erro cognitivo que captura (se D não for gabarito) | gabarito"
      },
      "justificativa_pedagogica": "string",
      "instrucao_aplicacao_professor": "string — como aplicar e qual suporte oferecer",
      "adaptacao_nee_aplicada": "string",
      "nivel_suporte_recomendado": "S1|S2|S3|S4",
      "nivel_omnisfera_alvo": number,
      "nivel_bloom": "Lembrar|Compreender|Aplicar|Analisar|Avaliar|Criar",
      "tempo_estimado_minutos": number
    }
  ],
  "observacoes_geracao": "string | null"
}`.trim()
  }

  // Discursiva
  return `
## TAREFA: GERAR ${params.quantidade} QUESTÕES DIAGNÓSTICAS — DISCURSIVAS

Nível Omnisfera do aluno: ${nivelAluno}
Nível cognitivo SAEB alvo: Nível ${nivelCognitivo}

HABILIDADES BNCC A AVALIAR:
${habsStr}
${planoContext}

ESTRUTURA OBRIGATÓRIA DE CADA ITEM:
1. ENUNCIADO + SUPORTE: situação-problema com contexto real
2. COMANDO: verbos no imperativo (ANALISE, JUSTIFIQUE, PROPONHA)
3. Cada questão DEVE avaliar UMA habilidade diferente (1 item = 1 habilidade)

REGRAS:
- Padrão de resposta obrigatório (grade de correção)
- instrucao_aplicacao_professor: obrigatória
- suporte_visual: definir se é necessário ou não

## SCHEMA DE SAÍDA (JSON obrigatório):
{
  "questoes": [
    {
      "id": "Q1",
      "habilidade_bncc_ref": "código BNCC",
      "enunciado": "string — situação-problema",
      "comando": "string — instrução ao estudante",
      "suporte_visual": {
        "necessario": true | false,
        "justificativa": "string",
        "tipo": "grafico | mapa | diagrama | tabela | ilustracao | fotografia | null",
        "descricao_para_geracao": "string | null",
        "texto_alternativo": "string | null"
      },
      "padrao_resposta": { "topicos_essenciais": ["string"], "resposta_ideal_resumida": "string" },
      "justificativa_pedagogica": "string",
      "instrucao_aplicacao_professor": "string",
      "adaptacao_nee_aplicada": "string",
      "nivel_suporte_recomendado": "S1|S2|S3|S4",
      "nivel_omnisfera_alvo": number,
      "nivel_bloom": "string",
      "tempo_estimado_minutos": number
    }
  ],
  "observacoes_geracao": "string | null"
}`.trim()
}

// ── Template: Perfil de Funcionamento (V3 tipo 3) ────────────

export function templatePerfilFuncionamento(params: {
  nome: string
  serie: string
  diagnostico: string
  dimensoes_avaliadas: Array<{
    dimensao: string
    nivel_observado: number
    observacao: string
  }>
  habilidades_curriculares: Array<{
    codigo_bncc: string
    disciplina: string
    nivel: number
  }>
}): string {
  const dimsStr = params.dimensoes_avaliadas.map((d, i) =>
    `${i + 1}. ${d.dimensao}: Nível ${d.nivel_observado}\n   Observação: "${d.observacao}"`
  ).join('\n\n')

  const habsStr = params.habilidades_curriculares.map(h =>
    `- [${h.codigo_bncc}] ${h.disciplina}: Nível ${h.nivel}`
  ).join('\n')

  return `
## TAREFA: GERAR PERFIL DE FUNCIONAMENTO DO ESTUDANTE

REGRA FUNDAMENTAL: termos clínicos DESAPARECEM do output.
O professor recebe comportamentos observáveis + ações práticas, NUNCA diagnósticos.
Use linguagem acessível e direta.

Estudante: ${params.nome}
Série: ${params.serie}
Perfil: ${params.diagnostico}

DIMENSÕES COGNITIVO-FUNCIONAIS AVALIADAS:
${dimsStr}

HABILIDADES CURRICULARES (Camada A):
${habsStr}

## SCHEMA DE SAÍDA (JSON obrigatório):
{
  "resumo_geral": "string — 2-3 frases, linguagem acessível",
  "pontos_fortes": ["string — o que o aluno FAZ bem"],
  "areas_atencao": ["string — onde precisa de mais apoio"],
  "dimensoes": [
    {
      "dimensao": "string",
      "nivel": number,
      "descricao_comportamental": "string — SEM termos clínicos",
      "suporte_recomendado": "S1|S2|S3|S4"
    }
  ],
  "habilidades_curriculares": [
    {
      "codigo_bncc": "string",
      "disciplina": "string",
      "nivel": number
    }
  ],
  "recomendacao_prioridade": ["string — top 3 ações prioritárias"]
}`.trim()
}

// ── Template: Estratégias Práticas (V3 tipo 4) ───────────────

export function templateEstrategiasPraticas(params: {
  nome: string
  diagnostico: string
  dimensoes_com_dificuldade: Array<{
    dimensao: string
    nivel: number
    observacao: string
  }>
}): string {
  const dimsStr = params.dimensoes_com_dificuldade.map((d, i) =>
    `${i + 1}. ${d.dimensao} (Nível ${d.nivel}): "${d.observacao}"`
  ).join('\n')

  return `
## TAREFA: GERAR ESTRATÉGIAS PRÁTICAS PARA O PROFESSOR

PRINCÍPIO: dimensão cognitiva → comportamento observável → ação concreta.
O professor NÃO precisa saber o nome da dimensão. Precisa saber o que FAZER AMANHÃ.
NUNCA use termos clínicos no output.

Estudante: ${params.nome}
Perfil: ${params.diagnostico}

DIFICULDADES OBSERVADAS:
${dimsStr}

Para CADA dificuldade, gere:
1. O que o professor VÊ (comportamento observável)
2. O que o professor FAZ (ação concreta, prática, imediata)
3. Quando usar (situação específica)
4. Exemplo prático

## SCHEMA DE SAÍDA (JSON obrigatório):
{
  "estrategias": [
    {
      "comportamento_observado": "string",
      "acao_concreta": "string",
      "quando_usar": "string",
      "exemplo_pratico": "string",
      "prioridade": "essencial|recomendada|complementar"
    }
  ],
  "rotina_diaria_sugerida": ["string — ações para a rotina do dia"],
  "o_que_evitar": ["string — erros comuns que o professor deve evitar"],
  "observacoes": "string | null"
}`.trim()
}

// ── Build complete prompt ────────────────────────────────────

export function buildPromptCompleto(
  camada2_contexto: string,
  camada3_tarefa: string,
): { system: string; user: string } {
  return {
    system: SYSTEM_PROMPT_OMNISFERA,
    user: `${camada2_contexto}\n\n${camada3_tarefa}`,
  }
}
