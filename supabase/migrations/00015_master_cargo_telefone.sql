-- Cargo em workspace_members e telefone+cargo em workspace_masters
ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS cargo text;

ALTER TABLE workspace_masters ADD COLUMN IF NOT EXISTS telefone text;
ALTER TABLE workspace_masters ADD COLUMN IF NOT EXISTS cargo text;

COMMENT ON COLUMN workspace_members.cargo IS 'Função do usuário (ex: Coordenador, Professor AEE).';
COMMENT ON COLUMN workspace_masters.telefone IS 'Telefone do responsável master.';
COMMENT ON COLUMN workspace_masters.cargo IS 'Função do responsável master (ex: Coordenador).';
