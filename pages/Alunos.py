# pages/Alunos.py
import streamlit as st
import requests

# ==============================================================================
# CONFIG
# ==============================================================================
st.set_page_config(page_title="Omnisfera • Estudantes", page_icon="👥", layout="wide")


# ==============================================================================
# GATE (SEM LOGIN AQUI) — só redireciona para o começo do app
# ==============================================================================
def acesso_bloqueado(msg: str):
    st.markdown(
        f"""
        <div style="
            max-width:520px;
            margin: 110px auto 18px auto;
            padding: 26px;
            background: white;
            border-radius: 18px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 20px 40px rgba(15,82,186,0.10);
            text-align: center;
        ">
            <div style="font-size:2.1rem; margin-bottom:10px;">🔐</div>
            <div style="font-weight:900; font-size:1.1rem; margin-bottom:6px; color:#0f172a;">
                Acesso restrito
            </div>
            <div style="color:#4A5568; font-weight:700; font-size:0.95rem; margin-bottom:10px;">
                {msg}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    c1, c2, c3 = st.columns([1, 2, 1])
    with c2:
        if st.button("🔑 Voltar para o Login", use_container_width=True, type="primary"):
            for k in ["autenticado", "workspace_id", "workspace_name", "usuario_nome", "usuario_cargo"]:
                st.session_state.pop(k, None)

            try:
                st.switch_page("streamlit_app.py")
            except Exception:
                st.markdown(
                    """
                    <div style="text-align:center; margin-top:10px;">
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


if not st.session_state.get("autenticado", False):
    acesso_bloqueado("Sessão expirada ou não iniciada.")

if not st.session_state.get("workspace_id"):
    acesso_bloqueado("Nenhum workspace vinculado ao seu acesso (PIN).")


WORKSPACE_ID = st.session_state.get("workspace_id")
WORKSPACE_NAME = st.session_state.get("workspace_name") or f"{str(WORKSPACE_ID)[:8]}…"


# ==============================================================================
# SUPABASE REST (mesmo padrão do PEI)
# ==============================================================================
def _sb_url() -> str:
    url = str(st.secrets.get("SUPABASE_URL", "")).strip()
    if not url:
        raise RuntimeError("SUPABASE_URL não encontrado nos secrets.")
    return url.rstrip("/")


def _sb_key() -> str:
    # Preferência: SERVICE_KEY (server-side), fallback: ANON_KEY
    key = str(st.secrets.get("SUPABASE_SERVICE_KEY", "")).strip()
    if not key:
        key = str(st.secrets.get("SUPABASE_ANON_KEY", "")).strip()
    if not key:
        raise RuntimeError("SUPABASE_SERVICE_KEY/ANON_KEY não encontrado nos secrets.")
    return key


def _headers() -> dict:
    key = _sb_key()
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def _http_error(prefix: str, r: requests.Response):
    raise RuntimeError(f"{prefix}: {r.status_code} {r.text}")


@st.cache_data(ttl=10, show_spinner=False)
def list_students_rest(workspace_id: str):
    base = (
        f"{_sb_url()}/rest/v1/students"
        f"?select=id,name,birth_date,grade,class_group,diagnosis,created_at"
        f"&workspace_id=eq.{workspace_id}"
        f"&order=created_at.desc"
    )
    r = requests.get(base, headers=_headers(), timeout=20)
    if r.status_code >= 400:
        _http_error("List students falhou", r)
    data = r.json()
    return data if isinstance(data, list) else []


def delete_student_rest(student_id: str, workspace_id: str):
    url = f"{_sb_url()}/rest/v1/students?id=eq.{student_id}&workspace_id=eq.{workspace_id}"
    h = _headers()
    h["Prefer"] = "return=representation"
    r = requests.delete(url, headers=h, timeout=20)
    if r.status_code >= 400:
        _http_error("Delete em students falhou", r)
    return r.json()


# ==============================================================================
# UI
# ==============================================================================
st.title("👥 Estudantes")
st.caption(f"Gestão do workspace (PIN) — **{WORKSPACE_NAME}**")
st.write("Aqui você apenas visualiza os estudantes criados no PEI deste workspace e pode apagar quando necessário.")

top_l, top_r = st.columns([3, 1])
with top_l:
    q = st.text_input("Buscar por nome", placeholder="Digite para filtrar…", label_visibility="visible")
with top_r:
    st.markdown("#### Ações")
    if st.button("🔄 Atualizar", use_container_width=True):
        list_students_rest.clear()
        st.rerun()

# 🔥 Se você veio de uma sincronização no PEI, forçamos refresh imediato
if st.session_state.pop("students_dirty", False):
    try:
        list_students_rest.clear()
    except Exception:
        pass

with st.spinner("Carregando estudantes..."):
    try:
        alunos = list_students_rest(WORKSPACE_ID)
    except Exception as e:
        st.error(f"Erro ao carregar do Supabase: {e}")
        st.stop()

# filtro
if q and q.strip():
    qq = q.strip().lower()
    alunos = [a for a in alunos if (a.get("name") or "").lower().find(qq) >= 0]

st.divider()

if not alunos:
    st.info("Nenhum estudante encontrado neste workspace ainda. Crie um PEI para começar.")
    st.stop()

st.caption(f"**{len(alunos)}** estudante(s) exibido(s).")

# Cabeçalho
h = st.columns([3.2, 1.1, 1.1, 2.6, 1.1])
h[0].markdown("**Nome**")
h[1].markdown("**Série**")
h[2].markdown("**Turma**")
h[3].markdown("**Diagnóstico**")
h[4].markdown("**Ações**")
st.divider()

for a in alunos:
    sid = a.get("id")
    nome = a.get("name") or "—"
    serie = a.get("grade") or "—"
    turma = a.get("class_group") or "—"
    diag = a.get("diagnosis") or "—"

    row = st.columns([3.2, 1.1, 1.1, 2.6, 1.1])
    row[0].markdown(f"**{nome}**")
    row[1].write(serie)
    row[2].write(turma)
    row[3].write(diag)

    confirm_key = f"confirm_del_{sid}"
    if confirm_key not in st.session_state:
        st.session_state[confirm_key] = False

    with row[4]:
        if not st.session_state[confirm_key]:
            if st.button("🗑️", key=f"del_{sid}", use_container_width=True, help="Apagar estudante"):
                st.session_state[confirm_key] = True
                st.rerun()
        else:
            st.warning("Confirmar?")
            c1, c2 = st.columns(2)
            with c1:
                if st.button("✅", key=f"yes_{sid}", use_container_width=True):
                    try:
                        delete_student_rest(sid, WORKSPACE_ID)
                        list_students_rest.clear()
                        st.session_state[confirm_key] = False
                        st.toast(f"Removido: {nome}", icon="🗑️")
                        st.rerun()
                    except Exception as e:
                        st.session_state[confirm_key] = False
                        st.error(f"Erro ao apagar: {e}")
            with c2:
                if st.button("↩️", key=f"no_{sid}", use_container_width=True):
                    st.session_state[confirm_key] = False
                    st.rerun()

    st.markdown("<hr style='margin:8px 0; border:none; border-top:1px solid #EEF2F7;'>", unsafe_allow_html=True)
