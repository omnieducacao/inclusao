#!/bin/bash
cd "$(dirname "$0")"
pkill -f "next dev" 2>/dev/null
lsof -ti:4000 | xargs kill -9 2>/dev/null
sleep 2
export HOSTNAME=127.0.0.1
export NODE_OPTIONS="--no-warnings"
export NEXT_TELEMETRY_DISABLED=1
# Força o uso de localhost e evita detecção de rede
npm run dev
