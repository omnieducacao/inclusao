# Registro das operações de tratamento de dados — Omnisfera

SCRUM-232 · versão de 24/10/2026 · LGPD (Lei Geral de Proteção de Dados, Lei 13.709/2018), art. 37.
Feito a partir do código (`nextjs-app/`), do banco (Supabase `omnisfera`, região sa-east-1, São Paulo) e da política de privacidade publicada.
Revisar a cada nova tabela, nova integração ou novo motor de IA. Este arquivo não guarda segredos: só os **nomes** das variáveis.
Não é parecer jurídico; os pontos marcados com **[jurídico]** ficam para a conversa com o advogado.

## 1. Quem é quem

| Papel | Quem | Por quê |
|---|---|---|
| Controladora dos dados de **estudantes, famílias e equipe da escola** | **a escola** (ou a rede) que contrata | é ela quem decide coletar e para quê (estudo de caso, PEI, PAEE, por obrigação dos Decretos 12.686/2025 e 12.773/2025). |
| Operadora desses dados | **Omnisfera Soluções Educacionais Ltda** (CNPJ 66.428.964/0001-43, Ribeirão Preto/SP) | trata em nome da escola, só para prestar o serviço contratado. |
| Controladora dos dados **da própria Omnisfera** | Omnisfera Soluções Educacionais Ltda | contas de acesso, cobrança, contato comercial (leads), métricas do site, registros de acesso. |
| Suboperadores | Supabase, Render, Fireworks AI e os demais da seção 4 | prestam infraestrutura à Omnisfera. |
| Canal do titular | privacidade@omnisfera.net | publicado na política. |

**Encarregado (DPO):** a Omnisfera se enquadra como agente de tratamento de pequeno porte (Resolução CD/ANPD 2/2022), que pode deixar de indicar encarregado desde que mantenha um canal de comunicação com o titular. O canal é o e-mail acima, atendido pelo Rodrigo. **[jurídico]** confirmar o enquadramento: a resolução não dispensa quem faz tratamento de alto risco, e dado de saúde de criança pode ser visto assim.

**Ajuste necessário na política de privacidade:** a seção 2 diz que a Omnisfera é "a controladora". Para dados de estudantes, a controladora é a escola; a política e o contrato com a escola precisam dizer isso (o rascunho do contrato já prevê). **[jurídico]**

## 2. Operações de tratamento

| # | Operação | Titulares | Dados | Finalidade | Base legal (LGPD) | Onde fica | Prazo de guarda proposto |
|---|---|---|---|---|---|---|---|
| 1 | Estudo de caso, PEI, PAEE, diário, avaliações | estudantes (em geral crianças e adolescentes) | nome, nascimento, série e turma, **diagnóstico, laudos, medicação** (sensíveis), barreiras, metas, registros de atendimento | planejar e acompanhar a educação inclusiva, como exigem os decretos | da escola: art. 11, II, "a" (obrigação legal) e art. 14 (melhor interesse da criança e do adolescente) | Supabase SP; nome, diagnóstico, laudos, medicação e mensagens **cifrados pelo app** antes de gravar | enquanto o contrato durar; até 90 dias depois do fim, a escola exporta; depois, eliminação **[decisão]** |
| 2 | Área da família | responsáveis | nome, e-mail (cifrado), vínculo, ciência do PEI, mensagens, atualização de medicação | participação da família | da escola: art. 7º, II e art. 11, II, "a" | Supabase SP | igual à 1 |
| 3 | Contas da equipe da escola | professores, coordenação, AEE, direção | nome, e-mail e telefone (cifrados), papel, permissões, vínculos | login e controle de acesso | art. 7º, V (contrato) | Supabase SP | enquanto ativo; 6 meses depois de desativado |
| 4 | Registro de acesso e auditoria (`audit_log`, `acessos`, `usage_events`) | todos os usuários | id, papel, ação, recurso, **resumo** do IP, tipo de navegador | segurança e prova de quem fez o quê (art. 37 e Marco Civil) | art. 7º, II e IX | Supabase SP | **6 meses** no mínimo (Marco Civil, art. 15); propor 12 meses **[decisão]** |
| 5 | Sugestões da IA (Omni IA) | estudantes (indireto) | texto do estudo de caso e do PEI **sem nome**, com códigos no lugar de nomes, CPF, telefones e e-mails | gerar rascunhos que o professor revisa | da escola: mesma base da operação 1; Omnisfera como operadora | Fireworks AI (EUA), **retenção zero** | nada fica no provedor; o resultado fica na operação 1 |
| 6 | Leitura de foto de laudo e desenho do mapa mental | estudantes (indireto) | foto do laudo **sem metadados**, roteiro do mapa sem nome | transcrever o laudo; ilustrar a jornada do PAEE | igual à 5 | Google ou OpenAI (EUA), sem guardar | nada fica no provedor |
| 7 | Cópia no Google Drive | estudantes (indireto) | PEI, PAEE ou diário escolhidos pela pessoa | cópia para a escola | da escola; a regra da escola define se pode e em que contas | Drive da conta escolhida | regra do Google e da escola; o salvamento fica na auditoria |
| 8 | Contas e cobrança da escola | quem contrata | nome, e-mail, CNPJ/CPF, dados de cobrança | contrato e nota fiscal | art. 7º, V e II | fora da plataforma (contrato e nota fiscal da empresa) | 5 anos depois do fim do contrato (prazo fiscal) |
| 9 | Contato comercial e formação (`leads`, `certificados`) | interessados e cursistas | nome, e-mail, escola, cargo | responder o contato; emitir certificado | art. 7º, I (consentimento) e V | Supabase SP | leads: 12 meses sem conversa, depois eliminação; certificados: enquanto houver pedido de 2ª via **[decisão]** |
| 10 | Métricas do site e desempenho (`site_eventos`, `web_vitals`) | visitantes | página, tempo de carregamento, sem identificação | melhorar o site | art. 7º, IX (legítimo interesse) | Supabase SP | 12 meses |

