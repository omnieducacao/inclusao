import streamlit as st
import os

# Tenta importar a biblioteca do menu. Se falhar, mostra o erro na tela.
try:
    from streamlit_option_menu import option_menu
except ImportError:
    st.error("ERRO CRÍTICO: A biblioteca 'streamlit-option-menu' não está instalada.")
    st.stop()

# 1. Configuração Básica
st.set_page_config(page_title="Teste Menu", layout="wide")

# 2. Renderização do Menu (Código Mínimo)
st.markdown("### Teste de Renderização do Menu")

selected = option_menu(
    menu_title=None,  # Esconde o título
    options=["Início", "Estudantes", "PEI", "Hub"],  # Opções
    icons=["house", "people", "book", "rocket"],     # Ícones Bootstrap
    default_index=3,  # Começa no Hub (índice 3)
    orientation="horizontal",
    styles={
        "container": {"padding": "5px", "background-color": "#f0f2f6"},
        "nav-link": {"font-size": "14px", "text-align": "center", "margin": "0px"},
        "nav-link-selected": {"background-color": "#0D9488"},
    }
)

# 3. Feedback Visual (Para saber se funcionou)
st.success(f"O menu está funcionando! Você clicou em: **{selected}**")

if selected == "Início":
    st.write("Tentando voltar para Home...")
    # Lógica de navegação segura
    if os.path.exists("pages/0_Home.py"):
        if st.button("Ir para Home (pages/0_Home.py)"):
            st.switch_page("pages/0_Home.py")
    elif os.path.exists("0_Home.py"):
        if st.button("Ir para Home (0_Home.py)"):
            st.switch_page("0_Home.py")
    else:
        st.error("Arquivo de Home não encontrado.")

elif selected == "Hub":
    st.info("Você está na página do Hub.")
