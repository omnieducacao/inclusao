import streamlit as st
from datetime import date, datetime
import base64
import os

# ==============================================================================
# 1. CONFIGURAÇÃO INICIAL
# ==============================================================================
APP_VERSION = "v2.5 - Header Integrado & Delicado"

try:
    IS_TEST_ENV = st.secrets.get("ENV", "PRODUCAO") == "TESTE"
except Exception:
    IS_TEST_ENV = False

st.set_page_config(
    page_title="Omnisfera",
    page_icon="🌐" if not os.path.exists("omni_icone.png") else "omni_icone.png",
    layout="wide",
    initial_sidebar_state="collapsed",
    menu_items=None
)

# ==============================================================================
# 2. CSS & DESIGN SYSTEM (AJUSTE FINO)
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
[data-testid="stSidebarNav"], [data-testid="stHeader"], footer { display: none !important; }

/* AJUSTE DE ESPAÇAMENTO GERAL - IMPORTANTE PARA O HEADER FIXO */
.block-container {
    padding-top: 80px !important; /* Espaço para o header de 60px + respiro */
    padding-bottom: 4rem !important;
    max-width: 98% !important; /* Aproveitar bem a largura */
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

/* --- CONTAINER DO HEADER FIXO --- */
/* Cria um fundo branco fixo no topo */
.fixed-header-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px; /* Mais fino e delicado */
    background: rgba(255, 255, 255, 0.98);
    border-bottom: 1px solid #E2E8F0;
    z-index: 9990;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

/* Força os elementos do Streamlit (botões) a ficarem 'presos' no topo */
div[data-testid="stVerticalBlock"] > div:nth-child(1) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 9999;
    padding: 0 1.5rem;
    height: 64px;
    display: flex;
    align-items: center;
}

/* --- ESTILOS DOS BOTÕES DE NAVEGAÇÃO (MINIMALISTAS) --- */
.nav-btn button {
    font-weight: 700 !important;
    border-radius: 6px !important;
    padding: 0px 8px !important; /* Compacto */
    font-size: 0.65rem !important; /* Texto menor e delicado */
    text-transform: uppercase !important;
    box-shadow: none !important;
    min-height: 28px !important; /* Altura reduzida */
    height: 28px !important;
    border-width: 1px !important;
    white-space: nowrap !important;
    letter-spacing: 0.5px !important;
    margin-top: 0 !important; /* Alinhamento vertical */
    line-height: 1 !important;
}

