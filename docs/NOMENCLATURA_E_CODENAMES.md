# Nomenclatura e Codenames — Omnisfera

## Codenames das IAs (uso em textos visíveis ao professor)

Para evitar expor nomes comerciais de modelos, usamos codenames na interface:

| Motor | Ecossistema | Exemplo de uso |
|-------|-------------|----------------|
| **Omnisfera Red** | Claude (Anthropic Cloud 3.5) | Criação de PEI |
| **Omnisfera Blue** | DeepSeek | Recursos do Hub (principal) |
| **Omnisfera Green** | Kimi | Assistência de texto/chat |
| **Omnisfera Yellow** | Gemini | OCR/visão (Adaptar Atividade), imagens, mapas mentais |
| **Omnisfera Orange** | ChatGPT (OpenAI) | Fallback opcional — acionar se motores principais falharem |

Constantes em `omni_utils.py`: `AI_RED`, `AI_BLUE`, `AI_GREEN`, `AI_YELLOW`, `AI_ORANGE`.

**Chaves obrigatórias (4):** ANTHROPIC_API_KEY (Red), DEEPSEEK_API_KEY (Blue), KIMI_API_KEY (Green), GEMINI_API_KEY (Yellow).
**Chave opcional:** OPENAI_API_KEY (Orange) — apenas se quiser fallback.

---

## Diagnóstico: uso restrito à Omnisfera

**Regra:** Informações de diagnóstico clínico (incluindo CID) **nunca** devem aparecer em materiais entregues ao estudante ou à família.

- **Uso interno (OK):** PEI, PAEE, Hub, Monitoramento, lista de estudantes — apenas para a equipe pedagógica
- **Proibido:** Jornada gamificada (PDF, Google Sheets, app Minha Jornada), qualquer export para o estudante

**Nomenclatura preferida em contexto interno:**
- "Contexto clínico (apenas equipe)"
- "Contexto (equipe)"
- Evitar "diagnóstico" em labels que possam ser confundidos com material do estudante

---

## Jornada Gamificada: cuidado redobrado

O material da Jornada é entregue ao estudante e à família. Garantir:

1. **Prompts:** Instrução explícita "NUNCA inclua diagnóstico clínico, CID ou condições médicas"
2. **Nomenclatura:** Usar "Interesses / Foco" em vez de "Hiperfoco" no cabeçalho do Sheets (mais acolhedor)
3. **Revisão:** Professor deve revisar o conteúdo antes de aprovar e exportar
