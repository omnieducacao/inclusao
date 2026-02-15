# 📋 Relatório Técnico — Omnisfera
**Plataforma de Educação Inclusiva com Inteligência Artificial**

> Documento preparado para onboarding de novo desenvolvedor.
> Última atualização: 14 de fevereiro de 2026.

---

## 📌 Resumo Executivo

A **Omnisfera** é uma plataforma SaaS voltada para **educação inclusiva**, que auxilia professores e escolas a criar planos educacionais individualizados (PEI), gerar materiais adaptados com IA, e acompanhar o progresso de estudantes com necessidades especiais.

### Números do Projeto

| Métrica | Valor |
|---|---|
| Arquivos de código (TS/TSX) | **183** |
| Linhas de código | **~25.000** |
| Módulos (páginas) | **11** |
| Rotas de API | **~50** |
| Componentes reutilizáveis | **31** |
| Bibliotecas/utilitários | **34** |
| Testes automatizados | **88 testes** em 9 suítes |
| Commits no branch atual | **1.949** |
| Status dos testes | ✅ **100% passando** |

---

## 🏗️ Arquitetura Geral

### Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **Linguagem** | TypeScript | 5.x |
| **Frontend** | React | 19.2.3 |
| **Estilização** | Tailwind CSS + CSS Variables | 4.x |
| **Banco de Dados** | Supabase (PostgreSQL) | Cloud |
| **Autenticação** | JWT customizado (jose) | - |
| **IA — DeepSeek** | Via OpenAI SDK | engine "red" |
| **IA — Gemini** | @google/generative-ai | engine "yellow" |
| **IA — Claude** | @anthropic-ai/sdk | engine "green" |
| **IA — Kimi** | Via OpenRouter | engine "blue" |
| **IA — GPT-4o** | OpenAI nativo | engine "orange" |
| **Validação** | Zod | 4.x |
| **Testes** | Vitest | 4.0.18 |
| **PDF** | pdf-parse, jsPDF | - |
| **DOCX** | docx | 9.5.1 |
| **Monitoramento** | Sentry | 10.x |
| **Hospedagem** | Render.com | - |

### Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │   PEI   │ │  PAEE   │ │   Hub   │ │ Diário   │  │
│  │ 4.500L  │ │ 2.300L  │ │ 3.500L  │ │ 2.800L   │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬─────┘  │
│       │           │           │            │         │
│  ┌────┴───────────┴───────────┴────────────┴─────┐  │
│  │          API Routes (Next.js App Router)       │  │
│  │     /api/pei  /api/paee  /api/hub  /api/diario │  │
│  │     /api/bncc  /api/students  /api/auth ...    │  │
│  └────────────────────┬──────────────────────────┘  │
└───────────────────────┼─────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
│   Supabase   │ │  5 Engines  │ │   Serviços  │
│  PostgreSQL  │ │   de IA     │ │  Externos   │
│  (banco)     │ │  DeepSeek   │ │  Unsplash   │
│  RLS + JSONB │ │  Gemini     │ │  Sentry     │
│              │ │  Claude     │ │             │
│              │ │  Kimi       │ │             │
│              │ │  GPT-4o     │ │             │
└──────────────┘ └─────────────┘ └─────────────┘
```

---

## 📁 Estrutura de Pastas

```
nextjs-app/
├── app/                       # Rotas do Next.js (App Router)
│   ├── (auth)/                # Páginas de autenticação
│   │   └── login/             # Página de login
│   ├── (dashboard)/           # Páginas protegidas (logado)
│   │   ├── pei/               # Módulo PEI (o maior: ~4.500 linhas)
│   │   ├── paee/              # Módulo PAEE
│   │   ├── hub/               # Hub de Recursos IA
│   │   ├── diario/            # Diário de Bordo
│   │   ├── monitoramento/     # Evolução & Dados
│   │   ├── estudantes/        # Gestão de Estudantes
│   │   ├── gestao/            # Gestão de Usuários
│   │   ├── pgi/               # Plano de Gestão Inclusiva
│   │   ├── config-escola/     # Configuração da Escola
│   │   ├── infos/             # Central de Inteligência
│   │   ├── admin/             # Painel Admin da Plataforma
│   │   └── layout.tsx         # Layout com Navbar
│   ├── api/                   # Rotas de API (backend)
│   │   ├── auth/              # Login, logout, registro
│   │   ├── students/          # CRUD de estudantes
│   │   ├── pei/               # APIs do PEI (extrair/transcrever laudo)
│   │   ├── paee/              # APIs do PAEE
│   │   ├── hub/               # APIs do Hub (criar atividade, adaptar, etc.)
│   │   ├── bncc/              # APIs BNCC (habilidades, sugestão IA)
│   │   ├── monitoring/        # Monitoramento e métricas
│   │   ├── admin/             # APIs administrativas
│   │   ├── school/            # Config da escola
│   │   ├── members/           # Gestão de membros
│   │   └── ...
│   ├── globals.css            # CSS global + tema dark mode
│   ├── layout.tsx             # Layout raiz
│   └── page.tsx               # Landing page pública
│
├── components/                # Componentes React reutilizáveis (31)
│   ├── Navbar.tsx             # Barra de navegação superior
│   ├── ThemeProvider.tsx      # Provider de dark/light mode
│   ├── ThemeToggle.tsx        # Botão de alternância do tema
│   ├── GlobalSearch.tsx       # Busca global
│   ├── NotificationBell.tsx   # Sino de notificações
│   ├── PageHero.tsx           # Cabeçalho visual das páginas
│   ├── ModuleCardsLottie.tsx  # Cards animados dos módulos
│   ├── StudentSelector.tsx    # Seletor de estudantes
│   ├── GuidedTour.tsx         # Tour guiado para novos usuários
│   └── ...
│
├── lib/                       # Bibliotecas e utilitários (34)
│   ├── ai-engines.ts          # Motor multi-IA (DeepSeek/Gemini/Claude/etc.)
│   ├── auth.ts                # Lógica de autenticação
│   ├── bncc.ts                # Parser CSV das habilidades BNCC
│   ├── hub-prompts.ts         # Prompts do Hub (o maior: ~30KB)
│   ├── validation.ts          # Schemas Zod para todas as APIs
│   ├── permissions.ts         # Controle de permissões
│   ├── rate-limit.ts          # Rate limiting das APIs
│   ├── pei.ts                 # Serviço de dados PEI
│   ├── pei-pdf-export.ts      # Exportador PDF do PEI
│   ├── students.ts            # Serviço de dados de estudantes
│   ├── supabase.ts            # Cliente Supabase
│   ├── session.ts             # Gerência de sessão JWT
│   └── ...
│
├── hooks/                     # Hooks React personalizados
│   └── useAILoading.ts        # Estado global de loading da IA
│
├── __tests__/                 # Testes automatizados
│   ├── unit/                  # Testes unitários (5 suítes)
│   └── integration/           # Testes de integração (4 suítes)
│
├── data/                      # Dados estáticos
│   └── bncc_*.csv             # Habilidades BNCC em CSV
│
├── public/                    # Assets estáticos (98 arquivos)
│   ├── omni_icone.png         # Logo colorida
│   ├── logo-dark.png          # Logo branca (dark mode)
│   ├── lottie/                # Animações Lottie dos módulos
│   └── ...
│
├── middleware.ts               # Proteção de rotas (auth)
├── package.json                # Dependências
├── vitest.config.ts            # Config dos testes
└── next.config.ts              # Config do Next.js
```

---

## 🧩 Módulos Funcionais (11 páginas)

### 1. PEI — Plano Educacional Individualizado (`/pei`)
**O coração da plataforma.** É o módulo mais complexo (~4.500 linhas).

- **Função**: Permite criar, editar e exportar planos educacionais personalizados para estudantes com necessidades especiais.
- **Estrutura**: 10 abas (Início, Estudante, Evidências, Rede de Apoio, Mapeamento, Plano de Ação, Monitoramento, BNCC, Consultoria IA, Dashboard).
- **Funcionalidades-chave**:
  - Preenchimento de dados do estudante (diagnóstico, medicamentos, composição familiar)
  - Extração automática de laudo médico (PDF e imagem) via IA
  - Mapeamento de barreiras pedagógicas (5 áreas com níveis de suporte)
  - Seleção de habilidades BNCC (Educação Infantil, Fundamental, Médio)
  - Sugestão de habilidades por IA (DeepSeek) com contexto do aluno
  - Geração de plano completo por IA (3 engines disponíveis)
  - Exportação para PDF e DOCX
  - Versionamento de PEIs
  - Rede de apoio com transcrição de laudos por profissional
- **APIs envolvidas**: `/api/pei/extrair-laudo`, `/api/pei/transcrever-laudo`, `/api/bncc/sugerir-habilidades`, `/api/students`

### 2. PAEE — Plano de Atendimento Especializado (`/paee`)
- Gestão de ciclos de atendimento (com datas, frequência, duração)
- Objetivos SMART por período
- Tecnologia assistiva sugerida por IA
- Articulação entre AEE e sala regular
- Cronograma de 12 semanas
- Engine fixo: DeepSeek (OmniRed)

### 3. Hub de Recursos (`/hub`)
Suíte de **9+ ferramentas de IA** para geração de materiais inclusivos:
- **Adaptar Atividade** — OCR de fotos/scans + adaptação pedagógica
- **Adaptar Prova** — Upload de DOCX e adaptação
- **Criar do Zero** — Atividade alinhada BNCC
- **Estúdio Visual** — Flashcards, CAA, rotinas visuais, ilustrações
- **Sugerir Recursos** — Materiais pedagógicos
- **Roteiro de Aula** — Plano de aula inclusivo
- **Papo Mestre** — Consultor IA
- **Dinâmicas em Grupo** — Estratégias coletivas
- **Plano de Aula** — Formalizado (PGI/Lesson)
- Ferramentas específicas para Educação Infantil (EI)

### 4. Diário de Bordo (`/diario`)
- Registro diário de sessões AEE
- 12+ campos por registro (duração, modalidade, engajamento 1-5)
- Timeline visual, filtros, relatórios
- Exportação CSV

### 5. Monitoramento & Evolução (`/monitoramento`)
- Dashboard institucional (total de alunos, PEIs ativos, logs)
- Visão 360° individual (PEI + PAEE + Diário)
- Rubricas de desenvolvimento (autonomia, social, conteúdo, comportamento)
- Tracking de uso da IA por engine

### 6. Central de Inteligência (`/infos`)
- 6 abas de referência pedagógica: Panorama, Legislação, Glossário, Dicionário, Biblioteca, Manual

### 7. PGI — Plano de Gestão Inclusiva (`/pgi`)
- Framework 5W2H para gestão escolar da inclusão
- Pilares: infraestrutura, formação, recursos, dimensionamento

### 8. Estudantes (`/estudantes`)
- Lista centralizada de estudantes com badges (PEI ativo, PAEE)
- Filtros por vínculo do professor

### 9. Gestão de Usuários (`/gestao`)
- CRUD de membros do workspace
- RBAC: permissões individuais por módulo
- Vínculos: "todos", "turma" (disciplinas), "tutor" (alunos específicos)

### 10. Configuração de Escola (`/config-escola`)
- Nome da escola, PIN de acesso
- Módulos ativos/inativos
- Anos letivos, séries, turmas

### 11. Admin da Plataforma (`/admin`)
- Painel para administrador global
- Gestão de workspaces (escolas)
- Tracking de uso global

---

## 🤖 Sistema de Inteligência Artificial

A plataforma usa **5 engines de IA** diferentes, mapeados por codinomes:

| Engine | Codinome | Provedor | Uso Principal | Custo |
|---|---|---|---|---|
| `red` | OmniRed | DeepSeek | PEI, PAEE, Hub, BNCC | 💲 Baixo |
| `blue` | OmniBlue | Kimi (Moonshot) | Alternativa PEI/Hub | 💲 Baixo |
| `green` | OmniGreen | Claude (Anthropic) | PEI/Hub premium | 💲💲💲 Alto |
| `yellow` | OmniYellow | Gemini (Google) | Imagens, OCR, visão | 💲💲 Médio |
| `orange` | OmniOrange | GPT-4o (OpenAI) | Laudos médicos | 💲💲 Médio |

### Arquivo principal: `lib/ai-engines.ts`
- **`chatCompletionText(engine, messages, options)`** — Função central que despacha para o provedor correto
- **`visionAdapt(prompt, base64, mime)`** — Função de visão/OCR usando Gemini Flash 2.0
- **`getEngineError(engine)`** — Verifica se a chave de API está configurada

### Fluxo de geração:
1. Frontend seleciona engine (ou usa o padrão do módulo)
2. Envia request para a API route correspondente
3. API monta o prompt com template + dados do aluno
4. Chama `chatCompletionText()` com o engine selecionado
5. Retorna resposta formatada (Markdown ou JSON)

---

## 🗃️ Banco de Dados (Supabase)

### Tabelas Principais

| Tabela | Descrição |
|---|---|
| `students` | Estudantes. Contém `pei_data` (JSONB), `paee_ciclos` (JSONB), `daily_logs` (JSONB) |
| `workspaces` | Escolas/organizações. `enabled_modules`, `enabled_engines` |
| `workspace_members` | Membros com permissões (`can_pei`, `can_paee`, etc.) |
| `teacher_assignments` | Vínculo professor↔turma↔disciplina |
| `teacher_student_links` | Vínculo direto professor↔aluno (tutor) |
| `usage_events` | Auditoria de uso (login, page_view, etc.) |
| `ia_usage` | Tracking de chamadas IA (engine, tokens) |
| `workspace_grades` | Séries por workspace |
| `classes` | Turmas vinculadas a séries e anos letivos |

### Padrão de dados PEI (JSONB `pei_data`)
O PEI é armazenado como um objeto JSON enorme no campo `pei_data` do estudante. Contém:
- Dados pessoais (nome, nascimento, série, turma, diagnóstico)
- Medicamentos (lista polimórfica: string[] ou objeto[])
- Composição familiar
- Hiperfoco, potencialidades
- Barreiras selecionadas (por área) com níveis de suporte
- Estratégias (acesso, ensino, avaliação)
- Rede de apoio (profissionais)
- Habilidades BNCC selecionadas
- Consultoria IA (texto gerado)
- Monitoramento e status

---

## 🔐 Segurança & Autenticação

### Autenticação
- **JWT customizado** via `jose` (não usa Supabase Auth)
- Middleware (`middleware.ts`) protege todas as rotas `/` redirecionando para `/login`
- Sessão armazenada em cookie HTTP-only
- Hash de senha com `bcryptjs`

### Segurança das APIs
- **Zod validation** em todas as ~50 rotas de API
- **Rate limiting** com janela de tempo (configurável por rota)
- **Sanitização XSS** com `isomorphic-dompurify`
- **`requireAuth()`** em toda rota protegida
- **Permissões RBAC** por módulo

---

## ✅ Testes Automatizados

### Resultado atual: **88/88 testes passando** ✅

```
 ✓ __tests__/unit/hub-prompts.test.ts          (11 testes)
 ✓ __tests__/unit/hub-utils.test.ts            (21 testes)
 ✓ __tests__/unit/date-utils.test.ts           ( 6 testes)
 ✓ __tests__/unit/rate-limit.test.ts           (13 testes)
 ✓ __tests__/unit/permissions.test.ts          ( 6 testes)
 ✓ __tests__/unit/validation.test.ts           (15 testes)
 ✓ __tests__/integration/api-health.test.ts    ( 6 testes)
 ✓ __tests__/integration/api-hub-criar.test.ts ( 5 testes)
 ✓ __tests__/integration/api-auth-login.test.ts( 5 testes)
