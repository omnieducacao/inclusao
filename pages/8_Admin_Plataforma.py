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
    get_workspace,
    update_workspace,
    deactivate_workspace,
    reactivate_workspace,
    delete_workspace,
    list_platform_admins,
    update_workspace_master_password,
    create_workspace_master_for_workspace,
    get_platform_config,
    set_platform_config,
)
from services.members_service import list_members, get_workspace_master, delete_member_permanently, deactivate_member, reactivate_member
from services.monitoring_service import (
    get_usage_snapshot,
    list_platform_issues,
    create_platform_issue,
    update_platform_issue_status,
)

try:
    from ui_lockdown import hide_streamlit_chrome_if_needed, hide_default_sidebar_nav
    hide_streamlit_chrome_if_needed(show_for_admin=True)
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
    ou.render_acesso_bloqueado(
        "Entre como administrador da plataforma.",
        "Na tela de login, expanda Sou administrador da plataforma e use email + senha.",
    )

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

try:
    cached_workspaces = list_workspaces()
    cached_workspaces_error = None
except Exception as e:
    cached_workspaces = []
    cached_workspaces_error = str(e)

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

# --- Tab Dashboard ---
with tab_dashboard:
    st.markdown("### 📊 Uso da plataforma (últimos 7 dias)")
    try:
        usage = get_usage_snapshot(days=7, limit=500)
    except Exception as e:
        usage = None
        st.error(f"Não foi possível carregar métricas: {e}")
    if not usage or usage.get("total", 0) == 0:
        st.info("Ainda não há eventos registrados. Assim que os usuários começarem a acessar, o dashboard será preenchido automaticamente.")
    else:
        total_events = usage.get("total", 0)
        by_type = {item["event_type"]: item["count"] for item in usage.get("by_type", [])}
        login_events = sum(count for event, count in by_type.items() if event.startswith("login"))
        page_views = by_type.get("page_view", 0)
        ai_events = sum(item["count"] for item in usage.get("by_engine", []) if item["ai_engine"] != "—")
        col_a, col_b, col_c = st.columns(3)
        col_a.metric("Eventos capturados", total_events)
        col_b.metric("Page views", page_views)
        col_c.metric("Logins", login_events)

        timeline = usage.get("timeline", [])
        if timeline:
            try:
                import pandas as pd

                timeline_df = pd.DataFrame(timeline).sort_values("day")
                timeline_df = timeline_df.set_index("day")
                st.subheader("Atividade diária")
                st.line_chart(timeline_df)
            except Exception:
                pass

        engines = usage.get("by_engine", [])
        engines = [item for item in engines if item["ai_engine"] != "—"]
        if engines:
            try:
                import pandas as pd

                engine_df = pd.DataFrame(engines)
                st.subheader("Motores de IA mais usados")
                engine_df = engine_df.set_index("ai_engine")
                st.bar_chart(engine_df)
            except Exception:
                pass

        recent = usage.get("recent", [])
        if recent:
            st.subheader("Eventos recentes")
            try:
                import pandas as pd

                recent_df = pd.DataFrame(recent)
                recent_df["created_at"] = recent_df["created_at"].map(lambda x: datetime.fromisoformat(x.replace("Z", "+00:00")).astimezone(ZoneInfo("America/Sao_Paulo")).strftime("%d/%m %H:%M") if isinstance(x, str) else x)
                st.dataframe(
                    recent_df[["created_at", "event_type", "source", "ai_engine", "workspace_id"]],
                    use_container_width=True,
                    hide_index=True,
                )
            except Exception:
                for ev in recent[:10]:
                    st.caption(f"{ev.get('created_at')} · {ev.get('event_type')} · {ev.get('source') or '—'}")

