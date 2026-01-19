# ================================
# 1_PEI.py — OMNISFERA (PEI)
# ARQUIVO PRINCIPAL — VERSÃO FECHADA
# PARTE 1/4
# ================================

import json
from datetime import date

import streamlit as st

# --------------------------------
# Imports: Features/IA/PDF/CSS
# (PARTE 1 do projeto: omni_pei_legacy_features.py)
# --------------------------------
from omni_pei_legacy_features import (
    ensure_session_state,
    aplicar_estilo_visual,
    render_brand_badge,
    render_progresso,
    limpar_formulario,
    ler_pdf,
    extrair_dados_pdf_ia,
    consultar_gpt_pedagogico,
    gerar_roteiro_gamificado,
    gerar_pdf_final,
    gerar_docx_final,
    gerar_pdf_tabuleiro_simples,
    calcular_idade,
    LISTA_SERIES,
    LISTA_ALFABETIZACAO,
    LISTAS_BARREIRAS,
    LISTA_POTENCIAS,
    LISTA_PROFISSIONAIS,
    LISTA_FAMILIA,
    get_segmento_info_visual,
    get_hiperfoco_emoji,
    extrair_metas_estruturadas,
    inferir_componentes_impactados,
    get_pro_icon,
    calcular_complexidade_pei,
)

# --------------------------------
# Imports: Supabase (PARTE 2: omni_pei_db.py)
# --------------------------------
from omni_pei_db import (
    sync_student_and_open_pei,
    supa_save_pei,
    supa_sync_student_from_dados,
    supa_load_latest_pei,
    salvar_aluno_integrado,
)

# --------------------------------
# Streamlit config
# --------------------------------
st.set_page_config(
    page_title="Omnisfera · PEI",
    layout="wide",
    initial_sidebar_state="expanded",
)

# --------------------------------
# Boot obrigatório (ordem certa)
# --------------------------------
ensure_session_state()
aplicar_estilo_visual()
st.session_state["omni_logo_src"] = render_brand_badge()

# --------------------------------
# Sidebar
# --------------------------------
with st.sidebar:
    st.markdown("### 👤 Sessão")
    st.caption(f"Usuário: **{st.session_state.get('usuario_nome','')}**")

    st.divider()

    # OpenAI
    if "OPENAI_API_KEY" in st.secrets:
        api_key = st.secrets["OPENAI_API_KEY"]
        st.success("✅ OpenAI OK (secrets)")
    else:
        api_key = st.text_input("Chave OpenAI", type="password")

    st.info("⚠️ IA gera sugestões. Revisar antes de aplicar.")

    st.divider()

    # Backup Local
    st.markdown("### 📂 Backup Local (.json)")
    uploaded_json = st.file_uploader(
        "Carregar backup do PEI",
        type="json",
        label_visibility="collapsed",
    )
    if uploaded_json:
        try:
            d = json.load(uploaded_json)

            # datas
            for k in ["nasc", "monitoramento_data"]:
                if k in d and isinstance(d[k], str):
                    try:
                        d[k] = date.fromisoformat(d[k])
                    except Exception:
                        pass

            st.session_state.dados.update(d)
            st.success("Backup carregado ✅")
            st.rerun()
        except Exception as e:
            st.error(f"Erro no arquivo: {e}")

    st.divider()

    # Supabase
    st.markdown("### 💾 Supabase")

    pei_mode = st.session_state.get("pei_mode", "rascunho")
    student_id = st.session_state.get("selected_student_id")

    if pei_mode == "rascunho":
        st.caption("Modo atual: **Rascunho** (nada salvo)")
        if st.button("🔗 Sincronizar (criar aluno)", type="primary", use_container_width=True):
            try:
                ok, msg = sync_student_and_open_pei()
                if ok:
                    st.success(msg or "Sincronizado ✅")
                    st.rerun()
                else:
                    st.error(msg or "Falha ao sincronizar.")
            except Exception as e:
                st.error(f"Erro: {e}")
    else:
        st.caption("Modo atual: **Vinculado ao Supabase** ✅")
        c1, c2 = st.columns(2)

        with c1:
            if st.button("💾 Salvar", type="primary", use_container_width=True):
                try:
                    with st.spinner("Salvando..."):
                        supa_save_pei(student_id, st.session_state.dados, st.session_state.get("pdf_text", ""))
                        supa_sync_student_from_dados(student_id, st.session_state.dados)
                    st.success("Salvo no Supabase ✅")
                except Exception as e:
                    st.error(f"Erro ao salvar: {e}")

        with c2:
            if st.button("🔄 Recarregar", use_container_width=True):
                try:
                    with st.spinner("Recarregando..."):
                        row = supa_load_latest_pei(student_id)
                    if row and row.get("payload"):
                        payload = row["payload"]

                        # datas
                        for k in ["nasc", "monitoramento_data"]:
                            if payload.get(k) and isinstance(payload.get(k), str):
                                try:
                                    payload[k] = date.fromisoformat(payload[k])
                                except Exception:
                                    pass

                        st.session_state.dados.update(payload)
                        st.success("Recarregado ✅")
                        st.rerun()
                    else:
                        st.info("Ainda não existe PEI salvo para este aluno.")
                except Exception as e:
                    st.error(f"Erro ao recarregar: {e}")

    st.divider()

    if st.button("📄 Novo / Limpar (Rascunho)", use_container_width=True):
        limpar_formulario()
        st.session_state["pei_mode"] = "rascunho"
        st.session_state["selected_student_id"] = None
        st.session_state["selected_student_name"] = None
        st.toast("Formulário limpo! Use à vontade sem salvar.", icon="✨")
        st.rerun()

