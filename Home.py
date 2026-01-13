import streamlit as st
from datetime import date
from openai import OpenAI
import base64
import os
import time

# --- 1. CONFIGURAÇÃO INICIAL ---
st.set_page_config(
    page_title="Omnisfera | Ecossistema Inclusivo", 
    page_icon="🌐", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==============================================================================
# 🔐 SEGURANÇA & UTILITÁRIOS
# ==============================================================================
def get_base64_image(image_path):
    if not os.path.exists(image_path): return ""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

def sistema_seguranca():
    st.markdown("""
        <style>
            [data-testid="stHeader"] {visibility: hidden !important; height: 0px !important;}
            footer {visibility: hidden !important;}
            .login-container { background-color: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; border: 1px solid #E2E8F0; }
            .termo-box { background-color: #F7FAFC; padding: 15px; border-radius: 8px; height: 160px; overflow-y: scroll; font-size: 0.8rem; border: 1px solid #CBD5E0; margin-bottom: 20px; text-align: left; color: #4A5568; }
        </style>
    """, unsafe_allow_html=True)

    if "autenticado" not in st.session_state:
        st.session_state["autenticado"] = False

    if not st.session_state["autenticado"]:
        c1, c2, c3 = st.columns([1, 2, 1])
        with c2:
            st.markdown("<div class='login-container'>", unsafe_allow_html=True)
            try: 
                if os.path.exists("ominisfera.png"): st.image("ominisfera.png", width=280)
                else: st.markdown("## 🌐 OMNISFERA")
            except: st.markdown("## 🌐 OMNISFERA")
            
            st.markdown("### Portal de Acesso")
            st.markdown("---")
            st.markdown("##### 🛡️ Termo de Confidencialidade")
            st.markdown("""<div class="termo-box"><strong>AMBIENTE PROTEGIDO</strong><br><br>1. <strong>Propriedade:</strong> Todo o conteúdo e inteligência deste software são propriedade de Rodrigo A. Queiroz.<br>2. <strong>Sigilo:</strong> É vedada a divulgação de prints, lógicas ou prompts.<br>3. <strong>Uso:</strong> Acesso concedido exclusivamente para fins de desenvolvimento e validação.</div>""", unsafe_allow_html=True)
            concordo = st.checkbox("Li e aceito os termos.")
            senha = st.text_input("Senha:", type="password")
            if st.button("🚀 ENTRAR", type="primary", use_container_width=True):
                hoje = date.today()
                senha_correta = "PEI_START_2026" if hoje <= date(2026, 1, 19) else "OMNI_PRO"
                if not concordo: st.warning("Aceite os termos.")
                elif senha == senha_correta:
                    st.session_state["autenticado"] = True
                    st.rerun()
                else: st.error("Senha inválida.")
            st.markdown("</div>", unsafe_allow_html=True)
        return False
    return True

if not sistema_seguranca(): st.stop()

# ==============================================================================
# 🏠 HOME - DASHBOARD OMNISFERA (ECOSYSTEM FUSION)
# ==============================================================================

# CSS GERAL
st.markdown("""
<style>
    /* Importando Inter para títulos sóbrios e Nunito para corpo */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Nunito:wght@400;600;700&display=swap');
    
    html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: #2D3748; }
    
    /* 1. ESPAÇAMENTO DO TOPO */
    .block-container { 
        padding-top: 1rem !important; 
        padding-bottom: 3rem !important; 
        margin-top: 0rem !important;
    }

    /* --- LOGO GIGANTE ANIMADA --- */
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    
    .logo-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px; 
        margin-bottom: 10px; 
        padding-top: 10px;
    }
    .logo-icon-spin {
        height: 130px; 
        width: auto;
        animation: spin 45s linear infinite; 
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
    }
    .logo-text-static {
        height: 85px; 
        width: auto;
    }

    /* --- HERO BANNER (FONTE SÓBRIA) --- */
    .dash-hero { 
        background: linear-gradient(135deg, #0F52BA 0%, #062B61 100%); 
        border-radius: 16px;
        margin-bottom: 25px; 
        box-shadow: 0 10px 25px rgba(15, 82, 186, 0.25);
        color: white;
        position: relative;
        overflow: hidden;
        padding: 30px 50px; 
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }
    
    .hero-title {
        color: white; 
        font-family: 'Inter', sans-serif; /* Fonte Sóbria */
        font-weight: 700; 
        font-size: 2rem; 
        margin: 0; 
        line-height: 1.1;
        letter-spacing: -0.5px;
    }
    .hero-subtitle {
        color: rgba(255,255,255,0.9);
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        margin-top: 8px; 
        font-weight: 400; 
    }
    
    .hero-bg-icon {
        position: absolute; 
        right: 30px; 
        font-size: 5rem;
        opacity: 0.1; 
        color: white; 
        transform: rotate(-15deg);
        top: 20px;
    }

    /* --- MANIFESTO + INSIGHT CARD (FUSION) --- */
    .manifesto-card {
        background-color: #F7FAFC; /* Cinza muito suave e elegante */
        border-radius: 12px;
        padding: 25px 40px;
        color: #2D3748;
        display: flex; 
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.03);
        border: 1px solid #E2E8F0;
        margin-bottom: 40px;
        margin-top: 10px;
    }
    .manifesto-text {
        font-family: 'Inter', sans-serif;
        font-size: 1.05rem;
        color: #4A5568;
        line-height: 1.6;
        font-style: italic;
    }
    .manifesto-highlight {
        color: #0F52BA;
        font-weight: 600;
        font-style: normal;
    }
    .manifesto-icon { font-size: 2rem; color: #D69E2E; margin-bottom: 5px; }

    /* --- ESTILO DOS BOTÕES PRINCIPAIS (BIG BUTTONS) --- */
    /* Personaliza o botão do Streamlit para parecer o corpo do card */
    div[data-testid="column"] .stButton button {
        width: 100%;
        height: 60px;
        border-radius: 12px;
        border: 1px solid #E2E8F0;
        background-color: white;
        color: #1A365D;
        font-family: 'Inter', sans-serif;
        font-weight: 800;
        font-size: 1.2rem;
        transition: all 0.3s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    div[data-testid="column"] .stButton button:hover {
        border-color: #3182CE;
        color: #3182CE;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        background-color: #F7FAFC;
    }
    
    /* Container da Logo nos Cards */
    .card-logo-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 120px; /* Altura generosa para a logo */
        margin-bottom: 10px;
    }
    .card-logo-img {
        max-height: 100px; /* Logo GRANDE */
        width: auto;
        object-fit: contain;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
    }

    /* --- RODAPÉ --- */
    .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .rich-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s; text-decoration: none; color: inherit; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; overflow: hidden; height: 100%; }
    .rich-card:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.06); border-color: #CBD5E0; }
    .rich-card-top { width: 100%; height: 4px; position: absolute; top: 0; left: 0; }
    .rc-icon { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 12px; }
    .rc-title { font-weight: 700; font-size: 1rem; color: #2D3748; margin-bottom: 5px; }
    .rc-desc { font-size: 0.8rem; color: #718096; line-height: 1.3; }
</style>
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
""", unsafe_allow_html=True)

# GERAÇÃO DA MENSAGEM HÍBRIDA (MANIFESTO + EMPATIA)
# Default se não tiver API
mensagem_hibrida = "A Omnisfera conecta neurociência e pedagogia para transformar a inclusão em potência. Hoje é um ótimo dia para descobrir o talento único de cada aluno."

if 'OPENAI_API_KEY' in st.secrets:
    try:
        if 'manifesto_insight' not in st.session_state:
            client = OpenAI(api_key=st.secrets['OPENAI_API_KEY'])
            prompt = """
            Você é a voz da Omnisfera (um ecossistema de inclusão escolar).
            Gere uma mensagem curta (máximo 2 frases) que faça duas coisas ao mesmo tempo:
            1. Reforce o conceito de que unimos Neurociência, Legislação e Estratégia.
            2. Dê uma mensagem empática e motivadora para o professor que vai usar o sistema hoje.
            Tom: Inspirador, profissional e acolhedor.
            """
            res = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}])
            st.session_state['manifesto_insight'] = res.choices[0].message.content
        mensagem_hibrida = st.session_state['manifesto_insight']
    except: pass

