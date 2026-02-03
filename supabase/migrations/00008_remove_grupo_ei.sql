-- Remove qualquer série "Grupo" em EI. EI usa apenas idade: 2 anos, 3 anos, 4 anos, 5 anos.
-- Execute no Supabase SQL Editor se ainda aparecer Grupo ao criar turmas.
DELETE FROM workspace_grades WHERE grade_id IN (
  SELECT id FROM grades WHERE segment_id = 'EI' AND (code ILIKE '%grupo%' OR label ILIKE '%grupo%')
);
DELETE FROM grades WHERE segment_id = 'EI' AND (code ILIKE '%grupo%' OR label ILIKE '%grupo%');
