# 🔍 Como Encontrar a Pasta Lottie

## ✅ A pasta EXISTE e está aqui:

```
/Users/rodrigoamorim/omnisfera supabase streamlit/inclusao/nextjs-app/public/lottie/
```

## 📂 Caminho Completo no Seu Computador

```
📁 omnisfera supabase streamlit
  └── 📁 inclusao
      └── 📁 nextjs-app          ← Projeto Next.js
          └── 📁 public           ← Pasta de arquivos estáticos
              └── 📁 lottie       ← ✅ AQUI ESTÁ A PASTA!
                  └── (vazia - você vai colocar os JSONs aqui)
```

## 🎯 Como Encontrar no VS Code / Cursor

### Método 1: Explorador de Arquivos
1. Abra o explorador de arquivos (barra lateral esquerda)
2. Procure por `nextjs-app`
3. Expanda: `nextjs-app` → `public` → `lottie`
4. ✅ Você verá a pasta `lottie` (pode estar vazia)

### Método 2: Buscar Arquivo
1. Pressione `Cmd+P` (Mac) ou `Ctrl+P` (Windows)
2. Digite: `public/lottie`
3. ✅ Deve aparecer a pasta

### Método 3: Terminal
```bash
cd "/Users/rodrigoamorim/omnisfera supabase streamlit/inclusao/nextjs-app"
ls public/lottie/
```

## 📥 O Que Fazer Agora

A pasta está **vazia** porque você ainda não baixou os ícones. Siga estes passos:

### 1. Baixar Ícones do LottieFiles
- Acesse: https://lottiefiles.com
- Faça login
- Navegue até sua biblioteca de ícones
- Baixe em formato **"Lottie JSON"**

### 2. Salvar na Pasta
- Arraste os arquivos `.json` para a pasta `public/lottie/`
- OU copie e cole na pasta
- Exemplo: `public/lottie/success-check.json`

### 3. Usar no Código
```tsx
import { LottieIcon } from "@/components/LottieIcon";

<LottieIcon animation="success-check" size={48} />
```

## 🖼️ Visualização da Estrutura

```
nextjs-app/
├── app/
├── components/
│   └── LottieIcon.tsx        ← Componente que usa os ícones
├── public/                   ← Pasta de arquivos públicos
│   ├── omni_icone.png
│   ├── omni_texto.png
│   └── lottie/              ← ✅ SUA PASTA ESTÁ AQUI!
│       ├── README.md        ← Arquivo de ajuda (acabei de criar)
│       └── (coloque os .json aqui)
└── package.json
```

## ❓ Se Ainda Não Encontrar

### Verificar se está no projeto certo:
```bash
pwd
# Deve mostrar: .../nextjs-app
```

### Listar conteúdo da pasta public:
```bash
ls -la public/
# Deve mostrar a pasta "lottie"
```

### Abrir a pasta diretamente:
```bash
open public/lottie/  # Mac
# ou
explorer public/lottie/  # Windows
```

## ✅ Confirmação

A pasta **EXISTE** e está em:
- ✅ Localização: `nextjs-app/public/lottie/`
- ✅ Status: Criada e pronta para uso
- ✅ Conteúdo: Vazia (você vai adicionar os JSONs)

**Próximo passo**: Baixar os ícones do LottieFiles e salvar nesta pasta! 🎉
