-- Onda 84 · SCRUM-230: search_path fixo nas 11 funções apontadas pelo advisor do Supabase
-- (function_search_path_mutable). Já aplicada no banco em 23/10/2026, com o OK do Rodrigo.
-- Nenhuma delas usa extensão, então "public, pg_temp" mantém o comportamento de antes e impede que
-- um objeto com o mesmo nome em outro schema seja usado no lugar (importa nas security definer).
-- Modelo de RLS mantido: ativo em todas as tabelas, sem política, acesso só pelo servidor.
alter function public.diario_excluir_registro(uuid, uuid, text) set search_path = public, pg_temp;
alter function public.diario_salvar_registro(uuid, uuid, jsonb) set search_path = public, pg_temp;
alter function public.fn_rotate_audit_logs(integer) set search_path = public, pg_temp;
alter function public.generate_pin() set search_path = public, pg_temp;
alter function public.generate_workspace_pin() set search_path = public, pg_temp;
alter function public.set_updated_at() set search_path = public, pg_temp;
alter function public.update_aval_proc_timestamp() set search_path = public, pg_temp;
alter function public.update_omnisfera_feed_updated_at() set search_path = public, pg_temp;
alter function public.update_student_paee_only(uuid, uuid, jsonb, uuid, text) set search_path = public, pg_temp;
alter function public.update_student_pei_only(uuid, uuid, jsonb) set search_path = public, pg_temp;
alter function public.workspace_from_pin(text) set search_path = public, pg_temp;