```

### Cobertura dos testes:
- **Unitários**: Prompts do Hub, utilitários, datas, rate limit, permissões, validação Zod
- **Integração**: Health check da API, criação de atividade, fluxo de login

### Como rodar:
```bash
npm test              # Todos os testes
npm run test:unit     # Apenas unitários
npm run test:integration  # Apenas integração
npm run test:watch    # Modo watch (desenvolvimento)
```

---

## 🌙 Dark Mode

O sistema possui um **dark mode completo** com:
- **ThemeProvider** customizado (sem dependência de next-themes)
- **CSS Variables** para todas as cores (definidas em `globals.css`)
- **Toggle** no canto superior com animação sun/moon
- **Logo branca** (`logo-dark.png`) exibida automaticamente no dark mode
- Cobertura aplicada em todos os 11 módulos

---

## 🌐 Variáveis de Ambiente

Arquivo `.env.local.example` documenta todas as variáveis necessárias:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...

# Sessão JWT
SESSION_SECRET=           # Gerar com: openssl rand -base64 32

# IA — DeepSeek (red) + GPT-4o (orange)
OPENAI_API_KEY=sk-...

# IA — Gemini (yellow)
GEMINI_API_KEY=
GOOGLE_GENAI_API_KEY=

# IA — Kimi via OpenRouter (blue)
# OPENROUTER_API_KEY=sk-or-...

# Imagens — Unsplash
UNSPLASH_ACCESS_KEY=

# Sentry (opcional)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
```

