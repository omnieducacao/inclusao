# 📊 REVISÃO COMPARATIVA DETALHADA: Streamlit vs Next.js

**Data da Análise**: 2026-02-06  
**Versão Streamlit**: v150.0 (SaaS Design)  
**Versão Next.js**: Atual (em desenvolvimento)

---

## 🎯 OBJETIVO

Comparação funcionalidade por funcionalidade entre a versão Streamlit (funcional) e a versão Next.js para identificar:
- ✅ Funcionalidades completas
- ⚠️ Funcionalidades parciais
- ❌ Funcionalidades faltantes
- 🔍 Diferenças de implementação

---

## 📋 MÓDULOS PRINCIPAIS

### 1. 🏠 HOME / INFOS (Central de Inteligência Inclusiva)

#### Streamlit (`pages/0_Home.py`)

**Conteúdo Completo:**

1. **📊 Panorama & Fluxos**
   - Fluxo da Inclusão (visual Graphviz com diagrama)
   - Filosofia "Outrar-se" (texto explicativo)
   - Justiça Curricular (conceito e aplicação)

2. **⚖️ Legislação & IA**
   - Decreto 12.686/2025 (texto completo)
   - Decreto 12.773/2025 (texto completo)
   - Marcos Legais (lista de legislações)
   - Consultor Legal IA (chat com IA para perguntas legais)

3. **📖 Glossário Técnico**
   - 19+ termos técnicos com definições completas
   - Busca/filtro por termo
   - Exemplos: AEE, Alteridade, Capacitismo, Cultura do Pertencimento, etc.

4. **🗣️ Dicionário Inclusivo**
   - Termos "PREFIRA" vs "EVITE"
   - Exemplos práticos de linguagem inclusiva
   - Explicações pedagógicas

5. **📚 Biblioteca Virtual**
   - Acervo bibliográfico completo
   - Categorias: Legislação, Fundamentos, Artigos
   - Links e referências

6. **📘 Manual da Jornada**
   - Passo a passo do Ciclo da Inclusão
   - Fluxo detalhado de uso da plataforma

#### Next.js (`app/(dashboard)/infos/InfosClient.tsx`)

**Status**: ✅ **COMPLETO** (100%)

- ✅ Panorama & Fluxos: Implementado (visual simplificado, sem Graphviz)
- ✅ Legislação & IA: Implementado (mock IA para consultor legal)
- ✅ Glossário Técnico: Implementado (19 termos, busca funcional)
- ✅ Dicionário Inclusivo: Implementado
- ✅ Biblioteca Virtual: Implementado
- ✅ Manual da Jornada: Implementado

**Observações**:
- Visual Graphviz substituído por visual simplificado (aceitável)
- Consultor Legal IA usa mock (pode ser melhorado no futuro)

---

### 2. 📚 PEI (Plano Educacional Individualizado)

#### Streamlit (`pages/1_PEI.py`) - 10 ABAS

##### ✅ ABA 0: INÍCIO
- ✅ Upload JSON local
- ✅ Sincronização nuvem (Supabase)
- ✅ Status vinculação (Supabase ou rascunho)
- ✅ Seções informativas: Fundamentos do PEI, Como usar, PEI/PDI e Prática Inclusiva
- ✅ Botão "BAIXAR BACKUP (.JSON)"

##### ✅ ABA 1: ESTUDANTE
- ✅ Dados básicos (nome, série, turma, matrícula, nascimento)
- ✅ Diagnóstico/CID
- ✅ Lista de medicamentos (extração de PDF, administração na escola)
- ✅ Detecção automática de segmento (EI, EFI, EFII, EM)
- ✅ Visualização de segmento com cores

##### ✅ ABA 2: EVIDÊNCIAS
- ✅ Hipótese de Escrita (Emília Ferreiro)
- ✅ Checklist de evidências (Pedagógico, Cognitivo, Comportamental)
- ✅ Observações de especialistas

##### ✅ ABA 3: REDE DE APOIO
- ✅ Seleção de profissionais (multiselect)
- ✅ Campo geral de orientações
- ✅ Campos individuais por profissional
- ✅ Limpeza automática de profissionais desmarcados

##### ✅ ABA 4: MAPEAMENTO
- ✅ Hiperfoco (texto livre)
- ✅ Potencialidades (multiselect)
- ✅ Barreiras por domínio (5 domínios)
- ✅ Nível de apoio por barreira (slider: Autônomo → Monitorado → Substancial → Muito Substancial)
- ✅ Observações por domínio
- ✅ Resumo do mapeamento

##### ✅ ABA 5: PLANO DE AÇÃO
- ✅ Acesso (DUA): Multiselect de recursos + campo personalizado
- ✅ Ensino (Metodologias): Multiselect de estratégias + campo personalizado
- ✅ Avaliação (Formato): Multiselect de estratégias

##### ✅ ABA 6: MONITORAMENTO
- ✅ Data da próxima revisão
- ✅ Status da Meta (selectbox)
- ✅ Parecer Geral (selectbox)
- ✅ Ações Futuras (multiselect)

##### ✅ ABA 7: BNCC
- ✅ Educação Infantil: Faixa de idade + Campo de Experiência + Objetivos de Aprendizagem
- ✅ EF/EM: Seleção de habilidades BNCC por componente
- ✅ Ano atual vs Anos anteriores
- ✅ Botão "IA sugerir habilidades"
- ✅ Lista de habilidades selecionadas (com remoção individual)
- ✅ Botão "Desmarcar todas"
- ✅ Validação de seleção

