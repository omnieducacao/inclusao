# DOCUMENTO TÉCNICO: SISTEMA OMNISFERA — PLATAFORMA DE EDUCAÇÃO INCLUSIVA COM INTELIGÊNCIA ARTIFICIAL

## 1. VISÃO GERAL E ARQUITETURA DO SISTEMA

O Omnisfera é uma plataforma SaaS multi-tenant para educação inclusiva que auxilia professores AEE (Atendimento Educacional Especializado), coordenadores pedagógicos e escolas a construir, acompanhar e documentar planos educacionais individualizados com apoio de inteligência artificial generativa.

A arquitetura é monolítica full-stack baseada em Next.js 16 (App Router), servindo frontend e backend na mesma aplicação. O frontend utiliza React 19 com Server Components por padrão e Client Components quando necessário (interatividade, estado local). O backend opera via API Routes do Next.js, onde cada rota é um handler independente que processa requisições HTTP.

A camada de persistência é centralizada no Supabase (PostgreSQL gerenciado na nuvem), com dados estruturados em tabelas relacionais e campos JSONB para estruturas flexíveis (PEI, PAEE, Diário de Bordo). Autenticação é feita via JWT customizado usando a biblioteca `jose`, com sessão armazenada em cookie HTTP-only e hash de senha com `bcryptjs`.

A inteligência artificial opera com 5 engines distintos mapeados por codinomes Omni, cada um conectado a um provedor diferente via SDK ou API REST. Todas as chamadas IA passam por uma função central (`chatCompletionText`) que gerencia roteamento, tracking de uso e fallback de chaves.

### Stack Tecnológica Completa

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| Linguagem | TypeScript | 5.x |
| Frontend | React | 19.2.3 |
| Estilização | Tailwind CSS 4 via CSS Variables | 4.x |
| Banco de Dados | Supabase PostgreSQL (cloud) | - |
| Autenticação | JWT customizado (jose + bcryptjs) | - |
| IA — DeepSeek | Via OpenAI SDK compatível | Engine "red" (OmniRed) |
| IA — Gemini | @google/generative-ai | Engine "yellow" (OmniYellow) |
| IA — Claude | @anthropic-ai/sdk | Engine "green" (OmniGreen) |
| IA — Kimi/Moonshot | Via OpenRouter | Engine "blue" (OmniBlue) |
| IA — GPT-4o | OpenAI nativo | Engine "orange" (OmniOrange) |
| Validação | Zod | 4.x |
| Testes | Vitest | 4.0.18 |
| PDF | jsPDF, pdf-parse | - |
| DOCX | docx (criação) | 9.5.1 |
| Monitoramento de Erros | Sentry | 10.x |
| Rate Limiting | Implementação customizada in-memory | - |
| Dark Mode | ThemeProvider customizado com CSS Variables | - |

### Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐  │
│  │  PEI   │ │  PAEE  │ │  Hub   │ │ Diário │ │ Monitor. │  │
│  │ 4538L  │ │ 2911L  │ │ 3669L  │ │ 1338L  │ │  479L    │  │
│  └────┬───┘ └───┬────┘ └───┬────┘ └───┬────┘ └────┬─────┘  │
│       │         │          │          │            │         │
│  ┌────┴─────────┴──────────┴──────────┴────────────┴─────┐  │
│  │           API Routes (Next.js App Router)              │  │
│  │  /api/pei  /api/paee  /api/hub  /api/students          │  │
│  │  /api/bncc  /api/admin  /api/auth  /api/notifications  │  │
│  │  /api/monitoring  /api/school  /api/members  (~50 rotas)│  │
│  └─────────────────────────┬──────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────┴────────┐ ┌────────┴────────┐ ┌────────┴────────┐
│    Supabase     │ │   5 Engines IA  │ │    Serviços     │
│   PostgreSQL    │ │   OmniRed       │ │   Unsplash      │
│   (banco)       │ │   OmniBlue      │ │   Sentry        │
│   RLS + JSONB   │ │   OmniGreen     │ │                 │
│   Multi-tenant  │ │   OmniYellow    │ │                 │
│                 │ │   OmniOrange    │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Números do Projeto

| Métrica | Valor |
|---------|-------|
| Arquivos de código (TS/TSX) | 183 |
| Linhas de código | ~25.000 |
| Módulos (páginas) | 11 |
| Rotas de API | ~50 |
| Componentes reutilizáveis | 31 |
| Bibliotecas/utilitários | 34 |
| Testes automatizados | 88 testes em 9 suítes |
| Status dos testes | 100% passando |

---

## 2. MODELAGEM DE DADOS DETALHADA

### 2.1 Tabelas Relacionais (Supabase PostgreSQL)

