# Backup — Ponto de restauração (fevereiro 2025)

**Data:** 02/02/2025  
**Branch:** `ominsfera-supabse`  
**Commit:** `df82d255` (ajuste api kimi)  
**Tag criada:** `backup-funcionando-fev2025`

---

## Estado atual — o que está funcionando

- **Login:** email/senha (workspace_members, platform_admins)
- **PEI:** geração com motores red/blue/green/yellow/orange
- **PAEE:** planejamento de ciclos, diagnóstico de barreiras, projetos EI
- **Hub:** adaptar prova, adaptar atividade, roteiro, plano de aula, dinâmica inclusiva, Papo de Mestre, Estúdio Visual
- **Loading:** "Omnisfera trabalhando..." + linha explicando o motor
- **Motores de IA por escola:** `ai_engines` no cadastro (não mais plano robusto para omnigreen)
- **Omniblue (Kimi):** URL fixa OpenRouter `https://openrouter.ai/api/v1`, tratamento de erro HTML
- **Deep Seek:** leitura robusta de chave (env, secrets), mensagem clara para Render
- **Deploy:** Streamlit Cloud e Render (omnisfera.net)

---

## Commits relevantes (do mais recente)

| Hash       | Mensagem                  |
|-----------|---------------------------|
| df82d255  | ajuste api kimi           |
| 6845770d  | load                      |
| e2e49ec8  | ias no .net               |
| d415b48b  | menu                      |
| e8f3771c  | icone                     |

---

## Como restaurar este ponto

### Opção 1 — Reset hard (perda de commits posteriores)

```bash
cd "/caminho/inclusao"
git checkout ominsfera-supabse
git reset --hard df82d255
```

### Opção 2 — Tag de backup (recomendado)

```bash
git tag backup-funcionando-fev2025 df82d255
git push origin backup-funcionando-fev2025
```

Para restaurar depois:

```bash
git checkout ominsfera-supabse
git reset --hard backup-funcionando-fev2025
```

### Opção 3 — Branch de backup

```bash
git branch backup-fev2025 df82d255
git push origin backup-fev2025
```

---

## Configurações críticas (Render / Streamlit Cloud)

| Variável            | Uso                                |
|---------------------|------------------------------------|
| SUPABASE_URL        | URL do projeto Supabase            |
| SUPABASE_SERVICE_KEY| Chave service_role                 |
| SUPABASE_ANON_KEY   | Chave anon (fallback)              |
| DEEPSEEK_API_KEY    | omnired                            |
| OPENROUTER_API_KEY  | omniblue (Kimi via OpenRouter)     |
| KIMI_API_KEY        | Alternativa a OPENROUTER_API_KEY   |
| ANTHROPIC_API_KEY   | omnigreen (Claude)                 |
| GEMINI_API_KEY      | omniyellow (imagens, mapas)        |
| OPENAI_API_KEY      | omniorange (fallback opcional)     |

**Importante:** não definir `OPENROUTER_BASE_URL` — o app usa URL fixa para OpenRouter.

---

## Arquivos sensíveis alterados nesta fase

- `omni_utils.py` — motores, loading, sanitização de chaves, `workspace_has_engine`
- `services/admin_service.py` — `workspace_has_engine`, cache ai_engines
- `pages/3_Hub_Inclusao.py` — tratamento de erro Kimi/PPT
- `pages/8_Admin_Plataforma.py` — legenda motores
- `pages/0_Home.py`, `streamlit_app.py` — CSS, warmup
- `.streamlit/config.toml` — toolbarMode

---

## Branches

- `ominsfera-supabse` — desenvolvimento/testes (atual)
- `omnisfera.net` — produção (Render)
- `main` — principal
- `render` — alternativa deploy
