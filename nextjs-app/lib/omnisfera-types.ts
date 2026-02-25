// ============================================================
// OMNISFERA — Tipos TypeScript do Sistema
// Gerado automaticamente — não editar manualmente
// ============================================================

// ── Segmentos e Perfis ───────────────────────────────────────

export type Segmento = 'EI' | 'EF1' | 'EF2' | 'EM'

export type PerfilNEE =
  | 'TEA'
  | 'DI'
  | 'ALTAS_HABILIDADES'
  | 'TRANSTORNO_APRENDIZAGEM'
  | 'MULTIPLO'
  | 'SEM_NEE'

export type NivelSuporte = 'S1' | 'S2' | 'S3' | 'S4'

export type NivelCognitivoSAEB = 'I' | 'II' | 'III'

export type PrioridadeSAEB = 'alta' | 'media' | 'baixa'

// ── Escala de Proficiência Omnisfera ─────────────────────────

export type NivelOmnisfera = 0 | 1 | 2 | 3 | 4

export interface DescricaoNivel {
  nivel: NivelOmnisfera
  label: string
  descricao: string
  suporte_correspondente: NivelSuporte
  instrumento_recomendado: string
}

export const ESCALA_OMNISFERA: Record<NivelOmnisfera, DescricaoNivel> = {
  0: {
    nivel: 0,
    label: 'Não Iniciado',
    descricao: 'Não demonstra a habilidade mesmo com mediação total do professor.',
    suporte_correspondente: 'S4',
    instrumento_recomendado: 'Observação / Registro anedótico',
  },
  1: {
    nivel: 1,
    label: 'Emergente',
    descricao: 'Reage a estímulos relacionados sem executar a habilidade de forma reconhecível.',
    suporte_correspondente: 'S3',
    instrumento_recomendado: 'Roteiro de observação guiada',
  },
  2: {
    nivel: 2,
    label: 'Em Desenvolvimento',
    descricao: 'Realiza parcialmente com apoio direto e contínuo.',
    suporte_correspondente: 'S3',
    instrumento_recomendado: 'Questão contextualizada + observação',
  },
  3: {
    nivel: 3,
    label: 'Consolidando',
    descricao: 'Realiza em contexto estruturado com suporte mínimo.',
    suporte_correspondente: 'S2',
    instrumento_recomendado: 'Questão estilo SAEB / produção guiada',
  },
  4: {
    nivel: 4,
    label: 'Consolidado',
    descricao: 'Realiza com autonomia em diferentes contextos.',
    suporte_correspondente: 'S1',
    instrumento_recomendado: 'Questão aberta / projeto / portfólio',
  },
}

// ── BNCC ─────────────────────────────────────────────────────

export interface HabilidadeBNCC {
  codigo: string
  disciplina: string
  ano: string
  segmento: Segmento
  unidade_tematica: string
  objeto_conhecimento: string
  habilidade: string
  nivel_cognitivo_saeb: NivelCognitivoSAEB
  prioridade_saeb: PrioridadeSAEB
}

// ── PEI — Fases por Disciplina ──────────────────────────────

export type FaseStatusPEIDisciplina =
  | 'plano_ensino'
  | 'diagnostica'
  | 'pei_disciplina'
  | 'concluido'

export const FASE_STATUS_LABELS: Record<FaseStatusPEIDisciplina, string> = {
  plano_ensino: 'Plano de Ensino',
  diagnostica: 'Diagnóstica',
  pei_disciplina: 'PEI Disciplina',
  concluido: 'Concluído',
}

export const DISCIPLINAS_EF = [
  'Língua Portuguesa',
  'Matemática',
  'Ciências',
  'História',
  'Geografia',
  'Arte',
  'Educação Física',
  'Língua Inglesa',
]

// ── Aluno / PEI ───────────────────────────────────────────────

export interface PerfilAluno {
  id: string
  nome_primeiro: string            // nunca sobrenome — LGPD
  ano_matricula: string
  ano_referencia_pei: string
  perfil_nee_primario: PerfilNEE
  perfil_nee_secundario?: PerfilNEE
  canal_comunicacao: string        // ex: "verbal", "PECS", "CAA digital"
  recursos_assistivos: string[]    // ex: ["leitor de tela", "prancha de comunicação"]
  suporte_atual: NivelSuporte
}

export interface NivelHabilidade {
  codigo_bncc: string
  nivel: NivelOmnisfera
  suporte_necessario: NivelSuporte
  observacao_professor: string
  data_avaliacao: string           // ISO 8601
  avaliado_por: string             // id do professor
}

export interface HistoricoNivel {
  codigo_bncc: string
  registros: Array<{
    data: string
    nivel: NivelOmnisfera
    suporte: NivelSuporte
    bimestre: number
    ano_letivo: number
  }>
}

// ── Metas PEI ─────────────────────────────────────────────────

