import streamlit as st
from datetime import date, datetime
import base64
import os

# ==============================================================================
# 1. CONFIGURAÇÃO INICIAL
# ==============================================================================
APP_VERSION = "v2.2 - Layout Ajustado"

try:
    IS_TEST_ENV = st.secrets.get("ENV", "PRODUCAO") == "TESTE"
except Exception:
    IS_TEST_ENV = False

st.set_page_config(
    page_title="Omnisfera - Plataforma de Inclusão Educacional",
    page_icon="🌐" if not os.path.exists("omni_icone.png") else "omni_icone.png",
    layout="wide",
    initial_sidebar_state="collapsed",
    menu_items=None
)

# ==============================================================================
# 2. CSS & DESIGN SYSTEM
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

/* OCULTAR ELEMENTOS NATIVOS */
[data-testid="stSidebarNav"], [data-testid="stHeader"], footer { display: none !important; }

/* AJUSTE DE ESPAÇAMENTO PARA "GRUDAR" NO TOPO */
.block-container {
    padding-top: 90px !important; /* Reduzi para subir o conteúdo */
    padding-bottom: 4rem !important;
    max-width: 95% !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

/* HEADER FIXO */
.topbar {
    position: fixed; top: 0; left: 0; right: 0; height: 80px;
    background: rgba(255, 255, 255, 0.98) !important;
    border-bottom: 1px solid #E2E8F0;
    z-index: 9999;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.brand-box { display: flex; align-items: center; gap: 12px; }
.brand-logo { height: 50px !important; width: auto !important; animation: spin 45s linear infinite; }
.brand-img-text { height: 32px !important; width: auto; margin-left: 10px; }
.user-badge { background: #F1F5F9; border: 1px solid #E2E8F0; padding: 6px 14px; border-radius: 99px; font-size: 0.8rem; font-weight: 700; color: #64748B; }

/* HERO SECTION */
.hero-wrapper {
    background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
    border-radius: 20px; padding: 2.5rem; color: white;
    margin-bottom: 40px; position: relative; overflow: hidden;
    box-shadow: 0 20px 40px -10px rgba(30, 58, 138, 0.3);
    display: flex; align-items: center; justify-content: space-between;
    min-height: 200px;
    margin-top: 10px; /* Pequeno espaço entre botões e banner */
}
.hero-wrapper::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.3;
}
.hero-content { z-index: 2; position: relative; }
.hero-greet { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; line-height: 1.2; }
.hero-text { font-size: 1.1rem; opacity: 0.95; max-width: 800px; line-height: 1.6; font-weight: 500; }
.hero-icon { opacity: 0.8; font-size: 3.5rem; z-index: 1; position: relative; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1)); }

