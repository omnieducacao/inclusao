# ANÁLISE COMPLETA DO HUB - Streamlit vs Next.js

## 📋 RESUMO EXECUTIVO

Este documento compara detalhadamente cada funcionalidade do Hub entre a versão Streamlit (funcionando) e a versão Next.js atual, identificando o que está implementado, o que está faltando e o que pode estar quebrado.

---

## 🛠️ FERRAMENTAS DO HUB

### **EF/EM (Ensino Fundamental e Médio)**
1. Adaptar Prova
2. Adaptar Atividade
3. Criar do Zero
4. Estúdio Visual
5. Roteiro Individual
6. Papo de Mestre
7. Dinâmica Inclusiva
8. Plano de Aula DUA

### **EI (Educação Infantil)**
1. Criar Experiência
2. Estúdio Visual & CAA
3. Rotina & AVD
4. Inclusão no Brincar

---

## 1. ✅ CRIAR DO ZERO / CRIAR EXPERIÊNCIA

### **Status**: ✅ IMPLEMENTADO

### **Funcionalidades Implementadas**:
- ✅ Seleção de série/ano BNCC
- ✅ Seleção de componente curricular
- ✅ Estrutura BNCC completa (Unidade Temática → Objeto → Habilidades)
- ✅ Modo Educação Infantil (EI) com campos específicos
- ✅ Taxonomia de Bloom (6 domínios + verbos)
- ✅ Configuração de questões (quantidade, tipo Objetiva/Discursiva)
- ✅ Geração de imagens com IA (`[[GEN_IMG: ...]]`)
- ✅ Checklist de adaptação DUA
- ✅ Integração com dados do estudante (nome, série, hiperfoco)
- ✅ Validação de resultado
- ✅ Download DOCX e PDF
- ✅ Feedback/refazer com IA

### **API**: `/api/hub/criar-atividade`
- ✅ Implementada
- ✅ Suporta modo EF/EM e EI
- ✅ Processa verbos Bloom
- ✅ Processa imagens geradas

### **Possíveis Problemas**:
- ⚠️ **Geração de imagens**: Verificar se `[[GEN_IMG: ...]]` está sendo processado corretamente
- ⚠️ **BNCC EI**: Verificar se objetivos EI estão sendo carregados corretamente do PEI

---

## 2. ✅ ADAPTAR PROVA

### **Status**: ✅ IMPLEMENTADO

### **Funcionalidades Implementadas**:
- ✅ Upload de arquivo DOCX
- ✅ Extração de texto e imagens do DOCX (`/api/hub/extrair-docx`)
- ✅ Mapeamento de imagens para questões específicas
- ✅ Seleção de matéria/tema
- ✅ Estrutura BNCC (Unidade Temática → Objeto)
- ✅ Modo Profundo (análise mais detalhada)
- ✅ Tipo de documento (Prova, Atividade, etc.)
- ✅ Checklist de adaptação DUA
- ✅ Integração com perfil do estudante
- ✅ Análise pedagógica separada do texto adaptado
- ✅ Validação e refazer
- ✅ Download DOCX e PDF

### **API**: `/api/hub/adaptar-prova`
- ✅ Implementada
- ✅ Processa FormData com arquivo
- ✅ Suporta modo profundo
- ✅ Retorna análise + texto adaptado

### **Possíveis Problemas**:
- ⚠️ **Extração DOCX**: Verificar se imagens estão sendo extraídas corretamente
- ⚠️ **Mapeamento de imagens**: Verificar se `questoes_com_imagem` está sendo enviado corretamente
- ⚠️ **Modo Profundo**: Verificar se está funcionando como esperado

---

## 3. ✅ ADAPTAR ATIVIDADE

### **Status**: ✅ IMPLEMENTADO

### **Funcionalidades Implementadas**:
- ✅ Upload de imagem (foto da atividade)
- ✅ Cropper de imagem (`ImageCropper`)
- ✅ Imagem separada opcional (para contexto adicional)
- ✅ OCR automático (via API)
- ✅ Seleção de matéria/tema
- ✅ Estrutura BNCC
- ✅ Modo Profundo
- ✅ Tipo de documento
- ✅ Opção "Livro do Professor"
- ✅ Checklist de adaptação
- ✅ Processamento de imagens no resultado (`[[IMG_1]]`, `[[IMG_2]]`)
- ✅ Validação e refazer
- ✅ Download DOCX e PDF