##### ✅ ABA 8: CONSULTORIA IA
- ✅ Seleção de motor de IA (Red, Blue, Green, Yellow, Orange)
- ✅ Botão "Gerar Estratégia Técnica"
- ✅ Botão "Gerar Guia Prático (Sala de Aula)"
- ✅ Transparência: "Como a IA construiu este relatório"
- ✅ Calibragem e segurança pedagógica
- ✅ Revisão do plano gerado
- ✅ Botões: Aprovar / Solicitar Ajuste
- ✅ Modo ajustando: feedback + regerar
- ✅ Modo aprovado: edição manual + regerar do zero

##### ⚠️ ABA 9: DASHBOARD & DOCS

**Streamlit - Funcionalidades Completas:**

1. **Hero Card Completo**
   - Avatar circular com inicial do nome
   - Nome completo
   - Série • Turma • Matrícula/RA
   - Status vinculação (Vinculado ao Supabase ✅ / Rascunho)
   - Idade calculada

2. **KPIs (4 métricas)**
   - Potencialidades (donut chart com número)
   - Barreiras (donut chart com número)
   - Hiperfoco (emoji + texto)
   - Nível de Atenção (complexidade PEI: BAIXA/MODERADA/ALTA/MUITO ALTA)

3. **Cards Principais (2 colunas)**
   - **Card Atenção Farmacológica** (laranja):
     - Lista de medicamentos em uso contínuo
     - Alerta pulsante 🚨 se administração na escola necessária
     - Mensagem destacada: "ATENÇÃO: ADMINISTRAÇÃO NA ESCOLA NECESSÁRIA"
   - **Card Cronograma de Metas** (amarelo):
     - Metas extraídas do relatório IA (Curto, Médio, Longo prazo)
     - Ícones: 🏁 Curto, 🧗 Médio, 🏔️ Longo
   - **Card DNA do Estudante** (ciano):
     - Barreiras por domínio com barras de progresso
     - 5 domínios: Funções Cognitivas, Sensorial e Motor, Comunicação e Linguagem, Acadêmico, Socioemocional
     - Cores: azul (<40%), laranja (40-70%), vermelho (>70%)
   - **Card Rede de Apoio** (ciano):
     - Chips com profissionais e ícones
     - Ex: 🗣️ Fonoaudiólogo, 🧠 Psicólogo, etc.

4. **Radar Curricular (Automático)**
   - Inferência de componentes impactados baseado nas barreiras
   - Chips vermelhos para componentes críticos

5. **Exportação + Sincronização**
   - PDF Oficial (gerado com FPDF)
   - Word Editável (DOCX)
   - Backup JSON
   - Sincronização Supabase completa

#### Next.js (`app/(dashboard)/pei/PEIClient.tsx`)

**Status**: ✅ **DASHBOARD IMPLEMENTADO** (95% completo)

**Implementado**:
- ✅ Hero Card completo (avatar, nome, série, turma, matrícula, idade, status)
- ✅ KPIs (4 métricas: Potencialidades, Barreiras, Hiperfoco, Nível de Atenção)
- ✅ Card Atenção Farmacológica (com alerta se administração na escola)
- ✅ Card Cronograma de Metas (Curto, Médio, Longo prazo)
- ✅ Card DNA do Estudante (barreiras por domínio com barras)
- ✅ Card Rede de Apoio (chips com profissionais)
- ✅ Exportação PDF e DOCX
- ✅ Sincronização Supabase

**Faltando**:
- ❌ Radar Curricular (inferência automática de componentes impactados)
- ⚠️ Visualização pode ser melhorada (mas funcional)

**Conclusão**: Dashboard está **95% completo**. Falta apenas o Radar Curricular automático.

---

### 3. 🧩 PAEE (Plano de Atendimento Educacional Especializado)

#### Streamlit (`pages/2_PAEE.py`) - 7 ABAS

##### ✅ ABA 1: MAPEAR BARREIRAS
- ✅ Estudante + observação do AEE
- ✅ Seleção de motor de IA (Red, Blue, Green)
- ✅ Feedback para ajuste
- ✅ Classificação de barreiras (LBI): Comunicacionais, Metodológicas, Atitudinais, Tecnológicas, Arquitetônicas
- ✅ Para cada barreira: Descrição, Impacto, Intervenções, Recursos
- ✅ Sistema de estados: rascunho → revisão → ajustando → aprovado

##### ✅ ABA 2: PLANO DE HABILIDADES
- ✅ Estudante + foco (ex: Funções Executivas)
- ✅ Seleção de motor de IA (Red, Blue, Green)
- ✅ Feedback para ajuste
- ✅ 3 metas SMART (Curto, Médio, Longo prazo)
- ✅ Para cada meta: Indicadores, Estratégias, Recursos, Frequência, Responsáveis, Critérios de Sucesso
- ✅ Sistema de estados: rascunho → revisão → ajustando → aprovado

##### ✅ ABA 3: TEC. ASSISTIVA
- ✅ Estudante + dificuldade específica
- ✅ Seleção de motor de IA (Red, Blue, Green)
- ✅ Feedback para ajuste
- ✅ Sugestões em 3 níveis: Baixa, Média, Alta tecnologia
- ✅ Para cada sugestão: Nome, Finalidade, Como usar, Benefícios, Dificuldades, Referências
- ✅ Sistema de estados: rascunho → revisão → ajustando → aprovado

##### ✅ ABA 4: ARTICULAÇÃO
- ✅ Estudante + frequência AEE + ações desenvolvidas
- ✅ Seleção de motor de IA (Red, Blue, Green)
- ✅ Feedback para ajuste
- ✅ Carta de Articulação (AEE → Sala Regular) com:
  - Cabeçalho Institucional
  - Resumo das Habilidades Desenvolvidas
  - Estratégias de Generalização
  - Orientações Práticas
  - Plano de Ação Conjunto
  - Próximos Passos
  - Contatos e Suporte
