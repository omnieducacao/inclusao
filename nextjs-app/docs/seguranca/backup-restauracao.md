# Backup e teste de restauração — Omnisfera e OmniProf

SCRUM-232 · versão de 24/10/2026.

## Situação
- Os dois bancos estão no **plano gratuito do Supabase**, que não oferece backup para baixar nem restauração para um ponto no tempo.
- O OmniProf já tem um script de cópia (`scripts/backup-banco.sh` no repositório do OmniProf). A Omnisfera passa a ter o mesmo (`scripts/backup-banco.sh` neste repositório).
- As cópias ficam no iCloud do Rodrigo, cifradas pelo próprio iCloud, guardando as 8 mais recentes. Os dados sensíveis da Omnisfera já estão cifrados pelo app dentro do banco, então a cópia também os guarda cifrados.

## Rotina
1. **Toda segunda-feira**, no ritual semanal: rodar os dois scripts.
2. **Uma vez por mês**: teste de restauração (abaixo). Anotar a data e o resultado no Jira.
3. Quando entrar o primeiro cliente pagante: avaliar o plano Pro do Supabase (backup diário automático e 7 dias de histórico).

## Teste de restauração (cerca de 15 minutos, no Mac)
Restaura a cópia num Postgres local, sem tocar no banco de produção.
```bash
brew install postgresql@17
brew services start postgresql@17
createdb teste_restauracao
pg_restore --no-owner --no-privileges -d teste_restauracao "$(ls -1t ~/Library/Mobile\ Documents/com~apple~CloudDocs/Omnisfera\ -\ Backups\ do\ banco/*.dump | head -1)"
psql teste_restauracao -c "select count(*) as estudantes from public.students;"
psql teste_restauracao -c "select count(*) as auditoria from public.audit_log;"
dropdb teste_restauracao
```
Deu certo se os números baterem com o painel do Supabase (Table Editor). Erros sobre extensões ou papéis do Supabase (`supabase_admin`, `pgsodium`) podem ser ignorados; erro em tabela do esquema `public` não.
