# Rotas e permissões

Gerado por `node scripts/rotas-guardas.mjs` (não edite à mão). Mostra o que **cada rota e método exige no próprio código**.

Antes de chegar a qualquer rota, o `proxy.ts` já recusa (403) o papel **família** em toda `/api/` fora de
`/api/familia/`, `/api/auth/`, `/api/notifications`, `/api/announcements`, `/api/vitals`, `/api/health`,
`/api/public/` e `/api/simulate-family`. As linhas "equipe" também recusam sozinhas (`requireStaff`).

## Resumo (por rota e método)

| Guarda na rota | Quantidade |
|---|---|
| equipe (família recusada na rota) | 51 |
| equipe + permissão por módulo | 49 |
| admin da plataforma | 47 |
| token do app (lib/app/acesso) | 47 |
| só sessão (família barrada pelo proxy) | 24 |
| família permitida | 20 |
| pública | 12 |
| equipe (função negado* de lib/) | 8 |
| pública (login do app) | 5 |
| demonstração | 2 |
| link secreto do calendário (lib/app/acesso) | 1 |

As linhas "só sessão" são, em quase todos os casos, leituras por vínculo (professores sem a flag do módulo também
as usam) ou rotas do próprio usuário. Os métodos que gravam ou gastam IA já exigem a permissão do módulo
(`requireAnyPermission`, SCRUM-68 etapa 2). `pei/disciplina` e `plano-curso` têm a regra dentro da rota.

## Tabela

