-- =============================================================================
-- Novos componentes curriculares: Educação Infantil e disciplinas do Ensino Médio
-- EI: professor(a) de Educação Infantil (Campos de Experiência)
-- EM: Química, Física, Biologia, Filosofia, Sociologia
-- =============================================================================

INSERT INTO components (id, label, sort_order) VALUES
  ('educacao_infantil', 'Educação Infantil', 0),
  ('biologia', 'Biologia', 9),
  ('fisica', 'Física', 10),
  ('quimica', 'Química', 11),
  ('filosofia', 'Filosofia', 12),
  ('sociologia', 'Sociologia', 13)
ON CONFLICT (id) DO NOTHING;
