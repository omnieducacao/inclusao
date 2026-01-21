import streamlit as st
from omni_utils import verificar_acesso, render_sidebar

st.set_page_config(
    page_title="Omnisfera",
    layout="wide"
)

verificar_acesso()
render_sidebar()

st.title("🌿 Omnisfera")
st.subheader("Plataforma de Gestão Educacional Inclusiva")

st.markdown("""
Bem-vindo ao **Omnisfera**.

Use o menu lateral para acessar:
- Alunos
- PEI 360º
- PAE
- Hub de Inclusão
- Diário
- Dados
""")
