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

import importlib.util
_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _root not in sys.path:
    sys.path.insert(0, _root)
import omni_utils as ou

# Import school_config_service (robusto para Streamlit Cloud)
_scs_path = os.path.join(_root, "services", "school_config_service.py")
if os.path.exists(_scs_path):
    _spec = importlib.util.spec_from_file_location("school_config_service", _scs_path)
    _scs = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(_scs)
    SEGMENTS = _scs.SEGMENTS
    list_school_years = _scs.list_school_years
    create_school_year = _scs.create_school_year
    list_grades = _scs.list_grades
    list_grades_for_workspace = _scs.list_grades_for_workspace
    list_workspace_grades = _scs.list_workspace_grades
    set_workspace_grades = _scs.set_workspace_grades
    list_classes = _scs.list_classes
    create_class = _scs.create_class
    delete_class = _scs.delete_class
else:
    try:
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
            delete_class,
        )
    except ImportError as e:
        st.error(f"Erro ao carregar configuração: {e}")
        st.stop()

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
with st.expander("➕ Adicionar ano letivo"):
    with st.form("form_ano"):
        col1, col2 = st.columns(2)
        with col1:
            year = st.number_input("Ano", min_value=2020, max_value=2030, value=datetime.now().year)
        with col2:
            name = st.text_input("Nome (opcional)", placeholder="Ex: 2025")
        if st.form_submit_button("Adicionar"):
            _, err = create_school_year(ws_id, year, name or None)
            if err:
                st.error(err)
            else:
                st.success("Ano letivo adicionado.")
                st.rerun()

with st.expander("📋 Anos cadastrados", expanded=bool(school_years)):
    if school_years:
        for y in school_years:
            st.markdown(f"• **{y.get('year')}** — {y.get('name','')}")
    else:
        st.caption("Nenhum ano. Adicione acima.")

# --- 2. Séries que a escola oferece ---
st.markdown("### 2. Séries que a escola oferece")
st.caption("Selecione as séries que sua escola tem (como em Habilidades BNCC no PEI).")
ws_grade_ids = set()
try:
    ws_grade_ids = set(list_workspace_grades(ws_id))
except Exception:
    pass
all_grades = []
seg_map = {s[0]: s[1] for s in SEGMENTS}
for seg_id, _ in SEGMENTS:
    for g in list_grades(seg_id):
        g["_seg_label"] = seg_map.get(seg_id, seg_id)
        all_grades.append(g)
grade_opts = {g["id"]: f"{g['_seg_label']}: {g.get('label', g.get('code',''))}" for g in all_grades}
selected_ids = st.multiselect(
    "Séries da escola",
    options=list(grade_opts.keys()),
    default=[gid for gid in ws_grade_ids if gid in grade_opts],
    format_func=lambda x: grade_opts.get(x, str(x)),
)
if st.button("Salvar séries"):
    try:
        set_workspace_grades(ws_id, selected_ids)
        st.success("Séries salvas.")
        st.rerun()
    except Exception as e:
        st.warning("Execute a migration 00007 no Supabase (tabela workspace_grades). " + str(e))

# --- 3. Turmas ---
st.markdown("### 3. Turmas (série + turma)")
if not school_years:
    st.caption("Crie um ano letivo antes de cadastrar turmas.")
else:
    with st.expander("➕ Adicionar turma"):
        with st.form("form_turma"):
            segment_turma = st.selectbox("Segmento", SEGMENTS, format_func=lambda x: x[1], key="seg_turma")
            grades_turma = list_grades_for_workspace(ws_id, segment_turma[0])
            c1, c2, c3 = st.columns(3)
            with c1:
                year_opt = st.selectbox("Ano letivo", school_years, format_func=lambda x: f"{x.get('year')} — {x.get('name','')}")
            with c2:
                if grades_turma:
                    grade_opt = st.selectbox("Série", grades_turma, format_func=lambda g: g.get("label", g.get("code","")))
                else:
                    grade_opt = None
                    st.caption("Selecione séries acima primeiro.")
            with c3:
                class_group = st.text_input("Turma", placeholder="A, B, 1...", value="A")
            if st.form_submit_button("Adicionar turma"):
                if year_opt and grade_opt:
                    _, err = create_class(ws_id, year_opt["id"], grade_opt["id"], class_group)
                    if err:
                        st.error(err)
                    else:
                        st.success("Turma adicionada.")
                        st.rerun()

    with st.expander("📋 Turmas criadas", expanded=True):
        school_year_active = next((y for y in school_years if y.get("active")), school_years[0] if school_years else None)
        if school_year_active:
            classes = list_classes(ws_id, school_year_active.get("id"))
            if classes:
                for c in classes:
                    grade_info = c.get("grade") or {}
                    lbl = f"{grade_info.get('label','')} {c.get('class_group','')}".strip()
                    col_txt, col_btn = st.columns([5, 1])
                    with col_txt:
                        st.markdown(f"• **{lbl}** ({school_year_active.get('year')})")
                    with col_btn:
                        if st.button("Remover", key=f"del_class_{c.get('id')}", type="secondary"):
                            if delete_class(c.get("id")):
                                st.rerun()
            else:
                st.caption("Nenhuma turma. Adicione acima.")
