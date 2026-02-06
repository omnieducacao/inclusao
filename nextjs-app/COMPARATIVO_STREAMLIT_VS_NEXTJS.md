# 📊 COMPARATIVO PROFUNDO: Streamlit vs Next.js

## 🎯 OBJETIVO
Verificar sistematicamente todas as funcionalidades da versão Streamlit (que funciona bem) e comparar com a versão Next.js para identificar o que está faltando.

---

## 📋 MÓDULOS PRINCIPAIS

### 1. 🏠 HOME / INFOS (Central de Inteligência Inclusiva)

#### Streamlit (`0_Home.py`)
- ✅ **Panorama & Fluxos**: Fluxo da Inclusão (visual Graphviz), Filosofia "Outrar-se", Justiça Curricular
- ✅ **Legislação & IA**: Decretos 12.686/2025 e 12.773/2025, Marcos Legais, Consultor Legal IA
- ✅ **Glossário Técnico**: Termos técnicos com definições
- ✅ **Dicionário Inclusivo**: Termos "PREFIRA" vs "EVITE"
- ✅ **Biblioteca Virtual**: Acervo bibliográfico completo (Legislação, Fundamentos)
- ✅ **Manual da Jornada**: Passo a passo do Ciclo da Inclusão

#### Next.js (`/infos`)
- ✅ **Panorama & Fluxos**: Implementado (visual simplificado, sem Graphviz)
- ✅ **Legislação & IA**: Implementado (mock IA)
- ✅ **Glossário Técnico**: Implementado
- ✅ **Dicionário Inclusivo**: Implementado
- ✅ **Biblioteca Virtual**: Implementado
- ✅ **Manual da Jornada**: Implementado

**STATUS**: ✅ COMPLETO (visual Graphviz é opcional)

---

### 2. 📚 PEI (Plano Educacional Individualizado)

#### Streamlit (`1_PEI.py`) - 10 ABAS

##### ABA 0: INÍCIO
- ✅ Upload JSON local
- ✅ Sincronização nuvem (Supabase)
- ✅ Status vinculação (Supabase ou rascunho)
- ✅ Seções informativas: Fundamentos do PEI, Como usar, PEI/PDI e Prática Inclusiva
- ✅ Botão "BAIXAR BACKUP (.JSON)"

##### ABA 1: ESTUDANTE
- ✅ Dados básicos (nome, série, turma, matrícula, nascimento)
- ✅ Diagnóstico/CID
- ✅ Lista de medicamentos (extração de PDF, administração na escola)
- ✅ Detecção automática de segmento (EI, EFI, EFII, EM)
- ✅ Visualização de segmento com cores

##### ABA 2: EVIDÊNCIAS
- ✅ Hipótese de Escrita (Emília Ferreiro)
- ✅ Checklist de evidências (Pedagógico, Cognitivo, Comportamental)
- ✅ Observações de especialistas

##### ABA 3: REDE DE APOIO
- ✅ Seleção de profissionais (multiselect)
- ✅ Campo geral de orientações
- ✅ Campos individuais por profissional
- ✅ Limpeza automática de profissionais desmarcados

##### ABA 4: MAPEAMENTO
- ✅ Hiperfoco (texto livre)
- ✅ Potencialidades (multiselect)
- ✅ Barreiras por domínio (5 domínios):
  - Funções Cognitivas
  - Sensorial e Motor
  - Comunicação e Linguagem
  - Acadêmico
  - Socioemocional
- ✅ Nível de apoio por barreira (slider: Autônomo → Monitorado → Substancial → Muito Substancial)
- ✅ Observações por domínio
- ✅ Resumo do mapeamento

##### ABA 5: PLANO DE AÇÃO
- ✅ **Acesso (DUA)**: Multiselect de recursos + campo personalizado
- ✅ **Ensino (Metodologias)**: Multiselect de estratégias + campo personalizado
- ✅ **Avaliação (Formato)**: Multiselect de estratégias

