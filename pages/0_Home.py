import streamlit as st
from datetime import date, datetime
import base64
import os

# ==============================================================================
# CONFIGURAÇÃO
# ==============================================================================
APP_VERSION = "v2.3"
st.set_page_config(page_title="Omnisfera", page_icon="🌐", layout="wide", initial_sidebar_state="collapsed")

# ==============================================================================
# CSS
# ==============================================================================
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

html, body, [class*="css"] { font-family: 'Plus Jakarta Sans', sans-serif !important; color: #1E293B !important; background-color: #F8FAFC !important; }
[data-testid="stSidebarNav"], [data-testid="stHeader"], footer { display: none !important; }

/* AJUSTE TOPO */
.block-container { padding-top: 90px !important; padding-bottom: 4rem !important; max-width: 95% !important; }

/* HEADER */
.topbar { position: fixed; top: 0; left: 0; right: 0; height: 80px; background: rgba(255,255,255,0.98); border-bottom: 1px solid #E2E8F0; z-index: 9999; display: flex; align-items: center; justify-content: space-between; padding: 0 2.5rem; }
.brand-box { display: flex; align-items: center; gap: 12px; }
.brand-logo { height: 50px; animation: spin 45s linear infinite; }

/* HERO */
.hero-wrapper { background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); border-radius: 20px; padding: 2.5rem; color: white; margin-bottom: 40px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: space-between; min-height: 200px; margin-top: 5px; }
.hero-wrapper::before { content: ""; position: absolute; top:0; left:0; width:100%; height:100%; background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E"); opacity: 0.3; }
.hero-content { z-index: 2; }
.hero-greet { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; }
.hero-icon { opacity: 0.8; font-size: 3.5rem; }

/* CARDS */
.mod-card-wrapper { display: flex; flex-direction: column; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02); height: 100%; }
.mod-card-rect { background: white; border-radius: 16px 16px 0 0; padding: 0; border: 1px solid #E2E8F0; display: flex; flex-direction: row; align-items: center; height: 120px; position: relative; overflow: hidden; }
.mod-bar { width: 6px; height: 100%; }
.mod-icon-area { width: 80px; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; background: #FAFAFA; border-right: 1px solid #F1F5F9; }
.mod-content { flex-grow: 1; padding: 0 20px; display: flex; flex-direction: column; justify-content: center; }
.mod-title { font-weight: 800; font-size: 1rem; color: #1E293B; margin-bottom: 4px; }
.mod-desc { font-size: 0.75rem; color: #64748B; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* CORES */
.c-indigo { background: #4F46E5 !important; } .bg-indigo-soft { background: #EEF2FF !important; color: #4F46E5 !important; }
.c-blue { background: #3B82F6 !important; } .bg-blue-soft { background: #EFF6FF !important; color: #2563EB !important; }
.c-purple { background: #8B5CF6 !important; } .bg-purple-soft { background: #F5F3FF !important; color: #7C3AED !important; }
.c-teal { background: #14B8A6 !important; } .bg-teal-soft { background: #F0FDFA !important; color: #0D9488 !important; }
.c-rose { background: #E11D48 !important; } .bg-rose-soft { background: #FFF1F2 !important; color: #BE123C !important; }
.c-sky { background: #0284C7 !important; } .bg-sky-soft { background: #F0F9FF !important; color: #0369A1 !important; }

/* BOTOES CARD */
div[data-testid="column"] .stButton button {
    border-radius: 0 0 16px 16px !important; border: 1px solid #E2E8F0 !important; border-top: none !important;
    background: #F8FAFC !important; color: #475569 !important; font-weight: 700 !important; font-size: 0.75rem !important;
    padding: 10px !important; text-transform: uppercase !important; margin-top: -5px !important;
}
div[data-testid="column"] .stButton button:hover { background: #F1F5F9 !important; color: #1E293B !important; border-color: #CBD5E1 !important; }

@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# HELPERS
# ==============================================================================
def get_base64_image(image_path):
    if not os.path.exists(image_path): return ""
    try:
        with open(image_path, "rb") as f: return base64.b64encode(f.read()).decode()
    except: return ""

def render_topbar():
    icone = get_base64_image("omni_icone.png")
    texto = get_base64_image("omni_texto.png")
    img_logo = f'<img src="data:image/png;base64,{icone}" class="brand-logo">' if icone else "🌐"
    img_text = f'<img src="data:image/png;base64,{texto}" class="brand-img-text">' if texto else "<span style='font-weight:800;color:#2B3674;'>OMNISFERA</span>"
    user_name = st.session_state.get("usuario_nome", "Visitante").split()[0]
    
    st.markdown(f"""<div class="topbar"><div class="brand-box">{img_logo}{img_text}</div><div class="brand-box" style="font-weight:700;color:#334155;">{user_name}</div></div>""", unsafe_allow_html=True)

# ==============================================================================
# BARRA DE ACESSO RÁPIDO (COMPACTA)
# ==============================================================================
def render_quick_access_bar():
    st.markdown("""
    <style>
        /* Estilo base dos botões compactos */
        .qa-btn button {
            font-weight: 800 !important; border-radius: 6px !important; padding: 4px 0 !important;
            font-size: 0.7rem !important; text-transform: uppercase !important; box-shadow: none !important;
            min-height: 32px !important; height: auto !important; border-width: 1px !important;
        }
        /* Cores Específicas */
        div[data-testid="column"]:nth-of-type(1) .qa-btn button { border-color: #64748B !important; color: #64748B !important; background:white !important;}
        div[data-testid="column"]:nth-of-type(2) .qa-btn button { border-color: #4F46E5 !important; color: #4F46E5 !important; background:white !important;}
        div[data-testid="column"]:nth-of-type(3) .qa-btn button { border-color: #2563EB !important; color: #2563EB !important; background:white !important;}
        div[data-testid="column"]:nth-of-type(4) .qa-btn button { border-color: #7C3AED !important; color: #7C3AED !important; background:white !important;}
        div[data-testid="column"]:nth-of-type(5) .qa-btn button { border-color: #0D9488 !important; color: #0D9488 !important; background:white !important;}
        div[data-testid="column"]:nth-of-type(6) .qa-btn button { border-color: #E11D48 !important; color: #E11D48 !important; background:white !important;}
        div[data-testid="column"]:nth-of-type(7) .qa-btn button { border-color: #0284C7 !important; color: #0284C7 !important; background:white !important;}
        
        .qa-btn button:hover { background-color: #F1F5F9 !important; }
    </style>
    """, unsafe_allow_html=True)

    c1, c2, c3, c4, c5, c6, c7 = st.columns(7, gap="small")
    with c1: st.markdown('<div class="qa-btn">', unsafe_allow_html=True); st.button("INÍCIO", use_container_width=True, on_click=lambda: st.rerun()); st.markdown('</div>', unsafe_allow_html=True)
    with c2: st.markdown('<div class="qa-btn">', unsafe_allow_html=True); st.button("ESTUDANTES", use_container_width=True, on_click=lambda: st.switch_page("pages/Alunos.py")); st.markdown('</div>', unsafe_allow_html=True)
    with c3: st.markdown('<div class="qa-btn">', unsafe_allow_html=True); st.button("PEI", use_container_width=True, on_click=lambda: st.switch_page("pages/1_PEI.py")); st.markdown('</div>', unsafe_allow_html=True)
    with c4: st.markdown('<div class="qa-btn">', unsafe_allow_html=True); st.button("AEE", use_container_width=True, on_click=lambda: st.switch_page("pages/2_PAE.py")); st.markdown('</div>', unsafe_allow_html=True)
    with c5: st.markdown('<div class="qa-btn">', unsafe_allow_html=True); st.button("RECURSOS", use_container_width=True, on_click=lambda: st.switch_page("pages/3_Hub_Inclusao.py")); st.markdown('</div>', unsafe_allow_html=True)
    with c6: st.markdown('<div class="qa-btn">', unsafe_allow_html=True); st.button("DIÁRIO", use_container_width=True, on_click=lambda: st.switch_page("pages/4_Diario_de_Bordo.py")); st.markdown('</div>', unsafe_allow_html=True)
    with c7: st.markdown('<div class="qa-btn">', unsafe_allow_html=True); st.button("DADOS", use_container_width=True, on_click=lambda: st.switch_page("pages/5_Monitoramento_Avaliacao.py")); st.markdown('</div>', unsafe_allow_html=True)

# ==============================================================================
# EXECUÇÃO
# ==============================================================================
if "usuario_nome" not in st.session_state: st.session_state.usuario_nome = "Visitante"
render_topbar()
render_quick_access_bar()

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
    {"t":"Estudantes", "d":"Gestão e histórico.", "i":"ri-group-fill", "c":"c-indigo", "b":"bg-indigo-soft", "p":"pages/Alunos.py"},
    {"t":"Estratégias & PEI", "d":"Plano Educacional.", "i":"ri-book-open-fill", "c":"c-blue", "b":"bg-blue-soft", "p":"pages/1_PEI.py"},
    {"t":"Plano de Ação", "d":"AEE e Intervenção.", "i":"ri-settings-5-fill", "c":"c-purple", "b":"bg-purple-soft", "p":"pages/2_PAE.py"},
    {"t":"Hub de Recursos", "d":"Biblioteca e IA.", "i":"ri-rocket-2-fill", "c":"c-teal", "b":"bg-teal-soft", "p":"pages/3_Hub_Inclusao.py"},
    {"t":"Diário de Bordo", "d":"Registro diário.", "i":"ri-file-list-3-fill", "c":"c-rose", "b":"bg-rose-soft", "p":"pages/4_Diario_de_Bordo.py"},
    {"t":"Evolução & Dados", "d":"Indicadores.", "i":"ri-bar-chart-box-fill", "c":"c-sky", "b":"bg-sky-soft", "p":"pages/5_Monitoramento_Avaliacao.py"}
]

for i, m in enumerate(modules):
    with cols[i%3]:
        st.markdown(f"""<div class="mod-card-wrapper"><div class="mod-card-rect"><div class="mod-bar {m['c']}"></div><div class="mod-icon-area {m['b']}"><i class="{m['i']}"></i></div><div class="mod-content"><div class="mod-title">{m['t']}</div><div class="mod-desc">{m['d']}</div></div></div></div>""", unsafe_allow_html=True)
        if st.button(f"ACESSAR {m['t'].split()[0].upper()}", key=f"btn_{i}", use_container_width=True): st.switch_page(m['p'])

st.markdown("<div style='height:50px'></div>", unsafe_allow_html=True)
