# pages/Alunos.py
import streamlit as st
import requests
from datetime import datetime

# ==============================================================================
# CONFIG
# ==============================================================================
st.set_page_config(page_title="Omnisfera • Estudantes", page_icon="👥", layout="wide")

# ==============================================================================
# 🔷 DESIGN SYSTEM COMPLETO (HOME v2.0 + OTIMIZAÇÕES)
# ==============================================================================
def _ui_home_block():
    st.markdown(
        """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

/* ===== RESET & BASE ===== */
html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    color: #1E293B !important;
    background-color: #F8FAFC !important;
}

/* ===== TOPBAR (MESMA DA HOME) ===== */
[data-testid="stSidebarNav"],
[data-testid="stHeader"],
[data-testid="stToolbar"],
[data-testid="collapsedControl"],
footer {
    display: none !important;
}

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

.brand-text {
    font-weight: 800;
    font-size: 1.2rem;
    color: #2B3674;
    background: linear-gradient(135deg, #4F46E5, #7C3AED);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
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

.user-avatar {
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
}

/* ===== CONTAINER ===== */
.block-container {
    padding-top: 100px !important;
    padding-bottom: 3rem !important;
    max-width: 95% !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

/* ===== HERO STUDENTS (DESDOBRAMENTO DO CARD) ===== */
.hero-students {
    background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
    border: 1px solid #BAE6FD;
    box-shadow: 0 12px 24px rgba(2, 132, 199, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 140px;
}

.hero-students::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230284c7' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.3;
}

.hero-icon-area {
    width: 100px;
    height: 100px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: #0284C7;
    border: 1px solid #BAE6FD;
    box-shadow: 0 8px 16px rgba(2, 132, 199, 0.1);
    z-index: 2;
    position: relative;
}

.hero-content {
    z-index: 2;
    position: relative;
    flex-grow: 1;
    padding-left: 32px;
}

.hero-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: #0C4A6E;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
}

.hero-desc {
    font-size: 0.95rem;
    color: #475569;
    max-width: 800px;
    line-height: 1.6;
    font-weight: 500;
}

/* ===== STUDENT TABLE (NOVO DESIGN) ===== */
.student-table {
    background: white;
    border-radius: 16px;
    border: 1px solid #E2E8F0;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.student-header {
    display: grid;
    grid-template-columns: 3.2fr 1.1fr 1.1fr 2.6fr 1.1fr;
    background: #F8FAFC;
    padding: 18px 24px;
    border-bottom: 2px solid #E2E8F0;
    font-weight: 800;
    color: #475569;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.student-row {
    display: grid;
    grid-template-columns: 3.2fr 1.1fr 1.1fr 2.6fr 1.1fr;
    padding: 20px 24px;
    border-bottom: 1px solid #F1F5F9;
    align-items: center;
    transition: all 0.2s ease;
    background: white;
}

.student-row:hover {
    background: #F8FAFC;
    transform: translateX(4px);
}

.student-name {
    font-weight: 700;
    color: #1E293B;
    font-size: 0.95rem;
}

.student-meta {
    font-size: 0.85rem;
    color: #64748B;
    font-weight: 500;
}

/* ===== BADGES ===== */
.badge-grade {
    background: #F0F9FF;
    color: #0369A1;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    border: 1px solid #BAE6FD;
    display: inline-block;
    text-align: center;
}

.badge-class {
    background: #F0FDF4;
    color: #15803D;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    border: 1px solid #BBF7D0;
    display: inline-block;
    text-align: center;
}

/* ===== ACTIONS ===== */
.actions-container {
    display: flex;
    gap: 8px;
    align-items: center;
}

.action-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    font-size: 0.9rem;
}

.action-delete {
    background: #FEF2F2;
    color: #DC2626;
    border-color: #FECACA;
}

.action-delete:hover {
    background: #FEE2E2;
    transform: scale(1.05);
}

.action-confirm {
    background: #DCFCE7;
    color: #16A34A;
    border-color: #BBF7D0;
}

.action-cancel {
    background: #FEF3C7;
    color: #D97706;
    border-color: #FDE68A;
}

/* ===== EMPTY STATE ===== */
.empty-state {
    text-align: center;
    padding: 80px 40px;
    background: white;
    border-radius: 16px;
    border: 1px dashed #E2E8F0;
}

.empty-icon {
    font-size: 3rem;
    color: #CBD5E1;
    margin-bottom: 16px;
}

.empty-title {
    font-weight: 800;
    color: #64748B;
    margin-bottom: 8px;
}

.empty-desc {
    color: #94A3B8;
    font-size: 0.9rem;
    max-width: 400px;
    margin: 0 auto;
}

/* ===== CONTROLS ===== */
.search-box {
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    width: 100%;
}

.search-box:focus {
    outline: none;
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.action-button {
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 12px 20px;
    font-weight: 700;
    color: #475569;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-button:hover {
    background: #F8FAFC;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
    border-color: #CBD5E1;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1024px) {
    .topbar { padding: 0 1.5rem; }
    .hero-students { padding: 1.5rem; }
    .hero-icon-area { width: 80px; height: 80px; font-size: 2rem; }
    .student-header, .student-row { grid-template-columns: 2.5fr 1fr 1fr 2fr 1fr; }
}

@media (max-width: 768px) {
    .topbar { padding: 0 1rem; }
    .hero-students {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    .hero-content { padding-left: 0; }
    .hero-title { font-size: 1.5rem; }
    .student-header, .student-row { grid-template-columns: 1fr; gap: 12px; }
    .student-header { display: none; }
}

/* ===== STREAMLIT OVERRIDES ===== */
.stButton > button {
    border-radius: 12px !important;
    border: 1px solid #E2E8F0 !important;
    background: white !important;
    color: #475569 !important;
    font-weight: 800 !important;
    font-size: 0.85rem !important;
    padding: 10px 20px !important;
    transition: all 0.2s ease !important;
}

.stButton > button:hover {
    background: #F8FAFC !important;
    color: #4F46E5 !important;
    border-color: #CBD5E1 !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08) !important;
}

.stTextInput > div > div > input {
    border-radius: 12px !important;
    border: 1px solid #E2E8F0 !important;
    padding: 12px 16px !important;
}

.stTextInput > div > div > input:focus {
    border-color: #4F46E5 !important;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
}
</style>
        """,
        unsafe_allow_html=True,
    )


