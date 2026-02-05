# Plano de implementação — BNCC EI e EM

**Data:** 02/02/2025  
**Objetivo:** Integrar BNCC Educação Infantil e Ensino Médio ao fluxo do PEI e Hub.

---

## 1. BNCC Educação Infantil (`bncc_ei.csv`)

### Estrutura esperada do CSV (raiz do projeto)

```
Idade;Campo de Experiência;Objetivo de Aprendizagem
2 anos;O eu, o outro e o nós;Interagir com crianças e adultos...
2 anos;Corpo, gestos e movimentos;Explorar movimentos do corpo...
3 anos;O eu, o outro e o nós;...
4 anos;...
5 anos;...
```

- **Idade:** Faixas (ex.: "2 anos", "3 anos", "4 anos", "5 anos") — conforme BNCC oficial
- **Campo de Experiência:** Um dos 5 campos da BNCC EI
- **Objetivo de Aprendizagem:** Texto do objetivo

### Tarefas

| # | Onde | O quê |
|---|------|-------|
| 1 | Hub EI (Experiência Lúdica) | Trocar `CAMPOS_EXPERIENCIA_EI` fixo por dropdown do CSV. Objetivos filtrados por Idade + Campo |
| 2 | PEI aba BNCC | Para aluno EI: renomear aba para "BNCC", exibir seleção Idade → Campo → Objetivos (em vez de habilidades) |
| 3 | Estudantes | Quando série = EI, campo série/ano usar opções de Idade do CSV (2, 3, 4, 5 anos) |
| 4 | Consultoria IA | Incluir campos/objetivos EI selecionados no contexto do relatório |

---

## 2. BNCC Ensino Médio (`bncc_em.csv`)

### Estrutura esperada

A BNCC EM organiza por **áreas de conhecimento**, não por componente:

- **Linguagens e suas Tecnologias** (Língua Portuguesa, Arte, Educação Física, Língua Inglesa)
- **Matemática e suas Tecnologias**
- **Ciências da Natureza e suas Tecnologias** (Biologia, Física, Química)
- **Ciências Humanas e Sociais Aplicadas** (História, Geografia, Filosofia, Sociologia)

### Mapeamento professor → área

| Professor (componente) | Área BNCC EM |
|-----------------------|--------------|
| História, Geografia, Filosofia, Sociologia | Ciências Humanas |
| Biologia, Física, Química | Ciências da Natureza |
| Língua Portuguesa, Arte, Ed. Física, Inglês | Linguagens |
| Matemática | Matemática |

### Tarefas

| # | Onde | O quê |
|---|------|-------|
| 5 | Carregar `bncc_em.csv` | Colunas: Área, Componente, Unidade, Habilidade (ou similar) |
| 6 | Hub / PEI BNCC | Para aluno EM: primeiro selecionar Área (ou inferir do componente do professor), depois Componente, Unidade, Habilidades |
| 7 | Filtro por professor | Se professor = História → abrir Ciências Humanas; Química → Ciências da Natureza; etc. |

---

## 3. Fluxo de detecção de nível

```
serie/grade do estudante
    ↓
detectar_nivel_ensino() → EI | FI | FII | EM
    ↓
EI  → bncc_ei.csv (Idade, Campos, Objetivos)
FI  → bncc.csv (Anos 1º-5º, Disciplina, Habilidades)
FII → bncc.csv (Anos 6º-9º, Disciplina, Habilidades)
EM  → bncc_em.csv (Área, Componente, Habilidades)
```

---

## 4. Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `bncc_ei.csv` | Criar na raiz (template); usuário preenche com dados oficiais |
| `bncc_em.csv` | Criar na raiz (futuro) |
| `services/bncc_service.py` | Novo: `carregar_bncc_ei()`, `carregar_bncc_em()`, faixas_idade_ei() |
| `pages/3_Hub_Inclusao.py` | Usar BNCC EI no Hub EI; ajustar `render_aba_ei_experiencia` |
| `pages/1_PEI.py` | Aba BNCC condicional (EI vs EF/EM); `carregar_habilidades_bncc_*` para EI |
| `pages/Estudantes.py` | Série EI → select com faixas do CSV |
| `pages/7_Configuracao_Escola.py` | (opcional) Faixas EI na config de séries |

---

## 5. Ordem sugerida de implementação

1. **Fase 1:** Criar `bncc_ei.csv` template + `bncc_service` + carregar no Hub EI
2. **Fase 2:** PEI aba BNCC para EI (campos + objetivos)
3. **Fase 3:** Estudantes — faixas de idade EI
4. **Fase 4:** BNCC EM (estrutura + mapeamento)
