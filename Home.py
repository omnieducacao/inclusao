# Home.py
import streamlit as st
from ui_nav import render_topbar_nav

st.set_page_config(page_title="Omnisfera", page_icon="🧩", layout="wide")

# init state
if "autenticado" not in st.session_state:
    st.session_state.autenticado = False
if "view" not in st.session_state:
    st.session_state.view = "login" if not st.session_state.autenticado else "home"

# se não autenticado, força login
if not st.session_state.autenticado:
    st.session_state.view = "login"

# barra
render_topbar_nav()

view = st.session_state.view

# LOGIN
if view == "login":
    st.markdown("## Login")
    u = st.text_input("Usuário")
    p = st.text_input("Senha", type="password")
    if st.button("Entrar"):
        # TODO: validação real
        st.session_state.autenticado = True
        st.session_state.view = "home"
        st.rerun()
    st.stop()

# ROUTER
if view == "home":
    st.markdown("## Home")
    st.write("App rodando ✅")

elif view == "estudantes":
    st.markdown("## Estudantes")
    st.write("Lista/gestão de estudantes aqui.")

elif view == "pei":
    st.markdown("## Estratégias & PEI")
    st.write("Conteúdo do PEI aqui.")

elif view == "paee":
    st.markdown("## Plano de Ação (PAEE)")
    st.write("Conteúdo do PAEE aqui.")

elif view == "hub":
    st.markdown("## Hub de Recursos")
    st.write("Conteúdo do HUB aqui.")

elif view == "diario":
    st.markdown("## Diário de Bordo")
    st.write("Conteúdo do diário aqui.")

elif view == "mon":
    st.markdown("## Evolução & Acompanhamento")
    st.write("Conteúdo do monitoramento aqui.")
