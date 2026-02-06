# Análise UX e Design — Evolução da Plataforma

**Data:** 02/2025  
**Perspectiva:** Usuário (equipe pedagógica)  
**Contexto:** Streamlit no Render (omnisfera.net) — limitações conhecidas.

---

## 1. O que já funciona bem

| Aspecto | Situação atual |
|---------|----------------|
| **Identidade visual** | Cards com cores por módulo (azul PEI, roxo PAEE, teal Hub, rosa Diário), barra lateral colorida, ícones RemixIcon |
| **Navegação** | Navbar fixa, topbar com workspace e avatar, links claros entre páginas |
| **Feedback de loading** | Overlay central com ícone girando + mensagem contextual ("Gerando com omnired...") |
| **Responsividade** | Media queries para mobile, cards adaptam layout |
| **Hierarquia** | Hero cards com título + descrição, expanders para detalhes |
| **Onboarding conceitual** | Central de Conhecimento na Home explica o fluxo PEI → PAEE → Hub |

---

## 2. Conceitos de design de plataformas e AVAs aplicáveis

### 2.1 Princípios de LMS / AVA

| Princípio | O que significa | Situação na Omnisfera |
|-----------|-----------------|------------------------|
| **Progressive disclosure** | Mostrar o necessário, revelar o restante sob demanda | Expanders ajudam; alguns formulários ainda são longos |
| **Information scent** | O usuário sabe "para onde está indo" antes de clicar | Navbar e cards indicam destino; falta breadcrumb em fluxos profundos |
| **Redução de carga cognitiva** | Menos decisões simultâneas, passos claros | PEI e Hub têm muitas opções; pode segmentar melhor |
| **Feedback imediato** | Cada ação tem resposta visual | Spinner, st.success, st.error existem; pode padronizar e enriquecer |
| **Consistência** | Mesmos padrões em todo o app | Há variações (Hero da Home vs demais páginas, margins diferentes) |

### 2.2 Padrões de plataformas educacionais

- **Moodle, Canvas, Google Classroom:** Dashboard com resumo, cards de “próximas ações”, estado vazio amigável
- **Notion, Trello:** Orientação contextual, tooltips, atalhos
- **Figma, Miro:** Onboarding em etapas, tours opcionais

---

## 3. Pontos de melhoria (priorizados)

### 3.1 Prioridade alta — impacto direto na experiência

| # | Melhoria | Descrição | Viabilidade Streamlit |
|---|----------|-----------|------------------------|
| 1 | **Estado vazio consistente** | Quando não há estudantes, PEI vazio, Hub sem aluno selecionado: mensagem orientadora + CTA claro (ex: "Comece criando um PEI" com link). Evitar só "Nenhum estudante encontrado" | ✅ st.empty, st.info, botão |
| 2 | **Breadcrumb em fluxos longos** | PEI e Hub têm muitas abas. Indicar "Onde estou" (ex: PEI > Dossiê | PEI > Metas). Reduz desorientação | ✅ st.caption ou HTML |
| 3 | **Confirmação antes de ações destrutivas** | Excluir estudante, excluir escola: já há confirmação. Padronizar o padrão (sempre 2 cliques, texto claro) | ✅ Já parcialmente feito |
| 4 | **Feedback de sucesso persistente** | st.success some no rerun. Considerar toast (st.toast) ou banner temporário que permaneça 2–3s | ✅ st.toast já existe |
| 5 | **Mensagens de erro amigáveis** | Em vez de "Erro: ...", usar linguagem orientada a ação: "Não foi possível salvar. Verifique sua conexão e tente novamente." | ✅ Apenas texto |

### 3.2 Prioridade média — usabilidade

| # | Melhoria | Descrição | Viabilidade Streamlit |
|---|----------|-----------|------------------------|
| 6 | **Tooltips em campos complexos** | BNCC, Taxonomia de Bloom, checklist de adaptação: ajudar com `help=` nos inputs ou ícone (i) com explicação | ✅ st.text_input(..., help="...") |
| 7 | **Seletor de aluno no Hub** | Sempre visível no topo da página (sticky), para não precisar rolar para trocar de estudante | ⚠️ Streamlit não tem sticky nativo; possível com CSS fixo |
| 8 | **Resumo do PEI na Home** | Card "Próximos passos" ou "PEIs em andamento" com contagem e links | ✅ Lógica + st.markdown |
| 9 | **Atalhos / atalho mental** | Ex: "Se não tem estudantes, o primeiro passo é ir ao PEI" — texto na Home e na tela de Estudantes vazia | ✅ Texto + link |
| 10 | **Consistência de layout** | Unificar margin-top do hero entre páginas (-96px, -120px, -128px) para sensação de app coeso | ✅ CSS |

### 3.3 Prioridade baixa — polish