_ui_home_block()


# ==============================================================================
# 🔒 VERIFICAÇÃO DE ACESSO
# ==============================================================================
def acesso_bloqueado(msg: str):
    st.markdown(
        f"""
        <div style="
            max-width:520px;
            margin: 110px auto 18px auto;
            padding: 26px;
            background: white;
            border-radius: 18px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 20px 40px rgba(15,82,186,0.10);
            text-align: center;
        ">
            <div style="font-size:2.1rem; margin-bottom:10px;">🔐</div>
            <div style="font-weight:900; font-size:1.1rem; margin-bottom:6px; color:#0f172a;">
                Acesso restrito
            </div>
            <div style="color:#4A5568; font-weight:700; font-size:0.95rem; margin-bottom:10px;">
                {msg}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    c1, c2, c3 = st.columns([1, 2, 1])
    with c2:
        if st.button("🔑 Voltar para o Login", use_container_width=True, type="primary"):
            for k in ["autenticado", "workspace_id", "workspace_name", "usuario_nome", "usuario_cargo"]:
                st.session_state.pop(k, None)
            try:
                st.switch_page("streamlit_app.py")
            except Exception:
                st.markdown(
                    """
                    <div style="text-align:center; margin-top:10px;">
                      <a href="/" target="_self"
                         style="display:inline-block; padding:10px 14px; border-radius:12px;
                                background:#0F52BA; color:white; font-weight:900; text-decoration:none;">
                        Clique aqui para voltar ao Login
                      </a>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
                st.stop()
    st.stop()


if not st.session_state.get("autenticado", False):
    acesso_bloqueado("Sessão expirada ou não iniciada.")

if not st.session_state.get("workspace_id"):
    acesso_bloqueado("Nenhum workspace vinculado ao seu acesso (PIN).")


WORKSPACE_ID = st.session_state.get("workspace_id")
WORKSPACE_NAME = st.session_state.get("workspace_name") or f"{str(WORKSPACE_ID)[:8]}…"
USUARIO_NOME = st.session_state.get("usuario_nome", "Visitante").split()[0]

# ==============================================================================
# TOPBAR CUSTOMIZADA
# ==============================================================================
def get_user_initials(nome: str) -> str:
    if not nome:
        return "U"
    parts = nome.split()
    if len(parts) >= 2:
        return f"{parts[0][0]}{parts[-1][0]}".upper()
    return nome[:2].upper() if len(nome) >= 2 else nome[0].upper()


def render_topbar():
    user_initials = get_user_initials(st.session_state.get("usuario_nome", "Visitante"))
    
    st.markdown(
        f"""
        <div class="topbar">
            <div class="brand-box">
                <div class="brand-text">OMNISFERA</div>
            </div>
            <div class="brand-box" style="gap: 16px;">
                <div class="user-badge">{WORKSPACE_NAME[:20] + '...' if len(WORKSPACE_NAME) > 20 else WORKSPACE_NAME}</div>
                <div style="display: flex; align-items: center; gap: 12px; font-weight: 700; color: #334155;">
                    <div class="user-avatar">{user_initials}</div>
                    <div>{USUARIO_NOME}</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


render_topbar()

# ==============================================================================
# SUPABASE REST
# ==============================================================================
def _sb_url() -> str:
    url = str(st.secrets.get("SUPABASE_URL", "")).strip()
    if not url:
        raise RuntimeError("SUPABASE_URL não encontrado nos secrets.")
    return url.rstrip("/")


def _sb_key() -> str:
    key = str(st.secrets.get("SUPABASE_SERVICE_KEY", "")).strip()
    if not key:
        key = str(st.secrets.get("SUPABASE_ANON_KEY", "")).strip()
    if not key:
        raise RuntimeError("SUPABASE_SERVICE_KEY/ANON_KEY não encontrado nos secrets.")
    return key


def _headers() -> dict:
    key = _sb_key()
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def _http_error(prefix: str, r: requests.Response):
    raise RuntimeError(f"{prefix}: {r.status_code} {r.text}")


@st.cache_data(ttl=10, show_spinner=False)
def list_students_rest(workspace_id: str):
    base = (
        f"{_sb_url()}/rest/v1/students"
        f"?select=id,name,birth_date,grade,class_group,diagnosis,created_at"
        f"&workspace_id=eq.{workspace_id}"
        f"&order=created_at.desc"
    )
    r = requests.get(base, headers=_headers(), timeout=20)
    if r.status_code >= 400:
        _http_error("List students falhou", r)
    data = r.json()
    return data if isinstance(data, list) else []


def delete_student_rest(student_id: str, workspace_id: str):
    url = f"{_sb_url()}/rest/v1/students?id=eq.{student_id}&workspace_id=eq.{workspace_id}"
    h = _headers()
    h["Prefer"] = "return=representation"
    r = requests.delete(url, headers=h, timeout=20)
    if r.status_code >= 400:
        _http_error("Delete em students falhou", r)
    return r.json()


# ==============================================================================
# HERO SECTION (DESDOBRAMENTO DO CARD DA HOME)
# ==============================================================================
hora = datetime.now().hour
saudacao = "Bom dia" if 5 <= hora < 12 else "Boa tarde" if 12 <= hora < 18 else "Boa noite"

st.markdown(
    f"""
    <div class="hero-students">
        <div class="hero-icon-area">
            <i class="ri-group-fill"></i>
        </div>
        <div class="hero-content">
            <div class="hero-title">Gestão de Estudantes</div>
            <div class="hero-desc">
                {saudacao}, <strong>{USUARIO_NOME}</strong>! Aqui você gerencia todos os estudantes do workspace 
                <strong>{WORKSPACE_NAME}</strong>. Visualize, busque e administre os dados dos alunos vinculados aos PEIs.
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# ==============================================================================
# CONTROLES SUPERIORES
# ==============================================================================
col1, col2 = st.columns([3, 1], gap="medium")

with col1:
    q = st.text_input(
        "Buscar por nome",
        placeholder="Digite o nome do estudante...",
        label_visibility="collapsed",
        key="search_students"
    )

with col2:
    st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)
    if st.button("🔄 Atualizar Lista", use_container_width=True, type="secondary"):
        list_students_rest.clear()
        st.rerun()

# 🔥 Refresh automático se veio do PEI
if st.session_state.pop("students_dirty", False):
    try:
        list_students_rest.clear()
    except Exception:
        pass

# ==============================================================================
# CARREGAMENTO DOS DADOS
# ==============================================================================
with st.spinner("Carregando estudantes..."):
    try:
        alunos = list_students_rest(WORKSPACE_ID)
    except Exception as e:
        st.error(f"Erro ao carregar do Supabase: {e}")
        st.stop()

# Filtro
if q and q.strip():
    qq = q.strip().lower()
    alunos = [a for a in alunos if (a.get("name") or "").lower().find(qq) >= 0]

# ==============================================================================
# RENDERIZAÇÃO DOS ESTUDANTES
# ==============================================================================
if not alunos:
    st.markdown(
        """
        <div class="empty-state">
            <div class="empty-icon"><i class="ri-user-search-line"></i></div>
            <div class="empty-title">Nenhum estudante encontrado</div>
            <div class="empty-desc">
                Este workspace ainda não possui estudantes cadastrados. 
                Crie um PEI para começar a adicionar alunos.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.stop()

# Header da tabela
st.markdown(
    f"""
    <div class="student-table">
        <div class="student-header">
            <div>Nome</div>
            <div>Série</div>
            <div>Turma</div>
            <div>Diagnóstico</div>
            <div>Ações</div>
        </div>
    """,
    unsafe_allow_html=True,
)

# Contador
st.caption(f"**{len(alunos)}** estudante(s) encontrado(s)")

# Linhas dos estudantes
for a in alunos:
    sid = a.get("id")
    nome = a.get("name") or "—"
    serie = a.get("grade") or "—"
    turma = a.get("class_group") or "—"
    diag = a.get("diagnosis") or "—"
    
    confirm_key = f"confirm_del_{sid}"
    if confirm_key not in st.session_state:
        st.session_state[confirm_key] = False
    
    # Renderiza a linha
    st.markdown(
        f"""
        <div class="student-row">
            <div class="student-name">{nome}</div>
            <div><span class="badge-grade">{serie}</span></div>
            <div><span class="badge-class">{turma}</span></div>
            <div class="student-meta">{diag}</div>
            <div>
        """,
        unsafe_allow_html=True,
    )
    
    # Controles de ação inline
    col_a1, col_a2, col_a3 = st.columns([1, 1, 1])
    
    with col_a1:
        if not st.session_state[confirm_key]:
            if st.button("🗑️", key=f"del_{sid}", help="Apagar estudante"):
                st.session_state[confirm_key] = True
                st.rerun()
        else:
            st.markdown(
                f"""
                <div class="actions-container">
                    <div class="action-btn action-confirm" onclick="document.getElementById('confirm_yes_{sid}').click()">
                        <i class="ri-check-line"></i>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            if st.button("✅", key=f"confirm_yes_{sid}", visible=False):
                try:
                    delete_student_rest(sid, WORKSPACE_ID)
                    list_students_rest.clear()
                    st.session_state[confirm_key] = False
                    st.toast(f"Estudante '{nome}' removido com sucesso!", icon="🗑️")
                    st.rerun()
                except Exception as e:
                    st.session_state[confirm_key] = False
                    st.error(f"Erro ao apagar: {e}")
    
    with col_a2:
        if st.session_state[confirm_key]:
            st.markdown(
                f"""
                <div class="actions-container">
                    <div class="action-btn action-cancel" onclick="document.getElementById('confirm_no_{sid}').click()">
                        <i class="ri-close-line"></i>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            if st.button("❌", key=f"confirm_no_{sid}", visible=False):
                st.session_state[confirm_key] = False
                st.rerun()
    
    st.markdown("</div></div>", unsafe_allow_html=True)

st.markdown("</div>", unsafe_allow_html=True)  # Fecha student-table

# ==============================================================================
# RODAPÉ
# ==============================================================================
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
        <strong>Omnisfera v2.0</strong> • Gestão de Estudantes • 
        Workspace: {WORKSPACE_NAME[:30]} • 
        {datetime.now().strftime("%d/%m/%Y %H:%M")}
    </div>
    """,
    unsafe_allow_html=True,
)
