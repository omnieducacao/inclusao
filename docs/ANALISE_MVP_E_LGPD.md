# Análise MVP e LGPD — Omnisfera

**Data:** 3 de fevereiro de 2026  
**Objetivo:** Pontos de atenção para colocar o MVP em produção e conformidade com a LGPD.

---

## 1. CHECKLIST PARA MVP FUNCIONAL

### 1.1 Infraestrutura e Configuração

| Item | Status | Ação |
|------|--------|------|
| Migrations Supabase | ⚠️ Verificar | Rodar migrations 00006 → 00018 na ordem |
| Tabela `students` | ⚠️ Verificar | Deve existir (id, name, grade, class_group, diagnosis, pei_data, paee_ciclos, planejamento_ativo, workspace_id) |
| Secrets configurados | ❓ | SUPABASE_URL, SUPABASE_SERVICE_KEY; OPENAI_API_KEY, GEMINI_API_KEY conforme uso |
| Primeiro admin | ❓ | Executar 00013_seed_admin.sql ou criar via Supabase |
| ENV em produção | ❓ | Definir ENV ≠ "TESTE" para esconder menus |

### 1.2 Fluxo de Onboarding

| Etapa | O que falta |
|-------|-------------|
| Admin cria escola | Segmentos e motores IA já existem ✅ |
| Admin cria master | Nome, Telefone, Email, Senha, Cargo ✅ |
| Master cria membros | ✅ |
| Master configura escola | Ano letivo, séries, turmas — depende de migrations 00007, 00009 |
| Cadastro de estudantes | Página Estudantes; precisa de classes configuradas |

### 1.3 Pontos que Podem Quebrar no MVP

| Risco | Mitigação |
|-------|-----------|
| Tabela `students` ausente | Criar migration se não existir; documentar schema esperado |
| Falta de classes/turmas | Configuração Escola deve ser concluída antes de Gestão de Usuários (link por turma) |
| OpenAI/Gemini sem chave | PEI, Hub, PAEE falham; adicionar fallback ou mensagem clara |
| Timeout em requests | Aumentar timeout ou implementar retry em fluxos críticos |
| Cache `list_students_rest` | TTL=10/60s; invalidar com `students_cache_invalid` ao criar/editar aluno |

---

## 2. RLS E SEGURANÇA NO BANCO

### 2.1 Situação Atual

- **Platform admins, workspaces, workspace_masters, workspace_members:** RLS com `USING (true) WITH CHECK (true)` — acesso via SERVICE_KEY.
- **Isolamento por escola:** Feito na camada de aplicação (filtro `workspace_id`), não no banco.
- **students, pei_data, etc.:** Se existirem políticas, verificar se restringem por workspace.

### 2.2 Recomendações

1. **RLS por workspace:** Criar políticas que filtrem por `workspace_id` quando o Supabase Auth ou contexto de workspace estiver disponível.
2. **Service key:** Nunca expor no frontend; usar apenas no backend (Streamlit roda server-side, mas garantir que secrets não vazem).
3. **Auditoria:** Tabelas `usage_events` e `platform_issues` já ajudam; considerar log de acessos a dados sensíveis.

---

## 3. LGPD — DADOS SENSÍVEIS

### 3.1 Dados Tratados pela Omnisfera

| Dado | Classificação LGPD | Onde |
|------|--------------------|------|
| Nome do estudante | Pessoal | `students.name` |
| Data de nascimento | Pessoal | `pei_data.nasc` |
| Diagnóstico / CID | **Sensível (saúde)** | `students.diagnosis`, `pei_data.diagnostico` |
| Medicamentos | **Sensível (saúde)** | `pei_data.lista_medicamentos` |
| Rede de apoio (família) | Pessoal / sensível | `pei_data.rede_apoio`, `composicao_familiar_tags` |
| Histórico clínico/pedagógico | **Sensível (saúde/educação)** | `pei_data.historico`, `orientacoes_especialistas` |
| Barreiras de aprendizagem | Sensível (saúde/educação) | `pei_data.barreiras_selecionadas` |
| Dados de membros (email, nome, cargo) | Pessoal | `workspace_members`, `workspace_masters` |
| Registros do Diário de Bordo | Pessoal / sensível | Tabela de registros por aluno |

### 3.2 Obrigações LGPD Relevantes

- **Art. 7º:** Base legal para tratamento (consentimento, execução de política pública, legítimo interesse, etc.).
- **Art. 11:** Dados sensíveis exigem consentimento explícito ou hipóteses legais específicas (ex.: execução de política pública de educação, tutela da saúde).
- **Art. 14:** Menores — consentimento de pelo menos um dos pais ou responsável.
- **Art. 46:** Comunicação de incidentes à ANPD e ao titular.
- **Art. 48:** Direito à eliminação, portabilidade, revisão.

