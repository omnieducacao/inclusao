# login_view.py
import os
import base64
from datetime import datetime
import streamlit as st

# ✅ IMPORTS SUPABASE (somente o que existe com certeza no seu supabase_client.py)
from supabase_client import RPC_NAME
import omni_utils as ou


# ==============================================================================
# Ambiente / Chrome
# ==============================================================================
def _env():
    try:
        return str(st.secrets.get("ENV", "")).upper()
    except Exception:
        return ""


def hide_streamlit():
    """Esconde menu do Streamlit (acesso a secrets) na página de login."""
    if _env() == "TESTE":
        return
    st.markdown(
        """
        <style>
            #MainMenu, [data-testid="stMainMenu"], .stMainMenu { display: none !important; visibility: hidden !important; }
            footer, header, [data-testid="stHeader"] { display: none !important; visibility: hidden !important; }
            [data-testid="stToolbar"], [data-testid="stToolbarActions"], [data-testid="stDecoration"] { display: none !important; visibility: hidden !important; }
            [data-testid="stSidebar"], section[data-testid="stSidebar"], [data-testid="stSidebarNav"] { display: none !important; visibility: hidden !important; }
            button[data-testid="collapsedControl"], button[aria-label*="Settings"], button[aria-label*="Menu"] { display: none !important; visibility: hidden !important; }
            button[title*="Settings"], button[title*="Manage"], button[title*="View app"], .stDeployButton { display: none !important; visibility: hidden !important; }
            [data-testid="stAppViewContainer"] > header { display: none !important; }
        </style>
        """,
        unsafe_allow_html=True
    )


# ==============================================================================
# Assets
# ==============================================================================
def b64(path: str) -> str:
    if path and os.path.exists(path):
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode()
    return ""


ICON = next((b64(f) for f in ["omni_icone.png", "omni.png", "logo.png"] if b64(f)), "")
TEXT = b64("omni_texto.png")


