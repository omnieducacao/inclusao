-- Restaura Educação Infantil (2 a 5 anos) e garante estrutura de séries.
-- Execute no Supabase SQL Editor.
INSERT INTO grades (segment_id, code, label, sort_order) VALUES
  ('EI', '2anos', '2 anos', 1),
  ('EI', '3anos', '3 anos', 2),
  ('EI', '4anos', '4 anos', 3),
  ('EI', '5anos', '5 anos', 4)
ON CONFLICT (segment_id, code) DO NOTHING;
