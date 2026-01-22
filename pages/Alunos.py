# pages/0_Alunos.py
import streamlit as st
from datetime import date, datetime
import base64
import os
import time

from supabase_client import get_supabase

# ==============================================================================
# 1) CONFIG
# ==============================================================================
APP_VERSION = "v1.0 (Estudantes • Supabase)"

st.set_page_config(
    page_title="Omnisfera • Estudantes",
    page_icon="omni_icone.png" if os.path.exists("omni_icone.png") else "👥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ==============================================================================
# 2) GATE — aqui NÃO autentica, só respeita sessão liberada no login PIN
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
        if st.button("🔑 Voltar para Login", use_container_width=True, type="primary"):
            st.session_state.autenticado = False
            st.session_state.workspace_id = None
            st.session_state.workspace_name = None
            st.rerun()
    st.stop()


if not st.session_state.get("autenticado", False):
    acesso_bloqueado("Sessão expirada ou não iniciada.")

if not st.session_state.get("workspace_id"):
    acesso_bloqueado("Nenhum workspace vinculado ao seu acesso (PIN).")


# ==============================================================================
# 3) HELPERS
# ==============================================================================
def get_base64_image(path: str) -> str:
    if path and os.path.exists(path):
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode()
    return ""


def escola_vinculada() -> str:
    v = st.session_state.get("workspace_name")
    if isinstance(v, str) and v.strip():
        return v.strip()
    wsid = st.session_state.get("workspace_id", "")
    if isinstance(wsid, str) and wsid:
        return f"Workspace {wsid[:8]}…"
    return "Workspace"


def _parse_date(value):
    """Aceita date, datetime, ISO string, ou None."""
    if value is None:
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        # tenta ISO (YYYY-MM-DD...)
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
        .select("id, name, birth_date, grade, class_group, diagnosis, created_at, updated_at")
        .eq("workspace_id", workspace_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


def supa_delete_student(student_id: str):
    sb = get_supabase()
    # Se houver FK com cascade no banco, basta apagar o student.
    # Se não houver, você pode depois adicionar cascade ou apagar PEIs por trigger/policy.
    res = sb.table("students").delete().eq("id", student_id).execute()
    return True, res.data


def set_aluno_ativo_from_row(row: dict):
    """Converte o row do Supabase para o formato esperado no st.session_state.dados."""
    if "dados" not in st.session_state:
        st.session_state.dados = {}

    st.session_state.dados.update(
        {
            "student_id": row.get("id"),
            "nome": row.get("name") or "",
            "nasc": _parse_date(row.get("birth_date")) or date(2015, 1, 1),
            "serie": row.get("grade"),
            "turma": row.get("class_group") or "",
            "diagnostico": row.get("diagnosis") or "",
        }
    )


# ==============================================================================
# 4) CSS + TOPBAR (padrão premium simplificado)
# ==============================================================================
st.markdown(
    """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;700;800;900&family=Nunito:wght@400;600;700;800;900&display=swap');
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

html, body, [class*="css"] { font-family:'Nunito', sans-serif; background:#F7FAFC; color:#0f172a; }

[data-testid="stSidebarNav"]{ display:none !important; }
[data-testid="stHeader"]{ visibility:hidden !important; height:0px !important; }
.block-container{ padding-top: 120px !important; padding-bottom: 3rem !important; max-width: 1200px; }

@keyframes spin { to { transform: rotate(360deg); } }

/* TOPBAR */
.header-container{
  position: fixed; top:0; left:0; width:100%; height:86px;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(226,232,240,0.85);
  z-index: 99999;
  display:flex; align-items:center; justify-content:space-between;
  padding: 0 28px;
  box-shadow: 0 10px 30px rgba(15,82,186,0.06);
}
.header-left{ display:flex; align-items:center; gap:14px; }
.logo-spin{ width:54px; height:54px; animation: spin 18s linear infinite; }
.logo-text{ height:38px; width:auto; }
.header-div{ width:1px; height:34px; background: rgba(203,213,224,0.9); margin: 0 6px; }
.header-slogan{ font-weight:900; color:#64748B; letter-spacing:.2px; }

.header-badge{
  background: rgba(255,255,255,0.86);
  border: 1px solid rgba(226,232,240,0.9);
  border-radius: 14px;
  padding: 10px 12px;
  text-align:right;
  box-shadow: 0 10px 20px rgba(15,82,186,0.07);
  max-width: 520px;
}
.badge-top{
  font-family: Inter, sans-serif;
  font-weight: 900;
  font-size: .62rem;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #0f172a;
  opacity: .9;
}
.badge-val{
  font-weight: 900;
  font-size: .86rem;
  color:#1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* HERO */
.hero{
  background: linear-gradient(135deg, #0F52BA 0%, #062B61 100%);
  border-radius: 22px;
  padding: 22px 24px;
  color: white;
  box-shadow: 0 18px 50px rgba(15,82,186,0.24);
  border: 1px solid rgba(255,255,255,0.12);
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}
.hero h2{
  font-family: Inter, sans-serif;
  font-weight: 900;
  font-size: 1.35rem;
  margin: 0;
}
.hero p{
  margin: 6px 0 0 0;
  font-weight: 800;
  color: rgba(255,255,255,0.85);
}
.hero-right{
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 16px;
  padding: 10px 12px;
  text-align: right;
}
.hero-right .t{ font-weight: 900; }
.hero-right .s{ margin-top:3px; font-weight:900; color: rgba(255,255,255,0.86); font-size: .82rem; }

/* LISTA */
.section-title{
  font-family: Inter, sans-serif;
  font-weight: 900;
  font-size: 1.05rem;
  margin: 10px 0 10px;
  color:#0f172a;
  display:flex;
  align-items:center;
  gap: 10px;
}
.row-card{
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(226,232,240,0.95);
  border-radius: 18px;
  padding: 14px 14px;
  box-shadow: 0 10px 22px rgba(15,82,186,0.05);
}
.small{
  color:#64748B;
  font-weight: 800;
  font-size: .82rem;
}
.kpi{
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(226,232,240,0.55);
  border: 1px solid rgba(226,232,240,0.9);
  font-weight: 900;
  font-size: .72rem;
  color:#1f2937;
}
hr.sep{ border: none; border-top: 1px solid rgba(226,232,240,0.9); margin: 10px 0; }
</style>
""",
    unsafe_allow_html=True,
)

# TOPBAR
icone_b64 = get_base64_image("omni_icone.png")
texto_b64 = get_base64_image("omni_texto.png")
esc = escola_vinculada()
logo_html = f'<img src="data:image/png;base64,{icone_b64}" class="logo-spin">' if icone_b64 else "👥"
nome_html = f'<img src="data:image/png;base64,{texto_b64}" class="logo-text">' if texto_b64 else "<div style='font-family:Inter,sans-serif;font-weight:900;color:#0F52BA;font-size:1.15rem;'>OMNISFERA</div>"

st.markdown(
    f"""
<div class="header-container">
  <div class="header-left">
    {logo_html}
    {nome_html}
    <div class="header-div"></div>
    <div class="header-slogan">Estudantes</div>
  </div>
  <div class="header-badge">
    <div class="badge-top">workspace (PIN)</div>
    <div class="badge-val">🏫 {esc}</div>
  </div>
</div>
""",
    unsafe_allow_html=True,
)

# ==============================================================================
# 5) SIDEBAR (mesmos destinos)
# ==============================================================================
with st.sidebar:
    st.markdown("### 🧭 Navegação")

    if st.button("🏠 Home", use_container_width=True):
        st.switch_page("pages/0_Home.py")

    c1, c2 = st.columns(2)
    with c1:
        if st.button("📘 PEI", use_container_width=True):
            st.switch_page("pages/1_PEI.py")
    with c2:
        if st.button("🧩 PAEE", use_container_width=True):
            st.switch_page("pages/2_PAE.py")

    if st.button("🚀 Hub", use_container_width=True):
        st.switch_page("pages/3_Hub_Inclusao.py")

    st.markdown("---")
    st.markdown(f"**👤 {st.session_state.get('usuario_nome', 'Usuário')}**")
    st.caption(st.session_state.get("usuario_cargo", ""))
    st.caption(f"🏫 {esc}")

    st.markdown("---")
    if st.button("Sair", use_container_width=True):
        st.session_state.autenticado = False
        st.session_state.workspace_id = None
        st.session_state.workspace_name = None
        st.rerun()

# ==============================================================================
# 6) CONTEÚDO — ESTUDANTES (lista simples + apagar + abrir no PEI)
# ==============================================================================
primeiro_nome = (st.session_state.get("usuario_nome") or "Visitante").split()[0]
workspace_id = st.session_state.get("workspace_id")

st.markdown(
    f"""
<div class="hero">
  <div>
    <h2>Olá, {primeiro_nome}! 👥</h2>
    <p>Aqui ficam todos os estudantes criados no PEI deste workspace.</p>
  </div>
  <div class="hero-right">
    <div class="t">PIN / Workspace</div>
    <div class="s">{esc}</div>
  </div>
</div>
""",
    unsafe_allow_html=True,
)

top_left, top_right = st.columns([3, 1])
with top_left:
    st.markdown("<div class='section-title'>📚 Lista de Estudantes</div>", unsafe_allow_html=True)
with top_right:
    if st.button("🔄 Atualizar", use_container_width=True):
        supa_list_students.clear()
        st.rerun()

with st.spinner("Carregando estudantes..."):
    alunos = supa_list_students(workspace_id)

if not alunos:
    st.info("Nenhum estudante encontrado neste workspace ainda. Crie um PEI para começar.")
    st.stop()

# Barra de busca simples
q = st.text_input("Buscar estudante", placeholder="Digite um nome para filtrar…")
q_norm = (q or "").strip().lower()

if q_norm:
    alunos = [a for a in alunos if (a.get("name") or "").lower().find(q_norm) >= 0]

st.caption(f"{len(alunos)} estudante(s) exibido(s).")

# Render list
for idx, row in enumerate(alunos):
    sid = row.get("id")
    nome = row.get("name") or "—"
    nasc = _parse_date(row.get("birth_date"))
    serie = row.get("grade") or "—"
    turma = row.get("class_group") or "—"
    diag = row.get("diagnosis") or "—"

    meta = []
    if nasc:
        try:
            meta.append(f"Nasc.: {nasc.strftime('%d/%m/%Y')}")
        except:
            pass
    meta.append(f"Série: {serie}")
    meta.append(f"Turma: {turma}")

    st.markdown("<div class='row-card'>", unsafe_allow_html=True)
    c_info, c_actions = st.columns([4, 2])

    with c_info:
        st.markdown(f"**{nome}**")
        st.markdown(f"<div class='small'>Diagnóstico: {diag}</div>", unsafe_allow_html=True)
        st.markdown(
            " ".join([f"<span class='kpi'>{m}</span>" for m in meta]),
            unsafe_allow_html=True,
        )

    with c_actions:
        b1, b2 = st.columns(2)

        with b1:
            if st.button("📘 Abrir no PEI", key=f"open_pei_{sid}", use_container_width=True):
                set_aluno_ativo_from_row(row)
                st.toast(f"Aluno ativo: {nome}", icon="✅")
                time.sleep(0.15)
                st.switch_page("pages/1_PEI.py")

        with b2:
            # Apagar com confirmação simples (por item)
            confirm_key = f"confirm_del_{sid}"
            if confirm_key not in st.session_state:
                st.session_state[confirm_key] = False

            if not st.session_state[confirm_key]:
                if st.button("🗑️ Apagar", key=f"del_{sid}", use_container_width=True, type="secondary"):
                    st.session_state[confirm_key] = True
                    st.rerun()
            else:
                st.warning("Confirmar exclusão?")
                c_ok, c_no = st.columns(2)
                with c_ok:
                    if st.button("✅ Sim", key=f"del_yes_{sid}", use_container_width=True):
                        try:
                            supa_delete_student(sid)
                            st.toast(f"Removido: {nome}", icon="🗑️")
                            supa_list_students.clear()
                            time.sleep(0.15)
                            st.rerun()
                        except Exception as e:
                            st.error(f"Erro ao apagar: {e}")
                            st.session_state[confirm_key] = False
                with c_no:
                    if st.button("↩️ Não", key=f"del_no_{sid}", use_container_width=True):
                        st.session_state[confirm_key] = False
                        st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("<hr class='sep'/>", unsafe_allow_html=True)

# Footer
st.markdown(
    "<div style='text-align: center; color: #94A3B8; font-weight:900; font-size: 0.72rem; margin-top: 44px;'>Omnisfera desenvolvida por RODRIGO A. QUEIROZ</div>",
    unsafe_allow_html=True,
)
