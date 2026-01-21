# streamlit_app.py
import os
import streamlit as st
from login_view import render_login


def get_env() -> str:
    try:
        v = st.secrets.get("ENV", None)
        if v:
            return str(v).strip().upper()
    except Exception:
        pass
    return (os.getenv("ENV") or "").strip().upper()


ENV = get_env()

st.set_page_config(
    page_title="Omnisfera | Ecossistema",
    page_icon="🌐",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Esconder chrome só fora de TESTE
if ENV != "TESTE":
    st.markdown(
        """
        <style>
          #MainMenu {visibility: hidden;}
          footer {visibility: hidden;}
          header {visibility: hidden;}
        </style>
        """,
        unsafe_allow_html=True,
    )


# estado mínimo global
if "autenticado" not in st.session_state:
    st.session_state.autenticado = False
if "workspace_id" not in st.session_state:
    st.session_state.workspace_id = None
if "workspace_name" not in st.session_state:
    st.session_state.workspace_name = None

# Router
if not st.session_state.autenticado:
    render_login()
else:
    # ✅ manda para a Home real (multipage)
    st.switch_page("pages/0_Home.py")
