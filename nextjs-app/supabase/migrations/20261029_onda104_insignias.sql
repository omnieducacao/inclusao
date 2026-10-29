-- Frente 6 · onda 104: Insígnias do Encontro, os três anéis da semana e a cor de cada missão.
-- Decisões do Rodrigo em 29/10/2026 (doc "App da família: decisões que valem"):
--   * 30 insígnias: seis famílias (uma por cor do símbolo) com Semente (1 missão), Broto (5),
--     Flor (15) e um Momento entregue por quem cuida, mais seis especiais;
--   * três anéis por semana, de segunda a domingo: Fazer (etapas), Sentir (calma ou "como foi
--     o dia") e Junto (missão confirmada por um adulto ou pela escola); a família escolhe a meta;
--   * só se ganha, nada se perde; sem ranking; nada ligado a remédio ou a tempo de tela.
-- Aplicar só com o OK do Rodrigo. Idempotente: pode rodar de novo sem duplicar nada.

-- ---------- a cor (família de insígnia) de cada missão ----------
alter table public.app_missoes
  add column if not exists dominio text
  check (dominio in ('comunicacao', 'autonomia', 'aprender', 'convivencia', 'calma', 'cuidar'));

-- ---------- o catálogo ganha família, nível e ordem na coleção ----------
alter table public.conquistas_catalogo add column if not exists dominio text;
alter table public.conquistas_catalogo add column if not exists nivel text
  check (nivel in ('semente', 'broto', 'flor', 'momento', 'especial'));
alter table public.conquistas_catalogo add column if not exists ordem smallint;

-- "5 na semana" sai: a semana agora são os anéis (Semana do Encontro).
update public.conquistas_catalogo set ativa = false where codigo = 'cinco-na-semana';

insert into public.conquistas_catalogo (codigo, nome, descricao, figura, tipo, regra, dominio, nivel, ordem) values
  -- Comunicação (azul)
  ('comunicacao-semente', 'Primeira palavra', 'A primeira missão de comunicação.', 'comunicacao', 'automatica', '{"dominio": "comunicacao", "missoes": 1}', 'comunicacao', 'semente', 1),
  ('comunicacao-broto', 'Conversa boa', 'Cinco missões de comunicação.', 'comunicacao', 'automatica', '{"dominio": "comunicacao", "missoes": 5}', 'comunicacao', 'broto', 2),
  ('comunicacao-flor', 'Voz que chega', 'Quinze missões de comunicação.', 'comunicacao', 'automatica', '{"dominio": "comunicacao", "missoes": 15}', 'comunicacao', 'flor', 3),
  ('comunicacao-momento', 'Pedi ajuda', 'Pediu ajuda com palavras ou com o jeito dele. Entregue por quem viu.', 'comunicacao', 'concedida', '{"dominio": "comunicacao"}', 'comunicacao', 'momento', 4),
  -- Autonomia (verde)
  ('autonomia-semente', 'Primeiro passo', 'A primeira missão de autonomia.', 'autonomia', 'automatica', '{"dominio": "autonomia", "missoes": 1}', 'autonomia', 'semente', 5),
  ('autonomia-broto', 'Eu consigo', 'Cinco missões de autonomia.', 'autonomia', 'automatica', '{"dominio": "autonomia", "missoes": 5}', 'autonomia', 'broto', 6),
  ('autonomia-flor', 'Do meu jeito', 'Quinze missões de autonomia.', 'autonomia', 'automatica', '{"dominio": "autonomia", "missoes": 15}', 'autonomia', 'flor', 7),
  ('autonomia-momento', 'Fiz sozinho', 'Fez algo sozinho pela primeira vez. Entregue por quem viu.', 'autonomia', 'concedida', '{"dominio": "autonomia"}', 'autonomia', 'momento', 8),
  -- Aprender (amarelo)
  ('aprender-semente', 'Olhos curiosos', 'A primeira missão de aprender.', 'aprender', 'automatica', '{"dominio": "aprender", "missoes": 1}', 'aprender', 'semente', 9),
  ('aprender-broto', 'Pergunta boa', 'Cinco missões de aprender.', 'aprender', 'automatica', '{"dominio": "aprender", "missoes": 5}', 'aprender', 'broto', 10),
  ('aprender-flor', 'Mente acesa', 'Quinze missões de aprender.', 'aprender', 'automatica', '{"dominio": "aprender", "missoes": 15}', 'aprender', 'flor', 11),
  ('aprender-momento', 'Aprendi algo novo', 'Mostrou que aprendeu algo novo. Entregue por quem viu.', 'aprender', 'concedida', '{"dominio": "aprender"}', 'aprender', 'momento', 12),
  -- Convivência (laranja)
  ('convivencia-semente', 'Oi, amigo', 'A primeira missão de convivência.', 'convivencia', 'automatica', '{"dominio": "convivencia", "missoes": 1}', 'convivencia', 'semente', 13),
  ('convivencia-broto', 'Na minha vez', 'Cinco missões de convivência.', 'convivencia', 'automatica', '{"dominio": "convivencia", "missoes": 5}', 'convivencia', 'broto', 14),
  ('convivencia-flor', 'Roda de amigos', 'Quinze missões de convivência.', 'convivencia', 'automatica', '{"dominio": "convivencia", "missoes": 15}', 'convivencia', 'flor', 15),
  ('convivencia-momento', 'Ajudei alguém', 'Ajudou alguém. Entregue por quem viu.', 'convivencia', 'concedida', '{"dominio": "convivencia"}', 'convivencia', 'momento', 16),
  -- Calma (roxo)
  ('calma-semente', 'Respirei', 'A primeira missão de calma.', 'calma', 'automatica', '{"dominio": "calma", "missoes": 1}', 'calma', 'semente', 17),
  ('calma-broto', 'Voltei pro centro', 'Cinco missões de calma.', 'calma', 'automatica', '{"dominio": "calma", "missoes": 5}', 'calma', 'broto', 18),
  ('calma-flor', 'Mar tranquilo', 'Quinze missões de calma.', 'calma', 'automatica', '{"dominio": "calma", "missoes": 15}', 'calma', 'flor', 19),
  ('calma-momento', 'Me acalmei sozinho', 'Encontrou a própria calma. Entregue por quem viu.', 'calma', 'concedida', '{"dominio": "calma"}', 'calma', 'momento', 20),
  -- Cuidar de si (vermelho). Remédio nunca conta.
  ('cuidar-semente', 'Noite boa', 'A primeira missão de cuidar de si.', 'cuidar', 'automatica', '{"dominio": "cuidar", "missoes": 1}', 'cuidar', 'semente', 21),
  ('cuidar-broto', 'Prato colorido', 'Cinco missões de cuidar de si.', 'cuidar', 'automatica', '{"dominio": "cuidar", "missoes": 5}', 'cuidar', 'broto', 22),
  ('cuidar-flor', 'Rotina em flor', 'Quinze missões de cuidar de si.', 'cuidar', 'automatica', '{"dominio": "cuidar", "missoes": 15}', 'cuidar', 'flor', 23),
  ('cuidar-momento', 'Cuidei de mim', 'Cuidou de si por conta própria. Entregue por quem viu.', 'cuidar', 'concedida', '{"dominio": "cuidar"}', 'cuidar', 'momento', 24),
  -- Especiais
  ('semana-do-encontro', 'Semana do Encontro', 'Fechou os três anéis numa semana.', 'semana', 'automatica', '{"aneis_fechados": true}', null, 'especial', 26),
  ('encontro-completo', 'Encontro completo', 'Acendeu as seis cores.', 'encontro', 'automatica', '{"seis_cores": true}', null, 'especial', 27),
  ('mao-dada', 'Mão dada', 'Uma missão do plano da escola, confirmada pela escola.', 'mao', 'automatica', '{"pei_confirmada": 1}', null, 'especial', 28)
on conflict (codigo) do update set
  nome = excluded.nome, descricao = excluded.descricao, figura = excluded.figura, tipo = excluded.tipo,
  regra = excluded.regra, dominio = excluded.dominio, nivel = excluded.nivel, ordem = excluded.ordem, ativa = true;

-- As três que já existiam entram na coleção (o nome não muda).
update public.conquistas_catalogo set nivel = 'especial', ordem = 25 where codigo = 'primeira-missao';
update public.conquistas_catalogo set nivel = 'especial', ordem = 29 where codigo = 'trilha-completa';
update public.conquistas_catalogo set nivel = 'especial', ordem = 30 where codigo = 'dez-dias-sentindo';

-- A mesma insígnia do catálogo não se ganha duas vezes (o Momento, sim: cada vez é uma história).
create unique index if not exists uq_conquistas_crianca_catalogo
  on public.conquistas(crianca_id, catalogo_id)
  where catalogo_id is not null and frase is null;

-- ---------- a meta de cada anel (a família escolhe, pequena, e pode mudar) ----------
create table if not exists public.app_aneis_metas (
  crianca_id uuid primary key references public.criancas(id) on delete cascade,
  fazer smallint not null default 5 check (fazer between 1 and 50),
  sentir smallint not null default 3 check (sentir between 1 and 21),
  junto smallint not null default 2 check (junto between 1 and 14),
  atualizada_por uuid references public.pessoas(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.app_aneis_metas enable row level security;

-- Semana do Encontro se ganha uma vez por semana fechada: guardamos quais semanas fecharam.
create table if not exists public.app_semanas_fechadas (
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  semana date not null,                  -- a segunda-feira da semana
  created_at timestamptz not null default now(),
  primary key (crianca_id, semana)
);
alter table public.app_semanas_fechadas enable row level security;
