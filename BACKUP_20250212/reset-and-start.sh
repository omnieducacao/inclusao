#!/bin/bash
cd "$(dirname "$0")"

echo "🧹 Limpando processos Node.js e Next.js..."

# Matar todos os processos Node relacionados ao Next.js
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
pkill -9 -f "node.*next" 2>/dev/null

# Matar processos nas portas comuns (3000, 3001, 4000)
for port in 3000 3001 4000; do
  lsof -ti:$port | xargs kill -9 2>/dev/null
done

# Limpar cache do Next.js
echo "🗑️  Limpando cache do Next.js..."
rm -rf .next 2>/dev/null

# Aguardar para garantir que tudo foi encerrado
sleep 3

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "🚀 Iniciando servidor Next.js na porta 3000..."
echo "📝 Acesse: http://127.0.0.1:3000"
echo ""

export HOSTNAME=127.0.0.1
export NEXT_TELEMETRY_DISABLED=1

npm run dev
