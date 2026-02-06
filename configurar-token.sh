#!/bin/bash
# Script para configurar token no remote do Git

echo "🔑 Configuração de Token para Push no GitHub"
echo "=============================================="
echo ""
echo "Este script vai configurar seu remote do Git para usar um Personal Access Token."
echo ""
echo "📝 Se você ainda não criou o token:"
echo "   1. Acesse: https://github.com/settings/tokens"
echo "   2. Clique em 'Generate new token (classic)'"
echo "   3. Marque 'repo'"
echo "   4. Gere e copie o token"
echo ""
echo "⚠️  O token será usado no URL do remote (visível no git config)"
echo "    Isso é seguro se você for o único usuário do computador."
echo ""
read -p "Pressione Enter para continuar ou Ctrl+C para cancelar..."

echo ""
read -p "Cole seu Personal Access Token aqui: " token

if [ -z "$token" ]; then
  echo "❌ Token vazio. Cancelado."
  exit 1
fi

# Remover espaços e quebras de linha
token=$(echo "$token" | tr -d '[:space:]')

# Validar formato básico (deve começar com ghp_)
if [[ ! "$token" =~ ^ghp_ ]]; then
  echo "⚠️  Aviso: O token não parece estar no formato correto (deve começar com 'ghp_')"
  read -p "Continuar mesmo assim? (s/n): " continuar
  if [ "$continuar" != "s" ]; then
    echo "Cancelado."
    exit 1
  fi
fi

echo ""
echo "🔧 Configurando remote..."

# Configurar remote com token
git remote set-url origin https://${token}@github.com/amorimqueiroz-boop/inclusao.git

echo "✅ Remote configurado!"
echo ""
echo "📊 Verificando configuração:"
git remote -v | head -1

echo ""
echo "🚀 Tentando fazer push..."
echo ""

# Fazer push
git push origin nextjs-migration

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Push realizado com sucesso!"
  echo ""
  echo "💡 Dica: O token está salvo no remote. Para ver:"
  echo "   git remote -v"
  echo ""
  echo "   Para remover o token do URL (se necessário):"
  echo "   git remote set-url origin https://github.com/amorimqueiroz-boop/inclusao.git"
else
  echo ""
  echo "❌ Erro ao fazer push. Verifique:"
  echo "   - O token está correto?"
  echo "   - O token tem permissão 'repo'?"
  echo "   - Você tem acesso ao repositório?"
fi
