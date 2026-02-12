# SENTRY - CONFIGURAÇÃO

## Arquivos Criados

1. **sentry.client.config.ts** - Configuração para o lado do cliente (browser)
2. **sentry.server.config.ts** - Configuração para o lado do servidor (API routes)
3. **lib/sentry.ts** - Funções utilitárias para capturar erros

## Variáveis de Ambiente Necessárias

Adicione ao seu `.env.local` e ao painel da Vercel/Render:

```bash
# Sentry DSN (obtenha em https://sentry.io/)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

## Como Obter o DSN

1. Crie uma conta em https://sentry.io/ (plano gratuito: 5k erros/mês)
2. Crie um novo projeto "Next.js"
3. Copie o DSN fornecido

## Uso no Código

### Capturar erros manualmente:

```typescript
import { captureError, setUser, addBreadcrumb } from "@/lib/sentry";

// Em uma API route ou server component:
try {
  // código que pode falhar
} catch (error) {
  captureError(error as Error, {
    studentId: "123",
    action: "create_pei",
  });
}

// Adicionar contexto do usuário:
setUser({ id: "user-123", email: "prof@escola.com" });

// Adicionar breadcrumbs para debug:
addBreadcrumb("Iniciando geração de PEI", "pei", "info");
```

## O que é Capturado Automaticamente

- Erros não tratados no browser
- Erros em API routes
- Performance de requisições
- Web Vitals (LCP, FID, CLS)

## Taxa de Amostragem

- **Desenvolvimento**: 100% dos erros
- **Produção**: 10% dos erros (ajustável)

## Próximos Passos

1. [ ] Instalar pacote `@sentry/nextjs` (npm install)
2. [ ] Configurar DSN nas variáveis de ambiente
3. [ ] Testar enviando um erro de teste
4. [ ] Verificar no dashboard do Sentry

## Dashboard

Acesse: https://sentry.io/organizations/{sua-org}/projects/omnisfera/
