# 🎯 Plano de Ação Pós-Auditoria — Omnisfera
**Criado:** 06/03/2026 · **Baseado na Auditoria:** `AUDITORIA_COMPLETA_OMNISFERA_20260306.md`

---

## Estrutura

O plano está dividido em **5 Sprints** de complexidade crescente.
Cada item tem: prioridade, estimativa, arquivos afetados e critério de aceite.

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
  /* Textos: máximo contraste */
  --text-primary: #000000;
  --text-secondary: #1a1a1a;
  --text-muted: #333333;
  
  /* Fundos: sólidos */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  
  /* Bordas: visíveis */
  --border-default: #000000;
  --border-subtle: #666666;
  
  /* Focus: ultra-visível */
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

/* Overrides globais quando high-contrast ativo */
html.high-contrast * {
  text-shadow: none !important;
}

html.high-contrast a {
  text-decoration: underline !important;
}

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

**ThemeProvider — Mudanças:**
```tsx
// Estado adicional
const [highContrast, setHighContrast] = useState(false);

// Efeito para aplicar classe
useEffect(() => {
  document.documentElement.classList.toggle('high-contrast', highContrast);
  localStorage.setItem('omni-high-contrast', String(highContrast));
}, [highContrast]);

// Carregar do localStorage
useEffect(() => {
  const saved = localStorage.getItem('omni-high-contrast');
  if (saved === 'true') setHighContrast(true);
}, []);
```

**ThemeToggle — Adicionar Switch:**
```tsx
<div className="flex items-center gap-2 mt-2 pt-2 border-t">
  <Eye size={14} />
  <span className="text-xs">Alto Contraste</span>
  <Switch checked={highContrast} onChange={setHighContrast} />
</div>
```

**Critério de Aceite:**
- [ ] Toggle visível no ThemeToggle de todas as páginas
- [ ] Funciona com Light + Alto Contraste
- [ ] Funciona com Dark + Alto Contraste
- [ ] Funciona com Notebook + Alto Contraste
- [ ] Persistência via localStorage
- [ ] Textos sem opacity, bordas visíveis, focus ring grosso
- [ ] Contraste mínimo 7:1 (WCAG AAA)

---

### 1.2 🔴 aria-label em Todos os Botões de Ícone

**Diagnóstico:** Apenas 2 de 55 componentes usam `aria-label`.

**Arquivos a modificar (prioridade):**

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

**Padrão a seguir:**
```tsx
// ❌ Errado
<button onClick={toggle}><Sun size={16} /></button>

// ✅ Correto
<button onClick={toggle} aria-label="Alternar tema para modo claro">
  <Sun size={16} />
</button>
```

**Critério de Aceite:**
- [ ] 0 botões com apenas ícone sem aria-label
- [ ] Texto dos aria-label em português
- [ ] Navegação por teclado funcional com Tab

---

### 1.3 🟡 Landmarks Semânticos (HTML5)

**Adicionar ao layout.tsx do dashboard:**
```tsx
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

**Adicionar skip-link no layout:**
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute ...">
  Pular para o conteúdo principal
</a>
```

**Critério de Aceite:**
- [ ] `<nav>`, `<main>`, `<footer>` no layout
- [ ] Skip-link funcional

---

### 1.4 🟡 Focus Indicators Customizados

**Adicionar ao globals.css:**
```css
/* Focus ring que funciona em todos os temas */
*:focus-visible {
  outline: 2px solid var(--focus-color, #3b82f6);
  outline-offset: 2px;
  border-radius: 4px;
}

.dark *:focus-visible {
  --focus-color: #60a5fa;
}

.notebook *:focus-visible {
  --focus-color: #6366f1;
}
```

**Critério de Aceite:**
- [ ] Focus ring visível em Light, Dark e Notebook
- [ ] Todos os elementos interativos respondem ao Tab

---

## 🏃 SPRINT 2 — Usabilidade & Auto-Save
**Foco:** Proteger o trabalho do professor e melhorar a experiência.
**Estimativa:** 2-3 sessões de trabalho

---

### 2.1 🔴 Auto-Save em Formulários Longos

**Conceito:** Salvamento automático com debounce de 2 segundos após última alteração. Indicador visual discreto: "💾 Rascunho salvo" ou "⏳ Salvando..."

**Módulos afetados:**

