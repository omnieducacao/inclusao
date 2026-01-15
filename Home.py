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
# 3. CSS GLOBAL (COMPACTADO E ELEGANTE)
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

    /* CONTAINER PRINCIPAL MAIS APERTADO */
    .block-container { 
        padding-top: 85px !important; 
        padding-bottom: 1rem !important; 
        margin-top: 0rem !important;
        animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    /* --- HEADER (ABSOLUTE) --- */
    .logo-container {
        display: flex; align-items: center; justify-content: flex-start; 
        gap: 15px; 
        position: absolute; 
        top: 0; left: 0; width: 100%; height: 80px; /* Altura reduzida */
        background: linear-gradient(to bottom, #F7FAFC 0%, rgba(247, 250, 252, 0) 100%);
        z-index: 9998; 
        padding-left: 40px;
        padding-top: 10px;
    }
    .header-subtitle-text {
        font-family: 'Nunito', sans-serif; font-weight: 600; font-size: 1rem;
        color: #718096; border-left: 2px solid #CBD5E0; padding-left: 15px;
        height: 35px; display: flex; align-items: center; letter-spacing: -0.3px;
    }
    /* Logo um pouco maior como pedido, mas header compacto */
    .logo-icon-spin { height: 85px; width: auto; animation: spin 45s linear infinite; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
    .logo-text-static { height: 40px; width: auto; }

    /* Login Styles */
    .login-container { 
        background-color: white; padding: 30px; 
        border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); 
        text-align: center; border: 1px solid #E2E8F0; 
        max-width: 450px; margin: 0 auto; margin-top: 40px;
        animation: fadeInUp 0.8s ease-out;
    }
    .login-logo-spin { height: 80px; width: auto; animation: spin 45s linear infinite; margin-bottom: 5px; }
    .login-logo-static { height: 50px; width: auto; margin-left: 8px; }
    .logo-wrapper { display: flex; justify-content: center; align-items: center; margin-bottom: 20px; }
    .manifesto-login { font-family: 'Nunito', sans-serif; font-size: 0.85rem; color: #64748B; font-style: italic; line-height: 1.5; margin-bottom: 25px; }
    
    .stTextInput input { border-radius: 10px !important; border: 1px solid #E2E8F0 !important; padding: 10px !important; background-color: #F8FAFC !important; font-size: 0.9rem !important;}
    
    /* --- HERO COMPACTO --- */
    .dash-hero { 
        background: radial-gradient(circle at top right, #0F52BA, #062B61); 
        border-radius: 16px; 
        margin-bottom: 20px; /* Margem reduzida */
        margin-top: 10px;
        box-shadow: 0 10px 25px -5px rgba(15, 82, 186, 0.3);
        color: white; position: relative; overflow: hidden; 
        padding: 25px 35px; /* Padding reduzido */
        display: flex; align-items: center; justify-content: flex-start;
        border: 1px solid rgba(255,255,255,0.1);
        min-height: 100px;
    }
    .hero-title { 
        font-family: 'Inter', sans-serif; 
        font-weight: 700; font-size: 1.5rem; /* Fonte menor */
        margin: 0; line-height: 1.1; margin-bottom: 5px; 
    }
    .hero-subtitle { 
        font-family: 'Inter', sans-serif; 
        font-size: 0.9rem; opacity: 0.9; font-weight: 400; 
    }
    .hero-bg-icon { position: absolute; right: 20px; font-size: 6rem; opacity: 0.05; top: 5px; transform: rotate(-10deg); }

    /* --- CARDS FERRAMENTAS COMPACTOS --- */
    .tool-card { 
        background: white; border-radius: 16px; padding: 15px 15px; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.02); border: 1px solid #E2E8F0; 
        height: 100%; display: flex; flex-direction: column; justify-content: space-between; 
        text-align: center; position: relative; overflow: hidden;
    }
    .card-logo-box { height: 55px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
    .card-logo-img { max-height: 50px; width: auto; object-fit: contain; }
    .tool-desc-short { font-size: 0.8rem; color: #718096; font-weight: 500; margin-bottom: 15px; min-height: 32px; line-height: 1.3; }
    
    .border-blue { border-bottom: 4px solid #3182CE; } 
    .border-purple { border-bottom: 4px solid #805AD5; } 
    .border-teal { border-bottom: 4px solid #38B2AC; }

    /* --- BENTO GRID COMPACTO --- */
    .bento-grid { 
        display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
        gap: 12px; margin-bottom: 20px; /* Gap e margem reduzidos */
    }
    .bento-item { 
        background: white; border-radius: 14px; padding: 15px; border: 1px solid #E2E8F0; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.01); text-decoration: none; color: inherit; 
        display: flex; flex-direction: column; align-items: center; text-align: center; 
        position: relative; overflow: hidden; height: 100%; 
    }
    .bento-icon { 
        width: 35px; height: 35px; border-radius: 10px; display: flex; align-items: center; justify-content: center; 
        font-size: 1.2rem; margin-bottom: 8px; transition: transform 0.3s ease;
    }
    .bento-item:hover .bento-icon { transform: scale(1.1) rotate(5deg); }
    .bento-title { font-weight: 700; font-size: 0.85rem; color: #1A202C; margin-bottom: 2px; }
    .bento-desc { font-size: 0.75rem; color: #718096; line-height: 1.2; }

    /* --- INSIGHT CARD COMPACTO --- */
    .insight-card-end { 
        background: linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%); 
        border-radius: 14px; padding: 15px 20px; 
        color: #2D3748; display: flex; align-items: center; gap: 15px; 
        box-shadow: 0 5px 15px rgba(214, 158, 46, 0.08); 
        border: 1px solid rgba(214, 158, 46, 0.2); margin-bottom: 15px; 
    }
    .insight-icon-end { 
        font-size: 1.5rem; color: #D69E2E; background: rgba(214, 158, 46, 0.1); 
        width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }
    
    .section-title { 
        font-family: 'Inter', sans-serif; font-weight: 700; font-size: 1.1rem; 
        color: #1A202C; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; margin-top: 25px; 
    }

    /* Ocultar */
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
    
    /* Botões Pequenos e Elegantes */
    div[data-testid="column"] .stButton button {{
        width: 100%; border-radius: 10px !important; border: none !important;
        font-family: 'Inter', sans-serif; font-weight: 700 !important; font-size: 0.85rem !important;
        padding: 8px 0; transition: all 0.3s ease; height: 38px !important;
        background-color: #F1F5F9; color: #475569;
    }}
    div[data-testid="column"] .stButton button:hover {{ 
        background-color: #3182CE !important; color: white !important; 
        box-shadow: 0 4px 10px rgba(49, 130, 206, 0.25); transform: translateY(-1px);
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
        </style>
        """, unsafe_allow_html=True)

        btn_text = "🚀 ENTRAR (TESTE)" if IS_TEST_ENV else "🔒 ACESSAR OMNISFERA"
        btn_color = "#E65100" if IS_TEST_ENV else "#0F52BA"

        st.markdown(f"""
        <style>
            div.stButton > button {{
                background-color: {btn_color} !important; color: white !important; height: 45px !important; font-size: 0.9rem !important;
            }}
            .login-container {{ border-color: #E2E8F0 !important; }}
        </style>
        """, unsafe_allow_html=True)

        c1, c_login, c2 = st.columns([1, 2, 1])
        
        with c_login:
            st.markdown("<div class='login-container'>", unsafe_allow_html=True)
            
            icone_b64_login = get_base64_image("omni_icone.png")
            texto_b64_login = get_base64_image("omni_texto.png")
            
            if icone_b64_login and texto_b64_login:
                st.markdown(f"""
                <div class="logo-wrapper">
                    <img src="data:image/png;base64,{icone_b64_login}" class="login-logo-spin">
                    <img src="data:image/png;base64,{texto_b64_login}" class="login-logo-static">
                </div>""", unsafe_allow_html=True)
            else:
                st.markdown(f"<h2 style='color:#0F52BA; margin:0; margin-bottom:10px;'>OMNISFERA</h2>", unsafe_allow_html=True)

            st.markdown("""<div class="manifesto-login">"A Omnisfera é um ecossistema vivo onde a <strong>Neurociência</strong> encontra a <strong>Pedagogia</strong>."</div>""", unsafe_allow_html=True)
            
            if IS_TEST_ENV:
                with st.expander("📝 Dados (Opcional)"):
                    nome_user = st.text_input("nome_fake", placeholder="Nome", label_visibility="collapsed")
                    cargo_user = st.text_input("cargo_fake", placeholder="Cargo", label_visibility="collapsed")
            else:
                st.markdown("<div style='text-align:left; font-weight:700; color:#475569; font-size:0.85rem; margin-bottom:5px;'>Identificação</div>", unsafe_allow_html=True)
                nome_user = st.text_input("nome_real", placeholder="Seu Nome", label_visibility="collapsed")
                st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
                cargo_user = st.text_input("cargo_real", placeholder="Seu Cargo", label_visibility="collapsed")
                st.markdown("---")
                st.caption("ℹ️ Software em fase Beta.")
                concordo = st.checkbox("Concordo com os termos.")
                st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
                senha = st.text_input("senha_real", type="password", placeholder="Senha", label_visibility="collapsed")

            st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)
            
            if st.button(btn_text):
                if IS_TEST_ENV:
                    st.session_state["autenticado"] = True
                    st.session_state["usuario_nome"] = nome_user if nome_user else "Visitante Teste"
                    st.session_state["usuario_cargo"] = cargo_user if cargo_user else "Dev"
                    st.rerun()
                else:
                    hoje = date.today()
                    senha_mestra = "PEI_START_2026" if hoje <= date(2026, 1, 19) else "OMNI_PRO"
                    if not concordo: st.warning("Aceite os termos.")
                    elif not nome_user or not cargo_user: st.warning("Preencha seus dados.")
                    elif senha != senha_mestra: st.error("Senha incorreta.")
                    else:
                        st.session_state["autenticado"] = True
                        st.session_state["usuario_nome"] = nome_user
                        st.session_state["usuario_cargo"] = cargo_user
                        st.rerun()
            
            st.markdown("</div>", unsafe_allow_html=True)
        return False
    return True

if not sistema_seguranca(): st.stop()

# ==============================================================================
# 5. CONTEÚDO DA HOME (SÓ CARREGA APÓS LOGIN)
# ==============================================================================

# CARD OMNISFERA (Canto Direito)
st.markdown(f"""<div class="omni-badge hover-spring"><span class="omni-text">{display_text}</span></div>""", unsafe_allow_html=True)

# HEADER LOGO (ABSOLUTE)
icone_b64 = get_base64_image("omni_icone.png")
texto_b64 = get_base64_image("omni_texto.png")

if icone_b64 and texto_b64:
    st.markdown(f"""
    <div class="logo-container">
        <img src="data:image/png;base64,{icone_b64}" class="logo-icon-spin">
        <img src="data:image/png;base64,{texto_b64}" class="logo-text-static">
        <div class="header-subtitle-text">Ecossistema de Inteligência Pedagógica e Inclusiva</div>
    </div>
    """, unsafe_allow_html=True)
else:
    st.markdown("<div class='logo-container'><h1 style='color: #0F52BA; margin:0;'>🌐 OMNISFERA</h1><div class='header-subtitle-text'>Ecossistema de Inteligência Pedagógica e Inclusiva</div></div>", unsafe_allow_html=True)

nome_display = st.session_state.get("usuario_nome", "Educador").split()[0]

# Banner Message
mensagem_banner = "Unindo ciência, dados e empatia para transformar a educação."
if 'OPENAI_API_KEY' in st.secrets:
    try:
        if 'banner_msg' not in st.session_state:
            client = OpenAI(api_key=st.secrets['OPENAI_API_KEY'])
            res = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Frase inspiradora muito curta para {nome_display} sobre inclusão."}])
            st.session_state['banner_msg'] = res.choices[0].message.content
        mensagem_banner = st.session_state['banner_msg']
    except: pass

# --- SIDEBAR (SÓ AGORA) ---
with st.sidebar:
    if "usuario_nome" in st.session_state:
        st.markdown(f"**👤 {st.session_state['usuario_nome']}**")
        st.caption(f"{st.session_state['usuario_cargo']}")
        st.markdown("---")

    st.markdown("### 📢 Feedback")
    tipo = st.selectbox("Tipo:", ["Sugestão", "Erro", "Elogio"])
    msg = st.text_area("Mensagem:", height=80)
    if st.button("Enviar"):
        if msg: st.toast("Enviado!", icon="✅"); time.sleep(1)

# --- HERO SECTION COMPACTO ---
st.markdown(f"""
<div class="dash-hero hover-spring">
    <div class="hero-text-block">
        <div class="hero-title">Olá, {nome_display}!</div>
        <div class="hero-subtitle">"{mensagem_banner}"</div>
    </div>
    <i class="ri-heart-pulse-fill hero-bg-icon"></i>
</div>
""", unsafe_allow_html=True)

# FERRAMENTAS COMPACTAS
st.markdown("<div class='section-title'><i class='ri-cursor-fill'></i> Acesso Rápido</div>", unsafe_allow_html=True)

logo_pei = get_base64_image("360.png")
logo_paee = get_base64_image("pae.png")
logo_hub = get_base64_image("hub.png")

c1, c2, c3 = st.columns(3)

with c1:
    img = f'<img src="data:image/png;base64,{logo_pei}" class="card-logo-img">' if logo_pei else '<i class="ri-book-read-line" style="font-size:3rem; color:#3182CE;"></i>'
    st.markdown(f"""<div class="tool-card border-blue hover-spring"><div class="card-logo-box">{img}</div><div class="tool-desc-short">Plano de Ensino Individualizado.</div></div>""", unsafe_allow_html=True)
    if st.button("➜ Acessar PEI", use_container_width=True): st.switch_page("pages/1_PEI.py")

with c2:
    img = f'<img src="data:image/png;base64,{logo_paee}" class="card-logo-img">' if logo_paee else '<i class="ri-puzzle-line" style="font-size:3rem; color:#805AD5;"></i>'
    st.markdown(f"""<div class="tool-card border-purple hover-spring"><div class="card-logo-box">{img}</div><div class="tool-desc-short">Sala de Recursos e Tecnologia.</div></div>""", unsafe_allow_html=True)
    if st.button("➜ Acessar PAEE", use_container_width=True): st.switch_page("pages/2_PAE.py")

with c3:
    img = f'<img src="data:image/png;base64,{logo_hub}" class="card-logo-img">' if logo_hub else '<i class="ri-rocket-line" style="font-size:3rem; color:#38B2AC;"></i>'
    st.markdown(f"""<div class="tool-card border-teal hover-spring"><div class="card-logo-box">{img}</div><div class="tool-desc-short">Adaptação de provas e roteiros.</div></div>""", unsafe_allow_html=True)
    if st.button("➜ Acessar Hub", use_container_width=True): st.switch_page("pages/3_Hub_Inclusao.py")

# BENTO GRID (LINKS RÁPIDOS)
st.markdown("<div class='section-title'><i class='ri-book-mark-fill'></i> Conhecimento</div>", unsafe_allow_html=True)

st.markdown("""
<div class="bento-grid">
    <a href="#" class="bento-item hover-spring">
        <div class="bento-icon" style="background:#EBF8FF; color:#3182CE;"><i class="ri-question-answer-line"></i></div>
        <div class="bento-title">PEI vs PAEE</div>
    </a>
    <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm" target="_blank" class="bento-item hover-spring">
        <div class="bento-icon" style="background:#FFFFF0; color:#D69E2E;"><i class="ri-scales-3-line"></i></div>
        <div class="bento-title">Legislação</div>
    </a>
    <a href="https://institutoneurosaber.com.br/" target="_blank" class="bento-item hover-spring">
        <div class="bento-icon" style="background:#FFF5F7; color:#D53F8C;"><i class="ri-brain-line"></i></div>
        <div class="bento-title">Neurociência</div>
    </a>
    <a href="http://basenacionalcomum.mec.gov.br/" target="_blank" class="bento-item hover-spring">
        <div class="bento-icon" style="background:#F0FFF4; color:#38A169;"><i class="ri-compass-3-line"></i></div>
        <div class="bento-title">BNCC</div>
    </a>
</div>
""", unsafe_allow_html=True)

# INSIGHT DO DIA
noticia_insight = "A aprendizagem acontece quando o cérebro se emociona."
if 'OPENAI_API_KEY' in st.secrets:
    try:
        if 'insight_dia' not in st.session_state:
            client = OpenAI(api_key=st.secrets['OPENAI_API_KEY'])
            res = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": "Dica de 1 frase curta sobre neurociência."}])
            st.session_state['insight_dia'] = res.choices[0].message.content
        noticia_insight = st.session_state['insight_dia']
    except: pass

st.markdown(f"""
<div class="insight-card-end hover-spring">
    <div class="insight-icon-end"><i class="ri-lightbulb-flash-line"></i></div>
    <div>
        <div style="font-weight: 800; font-size: 0.8rem; color: #D69E2E; letter-spacing: 0.5px; text-transform: uppercase;">Insight do Dia</div>
        <p style="margin:2px 0 0 0; font-size:0.9rem; opacity:0.9; color:#4A5568; font-style: italic;">"{noticia_insight}"</p>
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("<div style='text-align: center; color: #CBD5E0; font-size: 0.7rem; margin-top: 40px;'>Criado e Desenvolvido por Rodrigo A. Queiroz</div>", unsafe_allow_html=True)
