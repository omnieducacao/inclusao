# 🎯 Plano de Ação Pós-Auditoria — Omnisfera
**Criado:** 06/03/2026 · **Atualizado:** 06/03/2026 (v2 — consolidado com análise Kimi K2)
**Baseado em:** Auditoria Antigravity + Análise Kimi K2 + validação cruzada no código

---

## Estrutura

O plano está dividido em **6 Sprints** de complexidade crescente.
Cada item tem: prioridade, estimativa, arquivos afetados e critério de aceite.

### Componentes Gigantes Identificados (dados reais)

| Componente | Linhas | Prioridade de Refatoração |
|-----------|--------|--------------------------|
| `PEIClient.tsx` | **5.723** | 🔴 Crítico (maior componente) |
| `AvaliacaoDiagnosticaClient.tsx` | **4.442** | 🔴 Crítico |
| `HubClient.tsx` | **3.785** | 🔴 Crítico |
| `PAEEClient.tsx` | **2.939** | 🟡 Alto |
| `AdminClient.tsx` | **2.914** | 🟡 Alto |
| `GestaoClient.tsx` | **1.730** | 🟢 Médio |
| `DiarioClient.tsx` | **1.348** | 🟢 Médio |
| `PEIRegenteClient.tsx` | **1.285** | 🟢 Médio |
| `AvaliacaoProcessualClient.tsx` | **1.250** | 🟢 Médio |

### Console.logs em Produção: **356 ocorrências** em 130+ arquivos
> Risco: Exposição de dados em logs. Necessário: logger estruturado ou remoção total.

---

## 🏃 SPRINT 0 — Limpeza Imediata (Housekeeping)
**Foco:** Remover lixo de debug, consolidar rotas duplicadas.
**Estimativa:** 1 sessão de trabalho

---

### 0.1 🔴 Remover Console.Logs de Debug

**Diagnóstico (Kimi K2 + validação):** 356 chamadas `console.log/error/warn` espalhadas nos 130+ arquivos de app/ e components/. Muitas são debug explícito com emojis (✅, 🔍, 📥).

**Exemplos mais graves:**
```
PEIClient.tsx:612  → console.log("🔍 peiData mudou. Campos:", Object.keys(peiData))
PEIClient.tsx:956  → console.log("studentPendingName:", studentPendingName)
monitoramento/page.tsx:41 → console.log("✅ Monitoramento: Estudante encontrado", {dados})
```

**Ação:**
1. Criar `lib/logger.ts` (já existe com 1KB — expandir)
2. Substituir `console.log` por `logger.debug()` (suprimido em prod)
3. Manter `console.error` apenas em catch blocks reais
4. Script: `grep -rn "console.log" app/ components/ | grep -v node_modules`

**Critério de Aceite:**
- [ ] 0 `console.log` de debug em app/ e components/
- [ ] `logger.ts` com `debug()`, `info()`, `warn()`, `error()`
- [ ] `debug()` silenciado quando `NODE_ENV === 'production'`

---

### 0.2 🟡 Consolidar Rotas /pei-professor vs /pei-regente

**Diagnóstico (Kimi K2):** Existem duas rotas para o mesmo fluxo:
- `/pei-professor` — Componente simplificado (rota antiga?)
- `/pei-regente` — Componente completo com 3 fases (o correto)

**Ação:** Verificar se `/pei-professor` ainda é acessado. Se não, redirecionar para `/pei-regente`. Se sim, consolidar.

**Critério de Aceite:**
- [ ] Uma única rota para o fluxo do professor regente
- [ ] Redirect 301 na rota antiga

---

## 🏃 SPRINT 1 — Acessibilidade & Alto Contraste
**Foco:** A plataforma de educação INCLUSIVA precisa ser acessível.
**Estimativa:** 2-3 sessões de trabalho

---

### 1.1 🔴 Modo Alto Contraste (Novo Tema Transversal)

**Conceito:** Diferente de Light/Dark/Notebook (que são temas visuais), o **Alto Contraste** é um **modificador** que pode ser ativado **em cima de qualquer tema**. É uma camada adicional, não um tema substituto.

**Comportamento:**
```
┌─────────────────────────────────────────────┐
│  Tema Base: [Light] [Dark] [Notebook]       │
│  ─────────────────────────────────────────  │
│  ☐ Modo Alto Contraste                      │
│     (funciona com qualquer tema acima)       │
└─────────────────────────────────────────────┘
```