## 3. Transferência internacional (art. 33)
- **Render** (servidor do app, EUA): o tráfego passa pelos EUA; o banco fica em São Paulo.
- **Fireworks AI** (EUA): só pedidos sem nome, com retenção zero e sem treino.
- **Google e OpenAI** (EUA): foto do laudo sem metadados e roteiro do mapa sem nome.
- **Google Drive**: só quando a pessoa salva uma cópia, conforme a regra da escola.
- **DeepSeek, Moonshot (Kimi), Anthropic**: só pedidos **sem** dado de estudante (Hub de materiais gerais).
**[jurídico]** cláusulas-padrão da ANPD (Resolução CD/ANPD 19/2024) com os provedores que recebem dado pessoal.

## 4. Suboperadores e variáveis (só nomes)

| Serviço | Para quê | País | Variáveis |
|---|---|---|---|
| Supabase | banco e arquivos | Brasil (sa-east-1) | SUPABASE_URL, SUPABASE_SERVICE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY |
| Render | hospedagem | EUA | — |
| Fireworks AI (Omni IA) | IA com dado de estudante | EUA | FIREWORKS_API_KEY |
| Google (Gemini, Drive) | leitura de imagem, mapa mental, cópia no Drive | EUA | GEMINI_API_KEY, NEXT_PUBLIC_GOOGLE_CLIENT_ID |
| OpenAI | leitura de imagem (alternativa) | EUA | OPENAI_API_KEY |
| DeepSeek, Moonshot (Kimi, direto ou via OpenRouter), Anthropic | IA sem dado de estudante | China, China/EUA, EUA | DEEPSEEK_API_KEY, KIMI_API_KEY ou OPENROUTER_API_KEY, ANTHROPIC_API_KEY |
| Upstash Redis (se configurado; hoje o limite fica na memória do servidor) | limite de tentativas | EUA | UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN |
| Unsplash | imagens de banco no Hub | EUA | UNSPLASH_ACCESS_KEY |
Chaves de cifragem e sessão: ENCRYPTION_KEY (e ENCRYPTION_KEY_ANTERIOR durante a troca), SESSION_SECRET. Segredos só no Render, nunca no repositório (varredura de 24/10: nenhum segredo real no código nem no histórico).

## 5. Medidas de segurança (art. 46)
- Cifragem no app dos campos sensíveis; conexão só HTTPS (HSTS com preload).
- Cada escola só vê os próprios estudantes (testes automáticos de isolamento); cada papel só vê o que pode; família só o resumo liberado.
- RLS ligada em todas as tabelas; o navegador não lê o banco direto.
- Auditoria sem nome nem conteúdo, com resumo do IP.
- IA: nome trocado por código antes de sair; Omni IA com retenção zero; sem fallback para outro motor.
- Limite de tentativas no login (10 por conta a cada 15 minutos; conferido em produção em 24/10).
- Plano de resposta a incidente (`docs/seguranca/resposta-incidente.md` no repositório do OmniProf, vale para os dois).
- Backup: ver `docs/seguranca/backup-restauracao.md`.

## 6. Decisões em aberto
1. **[decisão]** prazos de guarda das linhas 1, 4 e 9.
2. **[jurídico]** papéis (escola controladora, Omnisfera operadora) na política e no contrato.
3. **[jurídico]** dispensa do encarregado e cláusulas-padrão de transferência internacional.
