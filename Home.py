import streamlit as st
from datetime import date
from openai import OpenAI
import base64
import os
import time

# ==============================================================================
# 1. CONFIGURAÇÃO INICIAL E AMBIENTE
# ==============================================================================
APP_VERSION = "v116.0"

# Detecção de Ambiente (Secrets)
try:
    IS_TEST_ENV = st.secrets.get("ENV") == "TESTE"
except:
    IS_TEST_ENV = False

# Configurações da Página
titulo_pag = "[TESTE] Omnisfera" if IS_TEST_ENV else "Omnisfera | Ecossistema"
icone_pag = "omni_icone.png" if os.path.exists("omni_icone.png") else "🌐"

st.set_page_config(
    page_title=titulo_pag,
    page_icon=icone_pag,
    layout="wide",
    initial_sidebar_state="expanded" 
)

# ==============================================================================
# 2. UTILITÁRIOS E CORES
# ==============================================================================
def get_base64_image(image_path):
    if not os.path.exists(image_path): return ""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

# Definição de Cores
if IS_TEST_ENV:
    card_bg = "rgba(255, 220, 50, 0.95)" 
    card_border = "rgba(200, 160, 0, 0.5)"
    display_text = "OMNISFERA | TESTE"
    footer_visibility = "visible" 
else:
    card_bg = "rgba(255, 255, 255, 0.85)"
    card_border = "rgba(255, 255, 255, 0.6)"
    display_text = f"OMNISFERA {APP_VERSION}"
    footer_visibility = "hidden"

# ==============================================================================
# 3. CSS GLOBAL (ULTRA COMPACTO)
# ==============================================================================
css_estatico = """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito:wght@400;600;700&display=swap');
    
    html { scroll-behavior: smooth; }
    html, body, [class*="css"] { 
        font-family: 'Nunito', sans-serif; 
        color: #2D3748; 
        background-color: #F7FAFC;
    }

    /* Animações */
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .hover-spring { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease; }
    .hover-spring:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 10px 20px rgba(0,0,0,0.06) !important; z-index: 10; }

    /* CONTAINER PRINCIPAL (Topo mais alto para caber tudo) */
    .block-container { 
        padding-top: 80px !important; 
        padding-bottom: 1rem !important; 
        margin-top: 0rem !important;
        animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    /* --- HEADER FIXO --- */
    .logo-container {
        display: flex; align-items: center; justify-content: flex-start; 
        gap: 15px; 
        position: fixed; 
        top: 0; left: 0; width: 100%; height: 75px; 
        background-color: rgba(247, 250, 252, 0.9); 
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.5);
        z-index: 9999; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        padding-left: 40px;
        padding-top: 5px;
    }
    .header-subtitle-text {
        font-family: 'Nunito', sans-serif; font-weight: 600; font-size: 1rem;
        color: #718096; border-left: 2px solid #CBD5E0; padding-left: 15px;
        height: 35px; display: flex; align-items: center; letter-spacing: -0.3px;
    }
    .logo-icon-spin { height: 65px; width: auto; animation: spin 45s linear infinite; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
    .logo-text-static { height: 40px; width: auto; }

    /* --- LOGIN STYLES --- */
    .login-container { 
        background-color: white; padding: 25px 30px; 
        border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); 
        text-align: center; border: 1px solid #E2E8F0; 
        max-width: 480px; margin: 0 auto; margin-top: 20px;
        animation: fadeInUp 0.8s ease-out;
    }
    .login-logo-spin { height: 80px; width: auto; animation: spin 45s linear infinite; margin-bottom: 5px; }
    .login-logo-static { height: 50px; width: auto; margin-left: 8px; }
    .logo-wrapper { display: flex; justify-content: center; align-items: center; margin-bottom: 15px; }
    .manifesto-login { font-family: 'Nunito', sans-serif; font-size: 0.85rem; color: #64748B; font-style: italic; line-height: 1.4; margin-bottom: 20px; padding: 0 10px; }
    
    /* Box do Termo de Confidencialidade */
    .termo-box { 
        background-color: #F8FAFC; padding: 12px; border-radius: 10px; 
        height: 90px; overflow-y: scroll; font-size: 0.7rem; 
        border: 1px solid #CBD5E0; margin-bottom: 15px; 
        text-align: justify; color: #4A5568; line-height: 1.3; 
    }

    .stTextInput input { border-radius: 10px !important; border: 1px solid #E2E8F0 !important; padding: 8px !important; background-color: #F8FAFC !important; font-size: 0.9rem !important; min-height: auto !important;}

    /* --- HERO COMPACTO --- */
    .dash-hero { 
        background: radial-gradient(circle at top right, #0F52BA, #062B61); 
        border-radius: 16px; margin-bottom: 15px; margin-top: 5px;
        box-shadow: 0 10px 25px -5px rgba(15, 82, 186, 0.3);
        color: white; position: relative; overflow: hidden; 
        padding: 20px 30px; 
        display: flex; align-items: center; justify-content: flex-start;
        border: 1px solid rgba(255,255,255,0.1);
        min-height: 90px;
    }
    .hero-title { 
        font-family: 'Inter', sans-serif; font-weight: 700; font-size: 1.4rem; 
        margin: 0; line-height: 1.1; margin-bottom: 4px; 
    }
    .hero-subtitle { 
        font-family: 'Inter', sans-serif; font-size: 0.85rem; opacity: 0.9; font-weight: 400; 
    }
    .hero-bg-icon { position: absolute; right: 20px; font-size: 5rem; opacity: 0.05; top: 10px; transform: rotate(-10deg); }

    /* --- CARDS FERRAMENTAS --- */
    .nav-btn-card {
        background-color: white; border-radius: 14px; padding: 12px;
        border: 1px solid #E2E8F0; box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        text-align: center; transition: all 0.2s ease; cursor: pointer;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        height: 120px; position: relative; overflow: hidden;
        text-decoration: none !important;
    }
    .nav-btn-card:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.08); border-color: #CBD5E0; }
    .nav-icon { height: 40px; width: auto; object-fit: contain; margin-bottom: 8px; }
    .nav-desc { font-size: 0.7rem; color: #718096; line-height: 1.2; font-weight: 500; }
    
    .b-blue { border-bottom: 3px solid #3182CE; }
    .b-purple { border-bottom: 3px solid #805AD5; }
    .b-teal { border-bottom: 3px solid #38B2AC; }

    .stButton button { display: none !important; }

    /* --- BENTO GRID --- */
    .bento-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-bottom: 15px; }
    .bento-item { 
        background: white; border-radius: 12px; padding: 12px; border: 1px solid #E2E8F0; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.01); text-decoration: none; color: inherit; 
        display: flex; flex-direction: column; align-items: center; text-align: center; 
        position: relative; overflow: hidden; height: 100%; transition: transform 0.2s;
    }
    .bento-item:hover { transform: translateY(-2px); border-color: #CBD5E0; }
    .bento-icon { 
        width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; 
        font-size: 1.1rem; margin-bottom: 6px; 
    }
    .bento-title { font-weight: 700; font-size: 0.8rem; color: #1A202C; margin-bottom: 2px; }
    .bento-desc { font-size: 0.7rem; color: #718096; line-height: 1.1; }

    /* --- INSIGHT CARD (Mais colado no rodapé) --- */
    .insight-card-end { 
        background: linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%); 
        border-radius: 12px; padding: 12px 20px; 
        color: #2D3748; display: flex; align-items: center; gap: 15px; 
        box-shadow: 0 5px 15px rgba(214, 158, 46, 0.08); 
        border: 1px solid rgba(214, 158, 46, 0.2); 
        margin-bottom: 5px; /* Margem inferior mínima */
        margin-top: 10px;
    }
    .insight-icon-end { 
        font-size: 1.4rem; color: #D69E2E; background: rgba(214, 158, 46, 0.1); 
        width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }
    
    .section-title { 
        font-family: 'Inter', sans-serif; font-weight: 700; font-size: 1rem; 
        color: #1A202C; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; margin-top: 15px; 
    }

    /* Ocultar elementos padrão */
    [data-testid="stHeader"] { visibility: hidden !important; height: 0px !important; }
    [data-testid="stToolbar"] { visibility: hidden !important; display: none !important; }
</style>
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
"""
st.markdown(css_estatico, unsafe_allow_html=True)

