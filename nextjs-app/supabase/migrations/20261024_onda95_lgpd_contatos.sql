-- Onda 95 · SCRUM-250: prazo de guarda de leads e certificados (decisão do Rodrigo, 24/10: 24 meses).
--   leads: apagados 24 meses depois da última conversa (updated_at, ou created_at se nunca mudou).
--   certificados: apagados 24 meses depois da emissão; até lá, a 2ª via e a validação pelo código funcionam.
-- Entra na rotina diária que já existe (lgpd_rodar_rotinas) e no relatório mensal.
-- Para testar à mão:  select * from public.lgpd_expurgar_contatos(true);

create or replace function public.lgpd_expurgar_contatos(simular boolean default true)
returns table (tabela text, linhas bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  corte timestamptz := now() - interval '24 months';
  n bigint;
begin
  if simular then
    tabela := 'certificados'; select count(*) into linhas from public.certificados where emitido_em < corte; return next;
    tabela := 'leads';        select count(*) into linhas from public.leads where coalesce(updated_at, created_at) < corte; return next;
    return;
  end if;

  delete from public.certificados where emitido_em < corte;
  get diagnostics n = row_count; tabela := 'certificados'; linhas := n; return next;
  delete from public.leads where coalesce(updated_at, created_at) < corte;
  get diagnostics n = row_count; tabela := 'leads'; linhas := n; return next;
end;
$$;

revoke all on function public.lgpd_expurgar_contatos(boolean) from public, anon, authenticated;

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
  insert into public.lgpd_expurgos (rotina, item, linhas)
    select 'contatos', c.tabela, c.linhas
      from public.lgpd_expurgar_contatos(false) c
     where c.linhas > 0;
end;
$$;

revoke all on function public.lgpd_rodar_rotinas() from public, anon, authenticated;