| Módulo | Componente | Estratégia |
|--------|-----------|------------|
| **PEI** | `PEIClient.tsx` | Debounce PATCH a `/api/students/[id]` com `pei_data` parcial |
| **PEI Regente** | `PEIRegenteClient.tsx` | Debounce PATCH a `/api/pei/disciplina` |
| **Plano de Curso** | `PlanoCursoEditor.tsx` | Debounce PATCH a `/api/plano-curso` |
| **PAEE** | `PAEEClient.tsx` | Debounce PATCH com `paee_ciclos` parcial |

**Hook reutilizável a criar:**
```tsx
// hooks/useAutoSave.ts
function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  options?: { debounceMs?: number; enabled?: boolean }
): { status: 'idle' | 'saving' | 'saved' | 'error'; lastSaved: Date | null }
```

**Indicador visual:**
```tsx
// components/AutoSaveIndicator.tsx
// Discreto no canto: "✓ Salvo às 14:32" ou "⏳ Salvando..."
```

**Critério de Aceite:**
- [ ] Hook `useAutoSave` reutilizável
- [ ] PEI, PEI Regente, Plano de Curso com auto-save
- [ ] Indicador visual "Salvo" / "Salvando"
- [ ] Sem conflito com salvamento manual (botão "Salvar")
- [ ] Debounce de 2s (sem spam no backend)

---

### 2.2 🟡 Toast Global Padronizado

**Situação atual:** Cada módulo cria seu próprio `toast` state. Inconsistente.

**Solução:** Context Provider global.

```
Arquivos:
├── contexts/ToastContext.tsx        → Provider + hook useToast()
├── components/ToastContainer.tsx    → Render portal no layout
└── Refactoring em cada módulo       → Substituir setState local por useToast()
```

**API:**
```tsx
const { toast } = useToast();
toast.success("PEI salvo com sucesso");
toast.error("Erro ao salvar");
toast.info("Rascunho salvo automaticamente");
```

**Critério de Aceite:**
- [ ] `useToast()` hook global
- [ ] Tipos: success, error, info, warning
- [ ] Auto-dismiss em 4 segundos
- [ ] Empilhável (até 3 simultâneos)
- [ ] Animação de entrada/saída

---

### 2.3 🟡 Skeleton Placeholders para Transições

**Onde:** Hub (troca de estudante), PEI (troca de tab), Diagnóstica (troca de disciplina).

```
Arquivos:
├── components/SkeletonCard.tsx      → Card genérico com shimmer
├── components/SkeletonText.tsx      → Linhas de texto com shimmer
└── Aplicar onde hoje aparece "branco" durante loading
```

**Critério de Aceite:**
- [ ] Skeleton com animação shimmer
- [ ] Aplicado no Hub ao trocar estudante
- [ ] Aplicado na Diagnóstica ao carregar questões

---

## 🏃 SPRINT 3 — Coerência Visual & Theming
**Foco:** Harmonia entre todos os elementos; inline styles → CSS classes.
**Estimativa:** 3-4 sessões de trabalho

---

### 3.1 🟡 Migrar Inline Styles para CSS Variables

**Estratégia:** Não reescrever tudo de uma vez. Criar classes utilitárias no `globals.css` que espelham os padrões inline mais usados, depois substituir gradualmente.

**Padrão identificado (mais repetido):**

```css
/* Cards padrão omnisfera */
.omni-card {
  border-radius: 14px;
  padding: 18px 22px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
}

.omni-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-default);
}

.omni-card-body {
  padding: 14px 18px;
}

/* Badges de nível */
.omni-badge { ... }
.omni-badge--success { ... }
.omni-badge--warning { ... }
.omni-badge--error { ... }

/* Textos */
.omni-text-primary { color: var(--text-primary); }
.omni-text-secondary { color: var(--text-secondary); }
.omni-text-muted { color: var(--text-muted); }

/* Escala tipográfica */
.omni-text-xs { font-size: 10px; }
.omni-text-sm { font-size: 12px; }
.omni-text-base { font-size: 14px; }
.omni-text-lg { font-size: 16px; }
.omni-text-xl { font-size: 18px; }
```

**Componentes com mais inline styles (prioridade de migração):**

| Componente | Linhas com style | Prioridade |
|-----------|-----------------|------------|
| `AvaliacaoDiagnosticaClient.tsx` | ~500+ | 1 |
| `PEIRegenteClient.tsx` | ~300+ | 2 |
| `PlanoCursoEditor.tsx` | ~200+ | 3 |
| `HubClient.tsx` | ~200+ | 4 |
| `HomeFeed.tsx` | ~100+ | 5 |