# --- Tab Bugs ---
with tab_bugs:
    st.markdown("### 🐛 Registro de bugs e inconsistências")
    workspace_options = ["(sem vínculo)"] + [
        f"{ws.get('name', 'Sem nome')} — PIN {ws.get('pin') or ws.get('pin_code') or ws.get('code') or '—'}"
        for ws in cached_workspaces
    ]
    workspace_map = {
        f"{ws.get('name', 'Sem nome')} — PIN {ws.get('pin') or ws.get('pin_code') or ws.get('code') or '—'}": ws.get("id")
        for ws in cached_workspaces
    }
    with st.form("form_bug"):
        ws_choice = st.selectbox("Escola relacionada (opcional)", workspace_options, key="issue_workspace")
        titulo = st.text_input("Título do bug *", placeholder="Ex: Master não consegue alterar senha")
        severidade = st.selectbox("Severidade", ["baixa", "média", "alta", "crítica"], index=1)
        origem = st.text_input("Origem / Tela", placeholder="Ex: Gestão de Usuários")
        descricao = st.text_area("Descrição detalhada", placeholder="Explique o que aconteceu, quem foi impactado e como reproduzir.")
        if st.form_submit_button("Registrar bug"):
            if not titulo.strip():
                st.warning("Informe o título.")
            else:
                ws_selected = workspace_map.get(ws_choice) if ws_choice in workspace_map else None
                criado_por = st.session_state.get("usuario_nome", "Admin")
                ok = create_platform_issue(
                    title=titulo.strip(),
                    description=descricao.strip(),
                    severity=severidade,
                    workspace_id=ws_selected,
                    source=origem.strip(),
                    created_by=criado_por,
                )
                if ok:
                    st.success("Bug registrado.")
                    ou.track_usage_event("admin_issue_created", metadata={"title": titulo.strip(), "severity": severidade})
                    st.rerun()
                else:
                    st.error("Não foi possível salvar. Verifique o Supabase.")

    issues = list_platform_issues()
    if not issues:
        st.info("Nenhum bug registrado até o momento.")
    else:
        status_order = ["aberto", "em_andamento", "resolvido", "arquivado"]
        for issue in issues:
            status = issue.get("status") or "aberto"
            badge = f"[{status.upper()}]"
            title = issue.get("title", "Sem título")
            workspace_label = next((ws.get("name") for ws in cached_workspaces if ws.get("id") == issue.get("workspace_id")), "Geral")
            with st.expander(f"{badge} {title} • {workspace_label}"):
                st.write(issue.get("description") or "_Sem descrição detalhada._")
                col_meta1, col_meta2 = st.columns(2)
                with col_meta1:
                    st.caption(f"Severidade: **{issue.get('severity', 'média')}**")
                    st.caption(f"Origem: {issue.get('source') or '—'}")
                with col_meta2:
                    criado_em = issue.get("created_at")
                    if isinstance(criado_em, str):
                        try:
                            criado_fmt = datetime.fromisoformat(criado_em.replace("Z", "+00:00")).astimezone(ZoneInfo("America/Sao_Paulo")).strftime("%d/%m/%Y %H:%M")
                        except Exception:
                            criado_fmt = criado_em
                    else:
                        criado_fmt = criado_em
                    st.caption(f"Criado em: {criado_fmt}")
                    st.caption(f"Registrado por: {issue.get('created_by') or '—'}")
                status_options = ["aberto", "em_andamento", "resolvido", "arquivado"]
                current_index = status_options.index(status) if status in status_options else 0
                new_status = st.selectbox("Status", status_options, index=current_index, key=f"issue_status_{issue['id']}")
                notes = st.text_area("Notas / Próximos passos", value=issue.get("resolution_notes") or "", key=f"issue_notes_{issue['id']}")
                if st.button("Salvar atualização", key=f"issue_save_{issue['id']}"):
                    ok = update_platform_issue_status(issue["id"], status=new_status, resolution_notes=notes)
                    if ok:
                        st.success("Issue atualizada.")
                        ou.track_usage_event("admin_issue_updated", metadata={"issue": issue.get("title"), "status": new_status})
                        st.rerun()
                    else:
                        st.error("Não foi possível atualizar. Verifique o Supabase.")

