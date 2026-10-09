-- Família (10/10/2026) · onda 5 do mapa da plataforma
--
-- 1. O que a família envia (laudo, mudança de medicação) passa a chegar na escola: cada item ganha
--    "visto em" e "visto por", para a coordenação saber o que é novo.
-- 2. Mensagens curtas entre a escola e a família, por estudante, com registro.
--    O texto é gravado criptografado pelo servidor (mesma chave dos dados de saúde).
-- Como todo o banco desde a onda 0: RLS ligado, sem políticas; só o servidor acessa.

alter table public.family_laudos
  add column if not exists visto_em timestamptz,
  add column if not exists visto_por uuid references public.workspace_members(id) on delete set null;

alter table public.family_medicacao_updates
  add column if not exists visto_em timestamptz,
  add column if not exists visto_por uuid references public.workspace_members(id) on delete set null;

create table if not exists public.family_mensagens (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  autor text not null check (autor in ('escola', 'familia')),
  member_id uuid references public.workspace_members(id) on delete set null,
  family_responsible_id uuid references public.family_responsibles(id) on delete set null,
  autor_nome text,
  texto text not null,
  lida_em timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_family_mensagens_estudante on public.family_mensagens(workspace_id, student_id, created_at);

alter table public.family_mensagens enable row level security;

-- Para conferir depois de rodar:
-- select column_name from information_schema.columns where table_name = 'family_laudos' and column_name like 'visto%';
-- select count(*) from public.family_mensagens;
