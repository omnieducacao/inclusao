# Testes Massivos — Omnisfera

## Visão geral

A Omnisfera possui uma suíte de testes automatizados para validar serviços críticos (autenticação, gestão de usuários, admin) sem depender de banco real ou interface Streamlit.

## Como rodar

### Método 1: run_simple.py (sem dependências extras)

Não exige `pytest`; roda com `python3`:

```bash
cd inclusao
python3 tests/run_simple.py           # 1 rodada
python3 tests/run_simple.py --repeat 20   # 20 rodadas massivas
```

### Método 2: pytest (recomendado se tiver pytest)

```bash
pip install pytest pytest-cov
pytest tests/ -v
```

### Com cobertura
```bash
pytest tests/ -v --cov=services --cov=omni_utils --cov-report=term-missing
```

### Massivo (várias rodadas)
```bash
./run_tests.sh --repeat 10
# ou
python3 tests/run_simple.py --repeat 10
```

### Paralelo (mais rápido, pytest)
```bash
pip install pytest-xdist
pytest tests/ -n auto -v
```

## Estrutura

```
tests/
├── conftest.py          # Fixtures e mocks (requests, env)
├── test_admin_service.py
├── test_members_service.py
├── test_omni_utils.py
└── test_supabase_client.py
```

## O que é testado

| Módulo | Casos |
|--------|-------|
| **members_service** | Hash de senha, verificação master/member, find_user_by_email, list_members |
| **admin_service** | Hash, verify_platform_admin, list_platform_admins |
| **omni_utils** | get_icon, icon_title, _get_initials |
| **supabase_client** | _get_supabase_url_and_key, rpc_workspace_from_pin (mock) |
| **school_config_service** | SEGMENTS, COMPONENTS, list_school_years, list_grades |
| **monitoring_service** | log_usage_event, get_usage_snapshot, create_platform_issue, _parse_iso |
| **ui/permissions** | can_access, _student_grade_to_match_keys, filter_students_by_member (todos, tutor, turma) |

## Mocks

- `requests.get` / `requests.post` / `requests.patch`: simulam respostas HTTP
- Variáveis de ambiente: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` definidas em `conftest.py`
- Não há chamadas reais ao Supabase ou à API

## Adicionar novos testes

1. Crie `tests/test_<modulo>.py`
2. Use fixtures de `conftest.py` (ex.: `mock_requests_get`)
3. Rode `pytest tests/test_<modulo>.py -v`
