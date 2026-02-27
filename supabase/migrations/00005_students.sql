-- =============================================================================
-- Tabela students (estudantes do workspace)
-- Necessária antes de: teacher_student_links (00007), pei_disciplinas, avaliacoes_diagnosticas, avaliacao_processual.
-- =============================================================================

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  name text NOT NULL,
  grade text,
  class_group text,
  diagnosis text,
  pei_data jsonb DEFAULT '{}'::jsonb,
  paee_ciclos jsonb DEFAULT '[]'::jsonb,
  paee_data jsonb,
  planejamento_ativo uuid,
  daily_logs jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_workspace ON students(workspace_id);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(workspace_id, grade);
CREATE INDEX IF NOT EXISTS idx_students_pei_data ON students(workspace_id) WHERE pei_data IS NOT NULL AND pei_data != '{}'::jsonb;

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON students;
CREATE POLICY "Allow all for service" ON students FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE students IS 'Estudantes do workspace. PEI em pei_data (JSONB), PAEE em paee_ciclos/paee_data. daily_logs = Diário de Bordo.';
