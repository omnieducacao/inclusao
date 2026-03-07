# 📋 Próximas Sessões — Roadmap Omnisfera

**Criado:** 06/03/2026 · **Baseado em:** Execução do Plano de Ação (Sprints 0-6)
**Status atual:** 24 itens concluídos | 13 itens pendentes | 514 testes (0 falhas)

---

## ✅ O que já foi feito (referência rápida)

| Sprint | Concluído |
|--------|-----------|
| 0 | Console.log cleanup (356 → 0) |
| 1 | Alto Contraste + aria-labels (45+ comp) + aria-live (5) + Skip-link + Landmarks + Focus |
| 2 | useAutoSave hook + ToastProvider + AutoSaveIndicator |
| 3 | CSS utility classes + Semantic color variables (3 temas + HC) |
| 4 | LGPD Audit Log + Student Export API |
| 5 | PEI Helpers + HubResultPanel + StatusBadge + EmptyState |
| 6 | 30 tests novos + fix auth.test (514/514 passing) |

---

## 🗓️ Sessões Restantes (organizadas por prioridade e risco)

### BLOCO A — Baixo Risco, Alto Impacto (2 sessões)

> Pode ser feito com segurança, sem risco de regressão.

---

#### 📌 Sessão A1 — Testes de Integração (APIs restantes)
**Estimativa:** 1 sessão · **Risco:** 🟢 Baixo

**O que fazer:**
1. `api-pei-regente.test.ts` — GET meus-alunos, PATCH fase
2. `api-paee.test.ts` — POST ciclo, PATCH, GET
3. `api-diario.test.ts` — POST, GET, DELETE registros
4. `api-plano-curso.test.ts` — POST, PATCH, GET, DELETE

**Como começar:**
```
"Crie os 4 testes de integração listados na Sessão A1 do PROXIMAS_SESSOES.md"
```

**Critério de aceite:**
- [ ] 4 arquivos de teste novos
- [ ] ~20 cenários testados
- [ ] 0 regressões

---

#### 📌 Sessão A2 — Testes React (RTL) + Wire useAutoSave
**Estimativa:** 1 sessão · **Risco:** 🟢 Baixo

**O que fazer:**
1. Setup jsdom no vitest.config.ts para testes de componente
2. Testes React Testing Library para:
   - `Navbar.tsx` — renderiza, links, permissões
   - `OmniLoader.tsx` — variantes (inline, card, overlay)
   - `FormattedTextDisplay.tsx` — markdown → HTML
   - `StatusBadge.tsx` — 10 estados
   - `EmptyState.tsx` — com e sem ação
3. Wire `useAutoSave` no `PlanoCursoEditor.tsx` (mais simples dos 4)

**Dependências:**
- Instalar: `npm i -D @testing-library/react @testing-library/jest-dom jsdom`

**Como começar:**
```
"Execute a Sessão A2 do PROXIMAS_SESSOES.md — testes React + wire auto-save"
```

**Critério de aceite:**
- [ ] 5 arquivos de teste de componente
- [ ] jsdom environment configurado
- [ ] useAutoSave integrado no Plano de Curso

---

### BLOCO B — Risco Médio, UI/UX (2 sessões)

> Melhorias visuais que precisam de verificação no browser.

---

#### 📌 Sessão B1 — Migrar Inline Styles (Big 3)
**Estimativa:** 1-2 sessões · **Risco:** 🟡 Médio

**O que fazer:**
1. Substituir inline `style={{}}` por classes `.omni-card`, `.omni-badge`, `.omni-btn` nos:
   - `PEIRegenteClient.tsx` (~300 linhas com style)
   - `EstudantesClient.tsx` (~100 linhas com style)
   - `GestaoClient.tsx` (~150 linhas com style)
2. Verificar visualmente cada componente migrado (Light, Dark, Notebook, HC)

**⚠️ NÃO migrar ainda:**
- PEIClient (5.7K linhas) — adiado para refatoração completa
- AvaliacaoDiagnosticaClient (4.4K) — adiado
- HubClient (3.7K) — adiado

**Como começar:**
```
"Execute a Sessão B1 — migrar inline styles para classes CSS nos 3 componentes médios"
```