A base de dados segue o modelo multi-tenant onde cada escola é um `workspace` com isolamento lógico de dados via colunas de vínculo.

**Tabela `students`**: Centraliza dados do estudante. O campo `pei_data` (JSONB) armazena todo o PEI como documento flexível. Os campos `paee_ciclos` (JSONB array) armazenam ciclos de atendimento PAEE. O campo `daily_logs` (JSONB array) armazena registros do Diário de Bordo. Campos escalares incluem `name`, `grade`, `class_group`, `diagnosis`, `workspace_id`, e campos de controle PAEE como `planejamento_ativo`, `status_planejamento`, `data_inicio_ciclo`, `data_fim_ciclo`.

**Tabela `workspaces`**: Escolas/organizações. Contém `name`, `pin` (código de acesso), `escola_nome`, `enabled_modules` (array de strings controlando quais módulos estão habilitados), `enabled_engines` (array de engines IA permitidos), `active_since`, `terms_accepted`, `academic_years`.

**Tabela `workspace_members`**: Membros de cada workspace com permissões RBAC granulares por módulo: `can_pei`, `can_paee`, `can_hub`, `can_diario`, `can_monitoramento`, `can_pgi`, `can_gestao`, `can_config`, `can_estudantes`, `can_infos`. Também armazena `role` (master ou member), `vinculo_tipo` (todos, turma, tutor) e referência ao usuário.

**Tabela `teacher_assignments`**: Vincula professor a turma(s) e disciplina(s). Usado para filtrar estudantes visíveis para professores com vínculo tipo "turma".

**Tabela `teacher_student_links`**: Vincula professor diretamente a estudantes específicos. Usado para vínculo tipo "tutor" onde o professor vê apenas alunos atribuídos, possibilitando restrição granular de visibilidade.

**Tabela `usage_events`**: Registra eventos de uso (login, page_view, etc.) com timestamp, tipo de evento e metadados.

**Tabela `ia_usage`**: Tracking de chamadas IA com engine usado, tokens consumidos, workspace de origem e fonte da chamada (pei, hub, paee...).

**Tabela `workspace_grades`**: Séries configuradas por workspace.

**Tabela `classes`**: Turmas vinculadas a séries e anos letivos.

### 2.2 Estrutura do PEI (JSONB `pei_data`)

O PEI opera como documento JSONB flexível no campo `pei_data` da tabela `students`. Contém mais de 48 campos tipados (definidos no type `PEIData` do TypeScript), organizados em seções conceituais:

**Identificação e Contexto Pessoal**: `nome`, `nasc` (data de nascimento), `serie` (com detecção automática de segmento: EI, EFI, EFII, EM), `turma`, `matricula`, `diagnostico` (texto livre), `lista_medicamentos` (array de objetos com `nome`, `posologia` e `escola`), `composicao_familiar_tags` (array de tags: Mãe, Pai, Avós, Irmãos, etc.), `historico` (histórico de desenvolvimento), `familia` (contexto familiar).

**Potencialidades e Interesses**: `hiperfoco` (interesse intenso do estudante), `potencias` (array selecionado dentre 13 opções: Memória Visual, Musicalidade/Ritmo, Interesse em Tecnologia, Hiperfoco Construtivo, Liderança Natural, Habilidades Cinestésicas, Expressão Artística, Cálculo Mental Rápido, Oralidade/Vocabulário, Criatividade/Imaginação, Empatia/Cuidado com o outro, Resolução de Problemas, Curiosidade Investigativa).

**Profissionais de Apoio**: `rede_apoio` (array selecionado dentre 12 tipos de profissional: Psicólogo Clínico, Neuropsicólogo, Fonoaudiólogo, Terapeuta Ocupacional, Neuropediatra, Psiquiatra Infantil, Psicopedagogo Clínico, Professor de Apoio/Mediador, Acompanhante Terapêutico, Musicoterapeuta, Equoterapeuta, Oftalmologista). O campo `orientacoes_por_profissional` armazena orientações transcritas por IA para cada profissional da rede de apoio.

**Checklist de Evidências**: `checklist_evidencias` (Record booleano verificando 12 sinais de alerta agrupados em: Pedagógico — estagnação, lacunas, dificuldade de generalização/abstração; Cognitivo — oscilação de foco, fadiga mental, dificuldade de iniciar tarefas, esquecimento; Comportamental — dependência de mediação, baixa tolerância à frustração, desorganização, recusa de tarefas).

**Nível de Alfabetização**: `nivel_alfabetizacao` classificado pela escala de Emília Ferreiro com 8 níveis: Não se aplica (EI), Pré-Silábico (Garatuja), Pré-Silábico (Letras aleatórias), Silábico (Sem valor sonoro), Silábico (Com valor sonoro), Silábico-Alfabético, Alfabético, Ortográfico.

