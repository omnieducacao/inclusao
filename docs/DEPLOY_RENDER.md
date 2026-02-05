# Deploy da Omnisfera no Render

Guia rápido para o menu e o login funcionarem corretamente no Render.

---

## 1. Comando de start (obrigatório)

O **entry point** do app deve ser sempre **`streamlit_app.py`**:

```bash
streamlit run streamlit_app.py --server.port=$PORT --server.address=0.0.0.0 --server.headless=true
```

- **Por quê:** O login e o controle de sessão estão no `streamlit_app.py`. Se você rodar outro arquivo (ex.: `pages/0_Home.py`), o usuário não passa pelo login e cada “página” pode abrir em sessão nova (pedindo login de novo).
- **No Render:** Em **Web Service → Build & Deploy → Start Command**, use exatamente o comando acima. A variável `$PORT` o Render já define.

---

## 2. Menu e navegação

- O menu usa **`st.switch_page(...)`** para trocar de tela **dentro do mesmo app**.
- Com isso, **a sessão é mantida**: `st.session_state` (incluindo `autenticado`, `workspace_id`, etc.) **continua igual** ao mudar de página.
- Ou seja: **sim, ao mudar de página pelo menu o usuário continua logado.**

Se o menu “não navegava” ou “pedia login toda vez” no Render, as causas mais comuns são:

1. **Start command errado**  
   Estava rodando outro script (ex.: `streamlit run pages/0_Home.py`) em vez de `streamlit run streamlit_app.py`. Corrija para o comando da seção 1.

2. **Acesso por URL direta a uma página**  
   Se o usuário abrir direto uma URL do tipo `.../page/2_PAEE` (ou similar), o Render pode abrir essa “página” em uma sessão nova. O fluxo correto é: **sempre entrar pela URL raiz do app** (onde roda o `streamlit_app.py`), fazer login e usar o menu para navegar.

3. **Key do menu**  
   O menu usa `key="omni_navbar"` para ter identidade estável em qualquer host (incluindo Render). Isso já está no código.

---

## 3. Variáveis de ambiente no Render

No Render, use **Environment** (variáveis de ambiente), não `st.secrets`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` (ou `SUPABASE_ANON_KEY`)
- `ENV` = deixe em branco ou `PRODUÇÃO` (não use `TESTE` em produção)

Opcionais, conforme uso:

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

O código lê primeiro `os.environ`, depois `st.secrets`, então no Render as variáveis de ambiente são suficientes.

---

## 4. Checklist rápido

| Item | Conferir |
|------|----------|
| Start command | `streamlit run streamlit_app.py --server.port=$PORT --server.address=0.0.0.0 --server.headless=true` |
| Entrada do usuário | Sempre pela URL base do app (não por URL de “página” específica) |
| Navegação | Só pelo menu do app (assim a sessão e o login são mantidos) |
| Env vars | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (ou ANON), e `ENV` não = TESTE |

Com isso, o menu deve navegar entre as páginas e o usuário **permanece logado** ao trocar de página.