**Critério de aceite:**
- [ ] 3 componentes migrados
- [ ] Build ✅
- [ ] Visual idêntico nos 4 temas (verificar no browser)

---

#### 📌 Sessão B2 — Skeleton Placeholders + Mobile Diagnóstica
**Estimativa:** 1 sessão · **Risco:** 🟡 Médio

**O que fazer:**
1. Criar `components/Skeleton.tsx` (componente reutilizável com shimmer)
2. Aplicar skeleton em:
   - Hub: troca de estudante
   - PEI: troca de tab
   - Diagnóstica: troca de disciplina
3. Stack vertical das alternativas de questão em mobile (< 640px)
4. Botão "Exportar Dados" no perfil do estudante (UI para API existente)

**Como começar:**
```
"Execute a Sessão B2 — skeleton placeholders + mobile responsive diagnóstica"
```

**Critério de aceite:**
- [ ] Skeleton visível durante loading
- [ ] Alternativas empilham em mobile
- [ ] Botão exportar funcional

---

### BLOCO C — Alto Risco, Alta Recompensa (4-5 sessões)

> Refatorações de monolitos. Cada sessão DEVE ter verificação visual completa.
> ⚠️ Sugestão: fazer em branch separada e merge após validação.

---

#### 📌 Sessão C1 — Refatorar PEIClient.tsx — Hooks
**Estimativa:** 1 sessão · **Risco:** 🔴 Alto

**Objetivo:** Extrair lógica de estado para hooks, SEM mudar o JSX ainda.

**O que fazer:**
```
app/(dashboard)/pei/
├── hooks/
│   ├── usePEIData.ts         → Estado do formulário (peiData, loading, error)
│   ├── usePEISave.ts         → Lógica de save/auto-save
│   └── usePEINavigation.ts   → Tabs, student selection, URL sync
```

**Estratégia:** Extrair hooks um por vez. Testar após cada extração.

**Como começar:**
```
"Execute Sessão C1 — extrair hooks do PEIClient. Crie branch 'refactor/pei-hooks' antes."
```

**Critério de aceite:**
- [ ] 3 hooks extraídos
- [ ] PEIClient importa os hooks (mesmo JSX, sem regressão)
- [ ] Branch separada com build ✅

---

#### 📌 Sessão C2 — Refatorar PEIClient.tsx — Sub-componentes
**Estimativa:** 2 sessões · **Risco:** 🔴 Alto

**Depende de:** Sessão C1 (hooks extraídos)

**O que fazer:**
```
app/(dashboard)/pei/components/
├── PEITabEstudante.tsx       → Tab 1: Dados do estudante
├── PEITabEvidencias.tsx      → Tab 2: Evidências e laudos
├── PEITabRede.tsx            → Tab 3: Rede de apoio
├── PEITabMapeamento.tsx      → Tab 4: Barreiras e potencialidades
├── PEITabPlano.tsx           → Tab 5: Plano estratégico
├── PEITabMonitoramento.tsx   → Tab 6: Monitoramento
├── PEITabBNCC.tsx            → Tab 7: Habilidades BNCC
├── PEITabConsultoria.tsx     → Tab 8: IA consultoria
└── PEITabDashboard.tsx       → Tab 9: Dashboard individual
```

**Meta:** PEIClient.tsx de 5.723 → < 500 linhas (container puro)

**Critério de aceite:**
- [ ] Container < 500 linhas
- [ ] 9 tab components
- [ ] Visual e funcional idêntico (verificar CADA tab)
- [ ] Merge na main após validação

---

#### 📌 Sessão C3 — Refatorar HubClient.tsx
**Estimativa:** 1-2 sessões · **Risco:** 🔴 Alto

**O que fazer:**
```
app/(dashboard)/hub/components/
├── HubToolGrid.tsx           → Grid de 14 ferramentas
├── HubCriarDoZero.tsx        → Criar atividade (lines 275-993)
├── HubCriarItens.tsx         → Criar itens INEP (lines 995-1025)
├── HubPlanoAulaDua.tsx       → Plano de Aula (lines 1232-1657)
├── HubAdaptarProva.tsx       → Adaptar Prova (lines 1937-2440)
├── HubAdaptarAtividade.tsx   → Adaptar Atividade (lines 3181-3778)
├── HubEstudioVisual.tsx      → Estúdio Visual (lines 2953-3179)
├── HubRoteiroIndividual.tsx  → Roteiro (lines 2442-2696)
└── HubDinamicaInclusiva.tsx  → Dinâmica (lines 2698-2951)
```

