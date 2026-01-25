# pages/Alunos.py
import streamlit as st
import requests
from datetime import datetime, date
import base64
import os

# ==============================================================================
# CONFIG
# ==============================================================================
st.set_page_config(
    page_title="Omnisfera • Estudantes",
    page_icon="👥",
    layout="wide",
    initial_sidebar_state="collapsed",
)

APP_VERSION = "v2.8 - Menu Slim & Lowercase"

# ==============================================================================
# FUNÇÕES AUXILIARES
# ==============================================================================
def get_base64_image(filename: str) -> str:
    if os.path.exists(filename):
        with open(filename, "rb") as f:
            return base64.b64encode(f.read()).decode()
    return ""

def get_user_initials(nome: str) -> str:
    if not nome: return "U"
    parts = nome.strip().split()
    return f"{parts[0][0]}{parts[-1][0]}".upper() if len(parts) >= 2 else parts[0][:2].upper()

def get_workspace_short(max_len: int = 20) -> str:
    ws = st.session_state.get("workspace_name", "") or ""
    return (ws[:max_len] + "...") if len(ws) > max_len else ws

# ==============================================================================
# CSS (ULTRA COMPACTO)
# ==============================================================================
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

/* RESET */
html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    color: #1E293B !important;
    background-color: #F8FAFC !important;
}

/* OCULTAR NATIVOS */
[data-testid="stSidebarNav"], [data-testid="stHeader"], footer { display: none !important; }

/* --- ESPAÇAMENTO GERAL --- */
.block-container {
    padding-top: 55px !important; /* Colado na barra fixa */
    padding-bottom: 2rem !important;
    max-width: 98% !important;
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
}

