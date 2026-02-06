# 🚀 Instruções Rápidas - Opção 1 (Token)

## Passo 1: Criar Token no GitHub

1. Acesse: **https://github.com/settings/tokens**
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome: `omnisfera-nextjs-push`
4. Marque apenas **`repo`** (acesso completo aos repositórios)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (você só verá uma vez!)

O token será algo como: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Passo 2: Configurar e Fazer Push

### Opção A: Usar Script Automático (Recomendado)

```bash
cd "/Users/rodrigoamorim/omnisfera supabase streamlit/inclusao"
./configurar-token.sh
```

O script vai pedir o token e configurar tudo automaticamente.

---

### Opção B: Configurar Manualmente

```bash
cd "/Users/rodrigoamorim/omnisfera supabase streamlit/inclusao"

# Substituir SEU_TOKEN pelo token que você copiou
git remote set-url origin https://SEU_TOKEN@github.com/amorimqueiroz-boop/inclusao.git

# Verificar se está correto
git remote -v

# Fazer push
git push origin nextjs-migration
```

---

## ⚠️ Antes do Push: Submodule

Você tem mudanças no submodule `omniprof_repo`. Escolha:

### Se quiser commitá-las:
```bash
cd omniprof_repo
git add .
git commit -m "Atualizações do submodule"
git push
cd ..
git add omniprof_repo
git commit -m "Atualiza referência do submodule"
```

### Se quiser descartá-las:
```bash
cd omniprof_repo
git restore .
cd ..
```

---

## ✅ Depois do Push

Se tudo der certo, você verá:
```
Enumerating objects: ...
Counting objects: ...
Writing objects: ...
...
To https://github.com/amorimqueiroz-boop/inclusao.git
   abc1234..f471715e  nextjs-migration -> nextjs-migration
```

---

## 🔒 Segurança

- O token ficará visível em `git remote -v` (mas só no seu computador)
- Se precisar remover o token do URL depois:
  ```bash
  git remote set-url origin https://github.com/amorimqueiroz-boop/inclusao.git
  ```
- Para usar novamente, você precisará configurar o token novamente ou usar SSH

---

**Pronto! Siga os passos acima e me avise se precisar de ajuda.**