/* Cores dos Botões (Borda Fina + Hover Suave) */
/* 1. Início */
div[data-testid="column"]:nth-of-type(2) .nav-btn button { border-color: #94A3B8 !important; color: #64748B !important; background: transparent !important; }
div[data-testid="column"]:nth-of-type(2) .nav-btn button:hover { background-color: #F1F5F9 !important; color: #1E293B !important; }

/* 2. Estudantes (Indigo) */
div[data-testid="column"]:nth-of-type(3) .nav-btn button { border-color: #6366F1 !important; color: #6366F1 !important; background: transparent !important; }
div[data-testid="column"]:nth-of-type(3) .nav-btn button:hover { background-color: #EEF2FF !important; }

/* 3. PEI (Blue) */
div[data-testid="column"]:nth-of-type(4) .nav-btn button { border-color: #3B82F6 !important; color: #3B82F6 !important; background: transparent !important; }
div[data-testid="column"]:nth-of-type(4) .nav-btn button:hover { background-color: #EFF6FF !important; }

/* 4. AEE (Purple) */
div[data-testid="column"]:nth-of-type(5) .nav-btn button { border-color: #8B5CF6 !important; color: #8B5CF6 !important; background: transparent !important; }
div[data-testid="column"]:nth-of-type(5) .nav-btn button:hover { background-color: #F5F3FF !important; }

/* 5. Recursos (Teal) */
div[data-testid="column"]:nth-of-type(6) .nav-btn button { border-color: #14B8A6 !important; color: #14B8A6 !important; background: transparent !important; }
div[data-testid="column"]:nth-of-type(6) .nav-btn button:hover { background-color: #F0FDFA !important; }

/* 6. Diário (Rose) */
div[data-testid="column"]:nth-of-type(7) .nav-btn button { border-color: #F43F5E !important; color: #F43F5E !important; background: transparent !important; }
div[data-testid="column"]:nth-of-type(7) .nav-btn button:hover { background-color: #FFF1F2 !important; }

/* 7. Dados (Sky) */
div[data-testid="column"]:nth-of-type(8) .nav-btn button { border-color: #0EA5E9 !important; color: #0EA5E9 !important; background: transparent !important; }
div[data-testid="column"]:nth-of-type(8) .nav-btn button:hover { background-color: #F0F9FF !important; }

/* --- LOGO & USER --- */
.logo-container { display: flex; align-items: center; gap: 8px; height: 100%; }
.logo-img { height: 32px !important; width: auto; animation: spin 60s linear infinite; } /* Logo menor */
.logo-text { height: 20px !important; width: auto; margin-top: 2px; } /* Texto proporcional */

.user-container { display: flex; align-items: center; justify-content: flex-end; gap: 10px; height: 100%; }
.user-avatar { 
    width: 32px; height: 32px; 
    border-radius: 50%; 
    background: linear-gradient(135deg, #4F46E5, #7C3AED); 
    color: white; 
    display: flex; align-items: center; justify-content: center; 
    font-weight: 700; font-size: 0.75rem; 
}
.user-name { font-size: 0.8rem; font-weight: 600; color: #334155; }

/* HERO SECTION (Ajustado top margin) */
.hero-wrapper {
    background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
    border-radius: 16px; padding: 2.5rem; color: white;
    margin-bottom: 30px; position: relative; overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(30, 58, 138, 0.25);
    display: flex; align-items: center; justify-content: space-between;
    min-height: 180px;
    margin-top: 10px;
}
.hero-wrapper::before { content: ""; position: absolute; top:0; left:0; width:100%; height:100%; background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E"); opacity: 0.3; }
.hero-content { z-index: 2; }
.hero-greet { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
.hero-text { font-size: 1rem; opacity: 0.95; font-weight: 500; }
.hero-icon { opacity: 0.8; font-size: 3rem; }

/* MODULE CARDS */
.mod-card-wrapper { display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02); height: 100%; border: 1px solid #E2E8F0; }
.mod-card-rect { background: white; padding: 0; display: flex; flex-direction: row; align-items: center; height: 100px; position: relative; overflow: hidden; }
.mod-bar { width: 4px; height: 100%; }
.mod-icon-area { width: 70px; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; background: #FAFAFA; border-right: 1px solid #F1F5F9; }
.mod-content { flex-grow: 1; padding: 0 16px; display: flex; flex-direction: column; justify-content: center; }
.mod-title { font-weight: 700; font-size: 0.95rem; color: #1E293B; margin-bottom: 2px; }
.mod-desc { font-size: 0.7rem; color: #64748B; line-height: 1.3; }

/* Botoes Card */
.mod-btn-area { background: #F8FAFC; padding: 0; border-top: 1px solid #E2E8F0; }
/* Ajuste seletivo para os botoes de card que estao abaixo da dobra */
div[data-testid="column"] .stButton button:not(.qa-btn button) {
    border-radius: 0 !important; border: none !important; width: 100%;
    background: transparent !important; color: #64748B !important;
    font-size: 0.7rem !important; padding: 8px !important;
    text-align: center !important; 
}
div[data-testid="column"] .stButton button:not(.qa-btn button):hover {
    background: #F1F5F9 !important; color: #4F46E5 !important;
}

/* Classes de Cor */
.c-indigo { background: #4F46E5 !important; } .bg-indigo-soft { background: #EEF2FF !important; color: #4F46E5 !important; }
.c-blue { background: #3B82F6 !important; } .bg-blue-soft { background: #EFF6FF !important; color: #2563EB !important; }
.c-purple { background: #8B5CF6 !important; } .bg-purple-soft { background: #F5F3FF !important; color: #7C3AED !important; }
.c-teal { background: #14B8A6 !important; } .bg-teal-soft { background: #F0FDFA !important; color: #0D9488 !important; }
.c-rose { background: #E11D48 !important; } .bg-rose-soft { background: #FFF1F2 !important; color: #BE123C !important; }
.c-sky { background: #0284C7 !important; } .bg-sky-soft { background: #F0F9FF !important; color: #0369A1 !important; }

@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 3. HELPERS
# ==============================================================================
def get_base64_image(image_path):
    if not os.path.exists(image_path): return ""
    try:
        with open(image_path, "rb") as f: return base64.b64encode(f.read()).decode()
    except: return ""

def get_user_initials(nome):
    if not nome: return "U"
    parts = nome.split()
    return (f"{parts[0][0]}{parts[-1][0]}".upper() if len(parts) >= 2 else nome[:2].upper())

# ==============================================================================
# 4. INICIALIZAÇÃO
# ==============================================================================
if "usuario_nome" not in st.session_state: st.session_state.usuario_nome = "Visitante"
if "autenticado" not in st.session_state: st.session_state.autenticado = False # Para teste, mude se tiver logica de login

# Se quiser gate de login, descomente abaixo
# if not st.session_state.get("autenticado"): ...

# ==============================================================================
# 5. RENDERIZAÇÃO DO HEADER INTEGRADO
# ==============================================================================
# Fundo branco fixo via CSS (.fixed-header-bg).
# Agora vamos renderizar as colunas que "flutuam" sobre esse fundo.

st.markdown('<div class="fixed-header-bg"></div>', unsafe_allow_html=True)

# Container que segura os itens do header
header_cols = st.columns([1.2, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 1], gap="small")

# 1. Logo (Esquerda)
with header_cols[0]:
    icone = get_base64_image("omni_icone.png")
    texto = get_base64_image("omni_texto.png")
    img_logo = f'<img src="data:image/png;base64,{icone}" class="logo-img">' if icone else "🌐"
    img_text = f'<img src="data:image/png;base64,{texto}" class="logo-text">' if texto else "<span style='font-weight:800;color:#2B3674;font-size:1rem;'>OMNISFERA</span>"
    st.markdown(f'<div class="logo-container">{img_logo}{img_text}</div>', unsafe_allow_html=True)

# 2. Navegação (Centro - 7 Botões)
# Usamos a classe .nav-btn no wrapper para o CSS pegar
with header_cols[1]:
    st.markdown('<div class="nav-btn qa-btn">', unsafe_allow_html=True)
    st.button("INÍCIO", use_container_width=True, on_click=lambda: st.rerun())
    st.markdown('</div>', unsafe_allow_html=True)

with header_cols[2]:
    st.markdown('<div class="nav-btn qa-btn">', unsafe_allow_html=True)
    st.button("ALUNOS", use_container_width=True, on_click=lambda: st.switch_page("pages/Alunos.py"))
    st.markdown('</div>', unsafe_allow_html=True)

with header_cols[3]:
    st.markdown('<div class="nav-btn qa-btn">', unsafe_allow_html=True)
    st.button("PEI", use_container_width=True, on_click=lambda: st.switch_page("pages/1_PEI.py"))
    st.markdown('</div>', unsafe_allow_html=True)

with header_cols[4]:
    st.markdown('<div class="nav-btn qa-btn">', unsafe_allow_html=True)
    st.button("AEE", use_container_width=True, on_click=lambda: st.switch_page("pages/2_PAE.py"))
    st.markdown('</div>', unsafe_allow_html=True)

with header_cols[5]:
    st.markdown('<div class="nav-btn qa-btn">', unsafe_allow_html=True)
    st.button("HUB", use_container_width=True, on_click=lambda: st.switch_page("pages/3_Hub_Inclusao.py"))
    st.markdown('</div>', unsafe_allow_html=True)

with header_cols[6]:
    st.markdown('<div class="nav-btn qa-btn">', unsafe_allow_html=True)
    st.button("DIÁRIO", use_container_width=True, on_click=lambda: st.switch_page("pages/4_Diario_de_Bordo.py"))
    st.markdown('</div>', unsafe_allow_html=True)

with header_cols[7]:
    st.markdown('<div class="nav-btn qa-btn">', unsafe_allow_html=True)
    st.button("DADOS", use_container_width=True, on_click=lambda: st.switch_page("pages/5_Monitoramento_Avaliacao.py"))
    st.markdown('</div>', unsafe_allow_html=True)

# 3. Usuário (Direita)
with header_cols[8]:
    initials = get_user_initials(st.session_state.usuario_nome)
    nome = st.session_state.usuario_nome.split()[0]
    st.markdown(f"""
        <div class="user-container">
            <span class="user-name">{nome}</span>
            <div class="user-avatar">{initials}</div>
        </div>
    """, unsafe_allow_html=True)


# ==============================================================================
# 6. CONTEÚDO DA PÁGINA (HERO + CARDS)
# ==============================================================================

# Hero
user = st.session_state.usuario_nome.split()[0]
saudacao = "Bom dia" if 5 <= datetime.now().hour < 12 else "Boa tarde"
st.markdown(f"""
    <div class="hero-wrapper">
        <div class="hero-content"><div class="hero-greet">{saudacao}, {user}!</div><div class="hero-text">"A inclusão acontece quando aprendemos com as diferenças."</div></div>
        <div class="hero-icon"><i class="ri-heart-pulse-fill"></i></div>
    </div>
""", unsafe_allow_html=True)

# Cards Módulos
st.markdown("### 🧩 Módulos do Sistema")
cols = st.columns(3, gap="medium")
modules = [
    {"t":"Estudantes", "d":"Gestão e histórico.", "i":"ri-group-fill", "c":"c-indigo", "b":"bg-indigo-soft", "p":"pages/Alunos.py", "k":"m1"},
    {"t":"Estratégias & PEI", "d":"Plano Educacional.", "i":"ri-book-open-fill", "c":"c-blue", "b":"bg-blue-soft", "p":"pages/1_PEI.py", "k":"m2"},
    {"t":"Plano de Ação", "d":"AEE e Intervenção.", "i":"ri-settings-5-fill", "c":"c-purple", "b":"bg-purple-soft", "p":"pages/2_PAE.py", "k":"m3"},
    {"t":"Hub de Recursos", "d":"Biblioteca e IA.", "i":"ri-rocket-2-fill", "c":"c-teal", "b":"bg-teal-soft", "p":"pages/3_Hub_Inclusao.py", "k":"m4"},
    {"t":"Diário de Bordo", "d":"Registro diário.", "i":"ri-file-list-3-fill", "c":"c-rose", "b":"bg-rose-soft", "p":"pages/4_Diario_de_Bordo.py", "k":"m5"},
    {"t":"Evolução & Dados", "d":"Indicadores.", "i":"ri-bar-chart-box-fill", "c":"c-sky", "b":"bg-sky-soft", "p":"pages/5_Monitoramento_Avaliacao.py", "k":"m6"}
]

for i, m in enumerate(modules):
    with cols[i%3]:
        # Card Visual
        st.markdown(f"""<div class="mod-card-wrapper"><div class="mod-card-rect"><div class="mod-bar {m['c']}"></div><div class="mod-icon-area {m['b']}"><i class="{m['i']}"></i></div><div class="mod-content"><div class="mod-title">{m['t']}</div><div class="mod-desc">{m['d']}</div></div></div></div>""", unsafe_allow_html=True)
        # Botão Acessar
        if st.button(f"ACESSAR {m['t'].split()[0].upper()}", key=m['k'], use_container_width=True):
            st.switch_page(m['p'])

st.markdown("<div style='height:50px'></div>", unsafe_allow_html=True)

# Rodapé simples
st.markdown(f"""<div style='text-align:center;color:#94A3B8;font-size:0.7rem;padding:20px;margin-top:20px;'><strong>Omnisfera {APP_VERSION}</strong></div>""", unsafe_allow_html=True)
        
