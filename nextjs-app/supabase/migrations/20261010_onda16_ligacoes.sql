-- Onda 16 (10/10/2026): ligações entre PEI, consolidação e diário.
-- 1) A devolutiva da coordenação ganha campo próprio (antes dividia feedback_professor
--    com a observação do professor e um apagava o outro).
alter table public.pei_disciplinas
  add column if not exists devolutiva text,
  add column if not exists devolutiva_em timestamptz,
  add column if not exists devolutiva_por text,
  add column if not exists devolutiva_lida_em timestamptz;

-- Devolutivas antigas: só as que a coordenação mandou (fase voltou para pei_disciplina)
update public.pei_disciplinas
   set devolutiva = feedback_professor,
       devolutiva_em = data_devolucao
 where devolutiva is null
   and feedback_professor is not null
   and fase_status = 'pei_disciplina';

-- 2) Diário salvo registro a registro, numa operação só no banco
--    (antes a tela mandava a lista inteira e dois usuários podiam apagar o registro um do outro).
create or replace function public.diario_salvar_registro(p_workspace uuid, p_student uuid, p_registro jsonb)
returns boolean
language plpgsql
as $$
declare
  n int;
begin
  update public.students
     set daily_logs = coalesce((
           select jsonb_agg(e)
             from jsonb_array_elements(coalesce(daily_logs, '[]'::jsonb)) e
            where e->>'registro_id' is distinct from p_registro->>'registro_id'
         ), '[]'::jsonb) || jsonb_build_array(p_registro),
         updated_at = now()
   where id = p_student and workspace_id = p_workspace;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

create or replace function public.diario_excluir_registro(p_workspace uuid, p_student uuid, p_registro_id text)
returns boolean
language plpgsql
as $$
declare
  n int;
begin
  update public.students
     set daily_logs = coalesce((
           select jsonb_agg(e)
             from jsonb_array_elements(coalesce(daily_logs, '[]'::jsonb)) e
            where e->>'registro_id' is distinct from p_registro_id
         ), '[]'::jsonb),
         updated_at = now()
   where id = p_student and workspace_id = p_workspace;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

-- Só o servidor (service role) chama essas funções
revoke all on function public.diario_salvar_registro(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.diario_excluir_registro(uuid, uuid, text) from public, anon, authenticated;
