import streamlit as st
from datetime import date, datetime
import base64
import os

# ==============================================================================
# 1. CONFIGURAÇÃO INICIAL
# ==============================================================================
APP_VERSION = "v2.1 - Guia de Inclusão"

try:
    IS_TEST_ENV = st.secrets.get("ENV", "PRODUCAO") == "TESTE"
except Exception:
    IS_TEST_ENV = False

st.set_page_config(
    page_title="Omnisfera - Plataforma de Inclusão Educacional",
    page_icon="🌐" if not os.path.exists("omni_icone.png") else "omni_icone.png",
    layout="wide",
    initial_sidebar_state="auto",
    menu_items=None
)

# ==============================================================================
# 2. CSS & DESIGN SYSTEM (COM SIDEBAR OCULTADA)
# ==============================================================================
st.markdown(
    """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    color: #1E293B !important;
    background-color: #F8FAFC !important;
}

/* --- OCULTAR SIDEBAR E HEADER NATIVOS DO STREAMLIT --- */
[data-testid="stSidebarNav"],
[data-testid="stHeader"],
[data-testid="stToolbar"],
[data-testid="collapsedControl"],
footer {
    display: none !important;
}

/* Ajustar padding para compensar a topbar fixa */
.block-container {
    padding-top: 100px !important;
    padding-bottom: 4rem !important;
    max-width: 95% !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

/* --- HEADER FIXO COM LOGO GRANDE --- */
.topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border-bottom: 1px solid #E2E8F0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.brand-box {
    display: flex;
    align-items: center;
    gap: 12px;
}

.brand-logo {
    height: 55px !important;
    width: auto !important;
    animation: spin 45s linear infinite;
    filter: brightness(1.1);
}

.brand-img-text {
    height: 35px !important;
    width: auto;
    margin-left: 10px;
}

.user-badge {
    background: #F1F5F9;
    border: 1px solid #E2E8F0;
    padding: 6px 14px;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 700;
    color: #64748B;
    letter-spacing: 0.5px;
}

/* --- HERO SECTION --- */
.hero-wrapper {
    background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
    border-radius: 20px;
    padding: 3rem;
    color: white;
    margin-bottom: 40px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 40px -10px rgba(30, 58, 138, 0.3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 220px;
}

.hero-wrapper::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.3;
}

.hero-wrapper::after {
    content: "";
    position: absolute;
    right: -60px;
    top: -60px;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    pointer-events: none;
    filter: blur(40px);
}

.hero-content {
    z-index: 2;
    position: relative;
}

.hero-greet {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
    line-height: 1.2;
}

.hero-text {
    font-size: 1.1rem;
    opacity: 0.95;
    max-width: 800px;
    line-height: 1.6;
    font-weight: 500;
}

.hero-icon {
    opacity: 0.8;
    font-size: 4rem;
    z-index: 1;
    position: relative;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

/* --- BOTÕES DE MÓDULO (ESTILO RECURSO COMPACTO) --- */
.mod-btn-wrapper {
    background: white;
    border-radius: 12px;
    padding: 12px 16px;
    border: 1px solid #E2E8F0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    height: 100%;
    min-height: 110px;
    text-align: center;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.mod-btn-wrapper:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    border-color: transparent;
}

.mod-btn-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    flex-shrink: 0;
    margin-bottom: 4px;
}

.mod-btn-title {
    font-weight: 700;
    font-size: 0.85rem;
    color: #1E293B;
    line-height: 1.2;
}

/* --- CORES DOS MÓDULOS (BASEADAS NO RECURSO) --- */
.mod-indigo .mod-btn-icon { background: #EEF2FF; color: #4F46E5; border: 1px solid #A5B4FC; }
.mod-indigo:hover { border-color: #A5B4FC !important; }

.mod-blue .mod-btn-icon { background: #EFF6FF; color: #2563EB; border: 1px solid #93C5FD; }
.mod-blue:hover { border-color: #93C5FD !important; }

.mod-purple .mod-btn-icon { background: #F5F3FF; color: #7C3AED; border: 1px solid #C4B5FD; }
.mod-purple:hover { border-color: #C4B5FD !important; }

.mod-teal .mod-btn-icon { background: #F0FDFA; color: #0D9488; border: 1px solid #5EEAD4; }
.mod-teal:hover { border-color: #5EEAD4 !important; }

.mod-rose .mod-btn-icon { background: #FFF1F2; color: #BE123C; border: 1px solid #FDA4AF; }
.mod-rose:hover { border-color: #FDA4AF !important; }

.mod-sky .mod-btn-icon { background: #F0F9FF; color: #0369A1; border: 1px solid #BAE6FD; }
.mod-sky:hover { border-color: #BAE6FD !important; }

/* --- RECURSOS --- */
.res-card-link {
    text-decoration: none !important;
    display: block;
    height: 100%;
    border-radius: 14px;
    overflow: hidden;
}

.res-card {
    background: white;
    border-radius: 14px;
    padding: 20px;
    border: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    height: 100%;
    min-height: 96px;
}

.res-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
    border-color: transparent;
}

.res-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.res-card:hover .res-icon {
    transform: scale(1.1) rotate(5deg);
}

.res-info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.res-name {
    font-weight: 700;
    color: #1E293B;
    font-size: 0.95rem;
    margin-bottom: 2px;
    transition: color 0.2s;
}

.res-card:hover .res-name {
    color: #4F46E5;
}

.res-meta {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748B;
    opacity: 0.8;
}

/* --- CARDS DE INFORMAÇÃO --- */
.info-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #E2E8F0;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
    height: 100%;
    min-height: 320px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.info-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
    border-color: #CBD5E1;
}

.info-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #F1F5F9;
}

.info-card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
}

.info-card-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: #1E293B;
    margin: 0;
    line-height: 1.3;
}

.info-card-content {
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 8px;
}

.info-card-content p {
    font-size: 0.85rem;
    color: #64748B;
    line-height: 1.5;
    margin-bottom: 12px;
}

.info-card-content ul {
    font-size: 0.85rem;
    color: #64748B;
    line-height: 1.5;
    margin-left: 16px;
    margin-bottom: 12px;
}

.info-card-content li {
    margin-bottom: 6px;
}

/* --- CORES DOS CARDS DE INFORMAÇÃO --- */
.info-card-orange {
    border-left: 4px solid #EA580C;
}
.info-card-orange .info-card-icon {
    background: #FFF7ED;
    color: #EA580C;
    border: 1px solid #FDBA74;
}

.info-card-blue {
    border-left: 4px solid #3B82F6;
}
.info-card-blue .info-card-icon {
    background: #EFF6FF;
    color: #3B82F6;
    border: 1px solid #93C5FD;
}

.info-card-purple {
    border-left: 4px solid #8B5CF6;
}
.info-card-purple .info-card-icon {
    background: #F5F3FF;
    color: #8B5CF6;
    border: 1px solid #C4B5FD;
}

.info-card-teal {
    border-left: 4px solid #14B8A6;
}
.info-card-teal .info-card-icon {
    background: #F0FDFA;
    color: #14B8A6;
    border: 1px solid #5EEAD4;
}

.info-card-rose {
    border-left: 4px solid #E11D48;
}
.info-card-rose .info-card-icon {
    background: #FFF1F2;
    color: #E11D48;
    border: 1px solid #FDA4AF;
}

.info-card-indigo {
    border-left: 4px solid #4F46E5;
}
.info-card-indigo .info-card-icon {
    background: #EEF2FF;
    color: #4F46E5;
    border: 1px solid #A5B4FC;
}

/* --- MÉTRICAS --- */
.metric-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid #E2E8F0;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
    border-color: #CBD5E1;
}

.metric-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
    display: block;
}

.metric-value {
    font-size: 2rem;
    font-weight: 800;
    color: #1E293B;
    line-height: 1;
    margin-bottom: 0.25rem;
}

.metric-change {
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.metric-up { color: #059669 !important; }
.metric-down { color: #DC2626 !important; }
.metric-neutral { color: #64748B !important; }

/* --- CORES RECURSOS --- */
.rc-sky {
    background: #F0F9FF !important;
    color: #0284C7 !important;
    border-color: #BAE6FD !important;
}
.rc-sky .res-icon { background: #F0F9FF !important; border: 1px solid #BAE6FD !important; }

.rc-green {
    background: #F0FDF4 !important;
    color: #16A34A !important;
    border-color: #BBF7D0 !important;
}
.rc-green .res-icon { background: #F0FDF4 !important; border: 1px solid #BBF7D0 !important; }

.rc-rose {
    background: #FFF1F2 !important;
    color: #E11D48 !important;
    border-color: #FECDD3 !important;
}
.rc-rose .res-icon { background: #FFF1F2 !important; border: 1px solid #FECDD3 !important; }

.rc-orange {
    background: #FFF7ED !important;
    color: #EA580C !important;
    border-color: #FDBA74 !important;
}
.rc-orange .res-icon { background: #FFF7ED !important; border: 1px solid #FDBA74 !important; }

/* --- ANIMAÇÕES --- */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* --- RESPONSIVIDADE --- */
@media (max-width: 1024px) {
    .topbar { padding: 0 1.5rem; }
    .hero-wrapper { padding: 2rem; }
    .hero-greet { font-size: 2rem; }
    .mod-card-rect { height: 120px; }
    .mod-icon-area { width: 80px; }
    .info-card { min-height: 350px; }
}

@media (max-width: 768px) {
    .topbar { padding: 0 1rem; }
    .hero-wrapper {
        padding: 1.5rem;
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    .hero-greet { font-size: 1.75rem; }
    .hero-text { font-size: 1rem; }
    .hero-icon { font-size: 3rem; }
    .mod-card-rect { height: 110px; }
    .mod-icon-area { width: 70px; font-size: 1.5rem; }
    .mod-title { font-size: 1rem; }
    .mod-desc { font-size: 0.75rem; }
    .res-card { padding: 16px; gap: 12px; }
    .res-icon { width: 40px; height: 40px; font-size: 1.2rem; }
    .info-card { min-height: 380px; padding: 18px; }
}

@media (max-width: 640px) {
    .brand-img-text { display: none; }
    .user-badge { display: none; }
    .mod-card-rect { height: 100px; }
    .mod-icon-area { width: 60px; }
    .mod-content { padding: 0 16px; }
}
</style>
    """,
    unsafe_allow_html=True,
)