**Mapeamento de Barreiras**: `barreiras_selecionadas` (Record por domínio com checkboxes específicos em 5 áreas):
- Funções Cognitivas (6 itens): Atenção Sustentada/Focada, Memória de Trabalho, Flexibilidade Mental, Planejamento e Organização, Velocidade de Processamento, Abstração e Generalização
- Comunicação e Linguagem (5 itens): Linguagem Expressiva, Receptiva, Pragmática, Processamento Auditivo, Intenção Comunicativa
- Socioemocional (5 itens): Regulação Emocional, Tolerância à Frustração, Interação Social, Autoestima, Reconhecimento de Emoções
- Sensorial e Motor (5 itens): Praxias Globais, Praxias Finas, Hipersensibilidade, Hipossensibilidade, Planejamento Motor
- Acadêmico (5 itens): Decodificação Leitora, Compreensão Textual, Raciocínio Lógico-Matemático, Grafomotricidade, Produção Textual

**Níveis de Suporte por Domínio**: `niveis_suporte` (Record string x string) com 4 níveis: Autônomo, Monitorado, Substancial, Muito Substancial. Um nível para cada domínio de barreira. O campo `observacoes_barreiras` armazena observações textuais por domínio.

**Estratégias Pedagógicas**: Definidas em 3 dimensões:
- `estrategias_acesso` (8 opções): Tempo Estendido, Apoio Leitura/Escrita, Material Ampliado, Tecnologia Assistiva, Sala Silenciosa, Mobiliário Adaptado, Pistas Visuais, Rotina Estruturada
- `estrategias_ensino` (8 opções): Fragmentação de Tarefas, Instrução Explícita, Modelagem, Mapas Mentais, Andaimagem (Scaffolding), Ensino Híbrido, Organizadores Gráficos, Prática Guiada
- `estrategias_avaliacao` (8 opções): Prova Adaptada, Prova Oral, Consulta Permitida, Portfólio, Autoavaliação, Parecer Descritivo, Questões Menores por Bloco, Avaliação Prática (Demonstração)
- Campos adicionais `outros_acesso` e `outros_ensino` para estratégias personalizadas

**BNCC (Base Nacional Comum Curricular)**: `habilidades_bncc_selecionadas` (array de objetos com código da habilidade BNCC e descrição), `habilidades_bncc_validadas`, `bncc_ei_idade`, `bncc_ei_campo`, `bncc_ei_objetivos` (específicos para Educação Infantil).

**Consultoria IA**: `ia_sugestao` (texto completo do relatório PEI gerado pela IA), `consultoria_engine` (engine utilizado), `ia_mapa_texto` (mapa mental textual gerado pela IA).

**Monitoramento**: `monitoramento_data` (data da última avaliação), `status_meta` (5 valores: Não Iniciado, Em Andamento, Parcialmente Atingido, Atingido, Superado), `parecer_geral` (5 valores: Manter Estratégias, Aumentar Suporte, Reduzir Suporte/Autonomia, Alterar Metodologia, Encaminhar para Especialista), `proximos_passos_select` (array: Reunião com Família, Encaminhamento Clínico, Adaptação de Material, etc.).

**Validação e Gamificação**: `status_validacao_pei`, `feedback_ajuste`, `status_validacao_game`, `feedback_ajuste_game` para controle de revisão e jornada gamificada.

### 2.3 Estrutura do PAEE (JSONB `paee_ciclos`)

O PAEE armazena ciclos de atendimento como array JSONB onde cada ciclo contém:
- `ciclo_id` (UUID), `status` (rascunho, ativo, concluído, arquivado), `tipo` (planejamento_aee ou execucao_smart)
- `config_ciclo`: contém `duracao_semanas`, `frequencia`, `foco_principal`, `descricao`, `data_inicio`, `data_fim`, `metas_selecionadas` (array de metas PEI vinculadas)
- `recursos_incorporados`: objeto com recursos de tecnologia assistiva vinculados
- `cronograma`: array de semanas com atividades planejadas
- `versao`: controle de versão incremental
- `criado_em`, `atualizado_em`: timestamps

Além dos ciclos, o campo `paee_data` (separado) armazena dados das 4 abas temáticas: `conteudo_diagnostico_barreiras` (resultado do Mapeamento de Barreiras IA), `conteudo_plano_habilidades` (Plano de Intervenção com metas SMART), `conteudo_tecnologia_assistiva` (sugestões IA de recursos assistivos), `conteudo_documento_articulacao` (documento AEE ↔ Sala Regular).

