# pages/Alunos.py
import streamlit as st
import requests
import base64
import os

# ==============================================================================
# CONFIG
# ==============================================================================
st.set_page_config(page_title="Omnisfera • Estudantes", page_icon="👥", layout="wide")


# ==============================================================================
# 🔒 BLOCO VISUAL (HOME v2.0) — NÃO MEXER POR ENQUANTO
# - Objetivo: trazer identidade visual da Home para a página Estudantes
# - Sem topbar (vamos usar sidebar para navegar)
# - Mantém a “pílula” flutuante à direita
# - Banner “Estudantes” vira card branco (estética Home)
# ==============================================================================
def _ui_home_block():
    st.markdown(
        """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    color: #1E293B !important;
    background-color: #F8FAFC !important;
}

/* Mantém SIDEBAR (navegação), mas limpa o chrome */
[data-testid="stHeader"],
[data-testid="stToolbar"],
footer {
    display: none !important;
}

/* Conteúdo mais “premium” */
.block-container {
    padding-top: 1.25rem !important;
    padding-bottom: 3rem !important;
    max-width: 95% !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

/* =========================
   FLOATING PILL (direita)
   ========================= */
.float-pill {
    position: fixed;
    right: 18px;
    top: 92px;
    z-index: 999;
    background: rgba(255,255,255,0.92);
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.10);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.pill-badge {
    background: #F1F5F9;
    border: 1px solid #E2E8F0;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 800;
    color: #64748B;
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pill-user {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    color: #334155;
}

.pill-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4F46E5, #7C3AED);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 0.82rem;
}

/* =========================
   PAGE CARD HEADER (Estudantes)
   - mesmo "look" dos cards da Home
   ========================= */
.page-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.06);
    overflow: hidden;
    margin-bottom: 16px;
}

.page-card-inner {
    padding: 18px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
}

.page-card-logo {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
}

.page-card-logo img {
    width: 44px;
    height: 44px;
    object-fit: contain;
}

.page-card-title {
    font-weight: 900;
    font-size: 1.1rem;
    color: #0f172a;
    margin-bottom: 2px;
    letter-spacing: -0.2px;
}

.page-card-sub {
    font-size: 0.86rem;
    font-weight: 650;
    color: #64748B;
    line-height: 1.35;
}

/* barra de cor (igual sensação de “módulo”) */
.page-card-bar {
    height: 5px;
    background: linear-gradient(90deg, #0284C7, #3B82F6);
}

/* Botões um pouco mais elegantes (sem alterar lógica) */
.stButton > button {
    border-radius: 14px !important;
    border: 1px solid #E2E8F0 !important;
    background: white !important;
    color: #334155 !important;
    font-weight: 800 !important;
    letter-spacing: 0.3px !important;
    transition: all 0.2s ease !important;
}
.stButton > button:hover {
    background: #F8FAFC !important;
    color: #4F46E5 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 10px 18px rgba(0,0,0,0.08) !important;
}

/* Responsivo: pílula some no mobile (opcional) */
@media (max-width: 640px) {
    .float-pill { display:none !important; }
}
</style>
        """,
        unsafe_allow_html=True,
    )


_ui_home_block()


# ==============================================================================
# AUX VISUAIS (isolados para mexer fácil depois)
# ==============================================================================
def _img_b64(path: str) -> str:
    if not os.path.exists(path):
        return ""
    try:
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode()
    except Exception:
        return ""


def _first_name(full: str) -> str:
    full = (full or "").strip()
    return (full.split()[0] if full else "Visitante")


def _initials(full: str) -> str:
    full = (full or "").strip()
    if not full:
        return "U"
    parts = full.split()
    if len(parts) >= 2:
        return f"{parts[0][0]}{parts[-1][0]}".upper()
    return full[:2].upper()


def render_floating_pill(workspace_name: str):
    nome_full = st.session_state.get("usuario_nome", "Visitante")
    nome = _first_name(nome_full)
    ini = _initials(nome_full)

    st.markdown(
        f"""
        <div class="float-pill">
            <div class="pill-badge">{workspace_name}</div>
            <div class="pill-user">
                <div class="pill-avatar">{ini}</div>
                <div style="font-size:0.82rem; font-weight:900;">{nome}</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_estudantes_page_card(workspace_name: str):
    # logo dentro do card branco (mesma “vibe” dos cards da Home)
    logo_b64 = _img_b64("omni_icone.png")
    logo_html = (
        f'<img src="data:image/png;base64,{logo_b64}" alt="Omnisfera">'
        if logo_b64
        else "<i class='ri-group-fill' style='font-size:1.6rem; color:#0284C7;'></i>"
    )

    st.markdown(
        f"""
        <div class="page-card">
            <div class="page-card-bar"></div>
            <div class="page-card-inner">
                <div class="page-card-logo">{logo_html}</div>
                <div style="flex:1;">
                    <div class="page-card-title">Estudantes</div>
                    <div class="page-card-sub">
                        Gestão do workspace (PIN) — <strong>{workspace_name}</strong>.
                        Aqui você visualiza os estudantes criados no PEI e pode remover quando necessário.
                    </div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ==============================================================================
# 🔒 GATE (SEM LOGIN AQUI) — só redireciona para o começo do app
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
# ✅ Mantém a pílula flutuante (direita)
render_floating_pill(WORKSPACE_NAME)

# ✅ Banner vira card branco no padrão da Home
render_estudantes_page_card(WORKSPACE_NAME)

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