##### ABA 6: MONITORAMENTO
- ✅ Data da próxima revisão
- ✅ Status da Meta (selectbox)
- ✅ Parecer Geral (selectbox)
- ✅ Ações Futuras (multiselect)

##### ABA 7: BNCC
- ✅ **Educação Infantil**: Faixa de idade + Campo de Experiência + Objetivos de Aprendizagem
- ✅ **EF/EM**: Seleção de habilidades BNCC por componente
  - Ano atual vs Anos anteriores
  - Botão "IA sugerir habilidades"
  - Lista de habilidades selecionadas (com remoção individual)
  - Botão "Desmarcar todas"
  - Validação de seleção

##### ABA 8: CONSULTORIA IA
- ✅ Seleção de motor de IA (Red, Blue, Green, Yellow, Orange)
- ✅ Botão "Gerar Estratégia Técnica"
- ✅ Botão "Gerar Guia Prático (Sala de Aula)"
- ✅ Transparência: "Como a IA construiu este relatório"
- ✅ Calibragem e segurança pedagógica
- ✅ Revisão do plano gerado
- ✅ Botões: Aprovar / Solicitar Ajuste
- ✅ Modo ajustando: feedback + regerar
- ✅ Modo aprovado: edição manual + regerar do zero

##### ABA 9: DASHBOARD & DOCS
- ✅ Hero card com avatar, nome, série, turma, matrícula, idade, status vinculação
- ✅ KPIs: Potencialidades, Barreiras, Hiperfoco, Nível de Atenção
- ✅ Cards principais:
  - Atenção Farmacológica (com alerta se administração na escola)
  - Cronograma de Metas (Curto, Médio, Longo prazo)
  - DNA do Estudante (barreiras por domínio com barras de progresso)
  - Rede de Apoio (chips com profissionais)
- ✅ Metas estruturadas (extração do relatório IA)
- ✅ Exportação: PDF, DOCX, JSON
- ✅ Sincronização nuvem

#### Next.js (`/pei`)
- ✅ ABA INÍCIO: Implementado (upload JSON, sincronização, conteúdo informativo)
- ✅ ABA ESTUDANTE: Implementado (dados básicos, diagnóstico, medicamentos)
- ✅ ABA EVIDÊNCIAS: Implementado (hipótese escrita, checklist)
- ✅ ABA REDE DE APOIO: Implementado (profissionais, orientações)
- ✅ ABA MAPEAMENTO: Implementado (hiperfoco, potencialidades, barreiras, níveis de apoio)
- ✅ ABA PLANO DE AÇÃO: Implementado (acesso, ensino, avaliação)
- ✅ ABA MONITORAMENTO: Implementado (data revisão, status, parecer, ações futuras)
- ✅ ABA BNCC: Implementado (EI: campos/objetivos; EF/EM: habilidades)
- ✅ ABA CONSULTORIA IA: Implementado (geração, revisão, aprovação, ajuste)
- ⚠️ ABA DASHBOARD: **PARCIALMENTE IMPLEMENTADO**
  - ✅ Exportação (PDF, DOCX)
  - ✅ KPIs básicos (Potencialidades, Barreiras, Hiperfoco)
  - ❌ Hero card completo (avatar, nome, série, turma, matrícula, idade, status)
  - ❌ Card de Atenção Farmacológica
  - ❌ Card de Cronograma de Metas (Curto, Médio, Longo prazo)
  - ❌ Card de DNA do Estudante (barreiras por domínio com barras)
  - ❌ Card de Rede de Apoio

**STATUS**: ⚠️ **DASHBOARD PARCIAL** (60% completo - falta visualização rica)

---

### 3. 🧩 PAEE (Plano de Atendimento Educacional Especializado)

#### Streamlit (`2_PAEE.py`) - 7 ABAS

##### ABA 1: MAPEAR BARREIRAS
- ✅ Estudante + observação do AEE
- ✅ Seleção de motor de IA
- ✅ Feedback para ajuste
- ✅ Classificação de barreiras (LBI): Comunicacionais, Metodológicas, Atitudinais, Tecnológicas, Arquitetônicas
- ✅ Para cada barreira: Descrição, Impacto, Intervenções, Recursos