### **API**: `/api/hub/adaptar-atividade`
- ✅ Implementada
- ✅ Processa FormData com imagem(s)
- ✅ OCR integrado
- ✅ Retorna análise + texto adaptado

### **Possíveis Problemas**:
- ⚠️ **OCR**: Verificar se está funcionando corretamente (pode estar usando API externa)
- ⚠️ **Processamento de imagens**: Verificar se `[[IMG_1]]` e `[[IMG_2]]` estão sendo substituídos no DOCX
- ⚠️ **Cropper**: Verificar se está salvando a imagem cortada corretamente

---

## 4. ✅ ESTÚDIO VISUAL & CAA

### **Status**: ✅ IMPLEMENTADO

### **Funcionalidades Implementadas**:
- ✅ **Ilustração Educacional**:
  - ✅ Campo de descrição
  - ✅ Opção de usar hiperfoco como tema
  - ✅ Geração de imagem via IA
  - ✅ Feedback/refazer
  - ✅ Validação
- ✅ **Pictograma CAA**:
  - ✅ Campo de conceito
  - ✅ Geração de símbolo CAA
  - ✅ Feedback/refazer
  - ✅ Validação

### **API**: `/api/hub/estudio-imagem`
- ✅ Implementada
- ✅ Suporta tipo "ilustracao" e "caa"
- ✅ Feedback para refazer

### **Possíveis Problemas**:
- ⚠️ **Geração de imagens**: Verificar qual engine está sendo usado (deve ser OpenAI/DALL-E)
- ⚠️ **Qualidade das imagens**: Verificar se as imagens geradas estão adequadas para uso educacional

---

## 5. ✅ PAPO DE MESTRE

### **Status**: ✅ IMPLEMENTADO

### **Funcionalidades Implementadas**:
- ✅ Seleção de componente curricular
- ✅ Campo de assunto da aula
- ✅ Hiperfoco do estudante (read-only)
- ✅ Interesse da turma (DUA, opcional)
- ✅ Geração de conexões para engajamento
- ✅ Validação e descartar
- ✅ Download DOCX e PDF

### **API**: `/api/hub/papo-mestre`
- ✅ Implementada
- ✅ Usa prompt específico (`gerarPromptPapoMestre`)
- ✅ Integra hiperfoco e tema da turma

### **Possíveis Problemas**:
- ⚠️ **Prompt**: Verificar se o prompt está gerando conexões adequadas
- ⚠️ **Tema da turma**: Verificar se está sendo usado corretamente no prompt

---

## 6. ✅ PLANO DE AULA DUA

### **Status**: ✅ IMPLEMENTADO

### **Funcionalidades Implementadas**:
- ✅ Seleção de matéria
- ✅ Campo de assunto
- ✅ Série/ano BNCC
- ✅ Duração da aula
- ✅ Metodologia (com técnicas ativas quando aplicável)
- ✅ Quantidade de alunos
- ✅ Recursos disponíveis (multi-select)
- ✅ Estrutura BNCC completa
- ✅ Seleção de habilidades BNCC
- ✅ Integração com dados do estudante
- ✅ Validação e refazer
- ✅ Download DOCX, PDF e **PPTX** (PowerPoint)

### **API**: `/api/hub/plano-aula`
- ✅ Implementada
- ✅ Usa prompt específico (`gerarPromptPlanoAula`)
- ✅ Processa metodologia e recursos

### **Possíveis Problemas**:
- ⚠️ **PPTX**: Verificar se a geração de PowerPoint está funcionando (`gerarPptxPlanoAula`)
- ⚠️ **Metodologia Ativa**: Verificar se técnicas ativas aparecem quando metodologia é selecionada

---

## 7. ✅ ROTEIRO INDIVIDUAL

### **Status**: ✅ IMPLEMENTADO

### **Funcionalidades Implementadas**:
- ✅ Seleção de matéria
- ✅ Campo de assunto
- ✅ Série/ano BNCC
- ✅ Estrutura BNCC completa
- ✅ Seleção de habilidades BNCC
- ✅ Integração com perfil do estudante (nome, ia_sugestao, hiperfoco)
- ✅ Validação e descartar
- ✅ Download DOCX e PDF

