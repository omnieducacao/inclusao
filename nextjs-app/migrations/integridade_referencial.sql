-- ============================================================
-- Migration: Integridade Referencial + Prevenção de Dados Fantasmas
-- Executar no Supabase SQL Editor
-- ============================================================

-- ─── 1. planos_ensino: Adicionar FK de workspace com CASCADE ──────────────────
-- Se o workspace for deletado, planos são apagados junto.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_planos_ensino_workspace'
    AND table_name = 'planos_ensino'
  ) THEN
    ALTER TABLE planos_ensino
      ADD CONSTRAINT fk_planos_ensino_workspace
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ─── 2. pei_disciplinas: Adicionar FK de workspace com CASCADE ────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_pei_disciplinas_workspace'
    AND table_name = 'pei_disciplinas'
  ) THEN
    ALTER TABLE pei_disciplinas
      ADD CONSTRAINT fk_pei_disciplinas_workspace
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ─── 3. avaliacoes_diagnosticas: Adicionar FK de workspace com CASCADE ────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_avaliacoes_diagnosticas_workspace'
    AND table_name = 'avaliacoes_diagnosticas'
  ) THEN
    ALTER TABLE avaliacoes_diagnosticas
      ADD CONSTRAINT fk_avaliacoes_diagnosticas_workspace
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ─── 4. pei_disciplinas.plano_ensino_id: SET NULL on delete ───────────────────
-- Se um plano de ensino for deletado, o campo vira NULL (não quebra o registro)
-- Precisa dropar a FK existente e recriar com ON DELETE SET NULL
DO $$
BEGIN
  -- Drop existing FK if it exists (sem CASCADE)
  ALTER TABLE pei_disciplinas
    DROP CONSTRAINT IF EXISTS pei_disciplinas_plano_ensino_id_fkey;
  -- Recriar com ON DELETE SET NULL
  ALTER TABLE pei_disciplinas
    ADD CONSTRAINT pei_disciplinas_plano_ensino_id_fkey
    FOREIGN KEY (plano_ensino_id) REFERENCES planos_ensino(id) ON DELETE SET NULL;
END $$;

-- ─── 5. avaliacoes_diagnosticas.plano_ensino_id: SET NULL on delete ───────────
DO $$
BEGIN
  ALTER TABLE avaliacoes_diagnosticas
    DROP CONSTRAINT IF EXISTS avaliacoes_diagnosticas_plano_ensino_id_fkey;
  ALTER TABLE avaliacoes_diagnosticas
    ADD CONSTRAINT avaliacoes_diagnosticas_plano_ensino_id_fkey
    FOREIGN KEY (plano_ensino_id) REFERENCES planos_ensino(id) ON DELETE SET NULL;
END $$;

-- ─── 6. Verificar integridade existente ──────────────────────────────────────
-- Limpar dados órfãos JÁ existentes (student_id inválidos)
DELETE FROM pei_disciplinas
WHERE student_id NOT IN (SELECT id FROM students);

DELETE FROM avaliacoes_diagnosticas
WHERE student_id NOT IN (SELECT id FROM students);

-- Limpar plano_ensino_id inválidos
UPDATE pei_disciplinas
SET plano_ensino_id = NULL
WHERE plano_ensino_id IS NOT NULL
  AND plano_ensino_id NOT IN (SELECT id FROM planos_ensino);

UPDATE avaliacoes_diagnosticas
SET plano_ensino_id = NULL
WHERE plano_ensino_id IS NOT NULL
  AND plano_ensino_id NOT IN (SELECT id FROM planos_ensino);

-- ─── 7. Índice para encontrar órfãos rapidamente ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_planos_ensino_workspace_id
  ON planos_ensino(workspace_id);
