# Pendências da Migração Streamlit → Next.js

Documento de referência do que ainda falta implementar para atingir paridade com o Streamlit.

---

## 1. Motores de IA (Multi-Engine)

No Streamlit existem **5 motores**:

| Motor | Código | Provider | Chave | Uso principal |
|-------|--------|----------|-------|---------------|
| 🔴 OmniRed | `red` | DeepSeek | DEEPSEEK_API_KEY | Texto, PEI, PAEE, Hub (padrão) |
| 🔵 OmniBlue | `blue` | Kimi (OpenRouter) | OPENROUTER_API_KEY / KIMI_API_KEY | Alternativa texto |
| 🟢 OmniGreen | `green` | Claude | ANTHROPIC_API_KEY | Alternativa texto |
| 🟡 OmniYellow | `yellow` | Gemini | GEMINI_API_KEY | Imagens, OCR, visão, CAA |
| 🟠 OmniOrange | `orange` | OpenAI | OPENAI_API_KEY | Fallback |

**Situação no Next.js:** Todas as APIs usam apenas `OPENAI_API_KEY`.

**Pendente:**
- [ ] Criar lib/ai-engines.ts com roteamento por motor (red/blue/green/yellow/orange)
- [ ] Adicionar variáveis de ambiente: DEEPSEEK_API_KEY, OPENROUTER_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY
- [ ] APIs do Hub aceitarem parâmetro `engine` e chamarem o motor correto
- [ ] Adaptar Prova: usar engine red/blue (texto)
- [ ] Adaptar Atividade: usar GEMINI_API_KEY (visão/OCR) — OmniYellow obrigatório
- [ ] Estúdio Visual/CAA: usar GEMINI_API_KEY para imagens
- [ ] PEI extrair-laudo: opção de engine
- [ ] UI: seletor de motor nas ferramentas do Hub

---

## 2. Hub de Inclusão — O que falta por aba

### 2.1 Adaptar Prova
**Streamlit tem:**
- BNCC em expander (ano, disciplina, unidade, objeto, assunto livre)
- Seletor de motor (red/blue)
- Mapeamento de imagens: extrai imagens do DOCX, mostra preview, professor associa cada imagem a uma questão (número)
- Checklist completo (8 itens): questões desafiadoras, instruções passo a passo, compreende complexas, dividir etapas, parágrafos curtos, dicas apoio, figuras de linguagem, descrição imagens
- Modo profundo (checkbox)
- Download DOCX (com imagens inseridas via `construir_docx_final`) + PDF

**Next.js tem:**
- Upload DOCX, checklist parcial, matéria/tema manual, download PDF

**Pendente:**
- [ ] BNCC expander (integrar criar_dropdowns_bncc_completos)
- [ ] Extração de imagens do DOCX + mapeamento questão → imagem
- [ ] DOCX de saída com imagens (construir_docx_final equivalente)
- [ ] Modo profundo
- [ ] Seletor de motor

---

### 2.2 Adaptar Atividade
**Streamlit tem:**
- BNCC em expander
- **Passo 1:** Recorte da questão (st_cropper) — recorta área da imagem
- **Passo 2:** Opcional — recortar imagem separadamente para inserir na questão adaptada ([[IMG_2]])
- Gemini para OCR + visão (obrigatório)
- Checklist completo (8 itens)
- Modo profundo
- Download DOCX + PDF

**Next.js tem:**
- Upload imagem, checklist parcial, download PDF

**Pendente:**
- [ ] Componente de recorte (cropper) — equivalente a streamlit_cropper
- [ ] Passo 2: recorte de imagem separada
- [ ] Usar GEMINI_API_KEY para visão (atualmente usa OpenAI se disponível)
- [ ] BNCC expander
- [ ] DOCX de saída
- [ ] Modo profundo

---

### 2.3 Criar do Zero
**Streamlit tem:**
- BNCC completa (ano, disciplina, unidade, objeto, habilidades multi-select)
- Assunto livre
- Unsplash para imagens (opcional)
- Download DOCX (com tags [[IMG_n]] e mapa de imagens) + PDF + TXT

**Next.js tem:**
- BNCC via API EF, seleção de habilidades, assunto
- Apenas texto de saída

**Pendente:**
- [ ] Unidade temática, objeto do conhecimento (dropdowns BNCC completos)
- [ ] Integração Unsplash ou geração de imagens (Gemini)
- [ ] DOCX com imagens + PDF + TXT
- [ ] Construir docx final com tags e mapa

---

