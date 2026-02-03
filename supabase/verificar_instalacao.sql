-- =============================================================================
-- Omnisfera — Verificação Completa da Instalação Supabase
-- Execute no SQL Editor do Supabase. Retorna um relatório do que existe/falta.
-- =============================================================================

DO $$
DECLARE
  r RECORD;
  ok TEXT;
  falta TEXT;
  total_ok INT := 0;
  total_falta INT := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '  OMNISFERA — Verificação de Instalação';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- 1. EXTENSÕES
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    RAISE NOTICE '[OK] Extensão pgcrypto';
    total_ok := total_ok + 1;
  ELSE
    RAISE NOTICE '[FALTA] Extensão pgcrypto (necessária para hash de senha)';
    total_falta := total_falta + 1;
  END IF;

  -- 2. TABELAS OBRIGATÓRIAS
  FOR r IN (
    SELECT t.tablename,
      CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.tablename) THEN true ELSE false END AS existe
    FROM (VALUES
      ('platform_admins'),
      ('workspaces'),
      ('workspace_masters'),
      ('workspace_members'),
      ('workspace_grades'),
      ('teacher_assignments'),
      ('teacher_student_links'),
      ('segments'),
      ('components'),
      ('grades'),
      ('school_years'),
      ('classes'),
      ('platform_config'),
      ('usage_events'),
      ('platform_issues'),
      ('students')
    ) AS t(tablename)
  ) LOOP
    IF r.existe THEN
      RAISE NOTICE '[OK] Tabela %', r.tablename;
      total_ok := total_ok + 1;
    ELSE
      RAISE NOTICE '[FALTA] Tabela %', r.tablename;
      total_falta := total_falta + 1;
    END IF;
  END LOOP;

  -- 3. FUNÇÕES
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'workspace_from_pin') THEN
    RAISE NOTICE '[OK] Função workspace_from_pin';
    total_ok := total_ok + 1;
  ELSE
    RAISE NOTICE '[FALTA] Função workspace_from_pin';
    total_falta := total_falta + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'generate_workspace_pin') THEN
    RAISE NOTICE '[OK] Função generate_workspace_pin';
    total_ok := total_ok + 1;
  ELSE
    RAISE NOTICE '[FALTA] Função generate_workspace_pin';
    total_falta := total_falta + 1;
  END IF;

  -- 4. COLUNAS CRÍTICAS (students — se a tabela existir)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'students') THEN
    FOR r IN (
      SELECT c.column_name,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'students' AND column_name = c.column_name) THEN true ELSE false END AS existe
      FROM (VALUES
        ('id'), ('workspace_id'), ('name'), ('grade'), ('class_group'), ('diagnosis'), ('created_at'),
        ('pei_data'), ('paee_ciclos'), ('planejamento_ativo')
      ) AS c(column_name)
    ) LOOP
      IF r.existe THEN
        RAISE NOTICE '[OK] students.%', r.column_name;
        total_ok := total_ok + 1;
      ELSE
        RAISE NOTICE '[FALTA] Coluna students.%', r.column_name;
        total_falta := total_falta + 1;
      END IF;
    END LOOP;
  END IF;

  -- 5. COLUNAS workspaces (segments, ai_engines)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workspaces') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'segments') THEN
      RAISE NOTICE '[OK] workspaces.segments';
      total_ok := total_ok + 1;
    ELSE
      RAISE NOTICE '[FALTA] workspaces.segments';
      total_falta := total_falta + 1;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workspaces' AND column_name = 'ai_engines') THEN
      RAISE NOTICE '[OK] workspaces.ai_engines';
      total_ok := total_ok + 1;
    ELSE
      RAISE NOTICE '[FALTA] workspaces.ai_engines';
      total_falta := total_falta + 1;
    END IF;
  END IF;

  -- 6. DADOS MÍNIMOS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'segments') THEN
    IF (SELECT COUNT(*) FROM segments) >= 4 THEN
      RAISE NOTICE '[OK] segments com dados (EI, EFAI, EFAF, EM)';
      total_ok := total_ok + 1;
    ELSE
      RAISE NOTICE '[AVISO] segments vazio ou incompleto';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'platform_config') THEN
    IF EXISTS (SELECT 1 FROM platform_config WHERE key = 'terms_of_use') THEN
      RAISE NOTICE '[OK] platform_config.terms_of_use';
      total_ok := total_ok + 1;
    ELSE
      RAISE NOTICE '[AVISO] platform_config.terms_of_use não encontrado';
    END IF;
  END IF;

  -- 7. ADMIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'platform_admins') THEN
    IF (SELECT COUNT(*) FROM platform_admins WHERE active = true) > 0 THEN
      RAISE NOTICE '[OK] Pelo menos 1 admin ativo';
      total_ok := total_ok + 1;
    ELSE
      RAISE NOTICE '[AVISO] Nenhum admin cadastrado. Execute 00013_seed_admin.sql';
    END IF;
  END IF;

  -- RESUMO
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '  Resumo: % itens OK, % faltando', total_ok, total_falta;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  IF total_falta > 0 THEN
    RAISE NOTICE 'Ação: Execute as migrations na ordem 00006 -> 00018 no Supabase.';
    RAISE NOTICE 'Se a tabela students não existir, execute o bloco abaixo.';
  ELSE
    RAISE NOTICE 'Instalação aparentemente completa. Verifique manualmente se necessário.';
  END IF;

