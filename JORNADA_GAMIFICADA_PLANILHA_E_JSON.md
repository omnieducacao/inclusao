# Jornada Gamificada — Tudo sobre planilha, formatação e JSON

Este documento reúne **tudo** que existe sobre a Jornada Gamificada no projeto: o que é, o que está escrito na planilha (célula a célula), como está formatado, o que o app espera no JSON e como cada coisa se relaciona.

---

## 1. O que é a Jornada Gamificada

- **Conceito:** Roteiro de missão gamificado para estudantes de inclusão (ensino fundamental), criado por IA (Gemini) no **Omnisfera** (módulo PAE — Plano de Ação AEE).
- **Origem do conteúdo:** O professor usa o PAE (Metas SMART, Barreiras, Plano de Habilidades, Tecnologia Assistiva, etc.) e a IA transforma esse planejamento em uma narrativa com missões, etapas e conquistas para o estudante e a família.
- **Destino:** O texto é exportado para uma **planilha Google Sheets** (uma aba por exportação). O estudante acessa a jornada pelo app **Minha Jornada** (React), digitando o **código OMNI** (e, opcionalmente, o link da planilha publicada).

---

## 2. O que está na planilha — célula a célula

A planilha usa **apenas a coluna A**. O **Omnisfera** escreve os dados na ordem abaixo ao exportar (função `exportar_jornada_para_sheets` em `omni_utils.py`).

### Cabeçalho fixo (escrito pelo Omnisfera)

| Linha | Célula | Conteúdo exato | Quem escreve |
|-------|--------|----------------|--------------|
| 1 | A1 | `HIPERFOCO DO ESTUDANTE:` | Omnisfera (rótulo fixo) |
| 2 | A2 | Valor do hiperfoco (ex.: Dinossauros, TDAH, —) | Omnisfera |
| 3 | A3 | *(vazio)* | Omnisfera |
| 4 | A4 | `CÓDIGO ÚNICO (use no app gamificado):` | Omnisfera (rótulo fixo) |
| 5 | A5 | Código OMNI (ex.: `OMNI-1A2B-3C4D-5E6F`) | Omnisfera (gerado com UUID) |
| 6 | A6 | *(vazio)* | Omnisfera |

- **Hiperfoco (A2):** Vem do estudante no Omnisfera; se vazio, grava `"—"`.
- **Código (A5):** Formato `OMNI-XXXX-XXXX-XXXX` (12 caracteres hex em 3 grupos), maiúsculas, único por exportação.

### Conteúdo da jornada (A7 em diante)

| Linha | Célula | Conteúdo | Quem escreve |
|-------|--------|----------|--------------|
| 7+ | A7, A8, A9, ... | **Uma linha = um parágrafo** do texto da jornada gerado pelo Gemini. Cada linha é um passo/etapa da missão. | Omnisfera (grava o `texto_jornada` que vem do Gemini, quebrado por `\n`) |

Ou seja: o **Gemini** gera um texto com várias linhas; o Omnisfera faz `split("\n")`, remove linhas vazias, e cada linha restante vira **uma célula** em sequência a partir de A7.

### Nome da aba

- **Formato:** `Jornada Gamificada - [Nome do Estudante] DD-MM HHhMM`
- **Exemplo:** `Jornada Gamificada - Lucas Fernando 31-01 14h30`
- O Omnisfera monta: `titulo + " - " + nome_estudante` e acrescenta data/hora para evitar abas duplicadas. Caracteres inválidos são removidos (só alfanuméricos, espaço, hífen, underscore, "h").

---

## 3. Formatação do texto na planilha (o que o Gemini gera)

O **prompt do Gemini** (em `pages/2_PAEE.py`) exige o seguinte formato para o texto da jornada (que será colocado em A7, A8, A9, ...):

### Palavras-chave e formato

