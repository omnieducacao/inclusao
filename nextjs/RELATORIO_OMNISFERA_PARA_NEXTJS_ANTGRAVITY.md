# Omnisfera — Relatório para Migração/Replicação em Next.js (Google Antgravity)

Este documento descreve a arquitetura, lógicas, fluxos e motivações do projeto Omnisfera para que a Google Antgravity possa replicá-los em uma arquitetura Next.js.

---

## 1. Visão Geral do Projeto

**Omnisfera** é uma **plataforma SaaS de inclusão educacional** para escolas. Apoia equipes pedagógicas na elaboração de PEI (Plano de Ensino Individualizado), PAEE (Plano de Atendimento Educacional Especializado) e recursos adaptados, alinhados à BNCC e legislação (Decretos 12.686/2025 e 12.773/2025).

**Stack atual:**
- Frontend: Streamlit (Python)
- Backend/Dados: Supabase (PostgreSQL, REST, RPC)
- IA: DeepSeek, Claude, Gemini, OpenAI (codinomes: omnired, omniblue, omnigreen, omniyellow, omniorange)
- Exportação: PDF, DOCX, Google Sheets

---

## 2. Modelo de Dados (Supabase/PostgreSQL)

### 2.1 Hierarquia Principal

```
platform_admins (nível plataforma)
workspaces (escolas) ← cada um tem PIN XXXX-XXXX
  └── workspace_masters (1 por workspace: email + senha bcrypt)
  └── workspace_members (professores: permissões por página, link_type)
  └── school_years (ano letivo)
  └── classes (turmas: série + turma)
  └── teacher_assignments (professor → turma + componente curricular)
  └── teacher_student_links (professor tutor → estudantes específicos)
  └── students (estudantes em inclusão)
  └── pei_data, paee_data, etc.
```

### 2.2 Tabelas Críticas

| Tabela | Descrição |
|--------|-----------|
| **workspaces** | Escolas. Campos: id, name, pin, active, segments, ai_engines, enabled_modules, plan, credits_limit |
| **workspace_from_pin(p_pin)** | RPC que retorna `{ id, name }` dado um PIN. Só retorna se `active = true` |
| **workspace_masters** | 1 master por workspace. email, password_hash (bcrypt), nome, telefone, cargo |
| **workspace_members** | Professores. Permissões: can_estudantes, can_pei, can_paee, can_hub, can_diario, can_avaliacao, can_gestao. link_type: todos \| turma \| tutor |
| **platform_admins** | Admins da plataforma. email, password_hash, nome |
| **segments** | EI, EFAI, EFAF, EM |
| **grades** | Séries por segmento (ex: 1º ao 9º, 1ª a 3ª EM) |
| **components** | Componentes BNCC: Arte, Ciências, Matemática, etc. |
| **school_years** | Ano letivo por workspace |
| **classes** | Turmas: workspace + school_year + grade + class_group |
| **teacher_assignments** | Professor → class + component |
| **students** | Estudantes em inclusão. workspace_id, nome, série, diagnóstico, hiperfoco, etc. |
| **ia_usage** | Uso de IA por workspace (créditos) |
| **usage_events** | Eventos de uso (login, etc.) |

---

## 3. Fluxo de Autenticação

### 3.1 Login Escolar (email + senha)

1. Usuário informa **email** e **senha**
2. Busca em `workspace_members` ou `workspace_masters` por email (via `find_user_by_email`)
3. Se **master**: valida com `verify_workspace_master(workspace_id, email, password)` (bcrypt)
4. Se **membro**: valida com `verify_member_password(workspace_id, email, password)`
5. Verifica se workspace está `active`
6. Seta em sessão: `workspace_id`, `workspace_name`, `usuario_nome`, `member`, `user_role`, `enabled_modules`

### 3.2 Login Admin Plataforma

1. Usuário informa **email** e **senha** em expander "Sou administrador da plataforma"
2. Valida com `verify_platform_admin(email, senha)` contra `platform_admins`
3. Seta: `is_platform_admin = true`, `workspace_id = null`, `user_role = platform_admin`

### 3.3 Modo Demo (ENV=TESTE e sem Supabase)

- Botão "Entrar em modo demo"
- `workspace_id = "demo"`, `member` com permissões totais

### 3.4 Aceite do Termo de Uso

- Após login, se `accepted_terms` não estiver setado, exibe termo (de `platform_config.terms_of_use` ou padrão)
- Ao aceitar: `accepted_terms = true`

---

## 4. Permissões e Controle de Acesso

### 4.1 Por Página (member.can_*)

- **can_estudantes**: Acesso ao cadastro de estudantes
- **can_pei**: Estratégias & PEI
- **can_paee**: Plano de Ação (AEE)
- **can_hub**: Hub de Recursos
- **can_diario**: Diário de Bordo
- **can_avaliacao**: Evolução & Dados (Monitoramento)
- **can_gestao**: Gestão de Usuários

