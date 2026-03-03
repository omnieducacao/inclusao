-- ============================================================
-- Migration: Feedback do Professor na devolução do PEI
-- Executar no Supabase SQL Editor
-- ============================================================

-- 1. Adicionar coluna feedback_professor (texto da devolutiva)
ALTER TABLE pei_disciplinas
  ADD COLUMN IF NOT EXISTS feedback_professor TEXT;

-- 2. Adicionar coluna data_devolucao (timestamp de quando foi devolvido)
ALTER TABLE pei_disciplinas
  ADD COLUMN IF NOT EXISTS data_devolucao TIMESTAMPTZ;

-- 3. Índice para buscar disciplinas devolvidas rapidamente
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_devolucao
  ON pei_disciplinas(data_devolucao)
  WHERE data_devolucao IS NOT NULL;
