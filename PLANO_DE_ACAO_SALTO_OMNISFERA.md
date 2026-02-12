# Plano de Ação — Dar o Salto
## Omnisfera: da Plataforma Pronta para o Produto Viável

**Data:** Fevereiro 2026  
**Branch:** nextjs-migration  
**Objetivo:** Transformar a Omnisfera em produto comercialmente viável e escalável.

---

# PARTE 1 — ONDE ESTAMOS (Estado Atual)

## 1.1 Inventário Técnico

### Stack
| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Framework | Next.js | 16.1.6 |
| UI | React | 19.2.3 |
| Estilo | Tailwind CSS | 4 |
| Banco | Supabase (PostgreSQL) | — |
| Auth | JWT (jose) + cookies httpOnly | — |
| Validação | Zod | 4.3.6 |
| IA | 5 engines (DeepSeek, Kimi, Claude, Gemini, OpenAI) | — |

### Estrutura da Aplicação
- **74 rotas de API** (auth, admin, students, members, school, PEI, PAEE, Hub, BNCC, monitoring, etc.)
- **13 módulos de dashboard:** Estudantes, PEI, PAEE, Hub, Diário, Monitoramento, Gestão, Config Escola, PGI, Infos, Admin
- **~116 arquivos** em `app/`, **29 componentes** em `components/`, **~30 libs** em `lib/`
- **25 migrations** Supabase (workspaces, members, students, usage_events, ia_usage, etc.)
- **3 CSVs BNCC** (EI, EF, EM) para habilidades e sugestões por IA

### Segurança (já implementado)
- Rate limiting (AI_GENERATION, AI_IMAGE, AUTH) em 28+ rotas
- SESSION_SECRET obrigatório em produção
- XSS: DOMPurify em FormattedTextDisplay
- Permissões granulares (lib/permissions.ts) em APIs de escrita
- Validação Zod em ~41 rotas (parseBody + schemas em lib/validation.ts)
- Error boundaries em todos os módulos
- Auth em 32 rotas de IA

### O que ainda NÃO temos
- **Zero testes** automatizados (unit, integration, E2E)
- **Headers de segurança** (CSP, X-Frame-Options, etc.) não configurados no next.config
- **Monitoramento** (Sentry/DataDog) não configurado
- **Logs estruturados** (muitos console.log)
- **Documentação de API** (OpenAPI/Swagger)
- **CI/CD** com testes e deploy automático
- **Rate limiting em Redis** (atual é in-memory, não escala horizontal)

---

## 1.2 Inventário de Produto

### Funcionalidades Existentes
| Módulo | Funcionalidades Principais | Status |
|--------|----------------------------|--------|
| **Estudantes** | CRUD, vínculos com membros, filtros | ✅ Completo |
| **PEI** | Consultoria IA, versões, export PDF/DOCX, mapa mental, resumo família, FAQ, extrair laudo | ✅ Completo |
| **PAEE** | Diagnóstico barreiras, plano habilidades, documento articulação, jornada gamificada, tecnologia assistiva, relatório ciclo, mapa mental | ✅ Completo |
| **Hub** | Criar atividade, plano de aula, adaptar atividade/prova, dinâmica, papo mestre, roteiro, rotina AVD, inclusão brincar, mapa mental, estudio imagem, gerar docx/imagem | ✅ Completo |
| **Diário** | Registros por estudante, análise IA | ✅ Completo |
| **Monitoramento** | Avaliações, sugerir rubricas | ✅ Completo |
| **Gestão** | Membros, permissões, vínculos professor–estudante | ✅ Completo |
| **Config Escola** | Anos letivos, séries, turmas, componentes | ✅ Completo |
| **PGI** | Plano de Gestão Inclusiva, gerar ações | ✅ Completo |
| **Admin** | Workspaces, uso IA, termo de uso, dashboard, bugs, anúncios, activity log, users, export, simulate | ✅ Completo |
| **Infos** | Central de inteligência (conteúdo estático) | ✅ Completo |

### Experiência do Usuário
- Login duplo (escola + admin plataforma)
- Home com módulos por permissão
- Navbar com ícones Lottie, busca global (Cmd+K), notificações, toast
- Tour guiado para novos usuários
- Termo de uso no primeiro acesso (members)

---

