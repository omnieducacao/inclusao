# Nomenclatura e Codenames — Omnisfera

## Codenames das IAs (omnired, omniblue, omnigreen, omniyellow, omniorange)

Para evitar expor nomes comerciais de modelos, usamos codenames na interface. No Admin, ao criar o perfil da escola, é possível associar as IAs e especificar o que cada codename significa para aquela escola.

| Nome   | Ecossistema      | Uso principal |
|--------|------------------|----------------|
| **OmniRed**   | DeepSeek         | Mais utilizado: PEI, PAEE, Adaptar Provas, Hub (texto) |
| **OmniBlue**  | Kimi             | Opção mais robusta: PEI, PAEE, Adaptar Provas, Hub (texto) |
| **OmniGreen** | Cloud (Claude)   | Apenas no PEI |
| **OmniYellow**| Gemini           | Imagens, mapas mentais, Adaptar Atividades, Estúdio Visual |
| **OmniOrange**| ChatGPT (OpenAI) | Reserva/fallback opcional |

Constantes em `omni_utils.py`: `AI_RED`, `AI_BLUE`, `AI_GREEN`, `AI_YELLOW`, `AI_ORANGE`.

**Chaves:** DEEPSEEK_API_KEY (OmniRed), OPENROUTER_API_KEY ou KIMI_API_KEY (OmniBlue), ANTHROPIC_API_KEY (OmniGreen), GEMINI_API_KEY (OmniYellow), OPENAI_API_KEY (OmniOrange — opcional).

### Uso por recurso (padrão)

- **PEI:** OmniRed, OmniBlue, OmniGreen
- **PAEE:** OmniRed, OmniBlue (texto); OmniYellow para imagens e mapa mental
- **Adaptar Provas:** OmniRed, OmniBlue
- **Adaptar Atividades:** OmniYellow (Gemini)
- **Estúdio Visual:** apenas OmniYellow
- **Demais recursos do Hub (texto):** OmniRed, OmniBlue

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

---

## Termo de uso

O termo de uso (exibido no primeiro acesso e editável em Admin → Termo de Uso) deve mencionar quais motores de IA estão disponíveis para a escola, conforme configurado no perfil da escola.