# ==============================================================================
# CSS GLOBAL — Login profissional
# ==============================================================================
def inject_css():
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        html, body, [class*="css"] {
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            background: linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #334155 100%) !important;
            min-height: 100vh;
            color: #0f172a;
        }

        .wrap {
            max-width: 480px;
            margin: 0 auto;
            padding: 48px 24px 64px;
        }

        .block-container {
            padding-top: 2rem !important;
            max-width: 480px !important;
            margin: 0 auto !important;
        }

        .element-container { max-width: 100% !important; }

        .brand {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            margin-bottom: 28px;
        }

        .logoSpin img {
            width: 80px;
            filter: drop-shadow(0 4px 12px rgba(255,255,255,0.15));
            animation: logo-spin 14s linear infinite;
        }
        @keyframes logo-spin {
            to { transform: rotate(360deg); }
        }

        .logoText img {
            height: 42px;
            filter: brightness(1.1);
        }

        .welcome {
            text-align: center;
            margin: 0 auto 24px;
            color: rgba(255,255,255,0.9);
            font-size: 15px;
            line-height: 1.6;
            font-weight: 600;
            max-width: 420px;
        }

        .welcome small {
            display: block;
            margin-top: 8px;
            font-weight: 500;
            color: rgba(255,255,255,0.65);
            font-size: 13px;
        }

        .card {
            background: #ffffff;
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.12);
            padding: 32px 28px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
        }

        @media (max-width: 768px) {
            .wrap { max-width: 92vw; padding: 32px 16px; }
        }

        div[data-testid="stTextInput"] input {
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            color: #1e293b;
            padding: 12px 16px;
            font-weight: 500;
        }
        div[data-testid="stTextInput"] input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        div[data-testid="stButton"] button {
            width: 100%;
            border-radius: 14px;
            font-weight: 700;
            padding: 12px 1rem;
            background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
            border: none !important;
            color: #fff !important;
        }
        div[data-testid="stButton"] button:hover {
            background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
            transform: translateY(-1px);
            box-shadow: 0 10px 25px rgba(37, 99, 235, 0.35) !important;
        }

        .login-footer {
            text-align: center;
            margin-top: 28px;
            color: rgba(255,255,255,0.4);
            font-size: 11px;
            font-weight: 500;
        }

        .admin-corner {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 100;
        }
        .admin-corner button {
            font-size: 12px !important;
            padding: 6px 12px !important;
            background: rgba(255,255,255,0.1) !important;
            color: rgba(255,255,255,0.9) !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
        }
        .admin-corner button:hover {
            background: rgba(255,255,255,0.15) !important;
        }
        .login-relative { position: relative; }
        </style>
        """,
        unsafe_allow_html=True
    )


# ==============================================================================
# Workspace members e master
# ==============================================================================
def _list_workspace_members(workspace_id) -> list:
    """Lista membros do workspace. Retorna [] se tabela não existir."""
    try:
        from services.members_service import list_members
        return list_members(str(workspace_id))
    except Exception:
        return []


def _get_workspace_master(workspace_id):
    """Retorna o master do workspace ou None."""
    try:
        from services.members_service import get_workspace_master
        return get_workspace_master(str(workspace_id))
    except Exception:
        return None


# ==============================================================================
# Supabase client opcional (não quebra login)
# ==============================================================================
def _try_init_supabase_client_into_session():
    """
    Tenta criar st.session_state['sb'] usando supabase_client.get_supabase(),
    mas NÃO derruba o login se falhar (pois seu app pode estar usando REST).
    """
    try:
        from supabase_client import get_supabase  # existe no seu supabase_client.py
        sb = get_supabase()
        st.session_state["sb"] = sb
        return True, None
    except Exception as e:
        # não bloqueia o login: apenas não cria 'sb'
        st.session_state.pop("sb", None)
        return False, str(e)


# ==============================================================================
# Render
# ==============================================================================
def render_login():
    hide_streamlit()
    inject_css()

    st.markdown('<div class="wrap login-relative">', unsafe_allow_html=True)

    # Admin no canto direito
    ac1, ac2 = st.columns([5, 1])
    with ac2:
        with st.expander("🔧 Admin", expanded=False):
            st.caption("Termo de uso: Admin → Termo de Uso")
            admin_email = st.text_input("Email admin", placeholder="seu@email.com", key="login_admin_email")
            admin_senha = st.text_input("Senha admin", type="password", placeholder="****", key="login_admin_senha")
            if st.button("Entrar como admin", key="btn_admin"):
                if not admin_email or not admin_senha:
                    st.error("Informe email e senha.")
                else:
                    try:
                        from services.admin_service import verify_platform_admin, list_platform_admins
                        admins = list_platform_admins()
                        if not admins:
                            st.warning("Nenhum admin cadastrado. Criar no Supabase.")
                            st.caption("Execute supabase/migrations/00013_seed_admin.sql")
                        elif verify_platform_admin(admin_email.strip().lower(), admin_senha):
                            st.session_state.autenticado = True
                            st.session_state.is_platform_admin = True
                            st.session_state.workspace_id = None
                            st.session_state.workspace_name = None
                            st.session_state.usuario_nome = "Admin"
                            st.session_state.member = None
                            st.session_state.user_role = "platform_admin"
                            if hasattr(ou, "track_usage_event"):
                                try:
                                    ou.track_usage_event("login_admin_success", source="login_view")
                                except Exception:
                                    pass
                            st.rerun()
                        else:
                            st.error("Email ou senha incorretos.")
                    except Exception as e:
                        st.error(str(e))

    # Logo centralizada (com animação de rotação)
    st.markdown(
        f"""
        <div class="brand">
            <div class="logoSpin"><img src="data:image/png;base64,{ICON}" alt="Omnisfera"></div>
            <div class="logoText"><img src="data:image/png;base64,{TEXT}" alt="OMNISFERA"></div>
        </div>
        <div class="welcome">
            Olá, educador(a)! Desenvolvemos a Omnisfera com cuidado e dedicação para transformar a inclusão em uma realidade mais leve e possível na sua escola.
            <small>Preencha os dados abaixo para continuar.</small>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Cartão de Login
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("**Entrar na plataforma**")
    email = st.text_input("Email", placeholder="seu@escola.com", key="login_email")
    senha = st.text_input("Senha", type="password", placeholder="****", key="login_senha")

    if st.button("Entrar", use_container_width=True, type="primary", key="btn_entrar"):
        if not (email and senha):
            st.error("Informe email e senha.")
        else:
            try:
                from services.members_service import find_user_by_email, verify_workspace_master, verify_member_password
                found = find_user_by_email(email.strip().lower())
                if not found:
                    st.error("Email não encontrado. Verifique seus dados.")
                else:
                    ws_id = found["workspace_id"]
                    ws_name = found.get("workspace_name", "")
                    role = found.get("role", "")
                    user = found.get("user", {})
                    ok = False
                    if role == "master":
                        ok = verify_workspace_master(ws_id, user.get("email"), senha)
                        if ok:
                            st.session_state.member = {"nome": user.get("nome"), "email": user.get("email"), "can_gestao": True, "can_estudantes": True, "can_pei": True, "can_paee": True, "can_hub": True, "can_diario": True, "can_avaliacao": True}
                            st.session_state.usuario_nome = user.get("nome")
                    else:
                        ok = verify_member_password(ws_id, user.get("email"), senha)
                        if ok:
                            st.session_state.member = user
                            st.session_state.usuario_nome = user.get("nome")
                    if ok:
                        _try_init_supabase_client_into_session()
                        st.session_state.workspace_id = ws_id
                        st.session_state.workspace_name = ws_name
                        st.session_state.autenticado = True
                        st.session_state.usuario_cargo = "Usuário"
                        st.session_state.user_role = "master" if role == "master" else "member"
                        event_name = "login_master_success" if role == "master" else "login_member_success"
                        ou.track_usage_event(event_name, source="login_view", metadata={"email": user.get("email")})
                        st.rerun()
                    else:
                        st.error("Senha incorreta.")
            except Exception as e:
                st.error(str(e))

    st.markdown("</div>", unsafe_allow_html=True)  # Fim card

    st.markdown(
        f'<div class="login-footer">Acesso seguro • RPC: {RPC_NAME}</div>',
        unsafe_allow_html=True
    )
    st.markdown("</div>", unsafe_allow_html=True)  # Fim wrap
