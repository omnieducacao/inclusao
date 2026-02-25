-- =============================================
-- Avaliação Processual — Schema
-- =============================================
-- Tracks student progress over time (bimestral/trimestral/semestral)
-- Each record = 1 student + 1 discipline + 1 period

CREATE TABLE IF NOT EXISTS avaliacao_processual (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    member_id UUID NOT NULL REFERENCES members(id),
    student_id UUID NOT NULL REFERENCES students(id),
    
    disciplina TEXT NOT NULL,
    bimestre INTEGER NOT NULL CHECK (bimestre BETWEEN 1 AND 4),
    tipo_periodo TEXT DEFAULT 'bimestral' CHECK (tipo_periodo IN ('bimestral', 'trimestral', 'semestral')),
    ano_letivo INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    
    -- JSONB array of evaluated skills
    -- Each: { codigo_bncc, descricao, nivel_atual (0-4), nivel_anterior, observacao }
    habilidades JSONB DEFAULT '[]',
    
    observacao_geral TEXT DEFAULT '',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one record per student+discipline+period+year
    UNIQUE(workspace_id, student_id, disciplina, bimestre, ano_letivo)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_aval_proc_student 
    ON avaliacao_processual(student_id, disciplina, bimestre);

CREATE INDEX IF NOT EXISTS idx_aval_proc_workspace 
    ON avaliacao_processual(workspace_id, ano_letivo);

-- RLS
ALTER TABLE avaliacao_processual ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can manage their workspace assessments"
    ON avaliacao_processual
    FOR ALL
    USING (workspace_id IN (
        SELECT workspace_id FROM members WHERE id = auth.uid()
    ));

-- Auto-update timestamp
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
