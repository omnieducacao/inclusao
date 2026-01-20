# ui_nav.py
import streamlit as st
import os, base64

def _b64_img(*paths):
    for p in paths:
        if p and os.path.exists(p):
            with open(p, "rb") as f:
                return "data:image/png;base64," + base64.b64encode(f.read()).decode()
    return None

def render_topbar_nav():
    # SPA state
    if "view" not in st.session_state:
        st.session_state.view = "login"  # bom padrão: login separado

    # lê ?view=... (NÃO limpa params)
    qp = st.query_params
    if "view" in qp:
        v = qp["view"]
        if v in {"login","home","pei","paee","hub","diario","mon","logout"}:
            st.session_state.view = v

    # logout por view
    if st.session_state.view == "logout":
        st.session_state.autenticado = False
        st.session_state.view = "login"
        st.rerun()

    active = st.session_state.view
    authed = bool(st.session_state.get("autenticado", False))

    # assets (ajuste nomes se quiser)
    logo_spin = _b64_img("omni_icone.png", "logo.png", "iconeaba.png", "omni.png", "ominisfera.png") \
                or "https://cdn-icons-png.flaticon.com/512/1183/1183672.png"
    wordmark = _b64_img("omnisfera_wordmark.png", "omnisfera_nome.png")  # opcional

    # cores por página
    COLORS = {
        "home":   "#111827",
        "pei":    "#3B82F6",
        "paee":   "#22C55E",
        "hub":    "#F59E0B",
        "diario": "#F97316",
        "mon":    "#A855F7",
        "login":  "#111827",
    }

    def ic_color(key: str) -> str:
        # inativo bem leve, ativo acende
        if key == active:
            return COLORS.get(key, "#111827")
        return "rgba(17,24,39,0.45)"

    # altura da barra
    BAR_H = 56

    st.markdown(f"""
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">

<style>
/* mata o header padrão do Streamlit */
header[data-testid="stHeader"] {{ display:none !important; }}

/* empurra o app pra baixo pra não ficar atrás da topbar */
.block-container {{
  padding-top: {BAR_H + 18}px !important;
}}

/* TOPBAR */
.omni-topbar {{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: {BAR_H}px;
  z-index: 2147483647;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 16px;

  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(229,231,235,0.9);
  box-shadow: 0 8px 24px rgba(15,23,42,0.06);
}}

.omni-left {{
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
}}

@keyframes spin {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}
.omni-logo {{
  width: 28px;
  height: 28px;
  animation: spin 10s linear infinite;
}}

.omni-title {{
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #111827;
  font-size: 14px;
}}

.omni-wordmark {{
  height: 18px;
  width: auto;
  object-fit: contain;
}}

.omni-right {{
  display: flex;
  align-items: center;
  gap: 14px;
}}

.omni-link {{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none !important;
  width: 30px;
  height: 30px;
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

/* separador sutil */
.omni-sep {{
  width: 1px;
  height: 22px;
  background: rgba(229,231,235,0.9);
}}
</style>

<div class="omni-topbar">
  <div class="omni-left">
    <img src="{logo_spin}" class="omni-logo" alt="Omnisfera"/>
    <div class="omni-title">
      {"<img src='"+wordmark+"' class='omni-wordmark' alt='Omnisfera'/>" if wordmark else "OMNISFERA"}
    </div>
  </div>

  <div class="omni-right">
    {""
      if not authed else f"""
      <a class="omni-link" href="?view=home"   target="_self" title="Home">
        <i class="ri-home-5-fill omni-ic" style="color:{ic_color('home')}"></i>
      </a>
      <a class="omni-link" href="?view=pei"    target="_self" title="Estratégias & PEI">
        <i class="ri-puzzle-2-fill omni-ic" style="color:{ic_color('pei')}"></i>
      </a>
      <a class="omni-link" href="?view=paee"   target="_self" title="Plano de Ação (PAEE)">
        <i class="ri-map-pin-2-fill omni-ic" style="color:{ic_color('paee')}"></i>
      </a>
      <a class="omni-link" href="?view=hub"    target="_self" title="Hub de Recursos">
        <i class="ri-lightbulb-flash-fill omni-ic" style="color:{ic_color('hub')}"></i>
      </a>
      <a class="omni-link" href="?view=diario" target="_self" title="Diário de Bordo">
        <i class="ri-compass-3-fill omni-ic" style="color:{ic_color('diario')}"></i>
      </a>
      <a class="omni-link" href="?view=mon"    target="_self" title="Evolução & Acompanhamento">
        <i class="ri-line-chart-fill omni-ic" style="color:{ic_color('mon')}"></i>
      </a>
      <span class="omni-sep"></span>
      <a class="omni-link" href="?view=logout" target="_self" title="Sair">
        <i class="ri-logout-circle-r-line omni-ic" style="color:rgba(17,24,39,0.55)"></i>
      </a>
      """
    }
  </div>
</div>
""", unsafe_allow_html=True)
