# Omnisfera — Resumo para Site Institucional

## O que é a Omnisfera

**Omnisfera** é uma **plataforma de inclusão educacional** que apoia escolas e equipes pedagógicas na elaboração, execução e acompanhamento de planos de inclusão. Ela centraliza o PEI (Plano de Ensino Individualizado), o PAEE (Plano de Atendimento Educacional Especializado), recursos adaptados e ferramentas de gestão em um único ecossistema, alinhado à BNCC e às legislações atuais (Decretos 12.686/2025 e 12.773/2025).

---

## Estrutura da Plataforma

### Módulos Principais

| Módulo | O que faz |
|--------|-----------|
| **Início / Home** | Central de conhecimento, legislação, glossário e manual da inclusão |
| **Estudantes** | Cadastro e gestão de estudantes em inclusão |
| **Estratégias & PEI** | Criação e edição do Plano de Ensino Individualizado completo |
| **Plano de Ação (AEE)** | Planejamento do Atendimento Educacional Especializado |
| **Hub de Recursos** | Adaptação de provas, atividades, roteiros e materiais com DUA e IA |
| **Diário de Bordo** | Registro diário de atendimentos e evolução |
| **Evolução & Dados** | Monitoramento e visualização de evolução dos estudantes |
| **Gestão de Usuários** | Controle de permissões (master, membros, turmas, tutores) |
| **Configuração Escola** | Ano letivo, séries, turmas e estrutura curricular |
| **Admin Plataforma** | Gestão de escolas, termo de uso e dashboard (administradores) |

---

## Detalhamento dos Recursos

### 1. Início / Home
- **Panorama & Fluxos:** Fluxo da inclusão (acolhimento → estudo de caso → planejamento → prática)
- **Legislação & IA:** Decretos 12.686 e 12.773, Consultor Legal por IA
- **Glossário Técnico:** Termos da educação inclusiva
- **Dicionário Inclusivo:** Linguagem respeitosa e não capacitista
- **Biblioteca Virtual:** Referências e materiais de apoio
- **Manual da Jornada:** Guia de uso da plataforma

### 2. Estudantes
- Cadastro de estudantes com dados básicos e diagnóstico
- Vinculação a workspace (escola)
- Integração com Supabase (nuvem)

### 3. Estratégias & PEI (Plano de Ensino Individualizado)
**Abas:**
- **Início:** Gestão de estudantes, backup local e nuvem
- **Estudante:** Dados do aluno, série, diagnóstico, hiperfoco
- **Evidências:** Registros e evidências de aprendizagem
- **Rede de Apoio:** Família, especialistas e parcerias
- **Mapeamento:** Barreiras de participação e acessibilidade
- **Plano de Ação:** Estratégias e metas
- **Monitoramento:** Acompanhamento de objetivos
- **Habilidades BNCC:** Seleção e validação de habilidades alinhadas à BNCC
- **Consultoria IA:** Relatório estruturado gerado por IA
- **Dashboard & Docs:** Exportação em PDF/DOCX

**Diferenciais:** IA gera Avaliação de Repertório e Recomendações por Componente Curricular, usando apenas habilidades BNCC validadas. Suporte a Educação Infantil e Ensino Fundamental/Médio.

### 4. Plano de Ação (AEE)
**Abas (Ensino Fundamental/Médio):**
- **Mapear Barreiras:** Diagnóstico de acessibilidade
- **Plano de Habilidades:** Objetivos e estratégias de desenvolvimento
- **Tec. Assistiva:** Tecnologias de apoio
- **Articulação:** Pontes entre sala comum e AEE
- **Planejamento AEE:** Cronograma e ações
- **Execução e Metas SMART:** Metas e acompanhamento
- **Jornada Gamificada:** Narrativa gamificada para o estudante e família

