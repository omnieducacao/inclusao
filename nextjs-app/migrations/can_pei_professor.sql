-- ============================================================
-- Migration: can_pei_professor permission
-- Adds a separate permission for PEI - Professor module
-- Run AFTER pei_regente_vinculo.sql
-- ============================================================

-- 1. Add column
ALTER TABLE workspace_members
  ADD COLUMN IF NOT EXISTS can_pei_professor boolean NOT NULL DEFAULT false;

-- 2. Comment
COMMENT ON COLUMN workspace_members.can_pei_professor IS
  'Permite acesso ao módulo PEI - Professor (pei-regente). Separado de can_pei (AEE).';