| # | Melhoria | Descrição | Viabilidade Streamlit |
|---|----------|-----------|------------------------|
| 11 | **Micro-animações** | Transições suaves em hover (já existem em parte). Garantir em todos os cards e botões | ✅ CSS |
| 12 | **Dark mode** | Opção de tema escuro (preferência de usuário) | ⚠️ Complexo no Streamlit |
| 13 | **Tour guiado** | Primeiro acesso: overlay com "Conheça o PEI", "Aqui você cadastra estudantes" etc. | ⚠️ Possível com st.session_state + modais |
| 14 | **Atalhos de teclado** | Ex: Enter para enviar formulário (Streamlit já suporta em parte) | ✅ Parcial |

---

## 4. Limitações do Streamlit e contornos

| Limitação | Contorno possível |
|-----------|-------------------|
| **Rerun em toda interação** | `@st.fragment` para blocos que não precisam rerun total; reduz flicker |
| **Sem state de URL** | Breadcrumb e contexto via st.session_state; navegação por `st.switch_page` |
| **Componentes padrão** | Customizar com CSS (já feito); `st.markdown` com HTML para cards e layout |
| **Cold start no Render** | Mensagem "Carregando..." na primeira tela; warmup de secrets |
| **Sem SPA** | Aceitar recarregamentos; otimizar com cache e fragments |

---

## 5. Recomendações por área

### 5.1 Home (página inicial)

- **Hero personalizado:** Saudação com nome do usuário (ex: "Bom dia, Maria").
- **Card "Próximos passos":** Se não há estudantes: "Comece pelo PEI"; se há PEIs incompletos: "X PEIs em andamento".
- **Central de Conhecimento:** Manter; considerar colapsar por padrão e expandir sob demanda (reduz scroll inicial).
- **Recursos externos:** Links para Lei da Inclusão, BNCC etc. — garantir que abrem em nova aba (target="_blank").

### 5.2 PEI

- **Progresso visível:** Barra de progresso já existe; manter e garantir que reflete as abas preenchidas.
- **Abas longas:** Considerar sub-abas ou seções com âncoras (accordion) para Dossiê, Metas, etc.
- **Sincronizar:** Mensagem clara "Seus dados serão salvos na nuvem" antes do clique; feedback imediato com st.toast.
- **Estado vazio:** Ao abrir PEI sem aluno: "Selecione um estudante ou comece um novo PEI" com botão/link.

### 5.3 Hub de Recursos

- **Seletor de aluno:** Manter no topo; se possível, fixar com CSS para não sumir ao rolar.
- **Muitas abas:** Agrupar por contexto (ex: "Adaptar conteúdo", "Criar do zero", "Educação Infantil").
- **Feedback de IA:** Sempre indicar qual motor está sendo usado ("Gerando com omnired..."); em caso de erro, sugerir "Tente com omniblue" se disponível.

### 5.4 Diário de Bordo

- **Formulário longo:** Dividir em etapas (stepper) se fizer sentido: 1) Dados da sessão, 2) Atividades, 3) Observações.
- **Registro salvo:** st.toast + resumo do que foi registrado (estudante, data, modalidade).

### 5.5 Gestão de Usuários / Config Escola

- **Ordem sugerida:** Texto no topo: "1) Configure o ano letivo e turmas. 2) Depois cadastre os usuários."
- **Estado vazio:** "Nenhuma turma cadastrada. Crie o ano letivo em Configuração Escola primeiro." com link.

### 5.6 Login

- **Esqueci a senha:** Se não existir, indicar "Entre em contato com o coordenador" ou fluxo futuro.
- **PIN + email:** Deixar claro que o PIN é da escola e o email é pessoal.
- **Erro de credencial:** Mensagem genérica ("Email ou senha incorretos") para não revelar se o email existe.

---

## 6. Checklist de evolução (resumido)

| Área | Ação |
|------|------|
| **Estados vazios** | Mensagem orientadora + CTA em todas as telas que podem estar vazias |
| **Feedback** | Padronizar st.success/st.error + st.toast para ações críticas |
| **Breadcrumb** | Adicionar em PEI e Hub (contexto de abas) |
| **Layout** | Unificar margin-top do hero entre páginas |
| **Tooltips** | help= em campos BNCC, Bloom, checklist |
| **Home** | Card "Próximos passos" condicional |
| **Gestão/Config** | Ordem sugerida e links entre telas |

---

## 7. Resumo executivo

A Omnisfera já tem uma base sólida: identidade visual, navegação e feedback de loading. As melhorias mais impactantes, dentro das limitações do Streamlit, são:

1. **Estados vazios amigáveis** — orientar o usuário no que fazer quando não há dados
2. **Breadcrumbs e contexto** — reduzir desorientação em fluxos longos (PEI, Hub)
3. **Feedback consistente** — toasts, mensagens claras de erro e sucesso
4. **Consistência de layout** — pequenos ajustes de CSS para sensação de app coeso
5. **Tooltips e ajuda contextual** — diminuir dúvidas em campos especializados (BNCC, Bloom)

Nenhuma dessas mudanças altera a lógica ou o funcionamento atual; apenas tornam a experiência mais amigável e intuitiva.

---

*Documento baseado em revisão do código e conceitos de UX para plataformas educacionais e AVAs.*
