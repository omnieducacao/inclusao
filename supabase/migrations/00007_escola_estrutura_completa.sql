-- =============================================================================
-- Estrutura escolar: Ano letivo → Segmentos → Séries → Turmas → Componentes
-- Fluxo: 1) Ano letivo  2) Séries e turmas  3) Usuários (professores)
-- Componentes = BNCC (Arte, Ciências, Educação Física, Geografia, História,
-- Língua Inglesa, Língua Portuguesa, Matemática). Produção de texto → Língua Portuguesa.
-- =============================================================================

-- 1. SEGMENTOS (EI, EFAI, EFAF, EM)
CREATE TABLE IF NOT EXISTS segments (
  id text PRIMARY KEY,
  label text NOT NULL,
  sort_order int DEFAULT 0
);
INSERT INTO segments (id, label, sort_order) VALUES
  ('EI', 'Educação Infantil', 1),
  ('EFAI', 'Ensino Fundamental - Anos Iniciais', 2),
  ('EFAF', 'Ensino Fundamental - Anos Finais', 3),
  ('EM', 'Ensino Médio', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. COMPONENTES CURRICULARES (BNCC - sem Produção de texto, redação etc.)
CREATE TABLE IF NOT EXISTS components (
  id text PRIMARY KEY,
  label text NOT NULL,
  sort_order int DEFAULT 0
);
INSERT INTO components (id, label, sort_order) VALUES
  ('arte', 'Arte', 1),
  ('ciencias', 'Ciências', 2),
  ('educacao_fisica', 'Educação Física', 3),
  ('geografia', 'Geografia', 4),
  ('historia', 'História', 5),
  ('lingua_inglesa', 'Língua Inglesa', 6),
  ('lingua_portuguesa', 'Língua Portuguesa', 7),
  ('matematica', 'Matemática', 8)
ON CONFLICT (id) DO NOTHING;

-- 3. ANO LETIVO
CREATE TABLE IF NOT EXISTS school_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  year int NOT NULL,
  name text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, year)
);
CREATE INDEX IF NOT EXISTS idx_school_years_workspace ON school_years(workspace_id);

-- 4. SÉRIES (por segmento)
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id text NOT NULL REFERENCES segments(id) ON DELETE RESTRICT,
  code text NOT NULL,
  label text NOT NULL,
  sort_order int DEFAULT 0,
  UNIQUE(segment_id, code)
);
-- Pré-popula séries comuns
INSERT INTO grades (segment_id, code, label, sort_order) VALUES
  ('EI', 'G1', 'Grupo 1', 1),
  ('EI', 'G2', 'Grupo 2', 2),
  ('EI', 'G3', 'Grupo 3', 3),
  ('EI', 'G4', 'Grupo 4', 4),
  ('EI', 'G5', 'Grupo 5', 5),
  ('EFAI', '1', '1º Ano', 10),
  ('EFAI', '2', '2º Ano', 11),
  ('EFAI', '3', '3º Ano', 12),
  ('EFAI', '4', '4º Ano', 13),
  ('EFAI', '5', '5º Ano', 14),
  ('EFAF', '6', '6º Ano', 20),
  ('EFAF', '7', '7º Ano', 21),
  ('EFAF', '8', '8º Ano', 22),
  ('EFAF', '9', '9º Ano', 23),
  ('EM', '1EM', '1ª Série', 30),
  ('EM', '2EM', '2ª Série', 31),
  ('EM', '3EM', '3ª Série', 32)
ON CONFLICT (segment_id, code) DO NOTHING;

-- 5. TURMAS (série + turma dentro de um ano letivo)
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  school_year_id uuid NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
  grade_id uuid NOT NULL REFERENCES grades(id) ON DELETE RESTRICT,
  class_group text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, school_year_id, grade_id, class_group)
);
CREATE INDEX IF NOT EXISTS idx_classes_workspace ON classes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_year ON classes(school_year_id);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade_id);

-- 6. teacher_class_assignments → teacher_assignments (com componente)
-- Remove antiga e cria nova
DROP TABLE IF EXISTS teacher_student_links;
DROP TABLE IF EXISTS teacher_class_assignments;

CREATE TABLE teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  component_id text NOT NULL REFERENCES components(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_member_id, class_id, component_id)
);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_member ON teacher_assignments(workspace_member_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class ON teacher_assignments(class_id);

-- Recria teacher_student_links (tutor)
CREATE TABLE teacher_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_member_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_teacher_student_member ON teacher_student_links(workspace_member_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_student ON teacher_student_links(student_id);

-- RLS
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_student_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for service" ON teacher_assignments;
CREATE POLICY "Allow all for service" ON teacher_assignments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for service" ON teacher_student_links;
CREATE POLICY "Allow all for service" ON teacher_student_links FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for service" ON school_years;
CREATE POLICY "Allow all for service" ON school_years FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for service" ON classes;
CREATE POLICY "Allow all for service" ON classes FOR ALL USING (true) WITH CHECK (true);

-- Comentários
COMMENT ON TABLE school_years IS 'Anos letivos do workspace';
COMMENT ON TABLE grades IS 'Séries por segmento (EI, EFAI, EFAF, EM)';
COMMENT ON TABLE classes IS 'Turmas (série + turma) por ano letivo';
COMMENT ON TABLE teacher_assignments IS 'Professor leciona componente X na turma Y (pode ter vários)';
