# Contexto completo: Planilha + Jornada Gamificada (para Google AI Studio)

Este documento fornece **todo o contexto** necessário para o Google AI Studio ajustar o app **Minha Jornada** (React gamificado) que lê dados de uma planilha Google Sheets.

---

## 0. ESPECIFICAÇÃO IA-NATIVE: PLANILHA COMO DOCUMENTO DE CONTEXTO

O aplicativo **não lê mais** a planilha como um "banco de dados rígido" (linhas e colunas fixas). A planilha é tratada como **Documento de Contexto**.

### Fluxo de dados

1. **Login:** O aluno insere o **código** (ex.: OMNI-1234) e, opcionalmente, o **link da planilha publicada** (pubhtml).
2. **Leitura:** O sistema baixa o HTML público de todas as abas da planilha.
3. **Texto limpo:** O HTML é convertido em texto bruto (células em sequência).
4. **Processamento (IA):** O texto bruto é enviado ao **Gemini 1.5 Flash** com a instrução: *"Procure o aluno com código X neste texto e estruture os dados dele em JSON."*
5. **Interpretação:** O Gemini devolve um JSON com `id`, `name`, `hyperfocus`, `journeys`, `dailyMissions`.
6. **Fallback:** Se não houver API key do Gemini ou a IA falhar, o app usa o **parsing legado** (posições fixas A1–A6, A7+).

### O que DEVE ter na planilha (contexto)

Para a IA encontrar o aluno e montar a experiência, a **aba do aluno** deve conter, **em qualquer lugar** (texto livre, como num Word), as seguintes informações-chave:

| Elemento | Exemplo |
|---------|---------|
| **Identificador único** | Palavra **CÓDIGO** ou **ID** seguida do valor. Ex.: `CÓDIGO: OMNI-LUCAS-01` |
| **Nome do aluno** | Título claro ou campo. Ex.: `## Lucas, o Explorador` ou `Nome: Lucas` |
| **Hiperfoco (tema)** | Define a personalização do app. Ex.: `HIPERFOCO: Dinossauros` ou `Tema de Interesse: Minecraft` |
| **Missões (jornadas)** | Objetivo ou missão; não precisa de todos os detalhes técnicos. Ex.: `**MISSÃO 1: DOMINANDO A MATEMÁTICA**` com `* Objetivo: ...` e `* Tarefa: ...` |

### Exemplo de uma aba válida (formato livre)

```
Olá, Mariana!
Seu código secreto é OMNI-MARI-2024.
Hoje vamos usar seu amor por Unicórnios para aprender!

Missão Principal: A Magia das Palavras

* Ler a página 10 do livro.
* Escrever 3 palavras novas que você achou.
```

### Estrutura esperada pelo frontend (types.ts)

O app espera o JSON no formato:

- **SheetStudentData:** `id`, `name`, `hyperfocus`, `journeys[]`, `dailyMissions[]`
- **Journey:** `id`, `title`, `description`, `subject`, `totalSteps`, `currentStep`, `isCompleted`, `difficulty` ('Fácil' | 'Médio' | 'Desafio'), opcionalmente `steps[]`
- **DailyMission:** `id`, `title`, `xp`, `isCompleted`

Se a planilha tiver apenas **objetivos ou tópicos soltos**, a IA deve **criar as missões gamificadas** a partir deles.

---

## 1. O QUE É A JORNADA GAMIFICADA

A **Jornada Gamificada** é um **roteiro de missão** criado para estudantes de inclusão (ensino fundamental). É gerada por IA (Gemini) no sistema **Omnisfera** (PAE — Plano de Ação AEE).

### Conceito

- O professor de AEE usa o Omnisfera para planejar o atendimento do estudante (barreiras, metas SMART, tecnologia assistiva, etc.).
- A IA (Gemini) transforma esse planejamento em uma **narrativa gamificada** para o estudante e a família.
- A narrativa usa linguagem motivadora: missões, etapas, conquistas, recompensas.
- O estudante deve se ver como **protagonista da jornada**.

### Origens possíveis do conteúdo

A jornada pode ser gerada a partir de:

- **Execução e Metas SMART** (ciclo com metas, cronograma, fases)
- **Mapear Barreiras** (diagnóstico de barreiras no aprendizado)
- **Plano de Habilidades**
- **Tecnologia Assistiva**
- **Barreiras no Brincar** (Educação Infantil)
- **Banco de Experiências** (Educação Infantil)

### Formato do texto gerado

O texto é **narrativo**, em parágrafos. Cada **parágrafo** vira **uma linha** na planilha (coluna A).

### Instruções para a Planilha (o que escrever no Google Sheets)

Para o Gemini e o app Minha Jornada entenderem perfeitamente, use estas **palavras-chave e formatos** na aba do aluno:

