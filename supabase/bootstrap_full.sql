-- =============================================================================
-- OMNISFERA / INCLUSÃO — BOOTSTRAP COMPLETO (UMA ÚNICA EXECUÇÃO)
-- =============================================================================
-- Este arquivo consolida as migrations 00005 a 00030 em ordem.
-- Use no Supabase SQL Editor quando quiser subir o schema sem rodar 26 arquivos.
--
-- Atenção:
-- - Banco vazio ou com schema antigo: pode rodar inteiro.
-- - 00013 insere um admin padrão: altere SEU_EMAIL e SUA_SENHA antes de rodar.
-- - Se já tiver parte do schema, prefira rodar as migrations individuais.
-- =============================================================================

-- ---------- 00005_students ----------
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

-- ---------- 00012_platform_admin_workspaces ----------
CREATE TABLE IF NOT EXISTS platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  nome text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON platform_admins;
CREATE POLICY "Allow all for service" ON platform_admins FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  pin text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
-- Garante coluna pin se a tabela já existir (ex.: schema antigo)
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS pin text;
CREATE INDEX IF NOT EXISTS idx_workspaces_pin ON workspaces(pin);
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON workspaces;
CREATE POLICY "Allow all for service" ON workspaces FOR ALL USING (true) WITH CHECK (true);

DROP FUNCTION IF EXISTS public.workspace_from_pin(text);
CREATE OR REPLACE FUNCTION public.workspace_from_pin(p_pin text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_record record;
BEGIN
  SELECT id, name, pin INTO v_record FROM workspaces WHERE pin = upper(trim(p_pin)) LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object('id', v_record.id, 'name', v_record.name, 'workspace_id', v_record.id, 'workspace_name', v_record.name);
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_workspace_pin() RETURNS text LANGUAGE plpgsql AS $$
DECLARE chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; result text := ''; i int; exists_check boolean;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..4 LOOP result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1); END LOOP;
    result := result || '-';
    FOR i IN 1..4 LOOP result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1); END LOOP;
    SELECT EXISTS(SELECT 1 FROM workspaces WHERE pin = result) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN result;
END;
$$;
COMMENT ON TABLE platform_admins IS 'Admins da plataforma Omnisfera.';
COMMENT ON TABLE workspaces IS 'Escolas/workspaces. PIN para login.';

-- ---------- 00011_workspace_masters ----------
CREATE TABLE IF NOT EXISTS workspace_masters (
  workspace_id uuid PRIMARY KEY,
  email text NOT NULL,
  password_hash text NOT NULL,
  nome text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE workspace_masters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON workspace_masters;
CREATE POLICY "Allow all for service" ON workspace_masters FOR ALL USING (true) WITH CHECK (true);

-- ---------- 00006_workspace_members_gestao_usuarios ----------
-- CASCADE: em reexecução, remove tabelas que referenciam workspace_members (teacher_assignments, ai_feedback, etc.)
DROP TABLE IF EXISTS teacher_student_links CASCADE;
DROP TABLE IF EXISTS teacher_class_assignments CASCADE;
DROP TABLE IF EXISTS workspace_members CASCADE;

CREATE TABLE workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  can_estudantes boolean DEFAULT false,
  can_pei boolean DEFAULT false,
  can_paee boolean DEFAULT false,
  can_hub boolean DEFAULT false,
  can_diario boolean DEFAULT false,
  can_avaliacao boolean DEFAULT false,
  can_gestao boolean DEFAULT false,
  link_type text DEFAULT 'todos' CHECK (link_type IN ('todos', 'turma', 'tutor')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, email)
);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_email ON workspace_members(workspace_id, email);

CREATE TABLE teacher_class_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  grade text NOT NULL,
  class_group text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_member_id, grade, class_group)
);
CREATE INDEX IF NOT EXISTS idx_teacher_class_member ON teacher_class_assignments(workspace_member_id);

CREATE TABLE teacher_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_member_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_teacher_student_member ON teacher_student_links(workspace_member_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_student ON teacher_student_links(student_id);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_student_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON workspace_members;
CREATE POLICY "Allow all for service" ON workspace_members FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for service" ON teacher_class_assignments;
CREATE POLICY "Allow all for service" ON teacher_class_assignments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for service" ON teacher_student_links;
CREATE POLICY "Allow all for service" ON teacher_student_links FOR ALL USING (true) WITH CHECK (true);
COMMENT ON TABLE workspace_members IS 'Usuários do workspace (Master). Permissões por página e vínculo com alunos.';
COMMENT ON TABLE teacher_class_assignments IS 'Professor vinculado a turma.';
COMMENT ON TABLE teacher_student_links IS 'Professor tutor vinculado a alunos.';

-- ---------- 00010_workspace_members_password ----------
ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS password_hash text;

-- ---------- 00007_escola_estrutura_completa ----------
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

CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id text NOT NULL REFERENCES segments(id) ON DELETE RESTRICT,
  code text NOT NULL,
  label text NOT NULL,
  sort_order int DEFAULT 0,
  UNIQUE(segment_id, code)
);
DELETE FROM grades WHERE segment_id = 'EI';
INSERT INTO grades (segment_id, code, label, sort_order) VALUES
  ('EI', '2anos', '2 anos', 1),
  ('EI', '3anos', '3 anos', 2),
  ('EI', '4anos', '4 anos', 3),
  ('EI', '5anos', '5 anos', 4),
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

