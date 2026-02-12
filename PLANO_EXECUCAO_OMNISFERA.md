# PLANO DE EXECUÇÃO — OMNISFERA
## Roadmap Realista para Lançamento e Escalada

**Versão:** 2.0 (Revisado)  
**Data:** Fevereiro 2026  
**Status:** Pronto para execução  
**Prazo Total:** 24-30 semanas (6-7 meses)

---

## RESUMO EXECUTIVO

Este plano consolida:
- Ajustes técnicos críticos pré-MVP
- Roadmap de produto realista
- Estratégia de go-to-market
- Métricas de sucesso

**Investimento necessário:** R$ 150.000-200.000 para 12 meses  
**Equipe mínima:** 2 devs seniores + 1 dev pleno + 0,5 PO + 0,5 vendas

---

## FASE 0 — AJUSTES PRÉ-LANÇAMENTO
### Semanas 1-2 (Imediato)

**Objetivo:** Deixar o código pronto para produção.

### Semana 1 — Fundação de Segurança

| Dia | Tarefa | Responsável | Saída |
|-----|--------|-------------|-------|
| 1 | Configurar SESSION_SECRET em produção | DevOps | Env var configurada |
| 1 | Adicionar headers de segurança HTTP | Dev | PR aprovado |
| 2 | Verificar todas as env vars | Dev | Checklist validado |
| 2-3 | Limpar console.logs de debug | Dev | Código limpo |
| 4 | Implementar validação Zod (5 APIs críticas) | Dev | Students, PEI, PGI, Members protegidos |
| 5 | Smoke test completo | QA/Dev | Sistema validado |

**APIs críticas para Zod:**
1. `POST /api/students` — criação de estudantes
2. `POST /api/pei` — geração de PEI
3. `POST /api/pgi` — ações do PGI
4. `POST /api/members` — criação de membros
5. `POST /api/ai-engines/*/generate` — todas as APIs de IA

**Critério de conclusão:** Deploy para ambiente de staging funcional.

### Semana 2 — Observabilidade Básica

| Dia | Tarefa | Responsável | Saída |
|-----|--------|-------------|-------|
| 6 | Configurar Sentry (front + API) | Dev | Erros sendo capturados |
| 7 | Logger estruturado (Pino) básico | Dev | Logs estruturados |
| 8 | Health check endpoint | Dev | `/api/health` respondendo |
| 9 | Alertas básicos (erros 500) | Dev | Notificações configuradas |
| 10-12 | Bug fixes pós-smoke | Dev | Lista de bugs críticos zerada |
| 13-14 | Deploy para produção + monitoramento | DevOps | Sistema no ar |

**Critério de conclusão:** Sistema em produção com 0 erros críticos.

---

## FASE 1 — LANÇAMENTO BETA FECHADO
### Semanas 3-6

**Objetivo:** Validar Product-Market Fit com 3 escolas piloto.

### Semana 3 — Recrutamento de Pilotos

| Tarefa | Responsável | Saída |
|--------|-------------|-------|
| Definir critérios de seleção (escolas piloto) | PO + Vendas | Perfil ideal documentado |
| Identificar 10 prospects qualificados | Vendas | Lista de leads |
| Agendar demos (3 escolas) | Vendas | 3 demos agendadas |
| Material de vendas básico (deck 10 slides) | PO + Design | Deck pronto |
| Script de demo | Vendas | Script validado |

**Perfil da escola piloto ideal:**
- Escola privada, 100-500 alunos
- Já faz inclusão (tem estudantes PNE matriculados)
- Professores tecnologicamente adeptos
- Disposição para feedback semanal

### Semana 4 — Onboarding das Pilotos

| Tarefa | Responsável | Saída |
|--------|-------------|-------|
| Criar workspaces das 3 escolas | Dev | Ambientes configurados |
| Onboarding humano (1:1 com cada escola) | CS + Vendas | 3 escolas onboarded |
| Configurar Primeira Escola Wizard | Dev | Fluxo validado |
| Treinamento de 1h (síncrono) | CS | 3 treinamentos realizados |
| Canal de suporte direto (WhatsApp/Slack) | CS | Comunicação estabelecida |

### Semana 5-6 — Coleta de Feedback

| Métrica | Meta | Ferramenta |
|---------|------|------------|
| NPS | > 50 | Pesquisa semanal |
| DAU/MAU (Daily/Monthly Active Users) | > 40% | Analytics |
| PEIs gerados | > 5 por escola | Dashboard |
| Tempo para primeiro PEI | < 30 min | Analytics |
| Support tickets | < 3/escola/semana | Sistema de tickets |

