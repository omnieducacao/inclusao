# pages/2_PAE.py
import streamlit as st

# IMPORT robusto (funciona mesmo em /pages)
try:
    from ui_nav import render_topbar_nav
except Exception:
    import sys, os
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    from ui_nav import render_topbar_nav

render_topbar_nav()

st.markdown("## PAEE (teste)")
st.write("Se você está vendo isso, o nav está funcionando e não deu tela branca.")
