-- ============================================================
-- Migration: Proteção de dados pedagógicos ao excluir professor
-- Executar no Supabase SQL Editor
-- ============================================================
-- Problema: professor_regente_id em 3 tabelas usa RESTRICT (default),
-- impedindo a exclusão de professores com dados pedagógicos.
-- 
-- Solução: ON DELETE SET NULL — ao excluir o professor, os registros
-- PEI/planos/avaliações continuam existindo, apenas perdendo a
-- referência ao professor (o campo vira NULL).
-- ============================================================

-- ─── 1. pei_disciplinas.professor_regente_id → SET NULL ──────────────────────
DO $$
BEGIN
  -- Drop FK existente (pode ter nomes diferentes dependendo de quando foi criada)
  ALTER TABLE pei_disciplinas
    DROP CONSTRAINT IF EXISTS pei_disciplinas_professor_regente_id_fkey;
  -- Recriar com ON DELETE SET NULL
  ALTER TABLE pei_disciplinas
    ADD CONSTRAINT pei_disciplinas_professor_regente_id_fkey
    FOREIGN KEY (professor_regente_id) REFERENCES workspace_members(id) ON DELETE SET NULL;
  
  RAISE NOTICE 'pei_disciplinas.professor_regente_id → ON DELETE SET NULL ✓';
END $$;

-- ─── 2. planos_ensino.professor_regente_id → SET NULL ────────────────────────
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
-- Verificar que a coluna professor_regente_nome existe em pei_disciplinas:
ALTER TABLE pei_disciplinas
  ADD COLUMN IF NOT EXISTS professor_regente_nome TEXT;

-- Garantir que planos_ensino também tem o campo de nome:
ALTER TABLE planos_ensino
  ADD COLUMN IF NOT EXISTS professor_regente_nome TEXT;

-- ─── 5. Verificação: listar registros que seriam afetados ────────────────────
-- (apenas consulta, não altera dados)
-- SELECT 
--   wm.id, wm.nome,
--   (SELECT COUNT(*) FROM pei_disciplinas WHERE professor_regente_id = wm.id) as pei_count,
--   (SELECT COUNT(*) FROM planos_ensino WHERE professor_regente_id = wm.id) as planos_count,
--   (SELECT COUNT(*) FROM avaliacoes_diagnosticas WHERE professor_regente_id = wm.id) as aval_count
-- FROM workspace_members wm
-- WHERE wm.active = true;
