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


# Estado mínimo
if "autenticado" not in st.session_state:
    st.session_state.autenticado = False
if "workspace_id" not in st.session_state:
    st.session_state.workspace_id = None
if "workspace_name" not in st.session_state:
    st.session_state.workspace_name = None


HOME_PAGE = "pages/0_Home.py"


def home_exists() -> bool:
    # Em Streamlit Cloud o cwd costuma ser a raiz do repo
    return os.path.exists(HOME_PAGE)


try:
    if not st.session_state.autenticado:
        render_login()
    else:
        if not st.session_state.workspace_id:
            st.session_state.autenticado = False
            st.warning("Workspace não encontrado. Faça login novamente.")
            render_login()
        else:
            if home_exists():
                st.switch_page(HOME_PAGE)
            else:
                st.error("Home não encontrada.")
                st.code(f"Crie o arquivo exatamente em: {HOME_PAGE}", language=None)
                if st.button("Sair / Trocar PIN", use_container_width=True):
                    st.session_state.autenticado = False
                    st.session_state.workspace_id = None
                    st.session_state.workspace_name = None
                    st.rerun()

except Exception as e:
    # “cinto de segurança”: se qualquer import/render falhar, você vê algo na tela
    st.error("Erro ao iniciar a aplicação (boot).")
    st.code(str(e), language=None)
    st.info("Verifique também o Manage app → Logs no Streamlit Cloud.")