# --- 1. CABEÇALHO LOGO GIGANTE ANIMADA ---
icone_b64 = get_base64_image("omni_icone.png")
texto_b64 = get_base64_image("omni_texto.png")

if icone_b64 and texto_b64:
    st.markdown(f"""
    <div class="logo-container">
        <img src="data:image/png;base64,{icone_b64}" class="logo-icon-spin">
        <img src="data:image/png;base64,{texto_b64}" class="logo-text-static">
    </div>
    """, unsafe_allow_html=True)
else:
    st.markdown("<h1 style='text-align: center; color: #0F52BA; font-size: 3rem; margin-bottom:10px;'>🌐 OMNISFERA</h1>", unsafe_allow_html=True)


# --- 2. HERO BANNER (SÓBRIO & ESQUERDA) ---
st.markdown("""
<div class="dash-hero">
    <div class="hero-text-block">
        <div class="hero-title">Olá, Educador(a)!</div>
        <div class="hero-subtitle">"Cada criança é única; seu potencial, ilimitado!"</div>
    </div>
    <i class="ri-heart-pulse-fill hero-bg-icon"></i>
</div>
""", unsafe_allow_html=True)

# --- 3. MANIFESTO & INSIGHT (FUSIONADO) ---
st.markdown(f"""
<div class="manifesto-card">
    <div class="insight-icon"><i class="ri-lightbulb-flash-line"></i></div>
    <div class="manifesto-text">"{mensagem_hibrida}"</div>
</div>
""", unsafe_allow_html=True)

