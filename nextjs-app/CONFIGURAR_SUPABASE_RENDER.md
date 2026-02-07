# Configurar Supabase no Render

## Passo 1: Obter as Credenciais do Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Você precisará de:
   - **Project URL** (ex: `https://aaywrrpxciqbogjgifzy.supabase.co`)
   - **service_role key** (chave secreta, não a anon key)

⚠️ **IMPORTANTE**: Use a **service_role key**, não a **anon key**. A service_role key tem permissões administrativas necessárias para o backend.

## Passo 2: Configurar Variáveis de Ambiente no Render

1. No painel do Render, vá para seu serviço
2. Clique em **Environment**
3. Adicione as seguintes variáveis:

### Variáveis Obrigatórias:

```
NEXT_PUBLIC_SUPABASE_URL=https://aaywrrpxciqbogjgifzy.supabase.co
SUPABASE_SERVICE_KEY=sua_service_role_key_aqui
SESSION_SECRET=uma_string_aleatoria_forte_e_secreta
NODE_ENV=production
```

### Variáveis Opcionais (para funcionalidades de IA):

Se você quiser usar as funcionalidades de IA (Hub, PEI, etc), adicione também:

```
GEMINI_API_KEY=sua_chave_gemini
OPENAI_API_KEY=sua_chave_openai
ANTHROPIC_API_KEY=sua_chave_anthropic
KIMI_API_KEY=sua_chave_kimi
DEEPSEEK_API_KEY=sua_chave_deepseek
```

## Passo 3: Configurar URLs Permitidas no Supabase

1. No Dashboard do Supabase, vá em **Authentication** → **URL Configuration**
2. Adicione seu domínio do Render em **Site URL**:
   - Exemplo: `https://seu-app.onrender.com`
3. Em **Redirect URLs**, adicione:
   - `https://seu-app.onrender.com/**`
   - `https://seu-app.onrender.com/login`
   - `https://seu-app.onrender.com/*`

Isso permite que o Supabase aceite requisições do seu domínio no Render.

## Passo 4: Verificar Políticas RLS (Row Level Security)

Se você estiver usando RLS no Supabase, certifique-se de que:

1. As políticas estão configuradas corretamente
2. A `service_role` key pode bypassar RLS (ela tem permissões administrativas)
3. Teste as operações principais (login, criar estudante, etc)

## Passo 5: Testar a Conexão

Após configurar tudo:

1. Faça o deploy no Render
2. Acesse seu app
3. Tente fazer login
4. Verifique os logs do Render para erros de conexão com Supabase

## Troubleshooting

### Erro: "SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios"
- Verifique se as variáveis estão configuradas no Render
- Certifique-se de que não há espaços extras nos valores
- Reinicie o serviço no Render após adicionar variáveis

### Erro de CORS ou "Origin not allowed"
- Adicione o domínio do Render nas URLs permitidas do Supabase (Passo 3)

### Erro de autenticação
- Verifique se está usando a **service_role key**, não a anon key
- Confirme que a key está correta e não expirou

### Erro de conexão
- Verifique se a URL do Supabase está correta
- Confirme que o projeto Supabase está ativo
- Verifique os logs do Supabase para ver se há requisições bloqueadas

## Exemplo de Configuração Completa no Render

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_service_role_key_aqui
SESSION_SECRET=uma_string_aleatoria_forte_e_secreta
NODE_ENV=production
```

⚠️ **NUNCA** commite essas chaves no Git! Elas devem estar apenas nas variáveis de ambiente do Render.