### 2.4 Estrutura do Diário de Bordo (JSONB `daily_logs`)

Cada registro do Diário contém 17 campos:
- `registro_id` (UUID), `student_id`, `data_sessao`, `duracao_minutos`
- `modalidade_atendimento` (individual, grupo, observacao_sala, consultoria)
- `atividade_principal`, `objetivos_trabalhados`, `estrategias_utilizadas`, `recursos_materiais`
- `engajamento_aluno` (escala 1-5), `nivel_dificuldade` (muito_facil a muito_dificil)
- `competencias_trabalhadas` (array dentre 10 competências: atenção, memória, raciocínio, linguagem, socialização, autonomia, motricidade, percepção, organização, regulação emocional)
- `pontos_positivos`, `dificuldades_identificadas`, `observacoes`, `proximos_passos`, `encaminhamentos`
- `criado_em`, `atualizado_em`

### 2.5 Sistema de Vínculos e Visibilidade (Scoping Hierárquico)

O sistema implementa visibilidade hierárquica de estudantes baseada no tipo de vínculo do professor:
- **Vínculo "todos"**: Professor vê todos os estudantes do workspace
- **Vínculo "turma"**: Professor vê apenas estudantes das turmas/disciplinas atribuídas via `teacher_assignments`
- **Vínculo "tutor"**: Professor vê apenas estudantes diretamente vinculados via `teacher_student_links`

Esta lógica é centralizada no hook `useFilteredStudents` e aplicada em todos os módulos que exibem estudantes (PEI, PAEE, Diário, Monitoramento, Estudantes).

---

## 3. SISTEMA DE INTELIGÊNCIA ARTIFICIAL

### 3.1 Arquitetura Multi-Engine

O Omnisfera opera com 5 engines de IA diferentes, cada um com especialização e relação custo-benefício distinta:

| Engine | Codinome | Provedor | SDK | Uso Principal | Custo Relativo |
|--------|----------|----------|-----|---------------|----------------|
| `red` | OmniRed | DeepSeek (deepseek-chat) | OpenAI SDK compatível | PEI, PAEE, Hub, BNCC — engine padrão | Baixo |
| `blue` | OmniBlue | Kimi/Moonshot (moonshot-v1-auto) | Via OpenRouter API | Alternativa PEI/Hub | Baixo |
| `green` | OmniGreen | Claude 3.5 Sonnet (Anthropic) | @anthropic-ai/sdk | PEI/Hub premium | Alto |
| `yellow` | OmniYellow | Gemini 2.0 Flash (Google) | @google/generative-ai | OCR, visão de imagens, mapas mentais | Médio |
| `orange` | OmniOrange | GPT-4o (OpenAI) | OpenAI SDK | Extração de laudos médicos, fallback visão | Médio |

**Função central**: `chatCompletionText(engine, messages, options)` em `lib/ai-engines.ts` gerencia toda a comunicação com engines de texto. A função seleciona o SDK, constrói a chamada API, aplica temperatura e retorna o texto gerado. Opcionalmente registra uso em `ia_usage` para tracking.

**Função de visão**: `visionAdapt(prompt, imageBase64, mime)` processa imagens usando Gemini 2.0 Flash (preferido) ou GPT-4o (fallback). Usada para OCR de laudos médicos e adaptação de atividades em imagem.

### 3.2 Aplicações da IA por Módulo

**PEI — Consultoria IA**: O professor preenche o formulário PEI (diagnóstico, barreiras, potencialidades, estratégias, BNCC) e solicita um relatório completo. O sistema monta um prompt rico incluindo TODOS os dados preenchidos e envia ao engine selecionado (red, blue ou green). A IA retorna um relatório pedagógico completo com análise do perfil, recomendações de intervenção, sugestões de adaptações curriculares e metas de desenvolvimento. Este relatório é salvo em `ia_sugestao` e pode ser exportado junto com o PEI.

**PEI — Extração de Laudo**: Upload de imagem ou PDF do laudo médico. A IA (OmniYellow/Gemini ou OmniOrange/GPT-4o) extrai texto via OCR e preenche automaticamente os campos do PEI (diagnóstico, medicamentos, orientações profissionais).

**PEI — Transcrição por Profissional**: Cada profissional da rede de apoio pode ter suas orientações transcritas separadamente pela IA, organizando as informações do laudo por especialidade.

**PEI — Sugestão de Habilidades BNCC**: A IA analisa o perfil do estudante (diagnóstico, barreiras, nível de ensino) e sugere habilidades BNCC prioritárias com justificativa pedagógica. O sistema carrega habilidades BNCC de arquivos CSV (`data/bncc_*.csv`) e apresenta as sugestões para o professor validar.

