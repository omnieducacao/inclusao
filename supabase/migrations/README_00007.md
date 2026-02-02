# Migration 00007 - Estrutura escolar completa

**Ordem de execução:** 00006 (workspace_members) → 00007

## O que faz

1. **Segmentos** (EI, EFAI, EFAF, EM)
2. **Componentes** (BNCC: Arte, Ciências, Educação Física, Geografia, História, Língua Inglesa, Língua Portuguesa, Matemática)
3. **Ano letivo** por workspace
4. **Séries** pré-cadastradas por segmento
5. **Turmas** = série + turma dentro do ano letivo
6. **teacher_assignments** = professor leciona componente X na turma Y (substitui teacher_class_assignments)

## Fluxo de uso

1. **Configuração Escola:** Criar ano letivo → Criar turmas (série + turma)
2. **Gestão de Usuários:** Cadastrar professores com vínculo (turma + componente curricular)

Produção de texto, redação etc. → cadastrar como **Língua Portuguesa**.
