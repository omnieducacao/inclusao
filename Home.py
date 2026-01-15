import streamlit as st
from datetime import date
from openai import OpenAI
import base64
import os
import time

# ==============================================================================
# 1. CONFIGURAÇÃO INICIAL
# ==============================================================================
APP_VERSION = "v116.0"

# Detecção de Ambiente
try:
    IS_TEST_ENV = st.secrets.get("ENV") == "TESTE"
except:
    IS_TEST_ENV = False

titulo_pag = "[TESTE] Omnisfera" if IS_TEST_ENV else "Omnisfera | Ecossistema"
icone_pag = "omni_icone.png" if os.path.exists("omni_icone.png") else "🌐"

st.set_page_config(
    page_title=titulo_pag,
    page_icon=icone_pag,
    layout="wide",
    initial_sidebar_state="expanded" 
)

# ==============================================================================
# 2. UTILITÁRIOS DE IMAGEM
# ==============================================================================
def get_base64_image(image_path):
    if not os.path.exists(image_path): return ""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

# ==============================================================================
# 3. CSS "CIRÚRGICO" (ESTILO CANVA)
# ==============================================================================
# Cores
card_bg = "rgba(255, 220, 50, 0.95)" if IS_TEST_ENV else "rgba(255, 255, 255, 0.85)"
border_color = "#E2E8F0"

st.markdown(f"""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
    
    html, body, [class*="css"] {{
        font-family: 'Nunito', sans-serif;
        color: #2D3748;
        background-color: #F8F9FA;
    }}

    /* --- HEADER (LOGO | SLOGAN ..... BADGE) --- */
    .header-bar {{
        position: fixed; top: 0; left: 0; width: 100%; height: 90px;
        background-color: rgba(255, 255, 255, 0.95);
        border-bottom: 1px solid #E2E8F0;
        z-index: 9999;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 40px;
        backdrop-filter: blur(5px);
    }}
    .header-left {{ display: flex; align-items: center; gap: 20px; }}
    .header-logo-img {{ height: 50px; width: auto; }} /* Ajuste altura da logo */
    .header-divider {{ height: 40px; width: 1px; background-color: #CBD5E0; }}
    .header-slogan {{ color: #718096; font-size: 1rem; font-weight: 600; }}
    .header-badge {{ 
        background: #F7FAFC; border: 1px solid #E2E8F0; 
        padding: 5px 15px; border-radius: 20px; 
        font-size: 0.75rem; font-weight: 800; color: #4A5568; letter-spacing: 1px;
    }}

    /* Container Principal (Ajuste para não ficar embaixo do header) */
    .block-container {{ padding-top: 110px !important; padding-bottom: 3rem !important; }}

    /* --- LOGIN STYLES --- */
    .login-box {{
        background: white; border-radius: 24px; padding: 40px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        text-align: center; border: 1px solid #E2E8F0;
        max-width: 600px; margin: 0 auto; margin-top: 50px;
    }}
    .login-logo {{ height: 80px; margin-bottom: 20px; }}
    .login-manifesto {{ font-style: italic; color: #718096; margin-bottom: 30px; font-size: 0.95rem; }}
    
    /* Botão de Login ao lado da senha */
    .btn-login-inline button {{
        margin-top: 29px !important; /* Truque de alinhamento com input */
        height: 46px !important;
        background-color: #0F52BA !important; color: white !important;
        border-radius: 8px !important; font-weight: 700 !important;
        border: none !important; width: 100%;
    }}
    .btn-login-inline button:hover {{ background-color: #0A3D8F !important; }}

    /* --- HERO SECTION (Azul Degradê) --- */
    .hero-banner {{
        background: linear-gradient(90deg, #0F52BA 0%, #2c5282 100%);
        border-radius: 16px; padding: 40px; color: white;
        margin-bottom: 40px; position: relative; overflow: hidden;
        box-shadow: 0 10px 25px rgba(15, 82, 186, 0.25);
    }}
    .hero-title {{ font-size: 2rem; font-weight: 800; margin-bottom: 10px; }}
    .hero-text {{ font-size: 1.1rem; opacity: 0.9; max-width: 800px; }}
    .hero-bg-icon {{ position: absolute; right: -20px; bottom: -40px; font-size: 15rem; opacity: 0.05; transform: rotate(-15deg); }}

    /* --- CARDS HORIZONTAIS (ACESSO RÁPIDO & CONHECIMENTO) --- */
    .h-card {{
        background: white; border: 2px solid #E2E8F0; border-radius: 16px;
        padding: 20px; height: 100%; min-height: 140px;
        display: flex; align-items: center; gap: 20px;
        transition: all 0.2s ease;
        position: relative;
    }}
    .h-card:hover {{ 
        border-color: #3182CE; transform: translateY(-3px); 
        box-shadow: 0 8px 20px rgba(0,0,0,0.06);
    }}
    
    /* Área da Logo no Card */
    .h-card-img {{ 
        width: 140px; display: flex; justify-content: center; align-items: center; 
        border-right: 1px solid #F0F0F0; padding-right: 20px;
    }}
    .h-card-img img {{ max-height: 50px; max-width: 100%; object-fit: contain; }}
    
    /* Ícones para Conhecimento */
    .h-card-icon {{
        width: 60px; height: 60px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.8rem; flex-shrink: 0;
    }}

    /* Botão "Link" dentro do Card */
    .link-btn-area button {{
        background: transparent !important; border: none !important;
        color: #2D3748 !important; text-decoration: underline;
        font-weight: 700 !important; font-size: 1rem !important;
        padding: 0 !important; margin: 0 !important;
        text-align: left !important;
        white-space: normal !important; /* Permite quebra de linha */
        height: auto !important;
    }}
    .link-btn-area button:hover {{ color: #0F52BA !important; }}

    /* Títulos de Seção */
    .section-header {{ 
        font-size: 1.2rem; font-weight: 800; color: #1A202C; 
        margin-bottom: 20px; display: flex; align-items: center; gap: 10px; 
    }}

    /* Esconde elementos padrão */
    [data-testid="stHeader"] {{ visibility: hidden; height: 0; }}
    [data-testid="stToolbar"] {{ visibility: hidden; }}
    section[data-testid="stSidebar"] {{ display: none; }} /* Sidebar só aparece se ativarmos manualmente ou removermos isso */
</style>
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
""", unsafe_allow_html=True)