# ==============================================================================
# 3. FUNÇÕES AUXILIARES
# ==============================================================================
def get_base64_image(image_path: str) -> str:
    """Carrega imagem e converte para base64"""
    if not os.path.exists(image_path):
        return ""
    try:
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode()
    except Exception:
        return ""


def escola_vinculada() -> str:
    """Retorna nome da escola formatado"""
    workspace_name = st.session_state.get("workspace_name", "")
    workspace_id = st.session_state.get("workspace_id", "")
    
    if workspace_name:
        return workspace_name[:20] + "..." if len(workspace_name) > 20 else workspace_name
    elif workspace_id:
        return f"ID: {workspace_id[:8]}..."
    return "Sem Escola"


def get_user_initials(nome: str) -> str:
    """Retorna iniciais do usuário para avatar"""
    if not nome:
        return "U"
    parts = nome.split()
    if len(parts) >= 2:
        return f"{parts[0][0]}{parts[-1][0]}".upper()
    return nome[:2].upper() if len(nome) >= 2 else nome[0].upper()


# ==============================================================================
# 4. INICIALIZAÇÃO DO ESTADO
# ==============================================================================
def initialize_session_state():
    """Inicializa todas as variáveis de estado necessárias"""
    defaults = {
        "autenticado": False,
        "workspace_id": None,
        "usuario_nome": "Visitante",
        "workspace_name": "Escola Modelo",
        "dados": {"nome": "", "nasc": date(2015, 1, 1), "serie": None}
    }
    
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


