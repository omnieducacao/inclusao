"""
Painel do Administrador da Plataforma.
Cria escolas (workspaces + PIN), gerencia masters (alterar senha, excluir usuários).
"""
import streamlit as st
import os
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import omni_utils as ou
from services.admin_service import (
    list_workspaces,
    create_workspace,
    list_platform_admins,
    update_workspace_master_password,
    create_workspace_master_for_workspace,
)
from services.members_service import list_members, get_workspace_master, delete_member_permanently

try:
    from ui_lockdown import hide_streamlit_chrome_if_needed, hide_default_sidebar_nav
    hide_streamlit_chrome_if_needed()
    hide_default_sidebar_nav()
except Exception:
    pass

st.set_page_config(
    page_title="Omnisfera | Admin Plataforma",
    page_icon="🔧",
    layout="wide",
    initial_sidebar_state="collapsed",
)

ou.ensure_state()

if not st.session_state.get("autenticado") or not st.session_state.get("is_platform_admin"):
    st.error("🔒 Acesso restrito. Entre como administrador da plataforma.")
    st.info("Na tela de login, expanda **Sou administrador da plataforma** e use email + senha.")
    st.stop()

# Header simples
st.markdown("""
<style>
header[data-testid="stHeader"] { visibility: hidden !important; height: 0 !important; }
.block-container { padding-top: 1rem !important; }
.admin-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #1E293B; color: white; border-radius: 12px; margin-bottom: 24px; }
.admin-bar h1 { margin: 0; font-size: 1.3rem; }
.admin-bar a { color: #94A3B8; text-decoration: none; font-size: 0.9rem; }
.admin-bar a:hover { color: white; }
</style>
<div class="admin-bar">
  <h1>🔧 Admin Plataforma Omnisfera</h1>
  <a href="/?omni_logout=1" target="_self">🚪 Sair</a>
</div>
""", unsafe_allow_html=True)

ws_id = st.session_state.get("workspace_id")
ws_name = st.session_state.get("workspace_name", "")

# --- 1. Criar nova escola ---
st.markdown("### ➕ Nova escola")
with st.form("form_nova_escola"):
    nome_escola = st.text_input("Nome da escola", placeholder="Ex: Escola Municipal XYZ")
    if st.form_submit_button("Criar escola e gerar PIN"):
        if nome_escola and nome_escola.strip():
            try:
                ws, pin = create_workspace(nome_escola.strip())
                if ws:
                    st.success(f"✅ Escola **{ws.get('name')}** criada! PIN: **{pin}** — Guarde este PIN.")
                    st.balloons()
                    st.rerun()
                else:
                    st.error(f"Erro: {pin}")
            except Exception as e:
                st.error(str(e))
        else:
            st.warning("Informe o nome da escola.")

# --- 2. Lista de escolas ---
st.markdown("### 📋 Escolas cadastradas")
try:
    workspaces = list_workspaces()
except Exception as e:
    st.warning(f"Não foi possível listar escolas. Verifique se a tabela workspaces existe. {e}")
    workspaces = []

if not workspaces:
    st.info("Nenhuma escola cadastrada. Crie a primeira acima.")
else:
    for ws in workspaces:
        wid = ws.get("id")
        wname = ws.get("name", "Sem nome")
        wpin = ws.get("pin", "")
        with st.expander(f"🏫 {wname} — PIN: {wpin}", expanded=False):
            col1, col2 = st.columns(2)
            with col1:
                st.markdown("**Master**")
                try:
                    master = get_workspace_master(wid)
                except Exception:
                    master = None
                if master:
                    st.caption(f"Email: {master.get('email')}")
                    with st.form(f"form_alt_senha_{wid}"):
                        nova_senha = st.text_input("Nova senha master", type="password", key=f"np_{wid}")
                        if st.form_submit_button("Alterar senha"):
                            if nova_senha and len(nova_senha) >= 4:
                                ok, err = update_workspace_master_password(wid, nova_senha)
                                if ok:
                                    st.success("Senha alterada.")
                                    st.rerun()
                                else:
                                    st.error(err or "Erro ao alterar.")
                            else:
                                st.warning("Senha mín. 4 caracteres.")
                else:
                    st.caption("Master não configurado.")
                    with st.form(f"form_criar_master_{wid}"):
                        m_nome = st.text_input("Nome", key=f"mn_{wid}")
                        m_email = st.text_input("Email", key=f"me_{wid}")
                        m_senha = st.text_input("Senha", type="password", key=f"ms_{wid}")
                        if st.form_submit_button("Criar master"):
                            if m_nome and m_email and m_senha:
                                _, err = create_workspace_master_for_workspace(wid, m_email, m_senha, m_nome)
                                if err:
                                    st.error(err)
                                else:
                                    st.success("Master criado.")
                                    st.rerun()
            with col2:
                st.markdown("**Usuários**")
                try:
                    members = list_members(wid)
                except Exception:
                    members = []
                for m in members:
                    mid = m.get("id")
                    m_nome = m.get("nome", "")
                    m_email = m.get("email", "")
                    st.caption(f"{m_nome} — {m_email}")
                    if st.button("Excluir", key=f"del_{mid}"):
                        if delete_member_permanently(mid):
                            st.success("Excluído.")
                            st.rerun()
                        else:
                            st.error("Erro ao excluir.")
