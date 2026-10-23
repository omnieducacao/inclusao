# Segredos da Omnisfera: o que são, onde ficam e como trocar

Este documento **não contém nenhum valor de chave**. As chaves ficam no painel do Render (variáveis de ambiente do
serviço "Omnisfera Nextjs") e, para uso local, em `nextjs-app/.env.local`, que o git ignora. Nunca cole uma chave no
repositório, em comentário do Jira, em mensagem de commit ou em conversa com a IA.

Quem troca as chaves é o **Rodrigo**. O Claude Code deixa o passo a passo e os scripts prontos.

## Mapa dos segredos

| Variável | Para que serve | Onde é lida | Se vazar |
|---|---|---|---|
| `SESSION_SECRET` | Assina o login (JWT) de todos | `lib/jwt-secret.ts` | Qualquer pessoa forja um login. **Trocar já.** |
| `ENCRYPTION_KEY` | Cifra os dados de saúde (diagnóstico, medicação, laudos, mensagens da família) | `lib/encryption.ts` | Quem tiver também o banco lê os dados de saúde. **Trocar e recriptografar.** |
| `ENCRYPTION_KEY_ANTERIOR` | Só existe durante uma rotação da `ENCRYPTION_KEY` (leitura) | `lib/encryption.ts` | Igual à `ENCRYPTION_KEY` antiga |
| `SUPABASE_SERVICE_KEY` | Acesso total ao banco, ignora RLS | `lib/supabase.ts` | Acesso a todos os dados de todas as escolas. **Trocar já.** |
| `SUPABASE_URL` | Endereço do banco | `lib/supabase.ts` | Não é segredo |
| `OPENAI_API_KEY`, `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`, `OPENROUTER_API_KEY` / `KIMI_API_KEY`, `ANTHROPIC_API_KEY` | Motores de IA | `lib/ai-engines.ts` | Gasto na conta do provedor. Revogar no provedor. |

Um único nome por segredo: o servidor só lê `SUPABASE_SERVICE_KEY` (o nome antigo `SUPABASE_SERVICE_ROLE_KEY` não vale
mais) e **não usa a chave pública (anon)**. Em produção, se faltar `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` ou `SESSION_SECRET`, o
servidor sobe respondendo erro 500 em tudo (`instrumentation.ts`); o health check `/api/health` falha e o Render **não
troca** a versão no ar.

## Regras gerais

1. Gere chaves novas no seu Mac, nunca em site de terceiros: `openssl rand -hex 32` (hex de 64 caracteres) ou
   `openssl rand -base64 32`.
2. Troque uma chave por vez e confira o site entre uma e outra.
3. Pelo terminal, leia a chave sem deixar no histórico: `read -rs NOME; export NOME` (digita ou cola, não aparece na tela).
4. Depois de trocar, **revogue a antiga** onde ela foi criada (provedor de IA, Supabase). Trocar no Render sem revogar
   deixa a chave velha valendo.
5. Fora do horário de aula quando a troca derrubar o login (item 1 abaixo).

## 1. `SESSION_SECRET` (o login)

Efeito: **todo mundo é desconectado** e precisa entrar de novo. Não perde dado. Avise as escolas e faça fora do horário de aula.

1. Gere: `openssl rand -base64 32`.
2. Render → serviço "Omnisfera Nextjs" → Environment → edite `SESSION_SECRET` → salve (o Render faz novo deploy).
3. Quando o deploy ficar "live": abra `https://www.omnisfera.net/login`, entre com a conta de teste e abra um estudante.

## 2. `ENCRYPTION_KEY` (dados de saúde): sem parada

Os dados já gravados estão cifrados com a chave antiga. O app aceita uma `ENCRYPTION_KEY_ANTERIOR` **só para ler**, então
dá para trocar sem deixar nada ilegível. O script `scripts/recriptografar.mjs` regrava tudo com a chave nova.

Tabelas e colunas cobertas pelo script: `students` (`diagnosis`, e os campos sensíveis de `pei_data` e `paee_data`),
`family_medicacao_updates` (`medicamento`, `dosagem`, `observacao`), `family_laudos` (`transcricao`) e
`family_mensagens` (`texto`). Os campos do PEI/PAEE são os de `SENSITIVE_PEI_FIELDS` e `SENSITIVE_PAEE_FIELDS` em
`lib/encryption.ts`. Se um dia a lista de campos cifrados mudar, mude também `ALVOS` no script.

**Antes de começar**

- Faça um backup do banco (Supabase → Database → Backups) e confirme que ele existe.
- Tenha em mãos a chave antiga (do Render). Sem ela, o dado cifrado com ela não se recupera.

**Passo a passo**

1. Gere a chave nova: `openssl rand -hex 32`.
2. No Render, **de uma vez só**: `ENCRYPTION_KEY` = chave nova e `ENCRYPTION_KEY_ANTERIOR` = chave antiga. Salve e espere o
   deploy ficar "live". A partir daqui o app grava com a nova e abre as duas.
