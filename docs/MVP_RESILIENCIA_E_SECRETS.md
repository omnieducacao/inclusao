# MVP: Resiliência e blindagem de secrets

Documento para rodar o MVP em produção e **blindar os secrets** para a escola não acessar configurações sensíveis.

---

## 1. Blindagem de secrets (escola não acessa)

### O que já está feito no código

- **Menu do Streamlit escondido**  
  Quando `ENV` não é `TESTE`, o menu (hambúrguer), rodapé, botões "Manage app", "Settings" e sidebar padrão são ocultados via CSS em `streamlit_app.py` e `ui_lockdown.py`.

- **Erros em produção não expõem chaves**  
  Em `supabase_client.py`, se `ENV != "TESTE"`, a mensagem de erro ao falhar Supabase é genérica:  
  *"Conexão com o banco de dados não disponível. Tente recarregar a página."*  
  Nomes de chaves do `st.secrets` (ex.: SUPABASE_URL, OPENAI_API_KEY) **nunca** aparecem para o usuário.

- **Detalhe de erro só em TESTE**  
  No `streamlit_app.py`, o texto completo da exceção (`st.code(str(e))`) só é exibido quando `ENV == "TESTE"`.

### O que você deve fazer no deploy (Streamlit Cloud / servidor)

1. **Não defina `ENV = "TESTE"` em produção**  
   Em produção, não coloque `ENV = "TESTE"` nos Secrets. Deixe sem `ENV` ou use algo como `ENV = "PRODUÇÃO"`. Assim, mensagens e erros continuam genéricos para a escola.

2. **Quem mexe em Secrets**  
   Apenas quem administra a aplicação (você / equipe técnica) deve acessar **Manage app → Settings → Secrets** no Streamlit Cloud. A escola usa só login e senha da plataforma; não precisa e não deve ver Secrets.

3. **`.streamlit/config.toml`**  
   O projeto já tem `showErrorDetails = false`. Isso evita que a tela de erro do Streamlit mostre traceback completo para o usuário.

---

## 2. Resiliência (quando algo quebra)

### Tela amigável em vez de crash

- No **entry point** (`streamlit_app.py`), o fluxo principal (router) está dentro de um `try/except`.
- Se ocorrer qualquer exceção não tratada, o usuário vê:
  - Mensagem: **"Algo deu errado. Recarregar a página."**
  - Botão **"Recarregar página"** que chama `st.rerun()`.
- Em produção não é mostrado detalhe técnico; em `ENV == "TESTE"` o código do erro ainda é exibido para debug.

### O que fazer quando a página “quebra” em produção

1. **Usuário (escola)**  
   Pedir para clicar em **Recarregar página**. Se persistir, avisar o suporte.

2. **Administrador**  
   - No Streamlit Cloud: **Manage app → Restart** (ou equivalente) para reiniciar o app.
   - Verificar logs (Manage app → Logs) para ver o erro real.
   - Para debug local, usar `ENV = "TESTE"` nos secrets **só em ambiente de teste**, nunca no mesmo app que a escola usa.

---

## 3. Eficiência e limite do Streamlit

- O app é grande (muitas páginas e lógica). Para reduzir risco de timeout e uso de memória:
  - **Imports pesados** já estão atrasados (lazy) onde faz sentido (ex.: dentro de funções ou no momento do uso).
  - **Secrets**: leitura com retry para Supabase evita falhas intermitentes no cold start.
- Se no futuro o app crescer muito, considere:
  - Quebrar módulos muito grandes em páginas ou componentes menores.
  - Reduzir dados carregados de uma vez (paginação, filtros).
  - Avaliar cache (`st.cache_data` / `st.cache_resource`) onde for seguro e útil.

---

## 4. Checklist rápido para MVP em produção

| Item | Conferir |
|------|----------|
| Secrets | `ENV` **não** é `TESTE` no app da escola |
| Supabase | `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` (ou ANON) no topo dos Secrets |
| Menu/Secrets | Menu do Streamlit e “Manage app” ocultos para o usuário (CSS) |
| Erros | Mensagens genéricas; sem nomes de chaves nem traceback para a escola |
| Quebra | Botão “Recarregar página” na tela de erro |
| Reinício | Saber onde fazer Restart do app (Streamlit Cloud / servidor) e onde ver logs |
