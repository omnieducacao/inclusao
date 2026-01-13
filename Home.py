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
# 🧠 GERAÇÃO DE CONTEÚDO (IA) - ANTES DO CSS PARA INJETAR NO BANNER
# ==============================================================================
mensagem_hibrida = "A Omnisfera conecta neurociência e pedagogia para transformar a inclusão em potência."

if 'OPENAI_API_KEY' in st.secrets:
    try:
        if 'manifesto_insight' not in st.session_state:
            client = OpenAI(api_key=st.secrets['OPENAI_API_KEY'])
            # Prompt calibrado para ser curto e inspirador (Manifesto + Boas Vindas)
            prompt = """
            Gere uma frase de boas-vindas para um professor (máximo 20 palavras).
            A frase deve unir o conceito técnico (Neurociência/Dados) com o emocional (Potencial do aluno).
            Exemplo: "Onde a ciência encontra o afeto para revelar o potencial de cada estudante."
            Não use aspas na resposta.
            """
            res = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}])
            st.session_state['manifesto_insight'] = res.choices[0].message.content
        mensagem_hibrida = st.session_state['manifesto_insight']
    except: pass

# ==============================================================================
# 🏠 HOME - DASHBOARD OMNISFERA (V17 - INTEGRATED)
# ==============================================================================

# CSS GERAL
st.markdown("""
<style>
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
        display: flex; align-items: center; justify-content: center;
        gap: 20px; margin-bottom: 10px; padding-top: 10px;
    }
    .logo-icon-spin {
        height: 130px; width: auto;
        animation: spin 45s linear infinite; 
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
    }
    .logo-text-static { height: 85px; width: auto; }

    /* --- HERO BANNER (COM TEXTO IA INTEGRADO) --- */
    .dash-hero { 
        background: linear-gradient(135deg, #0F52BA 0%, #062B61 100%); 
        border-radius: 16px;
        margin-bottom: 40px; 
        box-shadow: 0 10px 25px rgba(15, 82, 186, 0.25);
        color: white;
        position: relative;
        overflow: hidden;
        padding: 30px 50px; 
        display: flex; align-items: center; justify-content: flex-start;
    }
    
    .hero-text-block { z-index: 2; text-align: left; max-width: 80%; }

    .hero-title {
        color: white; font-family: 'Inter', sans-serif; font-weight: 700; 
        font-size: 2rem; margin: 0; line-height: 1.1; letter-spacing: -0.5px;
    }
    .hero-subtitle {
        color: rgba(255,255,255,0.9);
        font-family: 'Inter', sans-serif;
        font-size: 1.1rem; /* Aumentei um pouco para destaque */
        margin-top: 10px; 
        font-weight: 400; 
        line-height: 1.5;
        font-style: italic;
    }
    
    .hero-bg-icon {
        position: absolute; right: 30px; font-size: 5rem;
        opacity: 0.1; color: white; transform: rotate(-15deg); top: 20px;
    }

    /* --- CARDS DE FERRAMENTA (CLEAN: LOGO + DESCRIÇÃO) --- */
    .tool-card { 
        background: white; border-radius: 20px; padding: 30px 20px; 
        box-shadow: 0 4px 10px rgba(0,0,0,0.03); border: 1px solid #E2E8F0; 
        height: 100%; display: flex; flex-direction: column; justify-content: flex-start; 
        transition: all 0.3s ease; text-align: center;
    }
    .tool-card:hover { 
        transform: translateY(-8px); border-color: #3182CE; 
        box-shadow: 0 15px 30px rgba(0,0,0,0.1); 
    }
    
    .card-logo-box {
        height: 100px; /* Espaço generoso para a logo */
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 15px;
    }
    .card-logo-img {
        max-height: 90px; /* Logo BEM GRANDE */
        width: auto; object-fit: contain;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
    }
    
    /* Descrição limpa */
    .tool-desc { 
        font-size: 0.95rem; color: #4A5568; 
        margin-bottom: 20px; line-height: 1.5; font-weight: 500;
        min-height: 45px; /* Alinha os botões */
    }
    
    /* Botão Acessar Clean */
    div[data-testid="column"] .stButton button {
        width: 100%; border-radius: 10px; border: 1px solid #CBD5E0;
        background-color: #F7FAFC; color: #2D3748;
        font-weight: 700; transition: all 0.2s;
    }
    div[data-testid="column"] .stButton button:hover {
        background-color: #3182CE; color: white; border-color: #3182CE;
    }
    
    /* Bordas de cor */
    .border-blue { border-bottom: 6px solid #3182CE; } 
    .border-purple { border-bottom: 6px solid #805AD5; } 
    .border-teal { border-bottom: 6px solid #38B2AC; }

    /* --- RODAPÉ --- */
    .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .rich-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s; text-decoration: none; color: inherit; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; overflow: hidden; height: 100%; }
    .rich-card:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.06); border-color: #CBD5E0; }
    .rich-card-top { width: 100%; height: 4px; position: absolute; top: 0; left: 0; }
    .rc-icon { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 12px; }
    .rc-title { font-weight: 700; font-size: 1rem; color: #2D3748; margin-bottom: 5px; }
    .rc-desc { font-size: 0.8rem; color: #718096; line-height: 1.3; }
</style>
<link href="https://cdn
