# login_view.py
import os
import base64
from datetime import datetime
import streamlit as st
import streamlit.components.v1 as components
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

def _pick_icon_b64():
    for f in ["omni_icone.png", "omni.png", "logo.png", "iconeaba.png", "omnisfera.png"]:
        bb = b64(f)
        if bb:
            return bb
    return ""

ICON = _pick_icon_b64()
TEXT = b64("omni_texto.png")

# ==============================================================================
# CSS GLOBAL (Nunito)
# ==============================================================================
def inject_css():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

    html, body, [class*="css"] {
        font-family: 'Nunito', sans-serif;
        background: #F7FAFC;
        color: #0f172a;
    }

    /* Container Centralizado */
    .wrap {
        max-width: 480px;
        margin: auto;
        padding-top: 40px;
        padding-bottom: 60px;
    }

    /* Logo Centralizada */
    .brand {
        display:flex;
        align-items:center;
        justify-content: center;
        gap:16px;
        margin-bottom: 18px;
    }

    .logoSpin img {
        width:58px;
        animation: spin 12s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .logoText img {
        height: 42px;
    }

    .subtitle {
        text-align: center;
        margin-bottom: 22px;
        font-weight:800;
        color:#64748B;
        font-size:15px;
    }

    /* Cartão de Login */
    .card {
        background:white;
        border-radius:20px;
        border:1px solid #E2E8F0;
        padding: 30px;
        box-shadow: 0 10px 40px rgba(15,23,42,.06);
    }

    .card-h {
        font-weight:900;
        font-size:18px;
        color:#062B61;
        margin-bottom: 20px;
        text-align: center;
    }

    /* Termo de Confidencialidade */
    .termo-box {
        background-color: #F8FAFC;
        padding: 15px;
        border-radius: 10px;
        height: 120px;
        overflow-y: auto;
        font-size: 13px;
        border: 1px solid #E2E8F0;
        margin: 15px 0;
        text-align: justify;
        color: #475569;
        line-height: 1.5;
        font-weight: 700;
    }

    .err {
        margin-top:12px;
        padding:12px;
        border-radius:14px;
        background:#FEE2E2;
        border:1px solid #FCA5A5;
        color:#7F1D1D;
        font-weight:900;
        text-align: center;
    }

    /* Inputs */
    div[data-testid="stTextInput"] input {
        border-radius: 10px;
    }
    </style>
    """, unsafe_allow_html=True)

# ==============================================================================
# Render
# ==============================================================================
def render_login():
    hide_streamlit()
    inject_css()

    # Container Principal Centralizado
    st.markdown('<div class="wrap">', unsafe_allow_html=True)

    # 1) Logo + subtítulo via components.html (evita “retângulo”/codeblock)
    #    (Se os arquivos não existirem, fica limpo sem quebrar)
    icon_html = f"<img src='data:image/png;base64,{ICON}'>" if ICON else ""
    text_html = f"<img src='data:image/png;base64,{TEXT}'>" if TEXT else "<div style='font-weight:900;font-size:28px;color:#062B61;'>OMNISFERA</div>"

    components.html(
        f"""
        <div class="brand">
            <div class="logoSpin">{icon_html}</div>
            <div class="logoText">{text_html}</div>
        </div>
        <div class="subtitle">Identifique-se para acessar seu workspace</div>
        """,
        height=120,
    )

    # 2) Cartão de Login
    st.markdown('<div class="card">', unsafe_allow_html=True)

    # Inputs
    nome = st.text_input("Seu nome")
    cargo = st.text_input("Sua função")
    pin = st.text_input("PIN do Workspace", type="password")

    # 3) Termo de Confidencialidade (Caixa com rolagem)
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

        pin_norm = pin.strip().upper().replace(" ", "")
        if len(pin_norm) == 8 and "-" not in pin_norm:
            pin_norm = pin_norm[:4] + "-" + pin_norm[4:]

        # Validação via RPC
        ws = rpc_workspace_from_pin(pin_norm)

        if not ws:
            st.markdown("<div class='err'>PIN inválido ou workspace não encontrado.</div>", unsafe_allow_html=True)
        else:
            # Sucesso
            st.session_state.usuario_nome = nome.strip()
            st.session_state.usuario_cargo = cargo.strip()
            st.session_state.autenticado = True
            st.session_state.workspace_id = ws.get("id")
            st.session_state.workspace_name = ws.get("name")
            st.rerun()

    st.markdown('</div>', unsafe_allow_html=True)  # Fim Card

    # Info técnica discreta (também via components para evitar qualquer “retângulo”)
    components.html(
        f"""
        <div style="text-align:center; margin-top:18px; color:#94A3B8; font-size:12px; font-family: 'Nunito', sans-serif;">
            RPC: <code>{RPC_NAME}</code>
        </div>
        """,
        height=30,
    )

    st.markdown('</div>', unsafe_allow_html=True)  # Fim Wrap
