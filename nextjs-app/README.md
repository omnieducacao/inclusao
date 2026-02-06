# Omnisfera — Next.js

Versão Next.js da plataforma Omnisfera (migração em andamento).

## Setup

1. Copie o arquivo de ambiente:

   ```bash
   cp .env.local.example .env.local
   ```

2. Preencha as variáveis em `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
   - `SUPABASE_SERVICE_KEY`: Service role key do Supabase
   - `SESSION_SECRET`: String aleatória forte (produção)

3. Instale dependências e rode:

   ```bash
   npm install
   npm run dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000).

## Rotas

- `/login` — Login escolar ou admin
- `/` — Home (dashboard)
- `/estudantes`, `/pei`, `/paee`, `/hub`, `/diario`, `/monitoramento`, `/gestao` — Módulos (em construção)
- `/admin` — Painel admin (platform_admin)

## Documentação

Ver `../nextjs/RELATORIO_OMNISFERA_PARA_NEXTJS_ANTGRAVITY.md` para arquitetura e mapeamento do Streamlit.