**PEI — Mapa Mental**: Gera mapa mental textual do caso do estudante, sintetizando todas as informações do PEI em formato visual hierárquico.

**PAEE — Mapeamento de Barreiras**: IA gera diagnóstico detalhado de barreiras para aprendizagem com base no perfil PEI.

**PAEE — Plano de Habilidades**: IA gera plano de intervenção com 3 metas SMART (curto, médio e longo prazo) incluindo estratégias, materiais e critérios de avaliação.

**PAEE — Tecnologia Assistiva**: IA sugere recursos de tecnologia assistiva contextualizados ao diagnóstico e barreiras do estudante.

**PAEE — Documento de Articulação**: IA gera documento formal de articulação entre AEE e sala regular.

**PAEE — Jornada Gamificada**: IA gera missão gamificada para o estudante e família com fases, conquistas e recompensas baseadas nos objetivos do ciclo ativo.

**Hub — 12 Ferramentas IA**: Suíte completa de geração de materiais inclusivos:
1. Adaptar Atividade — OCR de fotos/scans + adaptação pedagógica por IA
2. Adaptar Prova — Upload de DOCX + adaptação inclusiva
3. Criar do Zero — Atividade alinhada à BNCC
4. Estúdio Visual — Flashcards, CAA (Comunicação Alternativa), rotinas visuais, ilustrações
5. Sugerir Recursos — Materiais pedagógicos
6. Roteiro de Aula — Plano de aula inclusivo
7. Papo Mestre — Consultor pedagógico IA
8. Dinâmicas em Grupo — Estratégias de socialização coletiva
9. Plano de Aula — Formalizado
10. Criar Experiência EI — Experiências pedagógicas para Educação Infantil baseadas na BNCC
11. Roteiro Individual — Roteiro personalizado por estudante
12. Relatório de Ciclo PAEE — Relatório cruzando PAEE com Diário de Bordo

**Monitoramento — Sugestão de Rubricas**: IA analisa entradas do Diário e auto-sugere pontuações nas rubricas de desenvolvimento.

**PGI — Geração de Ações**: IA gera ações de gestão inclusiva em framework 5W2H.

### 3.3 Prompts Pedagógicos

Os prompts estão centralizados em `lib/hub-prompts.ts` (~30KB, o maior arquivo de prompts) e nos routes de API específicos. Cada prompt é um template que recebe dados do estudante (diagnóstico, barreiras, potencialidades, série, BNCC) e instrui a IA a gerar conteúdo pedagogicamente fundamentado. Os prompts incluem instruções explícitas sobre legislação brasileira (Lei de Inclusão, BNCC, Nota Técnica MEC) e nomenclatura pedagógica correta.

---

## 4. MÓDULOS FUNCIONAIS (11 PÁGINAS)

### 4.1 PEI — Plano Educacional Individualizado (`/pei`)
O coração da plataforma. 4.538 linhas, 10 abas:
- **Início**: Seletor de estudante, visão geral, progresso
- **Estudante**: Dados pessoais, diagnóstico, medicamentos, família, hiperfoco
- **Evidências**: Checklist de sinais de alerta (pedagógico, cognitivo, comportamental), nível de alfabetização (Emília Ferreiro)
- **Rede de Apoio**: Profissionais envolvidos com transcrição de laudo por profissional via IA
- **Mapeamento**: Barreiras por domínio com níveis de suporte e observações
- **Plano de Ação**: Estratégias de acesso, ensino e avaliação (8 opções cada)
- **Monitoramento**: Status da meta, parecer geral, próximos passos
- **BNCC**: Seleção e sugestão IA de habilidades BNCC por segmento (EI, EFAI, EFAF, EM)
- **Consultoria IA**: Geração de relatório completo com escolha de engine
- **Dashboard**: Barra de progresso por seção, mapa mental IA, exportação PDF/DOCX, versionamento

### 4.2 PAEE — Plano de Atendimento Especializado (`/paee`)
2.911 linhas, 7 abas:
- Mapear Barreiras (IA), Plano de Habilidades (IA com metas SMART), Tec. Assistiva (IA), Articulação AEE↔Sala Regular (IA)
- Planejamento AEE: Ciclos de referência com cronograma em fases
- Execução e Metas SMART: Ciclos operacionais por semana com registro de cumprimento
- Jornada Gamificada: Missão gamificada gerada por IA

### 4.3 Hub de Recursos (`/hub`)
3.669 linhas, 12 ferramentas IA. Grid de cards animados (Lottie) agrupados por tipo. Cada ferramenta tem formulário de entrada + resultado IA renderizado em Markdown.