| Elemento | Onde / Como |
|----------|--------------|
| **CÓDIGO ÚNICO** | O Omnisfera escreve nas células A4–A5. Coloque o código `OMNI-...` logo abaixo ou ao lado do rótulo. |
| **HIPERFOCO** | O Omnisfera escreve em A1–A2. Coloque o tema (ex.: Dinossauros) logo abaixo ou ao lado do rótulo. |
| **NOME DO ALUNO** | Pode estar no título da aba ou num texto grande no corpo, ex.: `## Olá Lucas`. |
| **MISSÕES** | Use a palavra "MISSÃO" seguida do número e do título. Exemplo: `**MISSÃO #1: A ORGANIZAÇÃO**` |
| **TAREFAS/ETAPAS** | Use marcadores (hífens ou asteriscos) para as etapas da missão. Exemplo: `* Separar os livros` |

Exemplo de texto gerado (simplificado):

```
**MISSÃO #1: A ORGANIZAÇÃO**

## Olá Lucas!

Você é o herói desta missão. Seu objetivo é organizar seu espaço de estudo.

* Separar os livros por matéria
* Deixar a mesa limpa
* Guardar o material na mochila

**MISSÃO #2: CONQUISTA DA LEITURA**

* Ler uma página do livro favorito
* Marcar as palavras novas
* Celebrar ao finalizar
```

---

## 2. ESTRUTURA EXATA DA PLANILHA GOOGLE SHEETS

### Layout geral

- **Uma planilha** (arquivo) com **várias abas** (sheets).
- Cada **aba** = **uma jornada** de um estudante (ou uma exportação).
- **Apenas a coluna A** é usada (estrutura vertical).
- Nenhuma coluna B, C, etc.

### Estrutura fixa (células A1 a A6)

| Linha | Célula | Conteúdo exato | Exemplo |
|-------|--------|----------------|---------|
| 1 | A1 | `"HIPERFOCO DO ESTUDANTE:"` | (rótulo fixo) |
| 2 | A2 | Valor do hiperfoco (diagnóstico/interesse) | `"Dinossauros"`, `"TDAH"`, `"Autismo Nível 1"` ou `"—"` |
| 3 | A3 | Linha vazia | `""` |
| 4 | A4 | `"CÓDIGO ÚNICO (use no app gamificado):"` | (rótulo fixo) |
| 5 | A5 | Código OMNI (formato `OMNI-XXXX-XXXX-XXXX`) | `"OMNI-1A2B-3C4D-5E6F"` |
| 6 | A6 | Linha vazia | `""` |

### Conteúdo da jornada (a partir da linha 7)

| Linha | Célula | Conteúdo |
|-------|--------|----------|
| 7+ | A7, A8, A9, ... | Uma linha = um parágrafo do texto da jornada. Cada célula = um passo/etapa da missão. |

### Nome da aba

Formato: `"Jornada Gamificada - [Nome do Estudante] DD-MM HHhMM"`

Exemplos:
- `"Jornada Gamificada - Lucas Fernando 31-01 14h30"`
- `"Jornada Gamificada - Maria Silva 01-02 09h15"`

O **nome do estudante** está entre `"Jornada Gamificada - "` e a data/hora final.

---

## 3. EXEMPLO REAL (VALORES LITERAIS)

### Células da coluna A (linha por linha)

```
A1:  HIPERFOCO DO ESTUDANTE:
A2:  Dinossauros
A3:  (vazio)
A4:  CÓDIGO ÚNICO (use no app gamificado):
A5:  OMNI-1A2B-3C4D-5E6F
A6:  (vazio)
A7:  **MISSÃO #1: CONQUISTA DA LEITURA**
A8:  ## Olá, Lucas!
A9:  Você é o herói desta missão.
A10: * Antes de começar, faça um alongamento.
A11: * Hoje você vai praticar a leitura de palavras novas.
A12: * Ao finalizar, celebre! Você avançou mais um passo.
```

---

## 4. CÓDIGO ÚNICO (OMNI-XXXX-XXXX-XXXX)

- **Formato:** 4 grupos separados por hífen: `OMNI` + 4 hex + 4 hex + 4 hex.
- **Exemplo:** `OMNI-1A2B-3C4D-5E6F`
- **Sempre em maiúsculas.**
- **Único por exportação** (gerado com UUID).
- O **estudante digita esse código** no app Minha Jornada para acessar a jornada.

---

## 5. HIPERFOCO

- Campo que indica o **interesse principal** ou **diagnóstico** do estudante.
- Usado para personalizar recompensas e dicas no app gamificado.
- Pode ser: `"Dinossauros"`, `"Astronomia"`, `"TDAH"`, `"Autismo Nível 1"`, etc.
- Se vazio no Omnisfera, a planilha recebe `"—"`.

---

## 6. FLUXO DE DADOS (DE ONDE VEM TUDO)

```
1. Omnisfera (PAE) — professor aprova a jornada gamificada
2. Professor clica "Sincronizar na Minha Jornada"
3. Omnisfera grava na planilha Google Sheets (nova aba)
4. Omnisfera gera código OMNI e mostra ao professor
5. Professor informa o código ao estudante
6. Estudante abre o app Minha Jornada e digita o código
7. App busca o código na planilha (pubhtml) e exibe a jornada
```

