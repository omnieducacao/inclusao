# Migration 00012: Admin da Plataforma + Workspaces

## O que faz

- **platform_admins**: Admins da plataforma (email + senha). Podem criar escolas e gerenciar masters.
- **workspaces**: Tabela de escolas com PIN (se não existir).
- **workspace_from_pin**: Função RPC para login por PIN (substitui se já existir).

## Atenção

Se você **já tem** a tabela `workspaces` ou a função `workspace_from_pin` em outro esquema/sistema, execute apenas a parte de `platform_admins`:

```sql
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
```

## Executar tudo (setup novo)

Rode o arquivo `00012_platform_admin_workspaces.sql` completo no Supabase SQL Editor.

## Primeiro admin (obrigatório no Supabase)

Por segurança, o primeiro admin é criado **diretamente no Supabase**, não no app.

1. Abra **Supabase → SQL Editor**
2. Execute (substitua os valores):

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO platform_admins (email, password_hash, nome)
VALUES (
  'seu@email.com',
  crypt('SuaSenha123', gen_salt('bf')),
  'Seu Nome'
)
ON CONFLICT (email) DO NOTHING;
```

3. Depois faça login no app com esse email e senha (expanda "Sou administrador da plataforma").