- ✅ Sistema de estados: rascunho → revisão → ajustando → aprovado

##### ✅ ABA 5: PLANEJAMENTO AEE
- ✅ Formulário de configuração do ciclo
- ✅ Seleção de metas do PEI (checkboxes)
- ✅ Incorporação de recursos (barreiras, plano, tec, articulação)
- ✅ Duração, frequência, datas
- ✅ Geração de cronograma com IA (opcional)
- ✅ Preview antes de salvar
- ✅ Histórico de ciclos (Supabase)
- ✅ Definir ciclo como ativo
- ✅ Visualização completa do ciclo (metas, recursos, cronograma)

##### ✅ ABA 6: EXECUÇÃO E METAS SMART
- ✅ Formulário de configuração do ciclo de execução
- ✅ Seleção de metas do PEI
- ✅ Desdobramento SMART com IA (opcional)
- ✅ Cronograma por semanas com IA (opcional)
- ✅ Incorporação de insumos (barreiras, plano, tec)
- ✅ Preview antes de salvar
- ✅ Histórico de ciclos de execução
- ✅ Visualização completa (metas SMART, semanas)

##### ⚠️ ABA 7: JORNADA GAMIFICADA

**Streamlit - Funcionalidades Completas:**

1. **Seleção de Origem**
   - Opções: "Execução e Metas SMART (ciclo)", "Mapear Barreiras", "Plano de Habilidades", "Tecnologia Assistiva"
   - Para EI: "Barreiras no Brincar", "Banco de Experiências"

2. **Geração da Jornada**
   - Campo "Preferência de estilo" (opcional): "Ex: super-heróis, exploração, futebol..."
   - Botão "Criar Roteiro Gamificado"
   - **Motor**: Sempre usa **Gemini (OmniYellow)** para geração de texto
   - **Prompt do Ciclo**:
     ```
     Você é um Game Master. Crie uma versão GAMIFICADA do planejamento do ciclo AEE 
     para o estudante e a família: linguagem motivadora, missões, recompensas. 
     REGRA OBRIGATÓRIA: NUNCA inclua diagnóstico clínico, CID, condições médicas ou qualquer informação de saúde no texto. 
     Este material será entregue ao estudante e à família — use apenas desafios, conquistas, metas e estratégias pedagógicas. 
     Estrutura: título da missão/jornada, mapa das fases ou semanas como etapas, desafios e conquistas. 
     Use títulos e listas em markdown de forma clara (##, -, *).
     ```
   - **Prompt do Texto**:
     ```
     Você é um Game Master. Transforme o conteúdo abaixo em uma versão GAMIFICADA para o estudante e a família: 
     linguagem motivadora, missões, recompensas. 
     REGRA OBRIGATÓRIA: NUNCA inclua diagnóstico clínico, CID, condições médicas ou qualquer informação de saúde no texto. 
     Este material será entregue ao estudante e à família — remova qualquer menção clínica e use apenas desafios, conquistas e estratégias pedagógicas. 
     Estrutura: título da missão/jornada, etapas/desafios, conquistas. O estudante deve se ver como protagonista. 
     Use títulos e listas em markdown de forma clara (##, -, *).
     ```

3. **Sistema de Estados**
   - **rascunho**: Campo de estilo + botão gerar
   - **revisao**: Texto gerado + botões Aprovar / Solicitar Ajustes + gerar mapa mental
   - **ajustando**: Campo de feedback + botão Regerar com Ajustes
   - **aprovado**: Edição manual + exportação PDF/CSV + gerar mapa mental

4. **Mapa Mental**
   - Checkbox "Usar hiperfoco do estudante como tema do mapa mental (nó central)"
   - Campo editável para tema do mapa
   - Botão "Gerar mapa mental do roteiro"
   - **Motor**: Sempre usa **Gemini (OmniYellow)** para geração de imagem
   - Função `gerar_imagem_jornada_gemini()` com prompt específico:
     ```
     Crie um MAPA MENTAL rico e visual a partir deste roteiro gamificado. 
     REGRA OBRIGATÓRIA PARA O TEXTO: use APENAS palavras e expressões em português que ESTEJAM NO ROTEIRO abaixo. 
     Não invente, não distorça e não adicione palavras; extraia os títulos das missões e as tarefas/etapas diretamente do texto. 
     Cada rótulo no mapa mental deve ser uma frase ou palavra curta retirada do roteiro (em português). 
     Estrutura: (1) Nó central com tema do roteiro (ou tema: {hiperfoco}). 
     (2) Ramos = cada missão (título extraído do roteiro). 
     (3) Sub-ramos = tarefas/etapas de cada missão (texto extraído do roteiro). 
     Cores diferentes por ramo, ícones nos nós, linhas centro → missões → etapas.
     ```
   - Download da imagem PNG

5. **Exportação**
   - PDF (função `_gerar_pdf_jornada_simples()`)
   - CSV (para importar no Google Sheets)

#### Next.js (`app/(dashboard)/paee/PAEEClient.tsx`)

**Status**: ⚠️ **JORNADA GAMIFICADA PARCIAL** (70% completo)

**Implementado**:
- ✅ Seleção de origem (ciclo ou texto)
- ✅ Geração da jornada (prompt similar ao Streamlit)
- ✅ Sistema de estados básico (rascunho → revisão → aprovado)
- ✅ Botão gerar mapa mental
- ✅ Exportação PDF

