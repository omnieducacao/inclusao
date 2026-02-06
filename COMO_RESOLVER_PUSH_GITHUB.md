# 🔧 Como Resolver Erro de Push no GitHub

## ❌ Erro Atual

```
fatal: could not read Username for 'https://github.com': Device not configured
```

**Diagnóstico**:
- ✅ Remote configurado: `https://github.com/amorimqueiroz-boop/inclusao.git`
- ✅ Credential helper: `osxkeychain` (configurado)
- ❌ **Problema**: Git não consegue solicitar credenciais interativamente

---

## ✅ SOLUÇÃO RÁPIDA (Escolha uma)

### **Opção 1: Usar Token no URL (Mais Rápido)**

```bash
cd "/Users/rodrigoamorim/omnisfera supabase streamlit/inclusao"

# 1. Criar Personal Access Token no GitHub:
#    https://github.com/settings/tokens
#    → Generate new token (classic)
#    → Marcar "repo"
#    → Copiar o token gerado

# 2. Substituir SEU_TOKEN pelo token gerado
git remote set-url origin https://SEU_TOKEN@github.com/amorimqueiroz-boop/inclusao.git

# 3. Fazer push
git push origin nextjs-migration
```

---

### **Opção 2: Usar SSH (Mais Seguro)**

```bash
cd "/Users/rodrigoamorim/omnisfera supabase streamlit/inclusao"

# 1. Verificar se tem chave SSH
ls -la ~/.ssh/id_*.pub

# 2. Se não tiver, criar chave SSH
ssh-keygen -t ed25519 -C "seu_email@exemplo.com"

# 3. Adicionar chave ao GitHub:
#    - Copiar conteúdo: cat ~/.ssh/id_ed25519.pub
#    - GitHub → Settings → SSH and GPG keys → New SSH key
#    - Colar a chave pública

# 4. Mudar remote para SSH
git remote set-url origin git@github.com:amorimqueiroz-boop/inclusao.git

# 5. Testar SSH
ssh -T git@github.com

# 6. Fazer push
git push origin nextjs-migration
```

---

### **Opção 3: Usar GitHub CLI**

```bash
# 1. Instalar GitHub CLI (se não tiver)
brew install gh

# 2. Fazer login
gh auth login

# 3. Fazer push
cd "/Users/rodrigoamorim/omnisfera supabase streamlit/inclusao"
git push origin nextjs-migration
```

---

### **Opção 4: Limpar e Reconfigurar Credenciais**

```bash
cd "/Users/rodrigoamorim/omnisfera supabase streamlit/inclusao"

# 1. Limpar credenciais antigas do keychain
git credential-osxkeychain erase
host=github.com
protocol=https
# (Pressionar Enter duas vezes)

# 2. Tentar push (vai pedir credenciais)
git push origin nextjs-migration
# Usuário: seu_usuario_github
# Senha: use um Personal Access Token (não sua senha do GitHub)
```

---

## ⚠️ ATENÇÃO: Submodule Modificado

Antes de fazer push, você precisa lidar com o submodule `omniprof_repo`:

### Se quiser commitá-lo:

```bash
cd omniprof_repo
git add .
git commit -m "Atualizações"
git push
cd ..
git add omniprof_repo
git commit -m "Atualiza referência do submodule"
```

### Se quiser descartar mudanças:

```bash
cd omniprof_repo
git restore .
cd ..
```

---

## 🎯 RECOMENDAÇÃO FINAL

**Use a Opção 1 (Token no URL)** se precisar de solução rápida, ou **Opção 2 (SSH)** se quiser uma solução mais permanente e segura.

---

## 📝 Criar Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome (ex: "omnisfera-nextjs")
4. Marque a opção **`repo`** (acesso completo aos repositórios)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (você só verá uma vez!)

Depois use o token como senha quando o Git pedir credenciais, ou coloque diretamente no URL do remote.