### 4.2 Filtro de Estudantes (link_type)

- **todos**: Vê todos os estudantes do workspace
- **turma**: Vê apenas estudantes das turmas em `teacher_assignments`
- **tutor**: Vê apenas estudantes em `teacher_student_links`

### 4.3 Módulos Habilitados (workspace.enabled_modules)

- Array JSON: `["pei", "paee", "hub", "diario", "avaliacao"]`
- Se `null`: todos habilitados
- Se definido: apenas esses módulos aparecem na navegação

---

## 5. Módulos e Rotas (Páginas)

| Rota / Página | Descrição |
|---------------|-----------|
| **streamlit_app.py** | Ponto de entrada. Renderiza login OU redireciona para Home/Admin |
| **pages/0_Home.py** | Central de conhecimento: panorama, legislação, glossário, manual |
| **pages/Estudantes.py** | Cadastro e gestão de estudantes |
| **pages/1_PEI.py** | Plano de Ensino Individualizado (muitas abas) |
| **pages/2_PAEE.py** | Plano de Atendimento Educacional Especializado |
| **pages/3_Hub_Inclusao.py** | Hub de Recursos: Adaptar Prova, Adaptar Atividade, Criar do Zero, Estúdio Visual, etc. |
| **pages/4_Diario_de_Bordo.py** | Registro de atendimentos |
| **pages/5_Monitoramento_Avaliacao.py** | Evolução e dados |
| **pages/6_Gestao_Usuarios.py** | Gestão de membros e permissões |
| **pages/7_Configuracao_Escola.py** | Ano letivo, séries, turmas |
| **pages/8_Admin_Plataforma.py** | Admin: escolas, termo, dashboard |
| **pages/9_PGI.py** | PGI (se habilitado) |

---

## 6. Lógicas de Negócio Críticas

### 6.1 Estudante como Centro

- **Tudo gira em torno do estudante**. PEI, PAEE e Hub usam o estudante selecionado para:
  - Filtrar BNCC por ano/série
  - Usar hiperfoco nas gerações de IA
  - Adaptar provas/atividades ao perfil
  - Gerar Jornada Gamificada

### 6.2 BNCC

- **Segmentos**: EI, EFAI (1º-5º), EFAF (6º-9º), EM (1ª-3ª)
- **Componentes**: Arte, Ciências, Educação Física, Geografia, História, Língua Inglesa, Língua Portuguesa, Matemática
- **Estrutura**: Disciplina → Ano → Unidade Temática → Objeto do Conhecimento → Habilidades
- **EI**: Idade → Campo de Experiência → Objetivos
- Fonte: arquivos CSV (bncc.csv, bncc_ei.csv, bncc_em.csv) ou tabelas

### 6.3 Motores de IA (Codinames)

| Codename | Provedor | Uso |
|----------|----------|-----|
| omnired | DeepSeek | PEI, PAEE, Adaptar Provas, Hub (texto) |
| omniblue | Kimi | Idem (opção mais robusta) |
| omnigreen | Claude | Apenas PEI |
| omniyellow | Gemini | Imagens, mapas mentais, Adaptar Atividades, Estúdio Visual |
| omniorange | OpenAI | Reserva/fallback |

- Escola pode ter `ai_engines` configurado (ex: só red e blue)
- Plano `basic` vs `robusto` (robusto inclui omnigreen)

### 6.4 Hub de Recursos

- **Adaptar Prova**: Upload DOCX → IA adapta com DUA
- **Adaptar Atividade**: Upload imagem → OCR → IA adapta
- **Criar do Zero**: BNCC + assunto + checklist → IA gera atividade
- **Estúdio Visual**: Gera pictogramas, cenas sociais (Gemini/Unsplash)
- **Papo de Mestre**: Sugestões de mediação
- **Dinâmica Inclusiva**: Dinâmicas em grupo
- **Plano de Aula DUA**: Plano com Desenho Universal

### 6.5 Jornada Gamificada

- Transforma planejamento em missões e etapas
- Exportável para Google Sheets
- **Regra LGPD**: NUNCA incluir diagnóstico/CID em material do estudante
- Usar "Interesses / Foco" em vez de "Hiperfoco" em labels

---

## 7. Serviços (services/)

| Serviço | Responsabilidade |
|---------|------------------|
| **members_service** | CRUD membros, verify master/member, find_user_by_email |
| **admin_service** | verify_platform_admin, get_workspace, platform_config |
| **bncc_service** | Dados BNCC |
| **hub_ia** | Chat completion, gerar imagem, Unsplash |
| **hub_docs** | Construir DOCX, PDF |
| **hub_bncc_utils** | Filtros BNCC por ano, extrair habilidades |
| **monitoring_service** | Dados de evolução |
| **school_config_service** | Ano letivo, turmas |
| **ai_feedback_service** | Feedback de IA para treinamento |

