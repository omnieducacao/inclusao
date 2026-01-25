import streamlit as st
from datetime import date, datetime
import base64
import os

# ==============================================================================
# 1. CONFIGURAÇÃO INICIAL
# ==============================================================================
APP_VERSION = "v2.1 - Navegação Superior"

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

/* OCULTAR SIDEBAR E HEADER NATIVOS */
[data-testid="stSidebarNav"],
[data-testid="stHeader"],
[data-testid="stToolbar"],
[data-testid="collapsedControl"],
footer {
    display: none !important;
}

.block-container {
    padding-top: 100px !important;
    padding-bottom: 4rem !important;
    max-width: 95% !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

/* HEADER FIXO */
.topbar {
    position: fixed; top: 0; left: 0; right: 0; height: 80px;
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(12px) !important;
    border-bottom: 1px solid #E2E8F0;
    z-index: 9999;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.brand-box { display: flex; align-items: center; gap: 12px; }
.brand-logo { height: 55px !important; width: auto !important; animation: spin 45s linear infinite; }
.brand-img-text { height: 35px !important; width: auto; margin-left: 10px; }
.user-badge { background: #F1F5F9; border: 1px solid #E2E8F0; padding: 6px 14px; border-radius: 99px; font-size: 0.8rem; font-weight: 700; color: #64748B; }

/* HERO SECTION */
.hero-wrapper {
    background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
    border-radius: 20px; padding: 3rem; color: white;
    margin-bottom: 40px; position: relative; overflow: hidden;
    box-shadow: 0 20px 40px -10px rgba(30, 58, 138, 0.3);
    display: flex; align-items: center; justify-content: space-between;
    min-height: 220px;
}
.hero-wrapper::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.3;
}
.hero-content { z-index: 2; position: relative; }
.hero-greet { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; line-height: 1.2; }
.hero-text { font-size: 1.1rem; opacity: 0.95; max-width: 800px; line-height: 1.6; font-weight: 500; }
.hero-icon { opacity: 0.8; font-size: 4rem; z-index: 1; position: relative; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1)); }

/* MODULE CARDS */
.mod-card-wrapper { display: flex; flex-direction: column; margin-bottom: 20px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02); }
.mod-card-rect {
    background: white; border-radius: 16px; padding: 0;
    border: 1px solid #E2E8F0; display: flex; flex-direction: row; align-items: center;
    height: 120px; width: 100%; position: relative; overflow: hidden;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.mod-card-rect:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08); border-color: #CBD5E1; }