# --- 4. FERRAMENTAS (LOGOS GIGANTES + BOTÃO TÍTULO) ---
# Preparar logos
logo_pei = get_base64_image("360.png")
logo_pae = get_base64_image("pae.png")
logo_hub = get_base64_image("hub.png")

# Fallback icons
icon_pei = f'<img src="data:image/png;base64,{logo_pei}" class="card-logo-img">' if logo_pei else '<i class="ri-book-read-line" style="font-size:5rem; color:#3182CE;"></i>'
icon_pae = f'<img src="data:image/png;base64,{logo_pae}" class="card-logo-img">' if logo_pae else '<i class="ri-puzzle-line" style="font-size:5rem; color:#805AD5;"></i>'
icon_hub = f'<img src="data:image/png;base64,{logo_hub}" class="card-logo-img">' if logo_hub else '<i class="ri-rocket-line" style="font-size:5rem; color:#38B2AC;"></i>'

col1, col2, col3 = st.columns(3)

# PEI CARD
with col1:
    st.markdown(f"<div class='card-logo-container'>{icon_pei}</div>", unsafe_allow_html=True)
    if st.button("PEI 360º", key="btn_pei"):
        st.switch_page("pages/1_PEI.py")

# PAE CARD
with col2:
    st.markdown(f"<div class='card-logo-container'>{icon_pae}</div>", unsafe_allow_html=True)
    if st.button("PAE CLÍNICO", key="btn_pae"):
        st.switch_page("pages/2_PAE.py")

# HUB CARD
with col3:
    st.markdown(f"<div class='card-logo-container'>{icon_hub}</div>", unsafe_allow_html=True)
    if st.button("HUB CRIATIVO", key="btn_hub"):
        st.switch_page("pages/3_Hub_Inclusao.py")

st.markdown("---")

# --- 5. RECURSOS EDUCATIVOS (RODAPÉ) ---
st.markdown("### 📚 Base de Conhecimento")
st.markdown("""
<div class="home-grid">
    <a href="#" class="rich-card">
        <div class="rich-card-top" style="background-color: #3182CE;"></div>
        <div class="rc-icon" style="background-color:#EBF8FF; color:#3182CE;"><i class="ri-question-answer-line"></i></div>
        <div class="rc-title">PEI vs PAE</div>
        <div class="rc-desc">Entenda as diferenças fundamentais.</div>
    </a>
    <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm" target="_blank" class="rich-card">
        <div class="rich-card-top" style="background-color: #D69E2E;"></div>
        <div class="rc-icon" style="background-color:#FFFFF0; color:#D69E2E;"><i class="ri-scales-3-line"></i></div>
        <div class="rc-title">Legislação</div>
        <div class="rc-desc">Lei Brasileira de Inclusão (2025).</div>
    </a>
    <a href="https://institutoneurosaber.com.br/" target="_blank" class="rich-card">
        <div class="rich-card-top" style="background-color: #D53F8C;"></div>
        <div class="rc-icon" style="background-color:#FFF5F7; color:#D53F8C;"><i class="ri-brain-line"></i></div>
        <div class="rc-title">Neurociência</div>
        <div class="rc-desc">Desenvolvimento atípico.</div>
    </a>
    <a href="http://basenacionalcomum.mec.gov.br/" target="_blank" class="rich-card">
        <div class="rich-card-top" style="background-color: #38A169;"></div>
        <div class="rc-icon" style="background-color:#F0FFF4; color:#38A169;"><i class="ri-compass-3-line"></i></div>
        <div class="rc-title">BNCC</div>
        <div class="rc-desc">Currículo oficial.</div>
    </a>
</div>
""", unsafe_allow_html=True)

st.markdown("---")
st.markdown("<div style='text-align: center; color: #A0AEC0; font-size: 0.8rem;'>Omnisfera © 2026 - Todos os direitos reservados.</div>", unsafe_allow_html=True)
