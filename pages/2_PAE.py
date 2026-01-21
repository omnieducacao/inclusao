import streamlit as st
from ui_nav import boot_ui, ensure_auth_state

ensure_auth_state()
boot_ui()

if not st.session_state.get("autenticado"):
    st.stop()

st.title("Título da Página")

boot_ui(do_route=False)