# --- Tab Escolas ---
with tab_escolas:
    SEGMENT_OPTIONS = {
        "EI": "Educação Infantil",
        "EF_AI": "Ensino Fundamental — Anos Iniciais",
        "EF_AF": "Ensino Fundamental — Anos Finais",
        "EM": "Ensino Médio",
    }
    ENGINE_OPTIONS = {
        "red": "OmniRed",
        "blue": "OmniBlue",
        "green": "OmniGreen",
        "yellow": "OmniYellow",
        "orange": "OmniOrange",
    }
    MODULE_OPTIONS = [
        ("pei", "Estratégias & PEI"),
        ("paee", "Plano de Ação (AEE)"),
        ("hub", "Hub de Recursos"),
        ("diario", "Diário de Bordo"),
        ("avaliacao", "Evolução & Dados"),
    ]

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
                            ou.track_usage_event(
                                "admin_create_workspace",
                                workspace_id=ws.get("id"),
                                metadata={
                                    "workspace": ws.get("name"),
                                    "segments": segmentos_escola,
                                    "ai_engines": motores_escola,
                                },
                            )
                            st.rerun()
                        else:
                            st.error(f"Erro: {pin}")
                    except Exception as e:
                        st.error(str(e))
            else:
                st.warning("Informe o nome da escola.")

    st.markdown("### 📋 Escolas cadastradas")
    workspaces = cached_workspaces
    if cached_workspaces_error:
        st.warning(f"Não foi possível listar escolas. Verifique se a tabela workspaces existe. {cached_workspaces_error}")

    editing_ws = st.session_state.get("admin_editing_ws")
    confirm_del_ws = st.session_state.get("admin_confirm_delete_ws")

    if not workspaces:
        st.info("Nenhuma escola cadastrada. Crie a primeira acima.")
    else:
        for ws in workspaces:
            wid = ws.get("id")
            wname = ws.get("name", "Sem nome")
            wpin = ws.get("pin") or ws.get("pin_code") or ws.get("code") or "—"
            wsegments = ws.get("segments") or []
            wengines = ws.get("ai_engines") or []
            wactive = ws.get("active", True)
            badge = "🟢 Ativa" if wactive else "🔴 Inativa"
            exp_label = f"🏫 {wname} — PIN: {wpin} · {badge}"
            with st.expander(exp_label, expanded=(editing_ws == wid or confirm_del_ws == wid)):
                # Confirmação de exclusão
                if confirm_del_ws == wid:
                    st.warning("⚠️ Excluir remove a escola e dados relacionados. Esta ação não pode ser desfeita.")
                    c1, c2 = st.columns(2)
                    with c1:
                        if st.button("Sim, excluir permanentemente", key=f"del_yes_{wid}", type="primary"):
                            if delete_workspace(wid):
                                st.session_state.pop("admin_confirm_delete_ws", None)
                                st.session_state.pop("admin_editing_ws", None)
                                ou.track_usage_event("admin_workspace_deleted", metadata={"workspace": wname})
                                st.success("Escola excluída.")
                                st.rerun()
                            else:
                                st.error("Erro ao excluir.")
                    with c2:
                        if st.button("Cancelar", key=f"del_no_{wid}"):
                            st.session_state.pop("admin_confirm_delete_ws", None)
                            st.rerun()
                    continue

                # Modo edição
                if editing_ws == wid:
                    with st.form(f"form_edit_ws_{wid}"):
                        st.markdown("**Editar escola**")
                        nome_ed = st.text_input("Nome", value=wname, key=f"edit_name_{wid}")
                        seg_ed = st.multiselect("Segmentos", options=list(SEGMENT_OPTIONS.keys()), default=wsegments, format_func=lambda k: SEGMENT_OPTIONS.get(k, k), key=f"edit_seg_{wid}")
                        eng_ed = st.multiselect("Motores IA", options=list(ENGINE_OPTIONS.keys()), default=wengines, format_func=lambda k: ENGINE_OPTIONS.get(k, k), key=f"edit_eng_{wid}")
                        wmodules = ws.get("enabled_modules")
                        st.markdown("**Módulos habilitados**")
                        checks_ed = {k: st.checkbox(l, value=(wmodules is None or k in (wmodules or [])), key=f"edit_mod_{wid}_{k}") for k, l in MODULE_OPTIONS}
                        col_s, col_c = st.columns(2)
                        with col_s:
                            if st.form_submit_button("Salvar"):
                                new_mods = [k for k, _ in MODULE_OPTIONS if checks_ed[k]]
                                ok, err = update_workspace(wid, name=nome_ed, segments=seg_ed, ai_engines=eng_ed, enabled_modules=new_mods)
                                if ok:
                                    st.session_state.pop("admin_editing_ws", None)
                                    ou.track_usage_event("admin_workspace_updated", workspace_id=wid, metadata={"workspace": nome_ed})
                                    st.success("Escola atualizada.")
                                    st.rerun()
                                else:
                                    st.error(err or "Erro ao salvar.")
                        with col_c:
                            if st.form_submit_button("Cancelar"):
                                st.session_state.pop("admin_editing_ws", None)
                                st.rerun()
                else:
                    # Ações: Editar | Desativar/Reativar | Excluir
                    col_a1, col_a2, col_a3, _ = st.columns([1, 1, 1, 3])
                    with col_a1:
                        if st.button("✏️ Editar", key=f"edit_btn_{wid}"):
                            st.session_state["admin_editing_ws"] = wid
                            st.rerun()
                    with col_a2:
                        if wactive:
                            if st.button("⏸️ Desativar", key=f"deact_{wid}", type="secondary"):
                                if deactivate_workspace(wid):
                                    ou.track_usage_event("admin_workspace_deactivated", workspace_id=wid, metadata={"workspace": wname})
                                    st.success("Escola desativada. Dados mantidos.")
                                    st.rerun()
                                else:
                                    st.error("Erro ao desativar.")
                        else:
                            if st.button("▶️ Reativar", key=f"react_{wid}", type="primary"):
                                if reactivate_workspace(wid):
                                    ou.track_usage_event("admin_workspace_reactivated", workspace_id=wid, metadata={"workspace": wname})
                                    st.success("Escola reativada.")
                                    st.rerun()
                                else:
                                    st.error("Erro ao reativar.")
                    with col_a3:
                        if st.button("🗑️ Excluir", key=f"del_btn_{wid}", type="secondary"):
                            st.session_state["admin_confirm_delete_ws"] = wid
                            st.rerun()

                    if wsegments:
                        seg_labels = [SEGMENT_OPTIONS.get(s, s) for s in wsegments]
                        st.caption(f"Segmentos: {', '.join(seg_labels)}")
                    if wengines:
                        eng_labels = [ENGINE_OPTIONS.get(e, e) for e in wengines]
                        st.caption(f"Motores IA: {', '.join(eng_labels)}")

                    # Módulos habilitados (form rápido)
                    wmodules = ws.get("enabled_modules")
                    with st.form(f"form_modulos_{wid}"):
                        st.markdown("**Módulos habilitados** (desmarque para ocultar na escola)")
                        checks = {}
                        for key, label in MODULE_OPTIONS:
                            checks[key] = st.checkbox(label, value=(wmodules is None or key in (wmodules or [])), key=f"mod_{wid}_{key}")
                        if st.form_submit_button("Salvar módulos"):
                            new_list = [k for k, _ in MODULE_OPTIONS if checks[k]]
                            ok, err = update_workspace(wid, enabled_modules=new_list)
                            if ok:
                                st.success("Módulos atualizados.")
                                ou.track_usage_event("admin_modules_updated", workspace_id=wid, metadata={"modules": new_list})
                                st.rerun()
                            else:
                                st.error(err or "Erro ao salvar.")

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
                                            ou.track_usage_event("admin_master_password_reset", workspace_id=wid, metadata={"workspace": wname})
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
                                            ou.track_usage_event("admin_master_created", workspace_id=wid, metadata={"workspace": wname, "email": m_email.strip().lower()})
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
                            m_active = m.get("active", True)
                            badge_u = "🟢" if m_active else "🔴"
                            with st.expander(f"{badge_u} {m_nome} — {m_email}", expanded=False):
                                if m_cargo:
                                    st.caption(f"Cargo: {m_cargo}")
                                c1, c2, c3 = st.columns(3)
                                with c1:
                                    if m_active:
                                        if st.button("Desativar", key=f"adm_deact_{mid}"):
                                            if deactivate_member(mid):
                                                ou.track_usage_event("admin_member_deactivated", workspace_id=wid, metadata={"member": mid})
                                                st.success("Desativado.")
                                                st.rerun()
                                    else:
                                        if st.button("Reativar", key=f"adm_react_{mid}"):
                                            if reactivate_member(mid):
                                                ou.track_usage_event("admin_member_reactivated", workspace_id=wid, metadata={"member": mid})
                                                st.success("Reativado.")
                                                st.rerun()
                                with c2:
                                    if st.button("Excluir", key=f"del_{mid}", type="secondary"):
                                        if delete_member_permanently(mid):
                                            st.success("Excluído.")
                                            ou.track_usage_event("admin_member_deleted", workspace_id=wid, metadata={"member": mid})
                                            st.rerun()
                                        else:
                                            st.error("Erro ao excluir.")
