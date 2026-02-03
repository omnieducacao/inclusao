-- Registro de bugs, inconsistências e monitoramento manual
CREATE TABLE IF NOT EXISTS platform_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  severity text DEFAULT 'média',
  status text DEFAULT 'aberto',
  source text,
  created_by text,
  ai_insight text,
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_issues_workspace ON platform_issues(workspace_id);
CREATE INDEX IF NOT EXISTS idx_platform_issues_status ON platform_issues(status);

ALTER TABLE platform_issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON platform_issues;
CREATE POLICY "Allow all for service" ON platform_issues FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE platform_issues IS 'Registros de bugs, inconsistências e monitoramento manual.';
COMMENT ON COLUMN platform_issues.severity IS 'baixa, média, alta ou crítica.';
COMMENT ON COLUMN platform_issues.status IS 'aberto, em_andamento, resolvido, arquivado.';
