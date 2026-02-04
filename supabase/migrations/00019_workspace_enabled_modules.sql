-- Módulos habilitados por escola (MVP menor = menos módulos visíveis)
-- Valores: pei, paee, hub, diario, avaliacao. NULL ou vazio = todos habilitados (retrocompat).
ALTER TABLE IF EXISTS workspaces
  ADD COLUMN IF NOT EXISTS enabled_modules text[] DEFAULT NULL;

COMMENT ON COLUMN workspaces.enabled_modules IS 'Módulos visíveis para a escola: pei, paee, hub, diario, avaliacao. NULL = todos habilitados.';
