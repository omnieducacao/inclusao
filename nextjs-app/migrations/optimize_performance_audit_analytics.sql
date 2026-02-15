-- =============================================================================
-- OMNISFERA: Otimizações de Performance, Auditoria e Analytics
-- Execute no Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Compatível com PostgreSQL 14+ (Supabase)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ÍNDICES GIN PARA PERFORMANCE EM JSONB
-- ─────────────────────────────────────────────────────────────────────────────

-- Índice GIN genérico no pei_data (acelera qualquer query sobre o JSONB)
CREATE INDEX IF NOT EXISTS idx_students_pei_data_gin 
  ON students USING GIN (pei_data);

-- Índice GIN nos ciclos PAEE (acelera buscas de ciclos ativos/por tipo)
CREATE INDEX IF NOT EXISTS idx_students_paee_ciclos_gin 
  ON students USING GIN (paee_ciclos jsonb_path_ops);

-- Índice GIN nos registros do Diário de Bordo
CREATE INDEX IF NOT EXISTS idx_students_daily_logs_gin 
  ON students USING GIN (daily_logs jsonb_path_ops);

-- Índice no workspace_id (usado em quase todas as queries de listagem)
CREATE INDEX IF NOT EXISTS idx_students_workspace_id 
  ON students (workspace_id);

-- Índices compostos para filtros frequentes
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_user 
  ON workspace_members (workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_user 
  ON teacher_assignments (user_id);

CREATE INDEX IF NOT EXISTS idx_teacher_student_links_user 
  ON teacher_student_links (user_id);

-- Índice em ia_usage para relatórios por workspace e período
CREATE INDEX IF NOT EXISTS idx_ia_usage_workspace_created 
  ON ia_usage (workspace_id, created_at);

-- Índice em usage_events para tracking de atividade
CREATE INDEX IF NOT EXISTS idx_usage_events_workspace_type 
  ON usage_events (workspace_id, event_type);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABELA DE AUDITORIA (audit_logs)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  table_name    TEXT NOT NULL,
  record_id     TEXT NOT NULL,
  operation     TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data      JSONB,
  new_data      JSONB,
  changed_fields TEXT[],
  user_id       UUID,
  workspace_id  UUID,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para consultas de auditoria por tabela e registro
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record 
  ON audit_logs (table_name, record_id);

-- Índice para consultas por workspace
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace 
  ON audit_logs (workspace_id, created_at);

-- Índice temporal para limpeza periódica
CREATE INDEX IF NOT EXISTS idx_audit_logs_created 
  ON audit_logs (created_at);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TRIGGER DE AUDITORIA AUTOMÁTICA NA TABELA students
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_audit_students()
RETURNS TRIGGER AS $$
DECLARE
  changed TEXT[];
  k TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Detectar campos alterados (comparação top-level)
    changed := ARRAY[]::TEXT[];
    FOR k IN SELECT jsonb_object_keys(to_jsonb(NEW)) LOOP
      IF to_jsonb(OLD) -> k IS DISTINCT FROM to_jsonb(NEW) -> k THEN
        changed := array_append(changed, k);
      END IF;
    END LOOP;
    
    -- Só registrar se houve alteração real
    IF array_length(changed, 1) > 0 THEN
      INSERT INTO audit_logs (table_name, record_id, operation, old_data, new_data, changed_fields, workspace_id)
      VALUES (
        'students',
        NEW.id::TEXT,
        'UPDATE',
        to_jsonb(OLD),
        to_jsonb(NEW),
        changed,
        NEW.workspace_id
      );
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, operation, new_data, workspace_id)
    VALUES ('students', NEW.id::TEXT, 'INSERT', to_jsonb(NEW), NEW.workspace_id);
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, operation, old_data, workspace_id)
    VALUES ('students', OLD.id::TEXT, 'DELETE', to_jsonb(OLD), OLD.workspace_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ativar trigger (DROP antes para idempotência)
DROP TRIGGER IF EXISTS trg_audit_students ON students;
CREATE TRIGGER trg_audit_students
  AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW
  EXECUTE FUNCTION fn_audit_students();


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MATERIALIZED VIEW PARA DASHBOARD DE MONITORAMENTO
-- ─────────────────────────────────────────────────────────────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_aluno AS
SELECT 
  s.id,
  s.name,
  s.workspace_id,
  s.grade,
  s.class_group,
  s.diagnosis,
  -- Métricas PEI
  s.pei_data->>'status_meta' AS status_meta_pei,
  s.pei_data->>'parecer_geral' AS parecer_geral,
  s.pei_data->>'monitoramento_data' AS data_monitoramento,
  s.pei_data->>'diagnostico' AS diagnostico_detalhado,
  -- Contagem de barreiras selecionadas
  (SELECT COUNT(*) FROM jsonb_each(COALESCE(s.pei_data->'barreiras_selecionadas', '{}'::jsonb)) e, 
   jsonb_array_elements(e.value) v)::INT AS total_barreiras,
  -- Contagem de estratégias
  COALESCE(jsonb_array_length(s.pei_data->'estrategias_acesso'), 0) 
  + COALESCE(jsonb_array_length(s.pei_data->'estrategias_ensino'), 0) 
  + COALESCE(jsonb_array_length(s.pei_data->'estrategias_avaliacao'), 0) AS total_estrategias,
  -- Consultoria IA gerada?
  (s.pei_data->>'ia_sugestao' IS NOT NULL AND s.pei_data->>'ia_sugestao' != '') AS tem_consultoria_ia,
  -- Métricas Diário
  COALESCE(jsonb_array_length(s.daily_logs), 0) AS total_registros_diario,
  -- Métricas PAEE
  COALESCE(jsonb_array_length(s.paee_ciclos), 0) AS total_ciclos_paee,
  -- Timestamps
  s.created_at,
  s.updated_at
FROM students s;

-- Índice na materialized view para queries rápidas
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_aluno_id 
  ON mv_dashboard_aluno (id);
CREATE INDEX IF NOT EXISTS idx_mv_dashboard_aluno_workspace 
  ON mv_dashboard_aluno (workspace_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. FUNÇÃO PARA REFRESH DA MATERIALIZED VIEW
-- ─────────────────────────────────────────────────────────────────────────────
-- Chamar periodicamente via cron job ou manualmente:
--   SELECT refresh_mv_dashboard();
-- Se tiver pg_cron habilitado no Supabase:
--   SELECT cron.schedule('refresh_dashboard', '0 */6 * * *', 'SELECT refresh_mv_dashboard()');

CREATE OR REPLACE FUNCTION refresh_mv_dashboard()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_aluno;
END;
$$ LANGUAGE plpgsql;


-- ─────────────────────────────────────────────────────────────────────────────
-- PRONTO! Verifique os índices criados:
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE tablename IN ('students', 'workspace_members', 'teacher_assignments', 'audit_logs')
-- ORDER BY tablename, indexname;
