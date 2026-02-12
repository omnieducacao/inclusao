#!/bin/bash
cd "$(dirname "$0")"

echo "🔍 Verificando processos na porta 3000..."

# Matar processos na porta 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ Processos na porta 3000 encerrados"
else
  echo "ℹ️  Nenhum processo encontrado na porta 3000"
fi

# Aguardar um pouco para garantir que a porta foi liberada
sleep 2

echo ""
echo "🚀 Iniciando servidor Next.js na porta 3000..."
echo "📝 Acesse: http://127.0.0.1:3000"
echo ""

export HOSTNAME=127.0.0.1
export NEXT_TELEMETRY_DISABLED=1

npm run dev