## 1.3 Gaps para “O Salto”

### Gaps Técnicos (impedem escala e confiança)
1. **Sem testes** → qualquer mudança pode quebrar fluxos críticos
2. **Headers de segurança** ausentes → risco de clickjacking e MIME sniffing
3. **Rate limit in-memory** → não funciona com múltiplas instâncias
4. **Logs em produção** → console.log pode vazar dados e poluir logs
5. **Sem observabilidade** → não sabemos quando e onde falha em produção

### Gaps de Produto (impedem adoção e retenção)
1. **Onboarding** → tour existe, mas falta fluxo “primeiro uso” (criar escola, primeiro estudante, primeiro PEI)
2. **Feedback de sucesso** → toasts ajudam; falta reforço em ações críticas (ex.: “PEI salvo e disponível para impressão”)
3. **Ajuda contextual** → poucos tooltips e textos de ajuda por tela
4. **Mobile** → layout responsivo existe; gestos e performance em mobile não foram priorizados
5. **Acessibilidade** → contraste e navegação por teclado não auditados

### Gaps de Negócio / Go-to-Market
1. **Landing page / site institucional** → não há página pública de apresentação do produto
2. **Preços e planos** → workspaces têm `plan` (basic/robusto) e `credits_limit`, mas não há fluxo de assinatura/pagamento
3. **Suporte** → não há canal (chat, e-mail, base de conhecimento)
4. **Métricas de uso** → usage_events e ia_usage existem; falta dashboard de produto (DAU, retenção, funil)

### Gaps de Operação
1. **Deploy** → documentado (DEPLOY_RENDER.md), mas sem pipeline automatizado
2. **Backup** → dependente do Supabase; sem política documentada
3. **Incidentes** → sem runbook nem processo definido

---

# PARTE 2 — ONDE QUEREMOS CHEGAR (Objetivos do Salto)

## 2.1 Definição de “O Salto”

- **Produto viável:** Uma escola pode assinar, configurar, usar PEI/PAEE/Hub/Diário sem depender de suporte técnico.
- **Operação confiável:** Deploy automatizado, monitoramento, logs e resposta a incidentes definidos.
- **Base para escala:** Testes automatizados, rate limit com Redis quando necessário, documentação técnica e de API.

## 2.2 Objetivos Mensuráveis (3–6 meses)

| Objetivo | Métrica | Meta |
|----------|---------|------|
| Estabilidade | Uptime | ≥ 99% |
| Confiança no código | Cobertura de testes | ≥ 30% em rotas críticas |
| Segurança | Zero vulnerabilidades críticas | npm audit 0 critical |
| Adoção | Escolas ativas (com login no mês) | 10+ |
| Uso de IA | Gerações de IA/semana por escola | Aumentar mês a mês |
| Satisfação | NPS ou pesquisa qualitativa | Coletar e melhorar |

---

# PARTE 3 — PLANO DE AÇÃO PRIORIZADO

## FASE 0 — Pré-Lançamento (1–2 dias)

**Objetivo:** Deixar o ambiente pronto para produção com o que já existe.

| # | Ação | Responsável | Tempo | Prioridade |
|---|------|-------------|-------|------------|
| 0.1 | Configurar SESSION_SECRET em produção (Render/Vercel) | DevOps/Dev | 15 min | 🔴 Crítica |
| 0.2 | Adicionar headers de segurança em next.config.ts (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection) | Dev | 30 min | 🔴 Crítica |
| 0.3 | Reduzir/condicionar console.log (flag DEBUG ou remover em produção) | Dev | 1 h | 🟠 Alta |
| 0.4 | Checklist final: variáveis de ambiente, chaves de IA, Supabase | Dev | 30 min | 🔴 Crítica |
| 0.5 | Deploy em produção e smoke test (login, criar estudante, gerar PEI) | Dev/QA | 2 h | 🔴 Crítica |

**Entregável:** App em produção, acessível e estável para beta.

---

## FASE 1 — Estabilidade e Observabilidade (2–3 semanas)

**Objetivo:** Saber quando algo quebra e reagir rápido.

