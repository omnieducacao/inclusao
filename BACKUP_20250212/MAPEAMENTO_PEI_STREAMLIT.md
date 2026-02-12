# MAPEAMENTO COMPLETO PEI - Streamlit vs Next.js

## ESTRUTURA DE ABAS

### Streamlit (ordem exata):
1. **INÍCIO** (tab0)
2. **ESTUDANTE** (tab1)
3. **EVIDÊNCIAS** (tab2)
4. **REDE DE APOIO** (tab3)
5. **MAPEAMENTO** (tab4)
6. **PLANO DE AÇÃO** (tab5)
7. **MONITORAMENTO** (tab6)
8. **BNCC** (tab7_hab)
9. **CONSULTORIA IA** (tab8)
10. **DASHBOARD & DOCS** (tab9)

### Next.js atual:
✅ Mesma ordem - OK

---

## ABA INÍCIO (tab0)

### Streamlit:
- **Layout**: 2 colunas `[1.15, 0.85]`
- **Coluna Esquerda**:
  - Container: "Fundamentos do PEI" (com ícone)
  - Container: "Como usar a Omnisfera" (com ícone)
  - Expander: "📘 PEI/PDI e a Prática Inclusiva — Amplie o conhecimento" (expandido=False)
    - Texto completo sobre PEI/PDI
    - Registros fundamentais
    - Avaliação da aprendizagem
    - Caption: "A família deve acompanhar..."
- **Coluna Direita**:
  - Título: "Gestão de Estudantes" (com ícone)
  - Status vínculo (success/warning)
  - Container: "1) Carregar Backup Local (.JSON)"
    - File uploader
    - Expander "👀 Prévia do backup"
    - Botões: "📥 Carregar no formulário" (primary) | "🧹 Limpar pendência"
  - Container: "🌐 Omnisfera Cloud"
    - Botão "🔗 Sincronizar Tudo" (primary)
    - Após sucesso: download_button "📂 BAIXAR BACKUP (.JSON)"

### Next.js atual:
- ✅ Layout 2 colunas OK
- ✅ Fundamentos OK
- ✅ Como usar OK
- ✅ Expander PEI/PDI: texto completo implementado
- ✅ Gestão de Estudantes OK
- ✅ Backup JSON OK
- ✅ Cloud Sync OK

---

## ABA ESTUDANTE (tab1)

### Streamlit:
- `render_progresso()` no topo
- Título: "### <i class='ri-user-smile-line'></i> Dossiê do Estudante"
- **Identificação** (5 colunas `[3, 2, 2, 1, 2]`):
  - c1: Nome Completo (text_input)
  - c2: Nascimento (date_input, default=date(2015,1,1))
  - c3: Série/Ano (selectbox com lista construída)
    - Badge do segmento aparece logo abaixo do selectbox
    - Caption com descrição do segmento
  - c4: Turma (text_input)
  - c5: Matrícula / RA (text_input, placeholder="Ex: 2026-001234")
- `st.divider()`
- **Histórico & Contexto Familiar**:
  - Título: "##### Histórico & Contexto Familiar"
  - 2 colunas: Histórico Escolar | Dinâmica Familiar
  - multiselect: "Quem convive com o estudante?" (help text incluído)
- `st.divider()`
- **Laudo PDF + Extração IA**:
  - Título: "##### 📎 Laudo (PDF) + Extração Inteligente"
  - Layout: `[2, 1]` colunas, vertical_alignment="center"
  - col_pdf: file_uploader (label_visibility="collapsed")
  - col_action: botão "✨ Extrair Dados do Laudo" (primary, use_container_width)
  - Revisão de medicações extraídas (container border, 3 colunas por medicação)
- `st.divider()`
- **Contexto Clínico**:
  - Título: "##### Contexto Clínico"
  - text_input: "Diagnóstico"
  - Container border:
    - toggle: "💊 O estudante faz uso contínuo de medicação?"
    - Se toggle=True: 3 colunas [3, 2, 2] para adicionar medicação
    - Lista de medicações com info() e botão "Excluir"

