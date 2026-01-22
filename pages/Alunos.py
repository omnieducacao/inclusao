# pages/Alunos.py
import streamlit as st
from datetime import date, datetime
from supabase_client import get_supabase

# ==============================================================================
# 1) CONFIG
# ==============================================================================
APP_VERSION = "v1.1 (Estudantes • Gestão only)"

st.set_page_config(
    page_title="Omnisfera • Estudantes",
    page_icon="👥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ==============================================================================
# 2) GATE — NÃO AUTENTICA, SÓ BLOQUEIA SE NÃO HOUVER SESSÃO
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
            st.session_state.autenticado = False
            st.session_state.workspace_id = None
            st.session_state.workspace_name = None
            st.rerun()
    st.stop()


if not st.session_state.get("autenticado", False):
    acesso_bloqueado("Sessão expirada ou não iniciada.")

if not st.session_state.get("workspace_id"):
    acesso_bloqueado("Nenhum workspace vinculado ao seu acesso (PIN).")

WORKSPACE_ID = st.session_state.get("workspace_id")
WORKSPACE_NAME = st.session_state.get("workspace_name", "")

# ==============================================================================
# 3) HELPERS
# ==============================================================================
def _parse_date(value):
    if value is None:
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        try:
            return date.fromisoformat(value[:10])
        except:
            return None
    return None


@st.cache_data(show_spinner=False, ttl=15)
def supa_list_students(workspace_id: str):
    sb = get_supabase()
    res = (
        sb.table("students")
        .select("id, name, birth_date, grade, class_group, diagnosis, created_at")
        .eq("workspace_id", workspace_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


def supa_delete_student(student_id: str):
    sb = get_supabase()
    sb.table("students").delete().eq("id", student_id).execute()
    return True


# ==============================================================================
# 4) UI — HEADER
# ==============================================================================
st.markdown(
    f"""
    <div style="
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:16px;
        padding: 18px 18px;
        background: white;
        border: 1px solid #E2E8F0;
        border-radius: 18px;
        box-shadow: 0 14px 30px rgba(15,82,186,0.06);
        margin-bottom: 16px;
    ">
        <div>
            <div style="font-family:Inter, sans-serif; font-weight:900; font-size:1.35rem; color:#0f172a;">
                👥 Estudantes
            </div>
            <div style="margin-top:4px; font-weight:800; color:#64748B;">
                Gestão do workspace (PIN) — {WORKSPACE_NAME if WORKSPACE_NAME else f"{str(WORKSPACE_ID)[:8]}…"}
            </div>
            <div style="margin-top:10px; font-weight:800; color:#94A3B8; font-size:.88rem;">
                Aqui você apenas visualiza todos os estudantes criados no PEI deste workspace e pode apagar quando necessário.
            </div>
        </div>

        <div style="min-width:220px; text-align:right;">
            <div style="font-weight:900; font-size:.70rem; letter-spacing:1.2px; text-transform:uppercase; color:#94A3B8;">
                Ações
            </div>
            <div style="margin-top:8px;">
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

top_l, top_r = st.columns([3, 1])
with top_r:
    if st.button("🔄 Atualizar", use_container_width=True):
        supa_list_students.clear()
        st.rerun()

# ==============================================================================
# 5) LISTA — TODOS DO WORKSPACE
# ==============================================================================
with st.spinner("Carregando estudantes..."):
    alunos = supa_list_students(WORKSPACE_ID)

if not alunos:
    st.info("Nenhum estudante encontrado neste workspace ainda. Crie um PEI para começar.")
    st.stop()

# Filtro (opcional, ajuda muito na gestão)
q = st.text_input("Buscar por nome", placeholder="Digite para filtrar…")
q_norm = (q or "").strip().lower()
if q_norm:
    alunos = [a for a in alunos if (a.get("name") or "").lower().find(q_norm) >= 0]

st.caption(f"{len(alunos)} estudante(s) exibido(s).")

# Cabeçalho tabela
h = st.columns([3, 1.2, 1.2, 2.6, 1.2])
h[0].markdown("**Nome**")
h[1].markdown("**Série**")
h[2].markdown("**Turma**")
h[3].markdown("**Diagnóstico**")
h[4].markdown("**Ações**")
st.markdown("<hr style='margin:6px 0 10px 0; border:none; border-top:1px solid #E2E8F0;'>", unsafe_allow_html=True)

# Lista
for row in alunos:
    sid = row.get("id")
    nome = row.get("name") or "—"
    serie = row.get("grade") or "—"
    turma = row.get("class_group") or "—"
    diag = row.get("diagnosis") or "—"

    cols = st.columns([3, 1.2, 1.2, 2.6, 1.2])
    with cols[0]:
        st.markdown(f"**{nome}**")
    with cols[1]:
        st.write(serie)
    with cols[2]:
        st.write(turma)
    with cols[3]:
        st.write(diag)

    with cols[4]:
        confirm_key = f"confirm_del_{sid}"
        if confirm_key not in st.session_state:
            st.session_state[confirm_key] = False

        if not st.session_state[confirm_key]:
            if st.button("🗑️ Apagar", key=f"del_{sid}", use_container_width=True):
                st.session_state[confirm_key] = True
                st.rerun()
        else:
            st.warning("Confirmar?")
            c_ok, c_no = st.columns(2)
            with c_ok:
                if st.button("✅", key=f"del_yes_{sid}", use_container_width=True):
                    try:
                        supa_delete_student(sid)
                        st.toast(f"Removido: {nome}", icon="🗑️")
                        supa_list_students.clear()
                        st.session_state[confirm_key] = False
                        st.rerun()
                    except Exception as e:
                        st.error(f"Erro ao apagar: {e}")
                        st.session_state[confirm_key] = False
            with c_no:
                if st.button("↩️", key=f"del_no_{sid}", use_container_width=True):
                    st.session_state[confirm_key] = False
                    st.rerun()

    st.markdown("<hr style='margin:8px 0; border:none; border-top:1px solid #F1F5F9;'>", unsafe_allow_html=True)

# ==============================================================================
# 6) FOOTER
# ==============================================================================
st.markdown(
    "<div style='text-align:center; color:#94A3B8; font-weight:800; font-size:0.75rem; margin-top:30px;'>"
    "Estudantes exibidos são sempre do workspace do PIN atual."
    "</div>",
    unsafe_allow_html=True,
)
