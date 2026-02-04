# Feedback de IA para Treinamento

A Omnisfera captura **validações** e **refazimentos** de conteúdos gerados por IA para evolução e treinamento futuro.

## Tabela `ai_feedback`

| Campo | Descrição |
|-------|-----------|
| workspace_id | Escola |
| member_id | Usuário (opcional) |
| source | `pei`, `paee`, `hub` |
| content_type | Tipo de conteúdo (ex: relatorio_pei, atividade_adaptada, roteiro) |
| action | `validated` ou `refazer` |
| feedback_text | O que o usuário disse que precisava ajustar (quando refazer) |
| metadata | JSON com contexto adicional |
| created_at | Data/hora |

## Onde é capturado

- **PEI**: Aprovar plano, Regerar com ajustes
- **PAEE**: Validar e finalizar, Regerar com ajustes (com feedback)
- **Hub**: Validar/Refazer em provas, atividades, roteiros, dinâmicas, planos, experiências EI, cenas, pictogramas

## Uso para treinamento

Os dados em `feedback_text` (quando `action = refazer`) indicam o que o professor considerou incorreto ou a melhorar. Use para:

- Ajustar prompts
- Fine-tuning de modelos
- Análise de falhas recorrentes

## Migration

Execute `supabase/migrations/00021_ai_feedback.sql` no Supabase.
