# pages/0_Home.py
import streamlit as st
from datetime import date
import base64
import os
import time

# ==============================================================================
# 1) CONFIG
# ==============================================================================
APP_VERSION = "v135.2 (Home Premium Grid)"

try:
    IS_TEST_ENV = st.secrets.get("ENV") == "TESTE"
except Exception:
    IS_TEST_ENV = False

st.set_page_config(
    page_title="Omnisfera",
    page_icon="omni_icone.png" if os.path.exists("omni_icone.png") else "🌐",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ==============================================================================
# 2) GATE (PROTEÇÃO) — HOME NÃO AUTENTICA
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
        if st.button("🔑 Ir para Login", use_container_width=True, type="primary"):
            st.session_state.autenticado = False
            st.session_state.workspace_id = None
            st.session_state.workspace_name = None
            st.rerun()
    st.stop()

if not st.session_state.get("autenticado", False):
    acesso_bloqueado("Sessão expirada ou não iniciada.")

if not st.session_state.get("workspace_id"):
    acesso_bloqueado("Nenhum workspace vinculado ao seu acesso.")

# ==============================================================================
# 3) STATE (compat)
# ==============================================================================
if "dados" not in st.session_state:
    st.session_state.dados = {
        "nome": "",
        "nasc": date(2015, 1, 1),
        "serie": None,
        "turma": "",
        "diagnostico": "",
        "student_id": None,
    }

if "usuario_nome" not in st.session_state:
    st.session_state.usuario_nome = "Usuário"
if "usuario_cargo" not in st.session_state:
    st.session_state.usuario_cargo = ""

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

# ==============================================================================
# 4) CSS — “excelência” (grid real + botão overlay sem sobras)
# ==============================================================================
st.markdown(
    """
<style>
/* Fonts + Icons */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&family=Nunito:wght@400;600;700;800;900&display=swap');
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

:root{
  --bg: #F7FAFC;
  --text:#0f172a;
  --muted:#64748B;
  --border:#E2E8F0;
  --card:#ffffff;
  --shadow: 0 18px 44px rgba(15,23,42,.08);

  --blue:#0F52BA;
  --deep:#062B61;
  --teal:#38B2AC;
  --purple:#805AD5;
  --indigo:#4F46E5;

  --r18: 18px;
  --r20: 20px;
}

/* Base */
html, body, [class*="css"]{
  font-family:'Nunito', sans-serif;
  background: var(--bg);
  color: var(--text);
}

/* Streamlit cleanup */
[data-testid="stSidebarNav"] { display:none !important; }
[data-testid="stHeader"] { visibility:hidden !important; height:0px !important; }
.block-container { padding-top: 120px !important; padding-bottom: 3rem !important; max-width: 1200px; }

/* Anim */
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
.hero-shell{
  background:
    radial-gradient(900px 240px at 15% 10%, rgba(15,82,186,0.22), transparent 65%),
    radial-gradient(900px 240px at 85% 0%, rgba(56,178,172,0.18), transparent 60%),
    radial-gradient(circle at top right, #0F52BA, #062B61);
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 18px 50px rgba(15,82,186,0.24);
  padding: 22px 24px;
  color: white;
  display:flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 26px;
}
.hero-title{
  font-family: Inter, sans-serif;
  font-weight: 900;
  font-size: 1.55rem;
  margin: 0;
}
.hero-sub{
  margin-top: 6px;
  font-weight: 900;
  color: rgba(255,255,255,0.86);
}
.hero-chips{ display:flex; gap:8px; flex-wrap:wrap; margin-top: 12px; }
.chip{
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.14);
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 0.76rem;
  color: rgba(255,255,255,0.92);
}
.hero-right{
  min-width: 220px;
  display:flex;
  justify-content:flex-end;
}
.hero-mini{
  backgroun
