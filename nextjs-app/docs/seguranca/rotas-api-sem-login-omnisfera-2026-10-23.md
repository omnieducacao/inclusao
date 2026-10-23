# Rotas /api da Omnisfera chamadas sem login (SCRUM-227)

23/10/2026. Build de produção local (`next start`), uma chamada por rota e método: sem cookie,
com cookie falso e, nas rotas que terminam em `[id]`, com o endereço terminando em `.png`.
Rotas públicas que gravam dados receberam corpo vazio, para só passar pela validação.
A parte do OmniProf está no repositório dele (`docs/seguranca/rotas-api-sem-login-2026-10-23.md`).

## Resultado

- 150 arquivos de rota, 209 pares rota × método; 208 chamados.
- **201 respondem 401** sem login e com cookie falso. As 8 rotas restantes são públicas de propósito
  (tabela abaixo) e têm limite de tentativas e validação.
- **Nenhuma rota sensível aberta.** Não há webhook na Omnisfera.

## O que foi corrigido no `proxy.ts` (Onda 82)

1. **API sem sessão respondia 307 (ida para a tela de login)**, e quem chamou recebia HTML no lugar dos
   dados. Agora responde **401 em JSON**; sessão inválida, vencida ou assinada com outra chave também
   dá 401 e apaga o cookie. As telas continuam indo para o login.
2. **Endereços de API terminando em `.png`, `.svg`, `.jpg` etc. pulavam o `proxy.ts`** (o matcher exclui
   imagens). As rotas checavam a sessão por conta própria, então nada vazou, mas o bloqueio do perfil
   família e o modo só leitura da demonstração ficavam de fora. Agora o matcher começa por
   `/api/:path*` e toda rota de API passa pelo proxy.

Testes: `__tests__/unit/proxy-api-sem-login.test.ts`.

## Fica para outras tarefas

- Isolamento entre escolas (uma escola não lê dados de outra): revisado nas SCRUM-67 e SCRUM-68; o
  isolamento no próprio banco (RLS, regras de acesso por linha) é a SCRUM-230.
- `POST /api/vitals` grava o que chega sem validar o corpo (só com limite de tentativas). Vale validar
  nome e valor da métrica.
- `PUBLIC_PATHS` compara pelo começo do endereço (`/api/health` também libera `/api/healthX`). Hoje
  não existe rota assim; trocar por comparação exata evita surpresa no futuro.

## Tabela rota × proteção

