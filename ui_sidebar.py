# ui_sidebar.py
import os
from datetime import datetime
import streamlit as st


# -----------------------------------------------------------------------------
# Cloud ready (REST) — não depende de sb
# -----------------------------------------------------------------------------
def _is_cloud_ready():
    """
    Nuvem pronta se:
      - autenticado True
      - workspace_id existe
      - SUPABASE_URL existe
      - SUPABASE_SERVICE_KEY ou SUPABASE_ANON_KEY existe
    Retorna (ok, details_dict)
    """
    details = {}
    details["autenticado"] = bool(st.session_state.get("autenticado", False))
    details["workspace_id"] = bool(st.session_state.get("workspace_id"))

    try:
        details["SUPABASE_URL"] = bool(str(st.secrets.get("SUPABASE_URL", "")).strip())
    except Exception:
        details["SUPABASE_URL"] = False

    try:
        service = str(st.secrets.get("SUPABASE_SERVICE_KEY", "")).strip()
        anon = str(st.secrets.get("SUPABASE_ANON_KEY", "")).strip()
        details["SUPABASE_KEY"] = bool(service or anon)
    except Exception:
        details["SUPABASE_KEY"] = False

    ok = all(details.values())
    return ok, details


# -----------------------------------------------------------------------------
# CSS Sidebar (visual parecido com sua Home)
# -----------------------------------------------------------------------------
def _inject_sidebar_css():
    st.markdown(
        """
<style>
/* Esconde menu padrão do Streamlit dentro da sidebar nav (se estiver aparecendo) */
[data-testid="stSidebarNav"] { display:none !important; }

/* Sidebar base */
section[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%) !important;
    border-right: 1px solid #E2E8F0 !important;
}

/* Cabeçalho/Logo */
.sidebar-logo-container {
    display:flex;
    justify-content:center;
    align-items:center;
    padding: 18px 0 16px 0;
    margin-bottom: 8px;
    border-bottom: 1px solid #E2E8F0;
}

.user-info-container {
    margin: 14px 12px 12px 12px;
    padding: 14px 12px;
    border-radius: 14px;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    box-shadow: 0 4px 10px rgba(15,23,42,0.04);
    text-align: center;
}

.user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    margin: 0 auto 8px auto;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight: 900;
    color: white;
    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
}

.user-name {
    font-weight: 800;
    color: #0F172A;
    font-size: 0.95rem;
    margin-bottom: 2px;
}
.user-workspace {
    font-weight: 700;
    color: #64748B;
    font-size: 0.8rem;
}

.sidebar-title {
    padding: 0 14px;
    margin-top: 8px;
    margin-bottom: 10px;
    font-size: 0.78rem;
    font-weight: 900;
    color: #64748B;
    letter-spacing: .12em;
    text-transform: uppercase;
}

/* Botões Streamlit dentro da sidebar */
.sidebar-btn .stButton > button {
    width: 100%;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    background: white;
    color: #334155;
    font-weight: 800;
    padding: 0.55rem 0.9rem;
    text-align: left;
    transition: all .18s ease;
}

.sidebar-btn .stButton > button:hover {
    transform: translateX(3px);
    border-color: #CBD5E1;
    box-shadow: 0 6px 14px rgba(15,23,42,0.06);
}

/* Botão ativo */
.sidebar-btn.active .stButton > button {
    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%) !important;
    color: white !important;
    border: none !important;
}

/* Botão sair */
.sidebar-logout .stButton > button {
    width: 100%;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #F43F5E 0%, #E11D48 100%) !important;
    color: white !important;
    font-weight: 900;
    padding: 0.55rem 0.9rem;
}
.sidebar-logout .stButton > button:hover {
    filter: brightness(0.98);
    transform: translateY(-1px);
}

/* Caixinhas de status */
.status-box {
    margin: 10px 12px;
    padding: 12px 12px;
    border-radius: 14px;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
}
.status-title{
    font-weight: 900;
    color:#0F172A;
    font-size: .85rem;
    margin-bottom: 6px;
}
.status-line{
    font-size: .78rem;
    color:#475569;
    font-weight: 700;
    margin-bottom: 4px;
}

hr.sidebar-sep {
    border: none;
    border-top: 1px solid #E2E8F0;
    margin: 14px 12px;
}
</style>
        """,
        unsafe_allow_html=True,
    )


