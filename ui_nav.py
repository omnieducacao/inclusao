# ui_nav.py
import streamlit as st
import os, base64

def render_omnisfera_nav():
    # view default
    if "view" not in st.session_state:
        st.session_state.view = "home"

    # logo base64
    def logo_src():
        for f in ["omni_icone.png", "logo.png", "iconeaba.png", "omni.png", "ominisfera.png"]:
            if os.path.exists(f):
                with open(f, "rb") as img:
                    return f"data:image/png;base64,{base64.b64encode(img.read()).decode()}"
        return "https://cdn-icons-png.flaticon.com/512/1183/1183672.png"

    src = logo_src()
    ACTIVE = st.session_state.view

    COLORS = {
        "home": "#111827",
        "estudantes": "#2563EB",
        "pei": "#3B82F6",
        "paee": "#22C55E",
        "hub": "#F59E0B",
        "diario": "#F97316",
        "mon": "#A855F7",
    }

    def btn_style(key: str) -> str:
        if key == ACTIVE:
            return f"background:{COLORS[key]}; color:#FFFFFF; box-shadow: 0 0 0 3px rgba(255,255,255,0.95), 0 10px 22px rgba(15,23,42,0.12);"
        return "background:#F3F4F6; color:#111827; box-shadow: 0 2px 10px rgba(15,23,42,0.06);"

    TOP_PX = 8
    RIGHT_PX = 14

    # 1) desenha o dock (visual)
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
  position: fixed !important;
  top: {TOP_PX}px !important;
  right: {RIGHT_PX}px !important;
  z-index: 2147483647 !important;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #FFFFFF !important;
  border: 1px solid #E5E7EB !important;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12) !important;
  isolation: isolate !important;
}}

@keyframes spin {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}
.omni-logo {{
  width: 28px;
  height: 28px;
  animation: spin 10s linear infinite;
}}

.omni-sep {{
  width: 1px;
  height: 22px;
  background: #E5E7EB;
  margin: 0 2px;
}}

.omni-ico {{
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(17,24,39,0.06) !important;
}}

.omni-ic {{
  font-size: 18px;
  color: inherit;
}}
</style>

<div class="omni-dock">
  <img src="{src}" class="omni-logo" />
  <div class="omni-sep"></div>
  <!-- Os botões reais ficam por cima via Streamlit (próximo bloco) -->
</div>
""", unsafe_allow_html=True)

    # 2) botões reais (igual sidebar): mudam session_state e rerun
    # Eles precisam existir pra ter clique sem trocar URL/página.
    # A gente os desenha "invisíveis" na mesma área.
    st.markdown("""
<style>
/* Posiciona o container de botões exatamente por cima do dock */
.omni-btn-layer {
  position: fixed;
  top: 8px;
  right: 14px;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
}

/* “esconde” o visual do botão e deixa só a área clicável */
.omni-btn-layer [data-testid="stButton"] button {
  width: 34px !important;
  height: 34px !important;
  border-radius: 999px !important;
  padding: 0 !important;
  border: 1px solid rgba(17,24,39,0.06) !important;
  background: transparent !important;
  box-shadow: none !important;
}
.omni-btn-layer [data-testid="stButton"] button p { display:none !important; }

/* o 1º botão é a logo — maior e redonda (área clicável em cima da logo) */
.omni-btn-layer .logo-btn [data-testid="stButton"] button {
  width: 28px !important;
  height: 28px !important;
  border: none !important;
  background: transparent !important;
}
</style>
""", unsafe_allow_html=True)

    # Camada clicável
    st.markdown('<div class="omni-btn-layer">', unsafe_allow_html=True)

    # Logo (opcional clicar volta Home)
    c_logo, c_sep, c1, c2, c3, c4, c5, c6 = st.columns([0.6, 0.15, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75], gap="small")

    with c_logo:
        st.markdown('<div class="logo-btn">', unsafe_allow_html=True)
        if st.button(" ", key="nav_logo", help="Omnisfera (Home)"):
            st.session_state.view = "home"
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)

    with c_sep:
        st.write("")  # só ocupa espaço do separador

    def nav_button(col, key, label):
        with col:
            if st.button(" ", key=f"nav_{key}", help=label):
                st.session_state.view = key
                st.rerun()
            # desenha o ícone (visual) por cima do botão
            st.markdown(
                f"""
                <div style="margin-top:-34px; display:flex; align-items:center; justify-content:center;
                            width:34px; height:34px; border-radius:999px; {btn_style(key)}">
                  <i class="ri {{ICON}} omni-ic"></i>
                </div>
                """.replace("{ICON}", {
                    "home":"home-5-line",
                    "estudantes":"group-line",
                    "pei":"puzzle-2-line",
                    "paee":"map-pin-2-line",
                    "hub":"lightbulb-line",
                    "diario":"compass-3-line",
                    "mon":"line-chart-line",
                }[key]),
                unsafe_allow_html=True
            )

    nav_button(c1, "home", "Home")
    nav_button(c2, "estudantes", "Estudantes")
    nav_button(c3, "pei", "Estratégias & PEI")
    nav_button(c4, "paee", "Plano de Ação (PAEE)")
    nav_button(c5, "hub", "Hub de Recursos")
    nav_button(c6, "diario", "Diário de Bordo")

    # último botão (monitoramento)
    with st.columns([0.6,0.15,0.75,0.75,0.75,0.75,0.75,0.75], gap="small")[7]:
        if st.button(" ", key="nav_mon", help="Evolução & Acompanhamento"):
            st.session_state.view = "mon"
            st.rerun()
        st.markdown(
            f"""
            <div style="margin-top:-34px; display:flex; align-items:center; justify-content:center;
                        width:34px; height:34px; border-radius:999px; {btn_style('mon')}">
              <i class="ri line-chart-line omni-ic"></i>
            </div>
            """,
            unsafe_allow_html=True
        )

    st.markdown('</div>', unsafe_allow_html=True)
