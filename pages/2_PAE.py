import streamlit as st
from ui_nav import render_topbar_nav

view = render_topbar_nav()

# roteamento mínimo
if view == "home":
    st.title("Home (teste)")
    st.write("Clique em Plano de Ação para abrir PAEE.")
elif view == "paee":
    # chama o PAEE mínimo
    st.title("Plano de Ação — PAEE (teste)")
    st.write("Se você está vendo isso, o menu + roteamento funcionaram ✅")
    st.success("PAEE renderizado via ?view=paee")
else:
    st.title(f"{view} (teste)")
    st.write("Tela placeholder")
