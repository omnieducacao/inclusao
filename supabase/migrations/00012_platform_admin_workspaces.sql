-- =============================================================================
-- ADMIN da plataforma + criação de escolas (workspaces + PIN)
-- ADMIN: email+senha, cria escolas, gerencia masters.
-- Master: por escola, cria usuários da escola.
-- =============================================================================

-- 1. Admins da plataforma (nível Omnisfera, não por escola)
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

-- 2. Tabela workspaces (escolas) — se não existir. PIN no formato XXXX-XXXX
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  pin text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Índice para busca por PIN
CREATE INDEX IF NOT EXISTS idx_workspaces_pin ON workspaces(pin);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for service" ON workspaces;
CREATE POLICY "Allow all for service" ON workspaces FOR ALL USING (true) WITH CHECK (true);

-- 3. Função RPC workspace_from_pin (se não existir ou substituir)
CREATE OR REPLACE FUNCTION public.workspace_from_pin(p_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record record;
BEGIN
  SELECT id, name, pin INTO v_record
  FROM workspaces
  WHERE pin = upper(trim(p_pin))
  LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  RETURN jsonb_build_object('id', v_record.id, 'name', v_record.name, 'workspace_id', v_record.id, 'workspace_name', v_record.name);
END;
$$;

-- 4. Função para gerar PIN único (8 chars: XXXX-XXXX)
CREATE OR REPLACE FUNCTION public.generate_workspace_pin()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
  exists_check boolean;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..4 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    result := result || '-';
    FOR i IN 1..4 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM workspaces WHERE pin = result) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN result;
END;
$$;

COMMENT ON TABLE platform_admins IS 'Admins da plataforma Omnisfera. Podem criar escolas e gerenciar masters.';
COMMENT ON TABLE workspaces IS 'Escolas/workspaces. Cada um tem um PIN para login.';