---

## 8. Mapeamento para Next.js

### 8.1 Estrutura Sugerida de Pastas

```
app/
  (auth)/
    login/page.tsx
    layout.tsx
  (dashboard)/
    layout.tsx          # Requer autenticação
    page.tsx            # Home
    estudantes/page.tsx
    pei/[id]/page.tsx
    paee/[id]/page.tsx
    hub/page.tsx
    diario/page.tsx
    monitoramento/page.tsx
    gestao-usuarios/page.tsx
    configuracao/page.tsx
  admin/
    layout.tsx          # Requer platform_admin
    page.tsx
    escolas/page.tsx
    termo/page.tsx
lib/
  supabase.ts           # Cliente Supabase
  auth.ts               # Lógica de login (workspace_masters, workspace_members, platform_admins)
  permissions.ts        # can_pei, can_hub, etc.
  bncc.ts               # Utilitários BNCC
  hub-ia.ts             # Chamadas aos motores de IA
components/
  Navbar.tsx
  StudentSelector.tsx
  ...
```

### 8.2 Autenticação em Next.js

- **Session**: JWT ou cookie com `{ workspace_id, user_role, member, workspace_name }`
- **API Routes** ou **Server Actions** para:
  - `POST /api/auth/login` → valida email/senha, retorna sessão
  - `POST /api/auth/admin-login` → valida platform_admin
- **Middleware**: Verificar sessão, redirecionar para login se não autenticado
- **Supabase**: Usar `@supabase/supabase-js` com `service_role` em server; RPC `workspace_from_pin` se necessário

### 8.3 Estado Global

- **Context/Store**: workspace_id, member, enabled_modules, student_selected (para PEI/PAEE/Hub)
- Estudante selecionado deve persistir entre navegações (localStorage ou DB)

### 8.4 Chamadas de IA

- **API Routes** (Server): `/api/hub/adaptar-prova`, `/api/hub/criar-do-zero`, etc.
- Recebem: estudante, parâmetros, engine
- Chamam DeepSeek/Claude/Gemini conforme config
- Retornam texto/JSON

### 8.5 BNCC em Next.js

- Arquivos CSV em `public/` ou `data/`
- Ou tabelas Supabase: `components`, `grades`, habilidades em CSV importado
- Filtro por segmento/ano do estudante

---

## 9. Regras de Segurança e LGPD

1. **Diagnóstico/CID**: Nunca em materiais do estudante (Jornada, exportações)
2. **Senhas**: bcrypt para masters e members
3. **RLS Supabase**: Políticas `USING (true)` com SERVICE_KEY (app controla acesso por workspace_id)
4. **Secrets**: SUPABASE_URL, SUPABASE_SERVICE_KEY, chaves de IA em variáveis de ambiente
5. **Termo de Uso**: Obrigatório no primeiro acesso

---

## 10. Integrações Externas

- **Supabase**: REST API + RPC
- **DeepSeek**: API compatível OpenAI
- **Claude**: Anthropic API
- **Gemini**: google-genai
- **OpenAI**: DALL-E, GPT
- **Unsplash**: Banco de imagens
- **Google Sheets**: Exportação Jornada (opcional)

---

## 11. Fluxo de Navegação Resumido

```
Login (email + senha)
  → Aceite Termo (se primeiro acesso)
  → Home
  → Navbar com módulos habilitados (conforme member.can_* e enabled_modules)
  → Cada página verifica permissão antes de renderizar
  → Estudante selecionado (dropdown) influencia PEI, PAEE, Hub
  → Logout: ?omni_logout=1 ou botão
```

---

## 12. Arquivos de Referência no Repositório

| Arquivo | Conteúdo |
|---------|----------|
| `streamlit_app.py` | Router principal, login, redirecionamentos |
| `login_view.py` | UI de login, validação |
| `supabase_client.py` | get_sb(), rpc_workspace_from_pin |
| `omni_utils.py` | Ícones, codenames IA, get_setting, navbar |
| `services/members_service.py` | Autenticação e membros |
| `services/admin_service.py` | Workspace, platform_config |
| `services/hub_ia.py` | Chamadas aos motores de IA |
| `pages/3_Hub_Inclusao.py` | Lógica completa do Hub |
| `pages/1_PEI.py` | Estrutura do PEI |
| `pages/2_PAEE.py` | Estrutura do PAEE |
| `supabase/migrations/` | Schema completo |

---

*Documento gerado para subsidiar a migração/replicação da Omnisfera em Next.js com Google Antgravity.*