3. No Mac, rode a **simulação** (só conta, não grava):

   ```bash
   cd ~/Projetos/Omnisfera/inclusao-workspace/inclusao-github/nextjs-app
   read -rs ENCRYPTION_KEY_ANTIGA; export ENCRYPTION_KEY_ANTIGA
   read -rs ENCRYPTION_KEY_NOVA; export ENCRYPTION_KEY_NOVA
   read -rs SUPABASE_SERVICE_KEY; export SUPABASE_SERVICE_KEY
   export SUPABASE_URL="https://SEU-PROJETO.supabase.co"
   node scripts/recriptografar.mjs
   ```

   Confira a saída: "a recifrar" mostra quantos valores serão regravados; "não abre com nenhuma" deve ser **0**. Se não
   for 0, **pare** e veja abaixo "Se algo não abrir".
4. Aplique (cada valor é conferido, abrindo com a chave nova, antes de gravar; é seguro repetir):

   ```bash
   node scripts/recriptografar.mjs --aplicar
   ```

5. Verifique que tudo abre com a chave nova:

   ```bash
   node scripts/recriptografar.mjs --verificar
   ```

   Esperado: "OK: todo valor cifrado abre com a chave nova."
6. No site, abra um estudante com diagnóstico e um laudo da família e confira que aparecem.
7. Render: **apague** `ENCRYPTION_KEY_ANTERIOR` e salve. Limpe as variáveis do terminal: `unset ENCRYPTION_KEY_ANTIGA ENCRYPTION_KEY_NOVA SUPABASE_SERVICE_KEY`.
8. Guarde a chave antiga num cofre (gerenciador de senhas) **enquanto existirem backups do banco anteriores à troca**:
   eles continuam cifrados com ela.

**Se algo não abrir:** "não abre com nenhuma" > 0 significa dado cifrado com uma terceira chave (por exemplo, uma chave de
antes) ou corrompido. O script **não mexe** nesses valores. Não apague nada; procure a chave que os abre ou restaure
daquela linha do backup.

**Se algo der errado no meio:** como o app lê as duas chaves, nada fica ilegível. Pode rodar `--aplicar` de novo (o que já
está na chave nova é pulado). O script nunca imprime valores, só contagens e ids.

## 3. `SUPABASE_SERVICE_KEY` (acesso ao banco)

1. No painel do Supabase (projeto "omnisfera") → Project Settings → API (API Keys): gere uma nova chave de serviço/secreta
   e siga as instruções da própria tela para o que acontece com a antiga. Não use a chave `anon`.
2. Render → `SUPABASE_SERVICE_KEY` = chave nova → salve (novo deploy).
3. Quando ficar "live": `https://www.omnisfera.net/api/health`, login e abrir um estudante.
4. Revogue a chave antiga no Supabase.

Se o deploy falhar com "Ambiente de produção incompleto" (aparece nos logs do deploy), o nome da variável está errado ou
vazio; o Render mantém a versão anterior no ar enquanto você corrige.

## 4. Chaves de IA

Para cada provedor (OpenAI, Gemini, DeepSeek, OpenRouter/Kimi, Anthropic):

1. Crie a chave nova no painel do provedor.
2. Render → atualize a variável → deploy.
3. Teste uma função de IA (por exemplo, o plano de aula no Hub).
4. Revogue a chave antiga no provedor e confira o painel de uso dele nos dias seguintes.

Observação (SCRUM-69): dados de estudante e laudos só usam OpenAI ou Gemini. Sem `OPENAI_API_KEY` nem `GEMINI_API_KEY`
essas funções devolvem erro; o DeepSeek e o Kimi não recebem esse tipo de dado.

## 5. Se uma chave vazou

1. Revogue/troque **primeiro** a chave vazada (itens acima), antes de investigar.
2. Se foi `SUPABASE_SERVICE_KEY` ou `ENCRYPTION_KEY`: consulte o log de acesso do Supabase e do Render do período e avise
   a escola/DPO conforme a LGPD (a Omnisfera trata dado de saúde de crianças).
3. Procure o valor no GitHub (Settings → Code security → Secret scanning) e remova do histórico se estiver lá.

## 6. O banco está fechado para a chave pública

Todas as tabelas do schema `public` têm RLS ligado e **nenhuma política**, e as funções não podem ser chamadas pela chave
pública (migration `20261009_onda0_banco_fechado.sql`). O servidor usa a chave de serviço, que ignora o RLS. Conferido em
23/10/2026 no painel de avisos do Supabase (63 tabelas "RLS ligado, sem política").

Como o banco é criado do zero: depois do `supabase/bootstrap_full.sql` e das migrations numeradas, rode **sempre** a
migration da Onda 0. Os arquivos antigos contêm políticas `USING (true)`; é a Onda 0 que as remove.

Testes que travam isso (`__tests__/integration/seguranca-banco.test.ts`):

- Sempre rodam: nenhuma migration depois da Onda 0 cria política aberta, e toda tabela criada depois dela liga RLS.
- Ao vivo (só com as variáveis de teste): com a chave pública, ler `students` e as tabelas de senha dá erro ou zero linhas.

  ```bash
  cd ~/Projetos/Omnisfera/inclusao-workspace/inclusao-github/nextjs-app
  TESTE_SUPABASE_URL="https://SEU-PROJETO.supabase.co" TESTE_SUPABASE_ANON_KEY="<chave pública>" \
    npx vitest run __tests__/integration/seguranca-banco.test.ts
  ```

  A chave pública (anon) fica no painel do Supabase (API); ela vai para o navegador de qualquer jeito, mas não a deixe em
  arquivo do repositório.
