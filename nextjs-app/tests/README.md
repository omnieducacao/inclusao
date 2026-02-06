# 🧪 Testes - Next.js App

Este diretório contém os testes equivalentes aos testes do Streamlit (`tests/run_simple.py`).

## 📋 Estrutura

```
tests/
├── setup.ts                    # Configuração de ambiente para testes
├── lib/
│   ├── members.test.ts         # Testes de hash/verify password (members)
│   ├── auth.test.ts            # Testes de hash/verify password (admin)
│   ├── engine-selector.test.ts # Testes de seleção de motores de IA
│   ├── paee.test.ts            # Testes de funções PAEE
│   ├── school.test.ts          # Testes de SEGMENTS e COMPONENTS
│   ├── utils.test.ts           # Testes de funções utilitárias
│   └── find-user.test.ts       # Testes de busca de usuário
└── run-all.test.ts             # Suite principal
```

## 🚀 Como Executar

### Instalação (primeira vez)

```bash
npm install --save-dev vitest @vitest/ui
```

### Executar todos os testes

```bash
npm test
```

### Executar em modo watch (desenvolvimento)

```bash
npm run test:watch
```

### Executar com UI interativa

```bash
npm run test:ui
```

## 📊 Cobertura de Testes

### ✅ Testes Implementados

1. **lib/members.test.ts**
   - ✅ `hashPassword`: Gera hash bcrypt válido
   - ✅ `hashPassword`: Retorna null para senha vazia/curta
   - ✅ `verifyPassword`: Verifica senha corretamente
   - ✅ `verifyPassword`: Retorna false para senha incorreta

2. **lib/auth.test.ts**
   - ✅ `hashPassword`: Gera hash bcrypt válido para admin
   - ✅ `verifyPassword`: Verifica senha de admin corretamente
   - ✅ `verifyPassword`: Retorna false para senha incorreta

3. **lib/engine-selector.test.ts**
   - ✅ `getAvailableEngines`: Retorna engines corretos para PEI
   - ✅ `getAvailableEngines`: Retorna engines corretos para PAEE
   - ✅ `getAvailableEngines`: Retorna engines corretos para Hub
   - ✅ `getAvailableEngines`: Retorna engines corretos para extrair_laudo
   - ✅ `getDefaultEngine`: Retorna engine padrão correto para cada módulo

4. **lib/paee.test.ts**
   - ✅ `extrairMetasDoPei`: Extrai metas de pei_data
   - ✅ `extrairMetasDoPei`: Retorna meta genérica se não encontrar
   - ✅ `criarCronogramaBasico`: Cria cronograma com número correto de semanas
   - ✅ `criarCronogramaBasico`: Cria fases corretamente
   - ✅ `fmtDataIso`: Formata data ISO corretamente
   - ✅ `badgeStatus`: Retorna ícone e cor para cada status
   - ✅ `FREQUENCIAS`: Contém frequências esperadas

5. **lib/school.test.ts**
   - ✅ `SEGMENTS`: Tem exatamente 4 segmentos
   - ✅ `SEGMENTS`: Contém EI, EFAI, EFAF, EM
   - ✅ `SEGMENTS`: Tem estrutura correta (id, label)

6. **lib/utils.test.ts**
   - ✅ `getInitials`: Extrai iniciais corretamente
   - ✅ `studentGradeToMatchKeys`: Converte grades corretamente

7. **lib/find-user.test.ts**
   - ✅ `findUserByEmail`: Retorna null para email vazio
   - ✅ `findUserByEmail`: Normaliza email para lowercase

## 🔄 Equivalência com Streamlit

| Teste Streamlit | Teste Next.js | Status |
|----------------|---------------|--------|
| `test_hash_password` (members) | `lib/members.test.ts` | ✅ |
| `test_verify_master_false` | `lib/auth.test.ts` | ✅ |
| `test_find_user_empty` | `lib/find-user.test.ts` | ✅ |
| `test_admin_hash` | `lib/auth.test.ts` | ✅ |
| `test_omni_get_icon` | `lib/utils.test.ts` | ✅ |
| `test_get_initials` | `lib/utils.test.ts` | ✅ |
| `test_school_config_segments` | `lib/school.test.ts` | ✅ |
| `test_monitoring_snapshot` | ⚠️ Não implementado | ⚠️ |
| `test_permissions_filter_todos` | ⚠️ Não implementado | ⚠️ |
| `test_permissions_grade_keys` | `lib/utils.test.ts` | ✅ |

## 📝 Notas

- Os testes usam **Vitest** como framework (equivalente ao pytest do Python)
- Mocks são usados para evitar chamadas reais ao Supabase
- Variáveis de ambiente são configuradas em `tests/setup.ts`
- Testes são executados em ambiente Node.js (não browser)

## 🎯 Próximos Passos

1. Implementar testes de permissões (`lib/permissions.test.ts`)
2. Implementar testes de monitoramento (`lib/monitoring.test.ts`)
3. Adicionar testes de integração para APIs
4. Adicionar testes de componentes React
