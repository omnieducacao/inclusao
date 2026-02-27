-- =============================================================================
-- PEI Regente: vínculo professor_regente_id com workspace_members
-- Executar APÓS 00027. Não usa Supabase Auth (app usa service_role).
-- =============================================================================

-- 1. FK em pei_disciplinas (coluna já existe; adiciona referência)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'pei_disciplinas_professor_regente_id_fkey'
    AND table_name = 'pei_disciplinas'
  ) THEN
    ALTER TABLE pei_disciplinas
      ADD CONSTRAINT pei_disciplinas_professor_regente_id_fkey
      FOREIGN KEY (professor_regente_id) REFERENCES workspace_members(id);
  END IF;
END $$;

-- 2. Índices para busca por professor
CREATE INDEX IF NOT EXISTS idx_pei_disciplinas_regente ON pei_disciplinas(professor_regente_id);

-- planos_ensino: o app usa professor_id (não professor_regente_id); não alterar.
-- avaliacoes_diagnosticas: não precisa de professor_regente_id para o fluxo atual.
