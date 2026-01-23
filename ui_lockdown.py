# ui_lockdown.py
import streamlit as st

def _is_test_env() -> bool:
    try:
        return str(st.secrets.get("ENV", "")).strip().upper() == "TESTE"
    except Exception:
        return False


def hide_streamlit_chrome_if_needed():
    """
    Se ENV != TESTE (ou não existir), esconde menus nativos do Streamlit.
    """
    if _is_test_env():
        return

    st.markdown(
        """
        <style>
          /* Chrome clássico */
          #MainMenu { visibility: hidden !important; }
          footer { visibility: hidden !important; }
          header { visibility: hidden !important; }

          /* Chrome moderno (às vezes aparece) */
          [data-testid="stToolbar"] { display: none !important; }
          [data-testid="stStatusWidget"] { display: none !important; }
          [data-testid="stHeader"] { display: none !important; }

          /* Botões/áreas do topo em releases novas */
          div[data-testid="stDecoration"] { display: none !important; }
        </style>
        """,
        unsafe_allow_html=True
    )


def hide_default_sidebar_nav(hide_sidebar_container: bool = False):
    """
    Esconde a navegação automática do multipage (lista de páginas na sidebar).
    Opcionalmente, pode esconder a sidebar inteira se você NÃO usa sidebar em nenhuma página.
    """
    st.markdown(
        f"""
        <style>
          /* Navegação automática multipage */
          [data-testid="stSidebarNav"] {{
            display: none !important;
          }}

          /* Alguns builds usam wrappers diferentes */
          section[data-testid="stSidebar"] nav {{
            display: none !important;
          }}

          /* Se quiser esconder a sidebar inteira (cuidado se você usa st.sidebar em alguma página) */
          {"section[data-testid='stSidebar'] { display: none !important; }" if hide_sidebar_container else ""}
        </style>
        """,
        unsafe_allow_html=True
    )
