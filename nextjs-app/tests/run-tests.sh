#!/bin/bash
# Script simples para executar todos os testes
# Equivalente ao run_simple.py do Streamlit

echo "🧪 Omnisfera - Testes Next.js"
echo "=================================="
echo ""

# Verifica se vitest está instalado
if ! command -v npx &> /dev/null; then
    echo "❌ npm/npx não encontrado. Instale Node.js primeiro."
    exit 1
fi

# Executa testes
echo "Executando testes..."
echo ""

npx vitest run

EXIT_CODE=$?

echo ""
echo "=================================="
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Todos os testes passaram!"
else
    echo "❌ Alguns testes falharam."
fi

exit $EXIT_CODE