---

## 🚀 Como rodar o projeto localmente

### Pré-requisitos
- **Node.js** 18+ (recomendado 20+)
- Conta no **Supabase** com o banco configurado
- Chaves de API dos engines de IA desejados

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/amorimqueiroz-boop/inclusao.git
cd inclusao/nextjs-app

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com as chaves corretas

# 4. Rodar em desenvolvimento
npm run dev
# Acessa em http://127.0.0.1:3000

# 5. Rodar testes
npm test

# 6. Build de produção
npm run build
npm start
```

---

## 📊 Estado Atual & Próximos Passos

### ✅ O que está pronto (funcional e testado)

| Funcionalidade | Status |
|---|---|
| Login/Registro com JWT | ✅ Completo |
| PEI completo (10 abas) | ✅ Completo |
| PAEE com ciclos e IA | ✅ Completo |
| Hub 9+ ferramentas IA | ✅ Completo |
| Extração de laudo (PDF + imagem) | ✅ Completo |
| Transcrição de laudo na rede de apoio | ✅ Completo |
| BNCC com sugestão IA contextualizada | ✅ Completo |
| Diário de Bordo | ✅ Completo |
| Monitoramento & Rubricas | ✅ Completo |
| PGI (Gestão Inclusiva) | ✅ Completo |
| Estudantes com vínculos | ✅ Completo |
| Gestão de Usuários RBAC | ✅ Completo |
| Config de Escola | ✅ Completo |
| Admin da Plataforma | ✅ Completo |
| Central de Inteligência | ✅ Completo |
| Dark Mode completo | ✅ Completo |
| Exportação PDF e DOCX | ✅ Completo |
| 88 testes automatizados | ✅ Passando |
| Rate limiting | ✅ Completo |
| Validação Zod em todas as APIs | ✅ Completo |
| Sentry para monitoramento | ✅ Configurado |

### 🔄 Oportunidades de melhoria / próximos passos

1. **Migrar pei_data para tabelas normalizadas** — Hoje o PEI inteiro vive em 1 campo JSONB. Para escalar, seria ideal ter tabelas separadas (pei_documents, pei_objectives, etc.)
2. **Aumentar cobertura de testes** — 88 testes é bom, mas falta testar fluxos de UI (Cypress/Playwright)
3. **Sistema de planos/assinatura** — Monetização com tiers (Free, Pro, Enterprise)
4. **PWA / Mobile** — App mobile ou Progressive Web App
5. **Notificações push** — Alertas de PEI desatualizado
6. **Multi-idioma** — Internacionalização
7. **Deploy de produção** — CI/CD pipeline automatizado
8. **OmniProf** — Produto derivado para professores (já em desenvolvimento paralelo)

---

## 📁 Repositório

- **URL**: [github.com/amorimqueiroz-boop/inclusao](https://github.com/amorimqueiroz-boop/inclusao)
- **Branch ativo**: `nextjs-migration`
- **Deploy**: Render.com (configuração existente)

---

## 🧑‍💻 Para o novo desenvolvedor

### Pontos de entrada recomendados:
1. **Entender o fluxo PEI**: Comece lendo `app/(dashboard)/pei/PEIClient.tsx` — é o arquivo mais completo e mostra como tudo se conecta.
2. **Ver as APIs**: `app/api/` segue o padrão do App Router do Next.js. Cada pasta é uma rota.
3. **Engines de IA**: `lib/ai-engines.ts` é o coração da integração IA. Todas as chamadas passam por lá.
4. **Validação**: `lib/validation.ts` tem TODOS os schemas Zod. Novas APIs devem ter seus schemas aqui.
5. **Testes**: `__tests__/` — rode `npm test` após cada alteração.

### Convenções do projeto:
- **Commits**: Formato `tipo(escopo): descrição` (ex: `feat(pei): adicionar extração de imagem`)
- **Idioma do código**: Variáveis e funções em inglês, strings UI em português
- **CSS**: CSS Variables para dark mode, Tailwind para utilitários
- **Componentes**: Server Components por padrão, `"use client"` quando necessário

---

*Este relatório foi gerado com base na análise completa do repositório em 14/02/2026.*
