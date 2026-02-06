# Análise Completa — Fluxos, UX e LGPD

**Data:** 02/2025  
**Objetivo:** Revisão ponta a ponta dos processos (Admin, Usuários, Escola, Estudantes) e lacunas para LGPD.

---

## 1. MAPEAMENTO DOS FLUXOS

### 1.1 Fluxo Admin (Plataforma)

| Etapa | Onde | Status |
|-------|------|--------|
| Login como admin | `login_view.py` → checkbox "Sou administrador" | ✅ |
| Painel Admin | `pages/8_Admin_Plataforma.py` | ✅ |
| **Criar escola** | Tab Escolas → form → `create_workspace()` | ✅ |
| **Editar escola** | Expander por escola → segmentos, motores, módulos, ativo | ✅ |
| **Excluir escola** | Confirmação em 2 etapas | ✅ |
| **Criar master** | Tab Escolas → expander "Criar master" (por workspace) | ✅ (dentro do expander da escola) |
| Termo de Uso | Tab Termo → editar texto salvo em `platform_config` | ✅ |
| Dashboard uso | Tab Dashboard → `get_usage_snapshot()` | ✅ |
| Uso de IAs | Tab Uso de IAs → `get_ia_usage_summary()` | ✅ |
| Bugs/Issues | Tab Bugs → `create_platform_issue()` | ✅ |

**Dependências:** `admin_service`, `platform_admins`, tabela `workspaces`, migrations 00012, 00013 (seed admin).

### 1.2 Fluxo Escola (Master) — Configuração

| Etapa | Onde | Status |
|-------|------|--------|
| Configurar master | `6_Gestao_Usuarios.py` — expander "Configurar usuário master" | ✅ |
| **Ano letivo** | `7_Configuracao_Escola.py` → criar ano | ✅ |
| **Séries** | Configurar quais séries a escola oferece | ✅ |
| **Turmas** | Criar turmas (ano + série + turma) | ✅ |

**Ordem recomendada:** 1) Ano letivo 2) Turmas 3) Usuários (Gestão)

### 1.3 Fluxo Gestão de Usuários (Master)

| Etapa | Onde | Status |
|-------|------|--------|
| Listar membros | `list_members(ws_id)` | ✅ |
| **Novo usuário** | Form: nome, email, senha, telefone, cargo | ✅ |
| Permissões por página | checkboxes (estudantes, PEI, PAEE, hub, diário, avaliação, gestão) | ✅ |
| Vínculo com estudantes | todos / turma / tutor | ✅ |
| Turmas e componentes | Se link_type=turma → `teacher_class_assignments` | ✅ |
| Vínculo tutor | Se link_type=tutor → `teacher_student_links` | ✅ |
| Desativar/Reativar | `deactivate_member`, `reactivate_member` | ✅ |
| Excluir permanentemente | `delete_member_permanently` | ✅ |
| Alterar senha master | Admin → expander escola → `update_workspace_master_password` | ✅ |

### 1.4 Fluxo Estudantes

| Etapa | Onde | Status |
|-------|------|--------|
| **Listar estudantes** | `pages/Estudantes.py` → `list_students_rest(ws_id)` | ✅ |
| **Criar estudante** | Via PEI: ao clicar "Sincronizar Tudo" com `selected_student_id` vazio | ✅ (por design) |
| Editar/Excluir | Estudantes → expander por aluno → Excluir | ✅ |
| **Filtro por membro** | `apply_member_filter()` — membros com link_type turma/tutor veem apenas seus alunos | ✅ |

**Design intencional:** O estudante só existe se existir PEI. Não há tela separada "Cadastrar novo estudante". A Omnisfera tem o **PEI como centro** — evita cadastros incompletos ou duplicados. A plataforma é focada na escola; o estudante não é usuário (não faz login).

### 1.5 Fluxo Login

| Etapa | Status |
|-------|--------|
| Login por PIN + email + senha | ✅ |
| Termo de Uso (primeiro acesso) | ✅ — exibido após login, bloqueia até aceitar |
| Redirecionamento Admin vs usuário comum | ✅ |
| Timeout inatividade (30 min) | ✅ (`omni_utils.render_omnisfera_header`) |
| Logout via `?omni_logout=1` | ✅ |

---

## 2. DADOS ARMAZENADOS (LGPD)

### 2.1 Dados Pessoais e Sensíveis

| Dado | Tabela/Campo | Classificação LGPD |
|------|--------------|-------------------|
| Nome do estudante | `students.name` | Pessoal |
| Data de nascimento | `students.birth_date`, `pei_data.nasc` | Pessoal |
| Diagnóstico / CID | `students.diagnosis`, `pei_data.diagnostico` | **Sensível (saúde)** |
| Medicamentos | `pei_data.lista_medicamentos` | **Sensível (saúde)** |
| Rede de apoio / família | `pei_data.rede_apoio`, `composicao_familiar_tags` | Pessoal/sensível |
| Histórico clínico | `pei_data.historico`, `orientacoes_especialistas` | **Sensível** |
| Barreiras de aprendizagem | `pei_data.barreiras_selecionadas` | Sensível (educação/saúde) |
| Nome, email, telefone, cargo (membros) | `workspace_members`, `workspace_masters` | Pessoal |
| Senhas (hash) | `workspace_members.password_hash`, `workspace_masters.password_hash` | Dado de autenticação |
| Registros Diário de Bordo | Tabela de registros por aluno | Pessoal/sensível |

### 2.2 O Que Falta para LGPD

