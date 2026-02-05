# Pente fino: layout menu→hero, lentidão e loading

**Objetivo:** Documentar o estado atual para planejar melhorias. **Não implementar** ainda — a última tentativa causou perda de conteúdo.

---

## 1. Espaço entre menu de navegação e card hero

### Comparativo por página

| Página | `block-container` padding-top | `mod-card-wrapper` margin-top | Estrutura do hero |
|--------|------------------------------|-------------------------------|-------------------|
| **0_Home** | **100px** (fixo) | N/A (hero-wrapper) | Topbar 80px própria + **hero-wrapper** (banner azul) + cards de módulos |
| **1_PEI** | 0 | **-96px** | mod-card-wrapper |
| **2_PAEE** | 0 | **-120px** | mod-card-wrapper |
| **3_Hub** | 0 | **-96px** | mod-card-wrapper |
| **4_Diário** | 0 | **-96px** | mod-card-wrapper |
| **5_Monitoramento** | 0 | **-128px** | mod-card-wrapper |
| **6_Gestão** | 1rem | 0 | mod-card-wrapper (sem margin negativo) |
| **7_Config** | 1rem | 0 | Sem hero padrão |
| **8_Admin** | padrão | N/A | Sem hero mod-card |
| **9_PGI** | 0 | **-120px** | mod-card-wrapper |
| **Estudantes** | 1rem | 0 | mod-card-wrapper (sem margin negativo) |

### Inconsistências

1. **Margin-top negativos diferentes:** -96px (PEI, Hub, Diário), -120px (PAEE, PGI), -128px (Monitoramento). O espaço visível entre navbar e hero varia entre as páginas.

2. **Home é um caso à parte:**
   - Usa `render_topbar()` próprio (não `render_omnisfera_header`)
   - `block-container` com `padding-top: 100px`
   - Hero = `hero-wrapper` (banner azul grande), não `mod-card-wrapper`
   - Não usa `forcar_layout_hub()` nem margin negativo no hero

3. **CSS espalhado:** `forcar_layout_hub()` está definida em várias páginas com trechos quase iguais. Qualquer ajuste exige alterar vários arquivos.

4. **Ordem de especificidade:** O `inject_hero_card_css()` em omni_utils define `.mod-card-wrapper { margin-top: 0 }`. As páginas sobrescrevem com CSS local (ex.: `-96px`). A precedência depende da ordem de injeção.

### Onde o espaço “sobra”

O espaço entre navbar e hero vem de:
- `block-container` padding-top (topbar_h + navbar_h + content_gap = 56+44+0 = 100px nas páginas que usam `inject_layout_css`)
- Menos o `margin-top` negativo do `.mod-card-wrapper`

Se `margin-top: -96px`, o hero “sobe” 96px, mas ainda fica um gap de ~4px (100 - 96). Se -120px, sobe mais; se -128px (Monitoramento), ainda mais. A diferença de 32px entre -96 e -128 explica a sensação de “em algumas páginas está mais colado que em outras”.

---

## 2. Lentidão da plataforma

### Já feito
- `track_ia_usage` em thread (não bloqueia)
- `get_workspace_plan` com cache 5 min
- Timeout do POST de uso: 3s

### Possíveis causas restantes
- Reruns do Streamlit em excesso (cada interação reexecuta o script)
- Carregamento inicial pesado: `get_enabled_modules` chama Supabase; `get_workspace` em várias operações
- Muitos `st.markdown` com CSS grande por página
- `forcar_layout_hub` e CSS específico injetados em cada página
- Chamadas de IA (DeepSeek, Kimi, Gemini) que naturalmente levam segundos

### Sugestões para aprofundar
- Usar `@st.fragment` em blocos que não precisam rerun completo
- Reduzir número de blocos `st.markdown` de CSS (consolidar em omni_utils)
- Avaliar cache de `get_workspace` para outros usos além do plano

---

## 3. Loading atual vs. proposta

### Estado atual

**Onde está definido:** `omni_utils.inject_loading_overlay_css()`

