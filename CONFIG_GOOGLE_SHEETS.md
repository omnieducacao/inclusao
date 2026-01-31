# Configurar Google Sheets (exportar Jornada Gamificada)

A exportação da **Jornada Gamificada** para o Google Sheets usa uma **conta de serviço** do Google Cloud. Siga os passos abaixo.

---

## 1. Criar projeto no Google Cloud (se ainda não tiver)

1. Acesse [Google Cloud Console](https://console.cloud.google.com/).
2. No topo, clique em **Selecionar projeto** → **Novo projeto**.
3. Dê um nome (ex.: `Omnisfera Sheets`) e clique em **Criar**.

---

## 2. Ativar as APIs necessárias

1. No menu lateral: **APIs e serviços** → **Biblioteca**.
2. Pesquise e ative:
   - **Google Sheets API**
   - **Google Drive API** (para criar planilhas)

---

## 3. Criar conta de serviço

1. Menu lateral: **APIs e serviços** → **Credenciais**.
2. Clique em **+ Criar credenciais** → **Conta de serviço**.
3. Nome (ex.: `omnisfera-sheets`) → **Criar e continuar**.
4. Em “Conceder acesso ao projeto”, pode pular (Concluir).
5. Na lista de contas de serviço, clique na que você criou.
6. Aba **Chaves** → **Adicionar chave** → **Criar nova chave** → **JSON** → **Criar**.  
   O arquivo JSON será baixado (guarde em local seguro, não commite no Git).

---

## 4. Configurar no Omnisfera

Há **duas** formas de informar as credenciais.

### Opção A — Caminho do arquivo (bom para desenvolvimento local)

1. Coloque o arquivo JSON da conta de serviço em uma pasta do seu computador (ex.: `~/omnisfera/credenciais-google-sheets.json`).
2. Defina a variável de ambiente **ou** o secret do Streamlit:

**Variável de ambiente (terminal / .env):**
```bash
export GOOGLE_SHEETS_CREDENTIALS_PATH="/caminho/completo/para/credenciais-google-sheets.json"
```

**Streamlit (arquivo `.streamlit/secrets.toml`):**
```toml
GOOGLE_SHEETS_CREDENTIALS_PATH = "/caminho/completo/para/credenciais-google-sheets.json"
```

### Opção B — JSON como texto (bom para Render / Streamlit Cloud)

1. Abra o arquivo JSON da conta de serviço em um editor de texto.
2. Copie **todo** o conteúdo (um único objeto JSON em uma linha ou formatado).
3. Defina a variável de ambiente **ou** o secret:

**Variável de ambiente:**
```bash
export GOOGLE_SHEETS_CREDENTIALS_JSON='{"type":"service_account","project_id":"...", ...}'
```

**Streamlit (arquivo `.streamlit/secrets.toml`):**
```toml
# Cole o JSON entre aspas triplas (evita problemas com aspas internas)
GOOGLE_SHEETS_CREDENTIALS_JSON = """
{"type": "service_account", "project_id": "seu-projeto", "private_key_id": "...", "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n", "client_email": "...@....iam.gserviceaccount.com", "client_id": "...", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", ...}
"""
```

---

## 5. Ordem de leitura no app

O app usa, nesta ordem:

1. **GOOGLE_SHEETS_CREDENTIALS_JSON** (variável de ambiente ou `st.secrets`)
2. **GOOGLE_SHEETS_CREDENTIALS_PATH** (caminho do arquivo JSON)

Se uma delas estiver preenchida e correta, a exportação para o Google Sheets funcionará.

---

## 6. Onde usar no app

Depois de aprovar uma **Jornada Gamificada** na aba **Jornada Gamificada** do PAE, o botão **Exportar para Google Sheets** cria uma nova planilha com o texto da missão (uma coluna, cada linha = um parágrafo) e exibe o link para abrir.

Se as credenciais não estiverem configuradas, será exibida uma mensagem pedindo para configurar; você ainda pode usar **Baixar CSV** e importar manualmente no Google Sheets (Arquivo → Importar).

---

## Segurança

- **Nunca** commite o arquivo JSON da conta de serviço no Git. Adicione ao `.gitignore`, por exemplo:  
  `credenciais-google-sheets.json` ou `*-google-*.json`.
- Em produção (Render, Streamlit Cloud), use variáveis de ambiente ou secrets, não arquivos no repositório.