# --------------------------------
# Header
# --------------------------------
st.markdown(
    f"""
    <div class="header-unified">
        <img src="{st.session_state.get("omni_logo_src")}" style="height: 110px;">
        <div class="header-subtitle">Planejamento Educacional Inclusivo Inteligente</div>
    </div>
    """,
    unsafe_allow_html=True,
)

# --------------------------------
# Tabs
# --------------------------------
abas = [
    "INÍCIO",
    "ESTUDANTE",
    "EVIDÊNCIAS",
    "REDE DE APOIO",
    "MAPEAMENTO",
    "PLANO DE AÇÃO",
    "MONITORAMENTO",
    "CONSULTORIA IA",
    "DASHBOARD & DOCS",
    "JORNADA GAMIFICADA",
]
tab0, tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8, tab9 = st.tabs(abas)
# ==========================================================
# PARTE 2/4 — ABAS INICIAIS
# ==========================================================

# ------------------------------------------------------------------
# TAB 0 — INÍCIO
# ------------------------------------------------------------------
with tab0:
    render_progresso()
    st.markdown("### 🏛️ Central de Fundamentos e Legislação")

    c1, c2 = st.columns(2)

    with c1:
        st.info(
            "O **Plano de Ensino Individualizado (PEI)** é um documento pedagógico "
            "oficial que garante adaptações razoáveis, equidade e acesso à aprendizagem, "
            "conforme a **LBI (Lei 13.146/2015)**."
        )

    with c2:
        st.success(
            "Fluxo recomendado:\n\n"
            "1️⃣ Mapear estudante\n"
            "2️⃣ Identificar barreiras e potências\n"
            "3️⃣ Gerar consultoria IA\n"
            "4️⃣ Validar e acompanhar\n"
        )