**Entrevistas semanais:**
- Semana 5: Entrevista com coordenador + 1 professor de cada escola
- Semana 6: Entrevista de validação — "Vocês pagariam por isso?"

**Critério de GO para Fase 2:**
- 3/3 escolas dizem que "salvam tempo significativo"
- NPS médio > 40
- 2/3 escolas confirmam disposição para pagar R$ 250+/mês

---

## FASE 2 — PRODUTO E GROWTH
### Semanas 7-12

**Objetivo:** Melhorar produto baseado no feedback + preparar crescimento.

### Sprint 1 (Semanas 7-8) — Iteração do Produto

**Features priorizadas baseadas no feedback:**
1. Fluxo "Primeiro Estudante" simplificado
2. PEI Templates pré-configurados
3. Integração com BNCC mais rápida
4. Exportar PEI em Word (além de PDF)

**Tasks:**
- Wizard "Primeira Escola" refinado
- Fluxo "Primeiro Estudante" + PEI otimizado
- Mensagens de sucesso/erro revisadas
- UX Writing revisado

### Sprint 2 (Semanas 9-10) — Infra e Estabilidade

| Tarefa | Motivação | Tempo |
|--------|-----------|-------|
| Revisar permissões em APIs GET | Consistência de segurança | 2-3 dias |
| Adicionar CSP Policy | Proteção XSS avançada | 1-2 dias |
| CI/CD completo (GitHub Actions) | Deploys automatizados | 3-4 dias |
| Ambiente de staging separado | Testar antes de produção | 2-3 dias |
| Cobertura de testes 30% (rotas críticas) | Confiança no código | contínuo |

### Sprint 3 (Semanas 11-12) — Preparação para Escala

**Tarefas:**
- Landing page completa (design + copy + SEO)
- Base de conhecimento (10 artigos)
- Material de vendas refinado
- Processo de trial gratuito → pago definido
- Salesforce/HubSpot configurado

**Landing page deve ter:**
- Hero com valor proposition claro
- Demo video (2 min)
- Pricing page (3 planos)
- Formulário de trial
- 3 case studies das escolas piloto
- FAQ (10 perguntas)

---

## FASE 3 — LANÇAMENTO PÚBLICO
### Semanas 13-18

**Objetivo:** Abrir para novos clientes e atingir 15 escolas pagantes.

### Semana 13 — Go-to-Market

| Canal | Ação | Meta |
|-------|------|------|
| Inbound | Landing page no ar + blog post | 100 visitas/semana |
| Parcerias | 3 assessorias educacionais parceiras | 5 indicadores/mês |
| Outbound | Cold email para 50 escolas | 5% resposta |
| Eventos | 1 evento educacional presencial | 10 leads qualificados |

### Semanas 14-18 — Aquisição + Retenção

**Metas semanais:**
- Semana 14: 5 novas escolas (total: 8)
- Semana 15: 3 novas escolas (total: 11)
- Semana 16: 3 novas escolas (total: 14)
- Semana 17: 2 novas escolas (total: 16)
- Semana 18: Renovação das 3 escolas piloto

**Processo de Customer Success:**
- Onboarding humano nas primeiras 4 semanas
- Check-in semanal nos primeiros 30 dias
- Check-in mensal após o primeiro mês
- NPS mensal
- Cohort analysis (retenção por mês de aquisição)

**Critério de sucesso:**
- 15+ escolas pagantes
- Churn < 5% no primeiro mês
- NPS > 50

---

## FASE 4 — CONTROLE DE CUSTOS E LGPD
### Semanas 19-22

**Objetivo:** Resolver débitos técnicos críticos antes de escalar.

### Semana 19-20 — Controle de Custos de IA

| Implementação | Motivação |
|-------------|-----------|
| Rate limiting por workspace (não só IP) | Evitar que 1 escola esgote recursos |
| Quotas hard limit por plano | Basic: 100 gerações/mês, Robusto: 500/mês |
| Alerta de custo para admin | Notificação quando atingir 80% da quota |
| Fallback para engines mais baratos | DeepSeek/Kimi quando exceder quota |

**Alerta:** Sem isso, uma escola pode gastar R$ 500 em IA no primeiro mês, gerando prejuízo.

### Semana 21-22 — LGPD Compliance

| Requisito | Implementação | Prazo |
|-----------|---------------|-------|
| Nomear DPO (Data Protection Officer) | Contratar advogado terceirizado | Semana 21 |
| Política de privacidade específica | Escrita por advogado | Semana 21 |
| Termo de consentimento dos pais | Fluxo no cadastro de estudantes | Semana 22 |
| Processo de exclusão de dados | Endpoint + UI para deleção | Semana 22 |
| DPA (Data Processing Agreement) | Contrato com escolas | Semana 22 |