**Comportamento:**
- Quando aparece `[data-testid="stSpinner"]`, vira overlay fullscreen (z-index 999999)
- Fundo semi-transparente `rgba(255,255,255,0.52)`
- No **centro da tela**: ícone `omni_icone.png` girando (0.9s) + texto abaixo (ex.: “Gerando com omnired...”)
- Usado em PEI, PAEE, Hub, etc. sempre que há `st.spinner` com mensagem de loading de IA

**Home:**
- Topbar própria com `brand-logo` (animation: spin 45s — gira devagar)
- Se houver spinner na Home, usa o mesmo overlay (ícone no centro)

### Proposta do usuário (documentar, não implementar)

1. **Barra superior (topbar):**
   - O logo da Omnisfera hoje gira lentamente na Home (45s).
   - Nas páginas internas, o header (`render_omnisfera_header`) usa logo 32x32 **sem** animação.
   - Ideia: durante o loading, colocar um logo **girando rápido** exatamente em cima do logo da topbar, dando a impressão de que o círculo que rodava devagar passou a girar rápido.
   - Na barra superior, exibir mensagem tipo “Omnisfera pensando” ou similar.

2. **Centro da tela:**
   - Em vez do ícone girando no centro, uma **mensagem objetiva** sobre o motor (omnired, omniblue etc.) e o tempo/status.

3. **Home:**
   - Manter o loading como está (ícone girando no centro).

### Diferença Home vs. demais páginas

| Aspecto | Home | Páginas internas |
|---------|------|------------------|
| Topbar | `render_topbar()` — logo com `animation: spin 45s` | `render_omnisfera_header()` — logo 32px, sem animação |
| Loading overlay | Mesmo overlay (ícone centro) | Seria o novo (logo rápido na topbar + mensagem centro) |

### Desafios técnicos da proposta

1. **Logo na topbar:** O header é HTML estático. O spinner é um elemento separado que aparece quando `st.spinner` está ativo. Para “colocar logo girando em cima do logo”, seria preciso:
   - Ou um overlay que posicione o logo rápido exatamente sobre o logo da topbar (position: fixed, coordenadas)
   - Ou um estado global (session_state) que altere o CSS da topbar quando loading = true (mais complexo no modelo atual)

2. **Mensagem por motor:** O `get_loading_message(engine)` já retorna texto. O spinner usa `st.spinner(msg)`. A mensagem elegante no centro poderia vir dessa função, só que formatada de forma diferente.

3. **Home diferente:** Detectar se estamos na Home (ex.: `st.session_state` ou path) e aplicar o overlay antigo só lá; nas demais, o novo comportamento.

---

## 4. Resumo de arquivos relevantes

| Tema | Arquivos |
|------|----------|
| Layout base | `omni_utils.py` — `inject_layout_css`, `inject_hero_card_css`, `inject_hero_card_colors` |
| Header/topbar | `omni_utils.py` — `render_omnisfera_header`; `0_Home.py` — `render_topbar` |
| Loading overlay | `omni_utils.py` — `inject_loading_overlay_css` |
| Hero margin por página | `1_PEI.py`, `2_PAEE.py`, `3_Hub_Inclusao.py`, `4_Diario_de_Bordo.py`, `5_Monitoramento_Avaliacao.py`, `9_PGI.py` — função `forcar_layout_hub` / `forcar_layout_pgi` e CSS local |
| Mensagens de loading | `omni_utils.py` — `LOADING_MESSAGES`, `get_loading_message` |

---

## 5. Próximos passos (planejamento)

1. **Espaço menu→hero:** Unificar `margin-top` em um valor (ex.: -110px ou -115px) em todas as páginas que usam hero mod-card, e revisar a Home à parte.
2. **Loading:** Prototipar o novo conceito (logo rápido na topbar + mensagem centro) em uma branch separada antes de aplicar.
3. **Lentidão:** Medir onde o tempo é gasto (profiling) e testar `st.fragment` em blocos pesados.
4. **Antes de mexer:** Fazer backup/commit do estado atual para evitar perda de alterações.
