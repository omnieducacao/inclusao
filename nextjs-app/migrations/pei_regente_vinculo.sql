-- PEI Multi-Fase: Complemento — vincular professor regente ao registro
-- Executar APÓS pei_multi_fase.sql no Supabase SQL Editor

-- 1. Adicionar professor_regente_id em pei_disciplinas
ALTER TABLE pei_disciplinas
  ADD COLUMN IF NOT EXISTS professor_regente_id UUID REFERENCES workspace_members(id);

-- 2. Adicionar professor_regente_id em planos_ensino
ALTER TABLE planos_ensino
  ADD COLUMN IF NOT EXISTS professor_regente_id UUID REFERENCES workspace_members(id);

-- 3. Adicionar professor_regente_id em avaliacoes_diagnosticas
ALTER TABLE avaliacoes_diagnosticas
  ADD COLUMN IF NOT EXISTS professor_regente_id UUID REFERENCES workspace_members(id);

-- 4. Índices para busca por professor
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_regente ON pei_disciplinas(professor_regente_id);
CREATE INDEX IF NOT EXISTS idx_planos_ensino_regente ON planos_ensino(professor_regente_id);
CREATE INDEX IF NOT EXISTS idx_aval_diag_regente ON avaliacoes_diagnosticas(professor_regente_id);

-- 5. RLS: professor regente só vê seus registros
-- (complementa as policies existentes que já filtram por workspace_id)
CREATE POLICY IF NOT EXISTS "regente_own_pei_disciplinas"
  ON pei_disciplinas FOR ALL
  USING (
    professor_regente_id = (
      SELECT id FROM workspace_members
      WHERE user_id = auth.uid()
      LIMIT 1
    )
    OR
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'master'
    )
  );

CREATE POLICY IF NOT EXISTS "regente_own_planos_ensino"
  ON planos_ensino FOR ALL
  USING (
    professor_regente_id = (
      SELECT id FROM workspace_members
      WHERE user_id = auth.uid()
      LIMIT 1
    )
    OR
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'master'
    )
  );