| # | Ação | Responsável | Tempo | Prioridade |
|---|------|-------------|-------|------------|
| 1.1 | Integrar Sentry (ou similar) para erros front e API | Dev | 4 h | 🔴 Crítica |
| 1.2 | Configurar alertas (erro 5xx, rate limit estourado, falha de login em massa) | DevOps | 4 h | 🔴 Crítica |
| 1.3 | Substituir console.log por logger (ex.: Pino) com níveis por ambiente | Dev | 1 dia | 🟠 Alta |
| 1.4 | Documentar runbook de incidentes (como acessar logs, rollback, contatos) | DevOps/Dev | 4 h | 🟠 Alta |
| 1.5 | CI mínimo: lint + build no GitHub Actions em todo PR para nextjs-migration | Dev | 4 h | 🟠 Alta |

**Entregável:** Erros rastreados, alertas ativos, logs úteis, CI verde.

---

## FASE 2 — Confiança no Código (3–4 semanas)

**Objetivo:** Poder mudar código sem medo de quebrar fluxos críticos.

| # | Ação | Responsável | Tempo | Prioridade |
|---|------|-------------|-------|------------|
| 2.1 | Setup de testes (Vitest ou Jest) + React Testing Library | Dev | 1 dia | 🔴 Crítica |
| 2.2 | Testes de API: login, logout, admin-login, getSession | Dev | 1 dia | 🔴 Crítica |
| 2.3 | Testes de API: students CRUD, permissions (can_estudantes) | Dev | 1 dia | 🟠 Alta |
| 2.4 | Testes de API: uma rota de IA (ex.: consultoria PEI) com mock | Dev | 4 h | 🟠 Alta |
| 2.5 | Testes de componentes: LoginForm, Navbar (render + acessibilidade básica) | Dev | 1 dia | 🟡 Média |
| 2.6 | Meta: ≥ 30% cobertura em lib/auth, lib/session, lib/permissions, rotas auth e students | Dev | contínuo | 🟠 Alta |

**Entregável:** Suite de testes rodando no CI; cobertura inicial em auth e estudantes.

---

## FASE 3 — Produto e Onboarding (2–3 semanas)

**Objetivo:** Primeira experiência clara e valor visível.

| # | Ação | Responsável | Tempo | Prioridade |
|---|------|-------------|-------|------------|
| 3.1 | Fluxo “primeira escola”: após login master, wizard (nome escola, primeiro ano/série/turma) | Dev/Produto | 3 dias | 🟠 Alta |
| 3.2 | Fluxo “primeiro estudante”: atalho na home ou após wizard com CTA claro | Dev | 1 dia | 🟠 Alta |
| 3.3 | Mensagens de sucesso consistentes (toast + texto) em: PEI salvo, estudante criado, atividade gerada | Dev | 4 h | 🟡 Média |
| 3.4 | Página pública/landing: o que é a Omnisfera, para quem é, CTA “Solicitar acesso” ou “Agendar demo” | Dev/Design | 3 dias | 🟠 Alta |
| 3.5 | Base de conhecimento mínima: 5–10 artigos (como criar PEI, como usar o Hub, como convidar membros) | Conteúdo | 1 semana | 🟡 Média |

**Entregável:** Onboarding guiado, landing no ar, primeiros conteúdos de ajuda.

---

## FASE 4 — Escala e Negócio (4–8 semanas)

**Objetivo:** Suportar mais escolas e preparar modelo de negócio.

| # | Ação | Responsável | Tempo | Prioridade |
|---|------|-------------|-------|------------|
| 4.1 | Migrar rate limiting para Redis (Upstash ou Redis Cloud) para multi-instance | Dev | 2 dias | 🟠 Alta |
| 4.2 | Dashboard de produto (DAU, escolas ativas, uso de IA por workspace) — pode ser no Admin | Dev | 1 semana | 🟡 Média |
| 4.3 | Documentação de API (OpenAPI/Swagger) para integrações futuras | Dev | 3 dias | 🟡 Média |
| 4.4 | Política de backup (Supabase) documentada e testada (restore) | DevOps | 1 dia | 🟠 Alta |
| 4.5 | Canal de suporte (e-mail ou widget) + página “Fale conosco” | Dev/Produto | 2 dias | 🟡 Média |
| 4.6 | Preparar planos (basic/robusto) e limites de créditos na UI (sem pagamento ainda, se for o caso) | Dev/Produto | 3 dias | 🟢 Baixa |