| Rota | Método | Exige na rota |
|---|---|---|
| `/api/admin/acessos` | GET | admin da plataforma |
| `/api/admin/activity-log` | GET | admin da plataforma |
| `/api/admin/announcements` | GET | admin da plataforma |
| `/api/admin/announcements` | POST | admin da plataforma |
| `/api/admin/audit-log` | GET | admin da plataforma |
| `/api/admin/cifrar-dados` | POST | admin da plataforma |
| `/api/admin/cleanup` | POST | admin da plataforma |
| `/api/admin/dashboard` | GET | admin da plataforma |
| `/api/admin/export` | GET | admin da plataforma |
| `/api/admin/ia-usage` | GET | admin da plataforma |
| `/api/admin/instagram-feed/[id]` | DELETE | admin da plataforma |
| `/api/admin/instagram-feed/[id]` | PATCH | admin da plataforma |
| `/api/admin/instagram-feed` | GET | admin da plataforma |
| `/api/admin/instagram-feed` | POST | admin da plataforma |
| `/api/admin/issues/[id]` | PATCH | admin da plataforma |
| `/api/admin/issues` | GET | admin da plataforma |
| `/api/admin/issues` | POST | admin da plataforma |
| `/api/admin/leads` | DELETE | admin da plataforma |
| `/api/admin/leads` | GET | admin da plataforma |
| `/api/admin/leads` | PATCH | admin da plataforma |
| `/api/admin/lottie-icons` | GET | admin da plataforma |
| `/api/admin/metrics` | GET | admin da plataforma |
| `/api/admin/platform-config` | GET | admin da plataforma |
| `/api/admin/platform-config` | POST | admin da plataforma |
| `/api/admin/simulate` | DELETE | admin da plataforma |
| `/api/admin/simulate` | POST | admin da plataforma |
| `/api/admin/site` | GET | admin da plataforma |
| `/api/admin/users` | GET | admin da plataforma |
| `/api/admin/users` | PATCH | admin da plataforma |
| `/api/admin/workspaces/[id]` | DELETE | admin da plataforma |
| `/api/admin/workspaces/[id]` | PATCH | admin da plataforma |
| `/api/admin/workspaces` | GET | admin da plataforma |
| `/api/admin/workspaces` | POST | admin da plataforma |
| `/api/ai-engines/available` | GET | só sessão (família barrada pelo proxy) |
| `/api/announcements/mark-viewed` | POST | família permitida |
| `/api/announcements/unviewed` | GET | família permitida |
| `/api/app/v1/auth/adolescente` | POST | pública (login do app) |
| `/api/app/v1/auth/cadastrar` | POST | pública (login do app) |
| `/api/app/v1/auth/entrar` | POST | pública (login do app) |
| `/api/app/v1/auth/renovar` | POST | pública (login do app) |
| `/api/app/v1/auth/sair` | POST | pública (login do app) |
| `/api/app/v1/calendario/[token]` | GET | link secreto do calendário (lib/app/acesso) |
| `/api/app/v1/convites/aceitar` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/convites/ver` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/adolescente` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/agenda/[compromissoId]` | DELETE | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/agenda/[compromissoId]` | PATCH | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/agenda/link` | DELETE | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/agenda/link` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/agenda/link` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/agenda` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/agenda` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/conquistas` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/conquistas` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/escola/ciencia-pei` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/escola/mensagens` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/escola/mensagens` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/escola/missoes` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/escola/missoes` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/escola` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/insignias` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/insignias` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/insignias` | PUT | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/medicacoes/[medId]/doses` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/medicacoes/[medId]` | PATCH | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/medicacoes` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/medicacoes` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/missoes/[missaoId]` | PATCH | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/missoes` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/missoes` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/omniband/[objetoId]` | PATCH | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/omniband` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/omniband` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/pagina-ajuda` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/pagina-ajuda` | PUT | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/rede/[membroId]` | PATCH | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/rede` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/rede` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/registros/[regId]` | DELETE | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/registros` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/registros` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/criancas/[id]/resumo` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/dispositivos` | DELETE | token do app (lib/app/acesso) |
| `/api/app/v1/dispositivos` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/escola/ligar` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/eu` | GET | token do app (lib/app/acesso) |
| `/api/app/v1/familias/[id]/criancas` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/familias` | POST | token do app (lib/app/acesso) |
| `/api/app/v1/omniband/toque` | POST | token do app (lib/app/acesso) |
| `/api/auth/admin-login` | POST | pública |
| `/api/auth/login` | POST | pública |
| `/api/auth/logout` | POST | pública |
| `/api/avaliacao-processual/evolucao` | GET | só sessão (família barrada pelo proxy) |
| `/api/avaliacao/confronto` | GET | equipe (família recusada na rota) |
| `/api/avaliacao/confronto` | POST | equipe (família recusada na rota) |
| `/api/avaliacao/diagnostica/questoes` | POST | equipe + permissão por módulo |
| `/api/avaliacao/diagnostica` | GET | equipe + permissão por módulo |
| `/api/avaliacao/diagnostica` | POST | equipe + permissão por módulo |
| `/api/avaliacao/matriz` | GET | equipe + permissão por módulo |
| `/api/avaliacao/processual` | GET | equipe + permissão por módulo |
| `/api/avaliacao/processual` | POST | equipe + permissão por módulo |
| `/api/avaliacao/prova/item` | POST | equipe + permissão por módulo |
| `/api/avaliacao/prova/ler` | POST | equipe + permissão por módulo |
| `/api/avaliacao/prova` | GET | equipe + permissão por módulo |
| `/api/avaliacao/prova` | PATCH | equipe + permissão por módulo |
| `/api/avaliacao/prova` | POST | equipe + permissão por módulo |
| `/api/bncc/ef` | GET | equipe (família recusada na rota) |
| `/api/bncc/ei` | GET | equipe (família recusada na rota) |
| `/api/bncc/em` | GET | equipe (família recusada na rota) |
| `/api/bncc/sugerir-habilidades` | POST | equipe (família recusada na rota) |
| `/api/demo/papel` | POST | demonstração |
| `/api/demo/visita` | POST | demonstração |
| `/api/diario/analise-ia` | POST | equipe (família recusada na rota) |
| `/api/drive/politica` | GET | equipe (família recusada na rota) |
| `/api/drive/politica` | PATCH | equipe (família recusada na rota) |
| `/api/drive/registro` | POST | equipe (família recusada na rota) |
| `/api/familia-caixa` | GET | equipe (função negado* de lib/) |
| `/api/familia/ciencia-pei` | POST | família permitida |
| `/api/familia/estudante/[id]` | GET | família permitida |
| `/api/familia/laudos` | GET | família permitida |
| `/api/familia/laudos` | POST | família permitida |
| `/api/familia/medicacao` | GET | família permitida |
| `/api/familia/medicacao` | POST | família permitida |
| `/api/familia/mensagens` | GET | família permitida |
| `/api/familia/mensagens` | POST | família permitida |
| `/api/familia/meus-estudantes` | GET | família permitida |
| `/api/familia/missoes` | GET | família permitida |
| `/api/familia/missoes` | POST | família permitida |
| `/api/familia/responsaveis` | GET | família permitida |
| `/api/familia/responsaveis` | POST | família permitida |
| `/api/familia/vincular` | POST | família permitida |
| `/api/health` | GET | pública |
| `/api/home/stats` | GET | admin da plataforma |
| `/api/hub/adaptar-atividade` | POST | equipe (família recusada na rota) |
| `/api/hub/adaptar-prova` | POST | equipe (família recusada na rota) |
| `/api/hub/criar-atividade` | POST | equipe (família recusada na rota) |
| `/api/hub/criar-itens` | POST | equipe (família recusada na rota) |
| `/api/hub/dinamica` | POST | equipe (família recusada na rota) |
| `/api/hub/estudio-imagem` | POST | equipe (família recusada na rota) |
| `/api/hub/extrair-docx` | POST | equipe (família recusada na rota) |
| `/api/hub/gerar-docx` | POST | equipe (família recusada na rota) |
| `/api/hub/gerar-imagem` | POST | equipe (família recusada na rota) |
| `/api/hub/historico/[id]` | GET | equipe (família recusada na rota) |
| `/api/hub/historico` | GET | equipe (família recusada na rota) |
| `/api/hub/inclusao-brincar` | POST | equipe (família recusada na rota) |
| `/api/hub/mapa-mental` | POST | equipe (família recusada na rota) |
| `/api/hub/papo-mestre` | POST | equipe (família recusada na rota) |
| `/api/hub/plano-aula` | POST | equipe (família recusada na rota) |
| `/api/hub/roteiro` | POST | equipe (família recusada na rota) |
| `/api/hub/rotina-avd` | POST | equipe (família recusada na rota) |
| `/api/hub/salvar-no-plano` | POST | equipe + can_hub |
| `/api/instagram-feed` | GET | pública |
| `/api/members/[id]/assignments` | GET | só sessão (família barrada pelo proxy) |
| `/api/members/[id]/delete-data` | POST | admin da plataforma |
| `/api/members/[id]/export` | GET | admin da plataforma |
| `/api/members/[id]/student-links` | GET | só sessão (família barrada pelo proxy) |
| `/api/members/[id]/terms` | GET | admin da plataforma |
| `/api/members/[id]/terms` | POST | admin da plataforma |
| `/api/members/[id]` | DELETE | equipe + can_gestao |
| `/api/members/[id]` | PATCH | equipe + can_gestao |
| `/api/members` | GET | equipe + permissão por módulo |
| `/api/members` | POST | equipe + can_gestao |
| `/api/monitoring/assessment` | POST | equipe + can_avaliacao |
| `/api/monitoring/sugerir-rubricas` | POST | equipe + permissão por módulo |
| `/api/notifications/dismiss` | POST | família permitida |
| `/api/notifications` | GET | família permitida |
| `/api/paee/diagnostico-barreiras` | POST | equipe (família recusada na rota) |
| `/api/paee/documento-articulacao` | POST | equipe (família recusada na rota) |
| `/api/paee/jornada-gamificada` | POST | equipe (família recusada na rota) |
| `/api/paee/mapa-mental` | POST | equipe (família recusada na rota) |
| `/api/paee/plano-habilidades` | POST | equipe (família recusada na rota) |
| `/api/paee/relatorio-ciclo` | POST | equipe + permissão por módulo |
| `/api/paee/tecnologia-assistiva` | POST | equipe (família recusada na rota) |
| `/api/pei-regente/meus-alunos` | GET | só sessão (família barrada pelo proxy) |
| `/api/pei/adaptar-plano` | POST | equipe + permissão por módulo |
| `/api/pei/avaliacao-diagnostica/salvar` | POST | equipe + permissão por módulo |
| `/api/pei/avaliacao-diagnostica` | DELETE | equipe + permissão por módulo |
| `/api/pei/avaliacao-diagnostica` | GET | só sessão (família barrada pelo proxy) |
| `/api/pei/avaliacao-diagnostica` | PATCH | equipe + permissão por módulo |
| `/api/pei/avaliacao-diagnostica` | POST | equipe + permissão por módulo |
| `/api/pei/ciencia` | GET | equipe (família recusada na rota) |
| `/api/pei/ciencia` | POST | equipe (família recusada na rota) |
| `/api/pei/consolidar` | GET | só sessão (família barrada pelo proxy) |
| `/api/pei/consultoria` | POST | equipe (família recusada na rota) |
| `/api/pei/disciplina` | DELETE | admin da plataforma |
| `/api/pei/disciplina` | GET | só sessão (família barrada pelo proxy) |
| `/api/pei/disciplina` | PATCH | admin da plataforma |
| `/api/pei/disciplina` | POST | só sessão (família barrada pelo proxy) |
| `/api/pei/enviar-regentes` | DELETE | equipe + can_pei |
| `/api/pei/enviar-regentes` | GET | só sessão (família barrada pelo proxy) |
| `/api/pei/enviar-regentes` | POST | equipe + can_pei |
| `/api/pei/exportar-pdf` | POST | equipe (família recusada na rota) |
| `/api/pei/exportar` | POST | equipe (família recusada na rota) |
| `/api/pei/extrair-laudo` | POST | equipe (família recusada na rota) |
| `/api/pei/faq-caso` | POST | equipe (família recusada na rota) |
| `/api/pei/gerar-pdf-oficial` | POST | equipe (família recusada na rota) |
| `/api/pei/mapa-mental` | POST | equipe (família recusada na rota) |
| `/api/pei/meus-peis` | GET | equipe (família recusada na rota) |
| `/api/pei/plano-ensino/sugestao-ia` | POST | equipe + permissão por módulo |
| `/api/pei/plano-ensino/upload` | POST | equipe + permissão por módulo |
| `/api/pei/plano-ensino` | DELETE | equipe + permissão por módulo |
| `/api/pei/plano-ensino` | GET | só sessão (família barrada pelo proxy) |
| `/api/pei/plano-ensino` | POST | equipe + permissão por módulo |
| `/api/pei/relatorio-transicao` | GET | só sessão (família barrada pelo proxy) |
| `/api/pei/resumo-familia/liberar` | DELETE | equipe + can_pei |
| `/api/pei/resumo-familia/liberar` | POST | equipe + can_pei |
| `/api/pei/resumo-familia` | POST | equipe (família recusada na rota) |
| `/api/pei/transcrever-laudo` | POST | equipe (família recusada na rota) |
| `/api/pei/versions` | GET | só sessão (família barrada pelo proxy) |
| `/api/pei/versions` | PATCH | equipe + permissão por módulo |
| `/api/pei/versions` | POST | equipe + permissão por módulo |
| `/api/perfil` | GET | só sessão (família barrada pelo proxy) |
| `/api/perfil` | PATCH | só sessão (família barrada pelo proxy) |
| `/api/pgi/gerar-acoes` | POST | equipe + permissão por módulo |
| `/api/pgi` | GET | só sessão (família barrada pelo proxy) |
| `/api/pgi` | PATCH | equipe + can_gestao |
| `/api/plano-curso/habilidades` | GET | só sessão (família barrada pelo proxy) |
| `/api/plano-curso/meus-componentes` | GET | admin da plataforma |
| `/api/plano-curso` | DELETE | admin da plataforma |
| `/api/plano-curso` | GET | admin da plataforma |
| `/api/plano-curso` | POST | só sessão (família barrada pelo proxy) |
| `/api/public/certificado` | POST | pública |
| `/api/public/contato` | POST | pública |
| `/api/public/demonstracao` | POST | pública |
| `/api/public/evento` | POST | pública |
| `/api/public/omniband/localizacao` | POST | pública |
| `/api/public/platform-config` | GET | pública |
| `/api/school/classes/[id]` | DELETE | equipe + can_gestao |
| `/api/school/classes` | GET | só sessão (família barrada pelo proxy) |
| `/api/school/classes` | POST | equipe + can_gestao |
| `/api/school/components` | GET | só sessão (família barrada pelo proxy) |
| `/api/school/grades` | GET | só sessão (família barrada pelo proxy) |
| `/api/school/grades` | PATCH | equipe + permissão por módulo |
| `/api/school/years` | GET | só sessão (família barrada pelo proxy) |
| `/api/school/years` | POST | equipe + permissão por módulo |
| `/api/search` | GET | admin da plataforma |
| `/api/simulate-family` | DELETE | família permitida |
| `/api/simulate-family` | POST | família permitida |
| `/api/simulate-member` | DELETE | admin da plataforma |
| `/api/simulate-member` | POST | admin da plataforma |
| `/api/students/[id]/diario` | DELETE | equipe + can_diario |
| `/api/students/[id]/diario` | PATCH | equipe + can_diario |
| `/api/students/[id]/diario` | POST | equipe + can_diario |
| `/api/students/[id]/export` | GET | admin da plataforma |
| `/api/students/[id]/familia` | GET | equipe (função negado* de lib/) |
| `/api/students/[id]/familia` | PATCH | equipe (função negado* de lib/) |
| `/api/students/[id]/familia` | POST | equipe (função negado* de lib/) |
| `/api/students/[id]/missoes/sugerir` | POST | equipe (função negado* de lib/) |
| `/api/students/[id]/missoes` | GET | equipe (função negado* de lib/) |
| `/api/students/[id]/missoes` | PATCH | equipe (função negado* de lib/) |
| `/api/students/[id]/missoes` | POST | equipe (função negado* de lib/) |
| `/api/students/[id]/paee-ciclos` | PATCH | equipe + can_paee |
| `/api/students/[id]/paee` | PATCH | equipe + can_paee |
| `/api/students/[id]/pei-data` | GET | equipe (família recusada na rota) |
| `/api/students/[id]/pei-data` | PATCH | equipe (família recusada na rota) |
| `/api/students/[id]/pei` | GET | só sessão (família barrada pelo proxy) |
| `/api/students/[id]/pei` | PATCH | equipe + can_pei |
| `/api/students/[id]/versao` | GET | só sessão (família barrada pelo proxy) |
| `/api/students/[id]` | DELETE | equipe + can_estudantes |
| `/api/students/[id]` | GET | equipe (família recusada na rota) |
| `/api/students/[id]` | PATCH | equipe + can_estudantes |
| `/api/students` | GET | equipe (família recusada na rota) |
| `/api/students` | POST | equipe + can_estudantes |
| `/api/vitals` | POST | pública |
| `/api/workspace/config` | GET | equipe (família recusada na rota) |
| `/api/workspace/config` | PATCH | equipe (família recusada na rota) |
