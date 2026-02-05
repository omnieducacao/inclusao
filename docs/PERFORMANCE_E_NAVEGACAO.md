# Performance e Navegação — Otimizações e Boas Práticas

## O que já foi feito (otimizações)

### 1. Uso de IA não bloqueia mais a interface
- **`track_ia_usage`** passa a rodar em **thread em background** (fire-and-forget). O registro de uso no Supabase não segura a resposta ao usuário.
- **Timeout** do POST de `log_ia_usage` reduzido para **3s** (antes 10s), para a thread não ficar presa.

### 2. Menos chamadas ao banco no fluxo de IA
- **`get_workspace_plan`** usa **cache em memória** (TTL 5 minutos) por `workspace_id`. A verificação de plano (omnigreen só no robusto) não dispara uma requisição ao Supabase a cada chamada.

### 3. PDF do relatório PEI
- **Margens e layout**: margens laterais 15 mm, superior 20 mm, inferior 22 mm; largura útil padronizada (180 mm).
- **Cabeçalho**: altura 42 mm, linha separatória, cores mais neutras (slate).
- **Seções**: barra de título com fundo suave (241,245,249), mais espaço entre seções (ln(8) e ln(6)).
- **Rodapé**: “Página N | Gerado via Omnisfera” com cor discreta.
- **Itens com bullet**: espaçamento vertical 6 pt, cor de texto padronizada para leitura.

---

## Duplo clique no menu / navegação

Em Streamlit, o **menu (option_menu)** e o **rerun** podem fazer com que o primeiro clique só mude o estado do widget e o **segundo clique** de fato dispare a troca de página. Isso é comum quando:
- o script roda de novo com o mesmo `active_tab`;
- o valor “selecionado” só é aplicado no ciclo seguinte.

**O que já está no código:** ao final de `render_navbar`, se `selected != active_tab`, é chamado `st.switch_page(target)`.

**Se o duplo clique continuar:**
1. **Testar** em modo “run on save” desligado, para ver se o comportamento muda.
2. **Alternativa futura:** usar links reais (`st.link_button` ou markdown com `?page=...`) para troca de página, garantindo um único clique (com recarregamento da página).
3. **Fragmentos:** em páginas pesadas, usar `@st.fragment` em blocos que não precisam rodar a página inteira, para reduzir reruns e deixar a navegação mais estável.

---

## Navegação — boas práticas

- **Módulos habilitados:** `get_enabled_modules()` já é cacheado em `st.session_state.enabled_modules` para não refazer consulta a cada render do navbar.
- **Evitar lógica pesada antes do navbar:** o que for possível (chamadas a API, leitura de banco) deve ficar depois do header/navbar ou dentro de `st.fragment`, para o menu aparecer rápido.
- **Botões críticos:** ações que disparam rerun (ex.: “Gerar relatório”, “Salvar”) devem estar fora de `st.form` se precisarem de um único clique; dentro de form, o clique dispara o submit e um único rerun.

---

## Resumo técnico

| Item | Onde | O que fazer |
|------|------|-------------|
| Registro de uso de IA | `omni_utils.track_ia_usage` | Thread em background (já feito) |
| Plano da escola | `admin_service.get_workspace_plan` | Cache 5 min (já feito) |
| Timeout do POST de uso | `monitoring_service.log_ia_usage` | 3s (já feito) |
| PDF PEI | `pages/1_PEI.py` (PDF_Classic, gerar_pdf_final) | Margens, cabeçalho, seções (já feito) |
| Duplo clique navbar | `omni_utils.render_navbar` | Monitorar; se persistir, testar links ou fragmentos |
