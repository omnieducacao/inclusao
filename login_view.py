# login_view.py
import os
import base64
from datetime import datetime
import streamlit as st
from supabase_client import rpc_workspace_from_pin, RPC_NAME

# ==============================================================================
# Ambiente / Chrome
# ==============================================================================
def _env():
    try:
        return str(st.secrets.get("ENV", "")).upper()
    except:
        return ""

def hide_streamlit():
    if _env() == "TESTE":
        return
    st.markdown("""
    <style>
        #MainMenu, footer, header { visibility: hidden; }
        [data-testid="stToolbar"] { visibility: hidden; }
        .block-container { padding-top: 1.2rem; }
    </style>
    """, unsafe_allow_html=True)

# ==============================================================================
# Assets
# ==============================================================================
def b64(path):
    if path and os.path.exists(path):
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode()
    return ""

ICON = next((b64(f) for f in ["omni_icone.png","omni.png","logo.png"] if b64(f)), "")
# TEXT asset não será mais o foco principal no topo, usaremos texto elegante no card

# ==============================================================================
# CSS GLOBAL (Nunito + Playfair Display)
# ==============================================================================
def inject_css():
    st.markdown("""
    <style>
    /* Importando Nunito (Interface) e Playfair Display (Elegante) */
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

    html, body, [class*="css"] {
        font-family: 'Nunito', sans-serif;
        background: #F7FAFC;
        color: #0f172a;
    }

    /* Container Centralizado */
    .wrap { 
        max-width: 480px; 
        margin: auto; 
        padding-top: 60px; 
        padding-bottom: 60px;
    }

    /* Logo (Ícone apenas, girando) */
    .brand-icon {
        display:flex;
        justify-content: center;
        margin-bottom: 30px;
    }

    .logoSpin img {
        width: 70px; /* Um pouco maior */
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
        animation: spin 20s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Subtítulo discreto fora do card */
    .subtitle-outsider {
        text-align: center;
        margin-bottom: 20px;
        font-weight: 600;
        color: #94A3B8;
        font-size: 14px;
        letter-spacing: 0.5px;
    }

    /* Cartão de Login */
    .card {
        background: white;
        border-radius: 24px;
        border: 1px solid #F1F5F9;
        padding: 40px 30px;
        box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.08);
    }

    /* Título Elegante (Omnisfera) */
    .card-title-elegant {
        font-family: 'Playfair Display', serif; /* Fonte Elegante */
        font-weight: 700;
        font-size: 32px;
        color: #1E293B;
        text-align: center;
        margin-bottom: 8px;
        letter-spacing: -0.5px;
    }
    
    .card-sub-elegant {
        text-align: center;
        color: #64748B;
        font-size: 14px;
        margin-bottom: 30px;
    }

    /* Termo de Confidencialidade (Caixa Sutil) */
    .termo-box {
        background-color: #F8FAFC; 
        padding: 15px; 
        border-radius: 12px;
        height: 120px; 
        overflow-y: auto; 
        font-size: 12.5px;
        border: 1px solid #E2E8F0; 
        margin: 20px 0 15px 0;
        text-align: justify; 
        color: #475569;
        line-height: 1.6;
    }

    /* Scrollbar fina para o termo */
    .termo-box::-webkit-scrollbar { width: 4px; }
    .termo-box::-webkit-scrollbar-thumb { background: #CBD5E0; border-radius: 4px; }

    .err {
        margin-top:12px;
        padding:12px;
        border-radius:12px;
        background:#FEF2F2;
        border:1px solid #FECACA;
        color:#991B1B;
        font-weight:700;
        font-size: 14px;
        text-align: center;
    }
    
    /* Inputs mais limpos */
    div[data-testid="stTextInput"] input {
        border-radius: 10px;
        border: 1px solid #E2E8F0;
        padding-left: 12px;
    }
    div[data-testid="stTextInput"] input:focus {
        border-color: #94A3B8;
        box-shadow: none;
    }
    </style>
    """, unsafe_allow_html=True)

# ==============================================================================
# Render
# ==============================================================================
def render_login():
    hide_streamlit()
    inject_css()

    # Container Principal
    st.markdown('<div class="wrap">', unsafe_allow_html=True)

    # 1. Apenas o Ícone Girando fora (Centralizado)
    st.markdown(f"""
    <div class="brand-icon">
        <div class="logoSpin"><img src="data:image/png;base64,{ICON}"></div>
    </div>
    """, unsafe_allow_html=True)

    # 2. Cartão de Login
    st.markdown('<div class="card">', unsafe_allow_html=True)
    
    # Título Elegante "Omnisfera" (Sem caixa, fonte serifada)
    st.markdown("""
    <div class="card-title-elegant">Omnisfera</div>
    <div class="card-sub-elegant">Acesso seguro ao workspace</div>
    """, unsafe_allow_html=True)
    
    # Inputs
    nome = st.text_input("Seu nome")
    cargo = st.text_input("Sua função")
    pin = st.text_input("PIN do Workspace", type="password")

    # 3. Termo de Confidencialidade
    st.markdown("""
    <div class="termo-box">
        <strong>1. Confidencialidade:</strong> O usuário compromete-se a não inserir dados reais sensíveis (nomes completos, documentos) que identifiquem estudantes, exceto em ambiente seguro autorizado pela instituição.<br><br>
        <strong>2. Natureza Beta:</strong> O sistema está em evolução constante. Algumas funcionalidades podem sofrer alterações.<br><br>
        <strong>3. Responsabilidade:</strong> As sugestões geradas pela IA servem como apoio pedagógico e devem ser sempre validadas por um profissional humano qualificado.<br><br>
        <strong>4. Acesso:</strong> O PIN de acesso é pessoal e intransferível dentro da organização.
    </div>
    """, unsafe_allow_html=True)

    aceitar = st.checkbox("Li e aceito o Termo de Confidencialidade")

    st.markdown("<div style='height:15px'></div>", unsafe_allow_html=True)

    if st.button("Validar e entrar", use_container_width=True, type="primary"):
        if not (nome and cargo and aceitar and pin):
            st.markdown("<div class='err'>Preencha todos os campos e aceite o termo.</div>", unsafe_allow_html=True)
            st.stop()

        pin = pin.strip().upper()
        if len(pin) == 8 and "-" not in pin:
            pin = pin[:4] + "-" + pin[4:]

        ws = rpc_workspace_from_pin(pin)
        
        if not ws:
            st.markdown("<div class='err'>PIN inválido ou workspace não encontrado.</div>", unsafe_allow_html=True)
        else:
            st.session_state.usuario_nome = nome
            st.session_state.usuario_cargo = cargo
            st.session_state.autenticado = True
            st.session_state.workspace_id = ws["id"]
            st.session_state.workspace_name = ws["name"]
            st.rerun()

    st.markdown('</div>', unsafe_allow_html=True) # Fim Card
    
    # Rodapé discreto
    st.markdown(f"""
    <div style="text-align:center; margin-top:20px; color:#CBD5E1; font-size:11px; font-weight:500;">
        SECURE LOGIN • RPC: {RPC_NAME}
    </div>
    """, unsafe_allow_html=True)

    st.markdown('</div>', unsafe_allow_html=True) # Fim Wrap
