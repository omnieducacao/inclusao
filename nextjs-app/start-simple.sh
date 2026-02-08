#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Iniciando servidor Next.js na porta 3000..."
echo "📝 Acesse: http://127.0.0.1:3000"
echo ""

export HOSTNAME=127.0.0.1
export NEXT_TELEMETRY_DISABLED=1

npm run dev