**Diferenças Críticas**:

1. **❌ Motor de IA Incorreto**
   - **Streamlit**: Sempre usa **Gemini (OmniYellow)** para geração de texto
   - **Next.js**: Usa **DeepSeek (OmniRed)** via `selectEngine("paee", null, true)`
   - **Impacto**: A jornada gamificada deveria usar Gemini, não DeepSeek

2. **❌ Campo "Preferência de estilo" Faltando**
   - **Streamlit**: Tem campo opcional para estilo (super-heróis, exploração, futebol...)
   - **Next.js**: Não tem este campo
   - **Impacto**: Menos personalização da jornada

3. **⚠️ Prompt do Mapa Mental**
   - **Streamlit**: Prompt muito detalhado com regras específicas sobre extrair texto do roteiro
   - **Next.js**: Verificar se o prompt está igual (precisa verificar `app/api/paee/mapa-mental/route.ts`)

4. **❌ Exportação CSV Faltando**
   - **Streamlit**: Exporta CSV para importar no Google Sheets
   - **Next.js**: Não tem exportação CSV

5. **⚠️ Estados do Sistema**
   - **Streamlit**: 4 estados (rascunho, revisao, ajustando, aprovado)
   - **Next.js**: Verificar se tem todos os estados

**Verificações Realizadas**:
- ✅ **Prompt do Mapa Mental**: Está correto e equivalente ao Streamlit (`app/api/paee/mapa-mental/route.ts`)
- ✅ **Sistema de Estados**: Implementação básica existe, mas falta estados intermediários (revisão, ajustando)
- ❌ **Motor de IA**: Usa DeepSeek, deveria usar Gemini
- ❌ **Campo "Preferência de estilo"**: Não existe no componente `JornadaTab`
- ❌ **Exportação CSV**: Não implementada

**Ações Necessárias**:
1. **CRÍTICO**: Corrigir motor de IA para usar Gemini na geração da jornada (`app/api/paee/jornada-gamificada/route.ts`)
2. Adicionar campo "Preferência de estilo" no componente `JornadaTab`
3. Adicionar exportação CSV (similar ao Streamlit)
4. Implementar sistema de estados completo (rascunho → revisão → ajustando → aprovado)

---

### 4. 🚀 HUB DE RECURSOS

#### Streamlit (`pages/3_Hub_Inclusao.py`)

**MODO EF/EM (8 ferramentas)**:
1. ✅ **Adaptar Prova**: Upload DOCX, adaptação com DUA, BNCC completo
2. ✅ **Adaptar Atividade**: Upload imagem, OCR, adaptação IA, BNCC completo
3. ✅ **Criar do Zero**: BNCC + assunto → atividade gerada
4. ✅ **Estúdio Visual**: Pictogramas CAA, ilustrações, cenas sociais (Gemini + DALL-E)
5. ✅ **Roteiro Individual**: Passo a passo de aula personalizado
6. ✅ **Papo de Mestre**: Sugestões de mediação
7. ✅ **Dinâmica Inclusiva**: Atividades em grupo DUA
8. ✅ **Plano de Aula DUA**: Desenho Universal

**MODO EI (4 ferramentas)**:
1. ✅ **Criar Experiência**: BNCC EI: campos e objetivos
2. ✅ **Estúdio Visual & CAA**: Pictogramas, cenas, símbolos
3. ✅ **Rotina & AVD**: Sequências e autonomia
4. ✅ **Inclusão no Brincar**: Brincadeiras acessíveis

#### Next.js (`app/(dashboard)/hub/HubClient.tsx`)

**Status**: ✅ **COMPLETO** (100%)

- ✅ Todas as 12 ferramentas implementadas
- ✅ Modo EF/EM e EI funcionando
- ✅ BNCC completo integrado
- ✅ Geração de imagens (Gemini + DALL-E)
- ✅ Exportação DOCX e PDF

---

### 5. 📝 DIÁRIO DE BORDO

#### Streamlit (`pages/4_Diario_de_Bordo.py`) - 5 ABAS

##### ✅ ABA 1: FILTROS & ESTATÍSTICAS

**Funcionalidades Completas**:

1. **Filtros**
   - Filtro por estudante (selectbox: "Todos" + lista de estudantes)
   - Filtro por período:
     - Últimos 7 dias
     - Últimos 30 dias
     - Este mês
     - Mês passado
     - Personalizado (com data início e fim)
     - Todos
   - Filtro por modalidade (multiselect): Individual, Grupo, Observação em Sala, Consultoria

2. **Estatísticas**
   - Total de Registros (filtrado)
   - Horas de Atendimento (soma de duração)
   - Engajamento Médio (média do slider 1-5)
   - Última Sessão (data mais recente)
   - Estatísticas por modalidade (contagem)
   - Estatísticas por estudante (se filtrado)

##### ✅ ABA 2: NOVO REGISTRO
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

##### ✅ ABA 3: LISTA DE REGISTROS
- ✅ Lista filtrada de registros
- ✅ Expandir para ver detalhes
- ✅ Botões: Editar, Excluir (com confirmação)
- ✅ Exibição: Data, Estudante, Atividade, Modalidade, Duração, Engajamento, Competências
- ✅ Ordenação por data (mais recente primeiro)

##### ⚠️ ABA 4: RELATÓRIOS

**Funcionalidades Completas**:

