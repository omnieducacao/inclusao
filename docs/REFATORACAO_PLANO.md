# Plano de Refatoração e Reestruturação — Omnisfera

**Data:** 02/2025  
**Princípio:** Extrações incrementais e reversíveis. Cada fase deve manter o sistema funcional.

---

## Fase 1 — Módulo de Documentos (Hub)

**Objetivo:** Extrair funções de geração de DOCX/PDF para `services/hub_docs.py`.

| Função | Dependências | Status |
|--------|--------------|--------|
| `criar_docx_simples` | Document, BytesIO | ✅ Extrair |
| `criar_pdf_generico` | FPDF | ✅ Extrair |
| `construir_docx_final` | Document, Pt, qn, aluno, mapa_imgs... | Fase 2 |
| `gerar_ppt_do_plano_kimi` | st, ou, OpenAI, Kimi | Manter no Hub (muitas deps) |

**Arquivo:** `services/hub_docs.py`

---

## Fase 2 — Módulo BNCC do Hub

**Objetivo:** Extrair funções BNCC do Hub para `services/hub_bncc.py` (ou reutilizar bncc_service).

| Função | Ação |
|--------|------|
| `carregar_bncc_completa` | Já existe em bncc_service? Verificar e unificar |
| `criar_dropdowns_bncc_completos_melhorado` | UI específica — manter no Hub ou extrair para `ui/hub_bncc_ui.py` |
| `ano_celula_contem`, `extrair_ano_bncc_do_aluno`, `padronizar_ano`, `ordenar_anos` | Extrair para utils |

---

## Fase 3 — Módulo IA do Hub

**Objetivo:** Extrair chamadas de IA para `services/hub_ia.py`.

| Função | Complexidade |
|--------|--------------|
| `adaptar_conteudo_docx` | Média — usa ou.chat_completion_multi_engine |
| `adaptar_conteudo_imagem` | Média |
| `criar_profissional` | Média |
| `gerar_imagem_inteligente`, `gerar_pictograma_caa` | Média |
| `gerar_experiencia_ei_bncc`, `gerar_roteiro_aula_completo`, etc. | Média |

Todas usam `ou` (omni_utils) e `st`. Opções:
- Extrair para `services/hub_ia.py` e passar `ou` como parâmetro ou importar.
- Manter no Hub e apenas organizar em blocos com `# ----` mais claros.

---

## Fase 4 — omni_utils

**Objetivo:** Dividir omni_utils (~2500 linhas) em módulos menores.

| Conteúdo | Destino sugerido |
|----------|------------------|
| Motores IA (chat_completion_multi_engine, get_*_api_key) | `omni_ia.py` ou `services/ia_engine.py` |
| Layout, CSS, header, navbar | `omni_layout.py` ou `ui/omni_layout.py` |
| Ícones (get_icon, icon_title, ICONS) | `omni_icons.py` ou manter em omni_utils |
| Supabase (_sb_url, _headers) | Manter em omni_utils ou supabase_client |

**Risco:** omni_utils é importado em praticamente todas as páginas. Qualquer alteração exige atualizar todos os imports. Fazer com muito cuidado.

---

## Fase 5 — PEI e PAEE

Similar ao Hub: identificar blocos de IA, documentos e BNCC que podem ser extraídos para services.

---

## Regras de Segurança

1. **Um passo por vez:** Uma extração, testar, commit.
2. **Imports retrocompatíveis:** Em omni_utils, usar `from omni_ia import chat_completion_multi_engine` e reexportar para manter `ou.chat_completion_multi_engine` funcionando.
3. **Não quebrar testes:** Rodar `pytest tests/` após cada alteração.
4. **Documentar:** Atualizar este plano com o que foi feito.

---

## Status Atual

- [x] Fase 1.1: `criar_docx_simples` e `criar_pdf_generico` → `services/hub_docs.py`
- [x] Fase 1.2: `construir_docx_final` e `_adicionar_paragrafo_formatado` → `services/hub_docs.py`
- [x] Fase 2: `ano_celula_contem`, `extrair_ano_bncc_do_aluno`, `padronizar_ano`, `ordenar_anos` → `services/hub_bncc_utils.py`
- [ ] Fase 3–5: A definir conforme evolução
