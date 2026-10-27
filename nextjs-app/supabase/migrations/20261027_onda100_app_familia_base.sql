-- Onda 100 · Frente 6 · App da família e Rede de apoio: a base (27/10/2026).
-- Estrutura no doc "Omnisfera · App da família e Rede de apoio: estrutura".
--
-- A mudança principal: a família e a criança deixam de existir só dentro de uma escola.
--   pessoas            login único (família, adolescente, professor, profissional de saúde)
--   familias           conta da família, dona dos dados da criança (vem da escola cliente ou direto)
--   criancas           perfil da criança/adolescente; liga-se a estudantes de escolas clientes
--   rede_membros       quem a família pôs na rede (escola, profissional, professor convidado)
--   rede_permissoes    o que cada membro vê/escreve, por categoria de dado
--   consentimentos     cada autorização e revogação (LGPD, arts. 11 e 14)
--   registros          a linha do tempo: evento, dose, terapia, orientação, humor, sinal da pulseira
--   medicacoes         lista viva de remédios (nunca sugerimos dose: só registro)
--   app_missoes        missões em etapas (de meta do PEI, orientação ou da família)
--   conquistas*        badges automáticas e concedidas
--   app_sessoes        renovação do login do app (só o hash do token)
--   adolescente_codigos código de 6 dígitos que ativa o modo adolescente
--
-- Como todo o banco desde a onda 0: RLS ligado, sem políticas; só o servidor (chave de serviço) acessa.
-- Textos pessoais (nome, e-mail, telefone, texto de registro, nome de remédio) são cifrados pelo app
-- (lib/colunas-cifradas.ts) antes de chegar aqui. E-mail busca pelo índice cego (email_hash).
-- NÃO APLICAR sem o OK do Rodrigo.

-- ---------- pessoas: login único ----------
create table if not exists public.pessoas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  email_hash text unique,
  telefone text,
  password_hash text,
  google_sub text unique,
  apple_sub text unique,
  ativo boolean not null default true,
  termos_aceitos_em timestamptz,
  ultimo_acesso_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- O mesmo login vale para quem já existe na escola: o responsável e o membro da equipe apontam para a pessoa.
alter table public.family_responsibles add column if not exists pessoa_id uuid references public.pessoas(id) on delete set null;
alter table public.workspace_members add column if not exists pessoa_id uuid references public.pessoas(id) on delete set null;
create index if not exists idx_family_responsibles_pessoa on public.family_responsibles(pessoa_id);
create index if not exists idx_workspace_members_pessoa on public.workspace_members(pessoa_id);

-- ---------- famílias e crianças ----------
create table if not exists public.familias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  origem text not null default 'direto' check (origem in ('escola', 'direto', 'cartao')),
  plano text not null default 'teste' check (plano in ('escola', 'teste', 'assinatura', 'encerrado')),
  codigo_indicacao text,               -- cartão com QR do profissional (sem comissão: só saber quem trouxe)
  teste_ate date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.familia_responsaveis (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  parentesco text,
  principal boolean not null default false,
  created_at timestamptz not null default now(),
  unique (familia_id, pessoa_id)
);
create index if not exists idx_familia_responsaveis_pessoa on public.familia_responsaveis(pessoa_id);