### **API**: `/api/hub/roteiro`
- ✅ Implementada
- ✅ Usa prompt específico (`gerarPromptRoteiroAula`)
- ✅ Suporta BNCC ou assunto livre

### **Possíveis Problemas**:
- ⚠️ **Perfil do estudante**: Verificar se `ia_sugestao` está sendo enviado corretamente (limitado a 500 chars)

---

## 8. ✅ DINÂMICA INCLUSIVA

### **Status**: ✅ IMPLEMENTADO

### **Funcionalidades Implementadas**:
- ✅ Seleção de matéria
- ✅ Campo de assunto
- ✅ Quantidade de alunos
- ✅ Características da turma (opcional)
- ✅ Série/ano BNCC
- ✅ Estrutura BNCC completa
- ✅ Seleção de habilidades BNCC
- ✅ Integração com perfil do estudante
- ✅ Validação e descartar
- ✅ Download DOCX e PDF

### **API**: `/api/hub/dinamica`
- ✅ Implementada
- ✅ Usa prompt específico (`gerarPromptDinamicaInclusiva`)
- ✅ Processa características da turma

### **Possíveis Problemas**:
- ⚠️ **Características da turma**: Verificar se está sendo usado no prompt corretamente

---

## 9. ✅ ROTINA & AVD (Educação Infantil)

### **Status**: ✅ IMPLEMENTADO

### **Funcionalidades Implementadas**:
- ✅ Campo de rotina detalhada (textarea)
- ✅ Ponto de atenção opcional
- ✅ Integração com perfil do estudante
- ✅ Feedback/refazer
- ✅ Validação
- ✅ Download DOCX e PDF

### **API**: `/api/hub/rotina-avd`
- ✅ Implementada
- ✅ Prompt específico para rotina e previsibilidade
- ✅ Suporta feedback para refazer

### **Possíveis Problemas**:
- ⚠️ **Prompt**: Verificar se está gerando análises adequadas de rotina

---

## 10. ✅ INCLUSÃO NO BRINCAR (Educação Infantil)

### **Status**: ✅ IMPLEMENTADO

### **Funcionalidades Implementadas**:
- ✅ Campo de tema/momento
- ✅ Integração com hiperfoco do estudante
- ✅ Integração com perfil do estudante
- ✅ Feedback/refazer
- ✅ Validação
- ✅ Download DOCX e PDF

### **API**: `/api/hub/inclusao-brincar`
- ✅ Implementada
- ✅ Prompt específico para mediação social
- ✅ Suporta feedback para refazer

### **Possíveis Problemas**:
- ⚠️ **Hiperfoco**: Verificar se está sendo usado corretamente no prompt

---

## 🔍 FUNCIONALIDADES GLOBAIS DO HUB

### ✅ **Seleção de Estudante**
- ✅ `StudentSelector` implementado
- ✅ Carrega dados do estudante automaticamente
- ✅ Exibe `PEISummaryPanel` quando estudante selecionado

### ✅ **Detecção de Nível de Ensino**
- ✅ `detectarNivelEnsino()` detecta EI vs EF/EM
- ✅ Mostra ferramentas diferentes baseado no nível

### ✅ **Seleção de Engine de IA**
- ✅ `EngineSelector` em todas as ferramentas que usam IA
- ✅ 5 engines disponíveis (red, blue, green, yellow, orange)

### ✅ **BNCC Integration**
- ✅ API `/api/bncc/ef` para EF/EM
- ✅ API `/api/bncc/ei` para EI
- ✅ Estrutura completa (Disciplina → Unidade → Objeto → Habilidades)
- ✅ Carregamento automático baseado na série do estudante

### ✅ **Validação e Feedback**
- ✅ Botão "Validar" em todas as ferramentas
- ✅ Botão "Descartar" quando não validado
- ✅ Feedback/refazer em várias ferramentas

### ✅ **Downloads**
- ✅ DOCX via `DocxDownloadButton`
- ✅ PDF via `PdfDownloadButton`
- ✅ PPTX para Plano de Aula (`gerarPptxPlanoAula`)

