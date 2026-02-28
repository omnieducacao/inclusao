-- =============================================================================
-- Permitir avaliação de estudantes em PEI Fase 1 antes do envio aos regentes
-- Quando true, professores podem ver e avaliar estudantes em fase_1 (das suas turmas)
-- =============================================================================

ALTER TABLE workspaces
ADD COLUMN IF NOT EXISTS allow_avaliacao_fase_1 boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN workspaces.allow_avaliacao_fase_1 IS 'Se true, professores podem avaliar estudantes em PEI Fase 1 (antes do envio aos regentes).';
