import streamlit as st
from login_view import render_login
from home_view import render_home

# Configuração Global da Página
st.set_page_config(
    page_title="Omnisfera",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Inicializa estado de autenticação se não existir
if "autenticado" not in st.session_state:
    st.session_state.autenticado = False

# Roteamento Simples
if st.session_state.autenticado:
    # Se estiver logado, mostra a Home
    render_home()
else:
    # Se não, mostra o Login
    render_login()