##### ABA 2: PLANO DE HABILIDADES
- ✅ Estudante + foco (ex: Funções Executivas)
- ✅ Seleção de motor de IA
- ✅ Feedback para ajuste
- ✅ 3 metas SMART (Curto, Médio, Longo prazo)
- ✅ Para cada meta: Indicadores, Estratégias, Recursos, Frequência, Responsáveis, Critérios de Sucesso

##### ABA 3: TEC. ASSISTIVA
- ✅ Estudante + dificuldade específica
- ✅ Seleção de motor de IA
- ✅ Feedback para ajuste
- ✅ Sugestões em 3 níveis: Baixa, Média, Alta tecnologia
- ✅ Para cada sugestão: Nome, Finalidade, Como usar, Benefícios, Dificuldades, Referências

##### ABA 4: ARTICULAÇÃO
- ✅ Estudante + frequência AEE + ações desenvolvidas
- ✅ Seleção de motor de IA
- ✅ Feedback para ajuste
- ✅ Carta de Articulação (AEE → Sala Regular) com:
  - Cabeçalho Institucional
  - Resumo das Habilidades Desenvolvidas
  - Estratégias de Generalização
  - Orientações Práticas
  - Plano de Ação Conjunto
  - Próximos Passos
  - Contatos e Suporte

##### ABA 5: PLANEJAMENTO AEE
- ⚠️ **VERIFICAR** (não analisado em detalhe)

##### ABA 6: EXECUÇÃO E METAS SMART
- ⚠️ **VERIFICAR** (não analisado em detalhe)

##### ABA 7: JORNADA GAMIFICADA
- ✅ Origem: ciclo ou texto
- ✅ Seleção de motor de IA
- ✅ Feedback para ajuste
- ✅ Geração de missão gamificada

#### Next.js (`/paee`)
- ✅ MAPEAR BARREIRAS: Implementado
- ✅ PLANO DE HABILIDADES: Implementado
- ✅ TEC. ASSISTIVA: Implementado
- ✅ ARTICULAÇÃO: Implementado
- ✅ PLANEJAMENTO AEE: Implementado (ciclos de planejamento)
- ✅ EXECUÇÃO E METAS SMART: Implementado (ciclos de execução)
- ✅ JORNADA GAMIFICADA: Implementado

**STATUS**: ✅ COMPLETO

---

### 4. 🚀 HUB DE RECURSOS

#### Streamlit (`3_Hub_Inclusao.py`)

##### MODO EF/EM (8 ferramentas):
1. ✅ **Adaptar Prova**: Upload DOCX, adaptação com DUA, BNCC completo
2. ✅ **Adaptar Atividade**: Upload imagem, OCR, adaptação IA, BNCC completo
3. ✅ **Criar do Zero**: BNCC + assunto → atividade gerada
4. ✅ **Estúdio Visual**: Pictogramas CAA, ilustrações, cenas sociais (Gemini + DALL-E)
5. ✅ **Roteiro Individual**: Passo a passo de aula personalizado
6. ✅ **Papo de Mestre**: Sugestões de mediação
7. ✅ **Dinâmica Inclusiva**: Atividades em grupo DUA
8. ✅ **Plano de Aula DUA**: Desenho Universal

##### MODO EI (4 ferramentas):
1. ✅ **Criar Experiência**: BNCC EI: campos e objetivos
2. ✅ **Estúdio Visual & CAA**: Pictogramas, cenas, símbolos
3. ✅ **Rotina & AVD**: Sequências e autonomia
4. ✅ **Inclusão no Brincar**: Brincadeiras acessíveis

#### Next.js (`/hub`)
- ✅ Adaptar Prova: Implementado (BNCC completo)
- ✅ Adaptar Atividade: Implementado (OCR, BNCC completo, cropper)
- ✅ Criar do Zero: Implementado
- ✅ Estúdio Visual: Implementado (Gemini + DALL-E)
- ✅ Roteiro Individual: Implementado
- ✅ Papo de Mestre: Implementado
- ✅ Dinâmica Inclusiva: Implementado
- ✅ Plano de Aula DUA: Implementado
- ✅ Criar Experiência (EI): Implementado
- ✅ Rotina & AVD (EI): Implementado
- ✅ Inclusão no Brincar (EI): Implementado

