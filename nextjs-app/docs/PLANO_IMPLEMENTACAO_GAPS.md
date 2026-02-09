# Plano de Implementação - Gaps Streamlit vs Next.js

## ✅ Concluído

1. **Gate de Módulos Habilitados** (`lib/modules.ts`)
   - Função `getEnabledModules()` compatível com Streamlit
   - Função `isModuleEnabled()` para verificação individual
   - Mapeamento de permissões para módulos

## 🔴 Prioridade Alta - Próximos Passos

### 1. Admin Plataforma (Módulo Completo Ausente)
- [ ] Criar `/app/(dashboard)/admin/page.tsx`
- [ ] CRUD de workspaces (escolas)
- [ ] Configuração de motores IA por escola
- [ ] Configuração de módulos habilitados por escola
- [ ] Dashboard de uso de IAs
- [ ] Editor de Termos de Uso
- [ ] Dashboard de métricas
- [ ] Registro de bugs/issues

### 2. Diário de Bordo (30% → 100%)
- [ ] Implementar 5 abas organizadas
- [ ] Timeline visual cronológica
- [ ] Gráficos interativos (Plotly ou alternativa)
- [ ] Exportação CSV/JSON
- [ ] Relatório resumido com métricas
- [ ] Configurações do diário
- [ ] Filtros de registros

### 3. Monitoramento (50% → 100%)
- [ ] Confronto visual PEI vs PAE vs Diário (3 colunas)
- [ ] Evidências do Diário (últimos 5 registros)

### 4. PEI - Exportação PDF
- [ ] Implementar `gerar_pdf_final()` equivalente
- [ ] Usar biblioteca PDF (jspdf ou similar)
- [ ] Layout oficial com todas as seções

## 🟡 Prioridade Média

### PEI
- [ ] Backup JSON local (download direto)
- [ ] Resumo de Anexos do Estudante (aba retrátil)

### PAEE
- [ ] Download PDF da Jornada Gamificada
- [ ] Preview inline e download PNG do Mapa Mental

### Estudantes
- [ ] Detalhes expandidos (expander) com PEI data
- [ ] Edição inline de PEI data

### Hub
- [ ] Export PPTX do Plano de Aula

### Gestão Usuários
- [ ] UI de vínculo turma/componente
- [ ] UI de vínculo tutor/estudantes

### PGI
- [ ] IA para geração de ações

## 🟢 Prioridade Baixa

### Transversal
- [ ] Track Usage Events
- [ ] Track AI Feedback
- [ ] Footer com assinatura
- [ ] Resumo de Anexos por Estudante

## Estrutura de Arquivos Criados

```
lib/
  modules.ts          ✅ Gate de módulos habilitados
  tracking.ts        ⏳ Track usage events e AI feedback
  pdf-export.ts      ⏳ Exportação PDF do PEI
```

## Próxima Ação Imediata

1. Integrar `getEnabledModules` nas páginas que precisam verificar módulos
2. Implementar exportação PDF do PEI
3. Começar estrutura do Admin Plataforma
