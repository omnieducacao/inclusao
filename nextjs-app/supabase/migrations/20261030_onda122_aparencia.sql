-- Frente 6 · onda 122: o avatar da criança e a família montada, iguais em todos os celulares da casa.
--   criancas.aparencia     o avatar e a lista "Monte a família" num texto JSON, cifrado pelo servidor
--                          (lib/colunas-cifradas.ts): só cores do desenho, o estilo do cabelo, o nome
--                          que a criança usa para cada pessoa e o tamanho do boneco
--   criancas.aparencia_em  quando a família mudou pela última vez (vence a mudança mais recente)
--
-- O app nunca pergunta raça, etnia, gênero, orientação ou parentesco: é só a aparência do desenho.
-- Fica fora da IA e dos relatórios. RLS segue ligado e sem políticas: só o servidor acessa.
-- Aplicar só com o OK do Rodrigo (dado em 30/10/2026). Idempotente.

alter table public.criancas add column if not exists aparencia text;
alter table public.criancas add column if not exists aparencia_em timestamptz;
