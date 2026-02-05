# Relatório de Revisão de Código — Omnisfera

**Data:** 02/02/2025  
**Objetivo:** Auditoria para registro de código, otimização e organização profissional.

---

## 1. Visão Geral da Arquitetura

### 1.1 Estrutura Atual

| Componente | Linhas | Função Principal |
|------------|--------|------------------|
| `streamlit_app.py` | 289 | Entrada, login, router, termos de uso |
| `login_view.py` | 390 | Tela de login |
| `omni_utils.py` | 2586 | Utilitários, motores IA, layout, ícones |
| `pages/3_Hub_Inclusao.py` | **4116** | Hub de recursos (maior página) |
| `pages/1_PEI.py` | **4021** | PEI e consultoria pedagógica |
| `pages/2_PAEE.py` | 2888 | Plano de ação / PAEE |
| `pages/0_Home.py` | 1768 | Home, Central de Conhecimento |
| `pages/4_Diario_de_Bordo.py` | 1459 | Diário de bordo |
| `pages/9_PGI.py` | 740 | PGI |
| `pages/8_Admin_Plataforma.py` | 578 | Admin |
| `pages/5_Monitoramento_Avaliacao.py` | 544 | Monitoramento |
| `pages/6_Gestao_Usuarios.py` | 452 | Gestão de usuários |
| `pages/Estudantes.py` | 325 | Estudantes |
| `pages/7_Configuracao_Escola.py` | 204 | Config da escola |
| `services/` | ~1722 | bncc, admin, members, monitoring, school_config, ai_feedback |

### 1.2 Motores de IA (Conexões)

| Codenome | Provedor | Uso Principal | Chave |
|----------|----------|---------------|-------|
| **omnired** | DeepSeek | PEI, PAEE, Hub (texto), Adaptar Provas | DEEPSEEK_API_KEY |
| **omniblue** | Kimi (OpenRouter) | Alternativa robusta, PEI, PAEE, Hub | OPENROUTER_API_KEY / KIMI_API_KEY |
| **omnigreen** | Claude (Anthropic) | PEI, Hub (quando habilitado) | ANTHROPIC_API_KEY |
| **omniyellow** | Gemini | Imagens, Adaptar Atividades, Estúdio Visual, CAA | GEMINI_API_KEY |
| **omniorange** | ChatGPT (OpenAI) | Fallback/reserva | OPENAI_API_KEY |

**Status das conexões:** Todas utilizam `omni_utils.chat_completion_multi_engine` e `get_setting()` com retry para cold start (Streamlit Cloud). Configuração por escola (`workspace_has_engine`) controla omnigreen.

---

## 2. Pontos para Evolução

### 2.1 Arquivos muito grandes (refatoração futura)

- **Hub (4116 linhas):** Contém funções de IA, BNCC, DOCX, imagens, Supabase e UI em um único arquivo. Sugestão: extrair módulos `hub_ia.py`, `hub_docs.py`, `hub_bncc.py`.
- **PEI (4021 linhas):** Similar. Extrair `pei_consultoria.py`, `pei_ia.py`, `pei_ui.py`.
- **omni_utils (2586 linhas):** Centraliza ícones, layout, motores IA, Supabase. Considerar `omni_ia.py`, `omni_layout.py`.

### 2.2 Duplicações identificadas

| Item | Local 1 | Local 2 | Ação sugerida |
|------|---------|---------|---------------|
| Import `omni_utils as ou` | Hub linha 17 | Hub linha 38 | Remover duplicata |
| Import `qn` (docx) | Hub linhas 27-33 | Fallback incorreto: `qn = lambda x: x, RGBColor` | Corrigir fallback |
| Lógica de api_key | Hub, PEI, PAEE | Cada página busca env/secrets/session | Centralizar em `ou.get_openai_api_key()` ou `ou.get_primary_ia_key()` |
| `acesso_bloqueado` / `render_acesso_bloqueado` | streamlit_app | omni_utils | Unificar em um único componente |

### 2.3 Recursos que podem não fazer sentido

