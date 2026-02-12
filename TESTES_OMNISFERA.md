# BATERIA DE TESTES - OMNISFERA (Produção)
## Plataforma: https://omnisfera.net

**Data:** Fevereiro 2026  
**Versão:** Next.js (Branch nextjs-migration)

---

## CHECKLIST GERAL

Marcar com ✅ quando passar, ❌ quando falhar, ⚠️ quando tiver problema parcial

---

## 1. AUTENTICAÇÃO E ACESSO

### 1.1 Login Admin da Plataforma
- [ ] Acessar https://omnisfera.net/login
- [ ] Login com admin@omnisfera.com + senha
- [ ] Redirecionamento para /admin/dashboard
- [ ] Visualizar métricas de uso
- [ ] Listar workspaces
- [ ] Criar novo workspace

### 1.2 Login Escola (Workspace)
- [ ] Login com email de escola + senha
- [ ] Redirecionamento para /estudantes
- [ ] Verificar sidebar com módulos disponíveis
- [ ] Logout funciona corretamente

### 1.3 Permissões
- [ ] Professor sem permissão "can_pei" não acessa módulo PEI
- [ ] Professor sem permissão "can_hub" não acessa Hub
- [ ] Master da escola acessa tudo

**Resultado:** _______________

---

## 2. MÓDULO ESTUDANTES

### 2.1 CRUD Estudante
- [ ] Listar estudantes da escola
- [ ] Criar novo estudante (nome, série, turma, diagnóstico)
- [ ] Editar estudante existente
- [ ] Excluir estudante
- [ ] Buscar/filtrar estudantes

### 2.2 Validações
- [ ] Nome vazio → erro amigável
- [ ] Nome com caracteres especiais → aceita
- [ ] Diagnóstico muito longo → trunca ou erro?

**Resultado:** _______________

---

## 3. MÓDULO PEI

### 3.1 Geração de PEI
- [ ] Selecionar estudante
- [ ] Preencher dados do estudante (nome, série, diagnóstico)
- [ ] Preencher evidências (pedagógicas, cognitivas, comportamentais)
- [ ] Preencher rede de apoio (família, profissionais)
- [ ] Gerar PEI com IA (DeepSeek/Kimi)
- [ ] Aguardar geração (loading state)
- [ ] Visualizar PEI gerado
- [ ] Editar campos do PEI
- [ ] Salvar rascunho

### 3.2 Exportação
- [ ] Exportar PEI em PDF
- [ ] Exportar PEI em Word (DOCX)
- [ ] Verificar formatação do documento

### 3.3 Consultoria IA
- [ ] Abrir consultoria no PEI
- [ ] Fazer pergunta sobre o estudante
- [ ] Receber resposta contextualizada
- [ ] Verificar se usa dados do PEI

### 3.4 Histórico de Versões
- [ ] Criar snapshot do PEI
- [ ] Listar versões anteriores
- [ ] Restaurar versão anterior

**Resultado:** _______________

---

## 4. MÓDULO PAEE

### 4.1 Ciclo PAEE
- [ ] Iniciar novo ciclo PAEE
- [ ] Preencher diagnóstico de barreiras
- [ ] Definir metas e habilidades
- [ ] Mapear estratégias
- [ ] Gerar documento de articulação

### 4.2 Acompanhamento
- [ ] Registrar observações diárias/semanais
- [ ] Visualizar evolução do estudante
- [ ] Gerar relatório de ciclo

**Resultado:** _______________

---

## 5. MÓDULO HUB EDUCACIONAL

### 5.1 Criar Questão do Zero
- [ ] Selecionar ano/série
- [ ] Selecionar componente curricular
- [ ] Selecionar módulo BNCC
- [ ] Definir número de questões
- [ ] Definir nível de dificuldade
- [ ] Gerar questões com imagens
- [ ] Verificar gabarito no final
- [ ] Baixar questões em PDF/DOCX

### 5.2 Plano de Aula
- [ ] Selecionar série
- [ ] Selecionar componente curricular
- [ ] Selecionar módulo BNCC
- [ ] Definir tema
- [ ] Gerar plano de aula completo
- [ ] Verificar se plano inclui objetivos, metodologia, avaliação
- [ ] Baixar em DOCX

### 5.3 Adaptar Prova
- [ ] Fazer upload de imagem de prova
- [ ] Recortar questões da imagem
- [ ] Selecionar questões para adaptar
- [ ] Definir tipo de adaptação (visual, cognitiva, etc.)
- [ ] Gerar prova adaptada
- [ ] Verificar se imagens são inseridas corretamente

