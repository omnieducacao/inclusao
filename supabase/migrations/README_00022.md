# Migration 00022: Uso de IAs e créditos

- **Tabela `ia_usage`**: registra cada chamada a um motor de IA (workspace_id, engine, source, credits_consumed, created_at). Usado para métricas no Admin e base para sistema de créditos.
- **workspaces**: novos campos `plan` (basic|robusto), `credits_limit` (int, opcional), `credits_period_start` (date, opcional).

**OmniGreen** fica disponível apenas para escolas com `plan = 'robusto'`. No app, ao tentar usar OmniGreen com plano basic, é exibida mensagem para contatar o administrador.

**Admin → Uso de IAs**: tabela por escola com contagem por motor (OmniRed, OmniBlue, etc.), total de chamadas e créditos usados. Permite escolher período (7, 30, 90 dias).

**Admin → Editar escola**: campos Plano (Basic / Robusto) e Limite de créditos (opcional). Ao atingir o limite, a escola pode migrar para plano mais robusto (fluxo comercial a definir).

Execute no Supabase SQL Editor: `00022_ia_usage_credits.sql`.