**Critério de Aceite:**
- [ ] Classes `omni-card`, `omni-badge`, `omni-text-*` definidas
- [ ] Top 3 componentes migrados (Diagnóstica, PEI Regente, Plano)
- [ ] Mesma aparência visual antes/depois
- [ ] Alto Contraste funciona nos elementos migrados

---

### 3.2 🟡 Cores Hardcoded → CSS Variables

**Objetivo:** Substituir hex diretos (`#3b82f6`) por `var(--color-xxx)` para que todos os 3 temas + alto contraste funcionem.

**Mapeamento:**
```css
:root {
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #6366f1;
  --color-accent: #8b5cf6;
}

.dark {
  --color-primary: #60a5fa;
  --color-success: #34d399;
  /* ... */
}
```

**Critério de Aceite:**
- [ ] 0 hex hardcoded nos top 5 componentes
- [ ] Paleta adapta em Light, Dark, Notebook
- [ ] Alto Contraste override funciona

---

### 3.3 🟢 Escala Tipográfica e Espaçamentos

**Definir no DS e aplicar gradualmente:**
```
Tipografia: 10 | 12 | 14 | 16 | 18 | 24 | 32
Espaçamento: 4 | 8 | 12 | 16 | 20 | 24 | 32 | 48
Border radius: 4 | 8 | 12 | 16
```

**Critério de Aceite:**
- [ ] Classes utilitárias `omni-space-*` definidas
- [ ] Documentado no DS

---

## 🏃 SPRINT 4 — Segurança & LGPD Completa
**Foco:** Atender requisitos legais pendentes.
**Estimativa:** 2 sessões de trabalho

---

### 4.1 🟡 Audit Log Completo (Art. 37 LGPD)

**Novo: tabela `audit_log` no Supabase:**
```sql
CREATE TABLE audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id),
  actor_id uuid,               -- quem fez a ação
  actor_role text,              -- master, member, family
  action text NOT NULL,         -- 'view', 'create', 'update', 'delete', 'export'
  resource_type text NOT NULL,  -- 'student', 'pei', 'paee', 'diagnostica'
  resource_id text,             -- id do recurso acessado
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_workspace ON audit_log(workspace_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
```

**Helper no backend:**
```typescript
// lib/audit.ts
export async function logAction(params: {
  workspaceId: string;
  actorId: string;
  actorRole: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'export';
  resourceType: 'student' | 'pei' | 'paee' | 'diagnostica' | 'hub';
  resourceId?: string;
  metadata?: Record<string, unknown>;
  req?: Request;
}): Promise<void>
```

**Critério de Aceite:**
- [ ] Tabela `audit_log` criada
- [ ] Todas as APIs de estudante registram ações
- [ ] APIs de PEI/PAEE registram ações
- [ ] Painel de auditoria visível para master (Configurações > Auditoria)

---

### 4.2 🟡 Exportação de Dados (Portabilidade — Art. 18)

**API: `GET /api/students/[id]/export`**
- Retorna JSON completo: dados do estudante + PEI + PAEE + diagnósticas + diário
- Descriptografa campos sensíveis antes de exportar
- Requer permissão master ou platform admin
- Formato: JSON (legível por máquina) + opção PDF (legível por humano)

**Critério de Aceite:**
- [ ] API funcional
- [ ] Botão "Exportar dados" no perfil do estudante (visível para master)
- [ ] JSON inclui TODOS os dados do estudante

---

### 4.3 🟢 Rotação de Token (Sessão)

**Futura implementação:**
- Access token com TTL de 15 minutos
- Refresh token com TTL de 7 dias
- Rotação automática no middleware

**Critério de Aceite:**
- [ ] JWT com expiração curta
- [ ] Refresh automático transparente

---

## 🏃 SPRINT 5 — Testes & Robustez
**Foco:** Cobrir os módulos sem testes e garantir estabilidade.
**Estimativa:** 3-4 sessões de trabalho

---

### 5.1 🔴 Testes de Integração — Módulos Críticos

**Prioridade 1 (8 novos arquivos de teste):**

| Arquivo | Endpoints | Cenários |
|---------|-----------|----------|
| `api-avaliacao-diagnostica.test.ts` | POST criar-item, GET, PATCH, DELETE | Gerar, salvar, aplicar gabarito |
| `api-pei-regente.test.ts` | GET meus-alunos, PATCH fase | Listar alunos, avançar fase |
| `api-pei-disciplina.test.ts` | POST, PATCH, GET | CRUD disciplinas PEI |
| `api-paee.test.ts` | POST ciclo, PATCH, GET | Ciclos CRUD |
| `api-diario.test.ts` | POST registro, GET, DELETE | Registros CRUD |
| `api-monitoramento.test.ts` | GET stats, GET rubricas | Dashboard data |
| `api-plano-curso.test.ts` | POST, PATCH, GET, DELETE | CRUD planos |
| `api-admin.test.ts` | POST workspace, PATCH config | Customizações |