**Abas (Educação Infantil):**
- **Barreiras no Brincar:** Diagnóstico do brincar
- **Banco de Experiências:** Campos de experiência BNCC
- **Rotina & Adaptação:** Adaptações da rotina
- **Articulação / Planejamento / Execução / Jornada**

**Jornada Gamificada:** A IA transforma o planejamento em missões e etapas, exportáveis para Google Sheets; o app **Minha Jornada** permite ao estudante acessar pelo código OMNI.

### 5. Hub de Recursos
**Ensino Fundamental / Médio:**
- **Adaptar Prova:** Transforma provas em avaliações acessíveis (DUA)
- **Adaptar Atividade:** OCR de fotos de atividades, remoção de ruído visual
- **Criar do Zero:** Atividades alinhadas ao PEI com IA
- **Estúdio Visual & CAA:** Pictogramas, cenas sociais, materiais de CAA
- **Roteiro Individual:** Passo a passo de aula para o estudante
- **Papo de Mestre:** Sugestões de quebra-gelo e mediação
- **Dinâmica Inclusiva:** Dinâmicas em grupo
- **Plano de Aula DUA:** Plano de aula com Desenho Universal para Aprendizagem

**Educação Infantil:**
- **Criar Experiência (BNCC):** Experiências alinhadas aos Campos de Experiência
- **Estúdio Visual & CAA:** Pictogramas e recursos visuais
- **Rotina & AVD:** Adaptações de rotina
- **Inclusão no Brincar:** Mediação social e brincadeiras inclusivas

**BNCC:** Filtro automático por ano/série do estudante (PEI). Componente curricular, unidade temática, objeto do conhecimento e habilidades vêm pré-filtrados.

### 6. Diário de Bordo
- **Filtros:** Por estudante, data, turma
- **Novo Registro:** Registro de atendimentos com data e observações
- **Lista:** Histórico de registros
- **Relatórios:** Visualizações e exportações
- **Config:** Configurações do diário

### 7. Evolução & Dados (Monitoramento)
- Acompanhamento de evolução dos estudantes
- Visualização de progressos e indicadores

### 8. Gestão de Usuários
- Master do workspace define permissões por página
- Vínculos: **turma** (acesso por turma) ou **tutor** (acesso por estudante específico)
- Atribuição de turmas e componentes aos professores

### 9. Configuração Escola
- Criação de ano letivo
- Cadastro de séries e turmas
- Estrutura alinhada à BNCC (EI, EFAI, EFAF, EM)

### 10. Admin Plataforma
- Escolas (workspaces)
- Termo de Uso
- Dashboard
- Registro de bugs e erros

---

## Tecnologias e Integrações

- **Backend:** Supabase (PostgreSQL, REST, RPC)
- **IA:** OpenAI (GPT-4o-mini) e Google Gemini
- **Frontend:** Streamlit
- **Exportação:** PDF, DOCX, Google Sheets (Jornada Gamificada)
- **Imagens:** Unsplash (banco de imagens), IA para geração quando necessário

---

## Fluxo de Acesso

1. **Login:** PIN do workspace + email + senha (ou acesso admin)
2. **Aceite do Termo de Uso**
3. **Navegação:** Barra de navegação entre módulos conforme permissões

---

## Público-Alvo

- **Coordenadores pedagógicos**
- **Professores de sala comum**
- **Professores do AEE**
- **Gestores escolares**
- **Equipes multiprofissionais de inclusão**

---

## Diferenciais

- PEI e PAEE integrados em um único ecossistema
- IA especializada em inclusão, BNCC e legislação
- BNCC vinculada ao ano/série do estudante (PEI como norteador)
- Jornada Gamificada para engajamento do estudante e família
- Recursos práticos: adaptação de provas, atividades, roteiros, pictogramas
- Suporte à Educação Infantil e Ensino Fundamental/Médio
- Gestão por workspace (escola) com controle de permissões

---

*Documento gerado para subsidiar o site institucional da Omnisfera.*
