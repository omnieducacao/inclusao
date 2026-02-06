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
# CSS GLOBAL (Nunito)
# ==============================================================================
def inject_css():
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        html, body, [class*="css"] {
            font-family: 'Nunito', sans-serif;
            background: #F7FAFC;
            color: #0f172a;
        }

        .wrap {
            max-width: 620px;
            margin: auto;
            padding-top: 30px;
            padding-bottom: 40px;
        }

        .block-container {
            padding-top: 1rem !important;
            max-width: 620px !important;
            margin: 0 auto !important;
            background: transparent !important;
        }

        .element-container { max-width: 100% !important; }

        .brand {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 24px;
        }

        .logoSpin img {
            width: 70px;
            animation: spin 12s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .logoText img { height: 38px; }

        .welcome {
            text-align: center;
            margin: 6px auto 18px auto;
            color: #334155;
            font-size: 14px;
            line-height: 1.5;
            font-weight: 700;
            max-width: 560px;
        }

        .welcome small {
            display: block;
            margin-top: 6px;
            font-weight: 700;
            color: #64748B;
            font-size: 14px;
        }

        .card {
            background: white;
            border-radius: 20px;
            border: 1px solid #E2E8F0;
            padding: 28px;
            box-shadow: 0 10px 40px rgba(15,23,42,.06);
        }
        /* Card visual na coluna central (evita div vazia = retângulo branco) */
        [data-testid="column"]:nth-of-type(2) {
            background: white;
            border-radius: 20px;
            padding: 28px;
            box-shadow: 0 10px 40px rgba(15,23,42,.06);
            border: 1px solid #E2E8F0;
        }

        @media (max-width: 768px) {
            .wrap { max-width: 92vw; }
        }

        div[data-testid="stTextInput"] input {
            border-radius: 12px;
            border: 1px solid #CBD5E1;
            background-color: #F8FAFC;
            color: #334155;
            padding: 10px 12px;
            width: 100%;
        }
        div[data-testid="stTextInput"] input:focus {
            border-color: #94A3B8;
            background-color: #FFFFFF;
            box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.2);
        }

        div[data-testid="stButton"] button {
            width: 100%;
            border-radius: 12px;
            font-weight: 800;
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #1E3A8A, #1E40AF) !important;
            border: none !important;
            color: #ffffff !important;
        }
        div[data-testid="stButton"] button:hover {
            background: linear-gradient(135deg, #1E40AF, #1E3A8A) !important;
            transform: translateY(-1px);
            box-shadow: 0 10px 22px rgba(30, 58, 138, 0.3) !important;
        }

        .login-footer {
            text-align: center;
            margin-top: 20px;
            color: #CBD5E1;
            font-size: 11px;
            font-weight: 500;
        }

        /* Remove retângulo branco no meio */
        .main .block-container { background: transparent !important; }
        section[data-testid="stSidebar"] + div .block-container { background: transparent !important; }
        [data-testid="stVerticalBlock"] > div[style*="flex"] { background: transparent !important; }
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

    st.markdown('<div class="wrap">', unsafe_allow_html=True)

    # Logo e boas-vindas
    st.markdown(
        f"""
        <div class="brand">
            <div class="logoSpin"><img src="data:image/png;base64,{ICON}"></div>
            <div class="logoText"><img src="data:image/png;base64,{TEXT}"></div>
        </div>
        <div class="welcome">
            Olá, educador(a)! Desenvolvemos a Omnisfera com cuidado e dedicação para transformar a inclusão em uma realidade mais leve e possível na sua escola.
            <small>Preencha os dados abaixo para continuar.</small>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Card: conteúdo em coluna central (sem div vazia = sem retângulo branco)
    col_left, col_center, col_right = st.columns([1, 4, 1])
    with col_center:
        with st.expander("🔧 Sou administrador da plataforma", expanded=False):
            st.caption("O termo de uso é editado em **Admin → Termo de Uso** após o login.")
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
                            st.warning("Nenhum admin cadastrado. Criar no Supabase (segurança).")
                            st.caption("Execute supabase/migrations/00013_seed_admin.sql")
                            st.code(
                                "CREATE EXTENSION IF NOT EXISTS pgcrypto;\n\n"
                                "INSERT INTO platform_admins (email, password_hash, nome)\n"
                                "VALUES ('seu@email.com', crypt('SuaSenha123', gen_salt('bf')), 'Seu Nome')\n"
                                "ON CONFLICT (email) DO NOTHING;",
                                language="sql",
                            )
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
                        st.error("Não foi possível entrar. Verifique sua conexão.")
            st.caption("Admin cria escolas, gera PIN e gerencia masters. Primeiro admin: criar no Supabase.")

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
                        st.error("Email ou senha incorretos. Verifique e tente novamente.")
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
                            try:
                                from services.admin_service import get_workspace
                                ws = get_workspace(str(ws_id))
                                if ws is not None and ws.get("active") is False:
                                    st.error("Escola desativada. Entre em contato com o administrador da plataforma.")
                                else:
                                    _try_init_supabase_client_into_session()
                                    st.session_state.workspace_id = ws_id
                                    st.session_state.workspace_name = ws_name
                                    st.session_state.enabled_modules = ws.get("enabled_modules") if ws else None
                                    st.session_state.autenticado = True
                                    st.session_state.usuario_cargo = "Usuário"
                                    st.session_state.user_role = "master" if role == "master" else "member"
                                    if hasattr(ou, "track_usage_event"):
                                        try:
                                            event_name = "login_master_success" if role == "master" else "login_member_success"
                                            ou.track_usage_event(event_name, source="login_view", metadata={"email": user.get("email")})
                                        except Exception:
                                            pass
                                    st.rerun()
                            except Exception:
                                _try_init_supabase_client_into_session()
                                st.session_state.workspace_id = ws_id
                                st.session_state.workspace_name = ws_name
                                st.session_state.enabled_modules = None
                                st.session_state.autenticado = True
                                st.session_state.usuario_cargo = "Usuário"
                                st.session_state.user_role = "master" if role == "master" else "member"
                                st.rerun()
                        else:
                            st.error("Email ou senha incorretos. Verifique e tente novamente.")
                except Exception as e:
                    st.error("Não foi possível entrar. Verifique sua conexão e tente novamente.")

        # Modo demo: quando ENV=TESTE e Supabase não configurado (teste local de UI)
        try:
            from supabase_client import has_supabase_keys
            _sb_ok = has_supabase_keys()
        except Exception:
            _sb_ok = True
        if _env() == "TESTE" and not _sb_ok:
            st.markdown("---")
            st.caption("🔧 Sem Supabase configurado? Use o modo demo para testar a interface:")
            if st.button("Entrar em modo demo (teste de interface)", key="btn_demo", use_container_width=True, type="secondary"):
                st.session_state.autenticado = True
                st.session_state.accepted_terms = True
                st.session_state.modo_demo = True
                st.session_state.workspace_id = "demo"
                st.session_state.workspace_name = "Demo"
                st.session_state.usuario_nome = "Usuário Demo"
                st.session_state.member = {
                    "nome": "Demo", "email": "demo@local",
                    "can_gestao": True, "can_estudantes": True, "can_pei": True,
                    "can_paee": True, "can_hub": True, "can_diario": True, "can_avaliacao": True,
                }
                st.session_state.is_platform_admin = False
                st.session_state.user_role = "master"
                st.rerun()

    st.markdown(
        f'<div class="login-footer">Acesso seguro • RPC: {RPC_NAME}</div>',
        unsafe_allow_html=True
    )
    st.markdown("</div>", unsafe_allow_html=True)  # Fim wrap