# CSS DINÂMICO
st.markdown(f"""
<style>
    .omni-badge {{
        position: fixed; top: 15px; right: 15px;
        background: {card_bg}; border: 1px solid {card_border};
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        padding: 5px 15px; min-width: 150px; border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.06); z-index: 999990;
        display: flex; align-items: center; justify-content: center;
        pointer-events: none; transition: transform 0.3s ease;
    }}
    .omni-text {{
        font-family: 'Inter', sans-serif; font-weight: 800; font-size: 0.6rem;
        color: #2D3748; letter-spacing: 1.5px; text-transform: uppercase;
    }}
    footer {{ visibility: {footer_visibility} !important; }}
    
    /* Botão de Login */
    .login-btn-area button {{
        width: 100%; border-radius: 10px !important; border: none !important;
        font-family: 'Inter', sans-serif; font-weight: 700 !important; font-size: 0.9rem !important;
        padding: 8px 0; transition: all 0.3s ease; height: 40px !important;
        background-color: #0F52BA !important; color: white !important;
        display: block !important; 
    }}
    .login-btn-area button:hover {{ 
        box-shadow: 0 4px 12px rgba(15, 82, 186, 0.3); transform: translateY(-1px);
    }}
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 4. SISTEMA DE SEGURANÇA E LOGIN
# ==============================================================================
def sistema_seguranca():
    if "autenticado" not in st.session_state:
        st.session_state["autenticado"] = False

    if not st.session_state["autenticado"]:
        
        st.markdown("""
        <style>
            section[data-testid="stSidebar"] { display: none !important; }
            [data-testid="stSidebarCollapsedControl"] { display: none !important; }
            .stButton button { display: block !important; }
        </style>
        """, unsafe_allow_html=True)

        btn_text = "🚀 ENTRAR (TESTE)" if IS_TEST_ENV else "🔒 ACESSAR OMNISFERA"
        
        c1, c_login, c2 = st.columns([1, 2, 1])
        
        with c_login:
            st.markdown("<div class='login-container'>", unsafe_allow_html=True)
            
            icone_b64_login = get_base64_image("omni_icone.png")
            texto_b64_login = get_base64_image("omni_texto.png")
            
            if icone_b64_login and texto_b64_login:
                st.markdown(f"""
                <div class="logo-wrapper">
                    <img src="data
