import streamlit as st
from ui_nav import boot_ui, ensure_auth_state
import views as V

st.set_page_config(page_title="Omnisfera", layout="wide")

ensure_auth_state()
boot_ui()

def render_login():
    st.markdown("## Entrar")
    st.caption("Acesso restrito à plataforma Omnisfera.")

    with st.form("login_form"):
        email = st.text_input("E-mail")
        senha = st.text_input("Senha", type="password")
        ok = st.form_submit_button("Entrar")

    if ok:
        if email.strip() and senha.strip():
            st.session_state.autenticado = True
            st.session_state.user = {"email": email.strip()}
            st.session_state.go = "home"
            st.rerun()
        else:
            st.error("Preencha e-mail e senha.")

# Gate
if not st.session_state.autenticado:
    render_login()
    st.stop()

# Router SPA
go = st.session_state.get("go", "home")

if go == "home":
    V.render_home()
elif go == "alunos":
    V.render_alunos()
elif go == "pei":
    V.render_pei()
elif go == "pae":
    V.render_pae()
elif go == "hub":
    V.render_hub()
elif go == "diario":
    V.render_stub("Diário", "Em breve.")
elif go == "dados":
    V.render_stub("Dados", "Em breve.")
else:
    st.session_state.go = "home"
    st.rerun()
