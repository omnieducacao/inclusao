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
    get_platform_config,
    set_platform_config,
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

# Header e navbar padrão (igual às outras páginas)
ou.render_omnisfera_header()
ou.render_navbar(active_tab="Admin Plataforma")

st.markdown("### 🔧 Admin Plataforma Omnisfera")
st.markdown("---")

# Garantir que as abas internas sejam visíveis
st.markdown("""
<style>
[data-testid="stTabs"] { margin-top: 1rem !important; }
[data-testid="stTabs"] [data-baseweb="tab-list"] { gap: 8px !important; }
</style>
""", unsafe_allow_html=True)

ws_id = st.session_state.get("workspace_id")
ws_name = st.session_state.get("workspace_name", "")

# Abas do Admin
tab_escolas, tab_termo, tab_dashboard, tab_bugs = st.tabs(["🏫 Escolas", "📜 Termo de Uso", "📊 Dashboard", "🐛 Bugs e Erros"])

# --- Tab Termo de Uso ---
with tab_termo:
    st.markdown("### Termo de Uso e Confidencialidade")
    st.caption("Este texto aparece no primeiro acesso de cada usuário após o login.")
    try:
        terms_atual = get_platform_config("terms_of_use")
    except Exception:
        terms_atual = ""
    if not terms_atual:
        terms_atual = (
            "1. Uso profissional: A Omnisfera é uma ferramenta profissional de apoio à inclusão.\n\n"
            "2. Confidencialidade: É proibido inserir dados pessoais sensíveis de estudantes.\n\n"
            "3. Responsabilidade: Recomendações da IA devem ser validadas por profissionais.\n\n"
            "4. Segurança: Credenciais são pessoais e intransferíveis.\n\n"
            "5. Conformidade: O uso deve seguir políticas e legislação vigente."
        )
    with st.form("form_termo"):
        terms_edit = st.text_area("Texto do termo", value=terms_atual, height=280, key="admin_terms_edit")
        if st.form_submit_button("Salvar termo"):
            ok, err = set_platform_config("terms_of_use", terms_edit)
            if ok:
                st.success("Termo salvo. Os usuários verão a nova versão no próximo primeiro acesso.")
                st.rerun()
            else:
                st.error(f"Erro ao salvar: {err}")

# --- Tab Dashboard (placeholder) ---
with tab_dashboard:
    st.info("📊 Dashboard de uso e custos em construção. Em breve: PEIs gerados, chamadas por motor de IA, custos estimados.")

# --- Tab Bugs (placeholder) ---
with tab_bugs:
    st.info("🐛 Mapeamento de inconsistências e erros em construção. Em breve: lista de erros, status, análise.")

# --- Tab Escolas ---
with tab_escolas:
    SEGMENT_OPTIONS = {
        "EI": "Educação Infantil",
        "EF_AI": "Ensino Fundamental — Anos Iniciais",
        "EF_AF": "Ensino Fundamental — Anos Finais",
        "EM": "Ensino Médio",
    }
    ENGINE_OPTIONS = {
        "red": "Omnisfera Red",
        "green": "Omnisfera Green",
        "blue": "Omnisfera Blue",
    }

    st.markdown("### ➕ Nova escola")
    with st.form("form_nova_escola"):
        nome_escola = st.text_input("Nome da escola", placeholder="Ex: Escola Municipal XYZ")
        segmentos_escola = st.multiselect(
            "Segmentos atendidos",
            options=list(SEGMENT_OPTIONS.keys()),
            format_func=lambda k: SEGMENT_OPTIONS.get(k, k),
            placeholder="Selecione os segmentos",
        )
        motores_escola = st.multiselect(
            "Motores de IA disponíveis",
            options=list(ENGINE_OPTIONS.keys()),
            format_func=lambda k: ENGINE_OPTIONS.get(k, k),
            placeholder="Selecione os motores",
        )
        if st.form_submit_button("Criar escola e gerar PIN"):
            if nome_escola and nome_escola.strip():
                if not segmentos_escola:
                    st.warning("Selecione ao menos um segmento.")
                elif not motores_escola:
                    st.warning("Selecione ao menos um motor de IA.")
                else:
                    try:
                        ws, pin = create_workspace(nome_escola.strip(), segmentos_escola, motores_escola)
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
            wpin = ws.get("pin") or ws.get("pin_code") or ws.get("code") or "—"
            wsegments = ws.get("segments") or []
            wengines = ws.get("ai_engines") or []
            with st.expander(f"🏫 {wname} — PIN: {wpin}", expanded=False):
                if wsegments:
                    seg_labels = [SEGMENT_OPTIONS.get(s, s) for s in wsegments]
                    st.caption(f"Segmentos: {', '.join(seg_labels)}")
                if wengines:
                    eng_labels = [ENGINE_OPTIONS.get(e, e) for e in wengines]
                    st.caption(f"Motores IA: {', '.join(eng_labels)}")
                col1, col2 = st.columns(2)
                with col1:
                    st.markdown("**Master**")
                    try:
                        master = get_workspace_master(wid)
                    except Exception:
                        master = None
                    if master:
                        m_email = master.get("email", "")
                        m_telefone = master.get("telefone", "")
                        m_cargo = master.get("cargo", "")
                        st.caption(f"Email: {m_email}")
                        if m_telefone:
                            st.caption(f"Telefone: {m_telefone}")
                        if m_cargo:
                            st.caption(f"Cargo: {m_cargo}")
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
                            m_nome = st.text_input("Nome *", placeholder="Nome completo", key=f"mn_{wid}")
                            m_telefone = st.text_input("Telefone", placeholder="(11) 99999-9999", key=f"mt_{wid}")
                            m_email = st.text_input("Email *", placeholder="email@escola.com", key=f"me_{wid}")
                            m_senha = st.text_input("Senha *", type="password", placeholder="Mín. 4 caracteres", key=f"ms_{wid}")
                            m_cargo = st.text_input("Cargo *", placeholder="Ex: Coordenador, Diretor", key=f"mc_{wid}")
                            if st.form_submit_button("Criar master"):
                                if m_nome and m_email and m_senha and m_cargo:
                                    _, err = create_workspace_master_for_workspace(
                                        wid, m_email, m_senha, m_nome,
                                        telefone=m_telefone or "",
                                        cargo=m_cargo.strip(),
                                    )
                                    if err:
                                        st.error(err)
                                    else:
                                        st.success("Master criado.")
                                        st.rerun()
                                else:
                                    st.warning("Preencha Nome, Email, Senha e Cargo.")
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
                        m_cargo = m.get("cargo", "")
                        txt = f"{m_nome} — {m_email}"
                        if m_cargo:
                            txt += f" · {m_cargo}"
                        st.caption(txt)
                        if st.button("Excluir", key=f"del_{mid}"):
                            if delete_member_permanently(mid):
                                st.success("Excluído.")
                                st.rerun()
                            else:
                                st.error("Erro ao excluir.")
