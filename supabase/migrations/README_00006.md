# Migration 00006 - Gestão de Usuários

Execute este SQL no Supabase (SQL Editor) para criar as tabelas de gestão de usuários:

- `workspace_members` — usuários com permissões por página e tipo de vínculo
- `teacher_class_assignments` — professor ↔ turma (série + turma)
- `teacher_student_links` — professor tutor ↔ alunos específicos

**Importante:** O `workspace_id` em `workspace_members` deve ser o mesmo UUID retornado pela RPC `workspace_from_pin`. Se sua tabela de workspaces tiver outro nome ou estrutura, ajuste a migration antes de executar.

Após executar, o primeiro usuário Master deve ser cadastrado manualmente no Supabase (ou crie um membro com `can_gestao=true` via SQL) para poder acessar a página Gestão de Usuários e cadastrar os demais.
