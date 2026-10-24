# 🎨 Mapeamento dos Ícones Lottie

## 📋 Ícones Disponíveis e Onde Usar

### 🎓 Educação e Aprendizado

| Arquivo | Nome Simplificado | Onde Usar |
|---------|-------------------|-----------|
| `wired-lineal-406-study-graduation-hover-pinch.json` | `graduation` | Módulo PEI, Configuração Escola |
| `wired-lineal-3140-book-open-hover-pinch.json` | `book-open` | Diário de Bordo, Biblioteca |
| `wired-lineal-2167-books-course-assign-hover-pinch.json` | `books-course` | Hub de Recursos, Materiais |
| `wired-lineal-486-school-hover-pinch.json` | `school` | Configuração Escola, Home |

### 👥 Estudantes e Usuários

| Arquivo | Nome Simplificado | Onde Usar |
|---------|-------------------|-----------|
| `wired-lineal-314-three-avatars-icon-calm-hover-jumping.json` | `users` | Módulo Estudantes, Gestão |
| `wired-lineal-529-boy-girl-children-hover-pinch.json` | `children` | Estudantes, Perfis |

### 🧩 PAEE e Planejamento

| Arquivo | Nome Simplificado | Onde Usar |
|---------|-------------------|-----------|
| `wired-lineal-186-puzzle-hover-detach.json` | `puzzle` | Módulo PAEE |
| `wired-lineal-458-goal-target-hover-hit.json` | `target` | Metas, Objetivos |
| `wired-lineal-106-map-hover-pinch.json` | `map` | Mapeamento, Planejamento |

### 📊 Dados e Monitoramento

| Arquivo | Nome Simplificado | Onde Usar |
|---------|-------------------|-----------|
| `wired-lineal-152-bar-chart-arrow-hover-growth.json` | `chart-growth` | Monitoramento, Evolução |
| `wired-lineal-426-brain-hover-pinch.json` | `brain` | Inteligência, IA |

### 🚀 Hub e Recursos

| Arquivo | Nome Simplificado | Onde Usar |
|---------|-------------------|-----------|
| `wired-lineal-3139-rocket-space-alt-hover-pinch.json` | `rocket-alt` | Hub de Recursos |
| `wired-lineal-489-rocket-space-hover-flying.json` | `rocket` | Hub, Início |
| `wired-lineal-2512-artificial-intelligence-ai-alt-hover-pinch.json` | `ai` | Consultoria IA, Hub |
| `wired-lineal-36-bulb-hover-blink.json` | `bulb` | Ideias, Sugestões |

### ⚙️ Configuração e Gestão

| Arquivo | Nome Simplificado | Onde Usar |
|---------|-------------------|-----------|
| `wired-lineal-40-cogs-hover-mechanic.json` | `cogs` | Configurações, Admin |
| `wired-lineal-1643-key-holder-hover-pinch.json` | `key` | Permissões, Acesso |
| `wired-lineal-457-shield-security-hover-pinch.json` | `shield` | Segurança, Admin |

### 📄 Documentos e Arquivos

| Arquivo | Nome Simplificado | Onde Usar |
|---------|-------------------|-----------|
| `wired-lineal-60-documents-hover-swipe.json` | `documents` | Exportação, Documentos |
| `wired-lineal-143-paperplane-send-hover-wave.json` | `send` | Enviar, Compartilhar |

### 🎉 Celebração e Feedback

| Arquivo | Nome Simplificado | Onde Usar |
|---------|-------------------|-----------|
| `wired-lineal-2462-fireworks-hover-burst.json` | `fireworks` | Sucesso, Conquistas |
| `wired-lineal-2474-sparkles-glitter-hover-pinch.json` | `sparkles` | Destaques, Features |

### 🌐 Rede e Colaboração

| Arquivo | Nome Simplificado | Onde Usar |
|---------|-------------------|-----------|
| `wired-lineal-952-business-network-hover-pinch.json` | `network` | Rede de Apoio |
| `wired-lineal-957-team-work-hover-pinch.json` | `team` | Equipe, Colaboração |
| `wired-lineal-731-real-estate-building-project-hover-pinch.json` | `building` | Projetos, Estrutura |
| `wired-lineal-746-technology-integrated-circuits-hover-pinch.json` | `technology` | Tecnologia, Integração |

---

## 💡 Sugestões de Uso por Módulo

### Home Page (`app/page.tsx`)
- `rocket` ou `rocket-alt` - Hub de Recursos
- `book-open` - Diário de Bordo
- `chart-growth` - Monitoramento
- `sparkles` - Destaques especiais

### PEI (`app/(dashboard)/pei/`)
- `graduation` - Título do módulo
- `users` - Seleção de estudante
- `target` - Metas e objetivos
- `fireworks` - Quando salvar com sucesso

### PAEE (`app/(dashboard)/paee/`)
- `puzzle` - Título do módulo
- `map` - Mapeamento de barreiras
- `shield` - Proteções e estratégias

### Hub (`app/(dashboard)/hub/`)
- `ai` - Ferramentas de IA
- `bulb` - Ideias e sugestões
- `rocket` - Título principal

### Monitoramento (`app/(dashboard)/monitoramento/`)
- `chart-growth` - Gráficos e evolução
- `brain` - Análises inteligentes

### Gestão (`app/(dashboard)/gestao/`)
- `users` - Usuários
- `key` - Permissões
- `team` - Equipe

---

## 🚀 Como Usar

### Exemplo 1: Substituir ícone estático

```tsx
// ANTES (Lucide)
import { Rocket } from "lucide-react";
<Rocket className="w-6 h-6" />

// DEPOIS (Lottie)
import { LottieIcon } from "@/components/LottieIcon";
<LottieIcon animation="wired-lineal-3139-rocket-space-alt-hover-pinch" size={24} />
```

### Exemplo 2: Em botão de sucesso

```tsx
import { LottieIcon } from "@/components/LottieIcon";

{saved && (
  <LottieIcon 
    animation="wired-lineal-2462-fireworks-hover-burst" 
    size={32}
    loop={false}
    onComplete={() => console.log("Celebração completa!")}
  />
)}
```

### Exemplo 3: Loading state

```tsx
{loading ? (
  <LottieIcon 
    animation="wired-lineal-36-bulb-hover-blink" 
    size={24} 
    loop={true} 
  />
) : (
  <span>Concluído</span>
)}
```

---

## 📝 Nota sobre Nomes

Os arquivos têm nomes longos. Você pode:

1. **Usar o nome completo** (mais seguro):
   ```tsx
   <LottieIcon animation="wired-lineal-3139-rocket-space-alt-hover-pinch" />
   ```

2. **Renomear os arquivos** para nomes mais curtos (recomendado):
   ```bash
   # Exemplo:
   mv "wired-lineal-3139-rocket-space-alt-hover-pinch.json" "rocket.json"
   mv "wired-lineal-2462-fireworks-hover-burst.json" "fireworks.json"
   ```

   Depois use:
   ```tsx
   <LottieIcon animation="rocket" />
   <LottieIcon animation="fireworks" />
   ```

---

## ⚠️ Arquivo Duplicado

Você tem um arquivo duplicado:
- `wired-lineal-152-bar-chart-arrow-hover-growth (1).json`
- `wired-lineal-152-bar-chart-arrow-hover-growth.json`

Pode deletar o `(1).json` para evitar confusão.

---

## ✅ Próximos Passos

1. ✅ Instalar biblioteca: `npm install lottie-react`
2. ✅ Arquivos baixados: Feito!
3. 🔄 Renomear arquivos (opcional, mas recomendado)
4. 🔄 Começar a usar nos componentes!
