# pages/Alunos.py
import streamlit as st
import requests
from datetime import datetime
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

APP_VERSION = "v2.6 - Menu Real Dentro da Topbar (HTML + ?go=)"

# ==============================================================================
# NAVEGAÇÃO VIA QUERY PARAM (?go=) -> switch_page
# ==============================================================================
def handle_go_param():
    """
    Links HTML na topbar apontam para ?go=pages/...
    Aqui capturamos e redirecionamos com st.switch_page.
    """
    try:
        qp = st.query_params
        go = qp.get("go", None)
        if isinstance(go, list):
            go = go[0] if go else None
        if go:
            # limpa o param para não ficar "preso" em reruns
            try:
                st.query_params.clear()
            except Exception:
                pass
            st.switch_page(go)
    except Exception:
        pass

handle_go_param()

# ==============================================================================
# FUNÇÕES AUXILIARES
# ==============================================================================
def get_base64_image(filename: str) -> str:
    if os.path.exists(filename):
        with open(filename, "rb") as f:
            return base64.b64encode(f.read()).decode()
    return ""

def get_user_initials(nome: str) -> str:
    if not nome:
        return "U"
    parts = nome.strip().split()
    return f"{parts[0][0]}{parts[-1][0]}".upper() if len(parts) >= 2 else parts[0][:2].upper()

def get_workspace_short(max_len: int = 20) -> str:
    ws = st.session_state.get("workspace_name", "") or ""
    return (ws[:max_len] + "...") if len(ws) > max_len else ws

# ==============================================================================
# CSS E DESIGN SYSTEM (TOPBAR COM MENU EMBUTIDO)
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

[data-testid="stSidebarNav"], [data-testid="stHeader"], footer { display: none !important; }

:root { --topbar-h: 64px; }

.block-container {
    padding-top: calc(var(--topbar-h) + 16px) !important;
    padding-bottom: 2rem !important;
    max-width: 98% !important;
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
}

/* TOPBAR */
.topbar-thin {
    position: fixed; top: 0; left: 0; right: 0; height: var(--topbar-h);
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #E2E8F0;
    z-index: 9999;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 1.1rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.brand-box { display: flex; align-items: center; gap: 10px; }
.brand-logo { height: 32px !important; width: auto !important; animation: spin 60s linear infinite; }
.brand-img-text { height: 20px !important; width: auto; margin-left: 6px; }

.user-badge-thin {
    background: #F1F5F9;
    border: 1px solid #E2E8F0;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 800;
    color: #64748B;
}
.apple-avatar-thin {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4F46E5, #7C3AED);
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800;
    font-size: 0.75rem;
}

/* MENU CENTRAL DENTRO DA TOPBAR (HTML) */
.topbar-menu {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    height: var(--topbar-h);
    display: flex;
    align-items: center;
    gap: 10px;
    width: min(980px, 62vw);
    justify-content: center;
}

.tb-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding: 0 14px;
    border-radius: 12px;
    font-weight: 900;
    font-size: 0.64rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none !important;
    color: white !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    border: 1px solid rgba(255,255,255,0.10);
    white-space: nowrap;
    transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}
.tb-link:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.10); filter: brightness(1.02); }
.tb-link.active { outline: 2px solid rgba(79,70,229,0.20); filter: saturate(1.1); }

