-- =============================================================================
-- Módulo Família — Responsáveis com acesso à plataforma
-- =============================================================================
-- Permite cadastrar responsáveis vinculados a estudantes e dar acesso via login
-- próprio para acompanhamento (PEI, evolução, etc.).
-- =============================================================================

-- Habilitar módulo por workspace
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS family_module_enabled boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN workspaces.family_module_enabled IS 'Se true, o módulo Família está habilitado. Responsáveis podem fazer login.';

-- Tabela de responsáveis
CREATE TABLE IF NOT EXISTS family_responsibles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  parentesco text,
  password_hash text,
  active boolean DEFAULT true,
  terms_accepted boolean DEFAULT false,
  terms_accepted_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, email)
);
CREATE INDEX IF NOT EXISTS idx_family_responsibles_workspace ON family_responsibles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_family_responsibles_email ON family_responsibles(workspace_id, email);
ALTER TABLE family_responsibles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON family_responsibles;
CREATE POLICY "Allow all for service" ON family_responsibles FOR ALL USING (true) WITH CHECK (true);
COMMENT ON TABLE family_responsibles IS 'Responsáveis/família com acesso à plataforma.';

-- Vínculo responsável ↔ estudante
CREATE TABLE IF NOT EXISTS family_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_responsible_id uuid NOT NULL REFERENCES family_responsibles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  vinculo_tipo text DEFAULT 'responsavel_legal',
  created_at timestamptz DEFAULT now(),
  UNIQUE(family_responsible_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_family_student_links_responsible ON family_student_links(family_responsible_id);
CREATE INDEX IF NOT EXISTS idx_family_student_links_student ON family_student_links(student_id);
ALTER TABLE family_student_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON family_student_links;
CREATE POLICY "Allow all for service" ON family_student_links FOR ALL USING (true) WITH CHECK (true);
COMMENT ON TABLE family_student_links IS 'Vínculo responsável ↔ estudante.';

-- Ciência do PEI pela família
CREATE TABLE IF NOT EXISTS family_pei_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_responsible_id uuid NOT NULL REFERENCES family_responsibles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  pei_snapshot_id text,
  acknowledged_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);
CREATE INDEX IF NOT EXISTS idx_family_ack_responsible ON family_pei_acknowledgments(family_responsible_id);
CREATE INDEX IF NOT EXISTS idx_family_ack_student ON family_pei_acknowledgments(student_id);
ALTER TABLE family_pei_acknowledgments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON family_pei_acknowledgments;
CREATE POLICY "Allow all for service" ON family_pei_acknowledgments FOR ALL USING (true) WITH CHECK (true);
COMMENT ON TABLE family_pei_acknowledgments IS 'Registro de ciência do PEI pela família.';