### 3.3 O Que Falta para Conformidade LGPD

| Item | Situação | Ação Sugerida |
|------|----------|---------------|
| **Base legal** | Não documentada | Definir base (ex.: execução de política pública educacional; consentimento do responsável) e registrar |
| **Termo de consentimento** | Termo de uso genérico existe | Incluir menção explícita a dados de saúde e educação; consentimento específico para cadastro de alunos |
| **Consentimento do responsável** | Não implementado | Na tela de cadastro de estudante, incluir aceite do responsável para tratamento de dados sensíveis |
| **Política de Privacidade** | Não encontrada | Criar documento público com finalidade, bases legais, compartilhamento (OpenAI, Gemini), retenção |
| **Direitos do titular** | Não automatizados | Ter processo (manual ou fluxo) para acesso, correção, eliminação, portabilidade |
| **Retenção e exclusão** | Não definida | Definir prazo de retenção e procedimento de exclusão ao encerrar vínculo |
| **Dados enviados a terceiros (IA)** | OpenAI, Gemini | Documentar envio; verificar DPA/termos dos provedores; preferir anonimização ou pseudonimização quando possível |
| **Criptografia** | Supabase TLS in-transit | Verificar criptografia at-rest no Supabase (padrão); não há criptografia aplicação para colunas sensíveis |
| **DPO / Encarregado** | Não definido | Nomear encarregado de dados e divulgar canal de contato |
| **Impacto (AIPD)** | Não realizado | Realizar Avaliação de Impacto para tratamento de dados sensíveis de menores |

### 3.4 Recomendações Prioritárias para LGPD

1. **Termo de Uso + Consentimento:** Expandir o termo exibido no primeiro acesso para incluir:
   - Tratamento de dados pessoais e sensíveis (saúde, educação)
   - Finalidade (apoio à inclusão educacional)
   - Base legal
   - Uso de IA (OpenAI, Gemini) e armazenamento em nuvem (Supabase)

2. **Tela de Cadastro de Aluno:** Incluir checkbox/aceite do responsável legal autorizando o tratamento dos dados do estudante para fins educacionais e de suporte à inclusão.

3. **Política de Privacidade:** Página ou documento com:
   - Quais dados são coletados
   - Para que são usados
   - Com quem são compartilhados (Supabase, OpenAI, Google)
   - Por quanto tempo são mantidos
   - Como solicitar acesso, correção ou exclusão

4. **Documentar base legal:** Ex.: Art. 7º, II (execução de política pública) e/ou Art. 11, II, f (tutela da saúde) — com assessoria jurídica.

5. **Minimização:** Coletar apenas o necessário; evitar campos opcionais que não têm uso real.

---

## 4. PONTOS DE ATENÇÃO GERAIS

### 4.1 Dependências de Ordem

```
1. Supabase: migrations 00006 → 00018
2. Criar primeiro admin (00013 ou manual)
3. Admin: criar escola (workspace) → criar master
4. Master: Configuração Escola (ano letivo, séries, turmas)
5. Master: Gestão de Usuários (membros, vínculos)
6. Cadastrar estudantes
7. Usar PEI, PAEE, Hub, etc.
```

### 4.2 Integrações Externas

| Integração | Uso | Risco |
|------------|-----|-------|
| Supabase | Dados, auth custom | Chave service nunca no frontend |
| OpenAI | PEI, sugestões | Dados sensíveis enviados — considerar anonimização |
| Gemini | Imagens, textos | Idem |
| Google Sheets | Exportar Jornada | Credenciais em secrets |

### 4.3 O Que Ainda Falta Construir (Pós-MVP)

- [ ] Política de Privacidade (página/documento)
- [ ] Consentimento específico no cadastro de aluno
- [ ] Fluxo para direitos do titular (acesso, exclusão)
- [ ] Definir e documentar prazo de retenção
- [ ] RLS por workspace em tabelas sensíveis (se aplicável)
- [ ] Retry com backoff em chamadas críticas
- [ ] Logs estruturados (não só print)

---

## 5. RESUMO EXECUTIVO

**Para colocar o MVP no ar:**
1. Garantir que todas as migrations estão aplicadas e a tabela `students` existe.
2. Configurar secrets (Supabase, OpenAI, Gemini conforme uso).
3. Criar primeiro admin e seguir o fluxo escola → master → configuração → membros → alunos.

**Para LGPD:**
- A Omnisfera trata **dados sensíveis** (saúde, educação) de **menores**.
- É essencial: termo de consentimento explícito, política de privacidade, base legal documentada e procedimentos para direitos do titular.
- Consulte um advogado ou DPO para validar bases legais e redação dos documentos.

---

*Documento gerado com base na auditoria do código e nas boas práticas de proteção de dados.*
