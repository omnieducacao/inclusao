# Supabase Compartilhado entre Branches

## ✅ Resposta Rápida

**SIM, ambas as branches podem usar o MESMO projeto Supabase!**

Você **NÃO precisa** criar um projeto Supabase separado. O mesmo banco de dados pode ser usado por ambas as versões.

## Como Funciona

### Mesmo Projeto Supabase, Configurações Diferentes

```
┌─────────────────────────────────────┐
│   Projeto Supabase (ÚNICO)         │
│   https://aaywrrpxciqbogjgifzy...  │
└─────────────────────────────────────┘
           │                    │
           │                    │
    ┌──────┴──────┐      ┌──────┴──────┐
    │            │      │              │
    │ omnisfera.net    │ nextjs-      │
    │ (Streamlit)      │ migration    │
    │                  │ (Next.js)    │
    │                  │              │
    │ Streamlit Cloud  │ Render       │
    │ Secrets:          │ Env Vars:    │
    │ - SUPABASE_URL   │ - NEXT_PUBLIC_│
    │ - SUPABASE_KEY   │   SUPABASE_URL│
    │                  │ - SUPABASE_  │
    │                  │   SERVICE_KEY│
    └──────────────────┘ └──────────────┘
```

## Configuração por Branch

### Branch `omnisfera.net` (Streamlit - Produção)

**Onde configura:**
- Streamlit Cloud → Settings → Secrets

**Variáveis necessárias:**
```toml
SUPABASE_URL=https://aaywrrpxciqbogjgifzy.supabase.co
SUPABASE_KEY=sua_service_role_key
```

**Como usa:**
- `supabase_client.py` lê essas variáveis
- Conecta ao mesmo banco Supabase

### Branch `nextjs-migration` (Next.js - Desenvolvimento)

**Onde configura:**
- Render → Environment Variables
- Ou localmente em `.env.local`

**Variáveis necessárias:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://aaywrrpxciqbogjgifzy.supabase.co
SUPABASE_SERVICE_KEY=sua_service_role_key
```

**Como usa:**
- `lib/supabase.ts` lê essas variáveis
- Conecta ao **MESMO** banco Supabase

## Vantagens de Usar o Mesmo Supabase

✅ **Dados compartilhados** - Ambas versões veem os mesmos dados
✅ **Migrations únicas** - `supabase/migrations/` funciona para ambas
✅ **Testes fáceis** - Pode testar Next.js com dados reais
✅ **Migração suave** - Transição gradual sem perder dados
✅ **Economia** - Um único projeto Supabase

## Estrutura de Pastas Compartilhada

```
inclusao/
├── supabase/              # ← COMPARTILHADO entre branches
│   ├── migrations/        # SQL migrations (mesmas para ambas)
│   └── verificar_instalacao.sql
│
├── Branch omnisfera.net
│   ├── supabase_client.py # Usa SUPABASE_URL e SUPABASE_KEY
│   └── streamlit_app.py
│
└── Branch nextjs-migration
    ├── nextjs-app/
    │   └── lib/
    │       └── supabase.ts # Usa NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_KEY
    └── supabase/           # ← MESMA PASTA (compartilhada)
```

## URLs Permitidas no Supabase

No Dashboard do Supabase, configure **ambos os domínios**:

**Authentication → URL Configuration:**

```
Site URL: https://omnisfera.streamlit.app (ou seu domínio Streamlit)

Redirect URLs:
- https://omnisfera.streamlit.app/**
- https://seu-app.onrender.com/**
- https://seu-app.onrender.com/login
- https://seu-app.onrender.com/*
```

Isso permite que ambas as versões façam autenticação.

## Migrations SQL

As migrations em `supabase/migrations/` são **compartilhadas**:

- ✅ Aplique na branch `omnisfera.net` → afeta o Supabase
- ✅ Aplique na branch `nextjs-migration` → afeta o **MESMO** Supabase
- ⚠️ Cuidado: mudanças em uma branch afetam a outra!

**Recomendação:**
- Aplique migrations apenas quando necessário
- Teste em desenvolvimento primeiro
- Documente mudanças no Supabase

## Exemplo Prático

### Cenário: Adicionar nova tabela

1. **Criar migration** em `supabase/migrations/00014_nova_tabela.sql`
2. **Aplicar no Supabase** (via Dashboard ou CLI)
3. **Ambas branches** podem usar a nova tabela:
   - `omnisfera.net` → `supabase_client.py` → nova tabela
   - `nextjs-migration` → `lib/supabase.ts` → mesma tabela

### Cenário: Testar Next.js com dados reais

1. **Deploy Next.js** no Render (branch `nextjs-migration`)
2. **Configurar** variáveis de ambiente com mesmo Supabase
3. **Acessar** → vê os mesmos dados da versão Streamlit
4. **Testar** funcionalidades sem afetar produção

## Quando Criar Supabase Separado?

Você só precisaria de um projeto Supabase separado se:

❌ Quiser **dados completamente isolados** (dev vs prod)
❌ Quiser **testar migrations** sem afetar produção
❌ Tiver **orçamento** para múltiplos projetos
❌ Quiser **segurança extra** (ambientes separados)

**Para seu caso atual:** Use o mesmo Supabase! ✅

## Checklist de Configuração

### No Supabase Dashboard:
- [ ] Verificar que o projeto está ativo
- [ ] Anotar Project URL
- [ ] Anotar Service Role Key
- [ ] Configurar URLs permitidas (ambos domínios)

### No Streamlit Cloud (omnisfera.net):
- [ ] Adicionar `SUPABASE_URL` nos Secrets
- [ ] Adicionar `SUPABASE_KEY` nos Secrets
- [ ] Testar conexão

### No Render (nextjs-migration):
- [ ] Adicionar `NEXT_PUBLIC_SUPABASE_URL` nas Env Vars
- [ ] Adicionar `SUPABASE_SERVICE_KEY` nas Env Vars
- [ ] Testar conexão

## Conclusão

✅ **Use o mesmo projeto Supabase para ambas as branches**
✅ **Configure apenas as variáveis de ambiente diferentes**
✅ **Mantenha `supabase/migrations/` sincronizado**
✅ **Configure URLs permitidas para ambos os domínios**

Não precisa separar ou criar projetos diferentes! 🎯
