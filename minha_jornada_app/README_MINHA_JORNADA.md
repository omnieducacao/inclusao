# Minha Jornada – App Gamificado (React) – Versão IA-Native

App React que lê dados da planilha Google Sheets (sincronizada pelo Omnisfera PAE) e exibe a jornada gamificada para o estudante.

A planilha é tratada como **Documento de Contexto**: o app baixa o HTML público (pubhtml), converte em texto limpo e (opcionalmente) envia ao **Gemini** para extrair JSON. Se não houver API key ou a IA falhar, usa **parsing legado** por posições fixas.

## Fluxo

1. **Login:** Código OMNI + (opcional) link da planilha publicada.
2. **Fetch:** HTML da URL pubhtml.
3. **Texto limpo:** Células em sequência.
4. **Gemini (se VITE_GEMINI_API_KEY):** "Procure o aluno com código X e retorne JSON."
5. **Fallback:** Parsing legado (A1–A6, A7+).

## O que deve ter na planilha (contexto)

| Elemento | Exemplo |
|----------|---------|
| **CÓDIGO / ID** | `CÓDIGO: OMNI-LUCAS-01` |
| **Nome** | `## Lucas, o Explorador` ou `Nome: Lucas` |
| **HIPERFOCO / Tema** | `HIPERFOCO: Dinossauros` |
| **Missões** | `**MISSÃO 1: DOMINANDO A MATEMÁTICA**` com `* Objetivo: ...` e `* Tarefa: ...` |

A planilha **não precisa** ter apenas JSON nem estrutura rígida; basta conter essas informações em texto livre para a IA interpretar.

## Estrutura de arquivos

- **types.ts** – Tipos que o frontend espera: `SheetStudentData`, `Journey`, `DailyMission`.
- **services/sheetService.ts** – Fetch pubhtml → texto limpo → Gemini (extração JSON) ou parsing legado.
- **components/Login.tsx** – Código OMNI + link opcional da planilha.

## Configuração

1. **URL da planilha**  
   O aluno pode informar o link no login. Ou defina a URL padrão em `sheetService.ts` (`DEFAULT_SHEET_PUB_URL`).  
   A planilha deve estar **publicada na web** (Arquivo → Compartilhar → Publicar na web → copiar link pubhtml).

2. **Gemini (opcional)**  
   Para extrair dados por IA (planilha em formato livre), configure no ambiente:
   ```
   VITE_GEMINI_API_KEY=sua_chave_gemini
   ```
   Sem a chave, o app usa apenas o parsing legado (estrutura fixa A1–A6, A7+).

3. **CORS**  
   Se o fetch do pubhtml falhar no navegador, use um proxy em `CORS_PROXY` em `sheetService.ts`, por exemplo:
   ```
   CORS_PROXY = 'https://api.allorigins.win/raw?url='
   ```

## Uso do conteúdo

O `Journey` retornado contém:

- **title**, **description**, **subject**, **difficulty**
- **steps**: array com cada passo da missão
- **content**: texto completo da jornada
- **totalSteps**, **currentStep**, **isCompleted**

Use `journey.steps` ou `journey.content` para exibir os passos ao estudante.

Documento completo para o Google AI Studio: **CONTEXTO_PLANILHA_E_JORNADA_PARA_GOOGLE_AI.md** (na raiz do projeto Omnisfera).
