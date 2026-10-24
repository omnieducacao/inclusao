#!/bin/bash
# Cópia do banco da Omnisfera (Supabase, plano gratuito não tem backup para baixar).
# Salva no iCloud e guarda as 8 cópias mais recentes.
#
# Uma vez só, no Terminal do Mac:
#   1. brew install libpq
#   2. Crie o arquivo ~/.omnisfera-banco com UMA linha (a senha nunca vai para o repositório):
#        export OMNISFERA_DB_URL='postgresql://postgres.aaywrrpxciqbogjgifzy:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
#      (copie a "Session pooler connection string" em Supabase > Project Settings > Database > Connect)
#   3. chmod 600 ~/.omnisfera-banco
# Depois, para rodar: bash ~/Projetos/Omnisfera/inclusao-workspace/inclusao-github/scripts/backup-banco.sh
set -euo pipefail

CONF="$HOME/.omnisfera-banco"
[ -f "$CONF" ] || { echo "Falta o arquivo $CONF (veja o topo deste script)."; exit 1; }
# shellcheck disable=SC1090
source "$CONF"

PGDUMP="$(command -v pg_dump || true)"
[ -n "$PGDUMP" ] || PGDUMP="/opt/homebrew/opt/libpq/bin/pg_dump"
[ -x "$PGDUMP" ] || { echo "pg_dump não encontrado. Rode: brew install libpq"; exit 1; }

DESTINO="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Omnisfera - Backups do banco"
mkdir -p "$DESTINO"
ARQUIVO="$DESTINO/omnisfera-$(date +%Y-%m-%d-%H%M).dump"

# public = dados do app; auth = contas (logins). Formato "custom": restaura com pg_restore.
"$PGDUMP" "$OMNISFERA_DB_URL" --format=custom --no-owner --no-privileges \
  --schema=public --schema=auth --file="$ARQUIVO"

echo "Cópia salva: $ARQUIVO ($(du -h "$ARQUIVO" | cut -f1))"

# Mantém só as 8 mais recentes
ls -1t "$DESTINO"/omnisfera-*.dump 2>/dev/null | tail -n +9 | while read -r velho; do rm -f "$velho"; done