**Meta:** HubClient.tsx de 3.785 → < 400 linhas

**Critério de aceite:**
- [ ] Container < 400 linhas
- [ ] 8+ sub-componentes
- [ ] Todas as ferramentas funcionam (testar cada uma)

---

#### 📌 Sessão C4 — Refatorar AvaliacaoDiagnosticaClient.tsx
**Estimativa:** 2 sessões · **Risco:** 🔴 Alto

**O que fazer:**
```
app/(dashboard)/avaliacao-diagnostica/components/
├── SelecaoEstudante.tsx       → Seleção de aluno/disciplina
├── ConfiguracaoAvaliacao.tsx  → Parâmetros de geração
├── GeracaoQuestoes.tsx        → Geração progressiva
├── CardQuestao.tsx            → Card individual com distratores
├── GerenciamentoImagens.tsx   → Sistema de imagens
├── GabaritoRespostas.tsx      → Aplicação do gabarito
├── AnaliseResultado.tsx       → Análise qualitativa
└── PerfilFuncionamento.tsx    → Camada B (NEE)
```

**Meta:** AvaliacaoDiagnosticaClient.tsx de 4.442 → < 400 linhas

---

### BLOCO D — Futuro / Nice-to-have (3+ sessões)

> Podem ser feitas a qualquer momento, sem dependências.

---

#### 📌 Sessão D1 — E2E com Playwright
**O que fazer:**
1. Setup Playwright: `npx playwright init`
2. 4 specs de fluxo completo:
   - `diagnostica.spec.ts` — Login → aluno → gerar → gabarito
   - `hub.spec.ts` — Login → aluno → gerar atividade
   - `pei-regente.spec.ts` — Login professor → ponte pedagógica
   - `familia.spec.ts` — Login família → ciência PEI

---

#### 📌 Sessão D2 — Cache IA + Rotação de Token
**O que fazer:**
1. Verificar se `ai-cache.ts` está ativo nas 3 APIs custosas
2. Implementar rotação de token (access 15min + refresh 7 dias)

---

#### 📌 Sessão D3 — Melhorias Pedagógicas
**O que fazer:**
1. Mapeamento barreira → tipo de imagem na Diagnóstica
2. Badge avaliação processual no PEI Regente
3. PGI → Monitoramento dashboard feed
4. Hub "Meus Materiais Salvos"

---

## 📅 Sugestão de Ordem de Execução

```
Semana 1:
  ├── Sessão A1 (testes integração)      ← 🟢 Seguro
  └── Sessão A2 (testes React + wire)    ← 🟢 Seguro

Semana 2:
  ├── Sessão B1 (inline → classes CSS)   ← 🟡 Visual check
  └── Sessão B2 (skeleton + mobile)      ← 🟡 Visual check

Semana 3:
  ├── Sessão C1 (PEI hooks)              ← 🔴 Branch separada!
  └── Sessão C2a (PEI sub-components 1)  ← 🔴 Branch separada!

Semana 4:
  ├── Sessão C2b (PEI sub-components 2)  ← 🔴 Merge após validar
  └── Sessão C3 (Hub refactor)           ← 🔴 Branch separada!

Semana 5:
  ├── Sessão C4a (Diagnóstica refactor)  ← 🔴 Branch separada!
  └── Sessão C4b (Diagnóstica refactor)  ← 🔴 Merge após validar

A partir da Semana 6:
  ├── D1 (Playwright E2E)
  ├── D2 (Cache + Token)
  └── D3 (Pedagógicas)
```

**Total: ~12 sessões restantes** (de ~24 originais, já fizemos ~12 numa única sessão consolidada)

---

## 🚀 Como iniciar cada sessão

Basta dizer:
- **"Execute a Sessão A1"** → eu leio este arquivo e começo imediatamente
- **"Continue de onde paramos"** → eu verifico o git log e retomo
- **"Quero focar na refatoração do PEI"** → vou direto na Sessão C1

---

*Gerado em 06/03/2026 às 22:30 — Antigravity*
