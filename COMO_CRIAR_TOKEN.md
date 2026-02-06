# 🔑 Como Criar Personal Access Token no GitHub

## Passo a Passo

### 1. Acesse a página de tokens
👉 **https://github.com/settings/tokens**

### 2. Clique em "Generate new token"
- Escolha **"Generate new token (classic)"** (não o fine-grained)

### 3. Configure o token
- **Note**: Dê um nome descritivo (ex: "omnisfera-nextjs-push")
- **Expiration**: Escolha um prazo (90 dias, 1 ano, ou "No expiration")
- **Scopes**: Marque apenas **`repo`** (isso dá acesso completo aos repositórios)

### 4. Gere o token
- Clique em **"Generate token"** (no final da página)
- ⚠️ **IMPORTANTE**: Copie o token imediatamente! Você só verá ele uma vez.

### 5. O token será algo assim:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ⚠️ SEGURANÇA

- **NÃO compartilhe** o token
- **NÃO commite** o token no código
- Se perder, gere um novo e revogue o antigo

---

## ✅ Próximo Passo

Depois de criar o token, execute:

```bash
cd "/Users/rodrigoamorim/omnisfera supabase streamlit/inclusao"
./configurar-token.sh
```

Ou me informe o token e eu configuro para você.
