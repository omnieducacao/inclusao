# Fila do Claude Code — Omnisfera

Cópia da fila do Jira (etiqueta `claude-code-omnisfera`). A fonte é o Jira. Atualizada em 20/10/2026.
Os detalhes de cada tarefa (medições, seletores, correções testadas) estão na descrição dela no Jira.

## fila-1 · SCRUM-212 · Legenda legível nos três temas do app (alta)
`--text-muted` em `nextjs-app/app/globals.css` está abaixo de 4,5:1: claro 2,56, Caderno 2,52, noturno 3,73.
Tons testados: claro `#5b6b80` (5,4:1), Caderno `#6b645f` (5,4:1), noturno `#8a96aa` (5,9:1). Conferir na tela os três temas e o alto contraste.

## fila-2 · SCRUM-213 · Cores do símbolo como texto no site (alta)
No gerador do site: texto com `--c1` a `--c6` passa a usar `--k1` a `--k6` (`.role .tag`, `.cert-erro`, `.myth-badge`, feedback das perguntas). O símbolo e as formas mantêm as cores originais.

## fila-3 · SCRUM-217 · Home e formação do site (alta)
Números dos temas da formação (`.no`): fundo com os tons escuros (5,4 a 7,0:1). Home: lista `<ol>` mal formada, rolagens `.rio-linha` e `.rev` sem acesso pelo teclado, título fora de ordem. Depois, `/impeccable audit` e `/impeccable critique` no modo Persuadir (home, `/conheca`, `/#omnisfera`) e Lighthouse no celular.

## fila-4 · SCRUM-214 · Diário mais leve (média)
`RelatoriosTab.tsx`: carregar o PDF com `import()` só ao clicar (como em `ProvaEmPapel.tsx`) e o gráfico com `next/dynamic`. Medir o pacote antes e depois.
