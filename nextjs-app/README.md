# Omnisfera — Plataforma de Educação Inclusiva

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vitest](https://img.shields.io/badge/Tests-88%20passing-brightgreen)
![License](https://img.shields.io/badge/License-Private-red)

Plataforma educacional para escolas inclusivas, com geração de conteúdo por IA multi-engine, gestão de PEI/PAEE, e acompanhamento pedagógico.

## Módulos

| Módulo | Descrição |
|---|---|
| **Estudantes** | Gestão de alunos com perfil completo |
| **PEI** | Plano Educacional Individualizado com IA |
| **PAEE** | Plano de Atendimento Educacional Especializado |
| **Hub** | 14 ferramentas de IA (atividades, provas, planos, dinâmicas, etc.) |
| **Diário de Bordo** | Registros pedagógicos diários |
| **Monitoramento** | Avaliação contínua com rubricas |
| **PGI** | Plano de Gestão Individual |
| **Gestão** | Administração de membros e permissões |
| **Config Escola** | Configurações da escola/workspace |
| **Central de Inteligência** | Panorama legal, glossário, biblioteca |
| **Admin** | Painel admin da plataforma |

## Setup

### 1. Clone e instale

```bash
git clone https://github.com/amorimqueiroz-boop/inclusao.git
cd inclusao/nextjs-app
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas chaves:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `SUPABASE_URL` | ✅ | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key do Supabase |
| `SESSION_SECRET` | ✅ Produção | Secret JWT (gere com `openssl rand -base64 32`) |
| `OPENAI_API_KEY` | ✅ | Chave para engines de IA |
| `GEMINI_API_KEY` | ⬡ | OmniYellow (Gemini) |
| `UNSPLASH_ACCESS_KEY` | ⬡ | Estúdio de imagem |
| `NEXT_PUBLIC_SENTRY_DSN` | ⬡ | Monitoramento de erros |

### 3. Rode o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Testes

A bateria de testes cobre lógica pura, schemas de validação, e rotas de API:

```bash
npm test              # Todos os testes (88 testes, ~400ms)
npm run test:unit     # Só unitários (72 testes)
npm run test:integration  # Só integração (16 testes)
npm run test:watch    # Modo watch (re-roda ao salvar)
```

### Suítes de teste

| Nível | Suite | Testes |
|---|---|---|
| Unit | `rate-limit`, `hub-utils`, `date-utils`, `validation`, `hub-prompts`, `permissions` | 72 |
| Integration | `/api/health`, `/api/auth/login`, `/api/hub/criar-atividade` | 16 |

## Rotas principais

- `/login` — Login escolar ou admin
- `/` — Home / Landing page
- `/estudantes` — Gestão de alunos
- `/pei`, `/paee`, `/pgi` — Planos educacionais
- `/hub` — Hub de ferramentas de IA
- `/diario` — Diário de bordo
- `/monitoramento` — Monitoramento e avaliação
- `/gestao` — Gestão de membros
- `/config-escola` — Configurações
- `/infos` — Central de inteligência
- `/admin` — Painel admin (platform_admin)
- `/api/health` — Health check

## Segurança

- JWT com `httpOnly` cookies (HS256)
- Rate limiting em todas as rotas de IA e auth
- Headers: HSTS, X-Frame-Options DENY, CSP, X-XSS-Protection
- Validação Zod em todos os bodies de API
- Permissões por role (admin / master / member)
- Sentry para monitoramento de erros

## Stack

- **Framework**: Next.js 16 + React 19
- **Linguagem**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **AI**: DeepSeek, Kimi, Claude, Gemini, OpenAI (multi-engine)
- **Auth**: JWT (jose)
- **Validação**: Zod 4
- **Testes**: Vitest 4
- **CSS**: Tailwind CSS 4
- **Monitoramento**: Sentry
- **Exports**: PDF (jsPDF), DOCX, PPTX

## Documentação

Documentação adicional em `docs/`:
- Análise de migração Streamlit → Next.js
- Guias de deploy (Render)
- Configuração Supabase
- Estratégia de animações (Lottie)
