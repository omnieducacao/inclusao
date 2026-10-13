-- Onda 25 (13/10/2026): prova em papel da avaliação diagnóstica e processual.
-- Uma prova por estudante e componente: itens gerados (e revisados), adaptações de impressão
-- e as respostas corrigidas (grade, foto da folha, rubrica ou IA). Só o servidor lê e grava.
create table if not exists public.avaliacao_provas (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  student_id uuid not null,
  tipo text not null check (tipo in ('diagnostica', 'processual')),
  disciplina text not null,
  ano_referencia text,
  codigo_curto text not null,
  descritores jsonb not null default '[]'::jsonb,
  itens jsonb not null default '[]'::jsonb,
  adaptacoes jsonb not null default '{}'::jsonb,
  respostas jsonb not null default '{}'::jsonb,
  criada_por uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists avaliacao_provas_estudante_idx
  on public.avaliacao_provas (workspace_id, student_id, disciplina, tipo, updated_at desc);

alter table public.avaliacao_provas enable row level security;