# Inicializa estado
initialize_session_state()

# Verificação de autenticação
if not st.session_state.get("autenticado") or not st.session_state.get("workspace_id"):
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown(
            f"""
            <div style='
                text-align: center; 
                padding: 3rem; 
                background: white;
                border-radius: 20px;
                border: 1px solid #E2E8F0;
                box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                margin: 4rem 0;
            '>
                <div style='font-size: 4rem; margin-bottom: 1rem;'>🔐</div>
                <h3 style='color: #1E293B; margin-bottom: 1rem;'>Acesso Restrito</h3>
                <p style='color: #64748B;'>Sessão inválida ou expirada. Por favor, faça login novamente.</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
        
        if st.button("🔓 Ir para Login", use_container_width=True, type="primary"):
            st.session_state.autenticado = False
            st.session_state.workspace_id = None
            st.rerun()
    st.stop()

# ==============================================================================
# 5. FUNÇÕES DE RENDERIZAÇÃO
# ==============================================================================
def render_topbar():
    """Renderiza a barra superior fixa"""
    icone_b64 = get_base64_image("omni_icone.png")
    texto_b64 = get_base64_image("omni_texto.png")
    workspace = escola_vinculada()
    nome_user = st.session_state.get("usuario_nome", "Visitante").split()[0]
    
    # Avatar com iniciais
    user_initials = get_user_initials(nome_user)
    
    img_logo = (
        f'<img src="data:image/png;base64,{icone_b64}" class="brand-logo" alt="Omnisfera Logo">'
        if icone_b64 else "🌐"
    )
    
    img_text = (
        f'<img src="data:image/png;base64,{texto_b64}" class="brand-img-text" alt="Omnisfera">'
        if texto_b64 else "<span style='font-weight:800; font-size:1.2rem; color:#2B3674;'>OMNISFERA</span>"
    )
    
    st.markdown(
        f"""
        <div class="topbar">
            <div class="brand-box">
                {img_logo}
                {img_text}
            </div>
            <div class="brand-box" style="gap: 16px;">
                <div class="user-badge">{workspace}</div>
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 700;
                    color: #334155;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #4F46E5, #7C3AED);
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 800;
                        font-size: 0.9rem;
                    ">{user_initials}</div>
                    <div>{nome_user}</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_module_buttons_row():
    """Renderiza os botões de módulo em uma linha única (estilo recurso compacto)"""
    modules_data = [
        {"title": "Estudantes", "icon": "ri-group-fill", "color_cls": "mod-indigo", "page": "pages/Alunos.py", "key": "m_aluno"},
        {"title": "Estratégias & PEI", "icon": "ri-book-open-fill", "color_cls": "mod-blue", "page": "pages/1_PEI.py", "key": "m_pei"},
        {"title": "Plano de Ação / PAEE", "icon": "ri-settings-5-fill", "color_cls": "mod-purple", "page": "pages/2_PAE.py", "key": "m_pae"},
        {"title": "Hub de Recursos", "icon": "ri-rocket-2-fill", "color_cls": "mod-teal", "page": "pages/3_Hub_Inclusao.py", "key": "m_hub"},
        {"title": "Diário de Bordo", "icon": "ri-file-list-3-fill", "color_cls": "mod-rose", "page": "pages/4_Diario_de_Bordo.py", "key": "m_diario"},
        {"title": "Evolução & Dados", "icon": "ri-bar-chart-box-fill", "color_cls": "mod-sky", "page": "pages/5_Monitoramento_Avaliacao.py", "key": "m_dados"},
    ]

    cols = st.columns(len(modules_data), gap="small")
    
    for i, mod in enumerate(modules_data):
        with cols[i]:
            # Botão invisível do Streamlit cobrindo o card visual
            if st.button(mod["title"], key=mod["key"], use_container_width=True):
                st.switch_page(mod["page"])
            
            # Card visual renderizado via Markdown (hack visual: o botão acima é funcional mas o estilo vem do CSS)
            # O truque aqui é que o st.button padrão não permite HTML interno complexo.
            # Então usamos st.button para a ação e Markdown para o visual? Não, o st.button vai ficar em cima ou embaixo.
            # MELHOR ABORDAGEM: Renderizar o HTML visual e usar um botão invisível ou um botão estilizado.
            # Como queremos que pareça o card de recurso, vamos simplificar:
            # Usar HTML com link direto (se possível) ou st.button estilizado.
            
            # Vou usar a abordagem de renderizar o HTML visualmente ABAIXO de um botão invisível? Não.
            # Vou renderizar o HTML visual e assumir que o usuário clica no botão gerado pelo Streamlit que estilizamos via CSS.
            # O CSS .stButton > button foi ajustado para ter aparência clean, mas para ter o ícone colorido dentro,
            # precisamos injetar o HTML dentro do botão? Streamlit não deixa.
            
            # SOLUÇÃO HÍBRIDA: Renderizar o card como HTML clicável não funciona bem com st.switch_page.
            # VAMOS USAR: Container + Markdown para o visual e um botão "Acessar" discreto abaixo, 
            # OU tentar emular o visual completo com HTML e JavaScript para navegação (mais complexo).
            
            # VOU USAR A ABORDAGEM VISUAL: Renderizar o card bonito e um botão "Abrir" dentro dele?
            # Não, vamos usar a estrutura de colunas e botões do Streamlit, mas com um truque:
            # Renderizamos o ícone e título via Markdown, e um botão "Acessar" logo abaixo.
            
            # EDIT: O usuário pediu "como os botões de neurociência".
            # Aqueles são HTML <a> links. Links externos funcionam bem. Links internos (páginas) recarregam o app.
            # Para manter a SPA (Single Page App) rápida, precisamos usar st.switch_page.
            
            # Vamos fazer assim: Renderizar o visual (ícone + título) e o botão do Streamlit ficará "invisível" sobre ele 
            # ou logo abaixo. Para simplificar e garantir funcionamento, farei o card visual e o botão "Entrar" estilizado.
            
            st.markdown(
                f"""
                <div class="mod-btn-wrapper {mod['color_cls']}">
                    <div class="mod-btn-icon"><i class="{mod['icon']}"></i></div>
                    <div class="mod-btn-title">{mod['title']}</div>
                </div>
                """,
                unsafe_allow_html=True
            )
            # Botão funcional "invisível" ou pequeno para ação
            # Infelizmente não dá para colocar o botão DENTRO da div HTML facilmente.
            # Vou colocar um botão "Acessar" logo abaixo, com estilo minimalista.


def render_info_cards():
    """Renderiza os cards informativos"""
    info_cards_data = [
        {
            "title": "Acolhimento e Cultura Inclusiva",
            "icon": "ri-heart-line",
            "color": "info-card-orange",
            "content": """
                <p><strong>Foco:</strong> O primeiro passo para a inclusão efetiva.</p>
                <p><strong>Conceito:</strong> Receber o aluno com deficiência não garante a inclusão automática; é necessário integrar plenamente por meio de práticas pedagógicas significativas.</p>
                <p><strong>Pilares do Acolhimento:</strong></p>
                <ul>
                    <li><strong>Políticas Claras:</strong> Adoção de um Projeto Político-Pedagógico (PPP) que contemple a diversidade.</li>
                    <li><strong>Acessibilidade:</strong> Adaptação da infraestrutura (rampas, banheiros, tecnologias assistivas).</li>
                    <li><strong>Mediação:</strong> Gestores devem atuar proativamente contra preconceitos e oferecer apoio emocional aos educadores.</li>
                </ul>
                <p><strong>Ação Prática:</strong> Criar um plano de acolhimento personalizado envolvendo a família e realizar atividades de integração.</p>
            """
        },
        {
            "title": "Gestão Estratégica (PGEI)",
            "icon": "ri-strategy-line",
            "color": "info-card-blue",
            "content": """
                <p><strong>Foco:</strong> Organização macro da escola para a inclusão.</p>
                <p><strong>O que é:</strong> O Plano Geral de Educação Inclusiva (PGEI) organiza ações para diferentes perfis (deficiências, transtornos, altas habilidades).</p>
                <p><strong>Dimensionamento:</strong> É crucial analisar o número total de alunos versus profissionais disponíveis para definir a carga horária e a alocação de recursos.</p>
                <p><strong>Check-list do Gestor:</strong></p>
                <ul>
                    <li>Levantar perfis específicos dos alunos.</li>
                    <li>Dimensionar a equipe de inclusão.</li>
                    <li>Planejar ações coletivas e individuais alinhadas ao PPP.</li>
                </ul>
            """
        },
        {
            "title": "Equipe Multidisciplinar",
            "icon": "ri-team-line",
            "color": "info-card-purple",
            "content": """
                <p><strong>Foco:</strong> Papéis e responsabilidades dos profissionais.</p>
                <ul>
                    <li><strong>Orientador Educacional:</strong> Atua na convivência, integração social e pontes entre currículo e desempenho.</li>
                    <li><strong>Psicólogo Escolar:</strong> Acompanha estudos de caso, supervisiona ATs e APs e orienta famílias (não faz terapia clínica na escola).</li>
                    <li><strong>Atendente Terapêutico (AT):</strong> Profissional externo (custeado pela família/Estado) com foco no atendimento individual e exclusivo (ex: autismo).</li>
                    <li><strong>Atendente Pedagógico (AP):</strong> Vínculo com a escola; auxilia na locomoção, higiene, organização de materiais e interação em atividades coletivas.</li>
                </ul>
            """
        },
        {
            "title": "O Plano Individual (PEI/PDI)",
            "icon": "ri-file-list-3-line",
            "color": "info-card-teal",
            "content": """
                <p><strong>Foco:</strong> O roteiro de aprendizagem do aluno.</p>
                <p><strong>Definição:</strong> O Plano Educacional Individualizado (PEI) ou Plano de Desenvolvimento Individual (PDI) é um roteiro flexível e obrigatório para nortear a aprendizagem.</p>
                <p><strong>Elaboração:</strong> Feito pela equipe multidisciplinar em parceria com a família e profissionais externos, devendo ser atualizado sistematicamente.</p>
                <p><strong>Conteúdo Essencial:</strong> Identidade, necessidades específicas, dados de autonomia, desenvolvimento escolar e necessidade de tecnologias assistivas.</p>
                <p><strong>Avaliação:</strong> Baseada no progresso individual em relação ao conhecimento inicial, e não comparativa com a turma.</p>
            """
        },
        {
            "title": "Adaptações e Transtornos",
            "icon": "ri-settings-5-line",
            "color": "info-card-rose",
            "content": """
                <p><strong>Foco:</strong> Estratégias para sala de aula.</p>
                <ul>
                    <li><strong>Flexibilidade:</strong> Ajuste no tempo para execução de tarefas e avaliações.</li>
                    <li><strong>Avaliação:</strong> Diversificar instrumentos (orais, adaptados) e considerar toda produção do aluno como avaliativa.</li>
                    <li><strong>Ambiente:</strong> Organizar a sala para reduzir estímulos ou facilitar o contato com o professor.</li>
                    <li><strong>Materiais:</strong> Uso de recursos visuais, materiais concretos, fontes ampliadas e tecnologia assistiva.</li>
                </ul>
            """
        },
        {
            "title": "Deficiências e Suporte Prático",
            "icon": "ri-wheelchair-line",
            "color": "info-card-indigo",
            "content": """
                <p><strong>Foco:</strong> Resumo técnico das necessidades.</p>
                <ul>
                    <li><strong>Física:</strong> Foco em acessibilidade arquitetônica, mobiliário adaptado e apoio para mobilidade.</li>
                    <li><strong>Auditiva:</strong> Uso de Libras, leitura labial, legendas e aparelhos auditivos. Varia de leve a profunda.</li>
                    <li><strong>Visual:</strong> Desde baixa visão até cegueira. Requer Braille, audiodescrição, pisos táteis e leitores de tela.</li>
                    <li><strong>Intelectual:</strong> Limitações no raciocínio e comportamento adaptativo. Requer linguagem simples, rotina e apoio no desenvolvimento de habilidades de vida.</li>
                </ul>
            """
        }
    ]
    
    # Primeira linha de cards
    cols = st.columns(3, gap="medium")
    for idx, card in enumerate(info_cards_data[:3]):
        with cols[idx]:
            st.markdown(
                f"""
                <div class="info-card {card['color']}">
                    <div class="info-card-header">
                        <div class="info-card-icon">
                            <i class="{card['icon']}"></i>
                        </div>
                        <h3 class="info-card-title">{card['title']}</h3>
                    </div>
                    <div class="info-card-content">
                        {card['content']}
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
    
    st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)
    
    # Segunda linha de cards
    cols = st.columns(3, gap="medium")
    for idx, card in enumerate(info_cards_data[3:]):
        with cols[idx]:
            st.markdown(
                f"""
                <div class="info-card {card['color']}">
                    <div class="info-card-header">
                        <div class="info-card-icon">
                            <i class="{card['icon']}"></i>
                        </div>
                        <h3 class="info-card-title">{card['title']}</h3>
                    </div>
                    <div class="info-card-content">
                        {card['content']}
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )


def render_resources():
    """Renderiza os recursos externos"""
    resources_data = [
        {
            "title": "Lei da Inclusão",
            "desc": "LBI e diretrizes",
            "icon": "ri-government-fill",
            "theme": "rc-sky",
            "link": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm"
        },
        {
            "title": "Base Nacional",
            "desc": "Competências BNCC",
            "icon": "ri-compass-3-fill",
            "theme": "rc-green",
            "link": "http://basenacionalcomum.mec.gov.br/"
        },
        {
            "title": "Neurociência",
            "desc": "Artigos e estudos",
            "icon": "ri-brain-fill",
            "theme": "rc-rose",
            "link": "https://institutoneurosaber.com.br/"
        },
        {
            "title": "Ajuda Omnisfera",
            "desc": "Tutoriais e suporte",
            "icon": "ri-question-fill",
            "theme": "rc-orange",
            "link": "#"
        },
    ]
    
    cols = st.columns(4, gap="medium")
    for idx, resource in enumerate(resources_data):
        with cols[idx]:
            if resource["link"] != "#":
                st.markdown(
                    f"""
                    <a href="{resource['link']}" target="_blank" class="res-card-link">
                        <div class="res-card {resource['theme']}">
                            <div class="res-icon {resource['theme']}"><i class="{resource['icon']}"></i></div>
                            <div class="res-info">
                                <div class="res-name">{resource['title']}</div>
                                <div class="res-meta">{resource['desc']}</div>
                            </div>
                        </div>
                    </a>
                    """,
                    unsafe_allow_html=True,
                )
            else:
                st.markdown(
                    f"""
                    <div class="res-card {resource['theme']}" style="cursor: pointer;">
                        <div class="res-icon {resource['theme']}"><i class="{resource['icon']}"></i></div>
                        <div class="res-info">
                            <div class="res-name">{resource['title']}</div>
                            <div class="res-meta">{resource['desc']}</div>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )


def render_metrics():
    """Renderiza as métricas do dashboard"""
    metrics_data = [
        {"label": "Alunos Ativos", "value": "12", "change": "+2", "trend": "up"},
        {"label": "PEIs Ativos", "value": "8", "change": "+1", "trend": "up"},
        {"label": "Evidências Hoje", "value": "3", "change": "0", "trend": "neutral"},
        {"label": "Meta Mensal", "value": "75%", "change": "+5%", "trend": "up"},
    ]
    
    cols = st.columns(4, gap="medium")
    for idx, metric in enumerate(metrics_data):
        with cols[idx]:
            trend_icon = "↗️" if metric["trend"] == "up" else "↘️" if metric["trend"] == "down" else "➡️"
            trend_class = "metric-up" if metric["trend"] == "up" else "metric-down" if metric["trend"] == "down" else "metric-neutral"
            
            st.markdown(
                f"""
                <div class="metric-card">
                    <span class="metric-label">{metric['label']}</span>
                    <div class="metric-value">{metric['value']}</div>
                    <div class="metric-change {trend_class}">
                        {trend_icon} {metric['change']}
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )


# ==============================================================================
# 6. RENDERIZAÇÃO PRINCIPAL
# ==============================================================================

# Renderiza a topbar fixa (OCULTA SIDEBAR NATIVA)
render_topbar()

# HERO SECTION
hora = datetime.now().hour
saudacao = "Bom dia" if 5 <= hora < 12 else "Boa tarde" if 12 <= hora < 18 else "Boa noite"
nome_user = st.session_state.get("usuario_nome", "Visitante").split()[0]

st.markdown(
    f"""
    <div class="hero-wrapper">
        <div class="hero-content">
            <div class="hero-greet">{saudacao}, {nome_user}!</div>
            <div class="hero-text">"A inclusão acontece quando aprendemos com as diferenças e não com as igualdades."</div>
        </div>
        <div class="hero-icon"><i class="ri-heart-pulse-fill"></i></div>
    </div>
    """,
    unsafe_allow_html=True,
)

# Módulos da Plataforma (AGORA COM BOTÕES COMPACTOS EM LINHA)
st.markdown("### 🚀 Módulos da Plataforma")

# Esta função renderiza os 6 módulos em uma linha, com estilo compacto (tipo recurso)
# OBS: Devido à limitação do Streamlit em aninhar botões funcionais dentro de HTML customizado,
# a abordagem visual pode ter uma leve separação entre o card visual e a área clicável se não usarmos hacks.
# Aqui, usamos uma estrutura de colunas onde cada célula tem o card visual e a ação.
modules_data_compact = [
    {"title": "Estudantes", "icon": "ri-group-fill", "color_cls": "mod-indigo", "page": "pages/Alunos.py", "key": "m_aluno"},
    {"title": "Estratégias & PEI", "icon": "ri-book-open-fill", "color_cls": "mod-blue", "page": "pages/1_PEI.py", "key": "m_pei"},
    {"title": "Plano de Ação / PAEE", "icon": "ri-settings-5-fill", "color_cls": "mod-purple", "page": "pages/2_PAE.py", "key": "m_pae"},
    {"title": "Hub de Recursos", "icon": "ri-rocket-2-fill", "color_cls": "mod-teal", "page": "pages/3_Hub_Inclusao.py", "key": "m_hub"},
    {"title": "Diário de Bordo", "icon": "ri-file-list-3-fill", "color_cls": "mod-rose", "page": "pages/4_Diario_de_Bordo.py", "key": "m_diario"},
    {"title": "Evolução & Dados", "icon": "ri-bar-chart-box-fill", "color_cls": "mod-sky", "page": "pages/5_Monitoramento_Avaliacao.py", "key": "m_dados"},
]

cols_mod = st.columns(6, gap="small")

for i, mod in enumerate(modules_data_compact):
    with cols_mod[i]:
        # Renderiza o visual
        st.markdown(
            f"""
            <div class="mod-btn-wrapper {mod['color_cls']}">
                <div class="mod-btn-icon"><i class="{mod['icon']}"></i></div>
                <div class="mod-btn-title">{mod['title']}</div>
            </div>
            """,
            unsafe_allow_html=True
        )
        # Renderiza o botão funcional (invisível/discreto) para navegação
        # O botão do Streamlit ocupa o espaço abaixo do visual.
        if st.button("Acessar", key=mod["key"], use_container_width=True):
            st.switch_page(mod["page"])

st.markdown("<div style='height:30px'></div>", unsafe_allow_html=True)

# Recursos Externos
st.markdown("### 📚 Recursos Externos & Referências")
render_resources()

# Métricas
st.markdown("<div style='height:40px'></div>", unsafe_allow_html=True)
render_metrics()

# Nova Seção: Guia de Inclusão
st.markdown("---")
st.markdown("## 📘 Guia Prático de Inclusão")
st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)
render_info_cards()

# Rodapé
st.markdown(
    f"""
    <div style='
        text-align: center;
        color: #64748B;
        font-size: 0.75rem;
        padding: 20px;
        border-top: 1px solid #E2E8F0;
        margin-top: 40px;
    '>
        <strong>Omnisfera {APP_VERSION}</strong> • Plataforma de Inclusão Educacional • 
        Desenvolvido por RODRIGO A. QUEIROZ • 
        {datetime.now().strftime("%d/%m/%Y %H:%M")}
    </div>
    """,
    unsafe_allow_html=True,
)
