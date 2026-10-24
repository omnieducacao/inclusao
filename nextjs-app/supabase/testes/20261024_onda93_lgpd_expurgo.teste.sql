-- Teste local da migração de expurgo (SCRUM-245), com dados fictícios. Roda num Postgres vazio, nunca na produção.
-- 1) esquema mínimo  2) a migração (\i)  3) os casos.
-- Precisa da extensão pg_cron no Postgres de teste (pode ser uma versão falsa com cron.job, cron.schedule e cron.unschedule).

create role anon; create role authenticated;
create table workspaces (id uuid primary key default gen_random_uuid(), name text not null, pin_hash text not null, active boolean default true, pgi_data jsonb, drive_dominio text);
create table students (id uuid primary key default gen_random_uuid(), workspace_id uuid, name text);
create table avaliacao_processual (id serial primary key, workspace_id uuid references workspaces, student_id uuid references students);
create table pei_documents (id serial primary key, student_id uuid references students on delete cascade);
create table peis (id serial primary key, workspace_id uuid);
create table workspace_members (id uuid primary key default gen_random_uuid(), workspace_id uuid, email text);
create table teacher_student_links (id serial primary key, workspace_member_id uuid references workspace_members on delete cascade);
create table hub_generated_content (id serial primary key, workspace_id uuid references workspaces on delete cascade, member_id uuid references workspace_members on delete set null);
create table pei_ciencias (id serial primary key, workspace_id uuid references workspaces on delete cascade, member_id uuid references workspace_members on delete cascade);
create table audit_log (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces on delete cascade, actor_id text, actor_role text, action text not null, resource_type text not null, resource_id text, metadata jsonb, ip_address text, created_at timestamptz default now());
create table acessos (id bigserial primary key, criado_em timestamptz not null default now(), tipo text not null default 'x', workspace_id uuid);
create table usage_events (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces on delete set null, event_type text not null default 'x', created_at timestamptz default now());
create view v_students as select workspace_id from students;
create function fn_rotate_audit_logs(retention_days integer default 90) returns integer language sql as 'select 0';

\i ../migrations/20261024_onda93_lgpd_expurgo.sql

\set ON_ERROR_STOP 1
-- A: encerrada há 100 dias (deve apagar). B: encerrada há 10 dias (fica). C: ativa (fica). D: inativa sem data (fica).
insert into workspaces (id,name,pin_hash) values ('aaaaaaaa-0000-0000-0000-000000000000','Escola A','h'),('bbbbbbbb-0000-0000-0000-000000000000','Escola B','h'),('cccccccc-0000-0000-0000-000000000000','Escola C','h');
insert into workspaces (id,name,pin_hash,active) values ('dddddddd-0000-0000-0000-000000000000','Escola D','h',false);
update workspaces set active=false where name in ('Escola A','Escola B');
select name, contrato_encerrado_em is not null as tem_data from workspaces order by name;
update workspaces set contrato_encerrado_em = now() - interval '100 days' where name='Escola A';
update workspaces set contrato_encerrado_em = now() - interval '10 days' where name='Escola B';
do $$ declare w uuid; s uuid; m uuid; begin
  foreach w in array array['aaaaaaaa-0000-0000-0000-000000000000','bbbbbbbb-0000-0000-0000-000000000000','cccccccc-0000-0000-0000-000000000000','dddddddd-0000-0000-0000-000000000000']::uuid[] loop
    insert into students (workspace_id,name) values (w,'Estudante Teste') returning id into s;
    insert into avaliacao_processual (workspace_id,student_id) values (w,s);
    insert into pei_documents (student_id) values (s);
    insert into peis (workspace_id) values (w);
    insert into workspace_members (workspace_id,email) values (w,'prof@teste.invalid') returning id into m;
    insert into teacher_student_links (workspace_member_id) values (m);
    insert into hub_generated_content (workspace_id,member_id) values (w,m);
    insert into pei_ciencias (workspace_id,member_id) values (w,m);
    insert into audit_log (workspace_id,action,resource_type) values (w,'login','x');
    insert into acessos (workspace_id) values (w);
    insert into usage_events (workspace_id) values (w);
  end loop; end $$;
insert into audit_log (action,resource_type,created_at) values ('velho','x', now()-interval '13 months'),('recente','x', now()-interval '11 months');
insert into acessos (criado_em) values (now()-interval '13 months');
insert into usage_events (created_at) values (now()-interval '400 days');
\echo '--- simulação escolas'
select * from lgpd_expurgar_escolas(true);
select count(*) as estudantes_antes from students;
\echo '--- execução escolas'
select * from lgpd_expurgar_escolas(false);
select w.name, w.pin_hash, (select count(*) from students s where s.workspace_id=w.id) est, (select count(*) from workspace_members m where m.workspace_id=w.id) membros, (select count(*) from peis p where p.workspace_id=w.id) peis, (select count(*) from audit_log a where a.workspace_id=w.id) auditoria from workspaces w order by 1;
select count(*) pei_docs_orfaos from pei_documents d where not exists (select 1 from students s where s.id=d.student_id);
select count(*) as links_restantes from teacher_student_links;
\echo '--- rodar de novo não faz nada'
select * from lgpd_expurgar_escolas(false);
\echo '--- registros'
select * from lgpd_expurgar_registros(true);
select * from lgpd_expurgar_registros(false);
select action from audit_log where workspace_id is null order by 1;
\echo '--- reativar limpa a data'
update workspaces set active=true where name='Escola B'; select name, contrato_encerrado_em from workspaces where name='Escola B';
\echo '--- permissões'
set role anon; select lgpd_expurgar_escolas(true);
