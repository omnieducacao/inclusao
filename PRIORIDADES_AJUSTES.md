# PRIORIDADES DE AJUSTES - OMNISFERA
## Código: Pré-MVP

**Data:** Fevereiro 2026  
**Status:** Ajustes de segurança em andamento

---

## NÃO MEXER (Prioridade BAIXA - logs necessários para debug)

| Arquivo | Motivo | Quantidade de Logs |
|---------|--------|-------------------|
| `app/(dashboard)/pei/PEIClient.tsx` | Fluxo crítico de carregamento de PEI, debug essencial | 30+ logs |
| `app/(dashboard)/paee/PAEEClient.tsx` | Ciclo PAEE em desenvolvimento | Verificar |
| `app/(dashboard)/hub/HubClient.tsx` | Módulo complexo com muitas funcionalidades | Verificar |

**Decisão:** Manter logs como estão por enquanto. Substituir por `logger.debug()` somente quando o módulo estiver estável.

---

## PRIORIDADE ALTA (Fazer agora)

### 1. Limpar Logs em Arquivos Estáveis ✅

| Arquivo | Status | Ação |
|---------|--------|------|
| `lib/students.ts` | ✅ CONCLUÍDO | Substituído por logger |
| `lib/bncc.ts` | 🔄 PARCIAL | Falta terminar logs de EF e EM |

**Próximo:** Terminar `lib/bncc.ts`

### 2. Implementar Zod Validation nas APIs Críticas 🔴

** APIs que precisam de validação:**

| API | Método | Prioridade | Motivo |
|-----|--------|------------|--------|
| `/api/students` | POST | 🔴 CRÍTICA | Criação de estudantes - dados sensíveis |
| `/api/pei` | POST | 🔴 CRÍTICA | Geração de PEI - custo de IA |
| `/api/pgi` | POST | 🔴 CRÍTICA | Ações do PGI |
| `/api/members` | POST | 🟠 ALTA | Criação de usuários |
| `/api/ai-engines/*/generate` | POST | 🔴 CRÍTICA | Todas as APIs de IA - controle de custo |

**Por que é importante:**
- Evita dados malformados no banco
- Previne erros 500
- Controle de custos de IA (evita gerações desnecessárias)

### 3. Configurar Sentry 🔴

| Etapa | Status | Tempo |
|-------|--------|-------|
| Instalar `@sentry/nextjs` | ⏳ PENDENTE | 5 min |
| Configurar DSN | ⏳ PENDENTE | 5 min |
| Testar captura de erros | ⏳ PENDENTE | 10 min |

### 4. Health Check Endpoint ✅

| Status | Arquivo |
|--------|---------|
| ✅ CONCLUÍDO | `app/api/health/route.ts` |

**Testar:** `curl http://localhost:3000/api/health`

---

## PRIORIDADE MÉDIA (Fazer na próxima semana)

### 5. Revisar Permissões em APIs GET

**Problema:** Algumas APIs GET verificam apenas autenticação, não permissão específica.

**Exemplo:**
```typescript
// Atual (apenas auth)
GET /api/students - verifica se está logado

// Deveria ser
GET /api/students - verifica se está logado + tem permissão can_estudantes
```

### 6. CSP Policy Completa

**Atual:** Headers básicos de segurança  
**Faltando:** Content-Security-Policy

```typescript
// Adicionar ao next.config.ts
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ..."
}
```

### 7. Testes Unitários Básicos

| Módulo | Cobertura Alvo |
|--------|----------------|
| `lib/permissions.ts` | 80% |
| `lib/rate-limit.ts` | 80% |
| `lib/validation.ts` | 60% |

---

## PRIORIDADE BAIXA (Pode esperar)

### 8. Documentação de API

- Swagger/OpenAPI
- Documentar 10 endpoints principais

### 9. Rate Limiting por Workspace

**Atual:** Rate limiting por IP  
**Necessário:** Rate limiting por workspace (controlar custos por escola)

### 10. Otimização de Queries

- Verificar N+1 queries em `lib/students.ts`
- Adicionar índices no Supabase

---

## RESUMO EXECUTIVO

### CONCLUÍDO ✅
1. Headers de segurança HTTP
2. Logger estruturado
3. Health check endpoint
4. Console.logs em `lib/students.ts`

### EM ANDAMENTO 🔄
1. Console.logs em `lib/bncc.ts` (parcial)

### PRÓXIMOS PASSOS 🔴
1. **Terminar** `lib/bncc.ts`
2. **Implementar Zod** nas 5 APIs críticas
3. **Configurar Sentry**
4. **Testar** build em produção

---

## DECISÕES TOMADAS

| Decisão | Motivo |
|---------|--------|
| Não mexer em PEIClient.tsx | Fluxo ainda em desenvolvimento, logs essenciais |
| Usar logger em vez de remover | Manter funcionalidade em dev, silenciar em prod |
| Priorizar Zod nas APIs de IA | Controle de custo é crítico |

---

*Atualizado em: Fevereiro 2026*