1. **minha_jornada_app/** (TypeScript/React): App separado para Jornada Gamificada. Documentado em JORNADA_GAMIFICADA_PLANILHA_E_JSON.md. Se não estiver em uso, considerar remover ou mover para repositório separado.
2. **pages/bncc.csv**: Duplicata — BNCC EF está em `bncc_ef.csv` na raiz. O serviço usa `bncc_ef.csv` ou `bncc.csv`. Verificar se `pages/bncc.csv` é legado.
3. **Google Sheets:** Config opcional, "desativado por enquanto" (secrets.toml.example). Manter documentação, mas remover código morto se houver.
4. **streamlit-cropper**: Usado no Hub para cortar imagens. Verificar se é essencial ou se pode ser substituído por upload simples.
5. **graphviz**: Em requirements.txt. Verificar onde é usado; se não houver uso, remover.

### 2.4 Otimizações recomendadas

| Área | Sugestão |
|------|----------|
| **Cache** | `@st.cache_data` já usado em bncc_service, list_students_rest. Revisar TTLs (3600 para BNCC é adequado). |
| **Imports** | Lazy import em funções de IA (já usado em partes). Expandir para openai, docx, etc. em rotas pouco usadas. |
| **Cold start** | warmup_secrets() em streamlit_app — OK. Considerar pré-carregar apenas chaves usadas na Home. |
| **Supabase** | get_sb() centralizado. Evitar múltiplas conexões. |
| **BNCC** | Arquivos CSV na raiz (bncc_ef, bncc_ei, bncc_em). Estrutura OK. |
| **Session state** | Chaves espalhadas (autenticado, workspace_id, etc.). Documentar em um único lugar (ex.: docs/SESSION_STATE_KEYS.md). |

---

## 3. Organização e Limpeza

### 3.1 Imports

- **Hub:** Remover `import omni_utils as ou` duplicado (linha 38).
- **Hub:** Corrigir bloco docx: `qn` não pode ser `lambda x: x, RGBColor` (tupla). Usar `qn = lambda x: x` em fallback e manter import único.
- **Padronizar:** Ordem: stdlib → third-party → local. Agrupar por categoria.

### 3.2 Convenções sugeridas

- **Funções:** snake_case. Prefixo `_` para funções privadas do módulo.
- **Constantes:** UPPER_SNAKE_CASE (já usado: METODOLOGIAS, CAMPOS_EXPERIENCIA_EI_FALLBACK).
- **Docstrings:** Manter em funções públicas. Adicionar type hints onde faltar.
- **Seções:** Usar `# =====...` para separar blocos lógicos (já utilizado).

### 3.3 UI / Layout

- **ui/permissions.py:** Único arquivo em ui/. Funciona com members_service.
- **ui_lockdown.py:** Esconde chrome do Streamlit. Usado em páginas.
- **layout.py, guards.py, students_loader.py:** Não existem no projeto. Remover referências se houver em docs antigos.

### 3.4 Variáveis e conexões críticas

| Variável / Chave | Onde é usada | Status |
|------------------|--------------|--------|
| SUPABASE_URL, SUPABASE_SERVICE_KEY | supabase_client, omni_utils | OK |
| DEEPSEEK_API_KEY | omni_utils (omnired) | OK |
| OPENROUTER_API_KEY, KIMI_API_KEY | omni_utils (omniblue), Hub PPT | OK |
| ANTHROPIC_API_KEY | omni_utils (omnigreen) | OK |
| GEMINI_API_KEY | omni_utils (omniyellow), Hub imagens | OK |
| OPENAI_API_KEY | Fallback, PEI PDF, Hub experiências EI | OK |
| UNSPLASH_ACCESS_KEY | Hub (buscar imagens) | Opcional |
| workspace_has_engine | admin_service → motores por escola | OK |

---

## 4. Checklist para Registro (Amanhã)

- [x] Remover imports duplicados (Hub)
- [x] Corrigir fallback de `qn` no Hub
- [x] set_page_config antes de ui_lockdown (PGI, Gestão, Admin, Config Escola)
- [ ] Garantir que secrets.toml.example está atualizado
- [ ] Executar testes: `pytest tests/`
- [ ] Verificar que não há credenciais hardcoded (grep para sk-, eyJ)
- [ ] README com instruções de setup
- [ ] .gitignore com secrets.toml, venv, __pycache__
- [ ] Remover ou documentar minha_jornada_app se não estiver em uso
- [ ] Remover pages/bncc.csv se for duplicata de bncc_ef.csv

---

## 5. Resumo Executivo

| Categoria | Status | Ação prioritária |
|-----------|--------|------------------|
| **Motores IA** | OK | Manter documentação atualizada |
| **Conexões Supabase** | OK | - |
| **BNCC EF/EM/EI** | OK | Filtro por membro aplicado em EF e EM |
| **Código duplicado** | Atenção | Remover import duplicado e corrigir qn |
| **Arquivos grandes** | Atenção | Refatorar em fases (pós-registro) |
| **Recursos opcionais** | Revisar | Google Sheets, graphviz, minha_jornada |
| **Organização** | Bom | Pequenos ajustes antes do registro |

---

*Relatório gerado para preparação do registro de código.*
