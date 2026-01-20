import streamlit as st
from ui_nav import boot_ui, ensure_auth_state, route_from_query

st.set_page_config(page_title="Omnisfera", layout="wide")

ensure_auth_state()
boot_ui(do_route=False)

def render_login():
    st.markdown("## Entrar")
    st.caption("Acesso restrito à plataforma Omnisfera.")

    with st.form("login_form"):
        email = st.text_input("E-mail")
        senha = st.text_input("Senha", type="password")
        ok = st.form_submit_button("Entrar")

    if ok:
        # LOGIN DEMO (placeholder)
        if email.strip() and senha.strip():
            st.session_state.autenticado = True
            st.session_state.user = {"email": email.strip()}
            st.query_params["go"] = "home"
            st.switch_page("pages/home.py")
        else:
            st.error("Preencha e-mail e senha.")

go = st.query_params.get("go", "login")

# NÃO autenticado -> sempre login
if not st.session_state.autenticado:
    st.query_params["go"] = "login"
    render_login()
    st.stop()

# Autenticado
if go == "login":
    st.query_params["go"] = "home"
    st.switch_page("pages/home.py")
else:
    route_from_query(default_go="home")
    st.markdown("Redirecionando…")
