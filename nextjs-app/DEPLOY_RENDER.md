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

### 2. Build Command

```
npm install && npm run build
```

### 3. Start Command

```
npm start
```

### 4. Port

O Render define automaticamente a porta via `PORT`, mas você pode precisar ajustar:

No `package.json`, o script `start` já usa `next start` que detecta `PORT` automaticamente.

### 5. Arquivos CSV de BNCC

**IMPORTANTE**: Os arquivos CSV precisam estar no repositório Git para funcionar no Render:

- `data/bncc.csv`
- `data/bncc_ei.csv`
- `data/bncc_em.csv`

Certifique-se de que esses arquivos estão commitados no Git.

### 6. Estrutura de Diretórios

O Render precisa ter acesso aos arquivos `data/`. Certifique-se de que o diretório `data/` está no repositório.

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