| Elemento | Formato pedido ao Gemini | Exemplo no texto |
|----------|---------------------------|------------------|
| **MISSÕES** | Palavra "MISSÃO" + número + título | `**MISSÃO #1: A ORGANIZAÇÃO**` |
| **TAREFAS/ETAPAS** | Marcadores: hífen ou asterisco em cada etapa | `* Separar os livros` ou `- Deixar a mesa limpa` |
| **NOME DO ALUNO** | Saudação em destaque (opcional) | `## Olá Lucas` ou `## Olá, Lucas!` |

Ou seja, **cada linha** que o Gemini devolve pode ser, por exemplo:

- Uma linha de título de missão: `**MISSÃO #1: CONQUISTA DA LEITURA**`
- Uma linha de saudação: `## Olá, Lucas!`
- Uma linha de texto narrativo: `Você é o herói desta missão.`
- Uma linha de tarefa (marcador): `* Antes de começar, faça um alongamento.`

O Omnisfera **não** altera esse texto; apenas corta por `\n` e grava cada parte em uma célula.

### Exemplo completo do texto (antes de ir para as células)

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

Na planilha, isso vira: A7 = primeira linha, A8 = segunda, … cada linha em uma célula.

---

## 4. O que está no JSON (o que o app Minha Jornada espera)

O app **Minha Jornada** não usa a planilha como tabela rígida: baixa o HTML público (pubhtml), vira **texto limpo**, e (se houver API key) envia ao **Gemini** para extrair um **JSON**. Esse JSON segue os tipos definidos em `minha_jornada_app/types.ts`.

### Estrutura do JSON

#### 4.1 Objeto principal: `SheetStudentData`

