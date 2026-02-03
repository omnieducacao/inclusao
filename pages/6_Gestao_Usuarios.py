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
    reactivate_member,
    delete_member_permanently,
    get_class_assignments,
    get_student_links,
    get_workspace_master,
    create_workspace_master,
)
from services.school_config_service import (
    list_school_years,
    list_classes,
    list_components,
    SEGMENTS,
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

# Configurar usuário master (para PIN que já existe, mas ainda não tem master)
try:
    master = get_workspace_master(ws_id)
except Exception:
    master = None

if not master:
    with st.expander("🔐 Configurar usuário master (para este PIN)", expanded=True):
        st.caption("Seu workspace usa login com PIN. Configure o **master** para ativar a Gestão de Usuários. Depois disso, o login exigirá email + senha.")
        with st.form("form_config_master"):
            m_nome = st.text_input("Nome do responsável *", placeholder="Nome completo")
            m_telefone = st.text_input("Telefone", placeholder="(11) 99999-9999")
            m_email = st.text_input("Email *", placeholder="email@escola.com")
            m_senha = st.text_input("Senha *", type="password", placeholder="Mínimo 4 caracteres")
            m_cargo = st.text_input("Cargo *", placeholder="Ex: Coordenador, Diretor")
            if st.form_submit_button("Cadastrar master"):
                if not m_nome or not m_email or not m_senha or not m_cargo:
                    st.error("Preencha Nome, Email, Senha e Cargo.")
                elif len(m_senha) < 4:
                    st.error("Senha deve ter no mínimo 4 caracteres.")
                else:
                    try:
                        result, err = create_workspace_master(ws_id, m_email, m_senha, m_nome, telefone=m_telefone or "", cargo=m_cargo.strip())
                        if err:
                            st.error(f"Erro: {err}")
                        else:
                            create_member(ws_id, m_nome, m_email, m_senha, telefone=m_telefone or "", cargo=m_cargo.strip(), can_gestao=True, can_estudantes=True, can_pei=True, can_paee=True, can_hub=True, can_diario=True, can_avaliacao=True, link_type="todos")
                            st.success("✅ Usuário master cadastrado! O login passará a exigir PIN + email + senha.")
                            st.rerun()
                    except Exception as ex:
                        st.error(str(ex))
else:
    st.caption("✅ Usuário master configurado. Login: PIN + email + senha.")

# Formulário novo usuário
with st.expander("➕ Novo usuário", expanded=st.session_state.get("gestao_show_form", False)):
    with st.form("form_novo_usuario"):
        col1, col2 = st.columns(2)
        with col1:
            nome = st.text_input("Nome *", placeholder="Nome completo")
            email = st.text_input("Email *", placeholder="email@escola.com")
            senha = st.text_input("Senha *", type="password", placeholder="Senha de acesso", help="O usuário usará email + senha no login.")
            telefone = st.text_input("Telefone", placeholder="(11) 99999-9999")
            cargo = st.text_input("Cargo", placeholder="Ex: Professor, Coordenador AEE")
        with col2:
            st.markdown("**Páginas que pode acessar**")
            can_estudantes = st.checkbox("Estudantes", help="Cadastro de alunos")
            can_pei = st.checkbox("PEI (Estratégias)", help="Criar/editar PEI")
            can_paee = st.checkbox("PAEE", help="Plano de Ação AEE")
            can_hub = st.checkbox("Hub de Recursos", help="Recursos pedagógicos")
            can_diario = st.checkbox("Diário de Bordo", help="Registro de sessões")
            can_avaliacao = st.checkbox("Avaliação", help="Monitoramento e evolução")
            can_gestao = st.checkbox("Gestão de Usuários", help="Cadastrar outros usuários")

        link_type = st.selectbox("Vínculo com alunos", ["todos", "turma", "tutor"], format_func=lambda x: {"todos": "Todos (coordenação/AEE)", "turma": "Por turma + componente curricular", "tutor": "Por vínculo (alunos específicos)"}[x])
        teacher_assignments = []
        student_ids = []
        if link_type == "turma":
            st.markdown("**Turmas e componentes** — Configure ano letivo e turmas em Configuração Escola antes.")
            try:
                years = list_school_years(ws_id)
                classes_all = list_classes(ws_id) if years else []
                components_all = list_components()
            except Exception:
                years, classes_all, components_all = [], [], []
            if not classes_all:
                st.caption("Nenhuma turma. Crie em Configuração Escola primeiro.")
            else:
                classes_opts = {f"{c.get('grade', {}).get('label', '')} - Turma {c.get('class_group','')}": c for c in classes_all if c.get("id")}
                comp_opts = {c.get("label", c.get("id", "")): c.get("id") for c in components_all} if components_all else {"Arte":"arte","Ciências":"ciencias","Geografia":"geografia","História":"historia","Língua Portuguesa":"lingua_portuguesa","Matemática":"matematica","Educação Física":"educacao_fisica","Língua Inglesa":"lingua_inglesa"}
                n_add = st.number_input("Quantos vínculos (turma + componente)?", min_value=1, max_value=20, value=1)
                for i in range(int(n_add)):
                    cc1, cc2 = st.columns(2)
                    with cc1:
                        cl_sel = st.selectbox(f"Turma {i+1}", list(classes_opts.keys()), key=f"cl_{i}")
                    with cc2:
                        comp_sel = st.selectbox(f"Componente {i+1}", list(comp_opts.keys()), key=f"comp_{i}")
                    if cl_sel and comp_sel:
                        cl = classes_opts.get(cl_sel)
                        comp_id = comp_opts.get(comp_sel)
                        if cl and comp_id:
                            teacher_assignments.append({"class_id": cl["id"], "component_id": comp_id})
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
            elif not senha or len(senha) < 4:
                st.error("Senha obrigatória com no mínimo 4 caracteres.")
            else:
                member, err = create_member(
                    workspace_id=ws_id,
                    nome=nome,
                    email=email,
                    password=senha,
                    telefone=telefone,
                    cargo=cargo or "",
                    can_estudantes=can_estudantes,
                    can_pei=can_pei,
                    can_paee=can_paee,
                    can_hub=can_hub,
                    can_diario=can_diario,
                    can_avaliacao=can_avaliacao,
                    can_gestao=can_gestao,
                    link_type=link_type,
                    teacher_assignments=teacher_assignments if link_type == "turma" else None,
                    student_ids=student_ids if link_type == "tutor" else None,
                )
                if err:
                    if "23505" in err and "workspace_id" in err and "email" in err:
                        st.error("Este email já está em uso. Role até **Usuários desativados** abaixo e exclua o usuário para liberar o email, ou use outro email.")
                    else:
                        st.error(f"Erro ao salvar: {err}")
                else:
                    st.success(f"Usuário {nome} cadastrado. Peça para acessar com PIN da escola + email + senha no login.")
                    st.session_state["gestao_show_form"] = False
                    st.rerun()

# Lista de membros
st.markdown("### 👥 Usuários cadastrados")
editing_id = st.session_state.get("gestao_editing_id")

if not members:
    st.info("Nenhum usuário cadastrado. Use o formulário acima para adicionar.")
else:
    for m in members:
        if not m.get("active", True):
            continue
        mid = m.get("id")
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
            assign = get_class_assignments(mid)
            link_txt = ", ".join(f"{a.get('grade','')}º {a.get('class_group','')}" for a in assign) or "—"
        elif link_txt == "tutor":
            links = get_student_links(mid)
            link_txt = f"{len(links)} aluno(s)"
        with st.container():
            col1, col2, col3 = st.columns([2, 2, 1])
            with col1:
                st.markdown(f"**{m.get('nome','')}** {f\"— {m.get('cargo','')}\" if m.get('cargo') else ''}")
                st.caption(f"{m.get('email','')} · {m.get('telefone','') or '—'}")
            with col2:
                st.markdown(" ".join([f"<span class='badge-perm'>{p}</span>" for p in perms]) or "—", unsafe_allow_html=True)
                st.caption(f"Vínculo: {link_txt}")
            with col3:
                btn_edit, btn_des = st.columns(2)
                with btn_edit:
                    if st.button("✏️", key=f"editar_{mid}", help="Editar"):
                        st.session_state["gestao_editing_id"] = mid
                        st.rerun()
                with btn_des:
                    if st.button("Desativar", key=f"desativar_{mid}", type="secondary"):
                        if deactivate_member(mid):
                            st.success("Desativado.")
                            st.rerun()
                        else:
                            st.error("Erro ao desativar.")

    # Usuários desativados (podem estar ocupando o email)
    inactive = [m for m in members if not m.get("active", True)]
    if inactive:
        with st.expander("🗑️ Usuários desativados (excluir para liberar email)", expanded=True):
            st.caption("Estes emails estão bloqueados. **Excluir permanentemente** libera o email para novo cadastro.")
            for m in inactive:
                mid = m.get("id")
                col_a, col_b, col_c = st.columns([2, 1, 1])
                with col_a:
                    st.markdown(f"**{m.get('nome','')}** — {m.get('email','')}")
                with col_b:
                    if st.button("Reativar", key=f"reativar_{mid}"):
                        if reactivate_member(mid):
                            st.success("Reativado.")
                            st.rerun()
                with col_c:
                    if st.button("Excluir permanentemente", key=f"excluir_{mid}", type="secondary"):
                        if delete_member_permanently(mid):
                            st.success("Excluído. O email está liberado.")
                            st.rerun()
                        else:
                            st.error("Erro ao excluir.")

    # Formulário de edição
    member_edit = next((m for m in members if m.get("id") == editing_id), None)
    if member_edit:
        with st.expander(f"✏️ Editar: {member_edit.get('nome','')}", expanded=True):
            with st.form("form_editar_usuario"):
                assign_curr = get_class_assignments(editing_id)
                links_curr = get_student_links(editing_id)
                col1, col2 = st.columns(2)
                with col1:
                    nome_ed = st.text_input("Nome *", value=member_edit.get("nome", ""), key="edit_nome")
                    email_ed = st.text_input("Email *", value=member_edit.get("email", ""), key="edit_email")
                    senha_ed = st.text_input("Nova senha", type="password", placeholder="Deixe em branco para manter", key="edit_senha")
                    telefone_ed = st.text_input("Telefone", value=member_edit.get("telefone") or "", key="edit_telefone")
                    cargo_ed = st.text_input("Cargo", value=member_edit.get("cargo") or "", key="edit_cargo")
                with col2:
                    st.markdown("**Páginas que pode acessar**")
                    can_est_ed = st.checkbox("Estudantes", value=member_edit.get("can_estudantes"), key="edit_can_estudantes")
                    can_pei_ed = st.checkbox("PEI", value=member_edit.get("can_pei"), key="edit_can_pei")
                    can_paee_ed = st.checkbox("PAEE", value=member_edit.get("can_paee"), key="edit_can_paee")
                    can_hub_ed = st.checkbox("Hub", value=member_edit.get("can_hub"), key="edit_can_hub")
                    can_diario_ed = st.checkbox("Diário", value=member_edit.get("can_diario"), key="edit_can_diario")
                    can_aval_ed = st.checkbox("Avaliação", value=member_edit.get("can_avaliacao"), key="edit_can_avaliacao")
                    can_gestao_ed = st.checkbox("Gestão", value=member_edit.get("can_gestao"), key="edit_can_gestao")
                lt = member_edit.get("link_type") or "todos"
                lt_idx = ["todos", "turma", "tutor"].index(lt) if lt in ["todos", "turma", "tutor"] else 0
                link_type_ed = st.selectbox("Vínculo", ["todos", "turma", "tutor"], index=lt_idx, format_func=lambda x: {"todos": "Todos", "turma": "Por turma", "tutor": "Por tutor"}[x], key="edit_link")
                teacher_assignments_ed = []
                student_ids_ed = []
                if link_type_ed == "turma":
                    try:
                        years = list_school_years(ws_id)
                        classes_all = list_classes(ws_id) if years else []
                        components_all = list_components()
                    except Exception:
                        years, classes_all, components_all = [], [], []
                    if classes_all:
                        classes_opts = {f"{c.get('grade', {}).get('label', '')} - Turma {c.get('class_group','')}": c for c in classes_all if c.get("id")}
                        comp_opts = {c.get("label", c.get("id", "")): c.get("id") for c in components_all} if components_all else {"Arte":"arte","Ciências":"ciencias","Geografia":"geografia","História":"historia","Língua Portuguesa":"lingua_portuguesa","Matemática":"matematica","Educação Física":"educacao_fisica","Língua Inglesa":"lingua_inglesa"}
                        n_add = st.number_input("Quantos vínculos?", min_value=1, max_value=20, value=max(1, len(assign_curr)), key="edit_n_turma")
                        for i in range(int(n_add)):
                            cc1, cc2 = st.columns(2)
                            with cc1:
                                cl_sel = st.selectbox(f"Turma {i+1}", list(classes_opts.keys()), key=f"edit_cl_{i}")
                            with cc2:
                                comp_sel = st.selectbox(f"Componente {i+1}", list(comp_opts.keys()), key=f"edit_comp_{i}")
                            if cl_sel and comp_sel:
                                cl = classes_opts.get(cl_sel)
                                comp_id = comp_opts.get(comp_sel)
                                if cl and comp_id:
                                    teacher_assignments_ed.append({"class_id": cl["id"], "component_id": comp_id})
                elif link_type_ed == "tutor":
                    try:
                        import requests
                        base = ou.get_setting("SUPABASE_URL", "").rstrip("/")
                        r = requests.get(f"{base}/rest/v1/students?workspace_id=eq.{ws_id}&select=id,name,grade,class_group", headers=ou._headers(), timeout=10)
                        alunos_raw = r.json() if r.status_code == 200 else []
                    except Exception:
                        alunos_raw = []
                    alunos_opts = {f"{a.get('name','')} ({a.get('grade','')} - {a.get('class_group','')})": a.get("id") for a in alunos_raw if a.get("id")}
                    default_links = []
                    for lid in links_curr:
                        for k, vid in alunos_opts.items():
                            if vid == lid:
                                default_links.append(k)
                                break
                    selecionados = st.multiselect("Alunos tutor", list(alunos_opts.keys()), default=default_links, key="edit_tutor")
                    student_ids_ed = [alunos_opts[k] for k in selecionados if k in alunos_opts]
                col_btn1, col_btn2 = st.columns(2)
                with col_btn1:
                    salvar_ed = st.form_submit_button("Salvar alterações")
                with col_btn2:
                    cancelar_ed = st.form_submit_button("Cancelar")
                if cancelar_ed:
                    st.session_state.pop("gestao_editing_id", None)
                    st.rerun()
                if salvar_ed:
                    if not nome_ed or not email_ed:
                        st.error("Nome e email são obrigatórios.")
                    else:
                        ok, err = update_member(
                            member_id=editing_id,
                            nome=nome_ed,
                            email=email_ed,
                            password=senha_ed if senha_ed and len(senha_ed) >= 4 else None,
                            telefone=telefone_ed,
                            cargo=cargo_ed or "",
                            can_estudantes=can_est_ed,
                            can_pei=can_pei_ed,
                            can_paee=can_paee_ed,
                            can_hub=can_hub_ed,
                            can_diario=can_diario_ed,
                            can_avaliacao=can_aval_ed,
                            can_gestao=can_gestao_ed,
                            link_type=link_type_ed,
                            class_assignments=teacher_assignments_ed if link_type_ed == "turma" else None,
                            student_ids=student_ids_ed if link_type_ed == "tutor" else None,
                        )
                        if err:
                            if "23505" in err and "email" in err:
                                st.error("Este email já está em uso. Use outro.")
                            else:
                                st.error(f"Erro: {err}")
                        else:
                            st.success("Usuário atualizado.")
                            st.session_state.pop("gestao_editing_id", None)
                            st.rerun()
