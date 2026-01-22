import streamlit as st

def require_auth_or_block():
    """
    Bloqueia a página se não houver sessão autenticada no novo modelo:
    st.session_state.autenticado == True e workspace_id presente.
    """
    ok = bool(st.session_state.get("autenticado")) and bool(st.session_state.get("workspace_id"))
    if ok:
        return True

    st.markdown("### 🔒 Acesso restrito")
    st.info("Você precisa fazer login (PIN) para acessar esta área.")
    if st.button("Voltar para Login", use_container_width=True):
        # limpa só o essencial
        for k in ["autenticado", "workspace_id", "workspace_name", "usuario_nome", "usuario_cargo"]:
            if k in st.session_state:
                del st.session_state[k]
        st.switch_page("streamlit_app.py")
    st.stop()
