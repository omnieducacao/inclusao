# Sistema de créditos e uso de IAs — retomar no lançamento do produto

**Status atual (MVP):** A base está implementada (tabelas, rastreamento, Admin), mas **não estamos gastando energia** com enforcement de limites nem com ciclo de créditos. O MVP roda sem restringir uso por créditos.

**Quando lançar como produto:** Retomar este doc e implementar os itens abaixo.

---

## O que já existe (pronto para usar)

- **Migration `00022_ia_usage_credits.sql`**
  - Tabela `ia_usage`: registra cada chamada (workspace, engine, source, credits_consumed, created_at).
  - Em `workspaces`: `plan`, `credits_limit`, `credits_period_start`.

- **Rastreamento**
  - `track_ia_usage()` em `omni_utils` (chamado após cada resposta de IA em `chat_completion_multi_engine` e nas chamadas Gemini do Hub).
  - `monitoring_service.log_ia_usage` e `get_ia_usage_summary`.

- **Admin**
  - Aba "Uso de IAs": resumo por escola (chamadas por motor, total, créditos, plano, limite).
  - Edição de escola: campos Plano (Basic/Robusto) e Limite de créditos.

- **Restrição OmniGreen**
  - OmniGreen (Claude) só é permitido para `plan = 'robusto'`; plano basic recebe mensagem para contatar o admin.

---

## O que fazer quando lançar como produto

1. **Ciclo de créditos**
   - Definir regra de período (ex.: mensal a partir de `credits_period_start`).
   - Ao renovar assinatura/ciclo, atualizar `credits_period_start` e, se quiser, zerar contagem considerando apenas registros a partir dessa data.

2. **Enforcement de limite**
   - Antes de chamar qualquer motor (ou só os “premium”): consultar uso no período atual vs `credits_limit`.
   - Se atingiu o limite: não chamar IA e exibir mensagem (ex.: “Créditos esgotados. Faça upgrade ou aguarde o próximo ciclo.”).

3. **Planos e assinatura**
   - Fluxo comercial: assinatura por escola, quantidade de créditos por plano, upgrade/downgrade.
   - Cloud (e outros recursos premium) apenas em planos mais robustos — já há exemplo com OmniGreen.

4. **Ajustes opcionais**
   - Pesos diferentes por motor (ex.: 1 crédito OmniRed, 2 OmniBlue, 3 OmniGreen) em `credits_consumed` ao chamar `track_ia_usage`.
   - Incluir todas as chamadas Gemini (mapa mental, estúdio visual, etc.) com `source` específico para métricas e cobrança.

---

## Referência rápida

| Item | Onde está |
|------|-----------|
| Migration | `supabase/migrations/00022_ia_usage_credits.sql` |
| README da migration | `supabase/migrations/README_00022.md` |
| Registro de uso | `omni_utils.track_ia_usage`, `monitoring_service.log_ia_usage` |
| Resumo por escola | `monitoring_service.get_ia_usage_summary` |
| Admin (Uso de IAs + plano/créditos) | `pages/8_Admin_Plataforma.py`, `admin_service` |
| Verificação plano (OmniGreen) | `omni_utils.chat_completion_multi_engine` + `admin_service.get_workspace_plan` |

---

*Documento criado para retomada pós-MVP, quando o produto for lançado.*
