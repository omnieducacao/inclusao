-- =============================================================================
-- Monitoramento: tabela de avaliações + coluna daily_logs em students
-- =============================================================================

-- 1. Coluna daily_logs em students (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'daily_logs'
  ) THEN
    ALTER TABLE students ADD COLUMN daily_logs jsonb DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN students.daily_logs IS 'Registros do Diário de Bordo (JSON array).';
  END IF;
END $$;

-- 2. Tabela monitoring_assessments
CREATE TABLE IF NOT EXISTS monitoring_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  student_id uuid NOT NULL,
  evaluator_id text,
  date_assessed timestamptz DEFAULT now(),
  rubric_data jsonb DEFAULT '{}'::jsonb,
  observation text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_monitoring_assessments_workspace ON monitoring_assessments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_assessments_student ON monitoring_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_assessments_date ON monitoring_assessments(date_assessed DESC);

ALTER TABLE monitoring_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON monitoring_assessments;
CREATE POLICY "Allow all for service" ON monitoring_assessments FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE monitoring_assessments IS 'Avaliações de monitoramento (rubrica de desenvolvimento) por estudante.';