| Rota | Método | Sem login | Cookie falso | Termina em .png | Proteção |
|---|---|---|---|---|---|
| `/api/admin/acessos` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/activity-log` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/announcements` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/announcements` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/audit-log` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/cifrar-dados` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/cleanup` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/dashboard` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/export` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/ia-usage` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/instagram-feed/[id]` | PATCH | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/admin/instagram-feed/[id]` | DELETE | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/admin/instagram-feed` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/instagram-feed` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/issues/[id]` | PATCH | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/admin/issues` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/issues` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/leads` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/leads` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/leads` | DELETE | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/lottie-icons` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/metrics` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/platform-config` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/platform-config` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/simulate` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/simulate` | DELETE | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/site` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/users` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/users` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/workspaces/[id]` | PATCH | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/admin/workspaces/[id]` | DELETE | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/admin/workspaces` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/admin/workspaces` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/ai-engines/available` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/announcements/mark-viewed` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/announcements/unviewed` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/auth/admin-login` | POST | 400 | 400 | — | Pública: login do admin; limite por IP e por conta, validação do corpo. |
| `/api/auth/login` | POST | 400 | 400 | — | Pública: login; limite por IP e por conta (SCRUM-229), validação do corpo. |
| `/api/auth/logout` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao-processual/evolucao` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/confronto` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/confronto` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/diagnostica/questoes` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/diagnostica` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/diagnostica` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/matriz` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/processual` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/processual` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/prova/item` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/prova/ler` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/prova` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/prova` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/avaliacao/prova` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/bncc/ef` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/bncc/ei` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/bncc/em` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/bncc/sugerir-habilidades` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/demo/papel` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/demo/visita` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/diario/analise-ia` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia-caixa` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/ciencia-pei` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/estudante/[id]` | GET | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/familia/laudos` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/laudos` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/medicacao` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/medicacao` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/mensagens` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/mensagens` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/meus-estudantes` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/missoes` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/missoes` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/responsaveis` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/responsaveis` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/familia/vincular` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/health` | GET | 200 | 200 | — | Pública: verificação de saúde do Render; responde só status do app e do banco. |
| `/api/home/stats` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/adaptar-atividade` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/adaptar-prova` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/criar-atividade` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/criar-itens` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/dinamica` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/estudio-imagem` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/extrair-docx` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/gerar-docx` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/gerar-imagem` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/historico/[id]` | GET | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/hub/historico` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/inclusao-brincar` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/mapa-mental` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/papo-mestre` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/plano-aula` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/roteiro` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/rotina-avd` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/hub/salvar-no-plano` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/instagram-feed` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/members/[id]/assignments` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/members/[id]/delete-data` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/members/[id]/export` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/members/[id]` | PATCH | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/members/[id]` | DELETE | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/members/[id]/student-links` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/members/[id]/terms` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/members/[id]/terms` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/members` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/members` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/monitoring/assessment` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/monitoring/sugerir-rubricas` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/notifications/dismiss` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/notifications` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/paee/diagnostico-barreiras` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/paee/documento-articulacao` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/paee/jornada-gamificada` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/paee/mapa-mental` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/paee/plano-habilidades` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/paee/relatorio-ciclo` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/paee/tecnologia-assistiva` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei-regente/meus-alunos` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/adaptar-plano` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/avaliacao-diagnostica` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/avaliacao-diagnostica` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/avaliacao-diagnostica` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/avaliacao-diagnostica` | DELETE | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/avaliacao-diagnostica/salvar` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/ciencia` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/ciencia` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/consolidar` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/consultoria` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/disciplina` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/disciplina` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/disciplina` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/disciplina` | DELETE | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/enviar-regentes` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/enviar-regentes` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/enviar-regentes` | DELETE | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/exportar-pdf` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/exportar` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/extrair-laudo` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/faq-caso` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/gerar-pdf-oficial` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/mapa-mental` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/meus-peis` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/plano-ensino` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/plano-ensino` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/plano-ensino` | DELETE | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/plano-ensino/sugestao-ia` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/plano-ensino/upload` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/relatorio-transicao` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/resumo-familia/liberar` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/resumo-familia/liberar` | DELETE | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/resumo-familia` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/transcrever-laudo` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/versions` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/versions` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pei/versions` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/perfil` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/perfil` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pgi/gerar-acoes` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pgi` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/pgi` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/plano-curso/habilidades` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/plano-curso/meus-componentes` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/plano-curso` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/plano-curso` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/plano-curso` | DELETE | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/public/certificado` | POST | 400 | 400 | — | Pública: certificado da formação; limite FORM_PUBLIC e validação. |
| `/api/public/contato` | POST | 400 | 400 | — | Pública: formulário de contato; limite FORM_PUBLIC (5 por 10 min por IP) e validação. |
| `/api/public/demonstracao` | POST | 400 | 400 | — | Pública: entrada na demonstração; limite FORM_PUBLIC e validação do papel. |
| `/api/public/evento` | POST | 204 | 204 | — | Pública: medição do site; descarta robôs, limite por visitante (120 por 10 min), valida o evento e não guarda IP. |
| `/api/public/platform-config` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/school/classes/[id]` | DELETE | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/school/classes` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/school/classes` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/school/components` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/school/grades` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/school/grades` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/school/years` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/school/years` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/search` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/simulate-family` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/simulate-family` | DELETE | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/simulate-member` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/simulate-member` | DELETE | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/diario` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/diario` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/diario` | DELETE | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/export` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/familia` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/familia` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/familia` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/missoes` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/missoes` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/missoes` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/missoes/sugerir` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/paee-ciclos` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/paee` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/pei-data` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/pei-data` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/pei` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/pei` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]` | GET | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]` | PATCH | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]` | DELETE | 401 | 401 | 401 | Sessão exigida no proxy.ts e na rota |
| `/api/students/[id]/versao` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/students` | POST | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/workspace/config` | GET | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/workspace/config` | PATCH | 401 | 401 | — | Sessão exigida no proxy.ts e na rota |
| `/api/vitals` | POST | não chamado | não chamado | — | Pública: métricas de desempenho do navegador; limite VITALS. POST não chamado (grava sem validar o corpo). |
