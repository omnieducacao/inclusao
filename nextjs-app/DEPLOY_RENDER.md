# Deploy no Render

## Configuração para Render

### 1. Variáveis de Ambiente no Render

Configure estas variáveis no painel do Render:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_KEY=sua_service_key
SESSION_SECRET=uma_string_aleatoria_forte
NODE_ENV=production
```

### 2. Root Directory (Opcional)

Se seu repositório tem a estrutura `inclusao/nextjs-app/`, você pode definir:

```
nextjs-app
```

Isso faz o Render executar os comandos a partir do diretório `nextjs-app/`.

**Se não definir Root Directory**, certifique-se de que os comandos abaixo estão no contexto correto (raiz do repositório).

### 3. Build Command

**Se você definiu Root Directory como `nextjs-app`:**

```
npm install && npm run build
```

**Se NÃO definiu Root Directory (comandos na raiz):**

```
cd nextjs-app && npm install && npm run build
```

### 4. Start Command ⚠️ IMPORTANTE

**Se você definiu Root Directory como `nextjs-app`:**

```
npm start
```

**Se NÃO definiu Root Directory (comandos na raiz):**

```
cd nextjs-app && npm start
```

**⚠️ NÃO use `yarn start`** - o projeto usa `npm`, não `yarn`.

**⚠️ NÃO use `pip install`** - isso é para Python. O projeto é Next.js/Node.js.

O Next.js detecta automaticamente a variável de ambiente `PORT` que o Render fornece. Não é necessário especificar a porta manualmente.

### 5. Port

O Render define automaticamente a porta via variável de ambiente `PORT`. O Next.js detecta isso automaticamente - não precisa configurar nada.

### 6. Arquivos CSV de BNCC

**IMPORTANTE**: Os arquivos CSV precisam estar no repositório Git para funcionar no Render:

- `nextjs-app/data/bncc.csv`
- `nextjs-app/data/bncc_ei.csv`
- `nextjs-app/data/bncc_em.csv`

Certifique-se de que esses arquivos estão commitados no Git.

### 7. Estrutura de Diretórios

O Render precisa ter acesso aos arquivos `data/`. Certifique-se de que o diretório `data/` está dentro de `nextjs-app/` e commitado no Git.

## Resumo Rápido

**Configuração Recomendada:**

- **Root Directory:** `nextjs-app` (recomendado)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

**Ou sem Root Directory:**

- **Root Directory:** (deixe vazio)
- **Build Command:** `cd nextjs-app && npm install && npm run build`
- **Start Command:** `cd nextjs-app && npm start`

## Vantagens do Render para Testes

✅ Ambiente limpo sem cache local
✅ Testa em ambiente de produção
✅ Fácil de compartilhar com outros
✅ Logs centralizados
✅ Deploy automático via Git

## Alternativas Locais

Se quiser testar localmente primeiro:

1. **Limpar cache do navegador completamente**:
   - Chrome: Settings > Privacy > Clear browsing data > Cached images and files
   - Ou use modo anônimo/privado

2. **Verificar logs do servidor**:
   - Os logs agora mostram quantas linhas foram carregadas dos CSVs
   - Procure por mensagens como "BNCC EF: Carregadas X linhas"

3. **Testar em outro navegador**:
   - Firefox, Safari, ou Edge para garantir que não é cache do Chrome

4. **Verificar se o servidor recompilou**:
   - Olhe o terminal onde `npm run dev` está rodando
   - Deve mostrar "Compiled successfully" após mudanças