### Next.js atual:
- ✅ `render_progresso()` implementado no topo
- ✅ Título com ícone OK
- ✅ Identificação 5 colunas OK
- ✅ Badge segmento OK
- ✅ Histórico 2 colunas OK
- ✅ Composição familiar OK
- ✅ Laudo PDF layout OK
- ⚠️ Revisão medicações: precisa verificar estrutura completa
- ✅ Contexto Clínico OK
- ✅ Toggle medicação OK

---

## ABA EVIDÊNCIAS (tab2)

### Streamlit:
- `render_progresso()` no topo
- Título: "### <i class='ri-search-eye-line'></i> Coleta de Evidências"
- selectbox: "Hipótese de Escrita" (help="Nível de apropriação do sistema de escrita (Emília Ferreiro).")
- `st.divider()`
- caption: "Marque as evidências observadas na rotina do estudante..."
- **3 colunas**:
  - c1: **Pedagógico** (4 toggles)
  - c2: **Cognitivo** (4 toggles)
  - c3: **Comportamental** (4 toggles)
- `st.divider()`
- Título: "##### Observações rápidas"
- text_area: "Registre observações de professores e especialistas (se houver)" (height=120)

### Next.js atual:
- ✅ `render_progresso()` implementado no topo
- ✅ Título OK
- ✅ Hipótese de Escrita OK
- ✅ 3 colunas OK
- ✅ Observações OK

---

## ABA REDE DE APOIO (tab3)

### Streamlit:
- `render_progresso()` no topo
- Título: "### <i class='ri-team-line'></i> Rede de Apoio"
- caption: "Selecione os profissionais envolvidos..."
- multiselect: "Profissionais:" (help text)
- Limpeza automática de chaves removidas
- `st.divider()`
- Expander: "🗒️ Anotações gerais (opcional)" (expanded=False)
  - text_area: "Orientações clínicas gerais / resumo" (placeholder, height=140)
- Título: "#### {icon_title('Orientações por profissional', 'info', 20, '#0EA5E9')}"
- Se não selecionados: st.info("Selecione ao menos um profissional...")
- **2 colunas** para cards de profissionais:
  - Container border
  - Título: "{icon} {prof}"
  - text_area: "Observações / orientações" (placeholder, height=140)
  - 2 colunas: botão "🧹 Limpar" | botão "🗑️ Remover profissional"
- `st.divider()`
- Se selecionados: Checklist de preenchimento (resumo visual)

### Next.js atual:
- ✅ `render_progresso()` implementado no topo
- ✅ Título OK
- ✅ Multiselect OK
- ✅ Expander "Anotações gerais" implementado
- ✅ Orientações por profissional OK
- ✅ Checklist de preenchimento implementado

---

## ABA MAPEAMENTO (tab4)

### Streamlit:
- `render_progresso()` no topo
- Título: "### <i class='ri-radar-line'></i> Mapeamento"
- caption: "Mapeie forças, hiperfocos e barreiras..."
- **Container border**: "Potencialidades e Hiperfoco"
  - 2 colunas:
    - c1: text_input "Hiperfoco (se houver)" (placeholder)
    - c2: multiselect "Potencialidades / Pontos fortes"
- `st.divider()`
- Título: "#### {icon_title('Barreiras e nível de apoio', 'configurar', 20, '#0EA5E9')}"
- caption: "Selecione as barreiras observadas..."
- **3 colunas** para domínios:
  - c_bar1: Funções Cognitivas | Sensorial e Motor
  - c_bar2: Comunicação e Linguagem | Acadêmico
  - c_bar3: Socioemocional
- Cada domínio:
  - Container border
  - Título: "**{dominio}**"
  - multiselect (label_visibility="collapsed")
  - Se selecionadas:
    - "---"
    - "**Nível de apoio por barreira**"
    - caption com explicação da escala
    - Para cada barreira: 2 colunas [2.2, 2.8]
      - colA: "**{barreira}**"
      - colB: select_slider com 4 opções + help text
  - text_area "Observações (opcional)" (placeholder, height=90)
