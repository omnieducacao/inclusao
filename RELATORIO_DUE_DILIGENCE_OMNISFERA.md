# Relatório Técnico de Due Diligence - Omnisfera
## Análise de Código Next.js | EdTech de Inclusão Educacional

**Data da Análise:** Fevereiro 2025  
**Versão Analisada:** Branch `nextjs-migration`  
**Tecnologia:** Next.js 16.1.6, TypeScript, React 19, Supabase  
**Total de Arquivos:** ~299 arquivos

---

## 🎯 RESUMO EXECUTIVO

A **Omnisfera** é uma plataforma Next.js para gestão de educação inclusiva, com foco em:
- **PEI** (Plano Educacional Individual)
- **PAEE** (Plano de Atendimento Educacional Especializado)
- **Ferramentas de IA assistida** para professores

### Veredito
**NÃO ESTÁ PRONTO PARA PRODUÇÃO** sem correções críticas de segurança.  
Com **3-4 semanas de trabalho focado**, pode se tornar um MVP viável para lançamento controlado (beta fechado).

---

## ✅ PONTOS FORTES (O que está bem feito)

### 1. Arquitetura de Autenticação Bem Estruturada
- JWT via `jose` com cookies httpOnly
- Middleware de proteção de rotas
- Separação de papéis: `master` / `member` / `platform_admin`
- Cookies seguros (sameSite, httpOnly em produção)

### 2. Multi-Engine de IA Implementado
Sistema robusto com 5 engines:
| Engine | Cor | Provedor |
|--------|-----|----------|
| OmniRed | 🔴 | DeepSeek |
| OmniBlue | 🔵 | Kimi/OpenRouter |
| OmniGreen | 🟢 | Claude (Anthropic) |
| OmniYellow | 🟡 | Gemini (Google) |
| OmniOrange | 🟠 | OpenAI |

- Fallback entre engines
- Tracking de uso e créditos
- Validação de chaves de API

### 3. Sistema de Permissões Granulares
Cada membro pode ter permissões específicas por módulo:
- `can_estudantes`
- `can_pei`
- `can_paee`
- `can_hub`
- `can_diario`
- `can_avaliacao`
- `can_gestao`

### 4. Design System Premium
- CSS com design tokens consistentes
- Glassmorphism e animações refinadas
- Sistema de sombras/superfícies profissional
- Fonte Plus Jakarta Sans
- Ícones Lottie e Phosphor

### 5. Exportação de Documentos Completa
- **PDF** (jspdf) - para PEI/PAEE
- **DOCX** (docx library) - documentos editáveis
- **CSV** - dados estruturados
- Formatação específica para cada tipo

### 6. Integração BNCC Nativa
- Carregamento de CSVs por segmento:
  - Educação Infantil (EI)
  - Ensino Fundamental - Anos Iniciais (EF_AI)
  - Ensino Fundamental - Anos Finais (EF_AF)
  - Ensino Médio (EM)
- Sugestão de habilidades por IA
- Alinhamento com currículo nacional

### 7. Sistema de Notificações Contextuais
- Verifica estudantes sem registros recentes no Diário (> 14 dias)
- Alerta PEIs desatualizados (> 60 dias)
- Badge na navbar com contador

---

## ⚠️ PROBLEMAS CRÍTICOS (Bloqueadores para Produção)

### 1. FALTA DE RATE LIMITING em APIs de IA
**Severidade:** 🔴 CRÍTICO  
**Impacto:** Usuário malicioso pode drenar créditos de API rapidamente ou causar custos massivos

**Descrição:**  
Nenhuma das rotas de IA (`/api/hub/*`, `/api/pei/consultoria`, etc.) possui proteção de rate limiting. Um loop simples pode esgotar créditos de IA em minutos.

**Solução Recomendada:**
```typescript
// Implementar com @upstash/ratelimit ou Redis
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, "1h"), // 50 req/hora por workspace
});
```

**Tempo Estimado:** 2 dias

---

### 2. SECRET PADRÃO EM CÓDIGO FONTE
**Severidade:** 🔴 CRÍTICO  
**Impacto:** Qualquer um pode forjar tokens JWT se a variável de ambiente não estiver definida

**Código Problemático:**
```typescript
// middleware.ts
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "omnisfera-dev-secret-change-in-prod"
);
```

**Solução Recomendada:**
```typescript
const secret = process.env.SESSION_SECRET;
if (!secret) {
  throw new Error("SESSION_SECRET é obrigatório em produção");
}
const SECRET = new TextEncoder().encode(secret);
```

**Tempo Estimado:** 2 horas

---

### 3. XSS via dangerouslySetInnerHTML sem Sanitização
**Severidade:** 🔴 CRÍTICO  
**Impacto:** Ataques de Cross-Site Scripting através de conteúdo gerado por IA

**Código Problemático:**
```tsx
// components/FormattedTextDisplay.tsx
return <span dangerouslySetInnerHTML={{ __html: textoFormatado }} />;
```

