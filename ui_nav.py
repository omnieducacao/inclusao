# ui_nav.py
import streamlit as st

def render_omnisfera_nav():
    # Só mostra dock se autenticado
    if not st.session_state.get("autenticado", False):
        return

    if "view" not in st.session_state:
        st.session_state.view = "home"

    # Lê view da URL sem limpar params
    qp = st.query_params
    if "view" in qp:
        v = qp["view"]
        if v in {"home","pei","paee","hub","diario","mon","logout"}:
            st.session_state.view = v

    active = st.session_state.view

    # Logout via view
    if active == "logout":
        st.session_state.autenticado = False
        st.session_state.view = "login"
        st.rerun()

    TOP_PX = 8
    RIGHT_PX = 14

    COLORS = {
        "home": "#111827",
        "pei": "#3B82F6",
        "paee": "#22C55E",
        "hub": "#F59E0B",
        "diario": "#F97316",
        "mon": "#A855F7",
        "logout": "#6B7280",
    }

    def icon_color(key: str) -> str:
        return COLORS[key] if key == active else "rgba(17,24,39,0.48)"

    st.markdown(f"""
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">

<style>
header[data-testid="stHeader"] {{
  background: transparent !important;
  box-shadow: none !important;
  z-index: 1 !important;
}}
header[data-testid="stHeader"] * {{
  visibility: hidden !important;
}}

.omni-dock {{
  position: fixed;
  top: {TOP_PX}px;
  right: {RIGHT_PX}px;
  z-index: 2147483647;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 8px 12px;
  border-radius: 999px;

  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
}}

.omni-link {{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none !important;

  width: 28px;
  height: 28px;
  border-radius: 10px;

  transition: transform .12s ease, filter .12s ease;
}}
.omni-link:hover {{
  transform: translateY(-1px);
  filter: brightness(1.05);
}}

.omni-ic {{
  font-size: 22px;
  line-height: 1;
}}
</style>

<div class="omni-dock" aria-label="Omnisfera Dock">
  <a class="omni-link" href="?view=home"   target="_self" title="Home">
    <i class="ri-home-5-fill omni-ic" style="color:{icon_color('home')}"></i>
  </a>
  <a class="omni-link" href="?view=pei"    target="_self" title="Estratégias & PEI">
    <i class="ri-puzzle-2-fill omni-ic" style="color:{icon_color('pei')}"></i>
  </a>
  <a class="omni-link" href="?view=paee"   target="_self" title="Plano de Ação (PAEE)">
    <i class="ri-map-pin-2-fill omni-ic" style="color:{icon_color('paee')}"></i>
  </a>
  <a class="omni-link" href="?view=hub"    target="_self" title="Hub de Recursos">
    <i class="ri-lightbulb-flash-fill omni-ic" style="color:{icon_color('hub')}"></i>
  </a>
  <a class="omni-link" href="?view=diario" target="_self" title="Diário de Bordo">
    <i class="ri-compass-3-fill omni-ic" style="color:{icon_color('diario')}"></i>
  </a>
  <a class="omni-link" href="?view=mon"    target="_self" title="Evolução & Acompanhamento">
    <i class="ri-line-chart-fill omni-ic" style="color:{icon_color('mon')}"></i>
  </a>

  <a class="omni-link" href="?view=logout" target="_self" title="Sair">
    <i class="ri-logout-circle-r-line omni-ic" style="color:{icon_color('logout')}"></i>
  </a>
</div>
""", unsafe_allow_html=True)
