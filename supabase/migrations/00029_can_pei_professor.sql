-- =============================================================================
-- Permissão can_pei_professor em workspace_members
-- Permite acesso ao módulo PEI - Professor (pei-regente), Plano de Curso, Avaliação Diagnóstica e Processual.
-- =============================================================================

ALTER TABLE workspace_members
  ADD COLUMN IF NOT EXISTS can_pei_professor boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN workspace_members.can_pei_professor IS
  'Permite acesso ao PEI - Professor, Plano de Curso, Avaliação Diagnóstica e Avaliação Processual.';
