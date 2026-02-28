-- =============================================================================
-- RLS por workspace (1.3.1)
-- Políticas que filtram por app.workspace_id.
CREATE SCHEMA IF NOT EXISTS app;

-- O backend usa SERVICE_KEY que bypassa RLS; estas políticas aplicam quando
-- usar role que respeita RLS (ex: anon com JWT). Para ativar, o backend deve
-- chamar app.set_workspace_context(workspace_id) antes de cada transação.
-- =============================================================================

-- Função auxiliar: retorna workspace_id do contexto ou NULL
CREATE OR REPLACE FUNCTION app.current_workspace_id()
RETURNS uuid AS $$
  SELECT CASE
    WHEN current_setting('app.workspace_id', true) IS NULL OR trim(current_setting('app.workspace_id', true)) = '' THEN NULL
    ELSE NULLIF(trim(current_setting('app.workspace_id', true)), '')::uuid
  END;
$$ LANGUAGE sql STABLE;

-- Função para o backend definir o contexto antes de queries
CREATE OR REPLACE FUNCTION app.set_workspace_context(ws_id uuid)
RETURNS void AS $$
  PERFORM set_config('app.workspace_id', COALESCE(ws_id::text, ''), true);
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.current_workspace_id() IS 'Retorna workspace_id do contexto da sessão. Usado pelas políticas RLS.';
COMMENT ON FUNCTION app.set_workspace_context(uuid) IS 'Define workspace_id no contexto. Chamar antes de queries quando usar role que respeita RLS.';

-- Política por workspace: permite acesso quando workspace_id = contexto
-- Mantemos a política permissiva (USING true) para compatibilidade com service role.
-- Quando migrar para role que respeita RLS, remover a política permissiva e garantir
-- que app.set_workspace_context seja chamado antes de cada request.

-- students
DROP POLICY IF EXISTS "Allow all for service" ON students;
CREATE POLICY "Allow all for service" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "RLS workspace students" ON students FOR ALL
  USING (workspace_id = app.current_workspace_id())
  WITH CHECK (workspace_id = app.current_workspace_id());

-- workspace_members
DROP POLICY IF EXISTS "RLS workspace workspace_members" ON workspace_members;
CREATE POLICY "RLS workspace workspace_members" ON workspace_members FOR ALL
  USING (workspace_id = app.current_workspace_id())
  WITH CHECK (workspace_id = app.current_workspace_id());

-- family_responsibles
DROP POLICY IF EXISTS "RLS workspace family_responsibles" ON family_responsibles;
CREATE POLICY "RLS workspace family_responsibles" ON family_responsibles FOR ALL
  USING (workspace_id = app.current_workspace_id())
  WITH CHECK (workspace_id = app.current_workspace_id());

-- pei_disciplinas
DROP POLICY IF EXISTS "RLS workspace pei_disciplinas" ON pei_disciplinas;
CREATE POLICY "RLS workspace pei_disciplinas" ON pei_disciplinas FOR ALL
  USING (workspace_id = app.current_workspace_id())
  WITH CHECK (workspace_id = app.current_workspace_id());

-- avaliacao_processual
DROP POLICY IF EXISTS "RLS workspace avaliacao_processual" ON avaliacao_processual;
CREATE POLICY "RLS workspace avaliacao_processual" ON avaliacao_processual FOR ALL
  USING (workspace_id = app.current_workspace_id())
  WITH CHECK (workspace_id = app.current_workspace_id());

-- planos_ensino
DROP POLICY IF EXISTS "RLS workspace planos_ensino" ON planos_ensino;
CREATE POLICY "RLS workspace planos_ensino" ON planos_ensino FOR ALL
  USING (workspace_id = app.current_workspace_id())
  WITH CHECK (workspace_id = app.current_workspace_id());

-- avaliacoes_diagnosticas
DROP POLICY IF EXISTS "RLS workspace avaliacoes_diagnosticas" ON avaliacoes_diagnosticas;
CREATE POLICY "RLS workspace avaliacoes_diagnosticas" ON avaliacoes_diagnosticas FOR ALL
  USING (workspace_id = app.current_workspace_id())
  WITH CHECK (workspace_id = app.current_workspace_id());
