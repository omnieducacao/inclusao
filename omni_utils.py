import streamlit as st

def require_workspace():
    """
    Guard padrão: impede abrir qualquer página sem workspace válido.
    """
    ws_id = st.session_state.get("workspace_id")
    ws_name = st.session_state.get("workspace_name")

    if not ws_id or not ws_name:
        st.error("Workspace não definido. Volte ao Início e valide o PIN.")
        st.stop()

    return ws_id, ws_name


def clear_workspace():
    """
    Limpa o contexto do workspace (logout simples do PIN).
    """
    for k in ["workspace_id", "workspace_name", "workspace_at"]:
        if k in st.session_state:
            del st.session_state[k]
