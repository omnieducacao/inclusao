/**
 * Minha Jornada – Tipos de dados
 *
 * Formato que o frontend espera receber (da planilha via IA ou do parsing legado).
 * A planilha é tratada como Documento de Contexto: a IA extrai estes campos do texto.
 */

export interface DailyMission {
  id: string;
  title: string;
  xp: number;
  isCompleted: boolean;
}

export type JourneyDifficulty = 'Fácil' | 'Médio' | 'Desafio';

export interface Journey {
  id: string;
  title: string;       // Título da Missão
  description: string; // Descrição ou história
  subject: string;    // Matéria (ex: Matemática)
  totalSteps: number; // Quantos passos/tarefas
  currentStep: number; // Passo atual (0 se novo)
  isCompleted: boolean;
  difficulty: JourneyDifficulty;
  /** Texto completo da jornada (parágrafos unidos) */
  content?: string;
  /** Cada linha = um passo da missão */
  steps?: string[];
}

export interface SheetStudentData {
  id: string;          // O código (ex: OMNI-123)
  name: string;        // Nome do aluno
  hyperfocus: string;  // Tema (ex: Lego)
  journeys: Journey[]; // Lista de jornadas/missões
  /** Missões diárias; podem ser geradas automaticamente se não existirem na planilha */
  dailyMissions: DailyMission[];
}
