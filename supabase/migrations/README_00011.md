# Migration 00011: workspace_masters

Usuário master por workspace (email + senha vinculados ao PIN).

Cada escola tem um master cadastrado no **primeiro acesso**: quem entra com PIN quando não há master nem membros vê o formulário "Cadastre o usuário master" e define email + senha. A partir daí, o login exige email + senha.

## Executar no Supabase SQL Editor

```sql
-- Conteúdo de 00011_workspace_masters.sql
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
```