### 4.4 Diário de Bordo (`/diario`)
1.338 linhas, 5 abas: Filtros & Estatísticas (gráficos Recharts), Novo Registro (formulário 17 campos), Lista de Registros (cards expansíveis + timeline visual), Relatórios (gráficos de evolução: barras por mês, pizza por modalidade, linha de engajamento, competências), Configurações. Exportação CSV completa.

### 4.5 Monitoramento & Evolução (`/monitoramento`)
479 linhas. Dashboard individual com visão 360° (PEI + PAEE + Diário). Rubricas de desenvolvimento em 4 dimensões: autonomia, social, conteúdo, comportamento. Sugestão IA de rubricas baseada no Diário. Tracking de uso de IA por engine.

### 4.6 Central de Inteligência (`/infos`)
747 linhas, 6 abas de referência pedagógica: Panorama (visão geral do AEE), Legislação (LBI, BNCC, decretos), Glossário (termos técnicos), Dicionário de Linguagem, Biblioteca (referências), Manual (guia do sistema).

### 4.7 PGI — Plano de Gestão Inclusiva (`/pgi`)
641 linhas. Framework 5W2H para gestão escolar da inclusão. Pilares: infraestrutura, formação, recursos, dimensionamento de equipe. Geração IA de ações e cálculo de dimensionamento.

### 4.8 Estudantes (`/estudantes`)
623 linhas. Lista centralizada com cards expansíveis mostrando diagnóstico, série, turma. Badges visuais (PEI ativo, PAEE configurado). Ações rápidas para PEI e PAEE. Edição inline de dados.

### 4.9 Gestão de Usuários (`/gestao`)
CRUD de membros do workspace. RBAC com permissões individuais por módulo. Sistema de vínculos: "todos" (vê todo aluno), "turma" (vê alunos das turmas atribuídas), "tutor" (vê apenas alunos vinculados). Convite por email.

### 4.10 Configuração de Escola (`/config-escola`)
Nome, PIN de acesso, módulos ativos/inativos, engines IA habilitados, séries cadastradas, turmas e anos letivos.

### 4.11 Admin da Plataforma (`/admin`)
Painel para administrador global. Gestão de workspaces (escolas) com criação/edição. Tracking de uso global por escola. Configuração de termos de uso. Controle de bugs reportados.

---

## 5. WORKFLOWS E FLUXOS IMPLEMENTADOS

### 5.1 Fluxo de Criação de PEI
1. Professor acessa `/pei` e seleciona estudante (ou cria novo em `/estudantes`)
2. Preenche abas sequenciais (dados pessoais → evidências → rede de apoio → barreiras → estratégias)
3. Opcionalmente: faz upload de laudo médico → IA extrai e preenche campos automaticamente
4. Na aba BNCC: seleciona habilidades manualmente ou solicita sugestão IA
5. Na aba Consultoria IA: escolhe engine (red/blue/green) e gera relatório completo
6. Na aba Dashboard: visualiza progresso, gera mapa mental, exporta PDF/DOCX
7. Pode salvar versão (PEIVersionHistory) para registro temporal

### 5.2 Fluxo de Ciclos PAEE
1. Preenche abas temáticas (Barreiras, Plano de Habilidades, Tec. Assistiva, Articulação) — cada uma gera conteúdo por IA
2. Cria ciclo de Planejamento AEE: define duração (semanas), frequência, foco principal, seleciona metas do PEI
3. Sistema gera cronograma automático distribuindo metas nas semanas
4. Define como ciclo ativo → disponível para Execução e Metas SMART
5. Na aba Execução: cria ciclo operacional com metas SMART desdobradas por semana
6. Na aba Jornada Gamificada: IA gera missão gamificada vinculada ao ciclo ativo

### 5.3 Fluxo do Diário de Bordo
1. Seleciona estudante → vê painel resumo do PEI
2. Cria novo registro preenchendo 17 campos (data, duração, modalidade, atividade, objetivos, estratégias, engajamento, competências, observações)
3. Visualiza registros em lista expansível ou timeline visual colorida por modalidade
4. Acessa relatórios com gráficos de evolução (registros por mês, modalidades, engajamento ao longo do tempo, competências trabalhadas)
5. Exporta dados em CSV

### 5.4 Fluxo de Notificações Inteligentes
1. `NotificationBell` na navbar faz polling periódico para `/api/notifications`
2. API verifica: PEIs sem atualização recente, Diários com poucos registros
3. Gera alertas com nível de urgência diferenciado
4. Professor vê badge numérico na navbar com alertas pendentes

### 5.5 Fluxo Cross-Module (PAEE ↔ Diário)
1. Na aba Jornada do PAEE, o botão "Relatório de Ciclo" chama `/api/paee/relatorio-ciclo`
2. API cruza objetivos do ciclo PAEE ativo com entradas do Diário de Bordo
3. IA gera relatório correlacionando planejamento vs execução real