- Limpeza automática de níveis de suporte
- `st.divider()`
- Título: "#### {icon_title('Resumo do Mapeamento', 'pei', 20, '#0EA5E9')}"
- 2 colunas:
  - r1: Hiperfoco (success/info) | Potencialidades (success/info)
  - r2: Barreiras selecionadas (warning/info) com lista detalhada

### Next.js atual:
- ✅ `render_progresso()` implementado no topo
- ✅ Título OK
- ✅ Potencialidades e Hiperfoco OK
- ✅ 3 colunas domínios OK
- ✅ Slider: range input implementado (equivalente ao select_slider)
- ✅ Observações OK
- ✅ Resumo OK

---

## ABA PLANO DE AÇÃO (tab5)

### Streamlit:
- `render_progresso()` no topo
- Título: "### <i class='ri-puzzle-line'></i> Plano de Ação"
- **3 colunas**:
  - c1: "#### 1) Acesso (DUA)"
    - multiselect "Recursos de acesso"
    - text_input "Personalizado (Acesso)" (placeholder)
  - c2: "#### 2) Ensino (Metodologias)"
    - multiselect "Estratégias de ensino"
    - text_input "Personalizado (Ensino)" (placeholder)
  - c3: "#### 3) Avaliação (Formato)"
    - multiselect "Estratégias de avaliação"
    - caption: "Dica: combine formato + acesso..."
- `st.divider()`
- st.info("✅ O plano de ação alimenta a Consultoria IA...")

### Next.js atual:
- ✅ `render_progresso()` implementado no topo
- ✅ Título OK
- ✅ 3 colunas OK
- ✅ Multiselects OK
- ✅ Textos personalizados OK
- ✅ Info box OK

---

## ABA MONITORAMENTO (tab6)

### Streamlit:
- `render_progresso()` no topo
- Título: "### <i class='ri-loop-right-line'></i> Monitoramento"
- date_input: "Data da Próxima Revisão" (default=date.today())
- `st.divider()`
- st.warning("⚠️ Preencher esta aba principalmente na REVISÃO do PEI...")
- Container border:
  - 2 colunas:
    - c2: selectbox "Status da Meta" (5 opções)
    - c3: selectbox "Parecer Geral" (5 opções)
  - multiselect "Ações Futuras" (6 opções)

### Next.js atual:
- ✅ `render_progresso()` implementado no topo
- ✅ Título OK
- ✅ Data OK
- ✅ Warning OK
- ✅ 2 colunas OK
- ✅ Multiselect OK

---

## ABA BNCC (tab7_hab)

### Streamlit:
- `render_progresso()` no topo
- Título: "### <i class='ri-list-check-2'></i> BNCC"
- Se não tem série: warning + st.stop()
- **Educação Infantil**:
  - caption explicativo
  - 2 colunas: Faixa de Idade | Campo de Experiência
  - multiselect: Objetivos de Aprendizagem
  - st.info("👉 Com os campos e objetivos selecionados...")
  - st.stop()
- **EF/EM**:
  - caption explicativo
  - Expander: "📋 Habilidades selecionadas" (expanded=bool(selecionadas))
    - Se tem motivo IA: mostrar motivo
    - Lista de habilidades com botão "Remover"
    - Botão "Desmarcar todas"
  - Expander: "Habilidades do ano/série atual"
    - Por disciplina (accordion)
    - Botão "🤖 Auxílio IA" (com loading)
    - multiselect por disciplina
  - Expander: "Habilidades de anos anteriores"
    - Similar ao atual

### Next.js atual:
- ✅ `render_progresso()` implementado no topo
- ✅ Título OK
- ✅ EI OK
- ✅ EF/EM OK
- ✅ Expanders OK
- ✅ IA suggestions OK

---

## ABA CONSULTORIA IA (tab8)

### Streamlit:
- `render_progresso()` no topo
- Título: "### <i class='ri-robot-2-line'></i> Consultoria Pedagógica"
- Se não tem série: warning + st.stop()
- Box informativo com segmento
- **Se rascunho ou sem texto**:
  - Expander: "🔧 Escolher motor de IA" (expanded=True)
    - radio horizontal com 5 motores
  - 2 colunas:
    - col_btn: botões "✨ Gerar Estratégia Técnica" | "🧰 Gerar Guia Prático"
    - col_info: info box com estatísticas
