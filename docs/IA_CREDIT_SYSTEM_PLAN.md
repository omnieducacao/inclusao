# Plano de Evolução: Sistema de Uso e Créditos de IA

Este documento descreve a implementação inicial do sistema de rastreamento de uso de IAs e a base para um futuro sistema de créditos, a ser retomado após o MVP.

## 1. Implementação Atual (MVP)

A seguinte estrutura foi implementada para permitir o rastreamento e controle básico do uso de IA:

### 1.1. Base de Dados (Supabase)

- **Tabela `ia_usage`**:
  - `id`: UUID (PK)
  - `workspace_id`: UUID (FK para `workspaces.id`)
  - `engine`: TEXT (ex: 'red', 'blue', 'green', 'yellow', 'orange' – correspondendo aos codenames OmniRed, OmniBlue, etc.)
  - `source`: TEXT (opcional, ex: 'pei', 'paee_visual', 'hub_adaptar_atividade')
  - `credits_consumed`: NUMERIC (padrão 1.0, para futura ponderação de custos)
  - `created_at`: TIMESTAMPZ (com default `now()`)

- **Tabela `workspaces` (campos adicionados)**:
  - `plan`: TEXT (default 'basic', valores possíveis: 'basic', 'robusto')
  - `credits_limit`: INTEGER (opcional, NULL = ilimitado)
  - `credits_period_start`: DATE (opcional, para definir o início do ciclo de créditos)

**Ação Necessária**: Executar o script de migração `00022_ia_usage_credits.sql` no Supabase.

### 1.2. Rastreamento de Uso (`track_ia_usage`)

- Uma função `track_ia_usage(engine, source=None, credits_consumed=1.0)` foi adicionada em `omni_utils.py`.
- Esta função é chamada automaticamente após respostas bem-sucedidas:
  - Em `chat_completion_multi_engine` (para todos os motores OmniRed, OmniBlue, OmniGreen, OmniOrange).
  - Em chamadas diretas ao Gemini (OmniYellow), como no "Hub de Inclusão" (adaptar atividade para imagens).

### 1.3. Painel Administrativo

- Uma nova aba "📊 Uso de IAs" foi adicionada em `pages/8_Admin_Plataforma.py`.
- Exibe um resumo do uso por escola (workspace):
  - Contagem de chamadas por motor (OmniRed, OmniBlue, etc.).
  - Total de chamadas e créditos consumidos.
  - Plano atual da escola (`basic` ou `robusto`).
  - Limite de créditos configurado.
- Permite selecionar o período de visualização (7, 30, 90 dias).

### 1.4. Gerenciamento de Planos e Créditos por Escola

- No formulário de "Editar Escola" no Admin:
  - Campos para definir o "Plano" (`Basic` ou `Robusto`).
  - Campo para definir o "Limite de créditos no período" (0 ou vazio = ilimitado).
- A informação do plano e limite é visível na listagem de escolas.

### 1.5. Restrição de Acesso ao OmniGreen (Claude)

- O motor OmniGreen (Claude) é restrito a escolas com `plan = 'robusto'`.
- Se uma escola com `plan = 'basic'` tentar usar OmniGreen, uma mensagem de erro é exibida, direcionando-a a entrar em contato com o administrador para migrar de plano.

## 2. Próximos Passos (Pós-MVP)

Para evoluir este sistema para um produto completo de gerenciamento de créditos:

### 2.1. Ciclo e Consumo de Créditos

- **Definição de Ciclo**: Implementar a lógica para usar `credits_period_start` para definir o início do ciclo de créditos (mensal, trimestral, etc.).
- **Reinicialização de Créditos**: Desenvolver um mecanismo (manual via Admin ou automático via Supabase Edge Function/Cron Job) para "zerar" a contagem de créditos consumidos ou ajustar `credits_period_start` no início de cada novo ciclo.
- **Ponderação de Créditos**: Ajustar o `credits_consumed` de cada chamada de IA conforme o custo real ou complexidade do motor/tipo de chamada (ex: Gemini Vision pode "custar" mais créditos do que DeepSeek Chat).

### 2.2. Bloqueio por Limite de Créditos

- Implementar a verificação antes de cada chamada de IA:
  - Se `credits_limit` for definido para a escola e `credits_consumed` no período atual for >= `credits_limit`, bloquear a chamada.
  - Exibir uma mensagem clara para o usuário, informando que os créditos foram esgotados e sugerindo a migração para um plano mais robusto ou contato com o suporte.

### 2.3. Integração com Fluxo Comercial

- **Assinatura e Pagamento**: Conectar o sistema de planos e créditos com uma plataforma de gerenciamento de assinaturas e pagamentos (Stripe, etc.).
- **Upgrade/Downgrade de Planos**: Desenvolver a lógica e a interface para permitir que as escolas façam upgrade ou downgrade de planos, ajustando `plan`, `credits_limit` e `credits_period_start` automaticamente.

### 2.4. Otimização de Prompts

- Revisar e otimizar os prompts de IA específicos para cada motor (DeepSeek/Kimi/Gemini/Claude) para garantir a máxima eficiência, qualidade e menor consumo de tokens/créditos.

---

**Observação**: No momento do MVP, o foco é apenas no rastreamento e na restrição do OmniGreen. As funcionalidades de bloqueio por limite de créditos e o ciclo de reinicialização serão priorizadas no futuro, quando a plataforma escalar para um modelo de produto pago.