---

## 7. O QUE O APP MINHA JORNADA PRECISA FAZER

### Entrada

- **Input do usuário:** código OMNI (ex.: `OMNI-1A2B-3C4D-5E6F`).

### Processamento

1. Buscar o **texto do código** em todas as células/abas da planilha.
2. Ao encontrar o código na célula **A5** de uma aba:
   - **Hiperfoco** = valor da célula **A2** (2 linhas acima do rótulo "HIPERFOCO...", ou 3 linhas acima do código).
   - **Conteúdo da jornada** = todas as células a partir de **A7** (2 linhas abaixo do código) até a última linha preenchida.
   - **Nome do estudante** = extrair do **nome da aba** (entre "Jornada Gamificada - " e a data " DD-MM HHhMM").

### Saída esperada

Objeto com:

- `id`: código OMNI
- `name`: nome do estudante (da aba)
- `hyperfocus`: valor de A2
- `journeys`: array com pelo menos uma jornada contendo:
  - `title`: ex. "Aventura de [Nome]"
  - `description` ou `content`: texto completo da jornada (parágrafos unidos)
  - `steps`: array onde cada elemento = uma linha de A7 em diante (cada passo da missão)

---

## 8. COMO A PLANILHA É ACESSADA PELO APP

### Obrigatório: Publicar na web (não basta compartilhar)

**"Compartilhar com qualquer um com o link" NÃO é suficiente.** É necessário **publicar a planilha na web**:
1. Google Sheets → **Arquivo** → **Compartilhar** → **Publicar na web**
2. Escolha "Documento Inteiro" ou "Página da Web"
3. Clique em **Publicar**
4. Copie a URL gerada (formato: `https://docs.google.com/spreadsheets/d/ID/pubhtml`)

O Omnisfera exibe essa URL após sincronizar (expander "URL para o app Minha Jornada").

### Erro 404 — Causa e solução

Se o app retornar **HTTP 404**, a URL em `sheetService.ts` está incorreta ou a planilha não está publicada:
- Use a **URL pubhtml** exata (exibida no Omnisfera após sincronizar).
- Verifique se a planilha foi **publicada na web** (não só compartilhada).
- A URL correta termina em `/pubhtml` (ex.: `https://docs.google.com/spreadsheets/d/1cJHZAq-.../pubhtml`).

### Opção 1: PubHTML (HTML público)

- URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/pubhtml`
- O app faz `fetch` dessa URL e interpreta o HTML.
- **Problema possível:** CORS pode bloquear o fetch no navegador. Solução: usar um proxy CORS (ex.: `https://api.allorigins.win/raw?url=`) ou um backend que faça o fetch.

### Opção 2: Google Sheets API (recomendado se CORS bloquear)

- Usar a **Google Sheets API v4** com a planilha publicada ou compartilhada.
- Endpoint: `https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values:batchGet`
- Retorna JSON com os valores das células, o que facilita a leitura.

### Opção 3: CSV export

- URL: `https://docs.google.com/spreadsheets/d/{id}/gviz/tq?tqx=out:csv&gid={sheetId}`
- Cada aba tem um `gid` diferente. Seria necessário iterar as abas ou usar a API para listar os `gid`s.

---

## 9. ÍNDICES PARA EXTRAÇÃO (0-based)

Se os dados estiverem em um array `rows` onde `rows[i]` = linha i+1 da coluna A:

| Índice | Conteúdo |
|--------|----------|
| 0 | "HIPERFOCO DO ESTUDANTE:" |
| 1 | hiperfoco (valor) |
| 2 | "" |
| 3 | "CÓDIGO ÚNICO (use no app gamificado):" |
| 4 | código OMNI |
| 5 | "" |
| 6+ | conteúdo da jornada (um parágrafo por índice) |

- **Código** em `rows[4]`
- **Hiperfoco** em `rows[1]`
- **Conteúdo** em `rows[6]`, `rows[7]`, `rows[8]`, ... até o fim

---

## 10. RESUMO PARA O GOOGLE AI STUDIO

1. **Planilha:** Uma única planilha com várias abas. Cada aba = uma jornada.
2. **Coluna A:** Toda a informação está na coluna A (estrutura vertical).
3. **Posições fixas:** A1=label hiperfoco, A2=hiperfoco, A4=label código, A5=código, A7+=conteúdo.
4. **Busca:** Encontrar a célula que contém o código OMNI digitado pelo estudante.
5. **Extrair:** A partir dessa célula (A5), pegar A2 para hiperfoco e A7 em diante para o conteúdo.
6. **Nome da aba:** Formato "Jornada Gamificada - [Nome] DD-MM HHhMM" — extrair o nome entre " - " e a data.
7. **CORS:** Se o fetch do pubhtml falhar, considerar Google Sheets API ou um proxy CORS.
