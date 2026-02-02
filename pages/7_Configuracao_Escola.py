# pages/7_Configuracao_Escola.py
"""
Configuração da Escola: Ano letivo, séries e turmas.
Fluxo: 1) Criar ano letivo  2) Criar turmas (série + turma)  3) Depois cadastrar usuários
"""
import streamlit as st
import os
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import omni_utils as ou
from services.school_config_service import (
    SEGMENTS,
    list_school_years,
    create_school_year,
    list_grades,
    list_grades_for_workspace,
    list_workspace_grades,
    set_workspace_grades,
    list_classes,
    create_class,
)

try:
    from ui_lockdown import hide_streamlit_chrome_if_needed, hide_default_sidebar_nav
    hide_streamlit_chrome_if_needed()
    hide_default_sidebar_nav()
except Exception:
    pass

st.set_page_config(
    page_title="Omnisfera | Configuração da Escola",
    page_icon="omni_icone.png",
    layout="wide",
    initial_sidebar_state="collapsed",
)

ou.ensure_state()

if not st.session_state.get("autenticado") or not st.session_state.get("workspace_id"):
    st.error("🔒 Acesso restrito. Faça login.")
    st.stop()

from ui.permissions import can_access
if not can_access("gestao"):
    st.error("🔒 Apenas quem gerencia usuários pode configurar a escola.")
    st.stop()

ou.render_omnisfera_header()
ou.render_navbar(active_tab="Configuração Escola")
ou.inject_compact_app_css()

st.markdown("""
<style>
header[data-testid="stHeader"] { visibility: hidden !important; height: 0 !important; }
.block-container { padding-top: 1rem !important; }
.mod-card { background: white; border-radius: 16px; border: 1px solid #E2E8F0; padding: 20px; margin-bottom: 20px; }
</style>
""", unsafe_allow_html=True)

ws_id = st.session_state.get("workspace_id")
ws_name = st.session_state.get("workspace_name", "Workspace")
user_first = (st.session_state.get("usuario_nome") or "Visitante").split()[0]
hora = datetime.now(ZoneInfo("America/Sao_Paulo")).hour
saudacao = "Bom dia" if 5 <= hora < 12 else "Boa tarde" if 12 <= hora < 18 else "Boa noite"

st.markdown(f"""
<div class="mod-card">
    <strong>Configuração da Escola</strong>
    <p style="color:#64748B;margin:8px 0 0 0;">{saudacao}, {user_first}! Configure o ano letivo, séries e turmas antes de cadastrar professores.</p>
</div>
""", unsafe_allow_html=True)

try:
    school_years = list_school_years(ws_id)
except Exception as e:
    st.warning("Execute as migrations 00006 e 00007 no Supabase. Detalhes: " + str(e))
    st.stop()

# --- 1. Ano Letivo ---
st.markdown("### 1. Ano Letivo")
with st.expander("➕ Novo ano letivo"):
    with st.form("form_ano"):
        col1, col2 = st.columns(2)
        with col1:
            year = st.number_input("Ano", min_value=2020, max_value=2030, value=datetime.now().year)
        with col2:
            name = st.text_input("Nome (opcional)", placeholder="Ex: 2025")
        if st.form_submit_button("Criar"):
            _, err = create_school_year(ws_id, year, name or None)
            if err:
                st.error(err)
            else:
                st.success("Ano letivo criado.")
                st.rerun()

if school_years:
    st.write("**Anos cadastrados:**", ", ".join(f"{y.get('year')} ({y.get('name','')})" for y in school_years))
else:
    st.info("Nenhum ano letivo. Crie acima.")

# --- 2. Séries que a escola oferece ---
st.markdown("### 2. Séries que a escola oferece")
st.caption("Marque as séries que sua escola tem. (Pode não ter 7º ano ou Ensino Médio, por exemplo.)")
ws_grade_ids = set(list_workspace_grades(ws_id))
with st.form("form_series"):
    for seg_id, seg_label in SEGMENTS:
        grades_seg = list_grades(seg_id)
        if not grades_seg:
            continue
        st.markdown(f"**{seg_label}**")
        cols = st.columns(min(5, len(grades_seg)))
        for i, g in enumerate(grades_seg):
            with cols[i % 5]:
                st.checkbox(g.get("label", g.get("code", "")), value=g.get("id") in ws_grade_ids, key=f"wg_{seg_id}_{g.get('id')}")
        st.markdown("")
    if st.form_submit_button("Salvar séries"):
        all_selected = []
        for seg_id, _ in SEGMENTS:
            for g in list_grades(seg_id):
                if st.session_state.get(f"wg_{seg_id}_{g.get('id')}", False):
                    all_selected.append(g.get("id"))
        set_workspace_grades(ws_id, all_selected)
        st.success("Séries salvas.")
        st.rerun()

# --- 3. Turmas ---
st.markdown("### 3. Turmas (série + turma)")
if not school_years:
    st.caption("Crie um ano letivo antes de cadastrar turmas.")
else:
    with st.expander("➕ Nova turma"):
        with st.form("form_turma"):
            year_opt = st.selectbox("Ano letivo", school_years, format_func=lambda x: f"{x.get('year')} - {x.get('name','')}")
            segment = st.selectbox("Segmento", SEGMENTS, format_func=lambda x: x[1])
            grades = list_grades_for_workspace(ws_id, segment[0])
            if not grades:
                st.warning("Nenhuma série para este segmento.")
            else:
                st.markdown("**Selecione a série:**")
                grade_labels = [g.get("label", g.get("code", "")) for g in grades]
                grade_idx = st.radio(
                    "Série",
                    range(len(grades)),
                    format_func=lambda i: grade_labels[i],
                    horizontal=True,
                    label_visibility="collapsed",
                )
                grade_opt = grades[grade_idx] if grade_idx is not None else None
                class_group = st.text_input("Turma", placeholder="A, B, 1, 2...", value="A")
                if st.form_submit_button("Criar turma"):
                    if year_opt and grade_opt:
                        _, err = create_class(ws_id, year_opt["id"], grade_opt["id"], class_group)
                        if err:
                            st.error(err)
                        else:
                            st.success("Turma criada.")
                            st.rerun()

    # Lista turmas
    school_year_active = next((y for y in school_years if y.get("active")), school_years[0] if school_years else None)
    if school_year_active:
        classes = list_classes(ws_id, school_year_active.get("id"))
        if classes:
            st.markdown(f"**Turmas ({school_year_active.get('year')}):**")
            for c in classes:
                grade_info = c.get("grade") or {}
                st.caption(f"• {grade_info.get('label','')} - Turma {c.get('class_group','')}")
        else:
            st.caption("Nenhuma turma cadastrada para o ano ativo.")
