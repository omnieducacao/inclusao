-- Onda 57: medição do site (sem cookie e sem guardar IP) e registro de acessos à plataforma.
-- As duas tabelas só são lidas e escritas pelo servidor (service role); RLS ligado e sem políticas.

create table if not exists public.site_eventos (
  id bigserial primary key,
  criado_em timestamptz not null default now(),
  tipo text not null check (tipo in ('visita', 'clique', 'marco')),
  pagina text not null,
  alvo text,
  origem text,
  ref_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  -- identificador do visitante só daquele dia: hash de IP + navegador + data, que muda todo dia
  visitante text,
  dispositivo text check (dispositivo in ('celular', 'computador'))
);
create index if not exists site_eventos_criado_em_idx on public.site_eventos (criado_em desc);
create index if not exists site_eventos_tipo_idx on public.site_eventos (tipo, criado_em desc);
alter table public.site_eventos enable row level security;

create table if not exists public.acessos (
  id bigserial primary key,
  criado_em timestamptz not null default now(),
  tipo text not null check (tipo in ('login', 'demo_entrada', 'demo_pagina', 'demo_papel')),
  workspace_id uuid,
  workspace_nome text,
  usuario_nome text,
  papel text,
  lead_id uuid references public.leads (id) on delete set null,
  rota text,
  modulo text
);
create index if not exists acessos_criado_em_idx on public.acessos (criado_em desc);
create index if not exists acessos_lead_idx on public.acessos (lead_id, criado_em);
alter table public.acessos enable row level security;
