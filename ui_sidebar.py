# ui_sidebar.py
import os
import streamlit as st

# Ordem importa (pra CSS nth-of-type)
SIDEBAR_ITEMS = [
    ("👥 Alunos", "pages/Alunos.py", "#4F46E5", "ri-team-line"),
    ("📘 PEI", "pages/1_PEI.py", "#3B82F6", "ri-book-open-line"),
    ("🧩 PAEE", "pages/2_PAE.py", "#8B5CF6", "ri-puzzle-line"),
    ("🚀 Hub", "pages/3_Hub_Inclusao.py", "#14B8A6", "ri-rocket-line"),
    ("📓 Diário", "pages/4_Diario_de_Bordo.py", "#64748B", "ri-notebook-line"),
    ("📊 Dados", "pages/5_Monitoramento_Avaliacao.py", "#475569", "ri-bar-chart-line"),
]

def inject_sidebar_css():
    st.markdown("""
    <style>
    /* Sidebar base (mantém seu look) */
    [data-testid="stSidebar"]{
        background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
        border-right: 1px solid #E2E8F0;
    }

    .sidebar-logo-container{
        display:flex; justify-content:center; align-items:center;
        padding: 20px 0; margin-bottom: 20px;
        border-bottom: 1px solid #E2E8F0;
    }

    .sidebar-nav-section{ padding: 0 15px; }
    .sidebar-nav-title{
        font-size: .85rem; font-weight: 700; color:#64748B;
        text-transform: uppercase; letter-spacing: 1px;
        margin-bottom: 15px;
        display:flex; align-items:center; gap: 8px;
    }

    /* Botões DO STREAMLIT (os que funcionam) com cara de “sidebar-nav-button” */
    .sb-nav .stButton > button{
        width: 100% !important;
        margin: 0 0 8px 0 !important;
        border-radius: 10px !important;
        border: 1px solid #E2E8F0 !important;
        background: white !important;
        color: #475569 !important;
        font-weight: 600 !important;
        font-size: .9rem !important;
        padding: 12px 16px !important;
        text-align: left !important;
        transition: all .2s ease !important;
        display:flex !important;
        justify-content:flex-start !important;
        gap: 10px !important;
    }

    .sb-nav .stButton > button:hover{
        background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%) !important;
        color: white !important;
        border-color: #4F46E5 !important;
        transform: translateX(5px) !important;
    }

    /* Aquele “barrinha colorida” na esquerda por item (depende da ordem em SIDEBAR_ITEMS) */
    .sb-nav .stButton:nth-of-type(1) > button{ border-left:4px solid #4F46E5 !important; }
    .sb-nav .stButton:nth-of-type(2) > button{ border-left:4px solid #3B82F6 !important; }
    .sb-nav .stButton:nth-of-type(3) > button{ border-left:4px solid #8B5CF6 !important; }
    .sb-nav .stButton:nth-of-type(4) > button{ border-left:4px solid #14B8A6 !important; }
    .sb-nav .stButton:nth-of-type(5) > button{ border-left:4px solid #64748B !important; }
    .sb-nav .stButton:nth-of-type(6) > button{ border-left:4px solid #475569 !important; }

    /* Logout */
    .sb-logout .stButton > button{
        background: linear-gradient(135deg, #F43F5E 0%, #E11D48 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 12px !important;
        font-weight: 800 !important;
        padding: 12px 16px !important;
        margin-top: 10px !important;
    }
    .sb-logout .stButton > button:hover{
        background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%) !important;
        transform: translateY(-1px) !important;
    }
    </style>
    """, unsafe_allow_html=True)

def _render_sidebar_logo():
    st.markdown('<div class="sidebar-logo-container">', unsafe_allow_html=True)

    if os.path.exists("omnisfera.png"):
        st.image("omnisfera.png", use_container_width=True)
    elif os.path.exists("omni_texto.png"):
        st.image("omni_texto.png", use_container_width=True)
    else:
        st.markdown("""
        <div style="text-align:center;">
          <div style="font-size:1.8rem; font-weight:900; color:#4F46E5;">🌐</div>
          <div style="font-size:1.4rem; font-weight:900;
                      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                      -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
            OMNISFERA
          </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True)

def render_sidebar():
    """
    Sidebar bonita + botões funcionando (st.switch_page).
    Chame isso em TODAS as páginas.
    """
    inject_sidebar_css()

    with st.sidebar:
        _render_sidebar_logo()

        st.markdown("""
        <div class="sidebar-nav-section">
          <div class="sidebar-nav-title"><i class="ri-compass-3-line"></i> NAVEGAÇÃO</div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown('<div class="sb-nav">', unsafe_allow_html=True)

        for label, page, _color, _icon in SIDEBAR_ITEMS:
            # (Opcional) se você quiser mostrar ícone remixicon no texto:
            # label = f"{label}"  # já tem emoji
            if st.button(label, use_container_width=True, key=f"nav_{page}"):
                st.switch_page(page)

        st.markdown('</div>', unsafe_allow_html=True)

        st.markdown("<div style='margin: 14px 0; border-top: 1px solid #E2E8F0;'></div>", unsafe_allow_html=True)

        st.markdown('<div class="sb-logout">', unsafe_allow_html=True)
        if st.button("🚪 Sair do Sistema", use_container_width=True, key="logout_btn"):
            # limpa sessão essencial
            for k in ["autenticado", "workspace_id", "workspace_name", "usuario_nome", "usuario_cargo", "selected_student_id"]:
                st.session_state.pop(k, None)
            # volta pro início do app (ajuste se seu main tiver outro nome)
            try:
                st.switch_page("streamlit_app.py")
            except Exception:
                st.markdown('<a href="/" target="_self">Voltar</a>', unsafe_allow_html=True)
                st.stop()
        st.markdown('</div>', unsafe_allow_html=True)
