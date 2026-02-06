#!/bin/bash
# Script para resolver problema de push no GitHub

echo "🔧 Solução para Push no GitHub"
echo "================================"
echo ""
echo "Você tem 11 commits prontos para push:"
echo "  - f471715e Completo"
echo "  - 8a14a96d ajustes"
echo "  - ... (e mais 9 commits)"
echo ""
echo "Erro atual: Git não consegue solicitar credenciais"
echo ""
echo "Escolha uma opção:"
echo ""
echo "1) Usar SSH (recomendado - mais seguro)"
echo "2) Usar Token no URL (mais rápido)"
echo "3) Verificar configuração atual"
echo "4) Cancelar"
echo ""
read -p "Opção (1-4): " opcao

case $opcao in
  1)
    echo ""
    echo "📝 Configurando SSH..."
    echo ""
    
    # Verificar se tem chave SSH
    if [ -f ~/.ssh/id_ed25519.pub ] || [ -f ~/.ssh/id_rsa.pub ]; then
      echo "✅ Chave SSH encontrada!"
      if [ -f ~/.ssh/id_ed25519.pub ]; then
        echo "Chave pública:"
        cat ~/.ssh/id_ed25519.pub
      else
        echo "Chave pública:"
        cat ~/.ssh/id_rsa.pub
      fi
      echo ""
      echo "📋 Copie a chave acima e adicione no GitHub:"
      echo "   https://github.com/settings/ssh/new"
      echo ""
      read -p "Pressione Enter após adicionar a chave no GitHub..."
      
      # Mudar remote para SSH
      git remote set-url origin git@github.com:amorimqueiroz-boop/inclusao.git
      echo "✅ Remote alterado para SSH"
      
      # Testar SSH
      echo "Testando conexão SSH..."
      ssh -T git@github.com 2>&1 | head -1
      
      echo ""
      echo "🚀 Tentando fazer push..."
      git push origin nextjs-migration
    else
      echo "❌ Nenhuma chave SSH encontrada."
      echo ""
      echo "Deseja criar uma chave SSH agora? (s/n)"
      read -p "> " criar
      if [ "$criar" = "s" ]; then
        read -p "Email do GitHub: " email
        ssh-keygen -t ed25519 -C "$email" -f ~/.ssh/id_ed25519 -N ""
        echo ""
        echo "✅ Chave criada! Adicione no GitHub:"
        cat ~/.ssh/id_ed25519.pub
        echo ""
        echo "https://github.com/settings/ssh/new"
        read -p "Pressione Enter após adicionar a chave..."
        git remote set-url origin git@github.com:amorimqueiroz-boop/inclusao.git
        git push origin nextjs-migration
      fi
    fi
    ;;
    
  2)
    echo ""
    echo "📝 Configurando Token no URL..."
    echo ""
    echo "1. Crie um Personal Access Token:"
    echo "   https://github.com/settings/tokens"
    echo "   → Generate new token (classic)"
    echo "   → Marque 'repo'"
    echo "   → Copie o token gerado"
    echo ""
    read -p "Cole o token aqui: " token
    
    if [ -n "$token" ]; then
      git remote set-url origin https://${token}@github.com/amorimqueiroz-boop/inclusao.git
      echo "✅ Remote configurado com token"
      echo ""
      echo "🚀 Tentando fazer push..."
      git push origin nextjs-migration
    else
      echo "❌ Token vazio. Cancelado."
    fi
    ;;
    
  3)
    echo ""
    echo "📊 Configuração Atual:"
    echo "======================"
    echo ""
    echo "Remote URL:"
    git remote -v
    echo ""
    echo "Credential Helper:"
    git config --get credential.helper
    echo ""
    echo "Commits à frente:"
    git log --oneline origin/nextjs-migration..HEAD | wc -l
    echo ""
    echo "Status:"
    git status --short
    ;;
    
  4)
    echo "Cancelado."
    exit 0
    ;;
    
  *)
    echo "Opção inválida."
    exit 1
    ;;
esac
