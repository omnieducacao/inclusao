# pages/6_Gestao_Usuarios.py
"""
Gestão de Usuários do Workspace.
Master atribui permissões por página e vínculos (turma ou tutor).
"""
import streamlit as st
import os
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import omni_utils as ou
from services.members_service import (
    list_members,
    create_member,
    update_member,
    deactivate_member,
    get_class_assignments,
    get_student_links,
)

try:
    from ui_lockdown import hide_streamlit_chrome_if_needed, hide_default_sidebar_nav
    hide_streamlit_chrome_if_needed()
    hide_default_sidebar_nav()
except Exception:
    pass

st.set_page_config(
    page_title="Omnisfera | Gestão de Usuários",
    page_icon="omni_icone.png",
    layout="wide",
    initial_sidebar_state="collapsed",
)

ou.ensure_state()

if not st.session_state.get("autenticado") or not st.session_state.get("workspace_id"):
    st.error("🔒 Acesso restrito. Faça login.")
    st.stop()

# Só quem tem can_gestao ou não tem member (acesso total) pode ver esta página
from ui.permissions import get_member_from_session, can_access
if not can_access("gestao"):
    st.error("🔒 Você não tem permissão para acessar a Gestão de Usuários.")
    st.info("Entre em contato com o responsável pela escola para solicitar acesso.")
    st.stop()

ou.render_omnisfera_header()
ou.render_navbar(active_tab="Gestão de Usuários")
ou.inject_compact_app_css()
ou.inject_loading_overlay_css()

# Layout
st.markdown("""
<style>
header[data-testid="stHeader"] { visibility: hidden !important; height: 0 !important; }
.block-container { padding-top: 1rem !important; }
.mod-card-wrapper { margin-bottom: 20px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #E2E8F0; }
.mod-card-rect { background: white; padding: 20px; display: flex; align-items: center; }
.mod-bar { width: 6px; height: 60px; background: #6366F1; border-radius: 4px; margin-right: 16px; }
.mod-title { font-weight: 800; font-size: 1.1rem; color: #1E293B; }
.mod-desc { font-size: 0.85rem; color: #64748B; margin-top: 4px; }
.member-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #F1F5F9; background: white; }
.member-row:hover { background: #F8FAFC; }
.badge-perm { font-size: 0.7rem; padding: 2px 6px; border-radius: 6px; margin-right: 4px; background: #E0F2FE; color: #0284C7; }
</style>
""", unsafe_allow_html=True)

ws_id = st.session_state.get("workspace_id")
ws_name = st.session_state.get("workspace_name", "Workspace")
hora = datetime.now(ZoneInfo("America/Sao_Paulo")).hour
saudacao = "Bom dia" if 5 <= hora < 12 else "Boa tarde" if 12 <= hora < 18 else "Boa noite"
user_first = (st.session_state.get("usuario_nome") or "Visitante").split()[0]

