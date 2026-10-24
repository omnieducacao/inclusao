-- Onda 92 · SCRUM-243: "Salvar no Drive" (cópia do PEI, do PAEE e dos relatórios no Google Drive).
-- Decisão do Rodrigo de 24/10: o Supabase continua guardando tudo, cifrado; o Drive é uma cópia que a pessoa
-- salva quando quiser, com login do Google na hora (nada do Google fica guardado no servidor).
-- O administrador da escola escolhe a regra:
--   desligado  → o botão não aparece
--   dominio    → só contas Google com e-mail do domínio da escola (drive_dominio, ex.: colegioexemplo.com.br)
--   qualquer   → qualquer conta, com aviso e registro na auditoria (padrão)
alter table public.workspaces
  add column if not exists drive_salvar text not null default 'qualquer'
    check (drive_salvar in ('desligado', 'dominio', 'qualquer')),
  add column if not exists drive_dominio text;
