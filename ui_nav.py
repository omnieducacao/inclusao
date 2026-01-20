# ui_nav.py
from __future__ import annotations

from pathlib import Path
import streamlit as st

# =============================================================================
# CONFIG
# =============================================================================
TOPBAR_HEIGHT = 56
TOPBAR_PADDING = 12


# =============================================================================
# AUTH STATE
# =============================================================================
def ensure_auth_state():
    if "autenticado" not in st.session_state:
        st.session_state.autenticado = False
    if "user" not in st.session_state:
        st.session_state.user = None


# =============================================================================
# UTILS
# =============================================================================
def _project_root() -> Path:
    return Path(__file__).resolve().parent


def _page_exists(relative_path: str) -> bool:
    p = _project_root() / relative_path
    return p.exists() and p.is_file()


def _get_qp(key: str, default: str | None = None) -> str | None:
    try:
        return st.query_params.get(key, default)
    except Exception:
        return default


# =============================================================================
# ICONS
# =============================================================================
def inject_icons_cdn():
    st.markdown(
        """
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-straight/css/uicons-solid-straight.css">
        """,
        unsafe_allow_html=True,
    )


# =============================================================================
# CSS SHELL
# =============================================================================
def inject_shell_css():
    st.markdown(
        f"""
<style>
/* remove UI nativa */
[data-testid="stHeader"], header,
footer, #MainMenu,
[data-testid="stToolbar"],
[data-testid="stDecoration"] {{
  display: none !important;
}}

/* empurra conteúdo para não ficar atrás da topbar */
.main .block-container {{
  padding-top: {TOPBAR_HEIGHT + TOPBAR_PADDING}px !important;
}}

/* topbar */
.omni-topbar {{
  position: fixed;
  top: 0; left: 0; right: 0;
  height: {TOPBAR_HEIGHT}px;
  z-index: 999999;

  display:flex;
  align-items:center;
  justify-content:space-between;

  padding: 0 14px;
  background: rgba(12,12,14,0.78);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}}

.omni-brand {{
  display:flex;
  align-items:center;
  gap:10px;
  color: rgba(255,255,255,0.95);
  font-weight: 750;
  font-size: 14px;
  user-select:none;
}}

.omni-dot {{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.78);
  box-shadow: 0 0 12px rgba(255,255,255,0.22);
}}

.omni-nav {{
  display:flex;
  align-items:center;
  gap:10px;
}}

.nav-item {{
  width: 36px;
  height: 36px;
  border-radius: 12px;

  display:flex;
  align-items:center;
  justify-content:center;

  text-decoration:none;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);

  transition: transform .12s ease, background .12s ease, border-color .12s ease, opacity .12s ease;
}}

.nav-item:hover {{
  transform: translateY(-1px);
  background: rgba(255,255,255,0.10);
  border-color: rgba(255,255,255,0.14);
}}

.nav-item.active {{
  background: rgba(255,255,255,0.14);
  border-color: rgba(255,255,255,0.18);
}}

.nav-item.disabled {{
  opacity: 0.35;
  pointer-events: none;
  filter: grayscale(1);
}}

.nav-item i {{
  font-size: 18px;
  line-height: 1;
}}
</style>
        """,
        unsafe_allow_html=True,
    )


# =============================================================================
# ROUTES
# =============================================================================
def ROUTES():
    # IMPORTANTE: Home agora é pages/home.py (como está no seu repo)
    return {
        "home": {
            "label": "Home",
            "page": "pages/home.py",
            "icon": "fi fi-br-home",
            "color": "#EDEDED",
        },
        "alunos": {
            "label": "Alunos",
            "page": "pages/0_Alunos.py",
            "icon": "fi fi-sr-users",
            "color": "#8BE9FD",
        },
        "pei": {
            "label": "PEI",
            "page": "pages/1_PEI.py",
            "icon": "fi fi-sr-document-signed",
            "color": "#BD93F9",
        },
        "pae": {
            "label": "PAE",
            "page": "pages/2_PAE.py",
            "icon": "fi fi-ss-bullseye-arrow",
            "color": "#50FA7B",
        },
        "hub": {
            "label": "Hub",
            "page": "pages/3_Hub_Inclusao.py",
            "icon": "fi fi-sr-book-open-cover",
            "color": "#FFB86C",
        },
        # futuras (desabilita automaticamente se não existir)
        "diario": {
            "label": "Diário",
            "page": "pages/4_Diario.py",
            "icon": "fi fi-br-notebook",
            "color": "#F1FA8C",
        },
        "dados": {
            "label": "Dados",
            "page": "pages/5_Dados.py",
            "icon": "fi fi-br-chart-histogram",
            "color": "#FF79C6",
        },
    }


def get_active_go(default: str = "home") -> str:
    go = _get_qp("go", default) or default
    if go not in ROUTES():
        return default
    return go


# =============================================================================
# TOPBAR
# =============================================================================
def render_topbar(active_go: str):
    routes = ROUTES()

    def _item(go: str) -> str:
        r = routes[go]
        exists = _page_exists(r["page"])

        cls = ["nav-item"]
        if go == active_go:
            cls.append("active")
        if not exists:
            cls.append("disabled")

        href = f"?go={go}" if exists else "#"
        return f"""
<a class="{' '.join(cls)}" href="{href}" title="{r['label']}" aria-label="{r['label']}">
  <i class="{r['icon']}" style="color:{r['color']}"></i>
</a>
"""

    order = ["home", "alunos", "pei", "pae", "hub", "diario", "dados"]
    items_html = "\n".join(_item(go) for go in order if go in routes)

    st.markdown(
        f"""
<div class="omni-topbar">
  <div class="omni-brand">
    <div class="omni-dot"></div>
    <div>Omnisfera</div>
  </div>
  <div class="omni-nav">
    {items_html}
  </div>
</div>
        """,
        unsafe_allow_html=True,
    )


# =============================================================================
# ROUTER
# =============================================================================
def route_from_query(default_go: str = "home"):
    # evita loop de roteamento
    if st.session_state.get("_already_routed"):
        return

    routes = ROUTES()
    go = get_active_go(default_go)
    target = routes.get(go, routes[default_go])["page"]

    if not _page_exists(target):
        target = routes[default_go]["page"]

    st.session_state["_already_routed"] = True
    st.switch_page(target)


# =============================================================================
# BOOT
# =============================================================================
def boot_ui(do_route: bool = False):
    ensure_auth_state()
    inject_icons_cdn()
    inject_shell_css()

    active = get_active_go()

    # Só mostra topbar quando autenticado
    if st.session_state.autenticado:
        render_topbar(active)

    if do_route:
        route_from_query(default_go="home")
