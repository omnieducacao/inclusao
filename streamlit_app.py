import streamlit as st
from datetime import datetime
from _client import get_supabase
from omni_utils import clear_workspace

st.set_page_config(page_title="Omnisfera", layout="wide")

# -------------------------------
# Helpers
# -------------------------------
def workspace_from_pin(sb, pin: str):
    """
    Chama a RPC public.workspace_from_pin(p_pin text)
    Deve retornar: {id, name} (ou lista com 0/1 registro).
    """
    pin = (pin or "").strip()
    if not pin:
        return None

    # supabase-py: rpc(...).execute()
    res = sb.rpc("workspace_from_pin", {"p_pin": pin}).execute()

    data = res.data
    if not data:
        return None

    # algumas configs retornam lista
    if isinstance(data, list):
        return data[0] if len(data) else None

    # outras retornam dict direto
    if isinstance(data, dict) and data.get("id"):
        return data

    return None


def render_sidebar():
    """
    Sidebar só habilita navegação quando workspace estiver definido.
    """
    with st.sidebar:
        st.markdown("## Omnisfera")

        if st.session_state.get("workspace_id"):
            st.caption("Escola")
            st.write(st.session_state.get("workspace_name", ""))

            st.caption("Workspace ID")
            st.code(st.session_state.get("workspace_id", ""))

            st.divider()

            # Streamlit moderno: links diretos
            st.page_link("streamlit_app.py", label="Início", icon="🏠")
            st.page_link("pages/0_Alunos.py", label="Alunos", icon="👩‍🎓")
            st.page_link("pages/1_PEI.py", label="PEI", icon="📘")
            st.page_link("pages/2_PAE.py", label="PAE", icon="🧩")
            st.page_link("pages/3_Hub_Inclusao.py", label="Hub Inclusão", icon="🧠")
            st.page_link("pages/4_Diario_de_Bordo.py", label="Diário de Bordo", icon="🗒️")
            st.page_link("pages/5_Monitoramento_Avaliacao.py", label="Monitoramento & Avaliação", icon="📈")

            st.divider()

            if st.button("Sair"):
                clear_workspace()
                st.rerun()
        else:
            st.info("Valide o PIN no Início para liberar as páginas.")


# -------------------------------
# App
# -------------------------------
sb = get_supabase()
render_sidebar()

st.title("Omnisfera")
st.subheader("Acesso por PIN")
st.write("Digite o PIN da escola para acessar o ambiente.")

# já autenticado via PIN?
if st.session_state.get("workspace_id"):
    # HOME pós-PIN
    ws_name = st.session_state.get("workspace_name", "")
    ws_id = st.session_state.get("workspace_id", "")
    ws_at = st.session_state.get("workspace_at", "")

    st.markdown("---")
    c1, c2 = st.columns([3, 2])
    with c1:
        st.markdown(f"### Escola\n**{ws_name}**")
        st.caption(f"Ambiente liberado via PIN • {ws_at}")
    with c2:
        st.caption("Workspace ID")
        st.code(ws_id)

    st.markdown("---")
    a1, a2, a3 = st.columns(3)

    with a1:
        st.markdown("#### Atalho\n**Cadastrar aluno**")
        st.caption("Abra a aba Alunos para criar e gerenciar estudantes.")
        if st.button("Ir para Alunos"):
            st.switch_page("pages/0_Alunos.py")

    with a2:
        st.markdown("#### Atalho\n**Abrir PEI**")
        st.caption("Monte o plano individual e vincule ao aluno.")
        if st.button("Ir para PEI"):
            st.switch_page("pages/1_PEI.py")

    with a3:
        st.markdown("#### Status\n**Supabase**")
        st.caption("Conectividade do backend e RPC por PIN.")
        st.success("Conectado")

    st.markdown("---")
    st.markdown("### Próximos passos")
    st.markdown(
        "- Confirmar que todas as páginas em `/pages` usam `st.session_state.workspace_id` para filtrar dados.\n"
        "- Criar tabelas (students, peis, pae etc.) com coluna `workspace_id`.\n"
        "- Criar políticas/RPCs para inserir/ler por workspace."
    )

else:
    # Tela de PIN
    pin = st.text_input("PIN da escola", value="DEMO-2026")
    if st.button("Validar e entrar"):
        try:
            ws = workspace_from_pin(sb, pin)
        except Exception:
            ws = None

        if not ws:
            st.error("PIN inválido ou workspace não encontrado.")
        else:
            st.session_state["workspace_id"] = ws["id"]
            st.session_state["workspace_name"] = ws["name"]
            st.session_state["workspace_at"] = datetime.now().strftime("%d/%m/%Y %H:%M")
            st.rerun()