# ==============================================================================
# 4. SISTEMA DE LOGIN (DESIGN CLEAN)
# ==============================================================================
if "autenticado" not in st.session_state:
    st.session_state["autenticado"] = False

if not st.session_state["autenticado"]:
    # Coluna centralizada para o Login
    c1, c_main, c2 = st.columns([1, 2, 1])
    
    with c_main:
        st.markdown("<div class='login-box'>", unsafe_allow_html=True)
        
        # Logo Centralizada
        img_login = get_base64_image("omni_icone.png")
        if img_login:
            st.markdown(f"<img src='data:image/png;base64,{img_login}' class='login-logo'>", unsafe_allow_html=True)
        
        # Título
        st.markdown("<h2 style='color:#0F52BA; margin:0;'>OMNISFERA</h2>", unsafe_allow_html=True)
        
        # Manifesto
        st.markdown("<div class='login-manifesto'>\"A Omnisfera é um ecossistema vivo onde a Neurociência encontra a Pedagogia.\"</div>", unsafe_allow_html=True)
        
        # Termos
        st.markdown("<div style='text-align:left; font-size:0.9rem; color:#4A5568; margin-bottom:5px;'>👋 Olá! Para começar:</div>", unsafe_allow_html=True)
        concordo = st.checkbox("Li e concordo com os termos de uso e confidencialidade.")
        
        # Input Senha + Botão na mesma linha
        c_pass, c_btn = st.columns([3, 1])
        with c_pass:
            senha = st.text_input("Senha de Acesso", type="password", label_visibility="visible")
        
        with c_btn:
            # Botão alinhado pelo CSS .btn-login-inline
            st.markdown('<div class="btn-login-inline">', unsafe_allow_html=True)
            entrar = st.button("ENTRAR")
            st.markdown('</div>', unsafe_allow_html=True)
        
        # Lógica
        if entrar:
            hoje = date.today()
            senha_mestra = "PEI_START_2026" if hoje <= date(2026, 1, 19) else "OMNI_PRO"
            if IS_TEST_ENV: senha_mestra = "" # Libera teste

            if not concordo:
                st.warning("⚠️ Aceite os termos para continuar.")
            elif senha != senha_mestra and not IS_TEST_ENV:
                st.error("🚫 Senha incorreta.")
            else:
                st.session_state["autenticado"] = True
                st.session_state["usuario_nome"] = "Visitante"
                st.rerun()

        st.markdown("</div>", unsafe_allow_html=True)
    
    st.stop() # Para a execução aqui se não estiver logado

# ==============================================================================
# 5. DASHBOARD HOME (LAYOUT FINAL)
# ==============================================================================

# --- HEADER FIXO (LOGO À ESQUERDA | SLOGAN | BADGE À DIREITA) ---
img_header = get_base64_image("omni_icone.png")
text_header = get_base64_image("omni_texto.png") # Opcional, se tiver a imagem do texto

logo_html = f"<img src='data:image/png;base64,{img_header}' class='header-logo-img'>" if img_header else "🌐"
# Se tiver imagem do texto, usa, senão usa texto puro
nome_html = f"<img src='data:image/png;base64,{text_header}' style='height:30px; margin-left:10px;'>" if text_header else "<span style='font-weight:800; font-size:1.5rem; color:#0F52BA;'>OMNISFERA</span>"

st.markdown(f"""
<div class="header-bar">
    <div class="header-left">
        {logo_html}
        {nome_html}
        <div class="header-divider"></div>
        <div class="header-slogan">Ecossistema de Inteligência Pedagógica e Inclusiva</div>
    </div>
    <div class="header-badge">OMNISFERA {APP_VERSION}</div>
</div>
""", unsafe_allow_html=True)

