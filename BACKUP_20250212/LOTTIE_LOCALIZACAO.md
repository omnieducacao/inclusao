# 📍 Onde Ficam os Arquivos Lottie?

## ✅ Resposta Rápida

**A pasta `public/lottie/` fica no seu COMPUTADOR e no REPOSITÓRIO GIT.**

**NÃO fica no Supabase** (Supabase é apenas banco de dados).

---

## 🗂️ Estrutura Completa

```
nextjs-app/
├── public/                    ← Arquivos estáticos (servidos pelo Next.js)
│   ├── lottie/               ← ✅ AQUI ficam os JSONs do Lottie
│   │   ├── success-check.json
│   │   ├── loading-spinner.json
│   │   └── error-x.json
│   ├── omni_icone.png        ← Outros arquivos estáticos
│   └── omni_texto.png
├── app/                      ← Código da aplicação
├── components/               ← Componentes React
│   └── LottieIcon.tsx       ← Componente que usa os JSONs
└── package.json
```

---

## 🔄 Fluxo dos Arquivos

### 1. **No Seu Computador (Desenvolvimento)**
```
📁 Seu computador
  └── 📁 nextjs-app/
      └── 📁 public/
          └── 📁 lottie/
              └── 📄 success-check.json  ← Você baixa aqui
```

### 2. **No Git (Repositório)**
```
📁 GitHub/GitLab
  └── 📁 inclusao/
      └── 📁 nextjs-app/
          └── 📁 public/
              └── 📁 lottie/
                  └── 📄 success-check.json  ← Commitado aqui
```

### 3. **No Deploy (Render/Vercel)**
```
📁 Servidor de produção
  └── 📁 nextjs-app/
      └── 📁 public/
          └── 📁 lottie/
              └── 📄 success-check.json  ← Copiado automaticamente
```

---

## 🎯 Como Funciona

### **Next.js serve arquivos da pasta `public/` automaticamente**

Quando você coloca um arquivo em `public/lottie/success-check.json`:

- **Local**: `http://localhost:4000/lottie/success-check.json`
- **Produção**: `https://seu-site.com/lottie/success-check.json`

O componente `LottieIcon` faz fetch desse arquivo:

```tsx
// Componente busca automaticamente em /lottie/
<LottieIcon animation="success-check" />
// ↓ Busca: /lottie/success-check.json
```

---

## 📦 Onde Cada Coisa Fica

| Item | Onde Fica | Exemplo |
|------|-----------|---------|
| **Arquivos JSON Lottie** | `public/lottie/` no projeto | `public/lottie/success-check.json` |
| **Código da aplicação** | `app/`, `components/` | `components/LottieIcon.tsx` |
| **Dados de estudantes** | **Supabase** (banco de dados) | Tabela `students` |
| **Dados de usuários** | **Supabase** (banco de dados) | Tabela `users` |
| **Configurações** | Variáveis de ambiente | `.env.local` |

---

## ✅ Checklist: O Que Você Precisa Fazer

### 1. Criar a pasta (se ainda não criou)
```bash
mkdir -p public/lottie
```

### 2. Baixar os JSONs do LottieFiles
- Acesse [LottieFiles.com](https://lottiefiles.com)
- Baixe os ícones em formato "Lottie JSON"
- Salve em `public/lottie/` com nomes descritivos

### 3. Commitar no Git (IMPORTANTE!)
```bash
git add public/lottie/
git commit -m "Adiciona ícones Lottie"
git push
```

**⚠️ IMPORTANTE**: Os arquivos precisam estar no Git para funcionar no deploy!

---

## 🚀 No Deploy (Render/Vercel)

Quando você faz deploy:

1. ✅ O Git é clonado no servidor
2. ✅ A pasta `public/lottie/` é copiada automaticamente
3. ✅ O Next.js serve os arquivos automaticamente
4. ✅ Tudo funciona sem configuração extra!

**Não precisa fazer nada no Supabase** - os arquivos vão junto com o código.

---

## ❓ FAQ

### "Preciso fazer upload no Supabase?"
**Não!** Supabase é apenas banco de dados. Os arquivos JSON ficam no projeto.

### "Os arquivos vão para produção automaticamente?"
**Sim!** Desde que você faça commit e push no Git. O deploy copia tudo.

### "Posso usar CDN externo?"
**Sim**, mas não é necessário. O Next.js já serve os arquivos de forma otimizada.

### "E se eu não commitar os arquivos?"
❌ Eles não vão para produção e os ícones não funcionarão no deploy.

---

## 📝 Resumo Visual

```
┌─────────────────────────────────────────┐
│  SEU COMPUTADOR                         │
│  ┌───────────────────────────────────┐  │
│  │ nextjs-app/                      │  │
│  │  └── public/lottie/ ✅ AQUI      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              │
              │ git push
              ▼
┌─────────────────────────────────────────┐
│  GITHUB (Repositório)                   │
│  ┌───────────────────────────────────┐  │
│  │ inclusao/nextjs-app/             │  │
│  │  └── public/lottie/ ✅ AQUI      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              │
              │ deploy
              ▼
┌─────────────────────────────────────────┐
│  RENDER/VERCEL (Produção)               │
│  ┌───────────────────────────────────┐  │
│  │ nextjs-app/                      │  │
│  │  └── public/lottie/ ✅ AQUI      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  SUPABASE (Banco de Dados)              │
│  ┌───────────────────────────────────┐  │
│  │ ❌ NÃO fica aqui                 │  │
│  │ (Apenas dados: estudantes, etc)  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## ✅ Conclusão

**A pasta `public/lottie/` fica no seu projeto (computador + Git + deploy).**

**NÃO fica no Supabase.**

Basta criar a pasta, baixar os JSONs, commitar no Git e pronto! 🎉
