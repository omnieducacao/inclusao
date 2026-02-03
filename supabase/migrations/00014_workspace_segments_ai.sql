-- Adiciona vínculo de segmentos e motores de IA por escola
ALTER TABLE IF EXISTS workspaces
  ADD COLUMN IF NOT EXISTS segments text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS ai_engines text[] DEFAULT '{}'::text[];

COMMENT ON COLUMN workspaces.segments IS 'Segmentos atendidos pela escola (EI, EF_AI, EF_AF, EM).';
COMMENT ON COLUMN workspaces.ai_engines IS 'Motores de IA disponíveis (red, green, blue).';
