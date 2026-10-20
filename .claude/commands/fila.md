---
description: Segue a fila da Omnisfera no Jira (etiqueta claude-code-omnisfera)
---
Leia `CLAUDE.md`. Busque no Jira a fila com a etiqueta `claude-code-omnisfera` (ordem por `fila-N`); sem Jira, use `docs/claude-code/fila.md`.

Execute as tarefas em ordem, de forma autônoma, seguindo "Regras de trabalho", "Regra do push" e "Economia de tokens" do CLAUDE.md: uma tarefa por vez; faça; rode `npx tsc --noEmit`, `npm test` e `npm run build` em `nextjs-app/`; commit; push quando a tarefa estiver verde e não cair nas exceções; confira o deploy; comente na tarefa. Ao fim de cada tarefa, lembre o Rodrigo de usar `/rename` e `/clear`. Ao terminar a fila, mostre um resumo curto com commits, deploys e pendências.

$ARGUMENTS
