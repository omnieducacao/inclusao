-- =============================================================================
-- Consentimento LGPD no cadastro de estudantes
-- Campo para registrar data/hora em que o responsável aceitou a Política de Privacidade
-- =============================================================================

ALTER TABLE students
ADD COLUMN IF NOT EXISTS privacy_consent_at timestamptz;

COMMENT ON COLUMN students.privacy_consent_at IS 'Data/hora em que o responsável legal aceitou a Política de Privacidade (LGPD). NULL = cadastro anterior à implementação.';