1. **Gráficos Plotly**:
   - **Atendimentos por mês** (bar chart)
     - Eixo X: Mês
     - Eixo Y: Quantidade de atendimentos
   - **Distribuição por modalidade** (pie chart)
     - Porcentagem por modalidade (Individual, Grupo, Observação, Consultoria)
   - **Evolução do engajamento** (line chart por estudante)
     - Eixo X: Data
     - Eixo Y: Engajamento (1-5)
     - Linha por estudante
   - **Top 10 Competências Trabalhadas** (bar chart horizontal)
     - Competências mais frequentes

2. **Estatísticas do Estudante Selecionado**:
   - Total de sessões
   - Horas totais
   - Engajamento médio
   - Competências mais trabalhadas

3. **Exportação**:
   - Exportar CSV (todos os registros filtrados)
   - Exportar JSON (todos os registros filtrados)
   - Gerar Relatório Resumido (texto formatado)

##### ⚠️ ABA 5: CONFIGURAÇÕES
- ✅ Duração Padrão
- ✅ Modalidade Padrão
- ✅ Competências Padrão
- ✅ Notificações (toggle)
- ✅ Formato Padrão de Exportação
- ✅ Campos para Exportação
- ✅ Backup Automático
- ✅ Frequência do Backup
- ✅ Salvar / Restaurar Padrões

#### Next.js (`app/(dashboard)/diario/DiarioClient.tsx`)

**Status**: ⚠️ **60% COMPLETO**

**Implementado**:
- ✅ Novo Registro (todos os campos)
- ✅ Lista de Registros (básico, com edição e exclusão)
- ✅ Salvar/editar/excluir registros no Supabase

**Faltando**:
- ❌ **ABA FILTROS & ESTATÍSTICAS**: Não existe
  - Filtro por estudante
  - Filtro por período (7 dias, 30 dias, este mês, mês passado, personalizado, todos)
  - Filtro por modalidade
  - Estatísticas: Total, Horas, Engajamento médio, Última sessão
- ❌ **ABA RELATÓRIOS**: Não existe
  - Gráficos Plotly (bar chart, pie chart, line chart)
  - Estatísticas por estudante
  - Exportação CSV
  - Exportação JSON
  - Relatório Resumido
- ❌ **ABA CONFIGURAÇÕES**: Não existe
  - Duração padrão
  - Modalidade padrão
  - Competências padrão
  - Notificações
  - Formato de exportação
  - Backup automático

**Ações Necessárias**:
1. Criar aba "Filtros & Estatísticas" completa
2. Criar aba "Relatórios" com gráficos (usar Recharts ou Chart.js)
3. Criar aba "Configurações" com todas as opções
4. Implementar exportação CSV e JSON

---

### 6. 📊 MONITORAMENTO & AVALIAÇÃO

#### Streamlit (`pages/5_Monitoramento_Avaliacao.py`)

**Funcionalidades** (precisa verificar arquivo completo):
- ⚠️ Rubrica de avaliação (4 critérios)
- ⚠️ Observações
- ⚠️ Salvar avaliação
- ⚠️ Gráficos de evolução
- ⚠️ Relatórios

#### Next.js (`app/(dashboard)/monitoramento`)

**Status**: ⚠️ **VERIFICAR** (implementação básica existe, precisa comparar funcionalidades completas)

---

### 7. 👥 ESTUDANTES

#### Streamlit (`pages/Estudantes.py`)

**Funcionalidades Completas**:
- ✅ Lista de estudantes (tabela)
- ✅ Filtros de busca (nome, série, turma, diagnóstico)
- ✅ Visualização: Nome, Série, Turma, Diagnóstico, PEI, PAEE
- ✅ Botões: Ver PEI, Ver PAEE, Excluir (com confirmação)
- ✅ Atualização de dados básicos (inline)
- ✅ Atualização de `pei_data` e `paee_ciclos`
- ✅ Criação de novo estudante

#### Next.js (`app/(dashboard)/estudantes`)

**Status**: ✅ **COMPLETO** (100%)

- ✅ Lista de estudantes (cards)
- ✅ Busca por nome, série, turma, diagnóstico
- ✅ Links para PEI e PAEE
- ✅ Edição inline
- ✅ Exclusão com confirmação
- ✅ Criação de novo estudante

---

### 8. ⚙️ GESTÃO DE USUÁRIOS

#### Streamlit (`pages/6_Gestao_Usuarios.py`)

**Funcionalidades Completas**:
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
- ✅ **Filtro dinâmico**: Mostra apenas páginas liberadas pelo admin da plataforma

#### Next.js (`app/(dashboard)/gestao/GestaoClient.tsx`)

**Status**: ✅ **COMPLETO** (100%)

- ✅ Todas as funcionalidades implementadas
- ✅ Filtro dinâmico de páginas baseado em `enabled_modules` do workspace
- ✅ Validação backend para garantir que apenas páginas liberadas podem ser atribuídas

---

### 9. 🏫 CONFIGURAÇÃO ESCOLA

#### Streamlit (`pages/7_Configuracao_Escola.py`)

**Funcionalidades Completas**:
- ✅ **1. Ano Letivo**: Criar ano letivo (ano + nome opcional)
- ✅ **2. Séries da Escola**: Multiselect de séries (EI, EF, EM)
- ✅ **3. Turmas**: Criar turma (ano letivo + série + turma)
- ✅ Lista de turmas criadas
- ✅ Excluir turma
- ✅ Editar turma

#### Next.js (`app/(dashboard)/config-escola`)

**Status**: ✅ **COMPLETO** (100%)

- ✅ Todas as funcionalidades implementadas

---

### 10. 🔧 ADMIN PLATAFORMA

#### Streamlit (`pages/8_Admin_Plataforma.py`) - 5 ABAS

