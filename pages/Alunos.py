# pages/Alunos.py
import streamlit as st
from datetime import datetime
from supabase_client import supabase

# ==============================================================================
# 1) CONFIGURAÇÃO BÁSICA
# ==============================================================================
st.set_page_config(
    page_title="Omnisfera | Estudantes",
    page_icon="👥",
    layout="wide",
)

# ==============================================================================
# 2) GATE DE ACESSO (NÃO AUTENTICA, SÓ VERIFICA)
# ==============================================================================
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
            <div style="font-weight:900; font-size:1.1rem; margin-bottom:6px;">
                Acesso restrito
            </div>
            <div style="color:#4A5568; font-weight:700; font-size:0.95rem; margin-bottom:18px;">
                {msg}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    if st.button("🔑 Voltar para o login", use_container_width=True):
        st.session_state.autenticado = False
        st.session_state.workspace_id = None
        st.session_state.workspace_name = None
        st.rerun()

    st.stop()


if not st.session_state.get("autenticado"):
    acesso_bloqueado("Faça login para acessar os estudantes.")

if not st.session_state.get("workspace_id"):
    acesso_bloqueado("Nenhuma escola vinculada ao seu acesso.")

WORKSPACE_ID = st.session_state.workspace_id
ESCOLA = st.session_state.get("workspace_name", "")

# ==============================================================================
# 3) HELPERS SUPABASE
# ==============================================================================
def carregar_estudantes():
    """Busca todos os alunos do workspace atual"""
    try:
        resp = (
            supabase
            .table("students")
            .select("*")
            .eq("workspace_id", WORKSPACE_ID)
            .order("created_at", desc=True)
            .execute()
        )
        return resp.data or []
    except Exception as e:
        st.error("Erro ao carregar estudantes do banco.")
        st.exception(e)
        return []


def excluir_estudante(student_id: str):
    try:
        supabase.table("students").delete().eq("id", student_id).execute()
        st.toast("Aluno removido com sucesso.", icon="🗑️")
        st.rerun()
    except Exception as e:
        st.error("Erro ao excluir estudante.")
        st.exception(e)


# ==============================================================================
# 4) HEADER DA PÁGINA
# ==============================================================================
st.markdown(
    f"""
    <div style="
        display:flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    ">
        <div>
            <h1 style="margin-bottom:4px;">👥 Estudantes</h1>
            <div style="color:#64748B; font-weight:700;">
                Alunos vinculados ao workspace
                {" — " + ESCOLA if ESCOLA else ""}
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown("---")

# ==============================================================================
# 5) LISTAGEM
# ==============================================================================
estudantes = carregar_estudantes()

if not estudantes:
    st.info(
        "Nenhum estudante cadastrado ainda.\n\n"
        "👉 Os alunos aparecem aqui automaticamente quando um **PEI é criado**.",
        icon="ℹ️",
    )
    st.stop()

# Cabeçalho da tabela (visual)
cols_header = st.columns([3, 2, 2, 3, 1])
with cols_header[0]: st.markdown("**Nome**")
with cols_header[1]: st.markdown("**Série**")
with cols_header[2]: st.markdown("**Turma**")
with cols_header[3]: st.markdown("**Diagnóstico**")
with cols_header[4]: st.markdown("**Ações**")

st.markdown("<hr style='margin-top:6px; margin-bottom:6px;'>", unsafe_allow_html=True)

# Linhas
for aluno in estudantes:
    cols = st.columns([3, 2, 2, 3, 1])

    with cols[0]:
        st.markdown(f"**{aluno.get('name','—')}**")

    with cols[1]:
        st.write(aluno.get("grade", "—"))

    with cols[2]:
        st.write(aluno.get("class_group", "—"))

    with cols[3]:
        diag = aluno.get("diagnosis", "")
        st.write(diag if diag else "—")

    with cols[4]:
        if st.button(
            "🗑️",
            key=f"del_{aluno['id']}",
            help="Excluir aluno (não remove histórico externo)",
        ):
            excluir_estudante(aluno["id"])

    st.markdown("<hr style='margin-top:4px; margin-bottom:4px;'>", unsafe_allow_html=True)

# ==============================================================================
# 6) FOOTER
# ==============================================================================
st.markdown(
    "<div style='text-align:center; color:#94A3B8; font-size:0.75rem; margin-top:30px;'>"
    "Os estudantes são organizados por escola (PIN / workspace)."
    "</div>",
    unsafe_allow_html=True,
)