---

## 6. SEGURANÇA, AUTENTICAÇÃO E PERMISSÕES

### 6.1 Autenticação
Autenticação JWT customizada (não usa Supabase Auth). Login via email/senha com hash `bcryptjs`. Sessão armazenada em cookie HTTP-only com expiração configurável. Middleware Next.js (`middleware.ts`) intercepta todas as rotas e redireciona para `/login` se não autenticado. Tokens JWT assinados com `jose` usando secret configurável (`SESSION_SECRET`).

### 6.2 RBAC (Role-Based Access Control)
Três roles: `master` (dono do workspace, acesso total), `member` (acesso baseado em permissões), `platform_admin` (administrador global da plataforma).

Permissões por módulo: cada `workspace_member` tem flags booleanas (`can_pei`, `can_paee`, `can_hub`, etc.) controlando acesso a cada módulo.

### 6.3 Visibilidade de Estudantes
Sistema hierárquico de vínculos controlando quais estudantes o professor pode ver:
- `vinculo_tipo = "todos"`: Acesso a todos os estudantes do workspace
- `vinculo_tipo = "turma"`: Apenas estudantes das turmas/disciplinas atribuídas
- `vinculo_tipo = "tutor"`: Apenas estudantes diretamente vinculados

Lógica centralizada no hook `useFilteredStudents` e verificada server-side nas API routes.

### 6.4 Proteções das APIs
- **Validação** Zod em todas as ~50 rotas de API (schemas centralizados em `lib/validation.ts`)
- **Rate limiting** por IP com janela de tempo configurável por rota
- **Sanitização XSS** com `isomorphic-dompurify` em todas as entradas de texto
- **`requireAuth()`** obrigatório em toda rota protegida
- **Verificação de workspace** para garantir que o usuário pertence ao workspace alvo

---

## 7. INTERFACE DO USUÁRIO E EXPERIÊNCIA

### 7.1 Design System
Tipografia: Plus Jakarta Sans como fonte principal. Esquema de cores vibrante por módulo (cada módulo tem uma cor temática distinta). CSS Variables para dark/light mode com override total de todas as cores em `globals.css`. Componentes premium com gradientes sutis, sombras suaves e bordas translúcidas.

### 7.2 Componentes Compartilhados (31)
- **Navbar**: Barra superior com navegação por módulos, logo responsiva (light/dark), `NotificationBell`, `ThemeToggle`, `GlobalSearch`
- **PageHero**: Cabeçalho visual de cada módulo com ícone, título e subtítulo
- **StudentSelector**: Dropdown de seleção de estudante (filtrado por vínculo) presente em PEI, PAEE, Diário e Monitoramento
- **PEISummaryPanel**: Painel retrátil mostrando resumo do PEI do estudante selecionado (presente no PAEE, Diário e Monitoramento)
- **FormattedTextDisplay**: Renderizador de Markdown para saídas da IA
- **GuidedTour**: Tour guiado para novos usuários com tooltips interativos
- **ModuleCardsLottie**: Cards animados com ícones Lottie para navegação entre módulos
- **PEIVersionHistory**: Histórico de versões do PEI com snapshots
- **PeiExportPdfButton**: Botão de exportação PDF do PEI completo
- **AILoadingWrapper**: Indicador visual de loading durante chamadas IA
- **ThemeProvider / ThemeToggle**: Dark mode automático (detecção do sistema) com toggle manual

### 7.3 Dark Mode
Dark mode completo implementado via CSS Variables (`--bg-primary`, `--bg-secondary`, `--text-primary`, `--surface-1`, `--surface-2`). Override de todas as cores Tailwind (bg-white, bg-slate-*, gradientes, borders) via seletores CSS no `globals.css`. Toggle sun/moon na navbar com persistência em localStorage.

### 7.4 Navegação
Navbar horizontal fixa com links para todos os módulos. Em cada módulo, tabs horizontais para sub-seções. `StudentSelector` consistente no topo de módulos centrados no estudante.

---

## 8. RELATÓRIOS E EXPORTAÇÕES

### 8.1 Exportação PDF do PEI
Gera documento PDF oficial com todos os dados do PEI preenchidos automaticamente, incluindo:
- Dados de identificação do estudante
- Quadro de barreiras com níveis de suporte
- Estratégias pedagógicas selecionadas
- Habilidades BNCC vinculadas
- Relatório completo da IA (se gerado)
- Monitoramento e parecer

### 8.2 Exportação DOCX do PEI
Gera documento Word editável com a mesma estrutura do PDF.

