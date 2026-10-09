-- Onda 2 · Fluxo do estudante (09/10/2026)
--
-- O estudo de caso, a vigência e as revisões do PEI ficam dentro de students.pei_data
-- (mesmo salvamento, histórico e criptografia do PEI). Esta tabela guarda só a ciência dos
-- professores: cada um registra "Li e estou ciente" de uma versão do PEI. Fica separada porque
-- é gravada pelos professores enquanto a coordenação pode estar editando o PEI.

create table if not exists public.pei_ciencias (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  member_id uuid not null references public.workspace_members(id) on delete cascade,
  versao integer not null,
  created_at timestamptz not null default now(),
  unique (student_id, member_id, versao)
);
create index if not exists idx_pei_ciencias_estudante on public.pei_ciencias(workspace_id, student_id, versao);
create index if not exists idx_pei_ciencias_membro on public.pei_ciencias(member_id);

-- Como todo o banco desde a onda 0: RLS ligado, sem políticas; só o servidor acessa.
alter table public.pei_ciencias enable row level security;