# ------------------------------------------------------------------
# TAB 1 — ESTUDANTE
# ------------------------------------------------------------------
with tab1:
    render_progresso()
    st.markdown("### 👤 Dossiê do Estudante")

    c1, c2, c3, c4 = st.columns([3, 2, 2, 1])

    st.session_state.dados["nome"] = c1.text_input(
        "Nome completo",
        st.session_state.dados.get("nome", ""),
    )

    st.session_state.dados["nasc"] = c2.date_input(
        "Data de nascimento",
        value=st.session_state.dados.get("nasc", date(2015, 1, 1)),
    )

    serie_atual = st.session_state.dados.get("serie")
    idx = LISTA_SERIES.index(serie_atual) if serie_atual in LISTA_SERIES else 0

    st.session_state.dados["serie"] = c3.selectbox(
        "Série / Ano",
        LISTA_SERIES,
        index=idx,
    )

    if st.session_state.dados.get("serie"):
        nome_seg, cor_seg, desc_seg = get_segmento_info_visual(
            st.session_state.dados["serie"]
        )
        c3.markdown(
            f"<div class='segmento-badge' style='background-color:{cor_seg}'>{nome_seg}</div>",
            unsafe_allow_html=True,
        )

    st.session_state.dados["turma"] = c4.text_input(
        "Turma",
        st.session_state.dados.get("turma", ""),
    )

    st.divider()

    st.markdown("#### 📚 Histórico e Contexto Familiar")
    c_hist, c_fam = st.columns(2)

    st.session_state.dados["historico"] = c_hist.text_area(
        "Histórico Escolar",
        st.session_state.dados.get("historico", ""),
    )

    st.session_state.dados["familia"] = c_fam.text_area(
        "Dinâmica Familiar",
        st.session_state.dados.get("familia", ""),
    )

    st.session_state.dados["composicao_familiar_tags"] = st.multiselect(
        "Quem convive com o aluno?",
        LISTA_FAMILIA,
        default=st.session_state.dados.get("composicao_familiar_tags", []),
    )

    st.divider()

    # -----------------------------
    # Upload de Laudo (PDF)
    # -----------------------------
    st.markdown("#### 📎 Laudo / Relatório (PDF)")
    col_pdf, col_btn = st.columns([3, 1])

    with col_pdf:
        up = st.file_uploader(
            "Envie o arquivo",
            type="pdf",
            label_visibility="collapsed",
        )
        if up:
            st.session_state.pdf_text = ler_pdf(up)

    with col_btn:
        st.write("")
        st.write("")
        if st.button(
            "✨ Extrair dados do laudo",
            type="primary",
            use_container_width=True,
            disabled=not st.session_state.get("pdf_text"),
        ):
            with st.spinner("Analisando laudo..."):
                dados_extraidos, erro = extrair_dados_pdf_ia(
                    api_key, st.session_state.pdf_text
                )

                if dados_extraidos:
                    if dados_extraidos.get("diagnostico"):
                        st.session_state.dados["diagnostico"] = dados_extraidos["diagnostico"]

                    if dados_extraidos.get("medicamentos"):
                        for m in dados_extraidos["medicamentos"]:
                            st.session_state.dados["lista_medicamentos"].append(
                                {
                                    "nome": m.get("nome", ""),
                                    "posologia": m.get("posologia", ""),
                                    "escola": False,
                                }
                            )

                    st.success("Dados extraídos com sucesso")
                    st.rerun()
                else:
                    st.error(erro or "Erro ao analisar laudo")

    st.divider()

    # -----------------------------
    # Diagnóstico e Medicação
    # -----------------------------
    st.markdown("#### 🏥 Contexto Clínico")

    st.session_state.dados["diagnostico"] = st.text_input(
        "Diagnóstico",
        st.session_state.dados.get("diagnostico", ""),
    )

    usa_med = st.toggle(
        "💊 Uso contínuo de medicação?",
        value=len(st.session_state.dados.get("lista_medicamentos", [])) > 0,
    )

    if usa_med:
        mc1, mc2, mc3 = st.columns([3, 2, 1])

        nome_med = mc1.text_input("Medicamento")
        posologia = mc2.text_input("Posologia")
        na_escola = mc3.checkbox("Na escola?")

        if st.button("Adicionar medicamento"):
            if nome_med.strip():
                st.session_state.dados["lista_medicamentos"].append(
                    {
                        "nome": nome_med.strip(),
                        "posologia": posologia.strip(),
                        "escola": na_escola,
                    }
                )
                st.rerun()

    for i, m in enumerate(st.session_state.dados.get("lista_medicamentos", [])):
        c_txt, c_btn = st.columns([5, 1])
        tag = "🏫" if m.get("escola") else ""
        c_txt.info(f"💊 {m.get('nome')} ({m.get('posologia')}) {tag}")
        if c_btn.button("Excluir", key=f"del_med_{i}"):
            st.session_state.dados["lista_medicamentos"].pop(i)
            st.rerun()

# ------------------------------------------------------------------
# TAB 2 — EVIDÊNCIAS
# ------------------------------------------------------------------
with tab2:
    render_progresso()
    st.markdown("### 🔍 Evidências Pedagógicas")

    st.session_state.dados["nivel_alfabetizacao"] = st.selectbox(
        "Hipótese de Escrita",
        LISTA_ALFABETIZACAO,
        index=LISTA_ALFABETIZACAO.index(
            st.session_state.dados.get("nivel_alfabetizacao")
        )
        if st.session_state.dados.get("nivel_alfabetizacao") in LISTA_ALFABETIZACAO
        else 0,
    )

    st.divider()

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("**Pedagógico**")
        for q in [
            "Estagnação na aprendizagem",
            "Lacuna em pré-requisitos",
            "Dificuldade de generalização",
        ]:
            st.session_state.dados["checklist_evidencias"][q] = st.toggle(
                q,
                value=st.session_state.dados["checklist_evidencias"].get(q, False),
            )

    with col2:
        st.markdown("**Cognitivo**")
        for q in [
            "Oscilação de foco",
            "Fadiga mental",
            "Esquecimento recorrente",
        ]:
            st.session_state.dados["checklist_evidencias"][q] = st.toggle(
                q,
                value=st.session_state.dados["checklist_evidencias"].get(q, False),
            )

    with col3:
        st.markdown("**Comportamental**")
        for q in [
            "Dependência de mediação",
            "Baixa tolerância à frustração",
            "Recusa de tarefas",
        ]:
            st.session_state.dados["checklist_evidencias"][q] = st.toggle(
                q,
                value=st.session_state.dados["checklist_evidencias"].get(q, False),
            )
