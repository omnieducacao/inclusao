# ==============================================================================
# SIDEBAR PADRÃO — OMNISFERA (VERSÃO ESTÁVEL)
# ==============================================================================

with st.sidebar:
    st.markdown("## 🌐 Omnisfera")

    st.markdown("---")
    st.markdown("### 🧭 Navegação")

    if st.button("🏠 Home", use_container_width=True):
        st.switch_page("pages/0_Home.py")

    if st.button("👥 Estudantes", use_container_width=True):
        st.switch_page("pages/Alunos.py")

    if st.button("📘 PEI", use_container_width=True, disabled=True):
        pass

    if st.button("🧩 PAEE", use_container_width=True):
        st.switch_page("pages/2_PAE.py")

    if st.button("🚀 Hub de Inclusão", use_container_width=True):
        st.switch_page("pages/3_Hub_Inclusao.py")

    st.markdown("---")
    st.markdown("### 👤 Sessão")

    st.caption(f"Usuário: **{st.session_state.get('usuario_nome','')}**")
    st.caption(f"Workspace: **{st.session_state.get('workspace_name','')}**")

    st.markdown("---")
    st.markdown("### 🧾 Status do Aluno")

    student_id = st.session_state.get("selected_student_id")
    if student_id:
        st.success("✅ Vinculado ao Supabase")
        st.caption(f"id: {student_id[:8]}…")
    else:
        st.warning("📝 Rascunho (não salvo)")

    st.markdown("---")
    st.markdown("### 🚪")

    if st.button("Sair do Sistema", type="secondary", use_container_width=True):
        for k in [
            "autenticado",
            "workspace_id",
            "workspace_name",
            "usuario_nome",
            "usuario_cargo",
            "selected_student_id",
        ]:
            st.session_state.pop(k, None)
        st.switch_page("streamlit_app.py")
