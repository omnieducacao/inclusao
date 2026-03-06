-- Fix: garantir que workspace_members.active tem DEFAULT true
-- Sem isso, membros criados sem o campo active ficam NULL e não conseguem logar
ALTER TABLE workspace_members ALTER COLUMN active SET DEFAULT true;

-- Corrigir membros existentes que estão com active = NULL
UPDATE workspace_members SET active = true WHERE active IS NULL;
