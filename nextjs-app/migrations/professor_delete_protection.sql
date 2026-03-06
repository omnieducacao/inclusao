-- ============================================================
-- Migration: Proteção de dados pedagógicos ao excluir professor
-- Executar no Supabase SQL Editor
-- ============================================================
-- Problema: professor_regente_id em tabelas pedagógicas usa RESTRICT (default),
-- impedindo a exclusão de professores com dados pedagógicos.
-- 
-- Solução: ON DELETE SET NULL — ao excluir o professor, os registros
-- PEI/planos/avaliações continuam existindo, apenas perdendo a
-- referência ao professor (o campo vira NULL).
-- ============================================================

-- ─── 1. pei_disciplinas.professor_regente_id → SET NULL ──────────────────────
-- Primeiro garantir que a coluna existe
ALTER TABLE pei_disciplinas
  ADD COLUMN IF NOT EXISTS professor_regente_id UUID;

DO $$
BEGIN
  ALTER TABLE pei_disciplinas
    DROP CONSTRAINT IF EXISTS pei_disciplinas_professor_regente_id_fkey;
  ALTER TABLE pei_disciplinas
    ADD CONSTRAINT pei_disciplinas_professor_regente_id_fkey
    FOREIGN KEY (professor_regente_id) REFERENCES workspace_members(id) ON DELETE SET NULL;
  
  RAISE NOTICE 'pei_disciplinas.professor_regente_id → ON DELETE SET NULL ✓';
END $$;

-- ─── 2. planos_ensino.professor_regente_id → SET NULL ────────────────────────
-- Primeiro garantir que a coluna existe
ALTER TABLE planos_ensino
  ADD COLUMN IF NOT EXISTS professor_regente_id UUID;

DO $$
BEGIN
  ALTER TABLE planos_ensino
    DROP CONSTRAINT IF EXISTS planos_ensino_professor_regente_id_fkey;
  ALTER TABLE planos_ensino
    ADD CONSTRAINT planos_ensino_professor_regente_id_fkey
    FOREIGN KEY (professor_regente_id) REFERENCES workspace_members(id) ON DELETE SET NULL;
  
  RAISE NOTICE 'planos_ensino.professor_regente_id → ON DELETE SET NULL ✓';
END $$;

-- ─── 3. avaliacoes_diagnosticas.professor_regente_id → SET NULL ──────────────
-- Primeiro garantir que a coluna existe
ALTER TABLE avaliacoes_diagnosticas
  ADD COLUMN IF NOT EXISTS professor_regente_id UUID;

DO $$
BEGIN
  ALTER TABLE avaliacoes_diagnosticas
    DROP CONSTRAINT IF EXISTS avaliacoes_diagnosticas_professor_regente_id_fkey;
  ALTER TABLE avaliacoes_diagnosticas
    ADD CONSTRAINT avaliacoes_diagnosticas_professor_regente_id_fkey
    FOREIGN KEY (professor_regente_id) REFERENCES workspace_members(id) ON DELETE SET NULL;
  
  RAISE NOTICE 'avaliacoes_diagnosticas.professor_regente_id → ON DELETE SET NULL ✓';
END $$;

-- ─── 4. Garantir que professor_regente_nome continua preenchido ──────────────
-- Como usamos ON DELETE SET NULL, o campo professor_regente_id vira NULL,
-- mas o professor_regente_nome (texto) permanece, garantindo que o PEI
-- ainda saiba qual professor criou os dados originalmente.
ALTER TABLE pei_disciplinas
  ADD COLUMN IF NOT EXISTS professor_regente_nome TEXT;

ALTER TABLE planos_ensino
  ADD COLUMN IF NOT EXISTS professor_regente_nome TEXT;

-- ─── 5. Índices para busca por professor ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_regente ON pei_disciplinas(professor_regente_id);
CREATE INDEX IF NOT EXISTS idx_planos_ensino_regente ON planos_ensino(professor_regente_id);
CREATE INDEX IF NOT EXISTS idx_aval_diag_regente ON avaliacoes_diagnosticas(professor_regente_id);
