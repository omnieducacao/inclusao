-- Onda 77 · SCRUM-231 etapa 3 (parte A): índice cego do e-mail de login. Só acrescenta; nada é apagado.
-- Já aplicada no banco em 23/10/2026.
-- email_hash = HMAC-SHA256 do e-mail normalizado, com chave derivada da ENCRYPTION_KEY (lib/indice-cego.ts).
-- Permite procurar e garantir unicidade pelo e-mail depois que ele passar a ser gravado cifrado.
alter table public.workspace_members   add column if not exists email_hash text;
alter table public.workspace_masters   add column if not exists email_hash text;
alter table public.family_responsibles add column if not exists email_hash text;
alter table public.platform_admins     add column if not exists email_hash text;

create unique index if not exists workspace_members_workspace_email_hash_key   on public.workspace_members (workspace_id, email_hash);
create unique index if not exists family_responsibles_workspace_email_hash_key on public.family_responsibles (workspace_id, email_hash);
create unique index if not exists platform_admins_email_hash_key               on public.platform_admins (email_hash);
create index        if not exists workspace_masters_email_hash_idx             on public.workspace_masters (email_hash);