**STATUS**: ✅ COMPLETO

---

### 5. 📝 DIÁRIO DE BORDO

#### Streamlit (`4_Diario_de_Bordo.py`) - 5 ABAS

##### ABA 1: FILTROS & ESTATÍSTICAS
- ✅ Filtro por estudante
- ✅ Filtro por período (7 dias, 30 dias, este mês, mês passado, personalizado, todos)
- ✅ Filtro por modalidade (multiselect)
- ✅ Estatísticas: Total filtrado, Horas de atendimento, Engajamento médio, Última sessão

##### ABA 2: NOVO REGISTRO
- ✅ Seleção de estudante
- ✅ Data da sessão
- ✅ Duração (minutos)
- ✅ Modalidade (Individual, Grupo, Observação em Sala, Consultoria)
- ✅ Engajamento (slider 1-5)
- ✅ Atividade Principal
- ✅ Objetivos Trabalhados
- ✅ Estratégias Utilizadas
- ✅ Recursos e Materiais
- ✅ Nível de Dificuldade
- ✅ Competências Trabalhadas (multiselect)
- ✅ Pontos Positivos
- ✅ Dificuldades Identificadas
- ✅ Observações Gerais
- ✅ Próximos Passos
- ✅ Encaminhamentos Necessários
- ✅ Salvar registro

##### ABA 3: LISTA DE REGISTROS
- ✅ Lista filtrada de registros
- ✅ Expandir para ver detalhes
- ✅ Botões: Editar, Excluir (com confirmação)
- ✅ Exibição: Data, Estudante, Atividade, Modalidade, Duração, Engajamento, Competências

##### ABA 4: RELATÓRIOS
- ✅ Gráfico: Atendimentos por mês (bar chart)
- ✅ Gráfico: Distribuição por modalidade (pie chart)
- ✅ Gráfico: Evolução do engajamento (line chart por estudante)
- ✅ Estatísticas do estudante selecionado
- ✅ Gráfico: Top 10 Competências Trabalhadas (bar chart horizontal)
- ✅ Exportar CSV
- ✅ Exportar JSON
- ✅ Gerar Relatório Resumido

##### ABA 5: CONFIGURAÇÕES
- ✅ Duração Padrão
- ✅ Modalidade Padrão
- ✅ Competências Padrão
- ✅ Notificações (toggle)
- ✅ Formato Padrão de Exportação
- ✅ Campos para Exportação
- ✅ Backup Automático
- ✅ Frequência do Backup
- ✅ Salvar / Restaurar Padrões

#### Next.js (`/diario`)
- ⚠️ FILTROS & ESTATÍSTICAS: **FALTANDO** (apenas lista básica)
- ✅ NOVO REGISTRO: Implementado (todos os campos)
- ✅ LISTA DE REGISTROS: Implementado (básico, sem filtros avançados)
- ⚠️ RELATÓRIOS: **FALTANDO** (gráficos, exportação CSV/JSON)
- ⚠️ CONFIGURAÇÕES: **FALTANDO**

**STATUS**: ⚠️ **60% COMPLETO** (faltam filtros avançados, relatórios, configurações)

---

### 6. 📊 MONITORAMENTO & AVALIAÇÃO

#### Streamlit (`5_Monitoramento_Avaliacao.py`)
- ⚠️ **VERIFICAR** (não analisado em detalhe)

#### Next.js (`/monitoramento`)
- ✅ Rubrica de avaliação (4 critérios: autonomia, social, conteúdo, comportamento)
- ✅ Observações
- ✅ Salvar avaliação
- ⚠️ **VERIFICAR** funcionalidades completas do Streamlit

**STATUS**: ⚠️ **VERIFICAR**

---

### 7. 👥 ESTUDANTES

