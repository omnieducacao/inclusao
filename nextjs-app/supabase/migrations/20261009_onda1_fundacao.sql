-- Onda 1 · Fundação (09/10/2026)
--
-- Parte A — alinhar o banco ao código. Várias migrações do repositório nunca chegaram ao
-- banco de produção, e o código já dependia delas. Efeitos que isso causava:
--   - professores não conseguiam entrar (o login pede workspace_members.terms_accepted);
--   - cadastrar estudante falhava (students.privacy_consent_at);
--   - abrir um estudante falhava e caía num "plano B" sem filtro de escola (students.paee_data);
--   - auditoria LGPD, histórico do Hub e métricas de desempenho não gravavam nada.
--
-- Parte B — fundação:
--   - papel com nome para cada membro (direção, coordenação, professor, AEE, apoio);
--   - estudante ligado a uma turma cadastrada (class_id), não só a texto livre;
--   - modo da escola: completo ou simplificado.
--
-- Tudo é idempotente (pode rodar duas vezes). As tabelas novas nascem com RLS ligado e sem
-- políticas, como o resto do banco desde a onda 0: só o servidor (chave secreta) acessa.

-- ── Parte A · colunas que o código já usa ────────────────────────────────────────────
alter table public.workspace_members add column if not exists terms_accepted boolean not null default false;
alter table public.workspace_members add column if not exists terms_accepted_at timestamptz;

alter table public.students add column if not exists paee_data jsonb;
alter table public.students add column if not exists privacy_consent_at timestamptz;

alter table public.workspaces add column if not exists allow_avaliacao_fase_1 boolean not null default false;

-- ── Parte A · tabelas que o código já usa ────────────────────────────────────────────
create table if not exists public.hub_generated_content (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  member_id uuid references public.workspace_members(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  content_type text not null,
  description text,
  engine text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_hub_generated_workspace on public.hub_generated_content(workspace_id);
create index if not exists idx_hub_generated_student on public.hub_generated_content(student_id);
alter table public.hub_generated_content enable row level security;

-- Auditoria LGPD (Art. 37). actor_id é texto: guarda o id ou o nome de quem agiu.
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  actor_id text,
  actor_role text,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz default now()
);
create index if not exists idx_audit_log_workspace on public.audit_log(workspace_id, created_at desc);
create index if not exists idx_audit_log_resource on public.audit_log(resource_type, resource_id);
alter table public.audit_log enable row level security;

create table if not exists public.web_vitals (
  id text primary key,
  name text,
  value double precision,
  path text,
  timestamp timestamptz default now()
);
alter table public.web_vitals enable row level security;

-- ── Parte B · papel com nome ─────────────────────────────────────────────────────────
-- O papel diz quem a pessoa é na escola; as permissões (can_*) continuam dizendo o que ela
-- pode abrir. Ao escolher um papel na Gestão, a tela sugere as permissões daquele papel.
alter table public.workspace_members add column if not exists papel text not null default 'professor';
do $$ begin
  alter table public.workspace_members
    add constraint workspace_members_papel_check
    check (papel in ('direcao', 'coordenacao', 'professor', 'aee', 'apoio'));
exception when duplicate_object then null; end $$;

-- Quem já existe: deduz pelo cargo digitado à mão, quando dá.
update public.workspace_members set papel = case
    when cargo ilike '%dire%' then 'direcao'
    when cargo ilike '%coord%' then 'coordenacao'
    when cargo ilike '%aee%' or cargo ilike '%atendimento%' or cargo ilike '%sala de recurso%' then 'aee'
    when cargo ilike '%apoio%' or cargo ilike '%mediad%' or cargo ilike '%acompanhante%' then 'apoio'
    else 'professor'
  end
where papel = 'professor' and cargo is not null;

alter table public.workspace_masters add column if not exists papel text not null default 'coordenacao';
do $$ begin
  alter table public.workspace_masters
    add constraint workspace_masters_papel_check check (papel in ('direcao', 'coordenacao'));
exception when duplicate_object then null; end $$;
update public.workspace_masters set papel = 'direcao' where cargo ilike '%dire%' and papel = 'coordenacao';

-- ── Parte B · estudante ligado à turma ───────────────────────────────────────────────
alter table public.students add column if not exists class_id uuid references public.classes(id) on delete set null;
create index if not exists idx_students_class on public.students(class_id);

-- Liga quem já existe, com a mesma regra do app (lib/turmas.ts): mesmo número de série, mesmo
-- segmento quando o texto diz (EI, EFAI, EFAF, EM) e a mesma turma. Só liga quando há uma única
-- turma possível na escola.
with seg as (
  select s.id, s.workspace_id, lower(trim(s.class_group)) turma,
         substring(s.grade from '\d+') num,
         case
           when s.grade ilike '%infantil%' then 'EI'
           when s.grade ilike '%(EFAI)%' then 'EFAI'
           when s.grade ilike '%(EFAF)%' then 'EFAF'
           when s.grade ilike '%(EM)%' or s.grade ilike '%série%' then 'EM'
         end segmento
  from public.students s
  where s.class_id is null and s.grade is not null and s.class_group is not null
),
cand as (
  select seg.id student_id, c.id class_id, count(*) over (partition by seg.id) n
  from seg
  join public.classes c on c.workspace_id = seg.workspace_id and lower(trim(c.class_group)) = seg.turma
  join public.grades g on g.id = c.grade_id
  left join public.school_years y on y.id = c.school_year_id
  where coalesce(y.active, true)
    and seg.num is not null
    and coalesce(substring(g.code from '\d+'), substring(g.label from '\d+')) = seg.num
    and (seg.segmento is null or seg.segmento = g.segment_id)
)
update public.students s set class_id = cand.class_id
from cand where cand.student_id = s.id and cand.n = 1;

-- ── Parte B · modo da escola ─────────────────────────────────────────────────────────
-- completo: fluxo inteiro (estudo de caso, PEI em camadas, AEE, acompanhamento);
-- simplificado: o essencial, pensado para a escola particular.
alter table public.workspaces add column if not exists modo text not null default 'completo';
do $$ begin
  alter table public.workspaces add constraint workspaces_modo_check check (modo in ('completo', 'simplificado'));
exception when duplicate_object then null; end $$;
