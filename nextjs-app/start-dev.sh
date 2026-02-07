#!/bin/bash
cd "$(dirname "$0")"

# Verifica se npm está disponível
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ Erro: npm não encontrado. Instale o Node.js primeiro."
  exit 127
fi

# Mata processos do Next.js se existirem
if command -v pkill >/dev/null 2>&1; then
  pkill -f "next dev" 2>/dev/null || true
fi

# Mata processos na porta 4000 se existirem
if command -v lsof >/dev/null 2>&1; then
  PID=$(lsof -ti:4000 2>/dev/null || true)
  if [ -n "$PID" ]; then
    kill -9 "$PID" 2>/dev/null || true
  fi
elif command -v fuser >/dev/null 2>&1; then
  fuser -k 4000/tcp 2>/dev/null || true
fi

sleep 2

export HOSTNAME=127.0.0.1
export NODE_OPTIONS="--no-warnings"
export NEXT_TELEMETRY_DISABLED=1

# Adiciona node_modules/.bin ao PATH se não estiver lá
if [ -d "node_modules/.bin" ]; then
  export PATH="$PWD/node_modules/.bin:$PATH"
fi

# Força o uso de localhost e evita detecção de rede
npm run dev
