# ui_nav.py
import streamlit as st
import os, base64

def render_omnisfera_nav():
    if "view" not in st.session_state:
        st.session_state.view = "home"

    # Lê view sem limpar query params (não destruir login)
    qp = st.query_params
    if "view" in qp:
        v = qp["view"]
        if v in {"home","pei","paee","hub","diario","mon"}:
            st.session_state.view = v

    active = st.session_state.view

    def logo_src():
        for f in ["omni_icone.png", "logo.png", "iconeaba.png", "omni.png", "ominisfera.png"]:
            if os.path.exists(f):
                with open(f, "rb") as img:
                    return f"data:image/png;base64,{base64.b64encode(img.read()).decode()}"
        return "https://cdn-icons-png.flaticon.com/512/1183/1183672.png"

    src = logo_src()

    TOP_PX = 8
    RIGHT_PX = 14

    COLORS = {
        "home": "#111827",
        "pei": "#3B82F6",
        "paee": "#22C55E",
        "hub": "#F59E0B",
        "diario": "#F97316",
        "mon": "#A855F7",
    }

    def icon_color(key: str) -> str:
        return COLORS[key] if key == active else "rgba(17,24,39,0.55)"

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

@keyframes spin {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}
.omni-logo {{
  width: 26px;
  height: 26px;
  animation: spin 10s linear infinite;
}}

.omni-sep {{
  width: 1px;
  height: 20px;
  background: #E5E7EB;
  margin: 0 2px;
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
  <img src="{src}" class="omni-logo" alt="Omnisfera" />
  <div class="omni-sep"></div>

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
</div>
""", unsafe_allow_html=True)
