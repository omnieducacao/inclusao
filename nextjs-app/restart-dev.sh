#!/bin/bash

# Script para limpar cache e reiniciar o servidor de desenvolvimento

echo "🔄 Limpando cache do Next.js..."

# Matar processos na porta 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Limpar cache do Next.js
rm -rf .next
rm -rf node_modules/.cache

echo "✅ Cache limpo!"
echo "🚀 Iniciando servidor de desenvolvimento..."

# Iniciar servidor
npm run dev
