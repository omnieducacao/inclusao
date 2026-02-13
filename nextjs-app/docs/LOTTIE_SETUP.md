# 🎨 Guia de Configuração - Lottie Icons

## 📦 Instalação

Execute no terminal:

```bash
npm install lottie-react
```

## 📁 Estrutura de Arquivos

Crie a pasta para os arquivos JSON do Lottie:

```bash
mkdir -p public/lottie
```

## 📥 Como Baixar Ícones do LottieFiles

1. Acesse [LottieFiles.com](https://lottiefiles.com)
2. Faça login com sua conta
3. Navegue até a biblioteca de ícones que você assinou
4. Para cada ícone que quiser usar:
   - Clique no ícone
   - Clique em "Download"
   - Escolha "Lottie JSON"
   - Salve o arquivo em `public/lottie/` com um nome descritivo
   - Exemplo: `success-check.json`, `loading-spinner.json`, `error-x.json`

## 🎯 Como Usar

### Exemplo Básico

```tsx
import { LottieIcon } from "@/components/LottieIcon";

// Ícone simples
<LottieIcon animation="success-check" size={48} />

// Com loop
<LottieIcon animation="loading-spinner" size={32} loop={true} />

// Com callback quando completa
<LottieIcon 
  animation="success-check" 
  size={64}
  loop={false}
  onComplete={() => console.log("Animação completa!")}
/>
```

### Exemplo em Botão

```tsx
import { LottieIcon } from "@/components/LottieIcon";
import { useState } from "react";

function SaveButton() {
  const [saved, setSaved] = useState(false);
  
  return (
    <button onClick={() => setSaved(true)}>
      {saved ? (
        <LottieIcon animation="success-check" size={24} />
      ) : (
        <span>Salvar</span>
      )}
    </button>
  );
}
```

### Exemplo com Loading

```tsx
import { LottieIcon } from "@/components/LottieIcon";

function LoadingState() {
  return (
    <div className="flex items-center gap-2">
      <LottieIcon animation="loading-spinner" size={32} loop={true} />
      <span>Carregando...</span>
    </div>
  );
}
```

## 🎨 Propriedades do Componente

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|--------|-----------|
| `animation` | `string` | **obrigatório** | Nome do arquivo JSON (sem extensão) |
| `size` | `number` | `48` | Tamanho do ícone em pixels |
| `loop` | `boolean` | `false` | Se a animação deve repetir |
| `autoplay` | `boolean` | `true` | Se a animação deve iniciar automaticamente |
| `speed` | `number` | `1` | Velocidade (1 = normal, 2 = 2x, 0.5 = metade) |
| `className` | `string` | `""` | Classes CSS adicionais |
| `style` | `React.CSSProperties` | `{}` | Estilos inline |
| `onLoad` | `() => void` | `undefined` | Callback quando carrega |
| `onComplete` | `() => void` | `undefined` | Callback quando completa |

## 💡 Dicas

1. **Nomes de Arquivos**: Use nomes descritivos e consistentes
   - ✅ `success-check.json`
   - ✅ `error-x.json`
   - ✅ `loading-spinner.json`
   - ❌ `animation1.json`

2. **Tamanhos Recomendados**:
   - Ícones pequenos: `16-24px`
   - Ícones médios: `32-48px`
   - Ícones grandes: `64-96px`

3. **Performance**: 
   - Use `loop={false}` para animações que só precisam rodar uma vez
   - Arquivos JSON grandes podem afetar performance - prefira ícones simples

4. **Fallback**: O componente mostra um ícone de erro (⚠️) se o arquivo não for encontrado

## 🔄 Migração de Ícones Existentes

Para substituir ícones estáticos por Lottie:

```tsx
// Antes (Lucide)
import { CheckCircle2 } from "lucide-react";
<CheckCircle2 className="w-6 h-6 text-green-600" />

// Depois (Lottie)
import { LottieIcon } from "@/components/LottieIcon";
<LottieIcon animation="success-check" size={24} />
```

## 📚 Recursos

- [Documentação Lottie React](https://github.com/LottieFiles/lottie-react)
- [LottieFiles.com](https://lottiefiles.com)
- [Exemplos de Animações](https://lottiefiles.com/animations)