### 8.3 Exportação CSV do Diário
Exporta todos os registros do Diário de Bordo em formato CSV com cabeçalhos em português.

### 8.4 Gráficos e Visualizações (Recharts)
O Diário de Bordo inclui 4 tipos de gráfico:
- Barras: registros por mês
- Pizza: distribuição por modalidade de atendimento
- Linha: engajamento do estudante ao longo do tempo
- Barras horizontais: competências trabalhadas (top 10)

### 8.5 Relatório de Ciclo PAEE
API `/api/paee/relatorio-ciclo` cruza dados do PAEE com Diário de Bordo e gera relatório de evolução por IA.

---

## 9. INTEGRAÇÕES E SERVIÇOS EXTERNOS

### 9.1 Provedores de IA (5)
- DeepSeek: Via OpenAI-compatible SDK (base URL customizada)
- Kimi/Moonshot: Via OpenRouter API
- Claude: @anthropic-ai/sdk nativo
- Gemini: @google/generative-ai nativo (texto + visão)
- OpenAI/GPT-4o: SDK nativo (texto + visão fallback)

### 9.2 Unsplash
Integração para busca de imagens educativas (usado no Estúdio Visual do Hub).

### 9.3 Sentry
Monitoramento de erros em produção com tracking automático de exceções e performance.

### 9.4 BNCC (dados offline)
Habilidades BNCC carregadas de arquivos CSV locais (`data/bncc_*.csv`) processados pelo parser `lib/bncc.ts`. Não depende de API externa para BNCC.

---

## 10. TESTES E QUALIDADE

### 10.1 Testes Automatizados
88 testes em 9 suítes (Vitest), 100% passando:
- **Unitários (6 suítes)**: Prompts do Hub (11), utilitários do Hub (21), datas (6), rate limiting (13), permissões (6), validação Zod (15)
- **Integração (3 suítes)**: Health check API (6), criação de atividade (5), fluxo de login (5)

### 10.2 Validação em Runtime
Toda API route usa schemas Zod (`lib/validation.ts`) para validar payloads de entrada antes de processar. Schemas documentam formato esperado de dados.

### 10.3 Rate Limiting
Implementação in-memory configurável por rota com janela de tempo e limite de requisições.

---

## 11. DEPLOYMENT E INFRAESTRUTURA

### 11.1 Hospedagem
Deploy em Render.com com build automático via Git push.

### 11.2 Multi-Tenant
Cada escola é um workspace isolado logicamente. Dados segregados por `workspace_id` em todas as tabelas. Configurações (módulos, engines, séries, turmas) são por workspace.

### 11.3 Variáveis de Ambiente
Todas as credenciais e chaves API armazenadas em variáveis de ambiente (`.env.local`). Documentadas em `.env.local.example` com 12 variáveis.

---

## 12. DIFERENCIAIS COMPETITIVOS DO OMNISFERA

1. **Multi-Engine IA**: 5 engines distintos permitem escolher a melhor relação custo-qualidade por tarefa. Nenhum concorrente oferece essa flexibilidade.

2. **Hub de 12 Ferramentas IA**: Suíte completa de geração de materiais pedagógicos inclusivos que vai muito além do PEI — adaptar provas, criar atividades, estúdio visual, dinâmicas, experiências EI.

3. **Jornada Gamificada**: Missões gamificadas para estudante e família, tornando o processo de atendimento engajante e lúdico.

4. **BNCC Integrada**: Sugestão de habilidades BNCC contextualizada por diagnóstico e segmento (EI, EFI, EFII, EM) com validação pedagógica por IA.

5. **Mapeamento de Barreiras Estruturado**: 26 barreiras categorizadas em 5 domínios com 4 níveis de suporte, baseado em protocolos pedagógicos e nomenclatura profissional.

6. **OCR Inteligente de Laudos**: Extração automática de laudos médicos (PDF e imagem) com preenchimento automático de campos do PEI.

7. **Versionamento de PEI**: Snapshots temporais do PEI completo para comparação e auditoria de evolução.

8. **Escopo Legal Brasileiro**: Prompts e nomenclatura alinhados à Lei Brasileira de Inclusão (LBI), BNCC, Nota Técnica MEC e terminologia AEE.

9. **Dark Mode Completo**: Tema escuro em todos os 11 módulos com CSS Variables, incluindo override de gradientes e componentes Tailwind.

10. **Relatórios Cross-Module**: Cruzamento automático de dados entre PAEE e Diário de Bordo para gerar relatórios de ciclo.

---

*Documento Técnico Completo — Sistema Omnisfera v1.0*
*Detalhamento de arquitetura, dados e funcionalidades para referência técnica.*
*Última atualização: 15 de fevereiro de 2026.*