END $$;

-- =============================================================================
-- SE A TABELA students NÃO EXISTIR, execute o bloco abaixo:
-- =============================================================================
-- CREATE TABLE IF NOT EXISTS students (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   workspace_id uuid NOT NULL,
--   name text NOT NULL,
--   grade text,
--   class_group text,
--   diagnosis text,
--   pei_data jsonb DEFAULT '{}'::jsonb,
--   paee_ciclos jsonb DEFAULT '[]'::jsonb,
--   planejamento_ativo uuid,
--   created_at timestamptz DEFAULT now(),
--   updated_at timestamptz DEFAULT now()
-- );
-- CREATE INDEX IF NOT EXISTS idx_students_workspace ON students(workspace_id);
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all for service" ON students;
-- CREATE POLICY "Allow all for service" ON students FOR ALL USING (true) WITH CHECK (true);
-- COMMENT ON TABLE students IS 'Estudantes do workspace. PEI e PAEE armazenados em pei_data e paee_ciclos.';

-- =============================================================================
-- VERSÃO ALTERNATIVA: Retorna tabela com resultado (execute separadamente se quiser ver em grid)
-- =============================================================================
/*
SELECT * FROM (
  SELECT 'pgcrypto' AS item, CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN 'OK' ELSE 'FALTA' END AS status
  UNION ALL SELECT 'platform_admins', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'platform_admins') THEN 'OK' ELSE 'FALTA' END
  UNION ALL SELECT 'workspaces', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workspaces') THEN 'OK' ELSE 'FALTA' END
  UNION ALL SELECT 'workspace_masters', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workspace_masters') THEN 'OK' ELSE 'FALTA' END
  UNION ALL SELECT 'workspace_members', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workspace_members') THEN 'OK' ELSE 'FALTA' END
  UNION ALL SELECT 'students', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'students') THEN 'OK' ELSE 'FALTA' END
  UNION ALL SELECT 'platform_config', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'platform_config') THEN 'OK' ELSE 'FALTA' END
  UNION ALL SELECT 'usage_events', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_events') THEN 'OK' ELSE 'FALTA' END
  UNION ALL SELECT 'platform_issues', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'platform_issues') THEN 'OK' ELSE 'FALTA' END
  UNION ALL SELECT 'workspace_from_pin', CASE WHEN EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'workspace_from_pin') THEN 'OK' ELSE 'FALTA' END
) AS ver;
*/
