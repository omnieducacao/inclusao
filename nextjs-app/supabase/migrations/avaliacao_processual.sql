-- =============================================
-- Avaliação Processual — Schema (compatível com o app)
-- =============================================
-- O app usa SUPABASE_SERVICE_KEY; RLS é bypassed.
-- professor_id = workspace_members.id do professor que registrou (UUID, sem FK para evitar dependência de auth).

CREATE TABLE IF NOT EXISTS avaliacao_processual (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    student_id UUID NOT NULL REFERENCES students(id),
    professor_id UUID NOT NULL,

    disciplina TEXT NOT NULL,
    bimestre INTEGER NOT NULL CHECK (bimestre BETWEEN 1 AND 4),
    tipo_periodo TEXT DEFAULT 'bimestral' CHECK (tipo_periodo IN ('bimestral', 'trimestral', 'semestral')),
    ano_letivo INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),

    habilidades JSONB DEFAULT '[]',
    dimensoes_nee JSONB DEFAULT '[]',
    observacao_geral TEXT DEFAULT '',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(workspace_id, student_id, disciplina, bimestre, ano_letivo)
);

CREATE INDEX IF NOT EXISTS idx_aval_proc_student
    ON avaliacao_processual(student_id, disciplina, bimestre);

CREATE INDEX IF NOT EXISTS idx_aval_proc_workspace
    ON avaliacao_processual(workspace_id, ano_letivo);

ALTER TABLE avaliacao_processual ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER trg_aval_proc_updated
    BEFORE UPDATE ON avaliacao_processual
    FOR EACH ROW
    EXECUTE FUNCTION update_aval_proc_timestamp();
