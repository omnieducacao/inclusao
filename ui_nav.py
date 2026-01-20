# ui_nav.py
import streamlit as st
import os, base64

def render_omnisfera_nav():
    # -------------------------------
    # Rotas reais do seu projeto
    # -------------------------------
    ROUTES = {
        "home":   "Home.py",
        "pei":    "pages/1_PEI.py",
        "paee":   "pages/2_PAE.py",
        "hub":    "pages/3_Hub_Inclusao.py",
        "diario": "pages/4_Diario_de_Bordo.py",
        "mon":    "pages/5_Monitoramento_Avaliacao.py",
    }

    # -------------------------------
    # Navegação: escuta ?go=
    # -------------------------------
    qp = st.query_params
    if "go" in qp:
        dest = qp["go"]
        if dest in ROUTES:
            st.query_params.clear()
            st.switch_page(ROUTES[dest])

    # -------------------------------
    # Logo (base64)
    # -------------------------------
    def logo_src():
        for f in ["omni_icone.png", "logo.png", "iconeaba.png", "omni.png", "ominisfera.png"]:
            if os.path.exists(f):
                with open(f, "rb") as img:
                    return f"data:image/png;base64,{base64.b64encode(img.read()).decode()}"
        return "https://cdn-icons-png.flaticon.com/512/1183/1183672.png"

    src = logo_src()

    # -------------------------------
    # Dock (HTML/CSS)
    # -------------------------------
    # Ajuste o TOP aqui se estiver encostando no “Share”/header do Streamlit:
    TOP_PX = 18  # tente 18, 28, 40... conforme seu layout
    RIGHT_PX = 14

    st.markdown(f"""
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">

<style>
/* Dock/pílula */
.omni-dock {{
  position: fixed;
  top: {TOP_PX}px;
  right: {RIGHT_PX}px;
  z-index: 99999;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 10px 14px;
  border-radius: 999px;

  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.10);
}}

/* Logo */
@keyframes spin {{
  from {{ transform: rotate(0deg); }}
  to {{ transform: rotate(360deg); }}
}}
.omni-logo {{
  width: 28px;
  height: 28px;
  animation: spin 10s linear infinite;
}}

/* Separador */
.omni-sep {{
  width: 1px;
  height: 26px;
  background: #E5E7EB;
  margin: 0 2px;
}}

/* Botões circulares (cada ícone dentro de um círculo) */
.omni-ico {{
  width: 38px;
  height: 38px;
  border-radius: 999px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: #FFFFFF;
  border: 1px solid #E5E7EB;

  text-decoration: none !important;

  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
  transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
}}

.omni-ico:hover {{
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.10);
  background: #FAFAFA;
}}

.omni-ic {{
  font-size: 20px;
  line-height: 1;
  color: #111827; /* preto minimalista */
}}

/* Opcional: “bolinha” de cor (marca da página) — bem sutil */
.omni-dot {{
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  bottom: 7px;
  right: 7px;
  border: 1px solid rgba(17,24,39,0.10);
}}

/* Para o dot funcionar */
.omni-rel {{ position: relative; }}

</style>

<div class="omni-dock" aria-label="Omnisfera Dock">
  <img src="{src}" class="omni-logo" alt="Omnisfera" />
  <div class="omni-sep"></div>

  <a class="omni-ico omni-rel" href="?go=home" title="Home">
    <i class="ri-home-5-line omni-ic"></i>
    <span class="omni-dot" style="background:#111827"></span>
  </a>

  <a class="omni-ico omni-rel" href="?go=pei" title="Estratégias & PEI">
    <i class="ri-puzzle-2-line omni-ic"></i>
    <span class="omni-dot" style="background:#3B82F6"></span>
  </a>

  <a class="omni-ico omni-rel" href="?go=paee" title="Plano de Ação (PAEE)">
    <i class="ri-map-pin-2-line omni-ic"></i>
    <span class="omni-dot" style="background:#22C55E"></span>
  </a>

  <a class="omni-ico omni-rel" href="?go=hub" title="Hub de Recursos">
    <i class="ri-lightbulb-line omni-ic"></i>
    <span class="omni-dot" style="background:#F59E0B"></span>
  </a>

  <a class="omni-ico omni-rel" href="?go=diario" title="Diário de Bordo">
    <i class="ri-compass-3-line omni-ic"></i>
    <span class="omni-dot" style="background:#F97316"></span>
  </a>

  <a class="omni-ico omni-rel" href="?go=mon" title="Evolução & Acompanhamento">
    <i class="ri-line-chart-line omni-ic"></i>
    <span class="omni-dot" style="background:#A855F7"></span>
  </a>
</div>
""", unsafe_allow_html=True)
