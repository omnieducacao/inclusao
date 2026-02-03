#!/bin/bash
# Execução massiva de testes Omnisfera
# Uso: ./run_tests.sh [--repeat N] [--pytest]

set -e
cd "$(dirname "$0")"

REPEAT=1
USE_PYTEST=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --repeat)
      REPEAT="$2"
      shift 2
      ;;
    --pytest)
      USE_PYTEST=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

echo "=============================================="
echo "  Omnisfera - Testes massivos"
echo "=============================================="
echo ""

if $USE_PYTEST && command -v pytest &> /dev/null; then
  echo "Usando pytest..."
  for i in $(seq 1 "$REPEAT"); do
    echo "--- Rodada $i de $REPEAT ---"
    pytest tests/ --tb=short -q -v 2>&1 || exit 1
  done
else
  echo "Usando run_simple.py (python3)..."
  python3 tests/run_simple.py --repeat "$REPEAT" || exit 1
fi

echo ""
echo "=============================================="
echo "  Todas as rodadas concluídas com sucesso"
echo "=============================================="
