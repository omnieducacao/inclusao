-- Onda 39 (14/10/2026): contatos comerciais (leads) da home de vendas e da demonstração.
-- Só o servidor lê e grava (RLS ligada e nenhuma política para anon/authenticated).
-- LGPD: guarda o momento do consentimento e um resumo (hash) do IP, nunca o IP em si.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefone text,
  escola text not null,
  cargo text not null,
  tipo_instituicao text,
  faixa_estudantes text,
  cidade text,
  uf text,
  mensagem text,
  origem text not null default 'contato' check (origem in ('contato', 'demonstracao')),
  papel_demo text,
  modulos_vistos jsonb not null default '[]'::jsonb,
  status text not null default 'novo' check (status in ('novo', 'em_conversa', 'fechado', 'descartado')),
  notas text,
  consentimento_em timestamptz not null,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_criados_idx on public.leads (created_at desc);
create index if not exists leads_ip_idx on public.leads (ip_hash, created_at desc);

alter table public.leads enable row level security;
