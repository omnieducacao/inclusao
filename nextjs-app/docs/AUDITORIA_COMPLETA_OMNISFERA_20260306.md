# 🔍 Auditoria Completa — Omnisfera
**Data:** 06/03/2026 · **Versão:** 92b37be8 · **149 commits nas últimas 2 semanas**

---

## 📋 ÍNDICE

1. [Evolução Recente (últimas 2 semanas)](#1-evolução-recente)
2. [Coerência Pedagógica](#2-coerência-pedagógica)
3. [Usabilidade, Navegação e Acessibilidade](#3-usabilidade-navegação-e-acessibilidade)
4. [Visual e Estética](#4-visual-e-estética)
5. [Segurança e LGPD](#5-segurança-e-lgpd)
6. [Cobertura de Testes e Lacunas](#6-cobertura-de-testes-e-lacunas)

---

## 1. EVOLUÇÃO RECENTE

### 1.1 Módulos Evoluídos (149 commits em ~14 dias)

| Módulo | Evolução | Status |
|--------|----------|--------|
| **Avaliação Diagnóstica** | Cards por questão, feedback loop, distratores, SAEB, imagens inline, PDF formatado, gabarito, restauração de avaliações salvas | ✅ Funcional |
| **PEI Regente (Professor)** | PEI Geral visível, ponte pedagógica, fluxo devolução, BNCC selections, fix loading infinito | ✅ Funcional |
| **Hub de Recursos** | PEI completo na IA (geral + ponte pedagógica), AILoadingOverlay global | ✅ Funcional |
| **Plano de Curso** | AILoadingOverlay integrado, editor funcional | ✅ Funcional |
| **Avaliação Processual** | Evolução por disciplina, API funcional | ✅ Funcional |
| **Admin/Customização** | Cores admin, topbar dinâmica, ícones, footer, PageHero gradients | ✅ Funcional |
| **Design System (Omni DS)** | Cards pastel, notebook theme, tokens, componentes | ✅ Funcional |
| **Login/Auth** | Fix professor não conseguia logar (active=NULL), proteção delete | ✅ Funcional |
| **Módulo Família** | APIs (vincular, ciência PEI, responsáveis, meus-estudantes), rollout DS | ✅ Funcional |
| **Integridade de Dados** | Cascade warnings, garbage collector, defensive layer, safe-data | ✅ Funcional |

### 1.2 Bugs Críticos Corrigidos

| Bug | Causa | Fix |
|-----|-------|-----|
| Professor não conseguia logar | `active=NULL` excluído pela query (3 fixes distintos) | Coalesce/default `true` |
| Diagnóstica em branco no modo escola | `loadExistingAvaliacao` não restaurava questões | Restauração completa |
| PEI Regente travava em loading | `useEffect` com `onLinked` em loop infinito | `useRef` para single-fire |
| PDF da diagnóstica ilegível | Markdown bruto no PDF | Parser markdown → formatação |
| Imagens não geravam na diagnóstica | IA omitia texto + strip excessivo | Limpeza seletiva |
| Habilidades BNCC não apareciam | Normalização de disciplinas inconsistente | Map de aliases |
| Matriz BNCC não carregava | Filtro de série vs componente | Fallback cascade 3 níveis |

### 1.3 Features Estruturais Novas

- **Camada defensiva**: `safe-data.ts` com funções `safeStr`, `safePeiData`, `safeArray`, `studentExists`, `planoExists`
- **Anonimização de IA**: `ai-anonymize.ts` substitui nomes por tokens antes de enviar para provedores externos
- **Criptografia LGPD**: `encryption.ts` com AES-256-GCM para campos sensíveis de saúde
- **Rate limiting**: `rate-limit.ts` com sliding window para proteção de APIs de IA
- **Garbage collector**: API para limpeza de dados órfãos
- **Hub tracking**: Registro de conteúdos gerados por motor/workspace

---

## 2. COERÊNCIA PEDAGÓGICA

### 2.1 Fluxo Pedagógico Institucional ✅

```
Cadastro Estudante → PEI (Fase 1) → Designação Regentes → 
  → PEI Professor (Ponte Pedagógica) → Diagnóstica → 
    → Plano de Ensino → Hub (Adaptações) → 
      → Monitoramento → Avaliação Processual
```

**Status:** O fluxo está coerente e lógico. Cada módulo alimenta o próximo.

### 2.2 Pontos Fortes Pedagógicos

| Aspecto | Implementação |
|---------|---------------|
| **PEI como centro** | Estudante só é visível após PEI completo (`hasPeiOnly`) |
| **BNCC integrada** | Habilidades por série/disciplina em Diagnóstica, Hub, PEI |
| **Escala Omnisfera** | 5 níveis (0-4) consistentes: PEI, Diagnóstica, Monitoramento |
| **Ponte Pedagógica** | PEI 1 (geral) → PEI Regente (disciplina) → Hub (IA contextualizada) |
| **Diário ↔ PAEE** | Agrupamento lógico no nav (Diário sob PAEE) |
| **Bloom/SAEB** | Taxonomia cognitiva na geração de questões diagnósticas |

### 2.3 ⚠️ Pontos de Atenção Pedagógica

#### P1: Avaliação Processual — Pouco Conectada
- **Situação:** O módulo existe e funciona, mas o professor precisa ir manualmente acessá-lo.
- **Sugestão:** Incluir um alerta/badge no PEI Regente quando há avaliações processuais pendentes.
- **Impacto:** Baixo funcional, médio pedagógico.

#### P2: Monitoramento — Rubricas sem Automação
- **Situação:** As rubricas (Autonomia, Social, Conteúdo, Comportamento) são preenchidas manualmente.
- **Sugestão futura:** IA poderia sugerir rubricas baseadas nos registros do Diário.
- **Impacto:** Enhancement futuro.

#### P3: PGI — Sem Vínculo com Dashboard
- **Situação:** O PGI funciona de forma isolada. Não alimenta dados para o dashboard institucional.
- **Sugestão:** Conectar ações do PGI ao Monitoramento institucional.
- **Impacto:** Baixo imediato, alto estratégico.

#### P4: Consolidação do PEI — Fluxo de Aprovação
- **Situação:** `PEIConsolidacao.tsx` (20KB) existe, mas o fluxo de aprovação formal (rascunho → revisão → aprovado) pode não estar sendo usado ativamente.
- **Sugestão:** Verificar se escolas estão usando o `status_validacao_pei`.
- **Impacto:** Médio organizacional.

#### P5: Hub — Sem Histórico de Materiais Gerados
- **Situação:** O Hub gera materiais mas não salva um "portfolio" acessível. O `hub_tracking` salva metadados mas não o conteúdo completo para consulta futura.
- **Sugestão:** Permitir "Meus Materiais Salvos" para reutilização.
- **Impacto:** Médio para produtividade do professor.

---

## 3. USABILIDADE, NAVEGAÇÃO E ACESSIBILIDADE

### 3.1 Navegação ✅

| Aspecto | Status |
|---------|--------|
| Navbar responsiva | ✅ Desktop + mobile hamburger |
| Agrupamento lógico | ✅ Módulos, Gestão, Config |
| Dropdowns dinâmicos | ✅ Admin pode reorganizar |
| StudentSelector reutilizável | ✅ Componente padronizado |
| Breadcrumbs na Diagnóstica | ✅ Implementados |
| Voltar/fechar consistente | ✅ ArrowLeft em todos os painéis |

### 3.2 ⚠️ Pontos de Atenção — Usabilidade

#### U1: Formulários Longos sem Salvamento Automático
- **Onde:** PEI (8 tabs), PEI Regente (ponte pedagógica), Plano de Curso
- **Risco:** Professor perde trabalho ao navegar para outra aba antes de salvar.
- **Sugestão:** Auto-save com debounce (300ms) ou "rascunho salvo automaticamente".
- **Prioridade:** 🔴 Alta

#### U2: Feedback Visual de Sucesso/Erro Inconsistente
- **Onde:** Alguns módulos usam `setToast()`, outros não dão feedback visual ao salvar.
- **Sugestão:** Padronizar Toast global para todas as ações CRUD.
- **Prioridade:** 🟡 Média

#### U3: Loading States em Navegação
- **Onde:** Ao trocar de estudante no Hub/PEI/Diagnóstica, o loading pode ser abrupto.
- **Sugestão:** Skeleton placeholders ao invés de componentes desaparecendo.
- **Prioridade:** 🟡 Média

#### U4: Módulo de Cards Diagnóstica — Mobile
- **Onde:** Cards com 4+ alternativas podem ficar apertados em mobile.
- **Sugestão:** Stack vertical das alternativas em telas < 640px.
- **Prioridade:** 🟡 Média

### 3.3 ⚠️ Pontos de Atenção — Acessibilidade (a11y)

#### A1: `aria-label` Escasso
- **Diagnóstico:** Apenas 2 componentes usam `aria-label` (`HelpTooltip.tsx`, `ThemeToggle.tsx`).
- **Impacto:** Leitores de tela não identificam botões de ícone corretamente.
- **Correção necessária:**
  - Todos os `<button>` com apenas ícone precisam de `aria-label`
  - Componentes afetados: `StudentSelector`, `EngineSelector`, `Navbar` (ícones), `NotificationBell`, botões de ação no Hub
- **Prioridade:** 🔴 Alta (plataforma de educação inclusiva deve ser acessível)

#### A2: Contraste de Cores
- **Diagnóstico:** Textos com `opacity: 0.85` ou `0.7` sobre fundos claros podem ter contraste insuficiente (WCAG AA requer 4.5:1).
- **Onde:** Headers de cards, descrições em fontes pequenas.
- **Prioridade:** 🟡 Média

#### A3: Navegação por Teclado
- **Diagnóstico:** `<div onClick>` é usado em vários componentes interativos sem `role="button"` ou `tabIndex`.
- **Onde:** Cards de módulos (home), botões de disciplina na Diagnóstica (usam `<button>` ✅), cards de ferramentas no Hub.
- **Prioridade:** 🟡 Média

#### A4: Focus Indicators
- **Diagnóstico:** Com temas dark/notebook, o outline padrão do browser pode ser invisível.
- **Sugestão:** CSS customizado para `:focus-visible` com ring visível em todos os temas.
- **Prioridade:** 🟡 Média

#### A5: Sem `<main>`, `<nav>`, `<aside>` Consistentes
- **Diagnóstico:** O layout usa `<div>` genéricos. Semântica HTML5 parcial.
- **Sugestão:** Adicionar landmarks ARIA nos componentes de layout.
- **Prioridade:** 🟢 Baixa (funcional mas não ideal)

---

## 4. VISUAL E ESTÉTICA

### 4.1 Design System Implementado ✅

| Elemento | Status |
|----------|--------|
| Omni DS (package independente) | ✅ `@omni/ds` com Vite + React |
| Tokens de cores por módulo | ✅ 10 módulos mapeados |
| 3 Temas (Light, Dark, Notebook) | ✅ ThemeProvider funcional |
| PageHero com gradients admin | ✅ Customizável por escola |
| Cards pastel no notebook theme | ✅ Variant prop |
| Footer com branding | ✅ "Omni Educação" |
| Google Fonts (Inter) | ✅ Via next/font |
| Micro-animações | ✅ Logo spin, hover effects, transitions |

### 4.2 Pontos Fortes Estéticos

- **PageHero gradients:** Cada módulo tem gradiente único e customizável.
- **Cards de módulos:** Glassmorphism sutil, ícones Lottie, hover elevation.
- **Loading overlay:** Logo Omnisfera girando com nome do motor e frases rotativas.
- **Diagnóstica cards:** Design premium com badges BNCC, habilidade completa, distratores.
- **Onboarding Panel:** Auto-adapta cores do admin.
- **Navbar:** Dinâmica com dropdown customizável, AI state indicator.

### 4.3 ⚠️ Pontos de Atenção Visual

#### V1: Inline Styles Excessivos
- **Diagnóstico:** Muitos componentes (especialmente Diagnóstica, PEI Regente, Hub) usam `style={{...}}` inline extensivos ao invés de classes CSS.
- **Impacto:** Dificulta theming consistente e overrides. O notebook/dark theme pode não afetar esses elementos.
- **Exemplos:**
  - `AvaliacaoDiagnosticaClient.tsx`: ~500+ linhas com `style={{...}}`
  - `PEIRegenteClient.tsx`: ~300+ linhas com `style={{...}}`
  - `HubClient.tsx`: ~200+ linhas com `style={{...}}`
- **Sugestão:** Migrar gradualmente para classes CSS no `globals.css` ou CSS Modules.
- **Prioridade:** 🟡 Média (funciona, mas limita theming)

#### V2: Cores Hardcoded vs CSS Variables
- **Diagnóstico:** Cores como `#3b82f6`, `#10b981`, `#ef4444` aparecem diretamente no JSX. Quando o tema muda, estas cores não se adaptam.
- **Onde:** `var(--text-primary)` é usado em ALGUNS lugares, mas muitos usam hex direto.
- **Sugestão:** Substituir todas as cores diretas por `var(--color-xxx)` do design system.
- **Prioridade:** 🟡 Média

#### V3: Tipografia — Tamanhos Inconsistentes
- **Diagnóstico:** Fontes variam entre `fontSize: 10`, `11`, `12`, `13`, `14`, `15`, `17`, `18` em inline styles.
- **Sugestão:** Definir escala tipográfica no DS: `xs=10`, `sm=12`, `base=14`, `lg=16`, `xl=18`.
- **Prioridade:** 🟢 Baixa

#### V4: Espaçamentos — Gaps Inconsistentes
- **Diagnóstico:** Paddings variam entre `12px`, `14px`, `16px`, `18px`, `20px`, `22px`, `24px`.
- **Sugestão:** Padronizar com escala de 4px: `8, 12, 16, 20, 24`.
- **Prioridade:** 🟢 Baixa

#### V5: Dark Mode — Fallbacks Incompletos
- **Diagnóstico:** Alguns componentes usam `var(--bg-secondary, rgba(15,23,42,.4))` com fallback, mas outros usam `rgba(...)` diretamente sem variable.
- **Impacto:** No dark mode os fundos podem criar camadas visuais inconsistentes.
- **Prioridade:** 🟡 Média

---

## 5. SEGURANÇA E LGPD

### 5.1 Segurança — Implementações ✅

| Camada | Implementação | Status |
|--------|---------------|--------|
| **Autenticação** | JWT com cookie HttpOnly + Secure | ✅ |
| **Autorização (RBAC)** | `requireAuth()`, `requirePermission()` por módulo | ✅ |
| **Papéis** | Platform Admin > Master > Member (com can_xxx flags) | ✅ |
| **Validação de entrada** | Zod schemas em todas as APIs do Hub/PEI/PAEE | ✅ |
| **Rate limiting** | 30 req/h AI, 10 req/h imagens, 10/15min auth | ✅ |
| **Criptografia de saúde** | AES-256-GCM para diagnóstico, medicamentos, laudos | ✅ |
| **Anonimização de IA** | Nomes → tokens antes de enviar a provedores externos | ✅ |
| **Workspace isolation** | Todas as queries filtram por `workspace_id` | ✅ |
| **Cascade protection** | ON DELETE SET NULL para links pedagógicos | ✅ |
| **Input sanitization** | `.trim()` e `.slice()` em todos os prompts | ✅ |

### 5.2 LGPD — Conformidade ✅

| Requisito LGPD | Implementação |
|----------------|---------------|
| **Art. 7 — Base legal** | Consentimento + execução contratual | ✅ Documentado na política |
| **Art. 9 — Transparência** | Página pública `/privacidade` com 9 seções | ✅ |
| **Art. 11 — Dados sensíveis** | Diagnóstico e medicamentos criptografados (AES-256-GCM) | ✅ |
| **Art. 13 — Anonimização** | `ai-anonymize.ts` substitui nomes antes de enviar a IA | ✅ |
| **Art. 15 — Término** | Garbage collector para limpeza de dados | ✅ |
| **Art. 41 — DPO** | Email de contato `privacidade@omnisfera.net` | ✅ |
| **Art. 46 — Segurança técnica** | Criptografia, rate limiting, RBAC, workspace isolation | ✅ |
| **Consentimento no cadastro** | `privacy_consent: z.literal(true)` no `createStudentSchema` | ✅ |
| **Política de privacidade** | `/privacidade` — página pública sem login | ✅ |
| **Termos de uso** | `TermsOfUseModal.tsx` (6.8KB) componente funcional | ✅ |

### 5.3 ⚠️ Pontos de Atenção — Segurança

#### S1: Supabase Service Key no Servidor
- **Situação:** O `getSupabase()` usa a Service Key (bypass de RLS) em todas as routes.
- **Risco tolerável:** OK para MVP com single-tenant, mas em multi-escola real, RLS seria preferível.
- **Prioridade:** 🟢 Baixa (MVP)

#### S2: Sessão — Sem Rotação de Token
- **Situação:** O JWT não é rotacionado periodicamente.
- **Sugestão futura:** Implementar refresh token com TTL curto.
- **Prioridade:** 🟢 Baixa (MVP)

#### S3: Log de Auditoria — Insuficiente para LGPD Plena
- **Situação:** `usage_events` registra eventos gerais, mas não registra quem acessou dados de qual aluno.
- **Requisito LGPD:** Art. 37 requer registro de todas as operações sobre dados pessoais.
- **Sugestão:** Tabela `audit_log` com `actor`, `action`, `resource`, `timestamp`.
- **Prioridade:** 🟡 Média

#### S4: Exportação de Dados (Portabilidade)
- **Situação:** Não há botão "Exportar meus dados" para o titular exercer o direito de portabilidade (Art. 18 LGPD).
- **Sugestão:** API `/api/students/[id]/export` que gera JSON completo do estudante.
- **Prioridade:** 🟡 Média

#### S5: Direito de Eliminação
- **Situação:** A exclusão de estudante funciona (cascade), mas não há confirmação formal de que TODOS os dados foram removidos (incluindo backups).
- **Sugestão:** Gerar "Certificado de Eliminação" assinado.
- **Prioridade:** 🟢 Baixa (futura)

---

## 6. COBERTURA DE TESTES E LACUNAS

### 6.1 Inventário de Testes Existentes

#### Testes Unitários (18 arquivos)
| Arquivo | Cobre |
|---------|-------|
| `validation.test.ts` | Schemas Zod (todas as APIs) |
| `permissions.test.ts` | RBAC (requireAuth, requirePermission) |
| `session.test.ts` | JWT/sessão |
| `auth.test.ts` | Autenticação |
| `encryption.test.ts` | AES-256-GCM encrypt/decrypt |
| `anonymize.test.ts` | Anonimização de nomes |
| `ai-anonymize.test.ts` | Wrapper de anonimização para IA |
| `security.test.ts` | Testes de segurança gerais |
| `rate-limit.test.ts` | Rate limiting |
| `hub-utils.test.ts` | Utilidades do Hub |
| `hub-prompts.test.ts` | Prompts do Hub |
| `omnisfera-prompts.test.ts` | Motor de prompts V3 |
| `omnisfera-validator.test.ts` | Validador Omnisfera |
| `avaliacao-imagens.test.ts` | Geração de imagens |
| `prompt-nee-imagens.test.ts` | Prompts NEE para imagens |
| `geracao-questoes.test.ts` | Geração de questões |
| `date-utils.test.ts` | Utilidades de data |
| `ai-engines-config.test.ts` | Configuração de motores IA |

#### Testes de Integração (16 arquivos)
| Arquivo | Cobre |
|---------|-------|
| `api-auth-login.test.ts` | Login endpoint |
| `api-auth-admin-login.test.ts` | Admin login |
| `api-auth-logout.test.ts` | Logout |
| `api-students.test.ts` | CRUD students |
| `api-members.test.ts` | CRUD members |
| `api-hub-criar-atividade.test.ts` | Hub criar atividade |
| `api-privacy-lgpd.test.ts` | LGPD privacy |
| `api-workspace-config.test.ts` | Workspace config |
| `api-health.test.ts` | Health check |
| `api-avaliacao-processual.test.ts` | Avaliação processual |
| `api-avaliacao-processual-evolucao.test.ts` | Evolução processual |
| `api-familia-vincular.test.ts` | Vincular família |
| `api-familia-ciencia-pei.test.ts` | Ciência PEI |
| `api-familia-responsaveis.test.ts` | Responsáveis |
| `api-familia-estudante.test.ts` | Estudante (família) |
| `api-familia-meus-estudantes.test.ts` | Meus estudantes |

#### Testes E2E (3 arquivos - Playwright)
| Arquivo | Cobre |
|---------|-------|
| `e2e/login.spec.ts` | Fluxo de login |
| `e2e/api.spec.ts` | APIs core |
| `e2e/pei-professor.spec.ts` | PEI Professor flow |

### 6.2 ⚠️ Lacunas de Testes

#### 🔴 Lacunas Críticas (sem cobertura)

| Área | Tipo Faltante | Impacto |
|------|---------------|---------|
| **Avaliação Diagnóstica** | Integração: API criar-item, gabarito, análise | Módulo mais complexo sem testes de integração |
| **PEI Regente** | Integração: meus-alunos, avançar fase | Fluxo crítico de professores |
| **PAEE** | Integração: ciclos CRUD, SMART goals | Módulo especializado sem testes |
| **Diário de Bordo** | Integração: CRUD de registros | Dados de evidência sem validação |
| **Monitoramento** | Integração: rubricas, stats | Dashboard sem testes |
| **PGI** | Integração: ações 5W2H, dimensionamento | Módulo de gestão sem testes |
| **Plano de Curso** | Integração: CRUD planos, vinculação PEI | Módulo novo sem testes |
| **Admin Platform** | Integração: workspaces, customizações | Admin sem testes de integração |

#### 🟡 Lacunas Moderadas

| Área | Tipo Faltante |
|------|---------------|
| **Componentes React** | Nenhum teste de renderização (jest + RTL) |
| **Navbar** | A11y e responsividade |
| **PageHero** | Renderização com diferentes temas |
| **AILoadingOverlay** | Animação e estado global |
| **PEISummaryPanel** | Renderização e parsing de dados |
| **FormattedTextDisplay** | Markdown rendering |

#### 🟢 Lacunas Menores

| Área | Tipo Faltante |
|------|---------------|
| **PDF export** | Geração correta de PDFs (difícil testar) |
| **DOCX export** | Estrutura do documento |
| **Image compression** | Performance e qualidade |

### 6.3 Recomendação de Prioridade para Testes

```
PRIORIDADE 1 (Próxima Sprint):
├── api-avaliacao-diagnostica.test.ts (criar-item, gabarito, análise)
├── api-pei-regente.test.ts (meus-alunos, PATCH fase)
├── api-pei-disciplina.test.ts (CRUD disciplinas)
└── api-paee.test.ts (ciclos, objetivos)

PRIORIDADE 2:
├── api-diario.test.ts
├── api-monitoramento.test.ts
├── api-plano-curso.test.ts
└── api-admin-workspaces.test.ts

PRIORIDADE 3:
├── Component tests (PEISummaryPanel, Navbar a11y)
├── E2E tests (Hub flow, Diagnóstica flow)
└── PDF/DOCX snapshot tests
```

---

## 📊 RESUMO EXECUTIVO

### Saúde Geral da Plataforma

| Dimensão | Nota | Tendência |
|----------|------|-----------|
| **Funcionalidade** | 9/10 | ⬆️ Todos os módulos operacionais |
| **Coerência Pedagógica** | 8/10 | ⬆️ Fluxos bem conectados, 5 melhorias sugeridas |
| **Usabilidade** | 7/10 | ➡️ Funcional mas com gaps em a11y e auto-save |
| **Visual/Estética** | 8/10 | ⬆️ Premium, mas inline styles limitam theming |
| **Segurança/LGPD** | 8.5/10 | ⬆️ Sólida, falta audit log completo |
| **Testes** | 6/10 | ➡️ Boa base, lacunas em módulos complexos |

### Top 5 Ações Prioritárias

1. 🔴 **Acessibilidade (aria-label)** — Uma plataforma de educação INCLUSIVA deve ser acessível
2. 🔴 **Auto-save em formulários longos** — Risco de perda de trabalho do professor
3. 🟡 **Testes para Diagnóstica + PEI Regente** — Módulos mais complexos sem cobertura
4. 🟡 **Audit log LGPD** — Registrar quem acessou dados de qual aluno
5. 🟡 **Migrar inline styles → CSS variables** — Para theming consistente

### O que a Omnisfera faz MUITO BEM hoje

- ✨ **Fluxo pedagógico coerente** do PEI à sala de aula
- 🔐 **Segurança robusta** com criptografia + anonimização + rate limiting
- 🎨 **Estética premium** com gradients, glassmorphism e micro-animações  
- 🤖 **IA contextualizada** com PEI completo (geral + ponte pedagógica)
- 📊 **Diagnóstica rigorosa** com BNCC, SAEB, distratores e Bloom
- 👨‍👩‍👧 **Módulo Família** integrado com ciência do PEI
- 🏫 **Multi-tenant** com isolamento por workspace
