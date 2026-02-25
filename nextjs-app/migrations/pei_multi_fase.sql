-- ============================================================
-- Migration: PEI Multi-Fase (Professor Regente + Avaliação Diagnóstica)
-- Executar no Supabase SQL Editor
-- ============================================================

-- 1. Planos de Ensino dos professores regentes
CREATE TABLE IF NOT EXISTS planos_ensino (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  professor_nome TEXT NOT NULL,
  professor_id UUID,
  disciplina TEXT NOT NULL,
  ano_serie TEXT NOT NULL,
  conteudo TEXT,
  arquivo_url TEXT,
  habilidades_bncc JSONB DEFAULT '[]',
  bimestre TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PEI por componente curricular (1 por disciplina por estudante)
CREATE TABLE IF NOT EXISTS pei_disciplinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  disciplina TEXT NOT NULL,
  professor_regente_nome TEXT NOT NULL,
  professor_regente_id UUID,
  plano_ensino_id UUID REFERENCES planos_ensino(id),
  fase_status TEXT NOT NULL DEFAULT 'plano_ensino',
  pei_disciplina_data JSONB DEFAULT '{}',
  avaliacao_diagnostica_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, disciplina)
);

-- 3. Avaliações diagnósticas geradas pela IA
CREATE TABLE IF NOT EXISTS avaliacoes_diagnosticas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  disciplina TEXT NOT NULL,
  plano_ensino_id UUID REFERENCES planos_ensino(id),
  habilidades_bncc JSONB NOT NULL,
  questoes_geradas JSONB,
  resultados JSONB,
  nivel_omnisfera_identificado INTEGER,
  modelo_ia TEXT,
  status TEXT DEFAULT 'gerada',
  criada_por UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_planos_ensino_workspace ON planos_ensino(workspace_id);
CREATE INDEX IF NOT EXISTS idx_planos_ensino_disciplina ON planos_ensino(disciplina, ano_serie);
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_student ON pei_disciplinas(student_id);
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_workspace ON pei_disciplinas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_status ON pei_disciplinas(fase_status);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_student ON avaliacoes_diagnosticas(student_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_workspace ON avaliacoes_diagnosticas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_disciplina ON avaliacoes_diagnosticas(student_id, disciplina);

-- 5. RLS (Row Level Security) — permitir acesso por workspace
ALTER TABLE planos_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE pei_disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_diagnosticas ENABLE ROW LEVEL SECURITY;

-- Policies: service_role bypass (nosso backend usa service_role key)
CREATE POLICY "Service role full access planos_ensino"
  ON planos_ensino FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access pei_disciplinas"
  ON pei_disciplinas FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access avaliacoes_diagnosticas"
  ON avaliacoes_diagnosticas FOR ALL
  USING (true)
  WITH CHECK (true);
