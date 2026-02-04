# streamlit_app.py
import os
from typing import Optional

import streamlit as st

# Warmup: lê chaves Supabase o mais cedo possível (mitiga race no Streamlit Cloud cold start)
try:
    import omni_utils as _ou
    _ou.get_setting("SUPABASE_URL", "")
except Exception:
    pass

from login_view import render_login


def get_env() -> str:
    v = (os.environ.get("ENV") or "").strip()
    if v:
        return v.upper()
    try:
        v2 = st.secrets.get("ENV", None)
        return str(v2).strip().upper() if v2 else ""
    except Exception:
        return ""


ENV = get_env()

# Desabilita menu completamente se não estiver em TESTE
menu_items = {} if ENV != "TESTE" else None

st.set_page_config(
    page_title="Omnisfera | Ecossistema",
    page_icon="omni_icone.png" if os.path.exists("omni_icone.png") else "🌐",
    layout="wide",
    initial_sidebar_state="collapsed",
    menu_items=menu_items,
)

# Esconde menu do Streamlit (acesso a secrets) na página de abertura
if ENV != "TESTE":
    st.markdown(
        """
        <style>
          #MainMenu, [data-testid="stMainMenu"], .stMainMenu { display: none !important; visibility: hidden !important; }
          footer, header, [data-testid="stHeader"] { display: none !important; visibility: hidden !important; }
          [data-testid="stToolbar"], [data-testid="stToolbarActions"], [data-testid="stDecoration"] { display: none !important; visibility: hidden !important; }
          [data-testid="stSidebar"], section[data-testid="stSidebar"], [data-testid="stSidebarNav"] { display: none !important; visibility: hidden !important; }
          button[data-testid="collapsedControl"], button[aria-label*="Settings"], button[aria-label*="Menu"] { display: none !important; visibility: hidden !important; }
          button[title*="Settings"], button[title*="Manage"], button[title*="View app"], .stDeployButton { display: none !important; visibility: hidden !important; }
        </style>
        """,
        unsafe_allow_html=True,
    )


