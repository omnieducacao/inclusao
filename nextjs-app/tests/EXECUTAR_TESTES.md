# 🧪 Como Executar os Testes

## 📦 Instalação Inicial

```bash
cd nextjs-app
npm install --save-dev vitest @vitest/ui
```

## 🚀 Executar Testes

### Opção 1: Via npm script (recomendado)

```bash
npm test
```

### Opção 2: Via script shell

```bash
./tests/run-tests.sh
```

### Opção 3: Via npx diretamente

```bash
npx vitest run
```

## 📊 Modos de Execução

### Executar uma vez (CI/CD)

```bash
npm test
```

### Modo watch (desenvolvimento)

```bash
npm run test:watch
```

### UI interativa

```bash
npm run test:ui
```

## ✅ Testes Equivalentes ao Streamlit

Os testes implementados são equivalentes aos testes do Streamlit em `tests/run_simple.py`:

| Teste | Arquivo | Status |
|-------|---------|--------|
| Hash password (members) | `tests/lib/members.test.ts` | ✅ |
| Hash password (admin) | `tests/lib/auth.test.ts` | ✅ |
| Find user empty | `tests/lib/find-user.test.ts` | ✅ |
| Get initials | `tests/lib/utils.test.ts` | ✅ |
| School segments | `tests/lib/school.test.ts` | ✅ |
| Engine selector | `tests/lib/engine-selector.test.ts` | ✅ |
| PAEE functions | `tests/lib/paee.test.ts` | ✅ |

## 🔍 Verificar Cobertura

Para verificar cobertura de código:

```bash
npx vitest run --coverage
```

## 📝 Notas

- Os testes não requerem conexão com Supabase (usam mocks)
- Variáveis de ambiente são configuradas automaticamente em `tests/setup.ts`
- Testes são executados em ambiente Node.js
