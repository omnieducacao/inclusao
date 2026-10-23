-- Onda 76 · SCRUM-231: app_pins guardava PIN em texto claro, era do início do projeto e não é
-- usada pelo código. Apagada com o OK do Rodrigo (23/10/2026), já aplicada no banco.
-- Conferido antes: 2 linhas, nenhuma FK, view ou função dependia dela.
drop table if exists public.app_pins;