| Campo | Tipo | Significado | Onde está na planilha (referência) |
|-------|------|-------------|-------------------------------------|
| `id` | string | Código OMNI (ex.: OMNI-1A2B-3C4D-5E6F) | Célula A5 (ou texto "CÓDIGO"/"ID" + valor) |
| `name` | string | Nome do aluno | Nome da aba ("Jornada Gamificada - **Nome** DD-MM...") ou texto tipo "## Olá Nome" |
| `hyperfocus` | string | Tema/interesse (ex.: Dinossauros, Lego) | Célula A2 (ou texto "HIPERFOCO:" + valor) |
| `journeys` | Journey[] | Lista de jornadas/missões | Conteúdo A7+ interpretado (títulos MISSÃO #1, #2… e listas * / -) |
| `dailyMissions` | DailyMission[] | Missões diárias (ex.: check-in, ler próximo passo) | Podem vir da planilha ou ser padrão no app/IA |

#### 4.2 Cada jornada: `Journey`

| Campo | Tipo | Significado | Onde está na planilha |
|-------|------|-------------|------------------------|
| `id` | string | Identificador da jornada (ex.: j_1) | Gerado pela IA ou pelo app |
| `title` | string | Título da missão | Linhas tipo `**MISSÃO #1: TÍTULO**` |
| `description` | string | Descrição ou história | Texto entre títulos de missão / parágrafos narrativos |
| `subject` | string | Matéria (ex.: Matemática) | Inferido pela IA ou padrão "Jornada Integrada" |
| `totalSteps` | number | Quantidade de passos/tarefas | Número de linhas com * ou - (ou inferido) |
| `currentStep` | number | Passo atual (0 = novo) | Controle do app, não vem da planilha |
| `isCompleted` | boolean | Se a jornada foi concluída | Controle do app |
| `difficulty` | 'Fácil' \| 'Médio' \| 'Desafio' | Dificuldade | Inferido pela IA ou padrão |
| `content`? | string | Texto completo da jornada (parágrafos unidos) | Concatenação do conteúdo A7+ |
| `steps`? | string[] | Cada passo = uma linha/tarefa | Linhas A7+ (ou só as com * / -) |

#### 4.3 Missão diária: `DailyMission`

| Campo | Tipo | Significado |
|-------|------|-------------|
| `id` | string | Ex.: dm1, dm2 |
| `title` | string | Ex.: "Como estou me sentindo?" |
| `xp` | number | Pontos (ex.: 50, 30) |
| `isCompleted` | boolean | Controle do app |

Normalmente vêm padrão do app ou da IA quando não há nada explícito na planilha.

---

## 5. Resumo: célula → significado → JSON

| Célula | Conteúdo escrito | Significado | Campo no JSON |
|--------|-------------------|-------------|----------------|
| A1 | `HIPERFOCO DO ESTUDANTE:` | Rótulo fixo | — |
| A2 | Dinossauros (ou —) | Hiperfoco do estudante | `SheetStudentData.hyperfocus` |
| A3 | *(vazio)* | Separador | — |
| A4 | `CÓDIGO ÚNICO (use no app gamificado):` | Rótulo fixo | — |
| A5 | OMNI-1A2B-3C4D-5E6F | Código único do estudante | `SheetStudentData.id` |
| A6 | *(vazio)* | Separador | — |
| A7+ | Linha 1 do texto da jornada | Parágrafo / título de missão / tarefa | Parte de `journeys[].title`, `description`, `steps[]`, `content` |
| A8, A9, … | Linhas 2, 3, … | Idem | Idem |
| *(nome da aba)* | Jornada Gamificada - Lucas 31-01 14h30 | Identificação da aba | `SheetStudentData.name` (extraído do nome da aba) |

---

## 6. Formato do código OMNI

- **Padrão:** `OMNI-XXXX-XXXX-XXXX` (OMNI + 4 hex + 4 hex + 4 hex).
- **Exemplo:** `OMNI-1A2B-3C4D-5E6F`
- **Geração:** UUID hex 12 caracteres, em maiúsculas, único por exportação.
- **Uso:** O estudante digita esse código (e opcionalmente o link pubhtml) no app Minha Jornada para carregar a jornada.

---

## 7. Onde está cada coisa no código

| O quê | Onde |
|-------|------|
| Escrita na planilha (A1–A6 + A7+) | `omni_utils.py` → `exportar_jornada_para_sheets()` |
| Geração do texto da jornada (Gemini) | `pages/2_PAEE.py` → `gerar_roteiro_gamificado_do_ciclo()`, `gerar_roteiro_gamificado_de_texto()` |
| Formato MISSÃO #1, * tarefas, ## Olá Nome | Prompts em `pages/2_PAEE.py` (FORMATO OBRIGATÓRIO) |
| Tipos do JSON (SheetStudentData, Journey, DailyMission) | `minha_jornada_app/types.ts` |
| Leitura da planilha (fetch → texto → Gemini ou parsing legado) | `minha_jornada_app/services/sheetService.ts` |
| Prompt da IA para extrair JSON da planilha | `sheetService.ts` → `GEMINI_PROMPT`, `extractStudentDataWithGemini()` |

---

## 8. Dois modos de leitura da planilha no app

1. **Com Gemini (recomendado):** O app baixa o HTML da planilha publicada (pubhtml), converte em texto limpo, envia ao Gemini com o código do aluno e pede um JSON. O Gemini devolve `SheetStudentData` (id, name, hyperfocus, journeys, dailyMissions). A planilha pode ter texto mais livre, desde que tenha CÓDIGO/ID, Nome, HIPERFOCO e missões (* Objetivo, * Tarefa, etc.).
2. **Parsing legado (fallback):** Sem API key do Gemini ou em caso de falha, o app procura a célula com o código OMNI, usa A2 como hiperfoco, nome da aba para o nome do aluno e A7 em diante como conteúdo/jornada (uma jornada com `steps` = linhas). Depende da **estrutura fixa** A1–A6 e A7+.

Este documento descreve tanto o que o Omnisfera **escreve** (células e formatação) quanto o que o app **lê** (JSON e, no fallback, posições fixas).
