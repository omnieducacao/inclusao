-- ============================================================
-- Migration: workspace_grades junction table
-- Maps which grades each school/workspace has selected
-- ============================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS workspace_grades (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  grade_id uuid NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (workspace_id, grade_id)
);

-- 2. Index
CREATE INDEX IF NOT EXISTS idx_workspace_grades_ws ON workspace_grades(workspace_id);

-- 3. RLS
ALTER TABLE workspace_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_grades_select" ON workspace_grades
  FOR SELECT USING (true);

CREATE POLICY "workspace_grades_insert" ON workspace_grades
  FOR INSERT WITH CHECK (true);

CREATE POLICY "workspace_grades_delete" ON workspace_grades
  FOR DELETE USING (true);

-- 4. Comment
COMMENT ON TABLE workspace_grades IS
  'Séries selecionadas por cada escola/workspace. Populado em Configuração Escola.';
