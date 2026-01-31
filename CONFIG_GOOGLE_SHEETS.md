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

**Streamlit (arquivo `.streamlit/secrets.toml`)** — duas formas:

**Forma 1 — JSON como string (aspas triplas):**
```toml
# Cole o JSON entre aspas triplas.
# Se o JSON tiver várias linhas, use \\n na private_key (barra dupla) para o app aceitar.
# O app também aceita newlines reais na private_key (TOML com \n vira newline; corrigimos no código).
GOOGLE_SHEETS_CREDENTIALS_JSON = """
{"type": "service_account", "project_id": "seu-projeto", "private_key_id": "...", "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n", "client_email": "...@....iam.gserviceaccount.com", ...}
"""
```
**Dica:** Se você colar o JSON em várias linhas e usar `\n` na chave privada, o TOML vira isso em newline e o JSON quebra. O app tenta corrigir isso automaticamente; se ainda falhar, use **uma linha só** e `\\n` na private_key.

**Forma 2 — Seção TOML (objeto):** crie uma seção com o nome da chave e preencha os campos do JSON. Exemplo (substitua pelos valores do seu arquivo):
```toml
[GOOGLE_SHEETS_CREDENTIALS_JSON]
type = "service_account"
project_id = "seu-projeto-id"
private_key_id = "abc123..."
private_key = "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
client_email = "sua-conta@seu-projeto.iam.gserviceaccount.com"
client_id = "123456789"
auth_uri = "https://accounts.google.com/o/oauth2/auth"
token_uri = "https://oauth2.googleapis.com/token"
auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs"
client_x509_cert_url = "https://www.googleapis.com/robot/v1/metadata/x509/..."
```

**Forma 3 — Seção `[google_sheets]`:** você pode agrupar tudo em uma seção. O app procura por `credentials_json` ou `credentials_path` dentro de `[google_sheets]`:
```toml
[google_sheets]
# Cole o JSON entre aspas triplas (uma linha só, com \n na private_key)
credentials_json = """{"type": "service_account", "project_id": "seu-projeto", "private_key_id": "...", "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n", "client_email": "...@....iam.gserviceaccount.com", ...}"""
# Opcional: planilha de destino
GOOGLE_SHEETS_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/SEU_ID/edit?usp=sharing"
```

**Importante:** o nome da chave no `secrets.toml` deve ser exatamente um dos que o app reconhece (veja mensagem de erro no app). O arquivo deve ficar em **`.streamlit/secrets.toml`** na raiz do projeto (mesmo nível de `streamlit_app.py` ou `pages/`).

---

## 5. Planilha de destino (opcional)

Se você quiser que **todas** as exportações da Jornada Gamificada vão para **uma planilha fixa** (em vez de criar uma nova planilha a cada exportação), configure o **ID** ou a **URL** dessa planilha. O app vai abrir essa planilha e **adicionar uma nova aba** a cada exportação (ex.: "Jornada Gamificada - Maria", "Jornada Gamificada - João").

1. **Compartilhe a planilha** com o e-mail da conta de serviço (o `client_email` do JSON), dando permissão de **Editor**.
2. No `.streamlit/secrets.toml` ou em variável de ambiente:

```toml
# Opção 1: URL da planilha (o app extrai o ID)
GOOGLE_SHEETS_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1cJHZAq-hwDvDEbOrt9yc9TdVs_CoKrBW4FTsgFiNZi0/edit?usp=sharing"

# Opção 2: só o ID
GOOGLE_SHEETS_SPREADSHEET_ID = "1cJHZAq-hwDvDEbOrt9yc9TdVs_CoKrBW4FTsgFiNZi0"
```

Se **não** configurar ID/URL, o app continua criando uma **nova planilha** a cada exportação (comportamento antigo).

---

## 6. Ordem de leitura no app

O app usa, nesta ordem:

1. **GOOGLE_SHEETS_CREDENTIALS_JSON** — variável de ambiente (string JSON) ou `st.secrets` (string JSON **ou** seção TOML como objeto)
2. **GOOGLE_SHEETS_CREDENTIALS_PATH** — variável de ambiente ou `st.secrets` (caminho do arquivo JSON)

Para **onde** escrever:

- Se **GOOGLE_SHEETS_SPREADSHEET_ID** ou **GOOGLE_SHEETS_SPREADSHEET_URL** estiver configurado: abre essa planilha e **adiciona uma nova aba** com o conteúdo da jornada.
- Caso contrário: **cria uma nova planilha** a cada exportação.

---

## 7. Onde usar no app

Depois de aprovar uma **Jornada Gamificada** na aba **Jornada Gamificada** do PAE, o botão **Exportar para Google Sheets** cria uma nova planilha com o texto da missão (uma coluna, cada linha = um parágrafo) e exibe o link para abrir.

Se as credenciais não estiverem configuradas, será exibida uma mensagem pedindo para configurar; você ainda pode usar **Baixar CSV** e importar manualmente no Google Sheets (Arquivo → Importar).

---

## 8. Segurança

- **Nunca** commite o arquivo JSON da conta de serviço no Git. Adicione ao `.gitignore`, por exemplo:  
  `credenciais-google-sheets.json` ou `*-google-*.json`.
- Em produção (Render, Streamlit Cloud), use variáveis de ambiente ou secrets, não arquivos no repositório.