**Solução Recomendada:**
```tsx
import DOMPurify from 'isomorphic-dompurify';

const textoLimpo = DOMPurify.sanitize(textoFormatado);
return <span dangerouslySetInnerHTML={{ __html: textoLimpo }} />;
```

**Tempo Estimado:** 4 horas

---

### 4. ZERO TESTES AUTOMATIZADOS
**Severidade:** 🟠 ALTO  
**Impacto:** Nenhuma garantia de regressão em atualizações

**Descrição:**  
Nenhum arquivo `.test.ts` ou `.test.tsx` encontrado no projeto. Não há:
- Testes unitários
- Testes de integração
- Testes de API
- Testes E2E

**Solução Recomendada:**
1. Configurar Vitest ou Jest
2. Começar com testes de API críticas (auth, permissões)
3. Testes de componentes principais
4. Cobertura mínima: 20% nas 4 semanas iniciais

**Tempo Estimado:** 5 dias (setup + 20% coverage)

---

### 5. Validação Insuficiente de Permissões em APIs
**Severidade:** 🟠 ALTO  
**Impacto:** Usuário pode acessar dados fora do seu escopo

**Exemplo Problemático:**
```typescript
// app/api/students/[id]/route.ts
const { id } = await params;
const student = await getStudent(session.workspace_id, id);
// Verifica workspace, mas NÃO verifica se usuário tem can_estudantes
```

**Solução Recomendada:**
```typescript
// Criar helper de autorização
function requirePermission(session: SessionPayload, permission: string) {
  if (session.is_platform_admin) return;
  if (session.user_role === "master") return;
  const member = session.member as Record<string, boolean>;
  if (!member?.[permission]) {
    throw new Error("Permissão negada");
  }
}
```

**Tempo Estimado:** 3 dias

---

### 6. Logging Excessivo Expondo Dados Sensíveis
**Severidade:** 🟡 MÉDIO  
**Impacto:** Logs podem conter PII (Personally Identifiable Information)

**Descrição:**  
Arquivos como `lib/students.ts` têm mais de 30 chamadas `console.log/console.error` que expõem:
- IDs de estudantes
- Nomes completos
- Estrutura interna de dados
- Workspace IDs

**Solução Recomendada:**
- Substituir `console.log` por logger estruturado (Pino/Winston)
- Níveis de log por ambiente (debug em dev, warn/error em prod)
- Remover dados PII dos logs em produção

**Tempo Estimado:** 1 dia

---

## 🔧 MELHORIAS NECESSÁRIAS (Próximas 2-4 semanas)

### 1. Implementar Rate Limiting
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 2 dias

Limites sugeridos:
- Por workspace: 50 requisições IA/hora
- Por IP: 100 requisições/minuto
- Por usuário: 10 requisições IA/minuto

### 2. Adicionar DOMPurify
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 4 horas

Sanitizar todo HTML renderizado via `dangerouslySetInnerHTML`

### 3. Forçar SESSION_SECRET em Produção
**Prioridade:** 🔴 CRÍTICA  
**Tempo:** 2 horas

Remover fallback e lançar erro se variável não estiver definida

### 4. Adicionar Testes Unitários
**Prioridade:** 🟠 ALTA  
**Tempo:** 5 dias

Setup + 20% de cobertura nas funções críticas

### 5. Validar Permissões em Todas as APIs
**Prioridade:** 🟠 ALTA  
**Tempo:** 3 dias

Criar middleware/helper de autorização

### 6. Configurar Logging Estruturado
**Prioridade:** 🟡 MÉDIA  
**Tempo:** 1 dia

Pino ou Winston com níveis por ambiente

### 7. Implementar Cache nas APIs BNCC
**Prioridade:** 🟡 MÉDIA  
**Tempo:** 4 horas

Usar `unstable_cache` do Next.js para carregar CSVs uma vez

### 8. Adicionar Validação Zod
**Prioridade:** 🟡 MÉDIA  
**Tempo:** 3 dias

Validar todos os inputs de API com schemas Zod

---

## 🚀 ROADMAP PARA MVP VIÁVEL

### Fase 1: Correções Críticas (Semana 1-2)
| # | Tarefa | Responsável | Tempo |
|---|--------|-------------|-------|
| 1 | Rate limiting nas APIs de IA | Backend | 2 dias |
| 2 | Remover SESSION_SECRET fallback | Backend | 2 horas |
| 3 | Sanitizar HTML com DOMPurify | Frontend | 4 horas |
| 4 | Setup de testes (Vitest/Jest) | Full-stack | 2 dias |

### Fase 2: Segurança e Qualidade (Semana 3-4)
| # | Tarefa | Responsável | Tempo |
|---|--------|-------------|-------|
| 5 | Validar permissões em todas as APIs | Backend | 3 dias |
| 6 | Cobertura de testes 20% | Full-stack | 3 dias |
| 7 | Logging estruturado | Backend | 1 dia |
| 8 | Cache BNCC | Backend | 4 horas |

### Fase 3: Refinamento (Semana 5-6)
| # | Tarefa | Responsável | Tempo |
|---|--------|-------------|-------|
| 9 | Validação Zod nos inputs | Full-stack | 3 dias |
| 10 | Documentação de API (Swagger) | Full-stack | 2 dias |
| 11 | Testes E2E críticos | QA/Dev | 2 dias |

