# Memória de Backup — Momento da Gestão de Usuários

**Data:** 2 de fevereiro de 2026  
**Contexto:** Consolidação do sistema de gestão de usuários e administração da plataforma Omnisfera.

---

## O que foi construído

### 1. Gestão de Usuários (escola)

- **Login único:** Email + senha (nome e cargo vêm do cadastro).
- **Roles flexíveis:** Master e membros com permissões por página (PEI, PAEE, Hub, Diário, Avaliação, Gestão, Estudantes).
- **Vínculo com alunos:** `todos` (coordenação), `turma` (por série+turma+componente curricular), `tutor` (alunos específicos).
- **Cadastro completo:** Nome, Telefone, Email, Senha, Cargo.
- **Ciclo de vida:** Edição, desativação, reativação, exclusão permanente.

### 2. Administrador da Plataforma (Admin)

- **Login:** Email + senha (admin criado no Supabase).
- **Criação de escolas:** Nome + segmentos (EI, EF Anos Iniciais/Finais, EM) + motores de IA (Red, Green, Blue).
- **Cadastro de master:** Nome, Telefone, Email, Senha, Cargo.
- **Gestão:** Alterar senha master, excluir usuários.

### 3. Estrutura de dados

| Tabela | Propósito |
|--------|-----------|
| `platform_admins` | Admins da plataforma |
| `workspaces` | Escolas (name, pin, segments, ai_engines) |
| `workspace_masters` | Master por escola (email, senha, nome, telefone, cargo) |
| `workspace_members` | Usuários (nome, email, telefone, cargo, permissões, link_type) |
| `teacher_class_assignments` | Professor ↔ turma+componente |
| `teacher_student_links` | Professor tutor ↔ alunos |

### 4. Fluxo de acesso

- **Termo de uso:** Exibido no primeiro acesso após login (editável pelo admin).
- **Logout:** Redireciona para login zerado.
- **Configuração Escola:** Ano letivo, séries, turmas (padrão chips como BNCC).

### 5. Migrations relevantes

- `00006` — workspace_members, teacher_assignments, teacher_student_links
- `00007` — estrutura escola (grades, classes, workspace_grades)
- `00010` — password_hash em workspace_members
- `00011` — workspace_masters
- `00012` — platform_admins, workspaces, RPC workspace_from_pin
- `00013` — seed admin (template SQL)
- `00014` — segments, ai_engines em workspaces
- `00015` — cargo em members, telefone+cargo em masters

---

## Estado atual

- Login só com email e senha.
- Admin com painel de escolas, masters e usuários.
- Gestão de Usuários com cadastro completo e edição.
- Filtro de alunos por permissão e vínculo (turma/tutor).
- Termo profissional no primeiro acesso.

---

*"Acredito que fizemos algo incrível com a gestão de usuários."*
