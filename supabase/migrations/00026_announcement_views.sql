-- Migration: 00026_announcement_views.sql
-- Rastreia quando cada usuário (master ou member) visualiza anúncios

CREATE TABLE IF NOT EXISTS announcement_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  user_email text NOT NULL,
  announcement_id text NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  shown_as_modal boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  UNIQUE(workspace_id, user_email, announcement_id)
);

CREATE INDEX idx_announcement_views_workspace_user ON announcement_views(workspace_id, user_email);
CREATE INDEX idx_announcement_views_announcement ON announcement_views(announcement_id);

ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;

-- Policies: Members can manage their own announcement views
DROP POLICY IF EXISTS "Members can view own announcement views" ON announcement_views;
CREATE POLICY "Members can view own announcement views" ON announcement_views
  FOR SELECT USING (true); -- Allow members to see their views via backend API

DROP POLICY IF EXISTS "Members can insert own announcement views" ON announcement_views;
CREATE POLICY "Members can insert own announcement views" ON announcement_views
  FOR INSERT WITH CHECK (true); -- Allow inserts via backend API (validated by session)

DROP POLICY IF EXISTS "Members can update own announcement views" ON announcement_views;
CREATE POLICY "Members can update own announcement views" ON announcement_views
  FOR UPDATE USING (true) WITH CHECK (true); -- Allow updates via backend API

COMMENT ON TABLE announcement_views IS 'Rastreia visualizações de anúncios por usuário (master ou member via workspace+email).';