# Diretriz de IA — Omni IA e motores externos (OmniProf e Omnisfera)

SCRUM-232 · versão de 24/10/2026 · vale para os dois produtos e para a Frente 3.
Decisões que sustentam esta diretriz: SCRUM-197 (rota sensível na Omni IA), SCRUM-233 (Fireworks com retenção zero), SCRUM-240 (nome filtrado antes de qualquer IA no OmniProf).

## Regras
1. **Dado de estudante só vai para a Omni IA.** Texto que descreve um estudante (estudo de caso, PEI, PAEE, diário, adaptação a partir de um estudante) só segue para a rota sensível: modelo aberto na Fireworks AI, retenção zero, sem treino.
2. **Sem plano B para dado de estudante.** Se a Omni IA estiver fora do ar, a função avisa e o pedido não vai para outro motor.
3. **Nome nunca sai.** Antes de qualquer chamada de IA, nome do estudante, de responsáveis e de profissionais, CPF, telefone, e-mail e data de nascimento são trocados por códigos, que voltam só na tela.
4. **Imagens são exceção registrada.** A foto de laudo (Google ou OpenAI, para leitura) e o desenho do mapa mental (Google) saem sem metadados e sem nome, não ficam guardados e estão descritos na política e na página de segurança. Uma exceção nova só entra com: registro aqui, aviso na política e OK do Rodrigo.
5. **Motor novo só com auditoria.** Antes de ligar um motor ou provedor novo para qualquer rota: país, retenção, uso para treino, contrato e teste do filtro de nomes. Registrar no registro de tratamento (`registro-tratamento.md`) e no inventário do OmniProf.
6. **Modelo aberto em servidor próprio** (etapa da GPU, SCRUM-234/235): os filtros de nome continuam antes do modelo; o servidor fica sem logs do conteúdo; o portão único passa a ser o único caminho da rota sensível.
7. **Treino com dados.** Nenhum treino ou ajuste fino com textos de escola sem: autorização escrita da escola, textos aprovados por professores, remoção de qualquer dado de estudante e registro aqui.
8. **A IA sugere, a pessoa decide.** Todo conteúdo gerado é rascunho; nada entra no PEI sem aprovação de quem responde por ele.

## Como conferir
- Testes automáticos: `ai-sensivel.test.ts` e `api-laudo-privacidade.test.ts` (Omnisfera); filtros do OmniProf em `__tests__/unit` (SCRUM-240).
- Ritual semanal (SCRUM-192): olhar `ia_usage` (Omnisfera) e `omniprof_usage_logs` (OmniProf) e confirmar que as rotas sensíveis só usaram a Omni IA.
