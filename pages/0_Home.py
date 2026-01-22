# pages/0_Home.py
import streamlit as st
from datetime import date
import base64
import os
import time

# ==============================================================================
# 1. CONFIGURAÇÃO INICIAL
# ==============================================================================
APP_VERSION = "v135.0 (Flat Design)"

# Detecção de Ambiente
try:
    IS_TEST_ENV = st.secrets.get("ENV") == "TESTE"
except Exception:
    IS_TEST_ENV = False

st.set_page_config(
    page_title="Omnisfera",
    page_icon="omni_icone.png" if os.path.exists("omni_icone.png") else "🌐",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==============================================================================
# 2. GATE DE ACESSO (PROTEÇÃO)
# ==============================================================================
def acesso_bloqueado(msg: str):
    st.markdown(f"""
    <div style="max-width:500px; margin:100px auto; text-align:center; padding:30px; background:white; border-radius:16px; border:1px solid #E2E8F0; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
        <div style="font-size:3rem; margin-bottom:15px;">🔐</div>
        <div style="font-weight:800; font-size:1.2rem; color:#2D3748; margin-bottom:8px;">Acesso Restrito</div>
        <div style="color:#718096; margin-bottom:20px;">{msg}</div>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.button("🔑 Ir para Login", use_container_width=True, type="primary"):
            st.session_state.autenticado = False
            st.session_state.workspace_id = None
            st.rerun()
    st.stop()

if not st.session_state.get("autenticado", False):
    acesso_bloqueado("Sessão expirada ou não iniciada.")

if not st.session_state.get("workspace_id"):
    acesso_bloqueado("Nenhum workspace vinculado.")

# ==============================================================================
# 3. HELPERS & STATE
# ==============================================================================
if "dados" not in st.session_state:
    st.session_state.dados = {"nome": "", "nasc": date(2015, 1, 1), "serie": None, "turma": "", "diagnostico": "", "student_id": None}

def get_base64_image(image_path: str) -> str:
    if not image_path or not os.path.exists(image_path): return ""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

def escola_vinculada() -> str:
    # Tenta pegar o nome legível, se não, usa o ID
    return st.session_state.get("workspace_name") or st.session_state.get("workspace_id", "")[:8]

# ==============================================================================
# 4. CSS (DESIGN SYSTEM FLAT)
# ==============================================================================
st.markdown("""
<style>
/* Import Fonts & Icons */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito:wght@400;600;700&display=swap');
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

html, body, [class*="css"] {
    font-family: 'Nunito', sans-serif;
    color: #1A202C;
    background-color: #F7FAFC; /* Fundo cinza gelo muito suave */
}

/* Limpeza do Streamlit */
[data-testid="stSidebarNav"] { display: none !important; }
[data-testid="stHeader"] { visibility: hidden !important; height: 0px !important; }
.block-container { padding-top: 110px !important; padding-bottom: 3rem !important; max-width: 1200px; }

/* --- TOPBAR FIXA --- */
.header-container {
    position: fixed; top: 0; left: 0; width: 100%; height: 80px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    z-index: 99999;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 30px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.logo-spin { height: 48px; width: auto; animation: spin 20s linear infinite; }
.logo-text { height: 32px; width: auto; margin-left: 12px; }
.header-div { width: 1px; height: 30px; background: #CBD5E0; margin: 0 15px; }
.header-slogan { font-weight: 600; color: #718096; font-size: 0.9rem; letter-spacing: 0.3px; }

.header-badge {
    background: white; border: 1px solid #E2E8F0;
    padding: 6px 14px; border-radius: 12px;
    text-align: right;
}
.badge-label { font-size: 0.65rem; font-weight: 800; color: #A0AEC0; text-transform: uppercase; letter-spacing: 1px; }
.badge-val { font-size: 0.85rem; font-weight: 800; color: #2D3748; }

@keyframes spin { 100% { transform: rotate(360deg); } }

/* --- HERO SECTION --- */
.hero-box {
    background: linear-gradient(135deg, #0F52BA 0%, #062B61 100%);
    border-radius: 20px;
    padding: 35px 40px;
    color: white;
    box-shadow: 0 15px 40px rgba(15, 82, 186, 0.25);
    margin-bottom: 40px;
    display: flex; align-items: center; justify-content: space-between;
    border: 1px solid rgba(255,255,255,0.1);
}
.hero-welcome { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 1.8rem; margin-bottom: 5px; }
.hero-sub { opacity: 0.85; font-size: 1rem; font-weight: 500; }
.hero-action { 
    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
    padding: 10px 20px; border-radius: 12px; text-align: right;
}

/* --- CARDS FLAT (O SALTO DE DESIGN) --- */
.flat-card {
    background: white;
    border-radius: 18px;
    padding: 24px;
    border: 1px solid #EDF2F7;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    height: 180px; /* Altura fixa para uniformidade */
    position: relative;
    display: flex; flex-direction: column; justify-content: space-between;
    overflow: hidden;
}

.flat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
    border-color: #E2E8F0;
}

/* Ícone com fundo colorido */
.icon-box {
    width: 50px; height: 50px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    margin-bottom: 15px;
}

.card-title { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 1.1rem; color: #1A202C; margin-bottom: 6px; }
.card-desc { font-size: 0.85rem; color: #718096; line-height: 1.4; }
.card-link { font-size: 0.8rem; font-weight: 700; margin-top: auto; display: flex; align-items: center; gap: 5px; }

/* Cores dos Ícones */
.theme-blue { background: #EBF8FF; color: #3182CE; } /* PEI */
.theme-purple { background: #FAF5FF; color: #805AD5; } /* PAEE */
.theme-teal { background: #E6FFFA; color: #319795; } /* Hub */
.theme-indigo { background: #E0E7FF; color: #4F46E5; } /* Alunos */
.theme-gray { background: #F7FAFC; color: #718096; } /* Inativo */

/* Botão Invisível (Ghost Button) */
.ghost-btn button {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    opacity: 0; z-index: 10; cursor: pointer;
}
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 5. TOPBAR RENDER
# ==============================================================================
icone_b64 = get_base64_image("omni_icone.png")
texto_b64 = get_base64_image("omni_texto.png")
esc = escola_vinculada()

logo_html = f'<img src="data:image/png;base64,{icone_b64}" class="logo-spin">' if icone_b64 else "🌐"
nome_html = f'<img src="data:image/png;base64,{texto_b64}" class="logo-text">' if texto_b64 else "<b style='color:#0F52BA;margin-left:10px'>OMNISFERA</b>"

st.markdown(f"""
<div class="header-container">
    <div style="display:flex; align-items:center;">
        {logo_html}
        {nome_html}
        <div class="header-div"></div>
        <div class="header-slogan">Inteligência Pedagógica</div>
    </div>
    <div class="header-badge">
        <div class="badge-label">WORKSPACE</div>
        <div class="badge-val">{esc if esc else "Não vinculado"}</div>
    </div>
</div>
""", unsafe_allow_html=True)

# ==============================================================================
# 6. SIDEBAR
# ==============================================================================
with st.sidebar:
    st.markdown("### 🧭 Navegação")
    if st.button("👥 Alunos", use_container_width=True): st.switch_page("pages/0_Alunos.py")
    
    c1, c2 = st.columns(2)
    with c1: 
        if st.button("📘 PEI", use_container_width=True): st.switch_page("pages/1_PEI.py")
    with c2: 
        if st.button("🧩 PAEE", use_container_width=True): st.switch_page("pages/2_PAE.py")
    
    if st.button("🚀 Hub", use_container_width=True): st.switch_page("pages/3_Hub_Inclusao.py")
    
    st.markdown("---")
    st.markdown(f"**👤 {st.session_state.get('usuario_nome', 'Usuário')}**")
    st.caption(st.session_state.get("usuario_cargo", "Educador"))
    
    if st.button("Sair", use_container_width=True):
        st.session_state.autenticado = False
        st.rerun()

# ==============================================================================
# 7. HERO SECTION (LIMPA)
# ==============================================================================
nome_usuario = st.session_state.get('usuario_nome', 'Visitante').split()[0]

st.markdown(f"""
<div class="hero-box">
    <div>
        <div class="hero-welcome">Olá, {nome_usuario}!</div>
        <div class="hero-sub">Seja bem-vindo ao seu painel de controle da inclusão.</div>
    </div>
    <div class="hero-action">
        <div style="font-size:0.7rem; opacity:0.8; text-transform:uppercase; font-weight:700;">Acesso Rápido</div>
        <div style="font-weight:700;">Seus módulos</div>
    </div>
</div>
""", unsafe_allow_html=True)

# ==============================================================================
# 8. MÓDULOS (CARDS COM ÍCONES FLAT)
# ==============================================================================
st.markdown("### 🚀 Módulos")

def render_module_card(title, desc, icon_class, theme_class, target_page, key):
    # Renderiza o visual HTML
    st.markdown(f"""
    <div class="flat-card">
        <div class="icon-box {theme_class}">
            <i class="{icon_class}"></i>
        </div>
        <div>
            <div class="card-title">{title}</div>
            <div class="card-desc">{desc}</div>
        </div>
        <div class="card-link" style="color: inherit;">
            Abrir módulo <i class="ri-arrow-right-line"></i>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Botão Invisível por cima
    st.markdown(f'<div class="ghost-btn">', unsafe_allow_html=True)
    if st.button(f"btn_{key}", key=key):
        if target_page:
            st.switch_page(target_page)
        else:
            st.toast("🚧 Módulo em desenvolvimento", icon="🔨")
    st.markdown('</div>', unsafe_allow_html=True)

# Grid de Cards
r1_c1, r1_c2, r1_c3 = st.columns(3)

with r1_c1:
    render_module_card(
        "Estudantes", 
        "Gestão, seleção e histórico clínico.", 
        "ri-group-line", "theme-indigo", "pages/0_Alunos.py", "mod_alunos"
    )

with r1_c2:
    render_module_card(
        "Estratégias & PEI", 
        "Plano Educacional Individualizado.", 
        "ri-book-open-line", "theme-blue", "pages/1_PEI.py", "mod_pei"
    )

with r1_c3:
    render_module_card(
        "Plano de Ação / PAEE", 
        "Intervenções e sala de recursos.", 
        "ri-puzzle-2-line", "theme-purple", "pages/2_PAE.py", "mod_pae"
    )

st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True) # Espaçamento

r2_c1, r2_c2, r2_c3 = st.columns(3)

with r2_c1:
    render_module_card(
        "Hub de Recursos", 
        "Modelos, adaptações e ferramentas IA.", 
        "ri-rocket-2-line", "theme-teal", "pages/3_Hub_Inclusao.py", "mod_hub"
    )

with r2_c2:
    render_module_card(
        "Diário de Bordo", 
        "Registro contínuo e evidências.", 
        "ri-file-list-3-line", "theme-gray", "pages/4_Diario_de_Bordo.py", "mod_diario"
    )

with r2_c3:
    render_module_card(
        "Evolução & Dados", 
        "Indicadores e visão longitudinal.", 
        "ri-bar-chart-box-line", "theme-gray", "pages/5_Monitoramento_Avaliacao.py", "mod_dados"
    )

# Footer
st.markdown("<div style='text-align: center; color: #CBD5E0; font-size: 0.75rem; margin-top: 50px;'>Omnisfera desenvolvida por RODRIGO A. QUEIROZ</div>", unsafe_allow_html=True)