- **Se revisão/aprovado**:
  - Expander: "🧠 Como a IA construiu este relatório"
  - text_area: "Sugestão IA (consultoria)" (readonly?)
  - Status: selectbox "Status da Validação"
  - Se revisão: text_area "Feedback para ajuste"
  - Botões: "✅ Aprovar PEI" | "🔄 Gerar novamente"

### Next.js atual:
- ✅ `render_progresso()` implementado no topo
- ✅ Título OK
- ✅ Motores OK
- ✅ Expander "Como a IA construiu" implementado
- ✅ Status de validação implementado
- ✅ Feedback para ajuste implementado
- ✅ Botão "Aprovar PEI" implementado

---

## ABA DASHBOARD (tab9)

### Streamlit:
- `render_progresso()` no topo
- Título: "### <i class='ri-file-pdf-line'></i> Dashboard e Exportação"
- CSS customizado (_ensure_dashboard_css)
- Se não tem nome: info + st.stop()
- **Hero** (dash-hero):
  - Avatar circular com inicial
  - Nome, série, turma, matrícula
  - Status vínculo
  - Idade (lado direito)
- **KPIs** (4 colunas):
  - Potencialidades (donut chart)
  - Barreiras (donut chart)
  - Hiperfoco (emoji + texto)
  - Nível de Atenção (complexidade)
- **Cards principais** (2 colunas):
  - c_r1: Atenção Farmacológica | Cronograma de Metas | Radar Curricular
  - c_r2: Rede de Apoio | DNA de Suporte
- **Exportação**:
  - Botões: DOCX | PDF | JSON
- **Jornada Gamificada**:
  - text_area "ia_mapa_texto"

### Next.js atual:
- ✅ `render_progresso()` implementado no topo
- ✅ CSS customizado completo implementado
- ✅ Hero completo implementado
- ✅ KPIs com donut charts implementados
- ✅ Cards principais completos implementados
- ✅ Exportação básica OK
- ✅ Jornada Gamificada OK

---

## FUNÇÃO render_progresso()

### Streamlit:
- Calcula progresso via `calcular_progresso()`
- Barra de progresso com logo giratório
- Cores: vermelho/laranja (<100%) | verde (100%)
- Logo aparece na posição do progresso

### Next.js atual:
- ✅ IMPLEMENTADO - `RenderProgresso` componente com barra de progresso e logo giratório

---

## FUNÇÃO calcular_progresso()

### Streamlit:
- Checkpoints: ["ESTUDANTE", "EVIDENCIAS", "REDE", "MAPEAMENTO", "PLANO", "MONITORAMENTO", "IA", "DASH"]
- Função `_aba_ok()` verifica cada checkpoint
- Retorna porcentagem (0-100)

### Next.js atual:
- ✅ IMPLEMENTADO - `RenderProgresso` componente com barra de progresso e logo giratório

---

## DIFERENÇAS CRÍTICAS IDENTIFICADAS

1. ✅ **render_progresso()** implementado em todas as abas
2. ✅ **calcular_progresso()** implementado
3. ✅ **Dashboard**: CSS customizado, Hero completo, KPIs com donut charts implementados
4. ✅ **Consultoria IA**: status de validação, feedback, aprovação implementados
5. ✅ **Rede de Apoio**: Expander "Anotações gerais" e Checklist implementados
6. ✅ **Mapeamento**: slider range input implementado (equivalente ao select_slider)
7. ⚠️ **Estudante**: revisão de medicações precisa verificar estrutura completa
8. ✅ **Início**: Expander PEI/PDI texto completo implementado

---

## PRÓXIMOS PASSOS

1. Implementar `render_progresso()` e `calcular_progresso()`
2. Completar Dashboard com CSS e componentes faltantes
3. Adicionar funcionalidades faltantes na Consultoria IA
4. Verificar e completar todas as seções marcadas com ⚠️
5. Testar cada aba comparando lado a lado com Streamlit
