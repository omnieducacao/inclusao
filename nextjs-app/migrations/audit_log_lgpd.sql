-- ═══════════════════════════════════════════════════
-- Audit Log — LGPD Art. 37
-- Registra quem acessou/modificou dados sensíveis
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  actor_id uuid,
  actor_role text,
  action text NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete', 'export', 'login', 'logout')),
  resource_type text NOT NULL,
  resource_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Índices para consultas comuns
CREATE INDEX IF NOT EXISTS idx_audit_log_workspace ON audit_log(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- RLS: membros podem ver audit do próprio workspace, masters podem ver tudo do workspace
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_workspace_read" ON audit_log
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM members WHERE user_id = auth.uid()
    )
  );

-- Apenas o sistema (service_role) pode inserir
CREATE POLICY "audit_log_system_insert" ON audit_log
  FOR INSERT
  WITH CHECK (true);

-- Auto-cleanup: remover logs > 2 anos (LGPD recomenda)
-- Pode ser executado como cron job
-- DELETE FROM audit_log WHERE created_at < now() - interval '2 years';

COMMENT ON TABLE audit_log IS 'LGPD Art. 37 — Registro de atividades de tratamento de dados pessoais';