#### Streamlit (`Estudantes.py`)
- ✅ Lista de estudantes (tabela)
- ✅ Filtros de busca
- ✅ Visualização: Nome, Série, Turma, Diagnóstico, PEI, PAEE
- ✅ Botões: Ver PEI, Ver PAEE, Excluir (com confirmação)
- ✅ Atualização de dados básicos
- ✅ Atualização de `pei_data` e `paee_ciclos`

#### Next.js (`/estudantes`)
- ✅ Lista de estudantes
- ✅ Busca por nome, série, turma, diagnóstico
- ✅ Cards com informações básicas
- ✅ Links para PEI e PAEE
- ⚠️ **VERIFICAR** se tem exclusão e edição completa

**STATUS**: ✅ BÁSICO IMPLEMENTADO (verificar funcionalidades avançadas)

---

### 8. ⚙️ GESTÃO DE USUÁRIOS

#### Streamlit (`6_Gestao_Usuarios.py`)
- ✅ Configurar usuário master (se não existir)
- ✅ Lista de membros (ativos e inativos)
- ✅ Novo usuário: Nome, Email, Senha, Telefone, Cargo
- ✅ Permissões por página (checkboxes): Estudantes, PEI, PAEE, Hub, Diário, Avaliação, Gestão
- ✅ Vínculo com estudantes: Todos / Por turma / Por tutor
- ✅ Se turma: Seleção de turmas + componentes curriculares
- ✅ Se tutor: Seleção de estudantes específicos
- ✅ Editar usuário
- ✅ Desativar / Reativar usuário
- ✅ Excluir permanentemente

#### Next.js (`/gestao`)
- ✅ Configurar master: Implementado
- ✅ Lista de membros: Implementado
- ✅ Novo usuário: Implementado (todos os campos)
- ✅ Permissões: Implementado
- ✅ Vínculo com estudantes: Implementado
- ✅ Editar: Implementado
- ✅ Desativar/Reativar: Implementado
- ✅ Excluir: Implementado

**STATUS**: ✅ COMPLETO

---

### 9. 🏫 CONFIGURAÇÃO ESCOLA

#### Streamlit (`7_Configuracao_Escola.py`)
- ✅ **1. Ano Letivo**: Criar ano letivo (ano + nome opcional)
- ✅ **2. Séries da Escola**: Multiselect de séries (EI, EF, EM)
- ✅ **3. Turmas**: Criar turma (ano letivo + série + turma)
- ✅ Lista de turmas criadas
- ✅ Excluir turma

#### Next.js (`/config-escola`)
- ✅ **1. Ano Letivo**: Implementado (criar ano letivo)
- ✅ **2. Séries da Escola**: Implementado (multiselect de séries)
- ✅ **3. Turmas**: Implementado (criar turma, lista, excluir)

**STATUS**: ✅ COMPLETO

---

### 10. 🔧 ADMIN PLATAFORMA

#### Streamlit (`8_Admin_Plataforma.py`) - 5 ABAS
- ✅ **Escolas**: Lista de workspaces, criar escola, editar, desativar, excluir
- ✅ **Uso de IAs**: Controle de chamadas por motor e escola (últimos 7/30/90 dias)
- ✅ **Termo de Uso**: Editar texto do termo
- ✅ **Dashboard**: Métricas de uso (eventos, page views, logins, timeline, motores mais usados)
- ✅ **Bugs e Erros**: Lista de issues, criar, atualizar status

#### Next.js
- ❌ **NÃO IMPLEMENTADO** (módulo Admin Plataforma não existe)

**STATUS**: ❌ **FALTANDO** (módulo completo não existe)

---

### 11. 📋 PGI (Plano de Gestão Inclusiva)

#### Streamlit (`9_PGI.py`)
- ✅ **Aba Inicial**: Acolhimento e informações
- ✅ **Aba Gerador**: Gerador baseado em 5W2H
  - Eixos: Infraestrutura, Formação de Equipe, Recursos Pedagógicos
  - Ações com: Tipo, Perfil de Atendimento, O que, Por quê, Quem, Quando, Onde, Como, Quanto
  - Dimensionamento
  - Exportação PDF

