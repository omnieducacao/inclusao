# ui_lockdown.py
import streamlit as st

def hide_streamlit_chrome_if_needed(show_for_admin: bool = False):
    """
    Esconde menu do Streamlit (que dá acesso a secrets) para usuários comuns.
    Se show_for_admin=True e o usuário é platform_admin, mantém o menu visível.
    """
    try:
        is_test = (st.secrets.get("ENV") == "TESTE")
    except Exception:
        is_test = False
    if is_test:
        return
    if show_for_admin and st.session_state.get("is_platform_admin"):
        return
    st.markdown(
        """
        <style>
          #MainMenu, [data-testid="stMainMenu"], .stMainMenu { display: none !important; visibility: hidden !important; }
          footer, [data-testid="stFooter"], header, [data-testid="stHeader"] { display: none !important; visibility: hidden !important; }
          [data-testid="stToolbar"], [data-testid="stToolbarActions"] { display: none !important; visibility: hidden !important; }
          button[data-testid="collapsedControl"], button[aria-label*="Settings"], button[aria-label*="Menu"] { display: none !important; visibility: hidden !important; }
          button[title*="Settings"], button[title*="Manage"], button[title*="View app"], .stDeployButton { display: none !important; visibility: hidden !important; }
          [data-testid="stSidebar"], section[data-testid="stSidebar"], [data-testid="stSidebarNav"] { display: none !important; visibility: hidden !important; }
          [data-testid="stBottom"], a[href*="streamlit.io"], [class*="stDeployButton"], [class*="stStatusWidget"] { display: none !important; visibility: hidden !important; }
        </style>
        """,
        unsafe_allow_html=True
    )

def hide_default_sidebar_nav():
    st.markdown(
        """<style>[data-testid="stSidebarNav"] { display: none !important; }</style>""",
        unsafe_allow_html=True
    )