**Risco de não fazer:** Multa de até 2% do faturamento (LGPD art. 52, §3º).

---

## FASE 5 — ESCALA TÉCNICA
### Semanas 23-30

**Objetivo:** Preparar infraestrutura para 100+ escolas.

### Semana 23-24 — Redis e Rate Limiting Distribuído

| Tarefa | Motivação |
|--------|-----------|
| Configurar Upstash Redis | Rate limiting funciona em multi-instance |
| Rate limiting por workspace em Redis | Controle de quotas em tempo real |
| Cache de queries frequentes | Reduzir carga no Supabase |

**Custo:** US$ 10-30/mês

### Semana 25-26 — Dashboard e Métricas

| Dashboard | Métricas |
|-----------|----------|
| Admin | Escolas ativas, MRR, churn, custo de IA |
| Escola | PEIs gerados, tempo economizado, timeline |
| Saúde do sistema | Erros 500, latência, uptime |

### Semana 27-28 — Documentação e API

- Documentação OpenAPI (Swagger)
- SDK para integrações futuras
- Webhooks para eventos (PEI gerado, etc.)

### Semana 29-30 — Otimização e Refinamento

- Otimização de queries (evitar N+1)
- CDN para assets estáticos
- Otimização de bundle size
- Code splitting avançado

---

## CRONOGRAMA VISUAL

```
MES 1 (Semanas 1-4): FUNDAÇÃO
├── Semana 1: Ajustes de segurança pré-lançamento
├── Semana 2: Observabilidade + Deploy
├── Semana 3: Recrutamento escolas piloto
└── Semana 4: Onboarding piloto + Início do uso

MES 2 (Semanas 5-8): VALIDAÇÃO
├── Semana 5: Feedback piloto + Iteração
├── Semana 6: Validação PMF
├── Semana 7: Melhorias no produto
└── Semana 8: Infra e testes

MES 3 (Semanas 9-12): PREPARAÇÃO
├── Semana 9-10: Landing page + Conteúdo
├── Semana 11-12: Material de vendas + Processos

MES 4-5 (Semanas 13-20): LANÇAMENTO + CONTROLE
├── Semanas 13-18: Aquisição de 15 escolas
└── Semanas 19-20: LGPD + Controle de custos IA

MES 6-7 (Semanas 21-30): ESCALA
├── Semanas 21-24: LGPD + Redis
└── Semanas 25-30: Dashboard + Otimização
```

---

## MÉTRICAS E KPIs

### Métricas de Produto

| Métrica | Meta Mês 3 | Meta Mês 6 | Meta Mês 12 |
|---------|-----------|-----------|-------------|
| Escolas ativas | 15 | 50 | 150 |
| MRR (Monthly Recurring Revenue) | R$ 3.750 | R$ 12.500 | R$ 37.500 |
| Churn mensal | < 5% | < 3% | < 2% |
| NPS | > 40 | > 50 | > 60 |
| DAU/MAU | > 30% | > 40% | > 50% |

### Métricas Técnicas

| Métrica | Alerta | Crítico |
|---------|--------|---------|
| Uptime | < 99.5% | < 99% |
| Erros 500/semana | > 10 | > 50 |
| Latência P95 API | > 500ms | > 1s |
| Custo de IA/escola | > R$ 100 | > R$ 150 |

---

## EQUIPE NECESSÁRIA

### Configuração por Fase

| Fase | Semanas | Equipe | Custo Mensal |
|------|---------|--------|--------------|
| Fase 0-1 | 1-6 | 1 sênior + 1 pleno | R$ 35.000 |
| Fase 2-3 | 7-18 | 2 sênior + 1 pleno + 0,5 vendas | R$ 55.000 |
| Fase 4-5 | 19-30 | 2 sênior + 1 pleno + 1 vendas + 0,5 CS | R$ 70.000 |

### Perfis

**Dev Sênior Next.js/Node.js** (2x)
- Stack: Next.js 16, TypeScript, Supabase, Tailwind
- Responsabilidades: Arquitetura, CRUDs complexos, integrações IA

**Dev Pleno** (1x)
- Stack: Next.js, TypeScript, testing
- Responsabilidades: Features, bug fixes, testes

**Product Owner** (0,5x)
- Responsabilidades: Priorização, especificação, feedback de usuários

**Vendas/SDR** (0,5 → 1x)
- Responsabilidades: Prospecting, demos, fechamento

**Customer Success** (0,5x, da Fase 4 em diante)
- Responsabilidades: Onboarding, retenção, NPS

---

## CUSTOS OPERACIONAIS