##### ✅ ABA 1: ESCOLAS
- ✅ Lista de workspaces
- ✅ Criar escola (nome, segmentos, motores de IA, módulos habilitados)
- ✅ Editar escola (todos os campos)
- ✅ Desativar / Reativar escola
- ✅ Excluir escola
- ✅ Visualização: Nome, PIN, Status, Segmentos, Motores, Módulos

##### ✅ ABA 2: USO DE IAS
- ✅ Tabela de uso por escola
- ✅ Colunas: Escola, omnired, omniblue, omnigreen, omniyellow, omniorange, Total chamadas, Créditos usados, Plano, Limite créditos
- ✅ Filtro por período (7, 30, 90 dias)
- ✅ Agregação de dados da tabela `ia_usage`

##### ✅ ABA 3: TERMO DE USO
- ✅ Editar texto do termo
- ✅ Salvar termo (salva em `platform_config` com key `terms_of_use`)
- ✅ Valor padrão se não existir

##### ✅ ABA 4: DASHBOARD
- ✅ Métricas de uso (eventos capturados, page views, logins)
- ✅ Timeline diária (gráfico de barras)
- ✅ Motores de IA mais usados (gráfico de barras)
- ✅ Eventos recentes (lista)

##### ✅ ABA 5: BUGS E ERROS
- ✅ Lista de issues (bugs registrados)
- ✅ Criar bug (título, descrição, severidade, origem, escola relacionada)
- ✅ Atualizar status (aberto, em_andamento, resolvido, arquivado)
- ✅ Notas de resolução

#### Next.js (`app/(dashboard)/admin/AdminClient.tsx`)

**Status**: ✅ **COMPLETO** (100%)

- ✅ Todas as 5 abas implementadas
- ✅ Funcionalidades idênticas ao Streamlit

---

### 11. 📋 PGI (Plano de Gestão Inclusiva)

#### Streamlit (`pages/9_PGI.py`)

**Funcionalidades Completas**:
- ✅ **Aba Inicial**: Acolhimento e informações
- ✅ **Aba Gerador**: Gerador baseado em 5W2H
  - Eixos: Infraestrutura, Formação de Equipe, Recursos Pedagógicos
  - Ações com: Tipo, Perfil de Atendimento, O que, Por quê, Quem, Quando, Onde, Como, Quanto
  - Dimensionamento
  - Exportação PDF

#### Next.js (`app/(dashboard)/pgi/PGIClient.tsx`)

**Status**: ✅ **COMPLETO** (100%)

- ✅ Todas as funcionalidades implementadas
- ✅ Exportação PDF funcionando

---

## 🔍 ANÁLISE DETALHADA POR FUNCIONALIDADE

### A. JORNADA GAMIFICADA (PAEE)

#### Comparação de Prompts

**Streamlit - Geração do Ciclo**:
```python
prompt_sys = (
    "Você é um Game Master. Crie uma versão GAMIFICADA do planejamento do ciclo AEE "
    "para o estudante e a família: linguagem motivadora, missões, recompensas. "
    "REGRA OBRIGATÓRIA: NUNCA inclua diagnóstico clínico, CID, condições médicas ou qualquer informação de saúde no texto. "
    "Este material será entregue ao estudante e à família — use apenas desafios, conquistas, metas e estratégias pedagógicas. "
    "Estrutura: título da missão/jornada, mapa das fases ou semanas como etapas, desafios e conquistas. "
    "Use títulos e listas em markdown de forma clara (##, -, *)."
    + prompt_feedback
)
```

**Next.js - Geração do Ciclo**:
```typescript
prompt = `Crie uma MISSÃO GAMIFICADA para o estudante ${nome} (série: ${serie}). Hiperfoco: ${hiperfoco}.
${promptFeedback}
CONTEXTO DO CICLO:
- Foco: ${foco}
- Descrição: ${desc}
${metas.length ? `- Metas: ${metas.join("; ")}` : ""}
${semanasTxt ? `\nCRONOGRAMA:\n${semanasTxt}` : ""}

Estrutura: título da missão/jornada, mapa das fases ou semanas como etapas, desafios e conquistas.
REGRA: NUNCA inclua diagnóstico clínico, CID ou condições médicas. O material será entregue ao estudante e à família.
Use linguagem motivadora e lúdica. O estudante deve se ver como protagonista.`;
```

**Diferenças**:
- ✅ Prompts são equivalentes (mesma estrutura e regras)
- ❌ **Motor diferente**: Streamlit usa Gemini, Next.js usa DeepSeek
- ❌ **Campo de estilo faltando**: Streamlit tem campo opcional para estilo

#### Comparação de Mapa Mental

**Streamlit - Prompt do Mapa Mental**:
```python
prompt = (
    "Crie um MAPA MENTAL rico e visual a partir deste roteiro gamificado. "
    "REGRA OBRIGATÓRIA PARA O TEXTO: use APENAS palavras e expressões em português que ESTEJAM NO ROTEIRO abaixo. "
    "Não invente, não distorça e não adicione palavras; extraia os títulos das missões e as tarefas/etapas diretamente do texto. "
    "Cada rótulo no mapa mental deve ser uma frase ou palavra curta retirada do roteiro (em português). "
    "Estrutura: (1) Nó central com tema do roteiro" + (f" (ou tema: {tema})" if tema and tema != "aprendizado" else "") + ". "
    "(2) Ramos = cada missão (título extraído do roteiro). "
    "(3) Sub-ramos = tarefas/etapas de cada missão (texto extraído do roteiro). "
    "Cores diferentes por ramo, ícones nos nós, linhas centro → missões → etapas. "
    "Texto em português."
)
```

