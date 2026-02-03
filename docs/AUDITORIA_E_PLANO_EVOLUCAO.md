# Auditoria Completa e Plano de Evolução — Omnisfera

**Data:** 3 de fevereiro de 2026  
**Objetivo:** Pente fino na plataforma, antecipação de falhas e plano para tornar a plataforma plenamente funcional.

---

## 1. Auditoria Realizada

### 1.1 Syntax e Imports ✅
- **21 arquivos Python** verificados com `ast.parse` — todos OK.
- Arquivos: `streamlit_app.py`, `login_view.py`, `omni_utils.py`, `supabase_client.py`, `home_view.py`, `ui_lockdown.py`, `ui/permissions.py`, `services/*`, `pages/*.py`.

### 1.2 Compatibilidade Python 3.9–3.13 ✅
- **Problema:** `str | None` e `tuple[X|None, ...]` não suportados em Python 3.9.
- **Solução:** `from __future__ import annotations` em: `omni_utils.py`, `services/members_service.py`, `pages/1_PEI.py`.
- `supabase_client.py` e `admin_service.py` usam `Optional`/`Tuple` do `typing` — compatíveis.

### 1.3 F-strings e Backslash ✅
- **Problema:** `SyntaxError: f-string expression part cannot include a backslash` em `pages/6_Gestao_Usuarios.py` (linha 266).
- **Correção:** Extraída expressão para variável `cargo_str` fora da f-string.

### 1.4 Acesso a `grade` em Turmas ✅
- **Risco:** `c.get('grade', {}).get('label', '')` falha se `grade` for string ou null.
- **Correção:** Função auxiliar `_grade_label(c)` que trata `grade`/`grades` e verifica `isinstance(g, dict)` antes de `.get()`.

### 1.5 Logout e Termos ✅
- **Ajuste:** Inclusão de `accepted_terms` na lista de chaves limpas no logout, para que ao logar novamente o usuário veja o termo de uso (fluxo “primeiro acesso”).

---

## 2. Pontos de Atenção (Falhas Potenciais)

### 2.1 Supabase / Rede
| Risco | Mitigação |
|-------|-----------|
| Tabela ausente | Migrations 00006–00016 devem estar aplicadas no Supabase. Verificar ordem. |
| RLS muito restritivo | Testar com usuário real; se bloquear, revisar políticas. |
| Timeout em requests | `timeout=10`/`15`/`20` em chamadas; considerar retry em fluxos críticos. |

### 2.2 Dados e Nulos
| Risco | Mitigação |
|-------|-----------|
| `member` ou `workspace` null | `ou.ensure_state()` e guards em páginas. Revisar `ui/permissions.py` para edge cases. |
| Listas vazias em selects | Usar `or []` e mensagens amigáveis ("Nenhuma turma. Crie em Configuração Escola primeiro."). |

### 2.3 Fluxos Críticos
| Fluxo | Pontos a testar |
|-------|------------------|
| **Login (usuário)** | Email inexistente, senha errada, workspace sem master. |
| **Login (admin)** | Email não em `platform_admins`, senha incorreta. |
| **Termo de uso** | Falha ao buscar `platform_config` → fallback para texto default. |
| **Criar escola** | Validação de segmentos e motores; PIN gerado. |
| **Criar master** | Email duplicado, bcrypt indisponível. |

### 2.4 Páginas que dependem de estrutura
- **Gestão de Usuários:** Precisa de `classes` e `students` configurados para vínculos.
- **Configuração Escola:** Migrations 00007, 00009 (grades, classes).
- **PEI/PAEE:** Supabase `students`, `pei_data`; APIs OpenAI/Gemini configuradas.

---

## 3. Amarras para Plataforma Funcional

### 3.1 Ordem de Dependências
```
1. Migrations Supabase (00006 → 00016)
2. Secrets: SUPABASE_URL, SUPABASE_SERVICE_KEY (ou ANON_KEY)
3. Admin: criar escola → criar master → (opcional) Configuração Escola
4. Master: criar membros, atribuir permissões
5. Usuários: login → termo → Home → PEI/PAEE/etc.
```

### 3.2 Integrações Externas
| Recurso | Onde | Secret/Env |
|---------|------|------------|
| Supabase | Toda a app | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` |
| OpenAI | PEI, Hub, etc. | `OPENAI_API_KEY` |
| Gemini | Imagens, textos, Jornada | `GEMINI_API_KEY` |
| Google Sheets | Exportar Jornada | `GOOGLE_SHEETS_CREDENTIALS_JSON` ou `_PATH` |

### 3.3 Tabelas Essenciais
- `workspaces`, `workspace_masters`, `workspace_members`
- `platform_admins`, `platform_config`
- `students`, `school_years`, `grades`, `classes`, `workspace_grades`
- `teacher_class_assignments`, `teacher_student_links`

---

## 4. Evolução e Próximos Passos

### 4.1 Dashboard e Bugs (Admin)
- **Dashboard:** Eventos de uso (PEI gerado, chamadas IA), custos estimados, métricas por escola.
- **Bugs/Erros:** Tabela `platform_errors` ou similar; log de exceções; análise com IA.

### 4.2 Uso de IA (Gemini / Kimi / Cursor)
- **Monitoramento:** Resumos automáticos de erros, sugestões de correção.
- **Insights:** "Escola X está usando muito motor Red; considere balancear."
- **Documentação:** Gerar documentação técnica a partir do código.
- **Testes:** Sugestões de casos de teste com base nos fluxos descritos.

### 4.3 Robustez
- [ ] Retry com backoff em chamadas Supabase críticas.
- [ ] Fallback offline/erro em páginas que dependem de IA.
- [ ] Logs estruturados (não só `print`) para debugging em produção.

---

## 5. Resumo de Correções desta Auditoria

1. **6_Gestao_Usuarios.py:** F-string com backslash; acesso seguro a `grade`.
2. **streamlit_app.py:** `accepted_terms` incluído na limpeza de logout.
3. **Documento criado:** `docs/AUDITORIA_E_PLANO_EVOLUCAO.md`.

---

*Plataforma auditada. Próxima etapa: implementar Dashboard e Bugs no Admin e reforçar observabilidade.*
