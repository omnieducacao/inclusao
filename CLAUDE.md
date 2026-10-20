# Omnisfera — instruções para o Claude Code

Plataforma de inclusão para a escola (estudo de caso, PEI, PAEE, diário do AEE, sala de aula comum, coordenação e família) e o site www.omnisfera.net. Respostas e textos da interface em português do Brasil; toda sigla é explicada na primeira menção.

O app fica em `nextjs-app/`. O site é gerado fora do repositório, em `~/Projetos/Omnisfera/omnisfera-net` (adicione essa pasta à sessão), e publicado em `nextjs-app/public/site`. O contexto completo está em `~/Projetos/Omnisfera/contexto-omnisfera-omniprof.md` (seções 2 a 5, 8 e 9).

## Quem é quem
- **Rodrigo** decide e fornece credenciais.
- **Claude Code (você)** executa no Mac: escreve código, roda testes, sobe o app local, confere no navegador, faz commit e faz o push (regra abaixo).
- **Claude no app (chat)** planeja, organiza o Jira e acompanha pelos commits e comentários.

## Regras de trabalho
1. Commit a cada mudança, com mensagem que começa por `Onda NN:` (a próxima depois da última no `git log`) e cita a tarefa do Jira, ex.: `Onda 58: legenda legível nos três temas (SCRUM-212)`.
2. Antes de concluir uma tarefa: `npx tsc --noEmit`, `npm test` e `npm run build` sem erro, dentro de `nextjs-app/`.
3. Mudança de banco (arquivo novo em `nextjs-app/supabase/migrations/`) ou de configuração em produção só com o OK do Rodrigo.
4. Nunca digitar, guardar ou mostrar senhas, chaves ou tokens.
5. Dados de estudantes: a IA nunca recebe o nome do estudante; cada escola vê só os seus. Estudantes da demonstração e de teste são fictícios (Escola Demo, Beatriz Almeida); dados de teste são criados e apagados depois.
6. Quando o Rodrigo precisar rodar algo, entregar o comando completo, com o `cd` até a pasta certa.

## Regra do push (cada push na main faz deploy automático no Render, direto em www.omnisfera.net)
1. Push ao fim de cada tarefa da fila, não a cada commit.
2. Só com tipos, testes e build verdes. Nunca `--force`, nunca reescrever histórico enviado, nunca pular os testes.
3. Pare e peça o OK do Rodrigo antes do push se a tarefa tiver migration, mudança em `proxy.ts` que afete login ou rotas públicas, ou mudança em permissões e regras de acesso.
4. Depois do push, confira se o deploy do serviço "Omnisfera Nextjs" no Render ficou "live" e se o site e o `/login` abrem. Se falhar, avise na hora.

## Site (omnisfera.net)
1. Edite no gerador (`~/Projetos/Omnisfera/omnisfera-net/src` e os `.py`), nunca direto em `public/site`.
2. Gere e publique: `cd ~/Projetos/Omnisfera/omnisfera-net && python3 build.py && ./publicar-no-app.sh`
3. Se criar ou renomear página, atualize `SITE_PAGES` em `nextjs-app/proxy.ts`.
4. Mantenha `apple-touch-icon.png`, `favicon.png`, `favicon.svg` e `og.png` em `public/site`.

## Marca e voz
- Texto simples e direto, reconhecível por quem é da escola. Usar "na sala de aula". Termo: "plataforma", não "ecossistema".
- Nomes oficiais da BNCC: Língua Portuguesa e Língua Inglesa; "ano" no Fundamental e "série" no Médio.
- Base legal pelo nome: Decreto 12.686/2025, Decreto 12.773/2025, Portaria MEC 421/2026.
- Cores do símbolo (`#e5484d`, `#f5b82e`, `#f28c28`, `#8e5bd8`, `#2f7fd1`, `#2eaa6a`) são para formas e o símbolo. Para texto, use os tons escuros (`--k1` a `--k6` no site), que passam no contraste.
- O OmniProf tem funções próprias; quando aparecer aqui, dizer que é "assinatura individual do professor". O PEI é da Omnisfera.

## A fila
Tarefas no Jira (amorimqueiroz.atlassian.net, projeto SCRUM, épico SCRUM-61) com a etiqueta `claude-code-omnisfera`; a ordem é `fila-1`, `fila-2`…
```
project = SCRUM AND labels = claude-code-omnisfera AND statusCategory != Done ORDER BY labels ASC
```
Sem Jira conectado, use `docs/claude-code/fila.md`. Para cada tarefa: leia descrição e comentários, faça, teste, commit, push pela regra acima e comente na tarefa o que fez, o commit, o deploy e o que ficou pendente. Pare e pergunte só se algo for irreversível ou ambíguo. Comando curto: `/fila`.

## Economia de tokens
1. Uma sessão por tarefa: ao terminar, `/rename SCRUM-NNN` e `/clear`.
2. Sonnet como padrão; Opus só para arquitetura, banco ou segurança; Haiku em subagentes simples.
3. Testes, build, Lighthouse e logs rodam em subagente; traga só o resumo.
4. Tarefa grande começa no modo de planejamento. Leia só os arquivos que a tarefa cita.

## Compactação
Ao usar `/compact`, preserve: a tarefa do Jira em andamento, os commits, os arquivos alterados, o resultado dos testes, o estado do deploy e o que ficou pendente.
