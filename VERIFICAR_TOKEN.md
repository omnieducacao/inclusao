# ⚠️ Erro 403 - Token sem Permissão

## Problema
O push retornou erro 403 (Permission denied), o que indica que o token não tem as permissões necessárias.

## Soluções

### 1. Verificar Permissões do Token

1. Acesse: **https://github.com/settings/tokens**
2. Encontre o token que você criou
3. Verifique se ele tem a permissão **`repo`** marcada
4. Se não tiver, você precisa criar um novo token

### 2. Criar Novo Token com Permissões Corretas

1. Acesse: **https://github.com/settings/tokens**
2. Clique em **"Generate new token (classic)"**
3. **IMPORTANTE**: Marque **`repo`** (isso dá acesso completo aos repositórios)
   - Isso inclui: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
4. Gere o token e copie
5. Configure novamente:
   ```bash
   git remote set-url origin https://NOVO_TOKEN@github.com/amorimqueiroz-boop/inclusao.git
   git push origin nextjs-migration
   ```

### 3. Verificar se o Repositório é Privado

Se o repositório for privado, o token precisa ter permissão `repo` completa.

### 4. Verificar Expiração

Se o token tiver expirado, você precisa criar um novo.

---

## Teste Rápido

Você pode testar o token fazendo uma requisição simples:

```bash
curl -H "Authorization: token SEU_TOKEN_AQUI" https://api.github.com/user
```

Se retornar seus dados do GitHub, o token está válido. Se retornar erro, o token precisa ser recriado.

---

## Próximo Passo

Crie um novo token com a permissão **`repo`** marcada e me informe para eu configurar novamente.
