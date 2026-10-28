-- Onda 101 · Frente 6 · Omniband: pulseira, cordão, cartão-crachá e adesivos com chip NFC (28/10/2026).
-- Conceito no PDF "Omniband · O conceito" (pasta Omnisfera/omniband). Depende da onda 100.
--
--   omniband_objetos   cada objeto da família ligado a uma criança (o chip guarda só um link)
--   omniband_leituras  cada leitura: da família, da rede ou de quem encontrou (sem conta)
--   paginas_ajuda      o que quem encontrou vê, escrito pela família (textos cifrados pelo app)
--   app_dispositivos   aparelhos que recebem os avisos (token de notificação da Expo)
--
-- Nada de nome, saúde ou telefone no chip. A localização de quem encontrou só existe se a pessoa
-- decidir enviar, e fica cifrada no registro (registros.texto). Sem GPS, sem rastreio.
-- Como todo o banco: RLS ligado, sem políticas; só o servidor (chave de serviço) acessa.
-- NÃO APLICAR sem o OK do Rodrigo.

create table if not exists public.omniband_objetos (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  tipo text not null check (tipo in ('pulseira', 'cordao', 'cartao', 'adesivo')),
  rotina text check (rotina in ('medicamento', 'refeicao', 'banho', 'dormir', 'escola', 'calma', 'ajuda')),
  linha text check (linha in ('joaninha', 'girassol', 'omnisfera')),
  apelido text,                                  -- "pulseira da escola", "adesivo do armário"
  codigo text unique not null,                   -- vai no link do chip simples; nunca identifica a criança
  chip text not null default 'simples' check (chip in ('simples', 'ntag424')),
  uid_hash text,                                 -- SHA-256 do UID do chip (NTAG 424 DNA)
  contador integer not null default 0,           -- último contador de leitura aceito (link que não se copia)
  status text not null default 'ativo' check (status in ('ativo', 'desativado')),
  vinculado_por uuid references public.pessoas(id) on delete set null,
  desativado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_omniband_objetos_crianca on public.omniband_objetos(crianca_id);
create unique index if not exists idx_omniband_uid_ativo on public.omniband_objetos(uid_hash)
  where uid_hash is not null and status = 'ativo';

create table if not exists public.omniband_leituras (
  id uuid primary key default gen_random_uuid(),
  objeto_id uuid not null references public.omniband_objetos(id) on delete cascade,
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  quem text not null check (quem in ('anonimo', 'responsavel', 'adolescente', 'membro')),
  pessoa_id uuid references public.pessoas(id) on delete set null,
  contador integer,
  token_hash text unique,                        -- convite de 30 min para enviar a localização
  localizacao_em timestamptz,
  registro_id uuid references public.registros(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_omniband_leituras_objeto on public.omniband_leituras(objeto_id, created_at desc);
create index if not exists idx_omniband_leituras_crianca on public.omniband_leituras(crianca_id, created_at desc);

create table if not exists public.paginas_ajuda (
  crianca_id uuid primary key references public.criancas(id) on delete cascade,
  apelido text,                                  -- como chamar a criança (cifrado)
  mensagem text,                                 -- o que quem encontrou precisa saber (cifrado)
  contatos text,                                 -- JSON [{nome, telefone}] (cifrado)
  mostrar_localizacao boolean not null default true,
  ativa boolean not null default true,
  atualizado_por uuid references public.pessoas(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_dispositivos (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  token text unique not null,
  plataforma text check (plataforma in ('ios', 'android', 'web')),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_app_dispositivos_pessoa on public.app_dispositivos(pessoa_id) where ativo;

-- registros: novos subtipos usados pelos adesivos de rotina (sem constraint de subtipo na onda 100):
--   evento: banho, calma, chegada, saida      sinal: leitura_ajuda, localizacao
comment on column public.registros.subtipo is
  'evento: crise, agitacao, apatia, agressividade, choro, autolesao, sono, alimentacao, avanco, banho, calma, chegada, saida · sinal: leitura_ajuda, localizacao';

alter table public.omniband_objetos enable row level security;
alter table public.omniband_leituras enable row level security;
alter table public.paginas_ajuda enable row level security;
alter table public.app_dispositivos enable row level security;
