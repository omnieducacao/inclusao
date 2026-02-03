-- Senha para workspace_members. Master cadastra senha junto com email.
ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS password_hash text;