# -----------------------------------------------------------------------------
# Render Sidebar — ÚNICO ponto de sidebar no app todo
# -----------------------------------------------------------------------------
def render_sidebar(active: str = ""):
    """
    active: "home" | "alunos" | "pei" | "paee" | "hub" | "diario" | "dados"
    """
    _inject_sidebar_css()

    with st.sidebar:
        # Logo
        st.markdown('<div class="sidebar-logo-container">', unsafe_allow_html=True)
        if os.path.exists("omnisfera.png"):
            st.image("omnisfera.png", use_container_width=True)
        elif os.path.exists("omni_texto.png"):
            st.image("omni_texto.png", use_container_width=True)
        else:
            st.markdown(
                """
                <div style="text-align:center; padding:10px 0;">
                    <div style="font-size:1.8rem; font-weight:900;
                        background:linear-gradient(135deg,#4F46E5,#7C3AED);
                        -webkit-background-clip:text;
                        -webkit-text-fill-color:transparent;">
                        OMNISFERA
                    </div>
                    <div style="font-size:.9rem; color:#64748B; font-weight:700;">
                        Plataforma de Inclusão
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        st.markdown("</div>", unsafe_allow_html=True)

        # Usuário / workspace
        if st.session_state.get("autenticado"):
            nome_user = st.session_state.get("usuario_nome", "Visitante")
            workspace = st.session_state.get("workspace_name") or (st.session_state.get("workspace_id") or "ESCOLA")[:8]
            iniciais = "".join([n[0].upper() for n in str(nome_user).split()[:2]]) or "U"

            st.markdown(
                f"""
                <div class="user-info-container">
                    <div class="user-avatar">{iniciais}</div>
                    <div class="user-name">{str(nome_user).split()[0]}</div>
                    <div class="user-workspace">{workspace}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        st.markdown("<hr class='sidebar-sep'>", unsafe_allow_html=True)

        # MENU
        st.markdown("<div class='sidebar-title'>MENU</div>", unsafe_allow_html=True)

        def _nav_btn(label: str, page: str, key: str, is_active: bool = False):
            cls = "sidebar-btn active" if is_active else "sidebar-btn"
            st.markdown(f"<div class='{cls}'>", unsafe_allow_html=True)
            clicked = st.button(label, key=key, use_container_width=True)
            st.markdown("</div>", unsafe_allow_html=True)
            if clicked:
                st.switch_page(page)

        _nav_btn("🏠 Home", "pages/0_Home.py", "nav_home", active == "home")
        _nav_btn("👥 Alunos", "pages/Alunos.py", "nav_alunos", active == "alunos")
        _nav_btn("📘 PEI 360°", "pages/1_PEI.py", "nav_pei", active == "pei")
        _nav_btn("🧩 PAEE & T.A.", "pages/2_PAE.py", "nav_paee", active == "paee")
        _nav_btn("🚀 Hub de Inclusão", "pages/3_Hub_Inclusao.py", "nav_hub", active == "hub")

        # Se suas páginas ainda não existem, comente por enquanto
        # _nav_btn("📓 Diário de Bordo", "pages/4_Diario_de_Bordo.py", "nav_diario", active == "diario")
        # _nav_btn("📊 Monitoramento", "pages/5_Monitoramento_Avaliacao.py", "nav_dados", active == "dados")

        # STATUS (OpenAI + aluno + nuvem)
        st.markdown("<hr class='sidebar-sep'>", unsafe_allow_html=True)

        # OpenAI
        st.markdown(
            """
            <div class="status-box">
              <div class="status-title">🔑 OpenAI</div>
            """,
            unsafe_allow_html=True,
        )

        if "OPENAI_API_KEY" in st.secrets and str(st.secrets.get("OPENAI_API_KEY", "")).strip():
            st.session_state["OPENAI_API_KEY"] = str(st.secrets["OPENAI_API_KEY"]).strip()
            st.markdown("<div class='status-line'>✅ OK (Secrets)</div>", unsafe_allow_html=True)
        else:
            typed = st.text_input("Chave OpenAI:", type="password", key="sidebar_openai_key")
            if typed and typed.strip():
                st.session_state["OPENAI_API_KEY"] = typed.strip()
                st.markdown("<div class='status-line'>✅ OK (Sessão)</div>", unsafe_allow_html=True)
            else:
                st.markdown("<div class='status-line'>ℹ️ Informe para liberar IA</div>", unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

        # Aluno (selected_student_id)
        st.session_state.setdefault("selected_student_id", None)
        sid = st.session_state.get("selected_student_id")

        st.markdown(
            """
            <div class="status-box">
              <div class="status-title">🧾 Aluno (Supabase)</div>
            """,
            unsafe_allow_html=True,
        )
        if sid:
            st.markdown("<div class='status-line'>✅ Vinculado</div>", unsafe_allow_html=True)
            st.caption(f"student_id: {str(sid)[:8]}…")
        else:
            st.markdown("<div class='status-line'>📝 Rascunho</div>", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

        # Nuvem (REST)
        ok_cloud, details = _is_cloud_ready()
        st.markdown(
            """
            <div class="status-box">
              <div class="status-title">☁️ Nuvem (Supabase)</div>
            """,
            unsafe_allow_html=True,
        )
        if ok_cloud:
            st.markdown("<div class='status-line'>✅ Pronta (REST)</div>", unsafe_allow_html=True)
        else:
            st.markdown("<div class='status-line'>⚠️ Incompleta</div>", unsafe_allow_html=True)
            st.caption(" • ".join([f"{k}:{'OK' if v else 'FALTA'}" for k, v in details.items()]))
        st.markdown("</div>", unsafe_allow_html=True)

        # Logout
        st.markdown("<hr class='sidebar-sep'>", unsafe_allow_html=True)
        st.markdown("<div class='sidebar-title'>SESSÃO</div>", unsafe_allow_html=True)

        st.markdown("<div class='sidebar-logout'>", unsafe_allow_html=True)
        if st.button("🚪 Sair do Sistema", use_container_width=True, key="sidebar_logout"):
            for k in ["autenticado", "workspace_id", "workspace_name", "usuario_nome", "usuario_cargo", "selected_student_id"]:
                st.session_state.pop(k, None)
            try:
                st.switch_page("streamlit_app.py")
            except Exception:
                st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)

        # Versão
        st.markdown(
            f"""
            <div style="text-align:center; color:#94A3B8; font-size:0.72rem; margin-top:14px; padding:10px;">
                Omnisfera • {datetime.now().strftime("%d/%m/%Y")}
            </div>
            """,
            unsafe_allow_html=True,
        )
