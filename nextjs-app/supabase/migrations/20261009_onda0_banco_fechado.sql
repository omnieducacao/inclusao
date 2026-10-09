-- Onda 0 · banco fechado para acesso direto (09/10/2026)
--
-- Contexto: o app acessa o banco SOMENTE pelo servidor (Next.js), com a chave secreta
-- do Supabase (lib/supabase.ts), que ignora RLS. O navegador não deve ler nem gravar
-- nada direto no banco. Antes desta migração:
--   - 24 tabelas estavam sem RLS (leitura e escrita livres com a chave pública);
--   - as demais tinham políticas "USING (true)" para o papel public, o que dá o mesmo efeito
--     (inclusive em workspace_masters e platform_admins, que guardam hashes de senha);
--   - 14 funções podiam ser chamadas pela chave pública, várias com SECURITY DEFINER
--     (students_by_workspace, student_delete, update_student_pei_only...).
--
-- Esta migração:
--   1. remove todas as políticas do schema public;
--   2. liga RLS em todas as tabelas do schema public (sem políticas = ninguém acessa pela
--      chave pública; a chave secreta do servidor continua funcionando);
--   3. tira a permissão de executar funções do schema public dos papéis anon, authenticated e public;
--   4. faz o mesmo valer para tabelas e funções criadas no futuro.
--
-- Efeito colateral conhecido: o "realtime" de estudantes no navegador (hooks/useStudentRealtime.ts)
-- deixa de receber eventos; ele foi trocado por uma consulta leve ao servidor no mesmo commit.

do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;

  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;

  for r in
    select p.oid::regprocedure as fn
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', r.fn);
  end loop;
end $$;

alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
