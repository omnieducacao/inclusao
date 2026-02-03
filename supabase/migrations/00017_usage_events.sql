-- Registro de eventos de uso para dashboards e auditoria
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

COMMENT ON TABLE usage_events IS 'Eventos de uso (logins, page views, chamadas IA) para dashboard e auditoria.';
COMMENT ON COLUMN usage_events.metadata IS 'Payload JSON opcional com detalhes adicionais do evento.';
