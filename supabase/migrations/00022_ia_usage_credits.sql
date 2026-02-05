-- Uso de IAs por escola e base para sistema de créditos
-- Cada chamada a um motor é registrada em ia_usage.
-- workspaces ganha plan (basic|robusto) e credits_limit para evoluir para planos.

-- 1. Tabela de uso de IA (ledger de chamadas)
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

COMMENT ON TABLE ia_usage IS 'Registro de cada chamada a motor de IA por escola. Usado para métricas de uso e futuro sistema de créditos.';
COMMENT ON COLUMN ia_usage.engine IS 'red, blue, green, yellow, orange';
COMMENT ON COLUMN ia_usage.source IS 'Contexto opcional: pei, paee, hub_adaptar_prova, hub_adaptar_atividade, etc.';
COMMENT ON COLUMN ia_usage.credits_consumed IS 'Unidades de crédito consumidas (1 = padrão; green pode ter peso maior no futuro).';

-- 2. Plano e créditos na escola (workspaces)
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS credits_limit int DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS credits_period_start date DEFAULT NULL;

COMMENT ON COLUMN workspaces.plan IS 'basic = sem OmniGreen; robusto = com OmniGreen e possivelmente mais créditos.';
COMMENT ON COLUMN workspaces.credits_limit IS 'Limite de créditos no período (NULL = ilimitado para o plano). Ao atingir, escola deve migrar de plano.';
COMMENT ON COLUMN workspaces.credits_period_start IS 'Início do ciclo de créditos (ex.: início do mês).';

-- Constraint opcional: plan só aceita valores conhecidos
ALTER TABLE workspaces DROP CONSTRAINT IF EXISTS workspaces_plan_check;
ALTER TABLE workspaces ADD CONSTRAINT workspaces_plan_check CHECK (plan IS NULL OR plan IN ('basic', 'robusto'));