def acesso_bloqueado(msg: str):
    st.markdown(
        f"""
        <div style="
            max-width:520px;
            margin: 120px auto;
            padding: 28px;
            background: white;
            border-radius: 18px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 20px 40px rgba(15,82,186,0.12);
            text-align: center;
        ">
            <div style="font-size:2.2rem; margin-bottom:10px;">🔐</div>
            <div style="font-weight:900; font-size:1.1rem; margin-bottom:6px; color:#0f172a;">
                Acesso restrito
            </div>
            <div style="color:#4A5568; font-weight:700; font-size:0.95rem; margin-bottom:18px;">
                {msg}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.button("🔑 Voltar para o Login", use_container_width=True, type="primary"):
            # 1) limpa sessão
            for k in ["autenticado", "workspace_id", "workspace_name", "usuario_nome", "usuario_cargo", "member", "sb", "sb_error"]:
                st.session_state.pop(k, None)

            # 2) tenta ir para o começo (streamlit_app.py)
            try:
                st.switch_page("streamlit_app.py")
            except Exception:
                # 3) fallback SUPER confiável: link para raiz
                st.markdown(
                    """
                    <div style="text-align:center; margin-top:12px;">
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


# ------------------------------------------------------------------------------
# Logout via query param (?omni_logout=1) — direciona para login zerado
# ------------------------------------------------------------------------------
try:
    q = st.query_params
    if q.get("omni_logout") == "1":
        for k in ["autenticado", "workspace_id", "workspace_name", "usuario_nome", "usuario_cargo", "member", "sb", "sb_error", "last_activity", "is_platform_admin", "students_cache_invalid", "banco_estudantes", "accepted_terms", "user_role"]:
            st.session_state.pop(k, None)
        try:
            st.query_params.clear()
        except Exception:
            pass
        try:
            st.switch_page("streamlit_app.py")  # Redireciona para login zerado
        except Exception:
            st.rerun()
except Exception:
    pass

# ------------------------------------------------------------------------------
# Estado mínimo
# ------------------------------------------------------------------------------
if "autenticado" not in st.session_state:
    st.session_state.autenticado = False
if "workspace_id" not in st.session_state:
    st.session_state.workspace_id = None
if "workspace_name" not in st.session_state:
    st.session_state.workspace_name = None
if "is_platform_admin" not in st.session_state:
    st.session_state.is_platform_admin = False
if "accepted_terms" not in st.session_state:
    st.session_state.accepted_terms = False

HOME_PAGE = "pages/0_Home.py"
ADMIN_PAGE = "pages/8_Admin_Plataforma.py"


def _tela_erro_recarregar(msg: str = "Algo deu errado. Recarregue a página.", detalhe: Optional[str] = None):
    """Exibe mensagem amigável e botão Recarregar para evitar tela de crash do Streamlit."""
    st.markdown(
        f"""
        <div style="max-width:480px; margin:80px auto; padding:32px; background:white; border-radius:18px;
            border:1px solid #E2E8F0; box-shadow:0 20px 40px rgba(0,0,0,0.08); text-align:center;">
            <div style="font-size:2.5rem; margin-bottom:12px;">⚠️</div>
            <div style="font-weight:800; font-size:1.1rem; color:#1E293B; margin-bottom:8px;">{msg}</div>
            <div style="color:#64748B; font-size:0.9rem;">Clique em <strong>Recarregar</strong> abaixo para tentar novamente.</div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.button("🔄 Recarregar página", use_container_width=True, type="primary"):
            st.rerun()
    if detalhe and ENV == "TESTE":
        st.code(detalhe)
    st.stop()


# ------------------------------------------------------------------------------
# Router (com proteção para não quebrar a tela em produção)
# ------------------------------------------------------------------------------
try:
    if not st.session_state.autenticado:
        render_login()
    elif not st.session_state.get("accepted_terms"):
        terms_text = ""
        try:
            from services.admin_service import get_platform_config
            terms_text = (get_platform_config("terms_of_use") or "").strip()
        except Exception:
            pass
        if not terms_text:
            terms_text = (
                "1. Uso profissional: A Omnisfera é uma ferramenta profissional de apoio à inclusão e deve ser utilizada exclusivamente para fins educacionais e institucionais autorizados.\n\n"
                "2. Confidencialidade: É proibido inserir dados pessoais sensíveis de estudantes fora de ambientes autorizados pela instituição. O usuário se compromete a proteger qualquer informação acessada na plataforma.\n\n"
                "3. Responsabilidade: Recomendações e conteúdos gerados pela IA são auxiliares e devem ser validados por profissionais responsáveis. A decisão final é sempre humana.\n\n"
                "4. Segurança: Credenciais de acesso são pessoais e intransferíveis. Qualquer uso indevido deve ser comunicado à coordenação responsável.\n\n"
                "5. Conformidade: O uso deve seguir as políticas internas da escola, legislação vigente e boas práticas de proteção de dados."
            )
        import html
        terms_html = html.escape(terms_text).replace("\n", "<br>")
        st.markdown(
            f"""
        <div style="
            max-width:720px;
            margin: 80px auto;
            padding: 28px;
            background: white;
            border-radius: 18px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 20px 40px rgba(15,82,186,0.12);
        ">
            <div style="font-size:2.2rem; margin-bottom:10px;">🛡️</div>
            <div style="font-weight:900; font-size:1.2rem; margin-bottom:12px; color:#0f172a;">
                Termo de Uso e Confidencialidade (Profissional)
            </div>
            <div style="color:#334155; font-weight:600; font-size:0.96rem; line-height:1.55;">
                {terms_html}
            </div>
        </div>
        """,
            unsafe_allow_html=True,
        )
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            if st.button("Li e aceito. Continuar", use_container_width=True, type="primary"):
                st.session_state.accepted_terms = True
                try:
                    import omni_utils as ou  # lazy import para evitar ciclos
                    ou.track_usage_event("terms_accepted", source="terms_gate")
                except Exception:
                    pass
                st.rerun()
        st.stop()
    elif st.session_state.get("is_platform_admin"):
        # Admin da plataforma: vai direto para painel admin
        try:
            st.switch_page(ADMIN_PAGE)
        except Exception:
            st.switch_page("pages/8_Admin_Plataforma.py")
    else:
        # Se por algum motivo entrou sem workspace, força relogar
        if not st.session_state.workspace_id:
            st.session_state.autenticado = False
            st.warning("Workspace não encontrado. Faça login novamente.")
            render_login()
        else:
            # Modo demo: pula conexão Supabase (teste local de UI)
            if not st.session_state.get("modo_demo"):
                try:
                    from supabase_client import get_sb
                    get_sb()  # salva em st.session_state["sb"]
                except Exception as e:
                    st.error("Não foi possível conectar ao banco de dados. Tente recarregar a página.")
                    if ENV == "TESTE":
                        st.code(str(e))
                        st.caption("Use o botão 'Entrar em modo demo' na tela de login para testar a interface sem Supabase.")
                    st.stop()

            # Vai para Home real (multipage)
            st.switch_page(HOME_PAGE)

except Exception as e:
    err_str = str(e).strip()
    if "503" in err_str or "Service Unavailable" in err_str or "Connection failed with status 503" in err_str:
        _tela_erro_recarregar(
            msg="Serviço temporariamente indisponível. Tente novamente em alguns minutos.",
            detalhe=err_str if ENV == "TESTE" else None,
        )
    _tela_erro_recarregar(
        msg="Algo deu errado. Recarregue a página.",
        detalhe=err_str if ENV == "TESTE" else None,
    )
