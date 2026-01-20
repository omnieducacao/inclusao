# pages/2_PAE.py
import streamlit as st

# IMPORT robusto (funciona mesmo em /pages)
try:
    from ui_nav import render_topbar_nav

render_topbar_nav(active="home")         # na Home
# render_topbar_nav(active="estudantes") # em 0_Alunos.py
# render_topbar_nav(active="pei")        # em 1_PEI.py
# render_topbar_nav(active="paee")       # em 2_PAE.py
# render_topbar_nav(active="hub")        # em 3_Hub_Inclusao.py
# render_topbar_nav(active="diario")     # em 4_Diario_de_Bordo.py
# render_topbar_nav(active="mon")        # em 5_Monitoramento_Avaliacao.py
