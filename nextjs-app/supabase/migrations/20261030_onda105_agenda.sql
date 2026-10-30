-- Frente 6 · onda 105: a agenda da criança (doc "App da família: crítica e mapa do que vem", onda 1).
--   app_compromissos    consultas, terapias, escola, exames e marcos; podem repetir toda semana
--   app_agenda_links    o link secreto do calendário (iCal) que cada pessoa assina no Google ou no iPhone
--   (onda 106, no mesmo arquivo porque a 105 ainda não foi aplicada: status, proposta_inicio e proposto_por,
--    para o profissional propor horário ou remarcar e a família confirmar)
--   medicacoes          ganha estoque (opcional), quantas unidades por dose e a validade da receita
--
-- Como todo o banco: RLS ligado, sem políticas; só o servidor (chave de serviço) acessa.
-- Título, local, o que levar, quem leva e observação são cifrados pelo app (lib/colunas-cifradas.ts).
-- O que vai para o calendário de fora é só título, hora e local; nada de saúde.
-- Aplicar só com o OK do Rodrigo. Idempotente.

create table if not exists public.app_compromissos (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  tipo text not null default 'outro' check (tipo in ('consulta', 'terapia', 'escola', 'exame', 'marco', 'outro')),
  titulo text not null,                 -- cifrado
  inicio timestamptz not null,
  duracao_min smallint not null default 60 check (duracao_min between 5 and 1440),
  dia_inteiro boolean not null default false,
  local text,                           -- cifrado
  levar text,                           -- cifrado: o que levar
  quem_leva text,                       -- cifrado: nome de quem leva
  observacao text,                      -- cifrado: só no app, nunca no calendário de fora
  repete text not null default 'nao' check (repete in ('nao', 'semanal')),
  repete_ate date,
  pulos date[] not null default '{}',   -- datas em que uma série semanal não acontece
  membro_id uuid references public.rede_membros(id) on delete set null,  -- o profissional do compromisso
  lembrar_min smallint[] not null default '{1440,60}',  -- véspera e 1 hora antes
  cancelado_em timestamptz,
  -- onda 106: o profissional da rede propõe um horário (ou remarca) e a família confirma
  status text not null default 'confirmado' check (status in ('proposto', 'confirmado', 'recusado')),
  proposta_inicio timestamptz,          -- remarcação proposta, até a família confirmar
  proposto_por uuid references public.pessoas(id) on delete set null,
  criado_por uuid references public.pessoas(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_app_compromissos_crianca on public.app_compromissos(crianca_id, inicio);
alter table public.app_compromissos enable row level security;

create table if not exists public.app_agenda_links (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  token_hash text not null unique,
  revogado_em timestamptz,
  ultimo_acesso_em timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_app_agenda_links_pessoa on public.app_agenda_links(pessoa_id, crianca_id);
alter table public.app_agenda_links enable row level security;

alter table public.medicacoes add column if not exists estoque numeric(7,1) check (estoque is null or estoque >= 0);
alter table public.medicacoes add column if not exists estoque_em timestamptz;
alter table public.medicacoes add column if not exists por_dose numeric(4,1) not null default 1 check (por_dose > 0);
alter table public.medicacoes add column if not exists receita_vence date;