/* MODULE CARDS (HTML) */
.mod-card-wrapper { display: flex; flex-direction: column; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02); height: 100%; }
.mod-card-rect {
    background: white; border-radius: 16px 16px 0 0; padding: 0;
    border: 1px solid #E2E8F0; display: flex; flex-direction: row; align-items: center;
    height: 120px; width: 100%; position: relative; overflow: hidden;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.mod-card-rect:hover { transform: translateY(-2px); border-color: #CBD5E1; }
.mod-bar { width: 6px; height: 100%; flex-shrink: 0; }
.mod-icon-area { width: 80px; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0; background: #FAFAFA; border-right: 1px solid #F1F5F9; }
.mod-content { flex-grow: 1; padding: 0 20px; display: flex; flex-direction: column; justify-content: center; }
.mod-title { font-weight: 800; font-size: 1rem; color: #1E293B; margin-bottom: 4px; }
.mod-desc { font-size: 0.75rem; color: #64748B; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* CORES */
.c-indigo { background: #4F46E5 !important; }
.bg-indigo-soft { background: #EEF2FF !important; color: #4F46E5 !important; }
.c-blue { background: #3B82F6 !important; }
.bg-blue-soft { background: #EFF6FF !important; color: #2563EB !important; }
.c-purple { background: #8B5CF6 !important; }
.bg-purple-soft { background: #F5F3FF !important; color: #7C3AED !important; }
.c-teal { background: #14B8A6 !important; }
.bg-teal-soft { background: #F0FDFA !important; color: #0D9488 !important; }
.c-rose { background: #E11D48 !important; }
.bg-rose-soft { background: #FFF1F2 !important; color: #BE123C !important; }
.c-sky { background: #0284C7 !important; }
.bg-sky-soft { background: #F0F9FF !important; color: #0369A1 !important; }

/* --- BOTOES EMBAIXO DO CARD (ESTILO RESTAURADO) --- */
/* Força o botão a ter bordas arredondadas apenas embaixo e parecer conectado */
div[data-testid="column"] .stButton button {
    border-radius: 0 0 16px 16px !important;
    border: 1px solid #E2E8F0 !important;
    border-top: none !important;
    background: #F8FAFC !important;
    color: #475569 !important;
    font-weight: 700 !important;
    font-size: 0.75rem !important;
    padding: 10px !important;
    text-transform: uppercase !important;
    margin-top: -5px !important; /* Puxa pra cima pra grudar no HTML */
    box-shadow: 0 4px 6px rgba(0,0,0,0.02) !important;
}
div[data-testid="column"] .stButton button:hover {
    background: #F1F5F9 !important;
    color: #1E293B !important;
    border-color: #CBD5E1 !important;
}

/* --- RECURSOS E INFO CARDS --- */
.res-card { background: white; border-radius: 14px; padding: 16px; border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 12px; transition: all 0.25s; min-height: 80px; text-decoration: none !important; }
.res-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
.res-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.res-name { font-weight: 700; color: #1E293B; font-size: 0.9rem; margin:0; }
.res-meta { font-size: 0.7rem; color: #64748B; margin:0; }
.res-card-link { text-decoration: none !important; }

.info-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #E2E8F0; min-height: 300px; display:flex; flex-direction:column; }
.info-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #F1F5F9; }
.info-card-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
.info-card-title { font-size: 1rem; font-weight: 800; color: #1E293B; margin: 0; }
.info-card-content p { font-size: 0.8rem; color: #475569; line-height: 1.5; margin-bottom: 8px; }
.info-card-content ul { font-size: 0.8rem; color: #475569; margin-left: 14px; }

/* CORES INFO CARDS */
.info-card-orange { border-left: 4px solid #EA580C; } .info-card-orange .info-card-icon { background: #FFF7ED; color: #EA580C; }
.info-card-blue { border-left: 4px solid #3B82F6; } .info-card-blue .info-card-icon { background: #EFF6FF; color: #3B82F6; }
.info-card-purple { border-left: 4px solid #8B5CF6; } .info-card-purple .info-card-icon { background: #F5F3FF; color: #8B5CF6; }

/* CORES RECURSOS */
.rc-sky { background: #F0F9FF; color: #0284C7; border-color: #BAE6FD; }
.rc-sky .res-icon { background: #E0F2FE; color: #0284C7; }
.rc-green { background: #F0FDF4; color: #16A34A; border-color: #BBF7D0; }
.rc-green .res-icon { background: #DCFCE7; color: #16A34A; }
.rc-rose { background: #FFF1F2; color: #E11D48; border-color: #FECDD3; }
.rc-rose .res-icon { background: #FFE4E6; color: #E11D48; }
.rc-orange { background: #FFF7ED; color: #EA580C; border-color: #FDBA74; }
.rc-orange .res-icon { background: #FFEDD5; color: #EA580C; }

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@media (max-width: 768px) { .topbar { padding: 0 1rem; } .mod-card-rect { height: auto; flex-direction: column; padding: 15px; } .mod-icon-area { width: 100%; height: 50px; border-right: none; border-bottom: 1px solid #F1F5F9; margin-bottom: 10px; } }
</style>
""",
    unsafe_allow_html=True,
)

# ==============================================================================
# 3. FUNÇÕES AUXILIARES
# ==============================================================================
def get_base64_image(image_path: str) -> str:
    if not os.path.exists(image_path): return ""
    try:
        with open(image_path, "rb") as f: return base64.b64encode(f.read()).decode()
    except: return ""

def escola_vinculada() -> str:
    ws_name = st.session_state.get("workspace_name", "")
    return (ws_name[:20] + "...") if len(ws_name) > 20 else ws_name

def get_user_initials(nome: str) -> str:
    if not nome: return "U"
    parts = nome.split()
    return (f"{parts[0][0]}{parts[-1][0]}".upper() if len(parts) >= 2 else nome[:2].upper())

# ==============================================================================
# 4. INICIALIZAÇÃO
# ==============================================================================
def initialize_session_state():
    defaults = {"autenticado": False, "workspace_id": None, "usuario_nome": "Visitante", "workspace_name": "Escola Modelo", "dados": {"nome": "", "nasc": date(2015, 1, 1), "serie": None}}
    for k, v in defaults.items():
        if k not in st.session_state: st.session_state[k] = v

initialize_session_state()

if not st.session_state.get("autenticado") or not st.session_state.get("workspace_id"):
    c1, c2, c3 = st.columns([1, 2, 1])
    with c2:
        st.markdown("<div style='text-align:center; padding:3rem; background:white; border-radius:20px; border:1px solid #E2E8F0;'><h3>🔐 Acesso Restrito</h3></div>", unsafe_allow_html=True)
        if st.button("🔓 Ir para Login", use_container_width=True, type="primary"):
            st.session_state.autenticado = False
            st.session_state.workspace_id = None
            st.rerun()
    st.stop()

# ==============================================================================
# 5. RENDERIZAÇÃO
# ==============================================================================
def render_topbar():
    icone = get_base64_image("omni_icone.png")
    texto = get_base64_image("omni_texto.png")
    img_logo = f'<img src="data:image/png;base64,{icone}" class="brand-logo">' if icone else "🌐"
    img_text = f'<img src="data:image/png;base64,{texto}" class="brand-img-text">' if texto else "<span style='font-weight:800;color:#2B3674;'>OMNISFERA</span>"
    
    st.markdown(f"""
        <div class="topbar">
            <div class="brand-box">{img_logo}{img_text}</div>
            <div class="brand-box">
                <div class="user-badge">{escola_vinculada()}</div>
                <div style="display:flex;align-items:center;gap:12px;font-weight:700;color:#334155;">
                    <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;display:flex;align-items:center;justify-content:center;">{get_user_initials(st.session_state.get("usuario_nome"))}</div>
                    <div>{st.session_state.get("usuario_nome").split()[0]}</div>
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)

def render_quick_access_bar():
    """Barra de botões coloridos logo abaixo da Topbar"""
    
    # CSS para colorir os botões (Fundo Branco + Borda Colorida + Hover Cheio)
    st.markdown("""
    <style>
        /* Home (Cinza) */
        div[data-testid="column"]:nth-of-type(1) .stButton button { background: white !important; border: 2px solid #64748B !important; color: #64748B !important; }
        div[data-testid="column"]:nth-of-type(1) .stButton button:hover { background: #64748B !important; color: white !important; }

        /* Alunos (Indigo) */
        div[data-testid="column"]:nth-of-type(2) .stButton button { background: white !important; border: 2px solid #4F46E5 !important; color: #4F46E5 !important; }
        div[data-testid="column"]:nth-of-type(2) .stButton button:hover { background: #4F46E5 !important; color: white !important; }
        
        /* PEI (Blue) */
        div[data-testid="column"]:nth-of-type(3) .stButton button { background: white !important; border: 2px solid #2563EB !important; color: #2563EB !important; }
        div[data-testid="column"]:nth-of-type(3) .stButton button:hover { background: #2563EB !important; color: white !important; }

        /* PAEE (Purple) */
        div[data-testid="column"]:nth-of-type(4) .stButton button { background: white !important; border: 2px solid #7C3AED !important; color: #7C3AED !important; }
        div[data-testid="column"]:nth-of-type(4) .stButton button:hover { background: #7C3AED !important; color: white !important; }

        /* Hub (Teal) */
        div[data-testid="column"]:nth-of-type(5) .stButton button { background: white !important; border: 2px solid #0D9488 !important; color: #0D9488 !important; }
        div[data-testid="column"]:nth-of-type(5) .stButton button:hover { background: #0D9488 !important; color: white !important; }

        /* Diário (Rose) */
        div[data-testid="column"]:nth-of-type(6) .stButton button { background: white !important; border: 2px solid #E11D48 !important; color: #E11D48 !important; }
        div[data-testid="column"]:nth-of-type(6) .stButton button:hover { background: #E11D48 !important; color: white !important; }

        /* Dados (Sky) */
        div[data-testid="column"]:nth-of-type(7) .stButton button { background: white !important; border: 2px solid #0284C7 !important; color: #0284C7 !important; }
        div[data-testid="column"]:nth-of-type(7) .stButton button:hover { background: #0284C7 !important; color: white !important; }
        
        /* Estilo base para todos os botões dessa barra */
        .stButton button {
            font-weight: 800 !important;
            border-radius: 8px !important;
            padding: 8px 0 !important;
            font-size: 0.75rem !important;
            text-transform: uppercase !important;
            box-shadow: none !important;
        }
    </style>
    """, unsafe_allow_html=True)

    # 7 Colunas para os botões
    c1, c2, c3, c4, c5, c6, c7 = st.columns(7, gap="small")
    
    with c1:
        if st.button("🏠 HOME", use_container_width=True): st.rerun()
    with c2:
        if st.button("👥 ALUNOS", use_container_width=True): st.switch_page("pages/Alunos.py")
    with c3:
        if st.button("📘 PEI", use_container_width=True): st.switch_page("pages/1_PEI.py")
    with c4:
        if st.button("🧩 AEE", use_container_width=True): st.switch_page("pages/2_PAE.py")
    with c5:
        if st.button("🚀 HUB", use_container_width=True): st.switch_page("pages/3_Hub_Inclusao.py")
    with c6:
        if st.button("📓 DIÁRIO", use_container_width=True): st.switch_page("pages/4_Diario_de_Bordo.py")
    with c7:
        if st.button("📊 DADOS", use_container_width=True): st.switch_page("pages/5_Monitoramento_Avaliacao.py")

def create_module_card_with_button(title, desc, icon, color_cls, bg_cls, page, key):
    """Cria card de módulo com o botão EMBAIXO (restaurado)"""
    # 1. HTML do Card (Topo)
    st.markdown(
        f"""
        <div class="mod-card-wrapper">
            <div class="mod-card-rect">
                <div class="mod-bar {color_cls}"></div>
                <div class="mod-icon-area {bg_cls}">
                    <i class="{icon}"></i>
                </div>
                <div class="mod-content">
                    <div class="mod-title">{title}</div>
                    <div class="mod-desc">{desc}</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    
    # 2. Botão nativo do Streamlit (Embaixo)
    # O CSS injetado lá em cima ajusta ele para parecer colado
    if st.button(f"ACESSAR {title.split()[0].upper()}", key=key, use_container_width=True):
        st.switch_page(page)

def render_resources():
    res_data = [
        {"t":"Lei da Inclusão", "d":"LBI e diretrizes", "i":"ri-government-fill", "c":"rc-sky", "l":"https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm"},
        {"t":"Base Nacional", "d":"Competências BNCC", "i":"ri-compass-3-fill", "c":"rc-green", "l":"http://basenacionalcomum.mec.gov.br/"},
        {"t":"Neurociência", "d":"Artigos e estudos", "i":"ri-brain-fill", "c":"rc-rose", "l":"https://institutoneurosaber.com.br/"},
        {"t":"Ajuda Omnisfera", "d":"Tutoriais e suporte", "i":"ri-question-fill", "c":"rc-orange", "l":"#"}
    ]
    cols = st.columns(4, gap="medium")
    for idx, r in enumerate(res_data):
        with cols[idx]:
            st.markdown(f"""
                <a href="{r['l']}" target="_blank" class="res-card-link">
                    <div class="res-card {r['c']}">
                        <div class="res-icon {r['c']}"><i class="{r['i']}"></i></div>
                        <div class="res-info"><div class="res-name">{r['t']}</div><div class="res-meta">{r['d']}</div></div>
                    </div>
                </a>""", unsafe_allow_html=True)

def render_info_cards():
    cards = [
        {"t": "Acolhimento", "i": "ri-heart-line", "c": "info-card-orange", "txt": "O primeiro passo para a inclusão efetiva."},
        {"t": "Gestão (PGEI)", "i": "ri-strategy-line", "c": "info-card-blue", "txt": "Organização macro da escola."},
        {"t": "Equipe Multi", "i": "ri-team-line", "c": "info-card-purple", "txt": "Papéis e responsabilidades."},
    ]
    cols = st.columns(3, gap="medium")
    for idx, c in enumerate(cards):
        with cols[idx]:
            st.markdown(f"""<div class="info-card {c['c']}"><div class="info-card-header"><div class="info-card-icon"><i class="{c['i']}"></i></div><h3 class="info-card-title">{c['t']}</h3></div><div class="info-card-content"><p>{c['txt']}</p></div></div>""", unsafe_allow_html=True)

# ==============================================================================
# 6. EXECUÇÃO DO APP
# ==============================================================================
render_topbar()

# 1. BARRA DE ACESSO RÁPIDO (7 Botões, Coloridos, Sem Título)
render_quick_access_bar()

# 2. HERO (Logado)
nome_user = st.session_state.get("usuario_nome", "Visitante").split()[0]
saudacao = "Bom dia" if 5 <= datetime.now().hour < 12 else "Boa tarde" if 12 <= datetime.now().hour < 18 else "Boa noite"
st.markdown(f"""
    <div class="hero-wrapper">
        <div class="hero-content">
            <div class="hero-greet">{saudacao}, {nome_user}!</div>
            <div class="hero-text">"A inclusão acontece quando aprendemos com as diferenças e não com as igualdades."</div>
        </div>
        <div class="hero-icon"><i class="ri-heart-pulse-fill"></i></div>
    </div>
""", unsafe_allow_html=True)

# 3. MÓDULOS (Grid com Botões Restaurados Embaixo)
st.markdown("### 🧩 Módulos do Sistema")
modules = [
    {"t": "Estudantes", "d": "Gestão completa de alunos.", "i": "ri-group-fill", "c": "c-indigo", "b": "bg-indigo-soft", "p": "pages/Alunos.py", "k": "btn_mod_1"},
    {"t": "Estratégias & PEI", "d": "Plano Educacional Individual.", "i": "ri-book-open-fill", "c": "c-blue", "b": "bg-blue-soft", "p": "pages/1_PEI.py", "k": "btn_mod_2"},
    {"t": "Plano de Ação", "d": "Atendimento Especializado.", "i": "ri-settings-5-fill", "c": "c-purple", "b": "bg-purple-soft", "p": "pages/2_PAE.py", "k": "btn_mod_3"},
    {"t": "Hub de Recursos", "d": "Biblioteca e IA.", "i": "ri-rocket-2-fill", "c": "c-teal", "b": "bg-teal-soft", "p": "pages/3_Hub_Inclusao.py", "k": "btn_mod_4"},
    {"t": "Diário de Bordo", "d": "Registro de evidências.", "i": "ri-file-list-3-fill", "c": "c-rose", "b": "bg-rose-soft", "p": "pages/4_Diario_de_Bordo.py", "k": "btn_mod_5"},
    {"t": "Evolução & Dados", "d": "Indicadores de progresso.", "i": "ri-bar-chart-box-fill", "c": "c-sky", "b": "bg-sky-soft", "p": "pages/5_Monitoramento_Avaliacao.py", "k": "btn_mod_6"},
]
cols = st.columns(3, gap="medium")
for i, m in enumerate(modules):
    with cols[i % 3]:
        create_module_card_with_button(m["t"], m["d"], m["i"], m["c"], m["b"], m["p"], m["k"])

st.markdown("<div style='height:30px'></div>", unsafe_allow_html=True)

# 4. EXTRAS
st.markdown("### 📚 Recursos Externos")
render_resources()

st.markdown("---")
st.markdown("## 📘 Guia Prático")
st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)
render_info_cards()

st.markdown(f"""<div style='text-align:center;color:#64748B;font-size:0.75rem;padding:20px;border-top:1px solid #E2E8F0;margin-top:40px;'><strong>Omnisfera {APP_VERSION}</strong> • Desenvolvido por RODRIGO A. QUEIROZ</div>""", unsafe_allow_html=True)
