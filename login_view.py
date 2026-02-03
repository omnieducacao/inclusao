# login_view.py
import os
import base64
from datetime import datetime
import streamlit as st

# ✅ IMPORTS SUPABASE (somente o que existe com certeza no seu supabase_client.py)
from supabase_client import rpc_workspace_from_pin, RPC_NAME


# ==============================================================================
# Ambiente / Chrome
# ==============================================================================
def _env():
    try:
        return str(st.secrets.get("ENV", "")).upper()
    except Exception:
        return ""


def hide_streamlit():
    # Se ENV="TESTE" no secrets, NÃO esconde o menu (pra debugar)
    if _env() == "TESTE":
        return

    st.markdown(
        """
        <style>
            /* Esconde todos os menus e controles do Streamlit */
            #MainMenu { visibility: hidden !important; display: none !important; }
            footer { visibility: hidden !important; display: none !important; }
            header[data-testid="stHeader"] { display: none !important; visibility: hidden !important; }
            [data-testid="stToolbar"] { visibility: hidden !important; display: none !important; }
            [data-testid="stDecoration"] { display: none !important; visibility: hidden !important; }
            [data-testid="stStatusWidget"] { display: none !important; visibility: hidden !important; }
            [data-testid="stDeployButton"] { display: none !important; visibility: hidden !important; }
            [data-testid="stSidebar"] { display: none !important; visibility: hidden !important; }
            section[data-testid="stSidebar"] { display: none !important; visibility: hidden !important; }
            [data-testid="stSidebarNav"] { display: none !important; visibility: hidden !important; }
            button[data-testid="collapsedControl"] { display: none !important; visibility: hidden !important; }
            button[title="View app source"] { display: none !important; visibility: hidden !important; }
            button[title="Get help"] { display: none !important; visibility: hidden !important; }
            button[title="Report a bug"] { display: none !important; visibility: hidden !important; }
            button[title="Settings"] { display: none !important; visibility: hidden !important; }
            .stDeployButton { display: none !important; visibility: hidden !important; }
            #stDecoration { display: none !important; visibility: hidden !important; }
            .stAppToolbar { display: none !important; visibility: hidden !important; }
            [data-testid="stAppViewContainer"] > header { display: none !important; visibility: hidden !important; }
            [data-testid="stHeader"] { display: none !important; visibility: hidden !important; }
            [data-testid="stToolbarActions"] { display: none !important; visibility: hidden !important; }
            [data-testid="stToolbar"] > div { display: none !important; visibility: hidden !important; }
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

        /* Container Centralizado */
        .wrap {
            max-width: 620px;
            margin: auto;
            padding-top: 30px;
            padding-bottom: 40px;
        }
        
        /* Remove espaço extra do Streamlit */
        .block-container {
            padding-top: 1rem !important;
            max-width: 620px !important;
            margin: 0 auto !important;
        }
        
        /* Centraliza e limita largura dos inputs */
        .element-container {
            max-width: 100% !important;
        }

        .brand {
            display:flex;
            flex-direction: column;
            align-items:center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 24px;
        }

        .logoSpin img {
            width: 70px;
            animation: spin 12s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .logoText img {
            height: 38px;
        }

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

        /* Card de Login */
        .card {
            background: white;
            border-radius: 20px;
            border: 1px solid #E2E8F0;
            padding: 28px;
            box-shadow: 0 10px 40px rgba(15,23,42,.06);
        }

        /* Responsivo - Mobile */
        @media (max-width: 768px) {
            .wrap { max-width: 92vw; }
        }

        /* Inputs Elegantes */
        div[data-testid="stTextInput"] {
            max-width: 100% !important;
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

        /* Termo de Confidencialidade */
        .termo-box {
            background-color: #F8FAFC;
            padding: 15px;
            border-radius: 12px;
            height: 120px;
            overflow-y: auto;
            font-size: 13px;
            border: 1px solid #E2E8F0;
            margin: 20px 0 15px 0;
            text-align: justify;
            color: #475569;
            line-height: 1.5;
        }

        .err {
            margin-top: 12px;
            padding: 12px;
            border-radius: 14px;
            background: #FEE2E2;
            border: 1px solid #FCA5A5;
            color: #7F1D1D;
            font-weight: 900;
            text-align: center;
        }

        .warn {
            margin-top: 12px;
            padding: 12px;
            border-radius: 14px;
            background: #FEF3C7;
            border: 1px solid #FDE68A;
            color: #92400E;
            font-weight: 900;
            text-align: center;
        }

        /* Botão - Cor padrão (azul marinho) */
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

    # Container Principal
    st.markdown('<div class="wrap">', unsafe_allow_html=True)

    # 1. Logo Centralizada (Ícone acima do Texto)
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
        unsafe_allow_html=True
    )

    # 2. Cartão de Login
    st.markdown('<div class="card">', unsafe_allow_html=True)

    # Opção ADMIN (entrada só com email + senha, sem PIN)
    with st.expander("🔧 Sou administrador da plataforma", expanded=False):
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
                        st.warning("Nenhum admin cadastrado. O primeiro admin deve ser criado no Supabase (segurança).")
                        st.caption("No Supabase → SQL Editor, execute o arquivo supabase/migrations/00013_seed_admin.sql após substituir email, senha e nome.")
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
                        st.rerun()
                    else:
                        st.error("Email ou senha incorretos.")
                except Exception as e:
                    st.error(str(e))
        st.caption("Admin cria escolas, gera PIN e gerencia masters. Primeiro admin: criar no Supabase.")

    # Entrada principal: nome, cargo, PIN (como era antes)
    nome = st.text_input("Seu nome", placeholder="Nome completo", key="login_nome")
    cargo = st.text_input("Sua função", placeholder="Ex: Professor, Coordenador", key="login_cargo")
    pin = st.text_input("PIN da Escola", type="password", placeholder="****", key="login_pin")

    # Segunda opção: entrada com email + senha (para escolas com Gestão de Usuários)
    with st.expander("Minha escola usa Gestão de Usuários (entrar com email e senha)", expanded=False):
        email = st.text_input("Seu email", placeholder="email@escola.com", key="login_email")
        senha = st.text_input("Sua senha", type="password", placeholder="****", key="login_senha")
        st.caption("Preencha se sua escola cadastrou usuários. PIN + email + senha.")

    # 3. Termo de Confidencialidade
    st.markdown(
        """
        <div class="termo-box">
            <strong>1. Confidencialidade:</strong> O usuário compromete-se a não inserir dados reais sensíveis (nomes completos, documentos) que identifiquem estudantes, exceto em ambiente seguro autorizado pela instituição.<br><br>
            <strong>2. Natureza Beta:</strong> O sistema está em evolução constante. Algumas funcionalidades podem sofrer alterações.<br><br>
            <strong>3. Responsabilidade:</strong> As sugestões geradas pela IA servem como apoio pedagógico e devem ser sempre validadas por um profissional humano qualificado.<br><br>
            <strong>4. Acesso:</strong> O PIN de acesso é pessoal e intransferível dentro da organização.
        </div>
        """,
        unsafe_allow_html=True
    )

    aceitar = st.checkbox("Li e aceito o Termo de Confidencialidade")
    st.markdown("<div style='height:15px'></div>", unsafe_allow_html=True)

    if st.button("Validar e entrar", use_container_width=True, type="primary"):
        if not (nome and cargo and aceitar and pin):
            st.markdown("<div class='err'>Preencha todos os campos e aceite o termo.</div>", unsafe_allow_html=True)
            st.stop()

        pin = pin.strip().upper()
        if len(pin) == 8 and "-" not in pin:
            pin = pin[:4] + "-" + pin[4:]

        # Validação via RPC
        ws = rpc_workspace_from_pin(pin)

        if not ws:
            st.markdown("<div class='err'>PIN inválido ou escola não encontrada.</div>", unsafe_allow_html=True)
        else:
            ws_id = ws.get("id") or ws.get("workspace_id")
            ws_name = ws.get("name") or ws.get("workspace_name") or ""
            st.session_state.workspace_id = ws_id
            st.session_state.workspace_name = ws_name
            st.session_state.autenticado = True

            # Inicializa Supabase
            ok_sb, err_sb = _try_init_supabase_client_into_session()
            if (not ok_sb) and (_env() == "TESTE"):
                st.markdown(
                    f"<div class='warn'>Aviso (TESTE): não consegui iniciar supabase-py em st.session_state['sb'].<br>{err_sb}</div>",
                    unsafe_allow_html=True
                )

            # Verifica master (usuário root do workspace) ou membros
            master = _get_workspace_master(ws_id) if ok_sb else None
            members = _list_workspace_members(ws_id) if ok_sb else []
            members = [m for m in members if m.get("active", True)]

            if master:
                email_val = (email or "").strip().lower()
                if not email_val or not senha:
                    st.markdown("<div class='err'>Este workspace tem usuário master. Expanda a opção acima e informe email e senha.</div>", unsafe_allow_html=True)
                    st.stop()
                try:
                    from services.members_service import verify_workspace_master
                    if not verify_workspace_master(ws_id, email_val, senha):
                        st.markdown("<div class='err'>Email ou senha incorretos. Tente novamente.</div>", unsafe_allow_html=True)
                        st.stop()
                except Exception:
                    st.markdown("<div class='err'>Erro ao verificar. Tente novamente.</div>", unsafe_allow_html=True)
                    st.stop()
                st.session_state.member = {"nome": master.get("nome"), "email": master.get("email"), "can_gestao": True, "can_estudantes": True, "can_pei": True, "can_paee": True, "can_hub": True, "can_diario": True, "can_avaliacao": True}
                st.session_state.usuario_nome = master.get("nome", nome)
                st.session_state.usuario_cargo = cargo
            elif members:
                email_val = (email or "").strip().lower()
                if not email_val:
                    st.markdown("<div class='err'>Sua escola usa Gestão de Usuários. Expanda a opção acima e informe email e senha cadastrados.</div>", unsafe_allow_html=True)
                    st.stop()
                member = next((m for m in members if (m.get("email") or "").strip().lower() == email_val), None)
                if not member:
                    st.markdown("<div class='err'>Email não cadastrado nesta escola. Entre em contato com o responsável.</div>", unsafe_allow_html=True)
                    st.stop()
                try:
                    from services.members_service import verify_member_password
                    if not verify_member_password(ws_id, email_val, senha or ""):
                        st.markdown("<div class='err'>Senha incorreta. Tente novamente ou entre em contato com o responsável.</div>", unsafe_allow_html=True)
                        st.stop()
                except Exception:
                    st.markdown("<div class='err'>Erro ao verificar senha. Tente novamente.</div>", unsafe_allow_html=True)
                    st.stop()
                st.session_state.member = member
                st.session_state.usuario_nome = member.get("nome", nome)
                st.session_state.usuario_cargo = cargo
            else:
                # Forma antiga: sem master nem membros → entrada só com PIN (acesso total)
                st.session_state.member = None
                st.session_state.usuario_nome = nome
                st.session_state.usuario_cargo = cargo

            st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)  # Fim Card

    # Info técnica discreta
    st.markdown(
        f"""
        <div style="text-align:center; margin-top:20px; color:#CBD5E1; font-size:11px; font-weight:500;">
            SECURE LOGIN • RPC: {RPC_NAME}
        </div>
        """,
        unsafe_allow_html=True
    )

    st.markdown("</div>", unsafe_allow_html=True)  # Fim Wrap
