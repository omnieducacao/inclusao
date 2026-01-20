# ui_nav.py
from __future__ import annotations

import base64
from pathlib import Path
import streamlit as st

# =============================================================================
# CONFIG
# =============================================================================
TOPBAR_HEIGHT = 56
TOPBAR_PADDING = 14


# =============================================================================
# AUTH STATE
# =============================================================================
def ensure_auth_state():
    if "autenticado" not in st.session_state:
        st.session_state.autenticado = False
    if "user" not in st.session_state:
        st.session_state.user = None


# =============================================================================
# PATH / QUERY UTILS
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


def _img_to_data_uri(path: Path) -> str | None:
    if not path.exists() or not path.is_file():
        return None
    try:
        data = base64.b64encode(path.read_bytes()).decode("utf-8")
        return "data:image/png;base64," + data
    except Exception:
        return None


# =============================================================================
# ICONS (FLATICON UICONS)
# =============================================================================
def inject_icons_cdn():
    # Padrão combinado (como você definiu): rounded/straight/bold
    st.markdown(
        """
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-straight/css/uicons-solid-straight.css">
        """,
        unsafe_allow_html=True,
    )


# =============================================================================
# CSS SHELL (LIGHT / CLEAN)
# =============================================================================
def inject_shell_css():
    st.markdown(
        f"""
<style>
/* Remove UI nativa Streamlit */
[data-testid="stHeader"], header,
footer, #MainMenu,
[data-testid="stToolbar"],
[data-testid="stDecoration"] {{
  display: none !important;
}}

/* Respiro do conteúdo abaixo da topbar */
.main .block-container {{
  padding-top: {TOPBAR_HEIGHT + TOPBAR_PADDING}px !important;
}}

/* TOPBAR — light glass */
.omni-topbar {{
  position: fixed;
  top: 0; left: 0; right: 0;
  height: {TOPBAR_HEIGHT}px;
  z-index: 999999;

  display:flex;
  align-items:center;
  justify-content:space-between;

  padding: 0 14px;

  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border-bottom: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
}}

/* BRAND (icone + wordmark png) */
.omni-brand {{
  display:flex;
  align-items:center;
  gap:10px;
  user-select:none;
}}

.omni-logo-wrap {{
  width: 36px;
  height: 36px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;

  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.08);
}}

.omni-logo {{
  width: 22px;
  height: 22px;
  object-fit: contain;
}}

.omni-wordmark-img {{
  height: 16px;
  width: auto;
  object-fit: contain;
  opacity: 0.92;
}}

.omni-wordmark-fallback {{
  font-weight: 900;
  letter-spacing: .2px;
  color: rgba(0,0,0,0.82);
  font-size: 14px;
}}

/* NAV */
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
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.08);

  transition: transform .12s ease, background .12s ease, border-color .12s ease, opacity .12s ease;
}}

.nav-item:hover {{
  transform: translateY(-1px);
  background: rgba(0,0,0,0.05);
  border-color: rgba(0,0,0,0.12);
}}

.nav-item.active {{
  background: rgba(0,0,0,0.06);
  border-color: rgba(0,0,0,0.16);
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
# ROUTES + ÍCONES (padrão que você definiu)
# =============================================================================
def ROUTES():
    # Home: bold-rounded
    # Estratégias & PEI: solid-rounded
    # Plano de Ação / PAEE: solid-straight
    # Hub: solid-rounded
    # Diário: bold-rounded
    # Evolução & Dados: bold-rounded
    # IA: bold-rounded (deixamos como futuro)
    return {
        "home": {
            "label": "Home",
            "page": "pages/home.py",
            "icon": "fi fi-br-home",               # bold-rounded
            "color": "rgba(0,0,0,0.70)",
        },
        "alunos": {
            "label": "Alunos",
            "page": "pages/0_Alunos.py",
            "icon": "fi fi-sr-users",              # solid-rounded
            "color": "rgba(0,0,0,0.70)",
        },
        "pei": {
            "label": "PEI 360°",
            "page": "pages/1_PEI.py",
            "icon": "fi fi-sr-document-signed",    # solid-rounded
            "color": "rgba(0,0,0,0.70)",
        },
        "pae": {
            "label": "PAE",
            "page": "pages/2_PAE.py",
            "icon": "fi fi-ss-bullseye-arrow",     # solid-straight
            "color": "rgba(0,0,0,0.70)",
        },
        "hub": {
            "label": "Hub",
            "page": "pages/3_Hub_Inclusao.py",
            "icon": "fi fi-sr-book-open-cover",    # solid-rounded
            "color": "rgba(0,0,0,0.70)",
        },
        # futuros (desabilita se não existir)
        "diario": {
            "label": "Diário",
            "page": "pages/4_Diario.py",
            "icon": "fi fi-br-notebook",           # bold-rounded
            "color": "rgba(0,0,0,0.70)",
        },
        "dados": {
            "label": "Dados",
            "page": "pages/5_Dados.py",
            "icon": "fi fi-br-chart-histogram",    # bold-rounded
            "color": "rgba(0,0,0,0.70)",
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

    # Logo + wordmark via PNG embutido (base64) — confiável no Cloud
    logo_uri = _img_to_data_uri(_project_root() / "omni_icone.png")
    text_uri = _img_to_data_uri(_project_root() / "omni_texto.png")

    logo_html = (
        f"<img class='omni-logo' src='{logo_uri}'/>"
        if logo_uri
        else "<span style='font-size:18px;line-height:1'>🌿</span>"
    )

    wordmark_html = (
        f"<img class='omni-wordmark-img' src='{text_uri}'/>"
        if text_uri
        else "<span class='omni-wordmark-fallback'>Omnisfera</span>"
    )

    def _item(go: str) -> str:
        r = routes[go]
        exists = _page_exists(r["page"])

        cls = ["nav-item"]
        if go == active_go:
            cls.append("active")
        if not exists:
            cls.append("disabled")

        # GARANTIA: mesma aba (sem abrir outra)
        href = f"?go={go}" if exists else "#"
        return f"""
<a class="{' '.join(cls)}" href="{href}" target="_self" title="{r['label']}" aria-label="{r['label']}">
  <i class="{r['icon']}" style="color:{r['color']}"></i>
</a>
"""

    order = ["home", "alunos", "pei", "pae", "hub", "diario", "dados"]
    items_html = "\n".join(_item(go) for go in order if go in routes)

    st.markdown(
        f"""
<div class="omni-topbar">
  <div class="omni-brand">
    <div class="omni-logo-wrap">{logo_html}</div>
    <div>{wordmark_html}</div>
  </div>

  <div class="omni-nav">{items_html}</div>
</div>
        """,
        unsafe_allow_html=True,
    )


# =============================================================================
# ROUTER (padrão do projeto)
# =============================================================================
def route_from_query(default_go: str = "home"):
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