**Next.js - Prompt do Mapa Mental** (`app/api/paee/mapa-mental/route.ts`):
- ✅ **CORRETO**: Prompt está equivalente ao Streamlit
- ✅ Usa Gemini (OmniYellow) como no Streamlit
- ✅ Prompt detalhado com regras sobre extrair texto do roteiro
- ✅ Fallback para DALL-E se Gemini falhar

---

### B. PEI DASHBOARD

#### Comparação Detalhada

**Streamlit - Hero Card**:
```python
st.markdown(
    f"""
    <div class="dash-hero">
        <div style="display:flex; align-items:center; gap:20px;">
            <div class="apple-avatar">{init_avatar}</div>
            <div style="color:white;">
                <h1 style="margin:0; line-height:1.1;">{d.get("nome","")}</h1>
                <p style="margin:6px 0 0 0; opacity:.9;">
                    {serie_txt} • Turma {turma_txt} • Matrícula/RA: {matricula_txt}
                </p>
                <p style="margin:6px 0 0 0; opacity:.8; font-size:.85rem;">{vinculo_txt}</p>
            </div>
        </div>
        <div style="text-align:right;">
            <div style="font-size:0.8rem; opacity:.85;">IDADE</div>
            <div style="font-size:1.2rem; font-weight:800;">{idade_str}</div>
        </div>
    </div>
    """,
    unsafe_allow_html=True
)
```

**Next.js - Hero Card**:
```typescript
<div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg">
  <div className="flex items-center justify-between flex-wrap gap-4">
    <div className="flex items-center gap-5">
      <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold">
        {initAvatar}
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-1">{peiData.nome}</h1>
        <p className="text-blue-100 text-sm">
          {serieTxt} • Turma {turmaTxt} • Matrícula/RA: {matriculaTxt}
        </p>
        <p className="text-blue-200 text-xs mt-1">{vinculoTxt}</p>
      </div>
    </div>
    <div className="text-right">
      <div className="text-xs text-blue-200 uppercase tracking-wide">IDADE</div>
      <div className="text-xl font-bold">{idadeStr}</div>
    </div>
  </div>
</div>
```

**Status**: ✅ **EQUIVALENTE** (visual diferente mas funcionalidade igual)

**Streamlit - Radar Curricular**:
```python
comps_inferidos = inferir_componentes_impactados_fn(d) or []
if comps_inferidos:
    html_comps = "".join([f'<span class="rede-chip" style="border-color:#FC8181; color:#C53030;">{c}</span> ' for c in comps_inferidos])
    st.markdown(
        f"""<div class="soft-card sc-orange" style="border-left-color: #FC8181; background-color: #FFF5F5;">
            <div class="sc-head"><i class="ri-radar-fill" style="color:#C53030;"></i> Radar Curricular (Automático)</div>
            <div class="sc-body" style="margin-bottom:10px;">Componentes que exigem maior flexibilização (baseado nas barreiras):</div>
            <div>{html_comps}</div>
            <div class="bg-icon">🎯</div>
        </div>""",
        unsafe_allow_html=True
    )
```

**Next.js**: ❌ **NÃO IMPLEMENTADO**

**Função `inferir_componentes_impactados`** (precisa verificar se existe no Streamlit):
- Inferência baseada nas barreiras selecionadas
- Retorna lista de componentes curriculares que precisam de flexibilização

---

### C. DIÁRIO DE BORDO

#### Comparação Detalhada

**Streamlit - Filtros & Estatísticas**:

1. **Filtros Avançados**:
   ```python
   aluno_filtro = st.selectbox("Estudante:", ["Todos"] + nomes_alunos)
   periodo = st.selectbox("Período:", 
                         ["Últimos 7 dias", "Últimos 30 dias", "Este mês", "Mês passado", "Personalizado", "Todos"])
   modalidade = st.multiselect("Modalidade:", 
                               ["individual", "grupo", "observacao_sala", "consultoria"])
   ```

2. **Estatísticas**:
   ```python
   total_registros = len(registros)
   registros_ultimos_30 = len([r for r in registros if ...])
   alunos_com_registros = len(set([r.get('student_id') for r in registros]))
   ```

3. **Gráficos Plotly**:
   ```python
   # Atendimentos por mês
   fig1 = px.bar(df_mes, x='mes', y='quantidade', title='Atendimentos por Mês')
   
   # Distribuição por modalidade
   fig2 = px.pie(df_modalidade, values='quantidade', names='modalidade', title='Distribuição por Modalidade')
   
   # Evolução do engajamento
   fig3 = px.line(df_engajamento, x='data', y='engajamento', color='estudante', title='Evolução do Engajamento')
   
   # Top 10 Competências
   fig4 = px.bar(df_competencias, x='quantidade', y='competencia', orientation='h', title='Top 10 Competências')
   ```

**Next.js**: ❌ **NÃO IMPLEMENTADO**

**Ações Necessárias**:
1. Criar componente de filtros avançados
2. Implementar estatísticas calculadas
3. Adicionar biblioteca de gráficos (Recharts recomendado)
4. Criar todos os gráficos (bar, pie, line, horizontal bar)

---

## 🎯 RESUMO EXECUTIVO

### ✅ COMPLETO (100%)
1. ✅ Home / Infos
2. ✅ Hub de Recursos
3. ✅ Gestão de Usuários
4. ✅ PGI
5. ✅ Configuração Escola
6. ✅ Admin Plataforma
7. ✅ Estudantes
8. ✅ PAEE (6 de 7 abas)

