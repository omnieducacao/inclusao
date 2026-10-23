-- Onda 74 · SCRUM-231 (etapa 2): tirar do banco dados pessoais que estavam em claro e sem uso.
--
-- Conferido em 23/10/2026, só com contagens (nenhum valor lido):
--   - students.birth_date: 7 de 10 estudantes com valor, os 7 iguais à data que o PEI já guarda em
--     pei_data.nasc (agora cifrada). Nenhuma função nem gatilho do banco e nenhum código a usam.
--   - workspaces.pin: vazia nas 2 escolas; o PIN fica só em pin_hash. A exportação do admin deixou
--     de pedir a coluna (mesmo commit), antes desta migration.
--   - pei_estudante (nome, nascimento, escola) e access_logs (com pin_used em claro): 0 linhas e
--     nenhum uso no código.
-- Fica de fora, de propósito: app_pins (2 linhas com pin_code em claro, sem uso no código), que
-- tem dados e precisa de decisão à parte.

alter table public.students drop column if exists birth_date;
alter table public.workspaces drop column if exists pin;
drop table if exists public.pei_estudante;
drop table if exists public.access_logs;