create table if not exists public.criancas (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  nome text not null,
  nascimento date,
  modo text not null default 'crianca' check (modo in ('crianca', 'adolescente')),
  adolescente_pessoa_id uuid references public.pessoas(id) on delete set null,
  adolescente_pausado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_criancas_familia on public.criancas(familia_id);
create index if not exists idx_criancas_adolescente on public.criancas(adolescente_pessoa_id);

-- A escola cliente pede o vínculo com o estudante; a família aceita. O histórico de casa fica com a família.
create table if not exists public.crianca_escolas (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'pedido' check (status in ('pedido', 'ativo', 'encerrado')),
  pedido_em timestamptz not null default now(),
  aceito_em timestamptz,
  aceito_por uuid references public.pessoas(id) on delete set null,
  encerrado_em timestamptz,
  unique (crianca_id, student_id)
);
create index if not exists idx_crianca_escolas_student on public.crianca_escolas(student_id, status);
create index if not exists idx_crianca_escolas_workspace on public.crianca_escolas(workspace_id, status);

-- ---------- a rede ----------
create table if not exists public.rede_membros (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  tipo text not null check (tipo in ('escola', 'profissional', 'professor')),
  pessoa_id uuid references public.pessoas(id) on delete set null,       -- vazio até aceitar o convite
  workspace_id uuid references public.workspaces(id) on delete cascade,  -- quando o membro é a escola cliente
  nome text not null,
  especialidade text,                   -- fonoaudióloga, neurologista, psicólogo…
  conselho text,                        -- CRFa, CRM, CRP… (conferido uma vez para escrever orientações)
  conselho_conferido_em timestamptz,
  status text not null default 'convidado' check (status in ('convidado', 'ativo', 'pausado', 'revogado')),
  convite_token_hash text unique,
  convite_expira_em timestamptz,
  acesso_ate date,
  convidado_por uuid references public.pessoas(id) on delete set null,
  aceito_em timestamptz,
  revogado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_rede_membros_crianca on public.rede_membros(crianca_id, status);
create index if not exists idx_rede_membros_pessoa on public.rede_membros(pessoa_id, status);

-- Categorias: as linhas da tabela "Quem vê o quê" do doc.
create table if not exists public.rede_permissoes (
  membro_id uuid not null references public.rede_membros(id) on delete cascade,
  categoria text not null check (categoria in (
    'eventos_casa', 'eventos_escola', 'medicacao', 'laudos', 'pei', 'missoes',
    'humor', 'orientacoes', 'resumo', 'sinais')),
  pode_ver boolean not null default false,
  pode_escrever boolean not null default false,
  primary key (membro_id, categoria)
);

create table if not exists public.consentimentos (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  membro_id uuid references public.rede_membros(id) on delete set null,
  autorizado_por uuid not null references public.pessoas(id) on delete restrict,
  acao text not null check (acao in ('concedeu', 'alterou', 'revogou', 'ativou_adolescente', 'encerrou_adolescente')),
  categorias jsonb not null default '[]'::jsonb,   -- [{categoria, ver, escrever}]
  ate date,
  versao_termo text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_consentimentos_crianca on public.consentimentos(crianca_id, created_at desc);

-- ---------- linha do tempo ----------
create table if not exists public.registros (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  tipo text not null check (tipo in ('evento', 'dose', 'medicacao', 'terapia', 'orientacao', 'humor', 'sinal')),
  categoria text not null check (categoria in (
    'eventos_casa', 'eventos_escola', 'medicacao', 'laudos', 'pei', 'missoes',
    'humor', 'orientacoes', 'resumo', 'sinais')),
  subtipo text,                          -- evento: crise, agitacao, apatia… · orientação: para casa/escola
  quando timestamptz not null,
  fim timestamptz,
  intensidade smallint check (intensidade between 1 and 5),
  duracao text,
  gatilho text,
  local text check (local in ('casa', 'escola', 'terapia', 'rua', 'outro')),
  texto text,                            -- cifrado
  dados jsonb not null default '{}'::jsonb,
  autor_pessoa_id uuid references public.pessoas(id) on delete set null,
  autor_membro_id uuid references public.rede_membros(id) on delete set null,
  origem text not null default 'app' check (origem in ('app', 'web', 'pulseira', 'escola')),
  id_local text,                         -- id gerado no celular sem internet: evita duplicar no reenvio
  created_at timestamptz not null default now(),
  apagado_em timestamptz,
  unique (crianca_id, id_local)
);
create index if not exists idx_registros_linha on public.registros(crianca_id, quando desc) where apagado_em is null;

create table if not exists public.medicacoes (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  nome text not null,                    -- cifrado
  dose text,
  horarios jsonb not null default '[]'::jsonb,  -- ["07:00", "19:00"]
  na_escola boolean not null default false,     -- a escola vê o horário e marca que deu
  prescrito_por text,
  inicio date,
  fim date,
  lembrete boolean not null default false,
  ativa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_medicacoes_crianca on public.medicacoes(crianca_id, ativa);

-- ---------- missões e conquistas ----------
create table if not exists public.app_missoes (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  titulo text not null,
  etapas jsonb not null default '[]'::jsonb,     -- [{texto, figura, feita_em}]
  origem text not null default 'familia' check (origem in ('pei', 'orientacao', 'familia', 'escola')),
  meta_ref text,                                  -- meta do PEI ou orientação de origem
  trilha text,
  onde text not null default 'casa' check (onde in ('casa', 'escola', 'terapia', 'casa e escola')),
  ate date,
  status text not null default 'ativa' check (status in ('ativa', 'feita', 'confirmada', 'arquivada')),
  criada_por uuid references public.pessoas(id) on delete set null,
  confirmada_por uuid references public.pessoas(id) on delete set null,
  confirmada_em timestamptz,
  estudante_missao_id uuid references public.estudante_missoes(id) on delete set null,  -- missão vinda da escola
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_app_missoes_crianca on public.app_missoes(crianca_id, status);

create table if not exists public.conquistas_catalogo (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nome text not null,
  descricao text,
  figura text,
  tipo text not null check (tipo in ('automatica', 'concedida')),
  regra jsonb,                         -- automática: {"missoes_semana": 5} …
  ativa boolean not null default true
);

create table if not exists public.conquistas (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  catalogo_id uuid references public.conquistas_catalogo(id) on delete set null,
  nome text not null,
  frase text,
  figura text,
  meta_ref text,
  concedida_por uuid references public.pessoas(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_conquistas_crianca on public.conquistas(crianca_id, created_at desc);

-- Regras que não mudam: sem ranking, sem perder pontos, nada ligado a remédio ou a tempo de tela.
insert into public.conquistas_catalogo (codigo, nome, descricao, figura, tipo, regra) values
  ('primeira-missao', 'Primeira missão', 'Completou a primeira missão.', 'estrela', 'automatica', '{"missoes_total": 1}'),
  ('cinco-na-semana', '5 na semana', 'Completou 5 missões numa semana.', 'foguete', 'automatica', '{"missoes_semana": 5}'),
  ('trilha-completa', 'Trilha completa', 'Terminou todas as missões de uma trilha.', 'montanha', 'automatica', '{"trilha_completa": true}'),
  ('dez-dias-sentindo', '10 dias me ouvindo', 'Registrou como se sentia em 10 dias.', 'coracao', 'automatica', '{"humor_dias": 10}'),
  ('concedida', 'Conquista especial', 'Entregue por alguém da rede.', 'medalha', 'concedida', null)
on conflict (codigo) do nothing;

-- ---------- login do app ----------
create table if not exists public.app_sessoes (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  token_hash text unique not null,      -- só o SHA-256 do token de renovação
  dispositivo text,
  expira_em timestamptz not null,
  revogada_em timestamptz,
  created_at timestamptz not null default now(),
  ultimo_uso_em timestamptz
);
create index if not exists idx_app_sessoes_pessoa on public.app_sessoes(pessoa_id);

create table if not exists public.adolescente_codigos (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  codigo_hash text not null,
  criado_por uuid not null references public.pessoas(id) on delete cascade,
  expira_em timestamptz not null,
  tentativas smallint not null default 0,
  usado_em timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_adolescente_codigos_crianca on public.adolescente_codigos(crianca_id, usado_em);

-- ---------- RLS ligado, sem políticas ----------
alter table public.pessoas enable row level security;
alter table public.familias enable row level security;
alter table public.familia_responsaveis enable row level security;
alter table public.criancas enable row level security;
alter table public.crianca_escolas enable row level security;
alter table public.rede_membros enable row level security;
alter table public.rede_permissoes enable row level security;
alter table public.consentimentos enable row level security;
alter table public.registros enable row level security;
alter table public.medicacoes enable row level security;
alter table public.app_missoes enable row level security;
alter table public.conquistas_catalogo enable row level security;
alter table public.conquistas enable row level security;
alter table public.app_sessoes enable row level security;
alter table public.adolescente_codigos enable row level security;
