# 📁 Pasta de Ícones Lottie

Esta é a pasta onde você deve colocar os arquivos JSON dos ícones Lottie.

## 📍 Localização

```
nextjs-app/
└── public/
    └── lottie/          ← VOCÊ ESTÁ AQUI!
        └── (coloque os arquivos .json aqui)
```

## 📥 Como Adicionar Ícones

1. Acesse [LottieFiles.com](https://lottiefiles.com)
2. Faça login com sua conta
3. Baixe os ícones em formato **"Lottie JSON"**
4. Salve os arquivos nesta pasta (`public/lottie/`)

## 📝 Exemplos de Nomes

- `success-check.json`
- `loading-spinner.json`
- `error-x.json`
- `warning-alert.json`
- `info-circle.json`

## ✅ Depois de Adicionar

Os arquivos estarão disponíveis automaticamente em:

```tsx
import { LottieIcon } from "@/components/LottieIcon";

// Use apenas o nome (sem .json)
<LottieIcon animation="success-check" size={48} />
```

## ⚠️ Importante

- Use nomes descritivos e sem espaços
- Use hífens ao invés de espaços: `success-check` não `success check`
- Não precisa incluir a extensão `.json` ao usar no código
