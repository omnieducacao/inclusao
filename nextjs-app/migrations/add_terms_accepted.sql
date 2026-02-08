-- Migração: Adicionar campos de termos de uso na tabela workspace_members
-- Execute este SQL no Supabase SQL Editor se os campos não existirem

-- Adicionar campo terms_accepted (boolean)
ALTER TABLE workspace_members 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;

-- Adicionar campo terms_accepted_at (timestamp)
ALTER TABLE workspace_members 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_workspace_members_terms_accepted 
ON workspace_members(terms_accepted) 
WHERE terms_accepted = FALSE;

-- Comentários para documentação
COMMENT ON COLUMN workspace_members.terms_accepted IS 'Indica se o usuário aceitou os termos de uso';
COMMENT ON COLUMN workspace_members.terms_accepted_at IS 'Data e hora em que o usuário aceitou os termos de uso';
