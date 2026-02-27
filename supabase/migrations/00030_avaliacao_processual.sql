-- =============================================================================
-- Avaliação Processual — acompanhamento bimestral por habilidades BNCC
-- Depende de: workspaces, students. professor_id = workspace_members.id (sem FK).
-- =============================================================================

CREATE TABLE IF NOT EXISTS avaliacao_processual (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES workspaces(id),
    student_id uuid NOT NULL REFERENCES students(id),
    professor_id uuid NOT NULL,

    disciplina text NOT NULL,
    bimestre integer NOT NULL CHECK (bimestre BETWEEN 1 AND 4),
    tipo_periodo text DEFAULT 'bimestral' CHECK (tipo_periodo IN ('bimestral', 'trimestral', 'semestral')),
    ano_letivo integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),

    habilidades jsonb DEFAULT '[]'::jsonb,
    dimensoes_nee jsonb DEFAULT '[]'::jsonb,
    observacao_geral text DEFAULT '',

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    UNIQUE(workspace_id, student_id, disciplina, bimestre, ano_letivo)
);

CREATE INDEX IF NOT EXISTS idx_aval_proc_student
    ON avaliacao_processual(student_id, disciplina, bimestre);

CREATE INDEX IF NOT EXISTS idx_aval_proc_workspace
    ON avaliacao_processual(workspace_id, ano_letivo);

ALTER TABLE avaliacao_processual ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access avaliacao_processual" ON avaliacao_processual;
CREATE POLICY "Service role full access avaliacao_processual"
    ON avaliacao_processual FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_aval_proc_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_aval_proc_updated ON avaliacao_processual;
CREATE TRIGGER trg_aval_proc_updated
    BEFORE UPDATE ON avaliacao_processual
    FOR EACH ROW
    EXECUTE FUNCTION update_aval_proc_timestamp();

COMMENT ON TABLE avaliacao_processual IS 'Registros bimestrais de evolução por estudante/disciplina. Escala Omnisfera 0-4 por habilidade.';
