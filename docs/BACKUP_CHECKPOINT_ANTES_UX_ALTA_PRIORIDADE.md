# Memória de Backup — Estado Funcionando (Antes das Melhorias UX)

**Data:** 02/02/2025  
**Objetivo:** Documentar o estado da plataforma no momento em que **tudo funciona**, antes de aplicar as melhorias de alta prioridade de UX/Design.

---

## 1. Arquivos que serão modificados

| Arquivo | Melhorias aplicadas |
|---------|---------------------|
| `pages/Estudantes.py` | Estado vazio com CTA, confirmação destrutiva (já existe), st.toast, mensagens de erro |
| `pages/1_PEI.py` | Breadcrumb, estado vazio (se aplicável), st.toast |
| `pages/2_PAEE.py` | Estado vazio (já bom), st.toast |
| `pages/3_Hub_Inclusao.py` | Estado vazio melhorado, breadcrumb, st.toast, mensagens de erro |
| `pages/4_Diario_de_Bordo.py` | Estado vazio com CTA, confirmação ao excluir registro, st.toast |
| `pages/5_Monitoramento_Avaliacao.py` | Estado vazio com CTA |
| `pages/6_Gestao_Usuarios.py` | Estado vazio com CTA, st.toast |
| `pages/7_Configuracao_Escola.py` | Estado vazio com CTA, confirmação ao remover turma, st.toast |
| `pages/9_PGI.py` | Confirmação ao remover ação, st.toast |
| `login_view.py` | Mensagens de erro amigáveis |

---

## 2. Comportamento atual preservado

### 2.1 Fluxos principais
- **Login:** PIN + email + senha; workspace selecionado; `st.session_state.autenticado`, `workspace_id`, `usuario_nome`
- **PEI:** Abas INÍCIO, ESTUDANTE, EVIDÊNCIAS, REDE DE APOIO, MAPEAMENTO, PLANO DE AÇÃO, MONITORAMENTO, BNCC, CONSULTORIA IA, DASHBOARD & DOCS
- **Hub:** Seletor de estudante; abas Adaptar Prova, Adaptar Atividade, Criar do Zero, etc. (ou modo EI)
- **Estudantes:** Lista de estudantes; exclusão com confirmação em 2 cliques
- **PAEE:** Requer estudantes; CTA para PEI/Estudantes quando vazio
- **Diário de Bordo:** Carrega alunos do workspace; abas Filtros, Novo Registro, Lista, Relatórios, Config
- **Config Escola:** Ano letivo, séries, turmas
- **Gestão Usuários:** Lista de membros; exclusão com confirmação

### 2.2 Confirmações destrutivas existentes
- **Estudantes:** `confirm_del_{sid}` → "Sim, excluir" / "Cancelar"
- **Admin:** `admin_confirm_delete_ws` → "Sim, excluir permanentemente"
- **Gestão Usuários:** "Excluir permanentemente remove o usuário e libera o email. Confirma?"

### 2.3 Estados vazios atuais
- **Estudantes:** `st.info("Nenhum estudante encontrado.")`
- **Hub:** `st.warning("⚠️ Nenhum estudante encontrado.")` + botão PEI
- **PAEE:** `st.info("...")` + botões PEI e Estudantes
- **Diário:** `st.warning("Nenhum estudante encontrado.")` + st.stop()
- **Config Escola:** `st.caption("Nenhum ano. Adicione acima.")`, `st.caption("Nenhuma turma. Adicione acima.")`
- **Gestão Usuários:** `st.info("Nenhum usuário cadastrado...")`
- **Monitoramento:** `st.warning("Nenhum estudante encontrado ou erro na conexão.")`

---

## 3. Rollback

**Recomendação:** Antes de continuar, faça um commit no Git:

```bash
git add .
git commit -m "checkpoint: estado funcionando antes das melhorias UX alta prioridade"
```

Para reverter as alterações após as melhorias:

```bash
git checkout -- pages/Estudantes.py pages/1_PEI.py pages/2_PAEE.py pages/3_Hub_Inclusao.py pages/4_Diario_de_Bordo.py pages/5_Monitoramento_Avaliacao.py pages/6_Gestao_Usuarios.py pages/7_Configuracao_Escola.py pages/9_PGI.py login_view.py
```

---

## 4. Versões e dependências

- Streamlit: conforme `requirements.txt`
- Python: 3.9+
- omni_utils, services, ui: imports e funções utilizados sem alteração de assinatura

---

*Este documento serve como referência para garantir que o estado "tudo funcionando" possa ser recuperado se necessário.*

---

## 5. Melhorias aplicadas (02/02/2025)

| # | Melhoria | Status |
|---|----------|--------|
| 1 | Estados vazios com CTA (Estudantes, Hub, Diário, Monitoramento, Gestão, Config Escola) | ✅ |
| 2 | Breadcrumb em PEI e Hub | ✅ |
| 3 | Confirmação antes de ações destrutivas (Config turma, Diário registro, PGI ação) | ✅ |
| 4 | Feedback de sucesso com st.toast | ✅ |
| 5 | Mensagens de erro amigáveis (login, Estudantes, Hub, Gestão, Config) | ✅ |

### Fase 2 — Prioridade média (02/2025)

| # | Melhoria | Status |
|---|----------|--------|
| 6 | Tooltips em BNCC, Bloom, checklist de adaptação (Hub + PEI) | ✅ |
| 7 | Seletor de aluno sticky no Hub (CSS) | ✅ |
| 8 | Card Próximos passos na Home | ❌ Removido (não combinou) |
| 9 | Atalhos mentais (Home + Estudantes vazia já na fase 1) | ✅ |
| 10 | Consistência de layout (margin-top -96px em todas as páginas) | ✅ |

### Fase 3 — Prioridade baixa (02/2025)

| # | Melhoria | Status |
|---|----------|--------|
| 11 | Micro-animações (expanders, student-row) | ✅ |
| 12 | Dark mode (toggle no header) | ✅ |
| 13 | Tour guiado no primeiro acesso (Home) | ✅ |
| 14 | Atalhos de teclado (Enter = enviar; dica no tour e Config Escola) | ✅ |
