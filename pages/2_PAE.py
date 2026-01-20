import streamlit as st
from ui_nav import render_topbar_nav

st.set_page_config(page_title="Omnisfera | PAEE", page_icon="🧩", layout="wide")

# Menu superior (só páginas internas)
render_topbar_nav(active="paee")

st.markdown("# PAEE — teste mínimo")
st.success("Se você está vendo isso, o menu está rodando aqui ✅")
st.write("Conteúdo do PAEE entra aqui depois.")
