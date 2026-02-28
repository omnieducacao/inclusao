-- =============================================================================
-- Hub — Persistência de metadados do conteúdo gerado (4.4.1)
-- Rastreabilidade: "Questões de LP para João, 3º ano", etc.
-- =============================================================================

CREATE TABLE IF NOT EXISTS hub_generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id uuid REFERENCES workspace_members(id) ON DELETE SET NULL,
  student_id uuid REFERENCES students(id) ON DELETE SET NULL,

  content_type text NOT NULL,
  description text,
  engine text,
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hub_generated_workspace ON hub_generated_content(workspace_id);
CREATE INDEX IF NOT EXISTS idx_hub_generated_student ON hub_generated_content(student_id);
CREATE INDEX IF NOT EXISTS idx_hub_generated_created ON hub_generated_content(created_at);
CREATE INDEX IF NOT EXISTS idx_hub_generated_type ON hub_generated_content(content_type);

ALTER TABLE hub_generated_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access hub_generated_content" ON hub_generated_content;
CREATE POLICY "Service role full access hub_generated_content"
  ON hub_generated_content FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE hub_generated_content IS 'Metadados do conteúdo gerado no Hub (questões, atividades, provas adaptadas, etc.) para rastreabilidade.';
COMMENT ON COLUMN hub_generated_content.content_type IS 'criar_atividade, criar_itens, adaptar_prova, adaptar_atividade, plano_aula, roteiro, dinamica, etc.';
COMMENT ON COLUMN hub_generated_content.description IS 'Descrição legível: ex. "Questões de LP para 3º ano"';
