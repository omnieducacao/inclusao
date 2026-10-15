-- Onda 53 (15/10/2026): certificado de conclusão da formação gratuita do site.
-- Cada certificado tem um código público (OMNI-XXXX-XXXX) que serve para conferir na página /certificado/<código>.
-- Só o servidor lê e grava (RLS ligada e nenhuma política para anon/authenticated), como em leads.

create table if not exists public.certificados (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  email text not null,
  escola text not null,
  telefone text,
  trilha text not null check (trilha in ('prof', 'aee', 'coord')),
  horas integer not null,
  temas jsonb not null default '[]'::jsonb,
  lead_id uuid references public.leads (id) on delete set null,
  ip_hash text,
  emitido_em timestamptz not null default now()
);

create index if not exists certificados_ip_idx on public.certificados (ip_hash, emitido_em desc);

alter table public.certificados enable row level security;

-- O pedido de certificado também vira contato, com origem "certificado"
alter table public.leads drop constraint if exists leads_origem_check;
alter table public.leads add constraint leads_origem_check check (origem in ('contato', 'demonstracao', 'certificado'));

-- Onda 54: atividade final (a mudança que a pessoa vai fazer na aula), pedida antes de emitir
alter table public.certificados add column if not exists reflexao text;
