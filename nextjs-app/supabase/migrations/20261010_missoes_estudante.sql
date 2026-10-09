-- App do estudante · missões (10/10/2026) · onda 6 do mapa da plataforma
--
-- Missões curtas que saem das metas do PEI. A escola cria (com ajuda da IA) e aprova; o estudante
-- vê pela conta da família e marca "consegui"; a escola confirma e a missão vira conquista.
-- Status: aprovada → feita (marcada em casa) → confirmada (conquista) · ou arquivada.
-- Como todo o banco desde a onda 0: RLS ligado, sem políticas; só o servidor acessa.

create table if not exists public.estudante_missoes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  titulo text not null,
  passos jsonb not null default '[]'::jsonb,
  meta text,
  onde text not null default 'casa' check (onde in ('casa', 'escola', 'casa e escola')),
  status text not null default 'aprovada' check (status in ('aprovada', 'feita', 'confirmada', 'arquivada')),
  criada_por uuid references public.workspace_members(id) on delete set null,
  feita_em timestamptz,
  nota_familia text,
  confirmada_em timestamptz,
  confirmada_por uuid references public.workspace_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_estudante_missoes on public.estudante_missoes(workspace_id, student_id, status);

alter table public.estudante_missoes enable row level security;