### ✅ **AI Loading Overlay**
- ✅ `aiLoadingStart()` e `aiLoadingStop()` integrados
- ✅ Feedback visual durante geração

---

## ⚠️ POSSÍVEIS PROBLEMAS IDENTIFICADOS

### 1. **Processamento de Imagens**
- **Adaptar Prova**: Verificar se imagens extraídas do DOCX estão sendo mapeadas corretamente
- **Adaptar Atividade**: Verificar se `[[IMG_1]]` e `[[IMG_2]]` estão sendo substituídos no DOCX
- **Criar do Zero**: Verificar se `[[GEN_IMG: ...]]` está sendo processado e imagens geradas

### 2. **OCR**
- **Adaptar Atividade**: Verificar se OCR está funcionando corretamente (pode depender de API externa)

### 3. **BNCC EI**
- **Criar Experiência**: Verificar se objetivos EI estão sendo carregados do PEI corretamente

### 4. **Prompts**
- Verificar se todos os prompts estão usando as funções corretas de `@/lib/hub-prompts`
- Verificar se parâmetros estão sendo passados corretamente

### 5. **Limites de Caracteres**
- **Roteiro**: `ia_sugestao` limitado a 500 chars
- **Adaptar Prova**: `perfil` limitado a 800 chars
- **Adaptar Atividade**: `perfil` limitado a 600 chars
- Verificar se esses limites são adequados

### 6. **Geração de PPTX**
- **Plano de Aula**: Verificar se `gerarPptxPlanoAula` está funcionando corretamente

---

## 📝 CHECKLIST DE TESTES RECOMENDADOS

### **Criar do Zero**
- [ ] Testar com BNCC preenchida
- [ ] Testar sem BNCC (apenas assunto)
- [ ] Testar com Taxonomia de Bloom
- [ ] Testar geração de imagens
- [ ] Testar modo EI

### **Adaptar Prova**
- [ ] Testar upload de DOCX
- [ ] Testar extração de imagens
- [ ] Testar mapeamento de imagens para questões
- [ ] Testar modo profundo
- [ ] Testar download DOCX com imagens

### **Adaptar Atividade**
- [ ] Testar upload de imagem
- [ ] Testar cropper
- [ ] Testar imagem separada
- [ ] Testar OCR
- [ ] Testar download DOCX com imagens

### **Estúdio Visual**
- [ ] Testar geração de ilustração
- [ ] Testar geração de pictograma CAA
- [ ] Testar feedback/refazer

### **Papo de Mestre**
- [ ] Testar com hiperfoco
- [ ] Testar com tema da turma
- [ ] Verificar qualidade das conexões geradas

### **Plano de Aula**
- [ ] Testar com diferentes metodologias
- [ ] Testar com técnicas ativas
- [ ] Testar geração de PPTX
- [ ] Testar com BNCC

### **Roteiro Individual**
- [ ] Testar com BNCC
- [ ] Testar sem BNCC
- [ ] Verificar se perfil do estudante está sendo usado

### **Dinâmica Inclusiva**
- [ ] Testar com características da turma
- [ ] Testar com BNCC
- [ ] Verificar qualidade da dinâmica gerada

### **Rotina & AVD**
- [ ] Testar análise de rotina
- [ ] Testar feedback/refazer
- [ ] Verificar se está identificando pontos de estresse

### **Inclusão no Brincar**
- [ ] Testar com hiperfoco
- [ ] Testar feedback/refazer
- [ ] Verificar se está criando brincadeiras adequadas

---

## 🎯 CONCLUSÃO

**Status Geral**: ✅ **TODAS AS FERRAMENTAS ESTÃO IMPLEMENTADAS**

Todas as 12 ferramentas do Hub estão implementadas com suas funcionalidades principais. No entanto, há alguns pontos que precisam ser verificados/testados:

1. **Processamento de imagens** (DOCX, OCR, geração)
2. **Limites de caracteres** nos perfis
3. **Qualidade dos prompts** e resultados gerados
4. **Integração BNCC EI**

**Recomendação**: Executar testes práticos de cada ferramenta para identificar problemas específicos que não são visíveis apenas pela análise do código.
