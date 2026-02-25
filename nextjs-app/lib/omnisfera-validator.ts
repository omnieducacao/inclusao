// ============================================================
// OMNISFERA — Validador de Outputs da IA
// Executar antes de exibir qualquer conteúdo gerado ao professor
// ============================================================

import type {
  OutputQuestoesDiagnosticas,
  QuestaoGerada,
  ResultadoValidacao,
  PerfilNEE,
  NivelOmnisfera,
  NivelCognitivoSAEB,
} from './omnisfera-types'

// ── Validador principal de questões diagnósticas ──────────────

export function validarQuestoesDiagnosticas(
  output: OutputQuestoesDiagnosticas,
  perfil_nee: PerfilNEE,
  nivel_omnisfera: NivelOmnisfera,
): ResultadoValidacao {
  const erros: string[] = []
  const avisos: string[] = []

  if (!output.questoes || !Array.isArray(output.questoes)) {
    erros.push('Campo questoes ausente ou inválido')
    return { valido: false, erros, avisos }
  }

  for (const q of output.questoes) {
    // Regra 1: gabarito nunca pode ser A ou D
    if (!['B', 'C'].includes(q.gabarito)) {
      erros.push(`${q.id}: gabarito inválido (${q.gabarito}) — deve ser B ou C`)
    }

    // Regra 2: enunciado máx. 3 sentenças
    const sentencas = q.enunciado.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentencas.length > 3) {
      erros.push(`${q.id}: enunciado tem ${sentencas.length} sentenças (máx. 3)`)
    }

    // Regra 3: enunciado máx. 20 palavras para DI
    if (perfil_nee === 'DI') {
      const palavras = q.enunciado.split(/\s+/).length
      if (palavras > 20) {
        erros.push(`${q.id}: enunciado tem ${palavras} palavras (máx. 20 para DI)`)
      }
    }

    // Regra 4: instrução ao professor obrigatória
    if (!q.instrucao_aplicacao_professor || q.instrucao_aplicacao_professor.length < 20) {
      erros.push(`${q.id}: instrucao_aplicacao_professor ausente ou muito curta`)
    }

    // Regra 5: contexto visual obrigatório para TEA
    if (perfil_nee === 'TEA' && !q.contexto_visual_sugerido) {
      erros.push(`${q.id}: contexto_visual_sugerido obrigatório para TEA`)
    }

    // Regra 6: justificativa pedagógica obrigatória
    if (!q.justificativa_pedagogica || q.justificativa_pedagogica.length < 20) {
      erros.push(`${q.id}: justificativa_pedagogica ausente ou muito curta`)
    }

    // Regra 7: nível cognitivo compatível com nível Omnisfera
    const nivelCogn: string = output.nivel_cognitivo_saeb ?? ''
    if (nivel_omnisfera <= 2 && nivelCogn.includes('III')) {
      erros.push(`${q.id}: nível cognitivo III inadequado para aluno em nível Omnisfera ${nivel_omnisfera}`)
    }

    // Avisos (não bloqueiam, mas são registrados)
    if (q.tempo_estimado_minutos > 5 && perfil_nee === 'TRANSTORNO_APRENDIZAGEM') {
      avisos.push(`${q.id}: tempo estimado ${q.tempo_estimado_minutos}min pode ser longo para TDAH (recomendado: máx. 5min)`)
    }

    const palavrasEnunciado = q.enunciado.split(/\s+/).length
    if (palavrasEnunciado < 5) {
      avisos.push(`${q.id}: enunciado muito curto (${palavrasEnunciado} palavras) — verifique se é suficientemente contextualizado`)
    }
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos,
  }
}

// ── Retry automático com autocorreção ─────────────────────────

export async function gerarComRetry<T>(
  chamadaAPI: (promptExtra?: string) => Promise<T>,
  validar: (output: T) => ResultadoValidacao,
  maxRetries: number = 2,
): Promise<{ resultado: T; tentativas: number; avisos: string[] }> {
  let promptExtra = ''

  for (let tentativa = 0; tentativa <= maxRetries; tentativa++) {
    const resultado = await chamadaAPI(promptExtra)
    const { valido, erros, avisos } = validar(resultado)

    if (valido) {
      return { resultado, tentativas: tentativa + 1, avisos }
    }

    if (tentativa < maxRetries) {
      promptExtra = `\n\nCORREÇÕES OBRIGATÓRIAS NA PRÓXIMA GERAÇÃO:\n${erros.map(e => `- ${e}`).join('\n')}\n\nGere novamente respeitando todas as correções acima.`
    }
  }

  throw new Error(`Geração falhou após ${maxRetries + 1} tentativas`)
}

// ── Métricas de qualidade (para dashboard interno) ────────────

export interface MetricaQualidade {
  total_gerados: number
  aprovados_sem_edicao: number
  aprovados_com_edicao: number
  rejeitados: number
  total_retries: number
  taxa_aprovacao_direta: number   // meta: > 70%
  taxa_retry: number              // meta: < 15%
}

export function calcularMetricas(registros: Array<{
  status: 'aprovado' | 'aprovado_com_edicao' | 'rejeitado'
  tentativas: number
}>): MetricaQualidade {
  const total = registros.length
  const aprovados = registros.filter(r => r.status === 'aprovado').length
  const aprovadosEditados = registros.filter(r => r.status === 'aprovado_com_edicao').length
  const rejeitados = registros.filter(r => r.status === 'rejeitado').length
  const retries = registros.filter(r => r.tentativas > 1).length

  return {
    total_gerados: total,
    aprovados_sem_edicao: aprovados,
    aprovados_com_edicao: aprovadosEditados,
    rejeitados,
    total_retries: retries,
    taxa_aprovacao_direta: total > 0 ? (aprovados / total) * 100 : 0,
    taxa_retry: total > 0 ? (retries / total) * 100 : 0,
  }
}