# --- HERO SECTION ---
# Pega nome do usuário (primeiro nome)
nome = st.session_state.get("usuario_nome", "Visitante").split()[0]

# Frase do dia (IA ou Fixa)
frase = "A inclusão escolar transforma diferenças em oportunidades."
if 'OPENAI_API_KEY' in st.secrets:
    # Lógica de IA aqui se desejar
    pass

st.markdown(f"""
<div class="hero-banner">
    <div class="hero-title">Olá, {nome}!</div>
    <div class="hero-text">"{frase}"</div>
    <i class="ri-heart-pulse-fill hero-bg-icon"></i>
</div>
""", unsafe_allow_html=True)

# --- FUNÇÃO PARA CRIAR OS CARDS HORIZONTAIS ---
def horizontal_card(coluna, img_path, texto_link, page_target, icon_fallback="ri-star-line", icon_bg="#EDF2F7", icon_color="#2D3748"):
    with coluna:
        # Layout: Container Branco com Borda
        c_container = st.container()
        
        # HTML Estrutura Visual
        img_b64 = get_base64_image(img_path)
        
        if img_b64:
            visual_left = f"<div class='h-card-img'><img src='data:image/png;base64,{img_b64}'></div>"
        else:
            visual_left = f"<div class='h-card-icon' style='background:{icon_bg}; color:{icon_color};'><i class='{icon_fallback}'></i></div>"

        # A montagem do card usa colunas do Streamlit para o botão funcionar nativamente
        # Mas para ter o visual exato "Logo | Texto Link", usamos um truque de HTML + Botão estilo Link
        
        st.markdown(f"""
        <div class="h-card">
            {visual_left}
            <div style="flex-grow: 1;" class="link-btn-area">
        """, unsafe_allow_html=True)
        
        # O Botão do Streamlit entra aqui, estilizado como link pelo CSS .link-btn-area
        if st.button(texto_link, key=f"btn_{texto_link}"):
            st.switch_page(page_target)
            
        st.markdown("</div></div>", unsafe_allow_html=True)

# --- ACESSO RÁPIDO ---
st.markdown('<div class="section-header"><i class="ri-cursor-fill"></i> Acesso Rápido</div>', unsafe_allow_html=True)

c1, c2, c3 = st.columns(3)

# Card 1: PEI
horizontal_card(c1, "360.png", "Crie seu plano de ensino individualizado", "pages/1_PEI.py", "ri-book-read-line")

# Card 2: PAEE
horizontal_card(c2, "pae.png", "Sala de recursos e eliminação de barreiras", "pages/2_PAE.py", "ri-puzzle-line")

# Card 3: HUB
horizontal_card(c3, "hub.png", "Faça adaptação de atividades e roteiros", "pages/3_Hub_Inclusao.py", "ri-rocket-line")

# --- CONHECIMENTO ---
st.markdown('<div style="height: 30px;"></div>', unsafe_allow_html=True)
st.markdown('<div class="section-header"><i class="ri-book-mark-fill"></i> Conhecimento</div>', unsafe_allow_html=True)

k1, k2, k3, k4 = st.columns(4)

# Card K1: PEI vs PAEE
horizontal_card(k1, "", "Fundamentos da Educação Inclusiva", "#", "ri-book-open-line", "#EBF8FF", "#3182CE")

# Card K2: Legislação
horizontal_card(k2, "", "LDB e Marcos Legais da Inclusão", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm", "ri-scales-3-line", "#FFFFF0", "#D69E2E")

# Card K3: Neurociência
horizontal_card(k3, "", "Neurociência aplicada à aprendizagem", "#", "ri-brain-line", "#FFF5F7", "#D53F8C")

# Card K4: BNCC
horizontal_card(k4, "", "Base Nacional Comum Curricular", "http://basenacionalcomum.mec.gov.br/", "ri-compass-3-line", "#F0FFF4", "#38A169")

# --- INSIGHT DO DIA ---
st.markdown('<div style="height: 30px;"></div>', unsafe_allow_html=True)
st.markdown(f"""
<div style="background: #FFFBEB; border: 1px solid #F6E05E; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 15px;">
    <div style="background: #FEFCBF; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #D69E2E; font-size: 1.5rem;">
        <i class="ri-lightbulb-flash-line"></i>
    </div>
    <div>
        <div style="font-weight: 800; font-size: 0.8rem; color: #D69E2E; letter-spacing: 1px; text-transform: uppercase;">Insight do Dia</div>
        <div style="font-style: italic; color: #4A5568;">"Entender como o cérebro aprende é fundamental para potencializar o ensino e criar ambientes de aprendizado mais eficazes e inclusivos."</div>
    </div>
</div>
""", unsafe_allow_html=True)

# Rodapé
st.markdown("<div style='text-align: center; color: #CBD5E0; font-size: 0.8rem; margin-top: 60px;'>Omnisfera desenvolvida e CRIADA por RODRIGO A. QUEIROZ; assim como PEI360, PAEE360 & HUB de Inclusão</div>", unsafe_allow_html=True)
