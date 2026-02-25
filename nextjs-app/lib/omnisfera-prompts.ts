// ============================================================
// OMNISFERA — Prompts Engine for Avaliação Diagnóstica
// Adapted from omnisfera-ai-package/prompts/engine.ts
// 3-layer prompt system: System → Context → Task
// ============================================================

import type {
  NivelCognitivoSAEB,
} from './omnisfera-types'

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

━━━ PERFIS NEE ATENDIDOS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEA (Transtorno do Espectro Autista):
  - Linguagem direta, literal. Sem metáforas não explicadas.
  - Estrutura visual clara: enunciado curto, alternativas paralelas.
  - contexto_visual_sugerido: OBRIGATÓRIO para todas as questões.

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
3. Distratores NÃO podem ser absurdos — capturam erros típicos do nível do aluno.
4. Gabarito: sempre B ou C. Nunca A ou D.
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
- contexto_visual_sugerido é OBRIGATÓRIO.
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
- Cada questão deve avaliar uma habilidade diferente quando possível.

REGRAS OBRIGATÓRIAS:
- Gabarito: SEMPRE B ou C (nunca A ou D — viés de posição)
- Enunciado: máx. 3 sentenças, contexto real
- Alternativas: exatamente 4, paralelas em estrutura e comprimento
- Distratores capturam erros típicos do nível ${nivelAluno}
- instrucao_aplicacao_professor: obrigatória, mín. 20 caracteres

## SCHEMA DE SAÍDA (JSON obrigatório):
{
  "questoes": [
    {
      "id": "Q1",
      "habilidade_bncc_ref": "código BNCC",
      "enunciado": "string",
      "contexto_visual_sugerido": "string | null",
      "alternativas": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "gabarito": "B ou C",
      "analise_distratores": { "A": "erro que captura", "B_ou_C_incorreta": "erro que captura", "D": "erro que captura" },
      "justificativa_pedagogica": "string",
      "instrucao_aplicacao_professor": "string",
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

REGRAS:
- Situação-problema obrigatória com contexto real
- Verbos de comando no imperativo: ANALISE, JUSTIFIQUE, PROPONHA
- Padrão de resposta obrigatório (grade de correção)
- instrucao_aplicacao_professor: obrigatória

## SCHEMA DE SAÍDA (JSON obrigatório):
{
  "questoes": [
    {
      "id": "Q1",
      "habilidade_bncc_ref": "código BNCC",
      "enunciado": "string",
      "contexto_visual_sugerido": "string | null",
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
