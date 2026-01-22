# pages/0_Home.py
import streamlit as st
from datetime import date, datetime
import base64
import os
import time

# ==============================================================================
# 1. CONFIGURAÇÃO INICIAL
# ==============================================================================
APP_VERSION = "v145.0 (Horizontal Pro)"

try:
    IS_TEST_ENV = st.secrets.get("ENV") == "TESTE"
except Exception:
    IS_TEST_ENV = False

st.set_page_config(
    page_title="Omnisfera",
    page_icon="omni_icone.png" if os.path.exists("omni_icone.png") else "🌐",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ==============================================================================
# 2. CSS & DESIGN SYSTEM (FUNDAMENTAL)
# ==============================================================================
st.markdown("""
<style>
/* Fontes e Ícones */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1E293B;
    background-color: #F8FAFC;
}

/* Limpeza Geral */
[data-testid="stSidebarNav"], [data-testid="stHeader"] { display: none !important; }
.block-container { 
    padding-top: 80px !important; 
    padding-bottom: 4rem !important; 
    max-width: 1280px !important; 
}

/* --- HEADER --- */
.topbar {
    position: fixed; top: 0; left: 0; right: 0; height: 70px;
    background: rgba(255,255,255,0.9); backdrop-filter: blur(12px);
    border-bottom: 1px solid #E2E8F0; z-index: 9999;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px;
}
.brand-box { display: flex; align-items: center; gap: 12px; }
.brand-logo { height: 36px; width: auto; animation: spin 45s linear infinite; }
.brand-name { font-weight: 800; font-size: 1.1rem; color: #0F172A; letter-spacing: -0.5px; }
.user-badge { 
    background: #F1F5F9; border: 1px solid #E2E8F0; 
    padding: 6px 14px; border-radius: 99px; font-size: 0.8rem; font-weight: 700; color: #64748B;
}

/* --- HERO SECTION --- */
.hero-wrapper {
    background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
    border-radius: 24px; padding: 48px; color: white;
    margin-bottom: 50px; position: relative; overflow: hidden;
    box-shadow: 0 20px 40px -10px rgba(30, 58, 138, 0.3);
}
.hero-wrapper::after {
    content: ""; position: absolute; right: -50px; top: -50px;
    width: 300px; height: 300px; background: rgba(255,255,255,0.1);
    border-radius: 50%; pointer-events: none;
}
.hero-greet { font-size: 2.2rem; font-weight: 800; margin-bottom: 10px; letter-spacing: -1px; }
.hero-text { font-size: 1.1rem; opacity: 0.9; max-width: 700px; line-height: 1.6; }

/* --- CARDS DE MÓDULO (RETANGULARES & HORIZONTAIS) --- */
/* Esta classe define o layout do card: Ícone na esquerda, Texto no meio */
.mod-card-rect {
    background: white;
    border-radius: 20px;
    padding: 0; /* Padding controlado internamente */
    border: 1px solid #E2E8F0;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    display: flex; flex-direction: row; /* Horizontal */
    align-items: center;
    height: 120px; /* Altura fixa para uniformidade */
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

/* Efeito Hover no Card Inteiro */
.mod-card-rect:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.08);
    border-color: #CBD5E1;
}

/* Barra lateral colorida de destaque */
.mod-bar { width: 6px; height: 100%; flex-shrink: 0; }

/* Área do Ícone */
.mod-icon-area {
    width: 90px; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; flex-shrink: 0;
    background: #FAFAFA;
}

/* Área de Texto */
.mod-content {
    flex-grow: 1; padding: 0 20px;
    display: flex; flex-direction: column; justify-content: center;
}
.mod-title { font-weight: 800; font-size: 1.1rem; color: #1E293B; margin-bottom: 4px; }
.mod-desc { font-size: 0.85rem; color: #64748B; line-height: 1.3; }

/* Botão de Ação (Seta) */
.mod-action {
    width: 60px; height: 100%;
    display: flex; align-items: center; justify-content: center;
    color: #CBD5E1; font-size: 1.5rem;
    transition: color 0.2s;
}
.mod-card-rect:hover .mod-action { color: #3B82F6; }

/* BOTÃO INVISÍVEL (O TRUQUE PARA CLIQUE TOTAL) */
/* Posiciona o st.button EXATAMENTE sobre o card HTML */
.ghost-btn-container {
    position: relative;
    height: 120px; /* Mesma altura do card */
    margin-top: -120px; /* Puxa para cima para cobrir o HTML */
    z-index: 10;
}
.ghost-btn-container button {
    width: 100%; height: 100%;
    opacity: 0; /* Invisível */
    border: none; cursor: pointer;
}

/* --- ESTILOS DE LINK (RECURSOS) --- */
.res-card-link { text-decoration: none !important; display: block; height: 100%; }
.res-card {
    background: white; border-radius: 16px; padding: 20px;
    border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 15px;
    transition: all 0.2s; height: 100%;
}
.res-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
.res-icon { 
    width: 45px; height: 45px; border-radius: 12px; 
    display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
}
.res-info { display: flex; flex-direction: column; }
.res-name { font-weight: 700; color: #1E293B; font-size: 0.95rem; }
.res-meta { font-size: 0.75rem; font-weight: 600; opacity: 0.8; }

/* CORES */
.c-blue { background: #3B82F6; color: #3B82F6; }
.bg-blue-soft { background: #EFF6FF; color: #2563EB; }
.c-purple { background: #8B5CF6; color: #8B5CF6; }
.bg-purple-soft { background: #F5F3FF; color: #7C3AED; }
.c-teal { background: #14B8A6; color: #14B8A6; }
.bg-teal-soft { background: #F0FDFA; color: #0D9488; }
.c-indigo { background: #6366F1; color: #6366F1; }
.bg-indigo-soft { background: #EEF2FF; color: #4F46E5; }
.c-slate { background: #64748B; color: #64748B; }
.bg-slate-soft { background: #F8FAFC; color: #475569; }

/* Cores para Recursos */
.rc-green { background: #F0FDF4; color: #16A34A; border-color: #DCFCE7; }
.rc-orange { background: #FFF7ED; color: #EA580C; border-color: #FFEDD5; }
.rc-rose { background: #FFF1F2; color: #E11D48; border-color: #FECDD3; }
.rc-sky { background: #F0F9FF; color: #0284C7; border-color: #E0F2FE; }

@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 3. GATE & HELPERS
# ==============================================================================
def acesso_bloqueado(msg):
    st.markdown(f"<div style='text-align:center; padding:50px; color:#64748B;'><h3>🔐 Acesso Restrito</h3><p>{msg}</p></div>", unsafe_allow_html=True)
    if st.button("Ir para Login", key="btn_login_gate"):
        st.session_state.autenticado = False; st.session_state.workspace_id = None; st.rerun()
    st.stop()

if not st.session_state.get("autenticado") or not st.session_state.get("workspace_id"):
    acesso_bloqueado("Sessão inválida.")

if "dados" not in st.session_state: st.session_state.dados = {"nome": "", "nasc": date(2015,1,1), "serie": None}

def get_base64_image(image_path):
    if not os.path.exists(image_path): return ""
    with open(image_path, "rb") as f: return base64.b64encode(f.read()).decode()

def escola_vinculada():
    return st.session_state.get("workspace_name") or st.session_state.get("workspace_id", "")[:8]

# ==============================================================================
# 4. RENDERIZAÇÃO
# ==============================================================================

# TOPBAR
icone_b64 = get_base64_image("omni_icone.png")
workspace = escola_vinculada()
nome_user = st.session_state.get('usuario_nome', 'Visitante').split()[0]
img_logo = f'<img src="data:image/png;base64,{icone_b64}" class="brand-logo">' if icone_b64 else "🌐"

st.markdown(f"""
<div class="topbar">
    <div class="brand-box">{img_logo} <div class="brand-name">OMNISFERA</div></div>
    <div class="brand-box">
        <div class="user-badge">{workspace}</div>
        <div style="font-weight:700; color:#334155;">{nome_user}</div>
    </div>
</div>
""", unsafe_allow_html=True)

# SIDEBAR
with st.sidebar:
    st.markdown("### Navegação")
    if st.button("👥 Alunos", use_container_width=True): st.switch_page("pages/0_Alunos.py")
    if st.button("📘 PEI", use_container_width=True): st.switch_page("pages/1_PEI.py")
    if st.button("🧩 PAEE", use_container_width=True): st.switch_page("pages/2_PAE.py")
    if st.button("🚀 Hub", use_container_width=True): st.switch_page("pages/3_Hub_Inclusao.py")
    st.markdown("---")
    if st.button("Sair", use_container_width=True):
        st.session_state.autenticado = False; st.rerun()

# HERO
hora = datetime.now().hour
saudacao = "Bom dia" if 5 <= hora < 12 else "Boa tarde" if 12 <= hora < 18 else "Boa noite"

st.markdown(f"""
<div class="hero-wrapper">
    <div class="hero-greet">{saudacao}, {nome_user}!</div>
    <div class="hero-text">"A inclusão acontece quando aprendemos com as diferenças e não com as igualdades."<br>Seu painel pedagógico está pronto.</div>
</div>
""", unsafe_allow_html=True)

# MÓDULOS (2 COLUNAS - RETANGULAR - BOTÃO INTEGRADO)
st.markdown("### 🚀 Seus Módulos")

def render_rect_module(title, desc, icon, color_cls, icon_cls, page_path, key):
    # 1. Renderiza o Card Visual (HTML)
    st.markdown(f"""
    <div class="mod-card-rect">
        <div class="mod-bar {color_cls}"></div>
        <div class="mod-icon-area">
            <i class="{icon} {color_cls}" style="background:transparent; -webkit-background-clip: text; color: transparent; filter: brightness(0.9);"></i>
            <i class="{icon}" style="color: inherit;"></i> 
        </div>
        <div class="mod-content">
            <div class="mod-title">{title}</div>
            <div class="mod-desc">{desc}</div>
        </div>
        <div class="mod-action"><i class="ri-arrow-right-s-line"></i></div>
    </div>
    <style>.{color_cls} {{ background-color: currentColor; }}</style>
    """, unsafe_allow_html=True)
    
    # 2. Renderiza o Botão Invisível por Cima (Overlay Perfeito)
    st.markdown('<div class="ghost-btn-container">', unsafe_allow_html=True)
    if st.button(f"btn_{key}", key=key):
        if "Alunos" in title or st.session_state.dados.get("nome"):
            st.switch_page(page_path)
        else:
            st.toast("Selecione um aluno primeiro!", icon="⚠️")
            time.sleep(1)
            st.switch_page("pages/0_Alunos.py")
    st.markdown('</div>', unsafe_allow_html=True)

# GRID 2x3 (Horizontal Rectangular)
c1, c2 = st.columns(2, gap="medium")

with c1:
    render_rect_module("Estudantes", "Gestão de cadastro e histórico.", "ri-group-fill", "c-indigo", "bg-indigo-soft", "pages/0_Alunos.py", "m_aluno")
    st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)
    render_rect_module("Plano de Ação / PAEE", "Sala de recursos e intervenções.", "ri-puzzle-2-fill", "c-purple", "bg-purple-soft", "pages/2_PAE.py", "m_pae")
    st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)
    render_rect_module("Diário de Bordo", "Registro diário de evidências.", "ri-file-list-3-fill", "c-slate", "bg-slate-soft", "pages/4_Diario_de_Bordo.py", "m_diario")

with c2:
    render_rect_module("Estratégias & PEI", "Plano Educacional Individualizado.", "ri-book-open-fill", "c-blue", "bg-blue-soft", "pages/1_PEI.py", "m_pei")
    st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)
    render_rect_module("Hub de Recursos", "Banco de materiais e IA.", "ri-rocket-2-fill", "c-teal", "bg-teal-soft", "pages/3_Hub_Inclusao.py", "m_hub")
    st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)
    render_rect_module("Evolução & Dados", "Indicadores e progresso.", "ri-bar-chart-box-fill", "c-slate", "bg-slate-soft", "pages/5_Monitoramento_Avaliacao.py", "m_dados")

# RECURSOS EXTERNOS (LINKS CLICÁVEIS COLORIDOS)
st.markdown("<div style='height:40px'></div>", unsafe_allow_html=True)
st.markdown("### 📚 Recursos Externos")

def render_resource(col, title, desc, icon, theme, link):
    with col:
        st.markdown(f"""
        <a href="{link}" target="_blank" class="res-card-link">
            <div class="res-card {theme}">
                <div class="res-icon {theme}"><i class="{icon}"></i></div>
                <div class="res-info">
                    <div class="res-name">{title}</div>
                    <div class="res-meta">{desc}</div>
                </div>
            </div>
        </a>
        """, unsafe_allow_html=True)

r1, r2, r3, r4 = st.columns(4, gap="medium")

render_resource(r1, "Lei da Inclusão", "LBI e diretrizes", "ri-government-fill", "rc-sky", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm")
render_resource(r2, "Base Nacional", "Competências BNCC", "ri-compass-3-fill", "rc-green", "http://basenacionalcomum.mec.gov.br/")
render_resource(r3, "Neurociência", "Artigos e estudos", "ri-brain-fill", "rc-rose", "https://institutoneurosaber.com.br/")
render_resource(r4, "Ajuda Omnisfera", "Tutoriais e suporte", "ri-question-fill", "rc-orange", "#")

st.markdown("<div style='height: 60px;'></div>", unsafe_allow_html=True)
st.markdown("<div style='text-align: center; color: #CBD5E0; font-size: 0.75rem;'>Omnisfera desenvolvida por RODRIGO A. QUEIROZ</div>", unsafe_allow_html=True)