CREATE TABLE IF NOT EXISTS workspace_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  grade_id uuid NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, grade_id)
);
CREATE INDEX IF NOT EXISTS idx_workspace_grades_ws ON workspace_grades(workspace_id);

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

DROP TABLE IF EXISTS teacher_student_links CASCADE;
DROP TABLE IF EXISTS teacher_class_assignments CASCADE;

CREATE TABLE IF NOT EXISTS teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  component_id text NOT NULL REFERENCES components(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_member_id, class_id, component_id)
);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_member ON teacher_assignments(workspace_member_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class ON teacher_assignments(class_id);

CREATE TABLE IF NOT EXISTS teacher_student_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_member_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_teacher_student_member ON teacher_student_links(workspace_member_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_student ON teacher_student_links(student_id);

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
ALTER TABLE workspace_grades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON workspace_grades;
CREATE POLICY "Allow all for service" ON workspace_grades FOR ALL USING (true) WITH CHECK (true);
COMMENT ON TABLE school_years IS 'Anos letivos do workspace';
COMMENT ON TABLE grades IS 'Séries por segmento';
COMMENT ON TABLE classes IS 'Turmas por ano letivo';
COMMENT ON TABLE teacher_assignments IS 'Professor leciona componente X na turma Y';
COMMENT ON TABLE workspace_grades IS 'Séries que a escola oferece';

-- ---------- 00008_remove_grupo_ei ----------
DELETE FROM workspace_grades WHERE grade_id IN (
  SELECT id FROM grades WHERE segment_id = 'EI' AND (code ILIKE '%grupo%' OR label ILIKE '%grupo%')
);
DELETE FROM grades WHERE segment_id = 'EI' AND (code ILIKE '%grupo%' OR label ILIKE '%grupo%');

-- ---------- 00009_restore_ei_and_grades ----------
INSERT INTO grades (segment_id, code, label, sort_order) VALUES
  ('EI', '2anos', '2 anos', 1),
  ('EI', '3anos', '3 anos', 2),
  ('EI', '4anos', '4 anos', 3),
  ('EI', '5anos', '5 anos', 4)
ON CONFLICT (segment_id, code) DO NOTHING;

-- ---------- 00013_seed_admin (opcional: altere email/senha antes de rodar) ----------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO platform_admins (email, password_hash, nome)
VALUES (
  'SEU_EMAIL@exemplo.com',
  crypt('SUA_SENHA_AQUI', gen_salt('bf')),
  'Seu Nome'
)
ON CONFLICT (email) DO NOTHING;

-- ---------- 00014_workspace_segments_ai ----------
ALTER TABLE IF EXISTS workspaces
  ADD COLUMN IF NOT EXISTS segments text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS ai_engines text[] DEFAULT '{}'::text[];
COMMENT ON COLUMN workspaces.segments IS 'Segmentos atendidos (EI, EF_AI, EF_AF, EM).';
COMMENT ON COLUMN workspaces.ai_engines IS 'Motores de IA (red, green, blue).';

-- ---------- 00015_master_cargo_telefone ----------
ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS cargo text;
ALTER TABLE workspace_masters ADD COLUMN IF NOT EXISTS telefone text;
ALTER TABLE workspace_masters ADD COLUMN IF NOT EXISTS cargo text;
COMMENT ON COLUMN workspace_members.cargo IS 'Função do usuário.';
COMMENT ON COLUMN workspace_masters.telefone IS 'Telefone do master.';
COMMENT ON COLUMN workspace_masters.cargo IS 'Função do master.';

-- ---------- 00016_platform_config_terms ----------
CREATE TABLE IF NOT EXISTS platform_config (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON platform_config;
CREATE POLICY "Allow all for service" ON platform_config FOR ALL USING (true) WITH CHECK (true);
INSERT INTO platform_config (key, value) VALUES (
  'terms_of_use',
  '1. Uso profissional: A Omnisfera é uma ferramenta profissional de apoio à inclusão e deve ser utilizada exclusivamente para fins educacionais e institucionais autorizados.

2. Confidencialidade: É proibido inserir dados pessoais sensíveis de estudantes fora de ambientes autorizados pela instituição.

3. Responsabilidade: Recomendações e conteúdos gerados pela IA são auxiliares e devem ser validados por profissionais responsáveis.

4. Segurança: Credenciais de acesso são pessoais e intransferíveis.

5. Conformidade: O uso deve seguir as políticas internas da escola e legislação vigente.'
)
ON CONFLICT (key) DO NOTHING;
COMMENT ON TABLE platform_config IS 'Configurações globais (termo de uso, etc.).';

-- ---------- 00017_usage_events ----------
CREATE TABLE IF NOT EXISTS usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  actor_type text,
  actor_id uuid,
  event_type text NOT NULL,
  source text,
  ai_engine text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usage_events_workspace ON usage_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_event_type ON usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at);
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON usage_events;
CREATE POLICY "Allow all for service" ON usage_events FOR ALL USING (true) WITH CHECK (true);
COMMENT ON TABLE usage_events IS 'Eventos de uso para dashboard e auditoria.';

-- ---------- 00018_platform_issues ----------
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
COMMENT ON TABLE platform_issues IS 'Bugs e monitoramento.';

-- ---------- 00019_workspace_enabled_modules ----------
ALTER TABLE IF EXISTS workspaces ADD COLUMN IF NOT EXISTS enabled_modules text[] DEFAULT NULL;
COMMENT ON COLUMN workspaces.enabled_modules IS 'Módulos visíveis: pei, paee, hub, diario, avaliacao. NULL = todos.';

-- ---------- 00020_workspaces_active ----------
ALTER TABLE IF EXISTS workspaces ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
COMMENT ON COLUMN workspaces.active IS 'Escola ativa. false = desativada.';
CREATE OR REPLACE FUNCTION public.workspace_from_pin(p_pin text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_record record;
BEGIN
  SELECT id, name, pin INTO v_record FROM workspaces
  WHERE pin = upper(trim(p_pin)) AND (active IS NULL OR active = true) LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object('id', v_record.id, 'name', v_record.name, 'workspace_id', v_record.id, 'workspace_name', v_record.name);
END;
$$;

-- ---------- 00021_ai_feedback ----------
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
COMMENT ON TABLE ai_feedback IS 'Feedback de validação/refazer para IAs.';

-- ---------- 00022_ia_usage_credits ----------
CREATE TABLE IF NOT EXISTS ia_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  engine text NOT NULL,
  source text,
  credits_consumed decimal(12,4) NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ia_usage_workspace ON ia_usage(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ia_usage_created ON ia_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ia_usage_workspace_created ON ia_usage(workspace_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ia_usage_engine ON ia_usage(engine);
ALTER TABLE ia_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON ia_usage;
CREATE POLICY "Allow all for service" ON ia_usage FOR ALL USING (true) WITH CHECK (true);
COMMENT ON TABLE ia_usage IS 'Chamadas a motor de IA por escola.';

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS credits_limit int DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS credits_period_start date DEFAULT NULL;
COMMENT ON COLUMN workspaces.plan IS 'basic | robusto';
ALTER TABLE workspaces DROP CONSTRAINT IF EXISTS workspaces_plan_check;
ALTER TABLE workspaces ADD CONSTRAINT workspaces_plan_check CHECK (plan IS NULL OR plan IN ('basic', 'robusto'));

-- ---------- 00023_components_ei_em ----------
INSERT INTO components (id, label, sort_order) VALUES
  ('educacao_infantil', 'Educação Infantil', 0),
  ('biologia', 'Biologia', 9),
  ('fisica', 'Física', 10),
  ('quimica', 'Química', 11),
  ('filosofia', 'Filosofia', 12),
  ('sociologia', 'Sociologia', 13)
ON CONFLICT (id) DO NOTHING;

-- ---------- 00024_monitoring_assessments_daily_logs ----------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'daily_logs'
  ) THEN
    ALTER TABLE students ADD COLUMN daily_logs jsonb DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN students.daily_logs IS 'Diário de Bordo (JSON array).';
  END IF;
END $$;

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
COMMENT ON TABLE monitoring_assessments IS 'Avaliações de monitoramento por estudante.';

-- ---------- 00025_workspace_pgi ----------
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS pgi_data jsonb DEFAULT '{"acoes":[],"dimensionamento":{}}'::jsonb;
COMMENT ON COLUMN workspaces.pgi_data IS 'Plano de Gestão Inclusiva.';

-- ---------- 00026_announcement_views ----------
CREATE TABLE IF NOT EXISTS announcement_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  user_email text NOT NULL,
  announcement_id text NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  shown_as_modal boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  UNIQUE(workspace_id, user_email, announcement_id)
);
CREATE INDEX IF NOT EXISTS idx_announcement_views_workspace_user ON announcement_views(workspace_id, user_email);
CREATE INDEX IF NOT EXISTS idx_announcement_views_announcement ON announcement_views(announcement_id);
ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view own announcement views" ON announcement_views;
CREATE POLICY "Members can view own announcement views" ON announcement_views FOR SELECT USING (true);
DROP POLICY IF EXISTS "Members can insert own announcement views" ON announcement_views;
CREATE POLICY "Members can insert own announcement views" ON announcement_views FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Members can update own announcement views" ON announcement_views;
CREATE POLICY "Members can update own announcement views" ON announcement_views FOR UPDATE USING (true) WITH CHECK (true);
COMMENT ON TABLE announcement_views IS 'Visualizações de anúncios por usuário.';

-- ---------- 00027_pei_planos_ensino_avaliacoes_diagnosticas ----------
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

CREATE INDEX IF NOT EXISTS idx_planos_ensino_workspace ON planos_ensino(workspace_id);
CREATE INDEX IF NOT EXISTS idx_planos_ensino_disciplina ON planos_ensino(disciplina, ano_serie);
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_student ON pei_disciplinas(student_id);
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_workspace ON pei_disciplinas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_status ON pei_disciplinas(fase_status);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_student ON avaliacoes_diagnosticas(student_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_workspace ON avaliacoes_diagnosticas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_disciplina ON avaliacoes_diagnosticas(student_id, disciplina);

ALTER TABLE planos_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE pei_disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_diagnosticas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access planos_ensino" ON planos_ensino;
CREATE POLICY "Service role full access planos_ensino" ON planos_ensino FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role full access pei_disciplinas" ON pei_disciplinas;
CREATE POLICY "Service role full access pei_disciplinas" ON pei_disciplinas FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role full access avaliacoes_diagnosticas" ON avaliacoes_diagnosticas;
CREATE POLICY "Service role full access avaliacoes_diagnosticas" ON avaliacoes_diagnosticas FOR ALL USING (true) WITH CHECK (true);
COMMENT ON TABLE planos_ensino IS 'Planos de ensino por disciplina/ano.';
COMMENT ON TABLE pei_disciplinas IS 'PEI por disciplina. fase_status: plano_ensino | diagnostica | pei_disciplina | concluido.';
COMMENT ON TABLE avaliacoes_diagnosticas IS 'Avaliações diagnósticas por estudante/disciplina.';

-- ---------- 00028_pei_regente_vinculo ----------
-- Remove referências órfãs (professor_regente_id que não existe em workspace_members) para permitir criar a FK
UPDATE pei_disciplinas
SET professor_regente_id = NULL
WHERE professor_regente_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM workspace_members w WHERE w.id = pei_disciplinas.professor_regente_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'pei_disciplinas_professor_regente_id_fkey' AND table_name = 'pei_disciplinas'
  ) THEN
    ALTER TABLE pei_disciplinas
      ADD CONSTRAINT pei_disciplinas_professor_regente_id_fkey
      FOREIGN KEY (professor_regente_id) REFERENCES workspace_members(id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_regente ON pei_disciplinas(professor_regente_id);

-- ---------- 00029_can_pei_professor ----------
ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS can_pei_professor boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN workspace_members.can_pei_professor IS 'Acesso ao PEI - Professor, Plano de Curso, Avaliação Diagnóstica e Processual.';

-- ---------- 00030_avaliacao_processual ----------
CREATE TABLE IF NOT EXISTS avaliacao_processual (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  student_id uuid NOT NULL REFERENCES students(id),
  professor_id uuid NOT NULL,
  disciplina text NOT NULL,
  bimestre integer NOT NULL CHECK (bimestre BETWEEN 1 AND 4),
  tipo_periodo text DEFAULT 'bimestral' CHECK (tipo_periodo IN ('bimestral', 'trimestral', 'semestral')),
  ano_letivo integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  habilidades jsonb DEFAULT '[]'::jsonb,
  dimensoes_nee jsonb DEFAULT '[]'::jsonb,
  observacao_geral text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, student_id, disciplina, bimestre, ano_letivo)
);
CREATE INDEX IF NOT EXISTS idx_aval_proc_student ON avaliacao_processual(student_id, disciplina, bimestre);
CREATE INDEX IF NOT EXISTS idx_aval_proc_workspace ON avaliacao_processual(workspace_id, ano_letivo);
ALTER TABLE avaliacao_processual ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access avaliacao_processual" ON avaliacao_processual;
CREATE POLICY "Service role full access avaliacao_processual" ON avaliacao_processual FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_aval_proc_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_aval_proc_updated ON avaliacao_processual;
CREATE TRIGGER trg_aval_proc_updated
  BEFORE UPDATE ON avaliacao_processual
  FOR EACH ROW
  EXECUTE FUNCTION update_aval_proc_timestamp();

COMMENT ON TABLE avaliacao_processual IS 'Avaliação processual bimestral por estudante/disciplina.';

-- =============================================================================
-- FIM DO BOOTSTRAP
-- =============================================================================