.mod-bar { width: 6px; height: 100%; flex-shrink: 0; }
.mod-icon-area { width: 90px; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0; background: #FAFAFA; border-right: 1px solid #F1F5F9; }
.mod-content { flex-grow: 1; padding: 0 24px; display: flex; flex-direction: column; justify-content: center; }
.mod-title { font-weight: 800; font-size: 1.1rem; color: #1E293B; margin-bottom: 6px; }
.mod-desc { font-size: 0.8rem; color: #64748B; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

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

/* RECURSOS E INFO CARDS (Mantidos do original para compactar CSS visualmente aqui) */
.res-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 16px; transition: all 0.25s; min-height: 96px; }
.res-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
.res-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.res-name { font-weight: 700; color: #1E293B; }
.res-meta { font-size: 0.75rem; color: #64748B; }
.info-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #E2E8F0; min-height: 320px; }
.metric-card { background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid #E2E8F0; text-align: center; }
.metric-value { font-size: 2rem; font-weight: 800; color: #1E293B; }

/* --- CORES RECURSOS --- */
.rc-sky { background: #F0F9FF !important; color: #0284C7 !important; border-color: #BAE6FD !important; }
.rc-sky .res-icon { background: #F0F9FF !important; border: 1px solid #BAE6FD !important; }
.rc-green { background: #F0FDF4 !important; color: #16A34A !important; border-color: #BBF7D0 !important; }
.rc-green .res-icon { background: #F0FDF4 !important; border: 1px solid #BBF7D0 !important; }
.rc-rose { background: #FFF1F2 !important; color: #E11D48 !important; border-color: #FECDD3 !important; }
.rc-rose .res-icon { background: #FFF1F2 !important; border: 1px solid #FECDD3 !important; }
.rc-orange { background: #FFF7ED !important; color: #EA580C !important; border-color: #FDBA74 !important; }
.rc-orange .res-icon { background: #FFF7ED !important; border: 1px solid #FDBA74 !important; }

/* ANIMAÇÃO */
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* RESPONSIVIDADE */
@media (max-width: 768px) { .topbar { padding: 0 1rem; } .mod-card-rect { height: 110px; } }
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
# 4. INICIALIZAÇÃO E AUTH
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

def render_quick_access():
    """Renderiza a barra de botões coloridos acima do banner"""
    st.markdown("### ⚡ Acesso Rápido")
    
    # CSS Específico para colorir os botões desta seção
    # 1:Indigo, 2:Blue, 3:Purple, 4:Teal, 5:Rose, 6:Sky
    st.markdown("""
    <style>
        /* Botão 1 - Estudantes */
        div[data-testid="column"]:nth-of-type(1) .stButton button { border: 2px solid #4F46E5 !important; color: #4F46E5 !important; background: white !important; font-weight: 800 !important; }
        div[data-testid="column"]:nth-of-type(1) .stButton button:hover { background: #4F46E5 !important; color: white !important; }
        
        /* Botão 2 - PEI */
        div[data-testid="column"]:nth-of-type(2) .stButton button { border: 2px solid #2563EB !important; color: #2563EB !important; background: white !important; font-weight: 800 !important; }
        div[data-testid="column"]:nth-of-type(2) .stButton button:hover { background: #2563EB !important; color: white !important; }

        /* Botão 3 - PAEE */
        div[data-testid="column"]:nth-of-type(3) .stButton button { border: 2px solid #7C3AED !important; color: #7C3AED !important; background: white !important; font-weight: 800 !important; }
        div[data-testid="column"]:nth-of-type(3) .stButton button:hover { background: #7C3AED !important; color: white !important; }

        /* Botão 4 - Hub */
        div[data-testid="column"]:nth-of-type(4) .stButton button { border: 2px solid #0D9488 !important; color: #0D9488 !important; background: white !important; font-weight: 800 !important; }
        div[data-testid="column"]:nth-of-type(4) .stButton button:hover { background: #0D9488 !important; color: white !important; }

        /* Botão 5 - Diário */
        div[data-testid="column"]:nth-of-type(5) .stButton button { border: 2px solid #E11D48 !important; color: #E11D48 !important; background: white !important; font-weight: 800 !important; }
        div[data-testid="column"]:nth-of-type(5) .stButton button:hover { background: #E11D48 !important; color: white !important; }

        /* Botão 6 - Dados */
        div[data-testid="column"]:nth-of-type(6) .stButton button { border: 2px solid #0284C7 !important; color: #0284C7 !important; background: white !important; font-weight: 800 !important; }
        div[data-testid="column"]:nth-of-type(6) .stButton button:hover { background: #0284C7 !important; color: white !important; }
    </style>
    """, unsafe_allow_html=True)

    c1, c2, c3, c4, c5, c6 = st.columns(6, gap="small")
    
    with c1:
        if st.button("👥 ALUNOS", use_container_width=True): st.switch_page("pages/Alunos.py")
    with c2:
        if st.button("📘 PEI", use_container_width=True): st.switch_page("pages/1_PEI.py")
    with c3:
        if st.button("🧩 PAEE", use_container_width=True): st.switch_page("pages/2_PAE.py")
    with c4:
        if st.button("🚀 HUB", use_container_width=True): st.switch_page("pages/3_Hub_Inclusao.py")
    with c5:
        if st.button("📓 DIÁRIO", use_container_width=True): st.switch_page("pages/4_Diario_de_Bordo.py")
    with c6:
        if st.button("📊 DADOS", use_container_width=True): st.switch_page("pages/5_Monitoramento_Avaliacao.py")
    
    st.markdown("<div style='margin-bottom: 30px;'></div>", unsafe_allow_html=True)

def create_module_card_simple(title, desc, icon, color_cls, bg_cls):
    """Cria apenas o visual do card, sem botão (já que o botão subiu)"""
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

def render_metrics():
    m_data = [
        {"l":"Alunos Ativos", "v":"12", "c":"+2", "t":"up"},
        {"l":"PEIs Ativos", "v":"8", "c":"+1", "t":"up"},
        {"l":"Evidências Hoje", "v":"3", "c":"0", "t":"neu"},
        {"l":"Meta Mensal", "v":"75%", "c":"+5%", "t":"up"}
    ]
    cols = st.columns(4, gap="medium")
    for idx, m in enumerate(m_data):
        color = "metric-up" if m['t'] == "up" else "metric-neutral"
        icon = "↗️" if m['t'] == "up" else "➡️"
        with cols[idx]:
            st.markdown(f"""<div class="metric-card"><span class="metric-label">{m['l']}</span><div class="metric-value">{m['v']}</div><div class="metric-change {color}">{icon} {m['c']}</div></div>""", unsafe_allow_html=True)

def render_info_cards():
    # Simplificado para brevidade, mantendo estrutura visual
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
# 6. APP EXECUTION
# ==============================================================================
render_topbar()

# 1. BARRA DE ACESSO RÁPIDO (NOVA)
render_quick_access()

# 2. HERO
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

# 3. MÓDULOS (Visual apenas, botões subiram)
st.markdown("### 🧩 Detalhes dos Módulos")
modules = [
    {"t": "Estudantes", "d": "Gestão completa de alunos.", "i": "ri-group-fill", "c": "c-indigo", "b": "bg-indigo-soft"},
    {"t": "Estratégias & PEI", "d": "Plano Educacional Individual.", "i": "ri-book-open-fill", "c": "c-blue", "b": "bg-blue-soft"},
    {"t": "Plano de Ação", "d": "Atendimento Especializado.", "i": "ri-settings-5-fill", "c": "c-purple", "b": "bg-purple-soft"},
    {"t": "Hub de Recursos", "d": "Biblioteca e IA.", "i": "ri-rocket-2-fill", "c": "c-teal", "b": "bg-teal-soft"},
    {"t": "Diário de Bordo", "d": "Registro de evidências.", "i": "ri-file-list-3-fill", "c": "c-rose", "b": "bg-rose-soft"},
    {"t": "Evolução & Dados", "d": "Indicadores de progresso.", "i": "ri-bar-chart-box-fill", "c": "c-sky", "b": "bg-sky-soft"},
]
cols = st.columns(3, gap="medium")
for i, m in enumerate(modules):
    with cols[i % 3]:
        create_module_card_simple(m["t"], m["d"], m["i"], m["c"], m["b"])

st.markdown("<div style='height:30px'></div>", unsafe_allow_html=True)

# 4. EXTRAS
st.markdown("### 📚 Recursos Externos")
render_resources()

st.markdown("<div style='height:40px'></div>", unsafe_allow_html=True)
render_metrics()

st.markdown("---")
st.markdown("## 📘 Guia Prático")
st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)
render_info_cards()

st.markdown(f"""<div style='text-align:center;color:#64748B;font-size:0.75rem;padding:20px;border-top:1px solid #E2E8F0;margin-top:40px;'><strong>Omnisfera {APP_VERSION}</strong> • Desenvolvido por RODRIGO A. QUEIROZ</div>""", unsafe_allow_html=True)
