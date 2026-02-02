-- =============================================================================
-- Gestão de Usuários (workspace_members, vínculos, permissões por página)
-- Tudo gira em torno do estudante; professores vinculados por turma ou alunos
-- =============================================================================

-- Remove tabelas existentes (caso de reexecução ou schema antigo)
DROP TABLE IF EXISTS teacher_student_links;
DROP TABLE IF EXISTS teacher_class_assignments;
DROP TABLE IF EXISTS workspace_members;

-- 1. workspace_members: usuários cadastrados pelo Master no workspace
CREATE TABLE workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  -- Permissões por página (Master atribui no cadastro)
  can_estudantes boolean DEFAULT false,
  can_pei boolean DEFAULT false,
  can_paee boolean DEFAULT false,
  can_hub boolean DEFAULT false,
  can_diario boolean DEFAULT false,
  can_avaliacao boolean DEFAULT false,
  can_gestao boolean DEFAULT false,
  -- Tipo de vínculo com alunos: 'todos' | 'turma' | 'tutor'
  link_type text DEFAULT 'todos' CHECK (link_type IN ('todos', 'turma', 'tutor')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, email)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_email ON workspace_members(workspace_id, email);

-- 2. teacher_class_assignments: professor vinculado a turma (série + turma)
CREATE TABLE teacher_class_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  grade text NOT NULL,
  class_group text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_member_id, grade, class_group)
);

CREATE INDEX IF NOT EXISTS idx_teacher_class_member ON teacher_class_assignments(workspace_member_id);

-- 3. teacher_student_links: professor tutor vinculado a alunos específicos
CREATE TABLE teacher_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_member_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_student_member ON teacher_student_links(workspace_member_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_student ON teacher_student_links(student_id);

-- RLS (opcional - habilitar quando usar Supabase Auth)
-- Por ora, o app usa SERVICE_KEY e controla acesso via lógica
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_student_links ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (SERVICE_KEY bypassa RLS; ANON precisa)
DROP POLICY IF EXISTS "Allow all for service" ON workspace_members;
CREATE POLICY "Allow all for service" ON workspace_members FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for service" ON teacher_class_assignments;
CREATE POLICY "Allow all for service" ON teacher_class_assignments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for service" ON teacher_student_links;
CREATE POLICY "Allow all for service" ON teacher_student_links FOR ALL USING (true) WITH CHECK (true);

-- Comentários
COMMENT ON TABLE workspace_members IS 'Usuários do workspace (cadastrados pelo Master). Permissões por página e tipo de vínculo com alunos.';
COMMENT ON TABLE teacher_class_assignments IS 'Professor vinculado a turma (ex: 7º ano turma A)';
COMMENT ON TABLE teacher_student_links IS 'Professor tutor vinculado a alunos específicos';