### 5.4 Adaptar Atividade
- [ ] Fazer upload de imagem
- [ ] Recortar primeira questão
- [ ] Recortar imagem da questão
- [ ] Definir adaptações
- [ ] Gerar atividade adaptada

### 5.5 Dinâmica Inclusiva
- [ ] Selecionar série
- [ ] Selecionar componente curricular
- [ ] Definir objetivo
- [ ] Gerar dinâmica
- [ ] Verificar se é adequada para inclusão

### 5.6 Roteiro Individual
- [ ] Selecionar estudante
- [ ] Definir hiperfoco
- [ ] Definir objetivos
- [ ] Gerar roteiro

### 5.7 Papo de Mestre
- [ ] Selecionar estudante
- [ ] Verificar hiperfoco pré-preenchido
- [ ] Alterar hiperfoco se necessário
- [ ] Definir dificuldade
- [ ] Gerar diálogo simulado

### 5.8 Estúdio Visual
- [ ] Descrever imagem desejada
- [ ] Selecionar estilo
- [ ] Gerar imagem com Gemini
- [ ] Download da imagem

### 5.9 Gerar PPT
- [ ] Definir tema
- [ ] Definir número de slides
- [ ] Gerar apresentação
- [ ] Verificar se é para uso em aula (não explicativo)

### 5.10 Mapa Mental
- [ ] Definir tema
- [ ] Gerar mapa mental
- [ ] Exportar imagem

**Resultado Hub:** _______________

---

## 6. MÓDULO DIÁRIO

### 6.1 Registro Diário
- [ ] Selecionar estudante
- [ ] Registrar observação do dia
- [ ] Classificar tipo de registro
- [ ] Salvar registro

### 6.2 Análise IA
- [ ] Solicitar análise de padrões
- [ ] Receber insights sobre o estudante

**Resultado:** _______________

---

## 7. MÓDULO PGI (Planejamento de Gestão)

### 7.1 Ações do PGI
- [ ] Visualizar ações sugeridas
- [ ] Marcar ação como concluída
- [ ] Adicionar nova ação
- [ ] Gerar relatório de ações

**Resultado:** _______________

---

## 8. MÓDULO MONITORAMENTO

### 8.1 Avaliação
- [ ] Registrar avaliação de estudante
- [ ] Visualizar histórico de avaliações
- [ ] Sugerir rubricas com IA

**Resultado:** _______________

---

## 9. PERFORMANCE E SEGURANÇA

### 9.1 Velocidade
- [ ] Tempo de carregamento inicial < 3s
- [ ] Navegação entre páginas fluida
- [ ] Geração de PEI < 30s
- [ ] Upload de imagens < 10s

### 9.2 Rate Limiting
- [ ] Fazer 31 requisições rápidas para IA
- [ ] Verificar se bloqueia com mensagem adequada
- [ ] Aguardar 1 hora e tentar novamente

### 9.3 Error Boundaries
- [ ] Forçar erro (URL inválida)
- [ ] Verificar se mostra tela amigável
- [ ] Botão "Tentar novamente" funciona

### 9.4 Responsividade
- [ ] Testar em mobile (Chrome DevTools)
- [ ] Testar em tablet
- [ ] Verificar se quebra layout

**Resultado:** _______________

---

## 10. INTEGRAÇÕES

### 10.1 Supabase
- [ ] Dados sendo salvos corretamente
- [ ] RLS (Row Level Security) funcionando
- [ ] Apenas dados do workspace visível

### 10.2 IA Engines
- [ ] DeepSeek (OmniRed) respondendo
- [ ] Kimi (OmniBlue) respondendo
- [ ] Claude (OmniGreen) respondendo
- [ ] Gemini (OmniYellow) respondendo
- [ ] GPT (OmniOrange) respondendo

### 10.3 Sentry
- [ ] Erros sendo capturados no dashboard
- [ ] Performance tracking ativo

**Resultado:** _______________

---

## RESUMO DOS TESTES

| Módulo | Status | Erros Encontrados |
|--------|--------|-------------------|
| Autenticação | ⬜ | |
| Estudantes | ⬜ | |
| PEI | ⬜ | |
| PAEE | ⬜ | |
| Hub | ⬜ | |
| Diário | ⬜ | |
| PGI | ⬜ | |
| Monitoramento | ⬜ | |
| Performance | ⬜ | |
| Integrações | ⬜ | |

**Testador:** _______________  
**Data:** _______________  
**Versão:** _______________

---

## PRÓXIMOS PASSOS APÓS TESTES

- [ ] Corrigir bugs encontrados
- [ ] Refazer testes dos itens que falharam
- [ ] Aprovação para beta fechado
- [ ] Convidar 3 escolas piloto

---

*Documento criado para testes sistemáticos da Omnisfera*