**Critério de Aceite:**
- [ ] Cada arquivo com no mínimo 5 cenários
- [ ] Cobertura de happy path + edge cases
- [ ] Mock de Supabase (sem DB real)

---

### 5.2 🟡 Testes de Componentes React

**Usando Jest + React Testing Library:**

| Componente | O que testar |
|-----------|-------------|
| `Navbar.tsx` | Renderiza, links corretos, permissões |
| `StudentSelector.tsx` | Seleção, filtro, aria-label |
| `PageHero.tsx` | Renderiza com cada tema |
| `OmniLoader.tsx` | Variantes (card, page, inline) |
| `FormattedTextDisplay.tsx` | Markdown → HTML correto |

**Critério de Aceite:**
- [ ] 5 componentes com testes de renderização
- [ ] Verificação de aria-labels
- [ ] Snapshot tests para regressão visual

---

### 5.3 🟡 E2E — Fluxos Completos

**Novos specs Playwright:**

| Spec | Fluxo |
|------|-------|
| `e2e/diagnostica.spec.ts` | Login → selecionar aluno → gerar avaliação → gabarito |
| `e2e/hub.spec.ts` | Login → selecionar aluno → gerar atividade → download |
| `e2e/pei-regente.spec.ts` | Login professor → ver alunos → ponte pedagógica |
| `e2e/familia.spec.ts` | Login família → ver estudante → ciência PEI |

**Critério de Aceite:**
- [ ] Cada spec executa sem intervenção
- [ ] Screenshots de evidência em CI

---

## 📅 CRONOGRAMA SUGERIDO

```
SPRINT 1 — Acessibilidade & Alto Contraste
├── Sessão 1: ThemeProvider + CSS Alto Contraste
├── Sessão 2: aria-labels nos 11 componentes prioritários
└── Sessão 3: Landmarks HTML5 + Focus indicators + Testes

SPRINT 2 — Usabilidade & Auto-Save
├── Sessão 4: Hook useAutoSave + PEI + PEI Regente
├── Sessão 5: Toast global + Skeleton placeholders
└── Sessão 6: Plano de Curso auto-save + polimento

SPRINT 3 — Coerência Visual
├── Sessão 7: Classes omni-card/omni-badge/omni-text no globals.css
├── Sessão 8: Migrar Diagnóstica + PEI Regente
├── Sessão 9: CSS Variables para cores + Dark/Notebook adaptar
└── Sessão 10: Escala tipográfica + espaçamentos

SPRINT 4 — Segurança & LGPD
├── Sessão 11: Tabela audit_log + helper logAction
├── Sessão 12: API de exportação + UI no perfil do estudante
└── Sessão 13: Integrar logAction nas APIs críticas

SPRINT 5 — Testes
├── Sessão 14: 4 testes de integração (Diagnóstica, PEI, PAEE, Diário)
├── Sessão 15: 4 testes de integração (Plano, Monitor, Admin, Regente)
├── Sessão 16: 5 testes de componentes React
└── Sessão 17: 4 E2E specs Playwright
```

---

## 🏆 MÉTRICAS DE SUCESSO

Após completar todas as sprints, a Omnisfera deve atingir:

| Dimensão | Antes | Meta |
|----------|-------|------|
| **Funcionalidade** | 9/10 | 9.5/10 |
| **Coerência Pedagógica** | 8/10 | 9/10 |
| **Usabilidade/A11y** | 7/10 | 9/10 ⬆️ |
| **Visual/Estética** | 8/10 | 9/10 ⬆️ |
| **Segurança/LGPD** | 8.5/10 | 9.5/10 ⬆️ |
| **Testes** | 6/10 | 8.5/10 ⬆️ |

### Checklist de Conformidade Final
- [ ] WCAG AA em todos os temas (contraste mínimo 4.5:1)
- [ ] WCAG AAA com Alto Contraste ativado (7:1)
- [ ] LGPD Art. 37 — Audit log completo
- [ ] LGPD Art. 18 — Exportação de dados funcional
- [ ] 80%+ cobertura de API endpoints com testes
- [ ] E2E para os 4 fluxos pedagógicos críticos
- [ ] 0 botões de ícone sem aria-label
- [ ] Auto-save nos 4 formulários longos