#### Next.js (`/pgi`)
- ✅ Aba Inicial: Implementado
- ✅ Aba Gerador: Implementado (5W2H, ações, dimensionamento)
- ✅ Exportação PDF: Implementado

**STATUS**: ✅ COMPLETO

---

## 🔍 FUNCIONALIDADES GLOBAIS

### Barra de Progresso (PEI)
- ✅ Streamlit: Barra de progresso visual em cada aba do PEI
- ⚠️ Next.js: **VERIFICAR** se tem barra de progresso

### Sincronização Supabase
- ✅ Streamlit: Sincronização completa (estudantes, PEI, PAEE, diário)
- ✅ Next.js: Implementado (estudantes, PEI, PAEE, diário)

### Exportação de Documentos
- ✅ Streamlit: PDF, DOCX, JSON
- ✅ Next.js: PDF, DOCX, JSON (verificar se todos os módulos têm)

### Geração de Imagens (Gemini)
- ✅ Streamlit: Mapas mentais, ilustrações, pictogramas CAA
- ✅ Next.js: Implementado (mapas mentais, ilustrações, pictogramas CAA)

### Multi-engine AI
- ✅ Streamlit: Red, Blue, Green, Yellow, Orange
- ✅ Next.js: Implementado (todos os motores)

---

## 📝 RESUMO EXECUTIVO

### ✅ COMPLETO (100%)
1. Home / Infos
2. Hub de Recursos
3. Gestão de Usuários
4. PGI
5. PAEE (todas as 7 abas)
6. Configuração Escola

### ⚠️ QUASE COMPLETO (80-95%)
1. **PEI**: Dashboard parcial (falta hero card completo, cards principais)
2. **Estudantes**: Verificar funcionalidades avançadas (edição, exclusão)

### ⚠️ PARCIALMENTE IMPLEMENTADO (50-70%)
1. **Diário de Bordo**: Falta filtros avançados, relatórios com gráficos, configurações
2. **Monitoramento**: Verificar funcionalidades completas
3. **Configuração Escola**: Verificar implementação completa
4. **Admin Plataforma**: Verificar se existe

---

## 🎯 PRIORIDADES DE IMPLEMENTAÇÃO

### ALTA PRIORIDADE
1. **PEI Dashboard** (aba 9): Hero card completo, cards principais (Farmacológico, Metas, DNA, Rede de Apoio)
2. **Diário de Bordo**: Filtros avançados, relatórios com gráficos (Plotly/Recharts), configurações
3. **Admin Plataforma**: Implementar módulo completo (Escolas, Uso de IAs, Termo, Dashboard, Bugs)

### MÉDIA PRIORIDADE
4. **Monitoramento**: Verificar e completar funcionalidades (gráficos, relatórios)
5. **Estudantes**: Verificar e completar funcionalidades avançadas (edição inline, exclusão com confirmação)

### BAIXA PRIORIDADE
7. Barra de progresso visual no PEI (se não existir)
8. Melhorias de UX em funcionalidades já implementadas

---

## 📌 OBSERVAÇÕES

1. **Visual Graphviz**: O Streamlit usa Graphviz para o "Fluxo da Inclusão" na Home. No Next.js foi usado um visual simplificado. Isso é aceitável, mas pode ser melhorado no futuro.

2. **Gráficos no Diário**: O Streamlit usa Plotly para gráficos. No Next.js, será necessário implementar com uma biblioteca de gráficos (ex: Recharts, Chart.js, ou Plotly.js).

3. **Exportação**: Verificar se todos os módulos que exportam documentos no Streamlit também exportam no Next.js.

4. **Validações e Feedback**: Verificar se todas as validações e mensagens de feedback do Streamlit estão presentes no Next.js.

---

**Data da Análise**: 2026-02-06
**Versão Streamlit Analisada**: v150.0 (SaaS Design)
**Versão Next.js**: Atual (em desenvolvimento)
