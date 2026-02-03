-- Usuário master por workspace: email + senha vinculados ao PIN.
-- Cada escola (workspace) tem um master que faz o primeiro acesso.
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