/* CORES */
.tb-home     { background: linear-gradient(135deg, #64748B, #475569); }
.tb-students { background: linear-gradient(135deg, #4F46E5, #4338CA); }
.tb-pei      { background: linear-gradient(135deg, #2563EB, #1D4ED8); }
.tb-aee      { background: linear-gradient(135deg, #7C3AED, #6D28D9); }
.tb-rec      { background: linear-gradient(135deg, #0D9488, #0F766E); }
.tb-diario   { background: linear-gradient(135deg, #E11D48, #BE123C); }
.tb-dados    { background: linear-gradient(135deg, #0284C7, #0369A1); }

/* HERO */
.mod-card-wrapper {
    display: flex; flex-direction: column;
    margin-bottom: 15px; border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    margin-top: 0px;
}
.mod-card-rect {
    background: white; padding: 0;
    border: 1px solid #E2E8F0;
    display: flex; align-items: center;
    height: 80px;
}
.mod-bar { width: 5px; height: 100%; flex-shrink: 0; }
.mod-icon-area {
    width: 60px; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; background: #FAFAFA;
    border-right: 1px solid #F1F5F9;
}
.mod-content { flex-grow: 1; padding: 0 16px; }
.mod-title { font-weight: 900; font-size: 0.95rem; color: #1E293B; margin-bottom: 2px; }
.mod-desc { font-size: 0.7rem; color: #64748B; }

.c-sky { background: #0284C7 !important; }
.bg-sky-soft { background: #F0F9FF !important; color: #0284C7 !important; }

/* TABELA */
.student-table { background: white; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-top: 10px; }
.student-header { display: grid; grid-template-columns: 3fr 1fr 1fr 2fr 1fr; background: #F8FAFC; padding: 10px 20px; border-bottom: 1px solid #E2E8F0; font-weight: 900; color: #475569; font-size: 0.75rem; text-transform: uppercase; }
.student-row { display: grid; grid-template-columns: 3fr 1fr 1fr 2fr 1fr; padding: 12px 20px; border-bottom: 1px solid #F1F5F9; align-items: center; background: white; }
.student-row:hover { background: #F8FAFC; }

.badge-grade { background: #F0F9FF; color: #0369A1; padding: 2px 8px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; border: 1px solid #BAE6FD; }
.badge-class { background: #F0FDF4; color: #15803D; padding: 2px 8px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; border: 1px solid #BBF7D0; }

@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 900px){
    .topbar-menu{ width: 80vw; gap: 8px; }
    .tb-link{ padding: 0 10px; font-size: 0.60rem; height: 34px; }
}
@media (max-width: 768px){
    .topbar-menu{ display: none; } /* no mobile: oculta menu para não quebrar */
    .student-header { display: none; }
    .student-row { grid-template-columns: 1fr; gap: 8px; border-bottom: 2px solid #F1F5F9; }
}
</style>
""",
    unsafe_allow_html=True,
)

# ==============================================================================
# TOPBAR (COM MENU EMBUTIDO EM HTML)
# ==============================================================================
def render_thin_topbar_with_menu():
    icone = get_base64_image("omni_icone.png")
    texto = get_base64_image("omni_texto.png")
    ws_name = get_workspace_short()
    user_name = st.session_state.get("usuario_nome", "Visitante")

    img_logo = f'<img src="data:image/png;base64,{icone}" class="brand-logo">' if icone else "🌐"
    img_text = (
        f'<img src="data:image/png;base64,{texto}" class="brand-img-text">'
        if texto
        else "<span style='font-weight:900;color:#2B3674;'>OMNISFERA</span>"
    )

    # página atual (para destacar)
    active = "students"

    # links via ?go=
    home_target = "pages/0_Home.py" if os.path.exists("pages/0_Home.py") else "0_Home.py"

    menu_html = f"""
      <div class="topbar-menu">
        <a class="tb-link tb-home" href="?go={home_target}">INÍCIO</a>
        <a class="tb-link tb-students {'active' if active=='students' else ''}" href="?go=pages/Alunos.py">ESTUDANTES</a>
        <a class="tb-link tb-pei" href="?go=pages/1_PEI.py">PEI</a>
        <a class="tb-link tb-aee" href="?go=pages/2_PAE.py">AEE</a>
        <a class="tb-link tb-rec" href="?go=pages/3_Hub_Inclusao.py">RECURSOS</a>
        <a class="tb-link tb-diario" href="?go=pages/4_Diario_de_Bordo.py">DIÁRIO</a>
        <a class="tb-link tb-dados" href="?go=pages/5_Monitoramento_Avaliacao.py">DADOS</a>
      </div>
    """

    st.markdown(
        f"""
        <div class="topbar-thin">
            <div class="brand-box">{img_logo}{img_text}</div>
            {menu_html}
            <div class="brand-box">
                <div class="user-badge-thin">{ws_name}</div>
                <div class="apple-avatar-thin">{get_user_initials(user_name)}</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

render_thin_topbar_with_menu()

# ==============================================================================
# HERO
# ==============================================================================
user_first = (st.session_state.get("usuario_nome", "Visitante") or "Visitante").split()[0]
saudacao = "Bom dia" if 5 <= datetime.now().hour < 12 else "Boa tarde"
st.markdown(
    f"""
    <div class="mod-card-wrapper">
        <div class="mod-card-rect">
            <div class="mod-bar c-sky"></div>
            <div class="mod-icon-area bg-sky-soft"><i class="ri-group-fill"></i></div>
            <div class="mod-content">
                <div class="mod-title">Gestão de Estudantes</div>
                <div class="mod-desc">{saudacao}, <strong>{user_first}</strong>! Gerencie os dados dos alunos vinculados aos PEIs neste workspace.</div>
            </div>
        </div>
    </div>
""",
    unsafe_allow_html=True,
)

# ==============================================================================
# CONTROLES E BUSCA
# ==============================================================================
col1, col2 = st.columns([3, 1], gap="medium")
with col1:
    q = st.text_input("Buscar por nome", placeholder="Digite o nome...", label_visibility="collapsed", key="search")
with col2:
    if st.button("🔄 Atualizar Lista", use_container_width=True):
        st.session_state["force_refresh"] = True
        st.rerun()

# ==============================================================================
# SUPABASE (REST)
# ==============================================================================
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
    except Exception:
        return []

def delete_student_rest(sid, wid):
    url = st.secrets.get("SUPABASE_URL").rstrip("/") + f"/rest/v1/students?id=eq.{sid}&workspace_id=eq.{wid}"
    try:
        requests.delete(url, headers=_sb_headers(), timeout=10)
    except Exception:
        pass

ws_id = st.session_state.get("workspace_id")
if not ws_id:
    st.info("Nenhum workspace selecionado.")
    st.stop()

if st.session_state.get("force_refresh"):
    list_students_rest.clear()
    st.session_state["force_refresh"] = False

alunos = list_students_rest(ws_id)
if q:
    alunos = [a for a in alunos if q.lower() in (a.get("name") or "").lower()]

# ==============================================================================
# TABELA
# ==============================================================================
if not alunos:
    st.info("Nenhum estudante encontrado.")
else:
    st.markdown(
        """
        <div class="student-table">
            <div class="student-header">
                <div>Nome</div><div>Série</div><div>Turma</div><div>Diagnóstico</div><div>Ações</div>
            </div>
        """,
        unsafe_allow_html=True,
    )

    for a in alunos:
        sid = a.get("id")
        nome = a.get("name", "—")
        serie = a.get("grade", "—")
        turma = a.get("class_group", "—")
        diag = a.get("diagnosis", "—")

        st.markdown(
            f"""
            <div class="student-row">
                <div style="font-weight:800; color:#1E293B;">{nome}</div>
                <div><span class="badge-grade">{serie}</span></div>
                <div><span class="badge-class">{turma}</span></div>
                <div style="font-size:0.85rem; color:#64748B;">{diag}</div>
                <div>
            """,
            unsafe_allow_html=True,
        )

        col_btn, _ = st.columns([1, 4])
        with col_btn:
            if st.button("🗑️", key=f"del_{sid}", help="Excluir aluno"):
                delete_student_rest(sid, ws_id)
                list_students_rest.clear()
                st.rerun()

        st.markdown("</div></div>", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)

# ==============================================================================
# RODAPÉ
# ==============================================================================
st.markdown(
    f"<div style='text-align:center;color:#94A3B8;font-size:0.7rem;padding:20px;margin-top:20px;'>{len(alunos)} estudantes registrados • {APP_VERSION}</div>",
    unsafe_allow_html=True,
)
