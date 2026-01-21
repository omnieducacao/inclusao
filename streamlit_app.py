import streamlit as st
from _client import get_supabase

sb = get_supabase()

st.title("Omnisfera • Início")

tab_login, tab_admin = st.tabs(["Entrar com PIN", "Criar PIN de teste"])

with tab_login:
    pin = st.text_input("PIN", placeholder="ABCD-1234")
    if st.button("Entrar"):
        res = sb.rpc("workspace_from_pin", {"p_pin": pin.strip()}).execute()
        if res.data:
            ws = res.data[0]
            st.session_state["workspace_id"] = ws["id"]
            st.session_state["workspace_name"] = ws["name"]
            st.success(f"OK: {ws['name']}")
        else:
            st.error("PIN inválido.")

with tab_admin:
    st.caption("Crie um ambiente novo para cada pessoa testar.")
    nome = st.text_input("Nome da escola/ambiente", value="Teste Omnisfera")
    if st.button("Gerar novo PIN"):
        out = sb.rpc("create_workspace_with_pin", {"p_name": nome}).execute()
        if out.data:
            row = out.data[0]
            st.success("Workspace criado!")
            st.write("Nome:", row["name"])
            st.write("ID:", row["id"])
            st.code(row["pin"], language="")  # 👈 mostre o PIN uma vez
            st.info("Copie esse PIN agora. Depois não dá para recuperar.")
        else:
            st.error("Não foi possível criar.")
