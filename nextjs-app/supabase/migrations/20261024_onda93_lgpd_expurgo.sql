-- Onda 93 · SCRUM-245: rotinas que apagam de fato (prazos decididos pelo Rodrigo em 24/10).
--   1) Escola com contrato encerrado: 90 dias para exportar; depois, os dados de estudantes,
--      famílias e equipe são eliminados. A linha da escola fica, anonimizada, para a auditoria
--      continuar mostrando que o contrato existiu e quando foi apagado.
--   2) Registros de acesso, auditoria e uso: guardados por 12 meses.
-- As duas rotinas começam em modo simulação (só contam, não apagam). O agendamento diário chama
-- com simular = false. Para testar à mão:  select * from public.lgpd_expurgar_escolas(true);
--                                          select * from public.lgpd_expurgar_registros(true);

-- ─── 1. Data de fim do contrato ──────────────────────────────────────────────
alter table public.workspaces
  add column if not exists contrato_encerrado_em timestamptz;

comment on column public.workspaces.contrato_encerrado_em is
  'Quando a escola foi desativada. 90 dias depois, lgpd_expurgar_escolas() apaga os dados. Reativar a escola limpa a data.';

-- Ao desativar a escola, a data é gravada sozinha; ao reativar, ela é limpa.
-- Escolas que já estavam desativadas antes desta migração NÃO recebem data (nada é apagado sem decisão).
create or replace function public.workspaces_marca_encerramento()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.active = false and coalesce(old.active, true) = true and new.contrato_encerrado_em is null then
    new.contrato_encerrado_em := now();
  elsif new.active = true and old.active = false then
    new.contrato_encerrado_em := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_workspaces_encerramento on public.workspaces;
create trigger trg_workspaces_encerramento
  before update of active on public.workspaces
  for each row execute function public.workspaces_marca_encerramento();

-- ─── 2. Expurgo das escolas encerradas há mais de 90 dias ────────────────────
create or replace function public.lgpd_expurgar_escolas(simular boolean default true)
returns table (workspace_id uuid, encerrado_em timestamptz, linhas_apagadas bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  w record;
  t record;
  n bigint;
  total bigint;
  passada int;
  pendentes text[];
begin
  for w in
    select id, contrato_encerrado_em
      from public.workspaces
     where active = false
       and contrato_encerrado_em is not null
       and contrato_encerrado_em < now() - interval '90 days'
       and name is distinct from 'Escola encerrada'
  loop
    total := 0;

    if simular then
      for t in
        select c.table_name
          from information_schema.columns c
          join information_schema.tables tb
            on tb.table_schema = c.table_schema and tb.table_name = c.table_name and tb.table_type = 'BASE TABLE'
         where c.table_schema = 'public' and c.column_name = 'workspace_id'
           and c.table_name not in ('workspaces', 'audit_log')
      loop
        execute format('select count(*) from public.%I where workspace_id = $1', t.table_name) into n using w.id;
        total := total + n;
      end loop;
    else
      -- avaliacao_processual não apaga em cascata a partir do estudante: vai primeiro.
      delete from public.avaliacao_processual a where a.workspace_id = w.id;
      get diagnostics n = row_count; total := total + n;

      -- Estudantes levam junto PEI, PAEE, laudos, família e o resto que depende deles.
      delete from public.students s where s.workspace_id = w.id;
      get diagnostics n = row_count; total := total + n;

      -- Demais tabelas com workspace_id (inclusive as que surgirem no futuro).
      -- Até 3 passadas, porque uma tabela pode depender de outra da mesma lista.
      for passada in 1..3 loop
        pendentes := array[]::text[];
        for t in
          select c.table_name
            from information_schema.columns c
            join information_schema.tables tb
              on tb.table_schema = c.table_schema and tb.table_name = c.table_name and tb.table_type = 'BASE TABLE'
           where c.table_schema = 'public' and c.column_name = 'workspace_id'
             and c.table_name not in ('workspaces', 'audit_log', 'students', 'avaliacao_processual')
        loop
          begin
            execute format('delete from public.%I where workspace_id = $1', t.table_name) using w.id;
            get diagnostics n = row_count; total := total + n;
          exception when foreign_key_violation then
            pendentes := pendentes || t.table_name;
          end;
        end loop;
        exit when cardinality(pendentes) = 0;
      end loop;
      if cardinality(pendentes) > 0 then
        raise exception 'Expurgo da escola % parou: tabelas presas por chave estrangeira: %', w.id, pendentes;
      end if;

      -- A linha da escola fica, sem nome nem PIN, para a auditoria.
      update public.workspaces
         set name = 'Escola encerrada', pin_hash = '', pgi_data = null, drive_dominio = null
       where id = w.id;

      insert into public.audit_log (workspace_id, actor_role, action, resource_type, resource_id, metadata, created_at)
      values (w.id, 'sistema', 'lgpd_expurgo_escola', 'workspace', w.id::text,
              jsonb_build_object('linhas_apagadas', total, 'contrato_encerrado_em', w.contrato_encerrado_em),
              now());
    end if;

    workspace_id := w.id; encerrado_em := w.contrato_encerrado_em; linhas_apagadas := total;
    return next;
  end loop;
end;
$$;

-- ─── 3. Registros com mais de 12 meses ───────────────────────────────────────
create or replace function public.lgpd_expurgar_registros(simular boolean default true)
returns table (tabela text, linhas bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  corte timestamptz := now() - interval '12 months';
  n bigint;
begin
  if simular then
    tabela := 'audit_log';    select count(*) into linhas from public.audit_log    where created_at < corte; return next;
    tabela := 'acessos';      select count(*) into linhas from public.acessos      where criado_em  < corte; return next;
    tabela := 'usage_events'; select count(*) into linhas from public.usage_events where created_at < corte; return next;
    return;
  end if;

  delete from public.audit_log    where created_at < corte; get diagnostics n = row_count; tabela := 'audit_log';    linhas := n; return next;
  delete from public.acessos      where criado_em  < corte; get diagnostics n = row_count; tabela := 'acessos';      linhas := n; return next;
  delete from public.usage_events where created_at < corte; get diagnostics n = row_count; tabela := 'usage_events'; linhas := n; return next;
end;
$$;

-- Só o banco (e o agendador) chamam estas funções; ninguém pelo site.
revoke all on function public.lgpd_expurgar_escolas(boolean)   from public, anon, authenticated;
revoke all on function public.lgpd_expurgar_registros(boolean) from public, anon, authenticated;

-- A função antiga apontava para uma tabela que não existe (audit_logs) e usava 90 dias.
drop function if exists public.fn_rotate_audit_logs(integer);

-- ─── 4. Agendamento diário (pg_cron, gratuito no Supabase) ───────────────────
create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname in ('lgpd-expurgo-escolas', 'lgpd-expurgo-registros');
select cron.schedule('lgpd-expurgo-escolas',   '15 6 * * *', $$select public.lgpd_expurgar_escolas(false)$$);   -- 03h15 em Brasília
select cron.schedule('lgpd-expurgo-registros', '30 6 * * *', $$select public.lgpd_expurgar_registros(false)$$); -- 03h30 em Brasília
