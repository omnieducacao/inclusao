-- Onda 94 · SCRUM-247: registro do que as rotinas de expurgo apagaram, para o relatório mensal.
-- Uma função só (lgpd_rodar_rotinas) roda as duas rotinas e anota quantas linhas cada uma apagou.
-- Relatório do mês:  select * from public.lgpd_relatorio_mensal();

create table if not exists public.lgpd_expurgos (
  id bigserial primary key,
  rodado_em timestamptz not null default now(),
  rotina text not null,
  item text not null,
  linhas bigint not null
);
alter table public.lgpd_expurgos enable row level security;   -- sem política: só o banco lê e grava
comment on table public.lgpd_expurgos is 'Quantas linhas cada rotina LGPD apagou, por dia (SCRUM-247). Sem dado pessoal.';

create or replace function public.lgpd_rodar_rotinas()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.lgpd_expurgos (rotina, item, linhas)
    select 'escolas', 'escola ' || left(e.workspace_id::text, 8), e.linhas_apagadas
      from public.lgpd_expurgar_escolas(false) e;
  insert into public.lgpd_expurgos (rotina, item, linhas)
    select 'registros', r.tabela, r.linhas
      from public.lgpd_expurgar_registros(false) r
     where r.linhas > 0;
end;
$$;

create or replace function public.lgpd_relatorio_mensal(mes date default date_trunc('month', now())::date)
returns table (rotina text, item text, dias_com_expurgo bigint, linhas bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select rotina, item, count(distinct rodado_em::date), sum(linhas)
    from public.lgpd_expurgos
   where rodado_em >= mes and rodado_em < (mes + interval '1 month')
   group by 1, 2
   order by 1, 2;
$$;

revoke all on function public.lgpd_rodar_rotinas()          from public, anon, authenticated;
revoke all on function public.lgpd_relatorio_mensal(date)   from public, anon, authenticated;

-- Os dois agendamentos viram um só, que roda tudo e anota.
select cron.unschedule(jobid) from cron.job
 where jobname in ('lgpd-expurgo-escolas', 'lgpd-expurgo-registros', 'lgpd-rotinas');
select cron.schedule('lgpd-rotinas', '15 6 * * *', $$select public.lgpd_rodar_rotinas()$$);  -- 03h15 em Brasília