/* TOPBAR FIXA */
.topbar-thin {
    position: fixed; top: 0; left: 0; right: 0; height: 50px; /* Barra mais fina (50px) */
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #E2E8F0;
    z-index: 9999;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.brand-box { display: flex; align-items: center; gap: 8px; }
.brand-logo { height: 28px !important; width: auto !important; animation: spin 60s linear infinite; }
.brand-img-text { height: 16px !important; width: auto; margin-left: 6px; }

/* BADGES TOPO */
.user-badge-thin { background: #F1F5F9; border: 1px solid #E2E8F0; padding: 2px 8px; border-radius: 10px; font-size: 0.65rem; font-weight: 700; color: #64748B; }
.apple-avatar-thin { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.65rem; }

/* --- BOTÕES SLIM (AJUSTE FINO) --- */
.qa-container {
    margin-top: -35px !important; /* Puxa MUITO para cima */
    margin-bottom: 2px !important; /* Cola no card de baixo */
}

.qa-btn-colored button {
    font-weight: 600 !important;
    border-radius: 4px !important;
    padding: 0px 0px !important;
    font-size: 0.65rem !important; /* Fonte pequena */
    text-transform: none !important; /* Caixa baixa/normal */
    box-shadow: 0 1px 1px rgba(0,0,0,0.05) !important;
    min-height: 24px !important; /* Altura Mínima */
    height: 24px !important;
    border: none !important;
    color: white !important;
    transition: all 0.1s ease !important;
    letter-spacing: 0px !important;
    white-space: nowrap !important;
    width: 100% !important;
    line-height: 1 !important; /* Centralizar texto verticalmente */
}
.qa-btn-colored button:hover { transform: translateY(-1px) !important; filter: brightness(1.05); }

/* Cores dos Botões */
div[data-testid="column"]:nth-of-type(2) .qa-btn-colored button { background: linear-gradient(135deg, #64748B, #475569) !important; }
div[data-testid="column"]:nth-of-type(3) .qa-btn-colored button { background: linear-gradient(135deg, #4F46E5, #4338CA) !important; }
div[data-testid="column"]:nth-of-type(4) .qa-btn-colored button { background: linear-gradient(135deg, #2563EB, #1D4ED8) !important; }
div[data-testid="column"]:nth-of-type(5) .qa-btn-colored button { background: linear-gradient(135deg, #7C3AED, #6D28D9) !important; }
div[data-testid="column"]:nth-of-type(6) .qa-btn-colored button { background: linear-gradient(135deg, #0D9488, #0F766E) !important; }
div[data-testid="column"]:nth-of-type(7) .qa-btn-colored button { background: linear-gradient(135deg, #E11D48, #BE123C) !important; }
div[data-testid="column"]:nth-of-type(8) .qa-btn-colored button { background: linear-gradient(135deg, #0284C7, #0369A1) !important; }

/* CARD HERO (COLADO) */
.mod-card-wrapper { 
    display: flex; flex-direction: column; 
    margin-bottom: 10px; margin-top: 0px; 
    border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02); 
}
.mod-card-rect { background: white; padding: 0; border: 1px solid #E2E8F0; display: flex; align-items: center; height: 60px; /* Hero mais baixo */ }
.mod-bar { width: 4px; height: 100%; flex-shrink: 0; }
.mod-icon-area { width: 50px; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; background: #FAFAFA; border-right: 1px solid #F1F5F9; }
.mod-content { flex-grow: 1; padding: 0 14px; }
.mod-title { font-weight: 700; font-size: 0.85rem; color: #1E293B; margin-bottom: 0px; }
.mod-desc { font-size: 0.65rem; color: #64748B; }

/* TABELA */
.student-table { background: white; border-radius: 10px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02); margin-top: 8px; }
.student-header { display: grid; grid-template-columns: 3fr 1fr 1fr 2fr 1fr; background: #F8FAFC; padding: 8px 16px; border-bottom: 1px solid #E2E8F0; font-weight: 700; color: #475569; font-size: 0.7rem; }
.student-row { display: grid; grid-template-columns: 3fr 1fr 1fr 2fr 1fr; padding: 10px 16px; border-bottom: 1px solid #F1F5F9; align-items: center; background: white; }
.student-row:hover { background: #F8FAFC; }
.badge-grade { background: #F0F9FF; color: #0369A1; padding: 1px 6px; border-radius: 6px; font-size: 0.65rem; font-weight: 700; border: 1px solid #BAE6FD; }
.badge-class { background: #F0FDF4; color: #15803D; padding: 1px 6px; border-radius: 6px; font-size: 0.65rem; font-weight: 700; border: 1px solid #BBF7D0; }

/* Cores Cards */
.c-sky { background: #0284C7 !important; } .bg-sky-soft { background: #F0F9FF !important; color: #0284C7 !important; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@media (max-width: 768px) { .topbar-thin { padding: 0 1rem; } .student-header { display: none; } .student-row { grid-template-columns: 1fr; gap: 6px; border-bottom: 2px solid #F1F5F9; } }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# RENDERIZAÇÃO
# ==============================================================================

# --- 1. TOPBAR FIXA ---
def render_thin_topbar():
    icone = get_base64_image("omni_icone.png")
    texto = get_base64_image("omni_texto.png")
    ws_name = get_workspace_short()
    user_name = st.session_state.get("usuario_nome", "Visitante")
    
    img_logo = f'<img src="data:image/png;base64,{icone}" class="brand-logo">' if icone else "🌐"
    img_text = f'<img src="data:image/png;base64,{texto}" class="brand-img-text">' if texto else "<span style='font-weight:800;color:#2B3674;'>OMNISFERA</span>"
    
    st.markdown(f"""
        <div class="topbar-thin">
            <div class="brand-box">{img_logo}{img_text}</div>
            <div class="brand-box">
                <div class="user-badge-thin">{ws_name}</div>
                <div class="apple-avatar-thin">{get_user_initials(user_name)}</div>
            </div>
        </div>
    """, unsafe_allow_html=True)

render_thin_topbar()

# --- 2. MENU COMPACTO (Lower Case) ---
def render_menu():
    # Usando colunas proporcionais para centralizar e dar espaço aos textos longos
    # 0.5 (Spacer) | 1 | 1 | 1.2 | 1.2 | 1.2 | 1.2 | 1.2 | 0.5 (Spacer)
    cols = st.columns([0.3, 0.8, 1, 1.2, 1.2, 1.2, 1.2, 1.2, 0.3], gap="small")
    
    with cols[1]: 
        st.markdown('<div class="qa-container qa-btn-colored">', unsafe_allow_html=True)
        if st.button("Início", use_container_width=True): st.switch_page("pages/0_Home.py")
        st.markdown('</div>', unsafe_allow_html=True)
    with cols[2]: 
        st.markdown('<div class="qa-container qa-btn-colored">', unsafe_allow_html=True)
        if st.button("Estudantes", use_container_width=True): st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)
    with cols[3]: 
        st.markdown('<div class="qa-container qa-btn-colored">', unsafe_allow_html=True)
        if st.button("Estratégias & PEI", use_container_width=True): st.switch_page("pages/1_PEI.py")
        st.markdown('</div>', unsafe_allow_html=True)
    with cols[4]: 
        st.markdown('<div class="qa-container qa-btn-colored">', unsafe_allow_html=True)
        if st.button("Plano de Ação (AEE)", use_container_width=True): st.switch_page("pages/2_PAE.py")
        st.markdown('</div>', unsafe_allow_html=True)
    with cols[5]: 
        st.markdown('<div class="qa-container qa-btn-colored">', unsafe_allow_html=True)
        if st.button("Hub de Recursos", use_container_width=True): st.switch_page("pages/3_Hub_Inclusao.py")
        st.markdown('</div>', unsafe_allow_html=True)
    with cols[6]: 
        st.markdown('<div class="qa-container qa-btn-colored">', unsafe_allow_html=True)
        if st.button("Diário de Bordo", use_container_width=True): st.switch_page("pages/4_Diario_de_Bordo.py")
        st.markdown('</div>', unsafe_allow_html=True)
    with cols[7]: 
        st.markdown('<div class="qa-container qa-btn-colored">', unsafe_allow_html=True)
        if st.button("Evolução & Dados", use_container_width=True): st.switch_page("pages/5_Monitoramento_Avaliacao.py")
        st.markdown('</div>', unsafe_allow_html=True)

render_menu()

# --- 3. CARD HERO ---
user_first = st.session_state.get("usuario_nome", "Visitante").split()[0]
saudacao = "Bom dia" if 5 <= datetime.now().hour < 12 else "Boa tarde"
st.markdown(f"""
    <div class="mod-card-wrapper">
        <div class="mod-card-rect">
            <div class="mod-bar c-sky"></div>
            <div class="mod-icon-area bg-sky-soft"><i class="ri-group-fill"></i></div>
            <div class="mod-content">
                <div class="mod-title">Gestão de Estudantes</div>
                <div class="mod-desc">{saudacao}, <strong>{user_first}</strong>! Gerencie os dados aqui.</div>
            </div>
        </div>
    </div>
""", unsafe_allow_html=True)

# --- 4. CONTROLES ---
col1, col2 = st.columns([3, 1], gap="medium")
with col1:
    q = st.text_input("Buscar por nome", placeholder="Digite o nome...", label_visibility="collapsed", key="search")
with col2:
    if st.button("🔄 Atualizar Lista", use_container_width=True):
        st.session_state["force_refresh"] = True
        st.rerun()

# --- 5. LÓGICA SUPABASE ---
def _sb_headers():
    key = st.secrets.get("SUPABASE_SERVICE_KEY") or st.secrets.get("SUPABASE_ANON_KEY")
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}

@st.cache_data(ttl=10, show_spinner=False)
def list_students_rest(workspace_id):
    url = st.secrets.get("SUPABASE_URL").rstrip("/") + "/rest/v1/students"
    params = f"?select=id,name,grade,class_group,diagnosis&workspace_id=eq.{workspace_id}&order=created_at.desc"
    try:
        r = requests.get(url + params, headers=_sb_headers(), timeout=10)
        return r.json() if r.status_code == 200 else []
    except: return []

def delete_student_rest(sid, wid):
    url = st.secrets.get("SUPABASE_URL").rstrip("/") + f"/rest/v1/students?id=eq.{sid}&workspace_id=eq.{wid}"
    requests.delete(url, headers=_sb_headers())

# Carrega Dados
ws_id = st.session_state.get("workspace_id")
if not ws_id:
    st.info("Nenhum workspace selecionado."); st.stop()

if st.session_state.get("force_refresh"): list_students_rest.clear()

alunos = list_students_rest(ws_id)
if q: alunos = [a for a in alunos if q.lower() in (a.get("name") or "").lower()]

# --- 6. TABELA ---
if not alunos:
    st.info("Nenhum estudante encontrado.")
else:
    st.markdown("""
    <div class="student-table">
        <div class="student-header"><div>Nome</div><div>Série</div><div>Turma</div><div>Diagnóstico</div><div>Ações</div></div>
    """, unsafe_allow_html=True)
    
    for a in alunos:
        sid, nome = a.get("id"), a.get("name", "—")
        serie, turma = a.get("grade", "—"), a.get("class_group", "—")
        diag = a.get("diagnosis", "—")
        
        st.markdown(f"""
        <div class="student-row">
            <div style="font-weight:700; color:#1E293B;">{nome}</div>
            <div><span class="badge-grade">{serie}</span></div>
            <div><span class="badge-class">{turma}</span></div>
            <div style="font-size:0.8rem; color:#64748B;">{diag}</div>
            <div>
        """, unsafe_allow_html=True)
        
        col_btn, _ = st.columns([1, 4])
        with col_btn:
            if st.button("🗑️", key=f"del_{sid}", help="Excluir"):
                delete_student_rest(sid, ws_id)
                list_students_rest.clear()
                st.rerun()
        
        st.markdown("</div></div>", unsafe_allow_html=True)
    
    st.markdown("</div>", unsafe_allow_html=True)

st.markdown(f"<div style='text-align:center;color:#94A3B8;font-size:0.6rem;padding:10px;margin-top:10px;'>{len(alunos)} estudantes • {APP_VERSION}</div>", unsafe_allow_html=True)