**Tempo Total:** 6 semanas (1 desenvolvedor full-time)

---

## 💰 ESTIMATIVA DE INVESTIMENTO

### Correção de Problemas Críticos
- **Tempo:** 1-2 semanas
- **Custo Estimado:** R$ 8.000 - 12.000
- **Equipe:** 1 desenvolvedor sênior

### MVP Estável (com testes e documentação)
- **Tempo:** 6-8 semanas
- **Custo Estimado:** R$ 25.000 - 35.000
- **Equipe:** 1 dev sênior + 1 dev pleno (meio período)

### Equipe Mínima Recomendada para Produção

| Função | Dedicação | Responsabilidade |
|--------|-----------|------------------|
| Dev Full-Stack Sênior | 100% | Core development, segurança, arquitetura |
| Dev Full-Stack Pleno | 100% | Features, integrações, manutenção |
| DevOps/Infra Jr | 50% | Deploy, monitoramento, CI/CD |
| QA Manual | 50% | Testes de aceitação, regressão |
| Product Designer | 25% | Refinamentos de UX, acessibilidade |

**Custo Mensal Estimado da Equipe:** R$ 35.000 - 50.000

---

## 📊 CHECKLIST DE PRÉ-LANÇAMENTO

### Segurança
- [ ] Rate limiting implementado
- [ ] SESSION_SECRET sem fallback
- [ ] DOMPurify em todos os innerHTML
- [ ] Headers de segurança (CSP, HSTS)
- [ ] Validação de permissões em todas as APIs
- [ ] Sanitização de inputs
- [ ] Remoção de console.log em produção

### Testes
- [ ] Cobertura mínima 20%
- [ ] Testes de autenticação passando
- [ ] Testes de autorização passando
- [ ] Testes E2E dos fluxos críticos

### Infraestrutura
- [ ] Monitoramento (Sentry/DataDog)
- [ ] Logs estruturados
- [ ] Backup automático do banco
- [ ] SSL/TLS configurado
- [ ] CDN para assets estáticos

### Documentação
- [ ] README de setup
- [ ] Documentação de API
- [ ] Guia de deploy
- [ ] Runbook de troubleshooting

---

## 🎬 RECOMENDAÇÕES FINAIS

### O que Fazer Agora
1. **NÃO FAÇA DEPLOY** em produção com dados reais até resolver os 3 problemas críticos
2. **Priorize:** Rate limiting → SESSION_SECRET → DOMPurify
3. **Beta fechado:** Após correções, teste com 2-3 escolas piloto
4. **Coleta de feedback:** Métricas de uso, erros, satisfação

### O que Evitar
- ❌ Não adicione novas features até corrigir os problemas críticos
- ❌ Não faça deploy sem testes mínimos de autenticação
- ❌ Não exponha console.log em produção
- ❌ Não ignore warnings de segurança do npm audit

### Próximos Passos Imediatos
1. Configurar variável `SESSION_SECRET` em produção
2. Implementar rate limiting nas 5 rotas de IA mais usadas
3. Adicionar DOMPurify no componente de exibição de texto formatado
4. Criar ambiente de staging idêntico à produção

---

## 📞 CONTEXTO E SUPORTE

### Tecnologias Principais
- **Framework:** Next.js 16.1.6 (App Router)
- **UI:** React 19.2.3, Tailwind CSS 4, Phosphor React
- **Backend:** API Routes do Next.js, Server Components
- **Banco:** Supabase (PostgreSQL)
- **Auth:** JWT com jose, cookies httpOnly
- **IA:** 5 engines (OpenRouter, DeepSeek, Anthropic, Google, OpenAI)
- **Exportação:** jspdf, docx, recharts

### Banco de Dados (Supabase)
Tabelas principais:
- `workspaces` - Escolas/instituições
- `workspace_members` - Professores/coordenadores
- `workspace_masters` - Administradores das escolas
- `platform_admins` - Administradores da plataforma
- `students` - Estudantes com dados de PEI/PAEE
- `usage_events` - Tracking de uso da plataforma

### Ambientes
- **Produção atual:** Streamlit Cloud (branch `omnisfera.net`)
- **Novo (dev):** Render/Vercel (branch `nextjs-migration`)
- **Mesmo banco:** Supabase compartilhado entre versões

---

## CONCLUSÃO

A **Omnisfera** tem uma **base sólida** com arquitetura moderna, design profissional e funcionalidades completas. A multi-engine de IA e o sistema de permissões demonstram maturidade técnica.

**No entanto, requer trabalho urgente em segurança antes de qualquer deploy em produção.**

Com investimento de **3-4 semanas** focado nos problemas críticos, a plataforma pode se tornar um produto **viável e competitivo** no mercado de EdTech para inclusão educacional.

**Recomendação:** Invista nas correções críticas primeiro, depois prossiga com beta fechado.

---

*Relatório gerado por análise automatizada de código. Para dúvidas ou esclarecimentos, consulte a documentação técnica do projeto.*
