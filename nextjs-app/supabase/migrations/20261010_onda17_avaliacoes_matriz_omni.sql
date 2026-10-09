-- Onda 17 (10/10/2026): avaliações diagnóstica e processual com a Matriz Omni (EF) e a do ENEM (EM).
-- Os registros antigos ficam como estão e passam a ser marcados como 'legado'.

-- 1) Diagnóstica: nível 0–4 por descritor, com a matriz e o ano de referência usados
alter table public.avaliacoes_diagnosticas
  add column if not exists matriz text not null default 'legado',
  add column if not exists matriz_versao text,
  add column if not exists ano_referencia text,
  add column if not exists descritores jsonb not null default '[]'::jsonb,
  add column if not exists concluida_em timestamptz;

create index if not exists avaliacoes_diagnosticas_estudante_idx
  on public.avaliacoes_diagnosticas (workspace_id, student_id, disciplina);

-- 2) Processual: reabre os descritores da diagnóstica de origem
alter table public.avaliacao_processual
  add column if not exists matriz text not null default 'legado',
  add column if not exists matriz_versao text,
  add column if not exists diagnostica_id uuid references public.avaliacoes_diagnosticas(id) on delete set null;

-- 3) Confronto de qualidade: Matriz Omni × matriz antiga (só a administração usa)
create table if not exists public.confronto_matriz (
  codigo_omni text primary key,
  ref_legado text,
  veredito text check (veredito in ('melhor', 'igual', 'pior')),
  comentario text,
  avaliador text,
  updated_at timestamptz not null default now()
);
alter table public.confronto_matriz enable row level security;
