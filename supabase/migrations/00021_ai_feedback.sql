-- Feedback de IA: validações e refazimentos para treinamento e evolução
-- MVP: capturar tudo que o usuário valida ou pede para refazer (com ou sem texto)
CREATE TABLE IF NOT EXISTS ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  member_id uuid REFERENCES workspace_members(id) ON DELETE SET NULL,
  source text NOT NULL,
  content_type text,
  action text NOT NULL,
  feedback_text text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_workspace ON ai_feedback(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created ON ai_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_action ON ai_feedback(action);

ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON ai_feedback;
CREATE POLICY "Allow all for service" ON ai_feedback FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE ai_feedback IS 'Feedback de validação/refazer para treinamento de IAs. source=pei|paee|hub, action=validated|refazer.';
