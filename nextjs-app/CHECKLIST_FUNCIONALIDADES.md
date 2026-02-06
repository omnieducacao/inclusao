# Checklist Completo de Funcionalidades - Migração Streamlit → Next.js

**Data:** 06/02/2026  
**Status:** ~98% completo

---

## ✅ 1. MOTORES DE IA (Multi-Engine) — COMPLETO

- [x] `lib/ai-engines.ts` com roteamento por motor (red/blue/green/yellow/orange)
- [x] Variáveis de ambiente: DEEPSEEK_API_KEY, OPENROUTER_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY
- [x] APIs do Hub aceitam parâmetro `engine` e chamam o motor correto
- [x] Adaptar Prova: usa engine red/blue (texto)
- [x] Adaptar Atividade: usa GEMINI_API_KEY (visão/OCR) — OmniYellow obrigatório
- [x] Estúdio Visual/CAA: usa GEMINI_API_KEY para imagens (com fallback DALL-E)
- [x] PEI extrair-laudo: opção de engine
- [x] PEI consultoria IA: múltiplos motores
- [x] UI: seletor de motor (EngineSelector) nas ferramentas do Hub e PEI

---

## ✅ 2. HUB DE INCLUSÃO — STATUS POR ABA

### 2.1 Adaptar Prova — COMPLETO ✅
- [x] BNCC expander completo (ano, disciplina, unidade temática, objeto do conhecimento)
- [x] Seletor de motor (red/blue/green/yellow/orange)
- [x] Mapeamento de imagens: extrai imagens do DOCX, mostra preview, professor associa cada imagem a uma questão
- [x] Checklist completo (8 itens)
- [x] Modo profundo (checkbox)
- [x] Download DOCX (com imagens inseridas) + PDF
- [x] Envia unidade_tematica e objeto_conhecimento para API

### 2.2 Adaptar Atividade — COMPLETO ✅
- [x] BNCC expander completo
- [x] **Passo 1:** Recorte da questão (ImageCropper) — recorta área da imagem
- [x] Gemini para OCR + visão (obrigatório, com fallback OpenAI)
- [x] Checklist completo (8 itens)
- [x] Modo profundo
- [x] Download DOCX + PDF
- [x] Envia unidade_tematica e objeto_conhecimento para API
- [ ] **Passo 2:** Recorte de imagem separada para inserir na questão adaptada ([[IMG_2]]) — **OPCIONAL**

### 2.3 Criar do Zero — COMPLETO ✅
- [x] BNCC completa (ano, disciplina, unidade temática, objeto do conhecimento, habilidades multi-select)
- [x] Assunto livre
- [x] Geração de imagens (Gemini/DALL-E) para tags `[[GEN_IMG: ...]]`
- [x] Download DOCX (com tags `[[IMG_n]]` e mapa de imagens) + PDF
- [x] Construir docx final com tags e mapa
- [ ] Integração Unsplash — **OPCIONAL**
- [ ] Download TXT — **OPCIONAL**

### 2.4 Estúdio Visual & CAA — COMPLETO ✅
- [x] **Ilustração:** descrição, opção de usar hiperfoco, Gerar Imagem (Gemini/DALL-E), Validar, Refazer com ajuste
- [x] **Símbolo CAA:** conceito, Gerar Pictograma (Gemini/DALL-E), Validar, Refazer
- [x] API para geração de ilustração (Gemini/DALL-E)
- [x] API para pictograma CAA (Gemini/DALL-E)
- [x] UI: campos, preview, validar, refazer
- [ ] Integração Unsplash — **OPCIONAL**

### 2.5 Roteiro Individual — COMPLETO ✅
- [x] BNCC dropdowns completos
- [x] Seletor de motor (red/blue/green/yellow/orange)
- [x] Gerar roteiro de aula individualizado
- [x] Download DOCX + PDF

### 2.6 Papo de Mestre — COMPLETO ✅
- [x] Componente, assunto, hiperfoco
- [x] Seletor de motor
- [x] Download DOCX + PDF
- [ ] Tema da turma (DUA) — **OPCIONAL**

### 2.7 Dinâmica Inclusiva — COMPLETO ✅
- [x] BNCC dropdowns completos
- [x] Número de estudantes, características da turma
- [x] Seletor de motor
- [x] Gerar dinâmica
- [x] Download DOCX + PDF

### 2.8 Plano de Aula DUA — COMPLETO ✅
- [x] BNCC expander completo
- [x] Metodologias ativas, recursos, duração, qtd alunos
- [x] Download DOCX + PDF

