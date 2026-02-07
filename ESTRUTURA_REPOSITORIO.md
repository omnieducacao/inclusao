# Estrutura do Repositório Omnisfera

## Visão Geral

Este repositório contém **duas versões** da plataforma Omnisfera em **branches diferentes**:

### 🌐 Branch `omnisfera.net` (Produção Atual)
- **Tecnologia**: Streamlit (Python)
- **Status**: Em produção, funcionando
- **Estrutura**: 
  - `streamlit_app.py` (app principal)
  - `pages/` (páginas do Streamlit)
  - `services/` (lógica de negócio)
  - `supabase/` (migrations SQL)
  - Arquivos Python diversos

### ⚡ Branch `nextjs-migration` (Nova Versão)
- **Tecnologia**: Next.js (TypeScript/React)
- **Status**: Em desenvolvimento/migração
- **Estrutura**:
  - `nextjs-app/` (aplicação Next.js completa)
  - Arquivos Python antigos (podem ser removidos depois)

## Por que manter no mesmo repositório?

✅ **Vantagens:**
- Histórico compartilhado
- Fácil comparação entre versões
- Não duplica código comum (CSVs, SQL migrations)
- Um único lugar para gerenciar
- Fácil fazer merge de mudanças comuns

✅ **Cada branch pode ter estrutura diferente:**
- `omnisfera.net`: estrutura Python/Streamlit
- `nextjs-migration`: estrutura Next.js em `nextjs-app/`

## Como trabalhar com as branches

### Trabalhar na versão antiga (omnisfera.net)

```bash
git checkout omnisfera.net
# Fazer mudanças
git add .
git commit -m "sua mensagem"
git push origin omnisfera.net
```

### Trabalhar na nova versão (nextjs-migration)

```bash
git checkout nextjs-migration
# Fazer mudanças
git add .
git commit -m "sua mensagem"
git push origin nextjs-migration
```

### Ver diferenças entre branches

```bash
git diff omnisfera.net..nextjs-migration
```

## Estrutura de Pastas Recomendada

### Branch `omnisfera.net` (manter como está)
```
inclusao/
├── streamlit_app.py
├── pages/
├── services/
├── supabase/
├── *.py (outros arquivos Python)
└── *.csv (arquivos BNCC)
```

### Branch `nextjs-migration` (estrutura atual)
```
inclusao/
├── nextjs-app/          # App Next.js completo
│   ├── app/
│   ├── lib/
│   ├── components/
│   ├── data/            # CSVs BNCC
│   └── package.json
├── supabase/            # Migrations SQL (compartilhado)
└── (arquivos Python podem ser removidos depois)
```

## Compartilhamento de Recursos

### Arquivos que podem ser compartilhados:
- ✅ `supabase/` - Migrations SQL (mesmo banco)
- ✅ `*.csv` - Dados BNCC (mesmos dados)
- ✅ Documentação (README, docs/)

### Arquivos específicos de cada branch:
- ❌ Código Python (somente em `omnisfera.net`)
- ❌ Código Next.js (somente em `nextjs-migration`)

## Deploy

### Deploy da versão antiga (omnisfera.net)
- **Plataforma**: Streamlit Cloud ou outro serviço Python
- **Branch**: `omnisfera.net`
- **Comando**: `streamlit run streamlit_app.py`

### Deploy da nova versão (nextjs-migration)
- **Plataforma**: Render, Vercel, etc.
- **Branch**: `nextjs-migration`
- **Root Directory**: `nextjs-app` (no Render)
- **Comando**: `npm install && npm run build && npm start`

## Migração Gradual

### Fase 1: Desenvolvimento (Atual)
- ✅ `nextjs-migration` em desenvolvimento
- ✅ `omnisfera.net` em produção
- ✅ Ambos funcionando simultaneamente

### Fase 2: Testes
- ✅ Deploy `nextjs-migration` em ambiente de teste
- ✅ Validar funcionalidades
- ✅ Comparar com versão antiga

### Fase 3: Transição
- ⏳ Migrar usuários gradualmente
- ⏳ Manter `omnisfera.net` como backup
- ⏳ Monitorar erros

### Fase 4: Substituição
- ⏳ `nextjs-migration` vira produção
- ⏳ `omnisfera.net` vira branch de arquivo
- ⏳ Remover código Python antigo (opcional)

## Recomendações

1. **NÃO mesclar as branches** - cada uma tem sua estrutura
2. **Manter `supabase/` sincronizado** - mesmo banco de dados
3. **Documentar mudanças** - especialmente no Supabase
4. **Testar ambas versões** - garantir que funcionam
5. **Usar tags Git** - marcar versões importantes

## Comandos Úteis

```bash
# Ver estrutura de uma branch
git show omnisfera.net:streamlit_app.py

# Comparar arquivos específicos
git diff omnisfera.net..nextjs-migration -- nextjs-app/

# Criar tag de versão
git tag -a v1.0-streamlit -m "Versão Streamlit estável"
git tag -a v2.0-nextjs -m "Versão Next.js beta"

# Ver todas as branches
git branch -a
```

## Conclusão

✅ **Mantenha tudo no mesmo repositório**
✅ **Use branches separadas para cada versão**
✅ **Não precisa clonar ou separar repositórios**
✅ **Cada branch pode ter estrutura diferente**

Isso é uma prática comum e recomendada! 🎯