export interface MetaSMART {
  id: string
  aluno_id: string
  codigo_bncc: string
  nivel_atual: NivelOmnisfera
  nivel_meta: NivelOmnisfera
  periodo: string
  enunciado_smart: string
  especifica: string
  criterio_mensuravel: string
  consistencia_mensuravel: string
  justificativa_atingivel: string
  impacto_relevante: string
  prazo_temporal: string
  marcos_intermediarios: Array<{
    semana: number
    micro_objetivo: string
    indicador: string
  }>
  estrategias_ensino: string[]
  indicadores_sucesso: string[]
  instrumento_avaliativo: string
  sinal_alerta: string
  meta_alternativa: string
  status: 'rascunho' | 'ativa' | 'atingida' | 'revisada'
  criada_em: string
  gerada_por_ia: boolean
}

// ── Instrumentos Gerados pela IA ──────────────────────────────

export type TipoInstrumento =
  | 'questao_diagnostica'
  | 'roteiro_observacao'
  | 'adaptacao_curricular'
  | 'meta_smart'
  | 'plano_aula'
  | 'perfil_funcionamento'
  | 'estrategias_praticas'

export type StatusInstrumento =
  | 'aguardando_revisao'
  | 'aprovado'
  | 'aprovado_com_edicao'
  | 'rejeitado'

export interface Alternativas {
  A: string
  B: string
  C: string
  D: string
}

export interface AnalistDistratores {
  A: string
  D: string
}

export interface QuestaoGerada {
  id: string
  enunciado: string
  contexto_visual_sugerido: string | null
  alternativas: Alternativas
  gabarito: 'B' | 'C'
  analise_distratores: AnalistDistratores
  justificativa_pedagogica: string
  instrucao_aplicacao_professor: string
  adaptacao_nee_aplicada: string
  nivel_suporte_recomendado: NivelSuporte
  tempo_estimado_minutos: number
}

export interface InstrumentoGerado {
  id: string
  aluno_id: string
  codigo_bncc: string
  tipo: TipoInstrumento
  conteudo: unknown               // tipo específico depende do tipo
  modelo_ia: string               // ex: "deepseek-r1", "kimi-k2", "claude-sonnet"
  timestamp: string
  status: StatusInstrumento
  editado_por_professor?: string
  conteudo_editado?: unknown
}

export interface OutputQuestoesDiagnosticas {
  habilidade_bncc: string
  nivel_cognitivo_saeb: string
  nivel_omnisfera_alvo: NivelOmnisfera
  questoes: QuestaoGerada[]
  observacoes_geracao: string | null
}

// ── Adaptações Curriculares ───────────────────────────────────

export interface AdaptacaoCurricular {
  descricao: string
  recursos_necessarios?: string[]
  custo_implementacao?: 'zero' | 'baixo' | 'medio' | 'alto'
  tempo_implementacao?: 'imediato' | '1_semana' | '1_mes'
  objetivo_adaptado?: string
  conteudo_priorizado?: string[]
  estrategias?: string[]
  instrumentos_alternativos?: string[]
  ajuste_recomendado?: string
}

export interface OutputAdaptacoes {
  adaptacoes: {
    de_acesso: AdaptacaoCurricular
    de_objetivo: AdaptacaoCurricular
    de_conteudo: AdaptacaoCurricular
    de_metodo: AdaptacaoCurricular
    de_avaliacao: AdaptacaoCurricular
    de_tempo: AdaptacaoCurricular
  }
  adaptacoes_prioritarias: string[]
  o_que_nao_adaptar: string
  justificativa_legal: string
}

// ── Plano de Aula ────────────────────────────────────────────

export interface MomentoAula {
  momento: 'Abertura' | 'Desenvolvimento' | 'Fechamento'
  duracao_minutos: number
  atividade_turma: string
  atividade_aluno_pei: string
  material_turma: string[]
  material_adaptado_pei: string[]
  papel_professor: string
  papel_monitor_se_houver: string | null
  indicador_de_participacao_pei: string
}

export interface OutputPlanoAula {
  titulo_aula: string
  habilidades_bncc: string[]
  duracao_minutos: number
  objetivos_gerais: string[]
  objetivo_pei_especifico: string
  sequencia_didatica: MomentoAula[]
  avaliacao: {
    turma: string
    aluno_pei: string
    instrumento_pei: string
    nivel_omnisfera_esperado_pos_aula: NivelOmnisfera
  }
  ajustes_se_nivel_abaixo_esperado: string
  conexao_proxima_aula: string
}

// ── Configuração da API de IA ─────────────────────────────────

export type ModeloIA = 'deepseek-r1' | 'kimi-k2' | 'claude-sonnet-4-5'

export interface ConfiguracaoIA {
  modelo: ModeloIA
  temperature: number
  top_p: number
  max_tokens: number
  response_format?: { type: 'json_object' }
}

