-- ═══════════════════════════════════════════════════════════════
-- Migration: Feed Omnisfera (carrossel de posts)
-- Tabela para posts com imagens no formato carrossel (até 8 fotos)
-- Usado para: posts Instagram, informativos, datas comemorativas
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS omnisfera_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,                           -- título opcional do post
  caption TEXT,                         -- legenda / texto do post
  category TEXT DEFAULT 'instagram',    -- instagram | informativo | comemorativo | institucional
  instagram_url TEXT,                   -- link para post original no Instagram
  images TEXT[] NOT NULL DEFAULT '{}',  -- array de URLs (Supabase Storage)
  published BOOLEAN DEFAULT true,
  position INT DEFAULT 0,              -- ordenação manual
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para listagem pública
CREATE INDEX IF NOT EXISTS idx_omnisfera_feed_published
  ON omnisfera_feed (published, position DESC, created_at DESC);

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION update_omnisfera_feed_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_omnisfera_feed_updated_at
  BEFORE UPDATE ON omnisfera_feed
  FOR EACH ROW
  EXECUTE FUNCTION update_omnisfera_feed_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- STORAGE: criar bucket 'omnisfera-feed' (público) via Dashboard
-- Supabase Dashboard > Storage > New Bucket > nome: omnisfera-feed
-- Tipo: Public
-- ═══════════════════════════════════════════════════════════════