**Quando ativado, aplica:**
- Bordas sólidas e visíveis (2px) em todos os cards e inputs
- Textos em preto puro (#000) ou branco puro (#fff) — sem opacity
- Fundos sólidos sem transparência (sem `rgba(...)` com alpha)
- Links e botões sublinhados por padrão
- Focus ring grosso e visível (3px solid #FFD700 ou #00BFFF)
- Font-size mínimo 14px em todo o conteúdo
- Ícones com contorno adicional
- Eliminação de gradients sutis nos textos

**Implementação Técnica:**

```
Arquivos a criar/modificar:
├── components/ThemeProvider.tsx    → Adicionar state `highContrast`
├── components/ThemeToggle.tsx      → Adicionar toggle de alto contraste
├── app/globals.css                 → Classe `.high-contrast` com overrides
└── lib/module-theme.ts             → Respeitar flag highContrast
```

**CSS Strategy — Classe no `<html>`:**
```css
/* globals.css */
html.high-contrast {
  --text-primary: #000000;
  --text-secondary: #1a1a1a;
  --text-muted: #333333;
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --border-default: #000000;
  --border-subtle: #666666;
  --focus-ring: 3px solid #0066CC;
}

html.dark.high-contrast {
  --text-primary: #ffffff;
  --text-secondary: #e0e0e0;
  --text-muted: #cccccc;
  --bg-primary: #000000;
  --bg-secondary: #111111;
  --border-default: #ffffff;
  --focus-ring: 3px solid #FFD700;
}

html.high-contrast * { text-shadow: none !important; }
html.high-contrast a { text-decoration: underline !important; }
html.high-contrast button,
html.high-contrast [role="button"],
html.high-contrast input,
html.high-contrast select,
html.high-contrast textarea {
  border: 2px solid var(--border-default) !important;
}
html.high-contrast *:focus-visible {
  outline: var(--focus-ring) !important;
  outline-offset: 2px !important;
}
```

**Critério de Aceite:**
- [ ] Toggle visível no ThemeToggle de todas as páginas
- [ ] Funciona com Light + Alto Contraste
- [ ] Funciona com Dark + Alto Contraste
- [ ] Funciona com Notebook + Alto Contraste
- [ ] Persistência via localStorage
- [ ] Contraste mínimo 7:1 (WCAG AAA)

---

### 1.2 🔴 aria-label em Todos os Botões de Ícone

**Diagnóstico:** Apenas 2 de 55 componentes usam `aria-label`.

**Componentes a modificar (prioridade):**

| Componente | Qtd estimada | Exemplos |
|------------|-------------|----------|
| `Navbar.tsx` | ~10 | Menu, notificação, perfil, tema, busca |
| `StudentSelector.tsx` | ~3 | Setas, filtro, limpar |
| `EngineSelector.tsx` | ~5 | Botões de motor IA |
| `NotificationBell.tsx` | ~2 | Sino, fechar |
| `QuickActions.tsx` | ~8 | Botões de ação rápida |
| `ModuleCardsLottie.tsx` | ~10 | Cards de módulo |
| `AILoadingOverlay.tsx` | ~1 | Fechar/cancelar |
| `DataCleanupPanel.tsx` | ~3 | Ações de limpeza |
| `GlobalSearch.tsx` | ~2 | Busca, limpar |
| `ImageCropper.tsx` | ~3 | Crop, rotacionar, confirmar |
| `PlanoCursoEditor.tsx` | ~5 | Adicionar, remover, reordenar |

**Critério de Aceite:**
- [ ] 0 botões com apenas ícone sem aria-label
- [ ] Texto dos aria-label em português

---

### 1.3 🔴 aria-live para Notificações Dinâmicas (Gap Kimi K2)

**Diagnóstico (Kimi + validação):** 0 ocorrências de `aria-live` em todo o projeto.

**Onde aplicar:**
- `Toast.tsx` → `aria-live="polite"` no container
- `AILoadingOverlay.tsx` → `aria-live="assertive"` para status de loading
- `NotificationBell.tsx` → `aria-live="polite"` para novos alertas
- Mensagens de erro em formulários → `aria-live="polite"`

**Critério de Aceite:**
- [ ] Toast com `aria-live="polite"`
- [ ] Loading overlay anuncia status para leitores de tela

---

### 1.4 🟡 Landmarks Semânticos (HTML5) + Skip Link

**Adicionar ao layout.tsx do dashboard:**
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only ...">
  Pular para o conteúdo principal
</a>
<nav aria-label="Navegação principal">
  <Navbar />
</nav>
<main id="main-content" role="main">
  {children}
</main>
<footer>
  <Footer />
</footer>
```

**Critério de Aceite:**
- [ ] `<nav>`, `<main>`, `<footer>` no layout
- [ ] Skip-link funcional (visível ao Tab)

---

### 1.5 🟡 Focus Indicators Customizados

**Adicionar ao globals.css:**
```css
*:focus-visible {
  outline: 2px solid var(--focus-color, #3b82f6);
  outline-offset: 2px;
  border-radius: 4px;
}
.dark *:focus-visible { --focus-color: #60a5fa; }
.notebook *:focus-visible { --focus-color: #6366f1; }
```

**Critério de Aceite:**
- [ ] Focus ring visível em Light, Dark e Notebook
- [ ] Todos os elementos interativos respondem ao Tab

---

### 1.6 🟡 Lazy Loading de Imagens (Gap Kimi K2)

**Diagnóstico:** 0 ocorrências de `loading="lazy"` no projeto.

**Ação:** Next.js `<Image>` já faz lazy por padrão, mas `<img>` nativas (se existirem) e imagens geradas pela IA precisam do atributo. Verificar se todas as imagens na Diagnóstica e Hub usam `<Image>` do Next.js.

**Critério de Aceite:**
- [ ] Todas as imagens usam `<Image>` do Next.js ou `loading="lazy"`

---

## 🏃 SPRINT 2 — Usabilidade & Auto-Save
**Foco:** Proteger o trabalho do professor e melhorar a experiência.
**Estimativa:** 2-3 sessões de trabalho

---

### 2.1 🔴 Auto-Save em Formulários Longos

**Conceito:** Salvamento automático com debounce de 2s. Indicador visual discreto: "💾 Rascunho salvo" ou "⏳ Salvando..."

**Nota:** Já existe `useUnsavedChanges.ts` (40 linhas) que previne fechamento da aba, mas **não faz auto-save real**.

**Módulos afetados:**

| Módulo | Componente | Linhas | Estratégia |
|--------|-----------|--------|------------|
| **PEI** | `PEIClient.tsx` | 5.723 | Debounce PATCH `pei_data` parcial |
| **PEI Regente** | `PEIRegenteClient.tsx` | 1.285 | Debounce PATCH `/api/pei/disciplina` |
| **Plano de Curso** | `PlanoCursoEditor.tsx` | 48KB | Debounce PATCH `/api/plano-curso` |
| **PAEE** | `PAEEClient.tsx` | 2.939 | Debounce PATCH `paee_ciclos` parcial |

**Hook reutilizável a criar:**
```tsx
// hooks/useAutoSave.ts
function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  options?: { debounceMs?: number; enabled?: boolean }
): { status: 'idle' | 'saving' | 'saved' | 'error'; lastSaved: Date | null }
```

**Critério de Aceite:**
- [ ] Hook `useAutoSave` reutilizável
- [ ] PEI, PEI Regente, Plano de Curso com auto-save
- [ ] Indicador visual "Salvo" / "Salvando"
- [ ] Sem conflito com salvamento manual
- [ ] Debounce de 2s

---

### 2.2 🟡 Toast Global Padronizado

**Situação atual:** Cada módulo cria seu próprio `toast` state. Inconsistente.

**Solução:** Context Provider global com `useToast()`.

**Critério de Aceite:**
- [ ] `useToast()` hook global
- [ ] Tipos: success, error, info, warning
- [ ] Auto-dismiss em 4 segundos
- [ ] `aria-live="polite"` (conectado com Sprint 1)

---

### 2.3 🟡 Skeleton Placeholders + Loading States em Transições (Gap Kimi K2)

**Diagnóstico (Kimi K2):** Ao avançar de fase no PEI Regente, não há feedback visual claro. O código faz `fetchData()` sem loading state.

**Onde:**
- Hub: troca de estudante → skeleton
- PEI: troca de tab → skeleton
- PEI Regente: avanço de fase → loading + toast de confirmação
- Diagnóstica: troca de disciplina → skeleton

**Critério de Aceite:**
- [ ] Skeleton com animação shimmer
- [ ] Loading state visível durante transições de fase

---

### 2.4 🟡 Diagnóstica Cards — Mobile Responsive (Gap Kimi K2)

**Diagnóstico:** Cards com 4+ alternativas podem ficar apertados em mobile.

**Ação:** Stack vertical das alternativas em telas < 640px.

**Critério de Aceite:**
- [ ] Alternativas em coluna vertical em mobile
- [ ] Botões de ação acessíveis em telas pequenas

---

## 🏃 SPRINT 3 — Coerência Visual & Theming
**Foco:** Harmonia entre todos os elementos; inline styles → CSS classes.
**Estimativa:** 3-4 sessões de trabalho

---

### 3.1 🟡 Migrar Inline Styles para CSS Classes

**Estratégia:** Criar classes utilitárias no `globals.css`, depois substituir gradualmente.

**Classes a criar:**
```css
.omni-card { border-radius: 14px; padding: 18px 22px; background: var(--bg-secondary); border: 1px solid var(--border-default); }
.omni-card-header { display: flex; align-items: center; gap: 10px; padding: 14px 18px; }
.omni-badge { ... }
.omni-badge--success { ... }
.omni-badge--warning { ... }
.omni-text-xs { font-size: 10px; }
.omni-text-sm { font-size: 12px; }
.omni-text-base { font-size: 14px; }
```

**Componentes com mais inline styles (prioridade):**

| Componente | Linhas com style | Prioridade |
|-----------|-----------------|------------|
| `AvaliacaoDiagnosticaClient.tsx` | ~500+ | 1 |
| `PEIClient.tsx` | ~400+ | 2 |
| `PEIRegenteClient.tsx` | ~300+ | 3 |
| `HubClient.tsx` | ~200+ | 4 |

**Critério de Aceite:**
- [ ] Classes `omni-card`, `omni-badge`, `omni-text-*` definidas
- [ ] Top 3 componentes migrados
- [ ] Alto Contraste funciona nos elementos migrados

---

### 3.2 🟡 Cores Hardcoded → CSS Variables

**Mapeamento:**
```css
:root {
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #6366f1;
}
.dark { --color-primary: #60a5fa; --color-success: #34d399; }
```

**Critério de Aceite:**
- [ ] 0 hex hardcoded nos top 5 componentes
- [ ] Paleta adapta em todos os temas + alto contraste

---

### 3.3 🟢 Dark Mode — Fallbacks Incompletos

**Diagnóstico:** Alguns componentes usam `var(--bg-secondary, rgba(...))` com fallback, mas outros usam `rgba(...)` direto.

**Critério de Aceite:**
- [ ] Todos os fundos usam CSS variables com fallback

---

## 🏃 SPRINT 4 — Segurança, LGPD & Performance
**Foco:** Atender requisitos legais pendentes + otimizações.
**Estimativa:** 2-3 sessões de trabalho

---

### 4.1 🟡 Audit Log Completo (Art. 37 LGPD)

**Novo: tabela `audit_log` no Supabase:**
```sql
CREATE TABLE audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id),
  actor_id uuid,
  actor_role text,
  action text NOT NULL,        -- 'view', 'create', 'update', 'delete', 'export'
  resource_type text NOT NULL,  -- 'student', 'pei', 'paee', 'diagnostica'
  resource_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);
```

**Helper:**
```typescript
// lib/audit.ts
export async function logAction(params: {
  workspaceId: string; actorId: string; actorRole: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'export';
  resourceType: string; resourceId?: string;
}): Promise<void>
```

**Critério de Aceite:**
- [ ] Tabela criada
- [ ] APIs de estudante/PEI/PAEE registram ações
- [ ] Painel de auditoria para master

---

### 4.2 🟡 Exportação de Dados (Portabilidade — Art. 18)

**Diagnóstico (Kimi K2):** Existe `/api/members/[id]/export` mas NÃO existe `/api/students/[id]/export`.

**API: `GET /api/students/[id]/export`**
- JSON completo: dados + PEI + PAEE + diagnósticas + diário
- Descriptografa campos sensíveis antes de exportar
- Requer permissão master

**Critério de Aceite:**
- [ ] API funcional
- [ ] Botão "Exportar dados" no perfil do estudante

---

### 4.3 🟡 Cache para Resultados de IA (Gap Kimi K2)

**Diagnóstico (Kimi K2):** A API `/api/pei/adaptar-plano` chama a IA toda vez sem cache. Se o professor clicar múltiplas vezes, gera custo desnecessário.

**Ação:** Verificar se `ai-cache.ts` (já existe com 2.5KB) está sendo usado nas APIs críticas:
- `/api/pei/adaptar-plano`
- `/api/avaliacao-diagnostica/criar-item`
- `/api/hub/criar-atividade`

**Critério de Aceite:**
- [ ] Cache LRU ativo nas 3 APIs acima
- [ ] TTL de 1h para adaptações
- [ ] TTL de 30min para diagnósticas

---

### 4.4 🟢 Rotação de Token (Sessão)

**Futuro:** Access token 15min + refresh token 7 dias.

---

## 🏃 SPRINT 5 — Refatoração de Componentes Gigantes
**Foco:** Quebrar os monolitos em sub-componentes testáveis.
**Estimativa:** 4-5 sessões de trabalho

---

### 5.1 🔴 Refatorar PEIClient.tsx (5.723 linhas)

**Estrutura proposta:**
```
app/(dashboard)/pei/
├── PEIClient.tsx                → Container (< 500 linhas)
├── components/
│   ├── PEITabEstudante.tsx      → Tab 1: Dados do estudante
│   ├── PEITabEvidencias.tsx     → Tab 2: Evidências e laudos
│   ├── PEITabRede.tsx           → Tab 3: Rede de apoio
│   ├── PEITabMapeamento.tsx     → Tab 4: Barreiras e potencialidades
│   ├── PEITabPlano.tsx          → Tab 5: Plano estratégico
│   ├── PEITabMonitoramento.tsx  → Tab 6: Monitoramento
│   ├── PEITabBNCC.tsx           → Tab 7: Habilidades BNCC
│   ├── PEITabConsultoria.tsx    → Tab 8: IA consultoria
│   └── PEITabDashboard.tsx      → Tab 9: Dashboard individual
├── hooks/
│   ├── usePEIData.ts            → Gerencia estado do formulário
│   ├── usePEISave.ts            → Lógica de salvamento
│   └── usePEINavigation.ts      → Navegação entre tabs
└── lib/
    └── pei-helpers.ts           → Funções utilitárias
```

**Critério de Aceite:**
- [ ] Container < 500 linhas
- [ ] Cada tab em componente separado
- [ ] Hooks extraídos para lógica reutilizável
- [ ] 0 regressões de funcionalidade

---

### 5.2 🔴 Refatorar AvaliacaoDiagnosticaClient.tsx (4.442 linhas)

**Estrutura proposta (alinhada com sugestão Kimi K2):**
```
app/(dashboard)/avaliacao-diagnostica/
├── AvaliacaoDiagnosticaClient.tsx  → Container (< 400 linhas)
├── components/
│   ├── SelecaoEstudante.tsx        → Seleção de aluno/disciplina
│   ├── ConfiguracaoAvaliacao.tsx   → Parâmetros de geração
│   ├── GeracaoQuestoes.tsx         → Geração progressiva
│   ├── CardQuestao.tsx             → Card individual com distratores
│   ├── GerenciamentoImagens.tsx    → Sistema de imagens
│   ├── GabaritoRespostas.tsx       → Aplicação do gabarito
│   ├── AnaliseResultado.tsx        → Análise qualitativa
│   └── PerfilFuncionamento.tsx     → Camada B (NEE)
├── hooks/
│   ├── useGeracaoQuestoes.ts
│   ├── useImagensQuestoes.ts
│   └── useAnaliseResultado.ts
```

---

### 5.3 🟡 Refatorar HubClient.tsx (3.785 linhas)

**Estrutura proposta:**
```
app/(dashboard)/hub/
├── HubClient.tsx                → Container (< 400 linhas)
├── components/
│   ├── HubToolGrid.tsx          → Grid de 14 ferramentas
│   ├── HubAdaptarAtividade.tsx  → Adaptar atividade
│   ├── HubAdaptarProva.tsx      → Adaptar prova
│   ├── HubCriarDoZero.tsx       → Criar atividade
│   ├── HubEstudioVisual.tsx     → Estúdio visual
│   ├── HubRoteiro.tsx           → Roteiro individual
│   └── HubResultado.tsx         → Resultado gerado
```

---

### 5.4 🟡 Simplificar IDs Virtuais no PEI Regente (Gap Kimi K2)

**Diagnóstico (Kimi K2):** Alunos extras recebem IDs virtuais `virtual_${s.id}_${disc}` e verificações `!String(id).startsWith("virtual_")` estão espalhadas pelo código.

**Ação:** Criar helper function:
```tsx
// lib/pei-helpers.ts
export function isVirtualId(id: string): boolean { return id.startsWith("virtual_"); }
export function getRealId(id: string): string { return id.replace(/^virtual_[^_]+_/, ""); }
```

**Critério de Aceite:**
- [ ] Helper functions centralizadas
- [ ] Verificações inline substituídas

---

## 🏃 SPRINT 6 — Testes & Qualidade Pedagógica
**Foco:** Cobrir módulos sem testes + melhorias pedagógicas.
**Estimativa:** 4-5 sessões de trabalho

---

### 6.1 🔴 Testes de Integração — Módulos Críticos

**8 novos arquivos de teste:**

| Arquivo | Endpoints | Cenários |
|---------|-----------|----------|
| `api-avaliacao-diagnostica.test.ts` | POST criar-item, GET, PATCH, DELETE | Gerar, salvar, gabarito |
| `api-pei-regente.test.ts` | GET meus-alunos, PATCH fase | Listar, avançar |
| `api-pei-disciplina.test.ts` | POST, PATCH, GET | CRUD disciplinas |
| `api-paee.test.ts` | POST ciclo, PATCH, GET | Ciclos CRUD |
| `api-diario.test.ts` | POST, GET, DELETE | Registros CRUD |
| `api-monitoramento.test.ts` | GET stats, rubricas | Dashboard |
| `api-plano-curso.test.ts` | POST, PATCH, GET, DELETE | CRUD planos |
| `api-admin.test.ts` | POST workspace, PATCH config | Customizações |

---

### 6.2 🟡 Testes de Componentes React (RTL)

| Componente | O que testar |
|-----------|-------------|
| `Navbar.tsx` | Renderiza, links, permissões, aria-labels |
| `StudentSelector.tsx` | Seleção, filtro, acessibilidade |
| `PageHero.tsx` | Renderiza com cada tema |
| `OmniLoader.tsx` | Variantes |
| `FormattedTextDisplay.tsx` | Markdown → HTML |

---

### 6.3 🟡 E2E — Fluxos Completos (Playwright)

| Spec | Fluxo |
|------|-------|
| `e2e/diagnostica.spec.ts` | Login → aluno → gerar → gabarito |
| `e2e/hub.spec.ts` | Login → aluno → gerar atividade |
| `e2e/pei-regente.spec.ts` | Login professor → ponte pedagógica |
| `e2e/familia.spec.ts` | Login família → ciência PEI |

---

### 6.4 🟡 Melhorias Pedagógicas (Sugestões Kimi K2)

#### 6.4.1 Mapeamento Barreira → Tipo de Imagem na Diagnóstica

**Diagnóstico (Kimi K2):** As imagens na diagnóstica são geradas sem considerar a barreira específica do estudante. Falta mapeamento inteligente.

**Ação:** Criar `lib/avaliacao-imagens-barreiras.ts`:
```tsx
export const MAPEAMENTO_IMAGEM_BARREIRA = {
  'tea_inferencia': { tipo: 'sequencia', descricao: '3-4 imagens causa-efeito...' },
  'tea_abstracao': { tipo: 'concreto', descricao: 'Objeto realista, isolado...' },
  'di_memoria_trabalho': { tipo: 'organizacao', descricao: 'Organizador visual...' },
  'ta_dislexia': { tipo: 'simbolico', descricao: 'Símbolos visuais...' },
  'ta_tdah': { tipo: 'comparacao', descricao: 'Duas imagens lado a lado...' },
};
```

#### 6.4.2 Vincular Av. Processual ao PEI Regente

**Ação:** Badge no PEI Regente quando há avaliações processuais pendentes.

#### 6.4.3 Conectar PGI ao Dashboard Institucional

**Ação:** Ações do PGI alimentam métricas do Monitoramento.

#### 6.4.4 Hub — "Meus Materiais Salvos"

**Ação:** Permitir salvar e reutilizar materiais gerados.

---

## 📅 CRONOGRAMA SUGERIDO

```
SPRINT 0 — Limpeza (1 sessão)
├── Sessão 1: Remover console.logs + consolidar rotas

SPRINT 1 — Acessibilidade & Alto Contraste (3 sessões)
├── Sessão 2: ThemeProvider + CSS Alto Contraste
├── Sessão 3: aria-labels (11 componentes) + aria-live
└── Sessão 4: Landmarks HTML5 + Focus indicators + Skip-link

SPRINT 2 — Usabilidade & Auto-Save (3 sessões)
├── Sessão 5: Hook useAutoSave + PEI + PEI Regente
├── Sessão 6: Toast global + Skeleton placeholders
└── Sessão 7: Mobile responsive Diagnóstica + polimento

SPRINT 3 — Coerência Visual (3-4 sessões)
├── Sessão 8: Classes omni-card/omni-badge no globals.css
├── Sessão 9: Migrar Diagnóstica + PEI Regente
├── Sessão 10: CSS Variables para cores
└── Sessão 11: Dark mode fallbacks

SPRINT 4 — Segurança & LGPD (2-3 sessões)
├── Sessão 12: Tabela audit_log + helper logAction
├── Sessão 13: API exportação estudante + cache IA
└── Sessão 14: Integrar logAction nas APIs

SPRINT 5 — Refatoração de Componentes (4-5 sessões)
├── Sessão 15: PEIClient.tsx → 9 sub-componentes
├── Sessão 16: PEIClient.tsx → hooks extraídos
├── Sessão 17: AvaliacaoDiagnosticaClient.tsx → 8 sub-componentes
├── Sessão 18: HubClient.tsx → 7 sub-componentes
└── Sessão 19: PAEEClient.tsx + helpers virtuais

SPRINT 6 — Testes & Qualidade (4-5 sessões)
├── Sessão 20: 4 testes integração (Diagnóstica, PEI, PAEE, Diário)
├── Sessão 21: 4 testes integração (Plano, Monitor, Admin, Regente)
├── Sessão 22: 5 testes componentes React
├── Sessão 23: 4 E2E specs Playwright
└── Sessão 24: Melhorias pedagógicas (imagens barreira, processual)
```

**Total: ~24 sessões de trabalho**

---

## 🏆 MÉTRICAS DE SUCESSO

| Dimensão | Antes | Meta |
|----------|-------|------|
| **Funcionalidade** | 9/10 | 9.5/10 |
| **Coerência Pedagógica** | 8/10 | 9/10 |
| **Usabilidade/A11y** | 7/10 | **9.5/10** ⬆️ |
| **Visual/Estética** | 8/10 | 9/10 ⬆️ |
| **Segurança/LGPD** | 8.5/10 | 9.5/10 ⬆️ |
| **Testes** | 6/10 | **8.5/10** ⬆️ |
| **Código (manutenibilidade)** | 5/10 | **8/10** ⬆️ |

### Checklist de Conformidade Final
- [ ] WCAG AA em todos os temas (contraste mínimo 4.5:1)
- [ ] WCAG AAA com Alto Contraste ativado (7:1)
- [ ] LGPD Art. 37 — Audit log completo
- [ ] LGPD Art. 18 — Exportação de dados funcional
- [ ] 80%+ cobertura de API endpoints com testes
- [ ] E2E para os 4 fluxos pedagógicos críticos
- [ ] 0 botões de ícone sem aria-label
- [ ] 0 console.log de debug em produção
- [ ] Auto-save nos 4 formulários longos
- [ ] Nenhum componente > 1.500 linhas
- [ ] Cache IA ativo nas APIs custosas

---

## 📝 Créditos da Análise

| Analista | Contribuição |
|----------|-------------|
| **Antigravity** | Auditoria 5 dimensões, fix diagnóstica, fix PEI Regente, plano de ação |
| **Kimi K2** | Análise profunda do fluxo PEI-Professor, gaps de imagens, IDs virtuais, console.logs, componentes gigantes, cache IA, prompt engineering |
| **Cruzamento** | Validação cruzada de 100% dos achados no código-fonte |