---

## ✅ 3. HUB EDUCAÇÃO INFANTIL (modo EI) — COMPLETO ✅

- [x] Detectar nível EI pelo grade/série do estudante
- [x] Renderizar abas EI quando aplicável
- [x] **Criar Experiência** — implementado (usa CriarDoZero com eiMode)
- [x] **Estúdio Visual & CAA** — implementado
- [x] **Rotina & AVD** — implementado
- [x] **Inclusão no Brincar** — implementado

---

## ✅ 4. PEI — COMPLETO ✅

- [x] **Cadastro do estudante via PEI** — IMPLEMENTADO HOJE ✅
  - [x] Fluxo: preenche nome → preenche PEI completo → clica "Integrar na Omnisfera"
  - [x] Botão "🔗 Integrar na Omnisfera" cria estudante e salva PEI completo
  - [x] Função `createStudent` em `lib/students.ts`
  - [x] API POST `/api/students` para criar estudante
  - [x] `updateStudentPeiData` atualiza também campos básicos (nome, série, turma, diagnóstico)
- [x] Consultoria IA: múltiplos motores (red/blue/green/yellow/orange)
- [x] Exportação DOCX/PDF do PEI completo
- [x] Laudo PDF: opção de engine

---

## ✅ 5. PAEE — COMPLETO ✅

- [x] Jornada gamificada: geração com Gemini (yellow)
- [x] Mapa mental do roteiro (Gemini com fallback DALL-E)
- [x] Múltiplos motores nas metas/planejamento

---

## ✅ 6. SERVIÇOS E UTILITÁRIOS — STATUS

| Serviço Streamlit | Uso | Next.js | Status |
|-------------------|-----|---------|--------|
| `hub_docs.py` | criar_docx_simples, criar_pdf_generico, construir_docx_final | `lib/docx-simples.ts`, `lib/docx-com-imagens.ts`, `components/PdfDownloadButton.tsx` | ✅ Completo |
| `hub_ia.py` | chat multi-engine, gerar_imagem_inteligente, gerar_pictograma_caa | `lib/ai-engines.ts`, `lib/gemini-image.ts`, `app/api/hub/estudio-imagem/route.ts` | ✅ Completo |
| `hub_bncc_utils.py` | dropdowns BNCC, ano_celula_contem, etc. | `app/api/bncc/**`, dropdowns completos nas abas | ✅ Completo |
| `omni_utils.py` | chat_completion_multi_engine, get_gemini_api_key, etc. | `lib/ai-engines.ts`, `lib/gemini-image.ts` | ✅ Completo |

---

## 📋 RESUMO EXECUTIVO

### ✅ Funcionalidades Principais — 100% Implementadas

1. **Multi-engine (5 motores)** — ✅ Completo
2. **Gemini para imagens** — ✅ Completo (mapa mental, estúdio visual)
3. **DOCX com imagens** — ✅ Completo (todas as abas)
4. **BNCC expander completo** — ✅ Completo (unidade + objeto em todas as abas principais)
5. **Extração e mapeamento de imagens** — ✅ Completo (Adaptar Prova)
6. **Cropper** — ✅ Completo (Adaptar Atividade)
7. **Cadastro estudante via PEI** — ✅ Implementado hoje
8. **Integração na Omnisfera** — ✅ Botão implementado hoje
9. **Modo EI** — ✅ Completo (4 abas específicas)
10. **Todas as abas do Hub** — ✅ Implementadas

### ⚠️ Funcionalidades Opcionais (Não Críticas)

1. **Passo 2 Adaptar Atividade** — Recorte de imagem separada (baixa prioridade)
2. **Integração Unsplash** — Alternativa para busca de imagens (baixa prioridade)
3. **Downloads TXT** — Algumas abas do Streamlit também geram TXT (baixa prioridade)
4. **Tema da turma (DUA)** — Em Papo de Mestre (baixa prioridade)

---

## 🎯 CONCLUSÃO

**Status da Migração: ~98% completo**

Todas as funcionalidades principais estão implementadas e funcionando. O que resta são melhorias opcionais de baixa prioridade.

**Destaques de hoje:**
- ✅ Gemini para imagens (mapa mental + estúdio visual)
- ✅ BNCC expander completo integrado nas APIs
- ✅ Cadastro do estudante via PEI (botão "Integrar na Omnisfera")
- ✅ Fluxo completo: PEI é o cadastro do estudante