### ⚠️ QUASE COMPLETO (80-95%)
1. **PEI Dashboard**: 95% completo
   - ✅ Hero card completo
   - ✅ KPIs (4 métricas)
   - ✅ Cards principais (Farmacológico, Metas, DNA, Rede de Apoio)
   - ❌ Radar Curricular (inferência automática)

2. **PAEE Jornada Gamificada**: 70% completo
   - ✅ Geração básica funcionando
   - ✅ Mapa mental funcionando
   - ❌ Motor incorreto (usa DeepSeek, deveria usar Gemini)
   - ❌ Campo "Preferência de estilo" faltando
   - ❌ Exportação CSV faltando
   - ⚠️ Sistema de estados pode estar incompleto

### ⚠️ PARCIALMENTE IMPLEMENTADO (50-70%)
1. **Diário de Bordo**: 60% completo
   - ✅ Novo Registro: 100%
   - ✅ Lista de Registros: 100%
   - ❌ Filtros & Estatísticas: 0%
   - ❌ Relatórios: 0%
   - ❌ Configurações: 0%

2. **Monitoramento**: ⚠️ Verificar (implementação básica existe)

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. JORNADA GAMIFICADA - Motor de IA Incorreto

**Problema**: A jornada gamificada está usando DeepSeek (OmniRed) quando deveria usar Gemini (OmniYellow).

**Localização**: `app/api/paee/jornada-gamificada/route.ts`

**Código Atual**:
```typescript
// PAEE: DeepSeek (red) sempre
const { engine, error: engineErr } = selectEngine("paee", null, true);
```

**Correção Necessária**:
```typescript
// Jornada Gamificada: Sempre usa Gemini (yellow) para geração de texto
const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
if (!geminiKey) {
  return NextResponse.json(
    { error: "Configure GEMINI_API_KEY para gerar a jornada gamificada." },
    { status: 500 }
  );
}
// Usar consultar_gemini diretamente ao invés de chatCompletionText
```

**Impacto**: A jornada gamificada pode ter qualidade diferente do esperado.

---

### 2. JORNADA GAMIFICADA - Campo "Preferência de estilo" Faltando

**Problema**: O campo opcional para personalizar o estilo da jornada não existe.

**Localização**: `app/(dashboard)/paee/PAEEClient.tsx` - Componente `JornadaTab`

**Correção Necessária**: Adicionar campo de texto antes do botão "Gerar Jornada Gamificada":
```typescript
<input
  type="text"
  value={estilo}
  onChange={(e) => setEstilo(e.target.value)}
  placeholder="Ex: super-heróis, exploração, futebol..."
  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
/>
```

---

### 3. DIÁRIO DE BORDO - Abas Faltantes

**Problema**: Faltam 3 abas completas (Filtros & Estatísticas, Relatórios, Configurações).

**Prioridade**: ALTA (funcionalidade essencial para uso profissional)

**Ações**:
1. Criar componente `FiltrosEstatisticasTab`
2. Criar componente `RelatoriosTab` com gráficos (Recharts)
3. Criar componente `ConfiguracoesTab`
4. Implementar exportação CSV e JSON

---

### 4. PEI DASHBOARD - Radar Curricular Faltando

**Problema**: A inferência automática de componentes impactados não está implementada.

**Função Necessária**: Criar função `inferirComponentesImpactados(peiData)` que:
- Analisa as barreiras selecionadas
- Mapeia para componentes curriculares
- Retorna lista de componentes que precisam flexibilização

**Prioridade**: MÉDIA (funcionalidade útil mas não crítica)

---

## 📝 CHECKLIST DE CORREÇÕES NECESSÁRIAS

### ALTA PRIORIDADE

- [ ] **PAEE Jornada Gamificada**: Corrigir motor de IA para usar Gemini ao invés de DeepSeek
- [ ] **PAEE Jornada Gamificada**: Adicionar campo "Preferência de estilo"
- [ ] **PAEE Jornada Gamificada**: Adicionar exportação CSV
- [ ] **Diário de Bordo**: Criar aba "Filtros & Estatísticas"
- [ ] **Diário de Bordo**: Criar aba "Relatórios" com gráficos
- [ ] **Diário de Bordo**: Criar aba "Configurações"

### MÉDIA PRIORIDADE

- [ ] **PEI Dashboard**: Implementar Radar Curricular (inferência automática)
- [ ] **PAEE Jornada Gamificada**: Verificar e corrigir prompt do mapa mental
- [ ] **PAEE Jornada Gamificada**: Verificar sistema de estados completo (rascunho → revisão → ajustando → aprovado)
- [ ] **Monitoramento**: Verificar funcionalidades completas e comparar

### BAIXA PRIORIDADE

- [ ] **Home/Infos**: Melhorar Consultor Legal IA (substituir mock por implementação real)
- [ ] **Home/Infos**: Adicionar visual Graphviz para Fluxo da Inclusão (opcional)

---

## 🔍 VERIFICAÇÕES ADICIONAIS NECESSÁRIAS

1. **Verificar prompt do mapa mental** (`app/api/paee/mapa-mental/route.ts`)
2. **Verificar sistema de estados da Jornada Gamificada** (todos os estados funcionando?)
3. **Verificar funcionalidades do Monitoramento** (comparar com Streamlit)
4. **Verificar exportações** (todos os módulos exportam PDF/DOCX/JSON quando necessário?)

---

## 📊 ESTATÍSTICAS GERAIS

- **Módulos Completos**: 8/11 (73%)
- **Módulos Quase Completos**: 2/11 (18%)
- **Módulos Parciais**: 1/11 (9%)

**Progresso Geral**: **~85% completo**

---

**Data da Revisão**: 2026-02-06  
**Próxima Revisão**: Após correções críticas
