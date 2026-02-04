-- Campo active em workspaces: desativar escola mantém dados (soft delete)
ALTER TABLE IF EXISTS workspaces
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

COMMENT ON COLUMN workspaces.active IS 'Escola ativa. false = desativada (dados mantidos, login bloqueado).';

-- RPC workspace_from_pin: só retorna escola ativa (bloqueia login por PIN em escolas desativadas)
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
    AND (active IS NULL OR active = true)
  LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  RETURN jsonb_build_object('id', v_record.id, 'name', v_record.name, 'workspace_id', v_record.id, 'workspace_name', v_record.name);
END;
$$;