### 2.4 Estúdio Visual & CAA
**Streamlit tem:**
- **Ilustração:** descrição, opção de usar hiperfoco, Gerar Imagem (Gemini/DALL-E/Unsplash), Validar, Refazer com ajuste
- **Símbolo CAA:** conceito, Gerar Pictograma (Gemini/DALL-E), Validar, Refazer

**Next.js tem:**
- Placeholder "Em breve"

**Pendente:**
- [ ] Implementar aba completa
- [ ] API para geração de ilustração (Gemini/DALL-E/Unsplash)
- [ ] API para pictograma CAA (Gemini/DALL-E)
- [ ] UI: campos, preview, validar, refazer

---

### 2.5 Roteiro Individual
**Streamlit tem:**
- BNCC dropdowns completos
- Seletor de motor (red/blue)
- Gerar roteiro de aula individualizado
- Validar / Refazer / Descartar
- Download DOCX + PDF

**Next.js tem:**
- Não existe

**Pendente:**
- [ ] Implementar aba completa
- [ ] API gerar-roteiro
- [ ] BNCC dropdowns
- [ ] Download DOCX + PDF

---

### 2.6 Papo de Mestre
**Streamlit tem:**
- Componente, assunto, hiperfoco, tema turma (DUA)
- Seletor de motor
- Download DOCX + PDF

**Next.js tem:**
- Implementação básica (sem seletor de motor, sem BNCC)

**Pendente:**
- [ ] Seletor de motor
- [ ] Download DOCX + PDF
- [ ] Tema da turma (DUA)

---

### 2.7 Dinâmica Inclusiva
**Streamlit tem:**
- BNCC dropdowns completos
- Número de estudantes, características da turma
- Seletor de motor
- Gerar dinâmica
- Validar / Refazer / Descartar
- Download DOCX + PDF

**Next.js tem:**
- Não existe

**Pendente:**
- [ ] Implementar aba completa
- [ ] API gerar-dinamica
- [ ] BNCC, qtd alunos, características
- [ ] Download DOCX + PDF

---

### 2.8 Plano de Aula DUA
**Streamlit tem:**
- BNCC dropdowns completos
- Metodologias ativas, recursos, duração, qtd alunos
- Download DOCX + PDF

**Next.js tem:**
- Implementação básica (campos simplificados)

**Pendente:**
- [ ] BNCC expander completo
- [ ] Download DOCX + PDF

---

## 3. Hub Educação Infantil (modo EI)

Quando o estudante está em série EI, o Hub exibe **abas diferentes**:
- Criar Experiência
- Estúdio Visual & CAA
- Rotina & AVD
- Inclusão no Brincar

**Next.js:** Não há distinção EI vs EF/EM.

**Pendente:**
- [ ] Detectar nível EI pelo grade/série do estudante
- [ ] Renderizar abas EI quando aplicável
- [ ] Implementar as 4 abas EI

---

## 4. PEI — Pendências

- [ ] Consultoria IA: múltiplos motores (red/blue/green/yellow/orange)
- [ ] Exportação DOCX/PDF do PEI completo
- [ ] Laudo PDF: opção de engine

---

## 5. PAEE — Pendências

- [ ] Jornada gamificada: geração com Gemini
- [ ] Mapa mental do roteiro (Gemini)
- [ ] Múltiplos motores nas metas/planejamento

---

## 6. Serviços e utilitários

| Serviço Streamlit | Uso | Next.js |
|-------------------|-----|---------|
| hub_docs.py | criar_docx_simples, criar_pdf_generico, construir_docx_final | Parcial (jspdf para PDF) |
| hub_ia.py | chat multi-engine, gerar_imagem_inteligente, gerar_pictograma_caa, _comprimir_imagem | Não migrado |
| hub_bncc_utils.py | dropdowns BNCC, ano_celula_contem, etc. | Parcial (API bncc) |
| omni_utils.py | chat_completion_multi_engine, get_gemini_api_key, etc. | Não migrado |

---

## 7. Priorização sugerida

1. **Alta:** Multi-engine (lib + variáveis de ambiente) — desbloqueia paridade de motores
2. **Alta:** Adaptar Atividade com Gemini (visão) — hoje depende de OpenAI que não faz OCR
3. **Alta:** Estúdio Visual & CAA — recurso muito usado
4. **Média:** Cropper + mapeamento de imagens em Adaptar Prova
5. **Média:** Roteiro Individual + Dinâmica Inclusiva
6. **Média:** DOCX de saída em todas as abas (construir_docx_final)
7. **Baixa:** Hub EI (4 abas específicas)
8. **Baixa:** BNCC dropdowns completos em todas as abas