### Infraestrutura (escala)

| Escolas | Supabase Pro | Redis | Sentry | Render/Vercel | Total/Mês |
|---------|--------------|-------|--------|---------------|-----------|
| 1-10 | R$ 125 | R$ 0 | R$ 0 | R$ 200 | R$ 325 |
| 10-50 | R$ 250 | R$ 50 | R$ 130 | R$ 400 | R$ 830 |
| 50-100 | R$ 500 | R$ 100 | R$ 130 | R$ 600 | R$ 1.330 |
| 100-500 | R$ 1.500 | R$ 300 | R$ 260 | R$ 1.000 | R$ 3.060 |

### Custos de IA (projeção)

| Escolas | Custo IA/Mês | % da Receita* |
|---------|--------------|---------------|
| 10 | R$ 500-800 | 13-21% |
| 50 | R$ 2.500-4.000 | 20-32% |
| 100 | R$ 5.000-8.000 | 20-32% |
| 500 | R$ 25.000-40.000 | 20-32% |

*Considerando ticket médio de R$ 250

### Resumo de Custos (Mês 6)

| Item | Custo |
|------|-------|
| Equipe (2 sênior + 1 pleno + 0,5 vendas) | R$ 55.000 |
| Infra (50 escolas) | R$ 830 |
| IA (50 escolas) | R$ 3.000 |
| Ferramentas (Sentry, etc.) | R$ 500 |
| Legal/Admin | R$ 1.000 |
| **Total Fixo** | **R$ 60.330** |
| **Receita Esperada** | **R$ 12.500** |
| **Burn Rate** | **-R$ 47.830/mês** |

**Nota:** Burn rate alto é esperado nos primeiros meses. A receita deve crescer mais rápido que os custos a partir do mês 9-10.

---

## RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Escolas não adotam (PMF fraco) | Média | Alto | Validação rigorosa nas 3 pilotos antes de escalar |
| Custo de IA explode | Alta | Alto | Quotas hard limit implementadas já na Fase 4 |
| Concorrência reage | Média | Médio | Foco em diferenciação (multi-engine IA) |
| Problemas LGPD | Média | Alto | Advogado contratado na Fase 4 |
| Churn alto | Média | Alto | CS dedicado, check-ins frequentes |

---

## CHECKLIST DE GO/NO-GO PARA CADA FASE

### Fase 0 (Pré-Lançamento)
- [ ] SESSION_SECRET configurado
- [ ] Headers de segurança implementados
- [ ] Zod validation nas 5 APIs críticas
- [ ] Sentry capturando erros
- [ ] 0 erros críticos no staging
- [ ] Smoke test passou

**Se algum item não estiver OK → NÃO LANÇAR**

### Fase 2 (Após Pilotos)
- [ ] 3/3 escolas pilotos com NPS > 40
- [ ] 2/3 dispostas a pagar R$ 250+/mês
- [ ] Bug fixes críticos resolvidos
- [ ] Landing page no ar
- [ ] Processo de vendas definido

**Se PMF não validado → Pivotar ou parar**

### Fase 4 (Após 15 escolas)
- [ ] Churn < 5%
- [ ] LGPD 100% compliant
- [ ] Controle de custos de IA implementado
- [ ] Margem bruta > 0 (mesmo que pequena)

**Se churn > 10% → Revisar produto antes de escalar**

---

## DECISÕES PENDENTES

Antes de iniciar, precisamos definir:

1. **Preço:** Confirmar R$ 199 Basic / R$ 399 Robusto / R$ 799 Ilimitado?
2. **Caixa:** Temos R$ 150.000-200.000 para 12 meses?
3. **Equipe:** Conseguimos contratar 2 sênior + 1 pleno imediatamente?
4. **Mercado:** Vamos focar em assessorias ou escolas direto primeiro?

---

## PRÓXIMOS PASSOS (PRÓXIMAS 48H)

1. **Hoje (2h):**
   - [ ] Decisão GO/NO-GO neste plano
   - [ ] Confirmar orçamento disponível
   - [ ] Iniciar recrutamento se necessário

2. **Amanhã (4h):**
   - [ ] Configurar SESSION_SECRET
   - [ ] Adicionar headers de segurança
   - [ ] Limpar console.logs

3. **Depois de amanhã (4h):**
   - [ ] Implementar Zod nas 5 APIs críticas
   - [ ] Configurar Sentry básico
   - [ ] Deploy para staging

**Prazo para Fase 0 completa:** 7 dias corridos

---

**Documento preparado para execução imediata.**

*Última atualização: Fevereiro 2026*
*Versão: 2.0 (Pós-revisão estratégica)*
