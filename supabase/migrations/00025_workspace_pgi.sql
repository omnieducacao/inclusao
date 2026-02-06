-- PGI: Plano de Gestão Inclusiva por workspace
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS pgi_data jsonb DEFAULT '{"acoes":[],"dimensionamento":{}}'::jsonb;
COMMENT ON COLUMN workspaces.pgi_data IS 'Plano de Gestão Inclusiva: acoes (5W2H) e dimensionamento preliminar.';