| Item | Situação | Prioridade |
|------|----------|------------|
| **Consentimento do responsável** | Não implementado no cadastro de estudante | **Alta** |
| **Política de Privacidade** | Não existe página/documento público | **Alta** |
| **Base legal documentada** | Não definida (ex.: Art. 7º II, Art. 11 II f) | **Alta** |
| **Direitos do titular** | Sem fluxo para acesso, correção, exclusão, portabilidade | **Média** |
| **Prazo de retenção** | Não definido | **Média** |
| **DPO / Encarregado** | Não definido | **Média** |
| **AIPD (Avaliação de Impacto)** | Não realizado | Baixa (recomendado) |
| **Anonimização/pseudonimização em IA** | Dados sensíveis enviados a OpenAI/Gemini sem anonimização | **Alta** (mitigar risco) |

---

## 3. RECOMENDAÇÕES PARA LGPD

### 3.1 Implementações Sugeridas

1. **Consentimento no PEI (Dossiê do Estudante)**
   - No formulário PEI, adicionar **checkbox obrigatório:** "Autorizo o tratamento dos dados do estudante para fins educacionais e de suporte à inclusão, em conformidade com a LGPD. O responsável legal foi informado."
   - Campos opcionais: "Nome do responsável legal" e "Data do consentimento".

2. **Política de Privacidade**
   - Nova página ou documento (ex.: `/privacidade` ou link no rodapé).
   - Conteúdo: quais dados são coletados, finalidade, bases legais, compartilhamento (Supabase, OpenAI, Google), retenção, como solicitar acesso/correção/exclusão, contato do DPO.

3. **Termo de Uso atual**
   - Já menciona confidencialidade e dados sensíveis.
   - Sugestão: incluir explícito "dados de saúde e educação" e "consentimento do responsável legal para menores".

4. **Direitos do titular**
   - Fluxo (manual ou automatizado) para:
     - Acesso aos dados (relatório exportável).
     - Correção (já possível via edição nas telas).
     - Exclusão (já existe "Excluir estudante" — verificar se remove tudo em cascata).
     - Portabilidade (exportar JSON/backup — já existe no PEI).

5. **Documentação de base legal**
   - Ex.: Art. 7º, II (execução de política pública educacional); Art. 11, II, f (tutela da saúde).
   - Consultar advogado/DPO para redação final.

### 3.2 Recursos a Criar

| Recurso | Descrição |
|---------|-----------|
| **Página Política de Privacidade** | Documento público com todos os itens LGPD |
| **Checkbox consentimento no PEI** | Obrigatório no dossiê do estudante (antes de sincronizar) |
| **Fluxo "Solicitar exclusão de dados"** | Formulário ou email para titular/responsável |
| **Documento "Bases Legais"** | PDF ou página interna para auditoria |
| **Registro de consentimento** | Campo ou tabela para armazenar data/versão do termo aceito |

---

## 4. VERIFICAÇÃO DE FUNCIONAMENTO

### 4.1 Pontos que Podem Quebrar

| Risco | Verificação |
|-------|-------------|
| Tabela `students` ausente | Migrations 00001–00005 não estão no repositório. **Confirmar** se a tabela existe no Supabase. |
| Classes/turmas vazias | Gestão de Usuários com link_type=turma exige turmas criadas em Config Escola |
| Cache de estudantes | `list_students_rest` TTL=10s; invalida com `students_cache_invalid` ao criar/editar |
| Chaves de IA | Sem DEEPSEEK/OPENROUTER/GEMINI: PEI, Hub, PAEE falham em funções de IA |

### 4.2 Ordem de Dependências

```
1. Supabase: migrations aplicadas, tabela students existe
2. Admin: criar escola → PIN gerado
3. Master: acessar com PIN, configurar master (email+senha)
4. Config Escola: ano letivo → turmas
5. Gestão Usuários: cadastrar membros, vínculos
6. PEI ou Estudantes: cadastrar/criar estudantes
7. PEI, PAEE, Hub, Diário, Monitoramento: uso normal
```

---

## 5. RESUMO EXECUTIVO

### O que está funcionando

- Admin: criar/editar escolas, masters, termo, dashboard, bugs.
- Config Escola: ano letivo, turmas, séries.
- Gestão Usuários: membros, permissões, vínculos (todos/turma/tutor).
- Estudantes: listar, excluir, filtro por membro. Criação indireta via PEI.
- Login, termo de uso, timeout, logout.
- PEI, PAEE, Hub, Diário, Monitoramento operacionais.

### Lacunas funcionais

- **Consentimento LGPD:** nenhum checkbox/registro no cadastro de aluno (formulário PEI).

*Nota: Cadastro de estudante é propositalmente via PEI — estudante só existe com PEI associado (design da plataforma).*

### Lacunas LGPD (prioridade alta)

1. Consentimento do responsável no cadastro de estudante.
2. Política de Privacidade pública.
3. Base legal documentada.
4. Procedimento para direitos do titular (acesso, exclusão).
5. Definição de prazo de retenção e DPO.

### Próximos passos sugeridos

1. Criar migration para `students` se não existir (ou documentar schema esperado).
2. Incluir checkbox de consentimento LGPD + campo responsável no formulário PEI (dossiê do estudante).
3. Criar página Política de Privacidade.
4. Documentar bases legais com assessoria jurídica.
5. Definir DPO e canal de contato.

---

*Análise baseada na revisão do código e documentação existente (ANALISE_MVP_E_LGPD.md, REFATORACAO_PLANO, RELATORIO_REVISAO_CODIGO).*