# Hero
st.markdown(f"""
<div class="mod-card-wrapper">
    <div class="mod-card-rect">
        <div class="mod-bar"></div>
        <div>
            <div class="mod-title">Gestão de Usuários</div>
            <div class="mod-desc">{saudacao}, <strong>{user_first}</strong>! Cadastre e gerencie os usuários do workspace <strong>{ws_name}</strong>. Atribua permissões por página e vínculos com alunos.</div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Carregar membros
try:
    members = list_members(ws_id)
except Exception as e:
    st.warning(f"Tabela workspace_members ainda não existe. Execute a migration em supabase/migrations/00006_workspace_members_gestao_usuarios.sql no Supabase. Detalhes: {e}")
    st.stop()

# Formulário novo usuário
with st.expander("➕ Novo usuário", expanded=st.session_state.get("gestao_show_form", False)):
    with st.form("form_novo_usuario"):
        col1, col2 = st.columns(2)
        with col1:
            nome = st.text_input("Nome *", placeholder="Nome completo")
            email = st.text_input("Email *", placeholder="email@escola.com")
            telefone = st.text_input("Telefone", placeholder="(11) 99999-9999")
        with col2:
            st.markdown("**Páginas que pode acessar**")
            can_estudantes = st.checkbox("Estudantes", help="Cadastro de alunos")
            can_pei = st.checkbox("PEI (Estratégias)", help="Criar/editar PEI")
            can_paee = st.checkbox("PAEE", help="Plano de Ação AEE")
            can_hub = st.checkbox("Hub de Recursos", help="Recursos pedagógicos")
            can_diario = st.checkbox("Diário de Bordo", help="Registro de sessões")
            can_avaliacao = st.checkbox("Avaliação", help="Monitoramento e evolução")
            can_gestao = st.checkbox("Gestão de Usuários", help="Cadastrar outros usuários")

        link_type = st.selectbox("Vínculo com alunos", ["todos", "turma", "tutor"], format_func=lambda x: {"todos": "Todos (coordenação/AEE)", "turma": "Por turma (série + turma)", "tutor": "Por vínculo (alunos específicos)"}[x])
        class_assignments = []
        student_ids = []
        if link_type == "turma":
            st.markdown("**Turmas em que leciona** (ex: 7º ano turma A)")
            n_turmas = st.number_input("Quantidade de turmas", min_value=1, max_value=10, value=1)
            for i in range(n_turmas):
                c1, c2 = st.columns(2)
                with c1:
                    grade = st.text_input(f"Série/Ano {i+1}", placeholder="7 ou 1EM", key=f"g_{i}")
                with c2:
                    cg = st.text_input(f"Turma {i+1}", placeholder="A ou 1", key=f"cg_{i}")
                if grade and cg:
                    class_assignments.append({"grade": grade.strip(), "class_group": cg.strip()})
        elif link_type == "tutor":
            # Carregar alunos para multiselect
            try:
                import requests
                base = ou.get_setting("SUPABASE_URL", "").rstrip("/")
                r = requests.get(f"{base}/rest/v1/students?workspace_id=eq.{ws_id}&select=id,name,grade,class_group", headers=ou._headers(), timeout=10)
                alunos_raw = r.json() if r.status_code == 200 else []
            except Exception:
                alunos_raw = []
            alunos_opts = {f"{a.get('name','')} ({a.get('grade','')} - {a.get('class_group','')})": a.get("id") for a in alunos_raw if a.get("id")}
            selecionados = st.multiselect("Alunos de que é tutor", list(alunos_opts.keys()))
            student_ids = [alunos_opts[k] for k in selecionados if k in alunos_opts]

        submitted = st.form_submit_button("Salvar")
        if submitted:
            if not nome or not email:
                st.error("Nome e email são obrigatórios.")
            else:
                member, err = create_member(
                    workspace_id=ws_id,
                    nome=nome,
                    email=email,
                    telefone=telefone,
                    can_estudantes=can_estudantes,
                    can_pei=can_pei,
                    can_paee=can_paee,
                    can_hub=can_hub,
                    can_diario=can_diario,
                    can_avaliacao=can_avaliacao,
                    can_gestao=can_gestao,
                    link_type=link_type,
                    class_assignments=class_assignments if link_type == "turma" else None,
                    student_ids=student_ids if link_type == "tutor" else None,
                )
                if err:
                    st.error(f"Erro ao salvar: {err}")
                else:
                    st.success(f"Usuário {nome} cadastrado. Peça para acessar com PIN da escola e selecionar o email no login.")
                    st.session_state["gestao_show_form"] = False
                    st.rerun()

# Lista de membros
st.markdown("### 👥 Usuários cadastrados")
if not members:
    st.info("Nenhum usuário cadastrado. Use o formulário acima para adicionar.")
else:
    for m in members:
        if not m.get("active", True):
            continue
        perms = []
        if m.get("can_estudantes"): perms.append("Estudantes")
        if m.get("can_pei"): perms.append("PEI")
        if m.get("can_paee"): perms.append("PAEE")
        if m.get("can_hub"): perms.append("Hub")
        if m.get("can_diario"): perms.append("Diário")
        if m.get("can_avaliacao"): perms.append("Avaliação")
        if m.get("can_gestao"): perms.append("Gestão")
        link_txt = m.get("link_type", "todos")
        if link_txt == "turma":
            assign = get_class_assignments(m.get("id"))
            link_txt = ", ".join(f"{a.get('grade')}º {a.get('class_group')}" for a in assign) or "—"
        elif link_txt == "tutor":
            links = get_student_links(m.get("id"))
            link_txt = f"{len(links)} aluno(s)"
        with st.container():
            col1, col2, col3 = st.columns([2, 2, 1])
            with col1:
                st.markdown(f"**{m.get('nome','')}**")
                st.caption(f"{m.get('email','')} · {m.get('telefone','') or '—'}")
            with col2:
                st.markdown(" ".join([f"<span class='badge-perm'>{p}</span>" for p in perms]) or "—", unsafe_allow_html=True)
                st.caption(f"Vínculo: {link_txt}")
            with col3:
                if st.button("Desativar", key=f"desativar_{m.get('id')}", type="secondary"):
                    if deactivate_member(m.get("id")):
                        st.success("Desativado.")
                        st.rerun()
                    else:
                        st.error("Erro ao desativar.")
    st.caption("Para editar um usuário, desative e cadastre novamente com os dados corretos. (Edição em breve)")
