# home_view.py
import streamlit as st
from omni_utils import ensure_state, inject_base_css, supabase_log_access

APP_VERSION = "v1.0"


def render_home():
    ensure_state()
    inject_base_css()

    if not st.session_state.get("autenticado") or not st.session_state.get("workspace_id"):
        st.session_state.view = "login"
        st.rerun()

    user = st.session_state.get("user") or {}
    nome = user.get("nome", "Visitante")
    cargo = user.get("cargo", "")

    # Header simples
    st.markdown(
        f"""
<div class="header-lite">
  <div>
    <div class="h-title">Olá, {nome} 👋</div>
    <div class="h-sub">{cargo} · Workspace ativo</div>
  </div>
  <div class="h-badge">OMNISFERA {APP_VERSION}</div>
</div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("### Acesso rápido")

    c1, c2, c3 = st.columns(3)

    with c1:
        if st.button("🧠 Abrir PEI 360º", use_container_width=True):
            try:
                supabase_log_access(
                    workspace_id=st.session_state.workspace_id,
                    nome=nome,
                    cargo=cargo,
                    event="open_pei",
                    app_version=APP_VERSION,
                )
            except Exception:
                pass

            st.session_state.view = "pei"
            st.rerun()

    with c2:
        st.info("🔜 Em breve: Gestão de alunos / lista na nuvem (workspace)")

    with c3:
        st.info("🔜 Em breve: Hub Inclusão / Diário / Dados")

    st.markdown("---")
    col_a, col_b = st.columns([1, 5])

    with col_a:
        if st.button("🔒 Sair"):
            try:
                supabase_log_access(
                    workspace_id=st.session_state.workspace_id,
                    nome=nome,
                    cargo=cargo,
                    event="logout",
                    app_version=APP_VERSION,
                )
            except Exception:
                pass

            st.session_state.autenticado = False
            st.session_state.workspace_id = None
            st.session_state.user = None
            st.session_state.view = "login"
            st.rerun()
