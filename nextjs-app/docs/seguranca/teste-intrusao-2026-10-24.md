# Teste de intrusão leve — 24/10/2026

SCRUM-232. Feito de fora, contra os sites no ar (www.omniprof.net e www.omnisfera.net), sem conta e sem ferramenta agressiva. Complementa a revisão de rotas sem login de 23/10 (`rotas-api-sem-login-*.md`) e o relatório do REA de 20/10 (repositório do OmniProf).

## O que foi testado
1. **Cabeçalhos de segurança** da página inicial e do login.
2. **Todas as rotas de API sem parâmetro** chamadas sem login: 68 no OmniProf, 129 na Omnisfera.
3. **Limite de tentativas no login** da Omnisfera: 13 tentativas seguidas com senha errada.
4. **Segredos no código**: varredura dos dois repositórios, arquivos atuais e histórico inteiro, por padrões de chave (OpenAI, Google, GitHub, JWT, chave privada, Asaas, Resend, Fireworks).

## Resultado
| Item | OmniProf | Omnisfera |
|---|---|---|
| HTTPS forçado (HSTS) | sim, 1 ano | sim, 2 anos, com preload |
| Bloqueio de iframe (X-Frame-Options) | sim | sim |
| Content-Security-Policy | sim | sim |
| Permissions-Policy | sim | **faltava** → corrigido em 24/10 |
| Anuncia o framework (X-Powered-By) | não | **sim** → desligado em 24/10 |
| Rotas de API que respondem sem login | só `/api/bncc` (dado público) | só `/api/health` (estado do banco, sem dado) |
| Erro 5xx em rota sem login | nenhum | nenhum |
| Limite no login | — | 10 tentativas por conta; a 11ª recebe 429 |
| Segredo no código ou no histórico | nenhum real (só chaves falsas de teste) | nenhum real; `.streamlit/secrets.toml` está no repositório, mas só com comentários |

## Pendências
1. **CSP com `'unsafe-eval'`** nos dois: o Next.js em produção não costuma precisar. Testar sem ele num deploy de prévia antes de tirar.
   - **Conferido em 24/10:** o Next.js não precisa dele, mas os ícones animados (Lottie da Lordicon, nos dois sites) usam *expressões* que só rodam com `eval`. Tirar quebraria as animações. **Fica, como risco aceito**: o ganho é pequeno enquanto `'unsafe-inline'` continua, e todo HTML vindo da IA ou do usuário já passa pelo DOMPurify. Para tirar no futuro: trocar os ícones por versões sem expressão (ou SVG animado em CSS) e usar o player `lottie_light`.
2. **`.streamlit/secrets.toml` e `venv/` saíram do Git em 24/10** (`git rm --cached`; os arquivos continuam no Mac). O `secrets.toml` nunca teve valor real no histórico, só comentários; a pasta `venv` (cerca de 12 mil arquivos, 411 MB) era o ambiente Python antigo do Streamlit.
2. **`.streamlit/secrets.toml` no repositório da Omnisfera**: hoje é só modelo, mas o nome engana e convida a colar segredo. Renomear para `.example` ou tirar do Git.
3. **Rotas com parâmetro** (`[id]`) não entram neste teste de fora; ficam cobertas pelos testes de isolamento entre escolas e pela revisão de 23/10.
4. Repetir este teste a cada mês no ritual semanal, ou depois de toda mudança em autenticação.