**Entregável:** Rate limit escalável, visibilidade de uso, API documentada, suporte e backup definidos.

---

# PARTE 4 — CRONOGRAMA SUGERIDO

```
Semana 1–2    FASE 0 (Pré-Lançamento) + FASE 1 (Sentry, logs, CI)
Semana 3–4    FASE 1 (conclusão) + início FASE 2 (testes)
Semana 5–6    FASE 2 (testes) + início FASE 3 (onboarding)
Semana 7–8    FASE 3 (onboarding + landing)
Semana 9–12   FASE 4 (Redis, dashboard, API docs, suporte, backup)
```

**Marco “Salto concluído”:** Fim da Fase 3 (produto com onboarding e landing) + Fase 1 e 2 estáveis (observabilidade e testes).

---

# PARTE 5 — RECURSOS NECESSÁRIOS

## Equipe Mínima

| Papel | Dedicação | Foco |
|-------|------------|------|
| Dev Full-Stack Sênior | 100% | Fases 0–2 (segurança, testes, observabilidade) |
| Dev Full-Stack Pleno | 100% | Fases 3–4 (onboarding, landing, dashboard, API docs) |
| DevOps/Infra | 25–50% | Deploy, Sentry, CI, backup, rate limit Redis |
| Produto/Conteúdo | 25–50% | Textos, onboarding, base de conhecimento |

**Alternativa enxuta:** 1 dev sênior full-time + 1 dev pleno meio período; DevOps e conteúdo terceirizados ou em part-time.

## Custos Estimados (mensal)

| Item | Valor aproximado |
|------|-------------------|
| Sentry (time pequeno) | US$ 0–26 |
| Upstash Redis (rate limit) | US$ 0–10 |
| Render/Vercel (já em uso) | conforme plano atual |
| Domínio + SSL | R$ 50–100 |
| **Total infra adicional** | **~R$ 150–300/mês** |

---

# PARTE 6 — MÉTRICAS DE SUCESSO DO PLANO

| Métrica | Antes do plano | Meta (3 meses) |
|---------|-----------------|----------------|
| Uptime | Não medido | ≥ 99% |
| Erros em produção | Não rastreados | 100% capturados no Sentry |
| Cobertura de testes | 0% | ≥ 30% em rotas críticas |
| Tempo para deploy | Manual | < 15 min (CI + deploy automático) |
| Escolas ativas | — | 10+ com uso no mês |
| Landing page | Não existe | Publicada com CTA claro |

---

# PARTE 7 — PRÓXIMOS PASSOS IMEDIATOS

## Esta semana

1. **Definir dono do plano** (quem acompanha fases e prazos).
2. **Fazer Fase 0** (headers, SESSION_SECRET, logs, deploy e smoke test).
3. **Contratar ou alocar** pessoa para Sentry e CI (Fase 1).
4. **Priorizar** Fase 1 (Sentry + CI) para a próxima sprint.

## Este mês

1. Completar Fase 1 (observabilidade e CI).
2. Iniciar Fase 2 (setup de testes + primeiros testes de auth e students).
3. Escrever primeiro rascunho do runbook de incidentes.

## Próximos 3 meses

1. Concluir Fases 2 e 3 (testes + onboarding + landing).
2. Iniciar Fase 4 (Redis, dashboard, docs, suporte).
3. Fechar definição de “salto concluído” com produto e negócio.

---

# RESUMO EXECUTIVO

- **Onde estamos:** App Next.js com 74 APIs, 13 módulos, segurança (rate limit, Zod, permissões, XSS, SESSION_SECRET) e zero testes.
- **Onde queremos chegar:** Produto viável para escolas, estável, observável e com base para escala.
- **O que fazer:** Fase 0 (pré-lançamento) → Fase 1 (Sentry, logs, CI) → Fase 2 (testes) → Fase 3 (onboarding + landing) → Fase 4 (Redis, dashboard, docs, suporte).
- **Recursos:** 1–2 devs + DevOps part-time; custo extra de infra ~R$ 150–300/mês.
- **Marco “salto”:** Fim das Fases 1–3 com app em produção, monitorado, testado e com onboarding e landing no ar.

Este documento pode ser usado como referência única para alinhamento técnico e de produto e para acompanhamento do plano de ação.