export const CONFIGURACOES_POR_TIPO: Record<TipoInstrumento, ConfiguracaoIA> = {
  questao_diagnostica: { modelo: 'deepseek-r1', temperature: 0.4, top_p: 0.85, max_tokens: 2000, response_format: { type: 'json_object' } },
  roteiro_observacao: { modelo: 'deepseek-r1', temperature: 0.3, top_p: 0.80, max_tokens: 1500, response_format: { type: 'json_object' } },
  adaptacao_curricular: { modelo: 'deepseek-r1', temperature: 0.5, top_p: 0.90, max_tokens: 1800, response_format: { type: 'json_object' } },
  meta_smart: { modelo: 'deepseek-r1', temperature: 0.3, top_p: 0.80, max_tokens: 1500, response_format: { type: 'json_object' } },
  plano_aula: { modelo: 'deepseek-r1', temperature: 0.6, top_p: 0.92, max_tokens: 3000, response_format: { type: 'json_object' } },
  perfil_funcionamento: { modelo: 'deepseek-r1', temperature: 0.4, top_p: 0.85, max_tokens: 2000, response_format: { type: 'json_object' } },
  estrategias_praticas: { modelo: 'deepseek-r1', temperature: 0.5, top_p: 0.88, max_tokens: 1500, response_format: { type: 'json_object' } },
}

// ── Resultado de Validação ────────────────────────────────────

export interface ResultadoValidacao {
  valido: boolean
  erros: string[]
  avisos: string[]
}

// ── V3: Dimensões Cognitivo-Funcionais (Camada B) ─────────────

export interface DimensaoNEE {
  id: string
  dimensao: string
  o_que_o_professor_observa: string
  acao_pratica: string
  indicadores_observaveis: string[]
  perguntas_professor: string[]
  niveis_omnisfera: Record<string, string>  // "0" | "1" | "2" | "3" | "4"
}

export interface PerfilNEECompleto {
  perfil: string      // TEA | DI | TA | AH
  nome_completo: string
  dimensoes: DimensaoNEE[]
}

export interface CamadaCognitivoFuncional {
  perfil_nee: string
  dimensoes_avaliadas: Array<{
    dimensao_id: string
    nivel_observado: NivelOmnisfera
    observacao_professor: string
    indicadores_presentes: string[]
  }>
  data_avaliacao: string
  avaliado_por: string
}

// ── V3: Perfil de Funcionamento (Output tipo 3) ──────────────

export interface PerfilFuncionamento {
  aluno_id: string
  nome: string
  perfil_nee: string
  resumo_geral: string
  pontos_fortes: string[]
  areas_atencao: string[]
  dimensoes: Array<{
    dimensao: string
    nivel: NivelOmnisfera
    descricao_comportamental: string  // SEM termos clínicos
    suporte_recomendado: NivelSuporte
  }>
  habilidades_curriculares: Array<{
    codigo_bncc: string
    disciplina: string
    nivel: NivelOmnisfera
  }>
  recomendacao_prioridade: string[]
}

// ── V3: Estratégias Práticas (Output tipo 4) ─────────────────

export interface EstrategiaPratica {
  comportamento_observado: string    // O que o professor VÊ
  acao_concreta: string              // O que o professor FAZ
  quando_usar: string                // Em que situação
  exemplo_pratico: string            // Exemplo concreto
  prioridade: 'essencial' | 'recomendada' | 'complementar'
}

export interface OutputEstrategiasPraticas {
  perfil_nee: string
  estrategias: EstrategiaPratica[]
  rotina_diaria_sugerida: string[]
  o_que_evitar: string[]
  observacoes: string | null
}

// ── V3: Avaliação Diagnóstica Inicial Completa ───────────────

export interface AvaliacaoDiagnosticaInicial {
  aluno_id: string
  disciplina: string
  professor_id: string
  data: string
  camada_a: {  // Curricular
    habilidades_avaliadas: NivelHabilidade[]
  }
  camada_b: CamadaCognitivoFuncional  // Cognitivo-funcional
  perfil_gerado?: PerfilFuncionamento
  estrategias_geradas?: OutputEstrategiasPraticas
  status: 'em_andamento' | 'concluida' | 'revisada'
}

// ── V3: Plano Genérico Padrão (Etapa 0) ──────────────────────

export interface PlanoGenerico {
  id: string
  segmento: string
  ano?: string
  faixa_etaria?: string
  disciplina?: string
  campo_experiencia?: string
  prioridade_pei: string
  total_objetivos: number
  referencia_cruzada: {
    descricao: string
    usar_quando_crianca_em?: string
    se_nao_atingido_usar?: string
  }
  competencias_funcionais_pei: string[]
  alertas_por_perfil_nee: Record<string, string>
  instrucao_uso_diagnostica: string
  objetivos_nivel_I_reconhecer: Array<{
    codigo_bncc: string
    descricao: string
    indicador_avaliativo: string
  }>
  objetivos_nivel_II_aplicar: Array<{
    codigo_bncc: string
    descricao: string
    indicador_avaliativo: string
  }>
  objetivos_nivel_III_avaliar: Array<{
    codigo_bncc: string
    descricao: string
    indicador_avaliativo: string
  }>
}
