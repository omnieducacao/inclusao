-- =============================================================================
-- PEI Multi-Fase: planos_ensino, pei_disciplinas, avaliacoes_diagnosticas
-- Depende de: workspaces, workspace_members, students
-- =============================================================================

-- 1. Planos de Ensino dos professores regentes
CREATE TABLE IF NOT EXISTS planos_ensino (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  professor_nome text NOT NULL,
  professor_id uuid,
  disciplina text NOT NULL,
  ano_serie text NOT NULL,
  conteudo text,
  arquivo_url text,
  habilidades_bncc jsonb DEFAULT '[]'::jsonb,
  bimestre text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. PEI por componente curricular (1 por disciplina por estudante)
CREATE TABLE IF NOT EXISTS pei_disciplinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  disciplina text NOT NULL,
  professor_regente_nome text NOT NULL,
  professor_regente_id uuid,
  plano_ensino_id uuid REFERENCES planos_ensino(id),
  fase_status text NOT NULL DEFAULT 'plano_ensino',
  pei_disciplina_data jsonb DEFAULT '{}'::jsonb,
  avaliacao_diagnostica_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, disciplina)
);

-- 3. Avaliações diagnósticas geradas pela IA
CREATE TABLE IF NOT EXISTS avaliacoes_diagnosticas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  disciplina text NOT NULL,
  plano_ensino_id uuid REFERENCES planos_ensino(id),
  habilidades_bncc jsonb NOT NULL DEFAULT '[]'::jsonb,
  questoes_geradas jsonb,
  resultados jsonb,
  nivel_omnisfera_identificado integer,
  modelo_ia text,
  status text DEFAULT 'gerada',
  criada_por uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_planos_ensino_workspace ON planos_ensino(workspace_id);
CREATE INDEX IF NOT EXISTS idx_planos_ensino_disciplina ON planos_ensino(disciplina, ano_serie);
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_student ON pei_disciplinas(student_id);
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_workspace ON pei_disciplinas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_status ON pei_disciplinas(fase_status);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_student ON avaliacoes_diagnosticas(student_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_workspace ON avaliacoes_diagnosticas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_disciplina ON avaliacoes_diagnosticas(student_id, disciplina);

-- 5. RLS (app usa service_role)
ALTER TABLE planos_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE pei_disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_diagnosticas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access planos_ensino" ON planos_ensino;
CREATE POLICY "Service role full access planos_ensino" ON planos_ensino FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access pei_disciplinas" ON pei_disciplinas;
CREATE POLICY "Service role full access pei_disciplinas" ON pei_disciplinas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access avaliacoes_diagnosticas" ON avaliacoes_diagnosticas;
CREATE POLICY "Service role full access avaliacoes_diagnosticas" ON avaliacoes_diagnosticas FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE planos_ensino IS 'Planos de ensino do professor por disciplina/ano. Vinculados a pei_disciplinas via plano_ensino_id.';
COMMENT ON TABLE pei_disciplinas IS 'PEI por disciplina (Fase 2). Um registro por (estudante, disciplina). fase_status: plano_ensino | diagnostica | pei_disciplina | concluido.';
COMMENT ON TABLE avaliacoes_diagnosticas IS 'Avaliações diagnósticas por estudante/disciplina. Nível Omnisfera 0-4.';
