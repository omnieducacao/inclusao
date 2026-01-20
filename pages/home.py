import streamlit as st
from ui_nav import boot_ui, ensure_auth_state

ensure_auth_state()
boot_ui()

st.title("Home OK")
st.write("Se você está vendo isso, o arquivo está limpo.")
