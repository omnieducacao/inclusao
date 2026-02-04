# Nomenclatura e Codenames — Omnisfera

## Codenames das IAs (uso em textos visíveis ao professor)

Para evitar expor nomes comerciais de modelos, usamos codenames na interface:

| Motor | Ecossistema | Exemplo de uso |
|-------|-------------|----------------|
| **Omnisfera Red** | ChatGPT + DALL-E (OpenAI) | Relatórios, metas, cronogramas, imagens DALL-E |
| **Omnisfera Blue** | Gemini, NanoBanana, Gemini imagens (Google) | Jornada gamificada, mapas mentais, ilustrações |
| **Omnisfera Green** | Kimi e derivados | Assistência de texto/chat |

Constantes em `omni_utils.py`: `AI_RED`, `AI_BLUE`, `AI_GREEN`.

---

## Diagnóstico: uso restrito à Omnisfera

**Regra:** Informações de diagnóstico clínico (incluindo CID) **nunca** devem aparecer em materiais entregues ao estudante ou à família.

- **Uso interno (OK):** PEI, PAE, Hub, Monitoramento, lista de estudantes — apenas para a equipe pedagógica
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
