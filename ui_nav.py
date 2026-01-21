from __future__ import annotations

import base64
from pathlib import Path
import streamlit as st

# -----------------------------
# PUBLIC API
# -----------------------------
def ensure_auth_state():
    """
    Estado mínimo (único padrão de autenticação).
    - autenticado: bool
    - user: dict {email, nome, cargo}
    Mantém compatibilidade temporária com chaves legadas (usuario_nome/cargo).
    """
    if "autenticado" not in st.session_state:
        st.session_state.autenticado = False

    if "user" not in st.session_state or not isinstance(st.session_state.user, dict):
        st.session_state.user = {"email": None, "nome": None, "cargo": None}

    # compatibilidade (legado)
    if "usuario_nome" not in st.session_state:
        st.session_state["usuario_nome"] = st.session_state.user.get("nome")
    if "usuario_cargo" not in st.session_state:
        st.session_state["usuario_cargo"] = st.session_state.user.get("cargo")


def boot_ui(do_route: bool = True):
    """
    Chame no topo do streamlit_app.py e de TODAS as páginas em /pages.
    - Injeta CSS (esconde UI nativa + topbar)
    - Opcionalmente roteia via ?go= (do_route=True)
    """
    ensure_auth_state()
    _inject_css()

    if do_route:
        _route_from_query()


# -----------------------------
# PATHS / ASSETS
# -----------------------------
def _root() -> Path:
    return Path(__file__).resolve().parent


def _img_data_uri(path_str: str) -> str | None:
    p = _root() / path_str
    if not p.exists():
        return None
    try:
        return "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode()
    except Exception:
        return None


# -----------------------------
# NAV CONFIG
# -----------------------------
NAV = [
    # key, label, page_path, flaticon_class, accent
    ("home", "Home", "streamlit_app.py", "fi fi-br-house-chimney", "#111827"),
    ("alunos", "Alunos", "pages/0_Alunos.py", "fi fi-br-users", "#2563EB"),
    ("pei", "PEI", "pages/1_PEI.py", "fi fi-br-brain", "#7C3AED"),
    ("pae", "PAE", "pages/2_PAE.py", "fi fi-br-bullseye", "#F97316"),
    ("hub", "Hub", "pages/3_Hub_Inclusao.py", "fi fi-br-book-open-cover", "#16A34A"),
    ("diario", "Diário", "pages/4_Diario_de_Bordo.py", "fi fi-br-notebook", "#0EA5E9"),
    ("dados", "Dados", "pages/5_Monitoramento_Avaliacao.py", "fi fi-br-chart-histogram", "#111827"),
]


def nav_href(go_key: str) -> str:
    return f"?go={go_key}"


# -----------------------------
# ROUTER (?go=)
# -----------------------------
def _safe_get_go() -> str | None:
    try:
        qp = st.query_params
        if "go" in qp:
            return str(qp["go"]).strip()
    except Exception:
        pass
    return None


def _route_from_query():
    """
    Router simples: ?go=pei → st.switch_page(pages/1_PEI.py)

    Regras:
    - Sempre limpa ?go= para evitar loop.
    - 'home' não faz switch_page (fica no streamlit_app.py).
    - Se não autenticado, bloqueia acesso às /pages e volta para Home.
    """
    go = _safe_get_go()
    if not go:
        return

    go = str(go).lower().strip()
    target = None
    for key, _, page_path, _, _ in NAV:
        if key == go:
            target = page_path
            break

    # sempre limpa o param (evita ficar "preso" em go=...)
    try:
        st.query_params.pop("go", None)
    except Exception:
        pass

    if not target:
        return

    # Home: não precisa switch_page
    if target.endswith("streamlit_app.py"):
        return

    # Proteção: sem login, não deixa entrar nas páginas internas
    if not st.session_state.get("autenticado"):
        st.switch_page("streamlit_app.py")
        return

    st.switch_page(target)


# -----------------------------
# CSS (CLEAN TOPBAR + FLATICON)
# -----------------------------
def _inject_css():
    # tenta achar em /assets ou raiz
    logo = _img_data_uri("assets/omni_icone.png") or _img_data_uri("omni_icone.png")
    word = _img_data_uri("assets/omni_texto.png") or _img_data_uri("omni_texto.png")

    st.markdown(
        f"""
<style>
/* Esconde chrome nativo */
[data-testid="stSidebar"],
[data-testid="stHeader"],
header, footer,
#MainMenu {{
  display: none !important;
}}

/* Container principal: empurra o conteúdo pra baixo da topbar */
section.main > div.block-container {{
  padding-top: 72px !important;
  max-width: 1200px;
}}
.stApp {{ overflow: visible; }}

/* Flaticon CDN */
@import url("https://cdn-uicons.flaticon.com/3.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css");
@import url("https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css");
@import url("https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-straight/css/uicons-solid-straight.css");

/* Topbar */
.omni-topbar {{
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 56px;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}}

.omni-brand {{
  display:flex;
  align-items:center;
  gap:10px;
  font-family: ui-sans-serif, system-ui;
  color:#111827;
}}

.omni-logo {{
  width: 24px; height: 24px;
  border-radius: 8px;
}}
.omni-word {{
  height: 16px;
}}

.omni-nav {{
  display:flex;
  align-items:center;
  gap: 10px;
}}

.omni-ico {{
  width: 38px;
  height: 38px;
  border-radius: 14px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  text-decoration: none !important;
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.06);
  transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
}}

.omni-ico:hover {{
  transform: translateY(-1px);
  background: rgba(0,0,0,0.04);
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}}

.omni-ico i {{
  display: inline-flex;
  align-items:center;
  justify-content:center;
  font-size: 18px;
  line-height: 1;
}}

/* Remove underline */
.omni-ico:visited, .omni-ico:active {{
  text-decoration: none !important;
}}
</style>

<div class="omni-topbar">
  <div class="omni-brand">
    {"<img class='omni-logo' src='"+logo+"'/>" if logo else "🌿"}
    {"<img class='omni-word' src='"+word+"'/>" if word else "<b>Omnisfera</b>"}
  </div>

  <div class="omni-nav">
    {_render_nav_html()}
  </div>
</div>
        """,
        unsafe_allow_html=True,
    )


def _render_nav_html() -> str:
    # Mostra ícones sempre, mas bloqueia navegação se não autenticado (vai pra home)
    parts = []
    for key, _, _, ico, accent in NAV:
        parts.append(
            f"""
<a class="omni-ico" href="{nav_href(key)}" title="{key}">
  <i class="{ico}" style="color:{accent}"></i>
</a>
"""
        )
    return "\n".join(parts)
